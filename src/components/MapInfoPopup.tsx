import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getCategoryColor, getCategoryIcon } from '../utils/mapIcons';

interface MapInfoPopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    notes?: string;
    image?: string;
    type?: string;
    id?: string;
}

/**
 * Popup vertical estilo Cyberpunk responsive.
 * Desktop: Aparece arriba a la derecha SIN oscurecer el fondo del mapa.
 * Mobile: Se adapta responsivamente debajo de los controles del mapa.
 */
const MapInfoPopup = ({ isOpen, onClose, title, notes, image, type, id }: MapInfoPopupProps) => {
    const [isDecrypted, setIsDecrypted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const color = type ? getCategoryColor(type) : '#FFD700';
    const IconComponent = type ? getCategoryIcon(type) : null;

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setIsDecrypted(false);
            const timer = setTimeout(() => setIsDecrypted(true), 800);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed z-[10001] pointer-events-none"
            style={{
                top: isMobile ? '164px' : '100px',
                right: '16px',
                bottom: isMobile ? '20px' : 'auto'
            }}
        >
            {/* Main Card - Vertical layout */}
            <div
                className="pointer-events-auto bg-[#050505] border border-white/10 overflow-hidden shadow-2xl flex flex-col w-[calc(100vw-32px)] md:w-[400px]"
                style={{
                    maxHeight: isMobile ? 'calc(100vh - 164px - 20px)' : 'calc(100vh - 140px)',
                    boxShadow: `0 0 40px ${color}33, 0 0 80px ${color}11`
                }}
            >
                {/* Top Bar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/5 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
                        <span className="font-['Share_Tech_Mono'] text-[11px] tracking-widest text-white/50">
                            TARGET_LOCK
                        </span>
                        {id && (
                            <span className="font-['Share_Tech_Mono'] text-[10px] tracking-widest text-white/30 border-l border-white/10 pl-2 ml-1">
                                ID: {id}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:bg-white/10 p-1 rounded transition-colors text-white/50 hover:text-white"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Image / Visualizer */}
                <div className="relative h-52 bg-black border-b border-white/10 flex-shrink-0 overflow-hidden">
                    {image ? (
                        <>
                            <img
                                src={image}
                                alt={title}
                                className={`w-full h-full object-cover transition-all duration-1000 ${isDecrypted ? 'opacity-100 filter-none' : 'opacity-40 blur-sm grayscale'}`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                            <div className="absolute top-2 left-2 font-['Share_Tech_Mono'] text-[9px] text-white/70 bg-black/60 px-2 py-0.5 border-l-2" style={{ borderColor: color }}>
                                VISUAL_FEED
                            </div>
                            {/* Scan line effect */}
                            <div className={`absolute inset-0 transition-opacity duration-700 ${isDecrypted ? 'opacity-0' : 'opacity-100'}`}
                                style={{
                                    background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)`
                                }}
                            />
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
                            {/* Grid Background */}
                            <div className="absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
                                    backgroundSize: '30px 30px'
                                }}
                            />
                            {/* Icon */}
                            {IconComponent && (
                                <div
                                    className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center animate-[spin_10s_linear_infinite]"
                                    style={{ borderColor: color }}
                                >
                                    <IconComponent size={36} color={color} />
                                </div>
                            )}
                            <span className="mt-3 font-['Share_Tech_Mono'] text-[11px] animate-pulse" style={{ color }}>
                                NO_VISUAL_FEED
                            </span>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1">

                    {/* Category tag - más grande */}
                    {type && (
                        <div className="flex items-center gap-3">
                            <div
                                className="flex items-center gap-2 px-3 py-1.5 border rounded-sm"
                                style={{ borderColor: `${color}60`, backgroundColor: `${color}15` }}
                            >
                                {IconComponent && <IconComponent size={16} color={color} />}
                                <span className="font-['Share_Tech_Mono'] text-xs tracking-widest uppercase font-bold" style={{ color }}>
                                    {type}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Title - más grande */}
                    <h2 className="text-2xl font-bold text-white font-['Orbitron'] leading-tight">
                        {title}
                    </h2>

                    {/* Decrypt progress */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-gray-600 font-['Share_Tech_Mono']">DATA_STREAM</span>
                            <span className="text-[10px] font-['Share_Tech_Mono']" style={{ color }}>
                                {isDecrypted ? 'DECRYPTED' : 'DECRYPTING...'}
                            </span>
                        </div>
                        <div className="h-0.5 bg-white/10 w-full relative overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out"
                                style={{
                                    width: isDecrypted ? '100%' : '20%',
                                    backgroundColor: color,
                                    boxShadow: `0 0 8px ${color}`
                                }}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className={`transition-all duration-500 ${isDecrypted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        <p className="text-gray-400 text-sm leading-relaxed font-['Share_Tech_Mono'] border-l-2 border-white/10 pl-3 py-1">
                            {notes || 'Sin descripción disponible.'}
                        </p>
                    </div>

                </div>

                {/* Status Bar */}
                <div className="px-4 py-1.5 bg-black/50 flex justify-between items-center text-[8px] font-['Share_Tech_Mono'] text-white/25 flex-shrink-0 border-t border-white/5">
                    <div className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />
                        LINK: ACTIVE
                    </div>
                    <div>{new Date().toISOString().split('T')[0]}</div>
                    <div className="text-[#FFD700]">SIG: 98.4%</div>
                </div>

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l pointer-events-none" style={{ borderColor: color }} />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r pointer-events-none" style={{ borderColor: color }} />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l pointer-events-none" style={{ borderColor: color }} />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r pointer-events-none" style={{ borderColor: color }} />
            </div>
        </div>
    );
};

export default MapInfoPopup;
