import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import {
    ArrowLeftIcon,
    PencilIcon,
    PlayIcon,
    PauseIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    LockClosedIcon,
    ClockIcon,
    CalendarIcon,
    UserIcon,
    ChartBarIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';

export default function Show({ auth, assignment, progressDetails, lessonProgress, activityTimeline }) {
    const [processing, setProcessing] = useState(false);

    const handlePause = () => {
        if (confirm('Are you sure you want to pause this learning path?')) {
            setProcessing(true);
            router.post(route('admin.student-paths.pause', assignment.student_path_id), {}, {
                onFinish: () => setProcessing(false),
            });
        }
    };

    const handleResume = () => {
        setProcessing(true);
        router.post(route('admin.student-paths.resume', assignment.student_path_id), {}, {
            onFinish: () => setProcessing(false),
        });
    };

    const handleUpdateProgress = () => {
        setProcessing(true);
        router.post(route('admin.student-paths.update-progress', assignment.student_path_id), {}, {
            onFinish: () => setProcessing(false),
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-800',
            completed: 'bg-blue-100 text-blue-800',
            paused: 'bg-yellow-100 text-yellow-800',
            abandoned: 'bg-red-100 text-red-800',
            not_started: 'bg-gray-100 text-gray-800',
            in_progress: 'bg-indigo-100 text-indigo-800',
        };
        return (
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${styles[status]}`}>
                {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </span>
        );
    };

    const getProgressColor = (progress) => {
        if (progress >= 75) return 'bg-green-500';
        if (progress >= 50) return 'bg-blue-500';
        if (progress >= 25) return 'bg-yellow-500';
        return 'bg-gray-300';
    };

    return (
        <AuthenticatedLayout 
            user={auth.user}
            // ✅ 1. Header Prop 添加在此
            header={
                <div className="space-y-4">
                    {/* 面包屑 / 返回链接 */}
                    <div>
                        <Link
                            href={route('admin.student-paths.index')}
                            className="inline-flex items-center text-sm opacity-80 hover:opacity-100 transition mb-2"
                        >
                            <ArrowLeftIcon className="w-4 h-4 mr-1" />
                            Back to Student Paths
                        </Link>
                    </div>

                    <div className="flex justify-between items-start">
                        {/* 标题部分 */}
                        <div>
                            <h2 className="text-2xl font-bold leading-tight">
                                Student Learning Path Details
                            </h2>
                            <p className="mt-1 text-sm opacity-90">
                                {assignment.student.name} - {assignment.path.title}
                            </p>
                        </div>

                        {/* 按钮动作组 - 移到了 Header 右侧 */}
                        <div className="flex gap-2">
                            <Link
                                href={route('admin.student-paths.edit', assignment.student_path_id)}
                                className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition inline-flex items-center"
                            >
                                <PencilIcon className="w-4 h-4 mr-2" />
                                Edit Settings
                            </Link>

                            {assignment.status === 'paused' ? (
                                <button
                                    onClick={handleResume}
                                    disabled={processing}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center disabled:opacity-50"
                                >
                                    <PlayIcon className="w-4 h-4 mr-2" />
                                    Resume
                                </button>
                            ) : assignment.status === 'active' ? (
                                <button
                                    onClick={handlePause}
                                    disabled={processing}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition inline-flex items-center disabled:opacity-50"
                                >
                                    <PauseIcon className="w-4 h-4 mr-2" />
                                    Pause
                                </button>
                            ) : null}

                            <button
                                onClick={handleUpdateProgress}
                                disabled={processing}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition inline-flex items-center disabled:opacity-50"
                            >
                                <ArrowPathIcon className="w-4 h-4 mr-2" />
                                Refresh Progress
                            </button>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`${assignment.student.name} - ${assignment.path.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* ❌ 2. 移除了原本在这里的 Header div */}

                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                            </div>
                            {getStatusBadge(assignment.status)}
                            {assignment.is_overdue && (
                                <p className="mt-2 text-xs text-red-600 font-semibold">
                                    ⚠ OVERDUE
                                </p>
                            )}
                        </div>

                        {/* Progress Card */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-500">Overall Progress</h3>
                            </div>
                            <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-3 mr-3">
                                    <div
                                        className={`h-3 rounded-full transition-all ${getProgressColor(assignment.progress_percent)}`}
                                        style={{ width: `${assignment.progress_percent}%` }}
                                    />
                                </div>
                                <span className="text-2xl font-bold text-gray-900">
                                    {assignment.progress_percent}%
                                </span>
                            </div>
                        </div>

                        {/* Days in Path */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-500">Active Days</h3>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {assignment.active_days} / {assignment.days_in_path}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                {assignment.activity_rate}% activity rate
                            </p>
                        </div>

                        {/* Target Date */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-500">Target Date</h3>
                            </div>
                            {assignment.target_completion_date ? (
                                <>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {assignment.target_completion_date}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {assignment.days_until_target > 0 
                                            ? `${assignment.days_until_target} days left`
                                            : assignment.days_until_target === 0
                                            ? 'Due today'
                                            : `${Math.abs(assignment.days_until_target)} days overdue`
                                        }
                                    </p>
                                </>
                            ) : (
                                <p className="text-gray-500">Not set</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Details & Timeline */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Assignment Information */}
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Assignment Information
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Student</p>
                                            <p className="text-base font-medium text-gray-900">
                                                {assignment.student.name}
                                            </p>
                                            <p className="text-sm text-gray-600">{assignment.student.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Learning Path</p>
                                            <p className="text-base font-medium text-gray-900">
                                                {assignment.path.title}
                                            </p>
                                            <p className="text-sm text-gray-600 capitalize">
                                                {assignment.path.difficulty_level}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Assigned By</p>
                                            <p className="text-base font-medium text-gray-900 capitalize">
                                                {assignment.assigned_by.replace('_', ' ')}
                                            </p>
                                            {assignment.assigned_by_user && (
                                                <p className="text-sm text-gray-600">{assignment.assigned_by_user}</p>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Assigned At</p>
                                            <p className="text-base font-medium text-gray-900">
                                                {assignment.assigned_at}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Started At</p>
                                            <p className="text-base font-medium text-gray-900">
                                                {assignment.started_at || 'Not started'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Last Activity</p>
                                            <p className="text-base font-medium text-gray-900">
                                                {assignment.last_activity_at || 'Never'}
                                            </p>
                                        </div>
                                    </div>

                                    {assignment.completed_at && (
                                        <div>
                                            <p className="text-sm text-gray-500">Completed At</p>
                                            <p className="text-base font-medium text-gray-900">
                                                {assignment.completed_at}
                                            </p>
                                        </div>
                                    )}

                                    {assignment.recommendation_reason && (
                                        <div>
                                            <p className="text-sm text-gray-500">Recommendation Reason</p>
                                            <p className="text-base text-gray-900">
                                                {assignment.recommendation_reason}
                                            </p>
                                        </div>
                                    )}

                                    {assignment.student_notes && (
                                        <div>
                                            <p className="text-sm text-gray-500">Notes</p>
                                            <p className="text-base text-gray-900">
                                                {assignment.student_notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Lesson Progress */}
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Lesson Progress
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {lessonProgress.map((lesson) => (
                                            <div
                                                key={lesson.lesson_id}
                                                className={`p-4 rounded-lg border ${
                                                    lesson.is_locked
                                                        ? 'bg-gray-50 border-gray-200'
                                                        : 'bg-white border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center flex-1">
                                                        <span className="text-sm font-medium text-gray-500 mr-3">
                                                            #{lesson.sequence_order}
                                                        </span>
                                                        <h4 className="text-base font-semibold text-gray-900">
                                                            {lesson.title}
                                                        </h4>
                                                        {lesson.is_locked && (
                                                            <LockClosedIcon className="w-4 h-4 ml-2 text-gray-400" />
                                                        )}
                                                        {lesson.is_required && (
                                                            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded">
                                                                Required
                                                            </span>
                                                        )}
                                                    </div>
                                                    {getStatusBadge(lesson.status)}
                                                </div>

                                                <div className="flex items-center mt-3">
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                                                        <div
                                                            className={`h-2 rounded-full ${getProgressColor(lesson.progress_percent)}`}
                                                            style={{ width: `${lesson.progress_percent}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-700 font-medium min-w-[50px] text-right">
                                                        {lesson.progress_percent}%
                                                    </span>
                                                </div>

                                                {lesson.time_spent_minutes > 0 && (
                                                    <div className="mt-2 flex items-center text-sm text-gray-600">
                                                        <ClockIcon className="w-4 h-4 mr-1" />
                                                        {lesson.time_spent_minutes} minutes
                                                        {lesson.last_accessed_at && (
                                                            <span className="ml-3">
                                                                Last accessed: {lesson.last_accessed_at}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Stats & Timeline */}
                        <div className="space-y-6">
                            {/* Progress Stats */}
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Progress Summary
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Total Lessons</span>
                                            <span className="text-lg font-bold text-gray-900">
                                                {progressDetails.total_lessons}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 flex items-center">
                                                <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
                                                Completed
                                            </span>
                                            <span className="text-lg font-bold text-green-600">
                                                {progressDetails.completed}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 flex items-center">
                                                <ClockIcon className="w-4 h-4 mr-1 text-blue-500" />
                                                In Progress
                                            </span>
                                            <span className="text-lg font-bold text-blue-600">
                                                {progressDetails.in_progress}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Not Started</span>
                                            <span className="text-lg font-bold text-gray-600">
                                                {progressDetails.not_started}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Timeline */}
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Recent Activity
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {activityTimeline.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-4">
                                                No activity yet
                                            </p>
                                        ) : (
                                            activityTimeline.map((event, index) => (
                                                <div key={index} className="flex">
                                                    <div className="flex flex-col items-center mr-4">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                            event.type === 'completed' ? 'bg-green-100' :
                                                            event.type === 'lesson_completed' ? 'bg-blue-100' :
                                                            event.type === 'started' ? 'bg-indigo-100' :
                                                            'bg-gray-100'
                                                        }`}>
                                                            {event.type === 'completed' || event.type === 'lesson_completed' ? (
                                                                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                                            ) : event.type === 'started' ? (
                                                                <PlayIcon className="w-4 h-4 text-indigo-600" />
                                                            ) : (
                                                                <CalendarIcon className="w-4 h-4 text-gray-600" />
                                                            )}
                                                        </div>
                                                        {index < activityTimeline.length - 1 && (
                                                            <div className="w-0.5 h-full bg-gray-200 mt-2" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 pb-4">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {event.description}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {event.date}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}