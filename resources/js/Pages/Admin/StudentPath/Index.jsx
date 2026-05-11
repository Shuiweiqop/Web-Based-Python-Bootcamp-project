import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import { 
    Search,
    Filter,
    Users,
    CheckCircle,
    Clock,
    AlertTriangle,
    Plus,
    Eye,
    TrendingUp,
    Award,
    Calendar,
    User
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Index({ auth, assignments, stats, paths, filters, statusOptions, assignedByOptions }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedPath, setSelectedPath] = useState(filters.path_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedAssignedBy, setSelectedAssignedBy] = useState(filters.assigned_by || '');
    const [overdueOnly, setOverdueOnly] = useState(filters.overdue_only || false);
    
    // 从 localStorage 读取主题
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            return saved ? saved === 'dark' : true;
        }
        return true;
    });

    // 监听主题变化（优化版：移除轮询）
    useEffect(() => {
        const handleThemeChange = (e) => {
            const saved = localStorage.getItem('theme');
            setIsDark(saved === 'dark');
        };

        // 监听自定义事件
        window.addEventListener('theme-changed', handleThemeChange);
        
        // 监听 storage 事件（跨标签页）
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

    const handleSearch = () => {
        router.get(route('admin.student-paths.index'), {
            search,
            path_id: selectedPath,
            status: selectedStatus,
            assigned_by: selectedAssignedBy,
            overdue_only: overdueOnly ? '1' : '',
        }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedPath('');
        setSelectedStatus('');
        setSelectedAssignedBy('');
        setOverdueOnly(false);
        router.get(route('admin.student-paths.index'));
    };

    const getStatusConfig = (status) => {
        const configs = {
            active: {
                label: 'Active',
                bg: isDark ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-green-100 text-green-800 border-green-200',
                icon: <CheckCircle className="w-3 h-3" />
            },
            completed: {
                label: 'Completed',
                bg: isDark ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-200',
                icon: <Award className="w-3 h-3" />
            },
            paused: {
                label: 'Paused',
                bg: isDark ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: <Clock className="w-3 h-3" />
            },
            abandoned: {
                label: 'Abandoned',
                bg: isDark ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-red-100 text-red-800 border-red-200',
                icon: <AlertTriangle className="w-3 h-3" />
            },
        };
        return configs[status] || configs.active;
    };

    const getProgressColor = (progress) => {
        if (progress >= 75) return isDark ? 'from-green-500 to-emerald-500' : 'from-green-400 to-emerald-400';
        if (progress >= 50) return isDark ? 'from-blue-500 to-cyan-500' : 'from-blue-400 to-cyan-400';
        if (progress >= 25) return isDark ? 'from-yellow-500 to-orange-500' : 'from-yellow-400 to-orange-400';
        return isDark ? 'from-gray-600 to-gray-500' : 'from-gray-300 to-gray-400';
    };

    return (
        <AuthenticatedLayout 
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold">Student Learning Paths</h2>
                        <p className="mt-2 text-xs md:text-sm opacity-90">
                            Manage student path assignments and monitor progress
                        </p>
                    </div>
                    <Link
                        href={route('admin.student-paths.create')}
                        className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold inline-flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                        Assign New Path
                    </Link>
                </div>
            }
        >
            <Head title="Student Learning Paths" />

            <div className={cn(
                "min-h-screen transition-colors duration-500",
                isDark ? "bg-slate-950" : "bg-gradient-to-br from-blue-50 via-purple-50 to-slate-50"
            )}>
                {/* Animated Background */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    {isDark ? (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
                            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
                        </>
                    ) : (
                        <>
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
                            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
                        </>
                    )}
                </div>

                <div className="py-8 md:py-12">
                    <div className="max-w-7xl mx-auto px-4 md:px-6">
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                            <StatCard
                                icon={<Users className="w-6 h-6" />}
                                label="Total Assignments"
                                value={stats.total_assignments}
                                color="indigo"
                                isDark={isDark}
                            />
                            <StatCard
                                icon={<CheckCircle className="w-6 h-6" />}
                                label="Active"
                                value={stats.active}
                                color="green"
                                isDark={isDark}
                            />
                            <StatCard
                                icon={<TrendingUp className="w-6 h-6" />}
                                label="Avg Progress"
                                value={`${stats.average_progress}%`}
                                color="blue"
                                isDark={isDark}
                            />
                            <StatCard
                                icon={<AlertTriangle className="w-6 h-6" />}
                                label="Overdue"
                                value={stats.overdue}
                                color="red"
                                isDark={isDark}
                            />
                        </div>

                        {/* Filters */}
                        <div className={cn(
                            "rounded-2xl shadow-lg border p-4 md:p-6 mb-8 backdrop-blur-sm animate-fadeIn",
                            isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                        )}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                    {/* Search */}
                                    <div className="sm:col-span-2">
                                        <label className={cn(
                                            "block text-sm font-semibold mb-2",
                                            isDark ? "text-slate-300" : "text-gray-700"
                                        )}>
                                            Search Student
                                        </label>
                                        <div className="relative">
                                            <Search className={cn(
                                                "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10",
                                                isDark ? "text-slate-500" : "text-gray-400"
                                            )} />
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Name or email..."
                                                className={cn(
                                                    "w-full pl-12 pr-4 py-3 rounded-lg transition-all outline-none",
                                                    isDark
                                                        ? "bg-slate-800 border-2 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500/50"
                                                        : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Learning Path */}
                                    <div>
                                        <label className={cn(
                                            "block text-sm font-semibold mb-2",
                                            isDark ? "text-slate-300" : "text-gray-700"
                                        )}>
                                            Learning Path
                                        </label>
                                        <select
                                            value={selectedPath}
                                            onChange={(e) => setSelectedPath(e.target.value)}
                                            className={cn(
                                                "w-full px-4 py-3 rounded-lg transition-all outline-none",
                                                isDark
                                                    ? "bg-slate-800 border-2 border-white/10 text-white focus:border-cyan-500/50"
                                                    : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
                                            )}
                                        >
                                            <option value="">All Paths</option>
                                            {paths.map(path => (
                                                <option key={path.path_id} value={path.path_id}>
                                                    {path.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className={cn(
                                            "block text-sm font-semibold mb-2",
                                            isDark ? "text-slate-300" : "text-gray-700"
                                        )}>
                                            Status
                                        </label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className={cn(
                                                "w-full px-4 py-3 rounded-lg transition-all outline-none",
                                                isDark
                                                    ? "bg-slate-800 border-2 border-white/10 text-white focus:border-cyan-500/50"
                                                    : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
                                            )}
                                        >
                                            <option value="">All Status</option>
                                            {Object.entries(statusOptions).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Assigned By */}
                                    <div>
                                        <label className={cn(
                                            "block text-sm font-semibold mb-2",
                                            isDark ? "text-slate-300" : "text-gray-700"
                                        )}>
                                            Assigned By
                                        </label>
                                        <select
                                            value={selectedAssignedBy}
                                            onChange={(e) => setSelectedAssignedBy(e.target.value)}
                                            className={cn(
                                                "w-full px-4 py-3 rounded-lg transition-all outline-none",
                                                isDark
                                                    ? "bg-slate-800 border-2 border-white/10 text-white focus:border-cyan-500/50"
                                                    : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
                                            )}
                                        >
                                            <option value="">All Methods</option>
                                            {Object.entries(assignedByOptions).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Overdue Checkbox */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="overdue"
                                        checked={overdueOnly}
                                        onChange={(e) => setOverdueOnly(e.target.checked)}
                                        className={cn(
                                            "w-4 h-4 rounded transition-all",
                                            isDark 
                                                ? "bg-slate-800 border-white/10 text-cyan-500 focus:ring-cyan-500/50" 
                                                : "border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        )}
                                    />
                                    <label htmlFor="overdue" className={cn(
                                        "ml-2 text-sm font-medium",
                                        isDark ? "text-slate-300" : "text-gray-700"
                                    )}>
                                        Show overdue only
                                    </label>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    <button
                                        onClick={handleSearch}
                                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm md:text-base"
                                    >
                                        Apply Filters
                                    </button>
                                    <button
                                        onClick={clearFilters}
                                        className={cn(
                                            "px-6 py-3 rounded-xl transition-all font-semibold border-2 text-sm md:text-base",
                                            isDark 
                                                ? "bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700" 
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        )}
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Assignments List */}
                        <div className="space-y-4">
                            {assignments.data.length === 0 ? (
                                <div className={cn(
                                    "text-center py-12 md:py-16 rounded-2xl shadow-lg border animate-fadeIn",
                                    isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                                )}>
                                    <Users className={cn(
                                        "w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4",
                                        isDark ? "text-slate-600" : "text-gray-400"
                                    )} />
                                    <p className={cn(
                                        "text-base md:text-lg",
                                        isDark ? "text-slate-400" : "text-gray-500"
                                    )}>
                                        No assignments found
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {assignments.data.map((assignment) => (
                                        <AssignmentCard
                                            key={assignment.student_path_id}
                                            assignment={assignment}
                                            isDark={isDark}
                                            getStatusConfig={getStatusConfig}
                                            getProgressColor={getProgressColor}
                                        />
                                    ))}

                                    {/* Pagination */}
                                    <div className={cn(
                                        "rounded-2xl shadow-lg border px-4 md:px-6 py-4 backdrop-blur-sm",
                                        isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                                    )}>
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className={cn(
                                                "text-sm font-medium text-center sm:text-left",
                                                isDark ? "text-slate-300" : "text-gray-700"
                                            )}>
                                                Showing {assignments.from} to {assignments.to} of {assignments.total} results
                                            </div>
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {assignments.links.map((link, index) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url || '#'}
                                                        className={cn(
                                                            "px-4 py-2 rounded-lg font-medium transition-all",
                                                            link.active
                                                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                                                : link.url
                                                                ? isDark 
                                                                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10'
                                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                                                : 'bg-transparent text-gray-400 cursor-not-allowed'
                                                        )}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
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
function StatCard({ icon, label, value, color, isDark }) {
    const colorClasses = {
        indigo: isDark ? 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30' : 'from-indigo-50 to-purple-50 border-indigo-200',
        green: isDark ? 'from-green-500/20 to-emerald-500/20 border-green-500/30' : 'from-green-50 to-emerald-50 border-green-200',
        blue: isDark ? 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' : 'from-blue-50 to-cyan-50 border-blue-200',
        red: isDark ? 'from-red-500/20 to-orange-500/20 border-red-500/30' : 'from-red-50 to-orange-50 border-red-200',
    };

    const iconColorClasses = {
        indigo: isDark ? 'text-indigo-400' : 'text-indigo-600',
        green: isDark ? 'text-green-400' : 'text-green-600',
        blue: isDark ? 'text-blue-400' : 'text-blue-600',
        red: isDark ? 'text-red-400' : 'text-red-600',
    };

    return (
        <div className={cn(
            "rounded-2xl shadow-lg border p-4 md:p-6 backdrop-blur-sm animate-fadeIn bg-gradient-to-br",
            colorClasses[color]
        )}>
            <div className="flex items-center gap-3 md:gap-4">
                <div className={cn(
                    "p-2 md:p-3 rounded-xl flex-shrink-0",
                    isDark ? 'bg-white/10' : 'bg-white/50'
                )}>
                    <div className={iconColorClasses[color]}>
                        {icon}
                    </div>
                </div>
                <div className="min-w-0">
                    <p className={cn(
                        "text-xs md:text-sm font-medium mb-1 truncate",
                        isDark ? "text-slate-400" : "text-gray-600"
                    )}>
                        {label}
                    </p>
                    <p className={cn(
                        "text-2xl md:text-3xl font-bold",
                        isDark ? "text-white" : "text-gray-900"
                    )}>
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

// Assignment Card Component
function AssignmentCard({ assignment, isDark, getStatusConfig, getProgressColor }) {
    const statusConfig = getStatusConfig(assignment.status);
    const progressGradient = getProgressColor(assignment.progress_percent);

    return (
        <div className={cn(
            "rounded-2xl shadow-lg border backdrop-blur-sm overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 animate-fadeIn",
            isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
        )}>
            <div className="p-4 md:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                    {/* Student Info */}
                    <div className="flex items-start gap-3 lg:w-1/4">
                        <div className={cn(
                            "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                            isDark ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/50" : "bg-gradient-to-br from-purple-100 to-pink-100"
                        )}>
                            <User className={cn("w-5 h-5 md:w-6 md:h-6", isDark ? "text-purple-300" : "text-purple-600")} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className={cn("font-bold text-sm md:text-base truncate", isDark ? "text-white" : "text-gray-900")}>
                                {assignment.student.name}
                            </h3>
                            <p className={cn("text-xs md:text-sm truncate", isDark ? "text-slate-400" : "text-gray-500")}>
                                {assignment.student.email}
                            </p>
                        </div>
                    </div>

                    {/* Path Info */}
                    <div className="lg:w-1/4">
                        <p className={cn("text-xs font-medium mb-1", isDark ? "text-slate-400" : "text-gray-500")}>
                            Learning Path
                        </p>
                        <p className={cn("font-semibold text-sm md:text-base truncate", isDark ? "text-white" : "text-gray-900")}>
                            {assignment.path.title}
                        </p>
                        <p className={cn("text-xs capitalize", isDark ? "text-slate-500" : "text-gray-500")}>
                            {assignment.path.difficulty_level}
                        </p>
                    </div>

                    {/* Progress */}
                    <div className="lg:w-1/5">
                        <p className={cn("text-xs font-medium mb-2", isDark ? "text-slate-400" : "text-gray-500")}>
                            Progress
                        </p>
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "flex-1 h-2 rounded-full overflow-hidden",
                                isDark ? "bg-slate-700" : "bg-gray-200"
                            )}>
                                <div
                                    className={`h-full bg-gradient-to-r ${progressGradient} transition-all duration-500`}
                                    style={{ width: `${assignment.progress_percent}%` }}
                                />
                            </div>
                            <span className={cn("text-sm font-bold min-w-[45px] text-right", isDark ? "text-white" : "text-gray-900")}>
                                {assignment.progress_percent}%
                            </span>
                        </div>
                    </div>

                    {/* Status & Dates */}
                    <div className="lg:w-1/5 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "px-2 md:px-3 py-1 md:py-1.5 text-xs font-semibold rounded-lg border inline-flex items-center gap-1.5",
                                statusConfig.bg
                            )}>
                                {statusConfig.icon}
                                {statusConfig.label}
                            </span>
                            {assignment.is_overdue && (
                                <span className={cn(
                                    "px-2 py-1 text-xs font-bold rounded-lg border",
                                    isDark ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-red-100 text-red-700 border-red-200"
                                )}>
                                    OVERDUE
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                            <Calendar className={cn("w-3.5 h-3.5", isDark ? "text-slate-500" : "text-gray-400")} />
                            <span className={isDark ? "text-slate-400" : "text-gray-500"}>
                                {assignment.assigned_at}
                            </span>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="lg:w-auto">
                        <Link
                            href={route('admin.student-paths.show', assignment.student_path_id)}
                            className="w-full lg:w-auto px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Eye className="w-4 h-4" />
                            View Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}