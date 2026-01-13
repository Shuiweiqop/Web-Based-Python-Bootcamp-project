import React from 'react';
import { Link } from '@inertiajs/react';
import { BookOpen, Award } from 'lucide-react';

const LessonSidebar = ({ lesson, auth, exerciseProgress, totalExercises, totalTests, passedTests }) => {
  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', icon: '🌱' };
      case 'intermediate': return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', icon: '🔥' };
      case 'advanced': return { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300', icon: '⚡' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', icon: '📚' };
    }
  };

  const difficultyBadge = getDifficultyBadge(lesson.difficulty);

  return (
    <div className="lg:col-span-1 space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
          <div className="p-2 bg-indigo-100 rounded-lg mr-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </div>
          Lesson Info
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg">
            <span className="text-gray-600 font-medium">Status</span>
            <span className="font-bold text-emerald-600 flex items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
              Active
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg">
            <span className="text-gray-600 font-medium">Difficulty</span>
            <span className={`font-bold px-3 py-1 rounded-full text-sm ${difficultyBadge.bg} ${difficultyBadge.text}`}>
              {difficultyBadge.icon} {lesson.difficulty}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg">
            <span className="text-gray-600 font-medium">Duration</span>
            <span className="font-bold text-gray-900">
              {lesson.estimated_duration ? `${lesson.estimated_duration} min` : 'Self-paced'}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <span className="text-blue-700 font-medium">Rewards</span>
            <span className="font-black text-blue-600 text-lg flex items-center">
              <Award className="w-5 h-5 mr-1" />
              {lesson.completion_reward_points} pts
            </span>
          </div>
        </div>
      </div>

      {auth?.user?.role === 'student' && (
        <Link
          href="/my-registrations"
          className="block w-full text-center px-6 py-3.5 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 font-semibold rounded-xl hover:from-gray-200 hover:to-slate-200 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200"
        >
          📚 View My Registrations
        </Link>
      )}
    </div>
  );
};

export default LessonSidebar;
