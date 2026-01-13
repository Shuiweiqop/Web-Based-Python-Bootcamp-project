// resources/js/Pages/Admin/Lessons/components/LessonCard.jsx
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { 
  Clock, 
  Video, 
  User,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Star,
  BookOpen,
  Target,
} from 'lucide-react';
import { safeRoute } from '@/utils/routeHelpers';
import { cn } from '@/utils/cn';

export default function LessonCard({ lesson, isSelected, onSelect, onDelete, isDark = true }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleting(true);
    setShowDeleteConfirm(false);
    onDelete(lesson.lesson_id, lesson.title);
  };

  // Calculate completion percentage
  const getCompletionStatus = () => {
    const hasContent = !!lesson.content;
    const hasVideo = !!lesson.video_url;
    const hasExercises = (lesson.exercises_count || 0) > 0;
    const hasTests = (lesson.tests_count || 0) > 0;

    const completed = [hasContent, hasVideo, hasExercises, hasTests].filter(Boolean).length;
    const total = 4;

    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const completionStatus = getCompletionStatus();

  // Get difficulty config
  const getDifficultyConfig = () => {
    const configs = {
      beginner: { label: '🟢 Beginner', color: isDark ? 'from-green-500/30 to-emerald-500/30' : 'from-green-100 to-emerald-100', text: isDark ? 'text-green-300' : 'text-green-700' },
      intermediate: { label: '🟡 Intermediate', color: isDark ? 'from-yellow-500/30 to-amber-500/30' : 'from-yellow-100 to-amber-100', text: isDark ? 'text-yellow-300' : 'text-yellow-700' },
      advanced: { label: '🔴 Advanced', color: isDark ? 'from-red-500/30 to-rose-500/30' : 'from-red-100 to-rose-100', text: isDark ? 'text-red-300' : 'text-red-700' },
    };
    return configs[lesson.difficulty] || configs.beginner;
  };

  // Get status config
  const getStatusConfig = () => {
    const configs = {
      active: { label: '✅ Active', color: isDark ? 'from-green-500/20 to-emerald-500/20' : 'from-green-100 to-emerald-100', text: isDark ? 'text-green-300' : 'text-green-700', border: isDark ? 'border-green-500/30' : 'border-green-300' },
      draft: { label: '📝 Draft', color: isDark ? 'from-yellow-500/20 to-amber-500/20' : 'from-yellow-100 to-amber-100', text: isDark ? 'text-yellow-300' : 'text-yellow-700', border: isDark ? 'border-yellow-500/30' : 'border-yellow-300' },
      inactive: { label: '⏸️ Inactive', color: isDark ? 'from-gray-500/20 to-slate-500/20' : 'from-gray-100 to-slate-100', text: isDark ? 'text-gray-400' : 'text-gray-600', border: isDark ? 'border-gray-500/30' : 'border-gray-300' },
    };
    return configs[lesson.status] || configs.draft;
  };

  const difficultyConfig = getDifficultyConfig();
  const statusConfig = getStatusConfig();

  return (
    <>
      <div className={cn(
        "rounded-2xl shadow-lg border backdrop-blur-sm transition-all card-hover-effect animate-fadeIn",
        isSelected
          ? isDark 
            ? "bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border-purple-500/50 ring-2 ring-purple-400/50 shadow-purple-500/20 animate-glowPulse"
            : "bg-gradient-to-br from-purple-100 to-cyan-100 border-purple-400 ring-2 ring-purple-300 shadow-purple-500/20"
          : isDark
            ? "bg-slate-900/50 border-white/10 hover:border-purple-500/30"
            : "bg-white border-gray-200 hover:border-purple-300"
      )}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className={cn(
                "mt-1.5 rounded cursor-pointer transition-all",
                isDark
                  ? "border-purple-400/50 bg-white/5 text-purple-500 focus:ring-purple-500"
                  : "border-gray-300 text-purple-600 focus:ring-purple-500"
              )}
            />

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="mb-4">
                <h3 className={cn(
                  "text-xl font-bold mb-2 truncate",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  {lesson.title}
                </h3>
                {lesson.content && (
                  <p className={cn(
                    "text-sm line-clamp-2",
                    isDark ? "text-slate-300" : "text-gray-600"
                  )}>
                    {lesson.content.substring(0, 200)}
                    {lesson.content.length > 200 && '...'}
                  </p>
                )}
              </div>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {/* Difficulty */}
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg",
                  `bg-gradient-to-r ${difficultyConfig.color} ${difficultyConfig.text}`
                )}>
                  <Target className="w-3.5 h-3.5" />
                  {difficultyConfig.label}
                </span>

                {/* Status */}
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-lg",
                  `bg-gradient-to-r ${statusConfig.color} ${statusConfig.text} ${statusConfig.border}`
                )}>
                  {statusConfig.label}
                </span>
                
                {/* Duration */}
                {lesson.estimated_duration && (
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg",
                    isDark
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                  )}>
                    <Clock className="w-3.5 h-3.5" />
                    {lesson.estimated_duration} min
                  </span>
                )}
                
                {/* Video */}
                {lesson.video_url && (
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg",
                    isDark
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-purple-100 text-purple-700 border border-purple-200"
                  )}>
                    <Video className="w-3.5 h-3.5" />
                    Video
                  </span>
                )}
                
                {/* Reward Points */}
                {lesson.completion_reward_points > 0 && (
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg",
                    isDark
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                  )}>
                    <Star className="w-3.5 h-3.5" />
                    {lesson.completion_reward_points} pts
                  </span>
                )}
              </div>

              {/* Completion Progress */}
              <div className={cn(
                "mb-4 pb-4 border-b",
                isDark ? "border-white/10" : "border-gray-200"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-xs font-semibold",
                    isDark ? "text-slate-300" : "text-gray-600"
                  )}>
                    Content Completion
                  </span>
                  <span className={cn(
                    "text-xs font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {completionStatus.percentage}%
                  </span>
                </div>
                <div className={cn(
                  "w-full rounded-full h-2.5 overflow-hidden",
                  isDark ? "bg-slate-700" : "bg-gray-200"
                )}>
                  <div
                    className={cn(
                      "h-2.5 rounded-full transition-all duration-500",
                      completionStatus.percentage >= 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      completionStatus.percentage >= 75 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                      completionStatus.percentage >= 50 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                      'bg-gradient-to-r from-red-500 to-rose-500'
                    )}
                    style={{ width: `${completionStatus.percentage}%` }}
                  />
                </div>
                <div className="flex items-center gap-3 mt-2">
                  {lesson.content && <CheckCircle className={cn("w-4 h-4", isDark ? "text-green-400" : "text-green-600")} />}
                  {!lesson.content && <div className="w-4 h-4" />}
                  
                  {lesson.video_url && <CheckCircle className={cn("w-4 h-4", isDark ? "text-green-400" : "text-green-600")} />}
                  {!lesson.video_url && <div className="w-4 h-4" />}
                  
                  {(lesson.exercises_count || 0) > 0 && <CheckCircle className={cn("w-4 h-4", isDark ? "text-green-400" : "text-green-600")} />}
                  {(lesson.exercises_count || 0) === 0 && <div className="w-4 h-4" />}
                  
                  {(lesson.tests_count || 0) > 0 && <CheckCircle className={cn("w-4 h-4", isDark ? "text-green-400" : "text-green-600")} />}
                  {(lesson.tests_count || 0) === 0 && <div className="w-4 h-4" />}
                </div>
              </div>

              {/* Meta Information */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* Exercises */}
                <div className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg",
                  isDark ? "bg-blue-500/10" : "bg-blue-50"
                )}>
                  <BookOpen className={cn("w-4 h-4", isDark ? "text-blue-400" : "text-blue-600")} />
                  <span className={isDark ? "text-white" : "text-gray-900"}>
                    <span className="font-bold">{lesson.exercises_count || 0}</span>
                    <span className={cn("ml-1", isDark ? "text-slate-400" : "text-gray-600")}>
                      exercise{(lesson.exercises_count || 0) !== 1 ? 's' : ''}
                    </span>
                  </span>
                </div>

                {/* Tests */}
                <div className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg",
                  isDark ? "bg-purple-500/10" : "bg-purple-50"
                )}>
                  <span className="text-base">📝</span>
                  <span className={isDark ? "text-white" : "text-gray-900"}>
                    <span className="font-bold">{lesson.tests_count || 0}</span>
                    <span className={cn("ml-1", isDark ? "text-slate-400" : "text-gray-600")}>
                      test{(lesson.tests_count || 0) !== 1 ? 's' : ''}
                    </span>
                  </span>
                </div>

                {/* Students */}
                <div className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg",
                  isDark ? "bg-green-500/10" : "bg-green-50"
                )}>
                  <span className="text-base">👥</span>
                  <span className={isDark ? "text-white" : "text-gray-900"}>
                    <span className="font-bold">{lesson.registrations_count || 0}</span>
                    <span className={cn("ml-1", isDark ? "text-slate-400" : "text-gray-600")}>
                      student{(lesson.registrations_count || 0) !== 1 ? 's' : ''}
                    </span>
                  </span>
                </div>

                {/* Creator */}
                {lesson.creator?.name && (
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg truncate",
                    isDark ? "bg-slate-700/50" : "bg-gray-50"
                  )}>
                    <User className={cn("w-4 h-4 flex-shrink-0", isDark ? "text-slate-400" : "text-gray-400")} />
                    <span className={cn("truncate text-xs", isDark ? "text-slate-300" : "text-gray-600")} title={lesson.creator.name}>
                      {lesson.creator.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Column */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* View */}
              <Link
                href={safeRoute('admin.lessons.show', lesson.lesson_id)}
                className={cn(
                  "p-2 rounded-lg transition-all ripple-effect button-press-effect hover-lift",
                  isDark
                    ? "text-cyan-400 hover:bg-cyan-500/10"
                    : "text-blue-600 hover:bg-blue-50"
                )}
                title="View lesson details"
              >
                <Eye className="w-5 h-5" />
              </Link>

              {/* Edit */}
              <Link
                href={safeRoute('admin.lessons.edit', lesson.lesson_id)}
                className={cn(
                  "p-2 rounded-lg transition-all ripple-effect button-press-effect hover-lift",
                  isDark
                    ? "text-slate-400 hover:text-white hover:bg-white/10"
                    : "text-gray-600 hover:bg-gray-100"
                )}
                title="Edit lesson"
              >
                <Edit className="w-5 h-5" />
              </Link>

              {/* Delete */}
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className={cn(
                  "p-2 rounded-lg transition-all ripple-effect button-press-effect hover-lift disabled:opacity-50 disabled:cursor-not-allowed",
                  isDark
                    ? "text-red-400 hover:bg-red-500/10"
                    : "text-red-600 hover:bg-red-50"
                )}
                title="Delete lesson"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className={cn(
            "rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn",
            isDark ? "bg-slate-900 border border-white/10" : "bg-white"
          )}>
            {/* Header */}
            <div className={cn(
              "px-6 py-4 border-b bg-gradient-to-r",
              isDark
                ? "border-white/10 from-red-500/20 to-orange-500/20"
                : "border-red-200 from-red-50 to-orange-50"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  isDark
                    ? "bg-red-500/20 border border-red-500/30"
                    : "bg-red-100"
                )}>
                  <AlertTriangle className={cn("w-6 h-6", isDark ? "text-red-400" : "text-red-600")} />
                </div>
                <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>
                  Delete Lesson
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className={cn("mb-2", isDark ? "text-slate-300" : "text-gray-700")}>
                Are you sure you want to delete <strong className={isDark ? "text-white" : "text-gray-900"}>{lesson.title}</strong>?
              </p>
              
              <div className={cn(
                "rounded-xl p-4 mt-4 mb-4 border",
                isDark
                  ? "bg-red-500/10 border-red-500/30"
                  : "bg-red-50 border-red-200"
              )}>
                <p className={cn("text-sm font-semibold mb-2", isDark ? "text-red-300" : "text-red-800")}>
                  This action will permanently delete:
                </p>
                <ul className={cn("text-sm space-y-1 ml-4 list-disc", isDark ? "text-red-400" : "text-red-700")}>
                  <li>The lesson content and materials</li>
                  <li>All {lesson.exercises_count || 0} exercise(s)</li>
                  <li>All {lesson.tests_count || 0} test(s) and questions</li>
                  <li>All {lesson.registrations_count || 0} student registration(s)</li>
                  <li>All student progress and submissions</li>
                </ul>
              </div>

              <p className={cn("text-xs", isDark ? "text-slate-500" : "text-gray-500")}>
                This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className={cn(
              "px-6 py-4 border-t flex items-center justify-end gap-3",
              isDark ? "bg-slate-800/50 border-white/10" : "bg-gray-50 border-gray-200"
            )}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all ripple-effect button-press-effect",
                  isDark
                    ? "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                    : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                )}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-red-500/50 ripple-effect button-press-effect"
              >
                Delete Lesson
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}