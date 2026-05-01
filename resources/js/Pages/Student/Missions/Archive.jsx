import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { Archive as ArchiveIcon, ArrowLeft, Layers3, ScrollText } from 'lucide-react';
import { MissionPreviewStats, MissionSummaryGrid, PeriodArchiveList } from './missionShared';

export default function MissionArchive({ studentProfile, missionBoard, periodHistory }) {
    const summary = missionBoard?.summary || {};
    const profile = studentProfile || {};
    const totalArchivePoints = (periodHistory || []).reduce(
        (sum, item) => sum + Number(item.reward_points_earned || 0) + Number(item.bonus_points_earned || 0),
        0
    );

    const header = (
        <div className="rounded-3xl border border-white/20 bg-black/70 p-8 text-white shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-200">
                        <ArchiveIcon className="h-4 w-4" />
                        Mission Archive
                    </div>
                    <h1 className="text-4xl font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                        Recent mission cycles, preserved
                    </h1>
                    <p className="mt-3 max-w-3xl text-base text-gray-300">
                        Review how each daily or weekly cycle ended, what you cleared, and where bonus points landed.
                    </p>
                </div>
                <MissionPreviewStats summary={summary} profile={profile} totalHistoryPoints={totalArchivePoints} />
            </div>
        </div>
    );

    return (
        <StudentLayout header={header}>
            <Head title="Mission Archive" />

            <div className="space-y-8">
                <div className="flex flex-wrap items-center gap-4">
                    <Link href={route('student.missions.index')} className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Mission Center
                    </Link>
                    <Link href={route('student.missions.history')} className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                        Open Mission History
                    </Link>
                </div>

                <MissionSummaryGrid summary={summary} />

                <section className="rounded-3xl border border-white/20 bg-black/70 p-8 shadow-2xl backdrop-blur-md">
                    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-3">
                                <Layers3 className="h-5 w-5 text-purple-300" />
                                <h2 className="text-2xl font-bold text-white">Cycle Archive</h2>
                            </div>
                            <p className="text-sm text-gray-300">
                                Each card shows one closed or in-progress cycle with mission counts, points earned, and bonus outcomes.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-3 text-sm text-purple-200">
                            <div className="flex items-center gap-2">
                                <ScrollText className="h-4 w-4" />
                                {periodHistory?.length || 0} recent cycles loaded
                            </div>
                        </div>
                    </div>

                    <PeriodArchiveList periods={periodHistory} />
                </section>
            </div>
        </StudentLayout>
    );
}
