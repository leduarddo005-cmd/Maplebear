import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface OnboardingScreenProps {
  onFinish: () => void;
}

const slides = [
  {
    text: "Ja pensou em tirar suas duvidas diretamente com os maiores genios da historia?",
    image: "https://images.unsplash.com/photo-1716324339623-384495f47373?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMHJlYWRpbmclMjBib29rcyUyMGVkdWNhdGlvbiUyMGNvbG9yZnVsfGVufDF8fHx8MTc3MjY0NjIzMXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    text: "Quer entender a matematica com Fibonacci ou explorar a natureza com Humboldt? Nossos tutores estao prontos para conversar e ensinar tudo o que sabem.",
    image: "https://images.unsplash.com/photo-1736197918644-aad3987fe436?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWQlMjBzdHVkeWluZyUyMG1hdGhlbWF0aWNzJTIwbmF0dXJlJTIwZXhwbG9yYXRpb258ZW58MXx8fHwxNzcyNjQ2MjI4fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    text: "Aqui nao existe pergunta boba. Use sua voz para bater um papo, descobrir curiosidades incriveis e se tornar um mestre em qualquer assunto!",
    image: "https://images.unsplash.com/flagged/photo-1568777567165-aaaa23be84a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGNoaWxkJTIwc3BlYWtpbmclMjBtaWNyb3Bob25lJTIwdm9pY2UlMjBsZWFybmluZ3xlbnwxfHx8fDE3NzI2NDYyMjl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

export function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onFinish();
    }
  };

  const isLast = currentSlide === slides.length - 1;

  return (
    <div className="relative w-full h-full bg-[#ab4d4d] flex flex-col overflow-hidden">

      {/* ========== MAIN CONTENT ========== */}
      {/* Mobile: vertical stack | Desktop: horizontal side by side */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch min-h-0 overflow-hidden">

        {/* IMAGE COLUMN */}
        <div className="h-[42vh] sm:h-[45vh] lg:h-auto lg:flex-1 flex-shrink-0 flex items-center justify-center p-4 sm:p-5 lg:p-6 xl:p-8 pt-6 sm:pt-8 lg:pt-6">
          <div className="relative w-full h-full max-w-[520px] lg:max-w-[700px] rounded-[18px] sm:rounded-[24px] lg:rounded-[32px] overflow-hidden bg-[#c49090]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <ImageWithFallback
                  alt="Onboarding"
                  className="absolute inset-0 w-full h-full object-cover"
                  src={slides[currentSlide].image}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* TEXT COLUMN */}
        <div className="flex-1 flex items-center justify-center lg:justify-start px-6 sm:px-8 lg:px-6 xl:px-10 py-2 sm:py-3 lg:py-6 min-h-0">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-white text-center lg:text-left text-[clamp(16px,4vw,20px)] sm:text-[clamp(18px,3.2vw,24px)] lg:text-[clamp(22px,2vw,36px)] leading-[1.3] max-w-[460px] lg:max-w-[520px]"
              style={{
                fontFamily: "'Luckiest Guy', cursive",
                textShadow: "2px 2px 5px rgba(0,0,0,0.35)",
              }}
            >
              {slides[currentSlide].text}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* ========== BOTTOM BAR: Dots + Button ========== */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-5 lg:px-6 xl:px-8 pb-5 sm:pb-6 lg:pb-8 pt-2">
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-[10px] sm:h-[12px] rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? "w-[26px] sm:w-[32px] bg-[#6d3232]"
                  : "w-[10px] sm:w-[12px] bg-white"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className={`w-[46px] h-[46px] sm:w-[54px] sm:h-[54px] lg:w-[60px] lg:h-[60px] rounded-full flex items-center justify-center shadow-[3px_3px_8px_rgba(0,0,0,0.4)] transition-all hover:scale-105 active:scale-95 ${
            isLast ? "bg-[#e7cbcb]" : "bg-white/80"
          }`}
        >
          {isLast ? (
            <Check className="w-5 h-5 sm:w-6 sm:h-6 text-[#1D1B20]" strokeWidth={3} />
          ) : (
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-black" strokeWidth={3} />
          )}
        </button>
      </div>
    </div>
  );
}