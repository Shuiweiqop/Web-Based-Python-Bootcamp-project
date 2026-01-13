import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ArrowLeft,
    BookOpen,
    Users,
    TrendingUp,
    CheckCircle,
    Clock,
    XCircle,
    RefreshCw,
    BarChart3
} from 'lucide-react';

export default function LessonProgress({ auth, lesson, progress, stats }) {
    const getStatusBadge = (status) => {
        const styles = {
            completed: 'bg-green-100 text-green-800 border-green-200',
            in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
            not_started: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        const labels = {
            completed: 'Completed',
            in_progress: 'In Progress',
            not_started: 'Not Started',
        };
        const icons = {
            completed: CheckCircle,
            in_progress: Clock,
            not_started: XCircle,
        };
        const Icon = icons[status] || Clock;
        
        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border ${styles[status] || styles.not_started}`}>
                <Icon className="w-4 h-4" />
                {labels[status] || 'Unknown'}
            </span>
        );
    };

    const getDifficultyBadge = (difficulty) => {
        const styles = {
            beginner: 'bg-green-100 text-green-800',
            intermediate: 'bg-yellow-100 text-yellow-800',
            advanced: 'bg-red-100 text-red-800',
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded ${styles[difficulty] || styles.beginner}`}>
                {difficulty || 'N/A'}
            </span>
        );
    };

    const handleRecalculate = () => {
        if (confirm('Are you sure you want to recalculate progress for all students in this lesson? This may take a moment.')) {
            router.post(route('admin.progress.lesson.recalculate', lesson.lesson_id), {}, {
                preserveScroll: true,
            });
        }
    };

    const statCards = [
        {
            label: 'Total Students',
            value: stats.total_students || 0,
            icon: Users,
            color: 'blue',
        },
        {
            label: 'Completed',
            value: stats.completed || 0,
            icon: CheckCircle,
            color: 'green',
        },
        {
            label: 'In Progress',
            value: stats.in_progress || 0,
            icon: Clock,
            color: 'orange',
        },
        {
            label: 'Average Progress',
            value: `${stats.average_progress || 0}%`,
            icon: TrendingUp,
            color: 'purple',
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Progress: ${lesson.title}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={route('admin.progress.index')}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Progress Analytics
                        </Link>
                        
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                                            <BookOpen className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
                                            <div className="flex items-center gap-3">
                                                {getDifficultyBadge(lesson.difficulty)}
                                                <span className="text-white/80 text-sm">
                                                    Lesson ID: {lesson.lesson_id}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRecalculate}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition backdrop-blur"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Recalculate All
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statCards.map((card, index) => {
                            const Icon = card.icon;
                            const colorClasses = {
                                blue: 'bg-blue-100 text-blue-600',
                                green: 'bg-green-100 text-green-600',
                                orange: 'bg-orange-100 text-orange-600',
                                purple: 'bg-purple-100 text-purple-600',
                            };
                            return (
                                <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-600 mb-1">{card.label}</p>
                                            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                                        </div>
                                        <div className={`p-3 rounded-lg ${colorClasses[card.color]}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Progress Overview */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Completion Overview</h3>
                            <span className="text-2xl font-bold text-blue-600">
                                {stats.completion_rate || 0}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                                style={{ width: `${stats.completion_rate || 0}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                            <span>{stats.completed || 0} of {stats.total_students || 0} students completed</span>
                            <span>{stats.in_progress || 0} in progress</span>
                        </div>
                    </div>

                    {/* Status Distribution */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Status Distribution</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.completed || 0}</p>
                                    <p className="text-sm text-gray-600">Completed</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <Clock className="w-8 h-8 text-blue-600" />
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.in_progress || 0}</p>
                                    <p className="text-sm text-gray-600">In Progress</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <XCircle className="w-8 h-8 text-gray-600" />
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.not_started || 0}</p>
                                    <p className="text-sm text-gray-600">Not Started</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Student Progress Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                                <BarChart3 className="w-6 h-6 text-blue-600" />
                                Student Progress
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Progress
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Exercises
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Tests
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Last Updated
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {progress.length > 0 ? (
                                        progress.map((item) => (
                                            <tr key={item.progress_id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {item.student?.user?.name || 'Unknown'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {item.student?.user?.email || 'N/A'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                                style={{ width: `${item.progress_percent || 0}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700 min-w-[45px]">
                                                            {item.progress_percent || 0}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(item.status)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        {item.exercise_completed ? (
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <Clock className="w-4 h-4 text-gray-400" />
                                                        )}
                                                        <span className={item.exercise_completed ? 'text-green-600 font-medium' : 'text-gray-600'}>
                                                            {item.exercise_completed ? 'Done' : 'Pending'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        {item.test_completed ? (
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <Clock className="w-4 h-4 text-gray-400" />
                                                        )}
                                                        <span className={item.test_completed ? 'text-green-600 font-medium' : 'text-gray-600'}>
                                                            {item.test_completed ? 'Passed' : 'Pending'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {item.last_updated_at 
                                                        ? new Date(item.last_updated_at).toLocaleDateString()
                                                        : 'Never'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <Link
                                                            href={route('admin.progress.show', item.progress_id)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                        >
                                                            Details
                                                        </Link>
                                                        <span className="text-gray-300">|</span>
                                                        <Link
                                                            href={route('admin.progress.student', item.student_id)}
                                                            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                                                        >
                                                            All Progress
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Users className="w-12 h-12 text-gray-300" />
                                                    <p className="text-gray-500">No students have started this lesson yet</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}