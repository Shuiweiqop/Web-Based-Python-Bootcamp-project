import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Trophy } from 'lucide-react';
import axios from 'axios';
import StudentLayout from '@/Layouts/StudentLayout';

// 导入拆分后的组件
import GameHeader from './components/GameHeader';
import GameStatusPanel from './components/GameStatusPanel';
import GameContainer from './components/GameContainer';

// 导入游戏组件
import DragDropGame from './components/DragDropGame';
import AdventureGame from './components/AdventureGame';
import MazeGame from './components/MazeGame';
import CodingExercise from './components/CodingExercise';
import FillBlankExercise from './components/FillBlankExercise';
import DefaultGamePlaceholder from './components/DefaultGamePlaceholder';

// 导入 hooks
import { useTimer } from './hooks/useTimer';
import { useScore } from './hooks/useScore';

export default function ExerciseShow({ auth, lesson, exercise }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // 🔥 检查 exercise 类型
  const isCodingExercise = exercise.exercise_type === 'coding' || exercise.type === 'coding';
  const isFillBlankExercise = exercise.exercise_type === 'fill_blank' || exercise.type === 'fill_blank';

  const timer = useTimer(
    exercise.time_limit, 
    gameStarted,
    () => {
      // Time's up callback - use current score
      handleGameComplete();
    }
  );

  const score = useScore(
    exercise.max_score,
    (newScore) => {
      console.log('Score updated:', newScore);
    }
  );

  const handleGameStart = () => {
    console.log('🎮 Starting exercise:', exercise.title);
    
    setGameStarted(true);
    setGameCompleted(false);
    timer.start();
    score.resetScore();
  };

  const handleGameComplete = async (providedScore) => {
    if (gameCompleted || isSubmitting) return;

    setIsSubmitting(true);
    const timeTaken = exercise.time_limit_sec 
      ? exercise.time_limit_sec - timer.timeLeft 
      : timer.timeLeft;
    
    // 🔥 Use provided score if available, otherwise use hook's score
    const achievedScore = providedScore !== undefined ? providedScore : score.currentScore;
    
    console.log('🏆 Completing with score:', achievedScore, '(provided:', providedScore, ', current:', score.currentScore, ')');

    setFinalScore(achievedScore);
    setGameCompleted(true);
    timer.pause();

    const lessonId = lesson.lesson_id;
    const exerciseId = exercise.exercise_id || exercise.id;

    try {
      const { data } = await axios.post(
        route('lessons.exercises.api.submit', { lesson: lessonId, exercise: exerciseId }),
        {
          answer: {
            completed: true,
            score: achievedScore,  // 🔥 确保分数在 answer 里
          },
          score: achievedScore,  // 🔥 也在顶层传递
          time_spent: timeTaken,
        }
      );

      console.log('✅ Submission successful:', data);
      setSubmissionResult(data);

      // 🎉 课程完成提示
      if (data.lesson_progress?.lesson_completed) {
        setTimeout(() => {
          alert(`🎉 Congratulations! You've completed the lesson and earned ${data.lesson_progress.points_amount} points!`);
        }, 500);
      }
    } catch (error) {
      console.error('❌ Submission failed:', error);
      alert('Failed to submit your answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnToLesson = () => {
    sessionStorage.setItem('refresh_lesson_progress', 'true');
    router.visit(`/lessons/${lesson.lesson_id}`);
  };

  const renderGameContent = () => {
    const gameProps = {
      exercise,
      lesson,
      onScoreUpdate: score.updateScore,
      onComplete: handleGameComplete,
      isTimeUp: timer.isTimeUp,
      timeLeft: timer.timeLeft,
    };

    // 🔥 Fill-in-the-Blank 直接渲染，不需要 gameStarted
    if (isFillBlankExercise) {
      return <FillBlankExercise {...gameProps} />;
    }

    // 🔥 Coding Exercise 独立渲染
    if (isCodingExercise) {
      return (
        <CodingExercise 
          exercise={exercise} 
          lessonId={lesson.lesson_id}
          auth={auth}
        />
      );
    }

    // 传统游戏类型
    switch (exercise.exercise_type || exercise.type) {
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

  // 游戏完成结果展示
  const renderCompletionScreen = () => {
    const scorePercentage = (finalScore / exercise.max_score) * 100;
    const isPerfect = scorePercentage === 100;
    const isGood = scorePercentage >= 70;

    const lessonCompleted = submissionResult?.lesson_progress?.lesson_completed;
    const pointsAwarded = submissionResult?.lesson_progress?.points_amount;

    return (
      <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            {isPerfect ? (
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
                <Trophy className="w-12 h-12 text-white" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isPerfect ? '🎉 Perfect Score!' : isGood ? '✨ Great Job!' : '💪 Keep Trying!'}
          </h2>
          <p className="text-gray-600 mb-8">
            {isPerfect 
              ? 'You mastered this exercise!' 
              : isGood 
              ? 'You did really well!'
              : 'Practice makes perfect!'}
          </p>

          {/* Score Display */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 mb-8">
            <div className="text-sm text-gray-600 mb-2">Your Score</div>
            <div className="text-5xl font-bold text-indigo-600 mb-2">
              {finalScore}
            </div>
            <div className="text-gray-600">out of {exercise.max_score} points</div>
            
            {/* Progress Bar */}
            <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${
                  isPerfect ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                  isGood ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                  'bg-gradient-to-r from-blue-400 to-indigo-500'
                }`}
                style={{ width: `${scorePercentage}%` }}
              />
            </div>
            <div className="text-sm text-gray-600 mt-2">{scorePercentage.toFixed(0)}%</div>
          </div>

          {/* 课程完成提示 */}
          {lessonCompleted && (
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl">
              <div className="text-lg font-bold text-yellow-800 mb-1">
                🎊 Lesson Completed!
              </div>
              <div className="text-yellow-700">
                You earned <span className="font-bold">{pointsAwarded}</span> bonus points!
              </div>
            </div>
          )}

          {/* 进度信息 */}
          {submissionResult?.lesson_progress && !lessonCompleted && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <div className="text-blue-800">
                Exercises: {submissionResult.lesson_progress.exercises_completed}/{lesson.required_exercises || '?'} • 
                Tests: {submissionResult.lesson_progress.tests_passed}/{lesson.required_tests || '?'}
              </div>
            </div>
          )}

          {/* Time Taken */}
          {timer.formattedTime && (
            <div className="text-sm text-gray-600 mb-6">
              Time: {timer.formattedTime}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleReturnToLesson}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Return to Lesson
            </button>

            <button
              onClick={() => {
                setGameStarted(false);
                setGameCompleted(false);
                setSubmissionResult(null);
                score.resetScore();
                timer.reset(exercise.time_limit);
              }}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 🔥 Coding Exercise 使用独立布局（全屏）
  if (isCodingExercise) {
    return (
      <>
        <Head title={`${exercise.title} - ${lesson.title}`} />
        {renderGameContent()}
      </>
    );
  }

  // 🔥 Fill-in-the-Blank 使用 StudentLayout，直接显示不需要 Start 按钮
  if (isFillBlankExercise) {
    return (
      <StudentLayout user={auth.user}>
        <Head title={`${exercise.title} - ${lesson.title}`} />
        {gameCompleted ? renderCompletionScreen() : renderGameContent()}
      </StudentLayout>
    );
  }

  // 🎮 传统游戏类型的布局（带侧边栏和 Start 按钮）
  return (
    <StudentLayout user={auth.user}>
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
              ) : gameCompleted ? (
                renderCompletionScreen()
              ) : (
                <div className="min-h-[600px]">
                  {renderGameContent()}
                </div>
              )}
            </div>

            {/* 状态面板 - 只在游戏进行中显示 */}
            {gameStarted && !gameCompleted && (
              <div className="w-64 border-l border-gray-200 p-4">
                <GameStatusPanel
                  currentScore={score.currentScore}
                  maxScore={score.maxScore}
                  formattedTime={timer.formattedTime}
                  isTimeUp={timer.isTimeUp}
                  hasTimeLimit={!!exercise.time_limit}
                />
                
                {/* 游戏控制按钮 */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={timer.isRunning ? timer.pause : timer.start}
                    className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    disabled={timer.isTimeUp}
                  >
                    {timer.isRunning ? 'Pause' : 'Resume'}
                  </button>
                  
                  <button
                    onClick={handleGameComplete}
                    className="w-full px-3 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Finish & Submit'}
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to restart?')) {
                        setGameStarted(false);
                        setGameCompleted(false);
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
    </StudentLayout>
  );
}