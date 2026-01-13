import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';
import ForumStats from './Components/ForumStats';
import ForumFilters from './Components/ForumFilters';
import PostCard from './Components/PostCard';
import Pagination from '@/Components/Pagination';
import { PenSquare, FileText, Bookmark, Zap } from 'lucide-react';

export default function Index({ auth, posts, categoryStats, categories, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [sortBy, setSortBy] = useState(filters.sort || 'recent');

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('forum.index'), {
            search: searchQuery,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            sort: sortBy,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle category change
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        router.get(route('forum.index'), {
            search: searchQuery || undefined,
            category: category !== 'all' ? category : undefined,
            sort: sortBy,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle sort change
    const handleSortChange = (sort) => {
        setSortBy(sort);
        router.get(route('forum.index'), {
            search: searchQuery || undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            sort: sort,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Calculate total stats
    const totalPosts = posts.total;
    const totalReplies = posts.data.reduce((sum, post) => sum + (post.replies_count || 0), 0);
    const activeUsers = new Set(posts.data.map(post => post.user_id)).size;

    return (
        <StudentLayout>
            <Head title="Community Forum" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-5xl font-bold text-white flex items-center gap-4 drop-shadow-2xl">
                            <span className="text-6xl animate-bounce">💬</span>
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Community Forum
                            </span>
                        </h1>
                        <p className="mt-3 text-gray-300 text-lg drop-shadow-lg">
                            Share knowledge, ask questions, and connect with the community
                        </p>
                    </div>
                    <Link
                        href={route('forum.create')}
                        className="
                            mt-6 md:mt-0 
                            inline-flex items-center gap-3 
                            px-8 py-4 
                            bg-gradient-to-r from-blue-500 to-purple-600 
                            hover:from-blue-600 hover:to-purple-700 
                            text-white font-bold text-lg
                            rounded-xl 
                            shadow-2xl shadow-blue-500/50
                            hover:shadow-blue-500/70
                            hover:scale-105
                            transition-all duration-300
                            ring-2 ring-blue-400/50 hover:ring-blue-400/70
                        "
                    >
                        <PenSquare className="w-6 h-6" />
                        New Post
                    </Link>
                </div>

                {/* Stats Cards */}
                <ForumStats 
                    totalPosts={totalPosts}
                    totalReplies={totalReplies}
                    activeUsers={activeUsers}
                    categoryStats={categoryStats}
                />

                {/* Filters & Search */}
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
                <div className="space-y-4">
                    {posts.data.length === 0 ? (
                        <div className="
                            bg-black/70 backdrop-blur-xl 
                            border-2 border-white/30 
                            rounded-3xl shadow-2xl 
                            p-16 text-center
                        ">
                            <div className="text-8xl mb-6 animate-bounce">🔍</div>
                            <h3 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
                                No posts found
                            </h3>
                            <p className="text-gray-300 text-lg mb-8">
                                {filters.search || filters.category !== 'all'
                                    ? 'Try adjusting your filters or search query'
                                    : 'Be the first to start a conversation!'}
                            </p>
                            <Link
                                href={route('forum.create')}
                                className="
                                    inline-flex items-center gap-3 
                                    px-8 py-4 
                                    bg-gradient-to-r from-blue-500 to-purple-600 
                                    hover:from-blue-600 hover:to-purple-700 
                                    text-white font-bold text-lg
                                    rounded-xl 
                                    shadow-2xl shadow-blue-500/50
                                    hover:scale-105
                                    transition-all duration-300
                                    border-2 border-white/30
                                "
                            >
                                <PenSquare className="w-5 h-5" />
                                Create First Post
                            </Link>
                        </div>
                    ) : (
                        <>
                            {posts.data.map((post) => (
                                <PostCard
                                    key={post.post_id}
                                    post={post}
                                    currentUserId={auth.user.user_Id || auth.user.id}
                                />
                            ))}

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
                    )}
                </div>

                {/* Quick Actions Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href={route('forum.my-posts')}
                        className="
                            bg-black/70 backdrop-blur-xl 
                            border-2 border-white/30 
                            rounded-3xl shadow-2xl 
                            hover:shadow-3xl hover:border-white/50
                            p-6 
                            hover:scale-105
                            transition-all duration-300
                            group
                        "
                    >
                        <div className="flex items-center gap-4">
                            <div className="
                                p-4 
                                bg-gradient-to-br from-blue-500 to-cyan-500 
                                rounded-2xl 
                                shadow-xl shadow-blue-500/50
                                group-hover:scale-110 group-hover:rotate-6
                                transition-all duration-300
                                border-2 border-white/30
                            ">
                                <FileText className="w-8 h-8 text-white drop-shadow-lg" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-xl drop-shadow-lg">
                                    My Posts
                                </h3>
                                <p className="text-sm text-gray-300">
                                    View your posts
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href={route('forum.my-favorites')}
                        className="
                            bg-black/70 backdrop-blur-xl 
                            border-2 border-white/30 
                            rounded-3xl shadow-2xl 
                            hover:shadow-3xl hover:border-white/50
                            p-6 
                            hover:scale-105
                            transition-all duration-300
                            group
                        "
                    >
                        <div className="flex items-center gap-4">
                            <div className="
                                p-4 
                                bg-gradient-to-br from-yellow-500 to-orange-500 
                                rounded-2xl 
                                shadow-xl shadow-yellow-500/50
                                group-hover:scale-110 group-hover:rotate-6
                                transition-all duration-300
                                border-2 border-white/30
                            ">
                                <Bookmark className="w-8 h-8 text-white drop-shadow-lg" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-xl drop-shadow-lg">
                                    Favorites
                                </h3>
                                <p className="text-sm text-gray-300">
                                    Saved posts
                                </p>
                            </div>
                        </div>
                    </Link>

                    <div className="
                        bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 
                        rounded-3xl shadow-2xl shadow-purple-500/50
                        p-6
                        relative overflow-hidden
                        group
                        hover:scale-105
                        transition-all duration-300
                        border-2 border-white/40
                    ">
                        {/* Animated Background */}
                        <div className="
                            absolute inset-0 
                            bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                            opacity-0 group-hover:opacity-100
                            transition-opacity duration-300
                        " />
                        
                        <div className="relative flex items-center gap-4">
                            <div className="
                                p-4 
                                bg-white/20 backdrop-blur-sm
                                rounded-2xl 
                                shadow-xl
                                group-hover:scale-110 group-hover:rotate-12
                                transition-all duration-300
                                border-2 border-white/30
                            ">
                                <Zap className="w-8 h-8 text-white drop-shadow-lg animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-xl drop-shadow-lg">
                                    Be Active!
                                </h3>
                                <p className="text-sm text-white/90">
                                    Earn points by participating
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}