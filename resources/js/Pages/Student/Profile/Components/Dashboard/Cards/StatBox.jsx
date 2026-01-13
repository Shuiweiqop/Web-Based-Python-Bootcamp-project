import React from 'react';

export default function StatBox({ icon: Icon, label, value, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-4 shadow-xl hover:shadow-2xl transition-all hover:scale-105`}>
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/10 rounded-tr-full"></div>
      <div className="relative">
        <Icon className="w-6 h-6 text-white mb-2 drop-shadow-lg" />
        <div className="text-2xl font-black text-white drop-shadow-lg">{value}</div>
        <div className="text-xs text-white/90 font-semibold drop-shadow-md">{label}</div>
      </div>
    </div>
  );
}