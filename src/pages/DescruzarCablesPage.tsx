import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../style/style.css';

type Point = {
  x: number;
  y: number;
};

type Node = Point & {
  id: string;
  canMove: boolean; // Solo los nodos intermedios se pueden mover
  inDirection?: 'up' | 'down' | 'right' | 'left'; // Dirección de entrada al nodo
  outDirection?: 'up' | 'down' | 'right' | 'left'; // Dirección de salida del nodo
};

type Cable = {
  color: string;
  nodes: Node[]; // [punto inicio, nodo intermedio, punto final
  startDirection: 'up' | 'down' | 'right'; // Dirección de salida del cable desde el inicio
  endDirection: 'up' | 'down' | 'right'; // Dirección de llegada del cable al final
};

const DescruzarCablesPage = () => {
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);

  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [countdown, setCountdown] = useState(5); // Contador inicial de 5 segundos
  const [showCables, setShowCables] = useState(false); // Controla si se muestran los cables
  const [timeLeft, setTimeLeft] = useState(10);
  const [crossings, setCrossings] = useState(0);
  const [cables, setCables] = useState<Cable[]>([]);
  const [draggingNode, setDraggingNode] = useState<{ cableIndex: number; nodeIndex: number } | null>(null);

  // Inicializar cables
  useEffect(() => {
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#F97316']; // Rojo, Azul, Verde, Amarillo, Púrpura, Naranja
    const svgWidth = 1000; // Más ancho
    const svgHeight = 450; // Más bajo, proporción horizontal
    const margin = 50; // Margen lateral para los puntos inicio/final
    const numCables = 6;
    
    // Distribuir los puntos en el espacio vertical (más juntos)
    const pointsStart = 100;
    const pointsEnd = 350;
    const spacing = (pointsEnd - pointsStart) / (numCables - 1);

    const directions: ('up' | 'down' | 'right')[] = ['up', 'down', 'right'];
    const allDirections: ('up' | 'down' | 'right' | 'left')[] = ['up', 'down', 'right', 'left'];
    
    const newCables: Cable[] = colors.map((color, i) => {
      
      // Cada cable tiene sus puntos inicio y final a la misma altura (horizontalmente)
      const y = pointsStart + i * spacing; // En orden: cable 0 arriba, cable 5 abajo
      
      // Nodos intermedios con posiciones completamente aleatorias (X e Y) para crear nudos complejos
      // X: entre las barreras (50 a 950)
      // Y: toda la altura del canvas (16 a 434, considerando radio del nodo de 16px)
      const node1X = margin + Math.random() * (svgWidth - 2 * margin);
      const node1Y = 16 + Math.random() * (svgHeight - 32);
      const node2X = margin + Math.random() * (svgWidth - 2 * margin);
      const node2Y = 16 + Math.random() * (svgHeight - 32);
      
      // Direcciones aleatorias para inicio y fin
      const startDir = directions[Math.floor(Math.random() * directions.length)];
      const endDir = directions[Math.floor(Math.random() * directions.length)];
      
      // Direcciones aleatorias para nodos intermedios
      const node1InDir = allDirections[Math.floor(Math.random() * allDirections.length)];
      const node1OutDir = allDirections[Math.floor(Math.random() * allDirections.length)];
      const node2InDir = allDirections[Math.floor(Math.random() * allDirections.length)];
      const node2OutDir = allDirections[Math.floor(Math.random() * allDirections.length)];
      
      return {
        color,
        startDirection: startDir,
        endDirection: endDir,
        nodes: [
          { id: `cable${i}-start`, x: margin, y: y, canMove: false }, // Punto inicio (izquierda) - Cuadrado, misma Y
          { id: `cable${i}-node1`, x: node1X, y: node1Y, canMove: true, inDirection: node1InDir, outDirection: node1OutDir }, // Nodo 1 (movible)
          { id: `cable${i}-node2`, x: node2X, y: node2Y, canMove: true, inDirection: node2InDir, outDirection: node2OutDir }, // Nodo 2 (movible)
          { id: `cable${i}-end`, x: svgWidth - margin, y: y, canMove: false } // Punto final (derecha) - Cuadrado, misma Y
        ]
      };
    });

    setCables(newCables);
  }, []);

  // Detectar si dos líneas se cruzan y obtener el punto de intersección
  const getLineIntersection = useCallback((p1: Point, p2: Point, p3: Point, p4: Point): Point | null => {
    const x1 = p1.x, y1 = p1.y;
    const x2 = p2.x, y2 = p2.y;
    const x3 = p3.x, y3 = p3.y;
    const x4 = p4.x, y4 = p4.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    
    if (Math.abs(denom) < 0.0001) return null; // Paralelas o coincidentes
    
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
    
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1)
      };
    }
    
    return null;
  }, []);

  // Verificar si un punto está cerca de un nodo
  const isNearNode = useCallback((point: Point, node: Point, threshold: number = 18): boolean => {
    const dist = Math.sqrt(Math.pow(point.x - node.x, 2) + Math.pow(point.y - node.y, 2));
    return dist < threshold;
  }, []);

  // Contar cruces entre cables de diferentes colores
  const countCrossings = useCallback(() => {
    let count = 0;
    for (let i = 0; i < cables.length; i++) {
      for (let j = i + 1; j < cables.length; j++) {
        // Solo contar cruces entre cables de diferente color
        if (cables[i].color !== cables[j].color) {
          // Verificar si los segmentos de los cables se cruzan
          const cable1 = cables[i].nodes;
          const cable2 = cables[j].nodes;
          
          // Verificar cruce entre los tres segmentos de cada cable
          // Cable tiene 4 nodos, entonces 3 segmentos: [0-1], [1-2], [2-3]
          for (let seg1 = 0; seg1 < 3; seg1++) {
            for (let seg2 = 0; seg2 < 3; seg2++) {
              const intersection = getLineIntersection(
                cable1[seg1], cable1[seg1 + 1],
                cable2[seg2], cable2[seg2 + 1]
              );
              
              if (intersection) {
                // Verificar si la intersección está cerca de algún nodo de ambos cables
                let nearNode = false;
                
                // Verificar nodos del cable 1
                for (const node of cable1) {
                  if (isNearNode(intersection, node)) {
                    nearNode = true;
                    break;
                  }
                }
                
                // Verificar nodos del cable 2
                if (!nearNode) {
                  for (const node of cable2) {
                    if (isNearNode(intersection, node)) {
                      nearNode = true;
                      break;
                    }
                  }
                }
                
                // Solo contar si NO está cerca de ningún nodo
                if (!nearNode) {
                  count++;
                  break;
                }
              }
            }
          }
        }
      }
    }
    return count;
  }, [cables, getLineIntersection, isNearNode]);

  // Actualizar cruces cuando cambian los cables
  useEffect(() => {
    if (cables.length > 0) {
      const newCrossings = countCrossings();
      setCrossings(newCrossings);
      
      // Victoria: sin cruces (solo cuando los cables son visibles)
      if (newCrossings === 0 && !showInstructions && showCables && !gameWon) {
        setGameWon(true);
      }
    }
  }, [cables, countCrossings, showInstructions, showCables, gameWon]);

  // Countdown inicial de 5 segundos
  useEffect(() => {
    if (showInstructions || showCables) return;

    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setShowCables(true); // Mostrar cables cuando llegue a 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [showInstructions, showCables]);

  // Temporizador del juego (solo comienza cuando los cables son visibles)
  useEffect(() => {
    if (showInstructions || !showCables || gameWon || gameLost) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameLost(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showInstructions, showCables, gameWon, gameLost]);

  // Manejo de arrastre de nodos
  const handleMouseDown = (cableIndex: number, nodeIndex: number) => {
    // No permitir arrastrar si el juego terminó
    if (gameWon || gameLost) return;
    
    if (cables[cableIndex].nodes[nodeIndex].canMove) {
      setDraggingNode({ cableIndex, nodeIndex });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingNode || !svgRef.current) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    
    // Calcular posición exacta del mouse en coordenadas SVG
    const scaleX = 1000 / rect.width;
    const scaleY = 450 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const newCables = [...cables];
    const barrierMargin = 50; // Barrera límite para los nodos movibles (en la línea de los puntos)
    newCables[draggingNode.cableIndex].nodes[draggingNode.nodeIndex] = {
      ...newCables[draggingNode.cableIndex].nodes[draggingNode.nodeIndex],
      x: Math.max(barrierMargin, Math.min(1000 - barrierMargin, x)), // Límite: entre las barreras (50 a 950)
      y: Math.max(16, Math.min(434, y))  // Límite hasta el borde del tablero (considerando radio del nodo de 16px)
    };
    setCables(newCables);
  }, [draggingNode, cables]);

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
  }, []);

  // Agregar y remover event listeners globales para el arrastre
  useEffect(() => {
    if (draggingNode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNode, handleMouseMove, handleMouseUp]);

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(to bottom right, #000000, #3d3d0a, #000000, #5c5c1a)' }}>
      <Navbar />
      
      {/* Contenido */}
      <div className="relative z-10 container mx-auto px-4 py-8 pt-28">
        {/* Título */}
        <div className="text-center mb-8">
          <div className="backdrop-blur-xl inline-block px-8 py-4 rounded-2xl shadow-2xl border-2" style={{ background: 'linear-gradient(to right, rgba(0, 0, 0, 0.95), rgba(50, 50, 10, 0.9))', borderColor: '#FFD700', boxShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white">🔌 Descruzar Cables</h1>
            <p className="text-white/80 mt-2">Organiza los cables sin cruces</p>
          </div>
        </div>

        {!showInstructions && (
          <>
            {/* Game Board */}
            <div className="max-w-4xl mx-auto">
              <div className="backdrop-blur-xl bg-white/5 rounded-3xl shadow-2xl p-4 md:p-8 border border-white/10">
                {/* Mensaje de estado pequeño */}
                <div className="mb-4 flex justify-center">
                  <div 
                    className="backdrop-blur-xl rounded-xl px-6 py-2 border border-white/10"
                    style={{ 
                      background: gameWon 
                        ? 'rgba(16, 185, 129, 0.3)' 
                        : gameLost 
                        ? 'rgba(239, 68, 68, 0.3)'
                        : !showCables
                        ? 'rgba(59, 130, 246, 0.3)'
                        : 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <p className="text-white font-semibold text-sm">
                      {gameWon 
                        ? 'Ganaste' 
                        : gameLost 
                        ? 'Perdiste'
                        : !showCables 
                        ? `Preparando... ${countdown}` 
                        : 'Jugando'}
                    </p>
                  </div>
                </div>

                {/* Área de juego - SVG Canvas */}
                <div className="relative bg-black/30 rounded-2xl" style={{ height: '500px' }}>
                  <svg 
                    ref={svgRef}
                    width="100%" 
                    height="100%" 
                    viewBox="0 0 1000 450"
                    className={`absolute inset-0 ${gameWon || gameLost ? 'cursor-default' : 'cursor-crosshair'}`}
                  >
                    {/* Overlay de victoria/derrota */}
                    {gameWon && (
                      <g className="animate-fadeIn">
                        <rect x="0" y="0" width="1000" height="450" fill="rgba(16, 185, 129, 0.2)" />
                        {/* Estrellas de celebración */}
                        {[...Array(20)].map((_, i) => (
                          <circle
                            key={i}
                            cx={50 + Math.random() * 900}
                            cy={50 + Math.random() * 350}
                            r={3 + Math.random() * 5}
                            fill="gold"
                            opacity={0.6 + Math.random() * 0.4}
                            className="animate-pulse"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </g>
                    )}
                    {gameLost && (
                      <g className="animate-fadeIn">
                        <rect x="0" y="0" width="1000" height="450" fill="rgba(239, 68, 68, 0.15)" />
                      </g>
                    )}

                    {/* Barreras límite para los nodos movibles */}
                    <line x1="50" y1="0" x2="50" y2="450" stroke="white" strokeWidth="2" opacity="0.3" strokeDasharray="5,5" />
                    <line x1="950" y1="0" x2="950" y2="450" stroke="white" strokeWidth="2" opacity="0.3" strokeDasharray="5,5" />
                    
                    {/* Countdown en el centro del tablero */}
                    {!showCables && countdown > 0 && (
                      <g className="animate-pulse">
                        {/* Sombra exterior */}
                        <circle cx="500" cy="225" r="110" fill="rgba(42, 157, 143, 0.2)" />
                        {/* Círculo con gradiente */}
                        <defs>
                          <linearGradient id="countdownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#2A9D8F', stopOpacity: 0.95 }} />
                            <stop offset="100%" style={{ stopColor: '#3BB9AB', stopOpacity: 0.95 }} />
                          </linearGradient>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        <circle cx="500" cy="225" r="100" fill="url(#countdownGradient)" stroke="white" strokeWidth="4" filter="url(#glow)" />
                        {/* Borde interior decorativo */}
                        <circle cx="500" cy="225" r="85" fill="none" stroke="white" strokeWidth="2" opacity="0.3" strokeDasharray="10,5" />
                        {/* Número */}
                        <text 
                          x="500" 
                          y="250" 
                          textAnchor="middle" 
                          fontSize="90" 
                          fill="white" 
                          fontWeight="bold"
                          style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
                        >
                          {countdown}
                        </text>
                        {/* Texto pequeño debajo */}
                        <text x="500" y="285" textAnchor="middle" fontSize="16" fill="white" opacity="0.8">
                          Preparando...
                        </text>
                      </g>
                    )}
                    
                    {/* Dibujar cables - solo cuando showCables sea true */}
                    {showCables && (
                      <>
                        {/* Capa 1: Líneas/cables */}
                        {cables.map((cable, cableIndex) => (
                          <g key={`cable-${cableIndex}`}>
                            <path
                              d={(() => {
                                const nodes = cable.nodes;
                                const alignThreshold = 15;
                                
                                let path = `M ${nodes[0].x} ${nodes[0].y}`;
                                
                                for (let i = 0; i < nodes.length - 1; i++) {
                                  const from = nodes[i];
                                  const to = nodes[i + 1];
                                  
                                  const deltaX = Math.abs(to.x - from.x);
                                  const deltaY = Math.abs(to.y - from.y);
                                  
                                  if (deltaX < alignThreshold || deltaY < alignThreshold) {
                                    path += ` L ${to.x} ${to.y}`;
                                  } else {
                                    const midX = (from.x + to.x) / 2;
                                    const midY = (from.y + to.y) / 2;
                                    const dx = to.x - from.x;
                                    const dy = to.y - from.y;
                                    const offset = 30;
                                    const controlX = midX + (-dy / Math.sqrt(dx*dx + dy*dy)) * offset;
                                    const controlY = midY + (dx / Math.sqrt(dx*dx + dy*dy)) * offset;
                                    path += ` Q ${controlX} ${controlY}, ${to.x} ${to.y}`;
                                  }
                                }
                                
                                return path;
                              })()}
                              stroke={cable.color}
                              strokeWidth="4"
                              fill="none"
                              opacity="0.8"
                            />
                          </g>
                        ))}
                        
                        {/* Capa 2: Puntos fijos (inicio y final) */}
                        {cables.map((cable, cableIndex) => (
                          <g key={`fixed-${cableIndex}`}>
                            {cable.nodes.map((node, nodeIndex) => (
                              !node.canMove && (
                                <g key={node.id}>
                                  <rect
                                    x={node.x - 15}
                                    y={node.y - 15}
                                    width={30}
                                    height={30}
                                    fill={cable.color}
                                    stroke="white"
                                    strokeWidth="3"
                                    opacity="0.6"
                                    className="cursor-default"
                                  />
                                  <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={5}
                                    fill="white"
                                    className="pointer-events-none"
                                  />
                                </g>
                              )
                            ))}
                          </g>
                        ))}
                        
                        {/* Capa 3: Nodos movibles (excepto el que se está arrastrando) */}
                        {cables.map((cable, cableIndex) => (
                          <g key={`movable-${cableIndex}`}>
                            {cable.nodes.map((node, nodeIndex) => (
                              node.canMove && !(draggingNode?.cableIndex === cableIndex && draggingNode?.nodeIndex === nodeIndex) && (
                                <g key={node.id}>
                                  <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={16}
                                    fill={cable.color}
                                    stroke="white"
                                    strokeWidth="3"
                                    className={gameWon || gameLost ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
                                    onMouseDown={() => handleMouseDown(cableIndex, nodeIndex)}
                                  />
                                  <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={5}
                                    fill="white"
                                    className="pointer-events-none"
                                  />
                                </g>
                              )
                            ))}
                          </g>
                        ))}
                        
                        {/* Capa 4: Nodo siendo arrastrado (arriba de todo) */}
                        {draggingNode && cables[draggingNode.cableIndex] && (
                          <g key="dragging-node">
                            <circle
                              cx={cables[draggingNode.cableIndex].nodes[draggingNode.nodeIndex].x}
                              cy={cables[draggingNode.cableIndex].nodes[draggingNode.nodeIndex].y}
                              r={16}
                              fill={cables[draggingNode.cableIndex].color}
                              stroke="white"
                              strokeWidth="3"
                              className="cursor-grabbing"
                              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
                            />
                            <circle
                              cx={cables[draggingNode.cableIndex].nodes[draggingNode.nodeIndex].x}
                              cy={cables[draggingNode.cableIndex].nodes[draggingNode.nodeIndex].y}
                              r={5}
                              fill="white"
                              className="pointer-events-none"
                            />
                          </g>
                        )}
                      </>
                    )}
                  </svg>
                </div>

                {/* Stats - Debajo del tablero, arriba de las instrucciones */}
                <div className="mt-6 flex justify-center items-center gap-3 flex-wrap">
                  {/* Botón Jugar de nuevo */}
                  <button
                    onClick={() => window.location.reload()}
                    className="backdrop-blur-xl bg-yellow-500/80 hover:bg-yellow-600/80 rounded-xl px-4 py-2 border border-white/10 transition-all duration-300 transform hover:scale-105"
                  >
                    <p className="text-white font-semibold text-sm">🔄 Jugar de nuevo</p>
                  </button>

                  {/* Stat Cruces */}
                  <div className="backdrop-blur-xl bg-white/10 rounded-xl px-6 py-2 border border-white/10">
                    <p className="text-white font-semibold text-sm">Cruces: <span className="text-red-400">{crossings}</span></p>
                  </div>

                  {/* Stat Tiempo */}
                  <div className="backdrop-blur-xl bg-white/10 rounded-xl px-6 py-2 border border-white/10">
                    <p className="text-white font-semibold text-sm">Tiempo: <span className={timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-green-400"}>{timeLeft}s</span></p>
                  </div>

                  {/* Botón Volver */}
                  <button
                    onClick={() => navigate(-1)}
                    className="backdrop-blur-xl bg-yellow-500/80 hover:bg-yellow-600/80 rounded-xl px-4 py-2 border border-white/10 transition-all duration-300 transform hover:scale-105"
                  >
                    <p className="text-white font-semibold text-sm">← Volver</p>
                  </button>
                </div>

                {/* Instrucciones */}
                <div className="mt-4 text-center">
                  <p className="text-white/80 text-sm">🖱️ Click y arrastra los círculos (nodos movibles) para reorganizar los cables</p>
                  <p className="text-white/60 text-xs mt-1">Los cuadrados son puntos fijos - no se pueden mover</p>
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
              <p>🎯 <strong>Objetivo:</strong> Organiza los cables para que no se crucen</p>
              <p>🖱️ <strong>Controles:</strong> Arrastra los círculos (2 nodos por cable)</p>
              <p>⬜ <strong>Cuadrados:</strong> Puntos fijos, no se pueden mover</p>
              <p>⏱️ <strong>Tiempo:</strong> Tienes 10 segundos</p>
              <p>❌ <strong>Cruces:</strong> Los cables de diferente color no deben cruzarse</p>
            </div>
            <button
              onClick={() => {
                setShowInstructions(false);
                setCountdown(5); // Reiniciar countdown a 5 segundos
                setShowCables(false); // Ocultar cables hasta que termine el countdown
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

    </div>
  );
};

export default DescruzarCablesPage;
