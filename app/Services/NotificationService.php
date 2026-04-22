<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * NotificationService
 * 
 * 通知服务类 - 统一管理所有通知创建和操作
 */
class NotificationService
{
    /**
     * 获取用户的未读通知数量
     */
    public function getUnreadCount(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->unread()
            ->count();
    }

    /**a
     * 获取用户的所有未读通知
     */
    public function getUnreadNotifications(int $userId, int $limit = 10): Collection
    {
        return Notification::where('user_id', $userId)
            ->unread()
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * 获取用户的所有通知（分页）
     */
    public function getUserNotifications(int $userId, int $perPage = 20)
    {
        return Notification::where('user_id', $userId)
            ->latest()
            ->paginate($perPage);
    }

    /**
     * 标记单个通知为已读
     */
    public function markAsRead(int $notificationId): bool
    {
        $notification = Notification::find($notificationId);

        if (!$notification) {
            return false;
        }

        return $notification->markAsRead();
    }

    /**
     * 标记用户的所有通知为已读
     */
    public function markAllAsRead(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->unread()
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * 删除单个通知
     */
    public function deleteNotification(int $notificationId): bool
    {
        $notification = Notification::find($notificationId);

        if (!$notification) {
            return false;
        }

        return $notification->delete();
    }

    /**
     * 批量删除通知
     */
    public function deleteMultiple(array $notificationIds): int
    {
        // 使用模型提供的 destroy，会按主键删除并返回删除数量
        return Notification::destroy($notificationIds);
    }

    /**
     * 删除已读通知
     */
    public function deleteReadNotifications(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->read()
            ->delete();
    }

    /**
     * 清理过期通知（30天前的已读通知）
     */
    public function cleanupOldNotifications(int $days = 30): int
    {
        return Notification::read()
            ->where('read_at', '<', now()->subDays($days))
            ->delete();
    }

    /**
     * 发送测验完成通知
     */
    public function notifyTestCompletion(int $userId, string $testName, float $score, string $status): Notification
    {
        return Notification::createTest($userId, $testName, $score, $status);
    }

    /**
     * 发送奖励获得通知
     */
    public function notifyRewardReceived(int $userId, string $rewardName, int $quantity, ?string $imageUrl = null): Notification
    {
        return Notification::createReward($userId, $rewardName, $quantity, $imageUrl);
    }

    /**
     * 发送购买确认通知
     */
    public function notifyPurchase(int $userId, string $itemName, int $quantity, int $pointsSpent): Notification
    {
        return Notification::createPurchase($userId, $itemName, $quantity, $pointsSpent);
    }

    /**
     * 发送积分变化通知
     */
    public function notifyPointsChange(int $userId, int $pointsChange, string $reason): Notification
    {
        return Notification::createPoints($userId, $pointsChange, $reason);
    }

    /**
     * 发送成就解锁通知
     */
    public function notifyAchievement(int $userId, string $achievementName, string $description): Notification
    {
        return Notification::createAchievement($userId, $achievementName, $description);
    }

    /**
     * 发送系统通知
     */
    public function notifySystem(int $userId, string $title, string $message, ?array $data = null): Notification
    {
        return Notification::createSystem($userId, $title, $message, $data);
    }

    /**
     * 批量发送通知（给多个用户）
     */
    public function notifyMultipleUsers(array $userIds, string $type, array $data): Collection
    {
        $notifications = collect();

        foreach ($userIds as $userId) {
            $notification = Notification::create([
                'user_id' => $userId,
                'type' => $type,
                ...$data
            ]);

            $notifications->push($notification);
        }

        return $notifications;
    }

    /**
     * 发送公告（给所有用户）
     */
    public function notifyAllUsers(string $title, string $message, string $priority = 'normal'): int
    {
        $userIds = User::pluck('user_Id')->toArray();

        $insertData = array_map(fn($userId) => [
            'user_id' => $userId,
            'type' => 'announcement',
            'priority' => $priority,
            'title' => $title,
            'message' => $message,
            'icon' => 'megaphone',
            'color' => 'blue',
            'is_read' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ], $userIds);

        Notification::insert($insertData);

        return count($userIds);
    }

    /**
     * 获取通知统计
     * 
     * ✅ 修复版本 - 不使用 clone()，而是创建新查询
     */
    public function getNotificationStats(int $userId): array
    {
        // ✅ 方法 1：每次创建新查询（推荐）
        return [
            'total' => Notification::where('user_id', $userId)->count(),
            'unread' => Notification::where('user_id', $userId)->unread()->count(),
            'read' => Notification::where('user_id', $userId)->read()->count(),
            'by_type' => Notification::where('user_id', $userId)
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
            'high_priority' => Notification::where('user_id', $userId)->highPriority()->count(),
        ];
    }

    /**
     * 获取通知统计（优化版本 - 使用单次查询）
     * 
     * ✅ 性能更好的方案
     */
    public function getNotificationStatsOptimized(int $userId): array
    {
        // 一次性获取所有通知
        $notifications = Notification::where('user_id', $userId)
            ->select('type', 'is_read', 'priority')
            ->get();

        // 在 PHP 中计算统计
        $stats = [
            'total' => $notifications->count(),
            'unread' => $notifications->where('is_read', false)->count(),
            'read' => $notifications->where('is_read', true)->count(),
            'by_type' => $notifications->groupBy('type')
                ->map(fn($items) => $items->count())
                ->toArray(),
            'high_priority' => $notifications->where('priority', 'high')->count(),
        ];

        return $stats;
    }

    /**
     * 获取详细的通知统计（包含更多信息）
     */
    public function getDetailedStats(int $userId): array
    {
        $notifications = Notification::where('user_id', $userId)->get();

        return [
            'total' => $notifications->count(),
            'unread' => $notifications->where('is_read', false)->count(),
            'read' => $notifications->where('is_read', true)->count(),

            // 按类型统计
            'by_type' => $notifications->groupBy('type')
                ->map(fn($items) => [
                    'total' => $items->count(),
                    'unread' => $items->where('is_read', false)->count(),
                ])
                ->toArray(),

            // 按优先级统计
            'by_priority' => $notifications->groupBy('priority')
                ->map(fn($items) => $items->count())
                ->toArray(),

            // 今日通知
            'today' => $notifications->filter(function ($notification) {
                return $notification->created_at->isToday();
            })->count(),

            // 本周通知
            'this_week' => $notifications->filter(function ($notification) {
                return $notification->created_at->isCurrentWeek();
            })->count(),

            // 最新未读
            'latest_unread' => $notifications
                ->where('is_read', false)
                ->sortByDesc('created_at')
                ->take(5)
                ->values()
                ->toArray(),
        ];
    }
}
