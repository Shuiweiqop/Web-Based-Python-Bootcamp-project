import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { cn } from '@/utils/cn';
import { AlertTriangle, Brain, TrendingUp, Users } from 'lucide-react';

function pct(value) {
    return value === null || value === undefined ? '—' : `${Math.round(value * 100)}%`;
}

/**
 * Colour scale for a concept's cohort average.
 *
 * Null is grey, not red: "nobody has practised this" and "everyone is failing
 * this" call for opposite responses from a teacher, so they must not look alike.
 */
function heatClass(value, thresholds) {
    if (value === null || value === undefined) return 'bg-slate-100 dark:bg-slate-700';
    if (value >= thresholds.mastered) return 'bg-emerald-500';
    if (value >= thresholds.weak) return 'bg-amber-400';

    return 'bg-rose-500';
}

function StatCard({ icon: Icon, label, value, hint }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
                <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-slate-500">{label}</p>
                    <p className="text-2xl font-bold tabular-nums text-slate-900">{value}</p>
                </div>
            </div>
            {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
        </div>
    );
}

export default function AdminMasteryIndex({ summary, concepts, atRisk, thresholds }) {
    const { auth } = usePage().props;
    const measured = summary.students_measured > 0;

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <div>
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                        <Brain className="h-6 w-6 text-indigo-500" />
                        Learning Outcomes
                    </h2>
                    <p className="mt-1 text-slate-600">
                        What students actually know, measured per concept
                    </p>
                </div>
            }
        >
            <Head title="Learning Outcomes" />

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={Users}
                        label="Students tracked"
                        value={summary.students_tracked}
                        hint={`${summary.students_with_evidence} with practice data`}
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Average improvement"
                        value={
                            summary.avg_gain === null
                                ? '—'
                                : `${summary.avg_gain > 0 ? '+' : ''}${Math.round(summary.avg_gain * 100)}%`
                        }
                        hint="Against each student's own placement baseline"
                    />
                    <StatCard
                        icon={Brain}
                        label="Students improved"
                        value={
                            measured
                                ? `${summary.students_improved}/${summary.students_measured}`
                                : '—'
                        }
                        hint="Gained mastery since placement"
                    />
                    <StatCard
                        icon={AlertTriangle}
                        label="Answers analysed"
                        value={summary.total_evidence}
                        hint="Evidence behind these estimates"
                    />
                </div>

                <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <h3 className="text-base font-semibold text-slate-900">Concept difficulty</h3>
                    <p className="mt-1 text-sm text-slate-600">
                        Average mastery across every student who has practised the topic. Low bars
                        are where the cohort is stuck.
                    </p>

                    <div className="mt-5 space-y-3">
                        {concepts.map((concept) => (
                            <div key={concept.concept_id} className="flex items-center gap-3">
                                <span className="w-44 shrink-0 truncate text-sm text-slate-700">
                                    {concept.name}
                                </span>

                                <div className="h-6 flex-1 overflow-hidden rounded bg-slate-100">
                                    {concept.avg_mastery !== null && (
                                        <div
                                            className={cn(
                                                'h-full rounded transition-all',
                                                heatClass(concept.avg_mastery, thresholds),
                                            )}
                                            style={{ width: `${concept.avg_mastery * 100}%` }}
                                        />
                                    )}
                                </div>

                                <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums text-slate-900">
                                    {pct(concept.avg_mastery)}
                                </span>

                                <span className="w-32 shrink-0 text-right text-xs text-slate-500">
                                    {concept.learners === 0
                                        ? 'no data'
                                        : `${concept.struggling}/${concept.learners} struggling`}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <h3 className="text-base font-semibold text-slate-900">
                        Students needing attention
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                        Ranked by how many concepts they are weak in — a student failing four
                        topics needs help before one slightly below average everywhere.
                    </p>

                    {atRisk.length === 0 ? (
                        <p className="mt-5 rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">
                            No students are flagged. Either everyone is doing well, or there is not
                            yet enough practice data to tell.
                        </p>
                    ) : (
                        <div className="mt-5 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                                        <th className="pb-2 pr-4 font-medium">Student</th>
                                        <th className="pb-2 pr-4 font-medium">Weak concepts</th>
                                        <th className="pb-2 pr-4 font-medium">Avg. mastery there</th>
                                        <th className="pb-2 font-medium" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {atRisk.map((student) => (
                                        <tr key={student.student_id}>
                                            <td className="py-3 pr-4 font-medium text-slate-900">
                                                {student.name}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                                                    {student.weak_concepts}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 tabular-nums text-slate-700">
                                                {pct(student.avg_weak_mastery)}
                                            </td>
                                            <td className="py-3 text-right">
                                                <Link
                                                    href={route('admin.mastery.show', student.student_id)}
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                                >
                                                    View profile
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
