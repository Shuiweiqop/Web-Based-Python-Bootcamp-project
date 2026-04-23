import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import ResultSummary from '@/Components/Student/Tests/ResultSummary';
import { 
    ArrowLeft, 
    RotateCcw, 
    Home, 
    CheckCircle, 
    XCircle,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp,
    BookOpen
} from 'lucide-react';

export default function Result({ auth, lesson, test, submission, results, passed }) {
    const [expandedQuestions, setExpandedQuestions] = useState({});

    const toggleQuestion = (questionId) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    const expandAll = () => {
        const allExpanded = {};
        results?.forEach(result => {
            allExpanded[result.question_id] = true;
        });
        setExpandedQuestions(allExpanded);
    };

    const collapseAll = () => {
        setExpandedQuestions({});
    };

    const allExpanded = results && Object.keys(expandedQuestions).length === results.length;

    const renderAnswer = (result) => {
        if (Array.isArray(result.student_answer)) {
            return result.student_answer.join(', ');
        }
        return result.student_answer || 'No answer provided';
    };

    const renderCorrectAnswer = (result) => {
        if (!test.allow_review) return null;
        
        if (Array.isArray(result.correct_answer)) {
            return result.correct_answer.join(', ');
        }
        return result.correct_answer;
    };

    // Check if this is a placement test
    const isPlacementTest = test.is_placement || !lesson;

    return (
        <StudentLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Only show back link if lesson exists */}
                        {lesson && (
                            <Link
                                href={`/student/lessons/${lesson.lesson_id}/tests`}
                                className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
                            >
                                <ArrowLeft className="w-6 h-6 drop-shadow-lg" />
                            </Link>
                        )}
                        <div>
                            <h2 className="font-bold text-2xl text-white leading-tight drop-shadow-lg">
                                Test Results - {test.title}
                            </h2>
                            <p className="text-sm text-white/80 mt-1 drop-shadow-lg">
                                Attempt #{submission.attempt_number}
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Results - ${test.title}`} />

            <div className="py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Result Summary */}
                    <div className="mb-8">
                        <ResultSummary
                            submission={submission}
                            test={test}
                            passed={passed}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        {isPlacementTest ? (
                            // Placement test buttons
                            <>
                                <Link
                                    href={`/student/onboarding/result/${submission.submission_id}`}
                                    className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold shadow-2xl hover:scale-105 transition-all duration-200 ring-2 ring-purple-400/50"
                                >
                                    <span className="drop-shadow-lg">View Recommendations</span>
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="flex-1 flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl hover:bg-white/20 font-bold shadow-xl transition-all duration-200"
                                >
                                    <Home className="w-5 h-5 mr-2 drop-shadow-lg" />
                                    <span className="drop-shadow-lg">Go to Dashboard</span>
                                </Link>
                            </>
                        ) : (
                            // Regular course test buttons
                            <>
                                <Link
                                    href={`/student/lessons/${lesson?.lesson_id}/tests/${test.test_id}`}
                                    className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold shadow-2xl hover:scale-105 transition-all duration-200 ring-2 ring-purple-400/50"
                                >
                                    <RotateCcw className="w-5 h-5 mr-2 drop-shadow-lg" />
                                    <span className="drop-shadow-lg">Try Again</span>
                                </Link>
                                <Link
                                    href={`/student/lessons/${lesson?.lesson_id}/tests`}
                                    className="flex-1 flex items-center justify-center px-6 py-3 bg-white/95 border-2 border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 font-bold shadow-xl transition-all duration-200"
                                >
                                    <Home className="w-5 h-5 mr-2 drop-shadow-lg" />
                                    <span>Back to Tests</span>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Detailed Results */}
                    {results && test.allow_review && (
                        <div className="bg-black/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                            {/* Header with Expand/Collapse */}
                            <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm px-6 py-4 border-b border-white/10">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white drop-shadow-lg">
                                        Question Review
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        {allExpanded ? (
                                            <button
                                                onClick={collapseAll}
                                                className="text-sm text-blue-400 hover:text-blue-300 flex items-center font-medium transition-colors duration-200 drop-shadow-lg"
                                            >
                                                <EyeOff className="w-4 h-4 mr-1" />
                                                Collapse All
                                            </button>
                                        ) : (
                                            <button
                                                onClick={expandAll}
                                                className="text-sm text-blue-400 hover:text-blue-300 flex items-center font-medium transition-colors duration-200 drop-shadow-lg"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                Expand All
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Questions List */}
                            <div className="divide-y divide-white/10">
                                {results.map((result, index) => (
                                    <div key={result.question_id} className="p-6 hover:bg-white/5 transition-colors duration-200">
                                        {/* Question Header */}
                                        <button
                                            onClick={() => toggleQuestion(result.question_id)}
                                            className="w-full flex items-start justify-between text-left group"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2 flex-wrap">
                                                    <span className="text-sm font-bold text-gray-300 drop-shadow-lg">
                                                        Question {index + 1}
                                                    </span>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold shadow-lg ${
                                                        result.is_correct
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white ring-2 ring-green-400/50'
                                                            : 'bg-gradient-to-r from-red-500 to-rose-600 text-white ring-2 ring-red-400/50'
                                                    }`}>
                                                        {result.is_correct ? (
                                                            <>
                                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                                Correct
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="w-3 h-3 mr-1" />
                                                                Incorrect
                                                            </>
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-medium bg-white/10 px-2 py-1 rounded backdrop-blur-sm">
                                                        {result.points_earned} / {result.points} pts
                                                    </span>
                                                </div>
                                                <p className="text-white font-medium drop-shadow-lg group-hover:text-blue-300 transition-colors duration-200">
                                                    {result.question_text}
                                                </p>
                                            </div>
                                            {expandedQuestions[result.question_id] ? (
                                                <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4 group-hover:text-white transition-colors duration-200" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4 group-hover:text-white transition-colors duration-200" />
                                            )}
                                        </button>

                                        {/* Expanded Content */}
                                        {expandedQuestions[result.question_id] && (
                                            <div className="mt-4 space-y-4 animate-slideDown">
                                                {/* Your Answer */}
                                                <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-lg">
                                                    <p className="text-sm font-bold text-gray-300 mb-2 drop-shadow-lg">
                                                        Your Answer:
                                                    </p>
                                                    <p className={`text-sm font-medium drop-shadow-lg ${
                                                        result.is_correct 
                                                            ? 'text-green-300' 
                                                            : 'text-red-300'
                                                    }`}>
                                                        {renderAnswer(result)}
                                                    </p>
                                                </div>

                                                {/* Correct Answer */}
                                                {!result.is_correct && renderCorrectAnswer(result) && (
                                                    <div className="bg-gradient-to-br from-green-900/40 to-emerald-800/40 backdrop-blur-sm rounded-xl p-4 border border-green-500/30 shadow-lg">
                                                        <p className="text-sm font-bold text-green-300 mb-2 drop-shadow-lg">
                                                            Correct Answer:
                                                        </p>
                                                        <p className="text-sm text-green-200 font-medium drop-shadow-lg">
                                                            {renderCorrectAnswer(result)}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Explanation */}
                                                {result.explanation && (
                                                    <div className="bg-gradient-to-br from-blue-900/40 to-cyan-800/40 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30 shadow-lg">
                                                        <p className="text-sm font-bold text-blue-300 mb-2 drop-shadow-lg">
                                                            Explanation:
                                                        </p>
                                                        <p className="text-sm text-blue-200 drop-shadow-lg">
                                                            {result.explanation}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Feedback */}
                                                {result.feedback && (
                                                    <div className="bg-gradient-to-br from-purple-900/40 to-pink-800/40 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30 shadow-lg">
                                                        <p className="text-sm font-bold text-purple-300 mb-2 drop-shadow-lg">
                                                            Feedback:
                                                        </p>
                                                        <p className="text-sm text-purple-200 drop-shadow-lg">
                                                            {result.feedback}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Review Message */}
                    {!test.allow_review && (
                        <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center shadow-xl">
                            <p className="text-gray-300 font-medium drop-shadow-lg">
                                Detailed review is not available for this test.
                            </p>
                        </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        {isPlacementTest ? (
                            <Link
                                href={`/student/onboarding/result/${submission.submission_id}`}
                                className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold shadow-2xl hover:scale-105 transition-all duration-200 ring-2 ring-purple-400/50"
                            >
                                <span className="drop-shadow-lg">View Your Learning Path Recommendations</span>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={`/student/lessons/${lesson?.lesson_id}/tests/${test.test_id}`}
                                    className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold shadow-2xl hover:scale-105 transition-all duration-200 ring-2 ring-purple-400/50"
                                >
                                    <RotateCcw className="w-5 h-5 mr-2 drop-shadow-lg" />
                                    <span className="drop-shadow-lg">Retake Test</span>
                                </Link>
                                <Link
                                    href={`/lessons/${lesson?.lesson_id}`}
                                    className="flex-1 flex items-center justify-center px-6 py-3 bg-white/95 border-2 border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 font-bold shadow-xl transition-all duration-200"
                                >
                                    <BookOpen className="w-5 h-5 mr-2 drop-shadow-lg" />
                                    <span>Continue Learning</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
