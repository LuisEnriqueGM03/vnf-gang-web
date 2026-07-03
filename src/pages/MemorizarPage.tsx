import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import '../style/style.css';

interface ColorPalette {
  color: string;
  bgColor: string;
}

const MemorizarPage = () => {
  const [completed, setCompleted] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [gamePhase, setGamePhase] = useState<'memorize' | 'select' | 'won' | 'lost'>('memorize');
  const [targetSymbolId, setTargetSymbolId] = useState<number>(1); // ID del símbolo objetivo
  const [targetPosition, setTargetPosition] = useState<number>(1); // Posición donde apareció
  const [memorizeTime, setMemorizeTime] = useState(5);
  const [selectTime, setSelectTime] = useState(5); // Timer para la fase de selección
  const [totalRounds] = useState(3); // Total de rondas
  const [optionsForSelection, setOptionsForSelection] = useState<Array<{id: number; color: string; bgColor: string; iconShape: string}>>([]);

  // Paleta de colores más fuertes
  const colorPalettes: ColorPalette[] = [
    { color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.25)' }, // Amarillo
    { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.25)' }, // Rojo
    { color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.25)' }, // Naranja
    { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.25)' }, // Verde
    { color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.25)' }, // Azul
    { color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.25)' }, // Morado
  ];

  // Función para renderizar íconos según la forma
  const renderIcon = (shape: string, color: string) => {
    const icons: Record<string, React.ReactElement> = {
      'network': (
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* Red de puntos conectados */}
          <circle cx="30" cy="15" r="4" fill={color} />
          <circle cx="15" cy="30" r="4" fill={color} />
          <circle cx="30" cy="30" r="4" fill={color} />
          <circle cx="45" cy="30" r="4" fill={color} />
          <circle cx="30" cy="45" r="4" fill={color} />
          <line x1="30" y1="15" x2="15" y2="30" stroke={color} strokeWidth="2" />
          <line x1="30" y1="15" x2="30" y2="30" stroke={color} strokeWidth="2" />
          <line x1="30" y1="15" x2="45" y2="30" stroke={color} strokeWidth="2" />
          <line x1="15" y1="30" x2="30" y2="30" stroke={color} strokeWidth="2" />
          <line x1="30" y1="30" x2="45" y2="30" stroke={color} strokeWidth="2" />
          <line x1="30" y1="30" x2="30" y2="45" stroke={color} strokeWidth="2" />
        </svg>
      ),
      'camera': (
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* Marco de cámara/captura */}
          <rect x="12" y="12" width="36" height="36" fill="none" stroke={color} strokeWidth="3" />
          <line x1="12" y1="12" x2="22" y2="22" stroke={color} strokeWidth="2" />
          <line x1="48" y1="12" x2="38" y2="22" stroke={color} strokeWidth="2" />
          <line x1="12" y1="48" x2="22" y2="38" stroke={color} strokeWidth="2" />
          <line x1="48" y1="48" x2="38" y2="38" stroke={color} strokeWidth="2" />
          <circle cx="30" cy="30" r="8" fill="none" stroke={color} strokeWidth="2" />
        </svg>
      ),
      'spiral': (
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* Espiral/huella dactilar */}
          <circle cx="30" cy="30" r="6" fill="none" stroke={color} strokeWidth="2" />
          <circle cx="30" cy="30" r="12" fill="none" stroke={color} strokeWidth="2" />
          <circle cx="30" cy="30" r="18" fill="none" stroke={color} strokeWidth="2" />
          <circle cx="30" cy="30" r="24" fill="none" stroke={color} strokeWidth="2" />
          <path d="M 30 6 Q 54 30 30 54" fill="none" stroke={color} strokeWidth="2" />
        </svg>
      ),
      'axe': (
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* Hacha */}
          <rect x="26" y="30" width="8" height="24" fill={color} />
          <path d="M 15 18 L 30 10 L 45 18 L 40 28 L 30 25 L 20 28 Z" fill={color} />
        </svg>
      ),
      'multi-spiral': (
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* Espirales múltiples */}
          <circle cx="20" cy="20" r="4" fill="none" stroke={color} strokeWidth="2" />
          <circle cx="20" cy="20" r="8" fill="none" stroke={color} strokeWidth="2" />
          <circle cx="40" cy="20" r="4" fill="none" stroke={color} strokeWidth="2" />
          <circle cx="40" cy="20" r="8" fill="none" stroke={color} strokeWidth="2" />
          <circle cx="20" cy="40" r="4" fill="none" stroke={color} strokeWidth="2" />
          <circle cx="20" cy="40" r="8" fill="none" stroke={color} strokeWidth="2" />
          <circle cx="40" cy="40" r="4" fill="none" stroke={color} strokeWidth="2" />
          <circle cx="40" cy="40" r="8" fill="none" stroke={color} strokeWidth="2" />
        </svg>
      ),
      'lightning': (
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* Rayo */}
          <path d="M 35 8 L 20 30 L 28 30 L 25 52 L 42 25 L 33 25 Z" fill={color} stroke={color} strokeWidth="2" />
        </svg>
      ),
      'star': (
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* Estrella */}
          <path d="M 30 10 L 35 25 L 50 25 L 38 35 L 43 50 L 30 40 L 17 50 L 22 35 L 10 25 L 25 25 Z" fill="none" stroke={color} strokeWidth="2.5" />
        </svg>
      ),
      'triangle': (
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* Triángulos anidados */}
          <path d="M 30 10 L 50 45 L 10 45 Z" fill="none" stroke={color} strokeWidth="3" />
          <path d="M 30 20 L 42 38 L 18 38 Z" fill="none" stroke={color} strokeWidth="2.5" />
          <path d="M 30 28 L 36 33 L 24 33 Z" fill={color} />
        </svg>
      ),
      'hexagon': (
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* Hexágono */}
          <path d="M 30 8 L 48 18 L 48 38 L 30 48 L 12 38 L 12 18 Z" fill="none" stroke={color} strokeWidth="3" />
          <path d="M 30 16 L 42 22 L 42 34 L 30 40 L 18 34 L 18 22 Z" fill="none" stroke={color} strokeWidth="2.5" />
          <circle cx="30" cy="28" r="6" fill={color} />
        </svg>
      ),
      'diamond': (
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* Diamante */}
          <path d="M 30 8 L 48 28 L 30 52 L 12 28 Z" fill="none" stroke={color} strokeWidth="3" />
          <line x1="12" y1="28" x2="48" y2="28" stroke={color} strokeWidth="2" />
          <line x1="22" y1="12" x2="30" y2="28" stroke={color} strokeWidth="2" />
          <line x1="38" y1="12" x2="30" y2="28" stroke={color} strokeWidth="2" />
        </svg>
      ),
      'cross': (
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* Cruz */}
          <rect x="25" y="10" width="10" height="40" fill={color} />
          <rect x="10" y="25" width="40" height="10" fill={color} />
          <circle cx="30" cy="30" r="8" fill="none" stroke="white" strokeWidth="2" />
        </svg>
      ),
      'wave': (
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* Ondas */}
          <path d="M 10 20 Q 20 10 30 20 T 50 20" fill="none" stroke={color} strokeWidth="3" />
          <path d="M 10 30 Q 20 20 30 30 T 50 30" fill="none" stroke={color} strokeWidth="3" />
          <path d="M 10 40 Q 20 30 30 40 T 50 40" fill="none" stroke={color} strokeWidth="3" />
        </svg>
      ),
      'gear': (
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* Engranaje */}
          <circle cx="30" cy="30" r="10" fill="none" stroke={color} strokeWidth="3" />
          <rect x="27" y="8" width="6" height="12" fill={color} />
          <rect x="27" y="40" width="6" height="12" fill={color} />
          <rect x="8" y="27" width="12" height="6" fill={color} />
          <rect x="40" y="27" width="12" height="6" fill={color} />
          <rect x="14" y="14" width="6" height="6" fill={color} transform="rotate(45 17 17)" />
          <rect x="40" y="14" width="6" height="6" fill={color} transform="rotate(-45 43 17)" />
          <rect x="14" y="40" width="6" height="6" fill={color} transform="rotate(-45 17 43)" />
          <rect x="40" y="40" width="6" height="6" fill={color} transform="rotate(45 43 43)" />
        </svg>
      ),
      'arrow': (
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* Flecha circular */}
          <path d="M 45 30 A 15 15 0 1 1 30 15" fill="none" stroke={color} strokeWidth="3" />
          <path d="M 30 15 L 25 22 L 35 20 Z" fill={color} />
          <path d="M 15 30 A 15 15 0 1 1 30 45" fill="none" stroke={color} strokeWidth="3" />
          <path d="M 30 45 L 35 38 L 25 40 Z" fill={color} />
        </svg>
      ),
    };
    
    return icons[shape] || icons['network'];
  };

  // Generar símbolos con colores aleatorios
  const [symbols, setSymbols] = useState<Array<{id: number; color: string; bgColor: string; iconShape: string}>>([]);

  const generateSymbols = () => {
    const allIconShapes = [
      'network', 'camera', 'spiral', 'lightning', 'diamond', 'axe', 'gear', 'arrow'
    ];
    
    // Seleccionar 6 símbolos aleatorios de los 8 disponibles
    const shuffledAll = allIconShapes.sort(() => Math.random() - 0.5);
    const iconShapes = shuffledAll.slice(0, 6);

    // Generar combinaciones únicas de símbolo + color
    const usedCombinations = new Set<string>();
    const newSymbols = iconShapes.map((shape, index) => {
      let randomColor;
      let combination;
      
      // Buscar una combinación única
      do {
        randomColor = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
        combination = `${shape}-${randomColor.color}`;
      } while (usedCombinations.has(combination));
      
      usedCombinations.add(combination);
      
      return {
        id: index + 1,
        color: randomColor.color,
        bgColor: randomColor.bgColor,
        iconShape: shape
      };
    });
    
    // Aleatorizar el orden de los símbolos
    const shuffledSymbols = newSymbols.sort(() => Math.random() - 0.5);
    
    setSymbols(shuffledSymbols);
  };

  // Generar símbolos y objetivo al iniciar
  useEffect(() => {
    generateSymbols();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generar objetivo cuando los símbolos estén listos
  useEffect(() => {
    if (symbols.length > 0 && targetPosition === 1) {
      generateTarget();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols]);

  // Timer para fase de memorización (5 segundos)
  useEffect(() => {
    if (gamePhase === 'memorize' && memorizeTime > 0 && !showInstructions) {
      const timer = setTimeout(() => setMemorizeTime(memorizeTime - 1), 1000);
      return () => clearTimeout(timer);
    } else if (memorizeTime === 0 && gamePhase === 'memorize' && symbols.length > 0) {
      // Generar opciones antes de cambiar a fase de selección
      const symbolAtPosition = symbols[targetPosition - 1];
      
      if (symbolAtPosition) {
        const otherSymbols = symbols.filter(s => s.id !== symbolAtPosition.id);
        const shuffled = [...otherSymbols].sort(() => Math.random() - 0.5);
        const incorrectOptions = shuffled.slice(0, 2);
        const allOptions = [symbolAtPosition, ...incorrectOptions].sort(() => Math.random() - 0.5);
        setOptionsForSelection(allOptions);
        
        console.log('Opciones generadas:', allOptions.map(s => s.id));
      }
      
      setSelectTime(5); // Resetear timer de selección
      setGamePhase('select');
    }
  }, [memorizeTime, gamePhase, showInstructions, symbols, targetPosition]);

  // Timer para fase de selección (5 segundos)
  useEffect(() => {
    if (gamePhase === 'select' && selectTime > 0) {
      const timer = setTimeout(() => setSelectTime(selectTime - 1), 1000);
      return () => clearTimeout(timer);
    } else if (selectTime === 0 && gamePhase === 'select') {
      // Tiempo agotado, perdió
      setGamePhase('lost');
    }
  }, [selectTime, gamePhase]);

  const generateTarget = () => {
    // Seleccionar un símbolo aleatorio de las 6 posiciones
    const randomPosition = Math.floor(Math.random() * 6) + 1; // 1-6
    setTargetPosition(randomPosition);
    
    // El símbolo en esa posición
    const symbolAtPosition = symbols[randomPosition - 1];
    setTargetSymbolId(symbolAtPosition.id);
  };

  const handleSymbolClick = (clickedSymbolId: number) => {
    if (gamePhase !== 'select') return;

    // Verificar si hizo clic en el símbolo correcto
    if (clickedSymbolId === targetSymbolId) {
      const newCompleted = completed + 1;
      setCompleted(newCompleted);
      
      if (newCompleted >= totalRounds) {
        setGamePhase('won');
      } else {
        // Siguiente ronda
        generateTarget();
        setGamePhase('memorize');
        setMemorizeTime(5);
        setSelectTime(5);
      }
    } else {
      setGamePhase('lost');
    }
  };

  const resetGame = () => {
    setCompleted(0);
    setGamePhase('memorize');
    setMemorizeTime(5);
    setSelectTime(5);
    generateSymbols(); // Regenerar símbolos con nuevos colores
    setTimeout(() => generateTarget(), 100); // Generar objetivo después
  };

  const startGame = () => {
    setShowInstructions(false);
    setGamePhase('memorize');
    setMemorizeTime(5);
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(to bottom right, #000000, #3d3d0a, #000000, #5c5c1a)' }}>
      <Navbar />
      
      <div className="relative z-10 container mx-auto px-4 py-8 pt-28">
        {/* Título */}
        <div className="text-center mb-8">
          <div className="backdrop-blur-xl inline-block px-8 py-4 rounded-2xl shadow-2xl border-2" style={{ background: 'linear-gradient(to right, rgba(0, 0, 0, 0.95), rgba(50, 50, 10, 0.9))', borderColor: '#FFD700', boxShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white">🧠 Memorizar símbolos</h1>
            <p className="text-white/80 mt-2">Memoriza y selecciona los símbolos correctos</p>
          </div>
        </div>

        {/* Mostrar tablero siempre */}
        {!showInstructions && (
          <>
            {/* Game Board */}
            <div className="max-w-xl mx-auto">
              <div className="backdrop-blur-xl bg-black/70 rounded-2xl shadow-2xl p-6 border border-white/20">
                {/* Título interno */}
                <h2 className="text-white font-bold text-xl text-center mb-3">Memorizar símbolos</h2>
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent mb-6"></div>
                
                
                {/* Mensaje "¿Qué símbolo estaba en #X?" */}
                {gamePhase === 'select' && (
                  <div className="text-center mb-6">
                    <p className="text-white font-bold text-lg">¿Qué símbolo estaba en #{targetPosition}?</p>
                  </div>
                )}
                
                {/* Cuadrícula de símbolos */}
                <div className={`grid gap-4 mb-6 ${gamePhase === 'select' ? 'grid-cols-3 max-w-md mx-auto' : 'grid-cols-3'}`}>
                  {(gamePhase === 'select' && optionsForSelection.length > 0 ? optionsForSelection : gamePhase === 'memorize' ? symbols : symbols.slice(0, 3)).map((symbol, index) => {
                    return (
                      <button
                        key={symbol.id}
                        onClick={() => handleSymbolClick(symbol.id)}
                        disabled={gamePhase !== 'select'}
                        className={`relative aspect-square rounded-xl border-2 border-gray-700 transition-all duration-300 ${
                          gamePhase === 'select' ? 'cursor-pointer hover:scale-105 hover:border-white/50' : 'cursor-not-allowed'
                        }`}
                        style={{
                          backgroundColor: symbol.bgColor
                        }}
                      >
                        {/* Número - Solo mostrar durante memorización */}
                        {gamePhase === 'memorize' && (
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-lg bg-black/70 flex items-center justify-center border border-white/20">
                            <span className="text-white font-bold text-2xl">{index + 1}</span>
                          </div>
                        )}

                        {/* Símbolo */}
                        <div className="flex items-center justify-center h-full">
                          {renderIcon(symbol.iconShape, symbol.color)}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Línea separadora superior */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent mb-6"></div>
                
                {/* Barra de progreso / Timer */}
                <div className="bg-transparent">
                  <p className="text-white text-center font-bold text-base mb-3">Completado: {completed}/3</p>
                  <div className="w-full h-2.5 rounded-full bg-gray-800/60 overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ 
                        width: gamePhase === 'memorize' 
                          ? `${(memorizeTime / 5) * 100}%` 
                          : gamePhase === 'select'
                          ? `${(selectTime / 5) * 100}%`
                          : `${(completed / 3) * 100}%`,
                        backgroundColor: gamePhase === 'memorize' 
                          ? (memorizeTime > 3 ? '#10b981' : memorizeTime > 1 ? '#eab308' : '#ef4444')
                          : gamePhase === 'select'
                          ? (selectTime > 3 ? '#10b981' : selectTime > 1 ? '#eab308' : '#ef4444')
                          : '#eab308',
                        transition: 'width 1s linear, background-color 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                {/* Botón Reiniciar - Solo mostrar si no ganó ni perdió */}
                {gamePhase !== 'won' && gamePhase !== 'lost' && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={resetGame}
                      className="backdrop-blur-xl bg-white/10 hover:bg-white/20 rounded-xl px-8 py-3 border border-white/10 text-white font-semibold transition-all duration-300"
                    >
                      🔄 Reiniciar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de Instrucciones */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/10 p-8 max-w-md">
            <div className="text-center">
              <div className="text-6xl mb-4">🧠</div>
              <h2 className="text-3xl font-bold text-white mb-4">Memorizar símbolos</h2>
              <div className="text-white/90 text-left space-y-3 mb-6">
                <p>• Verás 6 símbolos con números por <span className="text-blue-400 font-bold">5 segundos</span></p>
                <p>• Memoriza qué símbolo está en cada posición (1-6)</p>
                <p>• Te preguntarán: "¿Qué símbolo estaba en #X?"</p>
                <p>• Selecciona entre 3 opciones el símbolo correcto</p>
                <p>• Completa <span className="text-cyan-400 font-bold">3 rondas</span> para ganar</p>
              </div>
              
              <button
                onClick={startGame}
                className="w-full py-4 rounded-xl font-semibold text-white text-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                  boxShadow: '0 10px 30px rgba(42, 157, 143, 0.3)'
                }}
              >
                ¡Empezar a Jugar!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Victoria */}
      {gamePhase === 'won' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/10 p-8 max-w-md">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-400 mb-4">¡Ganaste!</h2>
              <p className="text-white/80 text-lg mb-6">
                ¡Excelente memoria! Completaste las 3 rondas correctamente.
              </p>
              
              <button
                onClick={resetGame}
                className="w-full py-4 rounded-xl font-semibold text-white text-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
                }}
              >
                🎮 Jugar de Nuevo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Derrota */}
      {gamePhase === 'lost' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/10 p-8 max-w-md animate-shake">
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-3xl font-bold text-red-400 mb-4">¡Perdiste!</h2>
              <p className="text-white/80 text-lg mb-6">
                No seleccionaste el símbolo correcto. ¡Inténtalo de nuevo!
              </p>
              
              <button
                onClick={resetGame}
                className="w-full py-4 rounded-xl font-semibold text-white text-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)'
                }}
              >
                🔄 Reintentar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemorizarPage;
