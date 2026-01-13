import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CategoryBadge from '@/Pages/Student/Forum/Components/CategoryBadge';
import { ArrowLeft, Shield, AlertCircle } from 'lucide-react';

export default function Edit({ auth, post, categories }) {
    const { data, setData, put, processing, errors } = useForm({
        title: post.title || '',
        content: post.content || '',
        category: post.category || 'general',
    });

    const [charCount, setCharCount] = useState(post.content?.length || 0);
    const minChars = 10;
    const maxChars = 10000;

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('forum.update', post.post_id));
    };

    const handleContentChange = (e) => {
        const content = e.target.value;
        setData('content', content);
        setCharCount(content.length);
    };

    const categoryList = {
        announcements: { name: 'Announcements', icon: '📢', description: 'Official announcements and news' },
        general: { name: 'General', icon: '💬', description: 'General discussions' },
        help: { name: 'Help', icon: '❓', description: 'Help and support' },
        showcase: { name: 'Showcase', icon: '🎨', description: 'Share projects and work' },
        resources: { name: 'Resources', icon: '📚', description: 'Learning resources' },
        feedback: { name: 'Feedback', icon: '💡', description: 'Feedback and suggestions' },
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Admin - Edit: ${post.title}`} />

            <div className="min-h-screen py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <Link
                            href={route('forum.show', post.post_id)}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Back to Post</span>
                        </Link>
                        
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg dark:bg-red-900/30 dark:text-red-400">
                            <Shield className="w-5 h-5" />
                            <span className="font-semibold">Admin</span>
                        </div>
                    </div>

                    {/* Page Header */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden mb-6 border-l-4 border-amber-500">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-8 text-white">
                            <h1 className="text-3xl font-bold mb-2">Edit Post</h1>
                            <p className="text-amber-100">
                                Modify post content and settings
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6">
                            
                            {/* Edit Notice */}
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 dark:text-blue-400" />
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                                            Editing as Admin
                                        </p>
                                        <p className="text-sm text-blue-800 dark:text-blue-400">
                                            Your post will show as "edited". Make sure all information is accurate before updating.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Category Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Select Category <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {Object.entries(categoryList).map(([key, cat]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setData('category', key)}
                                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                                                data.category === key
                                                    ? 'border-amber-500 bg-amber-50 shadow-md dark:bg-amber-900/20 dark:border-amber-600'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-2xl">{cat.icon}</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">{cat.name}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">{cat.description}</p>
                                        </button>
                                    ))}
                                </div>
                                {errors.category && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
                                )}
                            </div>

                            {/* Title Input */}
                            <div className="mb-6">
                                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Post Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter a clear and descriptive title..."
                                    maxLength={200}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all dark:bg-slate-800 dark:text-white ${
                                        errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                                    }`}
                                    disabled={processing}
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <div>
                                        {errors.title && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {data.title.length} / 200 characters
                                    </span>
                                </div>
                            </div>

                            {/* Content Textarea */}
                            <div className="mb-6">
                                <label htmlFor="content" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Post Content <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="content"
                                    value={data.content}
                                    onChange={handleContentChange}
                                    placeholder="Write your post content here..."
                                    rows={12}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none dark:bg-slate-800 dark:text-white ${
                                        errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                                    }`}
                                    disabled={processing}
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <div>
                                        {errors.content && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.content}</p>
                                        )}
                                    </div>
                                    <span
                                        className={`text-sm font-medium ${
                                            charCount < minChars
                                                ? 'text-red-600 dark:text-red-400'
                                                : charCount > maxChars
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-green-600 dark:text-green-400'
                                        }`}
                                    >
                                        {charCount} / {maxChars} characters
                                        {charCount < minChars && ` (min ${minChars})`}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={processing || charCount < minChars || charCount > maxChars || !data.title}
                                    className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Updating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Update Post</span>
                                        </>
                                    )}
                                </button>

                                <Link
                                    href={route('forum.show', post.post_id)}
                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* Preview Section */}
                    {(data.title || data.content) && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Preview
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <CategoryBadge category={data.category} size="md" />
                                </div>
                                {data.title && (
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                        {data.title}
                                    </h3>
                                )}
                                {data.content && (
                                    <div className="prose max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {data.content}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}