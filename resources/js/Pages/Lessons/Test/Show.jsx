import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTestState } from './hooks/useTestState';
import { QuestionWrapper, McqSingle, ShortAnswer, CodeQuestion } from './components';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export default function Show({ auth, lesson, test, previousSubmissions, studentStats }) {
    
    const {
        // Core test state
        testState,
        timeRemaining,
        isSubmitting,
        submissionResult,
        
        // Question state
        currentQuestionIndex,
        currentQuestion,
        currentAnswer,
        totalQuestions,
        
        // Computed properties
        isLastQuestion,
        canGoNext,
        canGoPrev,
        answeredCount,
        progressPercentage,
        
        // Actions
        startTest,
        submitTest,
        updateAnswer,
        cancelTest,
        goBack,
        
        // Navigation
        nextQuestion,
        prevQuestion,
        jumpToQuestion,
        
        // Validation
        validateCurrentAnswer,
        
        // Utilities
        formatTime
    } = useTestState({ lesson, test, studentStats });

    // Results view after submission
    if (testState === 'completed' && submissionResult) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Test Results
                    </h2>
                }
            >
                <Head title={`Results: ${test.title}`} />
                
                <div className="py-12">
                    console.log('submissionResult', submissionResult);
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        Test Completed!
                                    </h3>
                                    <div className="text-4xl font-bold mb-4">
                                        <span className={`${submissionResult.percentage >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                                            {submissionResult.score}/{submissionResult.max_score}
                                        </span>
                                        <span className="text-lg text-gray-600 ml-2">
                                            ({submissionResult.percentage}%)
                                        </span>
                                    </div>
                                    <div className="text-lg">
                                        Grade: <span className={`font-bold ${submissionResult.is_passed ? 'text-green-600' : 'text-red-600'}`}>
                                            {submissionResult.grade_letter}
                                        </span>
                                    </div>
                                </div>

                                {submissionResult.feedback && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                        <h4 className="font-medium text-blue-900 mb-2">Feedback:</h4>
                                        <p className="text-blue-800">{submissionResult.feedback}</p>
                                    </div>
                                )}

                                <div className="flex gap-4 justify-center">
                                    <SecondaryButton onClick={goBack}>
                                        Back to Tests
                                    </SecondaryButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {test.title}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {lesson.title}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">
                            Difficulty: {test.difficulty_text}
                        </div>
                        {test.time_limit && (
                            <div className="text-sm text-gray-500">
                                Time Limit: {test.time_limit} minutes
                            </div>
                        )}
                        {testState === 'active' && timeRemaining !== null && (
                            <div className={`text-lg font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-blue-600'}`}>
                                Time: {formatTime(timeRemaining)}
                            </div>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={test.title} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Student Stats Warning */}
                    {studentStats.has_submitted && testState === 'instructions' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-800">
                                        You have already taken this test {studentStats.attempt_count} time(s). 
                                        Your best score is {studentStats.best_score}/{test.max_score}.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Instructions State */}
                    {testState === 'instructions' && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Test Instructions</h3>
                                <div className="prose max-w-none mb-6">
                                    <p className="text-gray-700">{test.description}</p>
                                </div>
                                
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm text-blue-700 font-medium mb-2">
                                                Instructions:
                                            </p>
                                            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                                                <li>Read each question carefully</li>
                                                <li>You can navigate between questions using Previous/Next buttons</li>
                                                <li>You can only submit your answers once</li>
                                                {test.time_limit && (
                                                    <li>You have {test.time_limit} minutes to complete this test</li>
                                                )}
                                                <li>Make sure to answer all questions before submitting</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <PrimaryButton onClick={startTest}>
                                        Start Test
                                    </PrimaryButton>
                                    <SecondaryButton onClick={goBack}>
                                        Cancel
                                    </SecondaryButton>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active Test State */}
                    {testState === 'active' && (
                        <div className="space-y-6">
                            {/* Question Progress Bar */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Question {currentQuestionIndex + 1} of {totalQuestions}
                                    </h3>
                                    <div className="text-sm text-gray-600">
                                        {answeredCount}/{totalQuestions} answered
                                    </div>
                                </div>
                                
                                {/* Progress bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>

                                {/* Question navigation dots */}
                                <div className="flex gap-2 justify-center">
                                    {Array.from({ length: totalQuestions }, (_, index) => {
                                        const isAnswered = answeredCount > index;
                                        const isCurrent = index === currentQuestionIndex;
                                        
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => jumpToQuestion(index)}
                                                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                                                    isCurrent
                                                        ? 'bg-blue-600 text-white'
                                                        : isAnswered 
                                                            ? 'bg-green-100 text-green-800 border border-green-300'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                                {index + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Current Question */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <QuestionWrapper
                                    title={`Question ${currentQuestionIndex + 1}`}
                                    description={currentQuestion.description || currentQuestion.question_text}
                                    maxScore={currentQuestion.points || currentQuestion.max_score}
                                >
                                    {/* MCQ Questions */}
                                    {currentQuestion.type === 'mcq' && (
                                        <McqSingle
                                            options={currentQuestion.options}
                                            selectedValue={currentAnswer.selected || ''}
                                            onChange={updateAnswer}
                                        />
                                    )}

                                    {/* Short Answer Questions */}
                                    {currentQuestion.type === 'short_answer' && (
                                        <ShortAnswer
                                            value={currentAnswer.text || ''}
                                            onChange={updateAnswer}
                                        />
                                    )}

                                    {/* Coding Questions */}
                                    {currentQuestion.type === 'coding' && (
                                        <CodeQuestion
                                            value={currentAnswer.code || ''}
                                            onChange={updateAnswer}
                                            language="python"
                                        />
                                    )}

                                    {/* True/False Questions */}
                                    {currentQuestion.type === 'true_false' && (
                                        <div className="space-y-3">
                                            <p className="text-sm font-medium text-gray-700 mb-4">
                                                Select True or False:
                                            </p>
                                            {['True', 'False'].map((option) => (
                                                <label key={option} className={`
                                                    flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200
                                                    ${currentAnswer.answer === option 
                                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                                                        : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                    }
                                                `}>
                                                    <input
                                                        type="radio"
                                                        name="tf_answer"
                                                        value={option}
                                                        checked={currentAnswer.answer === option}
                                                        onChange={(e) => updateAnswer({ answer: e.target.value })}
                                                        className="text-blue-600 focus:ring-blue-500 focus:ring-2"
                                                    />
                                                    <span className="ml-3 text-gray-900">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {/* Navigation buttons */}
                                    <div className="flex gap-4 justify-between mt-8">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={prevQuestion}
                                                disabled={!canGoPrev}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                    canGoPrev 
                                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                ← Previous
                                            </button>
                                        </div>

                                        <div className="flex gap-3">
                                            <DangerButton onClick={cancelTest}>
                                                Cancel Test
                                            </DangerButton>

                                            {canGoNext ? (
                                                <PrimaryButton onClick={nextQuestion}>
                                                    Next →
                                                </PrimaryButton>
                                            ) : (
                                                <PrimaryButton 
                                                    onClick={submitTest}
                                                    disabled={isSubmitting}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    {isSubmitting ? 'Submitting...' : 'Submit Test'}
                                                </PrimaryButton>
                                            )}
                                        </div>
                                    </div>

                                    {/* Answer status indicator */}
                                    <div className="mt-4 p-3 rounded-lg bg-gray-50">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">
                                                Question {currentQuestionIndex + 1} status:
                                            </span>
                                            <span className={`font-medium ${
                                                validateCurrentAnswer() 
                                                    ? 'text-green-600' 
                                                    : 'text-orange-600'
                                            }`}>
                                                {validateCurrentAnswer() ? 'Answered ✓' : 'Not answered'}
                                            </span>
                                        </div>
                                        {isLastQuestion && (
                                            <div className="mt-2 text-xs text-blue-600">
                                                This is the last question. Click "Submit Test" when ready.
                                            </div>
                                        )}
                                    </div>
                                </QuestionWrapper>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}