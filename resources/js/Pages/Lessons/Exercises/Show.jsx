import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, RotateCcw, Star, Trophy } from 'lucide-react';
import axios from 'axios';
import MissionProgressToast from '@/Components/Student/Missions/MissionProgressToast';
import StudentLayout from '@/Layouts/StudentLayout';

// 导入拆分后的组件
import GameHeader from './components/GameHeader';
import GameStatusPanel from './components/GameStatusPanel';
import GameContainer from './components/GameContainer';

// 导入游戏组件
import DragDropGame from './components/DragDropGame';
import AdventureGame from './components/AdventureGame';
import MazeGame from './components/MazeGame';
import SimulationGame from './components/SimulationGame';
import SortingExercise from './components/SortingExercise';
import CodingExercise from './components/CodingExercise';
import FillBlankExercise from './components/FillBlankExercise';
import MemoryMatchGame from './components/MemoryMatchGame';
import DefaultGamePlaceholder from './components/DefaultGamePlaceholder';

// 导入 hooks
import { useTimer } from './hooks/useTimer';
import { useScore } from './hooks/useScore';

export default function ExerciseShow({ auth, lesson, exercise }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [completionSummary, setCompletionSummary] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [missionProgress, setMissionProgress] = useState(null);
  const [startedAt, setStartedAt] = useState(null);

  // 🔥 检查 exercise 类型
  const isCodingExercise = exercise.exercise_type === 'coding' || exercise.type === 'coding';
  const isFillBlankExercise = exercise.exercise_type === 'fill_blank' || exercise.type === 'fill_blank';

  const configuredTimeLimit = Number(exercise.time_limit_sec || exercise.time_limit || 0);
  const timer = useTimer(configuredTimeLimit, gameStarted);

  const score = useScore(
    exercise.max_score,
    (newScore) => {
      console.log('Score updated:', newScore);
    }
  );

  useEffect(() => {
    if (isFillBlankExercise && !gameStarted) {
      setGameStarted(true);
      setStartedAt(Date.now());
      timer.start();
    }
  }, [isFillBlankExercise, gameStarted]);

  const handleGameStart = () => {
    console.log('🎮 Starting exercise:', exercise.title);
    
    setGameStarted(true);
    setGameCompleted(false);
    setCompletionSummary(null);
    setStartedAt(Date.now());
    timer.start();
    score.resetScore();
  };

  const handleGameComplete = async (providedScore, extraSummary = null) => {
    if (gameCompleted || isSubmitting) return;

    setIsSubmitting(true);
    const timeTaken = configuredTimeLimit > 0
      ? Math.max(0, configuredTimeLimit - timer.timeLeft)
      : startedAt
        ? Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
        : 0;
    
    // 🔥 Use provided score if available, otherwise use hook's score
    const achievedScore = providedScore !== undefined ? providedScore : score.currentScore;
    
    console.log('🏆 Completing with score:', achievedScore, '(provided:', providedScore, ', current:', score.currentScore, ')');

    setFinalScore(achievedScore);
    setCompletionSummary({
      ...(extraSummary || {}),
      timeTaken,
      isTimeUp: timer.isTimeUp,
    });
    setGameCompleted(true);
    timer.pause();

    const lessonId = lesson.lesson_id;
    const exerciseId = exercise.exercise_id || exercise.id;

    try {
      const { data } = await axios.post(
        route('lessons.exercises.api.submit', { lesson: lessonId, exercise: exerciseId }),
        {
          answer: {
            completed: achievedScore >= (Number(exercise.max_score || 0) * 0.7),
            score: achievedScore,  // 🔥 确保分数在 answer 里
          },
          score: achievedScore,  // 🔥 也在顶层传递
          time_spent: timeTaken,
        }
      );

      console.log('✅ Submission successful:', data);
      setSubmissionResult(data);
      setMissionProgress(data.mission_progress ?? null);

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

  const formatElapsedTime = (seconds = 0) => {
    const totalSeconds = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    return minutes > 0
      ? `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
      : `${remainingSeconds}s`;
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
      case 'simulation':
        return <SimulationGame {...gameProps} />;
      case 'sorting':
        return <SortingExercise {...gameProps} />;
      case 'memory_match':
        return <MemoryMatchGame {...gameProps} />;
      default:
        return <DefaultGamePlaceholder exercise={exercise} />;
    }
  };

  // 游戏完成结果展示
  const renderCompletionScreen = () => {
    const maxScore = Number(exercise.max_score) || 0;
    const scorePercentage = maxScore > 0 ? (finalScore / maxScore) * 100 : 0;
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
                timer.reset(configuredTimeLimit);
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
  const renderGameResults = () => {
    const maxScore = Number(exercise.max_score) || 100;
    const scorePercentage = maxScore > 0 ? (finalScore / maxScore) * 100 : 0;
    const isPerfect = scorePercentage >= 100;
    const isGood = scorePercentage >= 70;
    const grade = isPerfect ? 'S' : scorePercentage >= 85 ? 'A' : scorePercentage >= 70 ? 'B' : scorePercentage >= 50 ? 'C' : 'Keep Going';
    const lessonCompleted = submissionResult?.lesson_progress?.lesson_completed;
    const pointsAwarded = submissionResult?.lesson_progress?.points_amount;
    const correctCount = completionSummary?.correctCount ?? null;
    const totalItems = completionSummary?.totalItems ?? null;
    const hasAccuracyBreakdown = Number.isFinite(correctCount) && Number.isFinite(totalItems) && totalItems > 0;
    const timeTaken = completionSummary?.timeTaken ?? 0;
    const runStateLabel = completionSummary?.isTimeUp
      ? 'Time limit reached'
      : isPerfect
        ? 'Perfect clear'
        : isGood
          ? 'Challenge complete'
          : 'Practice run';
    const encouragement = isPerfect
      ? 'Perfect run. Every move landed exactly where it should.'
      : isGood
        ? 'Nice work. You stayed in control and finished strong.'
        : hasAccuracyBreakdown && (correctCount / totalItems) >= 0.5
          ? 'Almost there. One more run should push this over the line.'
          : 'Good first pass. A replay will help lock the pattern in.';

    return (
      <div className="flex min-h-[600px] items-center justify-center bg-[radial-gradient(circle_at_top_left,#fde68a,transparent_26%),radial-gradient(circle_at_bottom_right,#bfdbfe,transparent_24%),linear-gradient(135deg,#f8fafc,#eff6ff_42%,#ecfeff)] p-6">
        <div className="w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/80 bg-white/90 shadow-2xl shadow-sky-100 backdrop-blur">
          <div className="bg-[radial-gradient(circle_at_top,#ffffff30,transparent_40%),linear-gradient(120deg,#0f172a,#1d4ed8_54%,#0f766e)] p-8 text-center text-white">
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15 ring-1 ring-white/20">
              {isPerfect ? <Trophy className="h-12 w-12 text-amber-200" /> : <CheckCircle className="h-12 w-12 text-emerald-200" />}
            </div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-bold ring-1 ring-white/20">
              <Star className="h-4 w-4 text-amber-200" />
              Grade {grade}
            </div>
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-cyan-100">{runStateLabel}</div>
            <h2 className="text-3xl font-black">{isPerfect ? 'Perfect Score!' : isGood ? 'Great Run!' : 'Run Complete'}</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-sky-50 sm:text-base">
              {encouragement}
            </p>
          </div>

          <div className="p-8">
            <div className="mb-6 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
              <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-200">
                <div className="mb-2 text-sm font-semibold text-slate-300">Final Score</div>
                <div className="text-6xl font-black">
                  {finalScore}
                  <span className="text-xl text-slate-400">/{maxScore}</span>
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${isPerfect ? 'bg-gradient-to-r from-amber-300 to-orange-400' : isGood ? 'bg-gradient-to-r from-emerald-300 to-teal-400' : 'bg-gradient-to-r from-sky-300 to-indigo-400'}`}
                    style={{ width: `${Math.min(100, scorePercentage)}%` }}
                  />
                </div>
                <div className="mt-2 text-right text-sm font-semibold text-slate-300">{scorePercentage.toFixed(0)}%</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">Correct</div>
                  <div className="mt-1 text-3xl font-black text-emerald-950">
                    {hasAccuracyBreakdown ? `${correctCount}/${totalItems}` : `${scorePercentage.toFixed(0)}%`}
                  </div>
                  <div className="mt-1 text-sm text-emerald-800">
                    {hasAccuracyBreakdown ? 'Accurate placements' : 'Overall accuracy'}
                  </div>
                </div>

                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-sky-700">Time</div>
                  <div className="mt-1 text-3xl font-black text-sky-950">{formatElapsedTime(timeTaken)}</div>
                  <div className="mt-1 text-sm text-sky-800">
                    {completionSummary?.isTimeUp ? 'Finished at the buzzer' : 'Clear time'}
                  </div>
                </div>

                <div className={`rounded-2xl border p-4 sm:col-span-2 lg:col-span-1 ${isPerfect ? 'border-amber-200 bg-amber-50' : isGood ? 'border-indigo-100 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className={`text-xs font-bold uppercase tracking-wide ${isPerfect ? 'text-amber-700' : isGood ? 'text-indigo-700' : 'text-slate-600'}`}>Status</div>
                  <div className={`mt-1 text-2xl font-black ${isPerfect ? 'text-amber-950' : isGood ? 'text-indigo-950' : 'text-slate-900'}`}>
                    {isPerfect ? 'All Clear' : isGood ? 'Passed' : 'Needs Another Run'}
                  </div>
                  <div className={`mt-1 text-sm ${isPerfect ? 'text-amber-800' : isGood ? 'text-indigo-800' : 'text-slate-700'}`}>
                    {completionSummary?.isTimeUp ? 'The timer ended this run.' : 'You can replay immediately for a higher result.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#ffffff,#f8fafc_55%,#eef2ff)] p-5">
              <div className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Run Summary</div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Performance</div>
                  <div className="mt-1 text-lg font-black text-slate-900">
                    {isPerfect ? 'Perfect run' : isGood ? 'Strong finish' : 'Warm-up run'}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Score Rate</div>
                  <div className="mt-1 text-lg font-black text-slate-900">{scorePercentage.toFixed(0)}%</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Result</div>
                  <div className="mt-1 text-lg font-black text-slate-900">
                    {completionSummary?.isTimeUp ? 'Timed out' : lessonCompleted ? 'Lesson cleared' : 'Exercise cleared'}
                  </div>
                </div>
              </div>
            </div>

            {lessonCompleted && (
              <div className="mb-5 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
                <div className="mb-1 text-lg font-black text-amber-900">Lesson Completed</div>
                <div className="text-amber-800">
                  You earned <span className="font-bold">{pointsAwarded}</span> bonus points!
                </div>
              </div>
            )}

            {submissionResult?.lesson_progress && !lessonCompleted && (
              <div className="mb-5 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
                Exercises: {submissionResult.lesson_progress.exercises_completed}/{lesson.required_exercises || '?'} |
                Tests: {submissionResult.lesson_progress.tests_passed}/{lesson.required_tests || '?'}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleReturnToLesson}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 px-6 py-3 font-black text-white shadow-lg shadow-indigo-100 transition hover:from-indigo-700 hover:to-sky-700"
              >
                <ArrowLeft className="h-5 w-5" />
                Return to Lesson
              </button>

              <button
                onClick={() => {
                  setGameStarted(false);
                  setGameCompleted(false);
                  setCompletionSummary(null);
                  setSubmissionResult(null);
                  score.resetScore();
                  timer.reset(configuredTimeLimit);
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3 font-black text-slate-700 transition hover:bg-slate-50"
              >
                <RotateCcw className="h-5 w-5" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
        <MissionProgressToast
          payload={missionProgress}
          onDismiss={() => setMissionProgress(null)}
        />
        {gameCompleted ? renderGameResults() : renderGameContent()}
      </StudentLayout>
    );
  }

  // 🎮 传统游戏类型的布局（带侧边栏和 Start 按钮）
  return (
    <StudentLayout user={auth.user}>
      <Head title={`${exercise.title} - ${lesson.title}`} />
      <MissionProgressToast
        payload={missionProgress}
        onDismiss={() => setMissionProgress(null)}
      />
      
      <div className="mx-auto max-w-7xl bg-[radial-gradient(circle_at_top_left,#e0f2fe,transparent_28%),linear-gradient(135deg,#f8fafc,#eef2ff_48%,#ecfeff)] p-4 sm:p-6">
        {/* 游戏头部 */}
        <GameHeader lesson={lesson} exercise={exercise} />

        {/* 主要游戏区域 */}
        <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/70 shadow-2xl shadow-indigo-100/70 backdrop-blur">
          <div className="flex flex-col xl:flex-row">
            {/* 游戏内容区域 */}
            <div className="flex-1">
              {!gameStarted ? (
                <GameContainer
                  exercise={exercise}
                  onGameStart={handleGameStart}
                />
              ) : gameCompleted ? (
                renderGameResults()
              ) : (
                <div className="min-h-[600px]">
                  {renderGameContent()}
                </div>
              )}
            </div>

            {/* 状态面板 - 只在游戏进行中显示 */}
            {gameStarted && !gameCompleted && (
              <div className="border-t border-white/70 bg-slate-50/80 p-4 xl:w-72 xl:border-l xl:border-t-0">
                <GameStatusPanel
                  currentScore={score.currentScore}
                  maxScore={score.maxScore}
                  formattedTime={timer.formattedTime}
                  isTimeUp={timer.isTimeUp}
                  hasTimeLimit={configuredTimeLimit > 0}
                  isRunning={timer.isRunning}
                  isSubmitting={isSubmitting}
                  onToggleTimer={timer.isRunning ? timer.pause : timer.start}
                  onFinish={handleGameComplete}
                  onRestart={() => {
                    if (confirm('Are you sure you want to restart?')) {
                      setGameStarted(false);
                      setGameCompleted(false);
                      setCompletionSummary(null);
                      setSubmissionResult(null);
                      timer.reset(configuredTimeLimit);
                      score.resetScore();
                    }
                  }}
                />
                
                {/* 游戏控制按钮 */}
                <div className="hidden">
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
                        setCompletionSummary(null);
                        setSubmissionResult(null);
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
