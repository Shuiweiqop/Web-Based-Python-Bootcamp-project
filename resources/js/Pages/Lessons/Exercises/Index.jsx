import React from 'react';
import { Link } from '@inertiajs/react';

export default function Index({ lesson, exercises = [], stats = {} }) {
  const getGameIcon = (exerciseType) => {
    const icons = {
      'drag_drop': '🧩',
      'adventure_game': '🗺️',
      'maze_game': '🎮',
      'puzzle_game': '🔤',
      'collection_game': '🍎'
    };
    return icons[exerciseType] || '🎯';
  };

  const getGameTypeName = (type) => {
    const types = {
      'drag_drop': 'Drag & Drop Challenge',
      'adventure_game': 'Coding Adventure',
      'maze_game': 'Maze Runner', 
      'puzzle_game': 'Code Puzzle',
      'collection_game': 'Fruit Collector'
    };
    return types[type] || 'Coding Game';
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes} mins` : `${seconds} secs`;
  };

  const getExerciseCardClass = (exerciseType) => {
    const colorMap = {
      'drag_drop': 'border-blue-500',
      'adventure_game': 'border-green-500',
      'maze_game': 'border-yellow-500',
      'puzzle_game': 'border-purple-500',
      'collection_game': 'border-red-500'
    };
    return colorMap[exerciseType] || 'border-gray-500';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 顶部导航 */}
      <div className="mb-8">
        <Link
          href={route('lessons.show', lesson.lesson_id)}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          ← Back to Lesson
        </Link>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {lesson.title} - Interactive Exercises
              </h1>
              <p className="text-gray-600 mb-4">
                Complete these coding games to master the concepts!
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total_exercises}</div>
                <div className="text-gray-500">Exercises</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.total_points}</div>
                <div className="text-gray-500">Total Points</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 练习网格 */}
      {exercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {exercises.map((exercise, index) => (
            <div
              key={exercise.exercise_id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {/* 卡片头部 */}
              <div className={`bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white relative ${getExerciseCardClass(exercise.exercise_type)}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">
                    {getGameIcon(exercise.exercise_type)}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium opacity-90">Exercise {index + 1}</div>
                    <div className="text-xs opacity-75">{getGameTypeName(exercise.exercise_type)}</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{exercise.title}</h3>
                <p className="text-sm opacity-90">
                  {exercise.description}
                </p>
              </div>

              {/* 卡片内容 */}
              <div className="p-6">
                {/* 练习元数据 */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-yellow-600">{exercise.max_score} pts</span>
                  </div>
                  {exercise.time_limit_sec && (
                    <div className="flex items-center gap-1">
                      <span>{formatTime(exercise.time_limit_sec)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span>Interactive</span>
                  </div>
                </div>

                {/* 开始游戏按钮 */}
                <Link
                  href={route('lessons.exercises.show', [lesson.lesson_id, exercise.exercise_id])}
                  className="block w-full"
                >
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                    ▶️ Start Game
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 空状态 */
        <div className="text-center py-20">
          <div className="mb-8">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">No Exercises Available</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Exercises for this lesson are being prepared. Check back soon for exciting 
              interactive coding challenges!
            </p>
          </div>
          <Link
            href={route('lessons.show', lesson.lesson_id)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            ← Return to Lesson
          </Link>
        </div>
      )}

      {/* 底部操作 */}
      {exercises.length > 0 && (
        <div className="mt-12 text-center">
          <Link
            href={route('lessons.show', lesson.lesson_id)}
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            ← Back to Lesson Overview
          </Link>
        </div>
      )}
    </div>
  );
}