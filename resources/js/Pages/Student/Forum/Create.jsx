import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';
import CategoryBadge from './Components/CategoryBadge';
import { 
    ArrowLeft, 
    Send, 
    Loader2, 
    Info, 
    AlertTriangle, 
    Eye,
    Sparkles,
    MessageSquare,
    HelpCircle,
    Palette,
    BookOpen,
    Megaphone,
    Lightbulb
} from 'lucide-react';
import { useSFX } from '@/Contexts/SFXContext';

// ✅ 内部组件 - 在 Provider 内部，可以使用 hooks
function CreatePostForm({ auth, categories }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
        category: 'general',
    });

    const [charCount, setCharCount] = useState(0);
    const minChars = 10;
    const maxChars = 10000;

    // ✅ 现在可以安全使用 useSFX
    const { playSFX } = useSFX();

    const handleSubmit = (e) => {
        e.preventDefault();
        playSFX('success');
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
        general: { 
            name: 'General', 
            icon: '💬', 
            description: 'General discussions and conversations',
            IconComponent: MessageSquare,
            gradient: 'from-blue-500 to-cyan-500'
        },
        help: { 
            name: 'Help', 
            icon: '❓', 
            description: 'Ask for help or assistance',
            IconComponent: HelpCircle,
            gradient: 'from-green-500 to-emerald-500'
        },
        showcase: { 
            name: 'Showcase', 
            icon: '🎨', 
            description: 'Share your projects and achievements',
            IconComponent: Palette,
            gradient: 'from-purple-500 to-pink-500'
        },
        resources: { 
            name: 'Resources', 
            icon: '📚', 
            description: 'Share useful resources and materials',
            IconComponent: BookOpen,
            gradient: 'from-orange-500 to-red-500'
        },
        announcements: { 
            name: 'Announcements', 
            icon: '📢', 
            description: 'Important announcements',
            IconComponent: Megaphone,
            gradient: 'from-yellow-500 to-orange-500'
        },
        feedback: { 
            name: 'Feedback', 
            icon: '💡', 
            description: 'Provide feedback and suggestions',
            IconComponent: Lightbulb,
            gradient: 'from-cyan-500 to-blue-500'
        },
    };

    return (
        <>
            <Head title="Create New Post" />

            <div className="min-h-screen py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Back Button */}
                    <Link
                        href={route('forum.index')}
                        onMouseEnter={() => playSFX('hover')}
                        onClick={() => playSFX('nav')}
                        className="
                            inline-flex items-center gap-2 
                            text-gray-300 hover:text-white 
                            mb-6 transition-all duration-200
                            font-bold
                            group
                            ripple-effect
                        "
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Forum</span>
                    </Link>

                    {/* Page Header */}
                    <div className="
                        bg-black/40 backdrop-blur-xl 
                        border border-white/10 
                        rounded-2xl shadow-2xl 
                        overflow-hidden mb-6
                        animate-bounceIn
                    ">
                        <div className="
                            bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 
                            px-6 py-8 
                            relative overflow-hidden
                            animate-rainbowGradient
                        ">
                            <div className="relative">
                                <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-2xl flex items-center gap-3">
                                    <Sparkles className="w-8 h-8 animate-pulse animate-float" />
                                    Create New Post
                                </h1>
                                <p className="text-white/90 text-lg drop-shadow-lg">
                                    Share your thoughts, ask questions, or start a discussion with the community
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="p-6">
                            
                            {/* Category Selection */}
                            <div className="mb-6 animate-slideDown">
                                <label className="block text-sm font-bold text-white mb-4 drop-shadow-lg">
                                    Select Category <span className="text-red-400">*</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {Object.entries(categoryList).map(([key, cat]) => {
                                        const Icon = cat.IconComponent;
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => {
                                                    playSFX('click');
                                                    setData('category', key);
                                                }}
                                                onMouseEnter={() => playSFX('hover')}
                                                className={`
                                                    p-4 rounded-xl
                                                    transition-all duration-200 text-left
                                                    group relative overflow-hidden
                                                    ripple-effect button-press-effect
                                                    ${data.category === key
                                                        ? `bg-gradient-to-r ${cat.gradient} text-white shadow-xl ring-2 ring-white/30 scale-105 animate-glowPulse`
                                                        : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:scale-105'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Icon className={`w-6 h-6 ${data.category === key ? 'drop-shadow-lg animate-pulse-slow' : ''}`} />
                                                    <span className="font-bold">{cat.name}</span>
                                                </div>
                                                <p className={`text-xs ${data.category === key ? 'text-white/90' : 'text-gray-400'}`}>
                                                    {cat.description}
                                                </p>
                                                
                                                {/* Shimmer Effect */}
                                                {data.category === key && (
                                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.category && (
                                    <p className="mt-2 text-sm text-red-400 flex items-center gap-2 animate-shake">
                                        <AlertTriangle className="w-4 h-4" />
                                        {errors.category}
                                    </p>
                                )}
                            </div>

                            {/* Title Input */}
                            <div className="mb-6 animate-slideDown" style={{ animationDelay: '100ms' }}>
                                <label htmlFor="title" className="block text-sm font-bold text-white mb-2 drop-shadow-lg">
                                    Post Title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    onFocus={() => playSFX('hover')}
                                    placeholder="Enter a clear and descriptive title..."
                                    maxLength={200}
                                    className={`
                                        w-full px-4 py-3 
                                        bg-black/30 backdrop-blur-sm
                                        border rounded-xl 
                                        text-white placeholder-gray-400
                                        focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                                        focus:bg-black/40
                                        transition-all duration-200
                                        shadow-lg
                                        disabled:opacity-50
                                        ripple-effect
                                        ${errors.title ? 'border-red-500/50 ring-2 ring-red-500/30 animate-shake' : 'border-white/20'}
                                    `}
                                    disabled={processing}
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <div>
                                        {errors.title && (
                                            <p className="text-sm text-red-400 flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4" />
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {data.title.length} / 200 characters
                                    </span>
                                </div>
                            </div>

                            {/* Content Textarea */}
                            <div className="mb-6 animate-slideDown" style={{ animationDelay: '200ms' }}>
                                <label htmlFor="content" className="block text-sm font-bold text-white mb-2 drop-shadow-lg">
                                    Post Content <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    id="content"
                                    value={data.content}
                                    onChange={handleContentChange}
                                    onFocus={() => playSFX('hover')}
                                    placeholder="Write your post content here... Be clear, respectful, and constructive."
                                    rows={12}
                                    className={`
                                        w-full px-4 py-3 
                                        bg-black/30 backdrop-blur-sm
                                        border rounded-xl 
                                        text-white placeholder-gray-400
                                        focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                                        focus:bg-black/40
                                        transition-all duration-200
                                        shadow-lg
                                        resize-none
                                        disabled:opacity-50
                                        custom-scrollbar
                                        ${errors.content ? 'border-red-500/50 ring-2 ring-red-500/30 animate-shake' : 'border-white/20'}
                                    `}
                                    disabled={processing}
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <div>
                                        {errors.content && (
                                            <p className="text-sm text-red-400 flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4" />
                                                {errors.content}
                                            </p>
                                        )}
                                    </div>
                                    <span
                                        className={`text-sm font-bold animate-countUp ${
                                            charCount < minChars
                                                ? 'text-red-400'
                                                : charCount > maxChars
                                                ? 'text-red-400'
                                                : 'text-green-400'
                                        }`}
                                    >
                                        {charCount} / {maxChars} characters
                                        {charCount < minChars && ` (min ${minChars})`}
                                    </span>
                                </div>
                            </div>

                            {/* Formatting Tips */}
                            <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl backdrop-blur-sm animate-fadeIn">
                                <h3 className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2">
                                    <Info className="w-5 h-5 animate-pulse-slow" />
                                    Formatting Tips
                                </h3>
                                <ul className="text-sm text-blue-200 space-y-1.5">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-400 mt-0.5">•</span>
                                        <span>Use clear and concise language</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-400 mt-0.5">•</span>
                                        <span>Break long content into paragraphs for readability</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-400 mt-0.5">•</span>
                                        <span>Be respectful and constructive in your posts</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-400 mt-0.5">•</span>
                                        <span>Include relevant details to help others understand your topic</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-400 mt-0.5">•</span>
                                        <span>Use proper grammar and spelling</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Community Guidelines */}
                            <div className="mb-6 p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl backdrop-blur-sm animate-fadeIn">
                                <h3 className="text-sm font-bold text-amber-300 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 animate-pulse-slow" />
                                    Community Guidelines
                                </h3>
                                <p className="text-sm text-amber-200">
                                    Please ensure your post follows our community guidelines. Posts containing spam, harassment, 
                                    or inappropriate content will be removed.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    onMouseEnter={() => playSFX('hover')}
                                    disabled={processing || charCount < minChars || charCount > maxChars || !data.title}
                                    className="
                                        flex items-center gap-3 
                                        px-8 py-4 
                                        bg-gradient-to-r from-blue-500 to-purple-600 
                                        hover:from-blue-600 hover:to-purple-700 
                                        text-white font-bold text-lg
                                        rounded-xl 
                                        shadow-2xl shadow-blue-500/50
                                        hover:shadow-blue-500/70
                                        transition-all duration-300
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        disabled:hover:scale-100
                                        ring-2 ring-blue-400/50 hover:ring-blue-400/70
                                        ripple-effect button-press-effect hover-lift
                                        animate-glowPulse
                                    "
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Creating Post...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            <span>Create Post</span>
                                        </>
                                    )}
                                </button>

                                <Link
                                    href={route('forum.index')}
                                    onMouseEnter={() => playSFX('hover')}
                                    onClick={() => playSFX('click')}
                                    className="
                                        px-8 py-4 
                                        bg-white/10 hover:bg-white/20 
                                        border border-white/20 hover:border-white/30
                                        text-white font-bold text-lg
                                        rounded-xl 
                                        transition-all duration-200
                                        ripple-effect button-press-effect hover-lift
                                    "
                                >
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Preview Section */}
                    {(data.title || data.content) && (
                        <div className="
                            bg-black/40 backdrop-blur-xl 
                            border border-white/10 
                            rounded-2xl shadow-2xl 
                            overflow-hidden
                            animate-slideDown
                        ">
                            <div className="
                                bg-gradient-to-r from-gray-800 to-gray-900 
                                px-6 py-4 
                                border-b border-white/10
                            ">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3 drop-shadow-lg">
                                    <Eye className="w-6 h-6 text-purple-400 animate-pulse-slow" />
                                    Preview
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="mb-4 animate-bounceIn">
                                    <CategoryBadge category={data.category} size="md" />
                                </div>
                                {data.title && (
                                    <h3 className="
                                        text-3xl font-bold text-white mb-4 
                                        drop-shadow-lg
                                        bg-gradient-to-r from-blue-400 to-purple-400 
                                        bg-clip-text text-transparent
                                        animate-fadeIn
                                    ">
                                        {data.title}
                                    </h3>
                                )}
                                {data.content && (
                                    <div className="prose max-w-none text-gray-300 whitespace-pre-wrap leading-relaxed animate-fadeIn">
                                        {data.content}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// ✅ 外部组件 - 只负责包裹 Layout
export default function Create(props) {
    return (
        <StudentLayout user={props.auth.user}>
            <CreatePostForm {...props} />
        </StudentLayout>
    );
}