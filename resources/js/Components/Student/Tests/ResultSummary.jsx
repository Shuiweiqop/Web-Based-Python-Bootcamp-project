import React from 'react';
import { Trophy, CheckCircle, XCircle, Clock, Award, TrendingUp, AlertCircle } from 'lucide-react';

export default function ResultSummary({ submission, test, passed }) {
    const formatTime = (seconds) => {
        if (seconds === null || seconds === undefined) return 'N/A';
        const safeSeconds = Math.max(0, Number(seconds) || 0);
        const mins = Math.floor(safeSeconds / 60);
        const secs = safeSeconds % 60;
        return `${mins}m ${secs}s`;
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 75) return 'text-blue-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getGrade = (score) => {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    };

    return (
        <div className="space-y-6">
            {/* Main Result Card */}
            <div className={`rounded-xl overflow-hidden shadow-lg ${
                passed ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-red-50 to-orange-50'
            }`}>
                <div className="p-8">
                    {/* Pass/Fail Badge */}
                    <div className="flex items-center justify-center mb-6">
                        {passed ? (
                            <div className="flex items-center space-x-3 text-green-700">
                                <Trophy className="w-16 h-16" />
                                <div>
                                    <p className="text-3xl font-bold">Congratulations!</p>
                                    <p className="text-lg">You passed the test</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3 text-red-700">
                                <AlertCircle className="w-16 h-16" />
                                <div>
                                    <p className="text-3xl font-bold">Not quite there</p>
                                    <p className="text-lg">Keep practicing!</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Score Display */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-baseline space-x-2">
                            <span className={`text-7xl font-bold ${getScoreColor(submission.score)}`}>
                                {submission.score}
                            </span>
                            <span className="text-3xl text-gray-600">%</span>
                        </div>
                        <div className="mt-2">
                            <span className={`inline-block px-4 py-2 rounded-full text-xl font-bold ${
                                passed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                            }`}>
                                Grade: {getGrade(submission.score)}
                            </span>
                        </div>
                    </div>

                    {/* Passing Score Info */}
                    <div className="text-center text-sm text-gray-600 mb-4">
                        Passing score: <span className="font-bold">{test.passing_score}%</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Questions Stats */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Questions</h3>
                        <Award className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-gray-700">Correct</span>
                            </div>
                            <span className="text-xl font-bold text-green-600">
                                {submission.correct_answers}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <XCircle className="w-5 h-5 text-red-600" />
                                <span className="text-sm text-gray-700">Incorrect</span>
                            </div>
                            <span className="text-xl font-bold text-red-600">
                                {submission.total_questions - submission.correct_answers}
                            </span>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Total</span>
                                <span className="text-xl font-bold text-gray-900">
                                    {submission.total_questions}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Time & Attempt Stats */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Details</h3>
                        <Clock className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Time Spent</span>
                            <span className="text-lg font-bold text-gray-900">
                                {formatTime(submission.time_spent)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Attempt Number</span>
                            <span className="text-lg font-bold text-gray-900">
                                #{submission.attempt_number}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Submitted</span>
                            <span className="text-sm font-medium text-gray-600">
                                {new Date(submission.submitted_at).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Indicator */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-medium text-gray-600">Performance</h3>
                </div>
                
                {/* Score Bar */}
                <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden mb-2">
                    {/* Passing Line */}
                    <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10"
                        style={{ left: `${test.passing_score}%` }}
                    />
                    
                    {/* Score Fill */}
                    <div 
                        className={`h-full flex items-center justify-end pr-3 transition-all duration-1000 ${
                            passed ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${submission.score}%` }}
                    >
                        <span className="text-white text-xs font-bold">
                            {submission.score}%
                        </span>
                    </div>
                </div>

                {/* Labels */}
                <div className="flex justify-between text-xs text-gray-600">
                    <span>0%</span>
                    <span className="font-medium">Pass: {test.passing_score}%</span>
                    <span>100%</span>
                </div>
            </div>

            {/* Status Message */}
            {submission.status === 'timeout' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-yellow-800">
                                Time Limit Exceeded
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                                This test was automatically submitted because the time limit was reached.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Motivational Message */}
            <div className={`rounded-lg p-4 ${
                passed 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-blue-50 border border-blue-200'
            }`}>
                <p className={`text-sm ${passed ? 'text-green-800' : 'text-blue-800'}`}>
                    {passed ? (
                        <>
                            🎉 <strong>Great job!</strong> You've demonstrated excellent understanding of the material. Keep up the good work!
                        </>
                    ) : (
                        <>
                            💪 <strong>Don't give up!</strong> Review the material and try again. Each attempt helps you learn and improve!
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
