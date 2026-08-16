import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MasteryBar from '@/Components/Mastery/MasteryBar';
import MasteryRadar from '@/Components/Mastery/MasteryRadar';
import { ArrowLeft } from 'lucide-react';

function pct(value) {
    return value === null || value === undefined ? '—' : `${Math.round(value * 100)}%`;
}

export default function AdminMasteryShow({ student, report }) {
    const { auth } = usePage().props;
    const { concepts, overall, gain, weaknesses, has_baseline, evidence_count } = report;

    const radarConcepts = concepts
        .filter((c) => c.attempts > 0)
        .map((c) => ({ ...c, short_name: c.name.split(/[\s&]+/)[0] }));

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{student.name}</h2>
                    <p className="mt-1 text-slate-600">Skill profile</p>
                </div>
            }
        >
            <Head title={`${student.name} — Skill profile`} />

            <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <Link
                    href={route('admin.mastery.index')}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to learning outcomes
                </Link>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <p className="text-xs font-medium text-slate-500">Overall mastery</p>
                        <p className="text-2xl font-bold tabular-nums text-slate-900">
                            {pct(overall)}
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <p className="text-xs font-medium text-slate-500">Since placement</p>
                        <p className="text-2xl font-bold tabular-nums text-slate-900">
                            {gain === null
                                ? '—'
                                : `${gain > 0 ? '+' : ''}${Math.round(gain * 100)}%`}
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <p className="text-xs font-medium text-slate-500">Answers analysed</p>
                        <p className="text-2xl font-bold tabular-nums text-slate-900">
                            {evidence_count}
                        </p>
                    </div>
                </div>

                {evidence_count === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                        <p className="text-sm text-slate-600">
                            This student has not answered any concept-tagged questions yet, so
                            there is nothing to report.
                        </p>
                    </div>
                ) : (
                    <>
                        {weaknesses.length > 0 && (
                            <section className="rounded-xl border border-rose-200 bg-rose-50/50 p-5">
                                <h3 className="text-sm font-semibold text-rose-900">
                                    Weakest topics
                                </h3>
                                <ul className="mt-3 space-y-2">
                                    {weaknesses.map((c) => (
                                        <li
                                            key={c.concept_id}
                                            className="flex items-center justify-between gap-3 text-sm"
                                        >
                                            <span className="truncate text-slate-800">{c.name}</span>
                                            <span className="shrink-0 font-semibold tabular-nums text-rose-600">
                                                {pct(c.mastery)} · {c.correct}/{c.attempts}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {radarConcepts.length >= 3 && (
                            <section className="rounded-xl border border-slate-200 bg-white p-6">
                                <h3 className="mb-4 text-base font-semibold text-slate-900">
                                    Skill shape
                                </h3>
                                <MasteryRadar concepts={radarConcepts} />
                            </section>
                        )}

                        <section className="rounded-xl border border-slate-200 bg-white p-6">
                            <h3 className="mb-2 text-base font-semibold text-slate-900">
                                Every topic
                            </h3>
                            <div className="divide-y divide-slate-100">
                                {concepts.map((concept) => (
                                    <MasteryBar
                                        key={concept.concept_id}
                                        concept={concept}
                                        showBaseline={has_baseline}
                                    />
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
