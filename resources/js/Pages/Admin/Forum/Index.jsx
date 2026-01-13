import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ForumStats from '@/Pages/Student/Forum/Components/ForumStats';
import ForumFilters from '@/Pages/Student/Forum/Components/ForumFilters';
import CategoryBadge from '@/Pages/Student/Forum/Components/CategoryBadge';
import UserAvatar from '@/Pages/Student/Forum/Components/UserAvatar';
import Pagination from '@/Components/Pagination';
import { 
    Shield, 
    Pin, 
    Lock, 
    Eye, 
    MessageSquare, 
    Heart,
    Trash2,
    AlertTriangle,
    Edit3,
    Sun,
    Moon,
    Plus,
    Star
} from 'lucide-react';

// Utility function
const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function Index({ auth, posts, categoryStats, categories, filters }) {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            return saved ? saved === 'dark' : true;
        }
        return true;
    });
    
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [sortBy, setSortBy] = useState(filters.sort || 'recent');

    useEffect(() => {
        const handleThemeChange = () => {
            const saved = localStorage.getItem('theme');
            setIsDark(saved === 'dark');
        };

        window.addEventListener('theme-changed', handleThemeChange);
        window.addEventListener('storage', handleThemeChange);
        
        const interval = setInterval(() => {
            const saved = localStorage.getItem('theme');
            const currentTheme = saved === 'dark';
            if (currentTheme !== isDark) {
                setIsDark(currentTheme);
            }
        }, 100);

        return () => {
            window.removeEventListener('theme-changed', handleThemeChange);
            window.removeEventListener('storage', handleThemeChange);
            clearInterval(interval);
        };
    }, [isDark]);

    // ✅ 获取作者信息，包含积分
    const getAuthorInfo = (post) => {
        if (post.author) {
            return post.author;
        }
        
        if (post.user) {
            let avatar = post.user.profile_picture;
            let points = 0;
            let isStudent = post.user.role === 'student';
            let equippedAvatarFrame = null;
            
            const studentProfile = post.user.student_profile;
            if (studentProfile) {
                // ✅ 获取积分
                points = studentProfile.current_points || 0;
                
                // 获取装备的头像框
                if (studentProfile.reward_inventory) {
                    const frameItem = studentProfile.reward_inventory.find(
                        item => item.is_equipped && item.reward?.reward_type === 'avatar_frame'
                    );
                    
                    if (frameItem?.reward) {
                        equippedAvatarFrame = frameItem.reward;
                        if (frameItem.reward.image_url) {
                            avatar = frameItem.reward.image_url;
                        }
                    }
                }
            }
            
            if (!avatar) {
                avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.user.name)}&backgroundColor=3B82F6`;
            }
            
            return {
                name: post.user.name,
                avatar: avatar,
                is_admin: post.user.role === 'administrator',
                is_student: isStudent,
                points: points,
                equipped_avatar_frame: equippedAvatarFrame,
            };
        }
        
        return {
            name: 'Unknown User',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=unknown&backgroundColor=3B82F6',
            is_admin: false,
            is_student: false,
            points: 0,
            equipped_avatar_frame: null,
        };
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        applyFiltersWithCategory(category);
    };

    const handleSortChange = (sort) => {
        setSortBy(sort);
        applyFiltersWithSort(sort);
    };

    const applyFilters = () => {
        router.get(route('forum.index'), {
            search: searchQuery,
            category: selectedCategory,
            sort: sortBy,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const applyFiltersWithCategory = (category) => {
        router.get(route('forum.index'), {
            search: searchQuery,
            category: category,
            sort: sortBy,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const applyFiltersWithSort = (sort) => {
        router.get(route('forum.index'), {
            search: searchQuery,
            category: selectedCategory,
            sort: sort,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleQuickAction = (postId, action) => {
        if (action === 'delete') {
            if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
                return;
            }
            router.delete(route('forum.destroy', postId), {
                preserveScroll: true,
            });
        } else if (action === 'pin') {
            router.post(route('forum.pin', postId), {}, {
                preserveScroll: true,
            });
        } else if (action === 'lock') {
            router.post(route('forum.lock', postId), {}, {
                preserveScroll: true,
            });
        }
    };

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        
        if (newTheme) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        window.dispatchEvent(new Event('theme-changed'));
    };

    const totalPosts = posts.total || 0;
    const totalReplies = posts.data.reduce((sum, post) => sum + (post.replies_count || 0), 0);
    const activeUsers = new Set(posts.data.map(post => post.user_id)).size;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Admin - Forum Management" />

            <div className={cn(
                "min-h-screen transition-colors duration-500 py-8",
                isDark ? "bg-slate-950" : "bg-gradient-to-br from-gray-50 to-gray-100"
            )}>
                {/* Animated Background */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    {isDark ? (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-red-950 to-slate-950" />
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
                            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
                        </>
                    ) : (
                        <>
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
                            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
                        </>
                    )}
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    
                    {/* Admin Header */}
                    <div className="mb-8">
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/50">
                                            <Shield className="w-7 h-7 text-white" />
                                        </div>
                                        <h1 className="text-3xl font-bold text-white drop-shadow-lg">Forum Management</h1>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        Manage posts, moderate content, and oversee community discussions
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={toggleTheme}
                                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                                    >
                                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                    </button>
                                    <Link
                                        href={route('forum.create')}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-red-500/50"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Create Announcement
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <ForumStats
                        totalPosts={totalPosts}
                        totalReplies={totalReplies}
                        activeUsers={activeUsers}
                        categoryStats={categoryStats}
                    />

                    {/* Filters */}
                    <ForumFilters
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedCategory={selectedCategory}
                        sortBy={sortBy}
                        categories={categories}
                        onSearch={handleSearch}
                        onCategoryChange={handleCategoryChange}
                        onSortChange={handleSortChange}
                    />

                    {/* Posts List */}
                    {posts.data.length > 0 ? (
                        <>
                            <div className="space-y-4">
                                {posts.data.map((post) => {
                                    const author = getAuthorInfo(post);
                                    
                                    // Format time ago
                                    const getTimeAgo = (date) => {
                                        if (!date) return '';
                                        const now = new Date();
                                        const posted = new Date(date);
                                        const seconds = Math.floor((now - posted) / 1000);
                                        
                                        if (seconds < 60) return 'just now';
                                        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
                                        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
                                        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
                                        return `${Math.floor(seconds / 604800)}w ago`;
                                    };
                                    
                                    const timeAgo = getTimeAgo(post.created_at);

                                    return (
                                        <div 
                                            key={post.post_id}
                                            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300"
                                        >
                                            <div className="p-6">
                                                <div className="flex gap-4">
                                                    {/* Author Avatar */}
                                                    <div className="flex-shrink-0">
                                                        <UserAvatar author={author} size="lg" showBadges={true} />
                                                    </div>

                                                    {/* Post Content */}
                                                    <div className="flex-1 min-w-0">
                                                        {/* Header with Badges */}
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                                    <CategoryBadge category={post.category} />
                                                                    
                                                                    {post.is_pinned && (
                                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/50 ring-2 ring-white/20">
                                                                            <Pin className="w-3 h-3" />
                                                                            Pinned
                                                                        </span>
                                                                    )}
                                                                    
                                                                    {post.is_locked && (
                                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/50 ring-2 ring-white/20">
                                                                            <Lock className="w-3 h-3" />
                                                                            Locked
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Title */}
                                                                <Link
                                                                    href={route('forum.show', post.post_id)}
                                                                    className="group"
                                                                >
                                                                    <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all line-clamp-2 drop-shadow-lg">
                                                                        {post.title}
                                                                    </h3>
                                                                </Link>

                                                                {/* Author Info with Points */}
                                                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                                                                    <span className="font-medium text-white">{author.name}</span>
                                                                    
                                                                    {author.is_admin && (
                                                                        <span className="px-2 py-0.5 text-xs font-bold rounded bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30">
                                                                            Admin
                                                                        </span>
                                                                    )}
                                                                    
                                                                    {/* ✅ 显示学生积分 */}
                                                                    {author.is_student && (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30">
                                                                            <Star className="w-3 h-3 fill-current" />
                                                                            {author.points} pts
                                                                        </span>
                                                                    )}
                                                                    
                                                                    <span>•</span>
                                                                    <span>{timeAgo}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Content Preview */}
                                                        <p className="text-gray-400 line-clamp-2 mb-4">
                                                            {post.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                                                            {post.content.length > 200 && '...'}
                                                        </p>

                                                        {/* Footer Stats & Actions */}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-6 text-sm text-gray-500">
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
                                                            </div>

                                                            {/* Admin Quick Actions */}
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleQuickAction(post.post_id, 'pin')}
                                                                    className={cn(
                                                                        "p-2 rounded-lg transition-all",
                                                                        post.is_pinned
                                                                            ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/50"
                                                                            : "bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white"
                                                                    )}
                                                                    title={post.is_pinned ? 'Unpin' : 'Pin'}
                                                                >
                                                                    <Pin className="w-4 h-4" />
                                                                </button>
                                                                
                                                                <button
                                                                    onClick={() => handleQuickAction(post.post_id, 'lock')}
                                                                    className={cn(
                                                                        "p-2 rounded-lg transition-all",
                                                                        post.is_locked
                                                                            ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/50"
                                                                            : "bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white"
                                                                    )}
                                                                    title={post.is_locked ? 'Unlock' : 'Lock'}
                                                                >
                                                                    <Lock className="w-4 h-4" />
                                                                </button>
                                                                
                                                                <Link
                                                                    href={route('forum.edit', post.post_id)}
                                                                    className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/50"
                                                                    title="Edit"
                                                                >
                                                                    <Edit3 className="w-4 h-4" />
                                                                </Link>
                                                                
                                                                <button
                                                                    onClick={() => handleQuickAction(post.post_id, 'delete')}
                                                                    className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/50"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
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
                            {posts.last_page > 1 && (
                                <div className="mt-8">
                                    <Pagination 
                                        links={posts.links}
                                        currentPage={posts.current_page}
                                        lastPage={posts.last_page}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-12 text-center">
                            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <h3 className="text-2xl font-bold text-white mb-2">
                                No posts found
                            </h3>
                            <p className="text-gray-400 mb-6">
                                {filters.search || filters.category !== 'all'
                                    ? 'Try adjusting your filters or search query.'
                                    : 'No posts have been created yet.'}
                            </p>
                            <Link
                                href={route('forum.create')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-red-500/50"
                            >
                                <Plus className="w-5 h-5" />
                                Create First Post
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}