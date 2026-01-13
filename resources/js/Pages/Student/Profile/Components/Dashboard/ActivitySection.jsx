import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import ActivityCard from './Cards/ActivityCard';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function ActivitySection({ topActivities }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    updateTheme();
    window.addEventListener('theme-changed', updateTheme);
    return () => window.removeEventListener('theme-changed', updateTheme);
  }, []);

  return (
    <div className="relative">
      {/* 强制深色遮罩层 - 确保在任何背景下都有对比度 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/30 rounded-2xl -z-10 backdrop-blur-sm" />
      
      <div className="bg-black/85 backdrop-blur-2xl border-2 border-white/40 rounded-2xl p-6 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.9)] relative">
        <h3 className="text-2xl font-bold flex items-center gap-3 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          <Clock className="w-7 h-7 text-cyan-400 drop-shadow-lg" />
          Activity Log
        </h3>
        
        <div className="space-y-3">
          {topActivities && topActivities.length > 0 ? (
            topActivities.map((activity, i) => (
              <div key={i} className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-black/50 transition-all duration-200">
                <ActivityCard activity={activity} expanded />
              </div>
            ))
          ) : (
            <div className="p-8 rounded-xl text-center bg-black/40 backdrop-blur-md border border-white/20">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50 text-gray-400" />
              <p className="text-sm text-gray-300 drop-shadow-lg">
                No recent activity yet. Start learning to see your progress here!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}