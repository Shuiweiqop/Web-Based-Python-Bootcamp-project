import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  SparklesIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

/**
 * 迷宫游戏组件 - 使用编程逻辑导航迷宫
 * 文件位置：resources/js/Components/Games/MazeGame.jsx
 */
const MazeGame = ({ 
  exercise, 
  onScoreUpdate,
  isTimeUp = false 
}) => {
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [collectedItems, setCollectedItems] = useState(new Set());
  const [commandSequence, setCommandSequence] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [executionSpeed, setExecutionSpeed] = useState(500);

  // 默认迷宫配置（如果 exercise.content 没有提供）
  const defaultMaze = {
    grid: [
      ['S', '.', '#', '.', 'G'],
      ['.', '.', '#', '.', '#'],
      ['#', '.', '.', '.', '#'],
      ['.', '*', '#', '*', '.'],
      ['.', '.', '.', '.', '.']
    ],
    start: { x: 0, y: 0 },
    goal: { x: 4, y: 0 },
    collectibles: [{ x: 1, y: 3 }, { x: 3, y: 3 }]
  };

  const maze = exercise.content?.maze || defaultMaze;
  const availableCommands = exercise.content?.available_commands || [
    { name: 'move_right', icon: ArrowRightIcon, code: 'player.move_right()' },
    { name: 'move_left', icon: ArrowLeftIcon, code: 'player.move_left()' },
    { name: 'move_up', icon: ArrowUpIcon, code: 'player.move_up()' },
    { name: 'move_down', icon: ArrowDownIcon, code: 'player.move_down()' }
  ];

  // 初始化玩家位置
  useEffect(() => {
    setPlayerPosition(maze.start);
  }, [maze.start]);

  // 检查位置是否有效
  const isValidPosition = useCallback((x, y) => {
    if (x < 0 || y < 0 || y >= maze.grid.length || x >= maze.grid[0].length) {
      return false;
    }
    return maze.grid[y][x] !== '#';
  }, [maze.grid]);

  // 执行单个命令
  const executeCommand = useCallback((command, position) => {
    let newX = position.x;
    let newY = position.y;

    switch (command.name) {
      case 'move_right':
        newX += 1;
        break;
      case 'move_left':
        newX -= 1;
        break;
      case 'move_up':
        newY -= 1;
        break;
      case 'move_down':
        newY += 1;
        break;
      default:
        return position;
    }

    return isValidPosition(newX, newY) ? { x: newX, y: newY } : position;
  }, [isValidPosition]);

  // 检查是否收集到物品
  const checkCollectibles = useCallback((position) => {
    const collectibleKey = `${position.x}-${position.y}`;
    const hasCollectible = maze.collectibles?.some(item => 
      item.x === position.x && item.y === position.y
    );
    
    if (hasCollectible && !collectedItems.has(collectibleKey)) {
      setCollectedItems(prev => new Set([...prev, collectibleKey]));
      return true;
    }
    return false;
  }, [maze.collectibles, collectedItems]);

  // 运行命令序列
  const runSequence = useCallback(() => {
    if (commandSequence.length === 0 || isRunning) return;

    setIsRunning(true);
    setCurrentStep(0);
    setPlayerPosition(maze.start);
    setCollectedItems(new Set());

    let currentPos = maze.start;
    let step = 0;

    const executeNextCommand = () => {
      if (step >= commandSequence.length) {
        setIsRunning(false);
        calculateFinalScore(currentPos);
        return;
      }

      const command = commandSequence[step];
      const newPos = executeCommand(command, currentPos);
      
      setPlayerPosition(newPos);
      setCurrentStep(step + 1);
      checkCollectibles(newPos);

      currentPos = newPos;
      step++;

      // 检查是否到达目标
      if (newPos.x === maze.goal.x && newPos.y === maze.goal.y) {
        setGameComplete(true);
        setIsRunning(false);
        calculateFinalScore(newPos);
        return;
      }

      setTimeout(executeNextCommand, executionSpeed);
    };

    executeNextCommand();
  }, [commandSequence, executeCommand, checkCollectibles, maze.start, maze.goal, executionSpeed, isRunning]);

  // 计算最终分数
  const calculateFinalScore = (finalPosition) => {
    let score = 0;
    const maxScore = exercise.max_score;

    // 到达目标的分数 (60%)
    if (finalPosition.x === maze.goal.x && finalPosition.y === maze.goal.y) {
      score += Math.floor(maxScore * 0.6);
    }

    // 收集物品的分数 (30%)
    const collectibleScore = (collectedItems.size / (maze.collectibles?.length || 1)) * (maxScore * 0.3);
    score += Math.floor(collectibleScore);

    // 效率分数 (10%) - 基于命令数量
    const optimalSteps = Math.abs(maze.goal.x - maze.start.x) + Math.abs(maze.goal.y - maze.start.y);
    const efficiency = Math.max(0, 1 - ((commandSequence.length - optimalSteps) / optimalSteps));
    score += Math.floor(efficiency * maxScore * 0.1);

    onScoreUpdate(score);
    return score;
  };

  // 添加命令
  const addCommand = (command) => {
    if (isRunning || isTimeUp) return;
    setCommandSequence(prev => [...prev, command]);
  };

  // 移除命令
  const removeCommand = (index) => {
    if (isRunning) return;
    setCommandSequence(prev => prev.filter((_, i) => i !== index));
  };

  // 清空命令序列
  const clearCommands = () => {
    if (isRunning) return;
    setCommandSequence([]);
  };

  // 重置游戏
  const resetGame = () => {
    setPlayerPosition(maze.start);
    setIsRunning(false);
    setCurrentStep(0);
    setCollectedItems(new Set());
    setGameComplete(false);
  };

  // 渲染迷宫单元格
  const renderCell = (cell, x, y) => {
    const isPlayer = playerPosition.x === x && playerPosition.y === y;
    const isGoal = maze.goal.x === x && maze.goal.y === y;
    const collectibleKey = `${x}-${y}`;
    const hasCollectible = maze.collectibles?.some(item => item.x === x && item.y === y);
    const isCollected = collectedItems.has(collectibleKey);

    let cellClass = "w-8 h-8 flex items-center justify-center text-sm font-bold border ";
    let content = '';

    if (cell === '#') {
      cellClass += "bg-gray-800 text-gray-600 border-gray-700";
      content = '⬛';
    } else if (isPlayer) {
      cellClass += "bg-blue-500 text-white border-blue-400 animate-pulse";
      content = '🤖';
    } else if (isGoal) {
      cellClass += gameComplete 
        ? "bg-green-500 text-white border-green-400 animate-bounce" 
        : "bg-yellow-400 text-yellow-800 border-yellow-300";
      content = gameComplete ? '🏆' : '🎯';
    } else if (hasCollectible && !isCollected) {
      cellClass += "bg-purple-100 text-purple-600 border-purple-200";
      content = '💎';
    } else {
      cellClass += "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200";
      content = '·';
    }

    return (
      <div key={`${x}-${y}`} className={cellClass}>
        {content}
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* 游戏标题 */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            🧩 Code Your Way Through the Maze
          </h3>
          <p className="text-gray-600">
            Program the robot to navigate through the maze, collect gems, and reach the goal!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：迷宫 */}
          <div className="space-y-4">
            <h4 className="font-bold text-lg text-gray-800">🗺️ Maze</h4>
            
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${maze.grid[0].length}, minmax(0, 1fr))` }}>
                {maze.grid.map((row, y) =>
                  row.map((cell, x) => renderCell(cell, x, y))
                )}
              </div>
            </div>

            {/* 游戏状态 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Position:</span>
                  <span className="ml-2 font-mono">({playerPosition.x}, {playerPosition.y})</span>
                </div>
                <div>
                  <span className="text-gray-600">Gems:</span>
                  <span className="ml-2">{collectedItems.size}/{maze.collectibles?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* 完成提示 */}
            {gameComplete && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <SparklesIcon className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-semibold">Congratulations! You reached the goal!</p>
              </div>
            )}
          </div>

          {/* 右侧：编程控制 */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <CodeBracketIcon className="w-5 h-5" />
              Program Commands
            </h4>

            {/* 可用命令 */}
            <div>
              <h5 className="font-semibold text-gray-700 mb-3">Available Commands:</h5>
              <div className="grid grid-cols-2 gap-2">
                {availableCommands.map((command, index) => (
                  <button
                    key={index}
                    onClick={() => addCommand(command)}
                    disabled={isRunning || isTimeUp}
                    className="p-3 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 disabled:opacity-50 border border-blue-200 rounded-lg transition-all duration-200 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <command.icon className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{command.name.replace('_', ' ')}</span>
                    </div>
                    <code className="text-xs text-gray-600 block mt-1">{command.code}</code>
                  </button>
                ))}
              </div>
            </div>

            {/* 命令序列 */}
            <div>
              <h5 className="font-semibold text-gray-700 mb-3">Your Program:</h5>
              <div className="bg-gray-900 text-green-400 rounded-lg p-4 min-h-[200px] font-mono text-sm">
                {commandSequence.length > 0 ? (
                  <div className="space-y-1">
                    {commandSequence.map((command, index) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-2 rounded ${
                          index === currentStep - 1 && isRunning ? 'bg-yellow-600 bg-opacity-20' : ''
                        }`}
                      >
                        <span>{index + 1}. {command.code}</span>
                        {!isRunning && (
                          <button
                            onClick={() => removeCommand(index)}
                            className="text-red-400 hover:text-red-300 ml-2"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    No commands yet. Add some commands above!
                  </div>
                )}
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex gap-3">
              <button
                onClick={runSequence}
                disabled={commandSequence.length === 0 || isRunning || isTimeUp}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isRunning ? (
                  <>
                    <StopIcon className="w-4 h-4" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-4 h-4" />
                    Run Program
                  </>
                )}
              </button>

              <button
                onClick={resetGame}
                disabled={isRunning}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>

              <button
                onClick={clearCommands}
                disabled={isRunning}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
              >
                Clear
              </button>
            </div>

            {/* 执行速度控制 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Execution Speed:
              </label>
              <input
                type="range"
                min="100"
                max="1000"
                step="100"
                value={executionSpeed}
                onChange={(e) => setExecutionSpeed(parseInt(e.target.value))}
                disabled={isRunning}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Fast</span>
                <span>Slow</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MazeGame;