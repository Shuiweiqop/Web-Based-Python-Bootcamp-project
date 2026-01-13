import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
  GraduationCap,
  Plus,
  Filter,
  Search,
  Sparkles,
  HelpCircle,
  CheckCircle,
  Lightbulb,
  X,
} from 'lucide-react';
import { safeRoute } from '@/utils/routeHelpers';
import { cn } from '@/utils/cn';

export default function EmptyState({ 
  hasFilters = false, 
  searchQuery = '',
  onClearFilters = null,
  isDark = true,
}) {
  const [showTips, setShowTips] = useState(false);

  // No results with filters/search applied
  if (hasFilters || searchQuery) {
    return (
      <div className={cn(
        "rounded-2xl shadow-lg border backdrop-blur-sm overflow-hidden animate-fadeIn",
        isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
      )}>
        <div className="p-12 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className={cn(
                "absolute inset-0 rounded-full blur-xl opacity-50 animate-pulse-slow",
                isDark ? "bg-purple-500" : "bg-purple-300"
              )} />
              <div className={cn(
                "relative w-20 h-20 rounded-full flex items-center justify-center",
                isDark 
                  ? "bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-purple-500/50"
                  : "bg-gradient-to-br from-purple-100 to-cyan-100"
              )}>
                <Search className={cn("w-10 h-10", isDark ? "text-cyan-400" : "text-purple-600")} />
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className={cn("text-2xl font-bold mb-2", isDark ? "text-white" : "text-gray-900")}>
            No lessons found
          </h3>

          {/* Description */}
          <p className={cn("max-w-md mx-auto mb-6", isDark ? "text-slate-300" : "text-gray-600")}>
            {searchQuery ? (
              <>
                We couldn't find any lessons matching <strong className={isDark ? "text-white" : "text-gray-900"}>"{searchQuery}"</strong>
                {hasFilters && ' with your current filters'}
              </>
            ) : (
              'No lessons match your current filters'
            )}
          </p>

          {/* Suggestions */}
          <div className={cn(
            "rounded-xl p-4 text-left inline-block max-w-sm mb-6 border",
            isDark 
              ? "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30"
              : "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"
          )}>
            <p className={cn("text-sm font-semibold mb-2 flex items-center", isDark ? "text-blue-300" : "text-blue-900")}>
              <Lightbulb className="w-4 h-4 mr-2" />
              Try these suggestions:
            </p>
            <ul className={cn("text-sm space-y-1 list-disc list-inside", isDark ? "text-blue-400" : "text-blue-800")}>
              {searchQuery && (
                <>
                  <li>Check your spelling</li>
                  <li>Try fewer or different keywords</li>
                  <li>Remove search filters</li>
                </>
              )}
              {!searchQuery && hasFilters && (
                <>
                  <li>Remove one or more filters</li>
                  <li>Try less specific filter combinations</li>
                  <li>Clear all filters to see all lessons</li>
                </>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onClearFilters}
              className={cn(
                "inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ripple-effect button-press-effect hover-lift",
                isDark
                  ? "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                  : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
              )}
            >
              <X className="w-4 h-4 mr-2" />
              Clear filters
            </button>

            <Link
              href={safeRoute('admin.lessons.index')}
              className={cn(
                "inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ripple-effect button-press-effect hover-lift",
                isDark
                  ? "bg-gradient-to-r from-purple-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 text-white border border-purple-500/30"
                  : "bg-gradient-to-r from-purple-100 to-cyan-100 hover:from-purple-200 hover:to-cyan-200 text-gray-900 border border-purple-200"
              )}
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              View all lessons
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No lessons at all (empty database)
  return (
    <div className={cn(
      "rounded-2xl shadow-lg border-2 border-dashed overflow-hidden animate-fadeIn",
      isDark 
        ? "bg-gradient-to-br from-purple-500/10 via-cyan-500/5 to-purple-500/10 border-purple-500/30"
        : "bg-gradient-to-br from-purple-50 via-cyan-50 to-purple-50 border-purple-300"
    )}>
      <div className="p-12 text-center">
        {/* Animated Icon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className={cn(
              "absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse-slow",
              isDark ? "bg-gradient-to-r from-purple-500 to-cyan-500" : "bg-gradient-to-r from-purple-300 to-cyan-300"
            )} />
            <div className={cn(
              "relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl",
              isDark
                ? "bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border-2 border-purple-500/50"
                : "bg-gradient-to-br from-purple-200 to-cyan-200 border-2 border-purple-300"
            )}>
              <GraduationCap className={cn("w-12 h-12", isDark ? "text-cyan-400" : "text-purple-600")} />
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className={cn("text-3xl font-bold mb-2", isDark ? "text-white" : "text-gray-900")}>
          No lessons yet
        </h3>

        {/* Description */}
        <p className={cn("max-w-md mx-auto mb-8", isDark ? "text-slate-300" : "text-gray-600")}>
          Get started by creating your first lesson. Lessons can include content, videos, exercises, and tests to help students learn effectively.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-8">
          {[
            { icon: '📚', title: 'Rich Content', desc: 'Add text, videos, and media' },
            { icon: '🎮', title: 'Interactive Games', desc: 'Drag & drop, puzzles, quizzes' },
            { icon: '📊', title: 'Assessments', desc: 'Create tests and track progress' },
            { icon: '🏆', title: 'Rewards', desc: 'Award points for completion' },
          ].map((feature, index) => (
            <div 
              key={index}
              className={cn(
                "rounded-xl p-4 border backdrop-blur-sm transition-all hover-lift animate-fadeIn",
                isDark
                  ? "bg-slate-800/50 border-white/10"
                  : "bg-white border-purple-200"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{feature.icon}</span>
                <div className="text-left flex-1">
                  <p className={cn("font-bold text-sm", isDark ? "text-white" : "text-gray-900")}>
                    {feature.title}
                  </p>
                  <p className={cn("text-xs", isDark ? "text-slate-400" : "text-gray-600")}>
                    {feature.desc}
                  </p>
                </div>
                <CheckCircle className={cn("w-5 h-5", isDark ? "text-green-400" : "text-green-600")} />
              </div>
            </div>
          ))}
        </div>

        {/* Primary Action Button */}
        <div className="mb-6">
          <Link
            href={safeRoute('admin.lessons.create')}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white rounded-xl font-bold shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/60 transition-all hover-lift ripple-effect button-press-effect animate-bounceIn"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Lesson
          </Link>
        </div>

        {/* Tips Toggle */}
        <button
          onClick={() => setShowTips(!showTips)}
          className={cn(
            "text-sm font-medium flex items-center justify-center gap-2 transition-all hover-lift",
            isDark ? "text-cyan-400 hover:text-cyan-300" : "text-purple-600 hover:text-purple-800"
          )}
        >
          <Lightbulb className="w-4 h-4" />
          {showTips ? 'Hide' : 'Show'} tips
        </button>

        {/* Tips Section */}
        {showTips && (
          <div className={cn(
            "mt-6 rounded-xl p-6 text-left max-w-md mx-auto border backdrop-blur-sm animate-slideDown",
            isDark
              ? "bg-slate-800/50 border-white/10"
              : "bg-white border-purple-200"
          )}>
            <p className={cn("font-bold mb-4 flex items-center", isDark ? "text-white" : "text-gray-900")}>
              <Sparkles className={cn("w-5 h-5 mr-2", isDark ? "text-yellow-400" : "text-yellow-500")} />
              Tips for creating engaging lessons
            </p>
            <ul className={cn("space-y-3 text-sm", isDark ? "text-slate-300" : "text-gray-700")}>
              {[
                { num: 1, title: 'Start with the basics', desc: 'Use clear, simple language' },
                { num: 2, title: 'Add multimedia', desc: 'Include videos and images' },
                { num: 3, title: 'Create exercises', desc: 'Make it interactive and fun' },
                { num: 4, title: 'Add assessments', desc: 'Include tests to measure progress' },
                { num: 5, title: 'Set rewards', desc: 'Motivate students with points' },
              ].map(tip => (
                <li key={tip.num} className="flex gap-3">
                  <span className={cn("font-bold flex-shrink-0", isDark ? "text-cyan-400" : "text-purple-600")}>
                    {tip.num}.
                  </span>
                  <span>
                    <strong>{tip.title}:</strong> {tip.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}