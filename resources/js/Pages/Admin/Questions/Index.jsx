// resources/js/Pages/Admin/Questions/Index.jsx
import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
  ChevronLeftIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  QuestionMarkCircleIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

export default function Index({ auth, lesson, test, questions = [], filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.q || '');
    const [selectedType, setSelectedType] = useState(filters?.type || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'all');
    const [selectedDifficulty, setSelectedDifficulty] = useState(filters?.difficulty || 'all');

    const { delete: destroy } = useForm();

    // Ensure questions is always an array
    const safeQuestions = questions?.data || [];

    const handleDelete = (questionId) => {
        if (confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
            destroy(route('admin.lessons.tests.questions.destroy', [lesson.lesson_id, test.test_id, questionId]));
        }
    };

    const handleSearch = () => {
        // Trigger search with current filters
        const params = new URLSearchParams();
        if (searchTerm) params.append('q', searchTerm);
        if (selectedType !== 'all') params.append('type', selectedType);
        if (selectedStatus !== 'all') params.append('status', selectedStatus);
        if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);
        
        window.location.href = route('admin.lessons.tests.questions.index', [lesson.lesson_id, test.test_id]) + 
            (params.toString() ? '?' + params.toString() : '');
    };

    const clearFilters = () => {
        window.location.href = route('admin.lessons.tests.questions.index', [lesson.lesson_id, test.test_id]);
    };

    const getQuestionTypeIcon = (type) => {
        const icons = {
            mcq: <QuestionMarkCircleIcon className="h-5 w-5" />,
            coding: <CodeBracketIcon className="h-5 w-5" />,
            true_false: <CheckCircleIcon className="h-5 w-5" />,
            short_answer: <DocumentTextIcon className="h-5 w-5" />
        };
        return icons[type] || <QuestionMarkCircleIcon className="h-5 w-5" />;
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
            1: 'bg-blue-100 text-blue-800',
            2: 'bg-orange-100 text-orange-800',
            3: 'bg-red-100 text-red-800'
        };
        return colors[level] || 'bg-gray-100 text-gray-800';
    };

    const getDifficultyName = (level) => {
        const names = {
            1: 'Easy',
            2: 'Medium', 
            3: 'Hard'
        };
        return names[level] || 'Unknown';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Questions: {test.title}
                </h2>
            }
        >
            <Head title={`Questions - ${test.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
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

                    {/* Header with Add Button */}
                    <div className="bg-white shadow-sm rounded-lg mb-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">
                                        Questions Management
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Manage questions for "{test.title}" in lesson "{lesson.title}"
                                    </p>
                                </div>
                                <Link
                                    href={route('admin.lessons.tests.questions.create', [lesson.lesson_id, test.test_id])}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg font-medium text-sm text-white hover:bg-blue-700 transition-colors"
                                >
                                    <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                                    Add Question
                                </Link>
                            </div>
                        </div>

                        {/* Filters and Search */}
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {/* Search */}
                                <div className="md:col-span-2">
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search questions..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Type Filter */}
                                <div>
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="mcq">Multiple Choice</option>
                                        <option value="coding">Coding Exercise</option>
                                        <option value="true_false">True/False</option>
                                        <option value="short_answer">Short Answer</option>
                                    </select>
                                </div>

                                {/* Difficulty Filter */}
                                <div>
                                    <select
                                        value={selectedDifficulty}
                                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Difficulty</option>
                                        <option value="1">Easy</option>
                                        <option value="2">Medium</option>
                                        <option value="3">Hard</option>
                                    </select>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Filter Actions */}
                            <div className="mt-4 flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handleSearch}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        <FunnelIcon className="-ml-0.5 mr-2 h-4 w-4" />
                                        Apply Filters
                                    </button>
                                    <button
                                        onClick={clearFilters}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Clear
                                    </button>
                                </div>
                                
                                {questions?.total && (
                                    <div className="text-sm text-gray-500">
                                        Showing {questions.from || 0}-{questions.to || 0} of {questions.total} questions
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        {safeQuestions.length > 0 ? (
                            <div className="overflow-x-auto">
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
                                            <tr key={question.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="max-w-xs">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {question.question_text}
                                                        </p>
                                                        {question.explanation && (
                                                            <p className="text-xs text-gray-500 mt-1 truncate">
                                                                {question.explanation}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 text-gray-400">
                                                            {getQuestionTypeIcon(question.type)}
                                                        </div>
                                                        <div className="ml-2">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {question.type_name || getQuestionTypeName(question.type)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-900 font-medium">
                                                        {question.points}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(question.difficulty_level)}`}>
                                                        {question.difficulty_name || getDifficultyName(question.difficulty_level)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(question.status)}`}>
                                                        {question.status?.charAt(0).toUpperCase() + question.status?.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    #{question.order || question.question_id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            href={route('admin.lessons.tests.questions.show', [lesson.lesson_id, test.test_id, question.question_id])}
                                                            className="text-blue-600 hover:text-blue-900 p-1"
                                                            title="View"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </Link>
                                                        <Link
                                                            href={route('admin.lessons.tests.questions.edit', [lesson.lesson_id, test.test_id, question.question_id])}
                                                            className="text-indigo-600 hover:text-indigo-900 p-1"
                                                            title="Edit"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(question.question_id)}
                                                            className="text-red-600 hover:text-red-900 p-1"
                                                            title="Delete"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No questions found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm || selectedType !== 'all' || selectedStatus !== 'all' || selectedDifficulty !== 'all'
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'Get started by adding a new question to this test.'
                                    }
                                </p>
                                <div className="mt-6">
                                    <Link
                                        href={route('admin.lessons.tests.questions.create', [lesson.lesson_id, test.test_id])}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                                        Add First Question
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {questions?.links && (
                            <div className="bg-white px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {questions.from || 0} to {questions.to || 0} of {questions.total || 0} results
                                    </div>
                                    <div className="flex space-x-2">
                                        {questions.links.map((link, index) => (
                                            link.url ? (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    className={`px-3 py-2 text-sm border rounded ${
                                                        link.active 
                                                            ? 'bg-blue-600 text-white border-blue-600' 
                                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ) : (
                                                <span 
                                                    key={index}
                                                    className="px-3 py-2 text-sm border rounded bg-gray-100 text-gray-400 border-gray-300"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary Stats */}
                    {safeQuestions.length > 0 && (
                        <div className="mt-6 bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{safeQuestions.length}</div>
                                    <div className="text-sm text-gray-600">Total Questions</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {safeQuestions.reduce((sum, q) => sum + (q.points || 0), 0)}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Points</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {safeQuestions.filter(q => q.status === 'active').length}
                                    </div>
                                    <div className="text-sm text-gray-600">Active Questions</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {safeQuestions.length > 0 ? 
                                            Math.round((safeQuestions.reduce((sum, q) => sum + (q.difficulty_level || 1), 0) / safeQuestions.length) * 10) / 10 
                                            : 0
                                        }
                                    </div>
                                    <div className="text-sm text-gray-600">Avg Difficulty</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}