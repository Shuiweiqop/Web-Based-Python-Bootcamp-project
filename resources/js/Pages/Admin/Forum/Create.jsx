import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CategoryBadge from '@/Pages/Student/Forum/Components/CategoryBadge';
import { 
    ArrowLeft, Shield, AlertCircle, Send, X, Eye,
    Megaphone, MessageCircle, HelpCircle, Sparkles,
    BookOpen, Lightbulb
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Create({ auth, categories }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
        category: 'announcements',
    });

    const [charCount, setCharCount] = useState(0);
    const minChars = 10;
    const maxChars = 10000;

    // 从 localStorage 读取主题
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            return saved ? saved === 'dark' : true;
        }
        return true;
    });

    // 监听主题变化（优化版）
    useEffect(() => {
        const handleThemeChange = () => {
            const saved = localStorage.getItem('theme');
            setIsDark(saved === 'dark');
        };

        window.addEventListener('theme-changed', handleThemeChange);
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme') {
                setIsDark(e.newValue === 'dark');
            }
        });

        return () => {
            window.removeEventListener('theme-changed', handleThemeChange);
            window.removeEventListener('storage', handleThemeChange);
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('forum.store'), {
            onSuccess: () => reset(),
        });
    };

    const handleContentChange = (e) => {
        const content = e.target.value;
        setData('content', content);
        setCharCount(content.length);
    };

    const categoryList = {
        announcements: { 
            name: 'Announcements', 
            icon: <Megaphone className="w-5 h-5" />, 
            description: 'Official announcements and news',
            color: isDark ? 'from-red-500/20 to-orange-500/20 border-red-500/30' : 'from-red-50 to-orange-50 border-red-200'
        },
        general: { 
            name: 'General', 
            icon: <MessageCircle className="w-5 h-5" />, 
            description: 'General discussions',
            color: isDark ? 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' : 'from-blue-50 to-cyan-50 border-blue-200'
        },
        help: { 
            name: 'Help', 
            icon: <HelpCircle className="w-5 h-5" />, 
            description: 'Help and support',
            color: isDark ? 'from-green-500/20 to-emerald-500/20 border-green-500/30' : 'from-green-50 to-emerald-50 border-green-200'
        },
        showcase: { 
            name: 'Showcase', 
            icon: <Sparkles className="w-5 h-5" />, 
            description: 'Share projects and work',
            color: isDark ? 'from-purple-500/20 to-pink-500/20 border-purple-500/30' : 'from-purple-50 to-pink-50 border-purple-200'
        },
        resources: { 
            name: 'Resources', 
            icon: <BookOpen className="w-5 h-5" />, 
            description: 'Learning resources',
            color: isDark ? 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30' : 'from-indigo-50 to-blue-50 border-indigo-200'
        },
        feedback: { 
            name: 'Feedback', 
            icon: <Lightbulb className="w-5 h-5" />, 
            description: 'Feedback and suggestions',
            color: isDark ? 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30' : 'from-yellow-50 to-amber-50 border-yellow-200'
        },
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <Link
                            href={route('forum.index')}
                            className={cn(
                                "inline-flex items-center gap-2 mb-3 transition-all text-sm",
                                isDark ? "text-slate-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Forum
                        </Link>
                        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                            <Shield className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
                            Create New Post
                        </h2>
                        <p className="mt-2 text-xs md:text-sm opacity-90">
                            Create announcements, discussions, or moderate content
                        </p>
                    </div>
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border",
                        isDark ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-red-100 text-red-700 border-red-200"
                    )}>
                        <Shield className="w-5 h-5" />
                        Admin
                    </div>
                </div>
            }
        >
            <Head title="Admin - Create Post" />

            <div className={cn(
                "min-h-screen transition-colors duration-500",
                isDark ? "bg-slate-950" : "bg-gradient-to-br from-blue-50 via-purple-50 to-slate-50"
            )}>
                {/* Animated Background */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    {isDark ? (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
                            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
                        </>
                    ) : (
                        <>
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
                            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
                        </>
                    )}
                </div>

                <div className="py-8 md:py-12">
                    <div className="max-w-5xl mx-auto px-4 md:px-6">
                        
                        {/* Main Form Card */}
                        <div className={cn(
                            "rounded-2xl shadow-lg border backdrop-blur-sm overflow-hidden mb-6 animate-fadeIn",
                            isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                        )}>
                            <form onSubmit={handleSubmit} className="p-4 md:p-6">
                                
                                {/* Admin Notice */}
                                <div className={cn(
                                    "mb-6 p-4 rounded-xl border",
                                    isDark ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200"
                                )}>
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className={cn(
                                            "w-5 h-5 mt-0.5 flex-shrink-0",
                                            isDark ? "text-amber-400" : "text-amber-600"
                                        )} />
                                        <div>
                                            <p className={cn(
                                                "text-sm font-bold mb-1",
                                                isDark ? "text-amber-300" : "text-amber-900"
                                            )}>
                                                Admin Posting
                                            </p>
                                            <p className={cn(
                                                "text-sm",
                                                isDark ? "text-amber-400" : "text-amber-800"
                                            )}>
                                                Posts created as admin will have elevated visibility and authority. Use announcements for official communications.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Category Selection */}
                                <div className="mb-6">
                                    <label className={cn(
                                        "block text-sm font-bold mb-3",
                                        isDark ? "text-slate-300" : "text-gray-700"
                                    )}>
                                        Select Category <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {Object.entries(categoryList).map(([key, cat]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setData('category', key)}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 transition-all text-left bg-gradient-to-br",
                                                    data.category === key
                                                        ? cat.color + ' shadow-lg scale-105'
                                                        : isDark
                                                            ? 'border-white/10 hover:border-white/20 hover:bg-slate-800'
                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                )}
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={cn(
                                                        "p-2 rounded-lg",
                                                        data.category === key
                                                            ? isDark ? "bg-white/10" : "bg-white/50"
                                                            : isDark ? "bg-slate-800" : "bg-gray-100"
                                                    )}>
                                                        {cat.icon}
                                                    </div>
                                                    <span className={cn(
                                                        "font-bold",
                                                        isDark ? "text-white" : "text-gray-900"
                                                    )}>
                                                        {cat.name}
                                                    </span>
                                                </div>
                                                <p className={cn(
                                                    "text-xs",
                                                    isDark ? "text-slate-400" : "text-gray-600"
                                                )}>
                                                    {cat.description}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                    {errors.category && (
                                        <p className={cn("mt-2 text-sm", isDark ? "text-red-400" : "text-red-600")}>
                                            {errors.category}
                                        </p>
                                    )}
                                </div>

                                {/* Title Input */}
                                <div className="mb-6">
                                    <label htmlFor="title" className={cn(
                                        "block text-sm font-bold mb-2",
                                        isDark ? "text-slate-300" : "text-gray-700"
                                    )}>
                                        Post Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Enter a clear and descriptive title..."
                                        maxLength={200}
                                        className={cn(
                                            "w-full px-4 py-3 rounded-xl transition-all outline-none border-2",
                                            errors.title
                                                ? "border-red-500"
                                                : isDark
                                                    ? "bg-slate-800 border-white/10 text-white placeholder:text-slate-500 focus:border-red-500/50"
                                                    : "bg-white border-gray-300 text-gray-900 focus:border-red-500"
                                        )}
                                        disabled={processing}
                                    />
                                    <div className="flex items-center justify-between mt-2">
                                        <div>
                                            {errors.title && (
                                                <p className={cn("text-sm", isDark ? "text-red-400" : "text-red-600")}>
                                                    {errors.title}
                                                </p>
                                            )}
                                        </div>
                                        <span className={cn("text-xs", isDark ? "text-slate-500" : "text-gray-500")}>
                                            {data.title.length} / 200
                                        </span>
                                    </div>
                                </div>

                                {/* Content Textarea */}
                                <div className="mb-6">
                                    <label htmlFor="content" className={cn(
                                        "block text-sm font-bold mb-2",
                                        isDark ? "text-slate-300" : "text-gray-700"
                                    )}>
                                        Post Content <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="content"
                                        value={data.content}
                                        onChange={handleContentChange}
                                        placeholder="Write your post content here..."
                                        rows={12}
                                        className={cn(
                                            "w-full px-4 py-3 rounded-xl transition-all outline-none resize-none border-2",
                                            errors.content
                                                ? "border-red-500"
                                                : isDark
                                                    ? "bg-slate-800 border-white/10 text-white placeholder:text-slate-500 focus:border-red-500/50"
                                                    : "bg-white border-gray-300 text-gray-900 focus:border-red-500"
                                        )}
                                        disabled={processing}
                                    />
                                    <div className="flex items-center justify-between mt-2">
                                        <div>
                                            {errors.content && (
                                                <p className={cn("text-sm", isDark ? "text-red-400" : "text-red-600")}>
                                                    {errors.content}
                                                </p>
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-sm font-semibold",
                                            charCount < minChars
                                                ? isDark ? "text-red-400" : "text-red-600"
                                                : charCount > maxChars
                                                    ? isDark ? "text-red-400" : "text-red-600"
                                                    : isDark ? "text-green-400" : "text-green-600"
                                        )}>
                                            {charCount} / {maxChars}
                                            {charCount < minChars && ` (min ${minChars})`}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <button
                                        type="submit"
                                        disabled={processing || charCount < minChars || charCount > maxChars || !data.title}
                                        className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Create Post
                                            </>
                                        )}
                                    </button>

                                    <Link
                                        href={route('forum.index')}
                                        className={cn(
                                            "flex-1 sm:flex-none px-6 py-3 font-bold rounded-xl transition-all border-2 flex items-center justify-center gap-2",
                                            isDark 
                                                ? "bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700" 
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        )}
                                    >
                                        <X className="w-5 h-5" />
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </div>

                        {/* Preview Section */}
                        {(data.title || data.content) && (
                            <div className={cn(
                                "rounded-2xl shadow-lg border backdrop-blur-sm overflow-hidden animate-fadeIn",
                                isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                            )}>
                                <div className={cn(
                                    "px-6 py-4 border-b",
                                    isDark ? "bg-slate-800/50 border-white/10" : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
                                )}>
                                    <h2 className={cn(
                                        "text-xl font-bold flex items-center gap-2",
                                        isDark ? "text-white" : "text-gray-900"
                                    )}>
                                        <Eye className="w-5 h-5" />
                                        Preview
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="mb-4">
                                        <CategoryBadge category={data.category} size="md" />
                                    </div>
                                    {data.title && (
                                        <h3 className={cn(
                                            "text-2xl font-bold mb-4",
                                            isDark ? "text-white" : "text-gray-900"
                                        )}>
                                            {data.title}
                                        </h3>
                                    )}
                                    {data.content && (
                                        <div className={cn(
                                            "prose max-w-none whitespace-pre-wrap",
                                            isDark ? "text-slate-300" : "text-gray-700"
                                        )}>
                                            {data.content}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}