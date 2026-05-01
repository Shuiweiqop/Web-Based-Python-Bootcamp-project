import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { cn } from '@/utils/cn';
import {
    ArrowRight,
    CheckCircle,
    Flame,
    Gem,
    History,
    Layers3,
    ScrollText,
    Sparkles,
} from 'lucide-react';
import {
    MiniPanel,
    MissionCard,
    MissionPreviewStats,
    MissionSummaryGrid,
    PeriodArchiveList,
    RewardTimelineList,
} from './missionShared';

export default function MissionCenter({ auth, studentProfile, missionBoard, rewardHistory, periodHistory }) {
    const summary = missionBoard?.summary || {};
    const profile = studentProfile || {};
    const totalHistoryPoints = (rewardHistory || []).reduce((sum, item) => sum + Number(item.reward_points || 0), 0);

    const header = (
        <div className="rounded-3xl border border-white/20 bg-black/70 p-8 text-white shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200">
                        <ScrollText className="h-4 w-4" />
                        Mission Center
                    </div>
                    <h1 className="text-4xl font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                        Track every quest in one place
                    </h1>
                    <p className="mt-3 max-w-3xl text-base text-gray-300">
                        Use this as your command deck: see what is live now, then jump into history or archive views when you want the full story.
                    </p>
                </div>

                <MissionPreviewStats summary={summary} profile={profile} totalHistoryPoints={totalHistoryPoints} />
            </div>
        </div>
    );

    return (
        <StudentLayout header={header}>
            <Head title="Mission Center" />

            <div className="space-y-10">
                <MissionSummaryGrid summary={summary} />

                <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <NavCard
                        href={route('student.missions.history')}
                        icon={History}
                        title="Mission History"
                        body="Review every reward payout and bonus drop in a single timeline."
                        accent="from-emerald-500/20 to-teal-500/20 border-emerald-400/30 text-emerald-300"
                    />
                    <NavCard
                        href={route('student.missions.archive')}
                        icon={Layers3}
                        title="Mission Archive"
                        body="Look back through recent daily and weekly cycle summaries, including missed runs."
                        accent="from-purple-500/20 to-indigo-500/20 border-purple-400/30 text-purple-300"
                    />
                    <NavCard
                        href={route('dashboard')}
                        icon={Sparkles}
                        title="Back to Dashboard"
                        body="Jump back into lessons while keeping your mission progress in view."
                        accent="from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-blue-300"
                    />
                </section>

                <section className="rounded-3xl border border-white/20 bg-black/70 p-8 shadow-2xl backdrop-blur-md">
                    <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Live Mission Board</h2>
                            <p className="mt-2 text-gray-300">
                                Stay focused on the missions that are active right now.
                            </p>
                        </div>

                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                        >
                            Back to Dashboard
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="mb-8 rounded-2xl border border-blue-400/20 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-indigo-500/10 p-5">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <div className="mb-2 flex items-center gap-3">
                                    <Flame className="h-5 w-5 text-orange-300" />
                                    <h3 className="text-xl font-bold text-white">Mission Streak</h3>
                                </div>
                                <p className="max-w-2xl text-sm text-gray-300">
                                    Full-clear every daily mission to keep the streak alive and unlock milestone rewards.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <MiniPanel label="Current" value={summary.mission_streak?.current_streak || 0} note="days" />
                                <MiniPanel label="Best" value={summary.mission_streak?.best_streak || 0} note="days" />
                                <MiniPanel label="Next Goal" value={summary.mission_streak?.next_milestone_days || 'Max'} note={summary.mission_streak?.next_milestone_points ? `+${summary.mission_streak?.next_milestone_points} pts` : 'complete'} />
                                <MiniPanel label="Remaining" value={summary.mission_streak?.days_to_next_milestone || 0} note="days to go" />
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="mb-5 flex items-center gap-3">
                            <Sparkles className="h-5 w-5 text-amber-300" />
                            <h3 className="text-xl font-bold text-white">Daily Missions</h3>
                        </div>
                        {missionBoard?.daily?.length ? (
                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                {missionBoard.daily.map((mission) => <MissionCard key={mission.id} mission={mission} />)}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-gray-300">
                                Daily missions will show up here once they are active.
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="mb-5 flex items-center gap-3">
                            <Gem className="h-5 w-5 text-blue-300" />
                            <h3 className="text-xl font-bold text-white">Weekly Quest Board</h3>
                        </div>
                        {missionBoard?.weekly?.length ? (
                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                                {missionBoard.weekly.map((mission) => <MissionCard key={mission.id} mission={mission} />)}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-gray-300">
                                Weekly quests will show up here once they are active.
                            </div>
                        )}
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-8 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-3xl border border-white/20 bg-black/70 p-8 shadow-2xl backdrop-blur-md">
                        <div className="mb-6 flex items-center gap-3">
                            <History className="h-5 w-5 text-emerald-300" />
                            <h2 className="text-2xl font-bold text-white">Reward Timeline</h2>
                        </div>
                        <RewardTimelineList rewards={rewardHistory} />
                        <div className="mt-5">
                            <Link href={route('student.missions.history')} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:text-emerald-200">
                                Open full mission history
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/20 bg-black/70 p-8 shadow-2xl backdrop-blur-md">
                        <div className="mb-6 flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-purple-300" />
                            <h2 className="text-2xl font-bold text-white">Recent Cycle Summaries</h2>
                        </div>
                        <PeriodArchiveList periods={periodHistory} />
                        <div className="mt-5">
                            <Link href={route('student.missions.archive')} className="inline-flex items-center gap-2 text-sm font-semibold text-purple-300 transition hover:text-purple-200">
                                Open full archive
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </StudentLayout>
    );
}

function NavCard({ href, icon: Icon, title, body, accent }) {
    return (
        <Link href={href} className={cn('rounded-3xl border bg-gradient-to-br p-6 shadow-2xl backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/10', accent)}>
            <Icon className="mb-4 h-8 w-8" />
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="mt-2 text-sm text-gray-200">{body}</p>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
                Open page
                <ArrowRight className="h-4 w-4" />
            </div>
        </Link>
    );
}
