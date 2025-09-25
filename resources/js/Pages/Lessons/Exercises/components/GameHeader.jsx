import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeftIcon, TrophyIcon, ClockIcon } from '@heroicons/react/24/outline';

/**
 * 游戏头部组件 - 适配 Inertia.js
 * 文件位置：resources/js/Components/Games/GameHeader.jsx
 */
const GameHeader = ({ 
  lesson, 
  exercise, 
  backRoute = null 
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 默认返回路由
  const defaultBackRoute = backRoute || route('lessons.exercises.index', lesson?.lesson_id || lesson?.id);

  return (
    <>
      {/* 顶部导航 */}
      <div className="mb-6">
        <Link
          href={defaultBackRoute}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Exercises
        </Link>
      </div>

      {/* 游戏头部信息 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {exercise.title}
            </h1>
            <p className="text-gray-600 mb-4 max-w-3xl">
              {exercise.description}
            </p>
            
            {/* 游戏元数据 */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <TrophyIcon className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">{exercise.max_score} points</span>
              </div>
              
              {exercise.time_limit && (
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-blue-500" />
                  <span>Time Limit: {formatTime(exercise.time_limit)}</span>
                </div>
              )}

              {/* 游戏类型标签 */}
              <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                {exercise.type?.replace('_', ' ') || 'Interactive'}
              </div>
            </div>
          </div>

          {/* 课程信息小卡片 */}
          <div className="bg-gray-50 rounded-lg p-3 min-w-[180px] ml-6">
            <div className="text-sm text-gray-600 mb-1">From Lesson:</div>
            <div className="font-semibold text-gray-900 truncate">
              {lesson?.title || lesson?.name || 'Unknown Lesson'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameHeader;