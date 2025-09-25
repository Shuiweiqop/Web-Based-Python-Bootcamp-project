// resources/js/Pages/Admin/Exercises/Show.jsx
import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ChevronLeftIcon,
    PencilIcon,
    TrashIcon,
    DocumentTextIcon,
    ClockIcon,
    CodeBracketIcon,
    AcademicCapIcon,
    PlayIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

export default function Show({ auth, exercise, lesson }) {
    const { props: pageProps } = usePage();
    const flash = pageProps?.flash ?? {};

    // Safe route resolver
    const safeRoute = (name, params) => {
        try {
            return route(name, params);
        } catch (err) {
            // Fallback patterns for nested routes
            if (name === 'admin.lessons.exercises.edit' && Array.isArray(params)) {
                return `/admin/lessons/${params[0]}/exercises/${params[1]}/edit`;
            }
            if (name === 'admin.lessons.exercises.index') {
                return `/admin/lessons/${params}/exercises`;
            }
            if (name === 'admin.lessons.exercises.destroy' && Array.isArray(params)) {
                return `/admin/lessons/${params[0]}/exercises/${params[1]}`;
            }
            if (name === 'admin.lessons.show') {
                return `/admin/lessons/${params}`;
            }
            if (name === 'admin.exercises.edit') {
                return `/admin/exercises/${params}/edit`;
            }
            if (name === 'admin.exercises.index') {
                return `/admin/exercises`;
            }
            return null;
        }
    };

    const handleDelete = async () => {
        if (!exercise?.exercise_id) {
            alert('Exercise ID missing — cannot delete.');
            return;
        }

        if (!confirm('Are you sure you want to delete this exercise? This action cannot be undone.')) {
            return;
        }

        // Determine route based on whether it's nested under a lesson or standalone
        const routeName = lesson ? 'admin.lessons.exercises.destroy' : 'admin.exercises.destroy';
        const routeParams = lesson 
            ? [lesson.lesson_id, exercise.exercise_id]
            : exercise.exercise_id;
        
        const url = safeRoute(routeName, routeParams) || 
            (lesson ? `/admin/lessons/${lesson.lesson_id}/exercises/${exercise.exercise_id}` 
                   : `/admin/exercises/${exercise.exercise_id}`);

        router.delete(url, {
            onStart: () => console.debug('Deleting exercise', exercise.exercise_id),
            onSuccess: () => {
                console.debug('Delete success');
                // Redirect to appropriate index page
                if (lesson) {
                    router.visit(safeRoute('admin.lessons.show', lesson.lesson_id));
                } else {
                    router.visit(safeRoute('admin.exercises.index'));
                }
            },
            onError: (errors) => {
                console.error('Delete failed', errors);
                alert('Failed to delete exercise. Check console for details.');
            },
        });
    };

    const getStatusBadge = (isActive) => {
        return (
            <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${
                isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
            }`}>
                {isActive ? (
                    <>
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Active
                    </>
                ) : (
                    <>
                        <XCircleIcon className="w-4 h-4 mr-1" />
                        Inactive
                    </>
                )}
            </span>
        );
    };

    const getDifficultyBadge = (difficulty) => {
        const classes = {
            beginner: 'bg-blue-100 text-blue-800',
            intermediate: 'bg-orange-100 text-orange-800',
            advanced: 'bg-red-100 text-red-800',
            easy: 'bg-blue-100 text-blue-800',
            medium: 'bg-orange-100 text-orange-800',
            hard: 'bg-red-100 text-red-800',
        };

        return (
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                classes[difficulty] || 'bg-gray-100 text-gray-800'
            }`}>
                {difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'Unknown'}
            </span>
        );
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'coding':
                return <CodeBracketIcon className="w-5 h-5 text-gray-500" />;
            case 'multiple_choice':
                return <AcademicCapIcon className="w-5 h-5 text-gray-500" />;
            default:
                return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    if (!exercise) {
        return (
            <AuthenticatedLayout 
                user={auth?.user} 
                header={<h2 className="font-semibold text-xl">Exercise</h2>}
            >
                <Head title="Exercise not found" />
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                        Exercise data not found. It may have been deleted or failed to load.
                    </div>
                    <div className="mt-4">
                        <Link 
                            href={lesson ? safeRoute('admin.lessons.show', lesson.lesson_id) : safeRoute('admin.exercises.index')} 
                            className="px-4 py-2 border rounded"
                        >
                            {lesson ? 'Back to Lesson' : 'Back to Exercises'}
                        </Link>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout 
            user={auth?.user} 
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {exercise?.title ?? 'Exercise Details'}
                </h2>
            }
        >
            <Head title={exercise?.title ?? 'Exercise Details'} />

            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-4 rounded bg-green-100 border border-green-300 text-green-800 px-4 py-2">
                            {flash.success}
                        </div>
                    )}

                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center mb-4">
                            <Link 
                                href={lesson 
                                    ? safeRoute('admin.lessons.show', lesson.lesson_id) 
                                    : safeRoute('admin.exercises.index')
                                } 
                                className="flex items-center text-gray-500 hover:text-gray-700 mr-4"
                            >
                                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                                {lesson ? `Back to ${lesson.title}` : 'Back to Exercises'}
                            </Link>
                        </div>

                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {exercise?.title ?? 'Untitled Exercise'}
                                </h1>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {getStatusBadge(exercise?.is_active)}
                                    {exercise?.difficulty && getDifficultyBadge(exercise.difficulty)}
                                    {exercise?.exercise_type && (
                                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                                            {getTypeIcon(exercise.exercise_type)}
                                            <span className="ml-1">
                                                {exercise.exercise_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                        </span>
                                    )}
                                    {exercise?.time_limit_sec && (
                                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                            <ClockIcon className="w-4 h-4 mr-1" />
                                            {exercise.time_limit_sec}s
                                        </span>
                                    )}
                                </div>
                                {lesson && (
                                    <p className="text-gray-600 mb-4">
                                        Part of: <Link 
                                            href={safeRoute('admin.lessons.show', lesson.lesson_id)} 
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            {lesson.title}
                                        </Link>
                                    </p>
                                )}
                            </div>

                            <div className="flex space-x-3 ml-4">
                                <Link 
                                    href={lesson 
                                        ? safeRoute('admin.lessons.exercises.edit', [lesson.lesson_id, exercise.exercise_id]) 
                                        : safeRoute('admin.exercises.edit', exercise.exercise_id)
                                    } 
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center"
                                >
                                    <PencilIcon className="w-4 h-4 mr-2" />
                                    Edit
                                </Link>

                                <button 
                                    onClick={handleDelete} 
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
                                >
                                    <TrashIcon className="w-4 h-4 mr-2" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Description */}
                            {exercise?.description && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center mb-3">
                                        <DocumentTextIcon className="w-5 h-5 text-gray-500 mr-2" />
                                        <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{exercise.description}</p>
                                </div>
                            )}

                            {/* Starter Code */}
                            {exercise?.starter_code && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center mb-3">
                                        <CodeBracketIcon className="w-5 h-5 text-gray-500 mr-2" />
                                        <h3 className="text-lg font-semibold text-gray-900">Starter Code</h3>
                                    </div>
                                    <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                                        <code className="text-sm text-gray-800">
                                            {exercise.starter_code}
                                        </code>
                                    </pre>
                                </div>
                            )}

                            {/* Solution */}
                            {exercise?.solution && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center mb-3">
                                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                                        <h3 className="text-lg font-semibold text-gray-900">Solution / Expected Output</h3>
                                    </div>
                                    <pre className="bg-green-50 p-4 rounded-md overflow-x-auto border border-green-200">
                                        <code className="text-sm text-gray-800">
                                            {exercise.solution}
                                        </code>
                                    </pre>
                                </div>
                            )}

                            {/* Asset */}
                            {exercise?.asset_url && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center mb-3">
                                        <DocumentTextIcon className="w-5 h-5 text-gray-500 mr-2" />
                                        <h3 className="text-lg font-semibold text-gray-900">Additional Resources</h3>
                                    </div>
                                    <a 
                                        href={exercise.asset_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                    >
                                        <PlayIcon className="w-4 h-4 mr-1" />
                                        View Resource
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Information</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Type:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {exercise?.exercise_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Max Score:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {exercise?.max_score ?? 0} pts
                                        </span>
                                    </div>
                                    {exercise?.time_limit_sec && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Time Limit:</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {exercise.time_limit_sec}s
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Status:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {exercise?.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Created:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {exercise?.created_at 
                                                ? new Date(exercise.created_at).toLocaleDateString() 
                                                : 'Unknown'
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Updated:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {exercise?.updated_at 
                                                ? new Date(exercise.updated_at).toLocaleDateString() 
                                                : 'Unknown'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-2">
                                    <Link 
                                        href={lesson 
                                            ? safeRoute('admin.lessons.exercises.edit', [lesson.lesson_id, exercise.exercise_id]) 
                                            : safeRoute('admin.exercises.edit', exercise.exercise_id)
                                        } 
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-center block"
                                    >
                                        Edit Exercise
                                    </Link>
                                    {lesson && (
                                        <Link 
                                            href={safeRoute('admin.lessons.show', lesson.lesson_id)} 
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-center block"
                                        >
                                            View Lesson
                                        </Link>
                                    )}
                                    <Link 
                                        href={lesson 
                                            ? safeRoute('admin.lessons.exercises.index', lesson.lesson_id) 
                                            : safeRoute('admin.exercises.index')
                                        } 
                                        className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-center block"
                                    >
                                        {lesson ? 'All Lesson Exercises' : 'All Exercises'}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}