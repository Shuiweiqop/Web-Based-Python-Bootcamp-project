import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { 
    BookOpen,
    Clock,
    Trophy,
    Flame,
    Play,
    Pause,
    ArrowRight,
    CheckCircle,
    Sparkles,
    GraduationCap,
    BarChart3,
    Plus
} from 'lucide-react';

export default function Index({ 
    studentPaths = [],
    primaryPath = null,
    hasActivePath = false
}) {
    const [actionLoading, setActionLoading] = useState(null);

    const handlePausePath = (pathId) => {
        if (confirm('Are you sure you want to pause this learning path?')) {
            setActionLoading(pathId);
            router.post(route('student.paths.pause', pathId), {}, {
                onFinish: () => setActionLoading(null)
            });
        }
    };

    const handleResumePath = (pathId) => {
        setActionLoading(pathId);
        router.post(route('student.paths.resume', pathId), {}, {
            onFinish: () => setActionLoading(null)
        });
    };

    const getLevelGradient = (level) => {
        const gradients = {
            'beginner': 'from-green-500 to-emerald-600',
            'intermediate': 'from-blue-500 to-indigo-600',
            'advanced': 'from-purple-500 to-pink-600'
        };
        return gradients[level?.toLowerCase()] || 'from-gray-500 to-gray-600';
    };

    const getLevelBadge = (level) => {
        const badges = {
            'beginner': '🌱',
            'intermediate': '⚡',
            'advanced': '🚀'
        };
        return badges[level?.toLowerCase()] || '📚';
    };

    // Map icon names to emojis
    const getIconEmoji = (iconName) => {
        const iconMap = {
            'book': '📚',
            'code': '💻',
            'rocket': '🚀',
            'star': '⭐',
            'fire': '🔥',
            'trophy': '🏆',
            'graduation': '🎓',
            'lightbulb': '💡',
            'chart': '📊',
            'target': '🎯',
            'puzzle': '🧩',
            'brain': '🧠',
            'tool': '🔧',
            'paint': '🎨',
            'music': '🎵',
            'camera': '📷',
            'globe': '🌍',
            'science': '🔬',
            'atom': '⚛️',
            'dna': '🧬'
        };
        return iconMap[iconName?.toLowerCase()] || null;
    };

    const getStatusColor = (status) => {
        const colors = {
            'active': 'bg-green-500/20 text-green-300 border-green-500/50',
            'paused': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
            'completed': 'bg-blue-500/20 text-blue-300 border-blue-500/50'
        };
        return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    };

    // Separate paths by status
    const activePaths = studentPaths.filter(p => p.status === 'active');
    const pausedPaths = studentPaths.filter(p => p.status === 'paused');
    const completedPaths = studentPaths.filter(p => p.status === 'completed');

    // Calculate stats
    const stats = {
        total_paths: studentPaths.length,
        active_paths: activePaths.length,
        completed_paths: completedPaths.length,
        paused_paths: pausedPaths.length,
    };

    const PathCard = ({ path, showActions = true }) => (
        <div className="bg-black/70 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden hover:border-white/40 transition-all duration-300 hover:scale-105 shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                        <span className="text-3xl">
                            {getIconEmoji(path.icon) || path.icon || getLevelBadge(path.difficulty_level)}
                        </span>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold text-white">
                                    {path.title}
                                </h3>
                                {path.is_primary && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-lg">
                                        <Sparkles className="h-3 w-3" />
                                        Primary
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r ${getLevelGradient(path.difficulty_level)} text-white`}>
                                    {path.difficulty_level}
                                </span>
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(path.status)}`}>
                                    {path.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-white/90 line-clamp-2 text-sm font-medium">
                    {path.description}
                </p>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-4 bg-white/5">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-semibold text-white/90">Progress</span>
                    <span className="font-bold text-white">{Math.round(path.progress_percent || 0)}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${path.progress_percent || 0}%` }}
                    ></div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 p-6 border-t border-white/10">
                <div className="text-center">
                    <BookOpen className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white mb-1">
                        {path.total_lessons}
                    </div>
                    <div className="text-xs text-white/80 font-medium">Total Lessons</div>
                </div>
                <div className="text-center border-x border-white/10">
                    <Flame className="h-5 w-5 text-orange-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white mb-1">
                        {path.days_in_path || 0}
                    </div>
                    <div className="text-xs text-white/80 font-medium">Days Active</div>
                </div>
                <div className="text-center">
                    {path.is_overdue ? (
                        <Clock className="h-5 w-5 text-red-400 mx-auto mb-2" />
                    ) : (
                        <CheckCircle className="h-5 w-5 text-green-400 mx-auto mb-2" />
                    )}
                    <div className="text-2xl font-bold text-white mb-1">
                        {path.is_overdue ? '!' : '✓'}
                    </div>
                    <div className="text-xs text-white/80 font-medium">
                        {path.is_overdue ? 'Overdue' : 'On Track'}
                    </div>
                </div>
            </div>

            {/* Dates */}
            <div className="px-6 py-3 bg-white/5 border-t border-white/10 text-sm text-white/85 font-medium">
                {path.started_at && (
                    <div className="flex items-center justify-between mb-1">
                        <span>Started:</span>
                        <span className="font-semibold text-white">{path.started_at}</span>
                    </div>
                )}
                {path.completed_at && (
                    <div className="flex items-center justify-between">
                        <span>Completed:</span>
                        <span className="font-semibold text-green-400">{path.completed_at}</span>
                    </div>
                )}
                {path.last_activity_at && !path.completed_at && (
                    <div className="flex items-center justify-between">
                        <span>Last activity:</span>
                        <span className="font-semibold text-white">{path.last_activity_at}</span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            {showActions && (
                <div className="p-6 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('student.paths.show', path.path_id)}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all"
                        >
                            <span>View Details</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>

                        {path.status === 'active' && (
                            <button
                                onClick={() => handlePausePath(path.path_id)}
                                disabled={actionLoading === path.path_id}
                                className="px-4 py-2.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 text-sm font-medium rounded-xl hover:bg-yellow-500/30 transition-all disabled:opacity-50 flex items-center gap-1"
                            >
                                <Pause className="h-4 w-4" />
                            </button>
                        )}

                        {path.status === 'paused' && (
                            <button
                                onClick={() => handleResumePath(path.path_id)}
                                disabled={actionLoading === path.path_id}
                                className="px-4 py-2.5 bg-green-500/20 text-green-300 border border-green-500/50 text-sm font-medium rounded-xl hover:bg-green-500/30 transition-all disabled:opacity-50 flex items-center gap-1"
                            >
                                <Play className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    // Empty state
    if (studentPaths.length === 0) {
        return (
            <StudentLayout>
                <Head title="My Learning Paths" />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="bg-black/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-12 text-center max-w-2xl">
                        <GraduationCap className="h-24 w-24 text-blue-400 mx-auto mb-6" />
                        <h2 className="text-4xl font-bold text-white mb-4">
                            No Learning Paths Yet
                        </h2>
                        <p className="text-xl text-white/90 font-medium mb-8">
                            Start your learning journey by taking a placement test or browsing available paths
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={route('student.onboarding')}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl"
                            >
                                <Sparkles className="h-6 w-6" />
                                <span>Take Placement Test</span>
                            </Link>
                            <Link
                                href={route('student.paths.browse')}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 text-white text-lg font-bold rounded-xl border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-200"
                            >
                                <BookOpen className="h-6 w-6" />
                                <span>Browse Paths</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <Head title="My Learning Paths" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-black/70 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">My Learning Paths</h1>
                            <p className="text-white/90 font-medium">Track your progress and continue learning</p>
                        </div>
                        <Link
                            href={route('student.paths.browse')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Browse Paths</span>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={<BookOpen className="h-7 w-7" />}
                        label="Total Paths"
                        value={stats.total_paths}
                        gradient="from-blue-500 to-indigo-600"
                    />
                    <StatCard
                        icon={<Flame className="h-7 w-7" />}
                        label="Active Paths"
                        value={stats.active_paths}
                        gradient="from-green-500 to-emerald-600"
                    />
                    <StatCard
                        icon={<Pause className="h-7 w-7" />}
                        label="Paused"
                        value={stats.paused_paths}
                        gradient="from-yellow-500 to-orange-600"
                    />
                    <StatCard
                        icon={<Trophy className="h-7 w-7" />}
                        label="Completed"
                        value={stats.completed_paths}
                        gradient="from-purple-500 to-pink-600"
                    />
                </div>

                {/* Primary Path Highlight */}
                {primaryPath && (
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl p-8 text-white">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Sparkles className="h-8 w-8" />
                                <div>
                                    <p className="text-white/95 text-sm font-semibold">Primary Learning Path</p>
                                    <h2 className="text-2xl font-bold">{primaryPath.title}</h2>
                                </div>
                            </div>
                            <Link
                                href={route('student.paths.show', primaryPath.path_id)}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-all backdrop-blur-sm"
                            >
                                View Details
                            </Link>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="font-medium">Overall Progress</span>
                                <span className="font-bold text-xl">{Math.round(primaryPath.progress_percent || 0)}%</span>
                            </div>
                            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-white rounded-full transition-all duration-500"
                                    style={{ width: `${primaryPath.progress_percent || 0}%` }}
                                ></div>
                            </div>
                        </div>

                        {primaryPath.next_lesson && (
                            <div className="flex items-center justify-between bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                                <div className="flex items-center gap-3">
                                    <Play className="h-6 w-6" />
                                    <div>
                                        <div className="text-xs text-white/95 font-semibold">Next Lesson</div>
                                        <div className="text-base font-bold">{primaryPath.next_lesson.title}</div>
                                    </div>
                                </div>
                                <Link
                                    href={route('lessons.show', primaryPath.next_lesson.lesson_id)}
                                    className="px-6 py-2.5 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                    Continue
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Active Paths */}
                {activePaths.length > 0 && (
                    <div>
                        <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-4 mb-6 shadow-xl">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <Flame className="h-7 w-7 text-green-400" />
                                Active Paths ({activePaths.length})
                            </h2>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-6">
                            {activePaths.map((path) => (
                                <PathCard key={path.student_path_id} path={path} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Paused Paths */}
                {pausedPaths.length > 0 && (
                    <div>
                        <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-4 mb-6 shadow-xl">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <Pause className="h-7 w-7 text-yellow-400" />
                                Paused Paths ({pausedPaths.length})
                            </h2>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-6">
                            {pausedPaths.map((path) => (
                                <PathCard key={path.student_path_id} path={path} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Completed Paths */}
                {completedPaths.length > 0 && (
                    <div>
                        <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-4 mb-6 shadow-xl">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <Trophy className="h-7 w-7 text-blue-400" />
                                Completed Paths ({completedPaths.length})
                            </h2>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-6">
                            {completedPaths.map((path) => (
                                <PathCard key={path.student_path_id} path={path} showActions={false} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}

function StatCard({ icon, label, value, gradient }) {
    return (
        <div className="bg-black/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-105">
            <div className={`inline-flex p-3 rounded-xl mb-4 bg-gradient-to-br ${gradient}`}>
                {React.cloneElement(icon, { className: 'text-white' })}
            </div>
            <div className="text-3xl font-bold text-white mb-2">{value}</div>
            <div className="text-sm text-white/90 font-semibold">{label}</div>
        </div>
    );
}