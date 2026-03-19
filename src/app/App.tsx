import { MainScreen } from "./components/MainScreen";
import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SplashScreen } from "./components/SplashScreen";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { LoginScreen } from "./components/LoginScreen";
import { SelectTutorScreen } from "./components/SelectTutorScreen";

type Screen = "splash" | "onboarding" | "login" | "selectTutor" | "main";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [selectedTutor, setSelectedTutor] = useState("ingles");
  const [menuOpen, setMenuOpen] = useState(false);

  const goToOnboarding = useCallback(() => setCurrentScreen("onboarding"), []);
  const goToLogin = useCallback(() => setCurrentScreen("login"), []);
  const goToSelectTutor = useCallback(() => setCurrentScreen("selectTutor"), []);
  const goToMain = useCallback((tutor: string) => {
    setSelectedTutor(tutor);
    setCurrentScreen("main");
  }, []);

  const handleMenuOpen = useCallback(() => setMenuOpen(true), []);

  return (
    <div className="w-full min-h-dvh h-dvh relative overflow-hidden bg-[#ab4d4d]">
      <AnimatePresence mode="wait">
        {currentScreen === "splash" && (
          <motion.div
            key="splash"
            className="absolute inset-0"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SplashScreen onFinish={goToOnboarding} />
          </motion.div>
        )}

        {currentScreen === "onboarding" && (
          <motion.div
            key="onboarding"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <OnboardingScreen onFinish={goToLogin} />
          </motion.div>
        )}

        {currentScreen === "login" && (
          <motion.div
            key="login"
            className="absolute inset-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <LoginScreen onLogin={goToSelectTutor} />
          </motion.div>
        )}

        {currentScreen === "selectTutor" && (
          <motion.div
            key="selectTutor"
            className="absolute inset-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <SelectTutorScreen onSelect={goToMain} />
          </motion.div>
        )}

        {currentScreen === "main" && (
          <motion.div
            key="main"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <MainScreen
              tutor={selectedTutor}
              onMenuOpen={handleMenuOpen}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black z-40"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-[280px] sm:w-[320px] lg:w-[360px] bg-white z-50 rounded-r-[20px] flex flex-col shadow-2xl"
            >
              <div className="flex-1 p-6 sm:p-8 lg:p-10 pt-14 sm:pt-16">
                <h2
                  className="text-[22px] sm:text-[26px] lg:text-[30px] text-[#ab4d4d] mb-8 sm:mb-10"
                  style={{ fontFamily: "'Luckiest Guy', cursive" }}
                >
                  Menu
                </h2>

                <div className="flex flex-col gap-3 sm:gap-4">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setCurrentScreen("selectTutor");
                    }}
                    className="text-left px-4 sm:px-5 py-3 sm:py-4 rounded-[12px] bg-[#f5f0f0] text-[#1e1e1e] font-['Inter',sans-serif] text-[15px] sm:text-[17px] lg:text-[18px] hover:bg-[#e8e0e0] active:bg-[#ddd5d5] transition-colors"
                  >
                    Trocar Tutor
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setCurrentScreen("login");
                    }}
                    className="text-left px-4 sm:px-5 py-3 sm:py-4 rounded-[12px] bg-[#f5f0f0] text-[#1e1e1e] font-['Inter',sans-serif] text-[15px] sm:text-[17px] lg:text-[18px] hover:bg-[#e8e0e0] active:bg-[#ddd5d5] transition-colors"
                  >
                    Sair
                  </button>
                </div>
              </div>

              <button
                onClick={() => setMenuOpen(false)}
                className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center text-[#919191] text-[22px] hover:text-[#666] transition-colors rounded-full hover:bg-black/5"
              >
                ✕
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}