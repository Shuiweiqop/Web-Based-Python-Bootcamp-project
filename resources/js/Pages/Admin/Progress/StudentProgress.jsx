import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
  ArrowLeft, BookOpen, User, Calendar, Clock, 
  TrendingUp, CheckCircle, RefreshCw, RotateCcw,
  Award, Target, Activity, AlertCircle
} from 'lucide-react';

export default function Show({ progress, exerciseProgress = [], testProgress = [] }) {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Safe data access with defaults
  const safeProgress = progress || {};
  const safeStudent = safeProgress.student || {};
  const safeStudentUser = safeStudent.user || {};
  const safeLesson = safeProgress.lesson || {};
  const safeExerciseProgress = Array.isArray(exerciseProgress) ? exerciseProgress : [];
  const safeTestProgress = Array.isArray(testProgress) ? testProgress : [];

  const handleRecalculate = () => {
    if (!safeProgress.progress_id) {
      alert('Invalid progress data');
      return;
    }

    if (confirm('Are you sure you want to recalculate this progress? This will update the progress based on current exercise and test results.')) {
      setIsRecalculating(true);
      router.post(
        route('admin.progress.recalculate', safeProgress.progress_id),
        {},
        {
          preserveScroll: true,
          onFinish: () => setIsRecalculating(false),
        }
      );
    }
  };

  const handleReset = () => {
    if (!safeProgress.progress_id) {
      alert('Invalid progress data');
      return;
    }

    if (confirm('Are you sure you want to reset this progress? This will set the progress back to 0% and status to "not_started". This action cannot be undone.')) {
      setIsResetting(true);
      router.post(
        route('admin.progress.reset', safeProgress.progress_id),
        {},
        {
          preserveScroll: true,
          onFinish: () => setIsResetting(false),
        }
      );
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      not_started: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    const labels = {
      completed: 'Completed',
      in_progress: 'In Progress',
      not_started: 'Not Started',
    };
    const icons = {
      completed: CheckCircle,
      in_progress: Clock,
      not_started: AlertCircle,
    };
    const Icon = icons[status] || AlertCircle;
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border ${styles[status] || styles.not_started}`}>
        <Icon className="w-4 h-4" />
        {labels[status] || 'Unknown'}
      </span>
    );
  };

  const infoCards = [
    {
      label: 'Progress',
      value: `${safeProgress.progress_percent || 0}%`,
      icon: TrendingUp,
      color: 'blue',
    },
    {
      label: 'Exercises Completed',
      value: `${safeProgress.exercises_completed || 0}/${safeProgress.total_exercises || 0}`,
      icon: BookOpen,
      color: 'purple',
    },
    {
      label: 'Tests Completed',
      value: `${safeProgress.tests_completed || 0}/${safeProgress.total_tests || 0}`,
      icon: Award,
      color: 'green',
    },
    {
      label: 'Average Score',
      value: safeProgress.average_score ? `${safeProgress.average_score}%` : 'N/A',
      icon: Target,
      color: 'orange',
    },
  ];

  return (
    <>
      <Head title={`Progress: ${safeStudentUser.name || 'Student'}`} />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <Link
              href={route('admin.progress.index')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Progress Analytics
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Activity className="w-8 h-8 text-blue-600" />
                  Progress Details
                </h1>
                <p className="mt-2 text-gray-600">
                  Detailed view of student progress for a specific lesson
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleRecalculate}
                  disabled={isRecalculating}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
                  {isRecalculating ? 'Recalculating...' : 'Recalculate'}
                </button>
                <button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
                  {isResetting ? 'Resetting...' : 'Reset Progress'}
                </button>
              </div>
            </div>
          </div>

          {/* Student & Lesson Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Student Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Student Information</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg text-gray-900">{safeStudentUser.name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg text-gray-900">{safeStudentUser.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Student ID</label>
                  <p className="text-lg text-gray-900">{safeProgress.student_id || 'N/A'}</p>
                </div>
                {safeProgress.student_id && (
                  <Link
                    href={route('admin.progress.student', safeProgress.student_id)}
                    className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All Progress →
                  </Link>
                )}
              </div>
            </div>

            {/* Lesson Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Lesson Information</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Lesson Title</label>
                  <p className="text-lg text-gray-900">{safeLesson.title || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Lesson ID</label>
                  <p className="text-lg text-gray-900">{safeProgress.lesson_id || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(safeProgress.status)}
                  </div>
                </div>
                {safeProgress.lesson_id && (
                  <Link
                    href={route('admin.progress.lesson', safeProgress.lesson_id)}
                    className="inline-block mt-2 text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    View Lesson Progress →
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Progress Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {infoCards.map((card, index) => {
              const Icon = card.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                purple: 'bg-purple-100 text-purple-600',
                green: 'bg-green-100 text-green-600',
                orange: 'bg-orange-100 text-orange-600',
              };
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">{card.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${colorClasses[card.color]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Timeline</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="flex-shrink-0 w-24 text-sm font-medium text-gray-600">Started</div>
                <div className="flex-1 text-gray-900">
                  {safeProgress.started_at 
                    ? new Date(safeProgress.started_at).toLocaleString()
                    : 'Not started yet'}
                </div>
              </div>
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="flex-shrink-0 w-24 text-sm font-medium text-gray-600">Last Updated</div>
                <div className="flex-1 text-gray-900">
                  {safeProgress.last_updated_at 
                    ? new Date(safeProgress.last_updated_at).toLocaleString()
                    : 'Never updated'}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-24 text-sm font-medium text-gray-600">Completed</div>
                <div className="flex-1 text-gray-900">
                  {safeProgress.completed_at 
                    ? new Date(safeProgress.completed_at).toLocaleString()
                    : 'Not completed yet'}
                </div>
              </div>
            </div>
          </div>

          {/* Exercise Progress */}
          {safeExerciseProgress.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  Exercise Progress
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Exercise
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Attempts
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Completed At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {safeExerciseProgress.map((exercise, index) => (
                      <tr key={exercise.exercise_id || index} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {exercise.exercise_title || 'Unknown Exercise'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                            {exercise.exercise_type || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(exercise.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 font-medium">
                              {exercise.score || 0} / {exercise.max_score || 0}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({exercise.percentage || 0}%)
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {exercise.attempts || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {exercise.completed_at 
                            ? new Date(exercise.completed_at).toLocaleDateString()
                            : 'Not completed'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Test Progress */}
          {safeTestProgress.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                  <Award className="w-6 h-6 text-green-600" />
                  Test Progress
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Test
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Passing Score
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Attempts
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Passed
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Completed At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {safeTestProgress.map((test, index) => (
                      <tr key={test.test_id || index} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {test.test_title || 'Unknown Test'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(test.status)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-900 font-medium">
                            {test.score !== null && test.score !== undefined ? `${test.score}%` : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {test.passing_score || 70}%
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {test.attempts || 0}
                        </td>
                        <td className="px-6 py-4">
                          {test.passed ? (
                            <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                              <CheckCircle className="w-4 h-4" />
                              Yes
                            </span>
                          ) : (
                            <span className="text-gray-500">No</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {test.completed_at 
                            ? new Date(test.completed_at).toLocaleDateString()
                            : 'Not completed'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}