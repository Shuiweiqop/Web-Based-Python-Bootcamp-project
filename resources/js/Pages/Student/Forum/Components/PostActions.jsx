import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Flag, Edit, Pin, Lock, Unlock, Trash2, CheckCircle } from 'lucide-react';
import ReportModal from './ReportModal';

export default function PostActions({
    post = {},
    isLiked = false,
    isFavorited = false,
    hasReported = false,
    likesCount = 0,
    canEdit = false,
    canDelete = false,
    canPin = false,
    canLock = false,
    onLike = () => {},
    onFavorite = () => {},
    onDelete = () => {},
    onReply = () => {},
    disabled = false,
}) {
    const [showReportModal, setShowReportModal] = useState(false);

    const handlePin = () => {
        if (disabled) return;
        
        router.post(
            route('forum.pin', post.post_id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onError: (errors) => {
                    console.error('Failed to pin post:', errors);
                    alert('Failed to pin post. Please try again.');
                }
            }
        );
    };

    const handleLock = () => {
        if (disabled) return;
        
        router.post(
            route('forum.lock', post.post_id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onError: (errors) => {
                    console.error('Failed to lock post:', errors);
                    alert('Failed to lock post. Please try again.');
                }
            }
        );
    };

    const handleReport = (data) => {
        router.post(
            route('forum.report', post.post_id),
            data,
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setShowReportModal(false);
                    alert('Report submitted successfully!');
                },
                onError: (errors) => {
                    console.error('Report failed:', errors);
                    alert(errors.message || 'Failed to submit report. Please try again.');
                }
            }
        );
    };

    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                {/* Like Button */}
                <button
                    type="button"
                    onClick={onLike}
                    disabled={disabled}
                    aria-label={isLiked ? 'Unlike post' : 'Like post'}
                    className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all transform
                        ${isLiked
                            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    <Heart 
                        className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
                    />
                    <span className="font-bold">{likesCount}</span>
                    <span className="hidden sm:inline">{isLiked ? 'Liked' : 'Like'}</span>
                </button>

                {/* Reply Button */}
                {!post?.is_locked && (
                    <button
                        type="button"
                        onClick={onReply}
                        disabled={disabled}
                        aria-label="Reply to post"
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all transform
                            bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:scale-105
                            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span className="hidden sm:inline">Reply</span>
                    </button>
                )}

                {/* Favorite Button */}
                <button
                    type="button"
                    onClick={onFavorite}
                    disabled={disabled}
                    aria-label={isFavorited ? 'Remove from saved' : 'Save post'}
                    className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all transform
                        ${isFavorited
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg hover:shadow-xl hover:scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    <Bookmark 
                        className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`}
                    />
                    <span className="hidden sm:inline">{isFavorited ? 'Saved' : 'Save'}</span>
                </button>

                {/* Report Button */}
                {!canEdit && !hasReported && (
                    <button
                        type="button"
                        onClick={() => setShowReportModal(true)}
                        disabled={disabled}
                        aria-label="Report post"
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all transform
                            bg-orange-100 text-orange-700 hover:bg-orange-200 hover:scale-105
                            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        <Flag className="w-5 h-5" />
                        <span className="hidden sm:inline">Report</span>
                    </button>
                )}

                {/* Already Reported */}
                {hasReported && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-green-100 text-green-700 rounded-xl font-semibold">
                        <CheckCircle className="w-5 h-5" />
                        <span className="hidden sm:inline">Reported</span>
                    </div>
                )}

                {/* Edit Button */}
                {canEdit && (
                    <Link
                        href={route('forum.edit', post.post_id)}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all transform
                            bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105
                            ${disabled ? 'opacity-50 pointer-events-none' : ''}
                        `}
                    >
                        <Edit className="w-5 h-5" />
                        <span className="hidden sm:inline">Edit</span>
                    </Link>
                )}

                {/* Admin Actions */}
                {canPin && (
                    <button
                        type="button"
                        onClick={handlePin}
                        disabled={disabled}
                        aria-label={post?.is_pinned ? 'Unpin post' : 'Pin post'}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all transform
                            ${post?.is_pinned
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg hover:shadow-xl hover:scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                            }
                            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        <Pin className={`w-5 h-5 ${post?.is_pinned ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">{post?.is_pinned ? 'Unpin' : 'Pin'}</span>
                    </button>
                )}

                {canLock && (
                    <button
                        type="button"
                        onClick={handleLock}
                        disabled={disabled}
                        aria-label={post?.is_locked ? 'Unlock post' : 'Lock post'}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all transform
                            ${post?.is_locked
                                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                            }
                            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {post?.is_locked ? (
                            <Unlock className="w-5 h-5" />
                        ) : (
                            <Lock className="w-5 h-5" />
                        )}
                        <span className="hidden sm:inline">{post?.is_locked ? 'Unlock' : 'Lock'}</span>
                    </button>
                )}

                {/* Delete Button */}
                {canDelete && (
                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={disabled}
                        aria-label="Delete post"
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all transform
                            bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:scale-105 ml-auto
                            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        <Trash2 className="w-5 h-5" />
                        <span className="hidden sm:inline">Delete</span>
                    </button>
                )}
            </div>

            {/* Report Modal */}
            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSubmit={handleReport}
                type="post"
            />
        </>
    );
}