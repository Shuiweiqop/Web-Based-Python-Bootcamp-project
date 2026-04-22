import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Info, Sparkles, Settings, Palette, ToggleLeft } from 'lucide-react';

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
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
                    <div>
                        <Link
                            href={route('admin.learning-paths.index')}
                            className="inline-flex items-center text-sm text-purple-400 hover:text-purple-300 mb-3 transition-colors ripple-effect"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Back to Learning Paths</span>
                            <span className="sm:hidden">Back</span>
                        </Link>
                        <h2 className="font-semibold text-2xl sm:text-3xl leading-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Create New Learning Path
                        </h2>
                        <p className="text-sm mt-2 text-slate-300">
                            Create a structured learning path. You can add lessons after creation.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Create Learning Path" />

            <div className="py-8 sm:py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {/* Basic Information Section */}
                        <div className="glassmorphism-enhanced rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-fadeIn">
                            <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b border-white/10 px-4 sm:px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                                        <p className="text-xs text-slate-300 mt-0.5">Essential details about your learning path</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 space-y-5">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                                        Title <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                                        placeholder="e.g., Python for Beginners"
                                    />
                                    {errors.title && (
                                        <p className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-bounceIn">
                                            <span className="text-red-400">⚠</span> {errors.title}
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                                        placeholder="Brief description of what students will learn..."
                                    />
                                    {errors.description && (
                                        <p className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-bounceIn">
                                            <span className="text-red-400">⚠</span> {errors.description}
                                        </p>
                                    )}
                                </div>

                                {/* Learning Outcomes */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                                        Learning Outcomes
                                    </label>
                                    <textarea
                                        value={data.learning_outcomes}
                                        onChange={(e) => setData('learning_outcomes', e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                                        placeholder="What will students be able to do after completing this path?"
                                    />
                                    {errors.learning_outcomes && (
                                        <p className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-bounceIn">
                                            <span className="text-red-400">⚠</span> {errors.learning_outcomes}
                                        </p>
                                    )}
                                </div>

                                {/* Prerequisites */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                                        Prerequisites
                                    </label>
                                    <textarea
                                        value={data.prerequisites}
                                        onChange={(e) => setData('prerequisites', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                                        placeholder="What should students know before starting?"
                                    />
                                    {errors.prerequisites && (
                                        <p className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-bounceIn">
                                            <span className="text-red-400">⚠</span> {errors.prerequisites}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Path Settings Section */}
                        <div className="glassmorphism-enhanced rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-fadeIn" style={{animationDelay: '100ms'}}>
                            <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b border-white/10 px-4 sm:px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <Settings className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Path Settings</h3>
                                        <p className="text-xs text-slate-300 mt-0.5">Configure difficulty and requirements</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {/* Difficulty Level */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-200 mb-2">
                                            Difficulty Level <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            value={data.difficulty_level}
                                            onChange={(e) => setData('difficulty_level', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                                        >
                                            {Object.entries(difficultyOptions).map(([key, label]) => (
                                                <option key={key} value={key} className="bg-slate-800">{label}</option>
                                            ))}
                                        </select>
                                        {errors.difficulty_level && (
                                            <p className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-bounceIn">
                                                <span className="text-red-400">⚠</span> {errors.difficulty_level}
                                            </p>
                                        )}
                                    </div>

                                    {/* Estimated Duration */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-200 mb-2">
                                            Estimated Duration (hours)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.estimated_duration_hours}
                                            onChange={(e) => setData('estimated_duration_hours', e.target.value)}
                                            min="1"
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                                            placeholder="e.g., 40"
                                        />
                                        {errors.estimated_duration_hours && (
                                            <p className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-bounceIn">
                                                <span className="text-red-400">⚠</span> {errors.estimated_duration_hours}
                                            </p>
                                        )}
                                    </div>

                                    {/* Min Score Required */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-200 mb-2">
                                            Min Score Required <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={data.min_score_required}
                                            onChange={(e) => setData('min_score_required', e.target.value)}
                                            min="0"
                                            max="100"
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                                        />
                                        <p className="mt-1.5 text-xs text-slate-400">
                                            Minimum placement test score
                                        </p>
                                        {errors.min_score_required && (
                                            <p className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-bounceIn">
                                                <span className="text-red-400">⚠</span> {errors.min_score_required}
                                            </p>
                                        )}
                                    </div>

                                    {/* Max Score Required */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-200 mb-2">
                                            Max Score Required <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={data.max_score_required}
                                            onChange={(e) => setData('max_score_required', e.target.value)}
                                            min="0"
                                            max="100"
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                                        />
                                        <p className="mt-1.5 text-xs text-slate-400">
                                            Maximum placement test score
                                        </p>
                                        {errors.max_score_required && (
                                            <p className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-bounceIn">
                                                <span className="text-red-400">⚠</span> {errors.max_score_required}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Appearance Section */}
                        <div className="glassmorphism-enhanced rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-fadeIn" style={{animationDelay: '200ms'}}>
                            <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b border-white/10 px-4 sm:px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <Palette className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Appearance</h3>
                                        <p className="text-xs text-slate-300 mt-0.5">Customize the visual appearance</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {/* Icon */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-200 mb-2">
                                            Icon
                                        </label>
                                        <select
                                            value={data.icon}
                                            onChange={(e) => setData('icon', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                                        >
                                            {iconOptions.map((option) => (
                                                <option key={option.value} value={option.value} className="bg-slate-800">
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Display Order */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-200 mb-2">
                                            Display Order
                                        </label>
                                        <input
                                            type="number"
                                            value={data.display_order}
                                            onChange={(e) => setData('display_order', e.target.value)}
                                            min="0"
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                                            placeholder="Leave empty for auto"
                                        />
                                        <p className="mt-1.5 text-xs text-slate-400">
                                            Lower numbers appear first
                                        </p>
                                    </div>

                                    {/* Color Theme */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-200 mb-3">
                                            Color Theme
                                        </label>
                                        <div className="flex gap-3 flex-wrap">
                                            {colorOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => setData('color', option.value)}
                                                    className={`w-12 h-12 rounded-lg ${option.class} transition-all shadow-lg ${
                                                        data.color === option.value
                                                            ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110 shadow-xl'
                                                            : 'hover:ring-2 hover:ring-offset-2 hover:ring-offset-slate-900 hover:ring-white/50 hover:scale-105'
                                                    }`}
                                                    title={option.label}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Banner Image URL */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-200 mb-2">
                                            Banner Image URL
                                        </label>
                                        <input
                                            type="url"
                                            value={data.banner_image}
                                            onChange={(e) => setData('banner_image', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        {errors.banner_image && (
                                            <p className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-bounceIn">
                                                <span className="text-red-400">⚠</span> {errors.banner_image}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Section */}
                        <div className="glassmorphism-enhanced rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-fadeIn" style={{animationDelay: '300ms'}}>
                            <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b border-white/10 px-4 sm:px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <ToggleLeft className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Status</h3>
                                        <p className="text-xs text-slate-300 mt-0.5">Control visibility and prominence</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 space-y-4">
                                {/* Is Active */}
                                <label className="flex items-start p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 cursor-pointer transition-all group">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="mt-0.5 rounded border-purple-400/50 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer transition-all"
                                    />
                                    <div className="ml-3">
                                        <span className="block text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                                            Active Status
                                        </span>
                                        <span className="block text-xs text-slate-400 mt-1">
                                            Make this path visible and accessible to students
                                        </span>
                                    </div>
                                </label>

                                {/* Is Featured */}
                                <label className="flex items-start p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 cursor-pointer transition-all group">
                                    <input
                                        type="checkbox"
                                        checked={data.is_featured}
                                        onChange={(e) => setData('is_featured', e.target.checked)}
                                        className="mt-0.5 rounded border-purple-400/50 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer transition-all"
                                    />
                                    <div className="ml-3">
                                        <span className="block text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                                            Featured Path
                                        </span>
                                        <span className="block text-xs text-slate-400 mt-1">
                                            Highlight this path on the homepage and catalog
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="glassmorphism-enhanced rounded-xl shadow-2xl border border-white/10 p-4 sm:p-6 flex flex-col-reverse sm:flex-row justify-end gap-3 animate-fadeIn" style={{animationDelay: '400ms'}}>
                            <Link
                                href={route('admin.learning-paths.index')}
                                className="px-6 py-3 bg-white/5 border border-white/20 text-slate-200 font-semibold rounded-lg hover:bg-white/10 hover:border-white/30 transition-all text-center ripple-effect"
                            >
                                Cancel
                            </Link>
                            <button
                                onClick={handleSubmit}
                                disabled={processing}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 ripple-effect button-press-effect"
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creating...
                                    </span>
                                ) : (
                                    'Create Learning Path'
                                )}
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="glassmorphism-enhanced rounded-xl shadow-2xl border border-cyan-500/30 p-4 sm:p-6 animate-fadeIn" style={{animationDelay: '500ms'}}>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                                    <Info className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-cyan-300 mb-2">
                                        Next Steps
                                    </h4>
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        After creating the path, you'll be able to add lessons and configure their sequence. 
                                        You can also set prerequisites and unlock conditions for each lesson.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}