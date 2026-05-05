<?php

namespace App\Http\Controllers;

use App\Models\ForumPost;
use App\Models\ForumReply;
use App\Models\ForumFavorite;
use App\Models\ForumPostLike;
use App\Models\ForumReplyLike;
use App\Helpers\ForumHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Notification;
use App\Services\DailyChallengeService;

class ForumController extends Controller
{
    /**
     * 显示论坛首页 - 帖子列表
     */
    public function index(Request $request)
    {
        // ✅ 确保用户已登录
        if (!auth()->check()) {
            return redirect()->route('login')->with('error', 'Please login to access the forum.');
        }

        $userId = auth()->user()->user_Id;

        // 检查权限
        if (!ForumHelper::canAccessForum()) {
            Log::warning('Forum access denied', ['user_id' => $userId]);
            return redirect()->route('dashboard')->with('error', 'You do not have permission to access the forum.');
        }

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
                }
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
        if (!auth()->check() || !ForumHelper::canAccessForum()) {
            abort(403, 'You do not have permission to create posts.');
        }

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
        if (!auth()->check() || !ForumHelper::canAccessForum()) {
            abort(403);
        }

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
            Log::error('Forum post creation failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create post. Please try again.']);
        }
    }

    /**
     * 显示单个帖子详情
     */
    public function show($id)
    {
        if (!auth()->check() || !ForumHelper::canAccessForum()) {
            return redirect()->route('login')->with('error', 'Please login to view this post.');
        }

        $userId = auth()->user()->user_Id;

        $post = ForumPost::with([
            'user.studentProfile',
            'studentProfile',
            'user.studentProfile.rewardInventory' => function ($query) {
                $query->where('is_equipped', true)
                    ->whereHas('reward', function ($q) {
                        $q->where('reward_type', 'avatar_frame');
                    })
                    ->with('reward');
            },
            'replies' => function ($query) {
                $query->topLevel()
                    ->with([
                        'user.studentProfile',
                        'studentProfile',
                        'user.studentProfile.rewardInventory' => function ($q) {
                            $q->where('is_equipped', true)
                                ->whereHas('reward', function ($r) {
                                    $r->where('reward_type', 'avatar_frame');
                                })
                                ->with('reward');
                        },
                        'childReplies.user.studentProfile',
                        'childReplies.studentProfile',
                        'childReplies.user.studentProfile.rewardInventory' => function ($q) {
                            $q->where('is_equipped', true)
                                ->whereHas('reward', function ($r) {
                                    $r->where('reward_type', 'avatar_frame');
                                })
                                ->with('reward');
                        },
                        'childReplies.childReplies.user.studentProfile',
                        'childReplies.childReplies.studentProfile',
                        'childReplies.childReplies.user.studentProfile.rewardInventory' => function ($q) {
                            $q->where('is_equipped', true)
                                ->whereHas('reward', function ($r) {
                                    $r->where('reward_type', 'avatar_frame');
                                })
                                ->with('reward');
                        }
                    ])
                    ->orderBy('is_solution', 'desc')
                    ->orderBy('created_at', 'asc');
            }
        ])->findOrFail($id);

        // ✅ 增加浏览量（带防刷机制）
        $viewCounted = $post->incrementViews($userId);

        if ($viewCounted) {
            Log::info('👁️ Post view counted', [
                'post_id' => $id,
                'user_id' => $userId,
                'total_views' => $post->fresh()->views
            ]);
        }

        // 检查当前用户的互动状态
        $isLiked = ForumPostLike::isLiked($userId, $post->post_id);
        $isFavorited = ForumFavorite::isFavorited($userId, $post->post_id);
        $hasReported = \App\Models\ForumReport::hasReported($userId, 'post', $post->post_id);

        if (ForumHelper::isAdmin()) {
            return Inertia::render('Admin/Forum/Show', [
                'post' => $post,
                'isLiked' => $isLiked,
                'isFavorited' => $isFavorited,
                'hasReported' => $hasReported,
                'canEdit' => $post->canEdit($userId),
                'canDelete' => true,
                'canPin' => true,
                'canLock' => true,
            ]);
        }

        return Inertia::render('Student/Forum/Show', [
            'post' => $post,
            'isLiked' => $isLiked,
            'isFavorited' => $isFavorited,
            'hasReported' => $hasReported,
            'canEdit' => $post->canEdit($userId),
            'canDelete' => $post->canDelete($userId),
            'canPin' => false,
            'canLock' => false,
        ]);
    }
    /**
     * 显示编辑帖子表单
     */
    public function edit($id)
    {
        if (!auth()->check()) {
            abort(403, 'You must be logged in to edit posts.');
        }

        $post = ForumPost::findOrFail($id);

        if (!$post->canEdit(auth()->id())) {
            abort(403, 'You do not have permission to edit this post.');
        }

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
        if (!auth()->check()) {
            abort(403);
        }

        $post = ForumPost::findOrFail($id);

        if (!$post->canEdit(auth()->id())) {
            abort(403);
        }

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
            Log::error('Forum post update failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update post.']);
        }
    }

    /**
     * 删除帖子
     */
    public function destroy($id)
    {
        if (!auth()->check()) {
            abort(403);
        }

        $post = ForumPost::findOrFail($id);
        $userId = auth()->user()->user_Id;

        $canDelete = $post->canDelete($userId);

        if (!$canDelete) {
            abort(403, 'You do not have permission to delete this post.');
        }

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
        if (!auth()->check() || !ForumHelper::canAccessForum()) {
            abort(403);
        }

        $post = ForumPost::findOrFail($id);

        if ($post->is_locked && !ForumHelper::isAdmin()) {
            return back()->withErrors(['error' => 'This post is locked and cannot be replied to.']);
        }

        $validated = $request->validate([
            'content' => 'required|string|min:5',
            'parent_reply_id' => 'nullable|exists:forum_replies,reply_id',
        ]);

        try {
            $currentUser = auth()->user();
            $userId = $currentUser->user_Id; // ✅ 使用正确的主键

            Log::info('=== Creating Reply ===', [
                'user_id' => $userId,
                'post_id' => $post->post_id,
                'parent_reply_id' => $validated['parent_reply_id'] ?? null,
                'content_length' => strlen($validated['content']),
            ]);

            // ✅ 创建回复，使用正确的 user_id 字段
            $reply = ForumReply::create([
                'post_id' => $post->post_id,
                'user_id' => $userId, // ✅ 改用 user_Id
                'parent_reply_id' => $validated['parent_reply_id'] ?? null,
                'content' => ForumHelper::sanitizeContent($validated['content']),
            ]);

            Log::info('✅ Reply created successfully', [
                'reply_id' => $reply->reply_id,
                'post_id' => $post->post_id,
                'user_id' => $userId,
            ]);

            // ✅ 发送通知
            if ($validated['parent_reply_id']) {
                $parentReply = ForumReply::find($validated['parent_reply_id']);

                if ($parentReply && $parentReply->user_id !== $userId) {
                    Notification::create([
                        'user_Id' => $parentReply->user_id,
                        'type' => 'community',
                        'priority' => 'normal',
                        'title' => '💬 New Reply',
                        'message' => "{$currentUser->name} replied to your comment: " . \Illuminate\Support\Str::limit($validated['content'], 50),
                        'icon' => 'message-square',
                        'color' => 'green',
                        'data' => [
                            'post_id' => $post->post_id,
                            'reply_id' => $reply->reply_id,
                            'parent_reply_id' => $parentReply->reply_id,
                            'replier_name' => $currentUser->name,
                            'reply_preview' => \Illuminate\Support\Str::limit($validated['content'], 100),
                        ],
                        'action_url' => route('forum.show', $post->post_id) . '#reply-' . $reply->reply_id,
                        'action_text' => 'View Reply',
                    ]);

                    Log::info('📬 Reply notification sent', [
                        'parent_reply_id' => $parentReply->reply_id,
                        'replier' => $currentUser->name,
                        'recipient' => $parentReply->user_id,
                    ]);
                }
            } else {
                if ($post->user_id !== $userId) {
                    Notification::create([
                        'user_Id' => $post->user_id,
                        'type' => 'community',
                        'priority' => 'normal',
                        'title' => '💬 New Comment',
                        'message' => "{$currentUser->name} commented on your post \"{$post->title}\"",
                        'icon' => 'message-circle',
                        'color' => 'blue',
                        'data' => [
                            'post_id' => $post->post_id,
                            'reply_id' => $reply->reply_id,
                            'commenter_name' => $currentUser->name,
                            'comment_preview' => \Illuminate\Support\Str::limit($validated['content'], 100),
                            'post_title' => $post->title,
                        ],
                        'action_url' => route('forum.show', $post->post_id) . '#reply-' . $reply->reply_id,
                        'action_text' => 'View Comment',
                    ]);

                    Log::info('📬 Post comment notification sent', [
                        'post_id' => $post->post_id,
                        'commenter' => $currentUser->name,
                        'post_author' => $post->user_id,
                    ]);
                }
            }

            // ✅ 更新学生活跃度
            $missionProgress = null;

            if (ForumHelper::isStudent()) {
                $student = ForumHelper::getCurrentStudentProfile();
                $student?->updateStreak();

                if ($student) {
                    try {
                        $missionProgress = app(DailyChallengeService::class)->recordForumReplyCreated(
                            (int) $student->student_id,
                            (int) $reply->reply_id
                        );
                    } catch (\Throwable $challengeException) {
                        Log::warning('Failed to record forum-reply daily challenge event', [
                            'student_id' => $student->student_id,
                            'reply_id' => $reply->reply_id,
                            'error' => $challengeException->getMessage(),
                        ]);
                    }
                }
            }

            // ✅ 重新加载完整的帖子数据（包括新回复）
            $post = ForumPost::with([
                'user.studentProfile',
                'studentProfile',
                'user.studentProfile.rewardInventory' => function ($query) {
                    $query->where('is_equipped', true)
                        ->whereHas('reward', function ($q) {
                            $q->where('reward_type', 'avatar_frame');
                        })
                        ->with('reward');
                },
                'replies' => function ($query) {
                    $query->topLevel()
                        ->with([
                            'user.studentProfile',
                            'studentProfile',
                            'user.studentProfile.rewardInventory' => function ($q) {
                                $q->where('is_equipped', true)
                                    ->whereHas('reward', function ($r) {
                                        $r->where('reward_type', 'avatar_frame');
                                    })
                                    ->with('reward');
                            },
                            'childReplies.user.studentProfile',
                            'childReplies.studentProfile',
                            'childReplies.user.studentProfile.rewardInventory' => function ($q) {
                                $q->where('is_equipped', true)
                                    ->whereHas('reward', function ($r) {
                                        $r->where('reward_type', 'avatar_frame');
                                    })
                                    ->with('reward');
                            },
                            'childReplies.childReplies.user.studentProfile',
                            'childReplies.childReplies.studentProfile',
                            'childReplies.childReplies.user.studentProfile.rewardInventory' => function ($q) {
                                $q->where('is_equipped', true)
                                    ->whereHas('reward', function ($r) {
                                        $r->where('reward_type', 'avatar_frame');
                                    })
                                    ->with('reward');
                            }
                        ])
                        ->orderBy('is_solution', 'desc')
                        ->orderBy('created_at', 'asc');
                }
            ])->findOrFail($id);

            Log::info('✅ Reply process completed', [
                'reply_id' => $reply->reply_id,
                'total_replies' => $post->replies->count(),
            ]);

            return back()->with([
                'success' => 'Reply posted successfully!',
                'missionProgress' => $missionProgress,
                'post' => $post, // ✅ 返回更新后的帖子数据
            ]);
        } catch (\Exception $e) {
            Log::error('=== Forum reply creation FAILED ===', [
                'post_id' => $id,
                'user_id' => $currentUser->user_Id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors(['error' => 'Failed to post reply: ' . $e->getMessage()]);
        }
    }
    /**
     * 编辑回复
     */
    public function updateReply(Request $request, $replyId)
    {
        if (!auth()->check()) {
            abort(403);
        }

        $reply = ForumReply::findOrFail($replyId);

        if (!$reply->canEdit(auth()->id())) {
            abort(403);
        }

        $validated = $request->validate([
            'content' => 'required|string|min:5',
        ]);

        try {
            $reply->update([
                'content' => ForumHelper::sanitizeContent($validated['content']),
            ]);

            return back()->with('success', 'Reply updated successfully!');
        } catch (\Exception $e) {
            Log::error('Forum reply update failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update reply.']);
        }
    }

    /**
     * 删除回复
     */
    public function destroyReply($replyId)
    {
        if (!auth()->check()) {
            abort(403, 'You must be logged in to delete replies.');
        }

        $reply = ForumReply::findOrFail($replyId);

        // 保存帖子ID用于重定向
        $postId = $reply->post_id;

        $userId = auth()->user()->user_Id;

        if (!$reply->canDelete($userId)) {
            abort(403, 'You do not have permission to delete this reply.');
        }

        try {
            $reply->delete();

            // 🔥 删除回复后返回到帖子详情页
            return redirect()
                ->route('forum.show', $postId)
                ->with('success', 'Reply deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Forum reply deletion failed: ' . $e->getMessage(), [
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
    public function markSolution($replyId)
    {
        if (!auth()->check()) {
            abort(403);
        }

        $reply = ForumReply::findOrFail($replyId);
        $currentUser = auth()->user();
        $userId = $currentUser->user_Id; // ✅ 使用正确的主键

        if (!$reply->canMarkAsSolution($userId)) { // ✅ 改用 $userId
            abort(403, 'Only the post author can mark solutions.');
        }

        try {
            if ($reply->is_solution) {
                $reply->unmarkAsSolution();
                $message = 'Solution unmarked successfully!';
            } else {
                $reply->markAsSolution();

                if ($reply->user_id !== $userId) { // ✅ 改用 $userId
                    $post = ForumPost::find($reply->post_id);

                    Notification::create([
                        'user_Id' => $reply->user_id,
                        'type' => 'community',
                        'priority' => 'high',
                        'title' => '⭐ Best Answer',
                        'message' => "{$currentUser->name} marked your reply as the best answer!",
                        'icon' => 'star',
                        'color' => 'yellow',
                        'data' => [
                            'post_id' => $reply->post_id,
                            'reply_id' => $reply->reply_id,
                            'post_title' => $post ? $post->title : '',
                            'post_author' => $currentUser->name,
                        ],
                        'action_url' => route('forum.show', $reply->post_id) . '#reply-' . $reply->reply_id,
                        'action_text' => 'View Post',
                    ]);

                    Log::info('📬 Best answer notification sent', [
                        'reply_id' => $reply->reply_id,
                        'post_author' => $currentUser->name,
                        'answer_author' => $reply->user_id,
                    ]);
                }

                $message = 'Reply marked as solution!';
            }

            return back()->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Mark solution failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to mark solution.']);
        }
    }

    /**
     * 点赞/取消点赞帖子 (AJAX)
     */
    public function toggleLike($id)
    {
        if (!auth()->check()) {
            return redirect()->route('login')->with('error', 'Please login to like posts.');
        }

        try {
            $currentUser = auth()->user();

            // ✅ 使用正确的主键名称
            $userId = $currentUser->user_Id; // 改用 user_Id（大写 I）

            Log::info('=== Toggle Like Request ===', [
                'user_id' => $userId,
                'user_role' => $currentUser->role,
                'post_id' => $id,
                'primary_key' => $currentUser->getKeyName(), // 查看主键名称
            ]);

            // ✅ Toggle like
            $isLiked = ForumPostLike::toggle($userId, $id);

            Log::info('Toggle like result', [
                'is_liked' => $isLiked,
                'post_id' => $id
            ]);

            // ✅ 重新加载帖子数据
            $post = ForumPost::with([
                'user.studentProfile',
                'studentProfile',
                'user.studentProfile.rewardInventory' => function ($query) {
                    $query->where('is_equipped', true)
                        ->whereHas('reward', function ($q) {
                            $q->where('reward_type', 'avatar_frame');
                        })
                        ->with('reward');
                },
                'replies' => function ($query) {
                    $query->topLevel()
                        ->with([
                            'user.studentProfile',
                            'studentProfile',
                            'user.studentProfile.rewardInventory' => function ($q) {
                                $q->where('is_equipped', true)
                                    ->whereHas('reward', function ($r) {
                                        $r->where('reward_type', 'avatar_frame');
                                    })
                                    ->with('reward');
                            },
                            'childReplies.user.studentProfile',
                            'childReplies.studentProfile',
                            'childReplies.user.studentProfile.rewardInventory' => function ($q) {
                                $q->where('is_equipped', true)
                                    ->whereHas('reward', function ($r) {
                                        $r->where('reward_type', 'avatar_frame');
                                    })
                                    ->with('reward');
                            },
                            'childReplies.childReplies.user.studentProfile',
                            'childReplies.childReplies.studentProfile',
                            'childReplies.childReplies.user.studentProfile.rewardInventory' => function ($q) {
                                $q->where('is_equipped', true)
                                    ->whereHas('reward', function ($r) {
                                        $r->where('reward_type', 'avatar_frame');
                                    })
                                    ->with('reward');
                            }
                        ])
                        ->orderBy('is_solution', 'desc')
                        ->orderBy('created_at', 'asc');
                }
            ])->findOrFail($id);

            // ✅ 发送通知（如果是点赞且不是自己的帖子）
            if ($isLiked && $post->user_id !== $userId) {
                $this->sendOrUpdatePostLikeNotification(
                    $post->user_id,
                    $currentUser->name,
                    $post->post_id,
                    $post->title
                );
            }

            // ✅ 获取用户互动状态
            $isFavorited = ForumFavorite::isFavorited($userId, $post->post_id);
            $hasReported = \App\Models\ForumReport::hasReported($userId, 'post', $post->post_id);

            Log::info('✅ Like toggled successfully', [
                'post_id' => $id,
                'is_liked' => $isLiked,
                'current_likes' => $post->fresh()->likes
            ]);

            return back()->with([
                'success' => $isLiked ? 'Post liked!' : 'Post unliked!',
                'post' => $post->fresh(),
                'isLiked' => $isLiked,
                'isFavorited' => $isFavorited,
                'hasReported' => $hasReported,
            ]);
        } catch (\Exception $e) {
            Log::error('=== Toggle post like FAILED ===', [
                'post_id' => $id,
                'user_id' => auth()->user()->user_Id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to like post. Please try again.');
        }
    }


    /**
     * 点赞/取消点赞回复 (AJAX)
     */
    public function toggleReplyLike($replyId)
    {
        if (!auth()->check()) {
            return redirect()->route('login')->with('error', 'Please login to like replies.');
        }

        try {
            $currentUser = auth()->user();
            $userId = $currentUser->user_Id; // ✅ 改用 user_Id

            Log::info('=== Toggle Reply Like ===', [
                'user_id' => $userId,
                'reply_id' => $replyId,
            ]);

            $reply = ForumReply::findOrFail($replyId);
            $isLiked = ForumReplyLike::toggle($userId, $reply->reply_id);

            Log::info('✅ Reply like toggled', [
                'reply_id' => $replyId,
                'is_liked' => $isLiked
            ]);

            // 发送通知
            if ($isLiked && $reply->user_id !== $userId) {
                Notification::create([
                    'user_Id' => $reply->user_id,
                    'type' => 'community',
                    'priority' => 'low',
                    'title' => '👍 Reply Liked',
                    'message' => "{$currentUser->name} liked your reply",
                    'icon' => 'thumbs-up',
                    'color' => 'purple',
                    'data' => [
                        'post_id' => $reply->post_id,
                        'reply_id' => $reply->reply_id,
                        'liker_name' => $currentUser->name,
                        'reply_preview' => \Illuminate\Support\Str::limit($reply->content, 100),
                    ],
                    'action_url' => route('forum.show', $reply->post_id) . '#reply-' . $reply->reply_id,
                    'action_text' => 'View Reply',
                ]);
            }

            return back()->with('success', $isLiked ? 'Reply liked!' : 'Reply unliked!');
        } catch (\Exception $e) {
            Log::error('=== Toggle reply like FAILED ===', [
                'reply_id' => $replyId,
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'Failed to like reply. Please try again.');
        }
    }

    /**
     * 收藏/取消收藏帖子 (AJAX)
     */
    public function toggleFavorite($id)
    {
        if (!auth()->check() || !ForumHelper::canAccessForum()) {
            return redirect()->route('login')->with('error', 'Please login to favorite posts.');
        }

        try {
            $post = ForumPost::with([
                'user',
                'studentProfile',
                'replies' => function ($query) {
                    $query->topLevel()
                        ->with([
                            'user',
                            'studentProfile',
                            'childReplies.user',
                            'childReplies.studentProfile',
                            'childReplies.childReplies.user',
                            'childReplies.childReplies.studentProfile'
                        ])
                        ->orderBy('is_solution', 'desc')
                        ->orderBy('created_at', 'asc');
                }
            ])->findOrFail($id);

            $isFavorited = ForumFavorite::toggle(auth()->id(), $post->post_id);

            $userId = auth()->user()->user_Id;

            // 重新获取用户的互动状态
            $isLiked = ForumPostLike::isLiked($userId, $post->post_id);
            $hasReported = \App\Models\ForumReport::hasReported($userId, 'post', $post->post_id);

            $message = $isFavorited ? 'Post favorited!' : 'Post unfavorited!';

            return back()->with([
                'success' => $message,
                'post' => $post,
                'isLiked' => $isLiked,
                'isFavorited' => $isFavorited,
                'hasReported' => $hasReported,
            ]);
        } catch (\Exception $e) {
            Log::error('Toggle favorite failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to favorite post. Please try again.');
        }
    }

    /**
     * 置顶/取消置顶帖子（仅 Admin）
     */
    public function togglePin($id)
    {
        if (!ForumHelper::canPinPost()) {
            abort(403, 'Only administrators can pin posts.');
        }

        try {
            $post = ForumPost::findOrFail($id);
            $post->update(['is_pinned' => !$post->is_pinned]);

            $message = $post->is_pinned ? 'Post pinned successfully!' : 'Post unpinned successfully!';

            return back()->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Toggle pin failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to pin post. Please try again.');
        }
    }

    /**
     * 锁定/解锁帖子（仅 Admin）
     */
    public function toggleLock($id)
    {
        if (!ForumHelper::canLockPost()) {
            abort(403, 'Only administrators can lock posts.');
        }

        try {
            $post = ForumPost::findOrFail($id);
            $post->update(['is_locked' => !$post->is_locked]);

            $message = $post->is_locked ? 'Post locked successfully!' : 'Post unlocked successfully!';

            return back()->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Toggle lock failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to lock post. Please try again.');
        }
    }

    /**
     * 我的帖子
     */
    public function myPosts()
    {
        if (!auth()->check() || !ForumHelper::canAccessForum()) {
            return redirect()->route('login');
        }

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
        if (!auth()->check() || !ForumHelper::canAccessForum()) {
            return redirect()->route('login');
        }

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
        if (!auth()->check() || !ForumHelper::canAccessForum()) {
            return redirect()->route('login')->with('error', 'Please login to report posts.');
        }

        $post = ForumPost::findOrFail($id);

        if ($post->user_id === auth()->id()) {
            return back()->with('error', 'You cannot report your own post.');
        }

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

            if (!$report) {
                return back()->with('error', 'You have already reported this post.');
            }

            return back()->with('success', 'Report submitted successfully. Our team will review it.');
        } catch (\Exception $e) {
            Log::error('Report post failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to submit report. Please try again.');
        }
    }

    /**
     * 举报回复
     */
    public function reportReply(Request $request, $replyId)
    {
        if (!auth()->check() || !ForumHelper::canAccessForum()) {
            return redirect()->route('login')->with('error', 'Please login to report replies.');
        }

        $reply = ForumReply::findOrFail($replyId);

        if ($reply->user_id === auth()->id()) {
            return back()->with('error', 'You cannot report your own reply.');
        }

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

            if (!$report) {
                return back()->with('error', 'You have already reported this reply.');
            }

            return back()->with('success', 'Report submitted successfully. Our team will review it.');
        } catch (\Exception $e) {
            Log::error('Report reply failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to submit report. Please try again.');
        }
    }

    private function sendOrUpdatePostLikeNotification($postAuthorId, $likerName, $postId, $postTitle)
    {
        try {
            // 查找最近 5 分钟内的同类型通知
            $recentNotification = Notification::where('user_Id', $postAuthorId)
                ->where('type', 'community')
                ->where('title', '❤️ Post Liked')
                ->where('created_at', '>=', now()->subMinutes(5))
                ->whereJsonContains('data->post_id', (string)$postId)
                ->first();

            if ($recentNotification) {
                // 更新现有通知
                $data = $recentNotification->data ?? [];
                $likers = $data['likers'] ?? [];
                $likers[] = $likerName;
                $likers = array_unique($likers);

                $count = count($likers);
                $message = $count > 1
                    ? "{$likers[0]} and " . ($count - 1) . " others liked your post"
                    : "{$likerName} liked your post";

                $recentNotification->update([
                    'message' => $message,
                    'is_read' => false,  // 重置为未读
                    'data' => array_merge($data, [
                        'likers' => $likers,
                        'likers_count' => $count,
                    ]),
                ]);

                Log::info('📬 Updated existing like notification', [
                    'notification_id' => $recentNotification->notification_id,
                    'total_likers' => $count,
                ]);
            } else {
                // 创建新通知
                Notification::create([
                    'user_Id' => $postAuthorId,
                    'type' => 'community',
                    'priority' => 'low',
                    'title' => '❤️ Post Liked',
                    'message' => "{$likerName} liked your post",
                    'icon' => 'heart',
                    'color' => 'red',
                    'data' => [
                        'post_id' => $postId,
                        'likers' => [$likerName],
                        'likers_count' => 1,
                        'post_title' => \Illuminate\Support\Str::limit($postTitle, 50),
                    ],
                    'action_url' => route('forum.show', $postId),
                    'action_text' => 'View Post',
                ]);

                Log::info('📬 Created new like notification', [
                    'post_id' => $postId,
                    'liker' => $likerName,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send like notification: ' . $e->getMessage());
        }
    }
}
