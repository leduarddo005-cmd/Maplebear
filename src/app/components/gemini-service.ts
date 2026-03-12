// AI Tutor Service
// Gera respostas dinamicas dos tutores com base na pergunta do aluno
// Tenta Gemini primeiro, depois OpenRouter como fallback

const DEFAULT_GEMINI_API_KEY = "AIzaSyCRfAEu06_MmYIBedG-K6ZG8mC-K8z8mJY";

// Gemini models to try (flash-lite has higher free tier limits)
const GEMINI_MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash"];

// OpenRouter free models as fallback (no key needed for some, but rate-limited)
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_FREE_MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-4-maverick:free",
  "deepseek/deepseek-chat-v3-0324:free",
];

// Track consecutive failures to auto-disable API calls
let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 2;
let apiDisabledUntil = 0;

function getGeminiApiKey(): string {
  if (typeof window !== "undefined") {
    const userKey = localStorage.getItem("gemini_api_key");
    if (userKey && userKey.trim()) return userKey.trim();
  }
  return DEFAULT_GEMINI_API_KEY;
}

export function setGeminiApiKey(key: string) {
  if (typeof window !== "undefined") {
    if (key.trim()) {
      localStorage.setItem("gemini_api_key", key.trim());
      consecutiveFailures = 0;
      apiDisabledUntil = 0;
    } else {
      localStorage.removeItem("gemini_api_key");
    }
  }
}

export function getStoredGeminiKey(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("gemini_api_key") || "";
  }
  return "";
}

export function hasCustomGeminiKey(): boolean {
  return !!getStoredGeminiKey();
}

// Contexto de cada tutor
const tutorPersonalities: Record<string, { name: string; subject: string; persona: string }> = {
  ingles: {
    name: "Maple Bear",
    subject: "Inglês",
    persona:
      "Você é o Maple Bear, um tutor amigável e paciente especializado em ensinar inglês para crianças e adolescentes brasileiros. Você fala SEMPRE em português brasileiro, de forma natural e descontraída, como um professor brasileiro falaria. Quando for ensinar palavras ou frases em inglês, escreva-as entre aspas e explique o significado em português. Nunca responda frases inteiras em inglês — sua comunicação principal é sempre em português do Brasil.",
  },
  matematica: {
    name: "Fibonacci",
    subject: "Matemática",
    persona:
      "Você é o Fibonacci, um tutor apaixonado por matemática que fala português brasileiro de forma natural e animada. Você adora mostrar como a matemática está presente na natureza e no cotidiano. Usa analogias visuais e exemplos práticos para explicar conceitos. Você fala com entusiasmo sobre números e padrões, sempre em português do Brasil.",
  },
  geografia: {
    name: "Humboldt",
    subject: "Geografia",
    persona:
      "Você é o Humboldt, um explorador e tutor de geografia que fala português brasileiro de forma natural e envolvente. Você viajou o mundo inteiro e adora contar histórias sobre lugares, climas, correntes marítimas e fenômenos naturais. Suas explicações são ricas em detalhes e fazem o aluno sentir que está viajando. Sempre fale em português do Brasil.",
  },
  fisica: {
    name: "Einstein",
    subject: "Física",
    persona:
      "Você é o Einstein, um tutor genial de física que fala português brasileiro de forma natural e acessível. Você simplifica conceitos complexos com analogias do cotidiano. Adora fazer o aluno pensar e questionar. Usa humor leve e demonstra fascínio pelo universo. Sempre fale em português do Brasil.",
  },
  historia: {
    name: "Tutor de História",
    subject: "História",
    persona:
      "Você é um tutor apaixonado por história que fala português brasileiro de forma natural e cativante. Você conta os eventos históricos como se fossem histórias emocionantes, conectando o passado com o presente. Ajuda o aluno a entender causa e consequência dos grandes eventos da humanidade. Sempre fale em português do Brasil.",
  },
};

const styleInstructions: Record<string, string> = {
  didatico:
    "Responda de forma DIDÁTICA: explique passo a passo, com linguagem simples e acessível. Use exemplos concretos e analogias. Verifique se o aluno entendeu ao final.",
  tecnico:
    "Responda de forma TÉCNICA: use terminologia precisa e linguagem acadêmica. Apresente dados, fórmulas ou referências quando aplicável. Mantenha rigor científico.",
  motivacional:
    "Responda de forma MOTIVACIONAL: inspire e encoraje o aluno! Mostre como o conhecimento é poderoso e transformador. Use energia positiva, exclamações e frases de efeito. Faça o aluno sentir que é capaz.",
  pratico:
    "Responda de forma PRÁTICA: dê exercícios, atividades ou experimentos que o aluno possa fazer agora. Inclua perguntas para o aluno responder e desafios hands-on.",
};

interface TutorRequest {
  question: string;
  tutorKey: string;
  styleId: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatMessage {
  role: "user" | "tutor";
  text: string;
}

function buildSystemPrompt(tutorKey: string, styleId: string): string {
  const tutor = tutorPersonalities[tutorKey] || tutorPersonalities.ingles;
  const styleInstruction = styleInstructions[styleId] || styleInstructions.didatico;

  return `${tutor.persona}

MATÉRIA: ${tutor.subject}
NOME DO TUTOR: ${tutor.name}

REGRAS OBRIGATÓRIAS:
- ${styleInstruction}
- Você DEVE responder SEMPRE em português do Brasil, com acentos, cedilhas e pontuação corretos. Fale como um brasileiro de verdade, de forma natural e conversada.
- Mesmo que a matéria seja inglês, sua comunicação é em português brasileiro. Termos em inglês devem aparecer apenas como exemplos dentro da explicação em português.
- Se o aluno te cumprimentar (ex: "oi", "olá", "tudo bem"), responda ao cumprimento de forma simpática e pergunte como pode ajudar. NÃO dê aula sobre um assunto aleatório.
- Responda SEMPRE de acordo com o que o aluno perguntou. Se ele perguntar sobre um tema, fale sobre aquele tema. Se ele fizer uma saudação, responda a saudação.
- Mantenha a resposta com no máximo 3-4 parágrafos curtos. Seja conciso mas completo.
- Use um tom amigável e adequado para estudantes.
- NÃO use markdown, asteriscos, hashtags ou formatação especial. Responda em texto puro pois a resposta será lida em voz alta.
- NÃO use emojis.
- Você está tendo uma CONVERSA com o aluno. Responda de forma natural e contextual, considerando o que já foi dito antes.`;
}

function cleanResponse(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

// ==================== GEMINI API ====================

async function tryGemini(req: TutorRequest): Promise<string | null> {
  const systemPrompt = buildSystemPrompt(req.tutorKey, req.styleId);

  // Build Gemini multi-turn format
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  if (req.conversationHistory && req.conversationHistory.length > 0) {
    contents.push({
      role: "user",
      parts: [{ text: systemPrompt + "\n\nPERGUNTA DO ALUNO: " + req.conversationHistory[0].text }],
    });
    for (let i = 1; i < req.conversationHistory.length; i++) {
      const msg = req.conversationHistory[i];
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.role === "user" ? "PERGUNTA DO ALUNO: " + msg.text : msg.text }],
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: "PERGUNTA DO ALUNO: " + req.question }],
    });
  } else {
    contents.push({
      role: "user",
      parts: [{ text: systemPrompt + "\n\nPERGUNTA DO ALUNO: " + req.question }],
    });
  }

  const body = {
    contents,
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 512,
    },
    // NO safetySettings - BLOCK_NONE requires billing, defaults work on free tier
  };

  const apiKey = getGeminiApiKey();

  for (const model of GEMINI_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      console.log(`[AI] Gemini: trying ${model}...`);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`[AI] Gemini ${model}: status ${response.status}`);

      if (response.status === 429 || response.status === 404 || response.status === 403) {
        const errBody = await response.json().catch(() => ({}));
        console.warn(`[AI] Gemini ${model} error:`, JSON.stringify(errBody));
        continue; // try next model
      }

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        console.warn(`[AI] Gemini ${model} error ${response.status}:`, JSON.stringify(errBody));
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (text) {
        console.log(`[AI] Gemini ${model} success! (${text.length} chars)`);
        return cleanResponse(text);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn(`[AI] Gemini ${model} failed:`, err.message);
      continue;
    }
  }

  return null; // All Gemini models failed
}

// ==================== OPENROUTER API (FREE) ====================

async function tryOpenRouter(req: TutorRequest): Promise<string | null> {
  const systemPrompt = buildSystemPrompt(req.tutorKey, req.styleId);

  // Build OpenAI-compatible messages format
  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  if (req.conversationHistory && req.conversationHistory.length > 0) {
    for (const msg of req.conversationHistory) {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text,
      });
    }
  }

  messages.push({ role: "user", content: req.question });

  for (const model of OPENROUTER_FREE_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      console.log(`[AI] OpenRouter: trying ${model}...`);

      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "MapleBear Tutor",
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 512,
          temperature: 0.8,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`[AI] OpenRouter ${model}: status ${response.status}`);

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        console.warn(`[AI] OpenRouter ${model} error:`, JSON.stringify(errBody));
        continue;
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || "";

      if (text) {
        console.log(`[AI] OpenRouter ${model} success! (${text.length} chars)`);
        return cleanResponse(text);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn(`[AI] OpenRouter ${model} failed:`, err.message);
      continue;
    }
  }

  return null; // All OpenRouter models failed
}

// ==================== MAIN EXPORT ====================

export async function generateTutorResponse(req: TutorRequest): Promise<string> {
  // Check if API is temporarily disabled
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES && Date.now() < apiDisabledUntil) {
    console.log(`[AI] APIs disabled for ${Math.round((apiDisabledUntil - Date.now()) / 1000)}s more. Skipping.`);
    throw new Error("APIs temporariamente desabilitadas.");
  }

  if (Date.now() >= apiDisabledUntil) {
    consecutiveFailures = 0;
  }

  // Strategy 1: Try Gemini (fastest, direct API)
  const geminiResult = await tryGemini(req);
  if (geminiResult) {
    consecutiveFailures = 0;
    apiDisabledUntil = 0;
    return geminiResult;
  }

  console.log("[AI] All Gemini models failed. Trying OpenRouter...");

  // Strategy 2: Try OpenRouter free models
  const openRouterResult = await tryOpenRouter(req);
  if (openRouterResult) {
    consecutiveFailures = 0;
    apiDisabledUntil = 0;
    return openRouterResult;
  }

  console.log("[AI] All APIs failed. Falling back to local response.");

  // All APIs failed - track failures
  consecutiveFailures++;
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    apiDisabledUntil = Date.now() + 60000;
    console.warn(`[AI] ${consecutiveFailures} consecutive failures. Disabling APIs for 60s.`);
  }

  throw new Error("Nenhuma API respondeu.");
}
