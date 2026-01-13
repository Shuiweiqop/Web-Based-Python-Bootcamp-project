<?php

namespace App\Services;

use App\Models\StudentLearningPath;
use App\Models\LessonProgress;
use App\Models\StudentProfile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LearningPathProgressService
{
    /**
     * 当课程完成时更新相关的学习路径进度
     */
    public function updatePathsForLesson(int $studentId, int $lessonId): void
    {
        try {
            // 🔧 修复：直接查询中间表，而不是使用不存在的模型
            $pathLessons = DB::table('learning_path_lessons')
                ->where('lesson_id', $lessonId)
                ->get();

            foreach ($pathLessons as $pathLesson) {
                // 获取学生在这个路径中的进度
                $studentPath = StudentLearningPath::where('student_id', $studentId)
                    ->where('path_id', $pathLesson->path_id)
                    ->whereIn('status', ['active', 'paused'])
                    ->first();

                if ($studentPath) {
                    $this->recalculateProgress($studentPath);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to update paths for lesson', [
                'student_id' => $studentId,
                'lesson_id' => $lessonId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * 重新计算学习路径进度
     */
    public function recalculateProgress(StudentLearningPath $studentPath): void
    {
        DB::transaction(function () use ($studentPath) {
            // 🔧 修复：直接查询中间表
            $pathLessons = DB::table('learning_path_lessons')
                ->where('path_id', $studentPath->path_id)
                ->orderBy('sequence_order')
                ->get();

            if ($pathLessons->isEmpty()) {
                Log::warning('No lessons found in learning path', [
                    'path_id' => $studentPath->path_id
                ]);
                return;
            }

            $totalLessons = $pathLessons->count();
            $completedCount = 0;
            $inProgressCount = 0;
            $notStartedCount = 0;

            foreach ($pathLessons as $pathLesson) {
                $lessonProgress = LessonProgress::where('student_id', $studentPath->student_id)
                    ->where('lesson_id', $pathLesson->lesson_id)
                    ->first();

                if ($lessonProgress) {
                    switch ($lessonProgress->status) {
                        case 'completed':
                            $completedCount++;
                            break;
                        case 'in_progress':
                            $inProgressCount++;
                            break;
                        default:
                            $notStartedCount++;
                    }
                } else {
                    $notStartedCount++;
                }
            }

            // 计算完成百分比
            $progressPercent = round(($completedCount / $totalLessons) * 100, 2);

            // 确定路径状态
            $pathStatus = $this->determinePathStatus(
                $completedCount,
                $totalLessons,
                $studentPath->status
            );

            // 更新进度数据
            $updateData = [
                'progress_percent' => $progressPercent,
                'last_activity_at' => now(),
            ];

            // 只有当状态真正改变时才更新
            if ($pathStatus !== $studentPath->status) {
                $updateData['status'] = $pathStatus;

                if ($pathStatus === 'completed') {
                    $updateData['completed_at'] = now();
                    $this->grantCompletionReward($studentPath);
                }
            }

            $studentPath->update($updateData);

            Log::info('Learning path progress updated', [
                'student_id' => $studentPath->student_id,
                'path_id' => $studentPath->path_id,
                'progress_percent' => $progressPercent,
                'status' => $pathStatus,
                'completed' => $completedCount,
                'total' => $totalLessons
            ]);
        });
    }

    /**
     * 批量重新计算学生的所有学习路径进度
     */
    public function recalculateAllPathsForStudent(int $studentId): int
    {
        $studentPaths = StudentLearningPath::where('student_id', $studentId)
            ->whereIn('status', ['active', 'paused'])
            ->get();

        $updated = 0;
        foreach ($studentPaths as $studentPath) {
            try {
                $this->recalculateProgress($studentPath);
                $updated++;
            } catch (\Exception $e) {
                Log::error('Failed to recalculate path progress', [
                    'student_path_id' => $studentPath->student_path_id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $updated;
    }

    /**
     * 确定路径状态
     */
    private function determinePathStatus(int $completedCount, int $totalLessons, string $currentStatus): string
    {
        if ($completedCount === $totalLessons) {
            return 'completed';
        }

        // 如果是暂停状态，保持暂停
        if ($currentStatus === 'paused') {
            return 'paused';
        }

        return 'active';
    }

    /**
     * 给予完成奖励
     */
    private function grantCompletionReward(StudentLearningPath $studentPath): void
    {
        // 检查是否已经给过奖励
        if ($studentPath->completion_reward_granted ?? false) {
            return;
        }

        try {
            $student = StudentProfile::find($studentPath->student_id);
            if (!$student) {
                Log::warning('Student not found for path completion reward', [
                    'student_id' => $studentPath->student_id
                ]);
                return;
            }

            // 给予路径完成奖励
            $rewardPoints = 200; // 或者从 learning_path 表中获取
            $student->addPoints(
                $rewardPoints,
                'path_completion',
                "Completed learning path: {$studentPath->learningPath->title}"
            );

            // 标记已给予奖励
            $studentPath->update(['completion_reward_granted' => true]);

            Log::info('Path completion reward granted', [
                'student_id' => $studentPath->student_id,
                'path_id' => $studentPath->path_id,
                'points' => $rewardPoints
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to grant path completion reward', [
                'student_id' => $studentPath->student_id,
                'path_id' => $studentPath->path_id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * 检查并解锁下一个课程（如果需要）
     */
    public function unlockNextLessonIfNeeded(int $studentId, int $pathId, int $completedLessonId): void
    {
        try {
            // 获取刚完成的课程在路径中的顺序
            $currentLesson = DB::table('learning_path_lessons')
                ->where('path_id', $pathId)
                ->where('lesson_id', $completedLessonId)
                ->first();

            if (!$currentLesson) {
                return;
            }

            // 获取下一个需要解锁的课程
            $nextLesson = DB::table('learning_path_lessons')
                ->where('path_id', $pathId)
                ->where('sequence_order', '>', $currentLesson->sequence_order)
                ->where('unlock_after_previous', true)
                ->orderBy('sequence_order')
                ->first();

            if ($nextLesson) {
                Log::info('Next lesson unlocked', [
                    'student_id' => $studentId,
                    'path_id' => $pathId,
                    'lesson_id' => $nextLesson->lesson_id,
                    'sequence_order' => $nextLesson->sequence_order
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to unlock next lesson', [
                'student_id' => $studentId,
                'path_id' => $pathId,
                'error' => $e->getMessage()
            ]);
        }
    }
}
