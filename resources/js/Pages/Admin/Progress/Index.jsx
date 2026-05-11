import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
  BookOpen, Users, Target, TrendingUp, 
  Download, Search, Filter, RefreshCw,
  CheckCircle, Clock, XCircle, BarChart3,
  Eye, User
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Index({ auth, progress, stats, lessons, students, filters = {} }) {
  const [search, setSearch] = useState(filters?.search || '');
  const [lessonFilter, setLessonFilter] = useState(filters?.lesson_id || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || '');
  const [studentFilter, setStudentFilter] = useState(filters?.student_id || '');

  // 从 localStorage 读取主题
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : true;
    }
    return true;
  });

  // 监听主题变化（优化版：移除轮询）
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

  const handleFilter = () => {
    router.get(route('admin.progress.index'), {
      search,
      lesson_id: lessonFilter,
      status: statusFilter,
      student_id: studentFilter,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleReset = () => {
    setSearch('');
    setLessonFilter('');
    setStatusFilter('');
    setStudentFilter('');
    router.get(route('admin.progress.index'));
  };

  const handleExport = () => {
    window.location.href = route('admin.progress.export', {
      search,
      lesson_id: lessonFilter,
      status: statusFilter,
      student_id: studentFilter,
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      completed: {
        label: 'Completed',
        bg: isDark ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="w-3 h-3" />
      },
      in_progress: {
        label: 'In Progress',
        bg: isDark ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Clock className="w-3 h-3" />
      },
      not_started: {
        label: 'Not Started',
        bg: isDark ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' : 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <XCircle className="w-3 h-3" />
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

  const statCards = [
    {
      title: 'Total Records',
      value: stats.total_progress_records,
      icon: BookOpen,
      color: 'blue',
      description: 'Progress entries'
    },
    {
      title: 'Total Students',
      value: stats.total_students,
      icon: Users,
      color: 'purple',
      description: `${stats.active_students} active`
    },
    {
      title: 'Completion Rate',
      value: `${stats.completion_rate}%`,
      icon: Target,
      color: 'green',
      description: `${stats.completed} completed`
    },
    {
      title: 'Average Progress',
      value: `${stats.average_progress}%`,
      icon: TrendingUp,
      color: 'orange',
      description: 'Overall progress'
    },
  ];

  const statusStats = [
    { label: 'Completed', count: stats.completed, icon: CheckCircle, color: 'green' },
    { label: 'In Progress', count: stats.in_progress, icon: Clock, color: 'blue' },
    { label: 'Not Started', count: stats.not_started, icon: XCircle, color: 'gray' },
  ];

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="w-6 h-6 md:w-8 md:h-8" />
              Progress Analytics
            </h2>
            <p className="mt-2 text-xs md:text-sm opacity-90">
              Monitor and analyze student learning progress
            </p>
          </div>
          <button
            onClick={handleExport}
            className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold inline-flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <Download className="w-4 h-4 md:w-5 md:h-5" />
            Export Report
          </button>
        </div>
      }
    >
      <Head title="Progress Analytics" />
      
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
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {statCards.map((stat, index) => (
                <StatCard
                  key={index}
                  icon={stat.icon}
                  title={stat.title}
                  value={stat.value}
                  description={stat.description}
                  color={stat.color}
                  isDark={isDark}
                />
              ))}
            </div>

            {/* Status Distribution */}
            <div className={cn(
              "rounded-2xl shadow-lg border p-4 md:p-6 mb-8 backdrop-blur-sm animate-fadeIn",
              isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
            )}>
              <h3 className={cn("text-lg font-bold mb-4 flex items-center gap-2", isDark ? "text-white" : "text-gray-900")}>
                <BarChart3 className="w-5 h-5" />
                Status Distribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statusStats.map((status, index) => {
                  const Icon = status.icon;
                  const colorClasses = {
                    green: isDark ? 'text-green-400 bg-green-500/10' : 'text-green-600 bg-green-50',
                    blue: isDark ? 'text-blue-400 bg-blue-500/10' : 'text-blue-600 bg-blue-50',
                    gray: isDark ? 'text-gray-400 bg-gray-500/10' : 'text-gray-600 bg-gray-50',
                  };
                  return (
                    <div key={index} className={cn(
                      "flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl",
                      colorClasses[status.color]
                    )}>
                      <Icon className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0" />
                      <div>
                        <p className={cn("text-xl md:text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                          {status.count}
                        </p>
                        <p className={cn("text-xs md:text-sm", isDark ? "text-slate-400" : "text-gray-600")}>
                          {status.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filters */}
            <div className={cn(
              "rounded-2xl shadow-lg border p-4 md:p-6 mb-8 backdrop-blur-sm animate-fadeIn",
              isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
            )}>
              <div className="flex items-center gap-2 mb-4">
                <Filter className={cn("w-5 h-5", isDark ? "text-slate-400" : "text-gray-600")} />
                <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>Filters</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className={cn("block text-sm font-semibold mb-2", isDark ? "text-slate-300" : "text-gray-700")}>
                    Search Student
                  </label>
                  <div className="relative">
                    <Search className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10",
                      isDark ? "text-slate-500" : "text-gray-400"
                    )} />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Name or email..."
                      className={cn(
                        "w-full pl-12 pr-4 py-3 rounded-lg transition-all outline-none",
                        isDark
                          ? "bg-slate-800 border-2 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500/50"
                          : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className={cn("block text-sm font-semibold mb-2", isDark ? "text-slate-300" : "text-gray-700")}>
                    Lesson
                  </label>
                  <select
                    value={lessonFilter}
                    onChange={(e) => setLessonFilter(e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg transition-all outline-none",
                      isDark
                        ? "bg-slate-800 border-2 border-white/10 text-white focus:border-cyan-500/50"
                        : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
                    )}
                  >
                    <option value="">All Lessons</option>
                    {lessons.map((lesson) => (
                      <option key={lesson.lesson_id} value={lesson.lesson_id}>
                        {lesson.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={cn("block text-sm font-semibold mb-2", isDark ? "text-slate-300" : "text-gray-700")}>
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg transition-all outline-none",
                      isDark
                        ? "bg-slate-800 border-2 border-white/10 text-white focus:border-cyan-500/50"
                        : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
                    )}
                  >
                    <option value="">All Status</option>
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className={cn("block text-sm font-semibold mb-2", isDark ? "text-slate-300" : "text-gray-700")}>
                    Student
                  </label>
                  <select
                    value={studentFilter}
                    onChange={(e) => setStudentFilter(e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg transition-all outline-none",
                      isDark
                        ? "bg-slate-800 border-2 border-white/10 text-white focus:border-cyan-500/50"
                        : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
                    )}
                  >
                    <option value="">All Students</option>
                    {students.map((student) => (
                      <option key={student.student_id} value={student.student_id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleFilter}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm md:text-base flex items-center justify-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Apply Filters
                </button>
                <button
                  onClick={handleReset}
                  className={cn(
                    "px-6 py-3 rounded-xl transition-all font-semibold border-2 text-sm md:text-base flex items-center justify-center gap-2",
                    isDark 
                      ? "bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700" 
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>

            {/* Progress Records */}
            <div className="space-y-4">
              {progress.data.length === 0 ? (
                <div className={cn(
                  "text-center py-12 md:py-16 rounded-2xl shadow-lg border animate-fadeIn",
                  isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                )}>
                  <BarChart3 className={cn(
                    "w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4",
                    isDark ? "text-slate-600" : "text-gray-400"
                  )} />
                  <p className={cn("text-base md:text-lg", isDark ? "text-slate-400" : "text-gray-500")}>
                    No progress records found
                  </p>
                </div>
              ) : (
                <>
                  {progress.data.map((item) => (
                    <ProgressCard
                      key={item.progress_id}
                      item={item}
                      isDark={isDark}
                      getStatusConfig={getStatusConfig}
                      getProgressColor={getProgressColor}
                    />
                  ))}

                  {/* Pagination */}
                  <div className={cn(
                    "rounded-2xl shadow-lg border px-4 md:px-6 py-4 backdrop-blur-sm",
                    isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                  )}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className={cn("text-sm font-medium text-center sm:text-left", isDark ? "text-slate-300" : "text-gray-700")}>
                        Showing {progress.from} to {progress.to} of {progress.total} results
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {progress.links.map((link, index) => (
                          <Link
                            key={index}
                            href={link.url || '#'}
                            className={cn(
                              "px-4 py-2 rounded-lg font-medium transition-all",
                              link.active
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                : link.url
                                ? isDark 
                                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                : 'bg-transparent text-gray-400 cursor-not-allowed'
                            )}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

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

// Stat Card Component
function StatCard({ icon: Icon, title, value, description, color, isDark }) {
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
            {title}
          </p>
          <p className={cn("text-2xl md:text-3xl font-bold mb-2", isDark ? "text-white" : "text-gray-900")}>
            {value}
          </p>
          <p className={cn("text-xs truncate", isDark ? "text-slate-500" : "text-gray-500")}>
            {description}
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

// Progress Card Component
function ProgressCard({ item, isDark, getStatusConfig, getProgressColor }) {
  const statusConfig = getStatusConfig(item.status);
  const progressGradient = getProgressColor(item.progress_percent);

  return (
    <div className={cn(
      "rounded-2xl shadow-lg border backdrop-blur-sm overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 animate-fadeIn",
      isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
    )}>
      <div className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          {/* Student Info */}
          <div className="flex items-start gap-3 lg:w-1/4">
            <div className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0",
              isDark ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/50" : "bg-gradient-to-br from-purple-100 to-pink-100"
            )}>
              <User className={cn("w-5 h-5 md:w-6 md:h-6", isDark ? "text-purple-300" : "text-purple-600")} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={cn("font-bold text-sm md:text-base truncate", isDark ? "text-white" : "text-gray-900")}>
                {item.student?.user?.name || 'Unknown'}
              </h3>
              <p className={cn("text-xs md:text-sm truncate", isDark ? "text-slate-400" : "text-gray-500")}>
                {item.student?.user?.email || 'N/A'}
              </p>
            </div>
          </div>

          {/* Lesson Info */}
          <div className="lg:w-1/5">
            <p className={cn("text-xs font-medium mb-1", isDark ? "text-slate-400" : "text-gray-500")}>
              Lesson
            </p>
            <p className={cn("font-semibold text-sm md:text-base truncate", isDark ? "text-white" : "text-gray-900")}>
              {item.lesson?.title || 'N/A'}
            </p>
          </div>

          {/* Progress */}
          <div className="lg:w-1/5">
            <p className={cn("text-xs font-medium mb-2", isDark ? "text-slate-400" : "text-gray-500")}>
              Progress
            </p>
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex-1 h-2 rounded-full overflow-hidden",
                isDark ? "bg-slate-700" : "bg-gray-200"
              )}>
                <div
                  className={`h-full bg-gradient-to-r ${progressGradient} transition-all duration-500`}
                  style={{ width: `${item.progress_percent}%` }}
                />
              </div>
              <span className={cn("text-sm font-bold min-w-[45px] text-right", isDark ? "text-white" : "text-gray-900")}>
                {item.progress_percent}%
              </span>
            </div>
          </div>

          {/* Status & Date */}
          <div className="lg:w-1/5 space-y-2">
            <span className={cn(
              "px-2 md:px-3 py-1 md:py-1.5 text-xs font-semibold rounded-lg border inline-flex items-center gap-1.5",
              statusConfig.bg
            )}>
              {statusConfig.icon}
              {statusConfig.label}
            </span>
            <p className={cn("text-xs", isDark ? "text-slate-500" : "text-gray-500")}>
              {new Date(item.last_updated_at).toLocaleDateString()}
            </p>
          </div>

          {/* Actions */}
          <div className="lg:w-auto flex gap-2">
            <Link
              href={route('admin.progress.show', item.progress_id)}
              className="flex-1 lg:flex-none px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Details
            </Link>
            <Link
              href={route('admin.progress.student', item.student_id)}
              className={cn(
                "flex-1 lg:flex-none px-4 py-2.5 text-sm font-semibold rounded-lg transition-all border-2 flex items-center justify-center gap-2",
                isDark 
                  ? "bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700" 
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              )}
            >
              <User className="w-4 h-4" />
              All
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}