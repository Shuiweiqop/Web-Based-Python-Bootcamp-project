import React from 'react';
import { 
  PlayIcon, 
  InformationCircleIcon, 
  ClockIcon, 
  TrophyIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

/**
 * 游戏容器组件 - 显示游戏开始前的说明和开始按钮
 * 文件位置：resources/js/Components/Games/GameContainer.jsx
 */
const GameContainer = ({ 
  exercise, 
  onGameStart,
  isLoading = false 
}) => {
  // 根据游戏类型获取图标
  const exerciseType = exercise.exercise_type || exercise.type;
  const timeLimit = Number(exercise.time_limit_sec || exercise.time_limit || 0);

  const getGameIcon = (type) => {
    switch (type) {
      case 'drag_drop':
        return '🎯';
      case 'adventure_game':
        return '🗺️';
      case 'maze_game':
        return '🧩';
      case 'puzzle_game':
        return '🔧';
      case 'collection_game':
        return '🍎';
      case 'memory_match':
        return 'MM';
      default:
        return '🎮';
    }
  };

  // 根据游戏类型获取描述
  const getGameTypeDescription = (type) => {
    const descriptions = {
      drag_drop: 'Drag and drop code blocks to the correct positions',
      adventure_game: 'Make coding decisions in an interactive story',
      maze_game: 'Navigate through challenges using programming logic',
      puzzle_game: 'Arrange code pieces to solve problems',
      collection_game: 'Collect items while learning data structures',
      memory_match: 'Flip cards and match Python concepts with their partners',
    };
    return descriptions[type] || 'Interactive coding challenge';
  };

  return (
    <div className="p-8 text-center bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),linear-gradient(135deg,#f8fafc,#eef2ff_48%,#ecfeff)] sm:p-12">
      <div className="max-w-md mx-auto">
        {/* 游戏图标和标题 */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-100 border border-white">
            <span className="text-3xl font-black text-indigo-700">{getGameIcon(exerciseType)}</span>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Ready to Play?
          </h3>
          
          <p className="text-gray-600 text-lg mb-2">
            {getGameTypeDescription(exerciseType)}
          </p>
          
          <p className="text-gray-500">
            Click the button below to start your coding adventure!
          </p>
        </div>

        {/* 游戏统计信息 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-center gap-2 text-yellow-600 mb-2">
              <TrophyIcon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {exercise.max_score}
            </div>
            <div className="text-sm text-gray-600">Max Points</div>
          </div>
          
          {timeLimit > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                <ClockIcon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.max(1, Math.ceil(timeLimit / 60))}m
              </div>
              <div className="text-sm text-gray-600">Time Limit</div>
            </div>
          )}
        </div>

        {/* 游戏说明 */}
        {exercise.content?.instructions && (
          <div className="bg-blue-50 rounded-lg p-4 mb-8 text-left border border-blue-100">
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <CodeBracketIcon className="w-4 h-4" />
                  Instructions:
                </h4>
                <p className="text-blue-800 text-sm leading-relaxed">
                  {exercise.content.instructions}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 学习目标（如果有的话） */}
        {exercise.content?.learning_objectives && (
          <div className="bg-green-50 rounded-lg p-4 mb-8 text-left border border-green-100">
            <h4 className="font-semibold text-green-900 mb-2">
              What you'll learn:
            </h4>
            <ul className="text-green-800 text-sm space-y-1">
              {exercise.content.learning_objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  {objective}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 开始按钮 */}
        <button
          onClick={onGameStart}
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-3 mx-auto shadow-lg"
        >
          {isLoading ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Loading Game...
            </>
          ) : (
            <>
              <PlayIcon className="w-6 h-6" />
              Start Game
            </>
          )}
        </button>

        {/* 小提示 */}
        <p className="text-xs text-gray-400 mt-4">
          💡 Tip: Make sure you have a stable internet connection
        </p>
      </div>
    </div>
  );
};

export default GameContainer;
