import { useState } from "react";
import imgMapleBear1 from "figma:asset/6c3426f11b33df20ca0ee5541adeebb2cfe1674d.png";

export interface StudentInfo {
  numero: string;
  nome: string;
  anoEstudo: string;
  escola: string;
  cidade: string;
  estado: string;
}

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!username.trim() || !password.trim()) {
      setError("Preencha todos os campos");
      return;
    }
    setError("");
    onLogin();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="relative w-full h-full bg-[#ab4d4d] overflow-auto">
      <div className="min-h-full flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-10 xl:gap-16 px-5 sm:px-8 lg:px-12 xl:px-20 py-8 sm:py-10">
        {/* Logo */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative w-[clamp(100px,25vmin,280px)] h-[clamp(100px,25vmin,280px)] lg:w-[clamp(160px,22vw,340px)] lg:h-[clamp(160px,22vw,340px)]">
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
            className="hidden lg:block text-white/80 text-[clamp(14px,1.3vw,22px)] mt-3 text-center"
            style={{ fontFamily: "'Luckiest Guy', cursive" }}
          >
            Aprenda com os maiores genios!
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-[14px] lg:rounded-[20px] p-5 sm:p-6 lg:p-8 w-full max-w-[380px] lg:max-w-[440px] flex flex-col gap-4 sm:gap-5 border border-[#d9d9d9] shadow-xl">
          <h2
            className="hidden lg:block text-[#ab4d4d] text-[clamp(20px,1.8vw,30px)] text-center mb-1"
            style={{ fontFamily: "'Luckiest Guy', cursive" }}
          >
            Bem-vindo!
          </h2>

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="font-['Inter',sans-serif] text-[14px] sm:text-[15px] text-[#1e1e1e]">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite seu usuario"
              className="w-full px-3.5 py-2.5 sm:py-3 rounded-[8px] border border-[#d9d9d9] bg-white font-['Inter',sans-serif] text-[14px] sm:text-[15px] text-[#1e1e1e] placeholder:text-[#b3b3b3] outline-none focus:border-[#a80000] focus:ring-2 focus:ring-[#a80000]/20 transition-all"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="font-['Inter',sans-serif] text-[14px] sm:text-[15px] text-[#1e1e1e]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua senha"
              className="w-full px-3.5 py-2.5 sm:py-3 rounded-[8px] border border-[#d9d9d9] bg-white font-['Inter',sans-serif] text-[14px] sm:text-[15px] text-[#1e1e1e] placeholder:text-[#b3b3b3] outline-none focus:border-[#a80000] focus:ring-2 focus:ring-[#a80000]/20 transition-all"
            />
          </div>

          {error && (
            <p className="text-red-600 text-[13px] font-['Inter',sans-serif] -mt-2">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-[#a80000] text-[#f5f5f5] py-2.5 sm:py-3 rounded-[8px] border border-[#2c2c2c] font-['Inter',sans-serif] text-[14px] sm:text-[16px] hover:bg-[#8a0000] active:scale-[0.98] transition-all cursor-pointer"
          >
            Log In
          </button>

          <button className="text-left font-['Inter',sans-serif] text-[13px] sm:text-[14px] text-[#1e1e1e] underline hover:text-[#a80000] transition-colors">
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
}
