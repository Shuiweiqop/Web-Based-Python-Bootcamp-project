import React from 'react';
import { Link } from '@inertiajs/react';
import { Compass, ArrowRight, BookOpen, Clock, Star } from 'lucide-react';

export default function LearningPathsSection({ learningPaths, profile }) {
  // 🔍 调试：查看接收到的数据
  // 如果没有数据，显示空状态
  if (!learningPaths || learningPaths.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3 drop-shadow-lg">
            <Compass className="w-7 h-7 text-cyan-400 drop-shadow-lg" />
            My Learning Paths
          </h3>
          <Link 
            href={route('student.paths.browse')} 
            className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1 drop-shadow-lg font-semibold"
          >
            Browse Paths
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Empty State */}
        <div className="text-center py-12 bg-black/40 backdrop-blur-xl rounded-2xl border-2 border-dashed border-white/20">
          <Compass className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
            No Learning Paths Yet
          </h4>
          <p className="text-white/70 mb-6 drop-shadow-md">
            Start your learning journey by enrolling in a path!
          </p>
          <Link
            href={route('student.paths.browse')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-xl"
          >
            <Compass className="w-5 h-5" />
            Explore Learning Paths
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3 drop-shadow-lg">
          <Compass className="w-7 h-7 text-cyan-400 drop-shadow-lg" />
          My Learning Paths
        </h3>
        <Link 
          href={route('student.paths.index')} 
          className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1 drop-shadow-lg font-semibold"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {learningPaths.map((path) => (
          <div 
            key={path.id}
            className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:border-cyan-500/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                {/* Icon */}
                {path.icon && (
                  <div className="text-3xl group-hover:scale-110 transition-transform">
                    {path.icon}
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xl font-bold text-white drop-shadow-lg">
                      {path.name || 'Untitled Path'}
                    </h4>
                    {path.is_primary && (
                      <span className="px-2 py-0.5 bg-yellow-500/30 text-yellow-300 text-xs font-bold rounded-full">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <p className="text-white/70 text-sm drop-shadow-md">
                    {path.description || 'No description available'}
                  </p>
                  
                  {/* Difficulty Level */}
                  {path.difficulty_level && (
                    <div className="mt-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-white/60 capitalize">
                        {path.difficulty_level}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                path.status === 'completed' ? 'bg-green-500/30 text-green-300' :
                path.status === 'active' ? 'bg-blue-500/30 text-blue-300' :
                path.status === 'paused' ? 'bg-orange-500/30 text-orange-300' :
                'bg-gray-500/30 text-gray-300'
              }`}>
                {path.status === 'completed' ? 'Completed' :
                 path.status === 'active' ? 'In Progress' :
                 path.status === 'paused' ? 'Paused' : 
                 'Not Started'}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-white/80 drop-shadow-lg">
                    {path.completed_lessons || 0} / {path.total_lessons || 0} Lessons
                  </span>
                </div>
                <span className="text-sm font-bold text-white drop-shadow-lg">
                  {Math.round(path.progress || 0)}%
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/20 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 shadow-lg"
                  style={{ width: `${Math.min(100, Math.max(0, path.progress || 0))}%` }}
                >
                  <div className="h-full bg-gradient-to-r from-white/30 to-transparent"></div>
                </div>
              </div>
            </div>

            {/* Last Activity */}
            {path.last_activity_at && (
              <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
                <Clock className="w-3 h-3" />
                <span>Last activity: {path.last_activity_at}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link
                href={route('student.paths.show', path.id)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:scale-105 transition-all shadow-lg"
              >
                {path.status === 'paused' ? 'Resume' : 
                 path.status === 'completed' ? 'Review' : 
                 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Progress Details Button */}
              <Link
                href={route('student.paths.progress', path.id)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all border border-white/20"
              >
                Stats
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Browse More Button */}
      {learningPaths.length > 0 && (
        <div className="text-center">
          <Link
            href={route('student.paths.browse')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all border border-white/20"
          >
            <Compass className="w-5 h-5" />
            Browse More Paths
          </Link>
        </div>
      )}
    </div>
  );
}
