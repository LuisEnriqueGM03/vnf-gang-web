import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import '../style/style.css';

interface Switch {
  id: number;
  label: string;
  amperage: number;
  isOn: boolean;
}

interface TargetNumber {
  number: number;
  isTarget: boolean;
}

const CodigoAccesoPage = () => {
  const [targetNumbers, setTargetNumbers] = useState<TargetNumber[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [roundTimer, setRoundTimer] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);

  // Inicializar switches
  const [switches, setSwitches] = useState<Switch[]>([
    { id: 1, label: '#1', amperage: 15, isOn: false },
    { id: 2, label: '#2', amperage: 10, isOn: false },
    { id: 3, label: '#3', amperage: 20, isOn: false },
    { id: 4, label: '#4', amperage: 40, isOn: false },
    { id: 5, label: '#5', amperage: 20, isOn: false },
    { id: 6, label: '#6', amperage: 30, isOn: false },
    { id: 7, label: '#7', amperage: 50, isOn: false },
    { id: 8, label: '#8', amperage: 30, isOn: false },
    { id: 9, label: '#9', amperage: 15, isOn: false },
    { id: 10, label: '#10', amperage: 20, isOn: false },
  ]);

  const checkAnswers = useCallback(() => {
    // Obtener IDs de switches que deberían estar activados
    const targetIds = targetNumbers
      .filter(t => t.isTarget)
      .map(t => t.number);
    
    // Verificar que todos los switches target estén ON y ningún otro
    const allCorrect = targetIds.every(id => switches.find(s => s.id === id)?.isOn);
    const noExtras = switches.filter(s => s.isOn).every(s => targetIds.includes(s.id));
    
    if (allCorrect && noExtras && targetIds.length > 0) {
      const newRoundsCompleted = roundsCompleted + 1;
      setRoundsCompleted(newRoundsCompleted);
      
      // Si completó 3 rondas, gana
      if (newRoundsCompleted >= 3) {
        setGameWon(true);
        setIsPlaying(false);
      } else {
        // Preparar siguiente ronda
        setIsPlaying(false);
        setVisibleCount(0);
        setRoundTimer(5);
        
        // Generar nuevos números para la siguiente ronda
        const availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const numbers: TargetNumber[] = [];
        for (let i = 0; i < 5; i++) {
          const randomIndex = Math.floor(Math.random() * availableNumbers.length);
          const num = availableNumbers[randomIndex];
          availableNumbers.splice(randomIndex, 1);
          const isTarget = Math.random() > 0.5;
          numbers.push({ number: num, isTarget });
        }
        const hasTarget = numbers.some(n => n.isTarget);
        if (!hasTarget) {
          numbers[0].isTarget = true;
        }
        setTargetNumbers(numbers);
      }
    } else {
      // Respuesta incorrecta, pierde
      setGameLost(true);
      setIsPlaying(false);
    }
  }, [targetNumbers, switches, roundsCompleted]);

  // Countdown inicial
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    // Cuando termina el countdown, empieza a mostrar los números uno por uno
  }, [countdown]);

  // Timer de la ronda (5 segundos después de mostrar los números)
  useEffect(() => {
    if (isPlaying && visibleCount === 5 && roundTimer > 0 && !gameWon && !gameLost) {
      const timer = setTimeout(() => setRoundTimer(roundTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (roundTimer === 0 && isPlaying && visibleCount === 5) {
      // Tiempo terminado, verificar respuestas
      checkAnswers();
    }
  }, [roundTimer, isPlaying, gameWon, gameLost, visibleCount, checkAnswers]);

  const generateTargetNumbers = () => {
    // Generar 5 números únicos aleatorios del 1-10
    const availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const numbers: TargetNumber[] = [];
    
    // Seleccionar 5 números únicos
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const num = availableNumbers[randomIndex];
      availableNumbers.splice(randomIndex, 1); // Eliminar para que no se repita
      
      // 50% de probabilidad de ser target (mostrar indicador verde)
      const isTarget = Math.random() > 0.5;
      numbers.push({ number: num, isTarget });
    }
    
    // Asegurarse de que al menos 1 sea target
    const hasTarget = numbers.some(n => n.isTarget);
    if (!hasTarget) {
      numbers[0].isTarget = true;
    }
    
    setTargetNumbers(numbers);
  };

  // Generar números objetivo al inicio
  useEffect(() => {
    if (targetNumbers.length === 0) {
      generateTargetNumbers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mostrar números uno por uno cuando termina el countdown
  useEffect(() => {
    if (countdown === 0 && !isPlaying && !gameWon && !gameLost && visibleCount < 5 && targetNumbers.length > 0) {
      const timer = setTimeout(() => {
        setVisibleCount(visibleCount + 1);
        
        // Cuando se muestren todos, iniciar el timer de la ronda
        if (visibleCount + 1 === 5) {
          setTimeout(() => {
            setIsPlaying(true);
            setRoundTimer(5); // Iniciar timer de 5 segundos
          }, 500);
        }
      }, 800); // 800ms entre cada número
      
      return () => clearTimeout(timer);
    }
  }, [countdown, visibleCount, isPlaying, gameWon, gameLost, targetNumbers.length]);

  const toggleSwitch = (id: number) => {
    if (!isPlaying || gameWon || gameLost) return;

    setSwitches(switches.map(sw => 
      sw.id === id ? { ...sw, isOn: !sw.isOn } : sw
    ));
  };

  const startGame = () => {
    setShowInstructions(false);
    setCountdown(5);
  };

  const resetGame = () => {
    setSwitches(switches.map(sw => ({ ...sw, isOn: false })));
    setGameWon(false);
    setGameLost(false);
    setCountdown(5);
    setRoundTimer(5);
    setIsPlaying(false);
    setVisibleCount(0);
    setRoundsCompleted(0);
    generateTargetNumbers();
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(to bottom right, #000000, #3d3d0a, #000000, #5c5c1a)' }}>
      <Navbar />
      
      <div className="relative z-10 container mx-auto px-4 py-8 pt-28">
        {/* Título */}
        <div className="text-center mb-8">
          <div className="backdrop-blur-xl inline-block px-8 py-4 rounded-2xl shadow-2xl border-2" style={{ background: 'linear-gradient(to right, rgba(0, 0, 0, 0.95), rgba(50, 50, 10, 0.9))', borderColor: '#FFD700', boxShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white">🔑 Código de Acceso</h1>
            <p className="text-white/80 mt-2">Memoriza y activa los switches correctos</p>
          </div>
        </div>

        {/* Mostrar tablero siempre */}
        {!showInstructions && (
          <>
            {/* Game Board */}
            <div className="max-w-3xl mx-auto">
              <div className="backdrop-blur-xl bg-white/5 rounded-3xl shadow-2xl p-8 border border-white/10">
                {/* Display */}
                <div className="backdrop-blur-xl bg-black/40 rounded-2xl p-6 mb-6 border border-white/20">
                  <div className="flex justify-between items-center gap-8">
                    {/* Barra de progreso del tiempo */}
                    <div className="flex-1">
                      <p className="text-white/60 text-sm mb-3 text-center">Código de Acceso</p>
                      <div className="flex justify-center items-center">
                        {gameWon ? (
                          /* Mensaje de victoria */
                          <div className="px-8 py-6 rounded-lg border-4 bg-green-500/20 border-green-500 text-green-400 font-bold text-4xl">
                            🎉 ¡GANASTE!
                          </div>
                        ) : gameLost ? (
                          /* Mensaje de derrota */
                          <div className="px-8 py-6 rounded-lg border-4 bg-red-500/20 border-red-500 text-red-400 font-bold text-4xl">
                            ❌ PERDISTE
                          </div>
                        ) : isPlaying && visibleCount === 5 ? (
                          /* Barra de tiempo de 5 segundos con contador */
                          <div className="flex items-center gap-4 w-full max-w-2xl">
                            <div className="flex-1 h-8 rounded-full bg-gray-700 border-2 border-gray-600 overflow-hidden">
                              <div 
                                className="h-full transition-all duration-1000"
                                style={{ 
                                  width: `${(roundTimer / 5) * 100}%`,
                                  backgroundColor: roundTimer > 3 ? '#10b981' : roundTimer > 1.5 ? '#eab308' : '#ef4444'
                                }}
                              />
                            </div>
                            <p className="text-3xl font-bold text-white whitespace-nowrap">{roundTimer}s</p>
                          </div>
                        ) : countdown > 0 ? (
                          /* Mostrar countdown */
                          <div className="px-8 py-6 rounded-lg border-4 bg-blue-800/60 border-blue-600 text-white font-bold text-5xl">
                            {countdown}
                          </div>
                        ) : (
                          /* Mostrar número actual */
                          <div className="px-8 py-6 rounded-lg border-4 bg-gray-800/60 border-gray-600 text-white font-bold text-5xl">
                            {visibleCount > 0 && visibleCount <= 5
                              ? targetNumbers[visibleCount - 1]?.number.toString().padStart(2, '0')
                              : '00'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Contador de Rondas */}
                    <div className="text-center">
                      <div className="px-8 py-6 rounded-lg border-4 bg-gray-800/60 border-gray-600">
                        <p className="text-5xl font-bold text-white mb-4">
                          {roundsCompleted}/3
                        </p>
                        
                        {/* Indicador de objetivo actual */}
                        <div className="flex justify-center">
                          <div
                            className={`w-32 h-4 rounded-full border-2 ${
                              visibleCount > 0 && visibleCount <= 5 && targetNumbers[visibleCount - 1]?.isTarget
                                ? 'bg-green-500 border-green-400'
                                : 'bg-gray-700 border-gray-600'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel de Switches */}
                <div className="backdrop-blur-xl bg-gray-900/60 rounded-2xl p-8 border-4 border-gray-700">
                  <div className="grid grid-cols-2 gap-6">
                    {switches.map((sw) => (
                      <div key={sw.id} className="flex items-center gap-4">
                        {/* Label */}
                        <div className="text-white font-bold text-2xl w-12">{sw.label}</div>
                        
                        {/* Switch */}
                        <button
                          onClick={() => toggleSwitch(sw.id)}
                          disabled={!isPlaying || gameWon || gameLost}
                          className={`relative flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-300 flex-1 ${
                            sw.isOn 
                              ? 'bg-green-500/20 border-green-500 shadow-lg shadow-green-500/50' 
                              : 'bg-gray-800/80 border-gray-600'
                          } ${isPlaying && !gameWon && !gameLost ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-60'}`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`font-bold text-sm ${sw.isOn ? 'text-green-400' : 'text-gray-400'}`}>
                              {sw.amperage} AMP
                            </span>
                            <div className={`w-12 h-6 rounded-full border-2 relative transition-all ${
                              sw.isOn ? 'bg-green-500 border-green-400' : 'bg-gray-700 border-gray-600'
                            }`}>
                              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                                sw.isOn ? 'right-0.5' : 'left-0.5'
                              }`}></div>
                            </div>
                            <span className={`font-bold text-xs ${sw.isOn ? 'text-green-400' : 'text-gray-500'}`}>
                              {sw.isOn ? 'ON' : 'OFF'}
                            </span>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botón Reiniciar */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={resetGame}
                    className="backdrop-blur-xl bg-white/10 hover:bg-white/20 rounded-xl px-8 py-3 border border-white/10 text-white font-semibold transition-all duration-300"
                  >
                    🔄 Reiniciar
                  </button>
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
            <div className="text-center">
              <div className="text-6xl mb-4">🔑</div>
              <h2 className="text-3xl font-bold text-white mb-4">Código de Acceso</h2>
              <div className="text-white/90 text-left space-y-3 mb-6">
                <p>• Aparecerán 5 números únicos del 01 al 10 uno por uno</p>
                <p>• Debajo verás una <span className="text-green-400 font-bold">barra verde</span> si el número es objetivo</p>
                <p>• Memoriza los números con la <span className="text-green-400 font-bold">barra verde</span></p>
                <p>• Tienes <span className="text-yellow-400 font-bold">5 segundos</span> para activar los switches correctos</p>
                <p>• Debes completar <span className="text-cyan-400 font-bold">3 rondas correctas</span> para ganar</p>
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
    </div>
  );
};

export default CodigoAccesoPage;
