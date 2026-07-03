import { useNavigate } from 'react-router-dom';
import { URLS } from '../navigation/CONSTANTS';
import '../style/style.css'; // Ensure we have access to .glitch, .crt, etc.

const HomePage = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: '01',
      label: 'MAPA',
      sub: 'NAV',
      action: () => navigate(URLS.MAPA),
      status: 'ONLINE',
      statusColor: 'text-neon-green',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    {
      id: '02',
      label: 'TIENDAS',
      sub: 'MKT',
      action: () => alert('? NO DISPONIBLE'),
      status: 'OFFLINE',
      statusColor: 'text-gray-600',
      disabled: true,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: '03',
      label: 'HACKS ROBOS',
      sub: 'HACK',
      action: () => alert('? NO DISPONIBLE'),
      status: 'OFFLINE',
      statusColor: 'text-gray-600',
      disabled: true,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-mono crt">
      {/* Background Grid & Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black pointer-events-none"></div>

      {/* Top Bar / HUD Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 border-b border-white/10 uppercase text-xs tracking-widest text-neon-green/60">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
          <span>NET: SECURE</span>
        </div>
        <div>SYS.TIME 23:42:19</div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto h-screen flex flex-col md:flex-row items-center justify-center gap-8 p-6">

        {/* Left Column: Character Visualization */}
        <div className="flex-1 w-full max-w-lg relative group">
          {/* Holo Emitter Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-green to-dark-green rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

          <div className="relative border border-white/10 bg-black/40 backdrop-blur-sm p-8 rounded-lg">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-green/50"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-neon-green/50"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-neon-green/50"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon-green/50"></div>

            {/* Character Image */}
              <div className="relative overflow-hidden rounded-md border border-neon-green/10">
              <div className="absolute inset-0 bg-scanline pointer-events-none z-20 opacity-50"></div>
              <img
                src="/VNF4.png"
                alt="Identity"
                className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-500 hover:scale-105"
                style={{ filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.3))' }}
              />
              {/* Scanning Line Animation */}
              <div className="absolute top-0 w-full h-1 bg-neon-green/50 shadow-[0_0_15px_rgba(255,215,0,0.8)] animate-[scan_3s_linear_infinite] z-30"></div>
            </div>

            <div className="mt-4 text-center">
              <div className="text-xs text-neon-green/60 tracking-[0.2em] mb-1">IDENTITY VERIFIED</div>
              <div className="text-xl font-bold text-white tracking-wider">VARRIO NUEVA FRONTERA</div>
            </div>
          </div>
        </div>

        {/* Right Column: Menu System */}
        <div className="flex-1 w-full max-w-2xl flex flex-col justify-center">

          {/* Header Title */}
          <div className="mb-10 text-left">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-green via-yellow-400 to-neon-green glitch mb-2" data-text="¡BIENVENIDO!">
              ¡BIENVENIDO!
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 tracking-[0.3em] font-light uppercase border-l-2 border-neon-green pl-4">
              GANG WEB VNF
            </p>
          </div>

          {/* Grid Menu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item: any) => (
              <button
                key={item.id}
                onClick={item.action}
                className={`group relative overflow-hidden bg-black/60 border transition-all duration-300 p-6 text-left ${
                  item.disabled
                    ? 'border-white/5 opacity-60 cursor-not-allowed'
                    : 'border-white/10 hover:border-neon-green'
                }`}
              >
                {!item.disabled && (
                  <div className="absolute inset-0 bg-neon-green/0 group-hover:bg-neon-green/10 transition-all duration-300"></div>
                )}

                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 transition-colors"></div>

                <div className="relative z-10 flex justify-between items-start mb-4">
                  <div className="text-xs text-gray-500 font-mono">ID_{item.id} // {item.sub}</div>
                  <div className={`text-[10px] uppercase tracking-wider flex items-center gap-1.5 ${item.statusColor}`}>
                    <div className={`w-1.5 h-1.5 rounded-full bg-current ${item.status === 'ONLINE' ? 'animate-pulse' : ''}`}></div>
                    {item.status}
                  </div>
                </div>

                <div className="relative z-10 flex items-center gap-4">
                  <div className={`p-2 rounded bg-white/5 border text-gray-500 transition-all duration-300 ${
                    item.disabled ? 'border-white/5' : 'border-white/10 group-hover:border-neon-green/50 text-neon-green group-hover:text-black group-hover:bg-neon-green'
                  }`}>
                    {item.icon}
                  </div>
                  <span className={`text-2xl font-bold tracking-wide transition-transform duration-300 ${
                    item.disabled ? 'text-gray-600' : 'text-white group-hover:translate-x-1'
                  }`}>
                    {item.label}
                  </span>
                </div>

                <div className={`absolute -bottom-4 -right-4 text-8xl font-bold pointer-events-none select-none font-display ${
                  item.disabled ? 'text-white/5' : 'text-white/5 group-hover:text-neon-green/10 transition-colors'
                }`}>
                  {item.id}
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Footer / Terminal Output */}
      <div className="absolute bottom-4 left-6 text-xs text-neon-green/40 font-mono">
        <p>VNF // TERMINAL v4.8</p>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
