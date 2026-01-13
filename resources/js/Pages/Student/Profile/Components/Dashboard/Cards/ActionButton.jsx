import React from 'react';
import { Link } from '@inertiajs/react';

export default function ActionButton({ href, icon: Icon, label, gradient }) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-4 shadow-xl hover:shadow-2xl transition-all hover:scale-105`}
    >
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      <div className="relative flex flex-col items-center gap-2">
        <Icon className="w-7 h-7 text-white drop-shadow-lg" />
        <span className="text-white font-bold text-sm drop-shadow-lg">{label}</span>
      </div>
    </Link>
  );
}