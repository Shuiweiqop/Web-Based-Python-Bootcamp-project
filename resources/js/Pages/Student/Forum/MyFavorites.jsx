import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';
import CategoryBadge from './Components/CategoryBadge';
import Pagination from '@/Components/Pagination';
import { 
    ArrowLeft, 
    Bookmark, 
    Heart, 
    MessageCircle, 
    Eye,
    Search,
    PenSquare,
    FileText,
    Sparkles,
    Star,
    Info,
    Lock,
    Pin
} from 'lucide-react';
import { useSFX } from '@/Contexts/SFXContext';

// ✅ 自定义时间格式化函数
function timeAgo(date) {
    if (!date) return '';
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    return past.toLocaleDateString();
}

// ✅ 内部组件 - 在 Provider 内部，可以使用 hooks
function MyFavoritesContent({ auth, favorites }) {
    const { playSFX } = useSFX();
    const [removingId, setRemovingId] = useState(null);

    // ✅ 辅助函数：获取作者信息
    const getAuthorInfo = (post) => {
        if (post.author) {
            return post.author;
        }
        
        if (post.user) {
            let avatar = post.user.profile_picture;
            
            const studentProfile = post.user.student_profile;
            if (studentProfile?.reward_inventory) {
                const equippedAvatarFrame = studentProfile.reward_inventory.find(
                    item => item.is_equipped && item.reward?.reward_type === 'avatar_frame'
                );
                
                if (equippedAvatarFrame?.reward?.image_url) {
                    avatar = equippedAvatarFrame.reward.image_url;
                }
            }
            
            if (!avatar) {
                avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.user.name)}&backgroundColor=3B82F6`;
            }
            
            return {
                name: post.user.name,
                avatar: avatar,
                is_admin: post.user.role === 'administrator',
                is_student: post.user.role === 'student',
            };
        }
        
        return {
            name: 'Unknown User',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=unknown&backgroundColor=3B82F6',
            is_admin: false,
            is_student: false,
        };
    };

    const handleUnfavorite = async (postId) => {
        if (removingId) return;
        
        if (!confirm('Remove this post from your favorites?')) return;
        
        playSFX('error');
        setRemovingId(postId);
        
        try {
            router.post(route('forum.favorite', postId), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    playSFX('success');
                    router.reload({ only: ['favorites'] });
                },
                onError: () => {
                    playSFX('error');
                    alert('Failed to remove from favorites');
                },
                onFinish: () => {
                    setRemovingId(null);
                }
            });
        } catch (error) {
            console.error('Failed to unfavorite post:', error);
            setRemovingId(null);
        }
    };

    return (
        <>
            <Head title="My Favorites - Forum" />

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
                            bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-600 
                            px-6 py-8 
                            relative overflow-hidden
                            animate-rainbowGradient
                        ">
                            <div className="flex items-center justify-between">
                                <div className="relative z-10">
                                    <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-2xl flex items-center gap-3">
                                        <Bookmark className="w-8 h-8 animate-pulse animate-float fill-white" />
                                        My Favorites
                                    </h1>
                                    <p className="text-white/90 text-lg drop-shadow-lg">
                                        Your saved posts for quick access
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
                                            {favorites.total}
                                        </div>
                                        <div className="text-sm text-white/90 font-medium drop-shadow-lg">
                                            Saved Posts
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-slideDown">
                        <Link
                            href={route('forum.index')}
                            onMouseEnter={() => playSFX('hover')}
                            onClick={() => playSFX('click')}
                            className="
                                inline-flex items-center justify-center gap-3 
                                px-8 py-4 
                                bg-gradient-to-r from-yellow-500 to-orange-600 
                                hover:from-yellow-600 hover:to-orange-700 
                                text-white font-bold text-lg
                                rounded-xl 
                                shadow-2xl shadow-yellow-500/50 
                                hover:shadow-yellow-500/70
                                transition-all duration-300
                                ring-2 ring-yellow-400/50 hover:ring-yellow-400/70
                                ripple-effect button-press-effect hover-lift
                                animate-glowPulse
                            "
                        >
                            <Search className="w-6 h-6" />
                            <span>Browse Forum</span>
                        </Link>

                        <Link
                            href={route('forum.my-posts')}
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
                            <FileText className="w-6 h-6" />
                            <span>My Posts</span>
                        </Link>
                    </div>

                    {/* Favorites List */}
                    {favorites.data.length > 0 ? (
                        <>
                            <div className="space-y-4">
                                {favorites.data.map((favorite, index) => {
                                    const post = favorite.post;
                                    const author = getAuthorInfo(post);

                                    return (
                                        <div 
                                            key={favorite.favorite_id}
                                            className="
                                                bg-black/40 backdrop-blur-xl 
                                                border border-white/10 
                                                rounded-2xl shadow-xl 
                                                hover:shadow-2xl hover:border-white/20
                                                transition-all duration-300
                                                overflow-hidden
                                                group
                                                ripple-effect hover-lift
                                                animate-fadeIn
                                            "
                                            style={{ animationDelay: `${index * 50}ms` }}
                                            onMouseEnter={() => playSFX('hover')}
                                        >
                                            <div className="p-6">
                                                <div className="flex gap-4">
                                                    {/* Favorite Icon */}
                                                    <div className="flex-shrink-0">
                                                        <button
                                                            onClick={() => handleUnfavorite(post.post_id)}
                                                            disabled={removingId === post.post_id}
                                                            onMouseEnter={() => playSFX('hover')}
                                                            className="
                                                                p-3 
                                                                bg-gradient-to-br from-yellow-500/20 to-orange-500/20 
                                                                border border-yellow-500/30
                                                                rounded-xl 
                                                                hover:from-yellow-500/30 hover:to-orange-500/30
                                                                transition-all duration-300
                                                                disabled:opacity-50
                                                                group/btn
                                                                shadow-lg hover:shadow-xl
                                                                ripple-effect button-press-effect
                                                            "
                                                            title="Remove from favorites"
                                                        >
                                                            <Bookmark 
                                                                className={`
                                                                    w-6 h-6 
                                                                    ${removingId === post.post_id 
                                                                        ? 'text-yellow-400 animate-pulse' 
                                                                        : 'text-yellow-400 fill-yellow-400 group-hover/btn:scale-110 transition-transform'
                                                                    }
                                                                `} 
                                                            />
                                                        </button>
                                                    </div>

                                                    {/* Post Content */}
                                                    <div className="flex-1 min-w-0">
                                                        {/* Category & Badges */}
                                                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                            <CategoryBadge category={post.category} />
                                                            {post.is_pinned && (
                                                                <span className="
                                                                    inline-flex items-center gap-1.5 
                                                                    px-3 py-1.5 
                                                                    bg-yellow-500/20 border border-yellow-500/30
                                                                    text-yellow-300 
                                                                    text-xs font-bold 
                                                                    rounded-lg
                                                                    shadow-lg
                                                                    animate-pulse-slow
                                                                ">
                                                                    <Pin className="w-3 h-3" />
                                                                    Pinned
                                                                </span>
                                                            )}
                                                            {post.is_locked && (
                                                                <span className="
                                                                    inline-flex items-center gap-1.5 
                                                                    px-3 py-1.5 
                                                                    bg-red-500/20 border border-red-500/30
                                                                    text-red-300 
                                                                    text-xs font-bold 
                                                                    rounded-lg
                                                                    shadow-lg
                                                                ">
                                                                    <Lock className="w-3 h-3" />
                                                                    Locked
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Title */}
                                                        <Link
                                                            href={route('forum.show', post.post_id)}
                                                            onClick={() => playSFX('click')}
                                                            className="group/title"
                                                        >
                                                            <h3 className="
                                                                text-2xl font-bold 
                                                                text-white 
                                                                group-hover/title:text-yellow-400
                                                                transition-colors 
                                                                line-clamp-2 mb-2
                                                                drop-shadow-lg
                                                            ">
                                                                {post.title}
                                                            </h3>
                                                        </Link>

                                                        {/* Author & Time */}
                                                        <div className="flex items-center gap-2 text-sm text-gray-300 mb-3 flex-wrap">
                                                            <span className="font-bold text-white drop-shadow-lg">
                                                                {author.name}
                                                            </span>
                                                            {author.is_admin && (
                                                                <span className="
                                                                    px-2 py-0.5 
                                                                    bg-red-500/20 border border-red-500/30
                                                                    text-red-300 
                                                                    text-xs font-bold 
                                                                    rounded
                                                                ">
                                                                    Admin
                                                                </span>
                                                            )}
                                                            <span>•</span>
                                                            <span>{timeAgo(post.created_at)}</span>
                                                        </div>

                                                        {/* Content Preview */}
                                                        <p className="text-gray-300 line-clamp-2 mb-4 leading-relaxed">
                                                            {post.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                                                            {post.content.length > 200 && '...'}
                                                        </p>

                                                        {/* Stats */}
                                                        <div className="flex items-center gap-6 text-sm text-gray-400 flex-wrap">
                                                            <div className="flex items-center gap-2 group/stat">
                                                                <Heart className="w-5 h-5 text-red-400 group-hover/stat:scale-110 transition-transform" />
                                                                <span className="font-bold text-white">
                                                                    {post.likes || 0}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 group/stat">
                                                                <MessageCircle className="w-5 h-5 text-green-400 group-hover/stat:scale-110 transition-transform" />
                                                                <span className="font-bold text-white">
                                                                    {post.replies_count || 0}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 group/stat">
                                                                <Eye className="w-5 h-5 text-blue-400 group-hover/stat:scale-110 transition-transform" />
                                                                <span className="font-bold text-white">
                                                                    {post.views || 0}
                                                                </span>
                                                            </div>
                                                            
                                                            {/* Saved Time */}
                                                            <div className="
                                                                flex items-center gap-2 ml-auto
                                                                text-xs font-bold
                                                                text-yellow-300 
                                                                bg-yellow-500/20 
                                                                border border-yellow-500/30
                                                                px-3 py-1.5 
                                                                rounded-lg
                                                                shadow-lg
                                                                animate-pulse-slow
                                                            ">
                                                                <Star className="w-4 h-4 fill-yellow-300" />
                                                                Saved {timeAgo(favorite.favorited_at || favorite.created_at)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {favorites.last_page > 1 && (
                                <div className="mt-8 animate-slideDown">
                                    <Pagination 
                                        links={favorites.links}
                                        currentPage={favorites.current_page}
                                        lastPage={favorites.last_page}
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
                                bg-gradient-to-br from-yellow-500/20 to-orange-500/20 
                                rounded-full 
                                flex items-center justify-center
                                border border-yellow-500/30
                                shadow-2xl
                                animate-float
                            ">
                                <Bookmark className="w-16 h-16 text-yellow-400 drop-shadow-2xl animate-pulse-slow" />
                            </div>
                            <h3 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
                                No favorites yet
                            </h3>
                            <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
                                Start saving posts you find interesting! Click the bookmark icon on any post to add it to your favorites.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href={route('forum.index')}
                                    onMouseEnter={() => playSFX('hover')}
                                    onClick={() => playSFX('click')}
                                    className="
                                        inline-flex items-center justify-center gap-3 
                                        px-8 py-4 
                                        bg-gradient-to-r from-yellow-500 to-orange-600 
                                        hover:from-yellow-600 hover:to-orange-700 
                                        text-white font-bold text-lg
                                        rounded-xl 
                                        shadow-2xl shadow-yellow-500/50
                                        hover:shadow-yellow-500/70
                                        transition-all duration-300
                                        ring-2 ring-yellow-400/50 hover:ring-yellow-400/70
                                        ripple-effect button-press-effect hover-lift
                                        animate-glowPulse
                                    "
                                >
                                    <Search className="w-6 h-6" />
                                    <span>Browse Forum</span>
                                </Link>
                                <Link
                                    href={route('forum.create')}
                                    onMouseEnter={() => playSFX('hover')}
                                    onClick={() => playSFX('success')}
                                    className="
                                        inline-flex items-center justify-center gap-3 
                                        px-8 py-4 
                                        bg-white/10 hover:bg-white/20 
                                        border-2 border-white/20 hover:border-white/30
                                        text-white font-bold text-lg
                                        rounded-xl 
                                        backdrop-blur-sm
                                        shadow-xl
                                        transition-all duration-300
                                        ripple-effect button-press-effect hover-lift
                                    "
                                >
                                    <PenSquare className="w-6 h-6" />
                                    <span>Create Post</span>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Tips Section */}
                    {favorites.data.length > 0 && (
                        <div className="
                            mt-8 
                            bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-amber-500/20 
                            backdrop-blur-xl border border-yellow-500/30 
                            rounded-2xl p-6 
                            shadow-2xl
                            animate-slideDown
                        ">
                            <div className="flex items-start gap-4">
                                <div className="
                                    p-4 
                                    bg-gradient-to-br from-yellow-500 to-orange-600 
                                    rounded-2xl 
                                    shadow-2xl shadow-yellow-500/50
                                    animate-float
                                ">
                                    <Sparkles className="w-8 h-8 text-white drop-shadow-lg animate-spin-slow" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-xl mb-3 drop-shadow-lg flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse-slow" />
                                        About Favorites
                                    </h4>
                                    <p className="text-sm text-gray-200 mb-3 leading-relaxed">
                                        Click the bookmark icon on any post to save it to your favorites. Perfect for saving helpful tutorials, interesting discussions, or posts you want to reference later.
                                    </p>
                                    <div className="
                                        flex items-center gap-2 
                                        text-xs font-bold
                                        text-yellow-300 
                                        bg-yellow-500/30 
                                        border border-yellow-400/40
                                        px-4 py-2 
                                        rounded-lg 
                                        inline-flex
                                        shadow-lg
                                    ">
                                        <Info className="w-4 h-4 animate-pulse-slow" />
                                        Click the bookmark icon again to remove from favorites
                                    </div>
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
export default function MyFavorites(props) {
    return (
        <StudentLayout user={props.auth.user}>
            <MyFavoritesContent {...props} />
        </StudentLayout>
    );
}