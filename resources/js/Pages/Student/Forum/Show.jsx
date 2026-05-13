import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';
import CategoryBadge from './Components/CategoryBadge';
import UserAvatar from './Components/UserAvatar';
import ReplyCard from './Components/ReplyCard';
import ReplyForm from './Components/ReplyForm';
import PostActions from './Components/PostActions';
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

    // Sync local state when props update
    useEffect(() => {
        setLocalIsLiked(isLiked);
        setLocalIsFavorited(isFavorited);
        setLocalLikesCount(post.likes || 0);
    }, [isLiked, isFavorited, post.likes]);

    const author = post.author || post.user || {
        name: 'Unknown User',
        avatar: '/images/default-avatar.png',
        role_badge: 'student',
    };

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
                    <div className="rounded-2xl border border-red-400/40 bg-red-500/20 px-5 py-4 text-sm font-medium text-red-100 shadow-lg">
                        {flash.error}
                    </div>
                )}

                {/* Main Post Card */}
                <div className="bg-black/70 backdrop-blur-xl border-2 border-white/30 rounded-3xl shadow-2xl overflow-hidden">
                    {/* Post Header */}
                    <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 px-6 sm:px-8 py-6 border-b border-white/20">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight drop-shadow-lg">
                            {post.title}
                        </h1>
                    </div>

                    {/* Post Content */}
                    <div className="p-6 sm:p-8">
                        {/* Author Info */}
                        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-white/20">
                            <UserAvatar author={author} size="xl" showBadges={true} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-lg font-bold text-white">{author.name}</h3>
                                    {author.is_admin && (
                                        <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs font-semibold rounded border border-red-500/30">
                                            Admin
                                        </span>
                                    )}
                                    {author.is_student && author.level && (
                                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded border border-blue-500/30">
                                            {author.level}
                                        </span>
                                    )}
                                    {isAuthor && (
                                        <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-semibold rounded border border-green-500/30">
                                            Author
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-sm text-white/80">
                                    <span>Posted {timeAgo}</span>
                                </div>
                                {author.is_student && (
                                    <div className="flex items-center gap-4 mt-2 text-xs text-white/70">
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
                            className="prose-lg prose-invert mb-8"
                        />

                        {/* Post Stats */}
                        <div className="flex items-center gap-6 text-sm text-white/70 mb-6 pb-6 border-b border-white/20">
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
                    <div className="bg-black/70 backdrop-blur-xl border-2 border-white/30 rounded-3xl shadow-2xl overflow-hidden p-6">
                        <ReplyForm
                            postId={post.post_id}
                            onCancel={() => setShowReplyForm(false)}
                        />
                    </div>
                )}

                {/* Locked Message */}
                {post.is_locked && (
                    <div className="bg-red-500/20 border-2 border-red-500/50 rounded-3xl p-6 shadow-2xl">
                        <div className="flex items-center gap-4 text-red-300">
                            <div className="p-3 bg-red-500/30 rounded-full">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-lg">This post is locked</p>
                                <p className="text-sm text-red-200 mt-1">New replies are not allowed.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Replies Section */}
                <div className="bg-black/70 backdrop-blur-xl border-2 border-white/30 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 px-6 sm:px-8 py-5 border-b border-white/20">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="p-2 bg-blue-500/30 rounded-lg border border-blue-400/30">
                                <MessageCircle className="w-6 h-6 text-blue-300" />
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
                                            <div className="mt-6 border-b border-white/20" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="text-7xl mb-6 animate-bounce">💭</div>
                                <h3 className="text-2xl font-bold text-white mb-3">
                                    No replies yet
                                </h3>
                                <p className="text-white/80 mb-8 text-lg">
                                    Be the first to share your thoughts!
                                </p>
                                {!post.is_locked && (
                                    <button
                                        onClick={() => setShowReplyForm(true)}
                                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 border-2 border-white/30"
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
