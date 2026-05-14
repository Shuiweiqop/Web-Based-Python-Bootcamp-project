import { router } from '@inertiajs/react';
import { useState } from 'react';
import UserAvatar from './UserAvatar';
import ReplyForm from './ReplyForm';
import SafeContentRenderer from '@/Components/SafeContentRenderer';
import { formatDistanceToNow } from 'date-fns';

export default function ReplyCard({ reply, postId, postAuthorId, currentUserId, isPostLocked, depth = 0 }) {
    const [isLiked, setIsLiked] = useState(reply.is_liked || false);
    const [likesCount, setLikesCount] = useState(reply.likes || 0);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

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

    // ✅ 使用辅助函数获取作者信息
    const author = getAuthorInfo(reply);

    const timeAgo = reply.created_at ? formatDistanceToNow(new Date(reply.created_at), { addSuffix: true }) : '';
    const isAuthor = currentUserId === reply.user_id;
    const isPostAuthor = postAuthorId === reply.user_id;
    const canToggleSolution = postAuthorId === currentUserId;
    const maxDepth = 3; // Maximum nesting level

    // Handle Like
    const handleLike = async () => {
        try {
            const response = await fetch(route('forum.reply.like', reply.reply_id), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                setIsLiked(data.isLiked);
                setLikesCount(data.likesCount);
            }
        } catch (error) {
            console.error('Failed to like reply:', error);
        }
    };

    // Handle Delete
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this reply?')) {
            router.delete(route('forum.reply.destroy', reply.reply_id), {
                preserveScroll: true,
            });
        }
    };

    // Handle Mark as Solution
    const handleMarkSolution = () => {
        router.post(route('forum.reply.mark-solution', reply.reply_id), {}, {
            preserveScroll: true,
        });
    };

    const canReply = !isPostLocked && depth < maxDepth;

    return (
        <div className={`${depth > 0 ? 'ml-8 md:ml-12' : ''}`}>
            <div
                className={`bg-white rounded-xl border-2 p-6 transition-all ${
                    reply.is_solution
                        ? 'border-green-300 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                }`}
            >
                {/* Solution Badge */}
                {reply.is_solution && (
                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-full text-sm font-semibold">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>✨ Best Answer</span>
                    </div>
                )}

                {/* Author Info */}
                <div className="flex items-start gap-4 mb-4">
                    <UserAvatar author={author} size="md" showBadges={true} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-gray-900">{author.name}</h4>
                            {author.is_admin && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                    Admin
                                </span>
                            )}
                            {isPostAuthor && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                    Author
                                </span>
                            )}
                            {author.is_student && author.level && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                                    {author.level}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{timeAgo}</p>
                    </div>
                </div>

                {/* Reply Content */}
                <SafeContentRenderer
                    content={reply.content}
                    type="forum-html"
                    className="mb-4 text-gray-800"
                />

                {/* Reply Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
                    {/* Like Button */}
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            isLiked
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <svg
                            className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`}
                            fill={isLiked ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                        <span>{likesCount}</span>
                    </button>

                    {/* Reply Button */}
                    {canReply && (
                        <button
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            <span>Reply</span>
                        </button>
                    )}

                    {/* Mark/unmark solution */}
                    {canToggleSolution && (
                        <button
                            onClick={handleMarkSolution}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                reply.is_solution
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                        >
                            {reply.is_solution ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                            <span>{reply.is_solution ? 'Unmark Solution' : 'Mark as Solution'}</span>
                        </button>
                    )}

                    {/* Delete Button */}
                    {isAuthor && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors ml-auto"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Nested Reply Form */}
            {showReplyForm && (
                <div className="mt-4 ml-8 md:ml-12">
                    <ReplyForm
                        postId={postId}
                        parentReplyId={reply.reply_id}
                        onCancel={() => setShowReplyForm(false)}
                        placeholder={`Reply to ${author.name}...`}
                    />
                </div>
            )}

            {/* Child Replies */}
            {reply.child_replies && reply.child_replies.length > 0 && (
                <div className="mt-4 space-y-4">
                    {reply.child_replies.map((childReply) => (
                        <ReplyCard
                            key={childReply.reply_id}
                            reply={childReply}
                            postId={postId}
                            postAuthorId={postAuthorId}
                            currentUserId={currentUserId}
                            isPostLocked={isPostLocked}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
