<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Log;

class ForumPost extends Model
{
    use HasFactory;

    protected $table = 'forum_posts';
    protected $primaryKey = 'post_id';

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'category',
        'likes',
        'views',
        'is_pinned',
        'is_locked',
        'equipped_snapshot',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'is_locked' => 'boolean',
        'likes' => 'integer',
        'views' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'equipped_snapshot' => 'array',
    ];

    /* -------------------------
       关系定义 (Relationships)
       ------------------------- */

    /**
     * 作者（User）- Admin 和 Student 都用这个
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_Id');
    }

    /**
     * 如果作者是学生，获取 Student Profile
     */
    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'user_id', 'user_Id');
    }

    /**
     * Post has many replies
     */
    public function replies(): HasMany
    {
        return $this->hasMany(ForumReply::class, 'post_id', 'post_id')
            ->orderBy('created_at', 'asc');
    }

    /**
     * Post can be favorited by many users
     */
    public function favorites(): HasMany
    {
        return $this->hasMany(ForumFavorite::class, 'post_id', 'post_id');
    }

    /**
     * Users who favorited this post
     */
    public function favoritedBy(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'forum_favorites',
            'post_id',
            'user_id',
            'post_id',
            'user_Id'
        )->withTimestamps();
    }

    /**
     * Post likes relationship
     */
    public function postLikes(): HasMany
    {
        return $this->hasMany(ForumPostLike::class, 'post_id', 'post_id');
    }

    /**
     * Users who liked this post
     */
    public function likedBy(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'forum_post_likes',
            'post_id',
            'user_id',
            'post_id',
            'user_Id'
        )->withTimestamps();
    }

    /* -------------------------
       Scopes
       ------------------------- */

    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopePopular($query)
    {
        return $query->orderBy('likes', 'desc');
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('content', 'like', "%{$search}%");
        });
    }

    public function scopeWithAuthor($query)
    {
        return $query->with(['user', 'studentProfile']);
    }

    public function scopeWithRepliesCount($query)
    {
        return $query->withCount('replies');
    }

    public function scopeActive($query)
    {
        return $query->where('is_locked', false);
    }

    /* -------------------------
       Accessors
       ------------------------- */

    /**
     * Get reply count
     */
    public function getReplyCountAttribute()
    {
        return $this->replies()->count();
    }

    /**
     * Check if post is favorited by current user
     */
    public function getIsFavoritedAttribute()
    {
        if (!auth()->check()) {
            return false;
        }
        return ForumFavorite::isFavorited(auth()->id(), $this->post_id);
    }

    /**
     * Check if post is liked by current user
     */
    public function getIsLikedAttribute()
    {
        if (!auth()->check()) {
            return false;
        }
        return ForumPostLike::isLiked(auth()->id(), $this->post_id);
    }

    /**
     * Get author information (智能判断 Admin 或 Student)
     */
    public function getAuthorAttribute()
    {
        $user = $this->user;

        if (!$user) {
            return [
                'name' => 'Unknown User',
                'role' => 'Unknown',
                'avatar' => \App\Helpers\ForumHelper::getUserAvatar(null),
            ];
        }

        // Admin 用户
        if ($user->role === 'administrator') {
            return [
                'name' => $user->name,
                'role' => 'Admin',
                'role_badge' => 'admin',
                'avatar' => \App\Helpers\ForumHelper::getUserAvatar($user),
                'is_admin' => true,
                'is_student' => false,
            ];
        }

        // Student 用户 - 优先使用发帖时的装备快照
        $equippedSnapshot = $this->equipped_snapshot ?? [];

        // 如果快照为空，fallback 到 student profile 的当前快照
        if (empty($equippedSnapshot)) {
            $student = $this->studentProfile;
            if ($student) {
                $equippedSnapshot = $student->getEquippedSnapshot();
            }
        }

        $student = $this->studentProfile;

        return [
            'name' => $user->name,
            'role' => 'Student',
            'role_badge' => 'student',
            'avatar' => \App\Helpers\ForumHelper::getUserAvatar($user),
            'level' => $student?->points_level ?? 'Newbie',
            'points' => $student?->current_points ?? 0,
            'streak' => $student?->streak_days ?? 0,
            'is_admin' => false,
            'is_student' => true,
            // 装备信息（来自发帖时的快照）
            'equipped_avatar_frame' => $equippedSnapshot['avatar_frame'] ?? null,
            'equipped_background' => $equippedSnapshot['background'] ?? null,
            'equipped_title' => $equippedSnapshot['title'] ?? null,
            'equipped_badges' => $equippedSnapshot['badges'] ?? [],
        ];
    }

    /**
     * Get last reply time
     */
    public function getLastReplyAtAttribute()
    {
        return $this->replies()->latest()->first()?->created_at;
    }

    /* -------------------------
       Methods
       ------------------------- */

    /**
     * Increment view count
     */
    public function incrementViews($userId = null)
    {
        try {
            // ✅ 规则 1: 作者自己访问不计数
            if ($userId && $userId == $this->user_id) {
                Log::info('View not counted - author viewing own post', [
                    'post_id' => $this->post_id,
                    'user_id' => $userId
                ]);
                return false;
            }

            $sessionKey = "viewed_post_{$this->post_id}";
            $lastViewedAt = session($sessionKey);
            $now = now();

            // ✅ 规则 2: 5 分钟内不重复计数
            if ($lastViewedAt && $now->diffInMinutes($lastViewedAt) < 5) {
                Log::info('View not counted - too soon', [
                    'post_id' => $this->post_id,
                    'user_id' => $userId,
                    'last_viewed' => $lastViewedAt,
                    'minutes_ago' => $now->diffInMinutes($lastViewedAt)
                ]);
                return false;
            }

            // ✅ 增加浏览量
            $this->increment('views');

            // ✅ 记录本次浏览时间
            session([$sessionKey => $now]);

            Log::info('✅ View counted', [
                'post_id' => $this->post_id,
                'user_id' => $userId,
                'new_views' => $this->fresh()->views,
                'session_expires_in' => '5 minutes'
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to increment views', [
                'post_id' => $this->post_id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Toggle like (使用 ForumPostLike Model)
     */
    public function toggleLike($userId)
    {
        return ForumPostLike::toggle($userId, $this->post_id);
    }

    /**
     * Check if user can edit this post
     * 只有作者本人可以编辑
     */
    public function canEdit($userId)
    {
        return (int) $this->user_id === (int) $userId;
    }

    /**
     * Check if user can delete this post
     * 作者本人或管理员可以删除
     */
    public function canDelete($userId)
    {
        // 🔥 添加日志用于调试
        Log::debug('Checking canDelete permission', [
            'post_user_id' => $this->user_id,
            'current_user_id' => $userId,
            'post_user_id_type' => gettype($this->user_id),
            'current_user_id_type' => gettype($userId),
        ]);

        // 检查是否是作者本人
        if ((int) $this->user_id === (int) $userId) {
            return true;
        }

        // 检查是否是管理员
        $user = User::find($userId);
        if ($user && $user->role === 'administrator') {
            return true;
        }

        return false;
    }

    /**
     * Check if user can pin/unpin this post
     * 只有管理员可以置顶
     */
    public function canPin($userId)
    {
        $user = User::find($userId);
        return $user?->role === 'administrator';
    }

    /**
     * Check if user can lock/unlock this post
     * 只有管理员可以锁定
     */
    public function canLock($userId)
    {
        $user = User::find($userId);
        return $user?->role === 'administrator';
    }

    /**
     * Get solution reply
     */
    public function getSolutionReply()
    {
        return $this->replies()->where('is_solution', true)->first();
    }

    /**
     * Check if post author is admin
     */
    public function isAuthorAdmin(): bool
    {
        return $this->user?->role === 'administrator';
    }

    /**
     * Check if post author is student
     */
    public function isAuthorStudent(): bool
    {
        return $this->user?->role === 'student';
    }

    /**
     * Check if post has a solution
     */
    public function hasSolution(): bool
    {
        return $this->replies()->where('is_solution', true)->exists();
    }

    /**
     * Get top-level replies only
     */
    public function topLevelReplies()
    {
        return $this->replies()->whereNull('parent_reply_id');
    }

    /**
     * Get total replies count (including nested)
     */
    public function getTotalRepliesCountAttribute()
    {
        return $this->replies()->count();
    }
}
