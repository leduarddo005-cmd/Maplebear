import { useState, useEffect, useRef, useCallback } from "react";

import { X, Check, Menu, GraduationCap, Wrench, Sparkles, Hammer, Volume2, VolumeX, Mic, Send, Keyboard } from "lucide-react";
import { RotateCcw } from "lucide-react";
import imgDesignSemNome1 from "figma:asset/64af5bea1f7d7b69df13506b3145a332f5049f18.png";
import svgPaths from "../../imports/svg-83y6mfkpbk";
import { speakWithElevenLabs, hasApiKey, unlockAudioForIOS } from "./elevenlabs-service";
import { generateTutorResponse, type ChatMessage } from "./gemini-service";
import {
  isDeepgramSupported,
  startStreaming,
  type StreamingSession,
} from "./deepgram-stt-service";
import { TutorCharacter3D, type CharacterState } from "./TutorCharacter3D";
import {
  sendToN8n,
  playN8nAudio,
  isWebhookConfigured,
  type N8nResponse,
} from "./n8n-service";

type ViewState = "idle" | "recording" | "selectStyle" | "processing" | "response";

// Dados internos do aluno - enviados automaticamente ao webhook
const STUDENT_INFO = {
  numero: "21999999999",
  nome: "Junior",
  anoEstudo: "7º Ano",
  escola: "MapleBear Ribeirão Preto Bonfim",
  cidade: "Ribeirão Preto",
  estado: "São Paulo",
};

interface MainScreenProps {
  tutor: string;
  onMenuOpen: () => void;
}

const tutorNames: Record<string, string> = {
  ingles: "MAPLE BEAR\nINGLES",
  matematica: "FIBONACCI\nMATEMATICA",
  geografia: "HUMBOLDT\nGEOGRAFIA",
  fisica: "EINSTEIN\nFISICA",
  historia: "HISTORIA",
};

const tutorResponses: Record<string, Record<string, string[]>> = {
  ingles: {
    didatico: [
      "Oi! Que bom que você veio conversar comigo! Estou aqui para te ajudar com inglês. Pode me perguntar qualquer coisa sobre vocabulário, gramática, pronúncia ou conversação!",
      "Olá! Vamos praticar inglês juntos? Me faça uma pergunta específica sobre o que você quer aprender e eu te explico passo a passo!",
    ],
    tecnico: [
      "Olá! Como seu tutor de inglês, estou preparado para explicar qualquer tópico com rigor técnico. Me faça uma pergunta específica!",
    ],
    motivacional: [
      "Olá! Que incrível que você está aqui! Aprender inglês é uma das habilidades mais transformadoras que existem. Vamos nessa juntos! Me conte o que você quer aprender!",
    ],
    pratico: [
      "Oi! Vamos praticar inglês com exercícios? Me diga um tema e eu preparo atividades para você!",
    ],
  },
  matematica: {
    didatico: [
      "Olá! Eu sou o Fibonacci e amo matemática! Estou aqui para te ajudar. Me faça uma pergunta sobre qualquer tema de matemática!",
    ],
    tecnico: [
      "Olá! Pronto para explorar a matemática com profundidade técnica. Qual conceito você gostaria de aprofundar?",
    ],
    motivacional: [
      "Olá! A matemática está em tudo ao nosso redor e você tem todo potencial para dominá-la! Me diga o que quer aprender!",
    ],
    pratico: [
      "Oi! Vamos resolver problemas juntos? Me diga o assunto e eu preparo exercícios para você praticar!",
    ],
  },
  geografia: {
    didatico: [
      "Olá! Eu sou o Humboldt, seu tutor de geografia! Adoro explorar o mundo e suas maravilhas. O que você gostaria de aprender?",
    ],
    tecnico: [
      "Olá! Vamos estudar geografia com profundidade técnica. Qual fenômeno ou região você quer entender?",
    ],
    motivacional: [
      "Olá! O planeta Terra é fascinante e você está prestes a descobrir coisas incríveis! O que quer explorar?",
    ],
    pratico: [
      "Oi! Que tal fazer um experimento ou atividade prática de geografia? Me diga o tema!",
    ],
  },
  fisica: {
    didatico: [
      "Olá! Eu sou o Einstein, seu tutor de física! Adoro simplificar o complexo. O que você gostaria de entender?",
    ],
    tecnico: [
      "Olá! Vamos explorar a física com precisão técnica. Qual fenômeno ou equação você quer analisar?",
    ],
    motivacional: [
      "Olá! A física explica os superpoderes do universo e você está prestes a descobri-los! O que quer aprender?",
    ],
    pratico: [
      "Oi! Vamos fazer um cálculo ou experimento de física juntos? Me diga o que você quer explorar!",
    ],
  },
  historia: {
    didatico: [
      "Olá! Eu adoro contar histórias sobre o passado. O que você gostaria de aprender sobre história?",
    ],
    tecnico: [
      "Olá! Vamos analisar a história com rigor acadêmico. Qual período ou evento você quer estudar?",
    ],
    motivacional: [
      "Olá! Quem conhece a história tem o poder de mudar o futuro! O que você quer descobrir?",
    ],
    pratico: [
      "Oi! Vamos fazer exercícios e atividades sobre história? Me diga o tema que te interessa!",
    ],
  },
};

// Generate a contextual fallback response that acknowledges the user's question
function generateContextualFallback(question: string, tutorKey: string, styleId: string): string {
  const tutorName: Record<string, string> = {
    ingles: "Maple Bear",
    matematica: "Fibonacci",
    geografia: "Humboldt",
    fisica: "Einstein",
    historia: "Tutor de História",
  };
  const name = tutorName[tutorKey] || "Tutor";
  const subjectLabel: Record<string, string> = {
    ingles: "inglês",
    matematica: "matemática",
    geografia: "geografia",
    fisica: "física",
    historia: "história",
  };
  const subject = subjectLabel[tutorKey] || "estudos";
  const qLower = question.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  // Word-boundary greeting detection (avoids "oi" matching "dois", "coisa", etc.)
  const isGreeting = /\b(oi|ola|hey|hi|hello)\b/.test(qLower) ||
    /^(bom dia|boa tarde|boa noite|tudo bem|como vai|e ai|fala|salve)/.test(qLower.trim());

  if (isGreeting && qLower.trim().split(/\s+/).length <= 6) {
    return pick([
      `Oi! Que bom te ver por aqui! Eu sou o ${name} e estou pronto para te ajudar com ${subject}. O que você gostaria de aprender hoje?`,
      `E aí! Tudo bem? Sou o ${name}, seu tutor de ${subject}. Manda sua dúvida que eu te explico!`,
      `Olá! Bem-vindo! Eu adoro ensinar ${subject}. Me conta, o que você quer saber?`,
    ]);
  }

  // ===== INGLÊS =====
  if (tutorKey === "ingles") {
    if (/\b(verbo|verb|conjugar|presente|passado|futuro|tense|past|present)\b/.test(qLower))
      return pick([
        `Os verbos em inglês são mais simples que em português! No presente, a maioria não muda: "I play" (eu jogo), "you play" (você joga). Só na terceira pessoa adicionamos "s": "he plays". No passado, os regulares ganham "ed": "played", "worked". Quer mais exemplos?`,
        `O verbo "to be" é o mais importante do inglês. No presente: "I am" (eu sou), "you are" (você é), "he is" (ele é). No passado: "I was", "you were". Pratique com frases do dia a dia: "I am a student", "I was at school". Quer praticar?`,
        `Os tempos verbais do inglês são organizados! "Simple Present" é rotina: "I study every day". "Present Continuous" é agora: "I am studying". "Simple Past" é o que já aconteceu: "I studied yesterday". Quer exercícios?`,
      ]);
    if (/\b(pronuncia|pronunci|falar|sotaque|accent|speak|sound)\b/.test(qLower))
      return pick([
        `Para pronúncia, o som do "th" é o mais difícil para brasileiros: coloque a língua entre os dentes e sopre. Tente: "the", "this", "that". O "r" em inglês não vibra: em "car", quase não se ouve. Dica de ouro: ouça músicas e cante junto!`,
        `A letra "h" no começo é sempre aspirada em inglês: "house", "hello" — solte um sopro de ar. Diferente do português! Outra dica: "beach" e "sheet" têm o "i" longo. Pratique com podcasts em velocidade reduzida.`,
      ]);
    if (/\b(numero|number|contar|count)\b/.test(qLower))
      return `Números em inglês! De 1 a 10: "one, two, three, four, five, six, seven, eight, nine, ten". A partir do 13, a maioria termina em "teen": "thirteen", "fourteen", "fifteen". Dezenas terminam em "ty": "twenty", "thirty", "forty" (sem o "u"!). Quer praticar números maiores?`;
    if (/\b(cor|cores|color|colour|red|blue|green)\b/.test(qLower))
      return `As cores em inglês: "red" (vermelho), "blue" (azul), "green" (verde), "yellow" (amarelo), "black" (preto), "white" (branco), "orange" (laranja), "purple" (roxo), "pink" (rosa), "brown" (marrom). Tente olhar ao redor e nomear em inglês: "The sky is blue"!`;
    if (/\b(animal|animais|dog|cat|bird|pet)\b/.test(qLower))
      return `Animais em inglês! "dog" (cachorro), "cat" (gato), "bird" (pássaro), "fish" (peixe), "horse" (cavalo), "cow" (vaca), "rabbit" (coelho), "monkey" (macaco). Em inglês o gato faz "meow" e o cachorro faz "woof"! Quer mais vocabulário?`;
    if (/\b(comida|food|eat|comer|fruta|fruit|drink|beber)\b/.test(qLower))
      return `Comidas em inglês! Frutas: "apple" (maçã), "banana", "orange" (laranja), "grape" (uva), "strawberry" (morango). Refeições: "breakfast" é café da manhã, "lunch" é almoço, "dinner" é jantar. Frase útil: "I would like some water, please" (Eu gostaria de água, por favor).`;
    if (/\b(familia|family|mae|pai|irmao|mother|father|brother|sister)\b/.test(qLower))
      return `Família em inglês! "Father/dad" (pai), "mother/mom" (mãe), "brother" (irmão), "sister" (irmã), "grandfather" (avô), "grandmother" (avó), "uncle" (tio), "aunt" (tia), "cousin" (primo/a). Note: "parents" significa pais (pai e mãe), não parentes!`;
    return pick([
      `Boa pergunta! Uma técnica que funciona muito é aprender 5 palavras novas por dia e fazer frases com elas. "book" (livro) — "I like to read books". Quer vocabulário sobre algum tema específico?`,
      `No inglês, a estrutura básica é Sujeito + Verbo + Complemento. "I eat pizza", "She reads books", "They play soccer". Mais simples que português! Me pergunta mais!`,
      `Uma dica importante: os artigos em inglês são simples. "a" (um/uma) para consoantes, "an" para vogais, "the" (o/a/os/as) para algo específico. "A dog", "an apple", "the school". Quer aprender mais?`,
    ]);
  }

  // ===== MATEMÁTICA =====
  if (tutorKey === "matematica") {
    if (/\b(equacao|equação|equation|resolver|solve|algebra|incognita|x)\b/.test(qLower))
      return pick([
        `Equações são como balanças! Em "x + 5 = 12", tire 5 dos dois lados: x = 7. O segredo é sempre fazer a mesma operação dos dois lados!`,
        `Isole a incógnita! Em "2x = 10", divida por 2: x = 5. Em "x - 3 = 7", some 3: x = 10. Pense numa balança: o que fizer de um lado, faça do outro. Quer tentar uma?`,
      ]);
    if (/\b(fracao|fração|fraction|dividir|divisao|metade|terco|quarto)\b/.test(qLower))
      return `Frações são partes de um todo! Pizza em 8 pedaços: comer 3 = 3/8. Comer 4 = 4/8 = 1/2. Para somar com mesmo denominador: 1/4 + 2/4 = 3/4. Diferentes: 1/2 + 1/3 = 3/6 + 2/6 = 5/6. Quer praticar?`;
    if (/\b(porcentagem|percentual|percent|desconto|juros)\b/.test(qLower))
      return `Porcentagem é "a cada 100". 25% de 200: divide por 100 e multiplica por 25 = 50. Atalho: 10% = divida por 10. Então 10% de 350 = 35. Para 20%, dobre: 70. Para 5%, é metade dos 10%: 17,50. Super útil no dia a dia!`;
    if (/\b(tabuada|multiplicacao|multiplicar|vezes|times)\b/.test(qLower))
      return `Truque da tabuada do 9: os resultados sempre somam 9! 9x2=18 (1+8=9), 9x3=27 (2+7=9), 9x4=36 (3+6=9). A do 5 sempre termina em 0 ou 5. E multiplicar por 10/100/1000: só adicione zeros! Quer praticar?`;
    if (/\b(geometria|triangulo|quadrado|circulo|area|perimetro|forma)\b/.test(qLower))
      return `Geometria! Área do quadrado: lado x lado. Retângulo: base x altura. Triângulo: (base x altura) / 2. Círculo: pi x raio². Pi vale 3,14. Essas formas estão em todo lugar: mesa = retângulo, roda = círculo! Quer calcular alguma?`;
    return pick([
      `A matemática está em tudo! A sequência de Fibonacci aparece nas pétalas das flores, nas conchas dos caracóis e até na proporção do rosto! Quer explorar algum tema específico?`,
      `Na matemática, entender o conceito é mais importante que decorar fórmulas. Somar é juntar, subtrair é tirar, multiplicar é repetir, dividir é repartir. Quando você entende, tudo fica fácil! Qual tema te interessa?`,
      `Números negativos foram inventados para representar dívidas! Tem 5 reais e deve 8? Saldo = -3. Somar negativo é subtrair: 10 + (-3) = 7. Quer mais exemplos?`,
    ]);
  }

  // ===== GEOGRAFIA =====
  if (tutorKey === "geografia") {
    if (/\b(brasil|brasileir|estado|regiao|nordeste|sudeste|sul|norte|centro)\b/.test(qLower))
      return pick([
        `O Brasil tem 26 estados divididos em 5 regiões: Norte (Amazônia), Nordeste (praias e sertão), Centro-Oeste (cerrado e Bras��lia), Sudeste (mais populosa) e Sul (clima frio, influência europeia). É o 5° maior país do mundo! Quer saber mais de alguma região?`,
        `O Brasil tem 6 biomas: Amazônia (maior floresta tropical), Cerrado, Mata Atlântica, Caatinga (semiárido), Pampa (campos do sul) e Pantanal (maior planície alagável). Cada um único! Qual te interessa?`,
      ]);
    if (/\b(clima|tempo|chuva|seca|temperatura|quente|frio|tropical)\b/.test(qLower))
      return `O clima depende de latitude, altitude, massas de ar e proximidade do mar. O Brasil tem: equatorial úmido na Amazônia, semiárido no sertão, tropical no centro e subtropical no sul. Quer entender por que são tão diferentes?`;
    if (/\b(rio|ocean|mar|agua|hidro|bacia|amazonas)\b/.test(qLower))
      return `O Rio Amazonas é o maior em volume e extensão (6.400 km)! Despeja tanta água que a água doce chega a 100 km da costa. O Brasil tem 12% da água doce do mundo e 12 bacias hidrográficas. Quer explorar mais?`;
    if (/\b(continente|europa|asia|africa|america|oceania|pais|mundo)\b/.test(qLower))
      return `São 6 continentes: América, Europa, Ásia (o maior, 4 bilhões de habitantes), África, Oceania e Antártida. A Ásia tem mais da metade da população mundial! Quer explorar algum continente?`;
    return pick([
      `As placas tectônicas se movem constantemente! Os Andes se formaram pelo choque de placas, e o Himalaia pela colisão da placa indiana com a eurasiana. A Terra está sempre se transformando! Quer saber mais?`,
      `As grandes cidades surgem perto de rios e costas por causa de água e transporte. São Paulo cresceu pelo café, o Rio pelo porto. Cada lugar tem uma história geográfica! Quer explorar algum tema?`,
    ]);
  }

  // ===== FÍSICA =====
  if (tutorKey === "fisica") {
    if (/\b(gravidade|gravity|peso|cair|queda|newton|forca|massa)\b/.test(qLower))
      return pick([
        `A gravidade na Terra é 9,8 m/s² — objetos em queda ficam 9,8 m/s mais rápidos a cada segundo! Na Lua é 6x menor: 60 kg na Terra = 10 kg na Lua. Newton entendeu isso observando uma maçã cair!`,
        `Leis de Newton! 1ª: objetos parados ficam parados (inércia). 2ª: F = m x a. 3ª: toda ação tem reação oposta — foguetes sobem empurrando gases para baixo! Quer exemplos práticos?`,
      ]);
    if (/\b(luz|optica|espelho|lente|reflexao|refracao|arco.?iris)\b/.test(qLower))
      return `A luz viaja a 300.000 km/s! Luz branca contém todas as cores: um prisma a separa no arco-íris. Espelhos refletem, lentes desviam (refração). Seus óculos e câmera do celular usam lentes! Quer explorar mais?`;
    if (/\b(eletric|corrente|voltagem|resistencia|circuito|energia|pilha|bateria)\b/.test(qLower))
      return `Eletricidade é fluxo de elétrons! Pense em água no cano: voltagem = pressão, corrente = quantidade de água, resistência = tamanho do cano. Fórmula de Ohm: V = R x I. Seu celular funciona com 3,7 volts! Quer aprender mais?`;
    if (/\b(velocidade|aceleracao|movimento|rapido|km|metro|segundo|mru)\b/.test(qLower))
      return `Velocidade = distância/tempo. 100 metros em 20 segundos = 5 m/s. Aceleração é a mudança de velocidade: 0 a 100 km/h em 10s = 10 km/h por segundo. MRU = velocidade constante. MRUV = velocidade muda (como queda livre). Quer calcular?`;
    return pick([
      `Por que o céu é azul? A atmosfera espalha a luz azul do Sol mais que as outras (espalhamento de Rayleigh). E o pôr do sol é vermelho porque a luz viaja mais pela atmosfera. Fascinante, né? Quer explorar mais?`,
      `Energia nunca é criada nem destruída, só transformada! Comida vira movimento no corpo, eletricidade vira luz na lâmpada. O Sol transforma energia nuclear em luz há 4,6 bilhões de anos! Quer saber mais?`,
    ]);
  }

  // ===== HISTÓRIA =====
  if (tutorKey === "historia") {
    if (/\b(brasil|descobrimento|colonial|colonia|portugal|cabral|indigen)\b/.test(qLower))
      return `Antes de 1500, milhões de indígenas viviam no Brasil com centenas de nações. Cabral chegou em 1500 e começou a colonização: pau-brasil, cana e ouro. Durou até 1822, quando Dom Pedro I declarou independência no Ipiranga. Quer saber mais de algum período?`;
    if (/\b(guerra|mundial|primeira|segunda|conflito|batalha|bomba)\b/.test(qLower))
      return `As guerras mundiais mudaram a humanidade. A Primeira (1914-1918): 17 milhões de mortos por rivalidades europeias. A Segunda (1939-1945): 70-85 milhões, Holocausto e bombas atômicas. Levaram à criação da ONU. Quer explorar algum período?`;
    if (/\b(revolucao|revolucion|industrial|francesa|russa|independencia)\b/.test(qLower))
      return `Revoluções transformaram o mundo! Francesa (1789): liberdade, igualdade, fraternidade. Industrial (séc. 18): máquinas substituíram trabalho manual. Americana (1776): criou os EUA e inspirou independências na América toda, incluindo a do Brasil. Qual te interessa?`;
    if (/\b(egit|roma|grec|antig|farao|piramide|medieval|idade media)\b/.test(qLower))
      return `História antiga é fascinante! Egípcios construíram pirâmides há 4.500 anos. Gregos criaram democracia e Olimpíadas. Romanos construíram estradas e um império enorme. Na Idade Média: castelos, cavaleiros e Cruzadas. Quer explorar alguma época?`;
    if (/\b(escravi|abolica|negro|racismo|africa|quilombo|zumbi)\b/.test(qLower))
      return `A escravidão no Brasil durou 300+ anos (1550-1888), o último país das Américas a abolir. Houve resistência: quilombos como Palmares com Zumbi. A Lei Áurea veio em 1888, mas sem políticas de inclusão, gerando desigualdades que persistem. Quer saber mais?`;
    return pick([
      `"Quem não conhece a história está condenado a repeti-la." Da invenção da escrita (3500 a.C.) até a internet, a humanidade avançou incrivelmente. Quer explorar algum período?`,
      `A prensa de Gutenberg (1440) permitiu imprimir livros em massa, espalhou conhecimento, levou ao Renascimento e à ciência moderna. Uma invenção mudou o mundo! Qual período te fascina?`,
    ]);
  }

  // ===== FALLBACK GENÉRICO =====
  return pick([
    `Boa pergunta! Como seu tutor de ${subject}, posso te ajudar com isso. Me dá mais detalhes e eu te explico passo a passo.`,
    `Essa é uma ótima dúvida sobre ${subject}! Me conta um pouco mais sobre o que exatamente quer saber.`,
    `Eu adoro quando alunos são curiosos! Em ${subject}, temos muita coisa para explorar. Quer que eu comece pelo básico ou você já sabe algo?`,
    `Legal sua pergunta sobre ${subject}! Vamos explorar esse tema juntos. Me faz uma pergunta mais específica que eu te dou uma explicação completinha.`,
  ]);
}

const styleOptions = [
  { id: "didatico", label: "Tutor Didático", icon: GraduationCap, color: "#2980b9", description: "Passo a passo" },
  { id: "tecnico", label: "Tutor Técnico", icon: Wrench, color: "#8e44ad", description: "Linguagem avançada" },
  { id: "motivacional", label: "Tutor Motivacional", icon: Sparkles, color: "#e67e22", description: "Inspira e encoraja" },
  { id: "pratico", label: "Tutor Prático", icon: Hammer, color: "#27ae60", description: "Exercícios" },
];

export function MainScreen({ tutor, onMenuOpen }: MainScreenProps) {
  const [viewState, setViewState] = useState<ViewState>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcription, setTranscription] = useState("");
  const [response, setResponse] = useState("");
  const [, setSelectedStyle] = useState("");
  const [processingText, setProcessingText] = useState("Hum... Entendi, deixe-me pensar...");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsError, setTtsError] = useState("");
  const [micStatus, setMicStatus] = useState<"idle" | "listening" | "error">("idle");
  const [useTextInput, setUseTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [micAvailable, setMicAvailable] = useState<boolean | null>(null);
  const [transcribeError, setTranscribeError] = useState("");
  const [micVolume, setMicVolume] = useState(0);
  // ===== CONVERSATION STATE =====
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentStyle, setCurrentStyle] = useState<string>("");
  const [followUpInput, setFollowUpInput] = useState("");
  const [isFollowUpProcessing, setIsFollowUpProcessing] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<StreamingSession | null>(null);
  const audioAbortRef = useRef<(() => void) | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const followUpInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const ttsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const title = tutorNames[tutor] || "MAPLE BEAR\nINGLES";

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (ttsIntervalRef.current) clearInterval(ttsIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.cancel();
        streamRef.current = null;
      }
      stopAudio();
      window.speechSynthesis.cancel();
    };
  }, []);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (viewState === "response" && chatScrollRef.current) {
      setTimeout(() => {
        chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" });
      }, 300);
    }
  }, [chatHistory, viewState]);

  // ===== DETECT MIC & ENVIRONMENT =====

  const [isWebView, setIsWebView] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    // Detect in-app browsers (WebView)
    const wvPatterns = [
      /FBAN|FBAV/i, /Instagram/i, /Line\//i, /Twitter/i,
      /MicroMessenger/i, /; wv\)/i, /GSA\//i, /DuckDuckGo/i,
      /LinkedInApp/i, /KAKAOTALK/i, /Snapchat/i, /Telegram/i,
    ];
    setIsWebView(wvPatterns.some((p) => p.test(ua)));

    // Deepgram uses AudioContext + WebSocket — check if available
    if (isDeepgramSupported()) {
      setMicAvailable(true);
    } else {
      setMicAvailable(false);
    }

    // Also check permission status
    (async () => {
      try {
        const perm = await navigator.permissions.query({ name: "microphone" as PermissionName });
        if (perm.state === "denied") {
          setMicAvailable(false);
        }
      } catch (_e) { /* permissions API not available — that's fine, we'll try anyway */ }
    })();
  }, []);

  const handleOpenInChrome = useCallback(() => {
    const url = window.location.href;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setMicHint("Link copiado! Cole no Chrome e abra.");
      }).catch(() => {
        setMicHint("Copie o link da barra de endereço e abra no Chrome.");
      });
    } else {
      // Fallback: prompt user
      window.prompt("Copie este link e abra no Chrome:", url);
    }
  }, []);

  // ===== DEEPGRAM REAL-TIME STREAMING STT =====
  // Architecture: Mic → AudioContext → PCM → WebSocket → live transcript
  const [micHint, setMicHint] = useState("");

  // Cancel any active streaming session
  const cancelActiveSession = () => {
    if (streamRef.current) {
      streamRef.current.cancel();
      streamRef.current = null;
    }
  };

  // Start real-time streaming transcription
  const beginStreaming = async () => {
    // Ensure TTS is fully stopped
    if (ttsIntervalRef.current) { clearInterval(ttsIntervalRef.current); ttsIntervalRef.current = null; }
    window.speechSynthesis.cancel();
    cancelActiveSession();

    const session = await startStreaming({
      onTranscript: (text, _isFinal) => {
        // Update transcription progressively as user speaks
        setTranscription(text);
      },
      onStarted: () => {
        setMicStatus("listening");
        setMicHint("");
        console.log("[Voice] Streaming started — listening");
      },
      onError: (msg) => {
        console.error("[Voice] Streaming error:", msg);
        setMicStatus("error");
        setMicHint(msg);
        setMicVolume(0);
        if (timerRef.current) clearInterval(timerRef.current);
        setUseTextInput(true);
      },
      onVolume: (level) => setMicVolume(level),
    });

    if (session) {
      streamRef.current = session;
    }
  };

  // ===== AUDIO PLAYBACK =====
  const stopAudio = () => {
    if (audioAbortRef.current) {
      audioAbortRef.current();
      audioAbortRef.current = null;
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    // Clean up TTS interval BEFORE cancelling speech (prevents leaks)
    if (ttsIntervalRef.current) { clearInterval(ttsIntervalRef.current); ttsIntervalRef.current = null; }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // ===== ELEVENLABS TTS with browser fallback =====
  const speakResponse = useCallback(async (text: string) => {
    unlockAudioForIOS(); // Ensure iOS audio is unlocked
    stopAudio();
    setTtsError("");

    if (hasApiKey()) {
      // Use ElevenLabs
      const result = await speakWithElevenLabs(
        { text, tutorKey: tutor },
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        (err) => {
          console.warn("TTS error:", err);
          // Fallback to browser TTS silently
          browserTTS(text);
        }
      );
      audioAbortRef.current = result.abort;
      currentAudioRef.current = result.audio;
    } else {
      // Fallback: browser TTS
      browserTTS(text);
    }
  }, [tutor]);

  const browserTTS = (text: string) => {
    window.speechSynthesis.cancel();
    // Clear any previous TTS interval
    if (ttsIntervalRef.current) { clearInterval(ttsIntervalRef.current); ttsIntervalRef.current = null; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    u.rate = 0.95;
    u.pitch = 1.1;
    const voices = window.speechSynthesis.getVoices();
    const pv = voices.find((v) => v.lang.startsWith("pt") && v.name.includes("Google")) || voices.find((v) => v.lang.startsWith("pt"));
    if (pv) u.voice = pv;
    window.speechSynthesis.speak(u);
    // iOS Safari bug: speechSynthesis pauses after ~15s. Periodic resume fixes it.
    ttsIntervalRef.current = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        if (ttsIntervalRef.current) { clearInterval(ttsIntervalRef.current); ttsIntervalRef.current = null; }
      } else {
        window.speechSynthesis.resume();
      }
    }, 5000);
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => { if (ttsIntervalRef.current) { clearInterval(ttsIntervalRef.current); ttsIntervalRef.current = null; } setIsSpeaking(false); };
    u.onerror = () => { if (ttsIntervalRef.current) { clearInterval(ttsIntervalRef.current); ttsIntervalRef.current = null; } setIsSpeaking(false); };
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopAudio();
    } else {
      speakResponse(response);
    }
  };

  // ===== TEXT INPUT FLOW =====
  const openTextInput = () => {
    setViewState("recording");
    setUseTextInput(true);
    setTextInput("");
    setTranscription("");
    setTtsError("");
    setTimeout(() => textInputRef.current?.focus(), 100);
  };

  const sendTextInput = () => {
    if (!textInput.trim()) return;
    unlockAudioForIOS(); // Pre-unlock audio on iOS during user tap
    setTranscription(textInput.trim());
    // If we already have a style from a previous conversation, skip style selection
    if (currentStyle) {
      handleSelectStyle(currentStyle, textInput.trim());
    } else {
      setViewState("selectStyle");
    }
  };

  const cancelTextInput = () => {
    setViewState("idle");
    setTextInput("");
    setTranscription("");
  };

  // ===== RECORDING FLOW (Deepgram REST) =====
  // Flow: press mic → record → press stop → "Transcrevendo..." → Deepgram POST → text appears
  const startRecording = () => {
    unlockAudioForIOS();
    stopAudio();
    setMicHint("");
    setTranscribeError("");

    if (!isDeepgramSupported()) {
      if (isWebView) {
        setMicHint("O navegador interno nao suporta voz. Abra em um navegador como Chrome ou Safari.");
      } else {
        setMicHint("Navegador sem suporte a voz. Use o campo de texto.");
      }
      setViewState("recording");
      setUseTextInput(true);
      setTimeout(() => textInputRef.current?.focus(), 100);
      return;
    }

    setViewState("recording");
    setRecordingTime(0);
    setTranscription("");
    setTtsError("");
    setUseTextInput(false);
    timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    beginStreaming();
  };

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    cancelActiveSession();
    stopAudio();
    setViewState("idle");
    setRecordingTime(0);
    setTranscription("");
    setMicHint("");
    setMicStatus("idle");
    setMicVolume(0);
  };

  const sendRecording = () => {
    // Grab the live transcript accumulated so far
    const savedText = (streamRef.current?.getTranscript() || transcription).trim();

    // Stop timer + streaming session
    if (timerRef.current) clearInterval(timerRef.current);
    cancelActiveSession();
    setMicStatus("idle");
    setMicVolume(0);

    if (!savedText) {
      setMicHint("Nenhuma fala detectada. Fale algo e tente novamente.");
      setViewState("idle");
      return;
    }

    setTranscription(savedText);

    // Next step: style selection or direct processing
    if (currentStyle) {
      handleSelectStyle(currentStyle, savedText);
    } else {
      setViewState("selectStyle");
    }
  };

  const handleSelectStyle = useCallback(async (styleId: string, question?: string) => {
    unlockAudioForIOS();
    setSelectedStyle(styleId);
    setCurrentStyle(styleId);
    setViewState("processing");
    const q = (question || transcription || "").trim();

    if (!q) {
      // Safety: if somehow we got here with no question, show fallback
      console.warn("[handleSelectStyle] No question text — using generic greeting");
      const resp = generateContextualFallback("oi", tutor, styleId);
      setResponse(resp);
      setViewState("response");
      speakResponse(resp);
      return;
    }

    const msgs = [
      "Hum... Entendi, deixe-me pensar...",
      "Pensando na melhor resposta...",
      "Analisando sua pergunta...",
      "Preparando a resposta...",
    ];
    msgs.forEach((msg, i) => setTimeout(() => setProcessingText(msg), i * 1200));

    const newUserMsg: ChatMessage = { role: "user", text: q };
    const updatedHistory = [...chatHistory, newUserMsg];
    setChatHistory(updatedHistory);

    // Helper to show response and speak it
    const showResponse = (resp: string, audioUrl?: string) => {
      const newTutorMsg: ChatMessage = { role: "tutor", text: resp };
      setChatHistory([...updatedHistory, newTutorMsg]);
      setResponse(resp);
      setViewState("response");

      // Se o n8n já retornou áudio pré-gerado, usa ele
      if (audioUrl) {
        const result = playN8nAudio(
          audioUrl,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false),
          (err) => {
            console.warn("[n8n] Pre-generated audio failed, falling back to TTS:", err);
            try { speakResponse(resp); } catch (_e) { /* TTS optional */ }
          }
        );
        if (result) {
          audioAbortRef.current = result.abort;
          currentAudioRef.current = result.audio;
          return;
        }
      }

      // Fallback: TTS local (ElevenLabs ou browser)
      try { speakResponse(resp); } catch (_e) { /* TTS optional */ }
    };

    // ===== ESTRATÉGIA: n8n primeiro → Gemini local → fallback =====
    try {
      if (isWebhookConfigured()) {
        // 1️⃣ n8n webhook (caminho principal)
        console.log("[AI] Trying n8n webhook...");
        const n8nResult: N8nResponse = await sendToN8n({
          message: q,
          tutorKey: tutor,
          styleId,
          conversationHistory: chatHistory,
          studentName: STUDENT_INFO.nome,
          studentInfo: STUDENT_INFO,
        });
        console.log("[AI] n8n responded", { textLength: n8nResult.text.length, hasAudio: !!n8nResult.audioUrl });
        showResponse(n8nResult.text, n8nResult.audioUrl);
      } else {
        // 2️⃣ Gemini direto (webhook não configurado)
        console.log("[AI] No n8n webhook configured, using Gemini directly...");
        const geminiResponse = await generateTutorResponse({
          question: q,
          tutorKey: tutor,
          styleId,
          conversationHistory: chatHistory,
        });
        showResponse(geminiResponse);
      }
    } catch (err: any) {
      console.error("[AI] Primary path failed:", err.message);

      // 3️⃣ Se n8n falhou, tenta Gemini como fallback
      if (isWebhookConfigured()) {
        try {
          console.log("[AI] n8n failed, falling back to Gemini...");
          const geminiResponse = await generateTutorResponse({
            question: q,
            tutorKey: tutor,
            styleId,
            conversationHistory: chatHistory,
          });
          showResponse(geminiResponse);
          return;
        } catch (geminiErr: any) {
          console.error("[AI] Gemini fallback also failed:", geminiErr.message);
        }
      }

      // 4️⃣ Fallback local (respostas pré-definidas)
      try {
        showResponse(generateContextualFallback(q, tutor, styleId));
      } catch (_e2) {
        showResponse(`Desculpe, tive um problema para processar sua pergunta. Tente novamente!`);
      }
    }
  }, [tutor, speakResponse, transcription, chatHistory]);

  // ===== FOLLOW-UP IN CONVERSATION =====
  const sendFollowUp = useCallback(async () => {
    if (!followUpInput.trim() || isFollowUpProcessing) return;
    const q = followUpInput.trim();
    setFollowUpInput("");
    setIsFollowUpProcessing(true);
    stopAudio();

    const newUserMsg: ChatMessage = { role: "user", text: q };
    const updatedHistory = [...chatHistory, newUserMsg];
    setChatHistory(updatedHistory);

    // Scroll to bottom
    setTimeout(() => chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" }), 100);

    // Helper: mostra resposta do follow-up e fala
    const showFollowUp = (resp: string, audioUrl?: string) => {
      const newTutorMsg: ChatMessage = { role: "tutor", text: resp };
      setChatHistory([...updatedHistory, newTutorMsg]);
      setResponse(resp);

      if (audioUrl) {
        const result = playN8nAudio(
          audioUrl,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false),
          () => { try { speakResponse(resp); } catch (_e) { /* ok */ } }
        );
        if (result) {
          audioAbortRef.current = result.abort;
          currentAudioRef.current = result.audio;
          return;
        }
      }
      try { speakResponse(resp); } catch (_e) { /* ok */ }
    };

    try {
      if (isWebhookConfigured()) {
        // n8n primeiro
        const n8nResult = await sendToN8n({
          message: q,
          tutorKey: tutor,
          styleId: currentStyle,
          conversationHistory: chatHistory,
          studentName: STUDENT_INFO.nome,
          studentInfo: STUDENT_INFO,
        });
        showFollowUp(n8nResult.text, n8nResult.audioUrl);
      } else {
        // Gemini direto
        const geminiResponse = await generateTutorResponse({
          question: q,
          tutorKey: tutor,
          styleId: currentStyle,
          conversationHistory: chatHistory,
        });
        showFollowUp(geminiResponse);
      }
    } catch (err: any) {
      console.error("[AI] Follow-up primary failed:", err.message);

      // Fallback: Gemini se n8n falhou
      if (isWebhookConfigured()) {
        try {
          const geminiResponse = await generateTutorResponse({
            question: q,
            tutorKey: tutor,
            styleId: currentStyle,
            conversationHistory: chatHistory,
          });
          showFollowUp(geminiResponse);
          return;
        } catch (_geminiErr) { /* continue to local fallback */ }
      }

      // Fallback local
      try {
        showFollowUp(generateContextualFallback(q, tutor, currentStyle));
      } catch (_e2) {
        const fallback = "Desculpe, tive um problema. Tente novamente!";
        setChatHistory([...updatedHistory, { role: "tutor", text: fallback }]);
        setResponse(fallback);
      }
    } finally {
      setIsFollowUpProcessing(false);
      setTimeout(() => {
        chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" });
        followUpInputRef.current?.focus();
      }, 200);
    }
  }, [followUpInput, isFollowUpProcessing, chatHistory, tutor, currentStyle, speakResponse]);

  // ===== VOICE FOLLOW-UP (record and transcribe in conversation) =====
  const [isVoiceFollowUp, setIsVoiceFollowUp] = useState(false);
  const [voiceFollowUpTime, setVoiceFollowUpTime] = useState(0);
  const voiceFollowUpTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startVoiceFollowUp = useCallback(async () => {
    if (isFollowUpProcessing || isVoiceFollowUp) return;
    unlockAudioForIOS();
    stopAudio();

    if (!isDeepgramSupported()) return;

    // Stop TTS
    if (ttsIntervalRef.current) { clearInterval(ttsIntervalRef.current); ttsIntervalRef.current = null; }
    window.speechSynthesis.cancel();
    cancelActiveSession();

    setIsVoiceFollowUp(true);
    setVoiceFollowUpTime(0);
    setFollowUpInput("");
    voiceFollowUpTimerRef.current = setInterval(() => setVoiceFollowUpTime((t) => t + 1), 1000);

    const session = await startStreaming({
      onTranscript: (text) => {
        // Live update the follow-up input as user speaks
        setFollowUpInput(text);
      },
      onStarted: () => {
        console.log("[Voice] Follow-up streaming started");
      },
      onError: (msg) => {
        console.error("[Voice] Follow-up streaming error:", msg);
        setIsVoiceFollowUp(false);
        if (voiceFollowUpTimerRef.current) clearInterval(voiceFollowUpTimerRef.current);
        setMicHint(msg);
        setMicVolume(0);
      },
      onVolume: (level) => setMicVolume(level),
    });

    if (session) {
      streamRef.current = session;
    }
  }, [isFollowUpProcessing, isVoiceFollowUp]);

  const stopVoiceFollowUp = useCallback(() => {
    if (voiceFollowUpTimerRef.current) clearInterval(voiceFollowUpTimerRef.current);
    setIsVoiceFollowUp(false);
    setMicVolume(0);

    // Grab the live transcript and stop the session
    const session = streamRef.current;
    if (session) {
      const text = session.getTranscript();
      streamRef.current = null;
      session.stop().catch(() => {});
      if (text.trim()) {
        setFollowUpInput(text.trim());
      }
    }
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const resetToIdle = () => {
    stopAudio();
    cancelActiveSession();
    if (isVoiceFollowUp) {
      if (voiceFollowUpTimerRef.current) clearInterval(voiceFollowUpTimerRef.current);
      setIsVoiceFollowUp(false);
    }
    setMicVolume(0);
    setViewState("idle");
    setResponse("");
    setTranscription("");
    setRecordingTime(0);
    setTtsError("");
    setChatHistory([]);
    setCurrentStyle("");
    setFollowUpInput("");
    setUseTextInput(false);
    setMicHint("");
    setTranscribeError("");
  };

  // ===== 3D CHARACTER STATE =====
  // waiting   → Aguardando o aluno (acenando, convidativo)
  // listening → Escutando o aluno falar (mic ativo, atento)
  // talking   → Tutor respondendo (TTS ativo, boca mexendo)
  const characterState: CharacterState = isSpeaking
    ? "talking"
    : viewState === "recording"
    ? "listening"
    : "waiting";

  /* ======== INTERACTION PANEL ======== */
  const renderPanel = () => (
    <>
      {viewState === "idle" && (
        <div className="flex flex-col items-center py-6 sm:py-8 lg:py-10">
          {/* Always show BOTH mic and text buttons */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* MIC button — always visible */}
            <div className="flex flex-col items-center">
              <button
                onClick={startRecording}
                className={`w-[clamp(56px,12vmin,100px)] h-[clamp(56px,12vmin,100px)] rounded-full flex items-center justify-center shadow-[3px_3px_8px_rgba(0,0,0,0.6)] border-[clamp(5px,1.5vmin,10px)] active:scale-95 hover:scale-105 transition-transform bg-[#af0100] border-[#af0100]`}
              >
                <svg className="w-[clamp(24px,6vmin,48px)] h-[clamp(34px,8vmin,64px)]" viewBox="0 0 45.5 61.75" fill="none">
                  <path d={svgPaths.p9ec0c00} fill="white" />
                </svg>
              </button>
              <span className="text-[#919191] text-[clamp(9px,1.3vmin,13px)] mt-1.5" style={{ fontFamily: "'Luckiest Guy', cursive" }}>FALAR</span>
            </div>

            {/* TEXT button */}
            <div className="flex flex-col items-center">
              <button
                onClick={openTextInput}
                className="bg-[#2980b9] w-[clamp(56px,12vmin,100px)] h-[clamp(56px,12vmin,100px)] rounded-full flex items-center justify-center shadow-[3px_3px_8px_rgba(0,0,0,0.6)] border-[clamp(5px,1.5vmin,10px)] border-[#2980b9] active:scale-95 hover:scale-105 transition-transform"
              >
                <Keyboard className="w-[clamp(24px,6vmin,44px)] h-[clamp(24px,6vmin,44px)] text-white" strokeWidth={2} />
              </button>
              <span className="text-[#919191] text-[clamp(9px,1.3vmin,13px)] mt-1.5" style={{ fontFamily: "'Luckiest Guy', cursive" }}>DIGITAR</span>
            </div>
          </div>

          <p className="text-[#919191] text-[clamp(13px,2.5vmin,24px)] text-center mt-4 sm:mt-5" style={{ fontFamily: "'Luckiest Guy', cursive" }}>
            APERTE PARA CONVERSAR
          </p>

          {/* WebView warning */}
          {isWebView && !isDeepgramSupported() && (
            <div className="mt-3 mx-4 flex flex-col items-center gap-2 px-4 py-2.5 rounded-[12px] bg-[#e67e22]/10">
              <p className="text-[#e67e22] text-[clamp(10px,1.4vmin,13px)] font-['Inter',sans-serif] text-center leading-[1.4]">
                Para melhor experiencia de voz, abra no <strong>Google Chrome</strong> ou <strong>Safari</strong>.
              </p>
              <button
                onClick={handleOpenInChrome}
                className="flex items-center gap-1.5 bg-[#e67e22] text-white rounded-full px-3.5 py-1.5 text-[clamp(10px,1.3vmin,12px)] font-['Inter',sans-serif] active:scale-95 transition-transform"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                COPIAR LINK
              </button>
            </div>
          )}

          {/* Mic unavailable hint (not WebView) */}
          {micAvailable === false && !isWebView && (
            <div className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e74c3c]/10">
              <Mic className="w-3.5 h-3.5 text-[#e74c3c]/60" />
              <span className="text-[#e74c3c]/70 text-[clamp(10px,1.3vmin,12px)] font-['Inter',sans-serif]">
                Microfone indisponivel neste navegador
              </span>
            </div>
          )}

          {/* Transcription error feedback */}
          {transcribeError && (
            <p className="mt-2 text-[#e74c3c] text-center text-[clamp(10px,1.3vmin,12px)] font-['Inter',sans-serif] px-4">
              {transcribeError}
            </p>
          )}

          {/* Mic hint feedback */}
          {micHint && (
            <p className="mt-2 text-[#e74c3c] text-center text-[clamp(10px,1.3vmin,12px)] font-['Inter',sans-serif] px-4">
              {micHint}
            </p>
          )}
        </div>
      )}

      {viewState === "recording" && !useTextInput && (
        <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8">
          {/* REC badge + mic status */}
          <div className="flex justify-center items-center gap-2 mb-3 sm:mb-4">
            <div className="bg-gradient-to-r from-[#c0392b] to-[#e74c3c] rounded-full px-4 sm:px-6 py-2 flex items-center gap-2 sm:gap-3 shadow-lg">
              <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
              <span className="text-white text-[clamp(14px,2vmin,20px)]" style={{ fontFamily: "'Luckiest Guy', cursive" }}>REC</span>
              <span className="text-white text-[clamp(16px,2.5vmin,24px)] ml-1" style={{ fontFamily: "'Luckiest Guy', cursive" }}>{formatTime(recordingTime)}</span>
            </div>
            {micStatus === "listening" && (
              <div className="flex items-center gap-1 bg-[#27ae60] rounded-full px-2.5 py-1.5 animate-pulse">
                <Mic className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Mic hint / error message */}
          {micHint && (
            <p className="text-[#e74c3c] text-center text-[11px] sm:text-[12px] font-['Inter',sans-serif] mb-2 px-2">
              {micHint}
            </p>
          )}

          {/* Live transcription + volume visualization */}
          <div className="min-h-[50px] sm:min-h-[60px] flex items-center justify-center mb-4 sm:mb-5">
            <div className="flex flex-col items-center gap-2 w-full">
              {/* Volume bars */}
              {micStatus === "listening" && (
                <div className="flex items-end gap-[3px] h-[28px]">
                  {[0.08, 0.15, 0.22, 0.3, 0.2, 0.35, 0.25, 0.18, 0.28, 0.12, 0.32, 0.15].map((threshold, i) => {
                    const active = micVolume > threshold;
                    const h = 8 + (i % 3 === 0 ? 16 : i % 2 === 0 ? 12 : 20);
                    return (
                      <div
                        key={i}
                        className="w-[4px] rounded-full transition-all duration-100"
                        style={{
                          height: active ? `${Math.min(h * (0.5 + micVolume * 3), 28)}px` : "4px",
                          backgroundColor: active ? "#27ae60" : "#ccc",
                        }}
                      />
                    );
                  })}
                </div>
              )}
              {/* Transcription text or status */}
              <p className="text-[#1e1e1e] text-center text-[clamp(15px,2.5vmin,26px)] leading-[1.3] px-2" style={{ fontFamily: "'Luckiest Guy', cursive" }}>
                {transcription || (
                  <span className="text-[#919191]">
                    {micStatus === "listening" ? "Ouvindo..." : "Preparando microfone..."}
                  </span>
                )}
              </p>
              {micStatus === "listening" && !transcription && (
                <p className="text-[#b3b3b3] text-center text-[clamp(10px,1.3vmin,12px)] font-['Inter',sans-serif]">
                  Fale sua pergunta e aperte ENVIAR
                </p>
              )}
            </div>
          </div>

          {/* Cancel & Send */}
          <div className="flex items-center justify-center gap-8 sm:gap-12 lg:gap-16">
            <div className="flex flex-col items-center">
              <button onClick={cancelRecording} className="bg-[#af0100] w-[clamp(44px,8vmin,68px)] h-[clamp(44px,8vmin,68px)] rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform">
                <X className="w-[clamp(18px,4vmin,30px)] h-[clamp(18px,4vmin,30px)] text-white" strokeWidth={3} />
              </button>
              <span className="text-[#919191] text-[clamp(10px,1.5vmin,15px)] mt-1.5" style={{ fontFamily: "'Luckiest Guy', cursive" }}>CANCELAR</span>
            </div>
            <div className="flex flex-col items-center">
              <button onClick={sendRecording} className="bg-[#27ae60] w-[clamp(44px,8vmin,68px)] h-[clamp(44px,8vmin,68px)] rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform">
                <Check className="w-[clamp(18px,4vmin,30px)] h-[clamp(18px,4vmin,30px)] text-white" strokeWidth={3} />
              </button>
              <span className="text-[#919191] text-[clamp(10px,1.5vmin,15px)] mt-1.5" style={{ fontFamily: "'Luckiest Guy', cursive" }}>ENVIAR</span>
            </div>
          </div>
          {/* Switch to text input */}
          <button
            onClick={() => {
              cancelActiveSession();
              if (timerRef.current) clearInterval(timerRef.current);
              setMicVolume(0);
              setMicStatus("idle");
              setUseTextInput(true);
              setTextInput(transcription);
              setTimeout(() => textInputRef.current?.focus(), 100);
            }}
            className="mt-3 flex items-center justify-center gap-1.5 w-full"
          >
            <Keyboard className="w-3.5 h-3.5 text-[#2980b9]" />
            <span className="text-[#2980b9] text-[clamp(10px,1.4vmin,13px)] font-['Inter',sans-serif] underline">
              digitar em vez de falar
            </span>
          </button>
        </div>
      )}

      {viewState === "recording" && useTextInput && (
        <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8">
          {/* Mic hint if redirected from voice */}
          {micHint && (
            <p className="text-[#e67e22] text-center text-[11px] sm:text-[12px] font-['Inter',sans-serif] mb-3 px-2 leading-[1.4]">
              {micHint}
            </p>
          )}
          {/* Header */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-[#2980b9] rounded-full px-4 sm:px-5 py-2 flex items-center gap-2 shadow-lg">
              <Keyboard className="w-4 h-4 text-white" />
              <span className="text-white text-[clamp(13px,2vmin,18px)]" style={{ fontFamily: "'Luckiest Guy', cursive" }}>DIGITE SUA PERGUNTA</span>
            </div>
          </div>

          {/* Text input */}
          <div className="relative mb-4 sm:mb-5">
            <input
              ref={textInputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendTextInput(); }}
              placeholder="Ex: Como funciona a fotossíntese?"
              className="w-full px-4 py-3 sm:py-3.5 pr-12 rounded-[14px] border-2 border-[#2980b9]/30 bg-white font-['Inter',sans-serif] text-[clamp(14px,2vmin,18px)] text-[#1e1e1e] placeholder:text-[#b3b3b3] outline-none focus:border-[#2980b9] focus:ring-2 focus:ring-[#2980b9]/20 transition-all"
              autoFocus
            />
            {textInput.trim() && (
              <button
                onClick={sendTextInput}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#27ae60] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          {/* Suggested questions */}
          <div className="space-y-1.5 mb-4 sm:mb-5">
            <p className="text-[#919191] text-[10px] sm:text-[11px] font-['Inter',sans-serif] text-center mb-1">Sugestões:</p>
            {[
              tutor === "ingles" ? "What is the present perfect?" :
              tutor === "matematica" ? "Como funciona a sequência de Fibonacci?" :
              tutor === "geografia" ? "O que são correntes marítimas?" :
              tutor === "fisica" ? "O que significa E=mc2?" :
              "Quais foram as causas da Revolução Francesa?",
              tutor === "ingles" ? "How do I use phrasal verbs?" :
              tutor === "matematica" ? "O que é a proporção áurea?" :
              tutor === "geografia" ? "Por que existem fusos horários?" :
              tutor === "fisica" ? "Como funciona a gravidade?" :
              "O que foi o Renascimento?"
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => { setTextInput(q); setTimeout(() => textInputRef.current?.focus(), 50); }}
                className="w-full text-left px-3 py-2 rounded-[10px] bg-white/70 hover:bg-white text-[#666] text-[clamp(11px,1.5vmin,14px)] font-['Inter',sans-serif] transition-colors leading-[1.3]"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Cancel & Send buttons */}
          <div className="flex items-center justify-center gap-8 sm:gap-12">
            <div className="flex flex-col items-center">
              <button onClick={cancelTextInput} className="bg-[#af0100] w-[clamp(44px,8vmin,68px)] h-[clamp(44px,8vmin,68px)] rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform">
                <X className="w-[clamp(18px,4vmin,30px)] h-[clamp(18px,4vmin,30px)] text-white" strokeWidth={3} />
              </button>
              <span className="text-[#919191] text-[clamp(10px,1.5vmin,15px)] mt-1.5" style={{ fontFamily: "'Luckiest Guy', cursive" }}>CANCELAR</span>
            </div>
            <div className="flex flex-col items-center">
              <button onClick={sendTextInput} className={`w-[clamp(44px,8vmin,68px)] h-[clamp(44px,8vmin,68px)] rounded-full flex items-center justify-center shadow-lg transition-transform ${textInput.trim() ? "bg-[#27ae60] hover:scale-105 active:scale-95" : "bg-[#ccc] cursor-not-allowed"}`} disabled={!textInput.trim()}>
                <Send className="w-[clamp(18px,4vmin,30px)] h-[clamp(18px,4vmin,30px)] text-white" strokeWidth={2.5} />
              </button>
              <span className="text-[#919191] text-[clamp(10px,1.5vmin,15px)] mt-1.5" style={{ fontFamily: "'Luckiest Guy', cursive" }}>ENVIAR</span>
            </div>
          </div>
        </div>
      )}

      {viewState === "selectStyle" && (
        <div className="px-4 sm:px-5 lg:px-8 py-5 sm:py-6 lg:py-8">
          {/* Show what user said */}
          <div className="bg-white/60 rounded-[10px] px-3 py-2 mb-3 sm:mb-4">
            <p className="text-[#666] text-[clamp(10px,1.3vmin,13px)] font-['Inter',sans-serif] mb-0.5">Você perguntou:</p>
            <p className="text-[#1e1e1e] text-[clamp(12px,1.6vmin,16px)] font-['Inter',sans-serif] leading-[1.3] line-clamp-2">"{transcription}"</p>
          </div>

          <p className="text-[#1e1e1e] text-center text-[clamp(15px,2.5vmin,26px)] mb-0.5" style={{ fontFamily: "'Luckiest Guy', cursive" }}>COMO QUER QUE EU RESPONDA?</p>
          <p className="text-[#919191] text-center text-[clamp(10px,1.5vmin,16px)] mb-4 sm:mb-5" style={{ fontFamily: "'Luckiest Guy', cursive" }}>ESCOLHA O ESTILO DO TUTOR</p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-[500px] mx-auto">
            {styleOptions.map((style) => {
              const Icon = style.icon;
              return (
                <button key={style.id} onClick={() => handleSelectStyle(style.id)}
                  className="flex flex-col items-center gap-1 sm:gap-1.5 py-3 sm:py-4 lg:py-5 px-2 sm:px-3 rounded-[14px] sm:rounded-[18px] shadow-[2px_3px_6px_rgba(0,0,0,0.3)] cursor-pointer hover:scale-[1.03] active:scale-95 transition-transform"
                  style={{ backgroundColor: style.color }}>
                  <Icon className="w-[clamp(18px,4vmin,36px)] h-[clamp(18px,4vmin,36px)] text-white" strokeWidth={2} />
                  <span className="text-white text-[clamp(11px,2vmin,18px)] leading-[1.2] text-center" style={{ fontFamily: "'Luckiest Guy', cursive" }}>{style.label}</span>
                  <span className="text-white/70 text-[clamp(9px,1.3vmin,14px)] text-center font-['Inter',sans-serif]">{style.description}</span>
                </button>
              );
            })}
          </div>
          <button onClick={cancelRecording} className="mt-3 sm:mt-4 w-full text-center">
            <span className="text-[#919191] text-[clamp(10px,1.5vmin,15px)] underline" style={{ fontFamily: "'Luckiest Guy', cursive" }}>CANCELAR</span>
          </button>
        </div>
      )}



      {viewState === "processing" && (
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <p className="text-[#919191] text-center text-[clamp(12px,2vmin,20px)] mb-3 sm:mb-4" style={{ fontFamily: "'Luckiest Guy', cursive" }}>EM PROGRESSO...</p>
          <div className="flex items-center gap-3 sm:gap-4 justify-center">
            <div className="w-[clamp(32px,6vmin,56px)] h-[clamp(32px,6vmin,56px)] flex-shrink-0 animate-spin">
              <svg viewBox="0 0 50 50" className="w-full h-full"><circle cx="25" cy="25" r="20" fill="none" stroke="#af0100" strokeWidth="5" strokeDasharray="80 40" strokeLinecap="round" /></svg>
            </div>
            <p className="text-[#1e1e1e] text-[clamp(14px,2.2vmin,24px)] leading-[1.3]" style={{ fontFamily: "'Luckiest Guy', cursive" }}>{processingText}</p>
          </div>
        </div>
      )}

      {viewState === "response" && (
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 flex flex-col">
          {/* Chat history with bubbles */}
          <div ref={chatScrollRef} className="max-h-[28vh] lg:max-h-[38vh] overflow-y-auto mb-3 sm:mb-4 space-y-2.5 scroll-smooth">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2.5 rounded-[14px] shadow-sm ${
                    msg.role === "user"
                      ? "bg-[#2980b9] text-white rounded-br-[4px]"
                      : "bg-white text-[#1e1e1e] rounded-bl-[4px]"
                  }`}
                >
                  {msg.role === "tutor" && (
                    <p className="text-[#af0100] text-[10px] sm:text-[11px] font-['Inter',sans-serif] mb-0.5 opacity-70">
                      {(tutorNames[tutor] || "TUTOR").split("\n")[0]}
                    </p>
                  )}
                  <p className={`text-[clamp(12px,1.6vmin,15px)] leading-[1.4] font-['Inter',sans-serif] ${msg.role === "user" ? "text-white" : "text-[#1e1e1e]"}`}>
                    {msg.text}
                  </p>
                  {/* Play button for tutor messages */}
                  {msg.role === "tutor" && idx === chatHistory.length - 1 && (
                    <button
                      onClick={toggleSpeech}
                      className="mt-1.5 flex items-center gap-1 text-[10px] sm:text-[11px] text-[#2980b9] font-['Inter',sans-serif] hover:underline"
                    >
                      {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      {isSpeaking ? "parar" : "ouvir"}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {/* Processing indicator for follow-up */}
            {isFollowUpProcessing && (
              <div className="flex justify-start">
                <div className="bg-white text-[#919191] px-3 py-2.5 rounded-[14px] rounded-bl-[4px] shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#af0100] animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-[#af0100] animate-pulse [animation-delay:200ms]" />
                    <div className="w-2 h-2 rounded-full bg-[#af0100] animate-pulse [animation-delay:400ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TTS error warning */}
          {ttsError && (
            <p className="text-[#e74c3c] text-center text-[10px] font-['Inter',sans-serif] mb-2 px-2">
              {ttsError} (usando voz do navegador)
            </p>
          )}

          {/* Follow-up input with mic button */}
          {isVoiceFollowUp ? (
            <div className="mb-2.5 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-[12px] border-2 border-[#e74c3c]/40 bg-white">
                <div className="w-2.5 h-2.5 rounded-full bg-[#e74c3c] animate-pulse" />
                <span className="text-[#1e1e1e] text-[clamp(13px,1.7vmin,16px)] font-['Inter',sans-serif] flex-1 truncate">
                  {followUpInput || "Ouvindo..."}
                </span>
                <span className="text-[#919191] text-[11px] font-['Inter',sans-serif]">
                  {formatTime(voiceFollowUpTime)}
                </span>
              </div>
              <button
                onClick={stopVoiceFollowUp}
                className="w-9 h-9 rounded-full bg-[#27ae60] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <div className="relative mb-2.5 flex items-center gap-1.5">
              <div className="relative flex-1">
                <input
                  ref={followUpInputRef}
                  type="text"
                  value={followUpInput}
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendFollowUp(); }}
                  placeholder="Continue a conversa..."
                  disabled={isFollowUpProcessing}
                  className="w-full px-3.5 py-2.5 sm:py-3 pr-11 rounded-[12px] border-2 border-[#2980b9]/25 bg-white font-['Inter',sans-serif] text-[clamp(13px,1.7vmin,16px)] text-[#1e1e1e] placeholder:text-[#b3b3b3] outline-none focus:border-[#2980b9] focus:ring-2 focus:ring-[#2980b9]/15 transition-all disabled:opacity-50"
                />
                {followUpInput.trim() && !isFollowUpProcessing && (
                  <button
                    onClick={sendFollowUp}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#27ae60] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
              </div>
              {/* Mic button for voice follow-up */}
              <button
                onClick={startVoiceFollowUp}
                disabled={isFollowUpProcessing}
                className="w-9 h-9 flex-shrink-0 rounded-full bg-[#af0100] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow disabled:opacity-50"
              >
                <Mic className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-2 flex-shrink-0">
            <button onClick={toggleSpeech} className="flex items-center gap-1 bg-[#2980b9] rounded-full px-3 py-1.5 shadow active:scale-95 hover:scale-105 transition-transform">
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-white" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
              <span className="text-white text-[clamp(10px,1.3vmin,13px)]" style={{ fontFamily: "'Luckiest Guy', cursive" }}>{isSpeaking ? "PARAR" : "OUVIR"}</span>
            </button>
            <button onClick={resetToIdle} className="flex items-center gap-1 bg-[#e67e22] rounded-full px-3 py-1.5 shadow active:scale-95 hover:scale-105 transition-transform">
              <RotateCcw className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-[clamp(10px,1.3vmin,13px)]" style={{ fontFamily: "'Luckiest Guy', cursive" }}>NOVA CONVERSA</span>
            </button>
          </div>
        </div>
      )}
    </>
  );

  /* ======== MAIN LAYOUT ======== */
  return (
    <div className="relative w-full h-full bg-[#ab4d4d] flex flex-col lg:flex-row overflow-hidden">
      {/* ===== BEAR COLUMN ===== */}
      <div className="flex-1 flex flex-col min-h-0 lg:min-h-full relative">
        {/* Header */}
        <div className="flex-shrink-0 relative z-10 px-3 sm:px-5 lg:px-6 pt-[max(env(safe-area-inset-top,0px),8px)]">
          <div className="flex items-center pt-4 sm:pt-6 lg:pt-5 gap-2">
            <button onClick={onMenuOpen} className="bg-[#d9d9d9] w-[clamp(36px,7vw,56px)] h-[clamp(38px,7.5vw,58px)] lg:w-[52px] lg:h-[54px] rounded-[clamp(12px,2vw,20px)] flex items-center justify-center hover:bg-[#ccc] active:bg-[#bbb] transition-colors flex-shrink-0">
              <Menu className="w-[clamp(16px,3.5vw,24px)] h-[clamp(16px,3.5vw,24px)] lg:w-[22px] lg:h-[22px] text-[#1E1E1E]" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-white text-center text-[clamp(16px,4.5vw,28px)] lg:text-[clamp(22px,2vw,36px)] leading-[1.05] whitespace-pre-line" style={{ fontFamily: "'Luckiest Guy', cursive", textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
                {title}
              </p>
            </div>
          </div>
        </div>

        {/* 3D Character */}
        <div className="flex-1 flex items-center justify-center overflow-hidden relative min-h-0">
          <div className="w-full h-full max-w-[600px] lg:max-w-[700px]">
            <TutorCharacter3D
              state={characterState}
              micVolume={micVolume}
            />
          </div>
        </div>
      </div>

      {/* ===== INTERACTION PANEL ===== */}
      <div className="flex-shrink-0 lg:w-[42%] xl:w-[40%] 2xl:w-[38%] lg:flex lg:items-center relative z-20">
        <div className="bg-[#d9d9d9] w-full rounded-t-[clamp(24px,5vw,40px)] lg:rounded-[clamp(18px,1.5vw,28px)] lg:m-4 xl:m-5 lg:shadow-2xl overflow-hidden max-h-[55vh] lg:max-h-[92vh] overflow-y-auto">
          {renderPanel()}
        </div>
      </div>
    </div>
  );
}