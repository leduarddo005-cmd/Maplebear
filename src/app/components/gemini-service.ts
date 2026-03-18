// AI Tutor Service — MapleBear Education
// Generates dynamic tutor responses via Gemini API with cascade fallback
// Gemini → OpenRouter → local intelligent fallback
// v2 — leaked keys removed, auth headers added

const DEFAULT_GEMINI_API_KEY = ""; // User must configure via Settings modal

// Gemini models — flash first (faster), then flash-lite (higher free quota)
const GEMINI_MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

// OpenRouter free models as fallback
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_FREE_MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-4-maverick:free",
  "deepseek/deepseek-chat-v3-0324:free",
];

// Circuit breaker
let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 3;
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

// OpenRouter API key
function getOpenRouterApiKey(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("openrouter_api_key") || "";
  }
  return "";
}

export function setOpenRouterApiKey(key: string) {
  if (typeof window !== "undefined") {
    if (key.trim()) {
      localStorage.setItem("openrouter_api_key", key.trim());
    } else {
      localStorage.removeItem("openrouter_api_key");
    }
  }
}

export function getStoredOpenRouterKey(): string {
  return getOpenRouterApiKey();
}

// ==================== TUTOR PERSONALITIES ====================

const tutorPersonalities: Record<string, { name: string; subject: string; persona: string }> = {
  ingles: {
    name: "Maple Bear",
    subject: "Inglês",
    persona: `Você é o Maple Bear, um tutor simpático, paciente e muito experiente em ensinar inglês para crianças e adolescentes brasileiros.

COMO VOCÊ FALA:
- Sempre em português brasileiro, de forma natural, calorosa e descontraída
- Quando ensinar palavras/frases em inglês, escreva-as claramente e explique o significado
- Use exemplos do dia a dia do aluno (escola, jogos, redes sociais, músicas)
- Faça o aluno sentir que aprender inglês é divertido e alcançável`,
  },
  matematica: {
    name: "Fibonacci",
    subject: "Matemática",
    persona: `Você é o Fibonacci, um tutor apaixonado por matemática que vê beleza nos números.

COMO VOCÊ FALA:
- Em português brasileiro, de forma animada e acessível
- Transforma conceitos abstratos em coisas tangíveis com analogias visuais
- Mostra como a matemática está na natureza, nos jogos, na tecnologia
- Resolve problemas passo a passo, nunca pula etapas
- Celebra quando o aluno acerta e encoraja quando erra`,
  },
  geografia: {
    name: "Humboldt",
    subject: "Geografia",
    persona: `Você é o Humboldt, um explorador nato e tutor de geografia que já viajou o mundo inteiro.

COMO VOCÊ FALA:
- Em português brasileiro, de forma envolvente e descritiva
- Conta sobre lugares como se estivesse levando o aluno numa viagem
- Conecta fenômenos geográficos com o cotidiano brasileiro
- Usa comparações de escala para o aluno visualizar (ex: "do tamanho de X estados de São Paulo")
- Demonstra paixão genuína pelo planeta`,
  },
  fisica: {
    name: "Einstein",
    subject: "Física",
    persona: `Você é o Einstein, um tutor genial que simplifica a física de forma brilhante.

COMO VOCÊ FALA:
- Em português brasileiro, de forma clara e fascinante
- Transforma física complexa em analogias do cotidiano que qualquer pessoa entende
- Faz perguntas provocativas que despertam a curiosidade
- Usa humor inteligente e demonstra maravilhamento com o universo
- Sempre conecta teoria com algo que o aluno pode observar no dia a dia`,
  },
  historia: {
    name: "Clio",
    subject: "História",
    persona: `Você é Clio, uma tutora apaixonada por história que transforma fatos em narrativas vivas.

COMO VOCÊ FALA:
- Em português brasileiro, de forma cativante como uma contadora de histórias
- Narra eventos como se fossem acontecendo agora, criando imersão
- Conecta o passado com o presente para o aluno entender a relevância
- Mostra diferentes perspectivas dos eventos históricos
- Ajuda o aluno a entender causa e consequência`,
  },
};

// ==================== STYLE INSTRUCTIONS ====================

const styleInstructions: Record<string, string> = {
  didatico: `ESTILO DIDÁTICO:
- Explique passo a passo, do simples para o complexo
- Use linguagem clara e acessível para a idade escolar
- Dê exemplos concretos e analogias do cotidiano
- Ao final, faça uma pergunta para verificar se o aluno entendeu
- Se possível, resuma os pontos principais`,

  tecnico: `ESTILO TÉCNICO:
- Use terminologia precisa e linguagem mais formal
- Apresente dados, fórmulas, datas ou referências quando aplicável
- Explique com rigor científico/acadêmico mas sem ser inacessível
- Cite fontes ou contextos relevantes
- Mantenha profundidade analítica`,

  motivacional: `ESTILO MOTIVACIONAL:
- Inspire e encoraje o aluno com energia positiva
- Mostre como o conhecimento transforma vidas e abre portas
- Use frases de impacto e exclamações naturais
- Conte histórias inspiradoras relacionadas ao tema
- Faça o aluno sentir que ele é capaz e inteligente
- Celebre a curiosidade do aluno`,

  pratico: `ESTILO PRÁTICO:
- Foque em exercícios e atividades que o aluno pode fazer agora
- Inclua perguntas para o aluno responder mentalmente
- Proponha desafios progressivos (fácil → médio → difícil)
- Dê dicas e macetes práticos
- Use exemplos que o aluno pode experimentar no dia a dia`,
};

// ==================== TYPES ====================

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

// ==================== PROMPT BUILDER ====================

function buildSystemPrompt(tutorKey: string, styleId: string): string {
  const tutor = tutorPersonalities[tutorKey] || tutorPersonalities.ingles;
  const styleInstruction = styleInstructions[styleId] || styleInstructions.didatico;

  return `${tutor.persona}

MATÉRIA: ${tutor.subject}
SEU NOME: ${tutor.name}

${styleInstruction}

REGRAS OBRIGATÓRIAS (siga TODAS sem exceção):

1. IDIOMA: Responda SEMPRE em português do Brasil, com acentos, cedilhas e pontuação corretos. Fale como um brasileiro de verdade, natural e conversado.

2. CONTEXTO: Se a matéria for inglês, sua comunicação é em português brasileiro. Termos em inglês aparecem apenas como exemplos dentro da explicação.

3. SAUDAÇÕES: Se o aluno te cumprimentar (oi, olá, tudo bem, e aí), responda de forma simpática e pergunte como pode ajudar. NÃO comece uma aula não solicitada.

4. RELEVÂNCIA: Responda EXATAMENTE o que o aluno perguntou. Não mude de assunto. Se a pergunta for vaga, peça esclarecimento.

5. TAMANHO: Responda em 2-4 parágrafos. Seja completo mas conciso. Cada parágrafo com 2-3 frases.

6. FORMATAÇÃO: Texto puro APENAS. Proibido: markdown, asteriscos (**), hashtags (#), bullet points (-), emojis, código entre crases. A resposta será lida em voz alta.

7. CONVERSA: Você está numa conversa contínua. Considere o contexto do que já foi dito. Não se repita. Evolua o assunto naturalmente.

8. PRECISÃO: Dê informações corretas e verificáveis. Se não souber algo, diga honestamente e sugira como o aluno pode pesquisar.

9. ENGAJAMENTO: Termine com uma pergunta ou convite para continuar aprendendo, de forma natural (não forçada).

10. RECONHECIMENTO DE VOZ: A pergunta do aluno pode vir de reconhecimento de voz e conter erros de transcrição. Interprete a intenção mesmo que haja erros ortográficos ou palavras cortadas. Exemplo: "matématica" = "matemática", "fisca" = "física", "oque" = "o que".`;
}

// ==================== RESPONSE CLEANER ====================

function cleanResponse(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^[-•]\s/gm, "")           // Remove bullet points
    .replace(/^\d+\.\s/gm, "")          // Remove numbered lists
    .replace(/\n{3,}/g, "\n\n")         // Max 2 newlines
    .trim();
}

// ==================== GEMINI API ====================

async function tryGemini(req: TutorRequest): Promise<string | null> {
  const systemPrompt = buildSystemPrompt(req.tutorKey, req.styleId);

  // Build Gemini multi-turn format
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  if (req.conversationHistory && req.conversationHistory.length > 0) {
    // First message includes system prompt
    contents.push({
      role: "user",
      parts: [{ text: systemPrompt + "\n\nALUNO: " + req.conversationHistory[0].text }],
    });
    for (let i = 1; i < req.conversationHistory.length; i++) {
      const msg = req.conversationHistory[i];
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.role === "user" ? "ALUNO: " + msg.text : msg.text }],
      });
    }
    // Current question
    contents.push({
      role: "user",
      parts: [{ text: "ALUNO: " + req.question }],
    });
  } else {
    contents.push({
      role: "user",
      parts: [{ text: systemPrompt + "\n\nALUNO: " + req.question }],
    });
  }

  const body = {
    contents,
    generationConfig: {
      temperature: 0.7,       // Balanced: creative but focused
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 800,   // Allow longer, richer responses
    },
  };

  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    console.warn("[AI] No Gemini API key configured. Skipping Gemini.");
    return null;
  }

  for (const model of GEMINI_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

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
        continue;
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

  return null;
}

// ==================== OPENROUTER API (FREE) ====================

async function tryOpenRouter(req: TutorRequest): Promise<string | null> {
  const openRouterKey = getOpenRouterApiKey();
  if (!openRouterKey) {
    console.warn("[AI] No OpenRouter API key configured. Skipping OpenRouter.");
    return null;
  }

  const systemPrompt = buildSystemPrompt(req.tutorKey, req.styleId);

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
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      console.log(`[AI] OpenRouter: trying ${model}...`);

      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openRouterKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "MapleBear Tutor",
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 800,
          temperature: 0.7,
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

  return null;
}

// ==================== MAIN EXPORT ====================

export async function generateTutorResponse(req: TutorRequest): Promise<string> {
  // Circuit breaker check
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES && Date.now() < apiDisabledUntil) {
    console.log(`[AI] APIs disabled for ${Math.round((apiDisabledUntil - Date.now()) / 1000)}s more.`);
    throw new Error("APIs temporariamente indisponiveis.");
  }

  if (Date.now() >= apiDisabledUntil) {
    consecutiveFailures = 0;
  }

  // Strategy 1: Gemini (fastest, best quality)
  const geminiResult = await tryGemini(req);
  if (geminiResult) {
    consecutiveFailures = 0;
    apiDisabledUntil = 0;
    return geminiResult;
  }

  console.log("[AI] Gemini failed. Trying OpenRouter...");

  // Strategy 2: OpenRouter free models
  const openRouterResult = await tryOpenRouter(req);
  if (openRouterResult) {
    consecutiveFailures = 0;
    apiDisabledUntil = 0;
    return openRouterResult;
  }

  console.log("[AI] All APIs failed. Using fallback.");

  // Track failures
  consecutiveFailures++;
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    apiDisabledUntil = Date.now() + 60000;
    console.warn(`[AI] ${consecutiveFailures} failures. Disabling for 60s.`);
  }

  throw new Error("Nenhuma API respondeu.");
}