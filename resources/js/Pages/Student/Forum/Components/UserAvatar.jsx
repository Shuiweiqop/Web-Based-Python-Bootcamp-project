export default function UserAvatar({ author, size = 'md', showBadges = false }) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-xl',
    };

    // Get initials from name
    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // ✅ 生成 fallback 头像 URL
    const getFallbackAvatar = (name) => {
        const seed = encodeURIComponent(name || 'default');
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=3B82F6`;
    };

    const avatarFrame = author.equipped_avatar_frame;
    const hasFrame = avatarFrame && avatarFrame.image_url;

    return (
        <div className="relative inline-flex items-center justify-center">
            {/* Avatar Frame (if equipped) */}
            {hasFrame && (
                <div className="absolute inset-0 pointer-events-none">
                    <img
                        src={avatarFrame.image_url}
                        alt="Avatar Frame"
                        className={`${sizeClasses[size]} object-cover`}
                        style={{ transform: 'scale(1.2)' }}
                    />
                </div>
            )}

            {/* Avatar */}
            <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden ring-2 ring-white shadow-md`}>
                {author.avatar ? (
                    <img
                        src={author.avatar}
                        alt={author.name || 'User'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // ✅ 使用 DiceBear API 作为 fallback
                            e.target.onerror = null;
                            e.target.src = getFallbackAvatar(author.name);
                        }}
                    />
                ) : (
                    // ✅ 如果没有头像，使用字母头像或 DiceBear
                    <div className="w-full h-full relative">
                        <img
                            src={getFallbackAvatar(author.name)}
                            alt={author.name || 'User'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // 如果 DiceBear 也失败，显示字母头像
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                            }}
                        />
                        <div 
                            className={`w-full h-full absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold ${textSizeClasses[size]}`}
                        >
                            {getInitials(author.name)}
                        </div>
                    </div>
                )}
            </div>

            {/* Online Status Indicator (optional) */}
            {showBadges && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            )}

            {/* Admin Badge (optional) */}
            {showBadges && author.is_admin && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                    👑
                </div>
            )}
        </div>
    );
}