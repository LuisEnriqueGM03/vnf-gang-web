import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../style/style.css';

type Direction = 'up' | 'down' | 'left' | 'right';

const CajaRegistradoraPage = () => {
    const navigate = useNavigate();
    const gridSize = 12; // Adjusted to 12x12 per user request
    const moveDistance = 2;
    const targetSize = 2;

    const [grid, setGrid] = useState<Direction[][]>([]);
    const [availableCells, setAvailableCells] = useState<{ x: number, y: number }[]>([]);
    const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
    const [movesUsed, setMovesUsed] = useState(0);
    const [gameWon, setGameWon] = useState(false);
    const [gameLost, setGameLost] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);
    const [showInstructions, setShowInstructions] = useState(true);
    const [countdown, setCountdown] = useState(0);

    const generatePositions = useCallback(() => {
        const minDistance = Math.floor(Math.random() * 5) + 16;
        let targetX, targetY, startX, startY;
        let attempts = 0;
        const maxAttempts = 100;

        // Dynamic corners based on grid size
        const maxIndex = gridSize - 2;
        const corners = [
            { x: 0, y: 0 }, { x: maxIndex, y: 0 },
            { x: 0, y: maxIndex }, { x: maxIndex, y: maxIndex },
            { x: 0, y: Math.floor(maxIndex / 2) }, { x: maxIndex, y: Math.floor(maxIndex / 2) },
            { x: Math.floor(maxIndex / 2), y: 0 }, { x: Math.floor(maxIndex / 2), y: maxIndex }
        ];

        do {
            const useCorner = Math.random() < 0.8;
            if (useCorner) {
                const targetCorner = corners[Math.floor(Math.random() * corners.length)];
                targetX = targetCorner.x;
                targetY = targetCorner.y;

                let startCorner;
                do {
                    startCorner = corners[Math.floor(Math.random() * corners.length)];
                } while (startCorner.x === targetX && startCorner.y === targetY);

                startX = startCorner.x;
                startY = startCorner.y;
            } else {
                targetX = Math.floor(Math.random() * (gridSize / 2 - 1)) * 2;
                targetY = Math.floor(Math.random() * (gridSize / 2 - 1)) * 2;
                startX = Math.floor(Math.random() * (gridSize / 2 - 1)) * 2;
                startY = Math.floor(Math.random() * (gridSize / 2 - 1)) * 2;
            }
            const distance = Math.abs(targetX - startX) + Math.abs(targetY - startY);
            attempts++;
            if (distance >= minDistance || attempts >= maxAttempts) break;
        } while (true);

        return { targetX, targetY, startX, startY };
    }, [gridSize]);

    const generateGridWithSolution = useCallback((startX: number, startY: number, targetX: number, targetY: number) => {
        const directions: Direction[] = ['up', 'down', 'left', 'right'];
        const newGrid: Direction[][] = [];

        for (let i = 0; i < gridSize; i++) {
            const row: Direction[] = [];
            for (let j = 0; j < gridSize; j++) {
                row.push(directions[Math.floor(Math.random() * directions.length)]);
            }
            newGrid.push(row);
        }

        let currentX = startX;
        let currentY = startY;
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts && (Math.abs(currentX - targetX) > 1 || Math.abs(currentY - targetY) > 1)) {
            let direction: Direction;
            if (Math.abs(currentX - targetX) > Math.abs(currentY - targetY)) {
                direction = currentX < targetX ? 'right' : 'left';
            } else {
                direction = currentY < targetY ? 'down' : 'up';
            }

            const cellsInBlock = [
                { x: currentX, y: currentY },
                { x: currentX + 1, y: currentY },
                { x: currentX, y: currentY + 1 },
                { x: currentX + 1, y: currentY + 1 }
            ];

            const randomCell = cellsInBlock[Math.floor(Math.random() * cellsInBlock.length)];
            if (randomCell.y < gridSize && randomCell.x < gridSize) {
                newGrid[randomCell.y][randomCell.x] = direction;
            }

            switch (direction) {
                case 'up': currentY = Math.max(0, currentY - moveDistance); break;
                case 'down': currentY = Math.min(gridSize - 2, currentY + moveDistance); break;
                case 'left': currentX = Math.max(0, currentX - moveDistance); break;
                case 'right': currentX = Math.min(gridSize - 2, currentX + moveDistance); break;
            }
            attempts++;
        }
        return newGrid;
    }, [gridSize, moveDistance]);

    const startGame = useCallback(() => {
        const { targetX, targetY, startX, startY } = generatePositions();
        const newGrid = generateGridWithSolution(startX, startY, targetX, targetY);
        setGrid(newGrid);
        setTargetPos({ x: targetX, y: targetY });
        setAvailableCells([
            { x: startX, y: startY },
            { x: startX + 1, y: startY },
            { x: startX, y: startY + 1 },
            { x: startX + 1, y: startY + 1 }
        ]);
        setMovesUsed(0);
        setTimeLeft(10);
        setGameWon(false);
        setGameLost(false);
    }, [generatePositions, generateGridWithSolution]);

    // Initial load
    useEffect(() => {
        startGame();
    }, [startGame]);

    // Countdown Logic
    useEffect(() => {
        if (countdown > 0 && !gameWon && !gameLost) {
            const timer = setInterval(() => {
                setCountdown(prev => prev <= 1 ? 0 : prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [countdown, gameWon, gameLost]);

    // Game Timer (Only when countdown is 0 and instructions are hidden)
    useEffect(() => {
        if (gameWon || gameLost || showInstructions || countdown > 0) return;
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
    }, [gameWon, gameLost, showInstructions, countdown]);

    const handleCellClick = useCallback((x: number, y: number) => {
        if (countdown > 0 || showInstructions) return;
        if (gameWon || gameLost) return;

        const isAvailable = availableCells.some(cell => cell.x === x && cell.y === y);
        if (!isAvailable) return;

        const direction = grid[y]?.[x];
        if (!direction) return;

        let deltaX = 0;
        let deltaY = 0;

        switch (direction) {
            case 'up': deltaY = -moveDistance; break;
            case 'down': deltaY = moveDistance; break;
            case 'left': deltaX = -moveDistance; break;
            case 'right': deltaX = moveDistance; break;
        }

        const newAvailableCells = availableCells.map(cell => ({
            x: cell.x + deltaX,
            y: cell.y + deltaY
        }));

        const allCellsValid = newAvailableCells.every(cell =>
            cell.x >= 0 && cell.x < gridSize && cell.y >= 0 && cell.y < gridSize
        );

        if (!allCellsValid) {
            setGameLost(true);
            return;
        }

        setAvailableCells(newAvailableCells);

        const wonGame = newAvailableCells.some(cell =>
            cell.x >= targetPos.x && cell.x < targetPos.x + targetSize &&
            cell.y >= targetPos.y && cell.y < targetPos.y + targetSize
        );

        if (wonGame) setGameWon(true);
        setMovesUsed(m => m + 1);
    }, [availableCells, gameWon, gameLost, countdown, showInstructions, grid, targetPos, targetSize, moveDistance, gridSize]);


    const getArrowSymbol = (direction: Direction) => {
        switch (direction) {
            case 'up': return '↑';
            case 'down': return '↓';
            case 'left': return '←';
            case 'right': return '→';
        }
    };

    const isInTargetArea = (x: number, y: number) => {
        return x >= targetPos.x && x < targetPos.x + targetSize &&
            y >= targetPos.y && y < targetPos.y + targetSize;
    };

    const startCountdown = () => {
        setShowInstructions(false);
        setCountdown(5);
    };

    const resetGame = () => {
        startGame();
        setCountdown(5);
    };

    return (
        <div className="cr-container">
            <Navbar />

            <div className="cr-header">
                <h1 className="cr-title">SYSTEM_BREACH:</h1>
                <h2 className="cr-title">CAJA_REGISTRADORA</h2>
                <div className="cr-subtitle">TARGET OVERRIDE SEQUENCE INITIATED</div>
            </div>

            <div className="cr-grid-container" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                {countdown > 0 && !showInstructions && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50 backdrop-blur-sm">
                        <div className="text-[5rem] font-bold text-[#FFD700] animate-pulse drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]">
                            {countdown}
                        </div>
                    </div>
                )}

                {grid.map((row, y) =>
                    row.map((cell, x) => {
                        const isAvailable = availableCells.some(c => c.x === x && c.y === y);
                        const isTarget = isInTargetArea(x, y);
                        const isTargetLabel = x === targetPos.x && y === targetPos.y;

                        let cellClasses = 'cr-cell';
                        if (isTarget) cellClasses += ' target';
                        if (isAvailable) cellClasses += ' active-zone';

                        return (
                            <div
                                key={`${x}-${y}`}
                                className={cellClasses}
                                onClick={() => handleCellClick(x, y)}
                            >
                                {(isAvailable || (isTarget && !isTargetLabel) || (!isAvailable && !isTarget)) && countdown === 0 && !showInstructions && getArrowSymbol(cell)}

                                {isTargetLabel && (
                                    <div className="cr-target-label">
                                        <div className="cr-target-icon">⌖</div>
                                        <div className="cr-target-text">TARGET</div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <div className="cr-progress-container">
                <div className="cr-progress-bar" style={{ width: `${(timeLeft / 10) * 100}%` }}></div>
            </div>

            <div className="cr-controls">
                <div className="cr-stat-box">
                    <span className="cr-label">MOVES</span>
                    <span className="cr-value">{movesUsed}</span>
                </div>

                <div className="cr-stat-box" style={{ textAlign: 'center' }}>
                    <span className="cr-label">TIME</span>
                    <span className={`cr-value ${timeLeft <= 3 ? 'red' : 'green'}`}>{timeLeft}s</span>
                </div>

                <div className="cr-stat-box" style={{ alignItems: 'flex-end' }}>
                    <button className="cr-btn reset" onClick={resetGame}>
                        <span>↻</span> RESET
                    </button>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem', color: '#00ffff', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
                <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '5px' }}>👆</span>
                CLICK ACTIVE ZONE
            </div>

            <button className="cr-btn abort" onClick={() => navigate('/minijuegos')}>
                ← ABORT MISSION
            </button>

            {/* Instructions Modal (Cyberpunk Style) */}
            {showInstructions && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                    <div className="cr-header" style={{ maxWidth: '500px', width: '100%', margin: 0 }}>
                        <h2 className="cr-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>MISSION BRIEFING</h2>
                        <div className="text-left space-y-3 font-mono text-sm text-[#ddd] mb-6 border-l-2 border-[#FFD700] pl-4">
                            <p><span className="text-[#FFD700]">&gt;&gt; OBJECTIVE:</span> Reach the <span className="text-red-500">RED TARGET</span> zone.</p>
                            <p><span className="text-[#FFD700]">&gt;&gt; CONTROLS:</span> Click the <span className="text-cyan-400">CYAN BLOCK</span> (Player).</p>
                            <p><span className="text-[#FFD700]">&gt;&gt; MOVEMENT:</span> Block moves 2 steps in the arrow's direction.</p>
                            <p><span className="text-[#FFD700]">&gt;&gt; TIME LIMIT:</span> 10 seconds to complete the breach.</p>
                            <p className="text-red-500 blink">&gt;&gt; WARNING: Do not exit the grid boundary.</p>
                        </div>
                        <button className="cr-btn" style={{ width: '100%', borderColor: '#FFD700', color: '#FFD700' }} onClick={startCountdown}>
                            INITIALIZE SEQUENCE
                        </button>
                        <button className="cr-btn abort" style={{ marginTop: '1rem', fontSize: '0.8rem' }} onClick={() => navigate('/minijuegos')}>
                            DECLINE MISSION
                        </button>
                    </div>
                </div>
            )}

            {/* End Game Modal */}
            {(gameWon || gameLost) && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
                    <div className="cr-header" style={{ maxWidth: '400px', background: '#000' }}>
                        <h1 className="cr-title" style={{ color: gameWon ? '#FFD700' : '#ff0000' }}>
                            {gameWon ? 'SYSTEM BREACHED' : 'ACCESS DENIED'}
                        </h1>
                        <div className="cr-subtitle" style={{ color: '#fff', marginBottom: '2rem' }}>
                            {gameWon ? 'FUNDS TRANSFERRED SUCCESSFULLY' : (timeLeft === 0 ? 'CONNECTION TIMED OUT' : 'SIGNAL LOST - OUT OF BOUNDS')}
                        </div>
                        <div className="flex gap-4 justify-center">
                            <button className="cr-btn reset" onClick={resetGame}>RETRY HACK</button>
                            <button className="cr-btn" onClick={() => navigate('/minijuegos')}>DISCONNECT</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CajaRegistradoraPage;