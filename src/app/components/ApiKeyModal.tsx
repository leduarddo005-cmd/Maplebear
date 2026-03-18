import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Key, Check, ExternalLink, RotateCcw, Brain, Volume2, Webhook } from "lucide-react";
import { getApiKey, setApiKey, clearApiKey } from "./elevenlabs-service";
import { getStoredGeminiKey, setGeminiApiKey, hasCustomGeminiKey } from "./gemini-service";
import {
  getStoredWebhookUrl,
  setWebhookUrl as saveWebhookUrl,
  isWebhookConfigured,
  checkWebhookHealth,
} from "./n8n-service";

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
}

const DEFAULT_ELEVENLABS_KEY = "";

export function ApiKeyModal({ open, onClose }: ApiKeyModalProps) {
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [savedEL, setSavedEL] = useState(false);
  const [savedGemini, setSavedGemini] = useState(false);
  const [isDefaultEL, setIsDefaultEL] = useState(true);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [activeTab, setActiveTab] = useState<"n8n" | "gemini" | "elevenlabs">("n8n");

  // n8n webhook state
  const [webhookUrl, setWebhookUrl] = useState("");
  const [savedWebhook, setSavedWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [webhookLatency, setWebhookLatency] = useState(0);
  const [webhookError, setWebhookError] = useState("");

  useEffect(() => {
    if (open) {
      const storedEL = localStorage.getItem("elevenlabs_api_key");
      setIsDefaultEL(!storedEL);
      setElevenLabsKey(storedEL || "");
      setSavedEL(false);

      const storedGemini = getStoredGeminiKey();
      setGeminiKey(storedGemini);
      setHasGeminiKey(!!storedGemini);
      setSavedGemini(false);

      // n8n
      setWebhookUrl(getStoredWebhookUrl());
      setSavedWebhook(false);
      setWebhookStatus(isWebhookConfigured() ? "ok" : "idle");
      setWebhookError("");
    }
  }, [open]);

  const handleSaveEL = () => {
    setApiKey(elevenLabsKey.trim());
    setIsDefaultEL(false);
    setSavedEL(true);
    setTimeout(() => setSavedEL(false), 2000);
  };

  const handleResetDefaultEL = () => {
    clearApiKey();
    setElevenLabsKey("");
    setIsDefaultEL(true);
    setSavedEL(false);
  };

  const handleSaveGemini = () => {
    setGeminiApiKey(geminiKey.trim());
    setHasGeminiKey(true);
    setSavedGemini(true);
    setTimeout(() => setSavedGemini(false), 2000);
  };

  const handleResetGemini = () => {
    setGeminiApiKey("");
    setGeminiKey("");
    setHasGeminiKey(false);
    setSavedGemini(false);
  };

  const handleSaveWebhook = () => {
    saveWebhookUrl(webhookUrl.trim());
    setSavedWebhook(true);
    setWebhookStatus("ok");
    setTimeout(() => setSavedWebhook(false), 2000);
  };

  const handleResetWebhook = () => {
    saveWebhookUrl("");
    setWebhookUrl("");
    setWebhookStatus("idle");
    setSavedWebhook(false);
    setWebhookError("");
  };

  const handleTestWebhook = async () => {
    setWebhookStatus("testing");
    setWebhookError("");
    const result = await checkWebhookHealth();
    setWebhookLatency(result.latencyMs);
    if (result.ok) {
      setWebhookStatus("ok");
    } else {
      setWebhookStatus("error");
      setWebhookError(result.error || "Falha na conexão");
    }
  };

  const maskedDefault = DEFAULT_ELEVENLABS_KEY.slice(0, 6) + "..." + DEFAULT_ELEVENLABS_KEY.slice(-6);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-[20px] w-full max-w-[440px] p-5 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-[#919191]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-[#ab4d4d]/10 flex items-center justify-center">
                  <Key className="w-6 h-6 text-[#ab4d4d]" />
                </div>
              </div>

              <h3
                className="text-[#1e1e1e] text-center text-[19px] sm:text-[21px] mb-4"
                style={{ fontFamily: "'Luckiest Guy', cursive" }}
              >
                CONFIGURACOES
              </h3>

              {/* Tabs */}
              <div className="flex gap-1 mb-4 bg-[#f0f0f0] rounded-[10px] p-1">
                <button
                  onClick={() => setActiveTab("n8n")}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-[8px] text-[11px] sm:text-[12px] font-['Inter',sans-serif] transition-all ${
                    activeTab === "n8n"
                      ? "bg-white text-[#1e1e1e] shadow-sm"
                      : "text-[#919191] hover:text-[#666]"
                  }`}
                >
                  <Webhook className="w-3.5 h-3.5" />
                  n8n
                  {isWebhookConfigured() && <div className="w-2 h-2 rounded-full bg-[#27ae60]" />}
                </button>
                <button
                  onClick={() => setActiveTab("gemini")}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-[8px] text-[11px] sm:text-[12px] font-['Inter',sans-serif] transition-all ${
                    activeTab === "gemini"
                      ? "bg-white text-[#1e1e1e] shadow-sm"
                      : "text-[#919191] hover:text-[#666]"
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  Gemini
                  {hasGeminiKey && <div className="w-2 h-2 rounded-full bg-[#27ae60]" />}
                </button>
                <button
                  onClick={() => setActiveTab("elevenlabs")}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-[8px] text-[11px] sm:text-[12px] font-['Inter',sans-serif] transition-all ${
                    activeTab === "elevenlabs"
                      ? "bg-white text-[#1e1e1e] shadow-sm"
                      : "text-[#919191] hover:text-[#666]"
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  TTS
                  <div className="w-2 h-2 rounded-full bg-[#27ae60]" />
                </button>
              </div>

              {/* n8n Tab */}
              {activeTab === "n8n" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Status */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      webhookStatus === "ok" ? "bg-[#27ae60] animate-pulse" :
                      webhookStatus === "testing" ? "bg-[#e67e22] animate-pulse" :
                      webhookStatus === "error" ? "bg-[#e74c3c]" :
                      "bg-[#919191]"
                    }`} />
                    <p className={`text-[13px] font-['Inter',sans-serif] ${
                      webhookStatus === "ok" ? "text-[#27ae60]" :
                      webhookStatus === "testing" ? "text-[#e67e22]" :
                      webhookStatus === "error" ? "text-[#e74c3c]" :
                      "text-[#919191]"
                    }`}>
                      {webhookStatus === "ok" ? `Webhook conectado${webhookLatency ? ` (${webhookLatency}ms)` : ""}` :
                       webhookStatus === "testing" ? "Testando conexão..." :
                       webhookStatus === "error" ? `Erro: ${webhookError}` :
                       "Webhook não configurado"}
                    </p>
                  </div>

                  {/* Explanation */}
                  <div className="bg-[#f0f4ff] border border-[#2980b9]/15 rounded-[10px] p-3 mb-4">
                    <p className="text-[#2980b9] text-[12px] font-['Inter',sans-serif] leading-[1.4]">
                      O <strong>n8n</strong> é o cérebro do app. Cole aqui a URL do seu webhook n8n. 
                      Ele recebe a pergunta do aluno e retorna a resposta da IA + áudio. 
                      Se desconectado, o app usa Gemini direto como fallback.
                    </p>
                  </div>

                  {/* Current URL if configured */}
                  {isWebhookConfigured() && (
                    <div className="bg-[#f5f5f5] rounded-[12px] p-3.5 mb-4">
                      <p className="text-[#919191] text-[11px] font-['Inter',sans-serif] mb-1">Webhook ativo:</p>
                      <code className="text-[#1e1e1e] text-[12px] font-mono break-all">
                        {webhookUrl.length > 50 ? webhookUrl.slice(0, 50) + "..." : webhookUrl}
                      </code>
                    </div>
                  )}

                  {/* Input */}
                  <div className="space-y-3 mb-4">
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => { setWebhookUrl(e.target.value); setSavedWebhook(false); setWebhookStatus("idle"); }}
                      placeholder="https://seu-n8n.app/webhook/maplebear-tutor"
                      className="w-full px-4 py-3 rounded-[10px] border border-[#d9d9d9] bg-white font-['Inter',sans-serif] text-[13px] text-[#1e1e1e] placeholder:text-[#b3b3b3] outline-none focus:border-[#2980b9] focus:ring-2 focus:ring-[#2980b9]/20 transition-all"
                    />
                    <div className="flex gap-2">
                      {isWebhookConfigured() && (
                        <button
                          onClick={handleResetWebhook}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] border border-[#d9d9d9] text-[#666] text-[12px] font-['Inter',sans-serif] hover:bg-[#f5f5f5] transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" /> Limpar
                        </button>
                      )}
                      <button
                        onClick={handleSaveWebhook}
                        disabled={!webhookUrl.trim() || !webhookUrl.startsWith("http")}
                        className={`flex-1 py-2 rounded-[8px] font-['Inter',sans-serif] text-[13px] flex items-center justify-center gap-1.5 transition-all ${
                          savedWebhook
                            ? "bg-[#27ae60] text-white"
                            : webhookUrl.trim() && webhookUrl.startsWith("http")
                            ? "bg-[#2980b9] text-white hover:bg-[#2471a3] cursor-pointer"
                            : "bg-[#d9d9d9] text-[#999] cursor-not-allowed"
                        }`}
                      >
                        {savedWebhook ? <><Check className="w-3.5 h-3.5" /> Salvo!</> : "Salvar webhook"}
                      </button>
                    </div>

                    {/* Test button */}
                    {webhookUrl.trim() && webhookUrl.startsWith("http") && (
                      <button
                        onClick={handleTestWebhook}
                        disabled={webhookStatus === "testing"}
                        className="w-full py-2.5 rounded-[8px] border-2 border-dashed border-[#2980b9]/30 text-[#2980b9] text-[13px] font-['Inter',sans-serif] hover:bg-[#2980b9]/5 transition-colors flex items-center justify-center gap-2"
                      >
                        {webhookStatus === "testing" ? (
                          <><div className="w-3.5 h-3.5 border-2 border-[#2980b9] border-t-transparent rounded-full animate-spin" /> Testando...</>
                        ) : (
                          <><Webhook className="w-3.5 h-3.5" /> Testar conexão</>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Expected payload info */}
                  <div className="border-t border-[#eee] pt-3">
                    <details className="group">
                      <summary className="cursor-pointer text-[#919191] text-[11px] font-['Inter',sans-serif] hover:text-[#666] list-none flex items-center gap-1">
                        <span className="group-open:hidden">▶ Formato do payload enviado</span>
                        <span className="hidden group-open:inline">▼ Formato do payload enviado</span>
                      </summary>
                      <pre className="mt-2 bg-[#f8f8f8] rounded-[8px] p-3 text-[10px] font-mono text-[#666] overflow-x-auto leading-[1.5]">
{`POST webhook-url
{
  "message": "pergunta do aluno",
  "tutorKey": "ingles",
  "styleId": "didatico",
  "conversationHistory": [...],
  "timestamp": "ISO string",
  "platform": "ios|android|web"
}

Resposta esperada:
{
  "text": "resposta do tutor",
  "audioUrl": "(opcional) URL do áudio",
  "source": "(opcional) nome do modelo"
}`}
                      </pre>
                    </details>
                  </div>
                </motion.div>
              )}

              {/* Gemini Tab */}
              {activeTab === "gemini" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Status */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className={`w-2.5 h-2.5 rounded-full ${hasGeminiKey ? "bg-[#27ae60] animate-pulse" : "bg-[#e74c3c]"}`} />
                    <p className={`text-[13px] font-['Inter',sans-serif] ${hasGeminiKey ? "text-[#27ae60]" : "text-[#e74c3c]"}`}>
                      {hasGeminiKey ? "Chave personalizada ativa" : "Nenhuma chave configurada"}
                    </p>
                  </div>

                  {/* Warning for default key */}
                  {!hasGeminiKey && (
                    <div className="bg-[#e74c3c]/10 border border-[#e74c3c]/20 rounded-[10px] p-3 mb-4">
                      <p className="text-[#e74c3c] text-[12px] font-['Inter',sans-serif] leading-[1.4]">
                        Configure sua chave Gemini gratuita para usar IA direta (sem n8n).
                        Sem chave, o app depende do webhook n8n ou usa respostas locais pre-definidas.
                      </p>
                    </div>
                  )}

                  {/* Current key info */}
                  {hasGeminiKey && (
                    <div className="bg-[#f5f5f5] rounded-[12px] p-3.5 mb-4">
                      <p className="text-[#919191] text-[11px] font-['Inter',sans-serif] mb-1">Chave ativa:</p>
                      <div className="flex items-center justify-between">
                        <code className="text-[#1e1e1e] text-[13px] font-mono">
                          {geminiKey.slice(0, 8) + "..." + geminiKey.slice(-4)}
                        </code>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-['Inter',sans-serif] bg-[#27ae60]/10 text-[#27ae60]">
                          Personalizada
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <div className="space-y-3 mb-4">
                    <input
                      type="password"
                      value={geminiKey}
                      onChange={(e) => { setGeminiKey(e.target.value); setSavedGemini(false); }}
                      placeholder="AIzaSy..."
                      className="w-full px-4 py-3 rounded-[10px] border border-[#d9d9d9] bg-white font-['Inter',sans-serif] text-[14px] text-[#1e1e1e] placeholder:text-[#b3b3b3] outline-none focus:border-[#2980b9] focus:ring-2 focus:ring-[#2980b9]/20 transition-all"
                    />
                    <div className="flex gap-2">
                      {hasGeminiKey && (
                        <button
                          onClick={handleResetGemini}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] border border-[#d9d9d9] text-[#666] text-[12px] font-['Inter',sans-serif] hover:bg-[#f5f5f5] transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" /> Usar padrao
                        </button>
                      )}
                      <button
                        onClick={handleSaveGemini}
                        disabled={!geminiKey.trim()}
                        className={`flex-1 py-2 rounded-[8px] font-['Inter',sans-serif] text-[13px] flex items-center justify-center gap-1.5 transition-all ${
                          savedGemini
                            ? "bg-[#27ae60] text-white"
                            : geminiKey.trim()
                            ? "bg-[#2980b9] text-white hover:bg-[#2471a3] cursor-pointer"
                            : "bg-[#d9d9d9] text-[#999] cursor-not-allowed"
                        }`}
                      >
                        {savedGemini ? <><Check className="w-3.5 h-3.5" /> Salvo!</> : "Salvar chave Gemini"}
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="border-t border-[#eee] pt-3">
                    <p className="text-[#b3b3b3] text-[11px] font-['Inter',sans-serif] text-center leading-[1.4]">
                      Modelo: <span className="text-[#919191]">gemini-2.0-flash</span>
                      <br />
                      <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#2980b9] hover:underline mt-1"
                      >
                        Criar chave gratuita no Google AI Studio <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ElevenLabs Tab */}
              {activeTab === "elevenlabs" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Status */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27ae60] animate-pulse" />
                    <p className="text-[#27ae60] text-[13px] font-['Inter',sans-serif]">
                      Conectado e funcionando
                    </p>
                  </div>

                  {/* Current key info */}
                  <div className="bg-[#f5f5f5] rounded-[12px] p-3.5 mb-4">
                    <p className="text-[#919191] text-[11px] font-['Inter',sans-serif] mb-1">Chave ativa:</p>
                    <div className="flex items-center justify-between">
                      <code className="text-[#1e1e1e] text-[13px] font-mono">
                        {isDefaultEL ? maskedDefault : elevenLabsKey.slice(0, 6) + "..." + elevenLabsKey.slice(-6)}
                      </code>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-['Inter',sans-serif] ${
                        isDefaultEL ? "bg-[#2980b9]/10 text-[#2980b9]" : "bg-[#27ae60]/10 text-[#27ae60]"
                      }`}>
                        {isDefaultEL ? "Padrao" : "Personalizada"}
                      </span>
                    </div>
                  </div>

                  {/* Replace key section */}
                  <details className="group mb-4">
                    <summary className="cursor-pointer text-[#2980b9] text-[13px] font-['Inter',sans-serif] hover:underline list-none flex items-center gap-1">
                      <span className="group-open:hidden">Usar outra API key</span>
                      <span className="hidden group-open:inline">Substituir API key</span>
                    </summary>
                    <div className="mt-3 space-y-3">
                      <input
                        type="password"
                        value={elevenLabsKey}
                        onChange={(e) => { setElevenLabsKey(e.target.value); setSavedEL(false); }}
                        placeholder="sk_xxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full px-4 py-3 rounded-[10px] border border-[#d9d9d9] bg-white font-['Inter',sans-serif] text-[14px] text-[#1e1e1e] placeholder:text-[#b3b3b3] outline-none focus:border-[#ab4d4d] focus:ring-2 focus:ring-[#ab4d4d]/20 transition-all"
                      />
                      <div className="flex gap-2">
                        {!isDefaultEL && (
                          <button
                            onClick={handleResetDefaultEL}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] border border-[#d9d9d9] text-[#666] text-[12px] font-['Inter',sans-serif] hover:bg-[#f5f5f5] transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" /> Restaurar padrao
                          </button>
                        )}
                        <button
                          onClick={handleSaveEL}
                          disabled={!elevenLabsKey.trim() || elevenLabsKey.trim() === DEFAULT_ELEVENLABS_KEY}
                          className={`flex-1 py-2 rounded-[8px] font-['Inter',sans-serif] text-[13px] flex items-center justify-center gap-1.5 transition-all ${
                            savedEL
                              ? "bg-[#27ae60] text-white"
                              : elevenLabsKey.trim() && elevenLabsKey.trim() !== DEFAULT_ELEVENLABS_KEY
                              ? "bg-[#ab4d4d] text-white hover:bg-[#943e3e] cursor-pointer"
                              : "bg-[#d9d9d9] text-[#999] cursor-not-allowed"
                          }`}
                        >
                          {savedEL ? <><Check className="w-3.5 h-3.5" /> Salvo!</> : "Salvar nova key"}
                        </button>
                      </div>
                    </div>
                  </details>

                  {/* Info */}
                  <div className="border-t border-[#eee] pt-3">
                    <p className="text-[#b3b3b3] text-[11px] font-['Inter',sans-serif] text-center leading-[1.4]">
                      Modelo: <span className="text-[#919191]">eleven_turbo_v2_5</span> | Formato: <span className="text-[#919191]">opus 48kHz</span>
                      <br />
                      <a
                        href="https://elevenlabs.io/app/settings/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#2980b9] hover:underline mt-1"
                      >
                        Gerenciar keys no ElevenLabs <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}