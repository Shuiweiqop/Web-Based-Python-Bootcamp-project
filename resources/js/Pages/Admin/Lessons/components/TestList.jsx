// resources/js/Pages/Admin/Lessons/components/TestList.jsx
import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { 
  GraduationCap,
  Plus,
  Clock,
  BarChart3,
  CheckCircle2,
  XCircle,
  Eye,
  Pencil,
  Trash2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Shuffle,
  Zap,
  EyeIcon,
  TrendingUp,
  Target,
  Loader2,
} from 'lucide-react';
import { safeRoute } from '@/utils/routeHelpers';
import { getStatusBadge } from './BadgeHelpers';
import { cn } from '@/utils/cn';

export default function TestList({ tests, lessonId, createRoute, isDark = true }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [deletingId, setDeletingId] = useState(null);

  // 过滤测验
  const getFilteredTests = () => {
    if (!tests || tests.length === 0) return [];

    let filtered = [...tests];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(test => test.status === filterStatus);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'questions':
          return (b.questions_count || 0) - (a.questions_count || 0);
        case 'created':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return filtered;
  };

  const filteredTests = getFilteredTests();

  // 统计信息
  const stats = {
    total: tests?.length || 0,
    active: tests?.filter(t => t.status === 'active').length || 0,
    inactive: tests?.filter(t => t.status === 'inactive').length || 0,
    draft: tests?.filter(t => t.status === 'draft').length || 0,
    totalQuestions: tests?.reduce((sum, t) => sum + (t.questions_count || 0), 0) || 0,
  };

  // 删除测验
  const handleDelete = (testId, testTitle) => {
    if (!confirm(`Are you sure you want to delete "${testTitle}"?\n\nThis will also delete all questions and student submissions.`)) {
      return;
    }

    setDeletingId(testId);

    router.delete(safeRoute('admin.lessons.tests.destroy', [lessonId, testId]), {
      preserveScroll: true,
      onSuccess: () => {
        console.log('Test deleted successfully');
        setDeletingId(null);
      },
      onError: (errors) => {
        console.error('Delete failed:', errors);
        alert('Failed to delete test. Check console for details.');
        setDeletingId(null);
      },
    });
  };

  // 获取测验难度颜色
  const getDifficultyColor = (difficulty) => {
    if (isDark) {
      const colors = {
        easy: 'bg-green-500/20 text-green-300 border-green-500/30',
        medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        hard: 'bg-red-500/20 text-red-300 border-red-500/30',
      };
      return colors[difficulty] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    } else {
      const colors = {
        easy: 'bg-green-100 text-green-700 border-green-200',
        medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        hard: 'bg-red-100 text-red-700 border-red-200',
      };
      return colors[difficulty] || 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className={cn(
      "rounded-2xl shadow-lg border backdrop-blur-sm overflow-hidden animate-fadeIn card-hover-effect",
      isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
    )}>
      {/* Header */}
      <div className={cn(
        "px-6 py-4 border-b bg-gradient-to-r animated-gradient",
        isDark 
          ? "border-white/10 from-green-500/10 to-emerald-500/10" 
          : "border-gray-200 from-green-50 to-emerald-50"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shadow-lg",
              isDark 
                ? "bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/50 shadow-green-500/20" 
                : "bg-gradient-to-br from-green-100 to-emerald-100 shadow-green-500/10"
            )}>
              <GraduationCap className={cn("w-5 h-5", isDark ? "text-emerald-400" : "text-green-600")} />
            </div>
            <div>
              <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                Tests ({filteredTests.length}{filterStatus !== 'all' ? ` of ${stats.total}` : ''})
              </h3>
            </div>
            
            {/* Collapse/Expand Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "ml-3 p-2 rounded-lg transition-all ripple-effect button-press-effect",
                isDark 
                  ? "hover:bg-white/10 text-slate-400 hover:text-white" 
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
              )}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <Link 
            href={createRoute} 
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ripple-effect button-press-effect hover-lift shadow-lg",
              isDark
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-green-500/30"
                : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-green-500/20"
            )}
          >
            <Plus className="w-4 h-4" />
            Add Test
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      {isExpanded && stats.total > 0 && (
        <div className={cn(
          "px-6 py-3 border-b bg-gradient-to-r",
          isDark 
            ? "border-white/10 from-slate-800/50 to-slate-900/50" 
            : "border-gray-200 from-green-50 to-white"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  isDark ? "bg-green-500/20" : "bg-green-100"
                )}>
                  <GraduationCap className={cn("w-4 h-4", isDark ? "text-green-400" : "text-green-600")} />
                </div>
                <div>
                  <span className={cn("font-bold", isDark ? "text-white" : "text-gray-900")}>
                    {stats.total}
                  </span>
                  <span className={cn("ml-1", isDark ? "text-slate-400" : "text-gray-500")}>
                    total
                  </span>
                </div>
              </div>
              
              <div className={cn("h-8 w-px", isDark ? "bg-white/10" : "bg-gray-200")} />
              
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  isDark ? "bg-emerald-500/20" : "bg-emerald-100"
                )}>
                  <CheckCircle2 className={cn("w-4 h-4", isDark ? "text-emerald-400" : "text-emerald-600")} />
                </div>
                <div>
                  <span className={cn("font-bold", isDark ? "text-white" : "text-gray-900")}>
                    {stats.active}
                  </span>
                  <span className={cn("ml-1", isDark ? "text-slate-400" : "text-gray-500")}>
                    active
                  </span>
                </div>
              </div>
              
              <div className={cn("h-8 w-px", isDark ? "bg-white/10" : "bg-gray-200")} />
              
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  isDark ? "bg-blue-500/20" : "bg-blue-100"
                )}>
                  <HelpCircle className={cn("w-4 h-4", isDark ? "text-blue-400" : "text-blue-600")} />
                </div>
                <div>
                  <span className={cn("font-bold", isDark ? "text-white" : "text-gray-900")}>
                    {stats.totalQuestions}
                  </span>
                  <span className={cn("ml-1", isDark ? "text-slate-400" : "text-gray-500")}>
                    questions
                  </span>
                </div>
              </div>
            </div>

            {/* Filters & Sort */}
            <div className="flex items-center gap-2">
              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={cn(
                  "text-xs border rounded-lg px-3 py-1.5 font-medium transition-all ripple-effect",
                  isDark
                    ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={cn(
                  "text-xs border rounded-lg px-3 py-1.5 font-medium transition-all ripple-effect",
                  isDark
                    ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
              >
                <option value="created">Latest First</option>
                <option value="title">Title A-Z</option>
                <option value="questions">Most Questions</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {isExpanded && (
        <div className="p-6">
          {filteredTests && filteredTests.length > 0 ? (
            <div className="space-y-3">
              {filteredTests.map((test) => {
                const testId = test.test_id ?? test.id;
                const isDeleting = deletingId === testId;
                
                return (
                  <TestCard
                    key={testId}
                    test={test}
                    testId={testId}
                    lessonId={lessonId}
                    isDeleting={isDeleting}
                    onDelete={handleDelete}
                    getDifficultyColor={getDifficultyColor}
                    isDark={isDark}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState 
              filterStatus={filterStatus}
              createRoute={createRoute}
              totalTests={stats.total}
              isDark={isDark}
            />
          )}
        </div>
      )}

      {/* Collapsed State */}
      {!isExpanded && (
        <div className={cn(
          "px-6 py-4 text-center text-sm border-t",
          isDark 
            ? "bg-slate-800/30 text-slate-400 border-white/10" 
            : "bg-gray-50 text-gray-500 border-gray-200"
        )}>
          <p>{stats.total} test{stats.total !== 1 ? 's' : ''} - Click ▼ to expand</p>
        </div>
      )}

      <style jsx>{`
        .ripple-effect {
          position: relative;
          overflow: hidden;
        }
        
        .ripple-effect:active::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0);
          animation: ripple 0.6s ease-out;
        }
        
        @keyframes ripple {
          to {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        
        .button-press-effect:active {
          transform: scale(0.95);
        }
        
        .hover-lift {
          transition: transform 0.2s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        
        .card-hover-effect {
          transition: all 0.3s ease;
        }
        
        .card-hover-effect:hover {
          transform: translateY(-2px);
        }
        
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
        
        .animated-gradient {
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }
        
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
}

// Test Card Component
function TestCard({ test, testId, lessonId, isDeleting, onDelete, getDifficultyColor, isDark }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className={cn(
        "border rounded-xl p-4 transition-all relative group card-hover-effect",
        isDark 
          ? "bg-gradient-to-r from-slate-800/30 to-slate-900/30 border-white/10 hover:from-slate-800/50 hover:to-slate-900/50" 
          : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between">
        {/* Left: Test Info */}
        <div className="flex-1">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shadow-lg",
                isDark 
                  ? "bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/50" 
                  : "bg-gradient-to-br from-green-100 to-emerald-100"
              )}>
                <GraduationCap className={cn("w-6 h-6", isDark ? "text-emerald-400" : "text-green-600")} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className={cn(
                "font-bold mb-1 text-base",
                isDark ? "text-white" : "text-gray-900"
              )}>
                {test.title}
              </h4>
              
              {test.description && (
                <p className={cn(
                  "text-sm mb-2 line-clamp-2",
                  isDark ? "text-slate-400" : "text-gray-600"
                )}>
                  {test.description}
                </p>
              )}

              {/* Test Meta */}
              <div className="flex items-center gap-3 flex-wrap text-xs">
                {/* Questions Count */}
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "w-6 h-6 rounded flex items-center justify-center",
                    isDark ? "bg-blue-500/20" : "bg-blue-100"
                  )}>
                    <HelpCircle className={cn("w-3.5 h-3.5", isDark ? "text-blue-400" : "text-blue-600")} />
                  </div>
                  <span className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                    {test.questions_count || 0}
                  </span>
                  <span className={cn(isDark ? "text-slate-400" : "text-gray-600")}>
                    question{(test.questions_count || 0) !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Time Limit */}
                {test.time_limit && (
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-6 h-6 rounded flex items-center justify-center",
                      isDark ? "bg-orange-500/20" : "bg-orange-100"
                    )}>
                      <Clock className={cn("w-3.5 h-3.5", isDark ? "text-orange-400" : "text-orange-600")} />
                    </div>
                    <span className={cn(isDark ? "text-slate-300" : "text-gray-700")}>
                      {test.time_limit} min
                    </span>
                  </div>
                )}

                {/* Passing Score */}
                {test.passing_score && (
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-6 h-6 rounded flex items-center justify-center",
                      isDark ? "bg-purple-500/20" : "bg-purple-100"
                    )}>
                      <Target className={cn("w-3.5 h-3.5", isDark ? "text-purple-400" : "text-purple-600")} />
                    </div>
                    <span className={cn(isDark ? "text-slate-300" : "text-gray-700")}>
                      {test.passing_score}% to pass
                    </span>
                  </div>
                )}

                {/* Max Attempts */}
                {test.max_attempts && (
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-6 h-6 rounded flex items-center justify-center",
                      isDark ? "bg-cyan-500/20" : "bg-cyan-100"
                    )}>
                      <TrendingUp className={cn("w-3.5 h-3.5", isDark ? "text-cyan-400" : "text-cyan-600")} />
                    </div>
                    <span className={cn(isDark ? "text-slate-300" : "text-gray-700")}>
                      {test.max_attempts} attempt{test.max_attempts !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {/* Difficulty */}
                {test.difficulty_level && (
                  <span className={cn(
                    "inline-flex items-center px-2 py-1 rounded text-xs font-semibold border",
                    getDifficultyColor(test.difficulty_level)
                  )}>
                    {test.difficulty_level}
                  </span>
                )}
              </div>

              {/* Features */}
              {(test.shuffle_questions || test.show_results_immediately || test.allow_review) && (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  {test.shuffle_questions && (
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 text-xs rounded border font-medium",
                      isDark 
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30" 
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    )}>
                      <Shuffle className="w-3 h-3" />
                      Shuffle
                    </span>
                  )}
                  {test.show_results_immediately && (
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 text-xs rounded border font-medium",
                      isDark 
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
                        : "bg-green-50 text-green-700 border-green-200"
                    )}>
                      <Zap className="w-3 h-3" />
                      Instant Results
                    </span>
                  )}
                  {test.allow_review && (
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 text-xs rounded border font-medium",
                      isDark 
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/30" 
                        : "bg-purple-50 text-purple-700 border-purple-200"
                    )}>
                      <EyeIcon className="w-3 h-3" />
                      Review Allowed
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right: Status & Actions */}
        <div className="flex items-start space-x-3 ml-4">
          {/* Status Badge */}
          <div className="flex-shrink-0">
            {getStatusBadge(test.status)}
          </div>

          {/* Actions */}
          <div className={cn(
            "flex items-center space-x-2 transition-opacity",
            showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}>
            {/* View */}
            <Link 
              href={safeRoute('admin.lessons.tests.show', [lessonId, testId])} 
              className={cn(
                "p-2 rounded-lg transition-all ripple-effect button-press-effect",
                isDark
                  ? "text-blue-400 hover:bg-blue-500/20"
                  : "text-blue-600 hover:bg-blue-50"
              )}
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </Link>

            {/* Edit */}
            <Link 
              href={safeRoute('admin.lessons.tests.edit', [lessonId, testId])} 
              className={cn(
                "p-2 rounded-lg transition-all ripple-effect button-press-effect",
                isDark
                  ? "text-slate-400 hover:bg-white/10"
                  : "text-gray-600 hover:bg-gray-100"
              )}
              title="Edit test"
            >
              <Pencil className="w-4 h-4" />
            </Link>

            {/* Delete */}
            <button
              onClick={() => onDelete(testId, test.title)}
              disabled={isDeleting}
              className={cn(
                "p-2 rounded-lg transition-all ripple-effect button-press-effect disabled:opacity-50 disabled:cursor-not-allowed",
                isDark
                  ? "text-red-400 hover:bg-red-500/20"
                  : "text-red-600 hover:bg-red-50"
              )}
              title="Delete test"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer: Created Date */}
      {test.created_at && (
        <div className={cn(
          "mt-3 pt-3 border-t text-xs",
          isDark 
            ? "border-white/10 text-slate-500" 
            : "border-gray-200 text-gray-500"
        )}>
          Created {new Date(test.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      )}
    </div>
  );
}

// Empty State Component
function EmptyState({ filterStatus, createRoute, totalTests, isDark }) {
  if (filterStatus !== 'all' && totalTests > 0) {
    return (
      <div className="text-center py-12 animate-fadeIn">
        <div className={cn(
          "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
          isDark ? "bg-slate-800/50" : "bg-gray-100"
        )}>
          <Filter className={cn("w-8 h-8", isDark ? "text-slate-600" : "text-gray-400")} />
        </div>
        <p className={cn("mb-2 font-medium", isDark ? "text-slate-400" : "text-gray-600")}>
          No tests match the current filter
        </p>
        <p className={cn("text-sm", isDark ? "text-slate-600" : "text-gray-400")}>
          Try changing the filter or create a new test
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12 animate-fadeIn">
      <div className={cn(
        "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
        isDark 
          ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20" 
          : "bg-gradient-to-br from-green-100 to-emerald-100"
      )}>
        <GraduationCap className={cn("w-8 h-8", isDark ? "text-green-400" : "text-green-600")} />
      </div>
      <p className={cn("mb-2 font-bold", isDark ? "text-slate-300" : "text-gray-700")}>
        No tests created yet
      </p>
      <p className={cn("text-sm mb-4", isDark ? "text-slate-500" : "text-gray-500")}>
        Create tests to assess student understanding of this lesson
      </p>
      <Link 
        href={createRoute} 
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ripple-effect button-press-effect hover-lift shadow-lg",
          isDark
            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-green-500/30"
            : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-green-500/20"
        )}
      >
        <Plus className="w-4 h-4" />
        Create your first test
      </Link>
    </div>
  );
}