import React from 'react';
import { Clock, Award, Star } from 'lucide-react';

const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner': return 'from-emerald-500 to-teal-600';
    case 'intermediate': return 'from-amber-500 to-orange-600';
    case 'advanced': return 'from-rose-500 to-red-600';
    default: return 'from-gray-500 to-slate-600';
  }
};

const getDifficultyBadge = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner': return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', icon: '🌱' };
    case 'intermediate': return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', icon: '🔥' };
    case 'advanced': return { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300', icon: '⚡' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', icon: '📚' };
  }
};

export default function LessonHeader({ lesson, exerciseProgress }) {
  const difficultyBadge = getDifficultyBadge(lesson.difficulty);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      <div className={`bg-gradient-to-r ${getDifficultyColor(lesson.difficulty)} px-8 py-8 relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{difficultyBadge.icon}</span>
            <span className={`px-4 py-1.5 text-sm font-bold rounded-full ${difficultyBadge.bg} ${difficultyBadge.text} border-2 ${difficultyBadge.border} shadow-sm`}>
              {lesson.difficulty?.charAt(0).toUpperCase() + lesson.difficulty?.slice(1)}
            </span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2 drop-shadow-lg">{lesson.title}</h1>
          <p className="text-white/90 text-lg font-medium">Lesson #{lesson.lesson_id}</p>
        </div>
      </div>

      <div className="px-8 py-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center group hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <div className="text-sm text-gray-600 font-medium">Duration</div>
            <div className="font-bold text-lg text-gray-900">
              {lesson.estimated_duration ? `${lesson.estimated_duration} min` : 'Self-paced'}
            </div>
          </div>
          <div className="text-center group hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <Award className="h-6 w-6" />
              </div>
            </div>
            <div className="text-sm text-gray-600 font-medium">Reward</div>
            <div className="font-bold text-lg text-gray-900">{lesson.completion_reward_points} points</div>
          </div>
          <div className="text-center group hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-center gap-2 text-purple-600 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Star className="h-6 w-6" />
              </div>
            </div>
            <div className="text-sm text-gray-600 font-medium">Progress</div>
            <div className="font-bold text-lg text-gray-900">{exerciseProgress}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}