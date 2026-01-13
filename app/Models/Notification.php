<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Notification extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'notifications';
    protected $primaryKey = 'notification_id';

    protected $fillable = [
        'user_Id',
        'type',
        'priority',
        'title',
        'message',
        'icon',      // ✅ 数据库字段名
        'color',     // ✅ 数据库字段名
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

    // ✅ 确保访问器会被自动附加到 JSON 输出
    protected $appends = ['time_ago', 'display_icon', 'display_color'];

    /* ===================================
       关系定义
       =================================== */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_Id', 'user_Id');
    }

    /* ===================================
       查询作用域
       =================================== */

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeHighPriority($query)
    {
        return $query->whereIn('priority', ['high', 'urgent']);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_Id', $userId);
    }

    /* ===================================
       访问器 - 提供前端兼容性
       =================================== */

    /**
     * 格式化相对时间
     */
    protected function timeAgo(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->created_at?->diffForHumans() ?? '',
        );
    }

    /**
     * ✅ 显示图标 - 如果 icon 字段为空，根据 type 提供默认值
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
     * ✅ 显示颜色 - 如果 color 字段为空，根据 priority 提供默认值
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
       实例方法
       =================================== */

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

    public function markAsUnread(): bool
    {
        return $this->update([
            'is_read' => false,
            'read_at' => null,
        ]);
    }

    public function isExpired(): bool
    {
        return !$this->is_read &&
            $this->created_at->addDays(7)->isPast();
    }

    /* ===================================
       静态工厂方法
       =================================== */

    /**
     * ✅ 创建系统通知 - 使用正确的字段名
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
            'icon' => 'info',        // ✅ 使用 icon
            'color' => 'blue',       // ✅ 使用 color
        ]);
    }

    /**
     * ✅ 创建奖励通知 - 使用正确的字段名
     */
    public static function createReward(int $userId, string $rewardName, int $quantity, ?string $imageUrl = null): self
    {
        return self::create([
            'user_Id' => $userId,
            'type' => 'reward',
            'priority' => 'normal',
            'title' => 'New Reward Earned!',
            'message' => "You received {$quantity} {$rewardName}",
            'icon' => 'gift',        // ✅ 使用 icon
            'color' => 'purple',     // ✅ 使用 color
            'data' => [
                'reward_name' => $rewardName,
                'quantity' => $quantity,
                'image_url' => $imageUrl,
            ],
            'action_url' => route('student.inventory.index'),
            'action_text' => 'View Inventory',
        ]);
    }

    public static function createTest(int $userId, string $testName, float $score, string $status): self
    {
        $isPassed = $score >= 70;

        return self::create([
            'user_Id' => $userId,
            'type' => 'test',
            'priority' => $isPassed ? 'normal' : 'high',
            'title' => $isPassed ? 'Test Passed!' : 'Test Completed',
            'message' => "You scored {$score}% on \"{$testName}\"",
            'icon' => $isPassed ? 'check-circle' : 'clipboard',  // ✅ 使用 icon
            'color' => $isPassed ? 'green' : 'orange',           // ✅ 使用 color
            'data' => [
                'test_name' => $testName,
                'score' => $score,
                'status' => $status,
                'passed' => $isPassed,
            ],
        ]);
    }

    public static function createAchievement(int $userId, string $achievementName, string $description): self
    {
        return self::create([
            'user_Id' => $userId,
            'type' => 'achievement',
            'priority' => 'high',
            'title' => '🎉 New Achievement Unlocked!',
            'message' => "Congratulations! You unlocked the achievement: {$achievementName}",
            'icon' => 'trophy',      // ✅ 使用 icon
            'color' => 'yellow',     // ✅ 使用 color
            'data' => [
                'achievement_name' => $achievementName,
                'description' => $description,
            ],
        ]);
    }

    public static function createPoints(int $userId, int $pointsChange, string $reason): self
    {
        $isPositive = $pointsChange > 0;

        return self::create([
            'user_Id' => $userId,
            'type' => 'points',
            'priority' => 'normal',
            'title' => $isPositive ? 'Points Earned!' : 'Points Deducted',
            'message' => sprintf(
                '%s %d points - %s',
                $isPositive ? 'Earned' : 'Deducted',
                abs($pointsChange),
                $reason
            ),
            'icon' => 'sparkles',    // ✅ 使用 icon
            'color' => $isPositive ? 'green' : 'red',  // ✅ 使用 color
            'data' => [
                'points_change' => $pointsChange,
                'reason' => $reason,
            ],
            'action_url' => route('student.profile.points'),
            'action_text' => 'View Points',
        ]);
    }

    public static function createPurchase(int $userId, string $itemName, int $quantity, int $pointsSpent): self
    {
        return self::create([
            'user_Id' => $userId,
            'type' => 'purchase',
            'priority' => 'normal',
            'title' => 'Purchase Successful!',
            'message' => "You purchased {$quantity} {$itemName} for {$pointsSpent} points",
            'icon' => 'shopping-cart',  // ✅ 使用 icon
            'color' => 'blue',           // ✅ 使用 color
            'data' => [
                'item_name' => $itemName,
                'quantity' => $quantity,
                'points_spent' => $pointsSpent,
            ],
            'action_url' => route('student.inventory.index'),
            'action_text' => 'View Inventory',
        ]);
    }

    /* ===================================
       批量操作
       =================================== */

    public static function markMultipleAsRead(array $notificationIds): int
    {
        return self::whereIn('notification_id', $notificationIds)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    public static function markAllAsReadForUser(int $userId): int
    {
        return self::where('user_Id', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    public static function getUnreadCountForUser(int $userId): int
    {
        return self::where('user_Id', $userId)
            ->where('is_read', false)
            ->count();
    }

    public static function cleanupOldNotifications(int $days = 30): int
    {
        return self::where('is_read', true)
            ->where('read_at', '<', now()->subDays($days))
            ->delete();
    }
}
