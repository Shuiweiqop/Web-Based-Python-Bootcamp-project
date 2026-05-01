import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { ArrowLeft, Flame, History, ScrollText } from 'lucide-react';
import { MissionPreviewStats, MissionSummaryGrid, RewardTimelineList } from './missionShared';

export default function MissionHistory({ studentProfile, missionBoard, rewardHistory }) {
    const summary = missionBoard?.summary || {};
    const profile = studentProfile || {};
    const totalHistoryPoints = (rewardHistory || []).reduce((sum, item) => sum + Number(item.reward_points || 0), 0);

    const header = (
        <div className="rounded-3xl border border-white/20 bg-black/70 p-8 text-white shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200">
                        <History className="h-4 w-4" />
                        Mission History
                    </div>
                    <h1 className="text-4xl font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                        Every mission reward in one timeline
                    </h1>
                    <p className="mt-3 max-w-3xl text-base text-gray-300">
                        Follow every challenge payout, full-clear bonus, and streak milestone in chronological order.
                    </p>
                </div>
                <MissionPreviewStats summary={summary} profile={profile} totalHistoryPoints={totalHistoryPoints} />
            </div>
        </div>
    );

    return (
        <StudentLayout header={header}>
            <Head title="Mission History" />

            <div className="space-y-8">
                <div className="flex flex-wrap items-center gap-4">
                    <Link href={route('student.missions.index')} className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Mission Center
                    </Link>
                    <Link href={route('student.missions.archive')} className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                        Open Mission Archive
                    </Link>
                </div>

                <MissionSummaryGrid summary={summary} />

                <section className="rounded-3xl border border-white/20 bg-black/70 p-8 shadow-2xl backdrop-blur-md">
                    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-3">
                                <ScrollText className="h-5 w-5 text-emerald-300" />
                                <h2 className="text-2xl font-bold text-white">Full Reward Timeline</h2>
                            </div>
                            <p className="text-sm text-gray-300">
                                This includes direct mission rewards, full-clear bonuses, and streak milestone payouts.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-orange-400/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-200">
                            <div className="flex items-center gap-2">
                                <Flame className="h-4 w-4" />
                                {summary.mission_streak?.current_streak || 0} day mission streak live now
                            </div>
                        </div>
                    </div>

                    <RewardTimelineList rewards={rewardHistory} />
                </section>
            </div>
        </StudentLayout>
    );
}
