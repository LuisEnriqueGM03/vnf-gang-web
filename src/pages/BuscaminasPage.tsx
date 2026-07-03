import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../style/style.css';

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

const BuscaminasPage = () => {
  const navigate = useNavigate();
  const gridSize = 10;
  const totalMines = 10; // 10 minas en un tablero de 10x10 (nivel fácil)

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [revealedCount, setRevealedCount] = useState(0);
  const [flagCount, setFlagCount] = useState(0);

  // Inicializar tablero
  const initializeBoard = useCallback(() => {
    // Crear tablero vacío
    const newGrid: Cell[][] = Array(gridSize).fill(null).map(() =>
      Array(gridSize).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    );

    // Colocar minas aleatoriamente
    let minesPlaced = 0;
    while (minesPlaced < totalMines) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      
      if (!newGrid[y][x].isMine) {
        newGrid[y][x].isMine = true;
        minesPlaced++;
      }
    }

    // Calcular números de minas vecinas
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (!newGrid[y][x].isMine) {
          let count = 0;
          // Revisar las 8 celdas vecinas
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const ny = y + dy;
              const nx = x + dx;
              if (ny >= 0 && ny < gridSize && nx >= 0 && nx < gridSize) {
                if (newGrid[ny][nx].isMine) count++;
              }
            }
          }
          newGrid[y][x].neighborMines = count;
        }
      }
    }

    setGrid(newGrid);
    setRevealedCount(0);
    setFlagCount(0);
    setGameWon(false);
    setGameLost(false);
  }, []);

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  // Revelar celda
  const revealCell = useCallback((x: number, y: number) => {
    if (gameLost || gameWon) return;
    if (grid[y][x].isRevealed || grid[y][x].isFlagged) return;

    const newGrid = [...grid.map(row => [...row])];
    
    // Si es mina, perder
    if (newGrid[y][x].isMine) {
      // Revelar todas las minas
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          if (newGrid[i][j].isMine) {
            newGrid[i][j].isRevealed = true;
          }
        }
      }
      setGrid(newGrid);
      setGameLost(true);
      return;
    }

    // Revelar celda y contar
    let revealed = 0;
    const reveal = (cx: number, cy: number) => {
      if (cy < 0 || cy >= gridSize || cx < 0 || cx >= gridSize) return;
      if (newGrid[cy][cx].isRevealed || newGrid[cy][cx].isFlagged || newGrid[cy][cx].isMine) return;

      newGrid[cy][cx].isRevealed = true;
      revealed++;

      // Si no tiene minas vecinas, revelar vecinos automáticamente
      if (newGrid[cy][cx].neighborMines === 0) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            reveal(cx + dx, cy + dy);
          }
        }
      }
    };

    reveal(x, y);
    setGrid(newGrid);
    
    const newRevealedCount = revealedCount + revealed;
    setRevealedCount(newRevealedCount);

    // Verificar victoria: todas las celdas sin minas reveladas
    if (newRevealedCount === gridSize * gridSize - totalMines) {
      setGameWon(true);
    }
  }, [grid, gameLost, gameWon, revealedCount]);

  // Marcar/desmarcar bandera (click derecho)
  const toggleFlag = useCallback((x: number, y: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameLost || gameWon) return;
    if (grid[y][x].isRevealed) return;

    const newGrid = [...grid.map(row => [...row])];
    newGrid[y][x].isFlagged = !newGrid[y][x].isFlagged;
    
    setGrid(newGrid);
    setFlagCount(prev => newGrid[y][x].isFlagged ? prev + 1 : prev - 1);
  }, [grid, gameLost, gameWon]);

  // Obtener color según número de minas vecinas
  const getNumberColor = (num: number) => {
    switch (num) {
      case 1: return 'text-blue-400';
      case 2: return 'text-green-400';
      case 3: return 'text-red-400';
      case 4: return 'text-purple-400';
      case 5: return 'text-yellow-400';
      case 6: return 'text-cyan-400';
      case 7: return 'text-pink-400';
      case 8: return 'text-orange-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(to bottom right, #000000, #3d3d0a, #000000, #5c5c1a)' }}>
      <Navbar />
      
      {/* Contenido */}
      <div className="relative z-10 container mx-auto px-4 py-8 pt-28">
        {/* Título */}
        <div className="text-center mb-8">
          <div className="backdrop-blur-xl inline-block px-8 py-4 rounded-2xl shadow-2xl border-2" style={{ background: 'linear-gradient(to right, rgba(0, 0, 0, 0.95), rgba(50, 50, 10, 0.9))', borderColor: '#FFD700', boxShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white">💣 Buscaminas</h1>
            <p className="text-white/80 mt-2">Nivel Fácil - 10x10</p>
          </div>
        </div>

        {!showInstructions && (
          <>
            {/* Game Board */}
            <div className="max-w-2xl mx-auto">
              <div className="backdrop-blur-xl bg-white/5 rounded-3xl shadow-2xl p-4 md:p-8 border border-white/10">
                <div 
                  className="grid gap-1 mx-auto"
                  style={{ 
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                    maxWidth: '500px'
                  }}
                >
                  {grid.map((row, y) => 
                    row.map((cell, x) => (
                      <div 
                        key={`${x}-${y}`}
                        className={`aspect-square flex items-center justify-center text-sm md:text-lg font-bold transition-all duration-200 cursor-pointer ${
                          cell.isRevealed 
                            ? cell.isMine 
                              ? 'bg-red-500/80' 
                              : 'bg-white/30'
                            : 'bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50'
                        } rounded`}
                        onClick={() => revealCell(x, y)}
                        onContextMenu={(e) => toggleFlag(x, y, e)}
                      >
                        {cell.isFlagged ? (
                          <span className="material-icons text-yellow-500" style={{ fontSize: '28px' }}>warning</span>
                        ) : cell.isRevealed ? (
                          cell.isMine ? (
                            <span className="material-symbols-outlined text-red-500" style={{ fontSize: '32px' }}>skull</span>
                          ) : cell.neighborMines > 0 ? (
                            <span 
                              className={getNumberColor(cell.neighborMines)}
                              style={{
                                textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0 -1px 0 #fff, 0 1px 0 #fff, -1px 0 0 #fff, 1px 0 0 #fff'
                              }}
                            >
                              {cell.neighborMines}
                            </span>
                          ) : null
                        ) : null}
                      </div>
                    ))
                  )}
                </div>

                {/* Stats */}
                <div className="mt-6 flex justify-center gap-4 flex-wrap">
                  <div className="backdrop-blur-xl bg-white/10 rounded-xl px-6 py-3 border border-white/10">
                    <p className="text-white font-semibold">Minas: <span className="text-red-400">{totalMines}</span></p>
                  </div>
                  <div className="backdrop-blur-xl bg-white/10 rounded-xl px-6 py-3 border border-white/10">
                    <p className="text-white font-semibold flex items-center gap-2">
                      <span className="material-icons text-yellow-500" style={{ fontSize: '20px' }}>warning</span>
                      Peligros: <span className="text-yellow-400">{flagCount}/{totalMines}</span>
                    </p>
                  </div>
                  <div className="backdrop-blur-xl bg-white/10 rounded-xl px-6 py-3 border border-white/10">
                    <p className="text-white font-semibold">Reveladas: <span className="text-cyan-300">{revealedCount}/{gridSize * gridSize - totalMines}</span></p>
                  </div>
                  <button
                    onClick={initializeBoard}
                    className="backdrop-blur-xl bg-white/10 hover:bg-white/20 rounded-xl px-6 py-3 border border-white/10 text-white font-semibold transition-all duration-300"
                  >
                    🔄 Nuevo Juego
                  </button>
                </div>

                {/* Instrucciones */}
                <div className="mt-6 text-center">
                  <p className="text-white/80 text-sm flex items-center justify-center gap-2">
                    👆 Click izquierdo: Revelar | Click derecho: Marcar peligro
                    <span className="material-icons text-yellow-500" style={{ fontSize: '16px' }}>warning</span>
                  </p>
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
              <p className="flex items-center gap-2">
                🎯 <strong>Objetivo:</strong> Revelar todas las celdas sin minas
              </p>
              <p className="flex items-center gap-2">
                👆 <strong>Click Izquierdo:</strong> Revelar celda
              </p>
              <p className="flex items-center gap-2">
                <span className="material-icons text-yellow-500" style={{ fontSize: '20px' }}>warning</span>
                <strong>Click Derecho:</strong> Marcar peligro
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500" style={{ fontSize: '20px' }}>skull</span>
                <strong>Minas:</strong> 10 minas en el tablero
              </p>
              <p className="flex items-center gap-2">
                🔢 <strong>Números:</strong> Indican cuántas minas hay alrededor
              </p>
              <p className="flex items-center gap-2">
                <span className="material-icons text-yellow-500" style={{ fontSize: '20px' }}>warning</span>
                <strong>Cuidado:</strong> Si revelas una mina, ¡pierdes!
              </p>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
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
              <div className="text-6xl mb-4">💥</div>
              <h2 className="text-4xl font-bold text-white mb-4">¡Perdiste!</h2>
              <p className="text-xl text-red-400 mb-2">Encontraste una mina</p>
              <p className="text-white/80 mb-6">Celdas reveladas: {revealedCount}</p>
              
              <div className="flex gap-4">
                <button
                  onClick={initializeBoard}
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
              <p className="text-2xl text-cyan-300 mb-2">¡Encontraste todas las minas!</p>
              <p className="text-white/80 mb-6">Celdas reveladas: {revealedCount}</p>
              
              <div className="flex gap-4">
                <button
                  onClick={initializeBoard}
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

export default BuscaminasPage;
