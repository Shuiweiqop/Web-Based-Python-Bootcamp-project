<?php

namespace App\Services;

use App\Models\StudentLearningPath;
use App\Models\StudentProfile;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Support\Facades\Log;

class PathProgressService
{
    /**
     * Update progress for a specific student learning path
     *
     * @param StudentLearningPath $studentPath
     * @return array
     */
    public function updatePathProgress(StudentLearningPath $studentPath): array
    {
        $previousProgress = $studentPath->progress_percent;

        // Calculate new progress
        $studentPath->updateProgress();

        $newProgress = $studentPath->fresh()->progress_percent;

        $result = [
            'previous_progress' => $previousProgress,
            'current_progress' => $newProgress,
            'progress_changed' => $previousProgress !== $newProgress,
            'status' => $studentPath->status,
        ];

        // Check if path was just completed
        if ($studentPath->status === 'completed' && $previousProgress < 100) {
            $result['milestone'] = 'completed';
            $result['message'] = '🎉 Congratulations! You have completed the learning path!';

            $this->handlePathCompletion($studentPath);
        }
        // Check for milestone achievements
        elseif ($this->checkMilestone($previousProgress, $newProgress)) {
            $milestone = $this->getMilestone($newProgress);
            $result['milestone'] = $milestone['key'];
            $result['message'] = $milestone['message'];
        }

        Log::info('Path progress updated', [
            'student_path_id' => $studentPath->student_path_id,
            'student_id' => $studentPath->student_id,
            'path_id' => $studentPath->path_id,
            'progress' => $newProgress,
            'milestone' => $result['milestone'] ?? null,
        ]);

        return $result;
    }

    /**
     * Update all active paths for a student
     *
     * @param StudentProfile $student
     * @return array
     */
    public function updateAllStudentPaths(StudentProfile $student): array
    {
        $activePaths = $student->learningPaths()
            ->where('status', 'active')
            ->get();

        $results = [];

        foreach ($activePaths as $path) {
            $results[] = $this->updatePathProgress($path);
        }

        return [
            'total_paths_updated' => count($results),
            'paths' => $results,
        ];
    }

    /**
     * Get detailed progress breakdown for a path
     *
     * @param StudentLearningPath $studentPath
     * @return array
     */
    public function getDetailedProgress(StudentLearningPath $studentPath): array
    {
        $path = $studentPath->learningPath;
        $student = $studentPath->student;
        $lessons = $path->lessons;

        $lessonDetails = [];
        $totalLessons = 0;
        $completedLessons = 0;
        $inProgressLessons = 0;
        $lockedLessons = 0;
        $notStartedLessons = 0;

        foreach ($lessons as $lesson) {
            $totalLessons++;

            $progress = LessonProgress::where('student_id', $student->student_id)
                ->where('lesson_id', $lesson->lesson_id)
                ->first();

            $isLocked = $lesson->isLockedForStudent($student->student_id, $path->path_id);

            $lessonStatus = 'not_started';
            $lessonProgress = 0;

            if ($progress) {
                $lessonStatus = $progress->status;
                $lessonProgress = $progress->progress_percent;

                if ($progress->status === 'completed') {
                    $completedLessons++;
                } elseif ($progress->status === 'in_progress') {
                    $inProgressLessons++;
                } else {
                    $notStartedLessons++;
                }
            } else {
                $notStartedLessons++;
            }

            if ($isLocked) {
                $lockedLessons++;
            }

            $lessonDetails[] = [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
                'sequence_order' => $lesson->pivot->sequence_order,
                'is_required' => $lesson->pivot->is_required,
                'is_locked' => $isLocked,
                'status' => $lessonStatus,
                'progress_percent' => $lessonProgress,
                'estimated_duration' => $lesson->pivot->estimated_duration_minutes ?? $lesson->estimated_duration,
            ];
        }

        return [
            'path' => [
                'path_id' => $path->path_id,
                'title' => $path->title,
                'difficulty_level' => $path->difficulty_level,
            ],
            'overall_progress' => $studentPath->progress_percent,
            'status' => $studentPath->status,
            'summary' => [
                'total_lessons' => $totalLessons,
                'completed_lessons' => $completedLessons,
                'in_progress_lessons' => $inProgressLessons,
                'not_started_lessons' => $notStartedLessons,
                'locked_lessons' => $lockedLessons,
            ],
            'lessons' => $lessonDetails,
            'next_lesson' => $this->getNextLesson($studentPath),
            'estimated_time_remaining' => $this->calculateEstimatedTimeRemaining($studentPath),
        ];
    }

    /**
     * Get next lesson for student in path
     *
     * @param StudentLearningPath $studentPath
     * @return array|null
     */
    private function getNextLesson(StudentLearningPath $studentPath): ?array
    {
        $nextLesson = $studentPath->getNextLesson();

        if (!$nextLesson) {
            return null;
        }

        return [
            'lesson_id' => $nextLesson->lesson_id,
            'title' => $nextLesson->title,
            'difficulty' => $nextLesson->difficulty,
            'estimated_duration' => $nextLesson->estimated_duration,
            'is_locked' => $nextLesson->isLockedForStudent(
                $studentPath->student_id,
                $studentPath->path_id
            ),
        ];
    }

    /**
     * Calculate estimated time remaining for path
     *
     * @param StudentLearningPath $studentPath
     * @return int Minutes
     */
    private function calculateEstimatedTimeRemaining(StudentLearningPath $studentPath): int
    {
        $path = $studentPath->learningPath;
        $student = $studentPath->student;
        $remainingMinutes = 0;

        foreach ($path->lessons as $lesson) {
            $progress = LessonProgress::where('student_id', $student->student_id)
                ->where('lesson_id', $lesson->lesson_id)
                ->first();

            // Only count incomplete lessons
            if (!$progress || $progress->status !== 'completed') {
                $duration = $lesson->pivot->estimated_duration_minutes ?? $lesson->estimated_duration ?? 60;
                $remainingMinutes += $duration;
            }
        }

        return $remainingMinutes;
    }

    /**
     * Check if student crossed a milestone
     *
     * @param int $previousProgress
     * @param int $currentProgress
     * @return bool
     */
    private function checkMilestone(int $previousProgress, int $currentProgress): bool
    {
        $milestones = [25, 50, 75, 100];

        foreach ($milestones as $milestone) {
            if ($previousProgress < $milestone && $currentProgress >= $milestone) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get milestone details
     *
     * @param int $progress
     * @return array
     */
    private function getMilestone(int $progress): array
    {
        return match (true) {
            $progress >= 100 => [
                'key' => 'completed',
                'message' => '🎉 Path completed! Amazing work!',
                'icon' => '🏆',
            ],
            $progress >= 75 => [
                'key' => '75_percent',
                'message' => '🎯 75% complete! You\'re almost there!',
                'icon' => '🎯',
            ],
            $progress >= 50 => [
                'key' => '50_percent',
                'message' => '⭐ Halfway there! Keep up the great work!',
                'icon' => '⭐',
            ],
            $progress >= 25 => [
                'key' => '25_percent',
                'message' => '🚀 25% complete! You\'re making great progress!',
                'icon' => '🚀',
            ],
            default => [
                'key' => 'started',
                'message' => '👋 Welcome! Let\'s begin your learning journey!',
                'icon' => '👋',
            ],
        };
    }

    /**
     * Handle path completion (awards, notifications, etc.)
     *
     * @param StudentLearningPath $studentPath
     * @return void
     */
    private function handlePathCompletion(StudentLearningPath $studentPath): void
    {
        $student = $studentPath->student;
        $path = $studentPath->learningPath;

        // Award completion points (if configured)
        if ($path->completion_reward_points ?? 0 > 0) {
            $student->addPoints($path->completion_reward_points);

            Log::info('Path completion points awarded', [
                'student_id' => $student->student_id,
                'path_id' => $path->path_id,
                'points' => $path->completion_reward_points,
            ]);
        }

        // TODO: Send notification
        // TODO: Award badge/certificate
        // TODO: Recommend next path

        Log::info('Learning path completed', [
            'student_id' => $student->student_id,
            'path_id' => $path->path_id,
            'completed_at' => $studentPath->completed_at,
        ]);
    }

    /**
     * Get learning path analytics for student
     *
     * @param StudentProfile $student
     * @return array
     */
    public function getStudentPathAnalytics(StudentProfile $student): array
    {
        $paths = $student->learningPaths()->with('learningPath')->get();

        $analytics = [
            'total_paths' => $paths->count(),
            'active_paths' => $paths->where('status', 'active')->count(),
            'completed_paths' => $paths->where('status', 'completed')->count(),
            'paused_paths' => $paths->where('status', 'paused')->count(),
            'abandoned_paths' => $paths->where('status', 'abandoned')->count(),
            'average_progress' => round($paths->avg('progress_percent'), 2),
            'total_time_in_paths_days' => $paths->sum('days_in_path'),
            'paths_by_difficulty' => [
                'beginner' => 0,
                'intermediate' => 0,
                'advanced' => 0,
            ],
        ];

        foreach ($paths as $path) {
            $difficulty = $path->learningPath->difficulty_level;
            $analytics['paths_by_difficulty'][$difficulty]++;
        }

        return $analytics;
    }

    /**
     * Check if student should be re-evaluated
     *
     * @param StudentProfile $student
     * @return bool
     */
    public function shouldReevaluate(StudentProfile $student): bool
    {
        $completedLessonsCount = $student->lessonProgress()
            ->where('status', 'completed')
            ->where('completed_at', '>=', now()->subDays(30))
            ->count();

        $threshold = config('recommendation.auto_recommend_after_lessons', 3);

        return $completedLessonsCount >= $threshold;
    }
}
