import { Link } from '@inertiajs/react';
import { CheckCircle2, Sparkles, Target, Trophy, X } from 'lucide-react';
import { useEffect } from 'react';

export default function MissionProgressToast({ payload, onDismiss }) {
  useEffect(() => {
    if (!payload?.show_toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onDismiss?.();
    }, 7000);

    return () => window.clearTimeout(timeoutId);
  }, [payload, onDismiss]);

  if (!payload?.show_toast) {
    return null;
  }

  const completedCount = payload.missions_completed?.length ?? 0;
  const updatedCount = payload.missions_updated?.length ?? 0;
  const bonusCount = payload.bonuses_earned?.length ?? 0;
  const primaryMission = payload.missions_completed?.[0] ?? payload.missions_updated?.[0] ?? null;

  return (
    <div className="fixed right-4 top-24 z-[70] w-full max-w-sm animate-slideDown">
      <div className="overflow-hidden rounded-3xl border border-amber-300/50 bg-slate-950/92 shadow-2xl backdrop-blur-2xl">
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-3 text-slate-950">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em]">Mission Update</p>
              <h3 className="mt-1 text-lg font-black">
                {completedCount > 0 ? 'Objective cleared' : 'Progress locked in'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onDismiss?.()}
              className="rounded-full bg-slate-950/10 p-1.5 transition hover:bg-slate-950/20"
              aria-label="Dismiss mission progress"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-400/15 p-3 text-amber-300">
              {completedCount > 0 ? <Trophy className="h-5 w-5" /> : <Target className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {primaryMission?.title ?? 'Your mission board moved forward.'}
              </p>
              <p className="text-xs text-slate-300">
                {updatedCount} mission{updatedCount === 1 ? '' : 's'} updated
                {payload.points_earned > 0 ? ` • +${payload.points_earned} pts` : ''}
              </p>
            </div>
          </div>

          {primaryMission ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {primaryMission.period_type === 'weekly' ? 'Weekly Quest' : 'Daily Mission'}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">{primaryMission.title}</p>
                </div>
                {primaryMission.just_completed ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Complete
                  </span>
                ) : (
                  <span className="text-sm font-bold text-amber-300">
                    {primaryMission.current_count}/{primaryMission.target_count}
                  </span>
                )}
              </div>
              {!primaryMission.just_completed ? (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                    style={{ width: `${primaryMission.progress_percent}%` }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {bonusCount > 0 ? (
            <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-4">
              <div className="flex items-center gap-2 text-fuchsia-200">
                <Sparkles className="h-4 w-4" />
                <p className="text-sm font-bold">Bonus unlocked</p>
              </div>
              <div className="mt-2 space-y-1">
                {payload.bonuses_earned.map((bonus) => (
                  <p key={bonus.code} className="text-sm text-fuchsia-100">
                    {bonus.title} • +{bonus.points} pts
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              {completedCount > 0
                ? `${completedCount} mission${completedCount === 1 ? '' : 's'} completed this action.`
                : 'Keep the streak going with one more action.'}
            </p>
            <Link
              href={route('student.missions.index')}
              className="inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-950 transition hover:bg-amber-100"
            >
              Mission Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
