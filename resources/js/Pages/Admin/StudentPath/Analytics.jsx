import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ auth, assignment, statusOptions }) {
    const { data, setData, put, processing, errors } = useForm({
        status: assignment.status,
        is_primary: assignment.is_primary,
        target_completion_date: assignment.target_completion_date || '',
        student_notes: assignment.student_notes || '',
    });

    const handleSubmit = () => {
        put(route('admin.student-paths.update', assignment.student_path_id));
    };

    const getStatusColor = (status) => {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'completed': 'bg-blue-100 text-blue-800',
            'paused': 'bg-yellow-100 text-yellow-800',
            'abandoned': 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Edit Assignment Settings" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Edit Assignment Settings
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Modify the learning path assignment for {assignment.student.name}
                        </p>
                    </div>

                    {/* Assignment Info Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-blue-600 font-medium">Student</p>
                                <p className="text-lg font-semibold text-blue-900">
                                    {assignment.student.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-blue-600 font-medium">Learning Path</p>
                                <p className="text-lg font-semibold text-blue-900">
                                    {assignment.path.title}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                        
                        {/* Status Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {Object.entries(statusOptions).map(([value, label]) => (
                                    <button
                                        key={value}
                                        onClick={() => setData('status', value)}
                                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                                            data.status === value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(value)}`}>
                                            {label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            {errors.status && (
                                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                            )}

                            {/* Status Descriptions */}
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-600">
                                    {data.status === 'active' && '✅ Student is actively working on this path'}
                                    {data.status === 'paused' && '⏸️ Path is temporarily paused'}
                                    {data.status === 'completed' && '🎉 Student has completed this path'}
                                    {data.status === 'abandoned' && '❌ Path has been discontinued'}
                                </p>
                            </div>
                        </div>

                        {/* Target Completion Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Target Completion Date
                            </label>
                            <input
                                type="date"
                                value={data.target_completion_date}
                                onChange={(e) => setData('target_completion_date', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Set or update the target completion date for this assignment
                            </p>
                            {errors.target_completion_date && (
                                <p className="mt-1 text-sm text-red-600">{errors.target_completion_date}</p>
                            )}
                        </div>

                        {/* Primary Path Toggle */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    checked={data.is_primary}
                                    onChange={(e) => setData('is_primary', e.target.checked)}
                                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <div className="ml-3">
                                    <label className="text-sm font-medium text-gray-900">
                                        Set as Primary Learning Path
                                    </label>
                                    <p className="text-xs text-gray-600 mt-1">
                                        The primary path will be prominently displayed on the student's dashboard. 
                                        Only one path can be primary at a time.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Student Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes
                            </label>
                            <textarea
                                value={data.student_notes}
                                onChange={(e) => setData('student_notes', e.target.value)}
                                rows={5}
                                maxLength={1000}
                                placeholder="Add notes, instructions, or reminders for the student..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500">
                                    These notes will be visible to the student
                                </p>
                                <p className="text-xs text-gray-500">
                                    {data.student_notes.length}/1000 characters
                                </p>
                            </div>
                            {errors.student_notes && (
                                <p className="mt-1 text-sm text-red-600">{errors.student_notes}</p>
                            )}
                        </div>

                        {/* Error Message */}
                        {errors.error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-800">{errors.error}</p>
                            </div>
                        )}

                        {/* Important Notes */}
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <h4 className="text-sm font-medium text-amber-900 mb-2">
                                ⚠️ Important Notes
                            </h4>
                            <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                                <li>Changing status to "completed" will set the completion date automatically</li>
                                <li>Setting as primary will remove the primary flag from other paths</li>
                                <li>Pausing a path will not affect the student's current progress</li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t">
                            <a
                                href={route('admin.student-paths.show', assignment.student_path_id)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </a>
                            <div className="flex gap-3">
                                <a
                                    href={route('admin.student-paths.show', assignment.student_path_id)}
                                    className="px-6 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    View Details
                                </a>
                                <button
                                    onClick={handleSubmit}
                                    disabled={processing}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}