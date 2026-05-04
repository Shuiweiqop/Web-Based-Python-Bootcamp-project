import React from 'react';
import { router } from '@inertiajs/react';
import { Award, CheckCircle, ChevronRight, Clock, Gamepad2, Lock, Play } from 'lucide-react';

const toneClasses = {
  gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
};

const getExerciseStatus = (exercise, index, exercises, userProgress, contentCompleted) => {
  const progress = userProgress.exercises?.[exercise.exercise_id];

  if (!contentCompleted) {
    return { status: 'locked', icon: Lock, color: 'gray', locked: true, reason: 'Review lesson content first' };
  }

  if (progress?.completed) {
    return { status: 'completed', icon: CheckCircle, color: 'emerald', locked: false, label: 'Completed' };
  }

  if (progress && !progress.completed) {
    return { status: 'in_progress', icon: Play, color: 'amber', locked: false, label: 'In Progress' };
  }

  if (index === 0) {
    return { status: 'available', icon: Play, color: 'blue', locked: false, label: 'New' };
  }

  const prevExercise = exercises[index - 1];
  const prevProgress = userProgress.exercises?.[prevExercise.exercise_id];
  if (prevProgress?.completed) {
    return { status: 'available', icon: Play, color: 'blue', locked: false, label: 'New' };
  }

  return { status: 'locked', icon: Lock, color: 'gray', locked: true, reason: 'Finish the previous exercise first' };
};

const getRecommendedAction = (exercises, userProgress, contentCompleted) => {
  if (!contentCompleted) {
    return 'Review the lesson content first to unlock guided practice.';
  }

  const nextIncomplete = exercises.find((exercise, index) => {
    const status = getExerciseStatus(exercise, index, exercises, userProgress, contentCompleted);
    return !status.locked && status.status !== 'completed';
  });

  if (!nextIncomplete) {
    return 'Practice complete. You are ready for the checks.';
  }

  const progress = userProgress.exercises?.[nextIncomplete.exercise_id];
  return progress && !progress.completed
    ? `Continue ${nextIncomplete.title}`
    : `Start ${nextIncomplete.title}`;
};

const ExercisesSection = ({ lesson, exercises, userProgress, contentCompleted = false }) => {
  const handleExerciseClick = (exercise, status) => {
    if (status.locked) return;
    router.get(`/lessons/${lesson.lesson_id}/exercises/${exercise.exercise_id}`);
  };

  const completedExercises = exercises.filter(
    (exercise) => userProgress.exercises?.[exercise.exercise_id]?.completed
  ).length;
  const totalExercises = exercises.length;
  const recommendedAction = getRecommendedAction(exercises, userProgress, contentCompleted);

  return (
    <div
      id="exercises-section"
      className="scroll-mt-20 rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center text-3xl font-bold text-gray-900">
          <div className="mr-3 rounded-xl bg-blue-100 p-2.5">
            <Gamepad2 className="h-7 w-7 text-blue-600" />
          </div>
          Guided Practice
        </h2>
        <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-800">
          {completedExercises}/{totalExercises}
        </span>
      </div>

      <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Why this matters</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          These practice steps help you apply the concept immediately so the final checks feel easier and less random.
        </p>
        <div className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-blue-900 shadow-sm">
          Next best step: {recommendedAction}
        </div>
      </div>

      {!contentCompleted && (
        <div className="mb-6 rounded-xl border-2 border-slate-300 bg-gradient-to-r from-slate-50 to-gray-100 p-5 shadow-sm">
          <p className="flex items-center font-semibold text-slate-900">
            <span className="mr-3 rounded-lg bg-slate-200 p-2">
              <Lock className="h-5 w-5 text-slate-700" />
            </span>
            Review the lesson content first to unlock guided practice.
          </p>
        </div>
      )}

      <div className="relative">
        <div className="absolute bottom-0 left-8 top-0 w-0.5 bg-gradient-to-b from-blue-200 via-indigo-200 to-purple-200" />

        <div className="space-y-6">
          {exercises.map((exercise, index) => {
            const statusInfo = getExerciseStatus(exercise, index, exercises, userProgress, contentCompleted);
            const StatusIcon = statusInfo.icon;
            const progress = userProgress.exercises?.[exercise.exercise_id];
            const tone = toneClasses[statusInfo.color] || toneClasses.gray;

            return (
              <div key={exercise.exercise_id} className="relative">
                <div
                  className={`absolute left-6 z-10 h-6 w-6 rounded-full border-4 border-white shadow-md transition-all ${
                    statusInfo.status === 'completed'
                      ? 'bg-emerald-500'
                      : statusInfo.status === 'available'
                        ? 'animate-pulse bg-blue-500'
                        : statusInfo.status === 'in_progress'
                          ? 'bg-amber-500'
                          : 'bg-gray-300'
                  }`}
                />

                <div className="ml-16">
                  <button
                    onClick={() => handleExerciseClick(exercise, statusInfo)}
                    disabled={statusInfo.locked}
                    className={`w-full rounded-xl border-2 p-6 text-left transition-all duration-300 ${
                      statusInfo.locked
                        ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
                        : 'cursor-pointer border-gray-200 bg-gradient-to-br from-white to-blue-50/30 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <div className={`rounded-lg p-2 ${tone.bg}`}>
                            <StatusIcon className={`h-5 w-5 ${tone.text}`} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">{exercise.title}</h3>
                          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${
                            statusInfo.status === 'completed'
                              ? 'border-emerald-300 bg-emerald-100 text-emerald-700'
                              : statusInfo.status === 'in_progress'
                                ? 'border-amber-300 bg-amber-100 text-amber-700'
                                : statusInfo.status === 'available'
                                  ? 'border-blue-300 bg-blue-100 text-blue-700'
                                  : 'border-gray-200 bg-gray-100 text-gray-600'
                          }`}>
                            {statusInfo.label || statusInfo.reason}
                          </span>
                        </div>

                        <p className="mb-4 leading-relaxed text-gray-600">{exercise.description}</p>

                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="flex items-center rounded-lg bg-gray-100 px-3 py-1.5 font-medium text-gray-600">
                            <Award className="mr-1.5 h-4 w-4" />
                            {exercise.max_score} pts
                          </span>
                          {exercise.time_limit_sec && (
                            <span className="flex items-center rounded-lg bg-gray-100 px-3 py-1.5 font-medium text-gray-600">
                              <Clock className="mr-1.5 h-4 w-4" />
                              {Math.floor(exercise.time_limit_sec / 60)} min
                            </span>
                          )}
                        </div>

                        {progress?.score > 0 && (
                          <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                            <span className="text-sm font-bold text-emerald-700">
                              Best Score: {progress.score}/{exercise.max_score}
                            </span>
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-600">
                              {progress.attempts} {progress.attempts === 1 ? 'attempt' : 'attempts'}
                            </span>
                          </div>
                        )}
                      </div>

                      {!statusInfo.locked && (
                        <ChevronRight className="ml-4 h-6 w-6 flex-shrink-0 text-gray-400" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExercisesSection;
