import { useEffect } from "react";
import { motion } from "motion/react";
import imgMapleBear1 from "figma:asset/6c3426f11b33df20ca0ee5541adeebb2cfe1674d.png";

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="relative w-full h-full bg-white flex items-center justify-center overflow-hidden">
      {/* Glow effect */}
      <div className="absolute w-[50vmin] h-[50vmin] max-w-[400px] max-h-[400px]">
        <div className="absolute inset-[-50%]">
          <svg className="block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 417 417">
            <g filter="url(#filter_splash)">
              <circle cx="208.5" cy="208.5" fill="#8A8A8A" r="108.5" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="417" id="filter_splash" width="417" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur" stdDeviation="50" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>

      {/* Logo */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="relative w-[35vmin] h-[35vmin] max-w-[300px] max-h-[300px] min-w-[140px] min-h-[140px]">
          <div
            className="absolute bg-white"
            style={{ width: "31.25%", height: "26.25%", left: "34.2%", top: "43.8%" }}
          />
          <img
            alt="Maple Bear Logo"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            src={imgMapleBear1}
          />
        </div>
        <p
          className="text-[#ab4d4d] text-[clamp(11px,2vmin,20px)] mt-[2vmin] tracking-[0.3em] opacity-60"
          style={{ fontFamily: "'Luckiest Guy', cursive" }}
        >
          EDUCACIONAL
        </p>
      </motion.div>
    </div>
  );
}
