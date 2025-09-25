import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

// 导入拆分后的组件 - 使用相对路径
import GameHeader from './components/GameHeader';
import GameStatusPanel from './components/GameStatusPanel';
import GameContainer from './components/GameContainer';

// 导入游戏组件
import DragDropGame from './components/DragDropGame';
import AdventureGame from './components/AdventureGame';
import MazeGame from './components/MazeGame';
import DefaultGamePlaceholder from './components/DefaultGamePlaceholder';

// 导入 hooks
import { useTimer } from './hooks/useTimer';
import { useScore } from './hooks/useScore';

/**
 * 练习详情页面 - 拆分后的版本
 * 文件位置：resources/js/Pages/Lessons/Exercises/Show.jsx
 */
export default function ExerciseShow({ auth, lesson, exercise }) {
  const [gameStarted, setGameStarted] = useState(false);

  // 使用自定义 hooks
  const timer = useTimer(
    exercise.time_limit, 
    gameStarted,
    () => {
      // 时间到时的处理
      handleGameComplete();
    }
  );

  const score = useScore(
    exercise.max_score,
    (newScore) => {
      // 分数变化时的处理 - 可以发送到后端
      console.log('Score updated:', newScore);
    }
  );

  // 开始游戏
  const handleGameStart = () => {
    setGameStarted(true);
    timer.start();
    score.resetScore();
  };

  // 游戏完成处理
  const handleGameComplete = () => {
    // 提交分数到后端
    router.post(route('exercises.submit', exercise.id), {
      score: score.currentScore,
      time_taken: exercise.time_limit - timer.timeLeft,
      completed: true,
    }, {
      preserveScroll: true,
      onSuccess: (page) => {
        console.log('Score submitted successfully');
      },
      onError: (errors) => {
        console.error('Failed to submit score:', errors);
      }
    });
  };

  // 渲染对应的游戏组件
  const renderGameContent = () => {
    const gameProps = {
      exercise,
      onScoreUpdate: score.updateScore,
      isTimeUp: timer.isTimeUp,
      timeLeft: timer.timeLeft,
    };

    switch (exercise.type) {
      case 'drag_drop':
        return <DragDropGame {...gameProps} />;
      case 'adventure_game':
        return <AdventureGame {...gameProps} />;
      case 'maze_game':
        return <MazeGame {...gameProps} />;
      default:
        return <DefaultGamePlaceholder exercise={exercise} />;
    }
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title={`${exercise.title} - ${lesson.title}`} />
      
      <div className="max-w-6xl mx-auto p-6">
        {/* 游戏头部 */}
        <GameHeader lesson={lesson} exercise={exercise} />

        {/* 主要游戏区域 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex">
            {/* 游戏内容区域 */}
            <div className="flex-1">
              {!gameStarted ? (
                <GameContainer
                  exercise={exercise}
                  onGameStart={handleGameStart}
                />
              ) : (
                <div className="min-h-[600px]">
                  {renderGameContent()}
                </div>
              )}
            </div>

            {/* 状态面板 - 只在游戏开始后显示 */}
            {gameStarted && (
              <div className="w-64 border-l border-gray-200 p-4">
                <GameStatusPanel
                  currentScore={score.currentScore}
                  maxScore={score.maxScore}
                  formattedTime={timer.formattedTime}
                  isTimeUp={timer.isTimeUp}
                  hasTimeLimit={!!exercise.time_limit}
                />
                
                {/* 额外的游戏控制按钮 */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={timer.isRunning ? timer.pause : timer.start}
                    className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    disabled={timer.isTimeUp}
                  >
                    {timer.isRunning ? 'Pause' : 'Resume'}
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to restart?')) {
                        setGameStarted(false);
                        timer.reset(exercise.time_limit);
                        score.resetScore();
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                  >
                    Restart Game
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}