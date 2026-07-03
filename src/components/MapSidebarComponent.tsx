import { useEffect, useState, useMemo } from 'react';
import { List, ArrowLeft, Eye, ChevronDown, ChevronUp, ChevronRight, Plus, Minus } from 'lucide-react';
import '../style/style.css';
import { getCategoryIcon, getCategoryColor } from '../utils/mapIcons';

interface Category {
    name: string;
    icon: string;
    type: string;
    enabled: boolean;
    parent?: string;
}

interface MapSidebarProps {
    searchTerm: string;
    searchResults: any[];
    mapType: string;
    categories: Category[];
    locations: any[]; // Add locations prop
    onSearch: (term: string) => void;
    onSearchResultClick: (id: string) => void;
    onMapTypeChange: (type: string) => void;
    onReload: () => void;
    onToggleCategory: (categoryName: string) => void;
    onLocationSelect: (location: any) => void; // Handler for drill-down selection
    onZoomIn: () => void;
    onZoomOut: () => void;
}

const CategoryIcon = ({ type, className }: { type: string, className?: string }) => {
    const Icon = getCategoryIcon(type);
    const color = getCategoryColor(type);
    return <Icon className={className} style={{ color }} />;
};

const MapSidebar = ({
    searchTerm,
    searchResults,
    mapType,
    categories,
    locations,
    onSearch,
    onSearchResultClick,
    onMapTypeChange,
    onReload,
    onToggleCategory,
    onLocationSelect,
    onZoomIn,
    onZoomOut
}: MapSidebarProps) => {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    const toggleExpanded = (name: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Filter locations for the active category
    const categoryLocations = useMemo(() => {
        if (!activeCategory || !locations) return [];
        return locations.filter(loc => loc.type === activeCategory);
    }, [activeCategory, locations]);

    // Separate categories into parents and children (subcategories)
    const parentCategories = useMemo(() => categories.filter(c => !c.parent), [categories]);
    const subCategories = useMemo(() => categories.filter(c => c.parent), [categories]);
    const getSubcategories = (parentName: string) => subCategories.filter(c => c.parent === parentName);

    // Logic to move the legacy #types container into our new React sidebar
    // REMOVED: We are now rendering categories natively in React
    useEffect(() => {
        // Just hide the legacy container if it exists
        const types = document.getElementById('types');
        if (types) types.style.display = 'none';
    }, []);

    return (
        <>
            {/* Types Panel - Redesigned with Native Icons */}
            <div className={`cyber-sidebar ${isMobile ? 'flex' : 'hidden md:flex'} ${sidebarCollapsed ? 'collapsed' : ''}`}>
                {/* Header */}
                <div 
                    className={`cyber-sidebar-header ${isMobile ? 'active:bg-[#FFD700]/10' : ''}`} 
                    onClick={() => isMobile && setSidebarCollapsed(!sidebarCollapsed)}
                    style={{ 
                        cursor: isMobile ? 'pointer' : 'default',
                        userSelect: 'none',
                        WebkitUserSelect: 'none'
                    }}
                >
                    {/* Mobile indicator bar */}
                    {isMobile && (
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white/30 rounded-full mb-2"></div>
                    )}
                    <div className="cyber-sidebar-title flex items-center gap-2">
                        {activeCategory ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveCategory(null);
                                }}
                                className="mr-1 text-[#FFD700] hover:text-white transition-colors p-1 min-w-[28px] min-h-[28px] flex items-center justify-center"
                                aria-label="Volver a categorías"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        ) : null}
                        <span>{activeCategory ? activeCategory.toUpperCase() : 'UBICACIONES'}</span>
                        <CategoryIcon type={activeCategory || "Default"} className="w-5 h-5 opacity-50 ml-auto" />
                        {isMobile && (
                            <div
                                className="ml-2 text-[#FFD700]/70 transition-colors"
                            >
                                {sidebarCollapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        )}
                    </div>

                    {/* Search Input */}
                    <div className="relative mb-4">
                        <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text"
                            className="cyber-search pl-10"
                            placeholder="Buscar coordenadas..."
                            value={searchTerm}
                            onChange={(e) => onSearch(e.target.value)}
                        />
                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-black border border-[#FFD700] z-50 mt-1 max-h-60 overflow-y-auto">
                                {searchResults.map(res => (
                                    <div
                                        key={res.id}
                                        className="p-3 hover:bg-[#FFD700]/20 cursor-pointer text-white flex justify-between border-b border-white/10"
                                        onClick={() => onSearchResultClick(res.id)}
                                    >
                                        <span>{res.title}</span>
                                        <span className="text-xs text-gray-400">{res.type}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="cyber-sidebar-content space-y-2">
                    {!activeCategory ? (
                        // CATEGORY LIST
                        parentCategories.map((cat) => {
                            const subs = getSubcategories(cat.name);
                            const hasSubs = subs.length > 0;
                            return (
                                <div key={cat.name}>
                                    <div className="flex items-center justify-between p-3 rounded bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-[#FFD700]/50 group">
                                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                                            <input
                                                type="checkbox"
                                                checked={cat.enabled}
                                                onChange={() => onToggleCategory(cat.name)}
                                                className="w-5 h-5 rounded border-gray-500 bg-transparent text-[#FFD700] focus:ring-0 focus:ring-offset-0 checked:bg-[#FFD700] checked:border-[#FFD700]"
                                            />
                                            <div className="w-8 h-8 flex items-center justify-center bg-black/50 rounded p-1">
                                                <CategoryIcon type={cat.name} className="w-full h-full" />
                                            </div>
                                            <span
                                                className="text-white font-[Rajdhani] font-bold tracking-wider uppercase group-hover:text-[#FFD700] transition-colors"
                                                style={{ textShadow: cat.enabled ? `0 0 10px ${getCategoryColor(cat.name)}` : 'none' }}
                                            >
                                                {cat.name}
                                            </span>
                                        </label>

                                        {/* Drill-down Button (List Icon) */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setActiveCategory(cat.name);
                                            }}
                                            className="opacity-50 hover:opacity-100 text-[#FFD700] transition-opacity p-2 hover:bg-[#FFD700]/10 rounded"
                                            title="Ver lista de ubicaciones"
                                        >
                                            <List size={20} />
                                        </button>
                                    </div>

                                    {/* Toggle arrow for subcategories */}
                                    {hasSubs && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleExpanded(cat.name);
                                            }}
                                            className="ml-2 flex items-center gap-1 text-gray-500 hover:text-[#FFD700] transition-colors text-xs font-['Share_Tech_Mono'] py-1"
                                        >
                                            {expandedCategories.has(cat.name) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            <span>SUBCATEGORÍAS ({subs.length})</span>
                                        </button>
                                    )}

                                    {/* Subcategorías (collapsible) */}
                                    {hasSubs && expandedCategories.has(cat.name) && (
                                        <div className="ml-6 mt-1 space-y-1 border-l-2 border-[#FFD700]/20 pl-3">
                                            {subs.map(sub => (
                                                <div
                                                    key={sub.name}
                                                    className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-[#FFD700]/30 group"
                                                >
                                                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                                                        <input
                                                            type="checkbox"
                                                            checked={sub.enabled}
                                                            onChange={() => onToggleCategory(sub.name)}
                                                            className="w-4 h-4 rounded border-gray-500 bg-transparent text-[#FFD700] focus:ring-0 focus:ring-offset-0 checked:bg-[#FFD700] checked:border-[#FFD700]"
                                                        />
                                                        <div className="w-6 h-6 flex items-center justify-center bg-black/50 rounded p-0.5">
                                                            <CategoryIcon type={sub.name} className="w-full h-full" />
                                                        </div>
                                                        <span
                                                            className="text-sm text-white/80 font-[Rajdhani] font-bold tracking-wider uppercase group-hover:text-[#FFD700] transition-colors"
                                                            style={{ textShadow: sub.enabled ? `0 0 8px ${getCategoryColor(sub.name)}` : 'none' }}
                                                        >
                                                            {sub.name}
                                                        </span>
                                                    </label>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setActiveCategory(sub.name);
                                                        }}
                                                        className="opacity-50 hover:opacity-100 text-[#FFD700] transition-opacity p-1 hover:bg-[#FFD700]/10 rounded"
                                                        title="Ver lista de ubicaciones"
                                                    >
                                                        <List size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        // LOCATION LIST (Drill-down)
                        <div className="space-y-1 animation-fade-in">
                            {categoryLocations.length === 0 ? (
                                <div className="text-gray-500 text-center py-4 font-['Share_Tech_Mono']">
                                    NO_DATA_FOUND
                                </div>
                            ) : (
                                categoryLocations.map((loc) => (
                                    <button
                                        key={loc.id || loc.cid}
                                        onClick={() => onLocationSelect(loc)}
                                        className="w-full text-left p-3 rounded bg-white/5 hover:bg-[#FFD700]/10 border border-transparent hover:border-[#FFD700]/30 transition-all flex items-center gap-3 group"
                                    >
                                        <div className="w-1 h-8 bg-gray-700 group-hover:bg-[#FFD700] transition-colors rounded-full" />
                                        <div className="flex-1">
                                            <div className="text-white font-['Rajdhani'] font-semibold group-hover:text-[#FFD700] transition-colors truncate">
                                                {loc.title}
                                            </div>
                                            {loc.notes && (
                                                <div className="text-gray-500 text-xs truncate max-w-[200px] font-['Share_Tech_Mono']">
                                                    {loc.notes}
                                                </div>
                                            )}
                                        </div>
                                        <Eye size={16} className="text-gray-600 group-hover:text-[#FFD700] opacity-0 group-hover:opacity-100 transition-all" />
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="cyber-sidebar-footer">
                    <span>SERVER: LOS SANTOS #4</span>
                    <span className="status-online">ONLINE</span>
                </div>
            </div>

            {/* Map Controls (Bottom Left on Desktop, Horizontal Top on Mobile) */}
            <div className={`cyber-map-controls ${isMobile ? 'flex md:flex' : 'hidden md:flex'}`}>
                {/* Zoom Out */}
                <button
                    className="cyber-control-btn"
                    onClick={onZoomOut}
                    title="Alejar"
                    aria-label="Alejar Mapa"
                >
                    <Minus size={20} />
                </button>
                
                {/* Zoom In */}
                <button
                    className="cyber-control-btn"
                    onClick={onZoomIn}
                    title="Acercar"
                    aria-label="Acercar Mapa"
                >
                    <Plus size={20} />
                </button>

                {/* Reload */}
                <button
                    className="cyber-control-btn"
                    onClick={onReload}
                    title="Recargar Mapa"
                    aria-label="Recargar Mapa"
                >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
                
                {/* Atlas Map */}
                <button
                    className={`cyber-control-btn ${mapType === 'Atlas' ? 'active' : ''}`}
                    onClick={() => onMapTypeChange('Atlas')}
                    title="Mapa Atlas"
                    aria-label="Cambiar a Mapa Atlas"
                >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                </button>
                
                {/* Road Map */}
                <button
                    className={`cyber-control-btn ${mapType === 'Road' ? 'active' : ''}`}
                    onClick={() => onMapTypeChange('Road')}
                    title="Mapa de Carreteras"
                    aria-label="Cambiar a Mapa de Carreteras"
                >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </button>
                
                {/* Satellite Map */}
                <button
                    className={`cyber-control-btn ${mapType === 'Satellite' ? 'active' : ''}`}
                    onClick={() => onMapTypeChange('Satellite')}
                    title="Mapa Satélite"
                    aria-label="Cambiar a Mapa Satélite"
                >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
            </div>
        </>
    );
};

export default MapSidebar;
