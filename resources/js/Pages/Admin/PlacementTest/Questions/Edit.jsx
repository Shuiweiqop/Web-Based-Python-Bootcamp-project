import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, Trash2, AlertCircle, Eye } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Edit({ auth, test, question, typeOptions, difficultyOptions, statusOptions }) {
    const { data, setData, put, processing, errors, reset } = useForm({
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
        options: question.options?.length > 0 ? question.options.map((option) => ({
            label: option.label ?? option.option_label,
            text: option.text ?? option.option_text,
            is_correct: option.is_correct,
        })) : [
            { label: 'A', text: '', is_correct: false },
            { label: 'B', text: '', is_correct: false },
            { label: 'C', text: '', is_correct: false },
            { label: 'D', text: '', is_correct: false },
        ]
    });

    const [showCodeSnippet, setShowCodeSnippet] = useState(!!question.code_snippet);
    const [showExplanation, setShowExplanation] = useState(!!question.explanation);
    const [initialType] = useState(question.type);

    // Update correct_answer when type changes
    useEffect(() => {
        // Only auto-update if type changed from initial
        if (data.type !== initialType) {
            if (data.type === 'mcq') {
                setData('correct_answer', 'See options below');
            } else if (data.type === 'true_false') {
                setData('correct_answer', 'true');
            } else if (data.type === 'short_answer' || data.type === 'coding') {
                if (data.correct_answer === 'See options below') {
                    setData('correct_answer', '');
                }
            }
        }
    }, [data.type, initialType]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate MCQ options
        if (data.type === 'mcq') {
            const hasCorrectOption = data.options.some(opt => opt.is_correct);
            if (!hasCorrectOption) {
                alert('Please mark at least one option as correct');
                return;
            }
        }

        put(route('admin.placement-tests.questions.update', [test.test_id, question.question_id]));
    };

    const addOption = () => {
        if (data.options.length >= 6) {
            alert('Maximum 6 options allowed');
            return;
        }
        const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        const newLabel = labels[data.options.length];
        setData('options', [...data.options, { label: newLabel, text: '', is_correct: false }]);
    };

    const removeOption = (index) => {
        if (data.options.length <= 2) {
            alert('Minimum 2 options required');
            return;
        }
        const newOptions = data.options.filter((_, i) => i !== index);
        setData('options', newOptions);
    };

    const updateOption = (index, field, value) => {
        const newOptions = [...data.options];
        newOptions[index][field] = value;
        setData('options', newOptions);
    };

    const toggleCorrectOption = (index) => {
        const newOptions = [...data.options];
        newOptions[index].is_correct = !newOptions[index].is_correct;
        setData('options', newOptions);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Edit Question - ${test.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <Link
                                href={route('admin.placement-tests.questions.index', test.test_id)}
                                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Questions
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Question</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Test: <span className="font-semibold">{test.title}</span>
                            </p>
                        </div>
                        <Link
                            href={route('admin.placement-tests.questions.show', [test.test_id, question.question_id])}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                        </Link>
                    </div>

                    {/* Type Change Warning */}
                    {data.type !== initialType && (
                        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
                                <div>
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Question Type Changed
                                    </h3>
                                    <p className="mt-1 text-sm text-yellow-700">
                                        You're changing from <strong>{typeOptions[initialType]}</strong> to <strong>{typeOptions[data.type]}</strong>.
                                        {data.type === 'mcq' && initialType !== 'mcq' && ' Make sure to set up the answer options below.'}
                                        {data.type !== 'mcq' && initialType === 'mcq' && ' The existing options will be removed.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            {/* Question Type */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Question Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {Object.entries(typeOptions).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                {errors.type && (
                                    <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                                )}
                            </div>

                            {/* Question Text */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Question <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={data.question_text}
                                    onChange={(e) => setData('question_text', e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Enter the question text..."
                                />
                                {errors.question_text && (
                                    <p className="mt-1 text-sm text-red-600">{errors.question_text}</p>
                                )}
                            </div>

                            {/* Code Snippet (Optional) */}
                            <div className="mb-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCodeSnippet(!showCodeSnippet)}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    {showCodeSnippet ? '- Remove Code Snippet' : '+ Add Code Snippet (Optional)'}
                                </button>
                                {showCodeSnippet && (
                                    <div className="mt-3">
                                        <textarea
                                            value={data.code_snippet}
                                            onChange={(e) => setData('code_snippet', e.target.value)}
                                            rows={8}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono text-sm"
                                            placeholder="Paste code here..."
                                        />
                                        {errors.code_snippet && (
                                            <p className="mt-1 text-sm text-red-600">{errors.code_snippet}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* MCQ Options */}
                            {data.type === 'mcq' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Answer Options <span className="text-red-500">*</span>
                                    </label>
                                    <div className="space-y-3">
                                        {data.options.map((option, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <div className="flex items-center pt-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={option.is_correct}
                                                        onChange={() => toggleCorrectOption(index)}
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        title="Mark as correct answer"
                                                    />
                                                </div>
                                                <div className="flex-shrink-0 pt-2">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                                                        {option.label}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={option.text}
                                                        onChange={(e) => updateOption(index, 'text', e.target.value)}
                                                        placeholder={`Option ${option.label}`}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                {data.options.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOption(index)}
                                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {errors.options && (
                                        <p className="mt-1 text-sm text-red-600">{errors.options}</p>
                                    )}
                                    {data.options.length < 6 && (
                                        <button
                                            type="button"
                                            onClick={addOption}
                                            className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Add Option
                                        </button>
                                    )}
                                    <div className="mt-2 flex items-start gap-2 text-sm text-gray-600">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>Check the box to mark correct answer(s). Multiple correct answers allowed.</span>
                                    </div>
                                </div>
                            )}

                            {/* Correct Answer (for non-MCQ) */}
                            {data.type !== 'mcq' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Correct Answer <span className="text-red-500">*</span>
                                    </label>
                                    {data.type === 'true_false' ? (
                                        <select
                                            value={data.correct_answer}
                                            onChange={(e) => setData('correct_answer', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="true">True</option>
                                            <option value="false">False</option>
                                        </select>
                                    ) : (
                                        <textarea
                                            value={data.correct_answer}
                                            onChange={(e) => setData('correct_answer', e.target.value)}
                                            rows={data.type === 'coding' ? 6 : 3}
                                            className={cn(
                                                "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                                                data.type === 'coding' && "font-mono text-sm"
                                            )}
                                            placeholder={
                                                data.type === 'short_answer' 
                                                    ? "Enter the expected answer..."
                                                    : "Enter the correct code solution..."
                                            }
                                        />
                                    )}
                                    {errors.correct_answer && (
                                        <p className="mt-1 text-sm text-red-600">{errors.correct_answer}</p>
                                    )}
                                </div>
                            )}

                            {/* Explanation (Optional) */}
                            <div className="mb-6">
                                <button
                                    type="button"
                                    onClick={() => setShowExplanation(!showExplanation)}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    {showExplanation ? '- Remove Explanation' : '+ Add Explanation (Optional)'}
                                </button>
                                {showExplanation && (
                                    <div className="mt-3">
                                        <textarea
                                            value={data.explanation}
                                            onChange={(e) => setData('explanation', e.target.value)}
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Explain why this is the correct answer..."
                                        />
                                        {errors.explanation && (
                                            <p className="mt-1 text-sm text-red-600">{errors.explanation}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Question Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Points */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Points
                                    </label>
                                    <input
                                        type="number"
                                        value={data.points}
                                        onChange={(e) => setData('points', parseInt(e.target.value))}
                                        min="1"
                                        max="100"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    {errors.points && (
                                        <p className="mt-1 text-sm text-red-600">{errors.points}</p>
                                    )}
                                </div>

                                {/* Difficulty */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Difficulty
                                    </label>
                                    <select
                                        value={data.difficulty_level}
                                        onChange={(e) => setData('difficulty_level', parseInt(e.target.value))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        {Object.entries(difficultyOptions).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.difficulty_level && (
                                        <p className="mt-1 text-sm text-red-600">{errors.difficulty_level}</p>
                                    )}
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        {Object.entries(statusOptions).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                    )}
                                </div>
                            </div>

                            {/* Order (Optional) */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Order
                                </label>
                                <input
                                    type="number"
                                    value={data.order}
                                    onChange={(e) => setData('order', e.target.value)}
                                    min="0"
                                    className="mt-1 block w-full md:w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.order && (
                                    <p className="mt-1 text-sm text-red-600">{errors.order}</p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    Current position in the test. Lower numbers appear first.
                                </p>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end gap-3 bg-gray-50 px-6 py-4 rounded-lg">
                            <Link
                                href={route('admin.placement-tests.questions.index', test.test_id)}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {processing ? 'Updating...' : 'Update Question'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
