// resources/js/Pages/Admin/Lessons/components/ExerciseList.jsx
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { 
  Code2,
  Plus,
  Clock,
  Award,
  Zap,
  TestTube2,
  Eye,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { safeRoute } from '@/utils/routeHelpers';
import { getStatusBadge, getExerciseTypeBadge } from './BadgeHelpers';
import { cn } from '@/utils/cn';

export default function ExerciseList({ exercises, lessonId, createRoute, isDark = true }) {
  const [isExpanded, setIsExpanded] = useState(true);

  // 统计信息
  const stats = {
    total: exercises?.length || 0,
    liveEditor: exercises?.filter(e => e.enable_live_editor).length || 0,
    totalPoints: exercises?.reduce((sum, e) => sum + (e.points ?? e.max_score ?? 0), 0) || 0,
    totalTests: exercises?.reduce((sum, e) => {
      if (e.enable_live_editor && e.test_cases && Array.isArray(e.test_cases)) {
        return sum + e.test_cases.length;
      }
      return sum;
    }, 0) || 0,
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
          ? "border-white/10 from-purple-500/10 to-pink-500/10" 
          : "border-gray-200 from-purple-50 to-pink-50"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shadow-lg",
              isDark 
                ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/50 shadow-purple-500/20" 
                : "bg-gradient-to-br from-purple-100 to-pink-100 shadow-purple-500/10"
            )}>
              <Code2 className={cn("w-5 h-5", isDark ? "text-pink-400" : "text-purple-600")} />
            </div>
            <div>
              <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                Exercises ({stats.total})
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
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-purple-500/30"
                : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-purple-500/20"
            )}
          >
            <Plus className="w-4 h-4" />
            Add Exercise
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      {isExpanded && stats.total > 0 && (
        <div className={cn(
          "px-6 py-3 border-b bg-gradient-to-r",
          isDark 
            ? "border-white/10 from-slate-800/50 to-slate-900/50" 
            : "border-gray-200 from-purple-50 to-white"
        )}>
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isDark ? "bg-purple-500/20" : "bg-purple-100"
              )}>
                <Code2 className={cn("w-4 h-4", isDark ? "text-purple-400" : "text-purple-600")} />
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
            
            {stats.liveEditor > 0 && (
              <>
                <div className={cn("h-8 w-px", isDark ? "bg-white/10" : "bg-gray-200")} />
                
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    isDark ? "bg-pink-500/20" : "bg-pink-100"
                  )}>
                    <Sparkles className={cn("w-4 h-4", isDark ? "text-pink-400" : "text-pink-600")} />
                  </div>
                  <div>
                    <span className={cn("font-bold", isDark ? "text-white" : "text-gray-900")}>
                      {stats.liveEditor}
                    </span>
                    <span className={cn("ml-1", isDark ? "text-slate-400" : "text-gray-500")}>
                      live editor
                    </span>
                  </div>
                </div>
              </>
            )}
            
            <div className={cn("h-8 w-px", isDark ? "bg-white/10" : "bg-gray-200")} />
            
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isDark ? "bg-yellow-500/20" : "bg-yellow-100"
              )}>
                <Award className={cn("w-4 h-4", isDark ? "text-yellow-400" : "text-yellow-600")} />
              </div>
              <div>
                <span className={cn("font-bold", isDark ? "text-white" : "text-gray-900")}>
                  {stats.totalPoints}
                </span>
                <span className={cn("ml-1", isDark ? "text-slate-400" : "text-gray-500")}>
                  points
                </span>
              </div>
            </div>
            
            {stats.totalTests > 0 && (
              <>
                <div className={cn("h-8 w-px", isDark ? "bg-white/10" : "bg-gray-200")} />
                
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    isDark ? "bg-emerald-500/20" : "bg-emerald-100"
                  )}>
                    <TestTube2 className={cn("w-4 h-4", isDark ? "text-emerald-400" : "text-emerald-600")} />
                  </div>
                  <div>
                    <span className={cn("font-bold", isDark ? "text-white" : "text-gray-900")}>
                      {stats.totalTests}
                    </span>
                    <span className={cn("ml-1", isDark ? "text-slate-400" : "text-gray-500")}>
                      tests
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {isExpanded && (
        <div className="p-6">
          {exercises && exercises.length > 0 ? (
            <div className="space-y-3">
              {exercises.map((exercise) => {
                const exerciseId = exercise.exercise_id ?? exercise.id;
                return (
                  <ExerciseCard
                    key={exerciseId}
                    exercise={exercise}
                    exerciseId={exerciseId}
                    lessonId={lessonId}
                    isDark={isDark}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState createRoute={createRoute} isDark={isDark} />
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
          <p>{stats.total} exercise{stats.total !== 1 ? 's' : ''} - Click ▼ to expand</p>
        </div>
      )}

      <style>{`
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
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(168, 85, 247, 0.4);
          }
          50% {
            box-shadow: 0 0 20px rgba(236, 72, 153, 0.6);
          }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Exercise Card Component
function ExerciseCard({ exercise, exerciseId, lessonId, isDark }) {
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
        {/* Left: Exercise Info */}
        <div className="flex-1">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shadow-lg relative",
                isDark 
                  ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/50" 
                  : "bg-gradient-to-br from-purple-100 to-pink-100"
              )}>
                <Code2 className={cn("w-6 h-6", isDark ? "text-pink-400" : "text-purple-600")} />
                {exercise.enable_live_editor && (
                  <div className={cn(
                    "absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse-glow",
                    isDark ? "bg-pink-500" : "bg-pink-600"
                  )} />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h4 className={cn(
                  "font-bold text-base",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  {exercise.title}
                </h4>
                
                {exercise.enable_live_editor && (
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full border animate-pulse-glow",
                    isDark
                      ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-pink-300 border-pink-500/50"
                      : "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-300"
                  )}>
                    <Zap className="w-3 h-3" />
                    LIVE EDITOR
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3 flex-wrap text-xs">
                {/* Exercise Type */}
                {getExerciseTypeBadge(exercise.exercise_type ?? exercise.type)}
                
                {/* Points */}
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "w-6 h-6 rounded flex items-center justify-center",
                    isDark ? "bg-yellow-500/20" : "bg-yellow-100"
                  )}>
                    <Award className={cn("w-3.5 h-3.5", isDark ? "text-yellow-400" : "text-yellow-600")} />
                  </div>
                  <span className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                    {exercise.points ?? exercise.max_score ?? 0}
                  </span>
                  <span className={cn(isDark ? "text-slate-400" : "text-gray-600")}>
                    pts
                  </span>
                </div>
                
                {/* Test Cases */}
                {exercise.enable_live_editor && exercise.test_cases && Array.isArray(exercise.test_cases) && (
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-6 h-6 rounded flex items-center justify-center",
                      isDark ? "bg-emerald-500/20" : "bg-emerald-100"
                    )}>
                      <TestTube2 className={cn("w-3.5 h-3.5", isDark ? "text-emerald-400" : "text-emerald-600")} />
                    </div>
                    <span className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                      {exercise.test_cases.length}
                    </span>
                    <span className={cn(isDark ? "text-slate-400" : "text-gray-600")}>
                      test{exercise.test_cases.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                
                {/* Time Limit */}
                {exercise.time_limit_sec && (
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-6 h-6 rounded flex items-center justify-center",
                      isDark ? "bg-orange-500/20" : "bg-orange-100"
                    )}>
                      <Clock className={cn("w-3.5 h-3.5", isDark ? "text-orange-400" : "text-orange-600")} />
                    </div>
                    <span className={cn(isDark ? "text-slate-300" : "text-gray-700")}>
                      {Math.floor(exercise.time_limit_sec / 60)}m
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right: Status & Actions */}
        <div className="flex items-start space-x-3 ml-4">
          {/* Status Badge */}
          {exercise.is_active !== undefined && (
            <div className="flex-shrink-0">
              {getStatusBadge(exercise.is_active ? 'active' : 'inactive')}
            </div>
          )}

          {/* Actions */}
          <div className={cn(
            "flex items-center transition-opacity",
            showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}>
            <Link 
              href={safeRoute('admin.lessons.exercises.show', [lessonId, exerciseId])} 
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ripple-effect button-press-effect hover-lift",
                isDark
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-400 hover:from-blue-500/30 hover:to-cyan-500/30 border border-cyan-500/30"
                  : "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 hover:from-blue-100 hover:to-cyan-100 border border-blue-200"
              )}
            >
              <Eye className="w-4 h-4" />
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ createRoute, isDark }) {
  return (
    <div className="text-center py-12 animate-fadeIn">
      <div className={cn(
        "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
        isDark 
          ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20" 
          : "bg-gradient-to-br from-purple-100 to-pink-100"
      )}>
        <Code2 className={cn("w-8 h-8", isDark ? "text-pink-400" : "text-purple-600")} />
      </div>
      <p className={cn("mb-2 font-bold", isDark ? "text-slate-300" : "text-gray-700")}>
        No exercises created yet
      </p>
      <p className={cn("text-sm mb-4", isDark ? "text-slate-500" : "text-gray-500")}>
        Create coding exercises to help students practice
      </p>
      <Link 
        href={createRoute} 
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ripple-effect button-press-effect hover-lift shadow-lg",
          isDark
            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-purple-500/30"
            : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-purple-500/20"
        )}
      >
        <Plus className="w-4 h-4" />
        Create your first exercise
      </Link>
    </div>
  );
}