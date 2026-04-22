import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Edit, 
    Trash2, 
    Eye,
    FileQuestion,
    BarChart3,
    Clock,
    Users,
    Target,
    AlertCircle,
    Download,
    Upload,
    X,
    CheckCircle,
    AlertTriangle,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Show({ test, questions, stats }) {
    const { props } = usePage();
    const [isDark, setIsDark] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [previewQuestions, setPreviewQuestions] = useState([]);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState(null);
    const [importSuccess, setImportSuccess] = useState(null);

    useEffect(() => {
        const checkDarkMode = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        checkDarkMode();
        window.addEventListener('theme-changed', checkDarkMode);
        return () => window.removeEventListener('theme-changed', checkDarkMode);
    }, []);

    // 处理文件选择
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImportFile(file);
            setImportError(null);
            setPreviewQuestions([]);
        }
    };

    // 预览导入文件
    const handlePreviewImport = async () => {
        if (!importFile) {
            setImportError('Please select a file first');
            return;
        }

        setIsPreviewing(true);
        setImportError(null);

        const formData = new FormData();
        formData.append('file', importFile);

        try {
            console.log('Sending preview request to:', route('admin.placement-tests.questions.import.preview', test.test_id));
            console.log('File:', importFile.name, 'Size:', importFile.size);
            
            // 方法1: 从 Inertia props 获取
            const csrfToken = props.csrf_token || 
                             // 方法2: 从 meta 标签获取
                             document.querySelector('meta[name="csrf-token"]')?.content ||
                             // 方法3: 从 cookie 获取 (Laravel Sanctum)
                             document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];
            
            if (!csrfToken) {
                throw new Error('CSRF token not found. Please refresh the page.');
            }
            
            console.log('CSRF Token found');
            
            const response = await fetch(
                route('admin.placement-tests.questions.import.preview', test.test_id),
                {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: formData,
                    credentials: 'same-origin',
                }
            );

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            // Check if response is actually JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Received non-JSON response:');
                console.error('Status:', response.status);
                console.error('Content-Type:', contentType);
                console.error('Body:', text.substring(0, 500));
                throw new Error(`Server returned ${response.status} error. Check console for details.`);
            }

            const data = await response.json();

            if (data.success) {
                setPreviewQuestions(data.questions);
                setImportSuccess(`Found ${data.count} questions. Review them below.`);
            } else {
                setImportError(data.error || 'Failed to parse file');
            }
        } catch (error) {
            console.error('Import preview error:', error);
            setImportError(error.message || 'Failed to preview file. Please check the console for details.');
        } finally {
            setIsPreviewing(false);
        }
    };

    // 执行导入
    const handleConfirmImport = async () => {
        if (previewQuestions.length === 0) {
            setImportError('No questions to import');
            return;
        }

        setIsImporting(true);
        setImportError(null);

        try {
            const response = await fetch(
                route('admin.placement-tests.questions.import', test.test_id),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({ questions: previewQuestions }),
                }
            );

            const data = await response.json();

            if (data.success) {
                // 刷新页面以显示新导入的题目
                router.reload();
                setShowImportModal(false);
            } else {
                setImportError(data.error || 'Import failed');
            }
        } catch (error) {
            setImportError('Network error: ' + error.message);
        } finally {
            setIsImporting(false);
        }
    };

    const handleDelete = () => {
        router.delete(route('admin.placement-tests.destroy', test.test_id), {
            onSuccess: () => setShowDeleteModal(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={test.title} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href={route('admin.placement-tests.index')}
                            className={cn(
                                "inline-flex items-center text-sm mb-4 transition-colors",
                                isDark 
                                    ? "text-cyan-400 hover:text-cyan-300" 
                                    : "text-indigo-600 hover:text-indigo-700"
                            )}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Tests
                        </Link>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className={cn(
                                    "text-3xl font-bold",
                                    isDark ? "text-white" : "text-gray-900"
                                )}>
                                    {test.title}
                                </h1>
                                {test.description && (
                                    <p className={cn(
                                        "mt-2",
                                        isDark ? "text-slate-400" : "text-gray-600"
                                    )}>
                                        {test.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <Link href={route('admin.placement-tests.preview', test.test_id)}>
                                    <button className={cn(
                                        "inline-flex items-center px-4 py-2 rounded-lg transition-colors",
                                        isDark
                                            ? "bg-slate-700 hover:bg-slate-600 text-white"
                                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                    )}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        Preview
                                    </button>
                                </Link>

                                <Link href={route('admin.placement-tests.edit', test.test_id)}>
                                    <button className={cn(
                                        "inline-flex items-center px-4 py-2 rounded-lg transition-colors",
                                        isDark
                                            ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                    )}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                    </button>
                                </Link>

                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="inline-flex items-center px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {/* Questions */}
                        <div className={cn(
                            "rounded-lg p-6 shadow-sm",
                            isDark 
                                ? "bg-slate-800 border border-slate-700" 
                                : "bg-white"
                        )}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={cn(
                                        "text-sm font-medium",
                                        isDark ? "text-slate-400" : "text-gray-600"
                                    )}>
                                        Questions
                                    </p>
                                    <p className={cn(
                                        "text-3xl font-bold mt-2",
                                        isDark ? "text-white" : "text-gray-900"
                                    )}>
                                        {test.questions_count}
                                    </p>
                                </div>
                                <FileQuestion className={cn(
                                    "w-12 h-12",
                                    isDark ? "text-cyan-400" : "text-indigo-600"
                                )} />
                            </div>
                        </div>

                        {/* Total Points */}
                        <div className={cn(
                            "rounded-lg p-6 shadow-sm",
                            isDark 
                                ? "bg-slate-800 border border-slate-700" 
                                : "bg-white"
                        )}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={cn(
                                        "text-sm font-medium",
                                        isDark ? "text-slate-400" : "text-gray-600"
                                    )}>
                                        Total Points
                                    </p>
                                    <p className={cn(
                                        "text-3xl font-bold mt-2",
                                        isDark ? "text-white" : "text-gray-900"
                                    )}>
                                        {test.total_points}
                                    </p>
                                </div>
                                <Target className={cn(
                                    "w-12 h-12",
                                    isDark ? "text-green-400" : "text-green-600"
                                )} />
                            </div>
                        </div>

                        {/* Time Limit */}
                        <div className={cn(
                            "rounded-lg p-6 shadow-sm",
                            isDark 
                                ? "bg-slate-800 border border-slate-700" 
                                : "bg-white"
                        )}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={cn(
                                        "text-sm font-medium",
                                        isDark ? "text-slate-400" : "text-gray-600"
                                    )}>
                                        Time Limit
                                    </p>
                                    <p className={cn(
                                        "text-3xl font-bold mt-2",
                                        isDark ? "text-white" : "text-gray-900"
                                    )}>
                                        {test.time_limit}
                                        <span className="text-lg ml-1">min</span>
                                    </p>
                                </div>
                                <Clock className={cn(
                                    "w-12 h-12",
                                    isDark ? "text-yellow-400" : "text-yellow-600"
                                )} />
                            </div>
                        </div>

                        {/* Status */}
                        <div className={cn(
                            "rounded-lg p-6 shadow-sm",
                            isDark 
                                ? "bg-slate-800 border border-slate-700" 
                                : "bg-white"
                        )}>
                            <div>
                                <p className={cn(
                                    "text-sm font-medium",
                                    isDark ? "text-slate-400" : "text-gray-600"
                                )}>
                                    Status
                                </p>
                                <div className="mt-2">
                                    <span className={cn(
                                        "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold",
                                        test.status === 'active'
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                            : test.status === 'inactive'
                                            ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                    )}>
                                        {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className={cn(
                        "rounded-lg shadow-sm p-6",
                        isDark 
                            ? "bg-slate-800 border border-slate-700" 
                            : "bg-white"
                    )}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={cn(
                                "text-xl font-bold",
                                isDark ? "text-white" : "text-gray-900"
                            )}>
                                Questions ({questions.length})
                            </h2>

                            <div className="flex items-center gap-3">
                                {/* Download Templates */}
                                <div className="flex items-center gap-2">
                                    <a
                                        href={route('admin.placement-tests.questions.template', 'json')}
                                        className={cn(
                                            "inline-flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
                                            isDark
                                                ? "bg-slate-700 hover:bg-slate-600 text-white"
                                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                        )}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        JSON Template
                                    </a>
                                    <a
                                        href={route('admin.placement-tests.questions.template', 'csv')}
                                        className={cn(
                                            "inline-flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
                                            isDark
                                                ? "bg-slate-700 hover:bg-slate-600 text-white"
                                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                        )}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        CSV Template
                                    </a>
                                </div>

                                {/* Import Button */}
                                <button
                                    onClick={() => setShowImportModal(true)}
                                    className={cn(
                                        "inline-flex items-center px-4 py-2 rounded-lg transition-colors",
                                        isDark
                                            ? "bg-green-600 hover:bg-green-700 text-white"
                                            : "bg-green-600 hover:bg-green-700 text-white"
                                    )}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Import Questions
                                </button>

                                <Link href={route('admin.placement-tests.questions.create', test.test_id)}>
                                    <button className={cn(
                                        "inline-flex items-center px-4 py-2 rounded-lg transition-colors",
                                        isDark
                                            ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                    )}>
                                        Add Question
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {questions.length === 0 ? (
                            <div className="text-center py-12">
                                <FileQuestion className={cn(
                                    "w-16 h-16 mx-auto mb-4",
                                    isDark ? "text-slate-600" : "text-gray-400"
                                )} />
                                <p className={cn(
                                    "text-lg mb-4",
                                    isDark ? "text-slate-400" : "text-gray-600"
                                )}>
                                    No questions yet
                                </p>
                                <Link href={route('admin.placement-tests.questions.create', test.test_id)}>
                                    <button className={cn(
                                        "inline-flex items-center px-6 py-3 rounded-lg transition-colors",
                                        isDark
                                            ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                    )}>
                                        Create First Question
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            <Link href={route('admin.placement-tests.questions.index', test.test_id)}>
                                <button className={cn(
                                    "w-full py-3 rounded-lg transition-colors",
                                    isDark
                                        ? "bg-slate-700 hover:bg-slate-600 text-white"
                                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                )}>
                                    Manage Questions →
                                </button>
                            </Link>
                        )}
                    </div>

                    {/* Import Modal */}
                    {showImportModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className={cn(
                                "rounded-lg p-6 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto",
                                isDark 
                                    ? "bg-slate-800 border border-slate-700" 
                                    : "bg-white"
                            )}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className={cn(
                                        "text-xl font-bold",
                                        isDark ? "text-white" : "text-gray-900"
                                    )}>
                                        Import Questions
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowImportModal(false);
                                            setImportFile(null);
                                            setPreviewQuestions([]);
                                            setImportError(null);
                                            setImportSuccess(null);
                                        }}
                                        className={cn(
                                            "p-2 rounded-lg transition-colors",
                                            isDark
                                                ? "hover:bg-slate-700 text-slate-400"
                                                : "hover:bg-gray-100 text-gray-600"
                                        )}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* File Upload */}
                                <div className="mb-6">
                                    <label className={cn(
                                        "block text-sm font-medium mb-2",
                                        isDark ? "text-slate-300" : "text-gray-700"
                                    )}>
                                        Select File (JSON, CSV, or Excel)
                                    </label>
                                    <input
                                        type="file"
                                        accept=".json,.csv,.txt,.xlsx,.xls"
                                        onChange={handleFileSelect}
                                        className={cn(
                                            "w-full px-4 py-2 rounded-lg border",
                                            isDark
                                                ? "bg-slate-900 border-slate-700 text-white"
                                                : "bg-white border-gray-300 text-gray-900"
                                        )}
                                    />
                                    {importFile && (
                                        <p className={cn(
                                            "mt-2 text-sm",
                                            isDark ? "text-slate-400" : "text-gray-600"
                                        )}>
                                            Selected: {importFile.name}
                                        </p>
                                    )}
                                </div>

                                {/* Error/Success Messages */}
                                {importError && (
                                    <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-800 dark:text-red-300">{importError}</p>
                                    </div>
                                )}

                                {importSuccess && (
                                    <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-green-800 dark:text-green-300">{importSuccess}</p>
                                    </div>
                                )}

                                {/* Preview Questions */}
                                {previewQuestions.length > 0 && (
                                    <div className="mb-6 max-h-96 overflow-y-auto">
                                        <h4 className={cn(
                                            "text-lg font-semibold mb-3",
                                            isDark ? "text-white" : "text-gray-900"
                                        )}>
                                            Preview ({previewQuestions.length} questions)
                                        </h4>
                                        <div className="space-y-3">
                                            {previewQuestions.map((q, index) => (
                                                <div
                                                    key={index}
                                                    className={cn(
                                                        "p-3 rounded-lg border",
                                                        isDark
                                                            ? "bg-slate-900/50 border-slate-700"
                                                            : "bg-gray-50 border-gray-200"
                                                    )}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className={cn(
                                                            "px-2 py-1 text-xs rounded",
                                                            isDark
                                                                ? "bg-cyan-900/30 text-cyan-300"
                                                                : "bg-indigo-100 text-indigo-700"
                                                        )}>
                                                            {q.type}
                                                        </span>
                                                        <p className={cn(
                                                            "text-sm flex-1",
                                                            isDark ? "text-slate-300" : "text-gray-700"
                                                        )}>
                                                            {q.question_text}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setShowImportModal(false);
                                            setImportFile(null);
                                            setPreviewQuestions([]);
                                            setImportError(null);
                                            setImportSuccess(null);
                                        }}
                                        className={cn(
                                            "px-6 py-2 rounded-lg transition-colors",
                                            isDark
                                                ? "bg-slate-700 hover:bg-slate-600 text-white"
                                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                        )}
                                    >
                                        Cancel
                                    </button>

                                    {previewQuestions.length === 0 ? (
                                        <button
                                            onClick={handlePreviewImport}
                                            disabled={!importFile || isPreviewing}
                                            className={cn(
                                                "px-6 py-2 rounded-lg transition-colors",
                                                isDark
                                                    ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                                                    : "bg-indigo-600 hover:bg-indigo-700 text-white",
                                                (!importFile || isPreviewing) && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            {isPreviewing ? 'Previewing...' : 'Preview File'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleConfirmImport}
                                            disabled={isImporting}
                                            className={cn(
                                                "px-6 py-2 rounded-lg transition-colors bg-green-600 hover:bg-green-700 text-white",
                                                isImporting && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            {isImporting ? 'Importing...' : `Import ${previewQuestions.length} Questions`}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className={cn(
                                "rounded-lg p-6 shadow-xl max-w-md w-full mx-4",
                                isDark 
                                    ? "bg-slate-800 border border-slate-700" 
                                    : "bg-white"
                            )}>
                                <div className="flex items-start gap-4">
                                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                                    <div>
                                        <h3 className={cn(
                                            "text-lg font-semibold mb-2",
                                            isDark ? "text-white" : "text-gray-900"
                                        )}>
                                            Delete Placement Test?
                                        </h3>
                                        <p className={cn(
                                            "text-sm mb-4",
                                            isDark ? "text-slate-400" : "text-gray-600"
                                        )}>
                                            This will permanently delete "{test.title}" and all its questions. 
                                            This action cannot be undone.
                                        </p>
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => setShowDeleteModal(false)}
                                                className={cn(
                                                    "px-4 py-2 rounded-lg transition-colors",
                                                    isDark
                                                        ? "bg-slate-700 hover:bg-slate-600 text-white"
                                                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                                )}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}