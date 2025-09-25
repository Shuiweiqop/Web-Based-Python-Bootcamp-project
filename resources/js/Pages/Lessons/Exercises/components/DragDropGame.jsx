import React, { useState, useRef } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  CursorArrowRaysIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

/**
 * 拖拽游戏组件 - 拖拽代码块到正确位置
 * 文件位置：resources/js/Components/Games/DragDropGame.jsx
 */
const DragDropGame = ({ 
  exercise, 
  onScoreUpdate,
  isTimeUp = false 
}) => {
  const [draggedItems, setDraggedItems] = useState({});
  const [dragOverZone, setDragOverZone] = useState(null);
  const [completedItems, setCompletedItems] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const draggedElementRef = useRef(null);

  // 计算分数
  const calculateScore = (newDraggedItems = draggedItems) => {
    if (!exercise.content?.items) return 0;
    
    let correctCount = 0;
    exercise.content.items.forEach(item => {
      if (newDraggedItems[item.id] === item.correct_zone) {
        correctCount++;
      }
    });
    
    const score = Math.floor((correctCount / exercise.content.items.length) * exercise.max_score);
    onScoreUpdate(score);
    return score;
  };

  // 拖拽开始
  const handleDragStart = (e, item) => {
    if (isTimeUp || completedItems.has(item.id)) {
      e.preventDefault();
      return;
    }
    
    console.log('🚀 Drag start:', item.id, 'type:', typeof item.id); // 调试日志
    
    e.dataTransfer.effectAllowed = 'move';
    
    // 🔥 确保传输的是字符串，但也保存原始值
    const itemIdString = String(item.id);
    e.dataTransfer.setData('text/plain', itemIdString);
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    
    console.log('📤 Setting data:', itemIdString);
    
    draggedElementRef.current = item;
    setIsDragging(true);
    
    // 添加拖拽样式
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  // 拖拽结束
  const handleDragEnd = (e) => {
    console.log('Drag end'); // 调试日志
    
    e.target.style.opacity = '1';
    draggedElementRef.current = null;
    setDragOverZone(null);
    setIsDragging(false);
  };

  // 拖拽经过放置区 - 这是关键，必须阻止默认行为才能触发 drop
  const handleDragOver = (e, zoneId) => {
    e.preventDefault(); // 🔥 这个很重要！没有这个 drop 不会触发
    e.stopPropagation();
    
    // 设置拖拽效果
    e.dataTransfer.dropEffect = 'move';
    
    if (dragOverZone !== zoneId) {
      setDragOverZone(zoneId);
      console.log('Drag over zone:', zoneId); // 调试日志
    }
    
    return false; // 额外保险
  };

  // 拖拽进入放置区
  const handleDragEnter = (e, zoneId) => {
    e.preventDefault(); // 🔥 也很重要
    e.stopPropagation();
    setDragOverZone(zoneId);
    return false;
  };

  // 离开放置区
  const handleDragLeave = (e) => {
    // 不要阻止默认行为，这里只需要检查边界
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    // 只有当鼠标真正离开区域时才清除高亮
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverZone(null);
      console.log('Drag leave zone'); // 调试日志
    }
  };

  // 放置到目标区域
  const handleDrop = (e, zoneId) => {
    console.log('🎯 Drop event triggered!', zoneId); // 重要的调试日志
    
    e.preventDefault();
    e.stopPropagation();
    
    setDragOverZone(null);
    setIsDragging(false);
    
    const itemIdString = e.dataTransfer.getData('text/plain');
    
    if (!itemIdString) {
      console.error('❌ No item ID found in drop event');
      console.log('Available data types:', Array.from(e.dataTransfer.types));
      return;
    }
    
    console.log('✅ Item ID found (string):', itemIdString, 'type:', typeof itemIdString);
    
    // 🔥 关键修复：尝试字符串和数字两种匹配方式
    const itemId = itemIdString;
    const itemIdNumber = parseInt(itemIdString, 10);
    
    console.log('🔍 Looking for item with ID:', itemId, 'or', itemIdNumber);
    console.log('📦 Available items:', exercise.content.items.map(i => ({ id: i.id, type: typeof i.id })));
    
    const item = exercise.content.items.find(i => 
      i.id === itemId ||           // 字符串匹配
      i.id === itemIdNumber ||     // 数字匹配
      String(i.id) === itemId      // 强制转换匹配
    );
    
    if (!item) {
      console.error('❌ Item not found with ID:', itemId);
      console.error('Available item IDs:', exercise.content.items.map(i => i.id));
      return;
    }
    
    console.log('✅ Item found:', item);
    if (isTimeUp) {
      console.error('❌ Time is up');
      return;
    }

    console.log('🎲 Dropping item:', item.id, 'to zone:', zoneId);

    // 检查放置区域是否已满
    const currentItemsInZone = Object.entries(draggedItems)
      .filter(([_, currentZoneId]) => currentZoneId === zoneId).length;
    
    const zone = exercise.content.drop_zones.find(z => z.id === zoneId);
    const maxItems = zone?.max_items;
    
    if (maxItems && currentItemsInZone >= maxItems) {
      console.log('❌ Zone is full');
      return;
    }

    // 🔥 使用原始的 item.id 而不是字符串版本
    const actualItemId = item.id;
    const newDraggedItems = { ...draggedItems, [actualItemId]: zoneId };
    setDraggedItems(newDraggedItems);

    // 检查是否正确
    if (zoneId === item.correct_zone) {
      setCompletedItems(prev => new Set([...prev, actualItemId]));
      console.log('🎉 Correct placement!');
    } else {
      setCompletedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(actualItemId);
        return newSet;
      });
      console.log('❌ Incorrect placement');
    }

    // 计算新分数
    const newScore = calculateScore(newDraggedItems);
    console.log('📊 New score:', newScore);
  };

  // 重置项目位置
  const resetItem = (itemId) => {
    console.log('Resetting item:', itemId);
    
    const newDraggedItems = { ...draggedItems };
    delete newDraggedItems[itemId];
    setDraggedItems(newDraggedItems);
    
    setCompletedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
    
    calculateScore(newDraggedItems);
  };

  if (!exercise.content?.items || !exercise.content?.drop_zones) {
    return (
      <div className="p-8 text-center text-red-600">
        <XCircleIcon className="w-12 h-12 mx-auto mb-4" />
        <p>Game configuration error. Please contact your instructor.</p>
      </div>
    );
  }

  const allCompleted = completedItems.size === exercise.content.items.length;

  return (
    <div className="p-8">
      {/* 游戏标题和说明 */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <CursorArrowRaysIcon className="w-6 h-6 text-blue-600" />
          Drag & Drop Challenge
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {exercise.content.instructions || "Drag the code blocks to their correct positions"}
        </p>
      </div>

      {/* 完成提示 */}
      {allCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 text-green-700">
            <SparklesIcon className="w-5 h-5" />
            <span className="font-semibold">Perfect! All items placed correctly!</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：拖拽项目 */}
        <div className="space-y-6">
          <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            📦 Drag these code blocks:
          </h4>
          
          <div className="space-y-3">
            {exercise.content.items.map(item => {
              const isPlaced = draggedItems[item.id];
              const isCorrect = completedItems.has(item.id);
              const isIncorrect = isPlaced && !isCorrect;
              const canDrag = !isTimeUp && !isCorrect;
              
              let itemClass = "p-4 rounded-lg border-2 border-dashed transition-all duration-300 ";
              
              if (isCorrect) {
                itemClass += "bg-green-100 border-green-300 opacity-60";
              } else if (isIncorrect) {
                itemClass += "bg-red-100 border-red-300 cursor-move transform hover:scale-105";
              } else if (isPlaced) {
                itemClass += "bg-gray-100 border-gray-300 opacity-50";
              } else {
                itemClass += "bg-blue-50 border-blue-300 cursor-move hover:bg-blue-100 hover:border-blue-400 transform hover:scale-105";
              }
              
              if (!canDrag) {
                itemClass += " cursor-not-allowed";
              }
              
              return (
                <div key={item.id} className="relative">
                  <div
                    draggable={canDrag}
                    onDragStart={(e) => canDrag ? handleDragStart(e, item) : e.preventDefault()}
                    onDragEnd={handleDragEnd}
                    className={itemClass}
                    style={{ 
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <code className="text-sm font-mono text-gray-800 block bg-white bg-opacity-50 p-2 rounded">
                          {item.text}
                        </code>
                        {item.description && (
                          <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      
                      {/* 状态指示器 */}
                      <div className="ml-3 flex-shrink-0">
                        {isCorrect && (
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        )}
                        {isIncorrect && (
                          <XCircleIcon className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>
                    
                    {/* 重置按钮（错误放置时显示） */}
                    {isIncorrect && (
                      <button
                        onClick={() => resetItem(item.id)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-full transition-colors z-10"
                      >
                        ↺
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右侧：放置区域 */}
        <div className="space-y-6">
          <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            🎯 Drop zones:
          </h4>
          
          <div className="space-y-4">
            {exercise.content.drop_zones.map(zone => {
              const placedItems = Object.entries(draggedItems)
                .filter(([_, zoneId]) => zoneId === zone.id)
                .map(([itemId, _]) => exercise.content.items.find(item => item.id === itemId))
                .filter(Boolean);
              
              const isHighlighted = dragOverZone === zone.id;
              const maxItems = zone.max_items || Infinity;
              const isFull = placedItems.length >= maxItems;
              
              let zoneClass = "min-h-[120px] rounded-lg border-2 border-dashed p-4 transition-all duration-300 ";
              
              if (isHighlighted && !isFull) {
                zoneClass += "border-blue-400 bg-blue-50 scale-105 shadow-lg";
              } else if (isFull) {
                zoneClass += "border-gray-300 bg-gray-100 opacity-50";
              } else {
                zoneClass += "border-gray-300 bg-gray-50 hover:bg-gray-100";
              }
              
              return (
                <div
                  key={zone.id}
                  className={zoneClass}
                  style={{ 
                    borderColor: zone.color || '#d1d5db',
                    backgroundColor: isHighlighted && !isFull ? (zone.color + '20') : undefined 
                  }}
                  onDragOver={(e) => {
                    if (!isFull) {
                      handleDragOver(e, zone.id);
                    } else {
                      e.preventDefault(); // 即使满了也要阻止默认行为
                    }
                  }}
                  onDragEnter={(e) => {
                    if (!isFull) {
                      handleDragEnter(e, zone.id);
                    } else {
                      e.preventDefault();
                    }
                  }}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => !isFull && handleDrop(e, zone.id)}
                >
                  {/* 区域标题 */}
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-bold text-gray-800" style={{ color: zone.color }}>
                      {zone.name}
                    </h5>
                    <span className="text-xs text-gray-500">
                      {placedItems.length}/{zone.max_items || '∞'}
                      {isFull && <span className="text-red-500 ml-1">(Full)</span>}
                    </span>
                  </div>
                  
                  {zone.description && (
                    <p className="text-sm text-gray-600 mb-3">{zone.description}</p>
                  )}
                  
                  {/* 已放置的项目 */}
                  {placedItems.length > 0 ? (
                    <div className="space-y-2">
                      {placedItems.map(item => {
                        const isCorrect = item.correct_zone === zone.id;
                        return (
                          <div 
                            key={item.id}
                            className={`p-2 rounded text-sm ${
                              isCorrect 
                                ? 'bg-green-100 text-green-800 border border-green-300' 
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}
                          >
                            <code className="text-xs">{item.text}</code>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-16 text-gray-400 text-sm">
                      {isHighlighted && !isFull 
                        ? 'Release to drop here' 
                        : isFull 
                          ? 'Zone is full'
                          : 'Drop items here'
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 游戏提示 */}
      {!isTimeUp && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm text-center">
            💡 <strong>Tip:</strong> Drag code blocks to the matching zones. 
            Incorrectly placed items can be reset using the ↺ button.
          </p>
        </div>
      )}
      
      {/* 调试信息 (开发时可以显示) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>Is Dragging: {isDragging ? 'Yes' : 'No'}</p>
          <p>Drag Over Zone: {dragOverZone || 'None'}</p>
          <p>Completed Items: {Array.from(completedItems).join(', ') || 'None'}</p>
        </div>
      )}
    </div>
  );
};

export default DragDropGame;