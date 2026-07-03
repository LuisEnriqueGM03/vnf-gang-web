import { MapPin, Maximize, X } from 'lucide-react';

interface CyberpunkContextProps {
    x: number;
    y: number;
    onClose: () => void;
    onCreatePoint: () => void;
    onCreateZone: () => void;
    onCreateCircleZone: () => void;
}

const CyberpunkContextMenu = ({ x, y, onClose, onCreatePoint, onCreateZone, onCreateCircleZone }: CyberpunkContextProps) => {
    return (
        <div
            className="fixed z-[11000] flex gap-4 pointer-events-none"
            style={{ left: '50%', bottom: '32px', transform: 'translateX(-50%)' }}
        >
            {/* Create Point Button */}
            <button
                onClick={onCreatePoint}
                className="group relative pointer-events-auto"
            >
                <div className="absolute -top-6 left-0 text-[10px] text-[#FFD700] font-['Share_Tech_Mono'] opacity-0 group-hover:opacity-100 transition-opacity">
                    [CMD.01]
                </div>
                <div className="bg-black/90 border border-[#FFD700] px-8 py-4 rounded shadow-[0_0_15px_rgba(255,215,0,0.3)] group-hover:bg-[#FFD700]/10 transition-all duration-300">
                    <span className="text-[#FFD700] font-['Orbitron'] font-bold tracking-widest text-sm whitespace-nowrap">
                        CREAR PUNTO
                    </span>
                    <div className="flex gap-1 justify-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-1 h-1 rounded-full bg-[#FFD700]" />
                        <div className="w-1 h-1 rounded-full bg-[#FFD700]" />
                        <div className="w-1 h-1 rounded-full bg-[#FFD700]" />
                    </div>
                </div>
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#FFD700]" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#FFD700]" />
            </button>

            {/* Create Polygon Zone */}
            <button
                onClick={onCreateZone}
                className="group relative pointer-events-auto"
            >
                <div className="absolute -top-6 left-0 text-[10px] text-[#a855f7] font-['Share_Tech_Mono'] opacity-0 group-hover:opacity-100 transition-opacity">
                    [CMD.02]
                </div>
                <div className="bg-black/90 border border-[#a855f7] px-6 py-4 rounded shadow-[0_0_15px_rgba(168,85,247,0.3)] group-hover:bg-[#a855f7]/10 transition-all duration-300">
                    <span className="text-[#a855f7] font-['Orbitron'] font-bold tracking-widest text-xs whitespace-nowrap">
                        ZONA (POLÍGONO)
                    </span>
                    <div className="flex gap-1 justify-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-1 h-1 rounded-full bg-[#a855f7]" />
                        <div className="w-1 h-1 rounded-full bg-[#a855f7]" />
                        <div className="w-1 h-1 rounded-full bg-[#a855f7]" />
                    </div>
                </div>
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#a855f7]" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#a855f7]" />
            </button>

            {/* Create Circle Zone */}
            <button
                onClick={onCreateCircleZone}
                className="group relative pointer-events-auto"
            >
                <div className="absolute -top-6 left-0 text-[10px] text-[#22d3ee] font-['Share_Tech_Mono'] opacity-0 group-hover:opacity-100 transition-opacity">
                    [CMD.03]
                </div>
                <div className="bg-black/90 border border-[#22d3ee] px-6 py-4 rounded shadow-[0_0_15px_rgba(34,211,238,0.3)] group-hover:bg-[#22d3ee]/10 transition-all duration-300">
                    <span className="text-[#22d3ee] font-['Orbitron'] font-bold tracking-widest text-xs whitespace-nowrap">
                        ZONA (CÍRCULO)
                    </span>
                    <div className="flex gap-1 justify-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-1 h-1 rounded-full bg-[#22d3ee]" />
                        <div className="w-1 h-1 rounded-full bg-[#22d3ee]" />
                        <div className="w-1 h-1 rounded-full bg-[#22d3ee]" />
                    </div>
                </div>
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#22d3ee]" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#22d3ee]" />
            </button>

            {/* Cancel Button */}
            <button
                onClick={onClose}
                className="group relative pointer-events-auto"
            >
                <div className="absolute -top-6 left-0 text-[10px] text-[#ef4444] font-['Share_Tech_Mono'] opacity-0 group-hover:opacity-100 transition-opacity">
                    [CMD.ESC]
                </div>
                <div className="bg-black/90 border border-[#ef4444] px-8 py-4 rounded shadow-[0_0_15px_rgba(239,68,68,0.3)] group-hover:bg-[#ef4444]/10 transition-all duration-300">
                    <span className="text-[#ef4444] font-['Orbitron'] font-bold tracking-widest text-sm whitespace-nowrap">
                        CANCELAR
                    </span>
                    <div className="flex gap-1 justify-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-1 h-1 rounded-full bg-[#ef4444]" />
                        <div className="w-1 h-1 rounded-full bg-[#ef4444]" />
                        <div className="w-1 h-1 rounded-full bg-[#ef4444]" />
                    </div>
                </div>
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#ef4444]" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#ef4444]" />
            </button>

        </div>
    );
};

export default CyberpunkContextMenu;
