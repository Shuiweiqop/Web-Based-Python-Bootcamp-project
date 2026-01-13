// resources/js/Pages/Admin/Tests/Edit.jsx
import React from 'react';
import { Head, Link, useForm, router} from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  ChevronLeft,
  Info,
  Clock,
  Users,
  CheckCircle,
  Eye,
  Shuffle,
  AlertCircle
} from 'lucide-react';

export default function Edit({ auth, lesson, test, statusOptions }) {
    const { data, setData, put, processing, errors } = useForm({
        title: test?.title || '',
        description: test?.description || '',
        instructions: test?.instructions || '',
        time_limit: test?.time_limit || '',
        max_attempts: test?.max_attempts || 3,
        passing_score: test?.passing_score || 70,
        shuffle_questions: test?.shuffle_questions || false,
        show_results_immediately: test?.show_results_immediately ?? true,
        allow_review: test?.allow_review ?? true,
        status: test?.status || 'draft',
        order: test?.order || '',
    });

    const handleSubmit = (e) => {
  e.preventDefault();

  // 使用你从 useForm 解构出来的 put 方法（文件顶部你已有 put）
  put(route('admin.lessons.tests.update', [lesson.lesson_id, test.test_id]), {
    preserveScroll: true,
    onSuccess: () => {
      console.log('Update successful');
    },
    onError: (errors) => {
      console.error('Update failed:', errors);
    },
  });
};

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Edit Test</h2>
                        <p className="text-slate-600 mt-1">Lesson: {lesson.title}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        test.status === 'active' ? 'bg-green-100 text-green-700' :
                        test.status === 'inactive' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-700'
                    }`}>
                        {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                    </span>
                </div>
            }
        >
            <Head title={`Edit Test - ${test.title}`} />

            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link
                        href={route('admin.lessons.tests.show', [lesson.lesson_id, test.test_id])}
                        className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Test Details
                    </Link>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Editing Test Configuration</p>
                            <p>
                                Changes to the test settings will apply immediately. Students who are currently 
                                taking this test will continue with the old settings.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Warning if test has submissions */}
                {test.submissions_count > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                                <p className="font-medium mb-1">Test Has Submissions</p>
                                <p>
                                    This test has {test.submissions_count} submission(s). Be careful when changing 
                                    passing scores or time limits as it may affect grading consistency.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Information */}
                            <div className="space-y-6">
                                <div className="border-b border-slate-200 pb-4">
                                    <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
                                    <p className="text-sm text-slate-600 mt-1">
                                        General details about your test
                                    </p>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Test Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="e.g., Python Basics Quiz, Data Types Assessment"
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                        required
                                    />
                                    {errors.title && (
                                        <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        placeholder="Brief description of what this test covers"
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                    />
                                    {errors.description && (
                                        <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                {/* Instructions */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Test Instructions
                                    </label>
                                    <textarea
                                        value={data.instructions}
                                        onChange={(e) => setData('instructions', e.target.value)}
                                        rows={4}
                                        placeholder="Instructions for students taking this test..."
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                    />
                                    <p className="mt-1 text-sm text-slate-500">
                                        These instructions will be shown to students before they start the test.
                                    </p>
                                    {errors.instructions && (
                                        <p className="mt-2 text-sm text-red-600">{errors.instructions}</p>
                                    )}
                                </div>
                            </div>

                            {/* Test Settings */}
                            <div className="space-y-6">
                                <div className="border-b border-slate-200 pb-4">
                                    <h3 className="text-lg font-semibold text-slate-900">Test Settings</h3>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Configure how students will take this test
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Time Limit */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            Time Limit (minutes)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.time_limit}
                                            onChange={(e) => setData('time_limit', parseInt(e.target.value) || '')}
                                            min="1"
                                            max="999"
                                            placeholder="Leave empty for no time limit"
                                            className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                        />
                                        <p className="mt-1 text-sm text-slate-500">
                                            Optional. Test will auto-submit when time expires.
                                        </p>
                                        {errors.time_limit && (
                                            <p className="mt-2 text-sm text-red-600">{errors.time_limit}</p>
                                        )}
                                    </div>

                                    {/* Max Attempts */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            <Users className="w-4 h-4 inline mr-1" />
                                            Maximum Attempts
                                        </label>
                                        <input
                                            type="number"
                                            value={data.max_attempts}
                                            onChange={(e) => setData('max_attempts', parseInt(e.target.value) || 1)}
                                            min="1"
                                            max="10"
                                            className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                            required
                                        />
                                        <p className="mt-1 text-sm text-slate-500">
                                            How many times a student can attempt this test.
                                        </p>
                                        {errors.max_attempts && (
                                            <p className="mt-2 text-sm text-red-600">{errors.max_attempts}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Passing Score */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <CheckCircle className="w-4 h-4 inline mr-1" />
                                        Passing Score (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.passing_score}
                                        onChange={(e) => setData('passing_score', parseInt(e.target.value) || 70)}
                                        min="1"
                                        max="100"
                                        className="w-full md:w-48 border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                        required
                                    />
                                    <p className="mt-1 text-sm text-slate-500">
                                        Minimum score required to pass this test.
                                    </p>
                                    {errors.passing_score && (
                                        <p className="mt-2 text-sm text-red-600">{errors.passing_score}</p>
                                    )}
                                </div>
                            </div>

                            {/* Test Behavior */}
                            <div className="space-y-6">
                                <div className="border-b border-slate-200 pb-4">
                                    <h3 className="text-lg font-semibold text-slate-900">Test Behavior</h3>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Configure how the test behaves for students
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {/* Shuffle Questions */}
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="shuffle_questions"
                                                type="checkbox"
                                                checked={data.shuffle_questions}
                                                onChange={(e) => setData('shuffle_questions', e.target.checked)}
                                                className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 focus:ring-2"
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <label htmlFor="shuffle_questions" className="text-sm font-medium text-slate-700">
                                                <Shuffle className="w-4 h-4 inline mr-1" />
                                                Shuffle Questions
                                            </label>
                                            <p className="text-sm text-slate-500">
                                                Randomize the order of questions for each student.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Show Results Immediately */}
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="show_results_immediately"
                                                type="checkbox"
                                                checked={data.show_results_immediately}
                                                onChange={(e) => setData('show_results_immediately', e.target.checked)}
                                                className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 focus:ring-2"
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <label htmlFor="show_results_immediately" className="text-sm font-medium text-slate-700">
                                                <Eye className="w-4 h-4 inline mr-1" />
                                                Show Results Immediately
                                            </label>
                                            <p className="text-sm text-slate-500">
                                                Students see their score right after submitting.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Allow Review */}
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="allow_review"
                                                type="checkbox"
                                                checked={data.allow_review}
                                                onChange={(e) => setData('allow_review', e.target.checked)}
                                                className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 focus:ring-2"
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <label htmlFor="allow_review" className="text-sm font-medium text-slate-700">
                                                Allow Answer Review
                                            </label>
                                            <p className="text-sm text-slate-500">
                                                Students can review correct answers and explanations after submission.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Administrative Settings */}
                            <div className="space-y-6">
                                <div className="border-b border-slate-200 pb-4">
                                    <h3 className="text-lg font-semibold text-slate-900">Administrative Settings</h3>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Status and ordering options
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                        >
                                            {Object.entries(statusOptions).map(([key, label]) => (
                                                <option key={key} value={key}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Only active tests are visible to students.
                                        </p>
                                        {errors.status && (
                                            <p className="mt-2 text-sm text-red-600">{errors.status}</p>
                                        )}
                                    </div>

                                    {/* Order */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Display Order (optional)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.order}
                                            onChange={(e) => setData('order', parseInt(e.target.value) || '')}
                                            min="0"
                                            placeholder="Auto-assigned if left empty"
                                            className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                        />
                                        <p className="mt-1 text-sm text-slate-500">
                                            Controls the order tests appear in the lesson.
                                        </p>
                                        {errors.order && (
                                            <p className="mt-2 text-sm text-red-600">{errors.order}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                                <Link
                                    href={route('admin.lessons.tests.show', [lesson.lesson_id, test.test_id])}
                                    className="text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    Cancel
                                </Link>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                                    >
                                        {processing ? 'Saving Changes...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Test Statistics */}
                {test.questions_count > 0 && (
                    <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
                        <h4 className="text-sm font-semibold text-slate-900 mb-4">Test Statistics</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <div className="text-2xl font-bold text-slate-900">{test.questions_count}</div>
                                <div className="text-xs text-slate-600 mt-1">Questions</div>
                            </div>
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <div className="text-2xl font-bold text-slate-900">{test.submissions_count || 0}</div>
                                <div className="text-xs text-slate-600 mt-1">Submissions</div>
                            </div>
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <div className="text-2xl font-bold text-slate-900">{test.average_score || 0}%</div>
                                <div className="text-xs text-slate-600 mt-1">Avg Score</div>
                            </div>
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <div className="text-2xl font-bold text-slate-900">{test.pass_rate || 0}%</div>
                                <div className="text-xs text-slate-600 mt-1">Pass Rate</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}