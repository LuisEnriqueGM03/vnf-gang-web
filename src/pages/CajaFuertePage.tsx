import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import '../style/style.css';

const CajaFuertePage = () => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [percentage, setPercentage] = useState(0);
  const [knob1Angle, setKnob1Angle] = useState(230);
  const [knob2Angle, setKnob2Angle] = useState(230);
  const [gamePhase, setGamePhase] = useState<'playing' | 'won' | 'lost'>('playing');
  const [timeLeft, setTimeLeft] = useState(10);
  const [isDragging1, setIsDragging1] = useState(false);
  const [isDragging2, setIsDragging2] = useState(false);
  const [startAngle1, setStartAngle1] = useState(0);
  const [startAngle2, setStartAngle2] = useState(0);
  const [startMouseAngle1, setStartMouseAngle1] = useState(0);
  const [startMouseAngle2, setStartMouseAngle2] = useState(0);
  
  const [targetKnob1, setTargetKnob1] = useState(0);
  const [targetKnob2, setTargetKnob2] = useState(0);
  
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const requiredTimeRef = useRef(0.1);
  
  const knob1Ref = useRef<HTMLDivElement>(null);
  const knob2Ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target1 = Math.floor(Math.random() * 40) + 40;
    const target2 = 100 - target1;
    setTargetKnob1(target1);
    setTargetKnob2(target2);
  }, []);

  // Timer de 10 segundos
  useEffect(() => {
    if (gamePhase === 'playing' && timeLeft > 0 && !showInstructions) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gamePhase === 'playing') {
      setGamePhase('lost');
    }
  }, [timeLeft, gamePhase, showInstructions]);

  useEffect(() => {
    const angleToPercent = (angle: number) => {
      if (angle >= 230 && angle <= 320) {
        return ((angle - 230) / 90) * 100;
      } else if (angle < 230) {
        return 0;
      } else {
        return 100;
      }
    };
    
    const currentPercent1 = angleToPercent(knob1Angle);
    const currentPercent2 = angleToPercent(knob2Angle);
    
    const diff1 = Math.abs(currentPercent1 - targetKnob1);
    const diff2 = Math.abs(currentPercent2 - targetKnob2);
    
    // Si ambos diales están muy cerca de sus objetivos, considerar como 100%
    const accuracy1 = Math.max(0, 100 - diff1);
    const accuracy2 = Math.max(0, 100 - diff2);
    
    // Calcular el total sin redondear para verificación exacta
    const totalExact = (accuracy1 + accuracy2) / 2;
    const total = Math.round(totalExact);
    setPercentage(total);

    // Determinar si está en rango 99-100% y calcular tiempo requerido
    const isAt99OrMore = totalExact >= 99;
    
    // Calcular tiempo requerido según el porcentaje exacto
    let requiredTime = 1; // Por defecto 1 segundo para 99%
    if (totalExact >= 100) {
      requiredTime = 0.1; // 100% o más: 0.1 segundos
    } else if (totalExact >= 99.5) {
      requiredTime = 0.5; // 99.5-99.99%: 0.5 segundos
    } else if (totalExact >= 99) {
      requiredTime = 1; // 99-99.49%: 1 segundo
    }

    if (isAt99OrMore && gamePhase === 'playing') {
      if (!holdTimerRef.current) {
        requiredTimeRef.current = requiredTime; // Guardar el tiempo requerido
        let holdTime = 0;
        holdTimerRef.current = setInterval(() => {
          holdTime += 0.1;
          if (holdTime >= requiredTimeRef.current) {
            if (holdTimerRef.current) {
              clearInterval(holdTimerRef.current);
              holdTimerRef.current = null;
            }
            setGamePhase('won');
          }
        }, 100);
      }
    } else {
      // Si está por debajo del 99%, resetear el contador
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    }
  }, [knob1Angle, knob2Angle, gamePhase, targetKnob1, targetKnob2]);

  const getMouseAngle = (e: MouseEvent, knobRef: HTMLDivElement) => {
    const rect = knobRef.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    let degrees = angle * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  };

  const handleMouseDown = (e: React.MouseEvent, knobNumber: 1 | 2) => {
    const knobRef = knobNumber === 1 ? knob1Ref.current : knob2Ref.current;
    if (!knobRef) return;

    const mouseAngle = getMouseAngle(e.nativeEvent, knobRef);
    
    if (knobNumber === 1) {
      setIsDragging1(true);
      setStartAngle1(knob1Angle);
      setStartMouseAngle1(mouseAngle);
    } else {
      setIsDragging2(true);
      setStartAngle2(knob2Angle);
      setStartMouseAngle2(mouseAngle);
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent, knobNumber: 1 | 2) => {
    const knobRef = knobNumber === 1 ? knob1Ref.current : knob2Ref.current;
    if (!knobRef) return;

    const currentMouseAngle = getMouseAngle(e, knobRef);
    const startMouseAngle = knobNumber === 1 ? startMouseAngle1 : startMouseAngle2;
    const startAngle = knobNumber === 1 ? startAngle1 : startAngle2;
    
    let angleDiff = currentMouseAngle - startMouseAngle;
    
    // Manejar el cruce de 360/0 grados
    if (angleDiff > 180) angleDiff -= 360;
    if (angleDiff < -180) angleDiff += 360;
    
    let newAngle = startAngle + angleDiff;
    
    // Limitar entre 230 y 320 grados
    if (newAngle < 230) newAngle = 230;
    if (newAngle > 320) newAngle = 320;

    if (knobNumber === 1) {
      setKnob1Angle(Math.round(newAngle));
    } else {
      setKnob2Angle(Math.round(newAngle));
    }
  }, [startAngle1, startAngle2, startMouseAngle1, startMouseAngle2]);

  useEffect(() => {
    const handleMouseMoveKnob1 = (e: MouseEvent) => {
      if (isDragging1) handleMouseMove(e, 1);
    };

    const handleMouseMoveKnob2 = (e: MouseEvent) => {
      if (isDragging2) handleMouseMove(e, 2);
    };

    const handleMouseUp = () => {
      setIsDragging1(false);
      setIsDragging2(false);
    };

    if (isDragging1) {
      window.addEventListener('mousemove', handleMouseMoveKnob1);
      window.addEventListener('mouseup', handleMouseUp);
    }

    if (isDragging2) {
      window.addEventListener('mousemove', handleMouseMoveKnob2);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveKnob1);
      window.removeEventListener('mousemove', handleMouseMoveKnob2);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging1, isDragging2, handleMouseMove]);
  const resetGame = () => {
    setPercentage(0);
    setKnob1Angle(230);
    setKnob2Angle(230);
    setGamePhase('playing');
    setTimeLeft(10);
    
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    
    const target1 = Math.floor(Math.random() * 40) + 40;
    const target2 = 100 - target1;
    setTargetKnob1(target1);
    setTargetKnob2(target2);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current);
      }
    };
  }, []);

  const startGame = () => {
    setShowInstructions(false);
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(to bottom right, #000000, #3d3d0a, #000000, #5c5c1a)' }}>
      <Navbar />
      
      <div className="relative z-10 container mx-auto px-4 py-8 pt-28">
        <div className="text-center mb-8">
          <div className="backdrop-blur-xl inline-block px-8 py-4 rounded-2xl shadow-2xl border-2" style={{ background: 'linear-gradient(to right, rgba(0, 0, 0, 0.95), rgba(50, 50, 10, 0.9))', borderColor: '#FFD700', boxShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white">🔐 Forzar la caja fuerte</h1>
            <p className="text-white/80 mt-2">Gira las perillas hasta llegar al 100%</p>
          </div>
        </div>

        {!showInstructions && (
          <>
            <div className="max-w-xl mx-auto">
              <div className="backdrop-blur-xl bg-black/70 rounded-2xl shadow-2xl p-6 border border-white/20">
                <h2 className="text-white font-bold text-xl text-center mb-3">Forzar la caja fuerte</h2>
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent mb-6"></div>
                
                <div className="text-center mb-8">
                  <p className="text-white font-bold text-6xl">{percentage}%</p>
                </div>

                <div className="flex justify-center gap-16 mb-8">
                  <div className="flex flex-col items-center">
                    <div
                      ref={knob1Ref}
                      onMouseDown={(e) => handleMouseDown(e, 1)}
                      className="relative w-48 h-48 rounded-full cursor-pointer"
                      style={{
                        background: 'radial-gradient(circle at 30% 30%, #4a4a4a, #2a2a2a)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)'
                      }}
                    >
                      {[...Array(60)].map((_, i) => {
                        const markAngle = (i * 6);
                        const length = 12; // Todas las marcas del mismo tamaño
                        
                        // Mostrar marcas desde -30° (330°) hasta 230°
                        const isInLowerArea = markAngle >= 315 || markAngle <= 225;
                        if (!isInLowerArea) return null;
                        
                        let markColor = 'rgba(255,255,255,0.2)';
                        
                        // Mapear el progreso de 230°-320° al rango visible (315°-225°)
                        const progress = ((knob1Angle - 230) / 90); // 0 a 1
                        // Calcular cuánto del rango total (315° a 225° = 270°) pintar
                        const totalRange = 270; // De 315° a 360° + 0° a 225° = 45 + 225 = 270
                        const paintedRange = progress * totalRange;
                        
                        // Pintar desde 315° en adelante
                        let isPainted = false;
                        if (paintedRange <= 45) {
                          // Pintar de 315° hacia arriba
                          isPainted = markAngle >= 315 && markAngle <= 315 + paintedRange;
                        } else {
                          // Pintar de 315° a 360° y luego de 0° hacia adelante
                          const remaining = paintedRange - 45;
                          isPainted = (markAngle >= 315) || (markAngle >= 0 && markAngle <= remaining);
                        }
                        
                        if (isPainted) {
                          markColor = 'rgba(255, 255, 255, 1)';
                        }
                        
                        return (
                          <div
                            key={i}
                            className="absolute top-1/2 left-1/2 transition-colors duration-100"
                            style={{
                              width: '3px',
                              height: `${length}px`,
                              background: markColor,
                              transformOrigin: '1.5px 0',
                              transform: `rotate(${markAngle - 90}deg) translateY(-110px)`,
                              borderRadius: '2px',
                              boxShadow: markColor === 'rgba(255,255,255,0.15)' ? 'none' : '0 0 4px rgba(255,255,255,0.8)'
                            }}
                          />
                        );
                      })}
                      
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div
                      ref={knob2Ref}
                      onMouseDown={(e) => handleMouseDown(e, 2)}
                      className="relative w-48 h-48 rounded-full cursor-pointer"
                      style={{
                        background: 'radial-gradient(circle at 30% 30%, #4a4a4a, #2a2a2a)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)'
                      }}
                    >
                      {[...Array(60)].map((_, i) => {
                        const markAngle = (i * 6);
                        const length = 12; // Todas las marcas del mismo tamaño
                        
                        // Mostrar marcas desde -30° (330°) hasta 230°
                        const isInLowerArea = markAngle >= 315 || markAngle <= 225;
                        if (!isInLowerArea) return null;
                        
                        let markColor = 'rgba(255,255,255,0.2)';
                        
                        // Mapear el progreso de 230°-320° al rango visible (315°-225°)
                        const progress = ((knob2Angle - 230) / 90); // 0 a 1
                        // Calcular cuánto del rango total (315° a 225° = 270°) pintar
                        const totalRange = 270; // De 315° a 360° + 0° a 225° = 45 + 225 = 270
                        const paintedRange = progress * totalRange;
                        
                        // Pintar desde 315° en adelante
                        let isPainted = false;
                        if (paintedRange <= 45) {
                          // Pintar de 315° hacia arriba
                          isPainted = markAngle >= 315 && markAngle <= 315 + paintedRange;
                        } else {
                          // Pintar de 315° a 360° y luego de 0° hacia adelante
                          const remaining = paintedRange - 45;
                          isPainted = (markAngle >= 315) || (markAngle >= 0 && markAngle <= remaining);
                        }
                        
                        if (isPainted) {
                          markColor = 'rgba(255, 255, 255, 1)';
                        }
                        
                        return (
                          <div
                            key={i}
                            className="absolute top-1/2 left-1/2 transition-colors duration-100"
                            style={{
                              width: '3px',
                              height: `${length}px`,
                              background: markColor,
                              transformOrigin: '1.5px 0',
                              transform: `rotate(${markAngle - 90}deg) translateY(-110px)`,
                              borderRadius: '2px',
                              boxShadow: markColor === 'rgba(255,255,255,0.15)' ? 'none' : '0 0 4px rgba(255,255,255,0.8)'
                            }}
                          />
                        );
                      })}
                      
                    </div>
                  </div>
                </div>

                <p className="text-white/70 text-center text-sm mb-6">
                  99%: 1s | 99.5%: 0.5s | 100%: 0.1s - Cuanto más preciso, más rápido
                </p>

                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent mb-6"></div>
                
                {/* Barra de tiempo - 10 segundos */}
                {gamePhase !== 'won' && gamePhase !== 'lost' && (
                  <div className="bg-transparent mb-4">
                    <p className="text-white text-center font-bold text-base mb-3">Tiempo: {timeLeft}s</p>
                    <div className="w-full h-2.5 rounded-full bg-gray-800/60 overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: `${(timeLeft / 10) * 100}%`,
                          backgroundColor: timeLeft > 6 ? '#10b981' : timeLeft > 3 ? '#eab308' : '#ef4444',
                          transition: 'width 1s linear, background-color 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                )}

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

      {showInstructions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/10 p-8 max-w-md">
            <div className="text-center">
              <div className="text-6xl mb-4">🔐</div>
              <h2 className="text-3xl font-bold text-white mb-4">Forzar la caja fuerte</h2>
              <div className="text-white/90 text-center space-y-3 mb-6">
                <p className="font-bold">Instrucciones:</p>
                <p>Gira las perillas hasta llegar al <span className="text-green-400 font-bold">99-100%</span></p>
                <p className="text-sm"><span className="text-cyan-400 font-bold">99%</span>: 1s | <span className="text-blue-400 font-bold">99.5%</span>: 0.5s | <span className="text-green-400 font-bold">100%</span>: 0.1s</p>
                <p>Tienes <span className="text-red-400 font-bold">10 segundos</span> en total</p>
                <p className="text-sm text-white/70">Si bajas del 99%, el contador se reinicia</p>
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

      {gamePhase === 'won' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/10 p-8 max-w-md animate-scaleIn">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl font-bold text-green-400 mb-4">¡Ganaste!</h2>
              <p className="text-white/80 text-lg mb-6">
                ¡Abriste la caja fuerte! Lograste abrir la caja.
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

      {gamePhase === 'lost' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/10 p-8 max-w-md animate-shake">
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-3xl font-bold text-red-400 mb-4">¡Perdiste!</h2>
              <p className="text-white/80 text-lg mb-6">
                Se acabó el tiempo. Solo llegaste al {percentage}%.
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

export default CajaFuertePage;
