import React from 'react';
import { BookOpen } from 'lucide-react';

export default function ActivityCard({ activity, expanded = false }) {
  const score = activity.score || 0;
  
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all shadow-lg">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
        score >= 90 ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
        score >= 70 ? 'bg-gradient-to-br from-cyan-400 to-blue-500' :
        'bg-gradient-to-br from-orange-400 to-red-500'
      }`}>
        <BookOpen className="w-7 h-7 text-white drop-shadow-lg" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm truncate drop-shadow-lg">
          {activity.test_name || activity.exercise_title || 'Activity'}
        </p>
        <p className="text-white/60 text-xs drop-shadow-md">{activity.submitted_at || 'Recently'}</p>
      </div>
      <div className="flex-shrink-0">
        <div className={`text-3xl font-black drop-shadow-lg ${
          score >= 90 ? 'text-green-400' :
          score >= 70 ? 'text-cyan-400' : 'text-orange-400'
        }`}>
          {score}%
        </div>
      </div>
    </div>
  );
}