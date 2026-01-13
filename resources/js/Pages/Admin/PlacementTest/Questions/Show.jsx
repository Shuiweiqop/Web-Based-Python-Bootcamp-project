import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Edit, 
    Trash2, 
    Code, 
    CheckCircle, 
    XCircle,
    FileQuestion,
    Target,
    Clock,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Show({ auth, test, question }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkDarkMode = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        checkDarkMode();
        window.addEventListener('theme-changed', checkDarkMode);
        return () => window.removeEventListener('theme-changed', checkDarkMode);
    }, []);

    const handleDelete = () => {
        if (isDeleting) return;
        
        setIsDeleting(true);
        router.delete(
            route('admin.placement-tests.questions.destroy', [test.test_id, question.question_id]),
            {
                onFinish: () => {
                    setIsDeleting(false);
                    setShowDeleteModal(false);
                }
            }
        );
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'mcq':
                return <FileQuestion className="w-5 h-5" />;
            case 'coding':
                return <Code className="w-5 h-5" />;
            case 'true_false':
                return <CheckCircle className="w-5 h-5" />;
            case 'short_answer':
                return <Target className="w-5 h-5" />;
            default:
                return <FileQuestion className="w-5 h-5" />;
        }
    };

    const getDifficultyColor = (level) => {
        if (isDark) {
            switch (level) {
                case 1: return 'bg-green-900/50 text-green-300 border border-green-700';
                case 2: return 'bg-yellow-900/50 text-yellow-300 border border-yellow-700';
                case 3: return 'bg-red-900/50 text-red-300 border border-red-700';
                default: return 'bg-gray-800 text-gray-300 border border-gray-700';
            }
        }
        switch (level) {
            case 1: return 'bg-green-100 text-green-800';
            case 2: return 'bg-yellow-100 text-yellow-800';
            case 3: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status) => {
        if (isDark) {
            return status === 'active' 
                ? 'bg-green-900/50 text-green-300 border border-green-700' 
                : 'bg-gray-800 text-gray-300 border border-gray-700';
        }
        return status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Question Details - ${test.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <Link
                                href={route('admin.placement-tests.questions.index', test.test_id)}
                                className={cn(
                                    "inline-flex items-center text-sm mb-2 transition-colors",
                                    isDark 
                                        ? "text-slate-400 hover:text-slate-200" 
                                        : "text-gray-600 hover:text-gray-900"
                                )}
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Questions
                            </Link>
                            <h1 className={cn(
                                "text-3xl font-bold",
                                isDark ? "text-white" : "text-gray-900"
                            )}>
                                Question Details
                            </h1>
                            <p className={cn(
                                "mt-1 text-sm",
                                isDark ? "text-slate-400" : "text-gray-600"
                            )}>
                                Test: <span className="font-semibold">{test.title}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href={route('admin.placement-tests.questions.edit', [test.test_id, question.question_id])}
                                className={cn(
                                    "inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md transition-colors",
                                    isDark
                                        ? "border-slate-600 text-slate-300 bg-slate-800 hover:bg-slate-700"
                                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                                )}
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Question
                            </Link>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className={cn(
                                    "inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md transition-colors",
                                    isDark
                                        ? "border-red-800 text-red-400 bg-red-950/50 hover:bg-red-900/50"
                                        : "border-red-300 text-red-700 bg-white hover:bg-red-50"
                                )}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Question Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {/* Type */}
                        <div className={cn(
                            "rounded-lg shadow-sm p-4",
                            isDark 
                                ? "bg-slate-800 border border-slate-700" 
                                : "bg-white"
                        )}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={cn(
                                        "text-sm",
                                        isDark ? "text-slate-400" : "text-gray-600"
                                    )}>
                                        Type
                                    </p>
                                    <p className={cn(
                                        "mt-1 text-lg font-semibold",
                                        isDark ? "text-white" : "text-gray-900"
                                    )}>
                                        {question.type_name}
                                    </p>
                                </div>
                                <div className={cn(
                                    isDark ? "text-cyan-400" : "text-indigo-600"
                                )}>
                                    {getTypeIcon(question.type)}
                                </div>
                            </div>
                        </div>

                        {/* Points */}
                        <div className={cn(
                            "rounded-lg shadow-sm p-4",
                            isDark 
                                ? "bg-slate-800 border border-slate-700" 
                                : "bg-white"
                        )}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={cn(
                                        "text-sm",
                                        isDark ? "text-slate-400" : "text-gray-600"
                                    )}>
                                        Points
                                    </p>
                                    <p className={cn(
                                        "mt-1 text-lg font-semibold",
                                        isDark ? "text-white" : "text-gray-900"
                                    )}>
                                        {question.points}
                                    </p>
                                </div>
                                <div className={cn(
                                    isDark ? "text-cyan-400" : "text-indigo-600"
                                )}>
                                    <Target className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Difficulty */}
                        <div className={cn(
                            "rounded-lg shadow-sm p-4",
                            isDark 
                                ? "bg-slate-800 border border-slate-700" 
                                : "bg-white"
                        )}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={cn(
                                        "text-sm",
                                        isDark ? "text-slate-400" : "text-gray-600"
                                    )}>
                                        Difficulty
                                    </p>
                                    <p className="mt-1">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                            getDifficultyColor(question.difficulty_level)
                                        )}>
                                            {question.difficulty_name}
                                        </span>
                                    </p>
                                </div>
                                <div className={cn(
                                    isDark ? "text-slate-600" : "text-gray-400"
                                )}>
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className={cn(
                            "rounded-lg shadow-sm p-4",
                            isDark 
                                ? "bg-slate-800 border border-slate-700" 
                                : "bg-white"
                        )}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={cn(
                                        "text-sm",
                                        isDark ? "text-slate-400" : "text-gray-600"
                                    )}>
                                        Status
                                    </p>
                                    <p className="mt-1">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                            getStatusColor(question.status)
                                        )}>
                                            {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className={cn(
                        "shadow-sm rounded-lg p-6 mb-6",
                        isDark 
                            ? "bg-slate-800 border border-slate-700" 
                            : "bg-white"
                    )}>
                        <h2 className={cn(
                            "text-lg font-semibold mb-4",
                            isDark ? "text-white" : "text-gray-900"
                        )}>
                            Question
                        </h2>
                        <div className="prose max-w-none">
                            <p className={cn(
                                "whitespace-pre-wrap",
                                isDark ? "text-slate-200" : "text-gray-900"
                            )}>
                                {question.question_text}
                            </p>
                        </div>

                        {/* Code Snippet */}
                        {question.code_snippet && (
                            <div className="mt-6">
                                <h3 className={cn(
                                    "text-sm font-medium mb-2 flex items-center",
                                    isDark ? "text-slate-300" : "text-gray-700"
                                )}>
                                    <Code className="w-4 h-4 mr-2" />
                                    Code Snippet
                                </h3>
                                <div className={cn(
                                    "rounded-lg p-4 overflow-x-auto",
                                    isDark ? "bg-slate-950" : "bg-gray-900"
                                )}>
                                    <pre className={cn(
                                        "text-sm font-mono",
                                        isDark ? "text-cyan-300" : "text-gray-100"
                                    )}>
                                        <code>{question.code_snippet}</code>
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* MCQ Options */}
                        {question.type === 'mcq' && question.options && question.options.length > 0 && (
                            <div className="mt-6">
                                <h3 className={cn(
                                    "text-sm font-medium mb-3",
                                    isDark ? "text-slate-300" : "text-gray-700"
                                )}>
                                    Answer Options
                                </h3>
                                <div className="space-y-3">
                                    {question.options.map((option) => (
                                        <div
                                            key={option.option_id}
                                            className={cn(
                                                "flex items-start gap-3 p-4 rounded-lg border-2",
                                                option.is_correct
                                                    ? isDark
                                                        ? "bg-green-950/30 border-green-700"
                                                        : "bg-green-50 border-green-500"
                                                    : isDark
                                                        ? "bg-slate-900/50 border-slate-700"
                                                        : "bg-gray-50 border-gray-200"
                                            )}
                                        >
                                            <div className="flex-shrink-0 mt-0.5">
                                                {option.is_correct ? (
                                                    <CheckCircle className={cn(
                                                        "w-5 h-5",
                                                        isDark ? "text-green-400" : "text-green-600"
                                                    )} />
                                                ) : (
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-full border-2",
                                                        isDark ? "border-slate-600" : "border-gray-300"
                                                    )} />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start gap-3">
                                                    <span className={cn(
                                                        "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium flex-shrink-0",
                                                        option.is_correct
                                                            ? isDark
                                                                ? "bg-green-900/50 text-green-300 border border-green-700"
                                                                : "bg-green-100 text-green-800"
                                                            : isDark
                                                                ? "bg-slate-800 text-slate-300 border border-slate-700"
                                                                : "bg-gray-100 text-gray-700"
                                                    )}>
                                                        {option.option_label}
                                                    </span>
                                                    <p className={cn(
                                                        "text-sm flex-1",
                                                        option.is_correct
                                                            ? isDark
                                                                ? "text-green-300 font-medium"
                                                                : "text-green-900 font-medium"
                                                            : isDark
                                                                ? "text-slate-300"
                                                                : "text-gray-700"
                                                    )}>
                                                        {option.option_text}
                                                    </p>
                                                </div>
                                                {option.is_correct && (
                                                    <p className={cn(
                                                        "mt-2 text-xs ml-11",
                                                        isDark ? "text-green-400" : "text-green-700"
                                                    )}>
                                                        ✓ Correct Answer
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Correct Answer (non-MCQ) */}
                        {question.type !== 'mcq' && question.correct_answer && (
                            <div className="mt-6">
                                <h3 className={cn(
                                    "text-sm font-medium mb-2 flex items-center",
                                    isDark ? "text-slate-300" : "text-gray-700"
                                )}>
                                    <CheckCircle className={cn(
                                        "w-4 h-4 mr-2",
                                        isDark ? "text-green-400" : "text-green-600"
                                    )} />
                                    Correct Answer
                                </h3>
                                <div className={cn(
                                    "border-2 rounded-lg p-4",
                                    isDark
                                        ? "bg-green-950/30 border-green-700"
                                        : "bg-green-50 border-green-200"
                                )}>
                                    {question.type === 'coding' ? (
                                        <pre className={cn(
                                            "text-sm font-mono whitespace-pre-wrap",
                                            isDark ? "text-green-300" : "text-gray-900"
                                        )}>
                                            <code>{question.correct_answer}</code>
                                        </pre>
                                    ) : (
                                        <p className={cn(
                                            "text-sm font-medium",
                                            isDark ? "text-green-300" : "text-gray-900"
                                        )}>
                                            {question.correct_answer}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Explanation */}
                        {question.explanation && (
                            <div className="mt-6">
                                <h3 className={cn(
                                    "text-sm font-medium mb-2",
                                    isDark ? "text-slate-300" : "text-gray-700"
                                )}>
                                    Explanation
                                </h3>
                                <div className={cn(
                                    "border rounded-lg p-4",
                                    isDark
                                        ? "bg-blue-950/30 border-blue-800"
                                        : "bg-blue-50 border-blue-200"
                                )}>
                                    <p className={cn(
                                        "text-sm whitespace-pre-wrap",
                                        isDark ? "text-blue-300" : "text-gray-700"
                                    )}>
                                        {question.explanation}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className={cn(
                        "shadow-sm rounded-lg p-6",
                        isDark 
                            ? "bg-slate-800 border border-slate-700" 
                            : "bg-white"
                    )}>
                        <h2 className={cn(
                            "text-lg font-semibold mb-4",
                            isDark ? "text-white" : "text-gray-900"
                        )}>
                            Additional Information
                        </h2>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                                <dt className={cn(
                                    "text-sm font-medium",
                                    isDark ? "text-slate-400" : "text-gray-500"
                                )}>
                                    Question ID
                                </dt>
                                <dd className={cn(
                                    "mt-1 text-sm",
                                    isDark ? "text-slate-200" : "text-gray-900"
                                )}>
                                    {question.question_id}
                                </dd>
                            </div>
                            <div>
                                <dt className={cn(
                                    "text-sm font-medium",
                                    isDark ? "text-slate-400" : "text-gray-500"
                                )}>
                                    Order
                                </dt>
                                <dd className={cn(
                                    "mt-1 text-sm",
                                    isDark ? "text-slate-200" : "text-gray-900"
                                )}>
                                    {question.order}
                                </dd>
                            </div>
                            <div>
                                <dt className={cn(
                                    "text-sm font-medium",
                                    isDark ? "text-slate-400" : "text-gray-500"
                                )}>
                                    Created At
                                </dt>
                                <dd className={cn(
                                    "mt-1 text-sm",
                                    isDark ? "text-slate-200" : "text-gray-900"
                                )}>
                                    {new Date(question.created_at).toLocaleString()}
                                </dd>
                            </div>
                            <div>
                                <dt className={cn(
                                    "text-sm font-medium",
                                    isDark ? "text-slate-400" : "text-gray-500"
                                )}>
                                    Updated At
                                </dt>
                                <dd className={cn(
                                    "mt-1 text-sm",
                                    isDark ? "text-slate-200" : "text-gray-900"
                                )}>
                                    {new Date(question.updated_at).toLocaleString()}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className={cn(
                        "rounded-lg p-6 max-w-md w-full mx-4 shadow-xl",
                        isDark 
                            ? "bg-slate-800 border border-slate-700" 
                            : "bg-white"
                    )}>
                        <div className="flex items-center mb-4">
                            <div className={cn(
                                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                                isDark 
                                    ? "bg-red-950/50 border border-red-800" 
                                    : "bg-red-100"
                            )}>
                                <Trash2 className={cn(
                                    "w-5 h-5",
                                    isDark ? "text-red-400" : "text-red-600"
                                )} />
                            </div>
                            <h3 className={cn(
                                "ml-3 text-lg font-medium",
                                isDark ? "text-white" : "text-gray-900"
                            )}>
                                Delete Question
                            </h3>
                        </div>
                        <p className={cn(
                            "text-sm mb-6",
                            isDark ? "text-slate-400" : "text-gray-500"
                        )}>
                            Are you sure you want to delete this question? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className={cn(
                                    "px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors disabled:opacity-50",
                                    isDark
                                        ? "border-slate-600 text-slate-300 bg-slate-700 hover:bg-slate-600"
                                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                                )}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Question'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}