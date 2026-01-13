import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Create({ auth, lessons, difficultyOptions }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        learning_outcomes: '',
        prerequisites: '',
        difficulty_level: 'beginner',
        estimated_duration_hours: '',
        min_score_required: 0,
        max_score_required: 100,
        icon: 'book',
        color: '#3B82F6',
        banner_image: '',
        is_active: false,
        is_featured: false,
        display_order: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.learning-paths.store'));
    };

    const iconOptions = [
        { value: 'book', label: '📚 Book' },
        { value: 'rocket', label: '🚀 Rocket' },
        { value: 'star', label: '⭐ Star' },
        { value: 'fire', label: '🔥 Fire' },
        { value: 'trophy', label: '🏆 Trophy' },
        { value: 'target', label: '🎯 Target' },
        { value: 'brain', label: '🧠 Brain' },
        { value: 'computer', label: '💻 Computer' },
    ];

    const colorOptions = [
        { value: '#3B82F6', label: 'Blue', class: 'bg-blue-500' },
        { value: '#10B981', label: 'Green', class: 'bg-green-500' },
        { value: '#F59E0B', label: 'Orange', class: 'bg-orange-500' },
        { value: '#EF4444', label: 'Red', class: 'bg-red-500' },
        { value: '#8B5CF6', label: 'Purple', class: 'bg-purple-500' },
        { value: '#EC4899', label: 'Pink', class: 'bg-pink-500' },
        { value: '#06B6D4', label: 'Cyan', class: 'bg-cyan-500' },
        { value: '#6366F1', label: 'Indigo', class: 'bg-indigo-500' },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Create Learning Path" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href={route('admin.learning-paths.index')}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeftIcon className="w-4 h-4 mr-1" />
                            Back to Learning Paths
                        </Link>
                        <h2 className="text-2xl font-bold text-gray-900">Create New Learning Path</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Create a structured learning path. You can add lessons after creation.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                                
                                {/* Title */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="e.g., Python for Beginners"
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Brief description of what students will learn..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                {/* Learning Outcomes */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Learning Outcomes
                                    </label>
                                    <textarea
                                        value={data.learning_outcomes}
                                        onChange={(e) => setData('learning_outcomes', e.target.value)}
                                        rows={4}
                                        className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="What will students be able to do after completing this path?"
                                    />
                                    {errors.learning_outcomes && (
                                        <p className="mt-1 text-sm text-red-600">{errors.learning_outcomes}</p>
                                    )}
                                </div>

                                {/* Prerequisites */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prerequisites
                                    </label>
                                    <textarea
                                        value={data.prerequisites}
                                        onChange={(e) => setData('prerequisites', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="What should students know before starting?"
                                    />
                                    {errors.prerequisites && (
                                        <p className="mt-1 text-sm text-red-600">{errors.prerequisites}</p>
                                    )}
                                </div>
                            </div>

                            {/* Path Settings */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Path Settings</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Difficulty Level */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Difficulty Level <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.difficulty_level}
                                            onChange={(e) => setData('difficulty_level', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            {Object.entries(difficultyOptions).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                        {errors.difficulty_level && (
                                            <p className="mt-1 text-sm text-red-600">{errors.difficulty_level}</p>
                                        )}
                                    </div>

                                    {/* Estimated Duration */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Estimated Duration (hours)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.estimated_duration_hours}
                                            onChange={(e) => setData('estimated_duration_hours', e.target.value)}
                                            min="1"
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="e.g., 40"
                                        />
                                        {errors.estimated_duration_hours && (
                                            <p className="mt-1 text-sm text-red-600">{errors.estimated_duration_hours}</p>
                                        )}
                                    </div>

                                    {/* Min Score Required */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Min Score Required <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={data.min_score_required}
                                            onChange={(e) => setData('min_score_required', e.target.value)}
                                            min="0"
                                            max="100"
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Minimum placement test score to recommend this path
                                        </p>
                                        {errors.min_score_required && (
                                            <p className="mt-1 text-sm text-red-600">{errors.min_score_required}</p>
                                        )}
                                    </div>

                                    {/* Max Score Required */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Max Score Required <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={data.max_score_required}
                                            onChange={(e) => setData('max_score_required', e.target.value)}
                                            min="0"
                                            max="100"
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Maximum placement test score to recommend this path
                                        </p>
                                        {errors.max_score_required && (
                                            <p className="mt-1 text-sm text-red-600">{errors.max_score_required}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Appearance */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Icon */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Icon
                                        </label>
                                        <select
                                            value={data.icon}
                                            onChange={(e) => setData('icon', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            {iconOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Color */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Color Theme
                                        </label>
                                        <div className="flex gap-2 flex-wrap">
                                            {colorOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => setData('color', option.value)}
                                                    className={`w-10 h-10 rounded-lg ${option.class} ${
                                                        data.color === option.value
                                                            ? 'ring-2 ring-offset-2 ring-gray-900'
                                                            : 'hover:ring-2 hover:ring-offset-2 hover:ring-gray-400'
                                                    }`}
                                                    title={option.label}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Banner Image URL */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Banner Image URL
                                        </label>
                                        <input
                                            type="url"
                                            value={data.banner_image}
                                            onChange={(e) => setData('banner_image', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        {errors.banner_image && (
                                            <p className="mt-1 text-sm text-red-600">{errors.banner_image}</p>
                                        )}
                                    </div>

                                    {/* Display Order */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Display Order
                                        </label>
                                        <input
                                            type="number"
                                            value={data.display_order}
                                            onChange={(e) => setData('display_order', e.target.value)}
                                            min="0"
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Leave empty for auto"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Lower numbers appear first
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Toggles */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                                
                                <div className="space-y-3">
                                    {/* Is Active */}
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                                            Active (visible to students)
                                        </label>
                                    </div>

                                    {/* Is Featured */}
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_featured"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">
                                            Featured (highlight this path)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <Link
                                href={route('admin.learning-paths.index')}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </Link>
                            <button
                                onClick={handleSubmit}
                                disabled={processing}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                {processing ? 'Creating...' : 'Create Path'}
                            </button>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">
                            📌 Next Steps
                        </h4>
                        <p className="text-sm text-blue-800">
                            After creating the path, you'll be able to add lessons and configure their sequence. 
                            You can also set prerequisites and unlock conditions for each lesson.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}