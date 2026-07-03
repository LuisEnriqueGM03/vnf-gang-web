import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Navbar from '../components/Navbar';
import '../style/style.css';

type Corner = 'top' | 'right' | 'bottom' | 'left';

interface Target {
  x: number;
  y: number;
  progress: number; // 0-1 progreso en el recorrido total
}

const GanzuadoPage = () => {
  const totalLaps = 2; // 2 vueltas completas

  // Generar número aleatorio de objetivos (4-6)
  const [numTargets] = useState(() => Math.floor(Math.random() * 3) + 4); // 4, 5 o 6
  const [targets, setTargets] = useState<Target[]>([]);
  const [ballPosition, setBallPosition] = useState({ x: 400, y: 100 }); // Empieza arriba
  const [hitTargets, setHitTargets] = useState<boolean[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0); // Progreso actual en el recorrido (0-2)

  // Usar ref para hitTargets para evitar reiniciar la animación
  const hitTargetsRef = useRef(hitTargets);
  useEffect(() => {
    hitTargetsRef.current = hitTargets;
  }, [hitTargets]);

  // Usar ref para gameLost para detener la animación inmediatamente
  const gameLostRef = useRef(gameLost);
  useEffect(() => {
    gameLostRef.current = gameLost;
  }, [gameLost]);

  // Usar ref para gameWon para detener la animación inmediatamente
  const gameWonRef = useRef(gameWon);
  useEffect(() => {
    gameWonRef.current = gameWon;
  }, [gameWon]);

  // Posiciones de las esquinas del rombo (useMemo para evitar recrear el array)
  // Orden: arriba → derecha → abajo → izquierda
  const corners = useMemo(() => [
    { x: 400, y: 100, name: 'top' as Corner },     // 0: Arriba
    { x: 600, y: 300, name: 'right' as Corner },   // 1: Derecha
    { x: 400, y: 500, name: 'bottom' as Corner },  // 2: Abajo
    { x: 200, y: 300, name: 'left' as Corner }     // 3: Izquierda
  ], []);

  // Generar objetivos aleatorios a lo largo del rombo con separación mínima
  useEffect(() => {
    const newTargets: Target[] = [];
    const newHits: boolean[] = [];
    const minDistance = 84; // Distancia mínima entre objetivos (5% más que antes)
    const maxAttempts = 50; // Intentos máximos por objetivo

    for (let i = 0; i < numTargets; i++) {
      let attempts = 0;
      let validPosition = false;
      let newTarget: Target | null = null;

      while (!validPosition && attempts < maxAttempts) {
        // Generar progreso aleatorio entre 0.1 y 1.9
        const progress = 0.1 + Math.random() * 1.8;

        // Calcular posición basada en el progreso
        const segment = Math.floor((progress % 1) * 4);
        const segmentProgress = ((progress % 1) * 4) % 1;

        const startCorner = corners[segment];
        const endCorner = corners[(segment + 1) % 4];

        const x = startCorner.x + (endCorner.x - startCorner.x) * segmentProgress;
        const y = startCorner.y + (endCorner.y - startCorner.y) * segmentProgress;

        // Verificar distancia con otros objetivos
        let isFarEnough = true;
        for (const existingTarget of newTargets) {
          const distance = Math.sqrt(
            Math.pow(x - existingTarget.x, 2) +
            Math.pow(y - existingTarget.y, 2)
          );

          if (distance < minDistance) {
            isFarEnough = false;
            break;
          }
        }

        if (isFarEnough) {
          newTarget = { x, y, progress };
          validPosition = true;
        }

        attempts++;
      }

      if (newTarget) {
        newTargets.push(newTarget);
        newHits.push(false);
      }
    }

    // Ordenar objetivos por progreso
    newTargets.sort((a, b) => a.progress - b.progress);

    setTargets(newTargets);
    setHitTargets(newHits);
  }, [numTargets, corners]);

  // Countdown inicial
  useEffect(() => {
    if (countdown > 0 && !gameWon && !gameLost) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !showInstructions && !gameWon && !gameLost && !isMoving) {
      // Iniciar movimiento de la pelota
      setIsMoving(true);
    }
  }, [countdown, gameWon, gameLost, showInstructions, isMoving]);

  // Movimiento continuo de la pelota por el rombo
  useEffect(() => {
    if (!isMoving || gameWon || gameLost || targets.length === 0) return;

    const totalDuration = 3909; // 3.91 segundos para completar 2 vueltas (0.49s por segmento * 4 * 2)
    const startTime = Date.now();

    const animate = () => {
      // Si ganó o perdió, no continuar la animación
      if (gameWonRef.current || gameLostRef.current) {
        return;
      }

      const elapsed = Date.now() - startTime;
      const globalProgress = Math.min(elapsed / totalDuration, 1) * totalLaps; // 0 a 2

      if (globalProgress >= totalLaps) {
        // Terminó las 2 vueltas
        const hasHitAll = hitTargetsRef.current.every((hit: boolean) => hit);
        if (hasHitAll) {
          setGameWon(true);
        } else {
          setGameLost(true);
        }
        setIsMoving(false);
        return;
      }

      // Calcular posición actual en el rombo
      const segment = Math.floor((globalProgress % 1) * 4); // 0-3
      const segmentProgress = ((globalProgress % 1) * 4) % 1; // 0-1

      const startCorner = corners[segment];
      const endCorner = corners[(segment + 1) % 4];

      const x = startCorner.x + (endCorner.x - startCorner.x) * segmentProgress;
      const y = startCorner.y + (endCorner.y - startCorner.y) * segmentProgress;

      setBallPosition({ x, y });
      setCurrentProgress(globalProgress);

      requestAnimationFrame(animate);
    };

    animate();
  }, [isMoving, gameWon, gameLost, corners, totalLaps, targets.length]);

  // Manejar tecla E - detectar si está cerca de algún objetivo
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key.toLowerCase() === 'e' && isMoving && !gameWon && !gameLost) {
      // Verificar si está cerca de algún objetivo no acertado
      const threshold = 40; // Distancia para considerar "cerca"
      let hitAnyTarget = false;

      targets.forEach((target, index) => {
        if (!hitTargetsRef.current[index]) {
          const distance = Math.sqrt(
            Math.pow(ballPosition.x - target.x, 2) +
            Math.pow(ballPosition.y - target.y, 2)
          );

          if (distance < threshold) {
            hitAnyTarget = true;
            setHitTargets(prev => {
              const newHits = [...prev];
              newHits[index] = true;

              // Verificar si completó todos los objetivos
              const allHit = newHits.every(hit => hit);
              if (allHit) {
                setGameWon(true);
                setIsMoving(false);
              }

              return newHits;
            });
          }
        }
      });

      // Si presionó E y no estaba cerca de ningún objetivo, pierde
      if (!hitAnyTarget) {
        setGameLost(true);
        setIsMoving(false);
      }
    }
  }, [isMoving, gameWon, gameLost, targets, ballPosition]);

  // Agregar event listener para teclas
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Reiniciar juego
  const resetGame = () => {
    setBallPosition({ x: 400, y: 100 });
    setGameWon(false);
    setGameLost(false);
    setCountdown(5);
    setIsMoving(false);
    setCurrentProgress(0);

    // Regenerar objetivos aleatorios con separación mínima
    const newTargets: Target[] = [];
    const newHits: boolean[] = [];
    const newNumTargets = Math.floor(Math.random() * 3) + 4; // 4, 5 o 6
    const minDistance = 84; // 5% más separados
    const maxAttempts = 50;

    for (let i = 0; i < newNumTargets; i++) {
      let attempts = 0;
      let validPosition = false;
      let newTarget: Target | null = null;

      while (!validPosition && attempts < maxAttempts) {
        const progress = 0.1 + Math.random() * 1.8;
        const segment = Math.floor((progress % 1) * 4);
        const segmentProgress = ((progress % 1) * 4) % 1;

        const startCorner = corners[segment];
        const endCorner = corners[(segment + 1) % 4];

        const x = startCorner.x + (endCorner.x - startCorner.x) * segmentProgress;
        const y = startCorner.y + (endCorner.y - startCorner.y) * segmentProgress;

        // Verificar distancia con otros objetivos
        let isFarEnough = true;
        for (const existingTarget of newTargets) {
          const distance = Math.sqrt(
            Math.pow(x - existingTarget.x, 2) +
            Math.pow(y - existingTarget.y, 2)
          );

          if (distance < minDistance) {
            isFarEnough = false;
            break;
          }
        }

        if (isFarEnough) {
          newTarget = { x, y, progress };
          validPosition = true;
        }

        attempts++;
      }

      if (newTarget) {
        newTargets.push(newTarget);
        newHits.push(false);
      }
    }

    newTargets.sort((a, b) => a.progress - b.progress);
    setTargets(newTargets);
    setHitTargets(newHits);
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(to bottom right, #000000, #3d3d0a, #000000, #5c5c1a)' }}>
      <Navbar />

      {/* Contenido */}
      <div className="relative z-10 container mx-auto px-4 py-8 pt-28">
        {/* Título */}
        <div className="text-center mb-8">
          <div className="backdrop-blur-xl inline-block px-8 py-4 rounded-2xl shadow-2xl border-2" style={{ background: 'linear-gradient(to right, rgba(0, 0, 0, 0.95), rgba(50, 50, 10, 0.9))', borderColor: '#FFD700', boxShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white">🔓 Ganzuado</h1>
            <p className="text-white/80 mt-2">Presiona E en el momento exacto</p>
          </div>
        </div>

        {/* Mostrar tablero siempre */}
        {!showInstructions && (
          <>
            {/* Game Board */}
            <div className="max-w-4xl mx-auto">
              <div className="backdrop-blur-xl bg-white/5 rounded-3xl shadow-2xl p-8 border border-white/10">
                {/* Banner de estado arriba */}
                <div className="mb-6 flex justify-center">
                  <div
                    className="backdrop-blur-xl rounded-2xl px-8 py-3 border border-white/20 transition-all duration-300"
                    style={{
                      background: gameWon
                        ? 'rgba(16, 185, 129, 0.3)'
                        : gameLost
                          ? 'rgba(239, 68, 68, 0.3)'
                          : countdown > 0
                            ? 'rgba(59, 130, 246, 0.3)'
                            : 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <p className="text-white font-semibold text-lg">
                      {gameWon
                        ? '🎉 ¡Ganaste! Completaste todos los objetivos'
                        : gameLost
                          ? '❌ Perdiste - No completaste todos los objetivos a tiempo'
                          : countdown > 0
                            ? `Preparando... ${countdown}`
                            : 'Jugando'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center items-center">
                  <svg width="800" height="600" viewBox="0 0 800 600" style={{ background: 'rgba(0,0,0,0.1)', borderRadius: '1rem' }}>
                    {/* Countdown en el centro */}
                    {countdown > 0 && (
                      <g>
                        <circle cx="400" cy="300" r="110" fill="rgba(42, 157, 143, 0.2)" className="animate-pulse" />
                        <defs>
                          <linearGradient id="countdownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#2A9D8F', stopOpacity: 0.95 }} />
                            <stop offset="100%" style={{ stopColor: '#3BB9AB', stopOpacity: 0.95 }} />
                          </linearGradient>
                          <filter id="glowEffect">
                            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <circle cx="400" cy="300" r="100" fill="url(#countdownGradient)" stroke="white" strokeWidth="4" filter="url(#glowEffect)" />
                        <circle cx="400" cy="300" r="85" fill="none" stroke="white" strokeWidth="2" opacity="0.3" strokeDasharray="10,5" />
                        <text
                          x="400"
                          y="330"
                          textAnchor="middle"
                          fontSize="90"
                          fill="white"
                          fontWeight="bold"
                          style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
                        >
                          {countdown}
                        </text>
                        <text x="400" y="365" textAnchor="middle" fontSize="16" fill="white" opacity="0.8">
                          Preparando...
                        </text>
                      </g>
                    )}

                    {/* Líneas del rombo */}
                    {countdown === 0 && (
                      <>
                        <defs>
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#2A9D8F', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#3BB9AB', stopOpacity: 1 }} />
                          </linearGradient>
                          <filter id="lineGlow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>

                        {/* Líneas del rombo con borde blanco */}
                        <line x1="400" y1="100" x2="600" y2="300" stroke="white" strokeWidth="6" filter="url(#lineGlow)" opacity="0.9" />
                        <line x1="600" y1="300" x2="400" y2="500" stroke="white" strokeWidth="6" filter="url(#lineGlow)" opacity="0.9" />
                        <line x1="400" y1="500" x2="200" y2="300" stroke="white" strokeWidth="6" filter="url(#lineGlow)" opacity="0.9" />
                        <line x1="200" y1="300" x2="400" y2="100" stroke="white" strokeWidth="6" filter="url(#lineGlow)" opacity="0.9" />

                        {/* Cuadrados objetivos en el rombo */}
                        {targets.map((target, index) => {
                          const anyHit = hitTargets[index];

                          let fillColor = '#4B5563'; // Gris por defecto
                          if (gameLost) {
                            fillColor = '#FF4444'; // Rojo si perdió (todos rojos)
                          } else if (anyHit) {
                            fillColor = '#10B981'; // Verde si le dio
                          }

                          return (
                            <g key={index}>
                              {/* Sombra del cuadrado */}
                              <rect
                                x={target.x - 18}
                                y={target.y - 16}
                                width={38}
                                height={38}
                                fill="rgba(0,0,0,0.3)"
                                rx="5"
                              />
                              {/* Cuadrado principal */}
                              <rect
                                x={target.x - 20}
                                y={target.y - 20}
                                width={40}
                                height={40}
                                fill={fillColor}
                                stroke="white"
                                strokeWidth="3"
                                rx="5"
                                style={{
                                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
                                }}
                              />
                              {/* Indicador de golpe */}
                              {anyHit && (
                                <circle cx={target.x} cy={target.y} r={5} fill="white" stroke="#10B981" strokeWidth="2" />
                              )}
                            </g>
                          );
                        })}

                        {/* Pelota roja con efectos */}
                        <defs>
                          <radialGradient id="ballGradient">
                            <stop offset="0%" style={{ stopColor: '#FF6B6B', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#FF4444', stopOpacity: 1 }} />
                          </radialGradient>
                          <filter id="ballGlow">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <circle
                          cx={ballPosition.x}
                          cy={ballPosition.y}
                          r={10.5}
                          fill="url(#ballGradient)"
                          stroke="white"
                          strokeWidth="3"
                          filter="url(#ballGlow)"
                        />
                        {/* Brillo en la pelota */}
                        <circle
                          cx={ballPosition.x - 2}
                          cy={ballPosition.y - 2}
                          r={3}
                          fill="white"
                          opacity="0.6"
                        />

                        {/* Indicador de tecla E en el centro */}
                        <g>
                          {/* Sombra */}
                          <rect
                            x="372"
                            y="273"
                            width="56"
                            height="56"
                            fill="rgba(0,0,0,0.3)"
                            rx="8"
                          />
                          {/* Tecla */}
                          <rect
                            x="370"
                            y="270"
                            width="60"
                            height="60"
                            fill="rgba(255, 215, 0, 0.2)"
                            stroke="#FFD700"
                            strokeWidth="4"
                            rx="8"
                            style={{
                              filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))'
                            }}
                          />
                          <text
                            x="400"
                            y="310"
                            textAnchor="middle"
                            fontSize="36"
                            fill="#FFD700"
                            fontWeight="bold"
                            style={{
                              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                            }}
                          >
                            E
                          </text>
                        </g>
                      </>
                    )}
                  </svg>
                </div>

                {/* Stats */}
                <div className="mt-6 flex justify-center gap-4 flex-wrap">
                  <div className="backdrop-blur-xl bg-white/10 rounded-xl px-6 py-3 border border-white/10">
                    <p className="text-white font-semibold">
                      Objetivos: <span className="text-cyan-300">{countdown > 0 ? '-' : targets.length}</span>
                    </p>
                  </div>
                  <div className="backdrop-blur-xl bg-white/10 rounded-xl px-6 py-3 border border-white/10">
                    <p className="text-white font-semibold">
                      Aciertos: <span className="text-green-400">{countdown > 0 ? '-' : `${hitTargets.filter((h: boolean) => h).length}/${targets.length}`}</span>
                    </p>
                  </div>
                  <div className="backdrop-blur-xl bg-white/10 rounded-xl px-6 py-3 border border-white/10">
                    <p className="text-white font-semibold">
                      Vuelta: <span className="text-yellow-400">{countdown > 0 ? '-' : `${Math.floor(currentProgress) + 1}/${totalLaps}`}</span>
                    </p>
                  </div>
                  <button
                    onClick={resetGame}
                    className="backdrop-blur-xl bg-white/10 hover:bg-white/20 rounded-xl px-6 py-3 border border-white/10 text-white font-semibold transition-all duration-300"
                  >
                    🔄 Reiniciar
                  </button>
                </div>

                {/* Instrucciones - Solo mostrar cuando el juego está en curso */}
                {countdown === 0 && (
                  <div className="mt-6 text-center">
                    <p className="text-white/80 text-lg font-semibold mb-2">⌨️ Presiona E cuando la pelota esté cerca de un cuadrado</p>
                    <p className="text-white/60 text-sm">La pelota dará 2 vueltas completas | {targets.length} objetivos aleatorios</p>
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
            <h2 className="text-3xl font-bold text-white mb-4">📖 Instrucciones</h2>
            <div className="space-y-3 text-white/90 text-lg">
              <p>🎯 <strong>Objetivo:</strong> Presiona E cuando la pelota roja pase por los cuadrados</p>
              <p>⌨️ <strong>Control:</strong> Usa la tecla E del teclado</p>
              <p>🔴 <strong>Pelota:</strong> Se mueve por las 4 esquinas del rombo</p>
              <p>🔄 <strong>Vueltas:</strong> La pelota da 2 vueltas completas</p>
              <p>✅ <strong>Acierto:</strong> El cuadrado se pinta verde</p>
              <p>❌ <strong>Perder:</strong> Si no aciertas ninguno, pierdes</p>
            </div>
            <button
              onClick={() => {
                setShowInstructions(false);
                setCountdown(5);
              }}
              className="w-full mt-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                boxShadow: '0 10px 30px rgba(42, 157, 143, 0.3)'
              }}
            >
              ¡Empezar a Jugar!
            </button>
          </div>
        </div>
      )}

      {/* Modal de Derrota - Deshabilitado, se muestra el banner arriba */}
      {/* Modal de Victoria - Deshabilitado, se muestra el banner arriba */}
    </div>
  );
};

export default GanzuadoPage;
