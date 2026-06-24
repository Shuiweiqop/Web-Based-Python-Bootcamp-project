import { Head } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { cn } from '@/utils/cn';
import { Crown, Medal, Trophy } from 'lucide-react';

const rankAccent = (rank) => {
    if (rank === 1) return 'text-yellow-300';
    if (rank === 2) return 'text-slate-200';
    if (rank === 3) return 'text-amber-500';
    return 'text-white/60';
};

const RankBadge = ({ rank }) => {
    if (rank === 1) return <Crown className={cn('h-5 w-5', rankAccent(1))} />;
    if (rank <= 3) return <Medal className={cn('h-5 w-5', rankAccent(rank))} />;
    return <span className="text-sm font-semibold text-white/60">#{rank}</span>;
};

export default function Leaderboard({ leaderboard = [], me }) {
    const header = (
        <div className="rounded-3xl border border-white/20 bg-black/70 p-8 text-white shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-4">
                <Trophy className="h-10 w-10 text-yellow-300" />
                <div>
                    <h1 className="text-2xl font-bold">Leaderboard</h1>
                    <p className="text-sm text-white/70">Top learners by points earned</p>
                </div>
            </div>

            {me && (
                <div className="mt-6 flex flex-wrap items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                    <span>
                        Your rank:{' '}
                        <strong className="text-yellow-300">#{me.rank}</strong>
                        <span className="text-white/50"> / {me.total_players}</span>
                    </span>
                    <span>
                        Points: <strong>{me.points}</strong>
                    </span>
                    <span>
                        Level: <strong>{me.level}</strong>
                    </span>
                </div>
            )}
        </div>
    );

    return (
        <StudentLayout header={header}>
            <Head title="Leaderboard" />

            <div className="rounded-3xl border border-white/20 bg-black/70 p-4 text-white shadow-2xl backdrop-blur-xl sm:p-6">
                {leaderboard.length === 0 ? (
                    <p className="py-12 text-center text-white/60">
                        No ranked learners yet — start earning points!
                    </p>
                ) : (
                    <ul className="divide-y divide-white/10">
                        {leaderboard.map((entry) => (
                            <li
                                key={entry.student_id}
                                className={cn(
                                    'flex items-center gap-4 px-2 py-3',
                                    entry.is_me && 'rounded-xl bg-yellow-300/10 ring-1 ring-yellow-300/40'
                                )}
                            >
                                <div className="flex w-10 justify-center">
                                    <RankBadge rank={entry.rank} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold">
                                        {entry.name}
                                        {entry.is_me && (
                                            <span className="ml-2 rounded-full bg-yellow-300/20 px-2 py-0.5 text-xs text-yellow-200">
                                                You
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-white/50">{entry.level}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{entry.points}</p>
                                    <p className="text-xs text-white/50">pts</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </StudentLayout>
    );
}
