// ElevenLabs TTS Service
// Configurado com base no workflow n8n do usuario

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";
const DEFAULT_API_KEY = "";
const DEFAULT_VOICE_ID = "xNGAXaCH8MaasNuo7Hr7";
const MODEL_ID = "eleven_turbo_v2_5";
// MP3 format — universally supported (iOS Safari does NOT support Opus)
const OUTPUT_FORMAT = "mp3_44100_128";

// Vozes por tutor - todas usam a voz padrao do usuario por default
// Pode-se trocar por voice IDs diferentes para cada tutor se quiser
export const TUTOR_VOICES: Record<string, { voiceId: string; name: string }> = {
  ingles: { voiceId: DEFAULT_VOICE_ID, name: "Tutor Ingles" },
  matematica: { voiceId: DEFAULT_VOICE_ID, name: "Fibonacci" },
  geografia: { voiceId: DEFAULT_VOICE_ID, name: "Humboldt" },
  fisica: { voiceId: DEFAULT_VOICE_ID, name: "Einstein" },
  historia: { voiceId: DEFAULT_VOICE_ID, name: "Historia" },
};

export function getApiKey(): string {
  return localStorage.getItem("elevenlabs_api_key") || DEFAULT_API_KEY;
}

export function setApiKey(key: string): void {
  localStorage.setItem("elevenlabs_api_key", key);
}

export function hasApiKey(): boolean {
  return !!getApiKey();
}

export function clearApiKey(): void {
  localStorage.removeItem("elevenlabs_api_key");
}

// ===== iOS Audio Unlock =====
// iOS Safari blocks audio.play() unless it's triggered directly by a user gesture.
// We pre-create a reusable Audio element and "unlock" it on the first user tap.
let unlockedAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;

/**
 * Call this function from a user gesture (tap/click handler) to unlock
 * audio playback on iOS. Safe to call multiple times — only runs once.
 */
export function unlockAudioForIOS(): void {
  if (audioUnlocked) return;

  try {
    // Create a shared audio element and play a silent buffer to unlock it
    unlockedAudio = new Audio();
    // Tiny silent MP3 (1 frame of silence, base64)
    unlockedAudio.src =
      "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAABhgFBhuYAAAAAAP/7UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWG luZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAABhgFBhuYAAAAA";
    unlockedAudio.volume = 0.01;
    unlockedAudio.muted = true;
    const playPromise = unlockedAudio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          unlockedAudio!.pause();
          unlockedAudio!.muted = false;
          unlockedAudio!.volume = 1;
          unlockedAudio!.currentTime = 0;
          audioUnlocked = true;
          console.log("[TTS] iOS audio unlocked successfully");
        })
        .catch(() => {
          // Will retry on next user gesture
          console.log("[TTS] iOS audio unlock deferred");
        });
    }
  } catch (_e) {
    // Ignore — will try again on next gesture
  }
}

interface ElevenLabsOptions {
  text: string;
  tutorKey: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
}

export async function speakWithElevenLabs(
  options: ElevenLabsOptions,
  onStart: () => void,
  onEnd: () => void,
  onError: (err: string) => void
): Promise<{ audio: HTMLAudioElement | null; abort: () => void }> {
  const apiKey = getApiKey();
  const voice = TUTOR_VOICES[options.tutorKey] || TUTOR_VOICES.ingles;
  const abortController = new AbortController();

  try {
    onStart();

    const url = `${ELEVENLABS_API_URL}/${voice.voiceId}?output_format=${OUTPUT_FORMAT}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: options.text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: options.stability ?? 0.5,
          similarity_boost: options.similarityBoost ?? 0.75,
          style: options.style ?? 0.5,
          use_speaker_boost: true,
        },
      }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg =
        (errorData as any)?.detail?.message ||
        (errorData as any)?.detail?.status ||
        `Erro ${response.status}: ${response.statusText}`;
      onError(msg);
      onEnd();
      return { audio: null, abort: () => {} };
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Use the pre-unlocked audio element on iOS, or create a new one
    const audio = unlockedAudio && audioUnlocked ? unlockedAudio : new Audio();
    audio.src = audioUrl;
    audio.volume = 1;

    audio.onended = () => {
      onEnd();
      URL.revokeObjectURL(audioUrl);
    };

    audio.onerror = () => {
      console.warn("[TTS] Audio playback error, trying browser TTS fallback");
      onError("Erro ao reproduzir audio");
      onEnd();
      URL.revokeObjectURL(audioUrl);
    };

    try {
      await audio.play();
    } catch (playErr) {
      // iOS may still block — try one more time with a fresh element
      console.warn("[TTS] Play blocked, retrying with fresh element:", playErr);
      try {
        const fallbackAudio = new Audio(audioUrl);
        fallbackAudio.onended = () => {
          onEnd();
          URL.revokeObjectURL(audioUrl);
        };
        fallbackAudio.onerror = () => {
          onError("Erro ao reproduzir audio");
          onEnd();
          URL.revokeObjectURL(audioUrl);
        };
        await fallbackAudio.play();
        return {
          audio: fallbackAudio,
          abort: () => {
            abortController.abort();
            fallbackAudio.pause();
            fallbackAudio.currentTime = 0;
            URL.revokeObjectURL(audioUrl);
            onEnd();
          },
        };
      } catch (_e) {
        onError("Reprodução bloqueada pelo navegador");
        onEnd();
        URL.revokeObjectURL(audioUrl);
        return { audio: null, abort: () => {} };
      }
    }

    return {
      audio,
      abort: () => {
        abortController.abort();
        audio.pause();
        audio.currentTime = 0;
        URL.revokeObjectURL(audioUrl);
        onEnd();
      },
    };
  } catch (err: any) {
    if (err.name !== "AbortError") {
      onError(err.message || "Erro ao conectar com servico de voz");
      onEnd();
    }
    return { audio: null, abort: () => {} };
  }
}