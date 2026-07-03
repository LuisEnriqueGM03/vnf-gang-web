import React, { useState, useEffect } from 'react';
import { validatePassword, saveAuthentication, isAuthenticated } from '../utils/auth';
import '../style/style.css';

interface PasswordPopupProps {
  onAuthenticated: () => void;
}

const PasswordPopup: React.FC<PasswordPopupProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      onAuthenticated();
    }
  }, [onAuthenticated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePassword(password)) {
      saveAuthentication();
      setError('');
      onAuthenticated();
    } else {
      setError('? CONTRASEÑA INCORRECTA');
      setShake(true);
      setPassword('');
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black overflow-hidden font-mono crt">
      <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black pointer-events-none"></div>
      <div className="absolute inset-0 bg-scanline pointer-events-none opacity-30"></div>

      <div className={`relative w-full max-w-md ${shake ? 'animate-shake' : ''}`}>
        <div className="relative bg-black/90 border border-[#FFD700]/30 overflow-hidden shadow-[0_0_40px_rgba(255,215,0,0.1)]">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#FFD700]"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#FFD700]"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#FFD700]"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#FFD700]"></div>

          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#FFD700]/20 bg-[#FFD700]/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse"></div>
              <span className="font-['Share_Tech_Mono'] text-[11px] tracking-widest text-[#FFD700]/60 uppercase">SECURE_LOGIN</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-[#FFD700]/40"></div>
              <div className="w-3 h-1 bg-[#FFD700]/30"></div>
              <div className="w-1 h-1 bg-[#FFD700]/20"></div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-center mb-6">
              <img
                src="/VNF4.png"
                alt="VNF Logo"
                className="w-full max-w-[220px] h-auto object-contain"
                style={{ filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.4))' }}
              />
            </div>

            <div className="text-center mb-8">
              <h1
                className="text-3xl md:text-4xl font-['Orbitron'] font-bold text-white uppercase tracking-wider glitch mb-2"
                data-text="ACCESO RESTRINGIDO"
              >
                ACCESO RESTRINGIDO
              </h1>
              <p className="text-sm text-gray-500 font-['Share_Tech_Mono'] tracking-wider">
                INGRESA LA CONTRASEÑA PARA CONTINUAR
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <label className="text-[10px] text-gray-600 font-['Share_Tech_Mono'] tracking-widest block mb-2 uppercase">
                  CREDENTIALS_INPUT
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  autoFocus
                  className="w-full bg-transparent border border-[#333] text-white font-['Share_Tech_Mono'] px-4 py-3 focus:border-[#FFD700] focus:shadow-[0_0_10px_rgba(255,215,0,0.1)] outline-none transition-all placeholder-gray-700 text-sm tracking-widest"
                />
              </div>

              {error && (
                <div className="border border-red-500/50 bg-red-500/10 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 animate-pulse"></div>
                    <p className="text-red-400 font-['Share_Tech_Mono'] text-xs tracking-wider">{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="group relative w-full overflow-hidden"
              >
                <div className="absolute inset-0 bg-[#FFD700] opacity-90 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-black"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-black"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-black"></div>
                <span className="relative block w-full py-3 font-['Orbitron'] font-bold text-black text-sm tracking-widest uppercase">
                  ENTRAR
                </span>
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-[10px] font-['Share_Tech_Mono'] text-gray-600">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-pulse"></div>
                  SISTEMA: ACTIVO
                </div>
                <span>VNF // v4.8</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
        .scan-line {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PasswordPopup;
