// resources/js/Pages/Admin/Questions/Create.jsx
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
  ChevronLeftIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Import our modular components
import QuestionTypeSelector from '@/Components/Questions/Forms/QuestionTypeSelector';
import QuestionContentForm from '@/Components/Questions/Forms/QuestionContentForm';
import QuestionSettingsForm from '@/Components/Questions/Forms/QuestionSettingsForm';
import QuestionRenderer from '@/Components/Questions/QuestionRenderer';
import QuestionTemplateInserter from './QuestionTemplateInserter';

export default function Create({ auth, lesson, test, typeOptions, difficultyOptions, statusOptions }) {
    const { data, setData, post, processing, errors } = useForm({
        type: 'mcq',
        question_text: '',
        code_snippet: '',
        correct_answer: '',
        explanation: '',
        points: 10,
        difficulty_level: 1,
        order: '',
        status: 'active',
        metadata: {},
        options: [
            { label: 'A', text: '', is_correct: false },
            { label: 'B', text: '', is_correct: false },
            { label: 'C', text: '', is_correct: false },
            { label: 'D', text: '', is_correct: false },
        ]
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.lessons.tests.questions.store', [lesson.lesson_id, test.test_id]), {
            onSuccess: () => {
                // Redirected by controller
            }
        });
    };

    const handleTypeChange = (newType) => {
        setData(prevData => ({
            ...prevData,
            type: newType,
            code_snippet: newType === 'coding' ? prevData.code_snippet : '',
            correct_answer: newType === 'true_false' ? 'true' : 
                            (newType === 'coding' ? prevData.correct_answer : ''),
            options: newType === 'mcq' ? prevData.options : [],
            metadata: newType === 'coding' ? prevData.metadata : {}
        }));
    };

    const handleDataChange = (field, value) => {
        setData(field, value);
    };

    // 🔥 Handle template insertion
    const handleInsertTemplate = (template) => {
        setData(prevData => ({
            ...prevData,
            question_text: template.question_text || prevData.question_text,
            code_snippet: template.code_snippet || prevData.code_snippet,
            correct_answer: template.correct_answer || prevData.correct_answer,
            explanation: template.explanation || prevData.explanation,
            points: template.points || prevData.points,
            difficulty_level: template.difficulty_level || prevData.difficulty_level,
            options: template.options || prevData.options,
            metadata: template.metadata || prevData.metadata,
        }));
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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Add Question to: {test.title}
                </h2>
            }
        >
            <Head title={`Add Question - ${test.title}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Navigation */}
                    <div className="mb-6 flex items-center justify-between">
                        <Link
                            href={route('admin.lessons.tests.questions.index', [lesson.lesson_id, test.test_id])}
                            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ChevronLeftIcon className="w-5 h-5 mr-1" />
                            Back to Questions
                        </Link>

                        {/* 🔥 Template Inserter Button */}
                        <QuestionTemplateInserter
                            currentType={data.type}
                            onInsertTemplate={handleInsertTemplate}
                        />
                    </div>

                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                            <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Adding Question to: {test.title}</p>
                                <p>
                                    Choose a question type and provide the question content. 
                                    You can use the <span className="font-semibold">Insert Template</span> button 
                                    to quickly start with pre-made question templates.
                                </p>
                            </div>
                        </div>
                    </div>

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
                                    statusOptions={statusOptions || {
                                        'active': 'Active',
                                        'inactive': 'Inactive'
                                    }}
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
                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <Link
                                        href={route('admin.lessons.tests.questions.index', [lesson.lesson_id, test.test_id])}
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing || !isFormValid()}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        {processing ? 'Adding Question...' : 'Add Question'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Next Steps Info */}
                    <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">After Adding This Question</h4>
                        <p className="text-sm text-gray-600">
                            You'll be returned to the questions list where you can:
                        </p>
                        <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                            <li>View all questions for this test</li>
                            <li>Add more questions to the test</li>
                            <li>Edit or reorder existing questions</li>
                            <li>Return to test management when ready</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}