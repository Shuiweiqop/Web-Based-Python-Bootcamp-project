import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const actionDescriptions = {
    exercise_completed: 'Counts successful exercise completions.',
    test_passed: 'Counts passed lesson tests only.',
    forum_reply_created: 'Counts forum replies created by students.',
};

export default function Index({ definitions, stats, options }) {
    const flash = usePage().props.flash || {};

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Mission Configuration</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Tune daily and weekly challenge rules without touching migrations or manual SQL.
                    </p>
                </div>
            }
        >
            <Head title="Mission Configuration" />

            <div className="space-y-6">
                <section className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
                    <StatCard label="Definitions" value={stats.total_definitions} tone="slate" />
                    <StatCard label="Active" value={stats.active_definitions} tone="emerald" />
                    <StatCard label="Daily Live" value={stats.daily_definitions} tone="amber" />
                    <StatCard label="Weekly Live" value={stats.weekly_definitions} tone="blue" />
                    <StatCard label="Progress Rows" value={stats.progress_rows} tone="purple" />
                    <StatCard label="Bonus Rewards" value={stats.bonus_rewards_issued} tone="rose" />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Challenge Definitions</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                `code` stays fixed so existing progress and event history keep pointing at the same mission.
                            </p>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                            Full-clear bonus and streak milestone values still live in `DailyChallengeService`.
                        </div>
                    </div>

                    {flash.success ? (
                        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            {flash.success}
                        </div>
                    ) : null}

                    <div className="mt-6 space-y-4">
                        {definitions.map((definition) => (
                            <ChallengeEditor
                                key={definition.id}
                                definition={definition}
                                periodOptions={options.period_types}
                                actionOptions={options.action_types}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ label, value, tone }) {
    const tones = {
        slate: 'border-slate-200 bg-slate-50 text-slate-900',
        emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
        amber: 'border-amber-200 bg-amber-50 text-amber-900',
        blue: 'border-blue-200 bg-blue-50 text-blue-900',
        purple: 'border-purple-200 bg-purple-50 text-purple-900',
        rose: 'border-rose-200 bg-rose-50 text-rose-900',
    };

    return (
        <div className={`rounded-2xl border p-4 shadow-sm ${tones[tone] || tones.slate}`}>
            <p className="text-sm font-medium opacity-80">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
    );
}

function ChallengeEditor({ definition, periodOptions, actionOptions }) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        title: definition.title || '',
        description: definition.description || '',
        period_type: definition.period_type,
        action_type: definition.action_type,
        target_count: definition.target_count,
        reward_points: definition.reward_points,
        is_active: Boolean(definition.is_active),
        display_order: definition.display_order,
    });

    const handleSubmit = (event) => {
        event.preventDefault();

        put(route('admin.daily-challenges.update', definition.id), {
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-semibold text-slate-900">{definition.code}</h4>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${data.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                            {data.is_active ? 'Active' : 'Paused'}
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                        {actionDescriptions[data.action_type] || 'Mission tracking rule.'}
                    </p>
                </div>
                <div className="text-sm text-slate-500">
                    Last updated: {definition.updated_at ? new Date(definition.updated_at).toLocaleString() : 'N/A'}
                </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Mission Title" error={errors.title} className="xl:col-span-2">
                    <input
                        type="text"
                        value={data.title}
                        onChange={(event) => setData('title', event.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </Field>

                <Field label="Period" error={errors.period_type}>
                    <select
                        value={data.period_type}
                        onChange={(event) => setData('period_type', event.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                        {Object.entries(periodOptions).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Action" error={errors.action_type}>
                    <select
                        value={data.action_type}
                        onChange={(event) => setData('action_type', event.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                        {Object.entries(actionOptions).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Description" error={errors.description} className="md:col-span-2 xl:col-span-4">
                    <textarea
                        value={data.description}
                        onChange={(event) => setData('description', event.target.value)}
                        rows={2}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </Field>

                <Field label="Target Count" error={errors.target_count}>
                    <input
                        type="number"
                        min="1"
                        value={data.target_count}
                        onChange={(event) => setData('target_count', Number(event.target.value))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </Field>

                <Field label="Reward Points" error={errors.reward_points}>
                    <input
                        type="number"
                        min="0"
                        value={data.reward_points}
                        onChange={(event) => setData('reward_points', Number(event.target.value))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </Field>

                <Field label="Display Order" error={errors.display_order}>
                    <input
                        type="number"
                        min="0"
                        value={data.display_order}
                        onChange={(event) => setData('display_order', Number(event.target.value))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </Field>

                <Field label="Status" error={errors.is_active}>
                    <label className="flex h-[42px] items-center gap-3 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(event) => setData('is_active', event.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{data.is_active ? 'Students can earn this now' : 'Hidden from the live mission board'}</span>
                    </label>
                </Field>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500">
                    Progress history stays attached to this definition ID, so edit carefully when repurposing a live mission.
                </div>
                <div className="flex items-center gap-3">
                    {recentlySuccessful ? (
                        <span className="text-sm font-medium text-emerald-700">Saved</span>
                    ) : null}
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Saving...' : 'Save Mission'}
                    </button>
                </div>
            </div>
        </form>
    );
}

function Field({ label, error, className = '', children }) {
    return (
        <label className={`block ${className}`}>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
            {children}
            {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
        </label>
    );
}
