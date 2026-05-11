import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import { 
    Search,
    Plus,
    Edit3,
    Trash2,
    Eye,
    GraduationCap,
    Users,
    TrendingUp,
    Copy,
    BookOpen,
    Clock,
    Award,
    Star,
    Target
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Index({ auth, paths, stats, filters, difficultyOptions }) {
    const [search, setSearch] = useState(filters.search || '');
    const [difficulty, setDifficulty] = useState(filters.difficulty || '');
    const [isActive, setIsActive] = useState(filters.is_active ?? '');
    
    // 从 localStorage 读取主题
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            return saved ? saved === 'dark' : true;
        }
        return true;
    });

    // 监听主题变化
    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('theme');
            setIsDark(saved === 'dark');
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('theme-changed', handleStorageChange);
        
        const interval = setInterval(() => {
            const saved = localStorage.getItem('theme');
            const currentTheme = saved === 'dark';
            if (currentTheme !== isDark) {
                setIsDark(currentTheme);
            }
        }, 100);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('theme-changed', handleStorageChange);
            clearInterval(interval);
        };
    }, [isDark]);

    const handleSearch = () => {
        router.get(route('admin.learning-paths.index'), {
            search,
            difficulty,
            is_active: isActive,
        }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch('');
        setDifficulty('');
        setIsActive('');
        router.get(route('admin.learning-paths.index'));
    };

    const handleDelete = (pathId, title) => {
        if (confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
            router.delete(route('admin.learning-paths.destroy', pathId));
        }
    };

    const handleClone = (pathId) => {
        if (confirm('Clone this learning path?')) {
            router.post(route('admin.learning-paths.clone', pathId));
        }
    };

    const getDifficultyConfig = (level) => {
        const configs = {
            beginner: {
                icon: '🟢',
                label: 'Beginner',
                bg: isDark ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-green-100 text-green-800 border-green-200'
            },
            intermediate: {
                icon: '🟡',
                label: 'Intermediate',
                bg: isDark ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
            },
            advanced: {
                icon: '🔴',
                label: 'Advanced',
                bg: isDark ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-red-100 text-red-800 border-red-200'
            }
        };
        return configs[level] || configs.beginner;
    };

    return (
        <AuthenticatedLayout 
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold">Learning Paths</h2>
                        <p className="mt-2 text-xs md:text-sm opacity-90">
                            Create and manage learning paths with structured lessons
                        </p>
                    </div>
                    <Link
                        href={route('admin.learning-paths.create')}
                        className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold inline-flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                        Create New Path
                    </Link>
                </div>
            }
        >
            <Head title="Learning Paths" />

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
                                icon={<GraduationCap className="w-6 h-6" />}
                                label="Total Paths"
                                value={stats.total_paths}
                                color="indigo"
                                isDark={isDark}
                            />
                            <StatCard
                                icon={<TrendingUp className="w-6 h-6" />}
                                label="Active Paths"
                                value={stats.active_paths}
                                color="green"
                                isDark={isDark}
                            />
                            <StatCard
                                icon={<Users className="w-6 h-6" />}
                                label="Total Enrollments"
                                value={stats.total_enrollments}
                                color="blue"
                                isDark={isDark}
                            />
                            <StatCard
                                icon={<Users className="w-6 h-6" />}
                                label="Active Students"
                                value={stats.active_enrollments}
                                color="purple"
                                isDark={isDark}
                            />
                        </div>

                        {/* Filters */}
                        <div className={cn(
                            "rounded-2xl shadow-lg border p-6 mb-8 backdrop-blur-sm animate-fadeIn",
                            isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                        )}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Search */}
                                    <div className="md:col-span-2">
                                        <label className={cn(
                                            "block text-sm font-semibold mb-2",
                                            isDark ? "text-slate-300" : "text-gray-700"
                                        )}>
                                            Search Paths
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
                                                placeholder="Title or description..."
                                                className={cn(
                                                    "w-full pl-12 pr-4 py-3 rounded-lg transition-all outline-none",
                                                    isDark
                                                        ? "bg-slate-800 border-2 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500/50"
                                                        : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Difficulty */}
                                    <div>
                                        <label className={cn(
                                            "block text-sm font-semibold mb-2",
                                            isDark ? "text-slate-300" : "text-gray-700"
                                        )}>
                                            Difficulty
                                        </label>
                                        <select
                                            value={difficulty}
                                            onChange={(e) => setDifficulty(e.target.value)}
                                            className={cn(
                                                "w-full px-4 py-3 rounded-lg transition-all outline-none",
                                                isDark
                                                    ? "bg-slate-800 border-2 border-white/10 text-white focus:border-cyan-500/50"
                                                    : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
                                            )}
                                        >
                                            <option value="">All Levels</option>
                                            {Object.entries(difficultyOptions).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
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
                                            value={isActive}
                                            onChange={(e) => setIsActive(e.target.value)}
                                            className={cn(
                                                "w-full px-4 py-3 rounded-lg transition-all outline-none",
                                                isDark
                                                    ? "bg-slate-800 border-2 border-white/10 text-white focus:border-cyan-500/50"
                                                    : "bg-white border-2 border-gray-300 text-gray-900 focus:border-blue-500"
                                            )}
                                        >
                                            <option value="">All Status</option>
                                            <option value="1">Active</option>
                                            <option value="0">Inactive</option>
                                        </select>
                                    </div>
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

                        {/* Paths Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                            {paths.data.length === 0 ? (
                                <div className={cn(
                                    "col-span-full text-center py-12 md:py-16 rounded-2xl shadow-lg border animate-fadeIn",
                                    isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                                )}>
                                    <GraduationCap className={cn(
                                        "w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4",
                                        isDark ? "text-slate-600" : "text-gray-400"
                                    )} />
                                    <p className={cn(
                                        "text-base md:text-lg mb-3 md:mb-4",
                                        isDark ? "text-slate-400" : "text-gray-500"
                                    )}>
                                        No learning paths found
                                    </p>
                                    <Link
                                        href={route('admin.learning-paths.create')}
                                        className="inline-flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm md:text-base"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create your first path
                                    </Link>
                                </div>
                            ) : (
                                paths.data.map((path) => (
                                    <PathCard
                                        key={path.path_id}
                                        path={path}
                                        isDark={isDark}
                                        onDelete={handleDelete}
                                        onClone={handleClone}
                                        getDifficultyConfig={getDifficultyConfig}
                                    />
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {paths.data.length > 0 && (
                            <div className={cn(
                                "mt-8 rounded-2xl shadow-lg border px-4 md:px-6 py-4 backdrop-blur-sm",
                                isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                            )}>
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className={cn(
                                        "text-sm font-medium text-center sm:text-left",
                                        isDark ? "text-slate-300" : "text-gray-700"
                                    )}>
                                        Showing {paths.from} to {paths.to} of {paths.total} results
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {paths.links.map((link, index) => (
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
                        )}
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
        purple: isDark ? 'from-purple-500/20 to-pink-500/20 border-purple-500/30' : 'from-purple-50 to-pink-50 border-purple-200',
    };

    const iconColorClasses = {
        indigo: isDark ? 'text-indigo-400' : 'text-indigo-600',
        green: isDark ? 'text-green-400' : 'text-green-600',
        blue: isDark ? 'text-blue-400' : 'text-blue-600',
        purple: isDark ? 'text-purple-400' : 'text-purple-600',
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

// Path Card Component
function PathCard({ path, isDark, onDelete, onClone, getDifficultyConfig }) {
    const diffConfig = getDifficultyConfig(path.difficulty_level);

    return (
        <div className={cn(
            "rounded-2xl shadow-lg border backdrop-blur-sm overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 animate-fadeIn",
            isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
        )}>
            {/* Color Header */}
            <div 
                className="h-2"
                style={{ 
                    background: `linear-gradient(90deg, ${path.color || '#3B82F6'}, ${path.color || '#3B82F6'}dd)`
                }}
            />

            <div className="p-4 md:p-6">
                {/* Title & Badges */}
                <div className="flex items-start justify-between mb-3 md:mb-4 gap-2">
                    <h3 className={cn(
                        "text-base md:text-lg font-bold flex-1 line-clamp-2",
                        isDark ? "text-white" : "text-gray-900"
                    )}>
                        {path.title}
                    </h3>
                    <div className="flex flex-col gap-2 items-end ml-3">
                        {path.is_active ? (
                            <span className={cn(
                                "px-3 py-1 text-xs font-semibold rounded-lg border",
                                isDark 
                                    ? "bg-green-500/20 text-green-300 border-green-500/30" 
                                    : "bg-green-100 text-green-800 border-green-200"
                            )}>
                                ✓ Active
                            </span>
                        ) : (
                            <span className={cn(
                                "px-3 py-1 text-xs font-semibold rounded-lg border",
                                isDark 
                                    ? "bg-slate-700 text-slate-300 border-white/10" 
                                    : "bg-gray-100 text-gray-800 border-gray-200"
                            )}>
                                Inactive
                            </span>
                        )}
                        {path.is_featured && (
                            <span className={cn(
                                "px-3 py-1 text-xs font-semibold rounded-lg border inline-flex items-center gap-1",
                                isDark 
                                    ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" 
                                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                            )}>
                                <Star className="w-3 h-3" />
                                Featured
                            </span>
                        )}
                    </div>
                </div>

                {/* Description - Fixed Height */}
                <p className={cn(
                    "text-sm mb-4 line-clamp-2 min-h-[2.5rem]",
                    isDark ? "text-slate-400" : "text-gray-600"
                )}>
                    {path.description || 'No description'}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3 md:mb-4">
                    <div className={cn(
                        "text-center p-2 md:p-3 rounded-xl",
                        isDark ? "bg-blue-500/10" : "bg-blue-50"
                    )}>
                        <BookOpen className={cn(
                            "w-3 h-3 md:w-4 md:h-4 mx-auto mb-1",
                            isDark ? "text-blue-400" : "text-blue-600"
                        )} />
                        <p className={cn(
                            "text-xs mb-0.5 md:mb-1",
                            isDark ? "text-slate-400" : "text-gray-500"
                        )}>
                            Lessons
                        </p>
                        <p className={cn(
                            "text-lg md:text-xl font-bold",
                            isDark ? "text-white" : "text-gray-900"
                        )}>
                            {path.total_lessons}
                        </p>
                    </div>
                    <div className={cn(
                        "text-center p-2 md:p-3 rounded-xl",
                        isDark ? "bg-purple-500/10" : "bg-purple-50"
                    )}>
                        <Users className={cn(
                            "w-3 h-3 md:w-4 md:h-4 mx-auto mb-1",
                            isDark ? "text-purple-400" : "text-purple-600"
                        )} />
                        <p className={cn(
                            "text-xs mb-0.5 md:mb-1",
                            isDark ? "text-slate-400" : "text-gray-500"
                        )}>
                            Students
                        </p>
                        <p className={cn(
                            "text-lg md:text-xl font-bold",
                            isDark ? "text-white" : "text-gray-900"
                        )}>
                            {path.enrollment_count}
                        </p>
                    </div>
                    <div className={cn(
                        "text-center p-2 md:p-3 rounded-xl",
                        isDark ? "bg-green-500/10" : "bg-green-50"
                    )}>
                        <Target className={cn(
                            "w-3 h-3 md:w-4 md:h-4 mx-auto mb-1",
                            isDark ? "text-green-400" : "text-green-600"
                        )} />
                        <p className={cn(
                            "text-xs mb-0.5 md:mb-1",
                            isDark ? "text-slate-400" : "text-gray-500"
                        )}>
                            Complete
                        </p>
                        <p className={cn(
                            "text-lg md:text-xl font-bold",
                            isDark ? "text-white" : "text-gray-900"
                        )}>
                            {path.completion_rate}%
                        </p>
                    </div>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center justify-between mb-3 md:mb-4 gap-2">
                    <span className={cn(
                        "px-2 md:px-3 py-1 md:py-1.5 text-xs font-semibold rounded-lg border inline-flex items-center gap-1 md:gap-1.5",
                        diffConfig.bg
                    )}>
                        {diffConfig.icon} {diffConfig.label}
                    </span>
                    <div className="flex items-center gap-2 md:gap-3 text-xs font-medium">
                        <span className={cn(
                            "flex items-center gap-1",
                            isDark ? "text-slate-400" : "text-gray-500"
                        )}>
                            <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            {path.estimated_duration_hours}h
                        </span>
                        <span className={cn(
                            "flex items-center gap-1",
                            isDark ? "text-slate-400" : "text-gray-500"
                        )}>
                            <Award className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            {path.min_score_required}-{path.max_score_required}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-4 gap-1.5 md:gap-2">
                    <Link
                        href={route('admin.learning-paths.show', path.path_id)}
                        className="col-span-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs md:text-sm font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-1.5 md:gap-2"
                    >
                        <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        View
                    </Link>
                    <Link
                        href={route('admin.learning-paths.edit', path.path_id)}
                        className={cn(
                            "px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm font-semibold rounded-lg transition-all border flex items-center justify-center",
                            isDark 
                                ? "bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700" 
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        )}
                        title="Edit"
                    >
                        <Edit3 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </Link>
                    <button
                        onClick={() => onClone(path.path_id)}
                        className={cn(
                            "px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm font-semibold rounded-lg transition-all border flex items-center justify-center",
                            isDark 
                                ? "bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700" 
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        )}
                        title="Clone"
                    >
                        <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                </div>
                
                {/* Delete Button - Full Width Below */}
                {!path.deleted_at && (
                    <button
                        onClick={() => onDelete(path.path_id, path.title)}
                        className={cn(
                            "w-full mt-1.5 md:mt-2 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-semibold rounded-lg transition-all border flex items-center justify-center gap-1.5 md:gap-2",
                            isDark 
                                ? "bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20" 
                                : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        )}
                    >
                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        Delete
                    </button>
                )}

                {path.deleted_at && (
                    <div className={cn(
                        "mt-3 text-xs font-medium",
                        isDark ? "text-red-400" : "text-red-600"
                    )}>
                        Deleted on {path.deleted_at}
                    </div>
                )}
            </div>
        </div>
    );
}