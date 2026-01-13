// resources/js/Pages/Admin/Tests/Show.jsx
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
  ChevronLeftIcon, 
  PlusIcon,
  PencilIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  PlayIcon,
  Cog6ToothIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function Show({ auth, lesson, test, questions, submissionStats, flash }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = () => {
        router.delete(route('admin.lessons.tests.destroy', [lesson.lesson_id, test.test_id]), {
            onSuccess: () => {
                // Will redirect automatically
            },
            onError: (errors) => {
                console.error('Delete failed:', errors);
            }
        });
        setShowDeleteModal(false);
    };

    const handleDuplicate = () => {
        if (confirm('This will create a copy of the test with all its questions. Continue?')) {
            router.post(route('admin.lessons.tests.duplicate', [lesson.lesson_id, test.test_id]), {}, {
                onError: (errors) => {
                    console.error('Duplicate failed:', errors);
                    alert('Failed to duplicate test. Please try again.');
                }
            });
        }
    };

    const getStatusBadge = (status) => {
        const classes = {
            active: 'bg-green-100 text-green-800 border-green-200',
            inactive: 'bg-gray-100 text-gray-800 border-gray-200',
            draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
        const statusLabels = {
            active: 'Active',
            inactive: 'Inactive', 
            draft: 'Draft'
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes[status] || classes.draft}`}>
                {statusLabels[status] || status}
            </span>
        );
    };

    const getQuestionTypeBadge = (type) => {
        const typeLabels = {
            mcq: 'Multiple Choice',
            coding: 'Coding',
            true_false: 'True/False',
            short_answer: 'Short Answer'
        };
        const typeColors = {
            mcq: 'bg-blue-100 text-blue-800',
            coding: 'bg-green-100 text-green-800', 
            true_false: 'bg-purple-100 text-purple-800',
            short_answer: 'bg-orange-100 text-orange-800'
        };
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeColors[type] || 'bg-gray-100 text-gray-800'}`}>
                {typeLabels[type] || type}
            </span>
        );
    };

    const getDifficultyBadge = (level) => {
        const colors = {
            1: 'bg-green-100 text-green-800',
            2: 'bg-yellow-100 text-yellow-800', 
            3: 'bg-red-100 text-red-800'
        };
        const labels = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colors[level] || 'bg-gray-100 text-gray-800'}`}>
                {labels[level] || `Level ${level}`}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Test Details</h2>}
        >
            <Head title={`${test.title} - Test Details`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Navigation */}
                    <div className="mb-6">
                        <Link
                            href={route('admin.lessons.tests.index', lesson.lesson_id)}
                            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ChevronLeftIcon className="w-5 h-5 mr-1" />
                            Back to Tests
                        </Link>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                            <div className="flex items-center">
                                <CheckCircleIcon className="w-5 h-5 mr-2" />
                                {flash.success}
                            </div>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {flash.error}
                        </div>
                    )}

                    {/* Test Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <h1 className="text-2xl font-bold text-gray-900 mr-3">{test.title}</h1>
                                        {getStatusBadge(test.status)}
                                    </div>
                                    <p className="text-gray-600 mb-2">
                                        Lesson: <span className="font-medium">{lesson.title}</span>
                                    </p>
                                    {test.description && (
                                        <p className="text-gray-700 mb-4">{test.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                    <Link
                                        href={route('admin.lessons.tests.edit', [lesson.lesson_id, test.test_id])}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <PencilIcon className="w-4 h-4 mr-2" />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={handleDuplicate}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                                        Duplicate
                                    </button>
                                    <Link
                                        href={route('admin.lessons.tests.preview', [lesson.lesson_id, test.test_id])}
                                        className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                                    >
                                        <PlayIcon className="w-4 h-4 mr-2" />
                                        Preview
                                    </Link>
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4 mr-2" />
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {/* Test Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="text-center">
                                    <div className="flex items-center justify-center mb-1">
                                        <QuestionMarkCircleIcon className="w-5 h-5 text-gray-500 mr-1" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{test.questions_count || 0}</div>
                                    <div className="text-sm text-gray-600">Questions</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center mb-1">
                                        <ChartBarIcon className="w-5 h-5 text-gray-500 mr-1" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{test.total_points || 0}</div>
                                    <div className="text-sm text-gray-600">Total Points</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center mb-1">
                                        <ClockIcon className="w-5 h-5 text-gray-500 mr-1" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {test.time_limit ? `${test.time_limit}m` : 'No Limit'}
                                    </div>
                                    <div className="text-sm text-gray-600">Time Limit</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center mb-1">
                                        <CheckCircleIcon className="w-5 h-5 text-gray-500 mr-1" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{test.passing_score}%</div>
                                    <div className="text-sm text-gray-600">Pass Score</div>
                                </div>
                            </div>

                            {/* Additional Settings */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Max Attempts:</span>
                                        <span className="ml-2 text-gray-600">{test.max_attempts}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Questions Shuffled:</span>
                                        <span className="ml-2 text-gray-600">{test.shuffle_questions ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Instant Results:</span>
                                        <span className="ml-2 text-gray-600">{test.show_results_immediately ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Instructions */}
                            {test.instructions && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h3 className="font-medium text-gray-900 mb-2">Test Instructions</h3>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-sm text-blue-800">{test.instructions}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statistics */}
                    {submissionStats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                        <UserGroupIcon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{submissionStats.total_attempts}</div>
                                        <div className="text-sm text-gray-600">Total Attempts</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                        <CheckCircleIcon className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{submissionStats.completed}</div>
                                        <div className="text-sm text-gray-600">Completed</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                                        <ClockIcon className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{submissionStats.in_progress}</div>
                                        <div className="text-sm text-gray-600">In Progress</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                                        <ChartBarIcon className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {submissionStats.average_score ? `${Math.round(submissionStats.average_score)}%` : 'N/A'}
                                        </div>
                                        <div className="text-sm text-gray-600">Avg Score</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Questions Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Manage the questions for this test
                                    </p>
                                </div>
                                <Link
                                    href={route('admin.lessons.tests.questions.create', [lesson.lesson_id, test.test_id])}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Add Question
                                </Link>
                            </div>

                            {questions && questions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Order
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Question
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Difficulty
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Points
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {questions.map((question, index) => (
                                                <tr key={question.question_id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                                                                {question.order || index + 1}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                            {question.question_text}
                                                        </div>
                                                        {question.type === 'mcq' && question.options_count && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {question.options_count} options
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getQuestionTypeBadge(question.type)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getDifficultyBadge(question.difficulty_level)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {question.points} pts
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(question.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex items-center space-x-3">
                                                            <Link
                                                                href={route('admin.lessons.tests.questions.show', [lesson.lesson_id, test.test_id, question.question_id])}
                                                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                                                title="View Question"
                                                            >
                                                                <EyeIcon className="w-4 h-4" />
                                                            </Link>
                                                            <Link
                                                                href={route('admin.lessons.tests.questions.edit', [lesson.lesson_id, test.test_id, question.question_id])}
                                                                className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                                title="Edit Question"
                                                            >
                                                                <PencilIcon className="w-4 h-4" />
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                        <QuestionMarkCircleIcon className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                                    <p className="text-gray-500 mb-6">
                                        Add questions to make this test available to students.
                                    </p>
                                    <Link
                                        href={route('admin.lessons.tests.questions.create', [lesson.lesson_id, test.test_id])}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Add First Question
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={route('admin.lessons.tests.questions.index', [lesson.lesson_id, test.test_id])}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-white transition-colors"
                            >
                                <Cog6ToothIcon className="w-4 h-4 mr-1" />
                                Manage Questions
                            </Link>
                            <Link
                                href={route('admin.lessons.tests.preview', [lesson.lesson_id, test.test_id])}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-white transition-colors"
                            >
                                <EyeIcon className="w-4 h-4 mr-1" />
                                Preview Test
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
                        <div className="mt-3">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <TrashIcon className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Delete Test</h3>
                            <p className="text-sm text-gray-500 text-center mb-6">
                                Are you sure you want to delete this test? This action cannot be undone and will remove all questions and student submissions.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete Test
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}