<?php

namespace App\Listeners;

use App\Events\LessonCreated;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class SendLessonCreatedNotifications
{
    public function handle(LessonCreated $event)
    {
        $lesson = $event->lesson;

        // 获取所有学生
        $students = User::where('role', 'student')->get();

        foreach ($students as $student) {
            Notification::create([
                'user_Id' => $student->user_Id,
                'type' => 'lesson',
                'priority' => 'normal',
                'title' => '🎓 新课程发布！',
                'message' => "新课程「{$lesson->title}」已发布，快来学习吧！",
                'icon' => 'book',
                'color' => 'blue',
                'data' => [
                    'lesson_id' => $lesson->lesson_id,
                    'lesson_title' => $lesson->title,
                ],
                'action_url' => route('lessons.show', $lesson->lesson_id),
                'action_text' => '查看课程',
            ]);
        }

        Log::info('📢 Notifications sent for new lesson', [
            'lesson_id' => $lesson->lesson_id,
            'students_notified' => $students->count(),
        ]);
    }
}
