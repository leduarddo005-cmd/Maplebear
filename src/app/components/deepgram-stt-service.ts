// ============================================================
// Deepgram Speech-to-Text — Real-Time Streaming via WebSocket
// Architecture: Mic → AudioContext → ScriptProcessor → Linear16 PCM → WebSocket
// 
// WHY NOT MediaRecorder?
// MediaRecorder produces encoded formats (webm/opus, mp4/aac) that Deepgram's
// streaming endpoint may fail to decode correctly, causing "No speech detected".
// Sending raw Linear16 PCM via AudioContext is 100% reliable across all browsers.
//
// Audio pipeline:
//   getUserMedia → AudioContext (native sampleRate e.g. 48000)
//     → ScriptProcessorNode (bufferSize=4096)
//       → downsample Float32 → 16kHz
//       → convert Float32 → Int16 PCM
//       → send ArrayBuffer to WebSocket
//
// Auto-reconnects on WS drop. Works on Chrome, Safari, Android, iPhone.
// ============================================================

const DEEPGRAM_API_KEY = "6f9fd47b9b2d8c8e2eceab5b3911e2025347ff8d";
const TARGET_SAMPLE_RATE = 16000;
const BUFFER_SIZE = 4096;
const MAX_RECONNECTS = 2;

// ===== Public types =====
export interface StreamingSession {
  /** Stop recording gracefully, return final accumulated transcript */
  stop: () => Promise<string>;
  /** Cancel everything, discard transcript */
  cancel: () => void;
  /** Read current accumulated transcript at any point */
  getTranscript: () => string;
}

export interface StreamingCallbacks {
  /** Called every time the transcript updates (partial or final) */
  onTranscript: (text: string, isFinal: boolean) => void;
  /** Called once mic + WebSocket are ready and streaming begins */
  onStarted: () => void;
  /** Called on unrecoverable error */
  onError: (msg: string) => void;
  /** Optional: mic volume level 0–1, updated per audio buffer (~30–90fps) */
  onVolume?: (level: number) => void;
}

// ===== Browser support check =====
export function isDeepgramSupported(): boolean {
  try {
    return (
      typeof navigator.mediaDevices?.getUserMedia === "function" &&
      typeof WebSocket !== "undefined" &&
      typeof (window.AudioContext || (window as any).webkitAudioContext) === "function"
    );
  } catch (_e) {
    return false;
  }
}

// ===== Audio helpers =====

/** Downsample Float32Array from sourceSampleRate to targetSampleRate */
function downsample(buffer: Float32Array, srcRate: number, tgtRate: number): Float32Array {
  if (srcRate === tgtRate) return buffer;
  const ratio = srcRate / tgtRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const low = Math.floor(srcIndex);
    const high = Math.min(low + 1, buffer.length - 1);
    const frac = srcIndex - low;
    result[i] = buffer[low] * (1 - frac) + buffer[high] * frac;
  }
  return result;
}

/** Convert Float32 samples (range -1..1) to Int16 PCM ArrayBuffer */
function float32ToInt16(samples: Float32Array): ArrayBuffer {
  const buf = new ArrayBuffer(samples.length * 2);
  const view = new DataView(buf);
  for (let i = 0; i < samples.length; i++) {
    // Clamp to [-1, 1] then scale to Int16
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true); // little-endian
  }
  return buf;
}

/** Calculate RMS volume from Float32 samples (returns 0–1) */
function calcVolume(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.min(1, Math.sqrt(sum / samples.length) * 4); // amplify for visual sensitivity
}

// ================================================================
// startStreaming — main entry point
// Opens mic + WebSocket, streams raw PCM, returns live transcription
// ================================================================
export async function startStreaming(cb: StreamingCallbacks): Promise<StreamingSession | null> {

  // 1. Get mic access
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      },
    });
  } catch (err: any) {
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      cb.onError("Permissao do microfone negada. Permita o acesso nas configuracoes do navegador.");
    } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
      cb.onError("Nenhum microfone detectado. Conecte um microfone e tente novamente.");
    } else {
      cb.onError("Erro ao acessar o microfone: " + (err.message || err.name));
    }
    return null;
  }

  // 2. Create AudioContext
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  let audioCtx: AudioContext;
  try {
    audioCtx = new AudioCtx();
  } catch (e: any) {
    stream.getTracks().forEach(t => t.stop());
    cb.onError("Erro ao criar contexto de audio: " + (e.message || "AudioContext indisponivel"));
    return null;
  }

  const nativeSampleRate = audioCtx.sampleRate;
  console.log(`[Deepgram] AudioContext sampleRate: ${nativeSampleRate}`);

  // 3. Build audio graph: mic → scriptProcessor → (nowhere, just capture)
  const source = audioCtx.createMediaStreamSource(stream);
  // ScriptProcessorNode: 1 input channel, 1 output channel
  const processor = audioCtx.createScriptProcessor(BUFFER_SIZE, 1, 1);

  // 4. State
  let finalTranscript = "";
  let interimTranscript = "";
  let cancelled = false;
  let stopped = false;
  let reconnectCount = 0;
  let ws: WebSocket | null = null;
  let resolveStop: ((text: string) => void) | null = null;
  let wsCloseTimer: ReturnType<typeof setTimeout> | null = null;

  const combined = () => (finalTranscript + (interimTranscript ? " " + interimTranscript : "")).trim();

  // 5. WebSocket URL — Linear16 PCM at 16kHz
  const params = new URLSearchParams({
    model: "nova-2",
    language: "pt-BR",
    punctuate: "true",
    interim_results: "true",
    endpointing: "300",
    vad_events: "true",
    encoding: "linear16",
    sample_rate: String(TARGET_SAMPLE_RATE),
    channels: "1",
    smart_format: "true",
  });
  const wsUrl = `wss://api.deepgram.com/v1/listen?${params}`;

  // ---- Cleanup ----
  const cleanup = () => {
    if (wsCloseTimer) { clearTimeout(wsCloseTimer); wsCloseTimer = null; }

    // Disconnect audio graph
    try { processor.disconnect(); } catch (_) {}
    try { source.disconnect(); } catch (_) {}

    // Close AudioContext
    if (audioCtx.state !== "closed") {
      try { audioCtx.close(); } catch (_) {}
    }

    // Stop mic tracks
    stream.getTracks().forEach(t => t.stop());

    // Close WebSocket
    if (ws) {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "CloseStream" }));
        }
        ws.close();
      } catch (_) {}
      ws = null;
    }
  };

  // ---- ScriptProcessor: capture audio, convert, send ----
  processor.onaudioprocess = (e) => {
    if (cancelled || stopped) return;

    const inputData = e.inputBuffer.getChannelData(0);

    // Volume callback
    if (cb.onVolume) {
      cb.onVolume(calcVolume(inputData));
    }

    // Downsample → Int16 PCM → send to WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      const downsampled = downsample(inputData, nativeSampleRate, TARGET_SAMPLE_RATE);
      const pcm = float32ToInt16(downsampled);
      try {
        ws.send(pcm);
      } catch (_) { /* WS might close mid-send — handled by onclose */ }
    }

    // IMPORTANT: copy input to output to keep ScriptProcessor alive on Safari
    const outputData = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < outputData.length; i++) outputData[i] = 0; // silence output
  };

  // Connect audio graph (must connect to destination to keep processor alive on Safari/iOS)
  source.connect(processor);
  processor.connect(audioCtx.destination);

  // ---- Create & connect WebSocket ----
  const connectWs = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (cancelled || stopped) { resolve(false); return; }

      try {
        ws = new WebSocket(wsUrl, ["token", DEEPGRAM_API_KEY]);
      } catch (e: any) {
        console.error("[Deepgram] WebSocket creation failed:", e);
        resolve(false);
        return;
      }

      const connectTimeout = setTimeout(() => {
        console.warn("[Deepgram] WebSocket connection timeout");
        try { ws?.close(); } catch (_) {}
        resolve(false);
      }, 8000);

      ws.onopen = () => {
        clearTimeout(connectTimeout);
        console.log("[Deepgram] WebSocket connected — streaming Linear16 PCM");
        resolve(true);
      };

      ws.onmessage = (event) => {
        if (cancelled) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === "Results") {
            const transcript = data.channel?.alternatives?.[0]?.transcript || "";
            const isFinal = data.is_final === true;

            if (transcript) {
              if (isFinal) {
                finalTranscript += (finalTranscript ? " " : "") + transcript;
                interimTranscript = "";
              } else {
                interimTranscript = transcript;
              }
              cb.onTranscript(combined(), isFinal);
            }
          }
        } catch (_) { /* parse error — ignore */ }
      };

      ws.onerror = () => {
        clearTimeout(connectTimeout);
        console.warn("[Deepgram] WebSocket error");
      };

      ws.onclose = (ev) => {
        clearTimeout(connectTimeout);
        console.log("[Deepgram] WebSocket closed:", ev.code, ev.reason);

        // If stop was called, resolve the promise
        if (resolveStop) {
          resolveStop(combined());
          resolveStop = null;
          return;
        }

        // Auto-reconnect if still streaming
        if (!cancelled && !stopped && reconnectCount < MAX_RECONNECTS) {
          reconnectCount++;
          console.log(`[Deepgram] Reconnecting (${reconnectCount}/${MAX_RECONNECTS})...`);
          setTimeout(() => { connectWs(); }, 500);
        } else if (!cancelled && !stopped) {
          cb.onError("Conexao com o servico de voz perdida. Tente novamente.");
        }
      };
    });
  };

  // 6. Connect WebSocket
  const wsOk = await connectWs();
  if (!wsOk) {
    cleanup();
    cb.onError("Falha ao conectar ao servico de transcricao. Verifique sua internet.");
    return null;
  }

  cb.onStarted();
  console.log(`[Deepgram] Streaming live — PCM Linear16 @ ${TARGET_SAMPLE_RATE}Hz (native ${nativeSampleRate}Hz)`);

  // ---- Return session handle ----
  return {
    stop: () => {
      return new Promise<string>((resolve) => {
        if (cancelled || stopped) { resolve(combined()); return; }
        stopped = true;

        resolveStop = resolve;

        // Tell Deepgram we're done, wait for final results
        if (ws && ws.readyState === WebSocket.OPEN) {
          try { ws.send(JSON.stringify({ type: "CloseStream" })); } catch (_) {}
        }

        // Safety timeout: resolve after 3s
        wsCloseTimer = setTimeout(() => {
          cleanup();
          if (resolveStop) { resolveStop(combined()); resolveStop = null; }
        }, 3000);
      });
    },

    cancel: () => {
      cancelled = true;
      cleanup();
    },

    getTranscript: () => combined(),
  };
}
