import React from 'react';

export default function NavButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap
        transition-all duration-300 shadow-lg
        ${active 
          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white scale-105 shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
          : 'bg-black/50 backdrop-blur-xl text-white/70 hover:bg-white/20 hover:text-white border border-white/20'
        }
      `}
    >
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
      )}
      <Icon className="w-5 h-5 relative z-10 drop-shadow-lg" />
      <span className="relative z-10 drop-shadow-lg">{label}</span>
    </button>
  );
}