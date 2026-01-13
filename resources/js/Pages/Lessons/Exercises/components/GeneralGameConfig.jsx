// resources/js/Pages/Admin/Exercises/components/MazeGameConfig.jsx
import React, { useState } from 'react';
import { Grid, Target, Coins, AlertTriangle, Lightbulb, Zap } from 'lucide-react';

export default function MazeGameConfig({ value = {}, onChange }) {
  const defaultConfig = {
    gridSize: { rows: 5, cols: 5 },
    startPosition: { row: 0, col: 0 },
    endPosition: { row: 4, col: 4 },
    walls: [],
    obstacles: [],
    collectibles: [],
    timeLimit: 0,
    ...value
  };

  const [config, setConfig] = useState(defaultConfig);
  const [selectedTool, setSelectedTool] = useState('wall');
  const [showQuickSetup, setShowQuickSetup] = useState(false);

  const updateConfig = (newConfig) => {
    setConfig(newConfig);
    onChange(newConfig);
  };

  const handleGridSizeChange = (dimension, value) => {
    const newSize = {
      ...config.gridSize,
      [dimension]: parseInt(value) || 3
    };
    updateConfig({
      ...config,
      gridSize: newSize
    });
  };

  const handleCellClick = (row, col) => {
    const position = { row, col };
    let newConfig = { ...config };

    switch (selectedTool) {
      case 'start':
        newConfig.startPosition = position;
        break;
      
      case 'end':
        newConfig.endPosition = position;
        break;
      
      case 'wall':
        const wallIndex = config.walls.findIndex(w => w.row === row && w.col === col);
        if (wallIndex > -1) {
          newConfig.walls = config.walls.filter((_, i) => i !== wallIndex);
        } else {
          newConfig.walls = [...config.walls, position];
        }
        break;
      
      case 'obstacle':
        const obstacleIndex = config.obstacles.findIndex(o => o.row === row && o.col === col);
        if (obstacleIndex > -1) {
          newConfig.obstacles = config.obstacles.filter((_, i) => i !== obstacleIndex);
        } else {
          newConfig.obstacles = [...config.obstacles, { ...position, type: 'trap', damage: 10 }];
        }
        break;
      
      case 'collectible':
        const collectibleIndex = config.collectibles.findIndex(c => c.row === row && c.col === col);
        if (collectibleIndex > -1) {
          newConfig.collectibles = config.collectibles.filter((_, i) => i !== collectibleIndex);
        } else {
          newConfig.collectibles = [...config.collectibles, { ...position, type: 'coin', points: 10 }];
        }
        break;
      
      case 'erase':
        newConfig.walls = config.walls.filter(w => !(w.row === row && w.col === col));
        newConfig.obstacles = config.obstacles.filter(o => !(o.row === row && o.col === col));
        newConfig.collectibles = config.collectibles.filter(c => !(c.row === row && c.col === col));
        break;
    }

    updateConfig(newConfig);
  };

  const getCellType = (row, col) => {
    if (config.startPosition.row === row && config.startPosition.col === col) return 'start';
    if (config.endPosition.row === row && config.endPosition.col === col) return 'end';
    if (config.walls.some(w => w.row === row && w.col === col)) return 'wall';
    if (config.obstacles.some(o => o.row === row && o.col === col)) return 'obstacle';
    if (config.collectibles.some(c => c.row === row && c.col === col)) return 'collectible';
    return 'empty';
  };

  const getCellStyle = (type) => {
    const baseStyle = "w-12 h-12 border border-gray-300 cursor-pointer transition-all hover:scale-105";
    
    switch (type) {
      case 'start':
        return `${baseStyle} bg-green-500 text-white font-bold flex items-center justify-center`;
      case 'end':
        return `${baseStyle} bg-blue-500 text-white font-bold flex items-center justify-center`;
      case 'wall':
        return `${baseStyle} bg-gray-800`;
      case 'obstacle':
        return `${baseStyle} bg-red-500 flex items-center justify-center text-white`;
      case 'collectible':
        return `${baseStyle} bg-yellow-400 flex items-center justify-center`;
      default:
        return `${baseStyle} bg-white hover:bg-gray-100`;
    }
  };

  const quickFill = (pattern) => {
    let newConfig = { ...config };
    const { rows, cols } = config.gridSize;

    switch (pattern) {
      case 'border':
        newConfig.walls = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
              if (!((r === 0 && c === 0) || (r === rows-1 && c === cols-1))) {
                newConfig.walls.push({ row: r, col: c });
              }
            }
          }
        }
        break;
      
      case 'diagonal':
        newConfig.walls = [];
        for (let i = 1; i < Math.min(rows, cols) - 1; i++) {
          newConfig.walls.push({ row: i, col: i });
        }
        break;
      
      case 'clear':
        newConfig.walls = [];
        newConfig.obstacles = [];
        newConfig.collectibles = [];
        break;
    }

    updateConfig(newConfig);
  };

  const applyTemplate = (templateName) => {
    const templates = {
      simple: {
        gridSize: { rows: 5, cols: 5 },
        startPosition: { row: 0, col: 0 },
        endPosition: { row: 4, col: 4 },
        walls: [
          { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 },
          { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 },
        ],
        obstacles: [],
        collectibles: [
          { row: 2, col: 2, type: 'coin', points: 10 },
        ],
        timeLimit: 60,
      },
      challenge: {
        gridSize: { rows: 7, cols: 7 },
        startPosition: { row: 0, col: 0 },
        endPosition: { row: 6, col: 6 },
        walls: [
          { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
          { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 },
          { row: 5, col: 4 }, { row: 5, col: 5 }, { row: 5, col: 6 },
        ],
        obstacles: [
          { row: 2, col: 3, type: 'trap', damage: 10 },
          { row: 4, col: 2, type: 'trap', damage: 10 },
        ],
        collectibles: [
          { row: 2, col: 1, type: 'coin', points: 10 },
          { row: 4, col: 4, type: 'coin', points: 10 },
          { row: 6, col: 3, type: 'coin', points: 10 },
        ],
        timeLimit: 120,
      },
      pathfinding: {
        gridSize: { rows: 6, cols: 6 },
        startPosition: { row: 0, col: 0 },
        endPosition: { row: 5, col: 5 },
        walls: [
          { row: 0, col: 2 }, { row: 1, col: 2 }, { row: 2, col: 2 },
          { row: 3, col: 3 }, { row: 4, col: 3 }, { row: 5, col: 3 },
        ],
        obstacles: [],
        collectibles: [
          { row: 1, col: 1, type: 'coin', points: 5 },
          { row: 3, col: 1, type: 'coin', points: 5 },
          { row: 5, col: 1, type: 'coin', points: 5 },
        ],
        timeLimit: 90,
      },
    };

    const template = templates[templateName];
    if (template) {
      setConfig(template);
      updateConfig(template);
      setShowQuickSetup(false);
      alert(`✅ Applied "${templateName}" maze template!`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-orange-600 rounded-xl">
          <Grid className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-orange-900">Maze Game Configuration</h3>
          <p className="text-sm text-orange-700">Design a grid-based navigation challenge</p>
        </div>
        <button
          type="button"
          onClick={() => setShowQuickSetup(!showQuickSetup)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Lightbulb className="h-4 w-4" />
          Quick Setup
        </button>
      </div>

      {/* Quick Setup Templates */}
      {showQuickSetup && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border-2 border-purple-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              <h4 className="font-bold text-purple-900">Quick Maze Templates</h4>
            </div>
            <button
              type="button"
              onClick={() => setShowQuickSetup(false)}
              className="text-purple-600 hover:text-purple-800 font-semibold text-sm"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-sm text-purple-700 mb-4">
            Start with a pre-designed maze and customize it
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => applyTemplate('simple')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">🟢 Simple Maze</div>
              <div className="text-xs text-gray-600">5×5 grid, basic walls</div>
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('challenge')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">🔴 Challenge</div>
              <div className="text-xs text-gray-600">7×7 grid, traps & coins</div>
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('pathfinding')}
              className="p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 mb-1">🔵 Pathfinding</div>
              <div className="text-xs text-gray-600">6×6 grid, algorithm practice</div>
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-cyan-50 to-orange-50 border-2 border-cyan-300 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-cyan-500 rounded-lg">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-cyan-900 mb-2">📚 How to Create a Maze Game</h4>
            <ol className="text-sm text-cyan-800 space-y-2 ml-4 list-decimal">
              <li><strong>Step 1:</strong> Set grid size (how big the maze is)</li>
              <li><strong>Step 2:</strong> Select a tool (Start, End, Wall, Trap, Coin)</li>
              <li><strong>Step 3:</strong> Click on grid cells to place items</li>
              <li><strong>Step 4:</strong> Students navigate from Start (🚀) to End (🏁)</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Grid Size Settings */}
      <div className="bg-white rounded-lg p-5 border-2 border-orange-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
          <h4 className="font-bold text-gray-900">Grid Size</h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rows (Height)
            </label>
            <input
              type="number"
              min="3"
              max="15"
              value={config.gridSize.rows}
              onChange={(e) => handleGridSizeChange('rows', e.target.value)}
              className="w-full px-4 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Columns (Width)
            </label>
            <input
              type="number"
              min="3"
              max="15"
              value={config.gridSize.cols}
              onChange={(e) => handleGridSizeChange('cols', e.target.value)}
              className="w-full px-4 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Drawing Tools */}
      <div className="bg-white rounded-lg p-5 border-2 border-blue-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
          <h4 className="font-bold text-gray-900">Drawing Tools</h4>
          <span className="text-sm text-gray-600 ml-2">(Click tool, then click grid)</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'start', label: '🚀 Start', color: 'green' },
            { id: 'end', label: '🏁 End', color: 'blue' },
            { id: 'wall', label: '🧱 Wall', color: 'gray' },
            { id: 'obstacle', label: '⚠️ Trap', color: 'red' },
            { id: 'collectible', label: '💰 Coin', color: 'yellow' },
            { id: 'erase', label: '🧹 Erase', color: 'slate' },
          ].map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => setSelectedTool(tool.id)}
              className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                selectedTool === tool.id
                  ? `bg-${tool.color}-500 text-white ring-2 ring-${tool.color}-600 shadow-md`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Fill Actions */}
      <div className="bg-white rounded-lg p-5 border-2 border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-5 w-5 text-purple-600" />
          <h4 className="font-bold text-gray-900">Quick Fill</h4>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => quickFill('border')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            🔲 Border Walls
          </button>
          <button
            type="button"
            onClick={() => quickFill('diagonal')}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-semibold"
          >
            ↘️ Diagonal
          </button>
          <button
            type="button"
            onClick={() => quickFill('clear')}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
          >
            🗑️ Clear All
          </button>
        </div>
      </div>

      {/* Maze Grid Editor */}
      <div className="bg-white rounded-lg p-5 border-2 border-orange-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
          <h4 className="font-bold text-gray-900">Maze Grid Editor</h4>
        </div>
        <p className="text-sm text-gray-600 mb-4 bg-orange-50 p-3 rounded border border-orange-200">
          💡 <strong>Selected tool: {selectedTool.toUpperCase()}</strong> - Click any cell to place/remove
        </p>
        <div className="flex justify-center overflow-auto p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
          <div className="inline-block">
            {Array.from({ length: config.gridSize.rows }).map((_, row) => (
              <div key={row} className="flex">
                {Array.from({ length: config.gridSize.cols }).map((_, col) => {
                  const cellType = getCellType(row, col);
                  return (
                    <div
                      key={`${row}-${col}`}
                      onClick={() => handleCellClick(row, col)}
                      className={getCellStyle(cellType)}
                      title={`Row: ${row}, Col: ${col}`}
                    >
                      {cellType === 'start' && '🚀'}
                      {cellType === 'end' && '🏁'}
                      {cellType === 'obstacle' && '⚠️'}
                      {cellType === 'collectible' && '💰'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time Limit */}
      <div className="bg-white rounded-lg p-5 border-2 border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">⏱️ Time Limit (Optional)</h4>
        <div className="flex items-center gap-4">
          <input
            type="number"
            min="0"
            value={config.timeLimit}
            onChange={(e) => updateConfig({ ...config, timeLimit: parseInt(e.target.value) || 0 })}
            className="w-32 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-600">seconds (0 = no limit)</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-lg p-5">
        <h4 className="font-bold text-indigo-900 mb-3">📊 Maze Statistics</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/70 rounded-lg p-3 border-2 border-indigo-200">
            <div className="text-xs text-gray-600 mb-1">Grid Size</div>
            <div className="text-lg font-bold text-indigo-600">{config.gridSize.rows} × {config.gridSize.cols}</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 border-2 border-indigo-200">
            <div className="text-xs text-gray-600 mb-1">Walls</div>
            <div className="text-lg font-bold text-gray-600">{config.walls.length}</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 border-2 border-indigo-200">
            <div className="text-xs text-gray-600 mb-1">Obstacles</div>
            <div className="text-lg font-bold text-red-600">{config.obstacles.length}</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 border-2 border-indigo-200">
            <div className="text-xs text-gray-600 mb-1">Collectibles</div>
            <div className="text-lg font-bold text-yellow-600">{config.collectibles.length}</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 border-2 border-indigo-200">
            <div className="text-xs text-gray-600 mb-1">Time Limit</div>
            <div className="text-lg font-bold text-blue-600">{config.timeLimit || '∞'} sec</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 border-2 border-indigo-200">
            <div className="text-xs text-gray-600 mb-1">Total Cells</div>
            <div className="text-lg font-bold text-purple-600">{config.gridSize.rows * config.gridSize.cols}</div>
          </div>
        </div>
      </div>
    </div>
  );
}