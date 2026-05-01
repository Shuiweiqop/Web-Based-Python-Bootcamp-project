import { cn } from '@/utils/cn';
import {
    Calendar,
    Gem,
    MessageCircle,
    Sparkles,
    Star,
    Target,
    Trophy,
    Zap,
} from 'lucide-react';

export const missionIconMap = {
    zap: Zap,
    target: Target,
    messages: MessageCircle,
    sparkles: Sparkles,
};

export const missionAccentMap = {
    amber: {
        shell: 'from-amber-500/20 via-orange-500/10 to-transparent border-amber-400/30',
        icon: 'text-amber-300 bg-amber-500/20 border-amber-400/30',
        bar: 'from-amber-400 to-orange-500',
        chip: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
    },
    blue: {
        shell: 'from-blue-500/20 via-cyan-500/10 to-transparent border-blue-400/30',
        icon: 'text-blue-300 bg-blue-500/20 border-blue-400/30',
        bar: 'from-blue-400 to-cyan-500',
        chip: 'bg-blue-500/15 text-blue-200 border-blue-400/30',
    },
    emerald: {
        shell: 'from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-400/30',
        icon: 'text-emerald-300 bg-emerald-500/20 border-emerald-400/30',
        bar: 'from-emerald-400 to-teal-500',
        chip: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
    },
    slate: {
        shell: 'from-slate-500/20 via-slate-400/10 to-transparent border-slate-300/30',
        icon: 'text-slate-200 bg-slate-500/20 border-slate-300/30',
        bar: 'from-slate-300 to-slate-500',
        chip: 'bg-slate-500/15 text-slate-100 border-slate-300/30',
    },
};

export function OverviewStatCard({ icon: Icon, title, value, note, accent }) {
    const accentMap = {
        blue: 'from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-blue-300',
        purple: 'from-purple-500/20 to-indigo-500/20 border-purple-400/30 text-purple-300',
        amber: 'from-amber-500/20 to-orange-500/20 border-amber-400/30 text-amber-300',
        emerald: 'from-emerald-500/20 to-teal-500/20 border-emerald-400/30 text-emerald-300',
    };

    return (
        <div className={cn('rounded-2xl border bg-gradient-to-br p-5 shadow-xl backdrop-blur-md', accentMap[accent])}>
            <Icon className="mb-3 h-7 w-7" />
            <div className="text-sm font-medium text-gray-200">{title}</div>
            <div className="mt-2 text-3xl font-bold text-white">{value}</div>
            <div className="mt-1 text-sm text-gray-300">{note}</div>
        </div>
    );
}

export function MissionPreviewStats({ summary = {}, profile = {}, totalHistoryPoints = 0 }) {
    const items = [
        { label: 'Current Streak', value: summary.mission_streak?.current_streak || 0, accent: 'text-orange-300' },
        { label: 'Best Streak', value: summary.mission_streak?.best_streak || 0, accent: 'text-blue-300' },
        { label: 'Reward History', value: totalHistoryPoints, accent: 'text-emerald-300', suffix: 'pts' },
        { label: 'Current Points', value: profile.current_points || 0, accent: 'text-yellow-300' },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {items.map((item) => (
                <MiniStat key={item.label} {...item} />
            ))}
        </div>
    );
}

export function MissionSummaryGrid({ summary = {} }) {
    return (
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-4">
            <OverviewStatCard icon={Calendar} title="Daily Missions" value={`${summary.daily_completed || 0}/${summary.daily_total || 0}`} note="cleared today" accent="blue" />
            <OverviewStatCard icon={Gem} title="Weekly Quests" value={`${summary.weekly_completed || 0}/${summary.weekly_total || 0}`} note="completed this week" accent="purple" />
            <OverviewStatCard icon={Trophy} title="Full Clear Bonus" value={`+${summary.daily_full_clear_bonus_points || 0}`} note={summary.daily_full_clear_bonus_earned ? 'claimed today' : 'waiting on full clear'} accent="amber" />
            <OverviewStatCard icon={Star} title="Next Milestone" value={summary.mission_streak?.next_milestone_days || 'Max'} note={summary.mission_streak?.next_milestone_points ? `worth +${summary.mission_streak?.next_milestone_points} pts` : 'all milestones cleared'} accent="emerald" />
        </section>
    );
}

export function MissionCard({ mission }) {
    const Icon = missionIconMap[mission.ui?.icon] || Sparkles;
    const accent = missionAccentMap[mission.ui?.accent] || missionAccentMap.slate;

    return (
        <div
            className={cn(
                'rounded-2xl border p-5 shadow-xl backdrop-blur-md bg-gradient-to-br',
                accent.shell,
                mission.is_completed ? 'ring-1 ring-white/20' : ''
            )}
        >
            <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className={cn('rounded-2xl border p-3', accent.icon)}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="mb-2 flex flex-wrap gap-2">
                            <span className={cn('rounded-full border px-2.5 py-1 text-xs font-medium', accent.chip)}>
                                {mission.ui?.badge || mission.period_label}
                            </span>
                            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-gray-200">
                                {mission.category}
                            </span>
                        </div>
                        <h4 className="text-lg font-bold text-white">{mission.title}</h4>
                        <p className="mt-1 text-sm text-gray-300">{mission.description}</p>
                    </div>
                </div>
                <div className="shrink-0 text-right">
                    <div className="text-xs uppercase tracking-[0.2em] text-gray-400">Reward</div>
                    <div className="text-xl font-bold text-white">{mission.reward_points}</div>
                    <div className="text-xs text-yellow-300">points</div>
                </div>
            </div>

            <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-gray-300">{mission.current_count}/{mission.target_count} completed</span>
                <span className={cn('font-semibold', mission.is_completed ? 'text-emerald-300' : 'text-blue-200')}>
                    {mission.status_label}
                </span>
            </div>

            <div className="mb-4 h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-black/40">
                <div
                    className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', accent.bar)}
                    style={{ width: `${mission.progress_percent}%` }}
                />
            </div>

            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                    {mission.remaining_count > 0 ? `${mission.remaining_count} more to clear` : 'Mission cleared'}
                </span>
                <span className="text-gray-300">{mission.period_label}</span>
            </div>
        </div>
    );
}

export function MiniStat({ label, value, accent, suffix = '' }) {
    return (
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-gray-400">{label}</div>
            <div className={cn('mt-2 text-3xl font-bold', accent)}>
                {Number.isFinite(value) ? Number(value).toLocaleString() : value}
                {suffix ? <span className="ml-1 text-base text-gray-300">{suffix}</span> : null}
            </div>
        </div>
    );
}

export function MiniPanel({ label, value, note }) {
    return (
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-gray-400">{label}</div>
            <div className="mt-2 text-3xl font-bold text-white">{value}</div>
            <div className="mt-1 text-sm text-gray-300">{note}</div>
        </div>
    );
}

export function EmptyPanel({ message }) {
    return (
        <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-gray-300">
            {message}
        </div>
    );
}

export function RewardTimelineList({ rewards = [] }) {
    if (!rewards.length) {
        return <EmptyPanel message="Your reward history will appear here after your first mission payout." />;
    }

    return (
        <div className="space-y-4">
            {rewards.map((reward, index) => (
                <div key={`${reward.kind}-${reward.code}-${reward.granted_at}-${index}`} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="mb-2 flex flex-wrap gap-2">
                                <span className={cn(
                                    'rounded-full border px-2.5 py-1 text-xs font-semibold',
                                    reward.kind === 'bonus_reward'
                                        ? 'border-amber-400/30 bg-amber-500/15 text-amber-200'
                                        : 'border-blue-400/30 bg-blue-500/15 text-blue-200'
                                )}>
                                    {reward.kind === 'bonus_reward' ? 'Bonus Reward' : 'Mission Reward'}
                                </span>
                                <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-gray-200">
                                    {reward.period_type === 'weekly' ? 'Weekly' : 'Daily'}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-white">{reward.title}</h3>
                            <p className="mt-1 text-sm text-gray-300">{reward.subtitle}</p>
                            <p className="mt-2 text-xs text-gray-400">
                                {formatPeriodLabel(reward.period_type, reward.period_start, reward.period_end)}
                            </p>
                        </div>

                        <div className="text-left sm:text-right">
                            <div className="text-2xl font-bold text-emerald-300">+{reward.reward_points}</div>
                            <div className="text-xs text-gray-400">earned {formatDateTime(reward.granted_at)}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function PeriodArchiveList({ periods = [] }) {
    if (!periods.length) {
        return <EmptyPanel message="Cycle summaries will build up once you start clearing missions." />;
    }

    return (
        <div className="space-y-4">
            {periods.map((period, index) => (
                <div key={`${period.period_type}-${period.period_start}-${index}`} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                            <div className="mb-1 text-sm font-semibold text-white">
                                {period.period_type === 'weekly' ? 'Weekly Cycle' : 'Daily Cycle'}
                            </div>
                            <div className="text-xs text-gray-400">
                                {formatPeriodLabel(period.period_type, period.period_start, period.period_end)}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-white">
                                {period.completed_missions}/{period.total_missions}
                            </div>
                            <div className="text-xs text-gray-400">missions complete</div>
                        </div>
                    </div>

                    <div className="mb-3 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                            <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Mission Points</div>
                            <div className="mt-1 text-xl font-bold text-blue-300">+{period.reward_points_earned}</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                            <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Bonus Points</div>
                            <div className="mt-1 text-xl font-bold text-amber-300">+{period.bonus_points_earned}</div>
                        </div>
                    </div>

                    {period.bonus_titles?.length ? (
                        <div className="mb-3 flex flex-wrap gap-2">
                            {period.bonus_titles.map((title) => (
                                <span key={title} className="rounded-full border border-amber-400/30 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-200">
                                    {title}
                                </span>
                            ))}
                        </div>
                    ) : null}

                    <div className="space-y-2">
                        {period.missions.map((mission) => (
                            <div key={mission.code} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                                <span className="text-gray-200">{mission.title}</span>
                                <span className={cn(
                                    'font-semibold',
                                    mission.is_completed ? 'text-emerald-300' : 'text-gray-400'
                                )}>
                                    {mission.current_count}/{mission.target_count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function formatDateTime(value) {
    if (!value) {
        return 'just now';
    }

    return new Date(value).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatPeriodLabel(periodType, periodStart, periodEnd) {
    if (!periodStart) {
        return periodType === 'weekly' ? 'This week' : 'Today';
    }

    const start = new Date(periodStart);
    const end = periodEnd ? new Date(periodEnd) : null;

    if (periodType === 'weekly' && end) {
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }

    return start.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
