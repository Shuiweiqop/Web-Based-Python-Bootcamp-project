import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import MasteryBar from '@/Components/Mastery/MasteryBar';
import MasteryRadar from '@/Components/Mastery/MasteryRadar';
import { cn } from '@/utils/cn';
import { Brain, Target, TrendingUp, Sparkles, BookOpen } from 'lucide-react';

/** Percentage for display, or an em dash when the value is genuinely unknown. */
function pct(value) {
    return value === null || value === undefined ? '—' : `${Math.round(value * 100)}%`;
}

/*
 * StudentLayout renders on a dark animated background, and this project has no
 * `darkMode` set in tailwind.config.js — so `dark:` variants never activate.
 * Every surface here therefore uses the same explicit dark treatment the rest of
 * the student area uses (bg-black/70 + white text + backdrop blur), rather than
 * light-mode defaults with dark: overrides that would silently do nothing.
 */
function StatCard({ icon: Icon, label, value, hint, tone = 'indigo' }) {
    const tones = {
        indigo: 'text-indigo-300 bg-indigo-500/20',
        emerald: 'text-emerald-300 bg-emerald-500/20',
        amber: 'text-amber-300 bg-amber-500/20',
    };

    return (
        <div className="rounded-xl border border-white/20 bg-black/70 p-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
                <span className={cn('rounded-lg p-2', tones[tone])}>
                    <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-white/60">{label}</p>
                    <p className="text-xl font-bold tabular-nums text-white">{value}</p>
                </div>
            </div>
            {hint && <p className="mt-2 text-xs text-white/50">{hint}</p>}
        </div>
    );
}

export default function MasteryIndex({ report }) {
    const { concepts, overall, gain, strengths, weaknesses, has_baseline, evidence_count } = report;

    // Nothing measured yet: show what to do about it rather than a page of
    // zeroes, which would read as "you know nothing" instead of "we haven't
    // measured you yet".
    const hasEvidence = evidence_count > 0;

    // The radar needs comparable axes; concepts with no evidence would drag the
    // shape toward the centre and misrepresent the profile.
    const radarConcepts = concepts
        .filter((c) => c.attempts > 0)
        .map((c) => ({ ...c, short_name: c.name.split(/[\s&]+/)[0] }));

    return (
        <StudentLayout>
            <Head title="My Skills" />

            <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <header>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        <Brain className="h-6 w-6 text-indigo-300" />
                        My Python Skills
                    </h1>
                    <p className="mt-1 text-sm text-white/70 drop-shadow-lg">
                        Built from every question you answer. The more you practise, the more
                        accurate it gets.
                    </p>
                </header>

                {!hasEvidence ? (
                    <div className="rounded-xl border border-dashed border-white/30 bg-black/70 p-10 text-center shadow-2xl backdrop-blur-xl">
                        <BookOpen className="mx-auto h-10 w-10 text-white/50" />
                        <h2 className="mt-3 text-lg font-semibold text-white">
                            No skill data yet
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
                            Take the placement test or finish a lesson quiz, and your skill
                            profile will start building itself.
                        </p>
                        <Link
                            href={route('dashboard')}
                            className="mt-5 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                        >
                            Find something to learn
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <StatCard
                                icon={Target}
                                label="Overall mastery"
                                value={pct(overall)}
                                hint={
                                    overall === null
                                        ? 'Not enough practice to judge yet'
                                        : 'Across topics with enough evidence'
                                }
                            />
                            <StatCard
                                icon={TrendingUp}
                                tone="emerald"
                                label="Progress since start"
                                value={
                                    gain === null
                                        ? '—'
                                        : `${gain > 0 ? '+' : ''}${Math.round(gain * 100)}%`
                                }
                                hint={
                                    has_baseline
                                        ? 'Compared with your placement test'
                                        : 'Take the placement test to track progress'
                                }
                            />
                            <StatCard
                                icon={Sparkles}
                                tone="amber"
                                label="Questions answered"
                                value={evidence_count}
                                hint="Every answer sharpens the estimate"
                            />
                        </div>

                        {radarConcepts.length >= 3 && (
                            <section className="rounded-xl border border-white/20 bg-black/70 p-6 shadow-2xl backdrop-blur-xl">
                                <h2 className="mb-4 text-base font-semibold text-white">
                                    Your skill shape
                                </h2>
                                <MasteryRadar concepts={radarConcepts} theme="dark" />
                                {has_baseline && (
                                    <p className="mt-4 text-center text-xs text-white/60">
                                        <span className="mr-1 inline-block h-px w-4 border-t-2 border-dashed border-white/50 align-middle" />
                                        dashed = where you started
                                    </p>
                                )}
                            </section>
                        )}

                        {(weaknesses.length > 0 || strengths.length > 0) && (
                            <div className="grid gap-4 md:grid-cols-2">
                                {weaknesses.length > 0 && (
                                    <section className="rounded-xl border border-rose-400/40 bg-rose-500/15 p-5 backdrop-blur-xl">
                                        <h2 className="text-sm font-semibold text-rose-200">
                                            Focus on these next
                                        </h2>
                                        <ul className="mt-3 space-y-2">
                                            {weaknesses.map((c) => (
                                                <li
                                                    key={c.concept_id}
                                                    className="flex items-center justify-between gap-3 text-sm"
                                                >
                                                    <span className="truncate text-white/90">
                                                        {c.name}
                                                    </span>
                                                    <span className="shrink-0 font-semibold tabular-nums text-rose-300">
                                                        {pct(c.mastery)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}

                                {strengths.length > 0 && (
                                    <section className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 p-5 backdrop-blur-xl">
                                        <h2 className="text-sm font-semibold text-emerald-200">
                                            You've got these down
                                        </h2>
                                        <ul className="mt-3 space-y-2">
                                            {strengths.map((c) => (
                                                <li
                                                    key={c.concept_id}
                                                    className="flex items-center justify-between gap-3 text-sm"
                                                >
                                                    <span className="truncate text-white/90">
                                                        {c.name}
                                                    </span>
                                                    <span className="shrink-0 font-semibold tabular-nums text-emerald-300">
                                                        {pct(c.mastery)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}
                            </div>
                        )}

                        <section className="rounded-xl border border-white/20 bg-black/70 p-6 shadow-2xl backdrop-blur-xl">
                            <h2 className="mb-2 text-base font-semibold text-white">
                                Every topic
                            </h2>
                            <div className="divide-y divide-white/10">
                                {concepts.map((concept) => (
                                    <MasteryBar
                                        key={concept.concept_id}
                                        concept={concept}
                                        showBaseline={has_baseline}
                                        theme="dark"
                                    />
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </StudentLayout>
    );
}
