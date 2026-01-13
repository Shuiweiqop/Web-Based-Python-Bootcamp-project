import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { safeRoute } from '@/utils/routeHelpers';
import { 
    Clock, 
    Trophy, 
    Target, 
    PlayCircle, 
    AlertCircle,
    CheckCircle,
    XCircle,
    BookOpen,
    ArrowLeft,
    Sparkles
} from 'lucide-react';

export default function Show({ 
    auth = {}, 
    lesson = {}, 
    test = {}, 
    canAttempt = false, 
    remainingAttempts = 0, 
    lastSubmission = null,
    inProgressSubmission = null
}) {
    const [isStarting, setIsStarting] = useState(false);
    const [startError, setStartError] = useState(null);

    // Guard against undefined values
    if (!lesson?.lesson_id || !test?.test_id) {
        return (
            <StudentLayout user={auth?.user}>
                <Head title="Error" />
                <div className="py-12">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 backdrop-blur-xl border-2 border-red-500/50 rounded-2xl p-8 text-center shadow-2xl">
                            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4 animate-pulse drop-shadow-lg" />
                            <h3 className="text-xl font-bold text-white mb-3 drop-shadow-lg">
                                Error Loading Test
                            </h3>
                            <p className="text-red-200 mb-6 drop-shadow-lg">
                                Missing lesson or test data. Please try again.
                            </p>
                            <Link
                                href="/lessons"
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Return to Lessons
                            </Link>
                        </div>
                    </div>
                </div>
            </StudentLayout>
        );
    }

    const handleStartTest = async () => {
        if (!canAttempt) {
            alert('You have no remaining attempts for this test.');
            return;
        }

        // If there's an in-progress submission, continue it
        if (inProgressSubmission) {
            const continueUrl = safeRoute('student.submissions.taking', inProgressSubmission.submission_id) 
                || `/student/submissions/${inProgressSubmission.submission_id}`;
            router.visit(continueUrl);
            return;
        }

        setIsStarting(true);
        setStartError(null);

        try {
            const startUrl = safeRoute('student.lessons.tests.start', [lesson.lesson_id, test.test_id])
                || `/student/lessons/${lesson.lesson_id}/tests/${test.test_id}/start`;

            console.log('🚀 Starting test with URL:', startUrl);

            router.visit(startUrl, {
                method: 'post',
                preserveState: false,
                preserveScroll: false,
                onError: (errors) => {
                    console.error('❌ Start test failed:', errors);
                    setIsStarting(false);
                    
                    if (errors.error) {
                        setStartError(errors.error);
                    } else if (errors.message) {
                        setStartError(errors.message);
                    } else if (typeof errors === 'string') {
                        setStartError(errors);
                    } else {
                        setStartError('Failed to start test. Please try again.');
                    }
                },
                onFinish: () => {
                    setIsStarting(false);
                }
            });
        } catch (error) {
            console.error('❌ Unexpected error:', error);
            setIsStarting(false);
            setStartError('An unexpected error occurred. Please refresh the page and try again.');
        }
    };

    const backToLessonUrl = safeRoute('lessons.show', lesson.lesson_id) || `/lessons/${lesson.lesson_id}`;

    return (
        <StudentLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={backToLessonUrl}
                            className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
                        >
                            <ArrowLeft className="w-6 h-6 drop-shadow-lg" />
                        </Link>
                        <div>
                            <h2 className="font-bold text-2xl text-white leading-tight drop-shadow-lg">
                                {test.title}
                            </h2>
                            <p className="text-sm text-white/80 mt-1 drop-shadow-lg">
                                {lesson.title}
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`${test.title} - ${lesson.title}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto">
                    
                    {/* Error Alert */}
                    {startError && (
                        <div className="mb-6 bg-gradient-to-br from-red-900/40 to-red-800/40 backdrop-blur-xl border-2 border-red-500/50 rounded-2xl p-4 shadow-2xl animate-slideDown">
                            <div className="flex items-start">
                                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0 drop-shadow-lg" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-white mb-1 drop-shadow-lg">
                                        Failed to Start Test
                                    </h3>
                                    <p className="text-sm text-red-200 drop-shadow-lg">
                                        {startError}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setStartError(null)}
                                    className="text-red-400 hover:text-white ml-2 transition-colors duration-200"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* In Progress Submission Alert */}
                    {inProgressSubmission && (
                        <div className="mb-6 bg-gradient-to-br from-blue-900/40 to-cyan-800/40 backdrop-blur-xl border-2 border-blue-500/50 rounded-2xl p-4 shadow-2xl animate-slideDown">
                            <div className="flex items-start">
                                <PlayCircle className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0 drop-shadow-lg animate-pulse" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-white mb-1 drop-shadow-lg">
                                        Test In Progress
                                    </h3>
                                    <p className="text-sm text-blue-200 drop-shadow-lg">
                                        You have an incomplete test. Click the button below to continue where you left off.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Test Info Card */}
                    <div className="bg-black/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden mb-6">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
                            <div className="relative z-10 flex items-start justify-between">
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">
                                        {test.title}
                                    </h1>
                                    {test.description && (
                                        <p className="text-indigo-100 text-lg drop-shadow-lg">
                                            {test.description}
                                        </p>
                                    )}
                                </div>
                                <div className="ml-4">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center ring-2 ring-white/30 shadow-xl">
                                        <div className="text-3xl font-bold text-white drop-shadow-lg">{remainingAttempts}</div>
                                        <div className="text-xs text-indigo-100 font-medium drop-shadow-lg">
                                            Attempts Left
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        {test.instructions && (
                            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm border-b border-blue-500/30 px-6 py-4">
                                <div className="flex items-start space-x-3">
                                    <BookOpen className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0 drop-shadow-lg" />
                                    <div>
                                        <h3 className="font-bold text-white mb-1 drop-shadow-lg">
                                            Instructions
                                        </h3>
                                        <p className="text-blue-100 text-sm whitespace-pre-wrap drop-shadow-lg">
                                            {test.instructions}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Test Details Grid */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Time Limit */}
                                {test.time_limit && (
                                    <div className="flex items-start space-x-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                            <Clock className="w-5 h-5 text-white drop-shadow-lg" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-400 font-medium">Time Limit</div>
                                            <div className="text-lg font-bold text-white drop-shadow-lg">
                                                {test.time_limit} minutes
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Passing Score */}
                                <div className="flex items-start space-x-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                                        <Target className="w-5 h-5 text-white drop-shadow-lg" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400 font-medium">Passing Score</div>
                                        <div className="text-lg font-bold text-white drop-shadow-lg">
                                            {test.passing_score}%
                                        </div>
                                    </div>
                                </div>

                                {/* Max Attempts */}
                                <div className="flex items-start space-x-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                                        <Trophy className="w-5 h-5 text-white drop-shadow-lg" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400 font-medium">Attempts Allowed</div>
                                        <div className="text-lg font-bold text-white drop-shadow-lg">
                                            {test.max_attempts}
                                        </div>
                                    </div>
                                </div>

                                {/* Questions Count */}
                                {test.questions_count !== undefined && (
                                    <div className="flex items-start space-x-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                                            <BookOpen className="w-5 h-5 text-white drop-shadow-lg" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-400 font-medium">Questions</div>
                                            <div className="text-lg font-bold text-white drop-shadow-lg">
                                                {test.questions_count}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Total Points */}
                                {test.total_points !== undefined && (
                                    <div className="flex items-start space-x-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                                            <Trophy className="w-5 h-5 text-white drop-shadow-lg" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-400 font-medium">Total Points</div>
                                            <div className="text-lg font-bold text-white drop-shadow-lg">
                                                {test.total_points}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Last Submission Info */}
                    {lastSubmission && (
                        <div className={`mb-6 rounded-2xl border-2 p-6 backdrop-blur-xl shadow-2xl animate-slideDown ${
                            lastSubmission.passed
                                ? 'bg-gradient-to-br from-green-900/40 to-emerald-800/40 border-green-500/50'
                                : 'bg-gradient-to-br from-amber-900/40 to-orange-800/40 border-amber-500/50'
                        }`}>
                            <div className="flex items-start space-x-3">
                                {lastSubmission.passed ? (
                                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 drop-shadow-lg" />
                                ) : (
                                    <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 drop-shadow-lg" />
                                )}
                                <div className="flex-1">
                                    <h3 className={`font-bold mb-1 drop-shadow-lg ${
                                        lastSubmission.passed ? 'text-white' : 'text-white'
                                    }`}>
                                        {lastSubmission.passed ? 'Previous Attempt: Passed ✓' : 'Previous Attempt: Not Passed'}
                                    </h3>
                                    <p className={`text-sm drop-shadow-lg ${
                                        lastSubmission.passed ? 'text-green-100' : 'text-amber-100'
                                    }`}>
                                        Score: {lastSubmission.score}% 
                                        {lastSubmission.passed 
                                            ? ' - Great job! You can retake to improve your score.'
                                            : ` - You need ${test.passing_score}% to pass. Review the material and try again.`
                                        }
                                    </p>
                                    {lastSubmission.submitted_at && (
                                        <p className="text-xs text-gray-300 mt-1 drop-shadow-lg">
                                            Last attempted: {new Date(lastSubmission.submitted_at).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        {canAttempt ? (
                            <>
                                <button
                                    onClick={handleStartTest}
                                    disabled={isStarting}
                                    className="flex-1 flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl hover:shadow-purple-500/50 hover:scale-105 ring-2 ring-purple-400/50"
                                >
                                    <PlayCircle className="w-6 h-6 mr-2 drop-shadow-lg" />
                                    <span className="drop-shadow-lg">
                                        {inProgressSubmission ? (
                                            isStarting ? 'Loading...' : 'Continue Test'
                                        ) : (
                                            isStarting ? 'Starting Test...' : 'Start Test'
                                        )}
                                    </span>
                                </button>
                                <Link
                                    href={backToLessonUrl}
                                    className="flex-shrink-0 flex items-center justify-center px-6 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl hover:bg-white/20 font-bold transition-all shadow-xl"
                                >
                                    Back to Lesson
                                </Link>
                            </>
                        ) : (
                            <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 backdrop-blur-xl border-2 border-red-500/50 rounded-2xl p-6 text-center w-full shadow-2xl">
                                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3 animate-pulse drop-shadow-lg" />
                                <h3 className="text-lg font-bold text-white mb-2 drop-shadow-lg">
                                    No Attempts Remaining
                                </h3>
                                <p className="text-red-200 mb-4 drop-shadow-lg">
                                    You have used all {test.max_attempts} attempts for this test.
                                </p>
                                <Link
                                    href={backToLessonUrl}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 font-bold shadow-xl hover:scale-105 transition-all duration-200"
                                >
                                    <ArrowLeft className="w-5 h-5 mr-2" />
                                    Back to Lesson
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 bg-gradient-to-br from-blue-900/40 to-cyan-800/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 shadow-xl">
                        <div className="flex items-start space-x-3">
                            <Sparkles className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0 drop-shadow-lg" />
                            <p className="text-sm text-blue-100 drop-shadow-lg">
                                <strong className="text-white">💡 Tips:</strong> Make sure you have a stable internet connection and enough time to complete the test. 
                                Your answers will be auto-saved as you go. Once submitted, you cannot change your answers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}