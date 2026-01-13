import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PostCard from '@/Pages/Student/Forum/Components/PostCard';
import Pagination from '@/Components/Pagination';
import { Shield, ArrowLeft } from 'lucide-react';

export default function MyPosts({ auth, posts }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Admin - My Posts" />

            <div className="min-h-screen py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Back Button */}
                    <Link
                        href={route('forum.index')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Forum</span>
                    </Link>

                    {/* Page Header */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden mb-8 border-l-4 border-red-500">
                        <div className="bg-gradient-to-r from-red-500 to-orange-600 px-6 py-8 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Shield className="w-8 h-8" />
                                        <h1 className="text-3xl font-bold">My Posts</h1>
                                    </div>
                                    <p className="text-red-100">
                                        Manage all your forum posts and announcements
                                    </p>
                                </div>
                                <div className="hidden md:block">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-4">
                                        <div className="text-4xl font-bold">{posts.total}</div>
                                        <div className="text-sm text-red-100">Total Posts</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{posts.total}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Posts</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {posts.data.reduce((sum, post) => sum + (post.likes || 0), 0)}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Likes</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {posts.data.reduce((sum, post) => sum + (post.replies_count || 0), 0)}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Replies</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {posts.data.reduce((sum, post) => sum + (post.views || 0), 0)}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
                            </div>
                        </div>
                    </div>

                    {/* Create New Post Button */}
                    <div className="mb-6">
                        <Link
                            href={route('forum.create')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg shadow-red-500/30 hover:shadow-xl transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Create New Post</span>
                        </Link>
                    </div>

                    {/* Posts List */}
                    {posts.data.length > 0 ? (
                        <>
                            <div className="space-y-4">
                                {posts.data.map((post) => (
                                    <div key={post.post_id} className="border-l-4 border-red-500 rounded-r-xl overflow-hidden">
                                        <PostCard 
                                            post={post} 
                                            currentUserId={auth.user.user_Id || auth.user.id}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {posts.last_page > 1 && (
                                <div className="mt-8">
                                    <Pagination links={posts.links} />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-12 text-center">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                No posts yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                You haven't created any posts yet. Create your first announcement or post!
                            </p>
                            <Link
                                href={route('forum.create')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-red-500/30"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Create Your First Post</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}