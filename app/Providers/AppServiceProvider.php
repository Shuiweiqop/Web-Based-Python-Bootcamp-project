<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Notification; // 🔥 Added
use App\Models\PlacementTest;
use App\Models\ForumReply;   // 🔥 Added
use App\Models\Lesson;       // 🔥 Added
use App\Observers\ForumReplyObserver; // 🔥 Added
use App\Observers\LessonObserver;     // 🔥 Added
use App\Observers\PlacementTestObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // 🔥 Register Observers
        ForumReply::observe(ForumReplyObserver::class);
        Lesson::observe(LessonObserver::class);
        PlacementTest::observe(PlacementTestObserver::class);
        Inertia::share([
            // ✅ Auth user data
            'auth' => function () {
                $user = Auth::user();

                if (!$user) {
                    return ['user' => null];
                }

                $sharedUser = [
                    'id' => (int) $user->user_Id,
                    'user_Id' => (int) $user->user_Id, // 🔥 Added: keep consistency
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ];

                // 🔥 Added: unread notification count
                try {
                    $sharedUser['unread_notifications_count'] = Notification::getUnreadCountForUser($user->user_Id);
                } catch (\Exception $e) {
                    \Log::error('Failed to get unread notifications count: ' . $e->getMessage());
                    $sharedUser['unread_notifications_count'] = 0;
                }

                // Add student profile data
                $studentProfile = $user->studentProfile;
                if ($studentProfile) {
                    $sharedUser['student_profile'] = [
                        'student_id' => $studentProfile->student_id,
                        'current_points' => $studentProfile->current_points,
                        'points_level' => $studentProfile->points_level,
                        'streak_days' => $studentProfile->streak_days,
                    ];
                }

                return ['user' => $sharedUser];
            },

            // ✅ Equipped items data (core feature!)
            'equipped' => function () {
                $user = Auth::user();

                if (!$user) {
                    return null;
                }

                $studentProfile = $user->studentProfile;

                if (!$studentProfile) {
                    return null;
                }

                try {
                    $equippedBg = $studentProfile->getEquippedBackground();
                    $equippedAvatar = $studentProfile->getEquippedAvatarFrame();
                    $equippedTitle = $studentProfile->getEquippedTitle();
                    $equippedBadges = $studentProfile->getEquippedBadges();

                    // ✅ Key fix: always return a complete structure, even if nothing is equipped
                    $result = [
                        'snapshot' => $studentProfile->getEquippedSnapshot(),
                        'background' => $equippedBg ? $this->formatEquippedItem($equippedBg) : null,
                        'avatar_frame' => $equippedAvatar ? $this->formatEquippedItem($equippedAvatar) : null,
                        'title' => $equippedTitle ? $this->formatEquippedItem($equippedTitle) : null,
                        'badges' => $equippedBadges
                            ->map(fn($item) => $this->formatEquippedItem($item))
                            ->filter()
                            ->values()
                            ->toArray(),
                        // ✅ Add timestamp to force frontend refresh
                        'updated_at' => now()->timestamp,
                    ];

                    // ✅ Debug log
                    \Log::info('🎨 Equipped data shared via AppServiceProvider', [
                        'user_id' => $user->user_Id,
                        'student_id' => $studentProfile->student_id,
                        'has_background' => $result['background'] !== null,
                        'background' => $result['background'],
                        'timestamp' => $result['updated_at'],
                    ]);

                    return $result;
                } catch (\Exception $e) {
                    \Log::error('Failed to get equipped data: ' . $e->getMessage());
                    \Log::error($e->getTraceAsString());
                    return [
                        'snapshot' => null,
                        'background' => null,
                        'avatar_frame' => null,
                        'title' => null,
                        'badges' => [],
                        'updated_at' => now()->timestamp,
                    ];
                }
            },

            // ✅ Flash messages
            'flash' => function () {
                return [
                    'success' => session('success'),
                    'error' => session('error'),
                    'warning' => session('warning'), // 🔥 Added
                    'info' => session('info'),       // 🔥 Added
                ];
            },
        ]);
    }

    /**
     * ✅ Format equipped item
     */
    private function formatEquippedItem($inventoryItem): ?array
    {
        if (!$inventoryItem || !$inventoryItem->reward) {
            return null;
        }

        try {
            $reward = $inventoryItem->reward;

            // Handle metadata (may be a JSON string)
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
            \Log::error('Error formatting equipped item: ' . $e->getMessage());
            return null;
        }
    }
}
