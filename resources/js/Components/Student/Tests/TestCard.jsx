import React from 'react';
import { Link } from '@inertiajs/react';
import { Clock, FileText, Award, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function TestCard({ test, lessonId }) {
    const getStatusBadge = () => {
        if (test.has_in_progress) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    In Progress
                </span>
            );
        }

        if (test.latest_status === 'submitted' || test.latest_status === 'timeout') {
            const passed = test.latest_score >= test.passing_score;
            return (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {passed ? (
                        <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Passed
                        </>
                    ) : (
                        <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Failed
                        </>
                    )}
                </span>
            );
        }

        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Not Started
            </span>
        );
    };

    const getActionButton = () => {
        if (test.has_in_progress) {
            return (
                <Link
                    href={`/student/submissions/${test.in_progress_submission_id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                    Continue Test
                </Link>
            );
        }

        if (!test.can_retake) {
            return (
                <button
                    disabled
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
                >
                    No Attempts Left
                </button>
            );
        }

        return (
            <Link
                href={`/student/lessons/${lessonId}/tests/${test.test_id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                {test.attempts_used > 0 ? 'Retake Test' : 'Start Test'}
            </Link>
        );
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {test.title}
                        </h3>
                        {getStatusBadge()}
                    </div>
                </div>

                {/* Description */}
                {test.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {test.description}
                    </p>
                )}

                {/* Test Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                        <FileText className="w-4 h-4 mr-2" />
                        <span>{test.questions_count} Questions</span>
                    </div>
                    {test.time_limit && (
                        <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{test.time_limit} mins</span>
                        </div>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                        <Award className="w-4 h-4 mr-2" />
                        <span>{test.total_points} Points</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="font-medium">Pass: {test.passing_score}%</span>
                    </div>
                </div>

                {/* Attempts Info */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Attempts:</span>
                        <span className="font-medium text-gray-900">
                            {test.attempts_used} / {test.max_attempts || '∞'}
                        </span>
                    </div>
                    {test.latest_score !== null && (
                        <div className="flex justify-between items-center text-sm mt-2">
                            <span className="text-gray-600">Best Score:</span>
                            <span className={`font-medium ${
                                test.latest_score >= test.passing_score 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                            }`}>
                                {test.latest_score}%
                            </span>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <div className="flex justify-end">
                    {getActionButton()}
                </div>
            </div>
        </div>
    );
}