import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Heart, Coins, Timer, RotateCcw, AlertCircle } from 'lucide-react';

export default function MazeGame({ exercise, onScoreUpdate, onComplete, isTimeUp }) {
  const config = exercise.content || {};
  const gridSize = config.gridSize || { rows: 5, cols: 5 };
  const startPos = config.startPosition || { row: 0, col: 0 };
  const endPos = config.endPosition || { row: gridSize.rows - 1, col: gridSize.cols - 1 };
  const walls = config.walls || [];
  const obstacles = config.obstacles || [];
  const collectibles = config.collectibles || [];
  
  const [playerPos, setPlayerPos] = useState(startPos);
  const [health, setHealth] = useState(100);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [collectedItems, setCollectedItems] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
  const [moves, setMoves] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [lastDamage, setLastDamage] = useState(null);

  // Check if position has a wall
  const hasWall = useCallback((row, col) => {
    return walls.some(w => w.row === row && w.col === col);
  }, [walls]);

  // Check if position has obstacle
  const getObstacle = useCallback((row, col) => {
    return obstacles.find(o => o.row === row && o.col === col);
  }, [obstacles]);

  // Check if position has collectible
  const getCollectible = useCallback((row, col) => {
    return collectibles.find(c => 
      c.row === row && c.col === col && 
      !collectedItems.some(item => item.row === row && item.col === col)
    );
  }, [collectibles, collectedItems]);

  // Move player
  const movePlayer = useCallback((direction) => {
    if (gameStatus !== 'playing') return;

    let newRow = playerPos.row;
    let newCol = playerPos.col;

    switch (direction) {
      case 'up': newRow--; break;
      case 'down': newRow++; break;
      case 'left': newCol--; break;
      case 'right': newCol++; break;
      default: return;
    }

    // Check boundaries
    if (newRow < 0 || newRow >= gridSize.rows || newCol < 0 || newCol >= gridSize.cols) {
      return;
    }

    // Check walls
    if (hasWall(newRow, newCol)) {
      return;
    }

    // Move successful
    setPlayerPos({ row: newRow, col: newCol });
    setMoves(prev => prev + 1);

    // Check for collectible
    const collectible = getCollectible(newRow, newCol);
    if (collectible) {
      setCoinsCollected(prev => prev + (collectible.points || 10));
      setCollectedItems(prev => [...prev, { row: newRow, col: newCol }]);
    }

    // Check for obstacle (trap)
    const obstacle = getObstacle(newRow, newCol);
    if (obstacle) {
      const damage = obstacle.damage || 10;
      setHealth(prev => Math.max(0, prev - damage));
      setLastDamage({ row: newRow, col: newCol, amount: damage });
      setTimeout(() => setLastDamage(null), 1000);
    }

    // Check for goal
    if (newRow === endPos.row && newCol === endPos.col) {
      setGameStatus('won');
    }
  }, [playerPos, gameStatus, gridSize, hasWall, getCollectible, getObstacle, endPos, collectedItems]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameStatus !== 'playing') return;

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          e.preventDefault();
          movePlayer('up');
          break;
        case 's':
        case 'arrowdown':
          e.preventDefault();
          movePlayer('down');
          break;
        case 'a':
        case 'arrowleft':
          e.preventDefault();
          movePlayer('left');
          break;
        case 'd':
        case 'arrowright':
          e.preventDefault();
          movePlayer('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer, gameStatus]);

  // Check for game over
  useEffect(() => {
    if (health <= 0 && gameStatus === 'playing') {
      setGameStatus('lost');
    }
  }, [health, gameStatus]);

  // Check for time up
  useEffect(() => {
    if (isTimeUp && gameStatus === 'playing') {
      setGameStatus('lost');
    }
  }, [isTimeUp, gameStatus]);

  // Calculate and submit score when game ends
  useEffect(() => {
    if (gameStatus === 'won' || gameStatus === 'lost') {
      const maxScore = exercise.max_score || 100;
      let score = 0;

      if (gameStatus === 'won') {
        // Base score for completing
        score = 50;
        
        // Bonus for health remaining
        score += Math.floor(health * 0.2);
        
        // Bonus for coins collected
        score += coinsCollected;
        
        // Penalty for moves (efficiency)
        const optimalMoves = Math.abs(endPos.row - startPos.row) + Math.abs(endPos.col - startPos.col);
        const extraMoves = Math.max(0, moves - optimalMoves);
        score -= Math.floor(extraMoves * 0.5);
        
        // Ensure score doesn't exceed max
        score = Math.min(score, maxScore);
      }

      score = Math.max(0, score);

      if (onScoreUpdate) {
        onScoreUpdate(score);
      }

      setTimeout(() => {
        if (onComplete) {
          onComplete(score);
        }
      }, 2000);
    }
  }, [gameStatus, health, coinsCollected, moves, exercise.max_score, onScoreUpdate, onComplete, endPos, startPos]);

  // Reset game
  const resetGame = () => {
    setPlayerPos(startPos);
    setHealth(100);
    setCoinsCollected(0);
    setCollectedItems([]);
    setGameStatus('playing');
    setMoves(0);
    setLastDamage(null);
  };

  // Get cell content
  const getCellContent = (row, col) => {
    // Player
    if (playerPos.row === row && playerPos.col === col) {
      return (
        <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center text-white font-bold animate-bounce shadow-lg">
          👤
        </div>
      );
    }

    // Start position
    if (startPos.row === row && startPos.col === col) {
      return (
        <div className="w-full h-full bg-green-200 flex items-center justify-center text-2xl">
          🚀
        </div>
      );
    }

    // End position (goal)
    if (endPos.row === row && endPos.col === col) {
      return (
        <div className="w-full h-full bg-blue-500 flex items-center justify-center text-2xl animate-pulse">
          🏁
        </div>
      );
    }

    // Wall
    if (hasWall(row, col)) {
      return (
        <div className="w-full h-full bg-gray-800"></div>
      );
    }

    // Obstacle (trap)
    const obstacle = getObstacle(row, col);
    if (obstacle) {
      return (
        <div className="w-full h-full bg-red-500/30 flex items-center justify-center text-xl">
          ⚠️
        </div>
      );
    }

    // Collectible (coin)
    const collectible = getCollectible(row, col);
    if (collectible) {
      return (
        <div className="w-full h-full bg-yellow-400/30 flex items-center justify-center text-xl animate-spin-slow">
          💰
        </div>
      );
    }

    return null;
  };

  // Calculate cell size based on grid
  const cellSize = Math.min(64, Math.floor(500 / Math.max(gridSize.rows, gridSize.cols)));

  return (
    <div className="min-h-[600px] bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-4 gap-4">
            {/* Health */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <Heart className={`w-6 h-6 ${health > 50 ? 'text-red-500' : 'text-red-700'}`} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Health</div>
                <div className="text-2xl font-bold text-red-600">{health}%</div>
                <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      health > 50 ? 'bg-green-500' : health > 25 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${health}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Coins className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Coins</div>
                <div className="text-2xl font-bold text-yellow-600">{coinsCollected}</div>
              </div>
            </div>

            {/* Moves */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Moves</div>
                <div className="text-2xl font-bold text-blue-600">{moves}</div>
              </div>
            </div>

            {/* Controls Help */}
            <div className="flex items-center justify-end">
              <button
                onClick={() => setShowHint(!showHint)}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold rounded-lg transition-colors"
              >
                {showHint ? 'Hide' : 'Show'} Controls
              </button>
            </div>
          </div>

          {/* Damage Indicator */}
          {lastDamage && (
            <div className="mt-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg animate-pulse">
              <div className="flex items-center gap-2 text-red-700 font-semibold">
                <AlertCircle className="w-5 h-5" />
                <span>Ouch! You took {lastDamage.amount} damage from a trap!</span>
              </div>
            </div>
          )}

          {/* Controls Hint */}
          {showHint && (
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">🎮 How to Play</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use <kbd className="px-2 py-1 bg-white rounded border">W A S D</kbd> or <kbd className="px-2 py-1 bg-white rounded border">Arrow Keys</kbd> to move</li>
                <li>• Collect 💰 coins to earn points</li>
                <li>• Avoid ⚠️ traps - they damage your health!</li>
                <li>• Reach the 🏁 goal to win</li>
                <li>• Use fewer moves for a higher score!</li>
              </ul>
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="bg-white rounded-xl shadow-2xl p-8 flex justify-center">
          <div className="inline-block">
            {Array.from({ length: gridSize.rows }).map((_, row) => (
              <div key={row} className="flex">
                {Array.from({ length: gridSize.cols }).map((_, col) => (
                  <div
                    key={`${row}-${col}`}
                    className="border border-gray-300 relative transition-all"
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {getCellContent(row, col)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6 lg:hidden">
          <h4 className="font-semibold text-gray-900 mb-4 text-center">Mobile Controls</h4>
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => movePlayer('up')}
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
            >
              ↑
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => movePlayer('left')}
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
              >
                ←
              </button>
              <button
                onClick={() => movePlayer('down')}
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
              >
                ↓
              </button>
              <button
                onClick={() => movePlayer('right')}
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Game Over Overlay */}
        {gameStatus !== 'playing' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-scaleIn">
              <div className="text-center">
                {gameStatus === 'won' ? (
                  <>
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold text-green-600 mb-2">You Win!</h2>
                    <p className="text-gray-600 mb-4">
                      You reached the goal in {moves} moves!
                    </p>
                    <div className="bg-green-50 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-600">Health Remaining</div>
                          <div className="font-bold text-green-600">{health}%</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Coins Collected</div>
                          <div className="font-bold text-yellow-600">{coinsCollected}</div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">😢</div>
                    <h2 className="text-3xl font-bold text-red-600 mb-2">Game Over</h2>
                    <p className="text-gray-600 mb-6">
                      {health <= 0 ? 'Your health reached zero!' : 'Time ran out!'}
                    </p>
                  </>
                )}

                <button
                  onClick={resetGame}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        kbd {
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}