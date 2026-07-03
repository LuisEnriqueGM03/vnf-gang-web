import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import '../style/style.css';

const BruteForcePage = () => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [gamePhase, setGamePhase] = useState<'playing' | 'won' | 'lost'>('playing');
  const [currentColumn, setCurrentColumn] = useState(0);
  const [stoppedColumns, setStoppedColumns] = useState<boolean[]>(new Array(8).fill(false));

  const generateGame = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const matrix: string[][] = [];
    const redLettersPositions: Array<{row: number, col: number}> = [];
    
    // Crear matriz 9 filas x 8 columnas
    for (let row = 0; row < 9; row++) {
      const matrixRow: string[] = [];
      for (let col = 0; col < 8; col++) {
        const randomLetter = letters[Math.floor(Math.random() * letters.length)];
        matrixRow.push(randomLetter);
      }
      matrix.push(matrixRow);
    }

    // Generar 1 letra roja por columna (8 letras rojas en total)
    // Cada columna tiene su letra roja en una fila aleatoria
    for (let col = 0; col < 8; col++) {
      const row = Math.floor(Math.random() * 9); // Fila aleatoria (0-8)
      redLettersPositions.push({ row, col });
    }

    return { matrix, redLettersPositions };
  };

  const [gameData, setGameData] = useState(() => generateGame());
  const [matrix, setMatrix] = useState(gameData.matrix);
  const [redLettersPositions, setRedLettersPositions] = useState(gameData.redLettersPositions);
  const [capturedLetters, setCapturedLetters] = useState<Array<{row: number, col: number}>>([]);
  const [instantIndicator, setInstantIndicator] = useState(false);
  // Posición de scroll vertical por columna (cada columna se mueve independientemente)
  const [columnScrollPositions, setColumnScrollPositions] = useState<number[]>(new Array(8).fill(0));
  const REEL_HEIGHT = 450; // debe coincidir con el style height del contenedor
  const ROWS = 9;
  const ROW_HEIGHT = REEL_HEIGHT / ROWS; // px por fila
  const REPEATS = 3; // cuántas veces repetimos la matriz verticalmente


  // Mover cada columna hacia abajo independientemente con animación fluida
  useEffect(() => {
    if (gamePhase !== 'playing' || showInstructions) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      setColumnScrollPositions(prev => 
        prev.map((pos, colIndex) => {
          if (stoppedColumns[colIndex]) return pos;
          // Velocidad más rápida: 0.008 unidades por milisegundo (~7.2 filas/seg)
          const deltaUnits = (deltaTime * 0.008);
          let next = pos - deltaUnits; // Negativo para ir hacia abajo
          // wrap loop: mantener la posición siempre entre 0 y ROWS
          if (next < 0) {
            next = next + ROWS;
          }
          return next;
        })
      );

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [gamePhase, showInstructions, stoppedColumns]);

  const captureRedLetter = useCallback(() => {
    // Obtener la posición actual del scroll en la columna
    const scrollPos = columnScrollPositions[currentColumn];
    
    // La línea de captura está en el centro del contenedor (posición 4.5 de 9 filas)
    const captureLinePosition = 3.5;
    
    // Buscar la letra roja de la columna actual
    const redLetterForColumn = redLettersPositions.find(pos => pos.col === currentColumn);
    
    if (!redLetterForColumn) return;
    
    // Calcular la distancia entre la posición de la letra roja y la línea de captura
    // Considerando el scroll actual
    const redLetterCurrentPos = (redLetterForColumn.row - scrollPos + ROWS) % ROWS;
    const distance = Math.abs(redLetterCurrentPos - captureLinePosition);
    
    // Margen de error: 0.5 unidades (toda el área del cuadrado de captura)
    const isRedLetterInCaptureZone = distance < 0.5;
    
    const alreadyCaptured = capturedLetters.some(cap => 
      cap.row === redLetterForColumn.row && cap.col === redLetterForColumn.col
    );

    if (isRedLetterInCaptureZone && !alreadyCaptured) {
      // ¡Captura exitosa!
      const newCaptured = [...capturedLetters, redLetterForColumn];
      const newStoppedColumns = [...stoppedColumns];
      newStoppedColumns[currentColumn] = true; // Detener permanentemente
      
  // Ajustar posición para que quede perfectamente centrada
  // Normalizar la posición dentro del rango [0, ROWS) para evitar valores negativos
  const rawTarget = redLetterForColumn.row - captureLinePosition;
  const normalizedTarget = ((rawTarget % ROWS) + ROWS) % ROWS;
  const newColumnScrollPositions = [...columnScrollPositions];
  newColumnScrollPositions[currentColumn] = normalizedTarget;
      
      setCapturedLetters(newCaptured);
      setStoppedColumns(newStoppedColumns);
      setColumnScrollPositions(newColumnScrollPositions);
      
      // Ya no desdetenemos la columna - se queda quieta permanentemente
      
      // Pasar a la siguiente columna o ganar
      if (currentColumn < 7) {
        // avanzar inmediatamente a la siguiente columna y mover indicador sin transición
        setInstantIndicator(true);
        setCurrentColumn(currentColumn + 1);
        // restaurar la transición en el siguiente frame para evitar reflow visible
        requestAnimationFrame(() => setInstantIndicator(false));
      } else {
        // pequeño delay antes de mostrar pantalla de victoria para que el usuario vea la última captura
        setTimeout(() => setGamePhase('won'), 300);
      }
    } else {
      // Falló - retroceder
      if (currentColumn > 0 && capturedLetters.length > 0) {
        const newCaptured = capturedLetters.slice(0, -1);
        const newStoppedColumns = [...stoppedColumns];
        newStoppedColumns[currentColumn - 1] = false;
        
        setCapturedLetters(newCaptured);
        setStoppedColumns(newStoppedColumns);
        setCurrentColumn(currentColumn - 1);
      }
    }
  }, [columnScrollPositions, redLettersPositions, capturedLetters, currentColumn, stoppedColumns, ROWS]);

  const handleCapture = useCallback(() => {
    captureRedLetter();
  }, [captureRedLetter]);

  useEffect(() => {
    if (gamePhase !== 'playing' || showInstructions) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCapture();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase, showInstructions, handleCapture, currentColumn]);

  const resetGame = () => {
    setGamePhase('playing');
    setColumnScrollPositions(new Array(8).fill(0));
    setCapturedLetters([]);
    setCurrentColumn(0);
    setStoppedColumns(new Array(8).fill(false));
    const newGame = generateGame();
    setGameData(newGame);
    setMatrix(newGame.matrix);
    setRedLettersPositions(newGame.redLettersPositions);
  };

  const startGame = () => {
    setShowInstructions(false);
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(to bottom right, #000000, #3d3d0a, #000000, #5c5c1a)' }}>
      <Navbar />
      
      <div className="relative z-10 container mx-auto px-4 py-8 pt-28">
        <div className="text-center mb-8">
          <div className="backdrop-blur-xl inline-block px-8 py-4 rounded-2xl shadow-2xl border-2" style={{ background: 'linear-gradient(to right, rgba(0, 0, 0, 0.95), rgba(50, 50, 10, 0.9))', borderColor: '#FFD700', boxShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white">💻 BRUTEFORCE</h1>
            
          </div>
        </div>

        {!showInstructions && (
          <>
            <div className="max-w-4xl mx-auto">
              <div className="backdrop-blur-xl bg-black/80 rounded-2xl shadow-2xl p-6 border border-cyan-400/30">
                {/* indicadores removidos por solicitud del usuario */}

                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mb-6"></div>

                <div className="bg-black/60 p-6 rounded-xl mb-6 relative overflow-hidden border-4 border-cyan-400/50 shadow-2xl" style={{ height: '450px', background: 'linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(29,126,115,0.06) 50%, rgba(6,182,212,0.04) 100%)' }}>
                  {/* Efecto de luz superior estilo casino */}
                  <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-cyan-400/20 to-transparent pointer-events-none z-20"></div>
                  
                  {/* Efecto de luz inferior estilo casino */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-cyan-400/20 to-transparent pointer-events-none z-20"></div>
                  
                  {/* Línea horizontal de captura con efecto neón - área completa del cuadrado */}
                  <div className="absolute left-0 right-0 pointer-events-none z-30" style={{ top: 'calc(50% - 25px)', height: '50px' }}>
                    <div className="relative h-full">
                      {/* Glow superior (celeste) */}
                      <div className="absolute inset-x-0 -top-1 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 blur-sm"></div>
                      {/* Línea principal superior (celeste) */}
                      <div className="border-t-4 border-cyan-400 shadow-lg shadow-cyan-500/50"></div>
                      {/* Área de captura completa - toda el área es zona de captura (celeste tenue) */}
                      <div className="h-full bg-cyan-500/10 border-l-2 border-r-2 border-cyan-400/30"></div>
                      {/* Línea principal inferior (celeste) */}
                      <div className="border-b-4 border-cyan-400 shadow-lg shadow-cyan-500/50"></div>
                      {/* Glow inferior (celeste) */}
                      <div className="absolute inset-x-0 -bottom-1 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 blur-sm"></div>
                    </div>
                  </div>
                  
                  {/* Indicador de columna activa con efecto luminoso */}
                  <div 
                    className={`absolute top-0 bottom-0 pointer-events-none z-20 ${instantIndicator ? '' : 'transition-all duration-500 ease-out'}`} 
                    style={{ 
                      left: `calc(50% - 282px + ${currentColumn * 72}px)`,
                      width: '60px'
                    }}
                  >
                    {/* Sin glow exterior */}
                    
                    {/* Columna activa sin fondo */}
                    <div className="absolute inset-0">
                      <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-green-400 via-green-500 to-green-400 shadow-lg shadow-green-500/50"></div>
                      <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-green-400 via-green-500 to-green-400 shadow-lg shadow-green-500/50"></div>
                    </div>
                    {/* Indicador superior */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-green-400 animate-bounce">
                      <div className="text-3xl">▼</div>
                    </div>
                    {/* Indicador inferior */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-green-400 animate-bounce">
                      <div className="text-3xl">▲</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-center h-full items-center">
                    {/* Cada columna es un carrete de ruleta */}
                    {Array.from({ length: 8 }, (_, colIndex) => (
                      <div 
                        key={colIndex} 
                        className="relative overflow-hidden rounded-lg border-2 border-cyan-600/30 shadow-inner bg-gradient-to-b from-gray-900/50 to-black/50"
                        style={{ 
                          width: '60px',
                          height: '100%',
                          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
                        }}
                      >
                        <div 
                          className="absolute inset-0"
                          style={{
                            // Renderizar matriz repetida con suficiente altura para el loop
                            transform: `translate3d(0, ${-columnScrollPositions[colIndex] * ROW_HEIGHT}px, 0)`,
                            transition: 'none',
                            willChange: 'transform'
                          }}
                        >
                          {/* Loop infinito de letras - repetimos REPEATS veces */}
                          {Array.from({ length: ROWS * REPEATS }, (_, cycleIndex) => {
                            const actualRowIndex = cycleIndex % ROWS;
                            const letter = matrix[actualRowIndex][colIndex];
                            
                            // Verificar si es letra roja
                            const isRedLetter = redLettersPositions.some(pos => 
                              pos.row === actualRowIndex && pos.col === colIndex
                            );
                            
                            // Verificar si ya fue capturada
                            const isCaptured = capturedLetters.some(cap => 
                              cap.row === actualRowIndex && cap.col === colIndex
                            );
                            
                            return (
                              <div
                                key={cycleIndex}
                                className={`
                                  w-full flex items-center justify-center font-mono text-5xl font-black bruteforce-letter
                                  transition-all duration-200
                                  ${
                                    isCaptured
                                      ? 'text-green-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]'
                                      : isRedLetter
                                      ? 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,1)]'
                                      : 'text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                                  }
                                `}
                                style={{ 
                                  height: `${ROW_HEIGHT}px`,
                                  lineHeight: `${ROW_HEIGHT}px`,
                                  textShadow: isCaptured 
                                    ? '0 0 20px rgba(34,197,94,0.8), 0 0 30px rgba(34,197,94,0.5)'
                                    : isRedLetter 
                                    ? '0 0 25px rgba(239,68,68,1), 0 0 40px rgba(239,68,68,0.6)'
                                    : '0 2px 8px rgba(0,0,0,0.9)'
                                }}
                              >
                                {letter}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mb-6"></div>

                <div className="bg-gray-900/60 rounded-xl p-4 mb-4 border border-cyan-500/30 shadow-lg">
                  <p className="text-cyan-400 text-center text-sm mb-2 font-mono font-bold animate-pulse">
                    🎰 ZONA DE CAPTURA 🎰
                  </p>
                  <p className="text-white/90 text-center text-sm mb-2 font-mono">
                    Presiona <span className="font-bold text-cyan-400 bg-cyan-400/20 px-2 py-1 rounded">ENTER</span> cuando la letra <span className="font-bold text-red-500">ROJA</span> pase por la <span className="font-bold text-cyan-400">línea central</span>
                  </p>
                  <p className="text-white/70 text-center text-xs">
                    ✅ Acierto: Columna se detiene y avanzas | ❌ Error: Retrocedes una columna
                  </p>
                </div>

                {gamePhase !== 'won' && gamePhase !== 'lost' && (
                  <div className="flex justify-center">
                    <button
                      onClick={resetGame}
                      className="backdrop-blur-xl bg-white/10 hover:bg-white/20 rounded-xl px-8 py-3 border border-cyan-400/30 text-cyan-400 font-semibold transition-all duration-300"
                    >
                      🔄 Reiniciar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {showInstructions && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="backdrop-blur-xl bg-black/70 rounded-3xl shadow-2xl border border-cyan-400/30 p-8 max-w-md">
              <div className="text-center">
                <div className="text-6xl mb-4">💻</div>
                <h2 className="text-3xl font-bold text-white mb-4">BRUTEFORCE</h2>
                <div className="text-white/90 text-center space-y-3 mb-6">
                  <p className="font-bold text-cyan-400 text-lg">🎰 Instrucciones:</p>
                  <p>Los <span className="text-cyan-400 font-bold">carretes giran</span> continuamente como una ruleta</p>
                  <p>Hay <span className="text-red-500 font-bold">8 letras rojas</span> (una por carrete)</p>
                  <p>El <span className="text-cyan-500 font-bold">marco</span> indica el carrete activo</p>
                  <p>Presiona <span className="text-cyan-400 font-bold bg-cyan-400/20 px-2 py-1 rounded">ENTER</span> cuando la letra roja pase por la <span className="text-cyan-500 font-bold">línea central</span></p>
                  <p className="text-sm">✅ Acierto: El carrete se detiene | ❌ Error: Retrocedes</p>
                  <p className="text-sm text-white/70">¡Detén los 8 carretes para ganar!</p>
                </div>
                
                <button
                  onClick={startGame}
                  className="w-full py-4 rounded-xl font-semibold text-black text-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] bg-cyan-500"
                >
                  🚀 Iniciar Hack
                </button>
              </div>
            </div>
          </div>
        )}

        {gamePhase === 'won' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
            <div className="backdrop-blur-xl bg-black/70 rounded-3xl shadow-2xl border border-cyan-400/30 p-8 max-w-md animate-scaleIn">
              <div className="text-center">
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h2 className="text-3xl font-bold text-cyan-400 mb-4">¡ACCESO CONCEDIDO!</h2>
                <p className="text-white/80 text-lg mb-6">
                  ¡Crackeaste la contraseña!
                </p>
                
                <button
                  onClick={resetGame}
                  className="w-full py-4 rounded-xl font-semibold text-black text-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] bg-cyan-500"
                >
                  🔄 Nuevo Hack
                </button>
              </div>
            </div>
          </div>
        )}

        {gamePhase === 'lost' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
            <div className="backdrop-blur-xl bg-black/70 rounded-3xl shadow-2xl border border-red-500/30 p-8 max-w-md animate-scaleIn">
              <div className="text-center">
                <div className="text-6xl mb-4">🚫</div>
                <h2 className="text-3xl font-bold text-red-400 mb-4">ACCESO DENEGADO</h2>
                <p className="text-white/80 text-lg mb-6">
                  Contraseña incorrecta
                </p>
                
                <button
                  onClick={resetGame}
                  className="w-full py-4 rounded-xl font-semibold text-white text-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] bg-red-600"
                >
                  🔄 Reintentar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BruteForcePage;
