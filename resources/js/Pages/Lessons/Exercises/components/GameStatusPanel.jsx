import React from 'react';
import { Clock, Gauge, Pause, Play, RotateCcw, Send, Trophy } from 'lucide-react';

const GameStatusPanel = ({
  currentScore = 0,
  maxScore = 100,
  formattedTime = '0:00',
  isTimeUp = false,
  hasTimeLimit = true,
  isRunning = false,
  isSubmitting = false,
  onToggleTimer,
  onFinish,
  onRestart,
  className = '',
}) => {
  const safeMaxScore = Number(maxScore) || 100;
  const scorePercentage = Math.min(100, Math.max(0, Math.round((Number(currentScore) / safeMaxScore) * 100)));

  const grade = scorePercentage >= 90
    ? 'Mastery'
    : scorePercentage >= 70
      ? 'Strong'
      : scorePercentage >= 40
        ? 'Building'
        : 'Warming up';

  const scoreColor = scorePercentage >= 80
    ? 'from-emerald-400 to-teal-500'
    : scorePercentage >= 60
      ? 'from-amber-400 to-orange-500'
      : 'from-sky-400 to-indigo-500';

  return (
    <aside className={`rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl shadow-slate-200/60 backdrop-blur ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Run Panel</div>
          <div className="text-lg font-black text-slate-950">{grade}</div>
        </div>
        <div className="rounded-xl bg-violet-50 p-2 text-violet-700">
          <Gauge className="h-5 w-5" />
        </div>
      </div>

      <div className="rounded-2xl bg-slate-950 p-4 text-white">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
          <span>Score</span>
          <Trophy className="h-4 w-4 text-amber-300" />
        </div>
        <div className="text-3xl font-black">
          {currentScore}
          <span className="text-base font-semibold text-slate-400">/{safeMaxScore}</span>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${scoreColor} transition-all duration-500`}
            style={{ width: `${scorePercentage}%` }}
          />
        </div>
        <div className="mt-2 text-right text-xs font-semibold text-slate-300">{scorePercentage}%</div>
      </div>

      {hasTimeLimit && (
        <div className={`mt-3 rounded-xl border p-3 ${isTimeUp ? 'border-red-200 bg-red-50 text-red-700' : 'border-sky-100 bg-sky-50 text-sky-800'}`}>
          <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
            <Clock className="h-4 w-4" />
            Time
          </div>
          <div className="font-mono text-2xl font-black">
            {isTimeUp ? 'Time up' : formattedTime}
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {onToggleTimer && (
          <button
            type="button"
            onClick={onToggleTimer}
            disabled={isTimeUp}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? 'Pause' : 'Resume'}
          </button>
        )}

        {onFinish && (
          <button
            type="button"
            onClick={onFinish}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:from-emerald-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Finish & Submit'}
          </button>
        )}

        {onRestart && (
          <button
            type="button"
            onClick={onRestart}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
          >
            <RotateCcw className="h-4 w-4" />
            Restart
          </button>
        )}
      </div>
    </aside>
  );
};

export default GameStatusPanel;
