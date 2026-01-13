import React, { useState } from 'react';

export default function MazeGameConfig({ value = {}, onChange }) {
    // 默认配置
    const defaultConfig = {
        gridSize: { rows: 5, cols: 5 },
        startPosition: { row: 0, col: 0 },
        endPosition: { row: 4, col: 4 },
        walls: [],
        obstacles: [],
        collectibles: [],
        timeLimit: 300, // 5 minutes
        ...value
    };

    const [config, setConfig] = useState(defaultConfig);
    const [selectedTool, setSelectedTool] = useState('wall'); // wall, obstacle, collectible, start, end, erase

    // 更新配置并通知父组件
    const updateConfig = (newConfig) => {
        setConfig(newConfig);
        onChange(newConfig);
    };

    // 处理网格大小变化
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

    // 处理单元格点击
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
                const wallIndex = config.walls.findIndex(
                    w => w.row === row && w.col === col
                );
                if (wallIndex > -1) {
                    newConfig.walls = config.walls.filter((_, i) => i !== wallIndex);
                } else {
                    newConfig.walls = [...config.walls, position];
                }
                break;
            
            case 'obstacle':
                const obstacleIndex = config.obstacles.findIndex(
                    o => o.row === row && o.col === col
                );
                if (obstacleIndex > -1) {
                    newConfig.obstacles = config.obstacles.filter((_, i) => i !== obstacleIndex);
                } else {
                    newConfig.obstacles = [...config.obstacles, {
                        ...position,
                        type: 'trap',
                        damage: 10
                    }];
                }
                break;
            
            case 'collectible':
                const collectibleIndex = config.collectibles.findIndex(
                    c => c.row === row && c.col === col
                );
                if (collectibleIndex > -1) {
                    newConfig.collectibles = config.collectibles.filter((_, i) => i !== collectibleIndex);
                } else {
                    newConfig.collectibles = [...config.collectibles, {
                        ...position,
                        type: 'coin',
                        points: 10
                    }];
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

    // 检查单元格类型
    const getCellType = (row, col) => {
        if (config.startPosition.row === row && config.startPosition.col === col) return 'start';
        if (config.endPosition.row === row && config.endPosition.col === col) return 'end';
        if (config.walls.some(w => w.row === row && w.col === col)) return 'wall';
        if (config.obstacles.some(o => o.row === row && o.col === col)) return 'obstacle';
        if (config.collectibles.some(c => c.row === row && c.col === col)) return 'collectible';
        return 'empty';
    };

    // 获取单元格样式
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

    // 快速填充功能
    const quickFill = (pattern) => {
        let newConfig = { ...config };
        const { rows, cols } = config.gridSize;

        switch (pattern) {
            case 'border':
                newConfig.walls = [];
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
                            newConfig.walls.push({ row: r, col: c });
                        }
                    }
                }
                break;
            
            case 'diagonal':
                newConfig.walls = [];
                for (let i = 0; i < Math.min(rows, cols); i++) {
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

    return (
        <div className="space-y-6">
            {/* 网格大小设置 */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">🎯 Maze Grid Size</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rows (Height)
                        </label>
                        <input
                            type="number"
                            min="3"
                            max="20"
                            value={config.gridSize.rows}
                            onChange={(e) => handleGridSizeChange('rows', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Columns (Width)
                        </label>
                        <input
                            type="number"
                            min="3"
                            max="20"
                            value={config.gridSize.cols}
                            onChange={(e) => handleGridSizeChange('cols', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* 工具选择 */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">🛠️ Drawing Tools</h3>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'start', label: '🚀 Start', color: 'green' },
                        { id: 'end', label: '🏁 End', color: 'blue' },
                        { id: 'wall', label: '🧱 Wall', color: 'gray' },
                        { id: 'obstacle', label: '⚠️ Trap', color: 'red' },
                        { id: 'collectible', label: '💰 Coin', color: 'yellow' },
                        { id: 'erase', label: '🧹 Erase', color: 'white' },
                    ].map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => setSelectedTool(tool.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                selectedTool === tool.id
                                    ? `bg-${tool.color}-500 text-white ring-2 ring-${tool.color}-600`
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {tool.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 快速填充 */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">⚡ Quick Fill</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => quickFill('border')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        Border Walls
                    </button>
                    <button
                        onClick={() => quickFill('diagonal')}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                    >
                        Diagonal
                    </button>
                    <button
                        onClick={() => quickFill('clear')}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                        Clear All
                    </button>
                </div>
            </div>

            {/* 迷宫网格编辑器 */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">🗺️ Maze Grid Editor</h3>
                <div className="flex justify-center overflow-auto p-4">
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
                                        >
                                            {cellType === 'start' && 'S'}
                                            {cellType === 'end' && 'E'}
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

            {/* 时间限制 */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">⏱️ Time Limit</h3>
                <div className="flex items-center gap-4">
                    <input
                        type="number"
                        min="0"
                        value={config.timeLimit}
                        onChange={(e) => updateConfig({ ...config, timeLimit: parseInt(e.target.value) || 0 })}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-600">seconds (0 = no limit)</span>
                </div>
            </div>

            {/* 统计信息 */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">📊 Maze Statistics</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-blue-700">Grid Size:</span>
                        <span className="font-semibold">{config.gridSize.rows} × {config.gridSize.cols}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-700">Walls:</span>
                        <span className="font-semibold">{config.walls.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-700">Obstacles:</span>
                        <span className="font-semibold">{config.obstacles.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-700">Collectibles:</span>
                        <span className="font-semibold">{config.collectibles.length}</span>
                    </div>
                </div>
            </div>

            {/* JSON 预览（调试用） */}
            <details className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                    📝 JSON Preview (for debugging)
                </summary>
                <pre className="bg-white p-3 rounded border border-gray-300 text-xs overflow-auto max-h-64">
                    {JSON.stringify(config, null, 2)}
                </pre>
            </details>
        </div>
    );
}