<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\StudentProfile;

class ForumHelper
{
    /**
     * ✅ 获取当前登录用户的 user_id
     * 
     * @return int|null
     */
    public static function getCurrentUserId(): ?int
    {
        return Auth::id();
    }

    /**
     * 
     * @return User|null
     */
    public static function getCurrentUser(): ?User
    {
        return Auth::user();
    }

    /**

     * 
     * @return StudentProfile|null
     */
    public static function getCurrentStudentProfile(): ?StudentProfile
    {
        if (!Auth::check()) {
            return null;
        }

        $user = Auth::user();

        // 只有学生才有 StudentProfile
        if ($user->role !== 'student') {
            return null;
        }

        return $user->studentProfile;
    }

    /**
     * ✅ 检查当前用户是否可以使用论坛
     * Admin 和 Student 都可以访问
     * 
     * @return bool
     */
    public static function canAccessForum(): bool
    {
        if (!Auth::check()) {
            return false;
        }

        $user = Auth::user();


        return in_array($user->role, ['administrator', 'student']);
    }

    /**
     * ✅ 检查当前用户是否是 Admin
     * 
     * @return bool
     */
    public static function isAdmin(): bool
    {
        if (!Auth::check()) {
            return false;
        }

        return Auth::user()->role === 'administrator';
    }

    /**
     * ✅ 检查当前用户是否是 Student
     * 
     * @return bool
     */
    public static function isStudent(): bool
    {
        if (!Auth::check()) {
            return false;
        }

        return Auth::user()->role === 'student';
    }

    /**
     * ✅ 获取用户显示名称
     * 
     * @param User|null $user
     * @return string
     */
    public static function getUserDisplayName(?User $user): string
    {
        if (!$user) {
            return 'Unknown User';
        }

        return $user->name;
    }

    /**
     * ✅ 获取用户头像
     * 
     * @param User|null $user
     * @return string
     */
    public static function getUserAvatar(?User $user): string
    {
        if (!$user) {
            // 使用 DiceBear API 生成默认头像
            return 'https://api.dicebear.com/7.x/avataaars/svg?seed=unknown&backgroundColor=3B82F6';
        }

        // 如果用户有自定义头像，优先使用
        if ($user->profile_picture && !empty($user->profile_picture)) {
            // 检查是否是完整 URL
            if (filter_var($user->profile_picture, FILTER_VALIDATE_URL)) {
                return $user->profile_picture;
            }

            // 检查本地文件是否存在
            $filePath = public_path($user->profile_picture);
            if (file_exists($filePath)) {
                return asset($user->profile_picture);
            }

            // 如果文件不存在，继续使用生成的头像
        }

        // 生成基于用户信息的唯一头像
        $seed = $user->name ?? $user->email ?? $user->user_Id ?? 'default';
        $seed = urlencode($seed);

        if ($user->role === 'administrator') {
            // Admin 使用机器人风格 + 红色背景
            return "https://api.dicebear.com/7.x/bottts/svg?seed={$seed}&backgroundColor=DC2626";
        }

        // Student 使用头像风格 + 蓝色背景
        return "https://api.dicebear.com/7.x/avataaars/svg?seed={$seed}&backgroundColor=3B82F6";
    }
    /**
     * ✅ 获取用户角色徽章
     * 
     * @param User|null $user
     * @return string
     */
    public static function getUserRoleBadge(?User $user): string
    {
        if (!$user) {
            return '';
        }

        return match ($user->role) {
            'administrator' => '<span class="badge bg-danger">Admin</span>',
            'student' => '<span class="badge bg-primary">Student</span>',
            default => '',
        };
    }

    /**
     * 格式化帖子类别名称
     * 
     * @param string $category
     * @return string
     */
    public static function formatCategoryName(string $category): string
    {
        return match ($category) {
            'general' => 'General Discussion',
            'help' => 'Help & Support',
            'showcase' => 'Project Showcase',
            'resources' => 'Learning Resources',
            'announcements' => 'Announcements',
            'feedback' => 'Feedback & Suggestions',
            default => ucfirst($category),
        };
    }

    /**
     * 获取类别图标
     * 
     * @param string $category
     * @return string
     */
    public static function getCategoryIcon(string $category): string
    {
        return match ($category) {
            'general' => '💬',
            'help' => '❓',
            'showcase' => '🎨',
            'resources' => '📚',
            'announcements' => '📢',
            'feedback' => '💡',
            default => '📝',
        };
    }

    /**
     * 获取类别颜色（Tailwind CSS）
     * 
     * @param string $category
     * @return string
     */
    public static function getCategoryColor(string $category): string
    {
        return match ($category) {
            'general' => 'blue',
            'help' => 'red',
            'showcase' => 'purple',
            'resources' => 'green',
            'announcements' => 'yellow',
            'feedback' => 'orange',
            default => 'gray',
        };
    }

    /**
     * 获取类别 Badge HTML
     * 
     * @param string $category
     * @return string
     */
    public static function getCategoryBadge(string $category): string
    {
        $color = self::getCategoryColor($category);
        $name = self::formatCategoryName($category);
        $icon = self::getCategoryIcon($category);

        return sprintf(
            '<span class="badge bg-%s">%s %s</span>',
            $color,
            $icon,
            $name
        );
    }

    /**
     * 计算相对时间
     * 
     * @param \Carbon\Carbon $datetime
     * @return string
     */
    public static function timeAgo($datetime): string
    {
        if (!$datetime) {
            return 'Unknown';
        }

        return $datetime->diffForHumans();
    }

    /**
     * 截取内容预览
     * 
     * @param string $content
     * @param int $length
     * @return string
     */
    public static function excerpt(string $content, int $length = 150): string
    {
        $content = strip_tags($content);

        if (mb_strlen($content) <= $length) {
            return $content;
        }

        return mb_substr($content, 0, $length) . '...';
    }

    /**
     * ✅ 检查用户是否可以编辑帖子
     * 只有作者可以编辑
     * 
     * @param int $postUserId
     * @return bool
     */
    public static function canEditPost(int $postUserId): bool
    {
        if (!Auth::check()) {
            return false;
        }

        return Auth::id() === $postUserId;
    }

    /**
     * ✅ 检查用户是否可以删除帖子
     * 作者或 Admin 可以删除
     * 
     * @param int $postUserId
     * @return bool
     */
    public static function canDeletePost(int $postUserId): bool
    {
        if (!Auth::check()) {
            return false;
        }

        $user = Auth::user();

        // Admin 可以删除任何帖子
        if ($user->role === 'administrator') {
            return true;
        }

        // 帖子作者可以删除自己的帖子
        return Auth::id() === $postUserId;
    }

    /**
     * ✅ 检查用户是否可以置顶帖子
     * 只有 Admin 可以置顶
     * 
     * @return bool
     */
    public static function canPinPost(): bool
    {
        return self::isAdmin();
    }

    /**
     * ✅ 检查用户是否可以锁定帖子
     * 只有 Admin 可以锁定
     * 
     * @return bool
     */
    public static function canLockPost(): bool
    {
        return self::isAdmin();
    }

    /**
     * ✅ 检查用户是否可以编辑回复
     * 只有作者可以编辑
     * 
     * @param int $replyUserId
     * @return bool
     */
    public static function canEditReply(int $replyUserId): bool
    {
        if (!Auth::check()) {
            return false;
        }

        return Auth::id() === $replyUserId;
    }

    /**
     * ✅ 检查用户是否可以删除回复
     * 作者或 Admin 可以删除
     * 
     * @param int $replyUserId
     * @return bool
     */
    public static function canDeleteReply(int $replyUserId): bool
    {
        if (!Auth::check()) {
            return false;
        }

        $user = Auth::user();

        // Admin 可以删除任何回复
        if ($user->role === 'administrator') {
            return true;
        }

        // 回复作者可以删除自己的回复
        return Auth::id() === $replyUserId;
    }

    /**
     * ✅ 检查用户是否可以标记最佳答案
     * 只有帖子作者可以标记
     * 
     * @param int $postUserId
     * @return bool
     */
    public static function canMarkSolution(int $postUserId): bool
    {
        if (!Auth::check()) {
            return false;
        }

        return Auth::id() === $postUserId;
    }

    /**
     * 格式化数字（浏览量、点赞数）
     * 
     * @param int $number
     * @return string
     */
    public static function formatNumber(int $number): string
    {
        if ($number >= 1000000) {
            return round($number / 1000000, 1) . 'M';
        }

        if ($number >= 1000) {
            return round($number / 1000, 1) . 'K';
        }

        return (string) $number;
    }

    /**
     * ✅ 获取所有可用的类别
     * 
     * @return array
     */
    public static function getCategories(): array
    {
        return [
            'general' => [
                'name' => 'General Discussion',
                'icon' => '💬',
                'color' => 'blue',
                'description' => 'General topics and casual conversations'
            ],
            'help' => [
                'name' => 'Help & Support',
                'icon' => '❓',
                'color' => 'red',
                'description' => 'Ask questions and get help from the community'
            ],
            'showcase' => [
                'name' => 'Project Showcase',
                'icon' => '🎨',
                'color' => 'purple',
                'description' => 'Show off your projects and achievements'
            ],
            'resources' => [
                'name' => 'Learning Resources',
                'icon' => '📚',
                'color' => 'green',
                'description' => 'Share and discover learning materials'
            ],
            'announcements' => [
                'name' => 'Announcements',
                'icon' => '📢',
                'color' => 'yellow',
                'description' => 'Important platform updates and news'
            ],
            'feedback' => [
                'name' => 'Feedback & Suggestions',
                'icon' => '💡',
                'color' => 'orange',
                'description' => 'Share your ideas to improve the platform'
            ],
        ];
    }

    /**
     * ✅ 清理和格式化用户输入的内容
     * 
     * @param string $content
     * @return string
     */
    public static function sanitizeContent(string $content): string
    {
        // 基本 HTML 清理（保留一些安全的标签）
        $allowedTags = '<p><br><strong><em><u><ul><ol><li><a><code><pre><blockquote>';
        return strip_tags($content, $allowedTags);
    }
    public static function getReportReasons()
    {
        return [
            'spam' => [
                'label' => 'Spam',
                'description' => 'Unwanted commercial content or repetitive posts',
                'icon' => '🚫'
            ],
            'inappropriate' => [
                'label' => 'Inappropriate Content',
                'description' => 'Offensive, adult, or explicit content',
                'icon' => '⚠️'
            ],
            'harassment' => [
                'label' => 'Harassment or Bullying',
                'description' => 'Targeting or attacking another user',
                'icon' => '😠'
            ],
            'misinformation' => [
                'label' => 'Misinformation',
                'description' => 'False or misleading information',
                'icon' => '❌'
            ],
            'off_topic' => [
                'label' => 'Off Topic',
                'description' => 'Content not relevant to the forum category',
                'icon' => '📌'
            ],
            'other' => [
                'label' => 'Other',
                'description' => 'Other issues not listed above',
                'icon' => '💬'
            ],
        ];
    }

    /**
     * 获取举报状态列表
     */
    public static function getReportStatuses()
    {
        return [
            'pending' => [
                'label' => 'Pending',
                'color' => 'yellow',
                'description' => 'Awaiting review',
                'icon' => '⏳'
            ],
            'reviewing' => [
                'label' => 'Reviewing',
                'color' => 'blue',
                'description' => 'Under investigation',
                'icon' => '🔍'
            ],
            'resolved' => [
                'label' => 'Resolved',
                'color' => 'green',
                'description' => 'Issue has been addressed',
                'icon' => '✅'
            ],
            'dismissed' => [
                'label' => 'Dismissed',
                'color' => 'gray',
                'description' => 'No action required',
                'icon' => '❎'
            ],
        ];
    }

    /**
     * 获取举报原因的标签
     */
    public static function getReasonLabel($reason)
    {
        $reasons = self::getReportReasons();
        return $reasons[$reason]['label'] ?? ucfirst($reason);
    }

    /**
     * 获取举报状态的标签
     */
    public static function getStatusLabel($status)
    {
        $statuses = self::getReportStatuses();
        return $statuses[$status]['label'] ?? ucfirst($status);
    }

    /**
     * 获取举报状态的颜色
     */
    public static function getStatusColor($status)
    {
        $statuses = self::getReportStatuses();
        return $statuses[$status]['color'] ?? 'gray';
    }
}
