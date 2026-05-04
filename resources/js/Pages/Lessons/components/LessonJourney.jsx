import React from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Gamepad2, Gift, Lock, Trophy } from 'lucide-react';

const iconMap = {
  review: BookOpen,
  practice: Gamepad2,
  checks: Trophy,
  reward: Gift,
};

const stateStyles = {
  done: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  ready: 'border-blue-300 bg-blue-50 text-blue-900',
  locked: 'border-slate-200 bg-slate-50 text-slate-500',
};

export default function LessonJourney({ steps = [], onJump }) {
  return (
    <div className="sticky top-20 z-20 rounded-2xl border border-blue-100 bg-white/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Lesson Journey</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">Stay focused on the one best next step.</h2>
        </div>
        <div className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 md:block">
          Read - Practice - Checks - Reward
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = iconMap[step.key] || BookOpen;
          const isLocked = step.state === 'locked';

          return (
            <button
              key={step.key}
              type="button"
              onClick={() => !isLocked && onJump?.(step.anchor)}
              className={`group relative rounded-xl border p-4 text-left transition-all duration-200 ${stateStyles[step.state]} ${
                isLocked ? 'cursor-default' : 'hover:-translate-y-0.5 hover:shadow-md'
              }`}
            >
              {index < steps.length - 1 && (
                <div className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-slate-300 md:block">
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-white/80 p-2 shadow-sm">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Step {index + 1}</p>
                    <p className="font-bold">{step.label}</p>
                  </div>
                </div>
                {step.state === 'done' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : step.state === 'locked' ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-bold text-blue-700">You can do this now</span>
                )}
              </div>

              <p className="mt-3 text-sm leading-relaxed">{step.action}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
