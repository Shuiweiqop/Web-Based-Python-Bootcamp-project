import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Plus, 
    Search, 
    Filter,
    Eye, 
    Edit, 
    Trash2,
    FileQuestion,
    Code,
    CheckCircle,
    FileText,
    Target,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Index({ auth, test, questions, filters, typeOptions, difficultyOptions, statusOptions }) {
    const [search, setSearch] = useState(filters?.q || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.placement-tests.questions.index', test.test_id), {
            q: search,
            type: filters?.type,
            difficulty: filters?.difficulty,
            status: filters?.status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilterChange = (key, value) => {
        router.get(route('admin.placement-tests.questions.index', test.test_id), {
            q: search,
            [key]: value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        router.get(route('admin.placement-tests.questions.index', test.test_id));
    };

    const handleDelete = (questionId) => {
        if (confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
            router.delete(route('admin.placement-tests.questions.destroy', [test.test_id, questionId]));
        }
    };

    const getTypeIcon = (type) => {
        const icons = {
            mcq: FileQuestion,
            coding: Code,
            true_false: CheckCircle,
            short_answer: FileText,
        };
        const Icon = icons[type] || FileQuestion;
        return <Icon className="w-4 h-4" />;
    };

    const getDifficultyColor = (level) => {
        const colors = {
            1: 'bg-green-100 text-green-800',
            2: 'bg-yellow-100 text-yellow-800',
            3: 'bg-red-100 text-red-800',
        };
        return colors[level] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColor = (status) => {
        return status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800';
    };

    // Calculate stats
    const safeQuestions = questions?.data || [];
    const totalQuestions = safeQuestions.length;
    const totalPoints = safeQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
    const activeQuestions = safeQuestions.filter(q => q.status === 'active').length;
    const avgDifficulty = totalQuestions > 0 
        ? (safeQuestions.reduce((sum, q) => sum + (q.difficulty_level || 1), 0) / totalQuestions).toFixed(1)
        : 0;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Questions - ${test.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href={route('admin.placement-tests.show', test.test_id)}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Test Details
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Manage questions for: <span className="font-semibold">{test.title}</span>
                                </p>
                            </div>
                            <Link
                                href={route('admin.placement-tests.questions.create', test.test_id)}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Question
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {totalQuestions > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Questions</p>
                                        <p className="mt-1 text-2xl font-semibold text-gray-900">{totalQuestions}</p>
                                    </div>
                                    <div className="text-indigo-600">
                                        <FileQuestion className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Points</p>
                                        <p className="mt-1 text-2xl font-semibold text-gray-900">{totalPoints}</p>
                                    </div>
                                    <div className="text-indigo-600">
                                        <Target className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Active Questions</p>
                                        <p className="mt-1 text-2xl font-semibold text-gray-900">{activeQuestions}</p>
                                    </div>
                                    <div className="text-green-600">
                                        <CheckCircle className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Avg Difficulty</p>
                                        <p className="mt-1 text-2xl font-semibold text-gray-900">{avgDifficulty}</p>
                                    </div>
                                    <div className="text-yellow-600">
                                        <AlertCircle className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search and Filters */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search questions..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={cn(
                                        "inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium",
                                        showFilters
                                            ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    )}
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filters
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700"
                                >
                                    Search
                                </button>
                            </div>

                            {/* Filter Options */}
                            {showFilters && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Type
                                        </label>
                                        <select
                                            value={filters?.type || ''}
                                            onChange={(e) => handleFilterChange('type', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">All Types</option>
                                            {Object.entries(typeOptions || {}).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Difficulty
                                        </label>
                                        <select
                                            value={filters?.difficulty || ''}
                                            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">All Difficulties</option>
                                            {Object.entries(difficultyOptions || {}).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={filters?.status || ''}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">All Status</option>
                                            {Object.entries(statusOptions || {}).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Active Filters */}
                            {(search || filters?.type || filters?.difficulty || filters?.status) && (
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div className="flex flex-wrap gap-2">
                                        {search && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                Search: {search}
                                            </span>
                                        )}
                                        {filters?.type && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                Type: {typeOptions?.[filters.type]}
                                            </span>
                                        )}
                                        {filters?.difficulty && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                Difficulty: {difficultyOptions?.[filters.difficulty]}
                                            </span>
                                        )}
                                        {filters?.status && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                Status: {statusOptions?.[filters.status]}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Questions Table */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        {safeQuestions.length > 0 ? (
                            <>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Question
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Points
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Difficulty
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Order
                                            </th>
                                            <th className="relative px-6 py-3">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {safeQuestions.map((question) => (
                                            <tr key={question.question_id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="max-w-md">
                                                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                                            {question.question_text}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <span className="mr-2 text-gray-400">
                                                            {getTypeIcon(question.type)}
                                                        </span>
                                                        {question.type_name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {question.points}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={cn(
                                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                        getDifficultyColor(question.difficulty_level)
                                                    )}>
                                                        {question.difficulty_name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={cn(
                                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                        getStatusColor(question.status)
                                                    )}>
                                                        {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    #{question.order}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Link
                                                            href={route('admin.placement-tests.questions.show', [test.test_id, question.question_id])}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={route('admin.placement-tests.questions.edit', [test.test_id, question.question_id])}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(question.question_id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                {questions?.links && questions.links.length > 3 && (
                                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-700">
                                                Showing <span className="font-medium">{questions.from || 0}</span> to{' '}
                                                <span className="font-medium">{questions.to || 0}</span> of{' '}
                                                <span className="font-medium">{questions.total || 0}</span> results
                                            </div>
                                            <div className="flex space-x-2">
                                                {questions.links.map((link, index) => (
                                                    link.url ? (
                                                        <Link
                                                            key={index}
                                                            href={link.url}
                                                            className={cn(
                                                                "px-3 py-2 text-sm border rounded-md",
                                                                link.active
                                                                    ? "bg-indigo-600 text-white border-indigo-600"
                                                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                            )}
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    ) : (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-2 text-sm border rounded-md bg-gray-100 text-gray-400 border-gray-300"
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No questions found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {search || filters?.type || filters?.difficulty || filters?.status
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'Get started by adding your first question to this placement test.'
                                    }
                                </p>
                                <div className="mt-6">
                                    <Link
                                        href={route('admin.placement-tests.questions.create', test.test_id)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add First Question
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}