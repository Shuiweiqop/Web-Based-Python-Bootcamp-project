import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    DocumentDuplicateIcon,
    AcademicCapIcon,
    UserGroupIcon,
    CheckCircleIcon,
    ClockIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function Show({ auth, path, lessons, completionStats, recentEnrollments }) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${path.title}"? This cannot be undone.`)) {
            router.delete(route('admin.learning-paths.destroy', path.path_id));
        }
    };

    const handleClone = () => {
        if (confirm('Clone this learning path?')) {
            setProcessing(true);
            router.post(route('admin.learning-paths.clone', path.path_id), {}, {
                onFinish: () => setProcessing(false)
            });
        }
    };

    const handleRestore = () => {
        setProcessing(true);
        router.post(route('admin.learning-paths.restore', path.path_id), {}, {
            onFinish: () => setProcessing(false)
        });
    };

    const getDifficultyBadge = (level) => {
        const styles = {
            beginner: 'bg-green-100 text-green-800',
            intermediate: 'bg-yellow-100 text-yellow-800',
            advanced: 'bg-red-100 text-red-800',
        };
        return (
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${styles[level]}`}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
            </span>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={path.title} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href={route('admin.learning-paths.index')}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeftIcon className="w-4 h-4 mr-1" />
                            Back to Learning Paths
                        </Link>

                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-3xl font-bold text-gray-900">{path.title}</h2>
                                    {path.is_active ? (
                                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded-full">
                                            Inactive
                                        </span>
                                    )}
                                    {path.is_featured && (
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                                            Featured
                                        </span>
                                    )}
                                    {path.deleted_at && (
                                        <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                                            Deleted
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600">{path.description}</p>
                            </div>

                            <div className="flex gap-2 ml-4">
                                {path.deleted_at ? (
                                    <button
                                        onClick={handleRestore}
                                        disabled={processing}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center disabled:opacity-50"
                                    >
                                        <ArrowPathIcon className="w-4 h-4 mr-2" />
                                        Restore
                                    </button>
                                ) : (
                                    <>
                                        <Link
                                            href={route('admin.learning-paths.edit', path.path_id)}
                                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition inline-flex items-center"
                                        >
                                            <PencilIcon className="w-4 h-4 mr-2" />
                                            Edit
                                        </Link>
                                        <Link
                                            href={route('admin.learning-paths.lessons.manage', path.path_id)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition inline-flex items-center"
                                        >
                                            <Cog6ToothIcon className="w-4 h-4 mr-2" />
                                            Manage Lessons
                                        </Link>
                                        <button
                                            onClick={handleClone}
                                            disabled={processing}
                                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition inline-flex items-center disabled:opacity-50"
                                        >
                                            <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                                            Clone
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-flex items-center"
                                        >
                                            <TrashIcon className="w-4 h-4 mr-2" />
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <AcademicCapIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600">Total Lessons</p>
                                    <p className="text-2xl font-bold text-gray-900">{path.total_lessons}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <UserGroupIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600">Total Students</p>
                                    <p className="text-2xl font-bold text-gray-900">{completionStats.total_students}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-indigo-100 rounded-lg">
                                    <CheckCircleIcon className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900">{completionStats.completed}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <ChartBarIcon className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600">Completion Rate</p>
                                    <p className="text-2xl font-bold text-gray-900">{completionStats.completion_rate}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Details & Lessons */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Path Details */}
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <h3 className="text-lg font-semibold text-gray-900">Path Details</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Difficulty Level</p>
                                            {getDifficultyBadge(path.difficulty_level)}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Estimated Duration</p>
                                            <p className="text-base font-medium text-gray-900">
                                                {path.estimated_duration_hours} hours
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Score Range</p>
                                            <p className="text-base font-medium text-gray-900">
                                                {path.min_score_required} - {path.max_score_required}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Display Order</p>
                                            <p className="text-base font-medium text-gray-900">
                                                {path.display_order}
                                            </p>
                                        </div>
                                    </div>

                                    {path.learning_outcomes && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Learning Outcomes</p>
                                            <p className="text-base text-gray-900 whitespace-pre-wrap">
                                                {path.learning_outcomes}
                                            </p>
                                        </div>
                                    )}

                                    {path.prerequisites && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Prerequisites</p>
                                            <p className="text-base text-gray-900 whitespace-pre-wrap">
                                                {path.prerequisites}
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Created</p>
                                            <p className="text-base font-medium text-gray-900">
                                                {path.created_at}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                                            <p className="text-base font-medium text-gray-900">
                                                {path.updated_at}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lessons List */}
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Lessons ({lessons.length})
                                    </h3>
                                    <Link
                                        href={route('admin.learning-paths.lessons.manage', path.path_id)}
                                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        Manage →
                                    </Link>
                                </div>
                                <div className="p-6">
                                    {lessons.length === 0 ? (
                                        <div className="text-center py-8">
                                            <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-500 mb-4">No lessons added yet</p>
                                            <Link
                                                href={route('admin.learning-paths.lessons.manage', path.path_id)}
                                                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                            >
                                                Add Lessons
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {lessons.map((lesson) => (
                                                <div
                                                    key={lesson.lesson_id}
                                                    className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center flex-1">
                                                            <span className="text-sm font-medium text-gray-500 mr-3 min-w-[30px]">
                                                                #{lesson.sequence_order}
                                                            </span>
                                                            <div className="flex-1">
                                                                <h4 className="text-base font-semibold text-gray-900">
                                                                    {lesson.title}
                                                                </h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs text-gray-500 capitalize">
                                                                        {lesson.difficulty}
                                                                    </span>
                                                                    {lesson.is_required && (
                                                                        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded">
                                                                            Required
                                                                        </span>
                                                                    )}
                                                                    {lesson.unlock_after_previous && (
                                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                                                            Sequential
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-gray-600 ml-4">
                                                            <ClockIcon className="w-4 h-4 inline mr-1" />
                                                            {lesson.estimated_duration_minutes || lesson.estimated_duration} min
                                                        </div>
                                                    </div>
                                                    {lesson.path_specific_notes && (
                                                        <p className="mt-2 text-sm text-gray-600 ml-10">
                                                            {lesson.path_specific_notes}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Stats & Enrollments */}
                        <div className="space-y-6">
                            {/* Completion Stats */}
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <h3 className="text-lg font-semibold text-gray-900">Enrollment Stats</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Total Students</span>
                                        <span className="text-lg font-bold text-gray-900">
                                            {completionStats.total_students}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 flex items-center">
                                            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                            Active
                                        </span>
                                        <span className="text-lg font-bold text-green-600">
                                            {completionStats.active}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 flex items-center">
                                            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                            Completed
                                        </span>
                                        <span className="text-lg font-bold text-blue-600">
                                            {completionStats.completed}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 flex items-center">
                                            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                                            Paused
                                        </span>
                                        <span className="text-lg font-bold text-yellow-600">
                                            {completionStats.paused}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 flex items-center">
                                            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                            Abandoned
                                        </span>
                                        <span className="text-lg font-bold text-red-600">
                                            {completionStats.abandoned}
                                        </span>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Average Progress</span>
                                            <span className="text-lg font-bold text-gray-900">
                                                {completionStats.average_progress}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Enrollments */}
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Enrollments</h3>
                                </div>
                                <div className="p-6">
                                    {recentEnrollments.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-4">
                                            No enrollments yet
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentEnrollments.map((enrollment) => (
                                                <div key={enrollment.student_path_id} className="pb-3 border-b border-gray-100 last:border-0">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {enrollment.student_name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {enrollment.student_email}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {enrollment.assigned_at}
                                                            </p>
                                                        </div>
                                                        <div className="text-right ml-3">
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {enrollment.progress_percent}%
                                                            </div>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                                enrollment.status === 'active' ? 'bg-green-100 text-green-800' :
                                                                enrollment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                                enrollment.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {enrollment.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}