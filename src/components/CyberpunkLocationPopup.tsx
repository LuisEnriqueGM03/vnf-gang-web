import { useEffect, useState } from 'react';
import { Share, Navigation, X } from 'lucide-react';
import { getCategoryColor } from '../utils/mapIcons';

interface CyberpunkLocationPopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    notes?: string;
    image?: string;
    type?: string;
}

const CyberpunkLocationPopup = ({ isOpen, onClose, title, notes, image, type }: CyberpunkLocationPopupProps) => {
    const [isDecrypted, setIsDecrypted] = useState(false);
    const color = type ? getCategoryColor(type) : '#FFD700';

    // Efecto de "decryption" al abrir
    useEffect(() => {
        if (isOpen) {
            setIsDecrypted(false);
            const timer = setTimeout(() => setIsDecrypted(true), 800);
            document.body.style.overflow = 'hidden';
            return () => {
                clearTimeout(timer);
                document.body.style.overflow = 'unset';
            };
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000]"
                onClick={onClose}
                style={{ touchAction: 'none' }}
            />

            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-[10001] px-4 md:px-0">
                {/* Main Card */}
                <div
                    className="relative bg-[#050505] border border-white/10 overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
                    style={{ boxShadow: `0 0 40px ${color}33` }}
                >
                    {/* Top Bar */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
                            <span className="font-['Share_Tech_Mono'] text-xs tracking-widest text-white/70">
                                OS_VER_2.0.4 // LOCALHOST
                            </span>
                        </div>
                        <button onClick={onClose} className="hover:bg-white/10 p-1 rounded transition-colors text-white/50 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="p-0 md:flex">
                        {/* Left Column: Image / Visualizer */}
                        <div className="md:w-1/2 relative min-h-[250px] bg-black border-r border-white/10 group">
                            {image ? (
                                <>
                                    <img
                                        src={image}
                                        alt={title}
                                        className={`w-full h-full object-cover transition-all duration-1000 ${isDecrypted ? 'opacity-100 filter-none' : 'opacity-50 blur-sm grayscale'}`}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                                    {/* Overlay UI on Image */}
                                    <div className="absolute top-4 left-4 font-['Share_Tech_Mono'] text-[10px] text-white/80 bg-black/60 px-2 py-1 backdrop-blur-sm border-l-2" style={{ borderColor: color }}>
                                        51.5874° N | 0.1278° W
                                    </div>

                                    {/* Central Target Reticle */}
                                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/20 rounded-full flex items-center justify-center transition-all duration-700 ${isDecrypted ? 'opacity-0 scale-150' : 'opacity-100 scale-100'}`}>
                                        <div className="w-2 h-2 bg-white/50 rounded-full" />
                                        <div className="absolute inset-0 border-t border-b border-white/20 animate-[spin_4s_linear_infinite]" />
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
                                    {/* Grid Background */}
                                    <div className="absolute inset-0 opacity-10"
                                        style={{
                                            backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
                                            backgroundSize: '40px 40px'
                                        }}
                                    />
                                    <div className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center animate-[spin_10s_linear_infinite]" style={{ borderColor: color }}>
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                    </div>
                                    <span className="mt-4 font-['Share_Tech_Mono'] text-xs animate-pulse" style={{ color }}>NO_VISUAL_FEED</span>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Info */}
                        <div className="md:w-1/2 p-6 flex flex-col relative">
                            <div className="flex-1">
                                <div className="mb-1 font-['Share_Tech_Mono'] text-xs tracking-wider" style={{ color: color }}>
                                    TARGET LOCATION
                                </div>
                                <h2 className="text-3xl font-bold text-white font-['Orbitron'] mb-4 leading-none">
                                    {title}
                                </h2>

                                <div className={`space-y-4 transition-all duration-500 ${isDecrypted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                                    <p className="text-gray-400 text-sm leading-relaxed font-['Share_Tech_Mono'] border-l-2 border-white/10 pl-4 py-1">
                                        {notes || "Tactical Sector 7G. Encrypted downlink established. Surveillance active."}
                                    </p>
                                </div>
                            </div>

                            {/* Footer Controls */}
                            <div className="mt-8 pt-4 border-t border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] text-gray-500 font-['Share_Tech_Mono'] uppercase">Data Stream:</span>
                                    <span className="text-[10px] font-['Share_Tech_Mono']" style={{ color }}>
                                        {isDecrypted ? 'DECRYPTED' : 'DECRYPTING...'}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-1 bg-white/10 w-full mb-6 relative overflow-hidden">
                                    <div
                                        className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: isDecrypted ? '100%' : '20%',
                                            backgroundColor: color,
                                            boxShadow: `0 0 10px ${color}`
                                        }}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-['Rajdhani'] font-bold text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border border-white/10">
                                        <Share size={14} /> Share Link
                                    </button>
                                    <button
                                        className="flex-1 py-3 text-black font-['Rajdhani'] font-bold text-sm uppercase tracking-wider transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                                        style={{ backgroundColor: color }}
                                    >
                                        <Navigation size={14} /> GPS Route
                                    </button>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-white/10 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-white/10 pointer-events-none" />
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="px-4 py-1 bg-black/50 backdrop-blur-md flex justify-between items-center text-[9px] font-['Share_Tech_Mono'] text-white/30">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-red-500" /> THREAT: LOW
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} /> LINK: ACTIVE
                            </div>
                        </div>
                        <div>TIMESTAMP: {new Date().toISOString().split('T')[0]}</div>
                        <div className="flex items-center gap-1 text-[#FFD700]">
                            SIG_STRENGTH: 98.4% <div className="flex gap-0.5"><div className="w-0.5 h-1 bg-[#FFD700]" /><div className="w-0.5 h-1.5 bg-[#FFD700]" /><div className="w-0.5 h-2 bg-[#FFD700]" /></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CyberpunkLocationPopup;
