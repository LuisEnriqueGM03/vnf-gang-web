import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { URLS } from '../navigation/CONSTANTS';
import '../style/style.css';

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);



  const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1100] bg-black/90 backdrop-blur-md border-b border-white/10 h-20">
      <div className="max-w-[1920px] mx-auto px-4 h-full flex items-center justify-between">

        {/* LEFT: Branding */}
        <div className="flex items-center gap-4">
          {/* Icon Box */}
          <div className="w-12 h-12 border-2 border-neon-green flex items-center justify-center text-neon-green shadow-neon-green bg-black overflow-hidden relative group">
            <div className="absolute inset-0 bg-neon-green/20 group-hover:bg-transparent transition-colors"></div>
            <img src="/VNF4.png" alt="VNF" className="w-full h-full object-cover" />
          </div>

          {/* Text Info */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-display font-bold tracking-wider text-white leading-none">
              V<span className="text-neon-green">NF</span>
            </h1>
            <div className="text-[10px] text-neon-green tracking-[0.2em] font-mono mt-1">
              TACTICAL FEED // LIVE
            </div>
          </div>
        </div>

        {/* CENTER/RIGHT: Navigation */}
        <div className="hidden md:flex items-center gap-6">

          {/* Active/Home Button - Filled Green */}
          <Link
            to={URLS.HOMEPAGE}
            className="flex items-center gap-2 bg-neon-green text-black px-6 py-2 font-bold font-display tracking-widest hover:bg-white hover:text-black transition-colors clip-path-slant"
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
          >
            <HomeIcon />
            <span>INICIO</span>
          </Link>

          {/* Other Links - Outlined */}
          {[
            { name: 'MAPA', path: URLS.MAPA },
            { name: 'TIENDAS', disabled: true },
            { name: 'HACKS ROBOS', disabled: true },
          ].map((item: any) => (
            item.disabled ? (
              <div
                key={item.name}
                onClick={() => alert('? NO DISPONIBLE')}
                className="relative px-6 py-2 font-display text-sm tracking-widest uppercase transition-all duration-300 border border-white/5 text-gray-600 cursor-not-allowed select-none"
              >
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-30"></span>
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-30"></span>
                {item.name}
              </div>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  relative px-6 py-2 font-display text-sm tracking-widest uppercase transition-all duration-300
                  border border-white/20 hover:border-neon-green hover:text-neon-green
                  ${location.pathname === item.path ? 'text-neon-green border-neon-green shadow-neon-green/20' : 'text-gray-400'}
                `}
              >
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50"></span>
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50"></span>
                {item.name}
              </Link>
            )
          ))}
        </div>

        {/* FAR RIGHT: Status */}
        <div className="hidden lg:flex items-center gap-6 text-right">

          {/* Reload Map Button - Only on Map Page */}
          {location.pathname === URLS.MAPA && (
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-1.5 bg-black/50 border border-neon-green/50 text-neon-green hover:bg-neon-green/10 hover:border-neon-green hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all duration-300 group rounded-sm"
              title="Reload Map System"
            >
              <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700 ease-in-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="font-mono text-xs tracking-wider font-bold">RELOAD MAP</span>
            </button>
          )}

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-neon-green font-mono text-sm tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green"></span>
              </span>
              LIVE CONNECTION
            </div>
            <div className="text-gray-500 text-xs font-mono">
              PING: 24ms
            </div>
          </div>
        </div>

        {/* Mobile Hamburger (Keep existing functionality, simplified style) */}
        <button
          className="md:hidden text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center active:bg-white/10 rounded transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menú de navegación"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      {/* Mobile Menu (Simplified) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-black/95 border-b border-neon-green/30 backdrop-blur-xl p-4 flex flex-col gap-3 shadow-lg z-[1100]">
          <Link to={URLS.HOMEPAGE} className="text-neon-green font-bold tracking-widest border-2 border-neon-green p-4 text-center min-h-[52px] flex items-center justify-center hover:bg-neon-green/10 transition-colors active:bg-neon-green/20" onClick={() => setIsMobileMenuOpen(false)}>INICIO</Link>
          <Link to={URLS.MAPA} className="text-white hover:text-neon-green font-mono tracking-widest p-4 text-center border border-white/20 hover:border-neon-green/50 min-h-[52px] flex items-center justify-center transition-colors active:bg-white/5" onClick={() => setIsMobileMenuOpen(false)}>MAPA</Link>
          <div className="text-gray-600 font-mono tracking-widest p-4 text-center border border-white/5 min-h-[52px] flex items-center justify-center cursor-not-allowed select-none" onClick={() => alert('? NO DISPONIBLE')}>TIENDAS</div>
          <div className="text-gray-600 font-mono tracking-widest p-4 text-center border border-white/5 min-h-[52px] flex items-center justify-center cursor-not-allowed select-none" onClick={() => alert('? NO DISPONIBLE')}>HACKS ROBOS</div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
