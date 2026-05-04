import React from 'react';
import { router } from '@inertiajs/react';
import {
  BookOpen,
  ChevronRight,
  Gamepad2,
  Gift,
  Sparkles,
  Target,
  Trophy,
  User,
  Zap,
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
  contentCompleted,
  onRegister,
  onUnregister,
  scrollToSection,
  onCompleteLesson,
}) {
  const isStudent = auth?.user?.role === 'student';
  const isRegistered = lesson.is_registered;
  const allExercisesCompleted = totalExercises === 0 || completedExercises === totalExercises;
  const allTestsPassed = totalTests === 0 || passedTests === totalTests;
  const canCompleteLesson = !lessonCompleted && contentCompleted && allExercisesCompleted && allTestsPassed;
  const guidedGateProgress =
    (contentCompleted ? 1 : 0) +
    (allExercisesCompleted ? 1 : 0) +
    (allTestsPassed ? 1 : 0);
  const guidedProgressPercent = Math.round((guidedGateProgress / 3) * 100);

  let nextMilestone = 'Register to begin this lesson journey.';
  if (isRegistered) {
    if (!contentCompleted) {
      nextMilestone = 'Review the lesson content to unlock guided practice.';
    } else if (!allExercisesCompleted) {
      const remaining = Math.max(totalExercises - completedExercises, 0);
      nextMilestone = remaining === 1
        ? 'One more exercise unlocks the checks.'
        : `${remaining} more exercises unlock the checks.`;
    } else if (!allTestsPassed) {
      const remaining = Math.max(totalTests - passedTests, 0);
      nextMilestone = remaining === 1
        ? 'Pass 1 more check to finish this lesson.'
        : `Pass ${remaining} more checks to finish this lesson.`;
    } else if (canCompleteLesson) {
      nextMilestone = `You are ready to claim ${lesson.completion_reward_points} points.`;
    } else if (lessonCompleted) {
      nextMilestone = 'You completed this lesson and claimed the reward.';
    }
  }

  if (!auth?.user) {
    return (
      <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-blue-600 p-3">
            <User className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-blue-900">Ready to start?</h3>
        </div>
        <p className="mb-5 leading-relaxed text-blue-800">
          Log in to register, track your lesson journey, and collect rewards as you finish.
        </p>
        <button
          onClick={() => router.visit('/login')}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:from-blue-700 hover:to-indigo-700"
        >
          <User className="h-5 w-5" />
          Login to Register
        </button>
      </div>
    );
  }

  if (!isStudent) {
    return (
      <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-slate-100 p-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="rounded-lg bg-gray-600 p-2">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Admin View</h3>
        </div>
        <p className="text-gray-700">You are viewing this lesson as an administrator.</p>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-100 p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-600 p-3">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-emerald-900">Start this lesson</h3>
        </div>
        <p className="mb-5 leading-relaxed text-emerald-800">
          Join the guided flow, unlock practice in order, and finish strong with your reward.
        </p>
        <button
          onClick={onRegister}
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Registering...' : 'Register for This Lesson'}
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border-2 p-6 shadow-lg ${
      lessonCompleted
        ? 'border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50'
        : 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-100'
    }`}>
      <div className="mb-4 flex items-center gap-3">
        <div className={`rounded-xl p-3 ${lessonCompleted ? 'bg-amber-600' : 'bg-emerald-600'}`}>
          {lessonCompleted ? (
            <Trophy className="h-6 w-6 text-white" />
          ) : (
            <Target className="h-6 w-6 text-white" />
          )}
        </div>
        <div>
          <h3 className={`text-xl font-bold ${lessonCompleted ? 'text-amber-900' : 'text-emerald-900'}`}>
            {lessonCompleted ? 'Reward Claimed' : 'Your Guided Lesson Flow'}
          </h3>
          <p className={`text-sm ${lessonCompleted ? 'text-amber-700' : 'text-emerald-700'}`}>
            {nextMilestone}
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-white/60 bg-white/75 p-5 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">1. Review Content</span>
            <span className="font-bold text-gray-900">{contentCompleted ? 'Done' : 'Pending'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">2. Finish Practice</span>
            <span className="font-bold text-gray-900">{completedExercises}/{totalExercises}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">3. Pass Checks</span>
            <span className="font-bold text-gray-900">{passedTests}/{totalTests}</span>
          </div>
          <div className="border-t border-gray-200 pt-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Guided path progress</span>
              <span className="text-sm font-bold text-gray-900">{guidedProgressPercent}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-200 shadow-inner">
              <div
                className={`h-full transition-all duration-700 ease-out ${
                  lessonCompleted
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500'
                    : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500'
                }`}
                style={{ width: `${guidedProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {lessonCompleted && (
        <div className="mb-5 rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-100 to-yellow-100 p-4 text-center shadow-md">
          <div className="mb-1 flex items-center justify-center gap-2">
            <Gift className="h-6 w-6 text-amber-600" />
            <p className="text-lg font-bold text-amber-900">Lesson completed</p>
          </div>
          <div className="mb-1 flex items-center justify-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            <p className="font-semibold text-amber-800">
              {lesson.completion_reward_points} points collected
            </p>
          </div>
          <p className="text-sm text-amber-700">You finished the full guided lesson flow.</p>
        </div>
      )}

      {canCompleteLesson && (
        <div className="mb-5 rounded-xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-5 shadow-lg">
          <div className="mb-4 text-center">
            <div className="mb-3 inline-block rounded-full bg-green-500 p-3">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <h4 className="mb-2 text-lg font-bold text-green-900">Reward ready to claim</h4>
            <p className="mb-3 text-sm text-green-700">
              You reviewed the content, cleared the practice, and passed every check.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
              <span className="rounded-full bg-green-100 px-3 py-1 font-medium">Content done</span>
              <span className="rounded-full bg-green-100 px-3 py-1 font-medium">Practice done</span>
              <span className="rounded-full bg-green-100 px-3 py-1 font-medium">Checks passed</span>
            </div>
          </div>
          <button
            onClick={onCompleteLesson}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 text-lg font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:from-green-700 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Completing...' : `Claim ${lesson.completion_reward_points} Points`}
          </button>
        </div>
      )}

      {!lessonCompleted && !canCompleteLesson && (
        <div className="mb-5 rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
          {nextMilestone}
        </div>
      )}

      {!lessonCompleted && (
        <div className="mb-5 space-y-3">
          <button
            onClick={() => scrollToSection('exercises-section')}
            className="group inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:from-blue-700 hover:to-indigo-700"
          >
            <Gamepad2 className="h-5 w-5 transition-transform group-hover:rotate-12" />
            Go to Practice
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => scrollToSection('tests-section')}
            className="group inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3.5 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:from-purple-700 hover:to-pink-700"
          >
            <Trophy className="h-5 w-5 transition-transform group-hover:rotate-12" />
            Go to Checks
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      )}

      {!lessonCompleted && (
        <button
          onClick={onUnregister}
          disabled={isLoading}
          className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Unregistering...' : 'Unregister from Lesson'}
        </button>
      )}
    </div>
  );
}
