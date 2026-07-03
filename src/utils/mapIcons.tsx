import {
    HelpCircle,
    MapPin,
    Home,
    Cross,
    User,
    Hammer,
    Circle,
    LucideIcon,
    TriangleAlert,
    Box,
    Target,
    ShieldCheck,
    Shield,
    Crosshair,
    Store,
    Banknote,
    Trash2,
    Wrench,
    Skull,
    Wine,
    Package,
    Warehouse,
    Hexagon,
} from 'lucide-react';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

// Mapping of category names to Lucide icons
export const categoryIcons: Record<string, LucideIcon> = {
    'Desconocido': HelpCircle,
    'Puntos': MapPin,
    'Bandas': Home,
    'Nuestra Sede': Cross,
    'Npcs': User,
    'Mesas Crafteo': Hammer,
    'Hazard': TriangleAlert,
    'Loot Zone': Box,
    'Objective': Target,
    'Shelter': ShieldCheck,
    'Robos': Crosshair,
    'Tiendas de ropa': Store,
    'Cajeros': Banknote,
    'Chatarrerías': Trash2,
    'Talleres': Wrench,
    'Tumbas': Skull,
    'Licorerías': Wine,
    'Badulaques': Package,
    'Almacén Pequeño': Warehouse,
    'Zonas': Hexagon,
    'PDB': Shield,
    'Controlar Zona': ShieldCheck,
    'Default': Circle
};

// Colors for each category (Cyberpunk palette)
export const categoryColors: Record<string, string> = {
    'Desconocido': '#6b7280',
    'Puntos': '#f97316',
    'Bandas': '#06b6d4',
    'Nuestra Sede': '#FFD700',
    'Npcs': '#0025faff',
    'Mesas Crafteo': '#f97316',
    'Hazard': '#ef4444',
    'Loot Zone': '#22c55e',
    'Objective': '#eab308',
    'Shelter': '#3b82f6',
    'Robos': '#ef4444',
    'Tiendas de ropa': '#dc2626',
    'Cajeros': '#b91c1c',
    'Chatarrerías': '#ef4444',
    'Talleres': '#dc2626',
    'Tumbas': '#7f1d1d',
    'Licorerías': '#f87171',
    'Badulaques': '#991b1b',
    'Almacén Pequeño': '#fca5a5',
    'Zonas': '#FFD700',
    'PDB': '#f472b6',
    'Controlar Zona': '#a855f7',
    'Default': '#FFD700'
};

export const getCategoryIcon = (type: string): LucideIcon => {
    return categoryIcons[type] || categoryIcons['Default'];
};

export const getCategoryColor = (type: string): string => {
    return categoryColors[type] || categoryColors['Default'];
};

// Function to generate an SVG string for Google Maps markers
export const getMarkerIconSvg = (type: string): string => {
    const color = getCategoryColor(type);
    const IconComponent = getCategoryIcon(type);

    // Render the icon to a string
    const iconSvgString = ReactDOMServer.renderToStaticMarkup(
        <IconComponent
            size={24}
            color={color}
            strokeWidth={2.5}
        />
    );

    // Embed the icon inside a marker container
    // We use a drop-pin shape or a circle with a glow
    // SVG at full resolution (64x64), will be scaled down by Google Maps to 32x32
    const svg = `
    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-${type.replace(/\s+/g, '')}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <g filter="url(#glow-${type.replace(/\s+/g, '')})">
        <!-- Outer Circle / Pin Base -->
        <circle cx="32" cy="32" r="20" fill="rgba(0,0,0,0.8)" stroke="${color}" stroke-width="3" />
        
        <!-- Inner Icon Container -->
        <g transform="translate(20, 20)">
          ${iconSvgString}
        </g>
      </g>
    </svg>
  `;

    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
};

// Function to generate a SELECTED marker SVG with pulsing glow effect
// glowIntensity: 0.0 (min glow) to 1.0 (max glow)
export const getSelectedMarkerIconSvg = (type: string, glowIntensity: number = 0.5): string => {
    const color = getCategoryColor(type);
    const IconComponent = getCategoryIcon(type);

    const iconSvgString = ReactDOMServer.renderToStaticMarkup(
        <IconComponent
            size={24}
            color={color}
            strokeWidth={2.5}
        />
    );

    const typeId = type.replace(/\s+/g, '');

    // Glow parameters based on intensity (0.0 to 1.0)
    // Only the blur and opacity change - NO ring radius change to avoid artifacts
    const glowBlur = 3 + glowIntensity * 10; // 3 to 13
    const ringOpacity = 0.05 + glowIntensity * 0.55; // 0.05 to 0.6

    // Fixed size 64x64 - only glow blur and opacity change
    // Rings are well within the viewBox (max radius 26, center 32, so max extent = 58 < 64)
    const svg = `
    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-sel-${typeId}" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="${glowBlur.toFixed(1)}" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Single breathing ring - fixed radius, only opacity changes -->
      <circle cx="32" cy="32" r="26" fill="none" stroke="${color}" stroke-width="2" opacity="${ringOpacity.toFixed(2)}" />
      
      <!-- Main icon with breathing glow -->
      <g filter="url(#glow-sel-${typeId})">
        <circle cx="32" cy="32" r="20" fill="rgba(0,0,0,0.9)" stroke="${color}" stroke-width="3" />
        <g transform="translate(20, 20)">
          ${iconSvgString}
        </g>
      </g>
    </svg>
  `;

    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
};
