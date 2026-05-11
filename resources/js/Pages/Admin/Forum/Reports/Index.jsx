import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Shield, AlertTriangle, CheckCircle, XCircle, Clock, 
    Eye, ChevronDown, MessageSquare, FileText, ArrowLeft 
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Index({ auth, reports, stats, filters, reasons = {}, statuses = {} }) {
    const [selectedReports, setSelectedReports] = useState([]);
    
    // 从 localStorage 读取主题
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            return saved ? saved === 'dark' : true;
        }
        return true;
    });

    // 监听主题变化（优化版）
    useEffect(() => {
        const handleThemeChange = () => {
            const saved = localStorage.getItem('theme');
            setIsDark(saved === 'dark');
        };

        window.addEventListener('theme-changed', handleThemeChange);
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme') {
                setIsDark(e.newValue === 'dark');
            }
        });

        return () => {
            window.removeEventListener('theme-changed', handleThemeChange);
            window.removeEventListener('storage', handleThemeChange);
        };
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInMins = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMs / 3600000);
        const diffInDays = Math.floor(diffInMs / 86400000);

        if (diffInMins < 60) return `${diffInMins}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return date.toLocaleDateString();
    };

    const getStatusConfig = (status) => {
        const statusConfig = statuses && statuses[status] ? statuses[status] : {};
        const configs = {
            pending: {
                bg: isDark ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: '⏳',
                label: 'Pending'
            },
            reviewing: {
                bg: isDark ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-200',
                icon: '👁️',
                label: 'Reviewing'
            },
            resolved: {
                bg: isDark ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-green-100 text-green-800 border-green-200',
                icon: '✅',
                label: 'Resolved'
            },
            dismissed: {
                bg: isDark ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' : 'bg-gray-100 text-gray-800 border-gray-200',
                icon: '❌',
                label: 'Dismissed'
            }
        };

        return configs[status] || {
            bg: isDark ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' : 'bg-gray-100 text-gray-800 border-gray-200',
            icon: statusConfig.icon || '❓',
            label: statusConfig.label || status
        };
    };

    const getReasonBadge = (reason) => {
        const reasonConfig = reasons && reasons[reason] ? reasons[reason] : {};
        const icon = reasonConfig.icon || '⚠️';
        const label = reasonConfig.label || reason;

        return (
            <span className={cn(
                "inline-flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs font-medium border",
                isDark ? "bg-orange-500/20 text-orange-300 border-orange-500/30" : "bg-orange-100 text-orange-700 border-orange-200"
            )}>
                <span>{icon}</span>
                <span>{label}</span>
            </span>
        );
    };

    const handleBatchUpdate = (status) => {
        if (selectedReports.length === 0) {
            alert('Please select at least one report');
            return;
        }

        if (confirm(`Update ${selectedReports.length} report(s) to ${status}?`)) {
            router.post(route('admin.forum.reports.batch-update'), {
                report_ids: selectedReports,
                status: status,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedReports([]);
                }
            });
        }
    };

    const toggleSelectAll = () => {
        if (selectedReports.length === reports.data.length) {
            setSelectedReports([]);
        } else {
            setSelectedReports(reports.data.map(r => r.report_id));
        }
    };

    const toggleSelect = (reportId) => {
        if (selectedReports.includes(reportId)) {
            setSelectedReports(selectedReports.filter(id => id !== reportId));
        } else {
            setSelectedReports([...selectedReports, reportId]);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                            <Shield className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
                            Forum Reports
                        </h2>
                        <p className="mt-2 text-xs md:text-sm opacity-90">
                            Manage user reports and content moderation
                        </p>
                    </div>
                    <Link
                        href={route('forum.index')}
                        className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:shadow-lg transition-all font-semibold inline-flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Forum
                    </Link>
                </div>
            }
        >
            <Head title="Forum Reports" />

            <div className={cn(
                "min-h-screen transition-colors duration-500",
                isDark ? "bg-slate-950" : "bg-gradient-to-br from-blue-50 via-purple-50 to-slate-50"
            )}>
                {/* Animated Background */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    {isDark ? (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
                            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
                        </>
                    ) : (
                        <>
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
                            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
                        </>
                    )}
                </div>

                <div className="py-8 md:py-12">
                    <div className="max-w-7xl mx-auto px-4 md:px-6">
                        
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8">
                            <StatCard icon={AlertTriangle} label="Total" value={stats.total} color="gray" isDark={isDark} />
                            <StatCard icon={Clock} label="Pending" value={stats.pending} color="yellow" isDark={isDark} />
                            <StatCard icon={Eye} label="Reviewing" value={stats.reviewing} color="blue" isDark={isDark} />
                            <StatCard icon={CheckCircle} label="Resolved" value={stats.resolved} color="green" isDark={isDark} />
                            <StatCard icon={XCircle} label="Dismissed" value={stats.dismissed} color="gray" isDark={isDark} />
                        </div>

                        {/* Filters */}
                        <div className={cn(
                            "rounded-2xl shadow-lg border p-4 md:p-6 mb-8 backdrop-blur-sm animate-fadeIn",
                            isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                        )}>
                            <div className="flex flex-wrap gap-3 md:gap-4">
                                {/* Status Filter */}
                                <div className="relative flex-1 min-w-[150px]">
                                    <select
                                        value={filters.status}
                                        onChange={(e) => router.get(route('admin.forum.reports.index'), { ...filters, status: e.target.value })}
                                        className={cn(
                                            "appearance-none w-full pl-4 pr-10 py-3 rounded-lg transition-all outline-none",
                                            isDark
                                                ? "bg-slate-800 border-2 border-white/10 text-white focus:border-cyan-500/50"
                                                : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
                                        )}
                                    >
                                        <option value="all">All Status</option>
                                        {statuses && Object.entries(statuses).map(([key, value]) => (
                                            <option key={key} value={key}>
                                                {value.icon} {value.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className={cn(
                                        "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none",
                                        isDark ? "text-slate-400" : "text-gray-400"
                                    )} />
                                </div>

                                {/* Type Filter */}
                                <div className="relative flex-1 min-w-[150px]">
                                    <select
                                        value={filters.type}
                                        onChange={(e) => router.get(route('admin.forum.reports.index'), { ...filters, type: e.target.value })}
                                        className={cn(
                                            "appearance-none w-full pl-4 pr-10 py-3 rounded-lg transition-all outline-none",
                                            isDark
                                                ? "bg-slate-800 border-2 border-white/10 text-white focus:border-cyan-500/50"
                                                : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
                                        )}
                                    >
                                        <option value="all">All Types</option>
                                        <option value="post">📝 Posts</option>
                                        <option value="reply">💬 Replies</option>
                                    </select>
                                    <ChevronDown className={cn(
                                        "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none",
                                        isDark ? "text-slate-400" : "text-gray-400"
                                    )} />
                                </div>

                                {/* Reason Filter */}
                                <div className="relative flex-1 min-w-[150px]">
                                    <select
                                        value={filters.reason}
                                        onChange={(e) => router.get(route('admin.forum.reports.index'), { ...filters, reason: e.target.value })}
                                        className={cn(
                                            "appearance-none w-full pl-4 pr-10 py-3 rounded-lg transition-all outline-none",
                                            isDark
                                                ? "bg-slate-800 border-2 border-white/10 text-white focus:border-cyan-500/50"
                                                : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
                                        )}
                                    >
                                        <option value="all">All Reasons</option>
                                        {reasons && Object.entries(reasons).map(([key, value]) => (
                                            <option key={key} value={key}>
                                                {value.icon} {value.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className={cn(
                                        "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none",
                                        isDark ? "text-slate-400" : "text-gray-400"
                                    )} />
                                </div>

                                {/* Clear Filters */}
                                {(filters.status !== 'all' || filters.type !== 'all' || filters.reason !== 'all') && (
                                    <button
                                        onClick={() => router.get(route('admin.forum.reports.index'))}
                                        className={cn(
                                            "px-4 py-3 rounded-lg transition-all font-medium",
                                            isDark 
                                                ? "text-slate-300 hover:text-white hover:bg-white/10" 
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                        )}
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Batch Actions */}
                        {selectedReports.length > 0 && (
                            <div className={cn(
                                "rounded-2xl shadow-lg border p-4 md:p-6 mb-8 backdrop-blur-sm animate-fadeIn",
                                isDark ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-200"
                            )}>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <span className={cn("font-semibold", isDark ? "text-blue-300" : "text-blue-800")}>
                                        {selectedReports.length} report(s) selected
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => handleBatchUpdate('reviewing')}
                                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
                                        >
                                            👁️ Reviewing
                                        </button>
                                        <button
                                            onClick={() => handleBatchUpdate('resolved')}
                                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
                                        >
                                            ✅ Resolved
                                        </button>
                                        <button
                                            onClick={() => handleBatchUpdate('dismissed')}
                                            className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
                                        >
                                            ❌ Dismiss
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reports List (Cards for mobile, table for desktop) */}
                        <div className="space-y-4">
                            {reports.data.length === 0 ? (
                                <div className={cn(
                                    "text-center py-12 md:py-16 rounded-2xl shadow-lg border animate-fadeIn",
                                    isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                                )}>
                                    <AlertTriangle className={cn(
                                        "w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4",
                                        isDark ? "text-slate-600" : "text-gray-400"
                                    )} />
                                    <p className={cn("text-base md:text-lg font-medium mb-2", isDark ? "text-slate-300" : "text-gray-900")}>
                                        No reports found
                                    </p>
                                    <p className={cn("text-sm", isDark ? "text-slate-500" : "text-gray-500")}>
                                        There are no reports matching your filters
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Mobile Cards */}
                                    <div className="lg:hidden space-y-4">
                                        {reports.data.map((report) => (
                                            <ReportCard
                                                key={report.report_id}
                                                report={report}
                                                isDark={isDark}
                                                isSelected={selectedReports.includes(report.report_id)}
                                                onToggleSelect={() => toggleSelect(report.report_id)}
                                                getStatusConfig={getStatusConfig}
                                                getReasonBadge={getReasonBadge}
                                                formatDate={formatDate}
                                            />
                                        ))}
                                    </div>

                                    {/* Desktop Table */}
                                    <div className={cn(
                                        "hidden lg:block rounded-2xl shadow-lg border backdrop-blur-sm overflow-hidden animate-fadeIn",
                                        isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                                    )}>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className={isDark ? "bg-slate-800/50" : "bg-gray-50"}>
                                                    <tr>
                                                        <th className="px-6 py-4 text-left">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedReports.length === reports.data.length && reports.data.length > 0}
                                                                onChange={toggleSelectAll}
                                                                className={cn(
                                                                    "w-4 h-4 rounded transition-all",
                                                                    isDark 
                                                                        ? "bg-slate-800 border-white/10 text-red-500 focus:ring-red-500/50" 
                                                                        : "border-gray-300 text-red-600 focus:ring-red-500"
                                                                )}
                                                            />
                                                        </th>
                                                        <th className={cn("px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                                                            Status
                                                        </th>
                                                        <th className={cn("px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                                                            Type
                                                        </th>
                                                        <th className={cn("px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                                                            Reason
                                                        </th>
                                                        <th className={cn("px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                                                            Reporter
                                                        </th>
                                                        <th className={cn("px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                                                            Content
                                                        </th>
                                                        <th className={cn("px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                                                            Date
                                                        </th>
                                                        <th className={cn("px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-gray-600")}>
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className={cn("divide-y", isDark ? "divide-white/10" : "divide-gray-200")}>
                                                    {reports.data.map((report) => (
                                                        <ReportTableRow
                                                            key={report.report_id}
                                                            report={report}
                                                            isDark={isDark}
                                                            isSelected={selectedReports.includes(report.report_id)}
                                                            onToggleSelect={() => toggleSelect(report.report_id)}
                                                            getStatusConfig={getStatusConfig}
                                                            getReasonBadge={getReasonBadge}
                                                            formatDate={formatDate}
                                                        />
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Pagination */}
                                    {reports.links && reports.links.length > 3 && (
                                        <div className={cn(
                                            "rounded-2xl shadow-lg border px-4 md:px-6 py-4 backdrop-blur-sm",
                                            isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                                        )}>
                                            <div className="flex flex-wrap justify-center gap-2">
                                                {reports.links.map((link, index) => (
                                                    link.url ? (
                                                        <Link
                                                            key={index}
                                                            href={link.url}
                                                            className={cn(
                                                                "px-4 py-2 rounded-lg font-medium transition-all",
                                                                link.active
                                                                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                                                                    : isDark 
                                                                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10'
                                                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                                            )}
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    ) : (
                                                        <span
                                                            key={index}
                                                            className={cn(
                                                                "px-4 py-2 rounded-lg cursor-not-allowed",
                                                                isDark ? "bg-slate-800/50 text-slate-600" : "bg-gray-100 text-gray-400"
                                                            )}
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color, isDark }) {
    const colorClasses = {
        gray: isDark ? 'from-gray-500/20 to-slate-500/20 border-gray-500/30' : 'from-gray-50 to-slate-50 border-gray-200',
        yellow: isDark ? 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30' : 'from-yellow-50 to-amber-50 border-yellow-200',
        blue: isDark ? 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' : 'from-blue-50 to-cyan-50 border-blue-200',
        green: isDark ? 'from-green-500/20 to-emerald-500/20 border-green-500/30' : 'from-green-50 to-emerald-50 border-green-200',
    };

    const iconColorClasses = {
        gray: isDark ? 'text-gray-400' : 'text-gray-600',
        yellow: isDark ? 'text-yellow-400' : 'text-yellow-600',
        blue: isDark ? 'text-blue-400' : 'text-blue-600',
        green: isDark ? 'text-green-400' : 'text-green-600',
    };

    return (
        <div className={cn(
            "rounded-2xl shadow-lg border p-3 md:p-4 backdrop-blur-sm animate-fadeIn bg-gradient-to-br",
            colorClasses[color]
        )}>
            <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-medium mb-1", isDark ? "text-slate-400" : "text-gray-600")}>
                        {label}
                    </p>
                    <p className={cn("text-xl md:text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                        {value}
                    </p>
                </div>
                <Icon className={cn("w-6 h-6 md:w-8 md:h-8 flex-shrink-0", iconColorClasses[color])} />
            </div>
        </div>
    );
}

// Report Card Component (Mobile)
function ReportCard({ report, isDark, isSelected, onToggleSelect, getStatusConfig, getReasonBadge, formatDate }) {
    const statusConfig = getStatusConfig(report.status);

    return (
        <div className={cn(
            "rounded-2xl shadow-lg border backdrop-blur-sm p-4 animate-fadeIn",
            isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
        )}>
            <div className="flex items-start justify-between mb-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onToggleSelect}
                    className={cn(
                        "w-4 h-4 rounded transition-all mt-1",
                        isDark 
                            ? "bg-slate-800 border-white/10 text-red-500 focus:ring-red-500/50" 
                            : "border-gray-300 text-red-600 focus:ring-red-500"
                    )}
                />
                <span className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border inline-flex items-center gap-1.5",
                    statusConfig.bg
                )}>
                    <span>{statusConfig.icon}</span>
                    <span>{statusConfig.label}</span>
                </span>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                        "px-2 py-1 rounded-lg text-xs font-medium capitalize",
                        isDark ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-gray-700"
                    )}>
                        {report.reportable_type === 'post' ? '📝' : '💬'} {report.reportable_type}
                    </span>
                    {getReasonBadge(report.reason)}
                </div>

                <div>
                    <p className={cn("text-xs mb-1", isDark ? "text-slate-500" : "text-gray-500")}>
                        Reporter
                    </p>
                    <p className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                        {report.reporter?.name}
                    </p>
                </div>

                <div>
                    <p className={cn("text-xs mb-1", isDark ? "text-slate-500" : "text-gray-500")}>
                        Content
                    </p>
                    <p className={cn("text-sm line-clamp-2", isDark ? "text-slate-300" : "text-gray-700")}>
                        {report.post?.title || report.reply?.content || 'N/A'}
                    </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <span className={cn("text-xs", isDark ? "text-slate-500" : "text-gray-500")}>
                        {formatDate(report.created_at)}
                    </span>
                    <Link
                        href={route('admin.forum.reports.show', report.report_id)}
                        className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all",
                            isDark 
                                ? "bg-red-500/20 text-red-300 hover:bg-red-500/30" 
                                : "bg-red-50 text-red-600 hover:bg-red-100"
                        )}
                    >
                        <Eye className="w-4 h-4" />
                        View
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Report Table Row Component (Desktop)
function ReportTableRow({ report, isDark, isSelected, onToggleSelect, getStatusConfig, getReasonBadge, formatDate }) {
    const statusConfig = getStatusConfig(report.status);

    return (
        <tr className={cn("transition-colors", isDark ? "hover:bg-slate-800/30" : "hover:bg-gray-50")}>
            <td className="px-6 py-4">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onToggleSelect}
                    className={cn(
                        "w-4 h-4 rounded transition-all",
                        isDark 
                            ? "bg-slate-800 border-white/10 text-red-500 focus:ring-red-500/50" 
                            : "border-gray-300 text-red-600 focus:ring-red-500"
                    )}
                />
            </td>
            <td className="px-6 py-4">
                <span className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border inline-flex items-center gap-1.5",
                    statusConfig.bg
                )}>
                    <span>{statusConfig.icon}</span>
                    <span>{statusConfig.label}</span>
                </span>
            </td>
            <td className="px-6 py-4">
                <span className={cn(
                    "px-2 py-1 rounded-lg text-xs font-medium capitalize",
                    isDark ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-gray-700"
                )}>
                    {report.reportable_type === 'post' ? '📝' : '💬'} {report.reportable_type}
                </span>
            </td>
            <td className="px-6 py-4">{getReasonBadge(report.reason)}</td>
            <td className="px-6 py-4">
                <p className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                    {report.reporter?.name}
                </p>
            </td>
            <td className="px-6 py-4">
                <p className={cn("text-sm max-w-xs truncate", isDark ? "text-slate-400" : "text-gray-600")}>
                    {report.post?.title || report.reply?.content?.substring(0, 50) || 'N/A'}
                </p>
            </td>
            <td className={cn("px-6 py-4 text-sm", isDark ? "text-slate-400" : "text-gray-600")}>
                {formatDate(report.created_at)}
            </td>
            <td className="px-6 py-4 text-right">
                <Link
                    href={route('admin.forum.reports.show', report.report_id)}
                    className={cn(
                        "inline-flex items-center gap-1.5 font-medium text-sm transition-all",
                        isDark ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-800"
                    )}
                >
                    <Eye className="w-4 h-4" />
                    View
                </Link>
            </td>
        </tr>
    );
}