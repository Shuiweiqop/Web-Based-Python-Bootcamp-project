<?php

namespace App\Http\Controllers;

use App\Helpers\ForumHelper;
use App\Models\ForumFavorite;
use App\Models\ForumPost;
use App\Models\ForumPostLike;
use App\Models\ForumReply;
use App\Models\ForumReport;
use App\Services\ForumService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ForumController extends Controller
{
    public function __construct(
        private readonly ForumService $forum,
    ) {}

    /**
     * 显示论坛首页 - 帖子列表
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', ForumPost::class);

        $userId = auth()->user()->user_Id;

        $query = ForumPost::query()
            ->with([
                'user.studentProfile',
                'studentProfile',
                // 🔥 加载装备的头像框
                'user.studentProfile.rewardInventory' => function ($query) {
                    $query->where('is_equipped', true)
                        ->whereHas('reward', function ($q) {
                            $q->where('reward_type', 'avatar_frame');
                        })
                        ->with('reward');
                },
            ])
            ->withCount('replies');

        // 分类筛选
        if ($request->has('category') && $request->category !== 'all') {
            $query->byCategory($request->category);
        }

        // 搜索
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // 排序
        $sort = $request->get('sort', 'recent');
        switch ($sort) {
            case 'popular':
                $query->popular();
                break;
            case 'views':
                $query->orderBy('views', 'desc');
                break;
            case 'replies':
                $query->orderBy('replies_count', 'desc');
                break;
            default:
                $query->orderBy('is_pinned', 'desc')->recent();
        }

        $posts = $query->paginate(20);

        // 获取热门标签/类别统计
        $categoryStats = ForumPost::select('category', DB::raw('count(*) as count'))
            ->groupBy('category')
            ->get()
            ->pluck('count', 'category');

        // ✅ 根据角色返回不同页面
        $isAdmin = ForumHelper::isAdmin();
        $pageName = $isAdmin ? 'Admin/Forum/Index' : 'Student/Forum/Index';

        if ($isAdmin) {
            return Inertia::render('Admin/Forum/Index', [
                'posts' => $posts,
                'categoryStats' => $categoryStats,
                'categories' => ForumHelper::getCategories(),
                'filters' => [
                    'search' => $request->search,
                    'category' => $request->category ?? 'all',
                    'sort' => $sort,
                ],
            ]);
        }

        return Inertia::render('Student/Forum/Index', [
            'posts' => $posts,
            'categoryStats' => $categoryStats,
            'categories' => ForumHelper::getCategories(),
            'filters' => [
                'search' => $request->search,
                'category' => $request->category ?? 'all',
                'sort' => $sort,
            ],
        ]);
    }

    /**
     * 显示创建帖子表单
     */
    public function create()
    {
        $this->authorize('create', ForumPost::class);

        $categories = ForumHelper::getCategories();

        if (ForumHelper::isAdmin()) {
            return Inertia::render('Admin/Forum/Create', [
                'categories' => $categories,
            ]);
        }

        return Inertia::render('Student/Forum/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * 保存新帖子
     */
    public function store(Request $request)
    {
        $this->authorize('create', ForumPost::class);

        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'content' => 'required|string|min:10',
            'category' => 'required|in:general,help,showcase,resources,announcements,feedback',
        ]);

        try {
            $post = ForumPost::create([
                'user_id' => auth()->id(),
                'title' => $validated['title'],
                'content' => ForumHelper::sanitizeContent($validated['content']),
                'category' => $validated['category'],
            ]);

            // 如果是学生，增加活跃度
            if (ForumHelper::isStudent()) {
                $student = ForumHelper::getCurrentStudentProfile();
                $student?->updateStreak();
            }

            return redirect()->route('forum.show', $post->post_id)
                ->with('success', 'Post created successfully!');
        } catch (\Exception $e) {
            Log::error('Forum post creation failed: '.$e->getMessage());

            return back()->withErrors(['error' => 'Failed to create post. Please try again.']);
        }
    }

    /**
     * 显示单个帖子详情
     */
    public function show($id)
    {
        $this->authorize('viewAny', ForumPost::class);

        $userId = auth()->user()->user_Id;

        $post = ForumPost::withForumDetail()->findOrFail($id);

        // ✅ 增加浏览量（带防刷机制）
        $viewCounted = $post->incrementViews($userId);

        if ($viewCounted) {
            Log::info('👁️ Post view counted', [
                'post_id' => $id,
                'user_id' => $userId,
                'total_views' => $post->fresh()->views,
            ]);
        }

        // 检查当前用户的互动状态
        $isLiked = ForumPostLike::isLiked($userId, $post->post_id);
        $isFavorited = ForumFavorite::isFavorited($userId, $post->post_id);
        $hasReported = ForumReport::hasReported($userId, 'post', $post->post_id);

        $currentUser = auth()->user();

        // Both roles get the same prop shape; only the page differs. The
        // permissions used to be hardcoded true for administrators, which was
        // right by luck — the policy answers the same way but derives it.
        $props = [
            'post' => $post,
            'isLiked' => $isLiked,
            'isFavorited' => $isFavorited,
            'hasReported' => $hasReported,
            'canEdit' => $currentUser->can('update', $post),
            'canDelete' => $currentUser->can('delete', $post),
            'canPin' => $currentUser->can('pin', $post),
            'canLock' => $currentUser->can('lock', $post),
        ];

        return Inertia::render(
            ForumHelper::isAdmin() ? 'Admin/Forum/Show' : 'Student/Forum/Show',
            $props
        );
    }

    /**
     * 显示编辑帖子表单
     */
    public function edit($id)
    {
        $post = ForumPost::findOrFail($id);

        $this->authorize('update', $post);

        $categories = ForumHelper::getCategories();

        if (ForumHelper::isAdmin()) {
            return Inertia::render('Admin/Forum/Edit', [
                'post' => $post,
                'categories' => $categories,
            ]);
        }

        return Inertia::render('Student/Forum/Edit', [
            'post' => $post,
            'categories' => $categories,
        ]);
    }

    /**
     * 更新帖子
     */
    public function update(Request $request, $id)
    {
        $post = ForumPost::findOrFail($id);

        $this->authorize('update', $post);

        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'content' => 'required|string|min:10',
            'category' => 'required|in:general,help,showcase,resources,announcements,feedback',
        ]);

        try {
            $post->update([
                'title' => $validated['title'],
                'content' => ForumHelper::sanitizeContent($validated['content']),
                'category' => $validated['category'],
            ]);

            return redirect()->route('forum.show', $post->post_id)
                ->with('success', 'Post updated successfully!');
        } catch (\Exception $e) {
            Log::error('Forum post update failed: '.$e->getMessage());

            return back()->withErrors(['error' => 'Failed to update post.']);
        }
    }

    /**
     * 删除帖子
     */
    public function destroy($id)
    {
        $post = ForumPost::findOrFail($id);
        $userId = auth()->user()->user_Id;

        $this->authorize('delete', $post);

        try {
            $post->delete();

            return redirect()->route('forum.index')
                ->setStatusCode(303)  // ✅ 加上 303 重定向
                ->with('success', 'Post deleted successfully!');
        } catch (\Exception $e) {
            Log::error('=== Post Deletion FAILED ===', [
                'post_id' => $id,
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors(['error' => 'Failed to delete post.']);
        }
    }

    /**
     * 回复帖子
     */
    /**
     * 回复帖子
     */
    public function reply(Request $request, $id)
    {
        $post = ForumPost::findOrFail($id);

        $this->authorize('reply', $post);

        if ($post->is_locked && ! ForumHelper::isAdmin()) {
            return back()->withErrors(['error' => 'This post is locked and cannot be replied to.']);
        }

        $validated = $request->validate([
            'content' => 'required|string|min:5',
            'parent_reply_id' => 'nullable|exists:forum_replies,reply_id',
        ]);

        try {
            // Validation proves the parent exists, not that it belongs to this
            // thread; the service rejects one from another post.
            $this->forum->resolveParentReply($post, $validated['parent_reply_id'] ?? null);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['parent_reply_id' => $e->getMessage()]);
        }

        try {
            $result = $this->forum->createReply($post, $request->user(), $validated);

            return back()->with([
                'success' => 'Reply posted successfully!',
                'missionProgress' => $result['missionProgress'],
                'post' => ForumPost::withForumDetail()->findOrFail($id),
            ]);
        } catch (\Exception $e) {
            Log::error('Forum reply creation failed', [
                'post_id' => $id,
                'user_id' => $request->user()->user_Id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors(['error' => 'Failed to post reply. Please try again.']);
        }
    }

    /**
     * 编辑回复
     */
    public function updateReply(Request $request, $replyId)
    {
        $reply = ForumReply::findOrFail($replyId);

        $this->authorize('update', $reply);

        $validated = $request->validate([
            'content' => 'required|string|min:5',
        ]);

        try {
            $this->forum->updateReply($reply, $validated['content']);

            return back()->with('success', 'Reply updated successfully!');
        } catch (\Exception $e) {
            Log::error('Forum reply update failed: '.$e->getMessage(), ['reply_id' => $replyId]);

            return back()->withErrors(['error' => 'Failed to update reply.']);
        }
    }

    /**
     * 删除回复
     */
    public function destroyReply($replyId)
    {
        $reply = ForumReply::findOrFail($replyId);

        $this->authorize('delete', $reply);

        // 保存帖子ID用于重定向
        $postId = $reply->post_id;

        $userId = auth()->user()->user_Id;

        try {
            $reply->delete();

            // 🔥 删除回复后返回到帖子详情页
            return redirect()
                ->route('forum.show', $postId)
                ->with('success', 'Reply deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Forum reply deletion failed: '.$e->getMessage(), [
                'reply_id' => $replyId,
                'user_id' => $userId,
            ]);

            return redirect()
                ->route('forum.show', $postId)
                ->with('error', 'Failed to delete reply. Please try again.');
        }
    }

    /**
     * 标记/取消标记最佳答案
     */
    public function markSolution(Request $request, $replyId)
    {
        $reply = ForumReply::findOrFail($replyId);

        $this->authorize('markSolution', $reply);

        try {
            $result = $this->forum->toggleSolution($reply, $request->user());

            return back()->with('success', $result['message']);
        } catch (\Exception $e) {
            Log::error('Mark solution failed: '.$e->getMessage(), ['reply_id' => $replyId]);

            return back()->withErrors(['error' => 'Failed to mark solution.']);
        }
    }

    /**
     * 点赞/取消点赞帖子 (AJAX)
     */
    public function toggleLike(Request $request, $id)
    {
        $post = ForumPost::findOrFail($id);

        $this->authorize('like', $post);

        try {
            $isLiked = $this->forum->togglePostLike($post, $request->user());

            $userId = $request->user()->user_Id;
            $post = ForumPost::withForumDetail()->findOrFail($id);

            return back()->with([
                'success' => $isLiked ? 'Post liked!' : 'Post unliked!',
                'post' => $post,
                'isLiked' => $isLiked,
                'isFavorited' => ForumFavorite::isFavorited($userId, $post->post_id),
                'hasReported' => ForumReport::hasReported($userId, 'post', $post->post_id),
            ]);
        } catch (\Exception $e) {
            Log::error('Toggle post like failed', [
                'post_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to like post. Please try again.');
        }
    }

    /**
     * 点赞/取消点赞回复 (AJAX)
     */
    public function toggleReplyLike(Request $request, $replyId)
    {
        $reply = ForumReply::findOrFail($replyId);

        $this->authorize('like', $reply);

        try {
            $isLiked = $this->forum->toggleReplyLike($reply, $request->user());

            return back()->with('success', $isLiked ? 'Reply liked!' : 'Reply unliked!');
        } catch (\Exception $e) {
            Log::error('Toggle reply like failed', [
                'reply_id' => $replyId,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to like reply. Please try again.');
        }
    }

    /**
     * 收藏/取消收藏帖子 (AJAX)
     */
    public function toggleFavorite(Request $request, $id)
    {
        $post = ForumPost::findOrFail($id);

        $this->authorize('favorite', $post);

        try {
            $isFavorited = $this->forum->toggleFavorite($post, $request->user());

            $userId = $request->user()->user_Id;

            // withForumDetail(), not the thinner eager-load this used to build:
            // that one omitted equipped avatar frames, so favouriting stripped
            // them from the page until the next full load.
            $post = ForumPost::withForumDetail()->findOrFail($id);

            return back()->with([
                'success' => $isFavorited ? 'Post favorited!' : 'Post unfavorited!',
                'post' => $post,
                'isLiked' => ForumPostLike::isLiked($userId, $post->post_id),
                'isFavorited' => $isFavorited,
                'hasReported' => ForumReport::hasReported($userId, 'post', $post->post_id),
            ]);
        } catch (\Exception $e) {
            Log::error('Toggle favorite failed: '.$e->getMessage(), ['post_id' => $id]);

            return back()->with('error', 'Failed to favorite post. Please try again.');
        }
    }

    /**
     * 置顶/取消置顶帖子（仅 Admin）
     */
    public function togglePin($id)
    {
        $post = ForumPost::findOrFail($id);

        $this->authorize('pin', $post);

        try {
            $post->update(['is_pinned' => ! $post->is_pinned]);

            $message = $post->is_pinned ? 'Post pinned successfully!' : 'Post unpinned successfully!';

            return back()->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Toggle pin failed: '.$e->getMessage());

            return back()->with('error', 'Failed to pin post. Please try again.');
        }
    }

    /**
     * 锁定/解锁帖子（仅 Admin）
     */
    public function toggleLock($id)
    {
        $post = ForumPost::findOrFail($id);

        $this->authorize('lock', $post);

        try {
            $post->update(['is_locked' => ! $post->is_locked]);

            $message = $post->is_locked ? 'Post locked successfully!' : 'Post unlocked successfully!';

            return back()->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Toggle lock failed: '.$e->getMessage());

            return back()->with('error', 'Failed to lock post. Please try again.');
        }
    }

    /**
     * 我的帖子
     */
    public function myPosts()
    {
        $this->authorize('viewAny', ForumPost::class);

        $posts = ForumPost::where('user_id', auth()->id())
            ->withCount('replies')
            ->recent()
            ->paginate(20);

        return Inertia::render('Student/Forum/MyPosts', [
            'posts' => $posts,
        ]);
    }

    /**
     * 我的收藏
     */
    public function myFavorites()
    {
        $this->authorize('viewAny', ForumPost::class);

        $favorites = ForumFavorite::where('user_id', auth()->id())
            ->with(['post.user', 'post.studentProfile'])
            ->recent()
            ->paginate(20);

        if (ForumHelper::isAdmin()) {
            return Inertia::render('Admin/Forum/MyFavorites', [
                'favorites' => $favorites,
            ]);
        }

        return Inertia::render('Student/Forum/MyFavorites', [
            'favorites' => $favorites,
        ]);
    }

    /**
     * 举报帖子
     */
    public function reportPost(Request $request, $id)
    {
        $post = ForumPost::findOrFail($id);

        if ((int) $post->user_id === (int) auth()->user()->user_Id) {
            return back()->with('error', 'You cannot report your own post.');
        }

        $this->authorize('report', $post);

        $validated = $request->validate([
            'reason' => 'required|in:spam,inappropriate,harassment,misinformation,off_topic,other',
            'description' => 'nullable|string|max:500',
        ]);

        try {
            $report = \App\Models\ForumReport::createReport(
                auth()->id(),
                'post',
                $post->post_id,
                $validated['reason'],
                $validated['description'] ?? null
            );

            if (! $report) {
                return back()->with('error', 'You have already reported this post.');
            }

            return back()->with('success', 'Report submitted successfully. Our team will review it.');
        } catch (\Exception $e) {
            Log::error('Report post failed: '.$e->getMessage());

            return back()->with('error', 'Failed to submit report. Please try again.');
        }
    }

    /**
     * 举报回复
     */
    public function reportReply(Request $request, $replyId)
    {
        $reply = ForumReply::findOrFail($replyId);

        if ((int) $reply->user_id === (int) auth()->user()->user_Id) {
            return back()->with('error', 'You cannot report your own reply.');
        }

        $this->authorize('report', $reply);

        $validated = $request->validate([
            'reason' => 'required|in:spam,inappropriate,harassment,misinformation,off_topic,other',
            'description' => 'nullable|string|max:500',
        ]);

        try {
            $report = \App\Models\ForumReport::createReport(
                auth()->id(),
                'reply',
                $reply->reply_id,
                $validated['reason'],
                $validated['description'] ?? null
            );

            if (! $report) {
                return back()->with('error', 'You have already reported this reply.');
            }

            return back()->with('success', 'Report submitted successfully. Our team will review it.');
        } catch (\Exception $e) {
            Log::error('Report reply failed: '.$e->getMessage());

            return back()->with('error', 'Failed to submit report. Please try again.');
        }
    }
}
