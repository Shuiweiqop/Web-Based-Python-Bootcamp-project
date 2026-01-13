<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Get current user ID (safer approach)
     */
    protected function getCurrentUserId(): int
    {
        $user = Auth::user();

        if (!$user) {
            abort(401, 'Unauthenticated');
        }

        return $user->user_Id;
    }

    /**
     * Get current student profile (with error handling)
     */
    protected function getStudentProfile()
    {
        $user = Auth::user();

        if (!$user) {
            abort(401, 'Unauthenticated');
        }

        $studentProfile = StudentProfile::where('user_Id', $user->user_Id)->first();

        // If no student profile exists, fall back to user ID (compatible with admins and other roles)
        if (!$studentProfile) {
            Log::warning('No student profile found, using user_Id directly', [
                'user_Id' => $user->user_Id,
                'role' => $user->role,
            ]);
        }

        return $studentProfile;
    }

    /**
     * Display all notifications
     */
    public function index(Request $request)
    {
        $userId = $this->getCurrentUserId();

        $query = Notification::where('user_Id', $userId);

        // Filters
        if ($request->filled('type') && $request->type !== 'all') {
            $query->ofType($request->type);
        }

        if ($request->filled('status')) {
            if ($request->status === 'unread') {
                $query->unread();
            } elseif ($request->status === 'read') {
                $query->read();
            }
        }

        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->byPriority($request->priority);
        }

        // Sorting
        $query->orderBy('created_at', 'desc');

        $notifications = $query->paginate(20)->withQueryString();

        // Statistics
        $stats = [
            'unread_count' => Notification::getUnreadCountForUser($userId),
            'total_count' => Notification::where('user_Id', $userId)->count(),
            'high_priority_count' => Notification::where('user_Id', $userId)
                ->highPriority()
                ->unread()
                ->count(),
        ];

        return Inertia::render('Student/Notifications/Index', [
            'notifications' => $notifications,
            'stats' => $stats,
            'filters' => [
                'type' => $request->get('type', 'all'),
                'status' => $request->get('status', 'all'),
                'priority' => $request->get('priority', 'all'),
            ],
            'notificationTypes' => [
                'system' => 'System',
                'reward' => 'Reward',
                'test' => 'Test',
                'lesson' => 'Lesson',
                'achievement' => 'Achievement',
                'points' => 'Points',
                'purchase' => 'Purchase',
                'reminder' => 'Reminder',
                'announcement' => 'Announcement',
                'social' => 'Social',
            ],
        ]);
    }

    /**
     * Get unread notifications (for real-time display)
     * ✅ Fixed version - added detailed logs and error handling
     */
    public function unread(Request $request)
    {
        try {
            $userId = $this->getCurrentUserId();
            $limit = $request->get('limit', 10);

            Log::info('🔔 Fetching unread notifications', [
                'user_id' => $userId,
                'limit' => $limit,
            ]);

            $notifications = Notification::where('user_Id', $userId)
                ->unread()
                ->recent()
                ->orderBy('priority', 'desc')
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            $unreadCount = Notification::getUnreadCountForUser($userId);

            Log::info('✅ Notifications fetched successfully', [
                'count' => $notifications->count(),
                'unread_count' => $unreadCount,
            ]);

            return response()->json([
                'success' => true,
                'notifications' => $notifications,
                'unread_count' => $unreadCount,
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Failed to fetch notifications', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch notifications',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
                'notifications' => [],
                'unread_count' => 0,
            ], 500);
        }
    }

    /**
     * Mark a single notification as read
     */
    public function markAsRead($id)
    {
        try {
            $userId = $this->getCurrentUserId();

            $notification = Notification::where('notification_id', $id)
                ->where('user_Id', $userId)
                ->firstOrFail();

            $notification->markAsRead();

            Log::info('✅ Notification marked as read', [
                'notification_id' => $id,
                'user_id' => $userId,
            ]);

            // If AJAX request, return JSON
            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Notification marked as read',
                    'unread_count' => Notification::getUnreadCountForUser($userId),
                ]);
            }

            return back()->with('success', 'Notification marked as read');
        } catch (\Exception $e) {
            Log::error('❌ Failed to mark notification as read', [
                'notification_id' => $id,
                'error' => $e->getMessage(),
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to mark as read',
                ], 500);
            }

            return back()->with('error', 'Operation failed, please try again');
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        try {
            $userId = $this->getCurrentUserId();

            $count = Notification::markAllAsReadForUser($userId);

            Log::info('✅ All notifications marked as read', [
                'user_id' => $userId,
                'count' => $count,
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => "Marked {$count} notifications as read",
                    'marked_count' => $count,
                    'unread_count' => 0,
                ]);
            }

            return back()->with('success', "Marked {$count} notifications as read");
        } catch (\Exception $e) {
            Log::error('❌ Failed to mark all as read', [
                'error' => $e->getMessage(),
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to mark all as read',
                ], 500);
            }

            return back()->with('error', 'Operation failed, please try again');
        }
    }

    /**
     * Mark multiple notifications as read
     */
    public function markMultipleAsRead(Request $request)
    {
        try {
            $request->validate([
                'notification_ids' => 'required|array',
                'notification_ids.*' => 'integer|exists:notifications,notification_id',
            ]);

            $userId = $this->getCurrentUserId();

            // Ensure notifications belong to current user
            $notifications = Notification::where('user_Id', $userId)
                ->whereIn('notification_id', $request->notification_ids)
                ->get();

            $count = 0;
            foreach ($notifications as $notification) {
                if ($notification->markAsRead()) {
                    $count++;
                }
            }

            Log::info('✅ Multiple notifications marked as read', [
                'user_id' => $userId,
                'count' => $count,
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => "Marked {$count} notifications as read",
                    'marked_count' => $count,
                    'unread_count' => Notification::getUnreadCountForUser($userId),
                ]);
            }

            return back()->with('success', "Marked {$count} notifications as read");
        } catch (\Exception $e) {
            Log::error('❌ Failed to mark multiple notifications as read', [
                'error' => $e->getMessage(),
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to mark notifications as read',
                ], 500);
            }

            return back()->with('error', 'Operation failed, please try again');
        }
    }

    /**
     * Delete a notification
     */
    public function destroy($id)
    {
        try {
            $userId = $this->getCurrentUserId();

            $notification = Notification::where('notification_id', $id)
                ->where('user_Id', $userId)
                ->firstOrFail();

            $notification->delete();

            Log::info('✅ Notification deleted', [
                'notification_id' => $id,
                'user_id' => $userId,
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Notification deleted',
                    'unread_count' => Notification::getUnreadCountForUser($userId),
                ]);
            }

            return back()->with('success', 'Notification deleted');
        } catch (\Exception $e) {
            Log::error('❌ Failed to delete notification', [
                'notification_id' => $id,
                'error' => $e->getMessage(),
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete notification',
                ], 500);
            }

            return back()->with('error', 'Delete failed, please try again');
        }
    }

    /**
     * Delete multiple notifications
     */
    public function destroyMultiple(Request $request)
    {
        try {
            $request->validate([
                'notification_ids' => 'required|array',
                'notification_ids.*' => 'integer|exists:notifications,notification_id',
            ]);

            $userId = $this->getCurrentUserId();

            $count = Notification::where('user_Id', $userId)
                ->whereIn('notification_id', $request->notification_ids)
                ->delete();

            Log::info('✅ Multiple notifications deleted', [
                'user_id' => $userId,
                'count' => $count,
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => "Deleted {$count} notifications",
                    'deleted_count' => $count,
                    'unread_count' => Notification::getUnreadCountForUser($userId),
                ]);
            }

            return back()->with('success', "Deleted {$count} notifications");
        } catch (\Exception $e) {
            Log::error('❌ Failed to delete multiple notifications', [
                'error' => $e->getMessage(),
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete notifications',
                ], 500);
            }

            return back()->with('error', 'Delete failed, please try again');
        }
    }

    /**
     * Clear read notifications
     */
    public function clearRead()
    {
        try {
            $userId = $this->getCurrentUserId();

            $count = Notification::where('user_Id', $userId)
                ->where('is_read', true)
                ->delete();

            Log::info('✅ Read notifications cleared', [
                'user_id' => $userId,
                'count' => $count,
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => "Cleared {$count} read notifications",
                    'deleted_count' => $count,
                ]);
            }

            return back()->with('success', "Cleared {$count} read notifications");
        } catch (\Exception $e) {
            Log::error('❌ Failed to clear read notifications', [
                'error' => $e->getMessage(),
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to clear notifications',
                ], 500);
            }

            return back()->with('error', 'Clear failed, please try again');
        }
    }

    /**
     * Get notification settings (reserved)
     */
    public function settings()
    {
        try {
            $userId = $this->getCurrentUserId();

            // Notification settings can be loaded from database or config
            $settings = [
                'email_notifications' => true,
                'push_notifications' => true,
                'notification_types' => [
                    'system' => true,
                    'reward' => true,
                    'test' => true,
                    'lesson' => true,
                    'achievement' => true,
                    'points' => true,
                    'purchase' => true,
                    'reminder' => true,
                    'announcement' => true,
                    'social' => true,
                ],
            ];

            return Inertia::render('Student/Notifications/Settings', [
                'settings' => $settings,
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Failed to load notification settings', [
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to load settings');
        }
    }
}
