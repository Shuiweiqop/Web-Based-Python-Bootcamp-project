// resources/js/Pages/Admin/Tests/Create.jsx
import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  ChevronLeftIcon,
  InformationCircleIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  EyeIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

export default function Create({ auth, lesson, statusOptions }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        instructions: '',
        time_limit: '',
        max_attempts: 3,
        passing_score: 70,
        shuffle_questions: false,
        show_results_immediately: true,
        allow_review: true,
        status: 'draft',
        order: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.lessons.tests.store', lesson.lesson_id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Create Test for: {lesson.title}
                </h2>
            }
        >
            <Head title={`Create Test - ${lesson.title}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={route('admin.lessons.tests.index', lesson.lesson_id)}
                            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ChevronLeftIcon className="w-5 h-5 mr-1" />
                            Back to Tests
                        </Link>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                            <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Creating a New Test</p>
                                <p>
                                    You're creating the test framework. After saving, you'll be able to add questions 
                                    of different types (Multiple Choice, Coding, True/False, Short Answer).
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Information */}
                                <div className="space-y-6">
                                    <div className="border-b border-gray-200 pb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            General details about your test
                                        </p>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Test Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="e.g., Python Basics Quiz, Data Types Assessment"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        {errors.title && (
                                            <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={3}
                                            placeholder="Brief description of what this test covers"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        {errors.description && (
                                            <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                                        )}
                                    </div>

                                    {/* Instructions */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Test Instructions
                                        </label>
                                        <textarea
                                            value={data.instructions}
                                            onChange={(e) => setData('instructions', e.target.value)}
                                            rows={4}
                                            placeholder="Instructions for students taking this test..."
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <p className="mt-1 text-sm text-gray-500">
                                            These instructions will be shown to students before they start the test.
                                        </p>
                                        {errors.instructions && (
                                            <p className="mt-2 text-sm text-red-600">{errors.instructions}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Test Settings */}
                                <div className="space-y-6">
                                    <div className="border-b border-gray-200 pb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Test Settings</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Configure how students will take this test
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Time Limit */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <ClockIcon className="w-4 h-4 inline mr-1" />
                                                Time Limit (minutes)
                                            </label>
                                            <input
                                                type="number"
                                                value={data.time_limit}
                                                onChange={(e) => setData('time_limit', parseInt(e.target.value) || '')}
                                                min="1"
                                                max="999"
                                                placeholder="Leave empty for no time limit"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <p className="mt-1 text-sm text-gray-500">
                                                Optional. Test will auto-submit when time expires.
                                            </p>
                                            {errors.time_limit && (
                                                <p className="mt-2 text-sm text-red-600">{errors.time_limit}</p>
                                            )}
                                        </div>

                                        {/* Max Attempts */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <UserGroupIcon className="w-4 h-4 inline mr-1" />
                                                Maximum Attempts
                                            </label>
                                            <input
                                                type="number"
                                                value={data.max_attempts}
                                                onChange={(e) => setData('max_attempts', parseInt(e.target.value) || 1)}
                                                min="1"
                                                max="10"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                            <p className="mt-1 text-sm text-gray-500">
                                                How many times a student can attempt this test.
                                            </p>
                                            {errors.max_attempts && (
                                                <p className="mt-2 text-sm text-red-600">{errors.max_attempts}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Passing Score */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                                            Passing Score (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.passing_score}
                                            onChange={(e) => setData('passing_score', parseInt(e.target.value) || 70)}
                                            min="1"
                                            max="100"
                                            className="w-full md:w-48 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        <p className="mt-1 text-sm text-gray-500">
                                            Minimum score required to pass this test.
                                        </p>
                                        {errors.passing_score && (
                                            <p className="mt-2 text-sm text-red-600">{errors.passing_score}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Test Behavior */}
                                <div className="space-y-6">
                                    <div className="border-b border-gray-200 pb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Test Behavior</h3>
                                        <p className="text-sm text-gray-600 mt-1">
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
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                />
                                            </div>
                                            <div className="ml-3">
                                                <label htmlFor="shuffle_questions" className="text-sm font-medium text-gray-700">
                                                    <ArrowsRightLeftIcon className="w-4 h-4 inline mr-1" />
                                                    Shuffle Questions
                                                </label>
                                                <p className="text-sm text-gray-500">
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
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                />
                                            </div>
                                            <div className="ml-3">
                                                <label htmlFor="show_results_immediately" className="text-sm font-medium text-gray-700">
                                                    <EyeIcon className="w-4 h-4 inline mr-1" />
                                                    Show Results Immediately
                                                </label>
                                                <p className="text-sm text-gray-500">
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
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                />
                                            </div>
                                            <div className="ml-3">
                                                <label htmlFor="allow_review" className="text-sm font-medium text-gray-700">
                                                    Allow Answer Review
                                                </label>
                                                <p className="text-sm text-gray-500">
                                                    Students can review correct answers and explanations after submission.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Administrative Settings */}
                                <div className="space-y-6">
                                    <div className="border-b border-gray-200 pb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Administrative Settings</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Status and ordering options
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Status */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status
                                            </label>
                                            <select
                                                value={data.status}
                                                onChange={(e) => setData('status', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                {Object.entries(statusOptions).map(([key, label]) => (
                                                    <option key={key} value={key}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Only active tests are visible to students.
                                            </p>
                                            {errors.status && (
                                                <p className="mt-2 text-sm text-red-600">{errors.status}</p>
                                            )}
                                        </div>

                                        {/* Order */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Display Order (optional)
                                            </label>
                                            <input
                                                type="number"
                                                value={data.order}
                                                onChange={(e) => setData('order', parseInt(e.target.value) || '')}
                                                min="0"
                                                placeholder="Auto-assigned if left empty"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <p className="mt-1 text-sm text-gray-500">
                                                Controls the order tests appear in the lesson.
                                            </p>
                                            {errors.order && (
                                                <p className="mt-2 text-sm text-red-600">{errors.order}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <Link
                                        href={route('admin.lessons.tests.index', lesson.lesson_id)}
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        {processing ? 'Creating Test...' : 'Create Test'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Next Steps Info */}
                    <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">What's Next?</h4>
                        <p className="text-sm text-gray-600">
                            After creating this test, you'll be redirected to the test details page where you can:
                        </p>
                        <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                            <li>Add questions of different types (MCQ, Coding, True/False, Short Answer)</li>
                            <li>Configure individual question points and difficulty</li>
                            <li>Preview how the test will appear to students</li>
                            <li>Activate the test when you're ready</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}