<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ForumReport extends Model
{
    use HasFactory;

    protected $table = 'forum_reports';
    protected $primaryKey = 'report_id';

    protected $fillable = [
        'reporter_user_id',
        'reportable_type',
        'reportable_id',
        'reason',
        'description',
        'status',
        'reviewed_by_admin_id',
        'admin_notes',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /* -------------------------
       关系定义
       ------------------------- */

    // 举报者
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_user_id', 'user_Id');
    }

    // 审核管理员
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_admin_id', 'user_Id');
    }

    // 多态关系：被举报的内容（推荐使用这个）
    public function reportable(): MorphTo
    {
        return $this->morphTo();
    }

    // 被举报的帖子（移除了 where 条件）
    public function post(): BelongsTo
    {
        return $this->belongsTo(ForumPost::class, 'reportable_id', 'post_id');
    }

    // 被举报的回复（移除了 where 条件）
    public function reply(): BelongsTo
    {
        return $this->belongsTo(ForumReply::class, 'reportable_id', 'reply_id');
    }

    /* -------------------------
       Scopes
       ------------------------- */

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeReviewed($query)
    {
        return $query->whereIn('status', ['reviewed', 'resolved', 'dismissed']);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function scopeByReporter($query, $userId)
    {
        return $query->where('reporter_user_id', $userId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('reportable_type', $type);
    }

    /* -------------------------
       Accessors
       ------------------------- */

    // 获取举报原因的友好名称
    public function getReasonNameAttribute(): string
    {
        return match ($this->reason) {
            'spam' => 'Spam',
            'inappropriate' => 'Inappropriate Content',
            'harassment' => 'Harassment',
            'misinformation' => 'Misinformation',
            'off_topic' => 'Off Topic',
            'other' => 'Other',
            default => 'Unknown',
        };
    }

    // 获取状态的友好名称
    public function getStatusNameAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'Pending Review',
            'reviewed' => 'Under Review',
            'resolved' => 'Resolved',
            'dismissed' => 'Dismissed',
            default => 'Unknown',
        };
    }

    // 获取被举报的内容
    public function getReportedContentAttribute()
    {
        if ($this->reportable_type === 'post') {
            return $this->post;
        } elseif ($this->reportable_type === 'reply') {
            return $this->reply;
        }
        return null;
    }

    /* -------------------------
       Methods
       ------------------------- */

    // 标记为已审核
    public function markAsReviewed($adminId, $notes = null)
    {
        $this->update([
            'status' => 'reviewed',
            'reviewed_by_admin_id' => $adminId,
            'admin_notes' => $notes,
            'reviewed_at' => now(),
        ]);
    }

    // 标记为已解决
    public function markAsResolved($adminId, $notes = null)
    {
        $this->update([
            'status' => 'resolved',
            'reviewed_by_admin_id' => $adminId,
            'admin_notes' => $notes,
            'reviewed_at' => now(),
        ]);
    }

    // 标记为已驳回
    public function markAsDismissed($adminId, $notes = null)
    {
        $this->update([
            'status' => 'dismissed',
            'reviewed_by_admin_id' => $adminId,
            'admin_notes' => $notes,
            'reviewed_at' => now(),
        ]);
    }

    /* -------------------------
       Static Methods
       ------------------------- */

    // 创建举报
    public static function createReport($userId, $type, $id, $reason, $description = null)
    {
        // 检查是否已经举报过
        $exists = static::where('reporter_user_id', $userId)
            ->where('reportable_type', $type)
            ->where('reportable_id', $id)
            ->where('status', 'pending')
            ->exists();

        if ($exists) {
            return false; // 已经举报过了
        }

        return static::create([
            'reporter_user_id' => $userId,
            'reportable_type' => $type,
            'reportable_id' => $id,
            'reason' => $reason,
            'description' => $description,
        ]);
    }

    // 检查用户是否已举报
    public static function hasReported($userId, $type, $id): bool
    {
        return static::where('reporter_user_id', $userId)
            ->where('reportable_type', $type)
            ->where('reportable_id', $id)
            ->where('status', 'pending')
            ->exists();
    }
}
