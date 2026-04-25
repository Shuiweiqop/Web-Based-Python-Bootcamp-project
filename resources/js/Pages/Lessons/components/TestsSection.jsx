import React from 'react';
import { router } from '@inertiajs/react';
import { 
  Trophy, 
  Lock, 
  Play, 
  Target, 
  Sparkles, 
  ChevronRight 
} from 'lucide-react';

const getTestStatus = (test, userProgress, exercisesCompleted, totalExercises, contentCompleted) => {
  const progress = userProgress.tests?.[test.test_id];

  if (!contentCompleted) {
    return { status: 'locked', icon: Lock, color: 'gray', locked: true, reason: 'Review lesson content first' };
  }
  
  if (!exercisesCompleted && totalExercises > 0) {
    return { status: 'locked', icon: Lock, color: 'gray', locked: true, reason: 'Complete all exercises first' };
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
  totalExercises = 0 
}) {
  const handleTestClick = (test, status) => {
    if (status.locked) {
      console.log('🔒 Test is locked');
      return;
    }

    console.log('🎯 Test clicked:', { 
      test_id: test.test_id, 
      lesson_id: lesson.lesson_id, 
      status: status.status, 
      progress: userProgress.tests?.[test.test_id] 
    });

    if (status.status === 'in_progress') {
      const progress = userProgress.tests?.[test.test_id];
      if (progress?.in_progress_submission_id) {
        console.log('▶️ Continuing test, submission_id:', progress.in_progress_submission_id);
        router.visit(`/student/submissions/${progress.in_progress_submission_id}`);
        return;
      }
    }

    console.log('📄 Navigating to test show page');
    router.visit(`/student/lessons/${lesson.lesson_id}/tests/${test.test_id}`);
  };

  if (!lesson.is_registered || tests.length === 0) return null;

  return (
    <div 
      id="tests-section" 
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 scroll-mt-20 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
          <div className="p-2.5 bg-amber-100 rounded-xl mr-3">
            <Trophy className="h-7 w-7 text-amber-600" />
          </div>
          Guided Checks
        </h2>
        <span className="px-4 py-2 bg-amber-100 text-amber-800 font-bold rounded-full text-sm">
          {passedTests}/{totalTests} Passed
        </span>
      </div>

      {!contentCompleted && (
        <div className="bg-gradient-to-r from-slate-50 to-gray-100 border-2 border-slate-300 rounded-xl p-5 mb-6 shadow-sm">
          <p className="text-slate-900 font-semibold flex items-center">
            <div className="p-2 bg-slate-200 rounded-lg mr-3">
              <Lock className="w-5 h-5 text-slate-700" />
            </div>
            Review the lesson content and scroll to the bottom to unlock guided checks
          </p>
        </div>
      )}

      {contentCompleted && !exercisesCompleted && totalExercises > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-5 mb-6 shadow-sm">
          <p className="text-amber-900 font-semibold flex items-center">
            <div className="p-2 bg-amber-200 rounded-lg mr-3">
              <Lock className="w-5 h-5 text-amber-700" />
            </div>
            Complete all guided practice steps to unlock the checks
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tests.map((test) => {
          const statusInfo = getTestStatus(test, userProgress, exercisesCompleted, totalExercises, contentCompleted);
          const StatusIcon = statusInfo.icon;
          const progress = userProgress.tests?.[test.test_id];

          return (
            <button
              key={test.test_id}
              onClick={() => handleTestClick(test, statusInfo)}
              disabled={statusInfo.locked}
              className={`text-left p-6 rounded-xl border-2 transition-all duration-300 ${
                statusInfo.locked
                  ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                  : 'bg-gradient-to-br from-white via-gray-50 to-purple-50/30 border-gray-200 hover:border-amber-400 hover:shadow-2xl cursor-pointer transform hover:-translate-y-1'
              }`}
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className={`p-3 rounded-xl bg-${statusInfo.color}-100 shadow-sm`}>
                  <StatusIcon className={`w-7 h-7 text-${statusInfo.color}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{test.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{test.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="text-xs text-gray-500 font-medium mb-1">Questions</div>
                  <div className="text-2xl font-black text-gray-900">{test.questions_count}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition-colors">
                  <div className="text-xs text-gray-500 font-medium mb-1">Time Limit</div>
                  <div className="text-2xl font-black text-gray-900">
                    {test.time_limit ? `${test.time_limit}m` : '∞'}
                  </div>
                </div>
              </div>

              {progress?.latest_score !== null && progress?.latest_score !== undefined && (
                <div className={`p-4 rounded-xl mb-4 border-2 ${
                  progress.latest_score >= test.passing_score
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300'
                    : 'bg-gradient-to-r from-rose-50 to-red-50 border-rose-300'
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
                        <Trophy className="w-5 h-5 text-amber-500" />
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
                <div className={`flex items-center justify-center font-bold py-3 rounded-lg transition-colors ${
                  statusInfo.status === 'passed' ? 'bg-amber-100 text-amber-700' :
                  statusInfo.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  statusInfo.status === 'attempted' ? 'bg-orange-100 text-orange-700' :
                  'bg-indigo-100 text-indigo-700'
                }`}>
                  {statusInfo.status === 'in_progress' ? (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Continue Test
                    </>
                  ) : statusInfo.status === 'passed' ? (
                    <>
                      <Trophy className="w-5 h-5 mr-2" />
                      Retake Test
                    </>
                  ) : statusInfo.status === 'attempted' ? (
                    <>
                      <Target className="w-5 h-5 mr-2" />
                      Try Again
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Test
                    </>
                  )}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

