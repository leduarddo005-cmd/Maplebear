import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Key, Check, ExternalLink, RotateCcw, Brain, Volume2 } from "lucide-react";
import { getApiKey, setApiKey, clearApiKey } from "./elevenlabs-service";
import { getStoredGeminiKey, setGeminiApiKey, hasCustomGeminiKey } from "./gemini-service";

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
}

const DEFAULT_ELEVENLABS_KEY = "sk_5fc9349389cf3a2f325653db658fda42982343cc19dfd4e8";

export function ApiKeyModal({ open, onClose }: ApiKeyModalProps) {
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [savedEL, setSavedEL] = useState(false);
  const [savedGemini, setSavedGemini] = useState(false);
  const [isDefaultEL, setIsDefaultEL] = useState(true);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [activeTab, setActiveTab] = useState<"gemini" | "elevenlabs">("gemini");

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
              <div className="flex gap-1.5 mb-4 bg-[#f0f0f0] rounded-[10px] p-1">
                <button
                  onClick={() => setActiveTab("gemini")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[8px] text-[12px] sm:text-[13px] font-['Inter',sans-serif] transition-all ${
                    activeTab === "gemini"
                      ? "bg-white text-[#1e1e1e] shadow-sm"
                      : "text-[#919191] hover:text-[#666]"
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  Gemini AI
                  {hasGeminiKey && <div className="w-2 h-2 rounded-full bg-[#27ae60]" />}
                </button>
                <button
                  onClick={() => setActiveTab("elevenlabs")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[8px] text-[12px] sm:text-[13px] font-['Inter',sans-serif] transition-all ${
                    activeTab === "elevenlabs"
                      ? "bg-white text-[#1e1e1e] shadow-sm"
                      : "text-[#919191] hover:text-[#666]"
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  ElevenLabs
                  <div className="w-2 h-2 rounded-full bg-[#27ae60]" />
                </button>
              </div>

              {/* Gemini Tab */}
              {activeTab === "gemini" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Status */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className={`w-2.5 h-2.5 rounded-full ${hasGeminiKey ? "bg-[#27ae60] animate-pulse" : "bg-[#e67e22] animate-pulse"}`} />
                    <p className={`text-[13px] font-['Inter',sans-serif] ${hasGeminiKey ? "text-[#27ae60]" : "text-[#e67e22]"}`}>
                      {hasGeminiKey ? "Chave personalizada ativa" : "Usando chave padrao (cota limitada)"}
                    </p>
                  </div>

                  {/* Warning for default key */}
                  {!hasGeminiKey && (
                    <div className="bg-[#e67e22]/10 border border-[#e67e22]/20 rounded-[10px] p-3 mb-4">
                      <p className="text-[#e67e22] text-[12px] font-['Inter',sans-serif] leading-[1.4]">
                        A chave padrao do Gemini tem cota limitada e pode estar esgotada. 
                        Configure sua propria chave gratuita para respostas ilimitadas de IA.
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
