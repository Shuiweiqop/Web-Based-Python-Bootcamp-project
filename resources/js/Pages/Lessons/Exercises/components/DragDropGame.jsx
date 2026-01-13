import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  CursorArrowRaysIcon,
  SparklesIcon,
  ExclamationTriangleIcon
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

  // 🔥 调试：打印 exercise 数据结构
  useEffect(() => {
    console.log('📦 Exercise data:', exercise);
    console.log('📦 Exercise content:', exercise.content);
    console.log('📦 Exercise content type:', typeof exercise.content);
    
    // 如果 content 是字符串，尝试解析
    if (typeof exercise.content === 'string') {
      try {
        const parsed = JSON.parse(exercise.content);
        console.log('✅ Parsed content:', parsed);
      } catch (e) {
        console.error('❌ Failed to parse content:', e);
      }
    }
  }, [exercise]);

  // 🔥 安全地获取 content，支持字符串 JSON
  const getExerciseContent = () => {
    if (!exercise.content) return null;
    
    // 如果已经是对象，直接返回
    if (typeof exercise.content === 'object') {
      return exercise.content;
    }
    
    // 如果是字符串，尝试解析
    if (typeof exercise.content === 'string') {
      try {
        return JSON.parse(exercise.content);
      } catch (e) {
        console.error('Failed to parse exercise.content:', e);
        return null;
      }
    }
    
    return null;
  };

  const content = getExerciseContent();

  // 计算分数
  const calculateScore = (newDraggedItems = draggedItems) => {
    if (!content?.items) return 0;
    
    let correctCount = 0;
    content.items.forEach(item => {
      if (newDraggedItems[item.id] === item.correct_zone) {
        correctCount++;
      }
    });
    
    const score = Math.floor((correctCount / content.items.length) * exercise.max_score);
    onScoreUpdate(score);
    return score;
  };

  // 拖拽开始
  const handleDragStart = (e, item) => {
    if (isTimeUp || completedItems.has(item.id)) {
      e.preventDefault();
      return;
    }
    
    console.log('🚀 Drag start:', item.id, 'type:', typeof item.id);
    
    e.dataTransfer.effectAllowed = 'move';
    
    const itemIdString = String(item.id);
    e.dataTransfer.setData('text/plain', itemIdString);
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    
    console.log('📤 Setting data:', itemIdString);
    
    draggedElementRef.current = item;
    setIsDragging(true);
    
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  // 拖拽结束
  const handleDragEnd = (e) => {
    console.log('Drag end');
    
    e.target.style.opacity = '1';
    draggedElementRef.current = null;
    setDragOverZone(null);
    setIsDragging(false);
  };

  // 拖拽经过放置区
  const handleDragOver = (e, zoneId) => {
    e.preventDefault();
    e.stopPropagation();
    
    e.dataTransfer.dropEffect = 'move';
    
    if (dragOverZone !== zoneId) {
      setDragOverZone(zoneId);
      console.log('Drag over zone:', zoneId);
    }
    
    return false;
  };

  // 拖拽进入放置区
  const handleDragEnter = (e, zoneId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverZone(zoneId);
    return false;
  };

  // 离开放置区
  const handleDragLeave = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverZone(null);
      console.log('Drag leave zone');
    }
  };

  // 放置到目标区域
  const handleDrop = (e, zoneId) => {
    console.log('🎯 Drop event triggered!', zoneId);
    
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
    
    const itemId = itemIdString;
    const itemIdNumber = parseInt(itemIdString, 10);
    
    console.log('🔍 Looking for item with ID:', itemId, 'or', itemIdNumber);
    console.log('📦 Available items:', content.items.map(i => ({ id: i.id, type: typeof i.id })));
    
    const item = content.items.find(i => 
      i.id === itemId ||
      i.id === itemIdNumber ||
      String(i.id) === itemId
    );
    
    if (!item) {
      console.error('❌ Item not found with ID:', itemId);
      console.error('Available item IDs:', content.items.map(i => i.id));
      return;
    }
    
    console.log('✅ Item found:', item);
    if (isTimeUp) {
      console.error('❌ Time is up');
      return;
    }

    console.log('🎲 Dropping item:', item.id, 'to zone:', zoneId);

    const currentItemsInZone = Object.entries(draggedItems)
      .filter(([_, currentZoneId]) => currentZoneId === zoneId).length;
    
    const zone = content.drop_zones.find(z => z.id === zoneId);
    const maxItems = zone?.max_items;
    
    if (maxItems && currentItemsInZone >= maxItems) {
      console.log('❌ Zone is full');
      return;
    }

    const actualItemId = item.id;
    const newDraggedItems = { ...draggedItems, [actualItemId]: zoneId };
    setDraggedItems(newDraggedItems);

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

  // 🔥 增强的错误检查和提示
  if (!content) {
    return (
      <div className="p-8 text-center">
        <XCircleIcon className="w-12 h-12 mx-auto mb-4 text-red-600" />
        <p className="text-red-600 font-semibold mb-2">Configuration Error</p>
        <p className="text-gray-600 text-sm mb-4">
          The exercise content is missing or invalid.
        </p>
        <details className="text-left bg-gray-100 p-4 rounded-lg text-xs">
          <summary className="cursor-pointer font-medium mb-2">Debug Information</summary>
          <pre className="overflow-auto">
            {JSON.stringify({
              hasExercise: !!exercise,
              hasContent: !!exercise.content,
              contentType: typeof exercise.content,
              exerciseKeys: exercise ? Object.keys(exercise) : []
            }, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  if (!content.items || !Array.isArray(content.items) || content.items.length === 0) {
    return (
      <div className="p-8 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
        <p className="text-yellow-600 font-semibold mb-2">No Items Configured</p>
        <p className="text-gray-600 text-sm mb-4">
          This exercise doesn't have any draggable items yet.
        </p>
        <details className="text-left bg-gray-100 p-4 rounded-lg text-xs">
          <summary className="cursor-pointer font-medium mb-2">Debug Information</summary>
          <pre className="overflow-auto">
            {JSON.stringify({
              hasItems: !!content.items,
              isArray: Array.isArray(content.items),
              itemsLength: content.items?.length || 0,
              contentKeys: Object.keys(content)
            }, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  if (!content.drop_zones || !Array.isArray(content.drop_zones) || content.drop_zones.length === 0) {
    return (
      <div className="p-8 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
        <p className="text-yellow-600 font-semibold mb-2">No Drop Zones Configured</p>
        <p className="text-gray-600 text-sm mb-4">
          This exercise doesn't have any drop zones yet.
        </p>
        <details className="text-left bg-gray-100 p-4 rounded-lg text-xs">
          <summary className="cursor-pointer font-medium mb-2">Debug Information</summary>
          <pre className="overflow-auto">
            {JSON.stringify({
              hasDropZones: !!content.drop_zones,
              isArray: Array.isArray(content.drop_zones),
              zonesLength: content.drop_zones?.length || 0,
              contentKeys: Object.keys(content)
            }, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  const allCompleted = completedItems.size === content.items.length;

  return (
    <div className="p-8">
      {/* 游戏标题和说明 */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <CursorArrowRaysIcon className="w-6 h-6 text-blue-600" />
          Drag & Drop Challenge
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {content.instructions || "Drag the code blocks to their correct positions"}
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
            {content.items.map(item => {
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
                      
                      <div className="ml-3 flex-shrink-0">
                        {isCorrect && (
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        )}
                        {isIncorrect && (
                          <XCircleIcon className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>
                    
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
            {content.drop_zones.map(zone => {
              const placedItems = Object.entries(draggedItems)
                .filter(([_, zoneId]) => zoneId === zone.id)
                .map(([itemId, _]) => content.items.find(item => item.id == itemId))
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
                      e.preventDefault();
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

      {!isTimeUp && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm text-center">
            💡 <strong>Tip:</strong> Drag code blocks to the matching zones. 
            Incorrectly placed items can be reset using the ↺ button.
          </p>
        </div>
      )}
    </div>
  );
};

export default DragDropGame;