import React from 'react';
import { Link } from '@inertiajs/react';
import { Play, Clock, Award, BookOpen, Video } from 'lucide-react';

const LessonCard = ({ lesson }) => {
  const getDifficultyConfig = (difficulty) => {
    const configs = {
      beginner: { gradient: 'from-emerald-500 to-teal-600', icon: '🌱', label: 'Beginner' },
      intermediate: { gradient: 'from-amber-500 to-orange-600', icon: '🔥', label: 'Intermediate' },
      advanced: { gradient: 'from-rose-500 to-red-600', icon: '⚡', label: 'Advanced' }
    };
    return configs[difficulty] || configs.beginner;
  };

  const getContentPreview = (content, maxLength = 120) => {
    if (!content) return '';
    const stripped = content.replace(/\n/g, ' ').trim();
    return stripped.length > maxLength ? stripped.substring(0, maxLength) + '…' : stripped;
  };

  const config = getDifficultyConfig(lesson.difficulty);

  return (
    <div className="group bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Header Gradient */}
      <div className={`bg-gradient-to-r ${config.gradient} px-6 py-5 relative overflow-hidden`}>
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-black/5 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex items-start justify-between">
          <span className="text-3xl">{config.icon}</span>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/30">
            {config.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {lesson.title}
        </h3>

        {lesson.content && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
            {getContentPreview(lesson.content)}
          </p>
        )}

        {/* Meta Info */}
        <div className="space-y-3 mb-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{lesson.estimated_duration ? `${lesson.estimated_duration} min` : 'Self-paced'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-600 font-semibold">
              <Award className="h-4 w-4" />
              <span>{lesson.completion_reward_points} pts</span>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
  {lesson.video_url && (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-200">
      <Video className="h-3.5 w-3.5" />
      <span>Video</span>
    </div>
            )}
            <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-200">
              <BookOpen className="h-3 w-3" />
              <span>Interactive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
        <Link
          href={`/lessons/${lesson.lesson_id}`}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Play className="h-4 w-4" />
          Start Learning
        </Link>
      </div>
    </div>
  );
};

export default LessonCard;