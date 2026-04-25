import React from 'react';
import { Gamepad2, ChevronRight, Award, Clock, CheckCircle, Play, Lock } from 'lucide-react';
import { router } from '@inertiajs/react';

const ExercisesSection = ({ lesson, exercises, userProgress, contentCompleted = false }) => {
  /**
   * Get exercise status
   * @param {object} exercise - Exercise object
   * @param {number} index - Exercise index
   * @returns {object} status info {status, icon, color, locked}
   */
  const getExerciseStatus = (exercise, index) => {
    const progress = userProgress.exercises?.[exercise.exercise_id];

    if (!contentCompleted) {
      return { status: 'locked', icon: Lock, color: 'gray', locked: true, reason: 'Review lesson content first' };
    }
    
    // Completed
    if (progress?.completed) {
      return { status: 'completed', icon: CheckCircle, color: 'emerald', locked: false };
    }
    
    // The first exercise is always available
    if (index === 0) {
      return { status: 'available', icon: Play, color: 'blue', locked: false };
    }
    
    // The previous exercise must be completed before unlocking this one
    const prevExercise = exercises[index - 1];
    const prevProgress = userProgress.exercises?.[prevExercise.exercise_id];
    
    if (prevProgress?.completed) {
      return { status: 'available', icon: Play, color: 'blue', locked: false };
    }
    
    // Locked
    return { status: 'locked', icon: Lock, color: 'gray', locked: true, reason: 'Finish the previous exercise first' };
  };

  /**
   * Handle exercise click
   */
  const handleExerciseClick = (exercise, status) => {
    if (status.locked) return;
    router.get(`/lessons/${lesson.lesson_id}/exercises/${exercise.exercise_id}`);
  };

  const completedExercises = exercises.filter(
    ex => userProgress.exercises?.[ex.exercise_id]?.completed
  ).length;
  const totalExercises = exercises.length;

  return (
    <div 
      id="exercises-section" 
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 scroll-mt-20 hover:shadow-xl transition-shadow duration-300"
    >
      {/* Header & Progress */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
          <div className="p-2.5 bg-blue-100 rounded-xl mr-3">
            <Gamepad2 className="h-7 w-7 text-blue-600" />
          </div>
          Guided Practice
        </h2>
        <span className="px-4 py-2 bg-blue-100 text-blue-800 font-bold rounded-full text-sm">
          {completedExercises}/{totalExercises}
        </span>
      </div>

      {!contentCompleted && (
        <div className="mb-6 rounded-xl border-2 border-slate-300 bg-gradient-to-r from-slate-50 to-gray-100 p-5 shadow-sm">
          <p className="flex items-center font-semibold text-slate-900">
            <div className="mr-3 rounded-lg bg-slate-200 p-2">
              <Lock className="w-5 h-5 text-slate-700" />
            </div>
            Review the lesson content first to unlock guided practice
          </p>
        </div>
      )}

      {/* Timeline Container */}
      <div className="relative">
        {/* Vertical Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-indigo-200 to-purple-200" />
        
        {/* Exercise List */}
        <div className="space-y-6">
          {exercises.map((exercise, index) => {
            const statusInfo = getExerciseStatus(exercise, index);
            const StatusIcon = statusInfo.icon;
            const progress = userProgress.exercises?.[exercise.exercise_id];

            return (
              <div key={exercise.exercise_id} className="relative">
                {/* Timeline Node */}
                <div
                  className={`absolute left-6 w-6 h-6 rounded-full border-4 border-white z-10 shadow-md transition-all ${
                    statusInfo.status === 'completed'
                      ? 'bg-emerald-500'
                      : statusInfo.status === 'available'
                      ? 'bg-blue-500 animate-pulse'
                      : 'bg-gray-300'
                  }`}
                />

                {/* Exercise Card */}
                <div className="ml-16">
                  <button
                    onClick={() => handleExerciseClick(exercise, statusInfo)}
                    disabled={statusInfo.locked}
                    className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 ${
                      statusInfo.locked
                        ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                        : 'bg-gradient-to-br from-white to-blue-50/30 border-gray-200 hover:border-blue-400 hover:shadow-xl cursor-pointer transform hover:-translate-y-1'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Title Row */}
                        <div className="flex items-center space-x-3 mb-3 flex-wrap">
                          <div className={`p-2 rounded-lg bg-${statusInfo.color}-100`}>
                            <StatusIcon className={`w-5 h-5 text-${statusInfo.color}-600`} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">{exercise.title}</h3>
                          {progress?.completed && (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-300">
                              ✓ Completed
                            </span>
                          )}
                          {statusInfo.locked && statusInfo.reason && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200">
                              {statusInfo.reason}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 mb-4 leading-relaxed">{exercise.description}</p>
                        
                        {/* Score & Time */}
                        <div className="flex items-center flex-wrap gap-4 text-sm">
                          <span className="flex items-center text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg font-medium">
                            <Award className="w-4 h-4 mr-1.5" />
                            {exercise.max_score} pts
                          </span>
                          {exercise.time_limit_sec && (
                            <span className="flex items-center text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg font-medium">
                              <Clock className="w-4 h-4 mr-1.5" />
                              {Math.floor(exercise.time_limit_sec / 60)} min
                            </span>
                          )}
                        </div>

                        {/* Highest Score Display */}
                        {progress?.score > 0 && (
                          <div className="mt-4 flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                            <span className="text-sm font-bold text-emerald-700">
                              Highest Score: {progress.score}/{exercise.max_score}
                            </span>
                            <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                              {progress.attempts} {progress.attempts === 1 ? 'attempt' : 'attempts'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right Arrow */}
                      {!statusInfo.locked && (
                        <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0 ml-4 transition-transform group-hover:translate-x-1" />
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
