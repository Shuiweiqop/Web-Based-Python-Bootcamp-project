import React from 'react';

export default function ProgressMetric({ label, value, max, gradient }) {
  const percentage = (value / max) * 100;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-white/80 drop-shadow-lg">{label}</span>
        <span className="text-sm font-bold text-white drop-shadow-lg">{value}%</span>
      </div>
      <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/20 shadow-inner">
        <div 
          className={`h-full bg-gradient-to-r ${gradient} transition-all duration-1000 shadow-lg`}
          style={{ width: `${percentage}%` }}
        >
          <div className="h-full bg-gradient-to-r from-white/30 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
