import { useEffect, useState } from 'react';

interface MapWarningPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const MapWarningPopup = ({ isOpen, onClose }: MapWarningPopupProps) => {
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setShouldRender(false), 300); // 300ms animation
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!shouldRender) return null;

    return (
        <div className={`fixed inset-0 z-[11000] flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop with CRT scanline effect */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                onClick={onClose}
            >
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(255, 215, 0, 0.02), rgba(0, 0, 255, 0.06))',
                        backgroundSize: '100% 2px, 3px 100%'
                    }}
                />
            </div>

            {/* Terminal Window */}
            <div className={`relative bg-black border-2 border-[#FFD700] w-full max-w-lg shadow-[0_0_50px_rgba(255,215,0,0.15)] transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

                {/* Terminal Header */}
                <div className="flex justify-between items-center px-4 py-2 border-b border-[#FFD700] bg-[#FFD700]/10">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#FFD700] animate-pulse" />
                        <div className="w-3 h-3 rounded-full bg-[#FFD700]/50" />
                        <div className="w-3 h-3 rounded-full bg-[#FFD700]/30" />
                    </div>
                    <span className="font-['Share_Tech_Mono'] text-[#FFD700] text-xs tracking-widest uppercase">SYSTEM_ALERT_V4.0.2</span>
                </div>

                <div className="p-8 flex flex-col items-center">

                    {/* Alert Icon */}
                    <div className="mb-6 relative">
                        <div className="w-20 h-20 rounded-full border-2 border-[#FFD700] flex items-center justify-center animate-[spin_10s_linear_infinite]">
                            <div className="w-16 h-16 rounded-full border border-[#FFD700]/50 border-dashed" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-10 h-10 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold text-center text-white mb-6 font-['Orbitron'] tracking-widest text-shadow-neon">
                        [ ATENCIÓN ]
                    </h2>

                    {/* Message */}
                    <div className="font-['Share_Tech_Mono'] text-[#FFD700] text-center space-y-2 mb-8 text-sm">
                        <p className="typing-effect">&gt; Si el mapa no carga correctamente, por favor</p>
                        <p className="typing-effect delay-500">&gt; intenta <span className="bg-[#FFD700] text-black px-1 font-bold">recargar la página</span>.</p>
                        <div className="h-1 w-12 bg-[#FFD700] mx-auto mt-4 animate-pulse" />
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-[#FFD700] text-black font-bold text-lg hover:bg-[#B8860B] transition-all duration-200 font-['Rajdhani'] uppercase tracking-[0.2em] relative overflow-hidden group"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            Entendido
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                </div>

                {/* Terminal Footer */}
                <div className="px-4 py-2 border-t border-[#FFD700] bg-black flex justify-between text-[10px] font-['Share_Tech_Mono'] text-[#FFD700]/60">
                    <span>PACKET_STATUS:100%</span>
                    <span>LAT:22MS</span>
                    <span>ENC:AES-256</span>
                </div>

                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[#FFD700] -translate-x-1 -translate-y-1" />
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[#FFD700] translate-x-1 -translate-y-1" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[#FFD700] -translate-x-1 translate-y-1" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[#FFD700] translate-x-1 translate-y-1" />
            </div>
        </div>
    );
};

export default MapWarningPopup;
