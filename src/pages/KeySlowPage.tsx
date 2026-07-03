import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../style/style.css';

type Arrow = 'up' | 'down' | 'left' | 'right';

const KeySlowPage = () => {
  const navigate = useNavigate();
  const totalArrows = 8;
  const timeLimit = 6; // 6 segundos para completar

  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [mistakes, setMistakes] = useState(0);

  // Generar flechas aleatorias
  useEffect(() => {
    const arrowTypes: Arrow[] = ['up', 'down', 'left', 'right'];
    const randomArrows = Array.from({ length: totalArrows }, () => 
      arrowTypes[Math.floor(Math.random() * arrowTypes.length)]
    );
    setArrows(randomArrows);
  }, []);

  // Countdown inicial
  useEffect(() => {
    if (countdown > 0 && !gameWon && !gameLost) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [countdown, gameWon, gameLost]);

  // Temporizador del juego - inicia inmediatamente cuando countdown llega a 0
  useEffect(() => {
    if (gameWon || gameLost || showInstructions || countdown > 0) return;

    // Ejecutar inmediatamente la primera vez
    let timeElapsed = 0;
    const startTime = Date.now();
    
    const timer = setInterval(() => {
      const currentTime = Date.now();
      const secondsPassed = Math.floor((currentTime - startTime) / 1000);
      
      if (secondsPassed > timeElapsed) {
        timeElapsed = secondsPassed;
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameLost(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 100); // Verificar cada 100ms para mayor precisión

    return () => clearInterval(timer);
  }, [gameWon, gameLost, showInstructions, countdown]);

  // Obtener símbolo de flecha
  const getArrowSymbol = (arrow: Arrow) => {
    switch (arrow) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'left': return '←';
      case 'right': return '→';
    }
  };

  // Obtener nombre de tecla
  const getKeyName = (arrow: Arrow) => {
    switch (arrow) {
      case 'up': return 'ArrowUp';
      case 'down': return 'ArrowDown';
      case 'left': return 'ArrowLeft';
      case 'right': return 'ArrowRight';
    }
  };

  // Manejar teclas presionadas
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (countdown > 0 || gameWon || gameLost || currentIndex >= totalArrows) return;

    const key = event.key;
    const expectedKey = getKeyName(arrows[currentIndex]);

    if (key === expectedKey) {
      // Tecla correcta
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);

      // Verificar victoria
      if (newIndex === totalArrows) {
        setGameWon(true);
      }
    } else if (key.startsWith('Arrow')) {
      // Tecla incorrecta (pero es una flecha) - PERDER EL JUEGO
      setMistakes(prev => prev + 1);
      setGameLost(true);
    }
  }, [countdown, gameWon, gameLost, currentIndex, arrows, totalArrows]);

  // Agregar event listener para teclas
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Reiniciar juego
  const resetGame = () => {
    const arrowTypes: Arrow[] = ['up', 'down', 'left', 'right'];
    const randomArrows = Array.from({ length: totalArrows }, () => 
      arrowTypes[Math.floor(Math.random() * arrowTypes.length)]
    );
    setArrows(randomArrows);
    setCurrentIndex(0);
    setMistakes(0);
    setTimeLeft(timeLimit);
    setCountdown(5);
    setGameWon(false);
    setGameLost(false);
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(to bottom right, #000000, #3d3d0a, #000000, #5c5c1a)' }}>
      <Navbar />

      {/* Contenido */}
      <div className="relative z-10 container mx-auto px-4 py-8 pt-28">
        {/* Título */}
        <div className="text-center mb-8">
          <div className="backdrop-blur-xl inline-block px-8 py-4 rounded-2xl shadow-2xl border-2" style={{ background: 'linear-gradient(to right, rgba(0, 0, 0, 0.95), rgba(50, 50, 10, 0.9))', borderColor: '#FFD700', boxShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white">🐌 Key Slow</h1>
            <p className="text-white/80 mt-2">Presiona las flechas con calma</p>
          </div>
        </div>

        {/* Mostrar tablero siempre (con o sin countdown) */}
        {!showInstructions && (
          <>
            {/* Game Board */}
            <div className="max-w-6xl mx-auto">
              <div className="backdrop-blur-xl bg-white/5 rounded-3xl shadow-2xl p-4 md:p-8 border border-white/10">
                {/* Área de flechas */}
                <div className="relative min-h-[200px] flex items-center justify-center p-4">
                  {/* Countdown en el centro */}
                  {countdown > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center z-50">
                      <div className="relative w-64 h-64">
                        <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: 'rgba(42, 157, 143, 0.2)', transform: 'scale(1.1)' }}></div>
                        <div 
                          className="absolute inset-0 rounded-full flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
                            boxShadow: '0 0 40px rgba(42, 157, 143, 0.6), inset 0 4px 20px rgba(255, 255, 255, 0.2)',
                            border: '4px solid white'
                          }}
                        >
                          <div 
                            className="absolute inset-8 rounded-full"
                            style={{ border: '2px dashed rgba(255, 255, 255, 0.3)' }}
                          ></div>
                          <div className="relative z-10 flex flex-col items-center">
                            <div 
                              className="text-9xl font-bold text-white"
                              style={{ 
                                textShadow: '0 4px 12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 255, 255, 0.3)',
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
                              }}
                            >
                              {countdown}
                            </div>
                            <p className="text-xl text-white/80 mt-2" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>
                              Preparando...
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Flechas horizontales */}
                  {countdown === 0 && (
                    <div className="w-full max-w-4xl">
                      <div className="flex gap-2 justify-center items-center flex-wrap">
                        {arrows.map((arrow, index) => (
                          <div
                            key={index}
                            className={`w-14 h-14 flex items-center justify-center text-3xl font-bold rounded-lg transition-all duration-300 flex-shrink-0 ${
                              index < currentIndex
                                ? 'bg-green-500/80 text-white scale-95'
                                : index === currentIndex
                                ? 'bg-yellow-500/80 text-white scale-110 animate-pulse'
                                : 'bg-white/10 text-white/40'
                            }`}
                            style={{
                              border: index === currentIndex ? '3px solid #FFD700' : '2px solid rgba(255, 255, 255, 0.2)',
                              boxShadow: index === currentIndex ? '0 0 20px rgba(255, 215, 0, 0.6)' : 'none'
                            }}
                          >
                            {getArrowSymbol(arrow)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Barra de progreso del tiempo */}
                <div className="mt-8 max-w-md mx-auto">
                  <div className="backdrop-blur-xl bg-white/10 rounded-full h-6 overflow-hidden border border-white/20">
                    <div 
                      className="h-full transition-all duration-1000 ease-linear"
                      style={{
                        width: `${(timeLeft / timeLimit) * 100}%`,
                        background: timeLeft <= 5 
                          ? 'linear-gradient(to right, #FF4444, #CC0000)' 
                          : timeLeft <= 10
                          ? 'linear-gradient(to right, #FFA500, #FFD700)'
                          : 'linear-gradient(to right, #10B981, #34D399)'
                      }}
                    >
                      <div className="flex items-center justify-center h-full">
                        <span className="text-white font-bold text-sm">{timeLeft}s</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-6 flex justify-center gap-4 flex-wrap">
                  <div className="backdrop-blur-xl bg-white/10 rounded-xl px-6 py-3 border border-white/10">
                    <p className="text-white font-semibold">Progreso: <span className="text-cyan-300">{currentIndex}/{totalArrows}</span></p>
                  </div>
                  <div className="backdrop-blur-xl bg-white/10 rounded-xl px-6 py-3 border border-white/10">
                    <p className="text-white font-semibold">Errores: <span className="text-red-400">{mistakes}</span></p>
                  </div>
                  <div className="backdrop-blur-xl bg-white/10 rounded-xl px-6 py-3 border border-white/10">
                    <p className="text-white font-semibold">Tiempo: <span className={timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-green-400"}>{timeLeft}s</span></p>
                  </div>
                  <button
                    onClick={resetGame}
                    className="backdrop-blur-xl bg-white/10 hover:bg-white/20 rounded-xl px-6 py-3 border border-white/10 text-white font-semibold transition-all duration-300"
                  >
                    🔄 Reiniciar
                  </button>
                </div>

                {/* Instrucciones */}
                <div className="mt-6 text-center">
                  <p className="text-white/80 text-lg font-semibold mb-2">⌨️ Usa las teclas de flecha del teclado</p>
                  <p className="text-white/60 text-sm">Presiona la flecha que está resaltada en amarillo</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de Instrucciones */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/10 p-8 max-w-md">
            <h2 className="text-3xl font-bold text-white mb-4">📖 Instrucciones</h2>
            <div className="space-y-3 text-white/90 text-lg">
              <p>🎯 <strong>Objetivo:</strong> Presiona las 8 flechas en orden en 6 segundos</p>
              <p>⌨️ <strong>Controles:</strong> Usa las teclas de flecha del teclado (↑ ↓ ← →)</p>
              <p>💛 <strong>Flecha amarilla:</strong> Es la siguiente que debes presionar</p>
              <p>✅ <strong>Flechas verdes:</strong> Ya las completaste correctamente</p>
              <p>⏱️ <strong>Tiempo:</strong> Tienes 6 segundos - ¡sé rápido!</p>
              <p>❌ <strong>Errores:</strong> Se cuentan las teclas incorrectas</p>
            </div>
            <button
              onClick={() => {
                setShowInstructions(false);
                setCountdown(5);
              }}
              className="w-full mt-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #2A9D8F, #3BB9AB)',
                boxShadow: '0 10px 30px rgba(42, 157, 143, 0.3)'
              }}
            >
              ¡Empezar a Jugar!
            </button>
          </div>
        </div>
      )}

      {/* Modal de Derrota */}
      {gameLost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/10 p-8 max-w-md animate-slideUp">
            <div className="text-center">
              <div className="text-6xl mb-4">{timeLeft === 0 ? '⏱️' : '❌'}</div>
              <h2 className="text-4xl font-bold text-white mb-4">{timeLeft === 0 ? '¡Se acabó el tiempo!' : '¡Te equivocaste!'}</h2>
              <p className="text-xl text-red-400 mb-2">{timeLeft === 0 ? 'Tiempo agotado' : 'Presionaste la tecla incorrecta'}</p>
              <p className="text-white/80 mb-2">Completaste: {currentIndex}/{totalArrows}</p>
              <p className="text-white/80 mb-6">Errores: {mistakes}</p>
              
              <div className="flex gap-4">
                <button
                  onClick={resetGame}
                  className="flex-1 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #2A9D8F, #3BB9AB)',
                    boxShadow: '0 10px 30px rgba(42, 157, 143, 0.3)'
                  }}
                >
                  🔄 Intentar de Nuevo
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02] bg-white/10 hover:bg-white/20"
                >
                  ← Volver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Victoria */}
      {gameWon && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/10 p-8 max-w-md animate-slideUp">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-4xl font-bold text-white mb-4">¡Ganaste!</h2>
              <p className="text-2xl text-cyan-300 mb-2">¡Completaste todas las flechas!</p>
              <p className="text-white/80 mb-2">Tiempo restante: {timeLeft}s</p>
              <p className="text-white/80 mb-6">Errores: {mistakes}</p>
              
              <div className="flex gap-4">
                <button
                  onClick={resetGame}
                  className="flex-1 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #2A9D8F, #3BB9AB)',
                    boxShadow: '0 10px 30px rgba(42, 157, 143, 0.3)'
                  }}
                >
                  🔄 Jugar de Nuevo
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02] bg-white/10 hover:bg-white/20"
                >
                  ← Volver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeySlowPage;
