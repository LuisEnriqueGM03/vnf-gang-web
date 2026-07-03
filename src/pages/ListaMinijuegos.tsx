import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { URLS } from '../navigation/CONSTANTS';
import '../style/style.css';
import {
  Terminal,
  Store,
  Bomb,
  Cable,
  Keyboard,
  Gauge,
  Unlock,
  Key,
  Cpu,
  Lock,
  Grid3x3,
  Laptop,
  ArrowLeft,
  Rocket
} from 'lucide-react';

const ListaMinijuegos = () => {
  const navigate = useNavigate();
  // Force dark mode for this page as per requirement
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const minijuegos = [
    {
      id: 1,
      nombre: 'Caja Registradora',
      descripcion: 'Reach the target in 8 seconds moving the 2x2 block with directional arrows. Precision required.',
      dificultad: 'Hard',
      categoria: ['Store 24/7', 'Barber', 'Tattoo'],
      ruta: URLS.CAJA_REGISTRADORA,
      disponible: true,
      icon: <Store className="text-teal-400 text-2xl" />,
      colorClass: 'teal',
      diffDots: [true, false, false] // Red first dot pulse for hard
    },
    {
      id: 2,
      nombre: 'Buscaminas',
      descripcion: 'Find all mines on a 10x10 board. Easy level starts with numbers 1 to 3. Don\'t trigger the alarm.',
      dificultad: 'Easy',
      categoria: ['Store 24/7'],
      ruta: URLS.BUSCAMINAS,
      disponible: true,
      icon: <Bomb className="text-orange-400 text-2xl" />,
      colorClass: 'orange',
      diffDots: [false, false, false] // Green dots for easy
    },
    {
      id: 3,
      nombre: 'Descruzar Cables',
      descripcion: 'Drag 2 nodes per cable to uncross them. Fixed points at extremes. You have 30 seconds to bypass.',
      dificultad: 'Med',
      categoria: ['Vehicles'],
      ruta: URLS.DESCRUZAR_CABLES,
      disponible: true,
      icon: <Cable className="text-purple-400 text-2xl" />,
      colorClass: 'purple',
      diffDots: [false, true, false] // Yellow/mixed for med
    },
    {
      id: 4,
      nombre: 'Key Fast',
      descripcion: 'Press the 12 keyboard arrows in order. Fast! You only have 6 seconds. Don\'t blink.',
      dificultad: 'Med',
      categoria: ['Barber', 'Tattoo'],
      ruta: URLS.KEY_FAST,
      disponible: true,
      icon: <Keyboard className="text-blue-400 text-2xl" />,
      colorClass: 'blue',
      diffDots: [false, true, false]
    },
    {
      id: 5,
      nombre: 'Key Slow',
      descripcion: 'Press only 8 keyboard arrows in order. You have 6 seconds. Easier, but still deadly.',
      dificultad: 'Easy',
      categoria: ['Store 24/7'],
      ruta: URLS.KEY_SLOW,
      disponible: true,
      icon: <Gauge className="text-emerald-400 text-2xl" />,
      colorClass: 'emerald',
      diffDots: [false, false, false]
    },
    {
      id: 6,
      nombre: 'Ganzuado',
      descripcion: 'Press E when the red ball passes through the rhombus squares. 2 complete laps needed for override.',
      dificultad: 'Hard',
      categoria: ['Vehicles'],
      ruta: URLS.GANZUADO,
      disponible: true,
      icon: <Unlock className="text-yellow-400 text-2xl" />,
      colorClass: 'yellow',
      diffDots: [true, false, false]
    },
    {
      id: 7,
      nombre: 'Código de Acceso',
      descripcion: 'Activate correct switches to reach the target code. 30 seconds to brute force.',
      dificultad: 'Med',
      categoria: ['Store 24/7'],
      ruta: URLS.CODIGO_ACCESO,
      disponible: true,
      icon: <Key className="text-indigo-400 text-2xl" />,
      colorClass: 'indigo',
      diffDots: [false, true, false]
    },
    {
      id: 8,
      nombre: 'Memorizar',
      descripcion: 'Memorize 6 symbols and their positions in 5s. Identify the correct one. 3 rounds to win.',
      dificultad: 'Med',
      categoria: ['Store 24/7'],
      ruta: URLS.MEMORIZAR,
      disponible: true,
      icon: <Cpu className="text-cyan-400 text-2xl" />,
      colorClass: 'cyan',
      diffDots: [false, true, false]
    },
    {
      id: 9,
      nombre: 'Caja Fuerte',
      descripcion: 'Turn 2 knobs to reach 100%. You have 30 seconds to crack the safe open!',
      dificultad: 'Easy',
      categoria: ['Store 24/7'],
      ruta: URLS.CAJA_FUERTE,
      disponible: true,
      icon: <Lock className="text-gray-300 text-2xl" />,
      colorClass: 'gray',
      diffDots: [false, false, false]
    },
    {
      id: 10,
      nombre: 'Matriz',
      descripcion: 'Move the red selector with arrows and press Enter when you find the 4 numbers. The matrix moves!',
      dificultad: 'Med',
      categoria: ['ATM Hack'],
      ruta: URLS.SECURE,
      disponible: true,
      icon: <Grid3x3 className="text-violet-400 text-2xl" />,
      colorClass: 'violet',
      diffDots: [false, true, false]
    },
    {
      id: 11,
      nombre: 'BruteForce',
      descripcion: 'Matrix in motion with random red letters. Capture all of them by pressing Enter at the perfect moment!',
      dificultad: 'Hard',
      categoria: ['ATM Hack'],
      ruta: URLS.BRUTEFORCE,
      disponible: true,
      icon: <Laptop className="text-rose-400 text-2xl" />,
      colorClass: 'rose',
      diffDots: [true, false, false]
    },
  ];

  const allCategories = ['All Systems', 'Store 24/7', 'Barbershop', 'Tattoo', 'Clothing', 'Vehicles', 'ATM Hack'];

  // Mapping categories to match the design's specific naming if needed, or just use what we have
  // The design uses specific buttons. Let's try to map our categories to those.
  // Our categories in data: 'Store 24/7', 'Barber', 'Tattoo', 'Tienda Ropa' (Clothing), 'Vehicles', 'ATM Hack'

  const [selectedCategory, setSelectedCategory] = useState('All Systems');

  const filterGames = (cat: string) => {
    if (cat === 'All Systems') return minijuegos;

    // Map UI categories to data categories
    let dataCat = cat;
    if (cat === 'Barbershop') dataCat = 'Barber';
    if (cat === 'Clothing') dataCat = 'Tienda Ropa';

    return minijuegos.filter(j => j.categoria && j.categoria.includes(dataCat));
  };

  const filteredMinijuegos = filterGames(selectedCategory);

  // Helper to render difficulty dots
  const renderDots = (difficulty: string, colorClass: string) => {
    if (difficulty === 'Hard') {
      return (
        <div className="flex gap-1 mb-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-red-900 rounded-full"></div>
          <div className="w-2 h-2 bg-red-900 rounded-full"></div>
        </div>
      );
    } else if (difficulty === 'Med') {
      return (
        <div className="flex gap-1 mb-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <div className="w-2 h-2 bg-yellow-900 rounded-full"></div>
        </div>
      );
    } else {
      // Easy
      return (
        <div className="flex gap-1 mb-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="w-2 h-2 bg-green-900 rounded-full"></div>
          <div className="w-2 h-2 bg-green-900 rounded-full"></div>
        </div>
      );
    }
  };

  // Helper to get color classes dynamically (Tailwind doesn't like dynamic class strings strictly, butsafelist or full strings work)
  // We'll use style objects or specific class mappings for safety
  const getColorClasses = (color: string) => {
    const colors: Record<string, any> = {
      teal: {
        bgStart: 'from-teal-500',
        bgSoft: 'bg-teal-500/20',
        border: 'border-teal-500',
        borderSoft: 'border-teal-500/50',
        text: 'text-teal-400',
        hoverText: 'group-hover:text-teal-400',
        hoverBg: 'hover:bg-teal-500',
        borderL: 'border-teal-500/30',
        shadow: 'group-hover:shadow-[0_0_15px_rgba(20,184,166,0.5)]'
      },
      orange: {
        bgStart: 'from-orange-500',
        bgSoft: 'bg-orange-500/20',
        border: 'border-orange-500',
        borderSoft: 'border-orange-500/50',
        text: 'text-orange-400',
        hoverText: 'group-hover:text-orange-400',
        hoverBg: 'hover:bg-orange-500',
        borderL: 'border-orange-500/30',
        shadow: 'group-hover:shadow-[0_0_15px_rgba(249,115,22,0.5)]'
      },
      purple: {
        bgStart: 'from-purple-500',
        bgSoft: 'bg-purple-500/20',
        border: 'border-purple-500',
        borderSoft: 'border-purple-500/50',
        text: 'text-purple-400',
        hoverText: 'group-hover:text-purple-400',
        hoverBg: 'hover:bg-purple-500',
        borderL: 'border-purple-500/30',
        shadow: 'group-hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]'
      },
      blue: {
        bgStart: 'from-blue-500',
        bgSoft: 'bg-blue-500/20',
        border: 'border-blue-500',
        borderSoft: 'border-blue-500/50',
        text: 'text-blue-400',
        hoverText: 'group-hover:text-blue-400',
        hoverBg: 'hover:bg-blue-500',
        borderL: 'border-blue-500/30',
        shadow: 'group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]'
      },
      emerald: {
        bgStart: 'from-emerald-500',
        bgSoft: 'bg-emerald-500/20',
        border: 'border-emerald-500',
        borderSoft: 'border-emerald-500/50',
        text: 'text-emerald-400',
        hoverText: 'group-hover:text-emerald-400',
        hoverBg: 'hover:bg-emerald-500',
        borderL: 'border-emerald-500/30',
        shadow: 'group-hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]'
      },
      yellow: {
        bgStart: 'from-yellow-500',
        bgSoft: 'bg-yellow-500/20',
        border: 'border-yellow-500',
        borderSoft: 'border-yellow-500/50',
        text: 'text-yellow-400',
        hoverText: 'group-hover:text-yellow-400',
        hoverBg: 'hover:bg-yellow-500',
        borderL: 'border-yellow-500/30',
        shadow: 'group-hover:shadow-[0_0_15px_rgba(234,179,8,0.5)]'
      },
      indigo: {
        bgStart: 'from-indigo-500',
        bgSoft: 'bg-indigo-500/20',
        border: 'border-indigo-500',
        borderSoft: 'border-indigo-500/50',
        text: 'text-indigo-400',
        hoverText: 'group-hover:text-indigo-400',
        hoverBg: 'hover:bg-indigo-500',
        borderL: 'border-indigo-500/30',
        shadow: 'group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]'
      },
      cyan: {
        bgStart: 'from-cyan-500',
        bgSoft: 'bg-cyan-500/20',
        border: 'border-cyan-500',
        borderSoft: 'border-cyan-500/50',
        text: 'text-cyan-400',
        hoverText: 'group-hover:text-cyan-400',
        hoverBg: 'hover:bg-cyan-500',
        borderL: 'border-cyan-500/30',
        shadow: 'group-hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]'
      },
      gray: {
        bgStart: 'from-gray-500',
        bgSoft: 'bg-gray-500/20',
        border: 'border-gray-500',
        borderSoft: 'border-gray-500/50',
        text: 'text-gray-300',
        hoverText: 'group-hover:text-gray-300',
        hoverBg: 'hover:bg-gray-500',
        borderL: 'border-gray-500/30',
        shadow: 'group-hover:shadow-[0_0_15px_rgba(107,114,128,0.5)]'
      },
      violet: {
        bgStart: 'from-violet-600',
        bgSoft: 'bg-violet-600/20',
        border: 'border-violet-600',
        borderSoft: 'border-violet-600/50',
        text: 'text-violet-400',
        hoverText: 'group-hover:text-violet-400',
        hoverBg: 'hover:bg-violet-600',
        borderL: 'border-violet-600/30',
        shadow: 'group-hover:shadow-[0_0_15px_rgba(124,58,237,0.5)]'
      },
      rose: {
        bgStart: 'from-rose-600',
        bgSoft: 'bg-rose-600/20',
        border: 'border-rose-600',
        borderSoft: 'border-rose-600/50',
        text: 'text-rose-400',
        hoverText: 'group-hover:text-rose-400',
        hoverBg: 'hover:bg-rose-600',
        borderL: 'border-rose-600/30',
        shadow: 'group-hover:shadow-[0_0_15px_rgba(225,29,72,0.5)]'
      }
    };
    return colors[color] || colors['teal'];
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 min-h-screen relative overflow-x-hidden font-body crt selection:bg-primary selection:text-black">
      <div className="fixed inset-0 z-0 bg-grid-pattern bg-[length:40px_40px] opacity-20 pointer-events-none"></div>
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-12 text-center relative pt-20">
          <div className="inline-block border border-primary/50 bg-black/80 p-6 rounded-sm shadow-neon-green backdrop-blur-md relative group">
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary"></div>

            <div className="flex items-center justify-center gap-4 mb-2">
              <Terminal className="text-4xl text-primary animate-pulse w-10 h-10" />
              <h1 className="text-4xl md:text-5xl font-display font-black uppercase text-primary tracking-widest glitch" data-text="Hacks Robos">
                Hacks Robos
              </h1>
            </div>
            <p className="text-xs font-mono text-primary/70 tracking-[0.2em] uppercase">System Access Level: Admin // v.2.0.45</p>
          </div>
        </header>

        <nav className="mb-12 overflow-x-auto pb-4">
          <div className="flex flex-wrap justify-center gap-3">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-6 py-2 border font-mono text-sm uppercase tracking-widest relative group transition-all duration-300
                  ${selectedCategory === cat
                    ? 'bg-primary text-black font-display font-bold border-transparent clip-path-polygon hover:bg-white'
                    : 'border-cyber-gray bg-black/50 text-gray-400 hover:text-primary hover:border-primary hover:shadow-neon-green'}
                `}
              >
                {selectedCategory !== cat && (
                  <span className="absolute left-0 top-0 h-full w-[2px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform"></span>
                )}
                {cat}
              </button>
            ))}
          </div>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredMinijuegos.map((juego) => {
            const colors = getColorClasses(juego.colorClass);

            return (
              <div key={juego.id} className="cyber-card relative bg-black/40 border border-cyber-gray p-0 overflow-hidden group">
                <div className={`h-1 w-full bg-gradient-to-r ${colors.bgStart} to-transparent`}></div>
                <div className="p-6 relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded border ${colors.bgSoft} ${colors.borderSoft}`}>
                      {juego.icon}
                    </div>
                    <div className="flex flex-col items-end">
                      {renderDots(juego.dificultad, juego.colorClass)}
                      <span className={`text-[10px] font-mono uppercase ${colors.text}`}>Diff: {juego.dificultad}</span>
                    </div>
                  </div>

                  <h3 className={`text-2xl font-display font-bold text-white mb-2 transition-colors ${colors.hoverText}`}>
                    {juego.nombre}
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {juego.categoria && juego.categoria.map(cat => (
                      <span key={cat} className="text-[10px] font-mono border border-gray-700 text-gray-400 px-2 py-0.5 rounded uppercase">
                        {cat}
                      </span>
                    ))}
                  </div>

                  <p className={`text-gray-400 text-sm font-body mb-6 border-l-2 pl-3 ${colors.borderL}`}>
                    {juego.descripcion}
                  </p>

                  {juego.disponible ? (
                    <button
                      onClick={() => navigate(juego.ruta)}
                      className={`w-full bg-transparent text-gray-300 border py-3 font-display font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-2 
                        ${colors.hoverBg} hover:text-black ${colors.border} ${colors.shadow}`}
                    >
                      <Rocket className="w-4 h-4" /> Launch Protocol
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-black/30 text-gray-600 border border-gray-800 py-3 font-display font-bold uppercase tracking-widest text-sm cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" /> Locked
                    </button>
                  )}
                </div>

                {/* Texture overlay */}
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/diagmonds-light.png")' }}>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 flex justify-center pb-12">
          <button
            onClick={() => navigate(URLS.MAPA)}
            className="group relative px-8 py-3 bg-black/80 overflow-hidden rounded-sm border border-cyber-gray hover:border-primary transition-all duration-300"
          >
            <div className="absolute inset-0 w-3 bg-primary transition-all duration-[250ms] ease-out group-hover:w-full opacity-20 group-hover:opacity-100"></div>
            <span className="relative text-gray-400 group-hover:text-primary font-mono text-sm tracking-widest uppercase flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Return to Root
            </span>
          </button>
        </div>
      </div>

      <div className="fixed top-8 left-8 w-32 h-32 border-l border-t border-gray-800 opacity-50 pointer-events-none hidden lg:block"></div>
      <div className="fixed bottom-8 right-8 w-32 h-32 border-r border-b border-gray-800 opacity-50 pointer-events-none hidden lg:block"></div>
      <div className="fixed top-1/2 left-4 w-1 h-24 bg-gradient-to-b from-transparent via-primary/30 to-transparent hidden lg:block"></div>

      {/* Navbar overlay or replacement if needed, but keeping it clean for now since the design has its own header */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

    </div>
  );
};

export default ListaMinijuegos;
