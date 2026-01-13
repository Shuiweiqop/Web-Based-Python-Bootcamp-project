<?php

namespace App\Observers;

use App\Models\Lesson;
use App\Models\LessonRegistration;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;

class LessonObserver
{
    /**
     * Triggered when a lesson is updated
     */
    public function updated(Lesson $lesson)
    {
        try {
            // Only send notifications when specific fields are updated
            $notifiableChanges = [
                'title',
                'content',
                'status',
                'difficulty',
            ];

            $changedFields = array_keys($lesson->getDirty());
            $hasNotifiableChange = !empty(array_intersect($changedFields, $notifiableChanges));

            if (!$hasNotifiableChange) {
                return;
            }

            // Get all students registered for this lesson
            $registrations = LessonRegistration::where('lesson_id', $lesson->lesson_id)
                ->where('registration_status', 'active')
                ->with('studentProfile.user')
                ->get();

            if ($registrations->isEmpty()) {
                return;
            }

            // Determine update type
            $updateType = $this->determineUpdateType($lesson, $changedFields);

            // Create a notification for each student
            foreach ($registrations as $registration) {
                $student = $registration->studentProfile;
                if (!$student || !$student->user_Id) {
                    continue;
                }

                $this->createLessonUpdateNotification($lesson, $student->user_Id, $updateType);
            }

            Log::info('✅ Lesson update notifications sent', [
                'lesson_id' => $lesson->lesson_id,
                'students_notified' => $registrations->count(),
                'update_type' => $updateType,
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Failed to send lesson update notifications', [
                'error' => $e->getMessage(),
                'lesson_id' => $lesson->lesson_id ?? null,
            ]);
        }
    }

    /**
     * Determine update type
     */
    protected function determineUpdateType(Lesson $lesson, array $changedFields): string
    {
        if (in_array('status', $changedFields)) {
            return 'status_change';
        }

        if (in_array('content', $changedFields)) {
            return 'content_update';
        }

        if (in_array('title', $changedFields)) {
            return 'title_change';
        }

        if (in_array('difficulty', $changedFields)) {
            return 'difficulty_change';
        }

        return 'general_update';
    }

    /**
     * Create lesson update notification
     */
    protected function createLessonUpdateNotification(Lesson $lesson, int $userId, string $updateType)
    {
        $messages = [
            'status_change' => "The status of the lesson \"{$lesson->title}\" has been updated",
            'content_update' => "The content of the lesson \"{$lesson->title}\" has been updated",
            'title_change' => "A lesson you registered for has been renamed to \"{$lesson->title}\"",
            'difficulty_change' => "The difficulty of the lesson \"{$lesson->title}\" has been adjusted",
            'general_update' => "The lesson \"{$lesson->title}\" has been updated",
        ];

        $priority = ($updateType === 'status_change') ? 'high' : 'normal';

        Notification::create([
            'user_Id' => $userId,
            'type' => 'lesson',
            'priority' => $priority,
            'title' => 'Lesson Update',
            'message' => $messages[$updateType] ?? $messages['general_update'],
            'icon' => 'book-open',
            'color' => 'blue',
            'data' => [
                'lesson_id' => $lesson->lesson_id,
                'lesson_title' => $lesson->title,
                'update_type' => $updateType,
                'updated_at' => now()->toIso8601String(),
            ],
            'action_url' => route('lessons.show', $lesson->lesson_id),
            'action_text' => 'View Lesson',
        ]);
    }

    /**
     * Triggered when a new exercise/test is added to the lesson
     */
    public function exerciseAdded(Lesson $lesson, $exerciseTitle)
    {
        try {
            $registrations = LessonRegistration::where('lesson_id', $lesson->lesson_id)
                ->where('registration_status', 'active')
                ->with('studentProfile.user')
                ->get();

            foreach ($registrations as $registration) {
                $student = $registration->studentProfile;
                if (!$student || !$student->user_Id) {
                    continue;
                }

                Notification::create([
                    'user_Id' => $student->user_Id,
                    'type' => 'lesson',
                    'priority' => 'normal',
                    'title' => 'New Exercise Added',
                    'message' => "A new exercise has been added to the lesson \"{$lesson->title}\": {$exerciseTitle}",
                    'icon' => 'plus-circle',
                    'color' => 'green',
                    'data' => [
                        'lesson_id' => $lesson->lesson_id,
                        'lesson_title' => $lesson->title,
                        'exercise_title' => $exerciseTitle,
                    ],
                    'action_url' => route('lessons.show', $lesson->lesson_id),
                    'action_text' => 'Start Practice',
                ]);
            }

            Log::info('✅ Exercise added notifications sent', [
                'lesson_id' => $lesson->lesson_id,
                'exercise_title' => $exerciseTitle,
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Failed to send exercise added notifications', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
