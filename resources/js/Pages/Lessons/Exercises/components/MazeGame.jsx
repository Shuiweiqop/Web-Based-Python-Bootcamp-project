import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Coins, Flag, Heart, RotateCcw, Route, Square, Trophy, UserRound } from 'lucide-react';

const sameCell = (a, b) => a.row === b.row && a.col === b.col;

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
  const [gameStatus, setGameStatus] = useState('playing');
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState('Reach the goal. Collect coins, avoid traps, and use fewer moves.');
  const submittedRef = useRef(false);

  const optimalMoves = useMemo(
    () => Math.abs(endPos.row - startPos.row) + Math.abs(endPos.col - startPos.col),
    [endPos, startPos]
  );

  const hasWall = useCallback((row, col) => walls.some((wall) => wall.row === row && wall.col === col), [walls]);
  const getObstacle = useCallback((row, col) => obstacles.find((obstacle) => obstacle.row === row && obstacle.col === col), [obstacles]);
  const getCollectible = useCallback(
    (row, col) => collectibles.find((collectible) => (
      collectible.row === row &&
      collectible.col === col &&
      !collectedItems.some((item) => item.row === row && item.col === col)
    )),
    [collectibles, collectedItems]
  );

  const calculateScore = useCallback(() => {
    const maxScore = exercise.max_score || 100;
    if (gameStatus !== 'won') return 0;

    const healthBonus = Math.floor(health * 0.2);
    const extraMoves = Math.max(0, moves - optimalMoves);
    const efficiencyPenalty = Math.floor(extraMoves * 0.5);
    const rawScore = 50 + healthBonus + coinsCollected - efficiencyPenalty;

    return Math.max(0, Math.min(maxScore, rawScore));
  }, [coinsCollected, exercise.max_score, gameStatus, health, moves, optimalMoves]);

  const movePlayer = useCallback((direction) => {
    if (gameStatus !== 'playing') return;

    let newRow = playerPos.row;
    let newCol = playerPos.col;

    if (direction === 'up') newRow -= 1;
    if (direction === 'down') newRow += 1;
    if (direction === 'left') newCol -= 1;
    if (direction === 'right') newCol += 1;

    if (newRow < 0 || newRow >= gridSize.rows || newCol < 0 || newCol >= gridSize.cols) {
      setMessage('That is outside the maze. Try another direction.');
      return;
    }

    if (hasWall(newRow, newCol)) {
      setMessage('Blocked by a wall. Find another path.');
      return;
    }

    const nextPosition = { row: newRow, col: newCol };
    setPlayerPos(nextPosition);
    setMoves((previous) => previous + 1);

    const collectible = getCollectible(newRow, newCol);
    if (collectible) {
      const points = collectible.points || 10;
      setCoinsCollected((previous) => previous + points);
      setCollectedItems((previous) => [...previous, { row: newRow, col: newCol }]);
      setMessage(`Collected a coin worth ${points} points.`);
    } else {
      setMessage('Nice move. Keep going.');
    }

    const obstacle = getObstacle(newRow, newCol);
    if (obstacle) {
      const damage = obstacle.damage || 10;
      setHealth((previous) => Math.max(0, previous - damage));
      setMessage(`Trap hit. You lost ${damage} health.`);
    }

    if (sameCell(nextPosition, endPos)) {
      setGameStatus('won');
      setMessage('Goal reached. Great pathfinding.');
    }
  }, [endPos, gameStatus, getCollectible, getObstacle, gridSize, hasWall, playerPos]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key.toLowerCase();
      const keyMap = {
        w: 'up',
        arrowup: 'up',
        s: 'down',
        arrowdown: 'down',
        a: 'left',
        arrowleft: 'left',
        d: 'right',
        arrowright: 'right',
      };

      if (keyMap[key]) {
        event.preventDefault();
        movePlayer(keyMap[key]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer]);

  useEffect(() => {
    if (health <= 0 && gameStatus === 'playing') {
      setGameStatus('lost');
      setMessage('Health reached zero.');
    }
  }, [health, gameStatus]);

  useEffect(() => {
    if (isTimeUp && gameStatus === 'playing') {
      setGameStatus('lost');
      setMessage('Time ran out.');
    }
  }, [isTimeUp, gameStatus]);

  useEffect(() => {
    if ((gameStatus === 'won' || gameStatus === 'lost') && !submittedRef.current) {
      submittedRef.current = true;
      const finalScore = calculateScore();
      onScoreUpdate?.(finalScore);

      setTimeout(() => {
        onComplete?.(finalScore);
      }, 1600);
    }
  }, [calculateScore, gameStatus, onComplete, onScoreUpdate]);

  const resetGame = () => {
    submittedRef.current = false;
    setPlayerPos(startPos);
    setHealth(100);
    setCoinsCollected(0);
    setCollectedItems([]);
    setGameStatus('playing');
    setMoves(0);
    setMessage('Reach the goal. Collect coins, avoid traps, and use fewer moves.');
    onScoreUpdate?.(0);
  };

  const getCellContent = (row, col) => {
    if (sameCell(playerPos, { row, col })) {
      return <UserRound className="w-6 h-6 text-white" />;
    }
    if (sameCell(startPos, { row, col })) {
      return <span className="text-xs font-bold text-green-800">START</span>;
    }
    if (sameCell(endPos, { row, col })) {
      return <Flag className="w-6 h-6 text-white" />;
    }
    if (hasWall(row, col)) {
      return <Square className="w-5 h-5 text-gray-200 fill-current" />;
    }
    if (getObstacle(row, col)) {
      return <AlertCircle className="w-5 h-5 text-red-700" />;
    }
    if (getCollectible(row, col)) {
      return <Coins className="w-5 h-5 text-yellow-700" />;
    }
    return null;
  };

  const getCellClass = (row, col) => {
    if (sameCell(playerPos, { row, col })) return 'bg-green-500 shadow-inner';
    if (sameCell(startPos, { row, col })) return 'bg-green-100';
    if (sameCell(endPos, { row, col })) return 'bg-blue-500 animate-pulse';
    if (hasWall(row, col)) return 'bg-gray-800';
    if (getObstacle(row, col)) return 'bg-red-100';
    if (getCollectible(row, col)) return 'bg-yellow-100';
    return 'bg-white';
  };

  const cellSize = Math.min(64, Math.floor(500 / Math.max(gridSize.rows, gridSize.cols)));
  const finalScore = calculateScore();

  return (
    <div className="min-h-[600px] bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Health</div>
                <div className="text-2xl font-bold text-red-600">{health}%</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Coins className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Coins</div>
                <div className="text-2xl font-bold text-yellow-600">{coinsCollected}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Route className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Moves</div>
                <div className="text-2xl font-bold text-blue-600">{moves}</div>
                <div className="text-xs text-gray-500">Ideal: {optimalMoves}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Projected</div>
                <div className="text-2xl font-bold text-purple-600">{finalScore}/{exercise.max_score || 100}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm font-semibold">
            {message}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Use W A S D or arrow keys. On touch screens, use the buttons below the board.
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8 flex justify-center overflow-x-auto">
          <div className="inline-block border border-gray-300">
            {Array.from({ length: gridSize.rows }).map((_, row) => (
              <div key={row} className="flex">
                {Array.from({ length: gridSize.cols }).map((_, col) => (
                  <div
                    key={`${row}-${col}`}
                    className={`border border-gray-300 relative transition-all flex items-center justify-center ${getCellClass(row, col)}`}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {getCellContent(row, col)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4 text-center">Controls</h4>
          <div className="flex flex-col items-center gap-2">
            <button type="button" onClick={() => movePlayer('up')} className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg">Up</button>
            <div className="flex gap-2">
              <button type="button" onClick={() => movePlayer('left')} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg">Left</button>
              <button type="button" onClick={() => movePlayer('down')} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg">Down</button>
              <button type="button" onClick={() => movePlayer('right')} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg">Right</button>
            </div>
          </div>
        </div>

        {gameStatus !== 'playing' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4">
              <div className="text-center">
                {gameStatus === 'won' ? (
                  <>
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-green-600 mb-2">You Win</h2>
                    <p className="text-gray-600 mb-4">You reached the goal in {moves} moves.</p>
                    <div className="bg-green-50 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <div className="text-gray-600">Health</div>
                          <div className="font-bold text-green-600">{health}%</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Coins</div>
                          <div className="font-bold text-yellow-600">{coinsCollected}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Score</div>
                          <div className="font-bold text-blue-600">{finalScore}</div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-red-600 mb-2">Game Over</h2>
                    <p className="text-gray-600 mb-6">{message}</p>
                  </>
                )}

                <button
                  type="button"
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
    </div>
  );
}
