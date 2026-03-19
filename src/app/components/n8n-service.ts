// ============================================================
// n8n Webhook Service — MapleBear Education
//
// Toda a lógica de IA (Gemini/OpenRouter), TTS (ElevenLabs) e
// processamento é orquestrada pelo n8n. O app apenas envia a
// pergunta do aluno + contexto e recebe a resposta pronta.
//
// Webhook URL configurável via localStorage ou constante.
// ============================================================

// ===== CONFIGURAÇÃO =====

// URL padrão do webhook n8n — substitua pela sua URL de produção
const DEFAULT_WEBHOOK_URL = "https://webhook.naveedu.io/webhook/maplebear-tutor";

// Timeout para a chamada ao webhook (ms)
const WEBHOOK_TIMEOUT = 30_000;

// CORS proxy para contornar bloqueio de navegador quando o n8n não envia headers CORS
const CORS_PROXIES = [
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

// ===== STORAGE =====

export function getWebhookUrl(): string {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("n8n_webhook_url");
    if (stored?.trim()) return stored.trim();
  }
  return DEFAULT_WEBHOOK_URL;
}

export function setWebhookUrl(url: string): void {
  if (typeof window !== "undefined") {
    if (url.trim()) {
      localStorage.setItem("n8n_webhook_url", url.trim());
    } else {
      localStorage.removeItem("n8n_webhook_url");
    }
  }
}

export function getStoredWebhookUrl(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("n8n_webhook_url") || "";
  }
  return "";
}

export function hasCustomWebhookUrl(): boolean {
  return !!getStoredWebhookUrl();
}

export function isWebhookConfigured(): boolean {
  const url = getWebhookUrl();
  return url.startsWith("http");
}

// ===== TYPES =====

export interface ChatMessage {
  role: "user" | "tutor";
  text: string;
}

export interface N8nRequest {
  /** Pergunta atual do aluno */
  message: string;
  /** Chave do tutor selecionado: ingles, matematica, etc. */
  tutorKey: string;
  /** Estilo de ensino: didatico, tecnico, motivacional, pratico */
  styleId: string;
  /** Histórico da conversa para contexto */
  conversationHistory?: ChatMessage[];
  /** Nome do aluno (se disponível) */
  studentName?: string;
  /** Dados completos do aluno */
  studentInfo?: {
    numero: string;
    nome: string;
    anoEstudo: string;
    escola: string;
    cidade: string;
    estado: string;
  };
}

export interface N8nResponse {
  /** Texto da resposta do tutor */
  text: string;
  /** URL de áudio TTS pré-gerado (opcional — se n8n gera o áudio) */
  audioUrl?: string;
  /** Fonte que gerou a resposta (para debug) */
  source?: string;
  /** Dados extras que o n8n queira retornar */
  metadata?: Record<string, unknown>;
}

// ===== WEBHOOK CALL =====

/**
 * Envia a pergunta do aluno ao webhook n8n e retorna a resposta.
 *
 * O n8n é responsável por:
 * 1. Processar a mensagem com IA (Gemini, OpenRouter, etc.)
 * 2. Opcionalmente gerar áudio TTS (ElevenLabs)
 * 3. Retornar { text, audioUrl?, source? }
 *
 * @throws Error se o webhook falhar ou não responder
 */
export async function sendToN8n(req: N8nRequest): Promise<N8nResponse> {
  const webhookUrl = getWebhookUrl();

  console.log(`[n8n] Sending to webhook: ${webhookUrl}`);
  console.log(`[n8n] Tutor: ${req.tutorKey}, Style: ${req.styleId}`);
  console.log(`[n8n] Message: "${req.message.substring(0, 80)}..."`);

  const payload = JSON.stringify({
    message: req.message,
    tutorKey: req.tutorKey,
    styleId: req.styleId,
    conversationHistory: req.conversationHistory || [],
    studentName: req.studentName || "",
    studentInfo: req.studentInfo || {},
    timestamp: new Date().toISOString(),
    platform: detectPlatform(),
    appVersion: "1.0.0",
  });

  console.log(`[n8n] Payload:`, JSON.parse(payload));

  // Tenta direto primeiro, depois via proxies CORS se falhar
  const urlsToTry = [
    webhookUrl,
    ...CORS_PROXIES.map((proxy) => proxy(webhookUrl)),
  ];

  let lastError: Error | null = null;

  for (const url of urlsToTry) {
    const isDirect = url === webhookUrl;
    const label = isDirect ? "direct" : "proxy";

    try {
      console.log(`[n8n] Trying ${label}: ${url.substring(0, 100)}...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        console.error(`[n8n] ${label} error ${response.status}:`, errorBody);
        lastError = new Error(`Webhook retornou ${response.status}: ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      console.log(`[n8n] Response via ${label}:`, JSON.stringify(data, null, 2));

      const parsed = Array.isArray(data) ? data[0] : data;

      const text =
        parsed?.text ||
        parsed?.response ||
        parsed?.message ||
        parsed?.result ||
        (typeof parsed?.output === "string" ? parsed.output : null) ||
        parsed?.output?.text ||
        parsed?.output?.response ||
        parsed?.output?.message ||
        (typeof parsed === "string" ? parsed : null) ||
        (typeof data === "string" ? data : "");

      console.log(`[n8n] Extracted text (${text.length} chars):`, text.substring(0, 200));

      if (!text) {
        console.warn("[n8n] Empty response from webhook. Full data:", data);
        lastError = new Error("Resposta vazia do webhook");
        continue;
      }

      if (!isDirect) {
        console.log(`[n8n] ✅ CORS proxy worked! Consider adding CORS headers to your n8n server.`);
      }

      console.log(`[n8n] ✅ Response received (${text.length} chars)`);

      return {
        text: cleanResponse(text),
        audioUrl: data.audioUrl || data.audio_url || data.ttsUrl || undefined,
        source: data.source || "n8n",
        metadata: data.metadata || {},
      };
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.error(`[n8n] ${label} timeout after ${WEBHOOK_TIMEOUT}ms`);
        lastError = new Error("Tempo esgotado aguardando resposta do servidor");
      } else {
        console.warn(`[n8n] ${label} failed:`, err.message);
        lastError = err;
      }
    }
  }

  console.error("[n8n] All attempts failed:", lastError?.message);
  throw lastError || new Error("Webhook não respondeu");
}

// ===== AUDIO FROM N8N =====

/**
 * Se o n8n retornou uma audioUrl, reproduz o áudio pré-gerado.
 * Retorna null se não houver audioUrl.
 */
export function playN8nAudio(
  audioUrl: string,
  onStart: () => void,
  onEnd: () => void,
  onError: (err: string) => void
): { audio: HTMLAudioElement; abort: () => void } | null {
  if (!audioUrl) return null;

  try {
    const audio = new Audio(audioUrl);
    audio.volume = 1;

    audio.onplay = () => onStart();
    audio.onended = () => onEnd();
    audio.onerror = () => {
      onError("Erro ao reproduzir áudio do servidor");
      onEnd();
    };

    audio.play().catch((playErr) => {
      console.warn("[n8n] Audio play blocked:", playErr);
      onError("Reprodução bloqueada pelo navegador");
      onEnd();
    });

    return {
      audio,
      abort: () => {
        audio.pause();
        audio.currentTime = 0;
        onEnd();
      },
    };
  } catch (err: any) {
    onError(err.message || "Erro ao iniciar áudio");
    return null;
  }
}

// ===== HEALTH CHECK =====

/**
 * Testa se o webhook n8n está acessível.
 * Útil para mostrar status no UI.
 */
export async function checkWebhookHealth(): Promise<{
  ok: boolean;
  latencyMs: number;
  error?: string;
}> {
  const webhookUrl = getWebhookUrl();
  const start = Date.now();
  const healthPayload = JSON.stringify({
    message: "__health_check__",
    tutorKey: "ingles",
    styleId: "didatico",
    conversationHistory: [],
    timestamp: new Date().toISOString(),
  });

  const urlsToTry = [
    webhookUrl,
    ...CORS_PROXIES.map((proxy) => proxy(webhookUrl)),
  ];

  for (const url of urlsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: healthPayload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - start;

      if (response.ok) {
        return { ok: true, latencyMs };
      }
    } catch {
      // try next
    }
  }

  return {
    ok: false,
    latencyMs: Date.now() - start,
    error: "Falha na conexão (CORS ou servidor offline)",
  };
}

// ===== UTILS =====

function cleanResponse(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^[-•]\s/gm, "")
    .replace(/^\d+\.\s/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function detectPlatform(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  if (/Mac/.test(ua)) return "mac";
  if (/Windows/.test(ua)) return "windows";
  return "web";
}