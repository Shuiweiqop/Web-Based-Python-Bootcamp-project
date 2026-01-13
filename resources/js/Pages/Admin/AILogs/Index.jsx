import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    MessageSquare, 
    Search, 
    Filter, 
    Calendar,
    User,
    BookOpen,
    TrendingUp,
    Eye,
    Download,
    RefreshCw
} from 'lucide-react';

export default function AILogsIndex({ logs, stats, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.ai-logs.index'), { search: searchQuery }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        router.get(route('admin.ai-logs.index'));
        setSearchQuery('');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            AI Chat Logs
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Monitor and analyze student AI interactions
                        </p>
                    </div>
                    <button
                        onClick={() => router.reload()}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            }
        >
            <Head title="AI Chat Logs" />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                    icon={MessageSquare}
                    title="Total Queries"
                    value={stats.total_queries}
                    gradient="from-purple-500 to-cyan-500"
                />
                <StatCard
                    icon={TrendingUp}
                    title="Today's Queries"
                    value={stats.today_queries}
                    gradient="from-cyan-500 to-blue-500"
                />
                <StatCard
                    icon={User}
                    title="Active Students"
                    value={stats.unique_students}
                    gradient="from-blue-500 to-purple-500"
                />
                <StatCard
                    icon={BookOpen}
                    title="Avg per Student"
                    value={stats.avg_per_student}
                    gradient="from-purple-500 to-pink-500"
                />
            </div>

            {/* Search and Filters */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-6">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search prompts or responses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-medium"
                        >
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-4 py-3 bg-slate-800 border border-white/10 text-white rounded-lg hover:bg-slate-700 transition-all"
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                        {(filters?.search || filters?.student_id || filters?.lesson_id) && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="px-4 py-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </form>

                {/* Advanced Filters (Collapsible) */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Date From
                            </label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Date To
                            </label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Lesson
                            </label>
                            <select className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option value="">All Lessons</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Logs Table */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                    Student
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                    Lesson
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                    Question
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                    Time
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {logs.data.map((log) => (
                                <tr
                                    key={log.ai_session_log_id}
                                    className="hover:bg-white/5 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                                <span className="text-xs font-bold text-white">
                                                    {log.student?.user?.name?.charAt(0).toUpperCase() || 'S'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    {log.student?.user?.name || 'Unknown'}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {log.student?.user?.email || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.lesson ? (
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-cyan-400" />
                                                <span className="text-sm text-slate-300">
                                                    {log.lesson.title}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-500">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-300 line-clamp-2 max-w-md">
                                            {log.prompt}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-500" />
                                            <span className="text-xs text-slate-400">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link
                                            href={route('admin.ai-logs.session', log.ai_session_id)}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/50 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all text-sm"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Session
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {logs.links && (
                    <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                        <div className="text-sm text-slate-400">
                            Showing <span className="font-medium text-white">{logs.from}</span> to{' '}
                            <span className="font-medium text-white">{logs.to}</span> of{' '}
                            <span className="font-medium text-white">{logs.total}</span> results
                        </div>
                        <div className="flex gap-2">
                            {logs.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    preserveState
                                    preserveScroll
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                        link.active
                                            ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                                            : link.url
                                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                            : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

// Statistics Card Component
function StatCard({ icon: Icon, title, value, gradient }) {
    return (
        <div className="relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300`} />
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
                <p className="text-sm text-slate-400 mb-1">{title}</p>
                <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
            </div>
        </div>
    );
}