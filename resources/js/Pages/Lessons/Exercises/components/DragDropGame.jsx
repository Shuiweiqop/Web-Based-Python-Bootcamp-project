import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  CursorArrowRaysIcon,
  ExclamationTriangleIcon,
  HandRaisedIcon,
  SparklesIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const parseContent = (content) => {
  if (!content) return null;
  if (typeof content === 'object') return content;

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse drag/drop exercise content:', error);
    return null;
  }
};

export default function DragDropGame({
  exercise,
  onScoreUpdate,
  onComplete,
  isTimeUp = false,
}) {
  const content = parseContent(exercise.content);
  const [draggedItems, setDraggedItems] = useState({});
  const [dragOverZone, setDragOverZone] = useState(null);
  const [completedItems, setCompletedItems] = useState(new Set());
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [placementFeedback, setPlacementFeedback] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const submittedRef = useRef(false);

  const calculateScore = (newDraggedItems = draggedItems) => {
    if (!content?.items?.length) return 0;

    const correctCount = content.items.filter((item) => newDraggedItems[item.id] === item.correct_zone).length;
    return Math.round((correctCount / content.items.length) * (exercise.max_score || 100));
  };

  const updatePlacementScore = (newDraggedItems) => {
    onScoreUpdate?.(calculateScore(newDraggedItems));
  };

  const placeItemInZone = (itemId, zoneId) => {
    if (isSubmitted || isTimeUp || !content?.items) return;

    const item = content.items.find((candidate) => String(candidate.id) === String(itemId));
    const zone = content.drop_zones.find((candidate) => String(candidate.id) === String(zoneId));
    if (!item || !zone) return;

    const currentItemsInZone = Object.entries(draggedItems).filter(([, currentZoneId]) => currentZoneId === zoneId).length;
    const isMovingWithinSameZone = draggedItems[item.id] === zoneId;

    if (zone.max_items && currentItemsInZone >= zone.max_items && !isMovingWithinSameZone) {
      setFeedback({ type: 'warning', text: `${zone.name || 'This zone'} is full. Try another zone or reset an item first.` });
      return;
    }

    const newDraggedItems = { ...draggedItems, [item.id]: zoneId };
    const feedbackType = zoneId === item.correct_zone ? 'success' : 'error';
    setDraggedItems(newDraggedItems);
    setSelectedItemId(null);
    setPlacementFeedback({
      type: feedbackType,
      itemId: item.id,
      zoneId,
      key: `${item.id}-${zoneId}-${Date.now()}`,
    });

    if (feedbackType === 'success') {
      setCompletedItems((previous) => new Set([...previous, item.id]));
      setFeedback({ type: 'success', text: `Correct: "${item.text}" belongs in ${zone.name || 'this zone'}.` });
    } else {
      const correctZone = content.drop_zones.find((candidate) => candidate.id === item.correct_zone);
      setCompletedItems((previous) => {
        const next = new Set(previous);
        next.delete(item.id);
        return next;
      });
      setFeedback({ type: 'error', text: `Not quite. "${item.text}" fits better in ${correctZone?.name || 'another zone'}.` });
    }

    updatePlacementScore(newDraggedItems);
  };

  const handleSubmit = () => {
    if (submittedRef.current) return;

    submittedRef.current = true;
    const finalScore = calculateScore();
    const correctCount = content.items.filter((item) => draggedItems[item.id] === item.correct_zone).length;
    const totalItems = content.items.length;
    setIsSubmitted(true);
    onScoreUpdate?.(finalScore);

    setTimeout(() => {
      onComplete?.(finalScore, {
        correctCount,
        totalItems,
        accuracy: totalItems > 0 ? Math.round((correctCount / totalItems) * 100) : 0,
        isPerfect: correctCount === totalItems,
      });
    }, 1200);
  };

  useEffect(() => {
    if (isTimeUp && !submittedRef.current) {
      handleSubmit();
    }
  }, [isTimeUp]);

  useEffect(() => {
    if (!placementFeedback) return undefined;

    const timeoutId = window.setTimeout(() => {
      setPlacementFeedback(null);
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [placementFeedback]);

  const handleDragStart = (event, item) => {
    if (isTimeUp || completedItems.has(item.id) || isSubmitted) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(item.id));
    setSelectedItemId(null);
    setTimeout(() => {
      event.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (event) => {
    event.target.style.opacity = '1';
    setDragOverZone(null);
  };

  const handleDrop = (event, zoneId) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOverZone(null);

    const itemId = event.dataTransfer.getData('text/plain');
    if (itemId) {
      placeItemInZone(itemId, zoneId);
    }
  };

  const resetItem = (itemId) => {
    if (isSubmitted) return;

    const newDraggedItems = { ...draggedItems };
    delete newDraggedItems[itemId];
    setDraggedItems(newDraggedItems);
    setSelectedItemId(null);
    setCompletedItems((previous) => {
      const next = new Set(previous);
      next.delete(itemId);
      return next;
    });
    setFeedback({ type: 'info', text: 'Item returned to the tray. Try another zone.' });
    updatePlacementScore(newDraggedItems);
  };

  if (!content) {
    return (
      <div className="p-8 text-center">
        <XCircleIcon className="w-12 h-12 mx-auto mb-4 text-red-600" />
        <p className="text-red-600 font-semibold">Configuration Error</p>
        <p className="text-gray-600 text-sm">The exercise content is missing or invalid.</p>
      </div>
    );
  }

  if (!content.items?.length || !content.drop_zones?.length) {
    return (
      <div className="p-8 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
        <p className="text-yellow-700 font-semibold">Drag/drop setup is incomplete.</p>
        <p className="text-gray-600 text-sm">Add at least one item and one drop zone.</p>
      </div>
    );
  }

  const allCompleted = completedItems.size === content.items.length;
  const placedCount = Object.keys(draggedItems).length;
  const canSubmit = placedCount > 0 && !isSubmitted;
  const liveScore = calculateScore();

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <CursorArrowRaysIcon className="w-6 h-6 text-blue-600" />
          Drag & Drop Challenge
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {content.instructions || 'Move each code block into the zone where it belongs.'}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">Placed</div>
          <div className="text-2xl font-bold text-blue-900">{placedCount}/{content.items.length}</div>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-green-700">Correct</div>
          <div className="text-2xl font-bold text-green-900">{completedItems.size}/{content.items.length}</div>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Live Score</div>
          <div className="text-2xl font-bold text-amber-900">{liveScore}/{exercise.max_score || 100}</div>
        </div>
      </div>

      {feedback && !isSubmitted && (
        <div className={`mb-6 rounded-lg border p-4 text-sm font-semibold ${
          feedback.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : feedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : feedback.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {feedback.text}
        </div>
      )}

      {allCompleted && !isSubmitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 text-green-700">
            <SparklesIcon className="w-5 h-5" />
            <span className="font-semibold">Perfect. Every item is in the right zone.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <HandRaisedIcon className="h-5 w-5 text-blue-600" />
            Pick or drag these blocks
          </h4>

          <div className="space-y-3">
            {content.items.map((item) => {
              const isPlaced = draggedItems[item.id];
              const isCorrect = completedItems.has(item.id);
              const isIncorrect = isPlaced && !isCorrect;
              const isSelected = selectedItemId === item.id;
              const canMove = !isTimeUp && !isCorrect && !isSubmitted;
              const itemFeedback = placementFeedback?.itemId === item.id ? placementFeedback.type : null;

              let itemClass = 'p-4 rounded-lg border-2 border-dashed transition-all duration-300 ';
              if (isCorrect) {
                itemClass += 'bg-green-100 border-green-300 opacity-70';
              } else if (isIncorrect) {
                itemClass += 'bg-red-100 border-red-300 cursor-move hover:scale-[1.02]';
              } else if (isSelected) {
                itemClass += 'bg-blue-100 border-blue-500 ring-4 ring-blue-100 cursor-pointer';
              } else if (isPlaced) {
                itemClass += 'bg-gray-100 border-gray-300 opacity-70';
              } else {
                itemClass += 'bg-blue-50 border-blue-300 cursor-move hover:bg-blue-100 hover:border-blue-400 hover:scale-[1.02]';
              }

              if (!canMove) itemClass += ' cursor-not-allowed';
              if (itemFeedback === 'success') {
                itemClass += ' animate-[dragDropSuccess_700ms_ease-out] ring-4 ring-emerald-200 shadow-[0_0_28px_rgba(16,185,129,0.35)]';
              } else if (itemFeedback === 'error') {
                itemClass += ' animate-[dragDropShake_520ms_ease-in-out] ring-4 ring-red-200 shadow-[0_0_22px_rgba(239,68,68,0.22)]';
              }

              return (
                <div key={item.id} className="relative">
                  <div
                    draggable={canMove}
                    onDragStart={(event) => handleDragStart(event, item)}
                    onDragEnd={handleDragEnd}
                    onClick={() => canMove && setSelectedItemId(isSelected ? null : item.id)}
                    className={itemClass}
                    style={{ userSelect: 'none' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <code className="text-sm font-mono text-gray-800 block bg-white/60 p-2 rounded">
                          {item.text}
                        </code>
                        {item.description && (
                          <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                        )}
                        {isSelected && (
                          <p className="text-xs text-blue-700 mt-2 font-semibold">
                            Now click a drop zone on the right.
                          </p>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        {isCorrect && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                        {isIncorrect && <XCircleIcon className="w-5 h-5 text-red-600" />}
                      </div>
                    </div>

                    {isIncorrect && !isSubmitted && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          resetItem(item.id);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors z-10"
                        aria-label="Reset item"
                      >
                        <ArrowPathIcon className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <CursorArrowRaysIcon className="h-5 w-5 text-emerald-600" />
            Drop zones
          </h4>

          <div className="space-y-4">
            {content.drop_zones.map((zone) => {
              const placedItems = Object.entries(draggedItems)
                .filter(([, zoneId]) => zoneId === zone.id)
                .map(([itemId]) => content.items.find((item) => String(item.id) === String(itemId)))
                .filter(Boolean);
              const isHighlighted = dragOverZone === zone.id;
              const maxItems = zone.max_items || Infinity;
              const isFull = placedItems.length >= maxItems;
              const zoneFeedback = placementFeedback?.zoneId === zone.id ? placementFeedback.type : null;

              let zoneClass = 'min-h-[120px] rounded-lg border-2 border-dashed p-4 transition-all duration-300 ';
              if (isHighlighted && !isFull && !isSubmitted) {
                zoneClass += 'border-blue-400 bg-blue-50 scale-[1.01] shadow-lg';
              } else if (isFull || isSubmitted) {
                zoneClass += 'border-gray-300 bg-gray-100';
              } else if (selectedItemId) {
                zoneClass += 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 cursor-pointer';
              } else {
                zoneClass += 'border-gray-300 bg-gray-50 hover:bg-gray-100';
              }
              if (zoneFeedback === 'success') {
                zoneClass += ' animate-[dropZonePop_620ms_ease-out] ring-4 ring-emerald-200 shadow-[0_0_34px_rgba(16,185,129,0.28)]';
              } else if (zoneFeedback === 'error') {
                zoneClass += ' animate-[dragDropShake_520ms_ease-in-out] ring-4 ring-red-200 shadow-[0_0_24px_rgba(239,68,68,0.2)]';
              }

              return (
                <div
                  key={zone.id}
                  className={zoneClass}
                  style={{
                    borderColor: zone.color || undefined,
                    backgroundColor: isHighlighted && !isFull && zone.color ? `${zone.color}20` : undefined,
                  }}
                  onDragOver={(event) => {
                    if (!isFull && !isSubmitted) {
                      event.preventDefault();
                      setDragOverZone(zone.id);
                    }
                  }}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(event) => !isFull && !isSubmitted && handleDrop(event, zone.id)}
                  onClick={() => !isFull && !isSubmitted && selectedItemId && placeItemInZone(selectedItemId, zone.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-bold text-gray-800" style={{ color: zone.color || undefined }}>
                      {zone.name}
                    </h5>
                    <span className="text-xs text-gray-500">
                      {placedItems.length}/{zone.max_items || 'any'}
                    </span>
                  </div>

                  {zone.description && (
                    <p className="text-sm text-gray-600 mb-3">{zone.description}</p>
                  )}

                  {placedItems.length > 0 ? (
                    <div className="space-y-2">
                      {placedItems.map((item) => {
                        const isCorrect = item.correct_zone === zone.id;
                        const placedItemFeedback = placementFeedback?.itemId === item.id ? placementFeedback.type : null;
                        return (
                          <div
                            key={item.id}
                            className={`p-2 rounded text-sm border ${
                              isCorrect
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : 'bg-red-100 text-red-800 border-red-300'
                            } ${
                              placedItemFeedback === 'success'
                                ? 'animate-[dragDropSuccess_700ms_ease-out] ring-2 ring-emerald-300'
                                : placedItemFeedback === 'error'
                                  ? 'animate-[dragDropShake_520ms_ease-in-out] ring-2 ring-red-300'
                                  : ''
                            }`}
                          >
                            <code className="text-xs">{item.text}</code>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-16 text-gray-400 text-sm">
                      {selectedItemId ? 'Click to place selected item here' : 'Drop items here'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!isSubmitted && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isTimeUp}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
              canSubmit
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isTimeUp ? 'Time Up' : 'Submit Answer'}
          </button>
        </div>
      )}

      {!isTimeUp && !isSubmitted && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm text-center">
            <strong>Tip:</strong> Desktop users can drag. Touch users can tap an item, then tap a zone.
          </p>
        </div>
      )}

      <style>{`
        @keyframes dragDropSuccess {
          0% { transform: scale(1); }
          35% { transform: scale(1.035); }
          68% { transform: scale(0.995); }
          100% { transform: scale(1); }
        }

        @keyframes dropZonePop {
          0% { transform: scale(1); }
          35% { transform: scale(1.025); }
          70% { transform: scale(0.998); }
          100% { transform: scale(1); }
        }

        @keyframes dragDropShake {
          0%, 100% { transform: translateX(0); }
          18% { transform: translateX(-7px); }
          36% { transform: translateX(6px); }
          54% { transform: translateX(-4px); }
          72% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}
