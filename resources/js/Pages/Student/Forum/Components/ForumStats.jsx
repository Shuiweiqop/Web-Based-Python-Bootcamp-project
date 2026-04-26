import { TrendingUp, MessageSquare, Users, Folder } from 'lucide-react';
import { useSFX } from '@/Contexts/SFXContext';

export default function ForumStats({ totalPosts, totalReplies, activeUsers, categoryStats, isDark }) {
    // ✅ Make useSFX optional - provide fallback if context not available
    let playSFX = () => {};
    try {
        const sfx = useSFX();
        playSFX = sfx.playSFX;
    } catch (error) {
        // SFXProvider not available, use no-op function
    }

    const resolvedIsDark = typeof isDark === 'boolean'
        ? isDark
        : (typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : true);

    const stats = [
        {
            label: 'Total Posts',
            value: totalPosts,
            icon: TrendingUp,
            gradient: 'from-blue-500 to-cyan-500',
            shadowColor: 'shadow-blue-500/50',
            glowColor: 'hover:ring-blue-400/50',
        },
        {
            label: 'Total Replies',
            value: totalReplies,
            icon: MessageSquare,
            gradient: 'from-green-500 to-emerald-500',
            shadowColor: 'shadow-green-500/50',
            glowColor: 'hover:ring-green-400/50',
        },
        {
            label: 'Active Users',
            value: activeUsers,
            icon: Users,
            gradient: 'from-purple-500 to-pink-500',
            shadowColor: 'shadow-purple-500/50',
            glowColor: 'hover:ring-purple-400/50',
        },
        {
            label: 'Categories',
            value: Object.keys(categoryStats || {}).length,
            icon: Folder,
            gradient: 'from-orange-500 to-red-500',
            shadowColor: 'shadow-orange-500/50',
            glowColor: 'hover:ring-orange-400/50',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        onMouseEnter={() => playSFX('hover')}
                        onClick={() => playSFX('click')}
                        className={`
                            relative overflow-hidden
                            ${resolvedIsDark ? 'bg-slate-950/72 border-white/12' : 'bg-white/90 border-gray-300'}
                            backdrop-blur-xl 
                            border
                            rounded-2xl shadow-xl ${stat.shadowColor}
                            hover:shadow-2xl hover:scale-105 ${stat.glowColor}
                            hover:ring-2 ${resolvedIsDark ? 'hover:border-white/20' : 'hover:border-gray-400'}
                            transition-all duration-300
                            group
                            cursor-pointer
                            ripple-effect hover-lift
                        `}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Gradient Background Overlay */}
                        <div className={`
                            absolute inset-0 bg-gradient-to-br ${stat.gradient} 
                            opacity-0 group-hover:opacity-10 
                            transition-opacity duration-300
                        `} />
                        
                        <div className="relative p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className={`mb-2 text-sm font-semibold ${resolvedIsDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                        {stat.label}
                                    </p>
                                    <p className={`
                                        text-4xl font-bold bg-gradient-to-r ${stat.gradient} 
                                        bg-clip-text text-transparent
                                        drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]
                                        animate-countUp
                                    `}>
                                        {stat.value.toLocaleString()}
                                    </p>
                                </div>
                                <div className={`
                                    bg-gradient-to-br ${stat.gradient} 
                                    rounded-2xl p-4 
                                    shadow-xl ${stat.shadowColor}
                                    group-hover:scale-110 group-hover:rotate-6
                                    transition-all duration-300
                                    animate-float
                                `}>
                                    <Icon className="w-8 h-8 text-white drop-shadow-lg" />
                                </div>
                            </div>
                        </div>

                        {/* Shimmer Effect */}
                        <div className="
                            absolute bottom-0 left-0 right-0 h-1
                            bg-gradient-to-r from-transparent via-white/30 to-transparent
                            opacity-0 group-hover:opacity-100
                            transition-opacity duration-300
                            animate-shimmer
                        " />
                    </div>
                );
            })}
        </div>
    );
}
