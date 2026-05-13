import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';
import CategoryBadge from '@/Pages/Student/Forum/Components/CategoryBadge';
import UserAvatar from '@/Pages/Student/Forum/Components/UserAvatar';
import ReplyCard from '@/Pages/Student/Forum/Components/ReplyCard';
import ReplyForm from '@/Pages/Student/Forum/Components/ReplyForm';
import PostActions from '@/Pages/Student/Forum/Components/PostActions';
import SafeContentRenderer from '@/Components/SafeContentRenderer';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Eye, MessageCircle, Lock } from 'lucide-react';

export default function Show({ auth, post, isLiked, isFavorited, canEdit, canDelete, canPin, canLock }) {
    const { flash } = usePage().props;
    const [localIsLiked, setLocalIsLiked] = useState(isLiked);
    const [localIsFavorited, setLocalIsFavorited] = useState(isFavorited);
    const [localLikesCount, setLocalLikesCount] = useState(post.likes || 0);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [processing, setProcessing] = useState(false);

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

    // Sync local state when props update
    useEffect(() => {
        setLocalIsLiked(isLiked);
        setLocalIsFavorited(isFavorited);
        setLocalLikesCount(post.likes || 0);
    }, [isLiked, isFavorited, post.likes]);

    // ✅ 使用辅助函数获取作者信息
    const author = getAuthorInfo(post);

    const timeAgo = post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : '';
    const isAuthor = (auth.user.user_Id || auth.user.id) == post.user_id;

    // Handle Like with Inertia Router
    const handleLike = () => {
        if (processing) return;
        
        setProcessing(true);
        
        // Optimistic UI update
        const newIsLiked = !localIsLiked;
        const newLikesCount = newIsLiked ? localLikesCount + 1 : localLikesCount - 1;
        setLocalIsLiked(newIsLiked);
        setLocalLikesCount(newLikesCount);

        router.post(
            route('forum.like', post.post_id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ['post', 'isLiked', 'isFavorited', 'flash'],
                onSuccess: () => {
                    setProcessing(false);
                },
                onError: (errors) => {
                    // Revert to previous state
                    setLocalIsLiked(!newIsLiked);
                    setLocalLikesCount(newIsLiked ? newLikesCount - 1 : newLikesCount + 1);
                    setProcessing(false);
                    console.error('Failed to like post:', errors);
                },
                onFinish: () => {
                    setProcessing(false);
                }
            }
        );
    };

    // Handle Favorite with Inertia Router
    const handleFavorite = () => {
        if (processing) return;
        
        setProcessing(true);
        
        // Optimistic UI update
        const newIsFavorited = !localIsFavorited;
        setLocalIsFavorited(newIsFavorited);

        router.post(
            route('forum.favorite', post.post_id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ['post', 'isLiked', 'isFavorited', 'flash'],
                onSuccess: () => {
                    setProcessing(false);
                },
                onError: (errors) => {
                    // Revert to previous state
                    setLocalIsFavorited(!newIsFavorited);
                    setProcessing(false);
                    console.error('Failed to favorite post:', errors);
                },
                onFinish: () => {
                    setProcessing(false);
                }
            }
        );
    };

    // Handle Delete
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            router.delete(route('forum.destroy', post.post_id), {
                preserveScroll: false,
                onSuccess: () => {
                    // Redirect to forum index on success
                },
                onError: (errors) => {
                    console.error('Failed to delete post:', errors);
                    alert('Failed to delete post. Please try again.');
                }
            });
        }
    };

    return (
        <StudentLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('forum.index')}
                            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium">Back to Community</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        {post.is_pinned && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 text-yellow-300 text-sm font-semibold rounded-full border border-yellow-500/30">
                                📌 Pinned
                            </span>
                        )}
                        {post.is_locked && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-300 text-sm font-semibold rounded-full border border-red-500/30">
                                🔒 Locked
                            </span>
                        )}
                        <CategoryBadge category={post.category} size="md" />
                    </div>
                </div>
            }
        >
            <Head title={post.title} />

            <div className="space-y-6">
                {flash?.error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-800 shadow-sm">
                        {flash.error}
                    </div>
                )}

                {/* Main Post Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                    {/* Post Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 sm:px-8 py-6 border-b border-gray-200">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                            {post.title}
                        </h1>
                    </div>

                    {/* Post Content */}
                    <div className="p-6 sm:p-8">
                        {/* Author Info */}
                        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200">
                            <UserAvatar author={author} size="xl" showBadges={true} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-lg font-bold text-gray-900">{author.name}</h3>
                                    {author.is_admin && (
                                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                            Admin
                                        </span>
                                    )}
                                    {author.is_student && author.level && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                            {author.level}
                                        </span>
                                    )}
                                    {isAuthor && (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                            Author
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                    <span>Posted {timeAgo}</span>
                                </div>
                                {author.is_student && (
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            ⭐ {author.points || 0} points
                                        </span>
                                        {author.streak > 0 && (
                                            <span className="flex items-center gap-1">
                                                🔥 {author.streak} day streak
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Post Body */}
                        <SafeContentRenderer
                            content={post.content}
                            type="forum-html"
                            className="prose-lg mb-8"
                        />

                        {/* Post Stats */}
                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5" />
                                <span className="font-medium">{post.views || 0} views</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                <span className="font-medium">{post.replies?.length || 0} replies</span>
                            </div>
                        </div>

                        {/* Post Actions */}
                        <PostActions
                            post={post}
                            isLiked={localIsLiked}
                            isFavorited={localIsFavorited}
                            likesCount={localLikesCount}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            canPin={canPin}
                            canLock={canLock}
                            onLike={handleLike}
                            onFavorite={handleFavorite}
                            onDelete={handleDelete}
                            onReply={() => setShowReplyForm(!showReplyForm)}
                            disabled={processing}
                        />
                    </div>
                </div>

                {/* Reply Form */}
                {!post.is_locked && showReplyForm && (
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-200 p-6">
                        <ReplyForm
                            postId={post.post_id}
                            onCancel={() => setShowReplyForm(false)}
                        />
                    </div>
                )}

                {/* Locked Message */}
                {post.is_locked && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center gap-4 text-red-800">
                            <div className="p-3 bg-red-100 rounded-full">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-lg">This post is locked</p>
                                <p className="text-sm text-red-600 mt-1">New replies are not allowed.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Replies Section */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 sm:px-8 py-5 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <MessageCircle className="w-6 h-6 text-blue-600" />
                            </div>
                            <span>{post.replies?.length || 0} {post.replies?.length === 1 ? 'Reply' : 'Replies'}</span>
                        </h2>
                    </div>

                    <div className="p-6 sm:p-8">
                        {post.replies && post.replies.length > 0 ? (
                            <div className="space-y-6">
                                {post.replies.map((reply, index) => (
                                    <div key={reply.reply_id}>
                                        <ReplyCard
                                            reply={reply}
                                            postId={post.post_id}
                                            postAuthorId={post.user_id}
                                            currentUserId={auth.user.user_Id || auth.user.id}
                                            isPostLocked={post.is_locked}
                                        />
                                        {index < post.replies.length - 1 && (
                                            <div className="mt-6 border-b border-gray-200" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="text-7xl mb-6 animate-bounce">💭</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    No replies yet
                                </h3>
                                <p className="text-gray-600 mb-8 text-lg">
                                    Be the first to share your thoughts!
                                </p>
                                {!post.is_locked && (
                                    <button
                                        onClick={() => setShowReplyForm(true)}
                                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        <span>Write a Reply</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
