// resources/js/Pages/Admin/Questions/Edit.jsx
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
  ChevronLeftIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// Import our modular components
import QuestionTypeSelector from '@/Components/Questions/Forms/QuestionTypeSelector';
import QuestionContentForm from '@/Components/Questions/Forms/QuestionContentForm';
import QuestionSettingsForm from '@/Components/Questions/Forms/QuestionSettingsForm';
import QuestionRenderer from '@/Components/Questions/QuestionRenderer';

export default function Edit({ auth, lesson, test, question, typeOptions, difficultyOptions, statusOptions }) {
    const { data, setData, put, processing, errors, delete: destroy } = useForm({
        type: question.type || 'mcq',
        question_text: question.question_text || '',
        code_snippet: question.code_snippet || '',
        correct_answer: question.correct_answer || '',
        explanation: question.explanation || '',
        points: question.points || 10,
        difficulty_level: question.difficulty_level || 1,
        order: question.order || '',
        status: question.status || 'active',
        metadata: question.metadata || {},
        // Handle MCQ options - convert from database format if needed
        options: question.options ? question.options.map(option => ({
            label: option.option_label,
            text: option.option_text,
            is_correct: option.is_correct
        })) : [
            { label: 'A', text: '', is_correct: false },
            { label: 'B', text: '', is_correct: false },
            { label: 'C', text: '', is_correct: false },
            { label: 'D', text: '', is_correct: false },
        ]
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.lessons.tests.questions.update', [lesson.lesson_id, test.test_id, question.question_id]));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
            destroy(route('admin.lessons.tests.questions.destroy', [lesson.lesson_id, test.test_id, question.question_id]));
        }
    };

    const handleTypeChange = (newType) => {
        setData(prevData => ({
            ...prevData,
            type: newType,
            // Reset type-specific fields when switching types
            code_snippet: newType === 'coding' ? prevData.code_snippet : '',
            correct_answer: newType === 'true_false' ? 'true' : 
                            (newType === 'coding' ? prevData.correct_answer : 
                            newType === 'mcq' ? '' : prevData.correct_answer),
            // Reset options for non-MCQ types, or restore default for MCQ
            options: newType === 'mcq' ? 
                (prevData.type === 'mcq' ? prevData.options : [
                    { label: 'A', text: '', is_correct: false },
                    { label: 'B', text: '', is_correct: false },
                    { label: 'C', text: '', is_correct: false },
                    { label: 'D', text: '', is_correct: false },
                ]) : [],
            // Reset metadata for non-coding types  
            metadata: newType === 'coding' ? prevData.metadata : {}
        }));
    };

    const handleDataChange = (field, value) => {
        setData(field, value);
    };

    // Validation helpers
    const hasCorrectAnswer = () => {
        if (data.type === 'mcq') {
            return data.options.some(option => option.is_correct && option.text.trim());
        }
        if (data.type === 'true_false') {
            return data.correct_answer === 'true' || data.correct_answer === 'false';
        }
        return data.correct_answer && data.correct_answer.trim() !== '';
    };

    const hasValidQuestionText = () => {
        return data.question_text && data.question_text.trim() !== '';
    };

    const isFormValid = () => {
        return hasValidQuestionText() && hasCorrectAnswer();
    };

    const hasUnsavedChanges = () => {
        // Convert original question options to match current data format for comparison
        const originalOptions = question.options ? question.options.map(option => ({
            label: option.option_label,
            text: option.option_text,
            is_correct: option.is_correct
        })) : [];

        // Simple check to see if form data differs from original question
        return JSON.stringify(data) !== JSON.stringify({
            type: question.type || 'mcq',
            question_text: question.question_text || '',
            code_snippet: question.code_snippet || '',
            correct_answer: question.correct_answer || '',
            explanation: question.explanation || '',
            points: question.points || 10,
            difficulty_level: question.difficulty_level || 1,
            order: question.order || '',
            status: question.status || 'active',
            metadata: question.metadata || {},
            options: originalOptions
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Edit Question: {test.title}
                </h2>
            }
        >
            <Head title={`Edit Question - ${test.title}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Navigation */}
                    <div className="mb-6">
                        <Link
                            href={route('admin.lessons.tests.show', [lesson.lesson_id, test.test_id])}
                            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ChevronLeftIcon className="w-5 h-5 mr-1" />
                            Back to Test
                        </Link>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                            <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Editing Question #{question.order || question.question_id}</p>
                                <p>
                                    Make your changes below. You can change the question type, but this will reset 
                                    the answer configuration to match the new type.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Warning for unsaved changes */}
                    {hasUnsavedChanges() && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                                <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div className="text-sm text-amber-800">
                                    <p className="font-medium">You have unsaved changes</p>
                                    <p>Don't forget to save your changes before leaving this page.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Form */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                
                                {/* Question Type Selection */}
                                <QuestionTypeSelector
                                    selectedType={data.type}
                                    onTypeChange={handleTypeChange}
                                    typeOptions={typeOptions}
                                    error={errors.type}
                                />

                                {/* Question Content Form */}
                                <QuestionContentForm
                                    data={data}
                                    onChange={handleDataChange}
                                    errors={errors}
                                />

                                {/* Answer Configuration */}
                                <QuestionRenderer
                                    type={data.type}
                                    data={data}
                                    onChange={handleDataChange}
                                    errors={errors}
                                />

                                {/* Question Settings */}
                                <QuestionSettingsForm
                                    data={data}
                                    onChange={handleDataChange}
                                    errors={errors}
                                    difficultyOptions={difficultyOptions}
                                    statusOptions={statusOptions}
                                />

                                {/* Form Validation Summary */}
                                {!isFormValid() && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                                            <div className="text-sm text-amber-800">
                                                <p className="font-medium mb-2">Please complete the following:</p>
                                                <ul className="space-y-1">
                                                    {!hasValidQuestionText() && (
                                                        <li>• Enter a question text</li>
                                                    )}
                                                    {!hasCorrectAnswer() && (
                                                        <li>• Configure the correct answer</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Buttons */}
                                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                                    {/* Delete Button */}
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:text-red-900 hover:bg-red-50 transition-colors font-medium"
                                    >
                                        <TrashIcon className="w-4 h-4 inline mr-1" />
                                        Delete Question
                                    </button>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-3">
                                        <Link
                                            href={route('admin.lessons.tests.show', [lesson.lesson_id, test.test_id])}
                                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </Link>
                                        <button
                                            type="submit"
                                            disabled={processing || !isFormValid()}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                        >
                                            {processing ? 'Saving Changes...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h4>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={route('admin.lessons.tests.questions.create', [lesson.lesson_id, test.test_id])}
                                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Add Another Question
                            </Link>
                            <Link
                                href={route('admin.lessons.tests.show', [lesson.lesson_id, test.test_id])}
                                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                View All Questions
                            </Link>
                            <Link
                                href={route('admin.lessons.tests.preview', [lesson.lesson_id, test.test_id])}
                                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Preview Test
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}