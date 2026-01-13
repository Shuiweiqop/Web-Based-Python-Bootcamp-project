import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import CategoryBadge from '@/Pages/Student/Forum/Components/CategoryBadge';
import { formatDistanceToNow } from 'date-fns';
import { Shield, ArrowLeft, Bookmark, Eye, MessageSquare, Heart } from 'lucide-react';

export default function MyFavorites({ auth, favorites }) {
    const [removingId, setRemovingId] = useState(null);

    // ✅ 辅助函数：获取作者信息
    const getAuthorInfo = (post) => {
    // 优先使用 Model 的 author accessor
    if (post.author) {
        return post.author;
    }
    
    // Fallback 到 user 关系
    if (post.user) {
        let avatar = post.user.profile_picture;
        
        // 🔥 检查用户是否有装备的头像框奖励
        // 路径：user -> student_profile -> reward_inventory (数组) -> 找 is_equipped=true 的 avatar_frame
        const studentProfile = post.user.student_profile;
        if (studentProfile?.reward_inventory) {
            const equippedAvatarFrame = studentProfile.reward_inventory.find(
                item => item.is_equipped && item.reward?.reward_type === 'avatar_frame'
            );
            
            if (equippedAvatarFrame?.reward?.image_url) {
                avatar = equippedAvatarFrame.reward.image_url;
            }
        }
        
        // Fallback 到 API 生成的头像
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
    
    // 最后的 fallback
    return {
        name: 'Unknown User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=unknown&backgroundColor=3B82F6',
        is_admin: false,
        is_student: false,
    };
};

    const handleUnfavorite = async (postId) => {
        if (removingId) return;
        
        setRemovingId(postId);
        
        try {
            const response = await fetch(route('forum.favorite', postId), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                router.reload({ only: ['favorites'] });
            }
        } catch (error) {
            console.error('Failed to unfavorite post:', error);
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Admin - My Favorites" />

            <div className="min-h-screen py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Back Button */}
                    <Link
                        href={route('forum.index')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Forum</span>
                    </Link>

                    {/* Page Header */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden mb-8 border-l-4 border-amber-500">
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-8 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Bookmark className="w-8 h-8 fill-current" />
                                        <h1 className="text-3xl font-bold">My Favorites</h1>
                                    </div>
                                    <p className="text-amber-100">
                                        Your saved posts and important discussions
                                    </p>
                                </div>
                                <div className="hidden md:block">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-4">
                                        <div className="text-4xl font-bold">{favorites.total}</div>
                                        <div className="text-sm text-amber-100">Saved Posts</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Badge */}
                        <div className="px-6 py-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
                                <span className="text-sm font-semibold text-red-700 dark:text-red-400">Admin View</span>
                            </div>
                        </div>
                    </div>

                    {/* Favorites List */}
                    {favorites.data.length > 0 ? (
                        <>
                            <div className="space-y-4">
                                {favorites.data.map((favorite) => {
                                    const post = favorite.post;
                                    // ✅ 使用辅助函数获取作者信息
                                    const author = getAuthorInfo(post);
                                    const timeAgo = post.created_at 
                                        ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) 
                                        : '';

                                    return (
                                        <div 
                                            key={favorite.favorite_id}
                                            className="bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-l-4 border-amber-500"
                                        >
                                            <div className="p-6">
                                                <div className="flex gap-4">
                                                    {/* Favorite Icon */}
                                                    <div className="flex-shrink-0">
                                                        <button
                                                            onClick={() => handleUnfavorite(post.post_id)}
                                                            disabled={removingId === post.post_id}
                                                            className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors disabled:opacity-50"
                                                            title="Remove from favorites"
                                                        >
                                                            <Bookmark 
                                                                className="w-6 h-6 text-amber-600 dark:text-amber-400 fill-current" 
                                                            />
                                                        </button>
                                                    </div>

                                                    {/* Post Content */}
                                                    <div className="flex-1 min-w-0">
                                                        {/* Category & Badges */}
                                                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                            <CategoryBadge category={post.category} size="sm" />
                                                            {post.is_pinned && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-semibold rounded">
                                                                    📌 Pinned
                                                                </span>
                                                            )}
                                                            {post.is_locked && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs font-semibold rounded">
                                                                    🔒 Locked
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Title */}
                                                        <Link
                                                            href={route('forum.show', post.post_id)}
                                                            className="group"
                                                        >
                                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 mb-2">
                                                                {post.title}
                                                            </h3>
                                                        </Link>

                                                        {/* Author & Time */}
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                            <span className="font-medium text-gray-900 dark:text-white">{author.name}</span>
                                                            {author.is_admin && (
                                                                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded">
                                                                    Admin
                                                                </span>
                                                            )}
                                                            <span>•</span>
                                                            <span>{timeAgo}</span>
                                                        </div>

                                                        {/* Content Preview */}
                                                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                                                            {post.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                                                            {post.content.length > 200 && '...'}
                                                        </p>

                                                        {/* Stats */}
                                                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                                            <div className="flex items-center gap-2">
                                                                <Heart className="w-4 h-4" />
                                                                <span className="font-medium">{post.likes || 0}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <MessageSquare className="w-4 h-4" />
                                                                <span className="font-medium">{post.replies_count || 0}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Eye className="w-4 h-4" />
                                                                <span className="font-medium">{post.views || 0}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 ml-auto text-xs text-gray-400 dark:text-gray-500">
                                                                Saved {formatDistanceToNow(new Date(favorite.created_at), { addSuffix: true })}
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
                                <div className="mt-8">
                                    <Pagination links={favorites.links} />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-12 text-center">
                            <div className="text-6xl mb-4">🔖</div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                No favorites yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Start saving important posts and discussions for quick access later!
                            </p>
                            <Link
                                href={route('forum.index')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-amber-500/30"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span>Browse Forum</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}