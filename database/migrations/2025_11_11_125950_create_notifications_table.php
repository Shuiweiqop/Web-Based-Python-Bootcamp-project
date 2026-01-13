<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * Notification Model
 * 
 * 通知系统模型
 */
class Notification extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'notifications';
    protected $primaryKey = 'notification_id';

    // ✅ 修复：与 migration 保持一致，使用 user_Id
    protected $fillable = [
        'user_Id',  // 改为大写 I
        'type',
        'priority',
        'title',
        'message',
        'icon',
        'color',
        'data',
        'action_url',
        'action_text',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // ✅ 添加 appends 以使用访问器
    protected $appends = ['time_ago', 'display_icon', 'display_color'];

    /* ===================================
       关系定义
       =================================== */

    /**
     * 通知所属用户
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_Id', 'user_Id');
    }

    /* ===================================
       Scopes（查询作用域）
       =================================== */

    /**
     * 只查询未读通知
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * 只查询已读通知
     */
    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    /**
     * 按类型筛选
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * 按优先级筛选
     */
    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * 高优先级通知
     */
    public function scopeHighPriority($query)
    {
        return $query->whereIn('priority', ['high', 'urgent']);
    }

    /**
     * 最近的通知（默认30天内）
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /* ===================================
       Accessors（访问器）- 使用新语法
       =================================== */

    /**
     * 获取格式化的时间（相对时间）
     */
    protected function timeAgo(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->created_at?->diffForHumans() ?? '',
        );
    }

    /**
     * 获取显示图标（如果没有设置，根据类型返回默认图标）
     */
    protected function displayIcon(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->icon ?: match ($this->type) {
                'system' => 'info',
                'reward' => 'gift',
                'test' => 'clipboard',
                'lesson' => 'book',
                'achievement' => 'trophy',
                'points' => 'sparkles',
                'purchase' => 'shopping-cart',
                'reminder' => 'bell',
                'announcement' => 'megaphone',
                'social' => 'users',
                default => 'bell',
            },
        );
    }

    /**
     * 获取显示颜色（如果没有设置，根据优先级返回默认颜色）
     */
    protected function displayColor(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->color ?: match ($this->priority) {
                'urgent' => 'red',
                'high' => 'orange',
                'normal' => 'blue',
                'low' => 'gray',
                default => 'blue',
            },
        );
    }

    /* ===================================
       方法
       =================================== */

    /**
     * 标记为已读
     */
    public function markAsRead(): bool
    {
        if ($this->is_read) {
            return true;
        }

        return $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    /**
     * 标记为未读
     */
    public function markAsUnread(): bool
    {
        return $this->update([
            'is_read' => false,
            'read_at' => null,
        ]);
    }

    /**
     * 检查是否过期（7天未读视为过期）
     */
    public function isExpired(): bool
    {
        return !$this->is_read &&
            $this->created_at->addDays(7)->isPast();
    }

    /* ===================================
       静态工厂方法
       =================================== */

    /**
     * 创建系统通知
     */
    public static function createSystem(int $userId, string $title, string $message, ?array $data = null): self
    {
        return self::create([
            'user_Id' => $userId,
            'type' => 'system',
            'priority' => 'normal',
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'icon' => 'info',
            'color' => 'blue',
        ]);
    }

    /**
     * 创建奖励通知
     */
    public static function createReward(int $userId, string $rewardName, int $quantity, ?string $imageUrl = null): self
    {
        return self::create([
            'user_Id' => $userId,
            'type' => 'reward',
            'priority' => 'normal',
            'title' => '获得新奖励！',
            'message' => "你获得了 {$quantity} 个 {$rewardName}",
            'icon' => 'gift',
            'color' => 'purple',
            'data' => [
                'reward_name' => $rewardName,
                'quantity' => $quantity,
                'image_url' => $imageUrl,
            ],
            'action_url' => route('student.inventory.index'),
            'action_text' => '查看库存',
        ]);
    }

    /**
     * 创建测验通知
     */
    public static function createTest(int $userId, string $testName, float $score, string $status): self
    {
        $isPassed = $score >= 70;

        return self::create([
            'user_Id' => $userId,
            'type' => 'test',
            'priority' => $isPassed ? 'normal' : 'high',
            'title' => $isPassed ? '测验通过！' : '测验完成',
            'message' => "你在「{$testName}」中获得了 {$score}% 的成绩",
            'icon' => $isPassed ? 'check-circle' : 'clipboard',
            'color' => $isPassed ? 'green' : 'orange',
            'data' => [
                'test_name' => $testName,
                'score' => $score,
                'status' => $status,
                'passed' => $isPassed,
            ],
        ]);
    }

    /**
     * 创建成就通知
     */
    public static function createAchievement(int $userId, string $achievementName, string $description): self
    {
        return self::create([
            'user_Id' => $userId,
            'type' => 'achievement',
            'priority' => 'high',
            'title' => '🎉 解锁新成就！',
            'message' => "恭喜！你解锁了成就：{$achievementName}",
            'icon' => 'trophy',
            'color' => 'yellow',
            'data' => [
                'achievement_name' => $achievementName,
                'description' => $description,
            ],
        ]);
    }

    /**
     * 创建积分通知
     */
    public static function createPoints(int $userId, int $pointsChange, string $reason): self
    {
        $isPositive = $pointsChange > 0;

        return self::create([
            'user_Id' => $userId,
            'type' => 'points',
            'priority' => 'normal',
            'title' => $isPositive ? '获得积分！' : '积分扣除',
            'message' => sprintf(
                '%s %d 积分 - %s',
                $isPositive ? '获得' : '扣除',
                abs($pointsChange),
                $reason
            ),
            'icon' => 'sparkles',
            'color' => $isPositive ? 'green' : 'red',
            'data' => [
                'points_change' => $pointsChange,
                'reason' => $reason,
            ],
            'action_url' => route('student.profile.points'),
            'action_text' => '查看积分',
        ]);
    }

    /**
     * 创建购买确认通知
     */
    public static function createPurchase(int $userId, string $itemName, int $quantity, int $pointsSpent): self
    {
        return self::create([
            'user_Id' => $userId,
            'type' => 'purchase',
            'priority' => 'normal',
            'title' => '购买成功！',
            'message' => "你成功购买了 {$quantity} 个 {$itemName}，花费 {$pointsSpent} 积分",
            'icon' => 'shopping-cart',
            'color' => 'blue',
            'data' => [
                'item_name' => $itemName,
                'quantity' => $quantity,
                'points_spent' => $pointsSpent,
            ],
            'action_url' => route('student.inventory.index'),
            'action_text' => '查看库存',
        ]);
    }

    /**
     * 批量标记为已读
     */
    public static function markMultipleAsRead(array $notificationIds): int
    {
        return self::whereIn('notification_id', $notificationIds)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * 标记用户所有通知为已读
     */
    public static function markAllAsReadForUser(int $userId): int
    {
        return self::where('user_Id', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * 获取用户未读通知数量
     */
    public static function getUnreadCountForUser(int $userId): int
    {
        return self::where('user_Id', $userId)
            ->where('is_read', false)
            ->count();
    }

    /**
     * 清理过期通知（删除30天前的已读通知）
     */
    public static function cleanupOldNotifications(int $days = 30): int
    {
        return self::where('is_read', true)
            ->where('read_at', '<', now()->subDays($days))
            ->delete();
    }
}
