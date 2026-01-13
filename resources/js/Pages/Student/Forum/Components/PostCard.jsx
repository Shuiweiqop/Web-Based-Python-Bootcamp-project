import { Link } from '@inertiajs/react';
import { Heart, MessageSquare, Eye, Pin, Lock, CheckCircle } from 'lucide-react';
import { useSFX } from '@/Contexts/SFXContext';

function CategoryBadge({ category }) {
    const categoryStyles = {
        general: 'from-blue-500 to-cyan-500',
        help: 'from-green-500 to-emerald-500',
        discussion: 'from-purple-500 to-pink-500',
        announcement: 'from-orange-500 to-red-500',
    };

    return (
        <span className={`
            inline-flex items-center gap-1 px-3 py-1 
            bg-gradient-to-r ${categoryStyles[category] || 'from-gray-500 to-gray-600'}
            text-white text-xs font-bold rounded-lg
            shadow-lg animate-pulse-slow
        `}>
            {category}
        </span>
    );
}

function UserAvatar({ author, size = 'lg' }) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
    };

    return (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden ring-2 ring-white/20 shadow-xl animate-float`}>
            <img 
                src={author.avatar} 
                alt={author.name}
                className="w-full h-full object-cover"
            />
        </div>
    );
}

// Simple time ago function
function getTimeAgo(dateString) {
    if (!dateString) return '';
    
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}

export default function PostCard({ post, currentUserId }) {
    const { playSFX } = useSFX();

    const getAuthorInfo = (post) => {
        if (post.author) return post.author;
        
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

    const author = getAuthorInfo(post);
    const isAuthor = currentUserId === post.user_id;
    const timeAgo = getTimeAgo(post.created_at);

    return (
        <div 
            onMouseEnter={() => playSFX('hover')}
            className="
                relative
                bg-black/40 backdrop-blur-xl 
                border border-white/10 
                rounded-2xl shadow-xl hover:shadow-2xl
                hover:border-white/20
                transition-all duration-300
                overflow-hidden
                group
                hover-lift
                card-hover-effect
            "
        >
            {/* 🔥 整个卡片可点击 - 添加 Link 组件 */}
            <Link 
                href={route('forum.show', post.post_id)}
                onClick={() => playSFX('click')}
                className="block p-6 hover:bg-white/5 transition-colors duration-200"
            >
                <div className="flex gap-4">
                    {/* Author Avatar */}
                    <div className="flex-shrink-0">
                        <UserAvatar author={author} size="lg" />
                    </div>

                    {/* Post Content */}
                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    {/* Pinned Badge */}
                                    {post.is_pinned && (
                                        <span className="
                                            inline-flex items-center gap-1 px-2 py-1 
                                            bg-yellow-500/20 border border-yellow-500/30
                                            text-yellow-300 text-xs font-bold rounded-lg
                                            shadow-lg shadow-yellow-500/20
                                            animate-pulse-slow
                                        ">
                                            <Pin className="w-3 h-3 animate-spin-slow" />
                                            Pinned
                                        </span>
                                    )}

                                    {/* Locked Badge */}
                                    {post.is_locked && (
                                        <span className="
                                            inline-flex items-center gap-1 px-2 py-1 
                                            bg-red-500/20 border border-red-500/30
                                            text-red-300 text-xs font-bold rounded-lg
                                            shadow-lg shadow-red-500/20
                                            animate-pulse-slow
                                        ">
                                            <Lock className="w-3 h-3" />
                                            Locked
                                        </span>
                                    )}

                                    {/* Category Badge */}
                                    <CategoryBadge category={post.category} />
                                </div>

                                {/* Title - 添加悬停效果 */}
                                <h3 className="
                                    text-xl font-bold text-white 
                                    group-hover:text-transparent
                                    group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400
                                    group-hover:bg-clip-text
                                    transition-all duration-200 
                                    line-clamp-2
                                    drop-shadow-lg
                                ">
                                    {post.title}
                                </h3>

                                {/* Author Info */}
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                                    <span className="font-bold text-white">{author.name}</span>
                                    {author.is_admin && (
                                        <span className="
                                            px-2 py-0.5 
                                            bg-red-500/20 border border-red-500/30
                                            text-red-300 text-xs font-bold rounded
                                            animate-pulse-slow
                                        ">
                                            Admin
                                        </span>
                                    )}
                                    {author.is_student && author.level && (
                                        <span className="
                                            px-2 py-0.5 
                                            bg-blue-500/20 border border-blue-500/30
                                            text-blue-300 text-xs font-bold rounded
                                            animate-pulse-slow
                                        ">
                                            {author.level}
                                        </span>
                                    )}
                                    <span>•</span>
                                    <span>{timeAgo}</span>
                                    {isAuthor && (
                                        <>
                                            <span>•</span>
                                            <span className="text-blue-400 font-bold animate-pulse">You</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content Preview */}
                        <p className="text-gray-300 line-clamp-2 mb-4 leading-relaxed">
                            {post.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                            {post.content.length > 200 && '...'}
                        </p>

                        {/* Footer Stats */}
                        <div className="flex items-center gap-6 text-sm">
                            <div className="
                                flex items-center gap-2 
                                text-gray-400 group-hover:text-pink-400 
                                transition-colors duration-200
                            ">
                                <Heart className="w-5 h-5" />
                                <span className="font-bold">{post.likes || 0}</span>
                            </div>

                            <div className="
                                flex items-center gap-2 
                                text-gray-400 group-hover:text-blue-400 
                                transition-colors duration-200
                            ">
                                <MessageSquare className="w-5 h-5 animate-pulse-slow" />
                                <span className="font-bold">{post.replies_count || 0}</span>
                            </div>

                            <div className="
                                flex items-center gap-2 
                                text-gray-400 group-hover:text-purple-400 
                                transition-colors duration-200
                            ">
                                <Eye className="w-5 h-5" />
                                <span className="font-bold">{post.views || 0}</span>
                            </div>

                            {/* Solution Badge */}
                            {post.category === 'help' && post.replies_count > 0 && (
                                <div className="flex items-center gap-2 ml-auto">
                                    <span className="
                                        px-3 py-1 
                                        bg-green-500/20 border border-green-500/30
                                        text-green-300 text-xs font-bold rounded-lg
                                        flex items-center gap-1
                                        shadow-lg shadow-green-500/20
                                        animate-glowPulse
                                    ">
                                        <CheckCircle className="w-3 h-3 animate-pulse-slow" />
                                        Solved
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Link>

            {/* Hover Shimmer Effect */}
            <div className="
                absolute bottom-0 left-0 right-0 h-1
                bg-gradient-to-r from-transparent via-blue-500/50 to-transparent
                opacity-0 group-hover:opacity-100
                transition-opacity duration-300
                rounded-b-2xl
                animate-shimmer
            " />
        </div>
    );
}