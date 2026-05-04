import React from 'react';
import { router } from '@inertiajs/react';
import { ChevronRight, Lock, Play, Sparkles, Target, Trophy } from 'lucide-react';

const toneClasses = {
  gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
};

const getTestStatus = (test, userProgress, exercisesCompleted, totalExercises, contentCompleted) => {
  const progress = userProgress.tests?.[test.test_id];

  if (!contentCompleted) {
    return { status: 'locked', icon: Lock, color: 'gray', locked: true, reason: 'Read through the lesson first' };
  }

  if (!exercisesCompleted && totalExercises > 0) {
    return { status: 'locked', icon: Lock, color: 'gray', locked: true, reason: 'Finish the practice steps first' };
  }

  if (progress?.latest_score >= test.passing_score) {
    return { status: 'passed', icon: Trophy, color: 'amber', locked: false };
  }

  if (progress?.has_in_progress) {
    return { status: 'in_progress', icon: Play, color: 'orange', locked: false };
  }

  if (progress?.attempts_used > 0) {
    return { status: 'attempted', icon: Target, color: 'red', locked: false };
  }

  return { status: 'available', icon: Play, color: 'blue', locked: false };
};

export default function TestsSection({
  lesson,
  tests = [],
  userProgress = {},
  passedTests = 0,
  totalTests = 0,
  contentCompleted = false,
  exercisesCompleted = false,
  totalExercises = 0,
}) {
  const handleTestClick = (test, status) => {
    if (status.locked) return;

    if (status.status === 'in_progress') {
      const progress = userProgress.tests?.[test.test_id];
      if (progress?.in_progress_submission_id) {
        router.visit(`/student/submissions/${progress.in_progress_submission_id}`);
        return;
      }
    }

    router.visit(`/student/lessons/${lesson.lesson_id}/tests/${test.test_id}`);
  };

  if (!lesson.is_registered || tests.length === 0) return null;

  return (
    <div
      id="tests-section"
      className="scroll-mt-20 rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center text-3xl font-bold text-gray-900">
          <div className="mr-3 rounded-xl bg-amber-100 p-2.5">
            <Trophy className="h-7 w-7 text-amber-600" />
          </div>
          Final Checks
        </h2>
        <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800">
          {passedTests}/{totalTests} Passed
        </span>
      </div>

      <div className="mb-6 rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Finish strong</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          These checks are here to help you prove the idea to yourself, not just clear a requirement.
        </p>
      </div>

      {!contentCompleted && (
        <div className="mb-6 rounded-xl border-2 border-slate-300 bg-gradient-to-r from-slate-50 to-gray-100 p-5 shadow-sm">
          <p className="flex items-center font-semibold text-slate-900">
            <span className="mr-3 rounded-lg bg-slate-200 p-2">
              <Lock className="h-5 w-5 text-slate-700" />
            </span>
            Read the lesson through to the end before these checks open.
          </p>
        </div>
      )}

      {contentCompleted && !exercisesCompleted && totalExercises > 0 && (
        <div className="mb-6 rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 p-5 shadow-sm">
          <p className="flex items-center font-semibold text-amber-900">
            <span className="mr-3 rounded-lg bg-amber-200 p-2">
              <Lock className="h-5 w-5 text-amber-700" />
            </span>
            Finish the practice steps first so these checks feel much more comfortable.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {tests.map((test) => {
          const statusInfo = getTestStatus(test, userProgress, exercisesCompleted, totalExercises, contentCompleted);
          const StatusIcon = statusInfo.icon;
          const progress = userProgress.tests?.[test.test_id];
          const tone = toneClasses[statusInfo.color] || toneClasses.gray;

          return (
            <button
              key={test.test_id}
              onClick={() => handleTestClick(test, statusInfo)}
              disabled={statusInfo.locked}
              className={`rounded-xl border-2 p-6 text-left transition-all duration-300 ${
                statusInfo.locked
                  ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
                  : 'cursor-pointer border-gray-200 bg-gradient-to-br from-white via-gray-50 to-purple-50/30 hover:-translate-y-1 hover:border-amber-400 hover:shadow-2xl'
              }`}
            >
              <div className="mb-4 flex items-start space-x-4">
                <div className={`rounded-xl p-3 shadow-sm ${tone.bg}`}>
                  <StatusIcon className={`h-7 w-7 ${tone.text}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 text-xl font-bold text-gray-900">{test.title}</h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">{test.description}</p>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-blue-300">
                  <div className="mb-1 text-xs font-medium text-gray-500">Questions</div>
                  <div className="text-2xl font-black text-gray-900">{test.questions_count}</div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-purple-300">
                  <div className="mb-1 text-xs font-medium text-gray-500">Time Limit</div>
                  <div className="text-2xl font-black text-gray-900">
                    {test.time_limit ? `${test.time_limit}m` : '∞'}
                  </div>
                </div>
              </div>

              {progress?.latest_score !== null && progress?.latest_score !== undefined && (
                <div className={`mb-4 rounded-xl border-2 p-4 ${
                  progress.latest_score >= test.passing_score
                    ? 'border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50'
                    : 'border-rose-300 bg-gradient-to-r from-rose-50 to-red-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">Best Score:</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-black ${
                        progress.latest_score >= test.passing_score ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {progress.latest_score}%
                      </span>
                      {progress.latest_score >= test.passing_score && (
                        <Trophy className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {statusInfo.locked && statusInfo.reason && (
                <div className="rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-600">
                  {statusInfo.reason}
                </div>
              )}

              {!statusInfo.locked && (
                <div className={`flex items-center justify-center rounded-lg py-3 font-bold transition-colors ${
                  statusInfo.status === 'passed' ? 'bg-amber-100 text-amber-700' :
                  statusInfo.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  statusInfo.status === 'attempted' ? 'bg-orange-100 text-orange-700' :
                  'bg-indigo-100 text-indigo-700'
                }`}>
                  {statusInfo.status === 'in_progress' ? (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Continue Check
                    </>
                  ) : statusInfo.status === 'passed' ? (
                    <>
                      <Trophy className="mr-2 h-5 w-5" />
                      Replay Check
                    </>
                  ) : statusInfo.status === 'attempted' ? (
                    <>
                      <Target className="mr-2 h-5 w-5" />
                      Give It Another Try
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Start Check
                    </>
                  )}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
