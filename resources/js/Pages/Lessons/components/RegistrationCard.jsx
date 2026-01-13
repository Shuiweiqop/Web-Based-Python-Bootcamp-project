import React from 'react';
import { router } from '@inertiajs/react';
import { 
  User, 
  BookOpen, 
  Sparkles, 
  Trophy, 
  TrendingUp, 
  Zap, 
  Gamepad2, 
  ChevronRight 
} from 'lucide-react';

export default function RegistrationCard({ 
  auth, 
  lesson, 
  isLoading, 
  lessonCompleted,
  completedExercises,
  totalExercises,
  passedTests,
  totalTests,
  exerciseProgress,
  onRegister,
  onUnregister,
  scrollToSection,
  onCompleteLesson
}) {
  // 🔥 ALL HOOKS MUST BE AT THE TOP - before any conditional returns!
  const isStudent = auth?.user?.role === 'student';
  const isRegistered = lesson.is_registered;
  
  // 计算完成状态
  const allExercisesCompleted = completedExercises === totalExercises && totalExercises > 0;
  const allTestsPassed = passedTests === totalTests && totalTests > 0;
  const canCompleteLesson = !lessonCompleted && allExercisesCompleted && allTestsPassed;

  // 🔥 调试：打印接收到的 props (Hook #1)
  React.useEffect(() => {
    console.log('🎯 RegistrationCard Props:', {
      'lessonCompleted (prop)': lessonCompleted,
      'lesson.registration_status': lesson?.registration_status,
      'lesson.is_completed': lesson?.is_completed,
      'completedExercises': completedExercises,
      'totalExercises': totalExercises,
      'passedTests': passedTests,
      'totalTests': totalTests,
    });
  }, [lessonCompleted, lesson, completedExercises, totalExercises, passedTests, totalTests]);

  // 🔥 调试日志 (Hook #2)
  React.useEffect(() => {
    if (isRegistered) {
      console.log('🎯 RegistrationCard 状态:', {
        lessonCompleted,
        allExercisesCompleted,
        allTestsPassed,
        canCompleteLesson,
        completedExercises,
        totalExercises,
        passedTests,
        totalTests
      });
    }
  }, [isRegistered, lessonCompleted, allExercisesCompleted, allTestsPassed, canCompleteLesson, completedExercises, totalExercises, passedTests, totalTests]);

  // ================== 未登录状态 ==================
  if (!auth?.user) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-600 rounded-xl">
            <User className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-blue-900">Ready to Start?</h3>
        </div>
        <p className="text-blue-800 mb-5 leading-relaxed">
          Register for an account to enroll in this lesson and track your progress!
        </p>
        <button
          onClick={() => router.visit('/login')}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <User className="h-5 w-5" />
          Login to Register
        </button>
      </div>
    );
  }

  // ================== 管理员视图 ==================
  if (!isStudent) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl p-6 border-2 border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gray-600 rounded-lg">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Admin View</h3>
        </div>
        <p className="text-gray-700">You are viewing this lesson as an administrator.</p>
      </div>
    );
  }

  // ================== 未注册状态 ==================
  if (!isRegistered) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl p-6 border-2 border-emerald-300 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-600 rounded-xl">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-emerald-900">Enroll Now!</h3>
        </div>
        <p className="text-emerald-800 mb-5 leading-relaxed">
          Join this lesson and start your learning journey immediately!
        </p>
        <button
          onClick={onRegister}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Registering...
            </>
          ) : (
            <>
              <BookOpen className="h-5 w-5" />
              Register for This Lesson
            </>
          )}
        </button>
      </div>
    );
  }

  // ================== 已注册状态 ==================
  return (
    <div className={`rounded-2xl p-6 border-2 shadow-lg ${
      lessonCompleted 
        ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-amber-300' 
        : 'bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-300'
    }`}>
      {/* 标题和状态 */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-xl ${lessonCompleted ? 'bg-amber-600' : 'bg-emerald-600'}`}>
          {lessonCompleted ? (
            <Trophy className="h-6 w-6 text-white" />
          ) : (
            <TrendingUp className="h-6 w-6 text-white" />
          )}
        </div>
        <div>
          <h3 className={`text-xl font-bold ${lessonCompleted ? 'text-amber-900' : 'text-emerald-900'}`}>
            {lessonCompleted ? 'Completed! 🎉' : "You're Enrolled!"}
          </h3>
          {!lessonCompleted && (
            <p className="text-sm text-emerald-700">Keep going, you're doing great!</p>
          )}
        </div>
      </div>

      {/* 进度卡片 */}
      <div className="mb-5 p-5 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
        <div className="space-y-3">
          {/* 练习进度 */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Exercises</span>
            <span className="font-bold text-lg text-gray-900">
              {completedExercises}/{totalExercises}
              {allExercisesCompleted && (
                <span className="ml-2 text-emerald-600">✓</span>
              )}
            </span>
          </div>

          {/* 测试进度 */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Tests Passed</span>
            <span className="font-bold text-lg text-gray-900">
              {passedTests}/{totalTests}
              {allTestsPassed && (
                <span className="ml-2 text-amber-600">✓</span>
              )}
            </span>
          </div>
          
          {/* 总体进度条 */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-600">Overall Progress</span>
              <span className="text-sm font-bold text-gray-900">{exerciseProgress}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-700 ease-out ${
                  lessonCompleted 
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500' 
                    : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500'
                }`}
                style={{ width: `${exerciseProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 已完成时显示奖励（不能再次领取） */}
      {lessonCompleted && (
        <div className="mb-5 p-4 bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-400 rounded-xl text-center shadow-md">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy className="h-6 w-6 text-amber-600" />
            <p className="text-amber-900 font-bold text-lg">
              Lesson Completed!
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Zap className="h-5 w-5 text-amber-600" />
            <p className="text-amber-800 font-semibold">
              +{lesson.completion_reward_points} Points Earned
            </p>
          </div>
          <p className="text-amber-700 text-sm">Amazing work! 🎊</p>
        </div>
      )}

      {/* 🔥 完成课程按钮 - 只在未完成且满足条件时显示 */}
      {canCompleteLesson && (
        <div className="mb-5 p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-lg">
          <div className="text-center mb-4">
            <div className="inline-block p-3 bg-green-500 rounded-full mb-3 animate-bounce">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-lg font-bold text-green-900 mb-2">
              🎉 Ready to Complete!
            </h4>
            <p className="text-sm text-green-700 mb-3">
              You've finished all exercises and passed all tests!
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 mb-4">
              <span className="px-3 py-1 bg-green-100 rounded-full font-medium">
                ✓ {completedExercises} Exercises
              </span>
              <span className="px-3 py-1 bg-green-100 rounded-full font-medium">
                ✓ {passedTests} Tests
              </span>
            </div>
          </div>
          <button
            onClick={onCompleteLesson}
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Completing...
              </>
            ) : (
              <>
                <Trophy className="h-6 w-6" />
                Complete Lesson & Claim {lesson.completion_reward_points} Points
              </>
            )}
          </button>
        </div>
      )}
      
      {/* 快速导航按钮 */}
      {!lessonCompleted && (
        <div className="space-y-3 mb-5">
          <button
            onClick={() => scrollToSection('exercises-section')}
            className="w-full group inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Gamepad2 className="h-5 w-5 group-hover:rotate-12 transition-transform" />
            View Exercises
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => scrollToSection('tests-section')}
            className="w-full group inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Trophy className="h-5 w-5 group-hover:rotate-12 transition-transform" />
            View Tests
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* 🔥 取消注册按钮 - 只在未完成时显示 */}
      {!lessonCompleted && (
        <button
          onClick={onUnregister}
          disabled={isLoading}
          className="w-full px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {isLoading ? 'Unregistering...' : 'Unregister from Lesson'}
        </button>
      )}
    </div>
  );
}