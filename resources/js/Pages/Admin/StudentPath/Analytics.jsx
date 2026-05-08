import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const PROGRESS_RANGE_ORDER = ['Not Started', '1-25%', '26-50%', '51-75%', '76-99%', 'Completed'];

const PROGRESS_COLORS = {
    'Not Started': 'bg-gray-400',
    '1-25%': 'bg-red-400',
    '26-50%': 'bg-orange-400',
    '51-75%': 'bg-yellow-400',
    '76-99%': 'bg-blue-400',
    'Completed': 'bg-green-500',
};

export default function Analytics({ auth, stats, progressDistribution, avgCompletionByPath, monthlyTrends }) {
    const distributionTotal = Object.values(progressDistribution ?? {}).reduce((a, b) => a + b, 0);

    const trendMax = Math.max(...(monthlyTrends ?? []).map((t) => t.total), 1);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Learning Path Analytics" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Learning Path Analytics
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Overview of student learning path assignments and progress
                            </p>
                        </div>
                        <Link
                            href={route('admin.student-paths.index')}
                            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            ← Back to Assignments
                        </Link>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            label="Total Assignments"
                            value={stats?.total_assignments ?? 0}
                            color="blue"
                        />
                        <StatCard
                            label="Active Assignments"
                            value={stats?.active_assignments ?? 0}
                            color="green"
                        />
                        <StatCard
                            label="Completion Rate"
                            value={`${stats?.completion_rate ?? 0}%`}
                            color="purple"
                        />
                    </div>

                    {/* Progress Distribution + Monthly Trends */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Progress Distribution */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Progress Distribution
                            </h2>
                            {distributionTotal === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No active assignments.</p>
                            ) : (
                                <div className="space-y-3">
                                    {PROGRESS_RANGE_ORDER.map((range) => {
                                        const count = progressDistribution?.[range] ?? 0;
                                        const pct = distributionTotal > 0 ? Math.round((count / distributionTotal) * 100) : 0;
                                        return (
                                            <div key={range}>
                                                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                    <span>{range}</span>
                                                    <span>{count} ({pct}%)</span>
                                                </div>
                                                <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${PROGRESS_COLORS[range] ?? 'bg-gray-400'}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Monthly Trends */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Monthly Trends (Last 12 Months)
                            </h2>
                            {(!monthlyTrends || monthlyTrends.length === 0) ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No data available.</p>
                            ) : (
                                <div className="flex items-end gap-1 h-40">
                                    {monthlyTrends.map((row) => (
                                        <div key={row.month} className="flex-1 flex flex-col items-center gap-1 group">
                                            <div className="relative w-full flex flex-col justify-end" style={{ height: '120px' }}>
                                                {/* Total bar */}
                                                <div
                                                    className="w-full bg-blue-200 dark:bg-blue-900 rounded-t relative"
                                                    style={{ height: `${Math.round((row.total / trendMax) * 120)}px` }}
                                                >
                                                    {/* Completed overlay */}
                                                    <div
                                                        className="absolute bottom-0 left-0 right-0 bg-blue-500 dark:bg-blue-400 rounded-t"
                                                        style={{ height: `${row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 rotate-45 origin-left whitespace-nowrap">
                                                {row.month}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    <span className="inline-block w-3 h-3 rounded bg-blue-200 dark:bg-blue-900" /> Assigned
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="inline-block w-3 h-3 rounded bg-blue-500 dark:bg-blue-400" /> Completed
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Avg Completion by Path */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Average Completion Time by Path
                        </h2>
                        {(!avgCompletionByPath || avgCompletionByPath.length === 0) ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No completed paths yet.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                                                Learning Path
                                            </th>
                                            <th className="text-right py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                                                Completions
                                            </th>
                                            <th className="text-right py-2 font-medium text-gray-700 dark:text-gray-300">
                                                Avg Days to Complete
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {avgCompletionByPath.map((row) => (
                                            <tr key={row.path_id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                                <td className="py-3 pr-4 text-gray-900 dark:text-white">
                                                    {row.title}
                                                </td>
                                                <td className="py-3 pr-4 text-right text-gray-600 dark:text-gray-400">
                                                    {row.completed_count}
                                                </td>
                                                <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                                                    {row.avg_completion_days} days
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ label, value, color }) {
    const colors = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
        green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
        purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
    };

    return (
        <div className={`rounded-xl border p-6 ${colors[color] ?? colors.blue}`}>
            <p className="text-sm font-medium opacity-80">{label}</p>
            <p className="mt-2 text-4xl font-bold">{value}</p>
        </div>
    );
}
