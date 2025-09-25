// resources/js/Pages/Admin/Exercises/Index.jsx
import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon, 
    EyeIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ChevronUpDownIcon
} from '@heroicons/react/24/outline';

export default function Index({ auth, exercises, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedType, setSelectedType] = useState(filters?.type || '');
    const [selectedDifficulty, setSelectedDifficulty] = useState(filters?.difficulty || '');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || '');

    const exerciseTypes = [
        { value: 'coding', label: 'Coding' },
        { value: 'drag_drop', label: 'Drag & Drop' },
        { value: 'fill_blank', label: 'Fill in the blank' },
        { value: 'matching', label: 'Matching' },
        { value: 'sorting', label: 'Sorting' },
        { value: 'simulation', label: 'Simulation' },
        { value: 'multiple_choice', label: 'Multiple choice' }
    ];

    const difficulties = [
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        
        if (search) params.set('search', search);
        if (selectedType) params.set('type', selectedType);
        if (selectedDifficulty) params.set('difficulty', selectedDifficulty);
        if (selectedStatus) params.set('status', selectedStatus);

        router.get(route('admin.exercises.index'), Object.fromEntries(params), {
            preserveState: true,
            replace: true
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedType('');
        setSelectedDifficulty('');
        setSelectedStatus('');
        router.get(route('admin.exercises.index'));
    };

    const deleteExercise = (exercise) => {
        if (confirm(`Are you sure you want to delete "${exercise.title}"? This action cannot be undone.`)) {
            router.delete(route('admin.exercises.destroy', exercise.exercise_id), {
                onSuccess: () => console.log('Exercise deleted successfully'),
                onError: (errors) => console.error('Delete failed:', errors)
            });
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-100 text-green-800';
            case 'intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'advanced': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'coding': return 'bg-blue-100 text-blue-800';
            case 'drag_drop': return 'bg-purple-100 text-purple-800';
            case 'fill_blank': return 'bg-indigo-100 text-indigo-800';
            case 'matching': return 'bg-pink-100 text-pink-800';
            case 'sorting': return 'bg-orange-100 text-orange-800';
            case 'simulation': return 'bg-cyan-100 text-cyan-800';
            case 'multiple_choice': return 'bg-emerald-100 text-emerald-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Exercises Management
                    </h2>
                    <Link
                        href={route('admin.exercises.create')}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Create Exercise
                    </Link>
                </div>
            }
        >
            <Head title="Exercises Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            {flash.success}
                        </div>
                    )}
                    
                    {flash?.error && (
                        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {flash.error}
                        </div>
                    )}

                    {/* Filters */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Search Exercises
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search by title or description..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Type
                                        </label>
                                        <select
                                            value={selectedType}
                                            onChange={(e) => setSelectedType(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">All Types</option>
                                            {exerciseTypes.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Difficulty
                                        </label>
                                        <select
                                            value={selectedDifficulty}
                                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">All Difficulties</option>
                                            {difficulties.map(diff => (
                                                <option key={diff.value} value={diff.value}>
                                                    {diff.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">All Status</option>
                                            <option value="1">Active</option>
                                            <option value="0">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700"
                                    >
                                        <FunnelIcon className="w-4 h-4 mr-2" />
                                        Apply Filters
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Exercises Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-4 flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">
                                    All Exercises ({exercises?.data?.length || 0})
                                </h3>
                            </div>

                            {exercises?.data?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Exercise
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Lesson
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Difficulty
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Score
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {exercises.data.map((exercise) => (
                                                <tr key={exercise.exercise_id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {exercise.title}
                                                            </div>
                                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                                {exercise.description}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {exercise.lesson?.title || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(exercise.exercise_type)}`}>
                                                            {exerciseTypes.find(t => t.value === exercise.exercise_type)?.label || exercise.exercise_type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(exercise.difficulty)}`}>
                                                            {exercise.difficulty}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {exercise.max_score}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            exercise.is_active 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {exercise.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            <Link
                                                                href={route('admin.exercises.show', exercise.exercise_id)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                                title="View Exercise"
                                                            >
                                                                <EyeIcon className="w-4 h-4" />
                                                            </Link>
                                                            <Link
                                                                href={route('admin.exercises.edit', exercise.exercise_id)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                                title="Edit Exercise"
                                                            >
                                                                <PencilIcon className="w-4 h-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => deleteExercise(exercise)}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Delete Exercise"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-gray-500 mb-4">
                                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">No exercises found</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        {search || selectedType || selectedDifficulty || selectedStatus
                                            ? 'Try adjusting your search criteria or filters.'
                                            : 'Get started by creating your first exercise.'
                                        }
                                    </p>
                                    <Link
                                        href={route('admin.exercises.create')}
                                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Create Exercise
                                    </Link>
                                </div>
                            )}

                            {/* Pagination would go here if needed */}
                            {exercises?.links && (
                                <div className="mt-6 flex justify-center">
                                    {/* Add pagination component here */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}