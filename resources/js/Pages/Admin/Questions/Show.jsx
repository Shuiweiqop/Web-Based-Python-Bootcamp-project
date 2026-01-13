// resources/js/Pages/Admin/Questions/Show.jsx
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
  ChevronLeftIcon, 
  PencilIcon,
  TrashIcon,
  QuestionMarkCircleIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  ScaleIcon,
  TagIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function Show({ auth, lesson, test, question }) {
    const { delete: destroy } = useForm();

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
            destroy(route('admin.lessons.tests.questions.destroy', [lesson.lesson_id, test.test_id, question.question_id]));
        }
    };

    const getQuestionTypeIcon = (type) => {
        const icons = {
            mcq: <QuestionMarkCircleIcon className="h-6 w-6" />,
            coding: <CodeBracketIcon className="h-6 w-6" />,
            true_false: <CheckCircleIcon className="h-6 w-6" />,
            short_answer: <DocumentTextIcon className="h-6 w-6" />
        };
        return icons[type] || <QuestionMarkCircleIcon className="h-6 w-6" />;
    };

    const getQuestionTypeName = (type) => {
        const types = {
            mcq: 'Multiple Choice',
            coding: 'Coding Exercise',
            true_false: 'True/False',
            short_answer: 'Short Answer'
        };
        return types[type] || 'Unknown';
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            draft: 'bg-yellow-100 text-yellow-800',
            archived: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getDifficultyColor = (level) => {
        const colors = {
            1: 'bg-blue-100 text-blue-800 border-blue-200',
            2: 'bg-orange-100 text-orange-800 border-orange-200',
            3: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[level] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getDifficultyName = (level) => {
        const names = {
            1: 'Easy',
            2: 'Medium', 
            3: 'Hard'
        };
        return names[level] || 'Unknown';
    };

    const renderAnswerConfiguration = () => {
        switch (question.type) {
            case 'mcq':
                return (
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Answer Options</h4>
                        <div className="space-y-2">
                            {question.options && question.options.map((option, index) => (
                                <div key={index} className={`flex items-center p-3 rounded-lg border ${
                                    option.is_correct ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
                                }`}>
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium mr-3">
                                        {option.label}
                                    </div>
                                    <span className={`flex-1 ${option.is_correct ? 'font-medium text-green-900' : 'text-gray-700'}`}>
                                        {option.text}
                                    </span>
                                    {option.is_correct && (
                                        <CheckIcon className="h-5 w-5 text-green-600 ml-2" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'true_false':
                return (
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Correct Answer</h4>
                        <div className="flex items-center space-x-4">
                            <div className={`flex items-center p-3 rounded-lg border ${
                                question.correct_answer === 'true' ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
                            }`}>
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                                    <CheckIcon className="w-4 h-4 text-green-600" />
                                </div>
                                <span className={question.correct_answer === 'true' ? 'font-medium text-green-900' : 'text-gray-600'}>
                                    True
                                </span>
                            </div>
                            <div className={`flex items-center p-3 rounded-lg border ${
                                question.correct_answer === 'false' ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
                            }`}>
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-2">
                                    <XMarkIcon className="w-4 h-4 text-red-600" />
                                </div>
                                <span className={question.correct_answer === 'false' ? 'font-medium text-green-900' : 'text-gray-600'}>
                                    False
                                </span>
                            </div>
                        </div>
                    </div>
                );

            case 'short_answer':
                return (
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Expected Answer</h4>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-gray-700 whitespace-pre-wrap">{question.correct_answer}</p>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            This answer is used as a reference for manual grading
                        </p>
                    </div>
                );

            case 'coding':
                return (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Expected Solution</h4>
                            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                                    {question.correct_answer}
                                </pre>
                            </div>
                        </div>
                        
                        {question.metadata && Object.keys(question.metadata).length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Configuration</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {question.metadata.test_cases && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <h5 className="text-sm font-medium text-blue-900 mb-2">Test Cases</h5>
                                            <pre className="text-xs text-blue-800 whitespace-pre-wrap">
                                                {question.metadata.test_cases}
                                            </pre>
                                        </div>
                                    )}
                                    
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                        <h5 className="text-sm font-medium text-gray-900 mb-2">Execution Limits</h5>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <div>Time Limit: {question.metadata.time_limit || 5}s</div>
                                            <div>Memory Limit: {question.metadata.memory_limit || 128}MB</div>
                                            <div>Grading: {question.metadata.grading_method || 'output_match'}</div>
                                        </div>
                                    </div>
                                    
                                    {question.metadata.allowed_imports && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                            <h5 className="text-sm font-medium text-amber-900 mb-2">Allowed Imports</h5>
                                            <p className="text-xs text-amber-800">
                                                {question.metadata.allowed_imports}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return <p className="text-gray-500 italic">No answer configuration available</p>;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Question Details: {test.title}
                </h2>
            }
        >
            <Head title={`Question Details - ${test.title}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Navigation */}
                    <div className="mb-6">
                        <Link
                            href={route('admin.lessons.tests.questions.index', [lesson.lesson_id, test.test_id])}
                            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ChevronLeftIcon className="w-5 h-5 mr-1" />
                            Back to Questions
                        </Link>
                    </div>

                    {/* Question Header */}
                    <div className="bg-white shadow-sm rounded-lg mb-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="text-blue-600">
                                        {getQuestionTypeIcon(question.type)}
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-semibold text-gray-900">
                                            Question #{question.order || question.question_id}
                                        </h1>
                                        <p className="text-sm text-gray-600">
                                            {getQuestionTypeName(question.type)} • {question.points} points
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Link
                                        href={route('admin.lessons.tests.questions.edit', [lesson.lesson_id, test.test_id, question.question_id])}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <PencilIcon className="-ml-1 mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                                    >
                                        <TrashIcon className="-ml-1 mr-2 h-4 w-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Question Metadata */}
                        <div className="px-6 py-4 bg-gray-50">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center">
                                    <TagIcon className="h-4 w-4 text-gray-400 mr-1" />
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(question.status)}`}>
                                        {question.status?.charAt(0).toUpperCase() + question.status?.slice(1)}
                                    </span>
                                </div>
                                
                                <div className="flex items-center">
                                    <ScaleIcon className="h-4 w-4 text-gray-400 mr-1" />
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded border ${getDifficultyColor(question.difficulty_level)}`}>
                                        {getDifficultyName(question.difficulty_level)}
                                    </span>
                                </div>
                                
                                <div className="flex items-center text-sm text-gray-600">
                                    <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                                    Created: {new Date(question.created_at).toLocaleDateString()}
                                </div>
                                
                                {question.updated_at !== question.created_at && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <EyeIcon className="h-4 w-4 text-gray-400 mr-1" />
                                        Updated: {new Date(question.updated_at).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="space-y-6">
                        {/* Question Text */}
                        <div className="bg-white shadow-sm rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Question</h3>
                            </div>
                            <div className="px-6 py-4">
                                <div className="prose max-w-none">
                                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                        {question.question_text}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Code Snippet (for coding questions) */}
                        {question.type === 'coding' && question.code_snippet && (
                            <div className="bg-white shadow-sm rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <CodeBracketIcon className="h-5 w-5 mr-2" />
                                        Code Snippet
                                    </h3>
                                </div>
                                <div className="px-6 py-4">
                                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                        <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                                            {question.code_snippet}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Answer Configuration */}
                        <div className="bg-white shadow-sm rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Answer Configuration</h3>
                            </div>
                            <div className="px-6 py-4">
                                {renderAnswerConfiguration()}
                            </div>
                        </div>

                        {/* Explanation */}
                        {question.explanation && (
                            <div className="bg-white shadow-sm rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <InformationCircleIcon className="h-5 w-5 mr-2" />
                                        Explanation
                                    </h3>
                                </div>
                                <div className="px-6 py-4">
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {question.explanation}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={route('admin.lessons.tests.questions.edit', [lesson.lesson_id, test.test_id, question.question_id])}
                                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Edit This Question
                            </Link>
                            <Link
                                href={route('admin.lessons.tests.questions.create', [lesson.lesson_id, test.test_id])}
                                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Add New Question
                            </Link>
                            <Link
                                href={route('admin.lessons.tests.show', [lesson.lesson_id, test.test_id])}
                                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                View Test Details
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