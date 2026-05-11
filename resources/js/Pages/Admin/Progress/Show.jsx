import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
  ArrowLeft, BookOpen, User, Calendar, Clock, 
  TrendingUp, CheckCircle, RefreshCw, RotateCcw,
  Award, Target, Activity, AlertCircle, Mail, Hash
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Show({ auth, progress, exerciseProgress = [], testProgress = [] }) {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // 从 localStorage 读取主题
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : true;
    }
    return true;
  });

  // 监听主题变化（优化版）
  useEffect(() => {
    const handleThemeChange = () => {
      const saved = localStorage.getItem('theme');
      setIsDark(saved === 'dark');
    };

    window.addEventListener('theme-changed', handleThemeChange);
    window.addEventListener('storage', (e) => {
      if (e.key === 'theme') {
        setIsDark(e.newValue === 'dark');
      }
    });

    return () => {
      window.removeEventListener('theme-changed', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  // Safe data access
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

  const getStatusConfig = (status) => {
    const configs = {
      completed: {
        label: 'Completed',
        bg: isDark ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="w-3.5 h-3.5" />
      },
      in_progress: {
        label: 'In Progress',
        bg: isDark ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Clock className="w-3.5 h-3.5" />
      },
      not_started: {
        label: 'Not Started',
        bg: isDark ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' : 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <AlertCircle className="w-3.5 h-3.5" />
      },
    };
    return configs[status] || configs.not_started;
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return isDark ? 'from-green-500 to-emerald-500' : 'from-green-400 to-emerald-400';
    if (progress >= 50) return isDark ? 'from-blue-500 to-cyan-500' : 'from-blue-400 to-cyan-400';
    if (progress >= 25) return isDark ? 'from-yellow-500 to-orange-500' : 'from-yellow-400 to-orange-400';
    return isDark ? 'from-gray-600 to-gray-500' : 'from-gray-300 to-gray-400';
  };

  const infoCards = [
    {
      label: 'Progress',
      value: `${safeProgress.progress_percent || 0}%`,
      icon: TrendingUp,
      color: 'blue',
    },
    {
      label: 'Exercises',
      value: `${safeProgress.exercises_completed || 0}/${safeProgress.total_exercises || 0}`,
      icon: BookOpen,
      color: 'purple',
    },
    {
      label: 'Tests',
      value: `${safeProgress.tests_completed || 0}/${safeProgress.total_tests || 0}`,
      icon: Award,
      color: 'green',
    },
    {
      label: 'Avg Score',
      value: safeProgress.average_score ? `${safeProgress.average_score}%` : 'N/A',
      icon: Target,
      color: 'orange',
    },
  ];

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link
              href={route('admin.progress.index')}
              className={cn(
                "inline-flex items-center gap-2 mb-3 transition-all text-sm",
                isDark ? "text-slate-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Analytics
            </Link>
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Activity className="w-6 h-6 md:w-8 md:h-8" />
              Progress Details
            </h2>
            <p className="mt-2 text-xs md:text-sm opacity-90">
              {safeStudentUser.name} • {safeLesson.title}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3 w-full sm:w-auto">
            <button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold inline-flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4", isRecalculating && "animate-spin")} />
              {isRecalculating ? 'Recalculating...' : 'Recalculate'}
            </button>
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold inline-flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50"
            >
              <RotateCcw className={cn("w-4 h-4", isResetting && "animate-spin")} />
              {isResetting ? 'Resetting...' : 'Reset'}
            </button>
          </div>
        </div>
      }
    >
      <Head title={`Progress: ${safeStudentUser.name || 'Student'}`} />
      
      <div className={cn(
        "min-h-screen transition-colors duration-500",
        isDark ? "bg-slate-950" : "bg-gradient-to-br from-blue-50 via-purple-50 to-slate-50"
      )}>
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          {isDark ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
            </>
          ) : (
            <>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
            </>
          )}
        </div>

        <div className="py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            
            {/* Student & Lesson Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
              {/* Student Info */}
              <div className={cn(
                "rounded-2xl shadow-lg border p-4 md:p-6 backdrop-blur-sm animate-fadeIn",
                isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "p-2 md:p-3 rounded-xl",
                    isDark ? "bg-blue-500/20" : "bg-blue-100"
                  )}>
                    <User className={cn("w-5 h-5 md:w-6 md:h-6", isDark ? "text-blue-400" : "text-blue-600")} />
                  </div>
                  <h2 className={cn("text-lg md:text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                    Student Information
                  </h2>
                </div>
                <div className="space-y-3 md:space-y-4">
                  <InfoRow
                    icon={<User className="w-4 h-4" />}
                    label="Name"
                    value={safeStudentUser.name || 'Unknown'}
                    isDark={isDark}
                  />
                  <InfoRow
                    icon={<Mail className="w-4 h-4" />}
                    label="Email"
                    value={safeStudentUser.email || 'N/A'}
                    isDark={isDark}
                  />
                  <InfoRow
                    icon={<Hash className="w-4 h-4" />}
                    label="Student ID"
                    value={safeProgress.student_id || 'N/A'}
                    isDark={isDark}
                    noBorder
                  />
                  {safeProgress.student_id && (
                    <Link
                      href={route('admin.progress.student', safeProgress.student_id)}
                      className={cn(
                        "inline-block mt-2 text-sm font-semibold transition-all",
                        isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
                      )}
                    >
                      View All Progress →
                    </Link>
                  )}
                </div>
              </div>

              {/* Lesson Info */}
              <div className={cn(
                "rounded-2xl shadow-lg border p-4 md:p-6 backdrop-blur-sm animate-fadeIn",
                isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "p-2 md:p-3 rounded-xl",
                    isDark ? "bg-purple-500/20" : "bg-purple-100"
                  )}>
                    <BookOpen className={cn("w-5 h-5 md:w-6 md:h-6", isDark ? "text-purple-400" : "text-purple-600")} />
                  </div>
                  <h2 className={cn("text-lg md:text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                    Lesson Information
                  </h2>
                </div>
                <div className="space-y-3 md:space-y-4">
                  <InfoRow
                    icon={<BookOpen className="w-4 h-4" />}
                    label="Lesson Title"
                    value={safeLesson.title || 'N/A'}
                    isDark={isDark}
                  />
                  <InfoRow
                    icon={<Hash className="w-4 h-4" />}
                    label="Lesson ID"
                    value={safeProgress.lesson_id || 'N/A'}
                    isDark={isDark}
                  />
                  <div>
                    <label className={cn("block text-xs md:text-sm font-medium mb-2", isDark ? "text-slate-400" : "text-gray-600")}>
                      Status
                    </label>
                    <StatusBadge status={safeProgress.status} isDark={isDark} getStatusConfig={getStatusConfig} />
                  </div>
                  {safeProgress.lesson_id && (
                    <Link
                      href={route('admin.progress.lesson', safeProgress.lesson_id)}
                      className={cn(
                        "inline-block mt-2 text-sm font-semibold transition-all",
                        isDark ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-800"
                      )}
                    >
                      View Lesson Progress →
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {infoCards.map((card, index) => (
                <StatCard
                  key={index}
                  icon={card.icon}
                  label={card.label}
                  value={card.value}
                  color={card.color}
                  isDark={isDark}
                />
              ))}
            </div>

            {/* Timeline */}
            <div className={cn(
              "rounded-2xl shadow-lg border p-4 md:p-6 mb-8 backdrop-blur-sm animate-fadeIn",
              isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <Calendar className={cn("w-5 h-5", isDark ? "text-slate-400" : "text-gray-600")} />
                <h2 className={cn("text-lg md:text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                  Timeline
                </h2>
              </div>
              <div className="space-y-4">
                <TimelineRow
                  label="Started"
                  value={safeProgress.started_at 
                    ? new Date(safeProgress.started_at).toLocaleString()
                    : 'Not started yet'}
                  isDark={isDark}
                />
                <TimelineRow
                  label="Last Updated"
                  value={safeProgress.last_updated_at 
                    ? new Date(safeProgress.last_updated_at).toLocaleString()
                    : 'Never updated'}
                  isDark={isDark}
                />
                <TimelineRow
                  label="Completed"
                  value={safeProgress.completed_at 
                    ? new Date(safeProgress.completed_at).toLocaleString()
                    : 'Not completed yet'}
                  isDark={isDark}
                  noBorder
                />
              </div>
            </div>

            {/* Exercise Progress */}
            {safeExerciseProgress.length > 0 && (
              <div className={cn(
                "rounded-2xl shadow-lg border backdrop-blur-sm mb-8 overflow-hidden animate-fadeIn",
                isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
              )}>
                <div className={cn(
                  "p-4 md:p-6 border-b",
                  isDark ? "border-white/10" : "border-gray-200"
                )}>
                  <h2 className={cn("text-lg md:text-xl font-bold flex items-center gap-3", isDark ? "text-white" : "text-gray-900")}>
                    <BookOpen className={cn("w-5 h-5 md:w-6 md:h-6", isDark ? "text-blue-400" : "text-blue-600")} />
                    Exercise Progress
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={isDark ? "bg-slate-800/50" : "bg-gray-50"}>
                      <tr>
                        <th className={cn("px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                          Exercise
                        </th>
                        <th className={cn("px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                          Type
                        </th>
                        <th className={cn("px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                          Status
                        </th>
                        <th className={cn("px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                          Score
                        </th>
                        <th className={cn("px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                          Attempts
                        </th>
                        <th className={cn("px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                          Completed
                        </th>
                      </tr>
                    </thead>
                    <tbody className={cn("divide-y", isDark ? "divide-white/10" : "divide-gray-200")}>
                      {safeExerciseProgress.map((exercise, index) => (
                        <tr key={exercise.exercise_id || index} className={cn("transition-colors", isDark ? "hover:bg-slate-800/30" : "hover:bg-gray-50")}>
                          <td className={cn("px-4 md:px-6 py-3 md:py-4 font-medium", isDark ? "text-white" : "text-gray-900")}>
                            {exercise.exercise_title || 'Unknown Exercise'}
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4">
                            <span className={cn("px-2 py-1 text-xs font-medium rounded-lg", isDark ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-gray-700")}>
                              {exercise.exercise_type || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4">
                            <StatusBadge status={exercise.status} isDark={isDark} getStatusConfig={getStatusConfig} />
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4">
                            <div className="flex items-center gap-2">
                              <span className={cn("font-semibold text-sm", isDark ? "text-white" : "text-gray-900")}>
                                {exercise.score || 0} / {exercise.max_score || 0}
                              </span>
                              <span className={cn("text-xs", isDark ? "text-slate-500" : "text-gray-500")}>
                                ({exercise.percentage || 0}%)
                              </span>
                            </div>
                          </td>
                          <td className={cn("px-4 md:px-6 py-3 md:py-4", isDark ? "text-slate-300" : "text-gray-900")}>
                            {exercise.attempts || 0}
                          </td>
                          <td className={cn("px-4 md:px-6 py-3 md:py-4 text-sm", isDark ? "text-slate-400" : "text-gray-600")}>
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
              <div className={cn(
                "rounded-2xl shadow-lg border backdrop-blur-sm overflow-hidden animate-fadeIn",
                isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
              )}>
                <div className={cn(
                  "p-4 md:p-6 border-b",
                  isDark ? "border-white/10" : "border-gray-200"
                )}>
                  <h2 className={cn("text-lg md:text-xl font-bold flex items-center gap-3", isDark ? "text-white" : "text-gray-900")}>
                    <Award className={cn("w-5 h-5 md:w-6 md:h-6", isDark ? "text-green-400" : "text-green-600")} />
                    Test Progress
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={isDark ? "bg-slate-800/50" : "bg-gray-50"}>
                      <tr>
                        <th className={cn("px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                          Test
                        </th>
                        <th className={cn("px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                          Status
                        </th>
                        <th className={cn("px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                          Score
                        </th>
                        <th className={cn("px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                          Passing
                        </th>
                        <th className={cn("px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                          Attempts
                        </th>
                        <th className={cn("px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                          Passed
                        </th>
                        <th className={cn("px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                          Completed
                        </th>
                      </tr>
                    </thead>
                    <tbody className={cn("divide-y", isDark ? "divide-white/10" : "divide-gray-200")}>
                      {safeTestProgress.map((test, index) => (
                        <tr key={test.test_id || index} className={cn("transition-colors", isDark ? "hover:bg-slate-800/30" : "hover:bg-gray-50")}>
                          <td className={cn("px-4 md:px-6 py-3 md:py-4 font-medium", isDark ? "text-white" : "text-gray-900")}>
                            {test.test_title || 'Unknown Test'}
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4">
                            <StatusBadge status={test.status} isDark={isDark} getStatusConfig={getStatusConfig} />
                          </td>
                          <td className={cn("px-4 md:px-6 py-3 md:py-4 font-semibold", isDark ? "text-white" : "text-gray-900")}>
                            {test.score !== null && test.score !== undefined ? `${test.score}%` : 'N/A'}
                          </td>
                          <td className={cn("px-4 md:px-6 py-3 md:py-4", isDark ? "text-slate-400" : "text-gray-600")}>
                            {test.passing_score || 70}%
                          </td>
                          <td className={cn("px-4 md:px-6 py-3 md:py-4", isDark ? "text-slate-300" : "text-gray-900")}>
                            {test.attempts || 0}
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4">
                            {test.passed ? (
                              <span className={cn("inline-flex items-center gap-1.5 font-semibold text-sm", isDark ? "text-green-400" : "text-green-600")}>
                                <CheckCircle className="w-4 h-4" />
                                Yes
                              </span>
                            ) : (
                              <span className={cn("text-sm", isDark ? "text-slate-500" : "text-gray-500")}>No</span>
                            )}
                          </td>
                          <td className={cn("px-4 md:px-6 py-3 md:py-4 text-sm", isDark ? "text-slate-400" : "text-gray-600")}>
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
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </AuthenticatedLayout>
  );
}

// Helper Components
function InfoRow({ icon, label, value, isDark, noBorder = false }) {
  return (
    <div className={cn(
      "flex items-center justify-between",
      !noBorder && (isDark ? "pb-3 border-b border-white/10" : "pb-3 border-b border-gray-200")
    )}>
      <div className="flex items-center gap-2">
        <span className={isDark ? "text-cyan-400" : "text-blue-600"}>{icon}</span>
        <span className={cn("text-xs md:text-sm font-medium", isDark ? "text-slate-400" : "text-gray-600")}>
          {label}
        </span>
      </div>
      <span className={cn("text-sm md:text-base font-semibold", isDark ? "text-white" : "text-gray-900")}>
        {value}
      </span>
    </div>
  );
}

function TimelineRow({ label, value, isDark, noBorder = false }) {
  return (
    <div className={cn(
      "flex items-center gap-4",
      !noBorder && (isDark ? "pb-4 border-b border-white/10" : "pb-4 border-b border-gray-200")
    )}>
      <div className={cn("flex-shrink-0 w-24 text-xs md:text-sm font-medium", isDark ? "text-slate-400" : "text-gray-600")}>
        {label}
      </div>
      <div className={cn("flex-1 text-sm md:text-base", isDark ? "text-white" : "text-gray-900")}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status, isDark, getStatusConfig }) {
  const config = getStatusConfig(status);
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 text-xs font-semibold rounded-lg border",
      config.bg
    )}>
      {config.icon}
      {config.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color, isDark }) {
  const colorClasses = {
    blue: isDark ? 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' : 'from-blue-50 to-cyan-50 border-blue-200',
    purple: isDark ? 'from-purple-500/20 to-pink-500/20 border-purple-500/30' : 'from-purple-50 to-pink-50 border-purple-200',
    green: isDark ? 'from-green-500/20 to-emerald-500/20 border-green-500/30' : 'from-green-50 to-emerald-50 border-green-200',
    orange: isDark ? 'from-orange-500/20 to-amber-500/20 border-orange-500/30' : 'from-orange-50 to-amber-50 border-orange-200',
  };

  const iconColorClasses = {
    blue: isDark ? 'text-blue-400' : 'text-blue-600',
    purple: isDark ? 'text-purple-400' : 'text-purple-600',
    green: isDark ? 'text-green-400' : 'text-green-600',
    orange: isDark ? 'text-orange-400' : 'text-orange-600',
  };

  return (
    <div className={cn(
      "rounded-2xl shadow-lg border p-4 md:p-6 backdrop-blur-sm animate-fadeIn bg-gradient-to-br",
      colorClasses[color]
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={cn("text-xs md:text-sm font-medium mb-1", isDark ? "text-slate-400" : "text-gray-600")}>
            {label}
          </p>
          <p className={cn("text-2xl md:text-3xl font-bold", isDark ? "text-white" : "text-gray-900")}>
            {value}
          </p>
        </div>
        <div className={cn(
          "p-2 md:p-3 rounded-xl flex-shrink-0",
          isDark ? 'bg-white/10' : 'bg-white/50'
        )}>
          <Icon className={cn("w-5 h-5 md:w-6 md:h-6", iconColorClasses[color])} />
        </div>
      </div>
    </div>
  );
}