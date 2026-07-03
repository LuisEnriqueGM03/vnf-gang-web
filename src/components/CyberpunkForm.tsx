import { useState } from 'react';
import { X, MapPin, Plus, Trash2 } from 'lucide-react';
import { categoryIcons, getCategoryColor } from '../utils/mapIcons';

interface CyberpunkFormProps {
    initialData: {
        title: string;
        type: string;
        notes: string;
        image: string;
    };
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isZone?: boolean;
    isEditing?: boolean;
    currentLocation?: { lat: number; lng: number };
    initialStrains?: string[];
    initialColor?: string;
}

const CyberpunkForm = ({ initialData, onSubmit, onCancel, isZone = false, isEditing = false, currentLocation, initialStrains, initialColor }: CyberpunkFormProps) => {
    const [formData, setFormData] = useState(initialData);

    // Zone-specific state
    const [zoneColor, setZoneColor] = useState(initialColor || '#6413dd');
    const [strains, setStrains] = useState<string[]>(initialStrains || []);
    const [currentStrain, setCurrentStrain] = useState('');

    // Available categories for points only
    const categories = ['Tienda', 'Misión', 'Puntos', 'Bandas', 'Nuestra Sede', 'Npcs', 'Mesas Crafteo', 'Robos', 'Controlar Zona', 'PDB', 'Zonas'];
    const robosSubcategories = ['Tiendas de ropa', 'Cajeros', 'Chatarrerías', 'Talleres', 'Tumbas', 'Licorerías', 'Badulaques', 'Almacén Pequeño'];
    const isRobosOrSubcategory = (t: string) => t === 'Robos' || robosSubcategories.includes(t);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddStrain = () => {
        if (currentStrain.trim()) {
            setStrains(prev => [...prev, currentStrain.trim()]);
            setCurrentStrain('');
        }
    };

    const handleRemoveStrain = (index: number) => {
        setStrains(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (isZone) {
            onSubmit({
                title: formData.title,
                color: zoneColor,
                strains: strains,
                notes: formData.notes,
            });
        } else {
            onSubmit(formData);
        }
    };

    const currentColor = isZone ? zoneColor : (getCategoryColor(formData.type) || '#FFD700');

    // Preset colors for zones
    const presetColors = [
        '#6413dd', '#ff8800', '#ef4444', '#10b981',
        '#3b82f6', '#f59e0b', '#ec4899', '#FFD700',
        '#a855f7', '#06b6d4', '#84cc16', '#f97316'
    ];

    return (
        <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-black border border-[#FFD700] relative shadow-[0_0_50px_rgba(255,215,0,0.1)]">

                {/* Header System Bar */}
                <div className="flex items-center justify-between p-4 border-b border-[#FFD700]/30 bg-[#FFD700]/5">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#FFD700] animate-pulse" />
                        <span className="text-[#FFD700] font-['Share_Tech_Mono'] text-sm tracking-widest uppercase">
                            SYSTEM :: {isEditing ? (isZone ? 'EDIT_ZONE' : 'EDIT_POINT') : (isZone ? 'CREATE_ZONE_v1.0.4' : 'CREATE_POINT_v1.0.4')}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                            <div className="w-8 h-1 bg-[#FFD700]" />
                            <div className="w-2 h-1 bg-[#FFD700]/50" />
                            <div className="w-1 h-1 bg-[#FFD700]/30" />
                        </div>
                        <button onClick={onCancel} className="text-[#FFD700] hover:text-white transition-colors">
                            <X />
                        </button>
                    </div>
                </div>

                {/* Main Title */}
                <div className="px-8 pt-6 pb-2">
                    <h1 className="text-4xl font-['Orbitron'] font-bold text-white uppercase tracking-wider">
                        {isEditing ? (isZone ? 'EDITAR ZONA' : 'EDITAR PUNTO') : (isZone ? 'CREAR ZONA' : 'CREAR PUNTO')}
                    </h1>
                </div>

                {/* Form Grid */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left Column */}
                    <div className="space-y-6">

                        {/* 01. Identification */}
                        <div>
                            <label className="text-[#FFD700] font-['Share_Tech_Mono'] text-sm mb-2 block">
                                01. {isZone ? 'NOMBRE DE ZONA' : 'IDENTIFICACIÓN'}
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder={isZone ? 'EJ: ZONA UNIVERSIDAD (ROGUE)...' : 'INTRODUCIR_NOMBRE...'}
                                className="w-full bg-transparent border border-[#FFD700]/30 text-white font-['Rajdhani'] p-4 focus:border-[#FFD700] focus:bg-[#FFD700]/5 outline-none transition-all uppercase placeholder-gray-600"
                            />
                        </div>

                        {/* 02. Category (Points only) or Color (Zones) */}
                        {isZone ? (
                            <div>
                                <label className="text-[#FFD700] font-['Share_Tech_Mono'] text-sm mb-2 block">
                                    02. COLOR DEL TERRITORIO
                                </label>
                                {/* Color Presets */}
                                <div className="grid grid-cols-6 gap-2 mb-3">
                                    {presetColors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setZoneColor(color)}
                                            className="w-full aspect-square rounded border-2 transition-all"
                                            style={{
                                                backgroundColor: color,
                                                borderColor: zoneColor === color ? '#FFD700' : 'transparent',
                                                boxShadow: zoneColor === color ? `0 0 8px ${color}` : 'none'
                                            }}
                                        />
                                    ))}
                                </div>
                                {/* Custom Color Input */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={zoneColor}
                                        onChange={(e) => setZoneColor(e.target.value)}
                                        className="w-12 h-10 bg-transparent border border-[#FFD700]/30 cursor-pointer rounded"
                                    />
                                    <input
                                        type="text"
                                        value={zoneColor}
                                        onChange={(e) => setZoneColor(e.target.value)}
                                        placeholder="#6413dd"
                                        className="flex-1 bg-transparent border border-[#FFD700]/30 text-white font-['Share_Tech_Mono'] p-2 focus:border-[#FFD700] outline-none text-sm uppercase"
                                    />
                                    <div
                                        className="w-10 h-10 rounded border border-[#FFD700]/30"
                                        style={{ backgroundColor: zoneColor, opacity: 0.5 }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="text-[#FFD700] font-['Share_Tech_Mono'] text-sm mb-2 block">
                                    02. CATEGORÍA
                                </label>
                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                    {categories.map(cat => {
                                        const isSelected = cat === 'Robos' ? isRobosOrSubcategory(formData.type) : formData.type === cat;
                                        const catColor = getCategoryColor(cat);
                                        const Icon = categoryIcons[cat] || categoryIcons['Default'];

                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => handleChange('type', cat)}
                                                className={`
                                        flex items-center gap-3 p-3 border transition-all text-left group
                                        ${isSelected
                                                        ? `bg-[${catColor}]/20 border-[${catColor}]`
                                                        : 'border-[#333] hover:border-[#666] bg-transparent'
                                                    }
                                    `}
                                                style={{
                                                    borderColor: isSelected ? catColor : undefined,
                                                    backgroundColor: isSelected ? `${catColor}20` : undefined
                                                }}
                                            >
                                                <Icon
                                                    size={18}
                                                    color={isSelected ? catColor : '#666'}
                                                    className="transition-colors group-hover:text-white"
                                                />
                                                <span
                                                    className={`font-['Share_Tech_Mono'] text-xs uppercase ${isSelected ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}
                                                >
                                                    {cat}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Subcategorías cuando se selecciona Robos o una subcategoría */}
                                {isRobosOrSubcategory(formData.type) && (
                                    <div className="mt-4">
                                        <label className="text-[#86efac] font-['Share_Tech_Mono'] text-xs mb-2 block tracking-wider">
                                            02.1 SUBCATEGORÍA DE ROBO
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {robosSubcategories.map(sub => {
                                                const isSubSelected = formData.type === sub;
                                                const SubIcon = categoryIcons[sub] || categoryIcons['Default'];
                                                return (
                                                    <button
                                                        key={sub}
                                                        onClick={() => handleChange('type', sub)}
                                                        className={`flex items-center gap-2 px-3 py-2 border transition-all text-left ${
                                                            isSubSelected
                                                                ? 'border-[#ef4444] bg-[#ef4444]/20 text-white'
                                                                : 'border-[#333] hover:border-[#666] text-gray-400'
                                                        }`}
                                                    >
                                                        <SubIcon size={14} color={isSubSelected ? '#ef4444' : '#666'} />
                                                        <span className="font-['Share_Tech_Mono'] text-[11px] uppercase">{sub}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">

                        {/* 03. Strains (Zones) or Description (Points) */}
                        {isZone ? (
                            <div className="h-full flex flex-col">
                                <label className="text-[#FFD700] font-['Share_Tech_Mono'] text-sm mb-2 block">
                                    03. SEPAS DISPONIBLES
                                </label>
                                {/* Add strain input */}
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={currentStrain}
                                        onChange={(e) => setCurrentStrain(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddStrain()}
                                        placeholder="EJ: LEONARD SYRUP..."
                                        className="flex-1 bg-transparent border border-[#FFD700]/30 text-white font-['Rajdhani'] p-3 focus:border-[#FFD700] focus:bg-[#FFD700]/5 outline-none transition-all uppercase placeholder-gray-600 text-sm"
                                    />
                                    <button
                                        onClick={handleAddStrain}
                                        className="px-3 py-2 bg-[#FFD700]/10 border border-[#FFD700]/50 text-[#FFD700] hover:bg-[#FFD700]/20 transition-all"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                {/* Strains list */}
                                <div className="flex-1 border border-[#FFD700]/20 bg-[#FFD700]/5 p-3 min-h-[120px] max-h-[180px] overflow-y-auto custom-scrollbar">
                                    {strains.length === 0 ? (
                                        <p className="text-gray-600 font-['Share_Tech_Mono'] text-xs text-center mt-4">
                                            NO_STRAINS_ADDED...
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {strains.map((strain, index) => (
                                                <div key={index} className="flex items-center justify-between bg-black/50 border border-[#FFD700]/20 px-3 py-2">
                                                    <span className="text-white font-['Share_Tech_Mono'] text-xs uppercase">{strain}</span>
                                                    <button
                                                        onClick={() => handleRemoveStrain(index)}
                                                        className="text-red-500 hover:text-red-400 transition-colors ml-2"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="text-gray-600 font-['Share_Tech_Mono'] text-[10px] mt-1">
                                    TOTAL: {strains.length} SEPA(S) REGISTRADA(S)
                                </p>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col">
                                <label className="text-[#FFD700] font-['Share_Tech_Mono'] text-sm mb-2 block">
                                    03. DESCRIPCIÓN
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                    placeholder="LOG_DESCRIPTION_DATA..."
                                    className="flex-1 w-full bg-transparent border border-[#FFD700]/30 text-white font-['Rajdhani'] p-4 focus:border-[#FFD700] focus:bg-[#FFD700]/5 outline-none transition-all resize-none placeholder-gray-600 min-h-[150px]"
                                />
                            </div>
                        )}

                    </div>

                    {/* Full Width Bottom Section */}
                    <div className="col-span-1 md:col-span-2 space-y-6">

                        {/* 04. Image URL (Points only) */}
                        {!isZone && (
                            <div>
                                <label className="text-[#FFD700] font-['Share_Tech_Mono'] text-sm mb-2 block">
                                    04. URL_IMAGEN
                                </label>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={(e) => handleChange('image', e.target.value)}
                                        placeholder="PEGAR_LINK_DE_IMAGEN..."
                                        className="flex-1 bg-transparent border border-[#FFD700]/30 text-white font-['Rajdhani'] p-4 focus:border-[#FFD700] focus:bg-[#FFD700]/5 outline-none transition-all placeholder-gray-600"
                                    />
                                    {formData.image && (
                                        <div className="w-16 h-14 border border-[#FFD700]/30 overflow-hidden relative">
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover opacity-50" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Zone preview */}
                        {isZone && (
                            <div className="border border-[#FFD700]/20 bg-black/50 p-4">
                                <label className="text-[#FFD700] font-['Share_Tech_Mono'] text-xs mb-3 block">
                                    04. PREVIEW DEL TERRITORIO
                                </label>
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-16 h-10 rounded border-2"
                                        style={{
                                            backgroundColor: `${zoneColor}59`,
                                            borderColor: zoneColor,
                                            boxShadow: `0 0 10px ${zoneColor}40`
                                        }}
                                    />
                                    <div>
                                        <p className="text-white font-['Orbitron'] text-sm uppercase">{formData.title || 'SIN_NOMBRE'}</p>
                                        <p className="text-gray-500 font-['Share_Tech_Mono'] text-xs">{strains.length} SEPA(S) · COLOR: {zoneColor.toUpperCase()}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Telemetry Footer */}
                        <div className="border border-[#FFD700]/30 bg-[#FFD700]/5 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-[#FFD700] font-['Share_Tech_Mono'] text-xs uppercase">
                                    LIVE_TELEMETRY
                                </div>
                                {currentLocation && (
                                    <div className="text-white font-['Share_Tech_Mono'] text-xs flex gap-4">
                                        <span>LAT: {currentLocation.lat.toFixed(4)}° N</span>
                                        <span>LONG: {currentLocation.lng.toFixed(4)}° W</span>
                                        <span>ALT: 12.4m</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-[#FFD700]/20 p-2 rounded border border-[#FFD700]/50 text-[#FFD700]">
                                    <MapPin size={16} />
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-500 font-['Share_Tech_Mono']">GEO_STAMP: B12-X99</div>
                                    <div className="text-[10px] text-[#FFD700] font-['Share_Tech_Mono']">STATUS: ACTIVE</div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                {/* Action Footer */}
                <div className="p-4 border-t border-[#FFD700]/30 flex justify-between items-center bg-black">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-['Share_Tech_Mono'] pl-4">
                        <div className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse" />
                        AWAITING INSTRUCTION...
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onCancel}
                            className="px-8 py-3 border border-red-500/50 text-red-500 font-['Orbitron'] font-bold tracking-wider hover:bg-red-500/10 transition-colors uppercase text-sm"
                        >
                            CANCELAR
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-3 bg-[#FFD700] text-black font-['Orbitron'] font-bold tracking-wider hover:bg-[#cca300] transition-colors uppercase text-sm shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                        >
                            {isZone ? 'COPIAR JSON' : 'GUARDAR PUNTO'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CyberpunkForm;
