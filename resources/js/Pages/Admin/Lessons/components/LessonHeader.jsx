// resources/js/Pages/Admin/Lessons/components/LessonHeader.jsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Pencil, Trash2, Clock, Award, Target } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getStatusBadge, getDifficultyBadge } from './BadgeHelpers';

export default function LessonHeader({ lesson, routes, onDelete, isDark = true }) {
  // Badge style configurations
  const getBadgeStyles = (type, value) => {
    const baseStyles = "inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg border shadow-lg transition-all";
    
    const styles = {
      status: {
        published: isDark
          ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 text-green-400 shadow-green-500/20"
          : "bg-gradient-to-r from-green-100 to-emerald-100 border-green-300 text-green-700 shadow-green-500/10",
        draft: isDark
          ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/50 text-amber-400 shadow-amber-500/20"
          : "bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300 text-amber-700 shadow-amber-500/10",
        default: isDark
          ? "bg-gradient-to-r from-slate-500/20 to-gray-500/20 border-slate-500/50 text-slate-400 shadow-slate-500/20"
          : "bg-gradient-to-r from-slate-100 to-gray-100 border-slate-300 text-slate-700 shadow-slate-500/10"
      },
      difficulty: {
        beginner: isDark
          ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/50 text-cyan-400 shadow-blue-500/20"
          : "bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-300 text-blue-700 shadow-blue-500/10",
        intermediate: isDark
          ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 text-purple-400 shadow-purple-500/20"
          : "bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300 text-purple-700 shadow-purple-500/10",
        advanced: isDark
          ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/50 text-red-400 shadow-red-500/20"
          : "bg-gradient-to-r from-red-100 to-orange-100 border-red-300 text-red-700 shadow-red-500/10"
      },
      duration: isDark
        ? "bg-gradient-to-r from-indigo-500/20 to-blue-500/20 border-indigo-500/50 text-indigo-400 shadow-indigo-500/20"
        : "bg-gradient-to-r from-indigo-100 to-blue-100 border-indigo-300 text-indigo-700 shadow-indigo-500/10",
      reward: isDark
        ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/50 text-amber-400 shadow-amber-500/20"
        : "bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300 text-amber-700 shadow-amber-500/10"
    };

    if (type === 'status') return cn(baseStyles, styles.status[value] || styles.status.default);
    if (type === 'difficulty') return cn(baseStyles, styles.difficulty[value] || styles.difficulty.beginner);
    if (type === 'duration') return cn(baseStyles, styles.duration);
    if (type === 'reward') return cn(baseStyles, styles.reward);
    
    return baseStyles;
  };

  return (
    <div className="mb-6">
      {/* Header Card with Gradient Background */}
      <div className={cn(
        "relative rounded-2xl border overflow-hidden backdrop-blur-xl shadow-xl animate-fadeIn",
        isDark
          ? "bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50 border-purple-500/20"
          : "bg-gradient-to-br from-white via-purple-50/50 to-white border-purple-200/50"
      )}>
        {/* Animated Background Glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className={cn(
            "absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse",
            isDark ? "bg-purple-600" : "bg-purple-300"
          )} />
          <div className={cn(
            "absolute bottom-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000",
            isDark ? "bg-cyan-600" : "bg-cyan-300"
          )} />
        </div>

        <div className="relative p-8">
          <div className="flex justify-between items-start gap-6">
            {/* Left: Content */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h1 className={cn(
                "text-3xl font-bold mb-4",
                isDark ? "text-white" : "text-slate-900"
              )}>
                {lesson?.title ?? 'Untitled Lesson'}
              </h1>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-3">
                {/* Status Badge */}
                {lesson?.status && (
                  <span className={getBadgeStyles('status', lesson.status)}>
                    <div className={cn(
                      "w-2 h-2 rounded-full mr-2 animate-pulse",
                      lesson.status === 'published' ? "bg-green-400" : "bg-amber-400"
                    )} />
                    {lesson.status.charAt(0).toUpperCase() + lesson.status.slice(1)}
                  </span>
                )}

                {/* Difficulty Badge */}
                {lesson?.difficulty && (
                  <span className={getBadgeStyles('difficulty', lesson.difficulty)}>
                    <Target className="w-4 h-4 mr-2" />
                    {lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)}
                  </span>
                )}
                
                {/* Duration Badge */}
                {lesson?.estimated_duration && (
                  <span className={getBadgeStyles('duration')}>
                    <Clock className="w-4 h-4 mr-2" />
                    {lesson.estimated_duration} min
                  </span>
                )}
                
                {/* Reward Points Badge */}
                {lesson?.completion_reward_points > 0 && (
                  <span className={getBadgeStyles('reward')}>
                    <Award className="w-4 h-4 mr-2" />
                    {lesson.completion_reward_points} pts
                  </span>
                )}
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex gap-3 flex-shrink-0">
              {/* Edit Button */}
              <Link 
                href={routes.lesson.edit}
                className={cn(
                  "group relative px-6 py-3 rounded-xl font-semibold flex items-center gap-2 overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl ripple-effect button-press-effect hover-lift",
                  isDark
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-500/50 hover:shadow-blue-500/70"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-blue-500/30 hover:shadow-blue-500/50"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Pencil className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Edit</span>
              </Link>

              {/* Delete Button */}
              <button 
                onClick={onDelete} 
                className={cn(
                  "group relative px-6 py-3 rounded-xl font-semibold flex items-center gap-2 overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl ripple-effect button-press-effect hover-lift",
                  isDark
                    ? "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white shadow-red-500/50 hover:shadow-red-500/70"
                    : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-red-500/30 hover:shadow-red-500/50"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Trash2 className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }
        .animate-pulse {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
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
    </div>
  );
}