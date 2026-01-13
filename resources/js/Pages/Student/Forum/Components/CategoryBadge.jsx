export default function CategoryBadge({ category, size = 'sm' }) {
    const categoryStyles = {
        general: {
            name: 'General',
            icon: '💬',
            gradient: 'from-blue-500 to-cyan-500',
            shadow: 'shadow-blue-500/50',
        },
        help: {
            name: 'Help',
            icon: '❓',
            gradient: 'from-green-500 to-emerald-500',
            shadow: 'shadow-green-500/50',
        },
        showcase: {
            name: 'Showcase',
            icon: '🎨',
            gradient: 'from-purple-500 to-pink-500',
            shadow: 'shadow-purple-500/50',
        },
        resources: {
            name: 'Resources',
            icon: '📚',
            gradient: 'from-orange-500 to-red-500',
            shadow: 'shadow-orange-500/50',
        },
        announcements: {
            name: 'Announcements',
            icon: '📢',
            gradient: 'from-yellow-500 to-orange-500',
            shadow: 'shadow-yellow-500/50',
        },
        feedback: {
            name: 'Feedback',
            icon: '💡',
            gradient: 'from-cyan-500 to-blue-500',
            shadow: 'shadow-cyan-500/50',
        },
        discussion: {
            name: 'Discussion',
            icon: '💭',
            gradient: 'from-purple-500 to-pink-500',
            shadow: 'shadow-purple-500/50',
        },
    };

    const sizeStyles = {
        xs: 'px-2 py-0.5 text-xs gap-1',
        sm: 'px-2.5 py-1 text-xs gap-1.5',
        md: 'px-3 py-1.5 text-sm gap-2',
        lg: 'px-4 py-2 text-base gap-2',
    };

    const style = categoryStyles[category] || categoryStyles.general;

    return (
        <span
            className={`
                inline-flex items-center
                ${sizeStyles[size]}
                bg-gradient-to-r ${style.gradient}
                text-white font-bold rounded-lg
                shadow-lg ${style.shadow}
                ring-2 ring-white/20
            `}
        >
            <span className="drop-shadow-lg">{style.icon}</span>
            <span className="drop-shadow-lg">{style.name}</span>
        </span>
    );
}