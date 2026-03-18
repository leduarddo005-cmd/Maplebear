// Audio Transcription Service — Universal Voice Recognition
// Uses MediaRecorder (all modern browsers) + Gemini API for high-quality transcription
// Fallback for browsers without Web Speech API (Safari, Firefox, etc.)

const DEFAULT_GEMINI_API_KEY = "";

function getGeminiApiKey(): string {
  if (typeof window !== "undefined") {
    const userKey = localStorage.getItem("gemini_api_key");
    if (userKey && userKey.trim()) return userKey.trim();
  }
  return DEFAULT_GEMINI_API_KEY;
}

// ===== MediaRecorder Manager =====

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let audioStream: MediaStream | null = null;
let volumeAnalyser: AnalyserNode | null = null;
let audioContext: AudioContext | null = null;

function getSupportedMimeType(): string {
  // Prefer high-quality codecs that Gemini handles best
  const types = [
    "audio/webm;codecs=opus",     // Best: Chrome, Firefox, Edge
    "audio/mp4;codecs=aac",       // Safari iOS/macOS
    "audio/mp4",                  // Safari fallback
    "audio/webm",                 // Generic webm
    "audio/ogg;codecs=opus",      // Firefox alt
    "audio/ogg",                  
  ];
  for (const type of types) {
    try {
      if (MediaRecorder.isTypeSupported(type)) return type;
    } catch (_e) { /* some browsers throw */ }
  }
  return "";
}

export function isMediaRecorderSupported(): boolean {
  try {
    return typeof MediaRecorder !== "undefined" && typeof navigator.mediaDevices?.getUserMedia === "function";
  } catch (_e) {
    return false;
  }
}

// Callback for real-time volume level (0-1)
type VolumeCallback = (level: number) => void;
let volumeCallback: VolumeCallback | null = null;
let volumeRafId: number | null = null;

function startVolumeMonitoring(stream: MediaStream) {
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    volumeAnalyser = audioContext.createAnalyser();
    volumeAnalyser.fftSize = 256;
    volumeAnalyser.smoothingTimeConstant = 0.8;
    source.connect(volumeAnalyser);

    const dataArray = new Uint8Array(volumeAnalyser.frequencyBinCount);
    
    const checkVolume = () => {
      if (!volumeAnalyser) return;
      volumeAnalyser.getByteFrequencyData(dataArray);
      // Calculate RMS volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length) / 255;
      if (volumeCallback) volumeCallback(rms);
      volumeRafId = requestAnimationFrame(checkVolume);
    };
    checkVolume();
  } catch (_e) {
    console.warn("[AudioRec] Volume monitoring not available");
  }
}

function stopVolumeMonitoring() {
  if (volumeRafId !== null) {
    cancelAnimationFrame(volumeRafId);
    volumeRafId = null;
  }
  volumeAnalyser = null;
  if (audioContext && audioContext.state !== "closed") {
    try { audioContext.close(); } catch (_e) { /* ok */ }
  }
  audioContext = null;
  volumeCallback = null;
}

export async function startMediaRecording(
  onStart: () => void,
  onError: (msg: string) => void,
  onVolume?: VolumeCallback
): Promise<boolean> {
  try {
    // Request mic with optimal settings for speech recognition
    audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,          // Mono is better for speech
        sampleRate: 16000,        // 16kHz is optimal for speech-to-text
      },
    });

    audioChunks = [];

    const mimeType = getSupportedMimeType();
    const options: MediaRecorderOptions = {};
    if (mimeType) {
      options.mimeType = mimeType;
      // Higher bitrate for cleaner audio
      if (mimeType.includes("opus")) {
        options.bitsPerSecond = 64000;
      } else {
        options.bitsPerSecond = 128000;
      }
    }

    mediaRecorder = new MediaRecorder(audioStream, options);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onerror = () => {
      onError("Erro na gravacao de audio. Tente novamente.");
    };

    // Start volume monitoring
    if (onVolume) {
      volumeCallback = onVolume;
      startVolumeMonitoring(audioStream);
    }

    // Collect data every 500ms (more reliable across browsers)
    mediaRecorder.start(500);
    onStart();
    return true;
  } catch (err: any) {
    console.error("[AudioRec] Failed to start:", err);

    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      onError("Permissao do microfone negada. Permita o acesso nas configuracoes do navegador.");
    } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
      onError("Nenhum microfone detectado. Conecte um microfone e tente novamente.");
    } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
      onError("O microfone esta sendo usado por outro aplicativo.");
    } else if (err.name === "OverconstrainedError") {
      // Retry with simpler constraints
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunks = [];
        mediaRecorder = new MediaRecorder(audioStream);
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunks.push(event.data);
        };
        mediaRecorder.start(500);
        onStart();
        return true;
      } catch (_e2) {
        onError("Nao foi possivel acessar o microfone. Tente usar o campo de texto.");
      }
    } else {
      onError("Nao foi possivel acessar o microfone. Tente usar o campo de texto.");
    }
    return false;
  }
}

export function stopMediaRecording(): Promise<Blob | null> {
  return new Promise((resolve) => {
    stopVolumeMonitoring();
    
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      cleanupStream();
      resolve(null);
      return;
    }

    mediaRecorder.onstop = () => {
      const mimeType = mediaRecorder?.mimeType || "audio/webm";
      const blob = new Blob(audioChunks, { type: mimeType });
      audioChunks = [];
      cleanupStream();
      resolve(blob);
    };

    try {
      mediaRecorder.stop();
    } catch (_e) {
      cleanupStream();
      resolve(null);
    }
  });
}

export function cancelMediaRecording(): void {
  stopVolumeMonitoring();
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    try {
      mediaRecorder.onstop = null;
      mediaRecorder.stop();
    } catch (_e) { /* ok */ }
  }
  audioChunks = [];
  cleanupStream();
}

function cleanupStream() {
  if (audioStream) {
    audioStream.getTracks().forEach((track) => track.stop());
    audioStream = null;
  }
  mediaRecorder = null;
}

export function isRecording(): boolean {
  return mediaRecorder !== null && mediaRecorder.state === "recording";
}

// ===== Gemini Audio Transcription =====

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      if (!base64) {
        reject(new Error("Failed to convert audio to base64"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function getMimeTypeForGemini(blob: Blob): string {
  const type = blob.type || "audio/webm";
  if (type.includes("webm")) return "audio/webm";
  if (type.includes("mp4")) return "audio/mp4";
  if (type.includes("ogg")) return "audio/ogg";
  if (type.includes("wav")) return "audio/wav";
  if (type.includes("mpeg") || type.includes("mp3")) return "audio/mp3";
  if (type.includes("aac")) return "audio/aac";
  return "audio/webm";
}

function cleanTranscription(text: string): string {
  return text
    // Remove surrounding quotes
    .replace(/^["'""\u201C\u201D]+|["'""\u201C\u201D]+$/g, "")
    // Remove common prefixes the model might add
    .replace(/^(transcri[çc][ãa]o:|aqui est[aá] a transcri[çc][ãa]o:|o [aá]udio diz:|o usu[aá]rio disse?:)\s*/i, "")
    .replace(/^(a pessoa disse?:|o falante disse?:|texto:)\s*/i, "")
    // Remove trailing periods if it's a short phrase (likely a question/command)
    .replace(/\.\s*$/, (match) => text.length < 80 ? "" : match)
    .trim();
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  if (audioBlob.size < 500) {
    throw new Error("Audio muito curto. Fale por mais tempo e tente novamente.");
  }

  console.log(`[STT] Audio blob: ${Math.round(audioBlob.size / 1024)}KB, type: ${audioBlob.type}`);

  const base64Audio = await blobToBase64(audioBlob);
  const mimeType = getMimeTypeForGemini(audioBlob);
  const apiKey = getGeminiApiKey();

  // Use the best model first for transcription accuracy
  const models = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

  for (const model of models) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      console.log(`[STT] Trying ${model}...`);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64Audio,
                  },
                },
                {
                  text: `Voce e um sistema de transcricao de audio de alta precisao para portugues brasileiro.

TAREFA: Transcreva o audio acima palavra por palavra, com a maior fidelidade possivel.

REGRAS OBRIGATORIAS:
1. Retorne SOMENTE o texto transcrito, nada mais
2. NAO adicione comentarios, explicacoes, prefixos como "Transcricao:" ou aspas
3. Mantenha acentos e cedilhas corretos do portugues (ex: "voce" → "você", "nao" → "não", "matematica" → "matemática")
4. Se houver palavras em outro idioma (ex: ingles), mantenha-as como foram faladas
5. Se o audio estiver inaudivel, vazio ou com apenas ruido, responda exatamente: INAUDIVEL
6. NAO invente ou adivinhe palavras que nao foram ditas
7. Mantenha a pontuacao natural da fala

Transcreva agora:`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.05,       // Quase zero para maxima fidelidade
            topP: 0.8,
            maxOutputTokens: 512,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429 || response.status === 403 || response.status === 404) {
        console.warn(`[STT] ${model}: status ${response.status}, trying next...`);
        continue;
      }

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        console.warn(`[STT] ${model} error:`, JSON.stringify(errBody));
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      if (!rawText || rawText === "INAUDIVEL" || rawText.length < 2) {
        if (rawText === "INAUDIVEL") {
          throw new Error("Nao consegui entender o audio. Fale mais perto do microfone e com mais clareza.");
        }
        continue; // try next model
      }

      const text = cleanTranscription(rawText);
      
      if (text.length >= 2) {
        console.log(`[STT] ${model} OK: "${text}"`);
        return text;
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.message?.includes("Nao consegui")) throw err;
      if (err.message?.includes("Audio muito curto")) throw err;
      console.warn(`[STT] ${model} failed:`, err.message);
      continue;
    }
  }

  throw new Error("Nao foi possivel transcrever o audio. Tente falar mais alto e perto do microfone.");
}