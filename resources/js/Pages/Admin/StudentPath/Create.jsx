import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ auth, students, paths, selectedStudent }) {
    const { data, setData, post, processing, errors } = useForm({
        student_id: selectedStudent?.student_id || '',
        path_id: '',
        is_primary: false,
        target_completion_date: '',
        student_notes: '',
    });

    const [selectedPath, setSelectedPath] = useState(null);

    const handlePathChange = (pathId) => {
        setData('path_id', pathId);
        const path = paths.find(p => p.path_id === parseInt(pathId));
        setSelectedPath(path);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.student-paths.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Assign Learning Path" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Assign Learning Path
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Manually assign a learning path to a student
                        </p>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                        
                        {/* Student Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Student *
                            </label>
                            <select
                                value={data.student_id}
                                onChange={(e) => setData('student_id', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={selectedStudent !== null}
                                required
                            >
                                <option value="">Choose a student...</option>
                                {students.map(student => (
                                    <option key={student.student_id} value={student.student_id}>
                                        {student.name} ({student.email})
                                    </option>
                                ))}
                            </select>
                            {errors.student_id && (
                                <p className="mt-1 text-sm text-red-600">{errors.student_id}</p>
                            )}
                        </div>

                        {/* Path Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Learning Path *
                            </label>
                            <select
                                value={data.path_id}
                                onChange={(e) => handlePathChange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Choose a learning path...</option>
                                {paths.map(path => (
                                    <option key={path.path_id} value={path.path_id}>
                                        {path.title} ({path.difficulty_level})
                                    </option>
                                ))}
                            </select>
                            {errors.path_id && (
                                <p className="mt-1 text-sm text-red-600">{errors.path_id}</p>
                            )}

                            {/* Path Preview */}
                            {selectedPath && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h3 className="font-medium text-blue-900 mb-2">
                                        {selectedPath.title}
                                    </h3>
                                    <p className="text-sm text-blue-700 mb-3">
                                        {selectedPath.description}
                                    </p>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-blue-600 font-medium">Difficulty:</span>
                                            <span className="ml-2 text-blue-900 capitalize">
                                                {selectedPath.difficulty_level}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-blue-600 font-medium">Lessons:</span>
                                            <span className="ml-2 text-blue-900">
                                                {selectedPath.total_lessons}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-blue-600 font-medium">Duration:</span>
                                            <span className="ml-2 text-blue-900">
                                                ~{selectedPath.estimated_duration_hours}h
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Target Completion Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Target Completion Date (Optional)
                            </label>
                            <input
                                type="date"
                                value={data.target_completion_date}
                                onChange={(e) => setData('target_completion_date', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Set a target date for the student to complete this path
                            </p>
                            {errors.target_completion_date && (
                                <p className="mt-1 text-sm text-red-600">{errors.target_completion_date}</p>
                            )}
                        </div>

                        {/* Primary Path Checkbox */}
                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                checked={data.is_primary}
                                onChange={(e) => setData('is_primary', e.target.checked)}
                                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="ml-3">
                                <label className="text-sm font-medium text-gray-700">
                                    Set as Primary Learning Path
                                </label>
                                <p className="text-xs text-gray-500 mt-1">
                                    The primary path will be highlighted in the student's dashboard
                                </p>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={data.student_notes}
                                onChange={(e) => setData('student_notes', e.target.value)}
                                rows={4}
                                maxLength={1000}
                                placeholder="Add any notes or instructions for the student..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {data.student_notes.length}/1000 characters
                            </p>
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

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                            <a
                                href={route('admin.student-paths.index')}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </a>
                            <button
                                onClick={handleSubmit}
                                disabled={processing}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? 'Assigning...' : 'Assign Path'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}