import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { formatDurationHours } from '@/utils/duration';
import StudentLayout from '@/Layouts/StudentLayout';
import {
    ArrowLeft,
    BookOpen,
    Clock,
    Trophy,
    Flame,
    Play,
    Lock,
    CheckCircle,
    Circle,
    Sparkles,
    Target,
    Calendar,
    TrendingUp,
    Pause,
    AlertCircle,
    BarChart3
} from 'lucide-react';

export default function Show({ 
    studentPath = null,  // Add default value
    progressDetails = { total_lessons: 0, completed: 0, in_progress: 0, not_started: 0 },  // Add default
    lessons = [],
    stats,
    recentActivity = []
}) {
    const [actionLoading, setActionLoading] = useState(false);
    const durationHours = studentPath?.calculated_duration_hours ?? studentPath?.estimated_duration_hours ?? 0;
    const formattedDuration = formatDurationHours(durationHours);

    // Add safety check - if studentPath is not loaded, show loading state
    if (!studentPath) {
        return (
            <StudentLayout>
                <Head title="Loading..." />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-white text-lg">Loading learning path...</p>
                    </div>
                </div>
            </StudentLayout>
        );
    }

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

    const getLevelGradient = (level) => {
        const gradients = {
            'beginner': 'from-green-500 to-emerald-600',
            'intermediate': 'from-blue-500 to-indigo-600',
            'advanced': 'from-purple-500 to-pink-600'
        };
        return gradients[level?.toLowerCase()] || 'from-gray-500 to-gray-600';
    };

    const getStatusColor = (status) => {
        const colors = {
            'active': 'bg-green-500/20 text-green-300 border-green-500/50',
            'paused': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
            'completed': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
            'abandoned': 'bg-red-500/20 text-red-300 border-red-500/50'
        };
        return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    };

    const getLessonStatusIcon = (status) => {
        if (status === 'completed') return <CheckCircle className="h-5 w-5 text-green-400" />;
        if (status === 'in_progress') return <Play className="h-5 w-5 text-blue-400" />;
        return <Circle className="h-5 w-5 text-gray-400" />;
    };

    const getLessonStatusColor = (status) => {
        if (status === 'completed') return 'bg-green-500/20 text-green-300 border-green-500/50';
        if (status === 'in_progress') return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    };

    const handlePausePath = () => {
        if (confirm('Are you sure you want to pause this learning path?')) {
            setActionLoading(true);
            router.post(route('student.paths.pause', studentPath.student_path_id), {}, {
                onFinish: () => setActionLoading(false)
            });
        }
    };

    const handleResumePath = () => {
        setActionLoading(true);
        router.post(route('student.paths.resume', studentPath.student_path_id), {}, {
            onFinish: () => setActionLoading(false)
        });
    };

    const handleSetAsPrimary = () => {
        setActionLoading(true);
        router.post(route('student.paths.set-primary', studentPath.student_path_id), {}, {
            onFinish: () => setActionLoading(false)
        });
    };

    return (
        <StudentLayout>
            <Head title={studentPath.title} />

            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-black/70 backdrop-blur-xl border-2 border-white/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Left Side - Path Info */}
                        <div className="flex-1">
                            <div className="flex items-start gap-4 mb-4">
                                <Link
                                    href={route('student.paths.index')}
                                    className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 text-white flex-shrink-0 border-2 border-white/30 hover:border-white/50 shadow-lg"
                                >
                                    <ArrowLeft className="h-6 w-6 drop-shadow-lg" />
                                </Link>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-4xl">
                                            {getIconEmoji(studentPath.icon) || studentPath.icon || '📚'}
                                        </span>
                                        <div>
                                            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                                                {studentPath.title}
                                            </h1>
                                            {studentPath.is_primary && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-lg mt-2 shadow-lg">
                                                    <Sparkles className="h-3 w-3" />
                                                    Primary Path
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r ${getLevelGradient(studentPath.difficulty_level)} text-white shadow-lg border-2 border-white/30`}>
                                            {studentPath.difficulty_level}
                                        </span>
                                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 backdrop-blur-sm shadow-lg ${getStatusColor(studentPath.status)}`}>
                                            {studentPath.status}
                                        </span>
                                    </div>
                                    <p className="text-white/90 font-medium leading-relaxed">
                                        {studentPath.description}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 mt-4">
                                {studentPath.next_lesson && studentPath.status === 'active' && (
                                    <Link
                                        href={route('lessons.show', studentPath.next_lesson.lesson_id)}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                                    >
                                        <Play className="h-5 w-5" />
                                        Continue Learning
                                    </Link>
                                )}

                                <Link
                                    href={route('student.paths.progress', studentPath.student_path_id)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 border-2 border-white/30 hover:border-white/50 transition-all"
                                >
                                    <BarChart3 className="h-5 w-5" />
                                    View Progress
                                </Link>

                                {studentPath.status === 'active' && (
                                    <button
                                        onClick={handlePausePath}
                                        disabled={actionLoading}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500/20 text-yellow-300 border-2 border-yellow-500/50 font-bold rounded-xl hover:bg-yellow-500/30 transition-all disabled:opacity-50"
                                    >
                                        <Pause className="h-5 w-5" />
                                        Pause Path
                                    </button>
                                )}

                                {studentPath.status === 'paused' && (
                                    <button
                                        onClick={handleResumePath}
                                        disabled={actionLoading}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 text-green-300 border-2 border-green-500/50 font-bold rounded-xl hover:bg-green-500/30 transition-all disabled:opacity-50"
                                    >
                                        <Play className="h-5 w-5" />
                                        Resume Path
                                    </button>
                                )}

                                {!studentPath.is_primary && studentPath.status === 'active' && (
                                    <button
                                        onClick={handleSetAsPrimary}
                                        disabled={actionLoading}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 border-2 border-white/30 hover:border-white/50 transition-all disabled:opacity-50"
                                    >
                                        <Sparkles className="h-5 w-5" />
                                        Set as Primary
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right Side - Progress Circle */}
                        <div className="text-center lg:text-right">
                            <div className="relative inline-flex items-center justify-center">
                                <svg className="transform -rotate-90 drop-shadow-2xl" width="160" height="160">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="rgba(255,255,255,0.25)"
                                        strokeWidth="14"
                                        fill="none"
                                    />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="url(#progressGradient)"
                                        strokeWidth="14"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 70}`}
                                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - (studentPath.progress_percent || 0) / 100)}`}
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#3B82F6" />
                                            <stop offset="100%" stopColor="#8B5CF6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-bold text-white drop-shadow-lg">
                                        {studentPath.progress_percent || 0}%
                                    </span>
                                    <span className="text-sm text-white font-semibold drop-shadow-md">Complete</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Warning for overdue */}
                    {studentPath.is_overdue && (
                        <div className="mt-6 p-4 bg-red-500/20 border-2 border-red-500/50 rounded-xl flex items-center gap-3">
                            <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
                            <div>
                                <p className="text-red-300 font-bold">This path is overdue!</p>
                                <p className="text-red-200 text-sm">
                                    Target completion was {studentPath.target_completion_date}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={<BookOpen className="h-6 w-6" />}
                        label="Total Lessons"
                        value={progressDetails.total_lessons}
                        gradient="from-blue-500 to-indigo-600"
                    />
                    <StatCard
                        icon={<CheckCircle className="h-6 w-6" />}
                        label="Completed"
                        value={progressDetails.completed}
                        gradient="from-green-500 to-emerald-600"
                    />
                    <StatCard
                        icon={<Flame className="h-6 w-6" />}
                        label="Days Active"
                        value={studentPath.days_in_path || 0}
                        gradient="from-orange-500 to-red-600"
                    />
                    <StatCard
                        icon={<TrendingUp className="h-6 w-6" />}
                        label="Activity Rate"
                        value={`${studentPath.activity_rate || 0}%`}
                        gradient="from-purple-500 to-pink-600"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Lessons List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-black/70 backdrop-blur-xl border-2 border-white/30 rounded-3xl p-6 shadow-2xl">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 drop-shadow-lg">
                                <BookOpen className="h-7 w-7 text-blue-400" />
                                Lessons ({lessons.length})
                            </h2>

                            <div className="space-y-4">
                                {lessons.map((lesson, index) => (
                                    <div
                                        key={lesson.lesson_id}
                                        className={`bg-white/10 backdrop-blur-sm border-2 rounded-2xl p-5 transition-all duration-200 shadow-lg ${
                                            lesson.is_locked
                                                ? 'border-white/20 opacity-60'
                                                : 'border-white/30 hover:bg-white/15 hover:border-white/50 hover:scale-[1.02]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Sequence Number */}
                                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg border-2 border-white/30">
                                                {lesson.sequence_order}
                                            </div>

                                            {/* Status Icon */}
                                            <div className="flex-shrink-0">
                                                {lesson.is_locked ? (
                                                    <Lock className="h-6 w-6 text-gray-400" />
                                                ) : (
                                                    getLessonStatusIcon(lesson.status)
                                                )}
                                            </div>

                                            {/* Lesson Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-white text-lg mb-2 drop-shadow-md">
                                                    {lesson.title}
                                                </h3>

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 backdrop-blur-sm shadow-md ${getLessonStatusColor(lesson.status)}`}>
                                                        {lesson.status.replace('_', ' ')}
                                                    </span>
                                                    {lesson.is_locked && (
                                                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gray-500/20 text-gray-300 border-2 border-gray-500/50">
                                                            🔒 Locked
                                                        </span>
                                                    )}
                                                    {lesson.estimated_duration_minutes && (
                                                        <span className="text-xs text-white/80 font-semibold flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {lesson.estimated_duration_minutes} min
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Progress Bar */}
                                                {lesson.progress_percent > 0 && (
                                                    <div className="mt-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 bg-white/25 rounded-full h-2 overflow-hidden border border-white/30">
                                                                <div
                                                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                                                    style={{ width: `${lesson.progress_percent}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-bold text-white w-12 text-right">
                                                                {lesson.progress_percent}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {lesson.completed_at && (
                                                    <p className="text-xs text-green-400 mt-2 font-semibold">
                                                        ✓ Completed {lesson.completed_at}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Action Button */}
                                            <div className="flex-shrink-0">
                                                {!lesson.is_locked && (
                                                    <Link
                                                        href={route('lessons.show', lesson.lesson_id)}
                                                        className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105 border-2 border-white/30"
                                                    >
                                                        {lesson.status === 'completed' ? 'Review' : lesson.status === 'in_progress' ? 'Continue' : 'Start'}
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Path Details */}
                        <div className="bg-black/70 backdrop-blur-xl border-2 border-white/30 rounded-3xl p-6 shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-4 drop-shadow-lg">Path Details</h3>
                            <div className="space-y-3">
                                {studentPath.started_at && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/90 font-medium flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Started
                                        </span>
                                        <span className="text-white font-bold">{studentPath.started_at}</span>
                                    </div>
                                )}
                                {studentPath.target_completion_date && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/90 font-medium flex items-center gap-2">
                                            <Target className="h-4 w-4" />
                                            Target Date
                                        </span>
                                        <span className="text-white font-bold">{studentPath.target_completion_date}</span>
                                    </div>
                                )}
                                {studentPath.completed_at && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/90 font-medium flex items-center gap-2">
                                            <Trophy className="h-4 w-4" />
                                            Completed
                                        </span>
                                        <span className="text-green-400 font-bold">{studentPath.completed_at}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/90 font-medium">Estimated Duration</span>
                                    <span className="text-white font-bold">{formattedDuration}</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Summary */}
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 shadow-2xl border-2 border-white/40">
                            <h3 className="text-xl font-bold text-white mb-4 drop-shadow-lg">Progress Summary</h3>
                            <div className="space-y-3">
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border-2 border-white/30">
                                    <div className="flex items-center justify-between">
                                        <span className="text-white font-semibold text-sm">Completed</span>
                                        <span className="text-2xl font-bold text-white">{progressDetails.completed}</span>
                                    </div>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border-2 border-white/30">
                                    <div className="flex items-center justify-between">
                                        <span className="text-white font-semibold text-sm">In Progress</span>
                                        <span className="text-2xl font-bold text-white">{progressDetails.in_progress}</span>
                                    </div>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border-2 border-white/30">
                                    <div className="flex items-center justify-between">
                                        <span className="text-white font-semibold text-sm">Not Started</span>
                                        <span className="text-2xl font-bold text-white">{progressDetails.not_started}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Student Notes */}
                        {studentPath.student_notes && (
                            <div className="bg-black/70 backdrop-blur-xl border-2 border-white/30 rounded-3xl p-6 shadow-2xl">
                                <h3 className="text-xl font-bold text-white mb-4 drop-shadow-lg">My Notes</h3>
                                <p className="text-white/90 font-medium leading-relaxed">
                                    {studentPath.student_notes}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}

function StatCard({ icon, label, value, gradient }) {
    return (
        <div className="bg-black/70 backdrop-blur-xl border-2 border-white/30 rounded-2xl p-5 shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-105">
            <div className={`inline-flex p-2.5 rounded-xl mb-3 bg-gradient-to-br ${gradient} border-2 border-white/30 shadow-lg`}>
                {React.cloneElement(icon, { className: 'text-white drop-shadow-lg' })}
            </div>
            <div className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{value}</div>
            <div className="text-xs text-white/90 font-bold drop-shadow-md">{label}</div>
        </div>
    );
}
