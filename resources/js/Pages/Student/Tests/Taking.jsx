import React, { useState, useEffect, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import StudentLayout from '@/Layouts/StudentLayout';
import QuizTimer from '@/Components/Student/Tests/QuizTimer';
import QuestionNavigator from '@/Components/Student/Tests/QuestionNavigator';
import QuestionDisplay from '@/Components/Student/Tests/QuestionDisplay';
import ProgressBar from '@/Components/Student/Tests/ProgressBar';
import MCQInput from '@/Components/Student/Tests/AnswerInputs/MCQInput';
import TrueFalseInput from '@/Components/Student/Tests/AnswerInputs/TrueFalseInput';
import ShortAnswerInput from '@/Components/Student/Tests/AnswerInputs/ShortAnswerInput';
import CodingInput from '@/Components/Student/Tests/AnswerInputs/CodingInput';
import { Send, AlertTriangle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function Taking({ auth, lesson, test, submission, questions }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize answers from saved data
    useEffect(() => {
        const initialAnswers = {};
        questions.forEach((question) => {
            if (question.saved_answer) {
                initialAnswers[question.question_id] = question.saved_answer;
            }
        });
        setAnswers(initialAnswers);
    }, [questions]);

    const currentQuestion = questions[currentQuestionIndex];
    const answeredQuestions = Object.keys(answers).map(qId => 
        questions.findIndex(q => q.question_id === parseInt(qId))
    ).filter(idx => idx !== -1);

    // Auto-save answer using Axios (for JSON response)
    const saveAnswer = useCallback(async (questionId, answerData) => {
        setIsSaving(true);
        
        try {
            await axios.post(
                `/student/submissions/${submission.submission_id}/answer`,
                {
                    question_id: questionId,
                    answer_text: answerData.answer_text || null,
                    selected_options: answerData.selected_options || null,
                    code_answer: answerData.code_answer || null,
                }
            );
            setIsSaving(false);
        } catch (error) {
            console.error('Failed to save answer:', error);
            setIsSaving(false);
        }
    }, [submission.submission_id]);

    // Handle answer change
    const handleAnswerChange = (value) => {
        const questionId = currentQuestion.question_id;
        let answerData = {};

        switch (currentQuestion.type) {
            case 'mcq':
                answerData = { selected_options: value };
                break;
            case 'true_false':
            case 'short_answer':
                answerData = { answer_text: value };
                break;
            case 'coding':
                answerData = { code_answer: value };
                break;
        }

        setAnswers(prev => ({
            ...prev,
            [questionId]: answerData
        }));

        // Debounced auto-save
        clearTimeout(window.autoSaveTimer);
        window.autoSaveTimer = setTimeout(() => {
            saveAnswer(questionId, answerData);
        }, 1000);
    };

    // Navigate to question
    const handleNavigate = (index) => {
        setCurrentQuestionIndex(index);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle time up
    const handleTimeUp = () => {
        alert('Time is up! The test will be submitted automatically.');
        handleSubmitTest(true);
    };

    // Submit test (using Inertia router for redirect)
    const handleSubmitTest = (isAutoSubmit = false) => {
        if (!isAutoSubmit && answeredQuestions.length < questions.length) {
            setShowSubmitConfirm(true);
            return;
        }

        setIsSubmitting(true);
        router.post(
            `/student/submissions/${submission.submission_id}/complete`,
            {},
            {
                onSuccess: () => {
                    // Will redirect to result page
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    console.error('Submit errors:', errors);
                    alert('Failed to submit test. Please try again.');
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            }
        );
    };

    // Render answer input based on question type
    const renderAnswerInput = () => {
        const savedAnswer = answers[currentQuestion.question_id];

        switch (currentQuestion.type) {
            case 'mcq':
                return (
                    <MCQInput
                        options={currentQuestion.options || []}
                        value={savedAnswer?.selected_options || []}
                        onChange={handleAnswerChange}
                    />
                );
            
            case 'true_false':
                return (
                    <TrueFalseInput
                        value={savedAnswer?.answer_text || null}
                        onChange={handleAnswerChange}
                    />
                );
            
            case 'short_answer':
                return (
                    <ShortAnswerInput
                        value={savedAnswer?.answer_text || ''}
                        onChange={handleAnswerChange}
                    />
                );
            
            case 'coding':
                return (
                    <CodingInput
                        value={savedAnswer?.code_answer || ''}
                        onChange={handleAnswerChange}
                    />
                );
            
            default:
                return (
                    <div className="text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                        Unsupported question type: {currentQuestion.type}
                    </div>
                );
        }
    };

    return (
        <StudentLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-2xl text-white leading-tight drop-shadow-lg">
                            {test.title}
                        </h2>
                        <p className="text-sm text-white/80 mt-1 drop-shadow-lg">
                            Attempt #{submission.attempt_number}
                        </p>
                    </div>
                    {isSaving && (
                        <div className="flex items-center space-x-2 bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-500/30">
                            <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
                            <span className="text-sm text-blue-200 font-medium drop-shadow-lg">
                                Saving...
                            </span>
                        </div>
                    )}
                </div>
            }
        >
            <Head title={`Taking: ${test.title}`} />

            {/* Timer (if time limit exists) */}
            {test.time_limit && (
                <QuizTimer
                    startedAt={submission.started_at}
                    timeLimit={test.time_limit}
                    onTimeUp={handleTimeUp}
                />
            )}

            {/* Question Navigator */}
            <QuestionNavigator
                currentIndex={currentQuestionIndex}
                totalQuestions={questions.length}
                answeredQuestions={answeredQuestions}
                onNavigate={handleNavigate}
            />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Progress Bar */}
                    <div className="mb-8">
                        <ProgressBar
                            current={currentQuestionIndex + 1}
                            total={questions.length}
                            answeredCount={answeredQuestions.length}
                        />
                    </div>

                    {/* Question Display */}
                    <div className="mb-8">
                        <QuestionDisplay
                            question={currentQuestion}
                            questionNumber={currentQuestionIndex + 1}
                        />
                    </div>

                    {/* Answer Input */}
                    <div className="bg-black/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 mb-8">
                        <h3 className="text-lg font-bold text-white mb-4 drop-shadow-lg">
                            Your Answer
                        </h3>
                        <div className="[&_label]:text-white [&_label]:font-medium [&_label]:drop-shadow-lg [&_input]:bg-white/10 [&_input]:border-white/30 [&_input]:text-white [&_textarea]:bg-white/10 [&_textarea]:border-white/30 [&_textarea]:text-white [&_button]:text-white">
                            {renderAnswerInput()}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => handleNavigate(currentQuestionIndex - 1)}
                            disabled={currentQuestionIndex === 0}
                            className={`
                                px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-xl
                                flex items-center space-x-2
                                ${currentQuestionIndex === 0
                                    ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700/50'
                                    : 'bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 hover:scale-105'
                                }
                            `}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span>Previous</span>
                        </button>

                        {currentQuestionIndex === questions.length - 1 ? (
                            <button
                                onClick={() => handleSubmitTest(false)}
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-2xl hover:shadow-green-500/50 hover:scale-105 transition-all duration-200 ring-2 ring-green-400/50"
                            >
                                <Send className="w-5 h-5 drop-shadow-lg" />
                                <span className="drop-shadow-lg">{isSubmitting ? 'Submitting...' : 'Submit Test'}</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => handleNavigate(currentQuestionIndex + 1)}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold shadow-2xl hover:scale-105 transition-all duration-200 flex items-center space-x-2 ring-2 ring-purple-400/50"
                            >
                                <span className="drop-shadow-lg">Next</span>
                                <ChevronRight className="w-5 h-5 drop-shadow-lg" />
                            </button>
                        )}
                    </div>

                    {/* Submit Button (Always Visible) */}
                    {currentQuestionIndex !== questions.length - 1 && (
                        <div className="text-center">
                            <button
                                onClick={() => handleSubmitTest(false)}
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2 shadow-2xl hover:shadow-green-500/50 hover:scale-105 transition-all duration-200 ring-2 ring-green-400/50"
                            >
                                <Send className="w-5 h-5 drop-shadow-lg" />
                                <span className="drop-shadow-lg">{isSubmitting ? 'Submitting...' : 'Submit Test Early'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Submit Confirmation Modal */}
            {showSubmitConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white/20 animate-slideDown">
                        <div className="flex items-start space-x-3 mb-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                                <AlertTriangle className="w-6 h-6 text-white drop-shadow-lg" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-2 drop-shadow-lg">
                                    Confirm Submission
                                </h3>
                                <p className="text-gray-300 mb-4 drop-shadow-lg">
                                    You have answered <span className="font-bold text-white">{answeredQuestions.length}</span> out of <span className="font-bold text-white">{questions.length}</span> questions.
                                </p>
                                {answeredQuestions.length < questions.length && (
                                    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4">
                                        <p className="text-red-200 text-sm font-medium drop-shadow-lg">
                                            ⚠️ Warning: {questions.length - answeredQuestions.length} unanswered questions will be marked as incorrect.
                                        </p>
                                    </div>
                                )}
                                <p className="text-gray-400 text-sm drop-shadow-lg">
                                    Are you sure you want to submit? You cannot change your answers after submission.
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-3 justify-end">
                            <button
                                onClick={() => setShowSubmitConfirm(false)}
                                className="px-6 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/20 font-bold transition-all duration-200 shadow-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowSubmitConfirm(false);
                                    handleSubmitTest(true);
                                }}
                                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-bold shadow-xl hover:scale-105 transition-all duration-200 ring-2 ring-green-400/50"
                            >
                                Yes, Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </StudentLayout>
    );
}