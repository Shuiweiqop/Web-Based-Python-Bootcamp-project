import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import PostCard from './Components/PostCard';
import Pagination from '@/Components/Pagination';
import { 
    ArrowLeft, 
    FileText, 
    Heart, 
    MessageCircle, 
    Eye, 
    PenSquare,
    Bookmark,
    Lightbulb,
    Sparkles,
    TrendingUp
} from 'lucide-react';
import { useSFX } from '@/Contexts/SFXContext';

// ✅ 内部组件 - 在 Provider 内部，可以使用 hooks
function MyPostsContent({ auth, posts }) {
    const { playSFX } = useSFX();

    const totalLikes = posts.data.reduce((sum, post) => sum + (post.likes || 0), 0);
    const totalReplies = posts.data.reduce((sum, post) => sum + (post.replies_count || 0), 0);
    const totalViews = posts.data.reduce((sum, post) => sum + (post.views || 0), 0);

    return (
        <>
            <Head title="My Posts - Forum" />

            <div className="min-h-screen py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    
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
                        overflow-hidden mb-8
                        animate-bounceIn
                    ">
                        <div className="
                            bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 
                            px-6 py-8 
                            relative overflow-hidden
                            animate-rainbowGradient
                        ">
                            <div className="flex items-center justify-between">
                                <div className="relative z-10">
                                    <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-2xl flex items-center gap-3">
                                        <FileText className="w-8 h-8 animate-pulse animate-float" />
                                        My Posts
                                    </h1>
                                    <p className="text-white/90 text-lg drop-shadow-lg">
                                        Manage and view all your forum contributions
                                    </p>
                                </div>
                                <div className="hidden md:block relative z-10">
                                    <div className="
                                        bg-white/20 backdrop-blur-sm 
                                        rounded-2xl px-6 py-4 
                                        border border-white/30
                                        shadow-2xl
                                        animate-glowPulse
                                    ">
                                        <div className="text-5xl font-bold text-white drop-shadow-lg animate-countUp">
                                            {posts.total}
                                        </div>
                                        <div className="text-sm text-white/90 font-medium drop-shadow-lg">
                                            Total Posts
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gradient-to-br from-black/30 to-black/50">
                            {/* Total Posts */}
                            <div 
                                className="
                                    bg-gradient-to-br from-blue-500/20 to-cyan-500/20 
                                    backdrop-blur-sm border border-blue-500/30 
                                    rounded-xl p-4 shadow-xl 
                                    hover:scale-105 transition-all duration-300
                                    group cursor-pointer
                                    ripple-effect hover-lift
                                    animate-fadeIn
                                "
                                onMouseEnter={() => playSFX('hover')}
                                style={{ animationDelay: '0ms' }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="
                                        p-3 bg-blue-500/30 rounded-xl 
                                        group-hover:scale-110 group-hover:rotate-6 
                                        transition-all duration-300
                                        shadow-lg
                                    ">
                                        <FileText className="w-6 h-6 text-blue-300 drop-shadow-lg" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white drop-shadow-lg animate-countUp">
                                    {posts.total}
                                </div>
                                <div className="text-sm text-blue-200 font-medium mt-1">
                                    Total Posts
                                </div>
                            </div>
                            
                            {/* Total Likes */}
                            <div 
                                className="
                                    bg-gradient-to-br from-red-500/20 to-pink-500/20 
                                    backdrop-blur-sm border border-red-500/30 
                                    rounded-xl p-4 shadow-xl 
                                    hover:scale-105 transition-all duration-300
                                    group cursor-pointer
                                    ripple-effect hover-lift
                                    animate-fadeIn
                                "
                                onMouseEnter={() => playSFX('hover')}
                                style={{ animationDelay: '100ms' }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="
                                        p-3 bg-red-500/30 rounded-xl 
                                        group-hover:scale-110 group-hover:rotate-6 
                                        transition-all duration-300
                                        shadow-lg
                                    ">
                                        <Heart className="w-6 h-6 text-red-300 drop-shadow-lg animate-pulse-slow" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white drop-shadow-lg animate-countUp">
                                    {totalLikes}
                                </div>
                                <div className="text-sm text-red-200 font-medium mt-1">
                                    Total Likes
                                </div>
                            </div>
                            
                            {/* Total Replies */}
                            <div 
                                className="
                                    bg-gradient-to-br from-green-500/20 to-emerald-500/20 
                                    backdrop-blur-sm border border-green-500/30 
                                    rounded-xl p-4 shadow-xl 
                                    hover:scale-105 transition-all duration-300
                                    group cursor-pointer
                                    ripple-effect hover-lift
                                    animate-fadeIn
                                "
                                onMouseEnter={() => playSFX('hover')}
                                style={{ animationDelay: '200ms' }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="
                                        p-3 bg-green-500/30 rounded-xl 
                                        group-hover:scale-110 group-hover:rotate-6 
                                        transition-all duration-300
                                        shadow-lg
                                    ">
                                        <MessageCircle className="w-6 h-6 text-green-300 drop-shadow-lg" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white drop-shadow-lg animate-countUp">
                                    {totalReplies}
                                </div>
                                <div className="text-sm text-green-200 font-medium mt-1">
                                    Total Replies
                                </div>
                            </div>
                            
                            {/* Total Views */}
                            <div 
                                className="
                                    bg-gradient-to-br from-purple-500/20 to-pink-500/20 
                                    backdrop-blur-sm border border-purple-500/30 
                                    rounded-xl p-4 shadow-xl 
                                    hover:scale-105 transition-all duration-300
                                    group cursor-pointer
                                    ripple-effect hover-lift
                                    animate-fadeIn
                                "
                                onMouseEnter={() => playSFX('hover')}
                                style={{ animationDelay: '300ms' }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="
                                        p-3 bg-purple-500/30 rounded-xl 
                                        group-hover:scale-110 group-hover:rotate-6 
                                        transition-all duration-300
                                        shadow-lg
                                    ">
                                        <Eye className="w-6 h-6 text-purple-300 drop-shadow-lg" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white drop-shadow-lg animate-countUp">
                                    {totalViews}
                                </div>
                                <div className="text-sm text-purple-200 font-medium mt-1">
                                    Total Views
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-slideDown">
                        <Link
                            href={route('forum.create')}
                            onMouseEnter={() => playSFX('hover')}
                            onClick={() => playSFX('success')}
                            className="
                                inline-flex items-center justify-center gap-3 
                                px-8 py-4 
                                bg-gradient-to-r from-blue-500 to-purple-600 
                                hover:from-blue-600 hover:to-purple-700 
                                text-white font-bold text-lg
                                rounded-xl 
                                shadow-2xl shadow-blue-500/50 
                                hover:shadow-blue-500/70
                                transition-all duration-300
                                ring-2 ring-blue-400/50 hover:ring-blue-400/70
                                ripple-effect button-press-effect hover-lift
                                animate-glowPulse
                            "
                        >
                            <PenSquare className="w-6 h-6 animate-pulse-slow" />
                            <span>Create New Post</span>
                        </Link>

                        <Link
                            href={route('forum.my-favorites')}
                            onMouseEnter={() => playSFX('hover')}
                            onClick={() => playSFX('click')}
                            className="
                                inline-flex items-center justify-center gap-3 
                                px-8 py-4 
                                bg-white/10 hover:bg-white/20 
                                border border-white/20 hover:border-white/30
                                text-white font-bold text-lg
                                rounded-xl 
                                backdrop-blur-sm
                                shadow-xl
                                transition-all duration-300
                                ripple-effect button-press-effect hover-lift
                            "
                        >
                            <Bookmark className="w-6 h-6 text-yellow-400 animate-pulse-slow" />
                            <span>My Favorites</span>
                        </Link>
                    </div>

                    {/* Posts List */}
                    {posts.data.length > 0 ? (
                        <>
                            <div className="space-y-4">
                                {posts.data.map((post, index) => (
                                    <div 
                                        key={post.post_id}
                                        className="animate-fadeIn"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                        onMouseEnter={() => playSFX('hover')}
                                    >
                                        <PostCard 
                                            post={post} 
                                            currentUserId={auth.user.user_Id}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {posts.last_page > 1 && (
                                <div className="mt-8 animate-slideDown">
                                    <Pagination 
                                        links={posts.links}
                                        currentPage={posts.current_page}
                                        lastPage={posts.last_page}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="
                            bg-black/40 backdrop-blur-xl 
                            border border-white/10 
                            rounded-2xl shadow-2xl 
                            p-16 text-center
                            animate-bounceIn
                        ">
                            <div className="
                                w-32 h-32 mx-auto mb-6 
                                bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                                rounded-full 
                                flex items-center justify-center
                                border border-blue-500/30
                                shadow-2xl
                                animate-float
                            ">
                                <FileText className="w-16 h-16 text-blue-400 drop-shadow-2xl animate-pulse-slow" />
                            </div>
                            <h3 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
                                No posts yet
                            </h3>
                            <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
                                You haven't created any posts yet. Start sharing your thoughts, questions, or projects with the community!
                            </p>
                            <Link
                                href={route('forum.create')}
                                onMouseEnter={() => playSFX('hover')}
                                onClick={() => playSFX('success')}
                                className="
                                    inline-flex items-center gap-3 
                                    px-8 py-4 
                                    bg-gradient-to-r from-blue-500 to-purple-600 
                                    hover:from-blue-600 hover:to-purple-700 
                                    text-white font-bold text-lg
                                    rounded-xl 
                                    shadow-2xl shadow-blue-500/50
                                    hover:shadow-blue-500/70
                                    transition-all duration-300
                                    ring-2 ring-blue-400/50 hover:ring-blue-400/70
                                    ripple-effect button-press-effect hover-lift
                                    animate-glowPulse
                                "
                            >
                                <Sparkles className="w-6 h-6 animate-spin-slow" />
                                <span>Create Your First Post</span>
                            </Link>
                        </div>
                    )}

                    {/* Tips Section */}
                    {posts.data.length > 0 && (
                        <div className="
                            mt-8 
                            bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 
                            backdrop-blur-xl border border-blue-500/30 
                            rounded-2xl p-6 
                            shadow-2xl
                            animate-slideDown
                        ">
                            <div className="flex items-start gap-4">
                                <div className="
                                    p-4 
                                    bg-gradient-to-br from-blue-500 to-purple-600 
                                    rounded-2xl 
                                    shadow-2xl shadow-blue-500/50
                                    animate-float
                                ">
                                    <Lightbulb className="w-8 h-8 text-white drop-shadow-lg animate-pulse-slow" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-xl mb-3 drop-shadow-lg flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-green-400 animate-pulse-slow" />
                                        Tips for Great Posts
                                    </h4>
                                    <ul className="text-sm text-gray-200 space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-400 mt-1">•</span>
                                            <span>Use clear and descriptive titles to attract readers</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-400 mt-1">•</span>
                                            <span>Add relevant category tags for better discoverability</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-pink-400 mt-1">•</span>
                                            <span>Engage with replies to build community connections</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-400 mt-1">•</span>
                                            <span>Mark helpful replies as solutions for Q&A posts</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// ✅ 外部组件 - 只负责包裹 Layout
export default function MyPosts(props) {
    return (
        <StudentLayout user={props.auth.user}>
            <MyPostsContent {...props} />
        </StudentLayout>
    );
}