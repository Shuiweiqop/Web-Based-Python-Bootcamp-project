<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Log;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $sharedUser = null;
        $equippedData = null;

        if ($user) {
            try {
                // 基本用户信息
                $sharedUser = [
                    'id' => (int) $user->user_Id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ];

                // ✅ 加载学生档案
                $studentProfile = $user->studentProfile;

                if ($studentProfile) {
                    // ✅ 修复：添加所有必需的学生档案字段
                    $sharedUser['student_profile'] = [
                        'student_id' => $studentProfile->student_id,
                        'current_points' => $studentProfile->current_points ?? 0,
                        'points_level' => $studentProfile->points_level ?? 'Newbie',
                        'streak_days' => $studentProfile->streak_days ?? 0,
                        // ✅ 新增：Dashboard 需要的字段
                        'total_lessons_completed' => $studentProfile->total_lessons_completed ?? 0,
                        'total_tests_taken' => $studentProfile->total_tests_taken ?? 0,
                        'average_score' => $studentProfile->average_score ?? 0,
                        'completion_percentage' => $studentProfile->completion_percentage ?? 0,
                        'streak_status' => $studentProfile->streak_status ?? 'Ready to Start! 🚀',
                        'last_activity_date' => $studentProfile->last_activity_date?->format('Y-m-d'),
                    ];

                    // ✅ 获取装备物品
                    $equippedBackground = null;
                    $equippedAvatarFrame = null;
                    $equippedTitle = null;
                    $equippedBadges = collect();

                    try {
                        $equippedBackground = $studentProfile->getEquippedBackground();
                    } catch (\Exception $e) {
                        Log::error('Failed to get equipped background: ' . $e->getMessage());
                    }

                    try {
                        $equippedAvatarFrame = $studentProfile->getEquippedAvatarFrame();
                    } catch (\Exception $e) {
                        Log::error('Failed to get equipped avatar frame: ' . $e->getMessage());
                    }

                    try {
                        $equippedTitle = $studentProfile->getEquippedTitle();
                    } catch (\Exception $e) {
                        Log::error('Failed to get equipped title: ' . $e->getMessage());
                    }

                    try {
                        $equippedBadges = $studentProfile->getEquippedBadges();
                    } catch (\Exception $e) {
                        Log::error('Failed to get equipped badges: ' . $e->getMessage());
                        $equippedBadges = collect();
                    }

                    // ✅ 构建 equipped 数据
                    $equippedData = [
                        'snapshot' => $studentProfile->getEquippedSnapshot(),
                        'background' => $this->formatEquippedItem($equippedBackground),
                        'avatar_frame' => $this->formatEquippedItem($equippedAvatarFrame),
                        'title' => $this->formatEquippedItem($equippedTitle),
                        'badges' => $equippedBadges
                            ->map(fn($item) => $this->formatEquippedItem($item))
                            ->filter()
                            ->values()
                            ->toArray(),
                    ];

                    // ✅ 调试日志
                    Log::channel('single')->info('🎨 Equipped Data in Middleware', [
                        'user_id' => $user->user_Id,
                        'student_id' => $studentProfile->student_id,
                        'current_points' => $studentProfile->current_points,
                        'has_background' => $equippedBackground !== null,
                        'background_data' => $equippedData['background'],
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Error in HandleInertiaRequests share method: ' . $e->getMessage());
                Log::error($e->getTraceAsString());
            }
        }

        $result = array_merge(parent::share($request), [
            'auth' => [
                'user' => $sharedUser,
            ],
            'equipped' => $equippedData,
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'missionProgress' => fn() => $request->session()->get('missionProgress'),
            ],
        ]);

        return $result;
    }

    /**
     * ✅ 格式化装备物品数据
     */
    private function formatEquippedItem($inventoryItem): ?array
    {
        if (!$inventoryItem || !$inventoryItem->reward) {
            return null;
        }

        try {
            $reward = $inventoryItem->reward;

            // 处理 metadata
            $metadata = $reward->metadata;
            if (is_string($metadata)) {
                $metadata = json_decode($metadata, true) ?? [];
            } elseif (!is_array($metadata)) {
                $metadata = [];
            }

            return [
                'id' => $reward->reward_id,
                'name' => $reward->name,
                'image_url' => $reward->image_url,
                'reward_type' => $reward->reward_type,
                'rarity' => $reward->rarity,
                'metadata' => $metadata,
            ];
        } catch (\Exception $e) {
            Log::error('Error formatting equipped item: ' . $e->getMessage());
            return null;
        }
    }
}
