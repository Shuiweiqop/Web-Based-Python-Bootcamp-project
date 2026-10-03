<?php

// app/Models/ForumReply.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ForumReply extends Model
{
    protected $table = 'forum_replies';

    protected $primaryKey = 'reply_id';

    protected $fillable = [
        'post_id',
        'user_id',
        'parent_reply_id',
        'content',
        'is_solution',
        'likes',
        'equipped_snapshot', // ✅ 添加
    ];

    /**
     * Serialised with every reply so the client does not have to re-derive
     * authorization from raw ids. See getCanEditAttribute().
     */
    protected $appends = ['can_edit', 'can_delete', 'can_mark_solution'];

    protected $casts = [
        // user_id and post_id are cast because the client compares them and
        // because MySQL can hand back an integer column as a string, where a
        // strict comparison would silently deny the real author. sqlite does
        // not, which is why this only bites in production.
        'user_id' => 'integer',
        'post_id' => 'integer',
        'parent_reply_id' => 'integer',
        'is_solution' => 'boolean',
        'likes' => 'integer',
        'equipped_snapshot' => 'array', // ✅ 添加
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /* -------------------------
       关系定义 (Relationships)
       ------------------------- */

    /**
     * 所属的帖子
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(ForumPost::class, 'post_id', 'post_id');
    }

    /**
     * 回复作者（User）
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_Id');
    }

    /**
     * ✅ 如果作者是学生，获取 Student Profile
     */
    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'user_id', 'user_Id');
    }

    /**
     * 父级回复（用于嵌套回复）
     */
    public function parentReply(): BelongsTo
    {
        return $this->belongsTo(ForumReply::class, 'parent_reply_id', 'reply_id');
    }

    /**
     * 子级回复（嵌套回复）
     */
    public function childReplies(): HasMany
    {
        return $this->hasMany(ForumReply::class, 'parent_reply_id', 'reply_id')
            ->orderBy('created_at', 'asc');
    }

    /**
     * 回复的点赞
     */
    public function replyLikes(): HasMany
    {
        return $this->hasMany(ForumReplyLike::class, 'reply_id', 'reply_id');
    }

    /* -------------------------
       Scopes
       ------------------------- */

    /**
     * 顶级回复（没有父级）
     */
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_reply_id');
    }

    /**
     * 已标记为解决方案的回复
     */
    public function scopeSolutions($query)
    {
        return $query->where('is_solution', true);
    }

    /* -------------------------
       Accessors
       ------------------------- */

    /**
     * ✅ 获取作者信息（智能判断 Admin 或 Student）
     */
    public function getAuthorAttribute()
    {
        $user = $this->user;

        if (! $user) {
            return [
                'name' => 'Unknown User',
                'role' => 'Unknown',
                'avatar' => \App\Helpers\ForumHelper::getUserAvatar(null), // ✅ 使用 Helper
            ];
        }

        // Admin 用户
        if ($user->role === 'administrator') { // ✅ 注意：你的 Helper 用的是 'administrator'
            return [
                'name' => $user->name,
                'role' => 'Admin',
                'role_badge' => 'admin',
                'avatar' => \App\Helpers\ForumHelper::getUserAvatar($user), // ✅ 使用 Helper
                'is_admin' => true,
                'is_student' => false,
            ];
        }

        // Student 用户 - ✅ 优先使用回复时的装备快照
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
            'avatar' => \App\Helpers\ForumHelper::getUserAvatar($user), // ✅ 使用 Helper
            'level' => $student?->points_level ?? 'Newbie',
            'points' => $student?->current_points ?? 0,
            'streak' => $student?->streak_days ?? 0,
            'is_admin' => false,
            'is_student' => true,
            // ✅ 装备信息（来自回复时的快照）
            'equipped_avatar_frame' => $equippedSnapshot['avatar_frame'] ?? null,
            'equipped_background' => $equippedSnapshot['background'] ?? null,
            'equipped_title' => $equippedSnapshot['title'] ?? null,
            'equipped_badges' => $equippedSnapshot['badges'] ?? [],
        ];
    }

    /**
     * 检查当前用户是否点赞了此回复
     */
    public function getIsLikedAttribute()
    {
        if (! auth()->check()) {
            return false;
        }

        return ForumReplyLike::isLiked(auth()->id(), $this->reply_id);
    }

    /**
     * Whether the viewer may edit this reply.
     *
     * These three delegate to ForumReplyPolicy rather than comparing ids here,
     * so the buttons the client renders and the rules the server enforces
     * cannot drift apart. The client used to derive them itself from raw ids,
     * which both duplicated the rules and got them wrong: it compared with ===
     * against values MySQL can return as strings, and it never granted an
     * administrator the delete the policy allows them.
     */
    public function getCanEditAttribute(): bool
    {
        return auth()->check() && auth()->user()->can('update', $this);
    }

    public function getCanDeleteAttribute(): bool
    {
        return auth()->check() && auth()->user()->can('delete', $this);
    }

    public function getCanMarkSolutionAttribute(): bool
    {
        return auth()->check() && auth()->user()->can('markSolution', $this);
    }

    /* -------------------------
       Methods
       ------------------------- */

    /**
     * 标记为解决方案
     */
    public function markAsSolution(): bool
    {
        // 移除该帖子下其他回复的解决方案标记
        self::where('post_id', $this->post_id)
            ->where('is_solution', true)
            ->update(['is_solution' => false]);

        // 标记当前回复为解决方案
        $this->update(['is_solution' => true]);

        return true;
    }

    /**
     * 取消解决方案标记
     */
    public function unmarkAsSolution(): bool
    {
        $this->update(['is_solution' => false]);

        return true;
    }

    /**
     * 切换点赞
     */
    public function toggleLike($userId): bool
    {
        return ForumReplyLike::toggle($userId, $this->reply_id);
    }

    /**
     * 获取回复深度（嵌套层级）
     */
    public function getDepthAttribute(): int
    {
        $depth = 0;
        $reply = $this;

        while ($reply->parent_reply_id) {
            $depth++;
            $reply = $reply->parentReply;

            // 防止无限循环
            if ($depth > 10) {
                break;
            }
        }

        return $depth;
    }

    /**
     * 检查是否是嵌套回复
     */
    public function isNested(): bool
    {
        return $this->parent_reply_id !== null;
    }

    /**
     * 获取所有祖先回复
     */
    public function getAncestors()
    {
        $ancestors = collect();
        $reply = $this;

        while ($reply->parent_reply_id) {
            $parent = $reply->parentReply;
            if ($parent) {
                $ancestors->push($parent);
                $reply = $parent;
            } else {
                break;
            }

            // 防止无限循环
            if ($ancestors->count() > 10) {
                break;
            }
        }

        return $ancestors->reverse();
    }
}
