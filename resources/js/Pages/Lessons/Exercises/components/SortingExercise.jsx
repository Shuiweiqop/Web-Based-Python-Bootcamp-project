import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, CheckCircle, GripVertical, RotateCcw, Shuffle, XCircle } from 'lucide-react';

const shuffleItems = (items) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

export default function SortingExercise({ exercise, onScoreUpdate, onComplete, isTimeUp = false }) {
  const content = exercise.content || {};
  const sourceItems = useMemo(
    () => [...(content.items || [])].sort((a, b) => Number(a.correctOrder) - Number(b.correctOrder)),
    [content.items]
  );
  const initialItems = useMemo(() => shuffleItems(sourceItems), [sourceItems]);

  const [items, setItems] = useState(initialItems);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const moveItem = (index, direction) => {
    if (isSubmitted || isTimeUp) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const nextItems = [...items];
    [nextItems[index], nextItems[targetIndex]] = [nextItems[targetIndex], nextItems[index]];
    setItems(nextItems);
  };

  const moveItemToIndex = (fromIndex, toIndex) => {
    if (isSubmitted || isTimeUp || fromIndex === toIndex) return;

    const nextItems = [...items];
    const [movedItem] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, movedItem);
    setItems(nextItems);
  };

  const calculateScore = (orderedItems = items) => {
    if (!sourceItems.length) return 0;

    const correctCount = orderedItems.filter((item, index) => {
      return String(item.id) === String(sourceItems[index]?.id);
    }).length;

    return Math.round((correctCount / sourceItems.length) * (exercise.max_score || 100));
  };

  const handleSubmit = () => {
    if (isSubmitted) return;

    const finalScore = calculateScore();
    setScore(finalScore);
    setIsSubmitted(true);
    onScoreUpdate?.(finalScore);

    setTimeout(() => {
      onComplete?.(finalScore);
    }, 1200);
  };

  const resetOrder = () => {
    if (isSubmitted || isTimeUp) return;
    setItems(shuffleItems(sourceItems));
  };

  useEffect(() => {
    if (isTimeUp && !isSubmitted) {
      handleSubmit();
    }
  }, [isTimeUp, isSubmitted]);

  if (!sourceItems.length) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-600">No sorting items configured.</div>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full mb-3">
                <Shuffle className="w-4 h-4" />
                Sorting Challenge
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{exercise.title || 'Arrange the Sequence'}</h2>
              <p className="text-gray-600 mt-2">
                {content.instruction || 'Arrange the items in the correct order.'}
              </p>
            </div>

            {isSubmitted && (
              <div className="text-right">
                <div className="text-sm text-gray-500">Score</div>
                <div className="text-3xl font-bold text-indigo-600">
                  {score}/{exercise.max_score || 100}
                </div>
              </div>
            )}
          </div>

          {!isSubmitted && (
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-indigo-50 border border-indigo-100 p-4">
              <p className="text-sm text-indigo-800">
                Drag rows to reorder, or use the arrow buttons. Submit when the sequence reads correctly from top to bottom.
              </p>
              <button
                type="button"
                onClick={resetOrder}
                disabled={isTimeUp}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white text-indigo-700 font-semibold border border-indigo-200 hover:bg-indigo-100 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                Reshuffle
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const isCorrect = isSubmitted && String(item.id) === String(sourceItems[index]?.id);
            const isWrong = isSubmitted && !isCorrect;

            return (
              <div
                key={item.id}
                draggable={!isSubmitted && !isTimeUp}
                onDragStart={() => setDraggedIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedIndex !== null) {
                    moveItemToIndex(draggedIndex, index);
                  }
                  setDraggedIndex(null);
                }}
                onDragEnd={() => setDraggedIndex(null)}
                className={`flex items-center gap-4 rounded-xl border-2 bg-white p-4 shadow-sm transition ${
                  isCorrect
                    ? 'border-green-300 bg-green-50'
                    : isWrong
                      ? 'border-red-300 bg-red-50'
                      : draggedIndex === index
                        ? 'border-indigo-400 bg-indigo-50 opacity-70'
                        : 'border-indigo-100 hover:border-indigo-300'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold">
                  {index + 1}
                </div>

                <GripVertical className="w-5 h-5 text-gray-400" />

                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{item.text || 'Untitled item'}</div>
                  {isWrong && (
                    <div className="text-xs text-red-600 mt-1">
                      Correct position: {sourceItems.findIndex((sourceItem) => String(sourceItem.id) === String(item.id)) + 1}
                    </div>
                  )}
                  {isSubmitted && isCorrect && (
                    <div className="text-xs text-green-600 mt-1">Correct position</div>
                  )}
                </div>

                {isSubmitted ? (
                  isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0 || isTimeUp}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-indigo-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === items.length - 1 || isTimeUp}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-indigo-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!isSubmitted && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isTimeUp}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
