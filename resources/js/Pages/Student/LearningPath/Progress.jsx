import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import {
    ArrowLeft,
    BarChart3,
    Clock,
    CheckCircle,
    BookOpen,
    Trophy,
    Flame,
    Calendar
} from 'lucide-react';

export default function Progress({ studentPath, detailedProgress, stats, recentActivity }) {
    const getDifficultyColor = (level) => {
        const colors = {
            beginner: 'from-green-500 to-emerald-600',
            intermediate: 'from-blue-500 to-indigo-600',
            advanced: 'from-purple-500 to-pink-600'
        };
        return colors[level] || 'from-gray-500 to-gray-600';
    };

    const getStatusColor = (status) => {
        const colors = {
            completed: 'bg-green-500/30 text-green-200 border-green-500/50',
            in_progress: 'bg-blue-500/30 text-blue-200 border-blue-500/50',
            not_started: 'bg-gray-500/30 text-gray-300 border-gray-500/50'
        };
        return colors[status] || 'bg-gray-500/30 text-gray-300 border-gray-500/50';
    };

    const getStatusIcon = (status) => {
        if (status === 'completed') return '✓';
        if (status === 'in_progress') return '▶';
        return '○';
    };

    const getActivityRateColor = (rate) => {
        if (rate >= 75) return 'from-green-500 to-emerald-500';
        if (rate >= 50) return 'from-blue-500 to-cyan-500';
        if (rate >= 25) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-pink-500';
    };

    return (
        <StudentLayout>
            <Head title={`Progress - ${studentPath.title}`} />

            <div className="space-y-6">
                {/* Header Card - 增强背景 */}
                <div className="bg-black/70 backdrop-blur-xl border border-white/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <Link
                                href={route('student.paths.show', studentPath.student_path_id)}
                                className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 text-white/90 hover:text-white flex-shrink-0 border border-white/20 hover:border-white/40 shadow-lg"
                            >
                                <ArrowLeft className="h-6 w-6 drop-shadow-lg" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
                                    {studentPath.title}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r ${getDifficultyColor(studentPath.difficulty_level)} text-white shadow-lg border border-white/30`}>
                                        <span className="drop-shadow-md">{studentPath.difficulty_level}</span>
                                    </span>
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border backdrop-blur-sm shadow-lg ${getStatusColor(studentPath.status)}`}>
                                        <span className="drop-shadow-md">{studentPath.status}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Overall Progress Circle - 增强可见性 */}
                        <div className="text-center lg:text-right">
                            <div className="relative inline-flex items-center justify-center">
                                <svg className="transform -rotate-90 drop-shadow-xl" width="140" height="140">
                                    <circle
                                        cx="70"
                                        cy="70"
                                        r="60"
                                        stroke="rgba(255,255,255,0.2)"
                                        strokeWidth="12"
                                        fill="none"
                                    />
                                    <circle
                                        cx="70"
                                        cy="70"
                                        r="60"
                                        stroke="url(#progressGradient)"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 60}`}
                                        strokeDashoffset={`${2 * Math.PI * 60 * (1 - studentPath.progress_percent / 100)}`}
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
                                    <span className="text-4xl font-bold text-white drop-shadow-lg">
                                        {studentPath.progress_percent}%
                                    </span>
                                    <span className="text-sm text-white/90 drop-shadow-md">Complete</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards - 增强背景 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={<Calendar className="h-7 w-7" />}
                        label="Days in Path"
                        value={studentPath.days_in_path}
                        subtitle={`${studentPath.active_days || 0} active days`}
                        gradient="from-blue-500 to-cyan-500"
                    />
                    
                    <StatCard
                        icon={<Flame className="h-7 w-7" />}
                        label="Activity Rate"
                        value={`${studentPath.activity_rate || 0}%`}
                        subtitle={studentPath.active_days > 0 ? "Keep it up!" : "Start learning!"}
                        gradient={getActivityRateColor(studentPath.activity_rate || 0)}
                    />
                    
                    <StatCard
                        icon={<CheckCircle className="h-7 w-7" />}
                        label="Completion Rate"
                        value={`${stats.completion_rate}%`}
                        subtitle={`${detailedProgress?.completed || 0} lessons done`}
                        gradient="from-green-500 to-emerald-500"
                    />
                    
                    <StatCard
                        icon={<Trophy className="h-7 w-7" />}
                        label="Average Score"
                        value={stats.average_score ? `${stats.average_score}%` : 'No tests'}
                        subtitle={stats.average_score ? "Great work!" : "Take a test"}
                        gradient="from-yellow-500 to-orange-500"
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content - Detailed Progress - 增强背景 */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Lessons Progress */}
                        <div className="bg-black/70 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg border border-white/30">
                                    <BarChart3 className="h-6 w-6 text-white drop-shadow-lg" />
                                </div>
                                <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                                    Lesson Progress
                                </h2>
                            </div>

                            {detailedProgress && detailedProgress.lessons && detailedProgress.lessons.length > 0 ? (
                                <div className="space-y-4">
                                    {detailedProgress.lessons.map((lesson, index) => (
                                        <div
                                            key={index}
                                            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 hover:bg-white/15 hover:border-white/40 transition-all duration-200 group shadow-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`flex items-center justify-center w-12 h-12 rounded-xl border-2 backdrop-blur-sm shadow-lg ${getStatusColor(lesson.status)} font-bold text-lg`}>
                                                    <span className="drop-shadow-md">{getStatusIcon(lesson.status)}</span>
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-white text-lg truncate mb-2 drop-shadow-md">
                                                        {lesson.title}
                                                    </h3>
                                                    
                                                    {/* Progress Bar */}
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 bg-white/20 rounded-full h-2.5 overflow-hidden border border-white/30">
                                                            <div
                                                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 shadow-lg"
                                                                style={{ width: `${lesson.progress_percent}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-bold text-white w-12 text-right drop-shadow-md">
                                                            {lesson.progress_percent}%
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold border backdrop-blur-sm shadow-md ${getStatusColor(lesson.status)}`}>
                                                            <span className="drop-shadow-sm">{lesson.status.replace('_', ' ')}</span>
                                                        </span>
                                                        {lesson.completed_at && (
                                                            <span className="text-xs text-white/80 drop-shadow-md">
                                                                ✓ {lesson.completed_at}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-shrink-0">
                                                    {lesson.is_locked ? (
                                                        <span className="text-3xl opacity-50 drop-shadow-lg">🔒</span>
                                                    ) : (
                                                        <Link
                                                            href={route('lessons.show', lesson.lesson_id)}
                                                            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 border border-white/30"
                                                        >
                                                            <span className="drop-shadow-md">
                                                                {lesson.status === 'completed' ? 'Review' : 'Continue'}
                                                            </span>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-white/80">
                                    <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50 drop-shadow-lg" />
                                    <p className="text-lg drop-shadow-md">No lesson data available</p>
                                </div>
                            )}
                        </div>

                        {/* Progress Summary - 增强背景 */}
                        {detailedProgress && (
                            <div className="bg-black/70 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-2xl">
                                <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">Progress Summary</h2>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-6 bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/50 rounded-2xl backdrop-blur-sm shadow-lg">
                                        <div className="text-4xl font-bold text-green-300 mb-2 drop-shadow-lg">
                                            {detailedProgress.completed || 0}
                                        </div>
                                        <div className="text-sm text-green-200 font-medium drop-shadow-md">Completed</div>
                                    </div>
                                    <div className="text-center p-6 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-blue-500/50 rounded-2xl backdrop-blur-sm shadow-lg">
                                        <div className="text-4xl font-bold text-blue-300 mb-2 drop-shadow-lg">
                                            {detailedProgress.in_progress || 0}
                                        </div>
                                        <div className="text-sm text-blue-200 font-medium drop-shadow-md">In Progress</div>
                                    </div>
                                    <div className="text-center p-6 bg-gradient-to-br from-gray-500/30 to-gray-600/30 border border-gray-500/50 rounded-2xl backdrop-blur-sm shadow-lg">
                                        <div className="text-4xl font-bold text-gray-300 mb-2 drop-shadow-lg">
                                            {detailedProgress.not_started || 0}
                                        </div>
                                        <div className="text-sm text-gray-200 font-medium drop-shadow-md">Not Started</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Recent Activity - 增强背景 */}
                    <div className="space-y-6">
                        <div className="bg-black/70 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg border border-white/30">
                                    <Flame className="h-5 w-5 text-white drop-shadow-lg" />
                                </div>
                                <h2 className="text-xl font-bold text-white drop-shadow-lg">
                                    Recent Activity
                                </h2>
                            </div>

                            {recentActivity && recentActivity.length > 0 ? (
                                <div className="space-y-3">
                                    {recentActivity.map((activity, index) => (
                                        <div key={index} className="pb-3 border-b border-white/20 last:border-0">
                                            <div className="flex items-start gap-3">
                                                <span className={`mt-1 px-2 py-1 rounded-lg text-xs font-bold border backdrop-blur-sm shadow-md ${getStatusColor(activity.status)}`}>
                                                    <span className="drop-shadow-sm">{getStatusIcon(activity.status)}</span>
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white truncate drop-shadow-md">
                                                        {activity.lesson_title}
                                                    </p>
                                                    <p className="text-xs text-white/80 mt-1 drop-shadow-sm">
                                                        {activity.updated_at}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-bold text-white drop-shadow-md">
                                                    {activity.progress_percent}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-white/80 text-center py-6 drop-shadow-md">
                                    No recent activity
                                </p>
                            )}
                        </div>

                        {/* Quick Stats - 增强背景 */}
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl p-6 text-white border-2 border-white/30">
                            <h3 className="text-xl font-bold mb-6 drop-shadow-lg">Learning Summary 🚀</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/90 text-sm drop-shadow-md">Total Days</span>
                                        <span className="font-bold text-2xl drop-shadow-lg">{studentPath.days_in_path}</span>
                                    </div>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/90 text-sm drop-shadow-md">Active Days</span>
                                        <span className="font-bold text-2xl drop-shadow-lg">{studentPath.active_days || 0}</span>
                                    </div>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/90 text-sm drop-shadow-md">Activity Rate</span>
                                        <span className="font-bold text-2xl drop-shadow-lg">{studentPath.activity_rate || 0}%</span>
                                    </div>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/90 text-sm drop-shadow-md">Progress</span>
                                        <span className="font-bold text-2xl drop-shadow-lg">{studentPath.progress_percent}%</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Activity Rate Message */}
                            <div className="mt-6 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                                {studentPath.activity_rate >= 75 ? (
                                    <p className="text-white text-center text-sm drop-shadow-md">
                                        🔥 Amazing! You're very consistent with your learning!
                                    </p>
                                ) : studentPath.activity_rate >= 50 ? (
                                    <p className="text-white text-center text-sm drop-shadow-md">
                                        👍 Good job! Keep up the regular practice!
                                    </p>
                                ) : studentPath.activity_rate >= 25 ? (
                                    <p className="text-white text-center text-sm drop-shadow-md">
                                        💪 You're making progress! Try to study more regularly!
                                    </p>
                                ) : (
                                    <p className="text-white text-center text-sm drop-shadow-md">
                                        🚀 Let's get started! Make learning a daily habit!
                                    </p>
                                )}
                            </div>
                            
                            {/* Started Date */}
                            <div className="mt-4 pt-4 border-t border-white/30">
                                <div className="flex justify-between items-center">
                                    <span className="text-white/90 text-sm drop-shadow-md">Started</span>
                                    <span className="font-semibold drop-shadow-md">{studentPath.started_at || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}

function StatCard({ icon, label, value, subtitle, gradient }) {
    return (
        <div className="bg-black/70 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-105 hover:border-white/50">
            <div className={`inline-flex p-3 rounded-xl mb-4 bg-gradient-to-br ${gradient} border border-white/30 shadow-lg`}>
                {React.cloneElement(icon, { className: 'text-white drop-shadow-lg' })}
            </div>
            <div className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{value}</div>
            <div className="text-sm text-white/90 font-medium mb-1 drop-shadow-md">{label}</div>
            {subtitle && (
                <div className="text-xs text-white/80 drop-shadow-sm">{subtitle}</div>
            )}
        </div>
    );
}