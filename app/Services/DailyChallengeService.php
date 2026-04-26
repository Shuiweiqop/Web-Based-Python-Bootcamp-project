<?php

namespace App\Services;

use App\Models\DailyChallengeDefinition;
use App\Models\DailyChallengeEvent;
use App\Models\DailyChallengeProgress;
use App\Models\Notification;
use App\Models\StudentProfile;
use Carbon\CarbonImmutable;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DailyChallengeService
{
    public function recordExerciseCompletion(int $studentId, int|string $submissionId): void
    {
        $this->recordAction($studentId, 'exercise_completed', 'exercise_submission', $submissionId);
    }

    public function recordTestPassed(int $studentId, int|string $submissionId): void
    {
        $this->recordAction($studentId, 'test_passed', 'test_submission', $submissionId);
    }

    public function recordForumReplyCreated(int $studentId, int|string $replyId): void
    {
        $this->recordAction($studentId, 'forum_reply_created', 'forum_reply', $replyId);
    }

    private function recordAction(
        int $studentId,
        string $actionType,
        string $sourceType,
        int|string $sourceId
    ): void {
        $definitions = DailyChallengeDefinition::query()
            ->where('is_active', true)
            ->where('action_type', $actionType)
            ->orderBy('display_order')
            ->get();

        if ($definitions->isEmpty()) {
            return;
        }

        foreach ($definitions as $definition) {
            DB::transaction(function () use ($studentId, $definition, $sourceType, $sourceId): void {
                [$periodStart, $periodEnd] = $this->resolvePeriodWindow($definition->period_type);

                $progress = DailyChallengeProgress::query()
                    ->where('student_id', $studentId)
                    ->where('challenge_definition_id', $definition->challenge_definition_id)
                    ->whereDate('period_start', $periodStart->toDateString())
                    ->lockForUpdate()
                    ->first();

                if (!$progress) {
                    $progress = DailyChallengeProgress::create([
                        'student_id' => $studentId,
                        'challenge_definition_id' => $definition->challenge_definition_id,
                        'period_start' => $periodStart->toDateString(),
                        'period_end' => $periodEnd->toDateString(),
                        'current_count' => 0,
                        'is_completed' => false,
                        'reward_granted' => false,
                    ]);
                }

                $sourceIdString = (string) $sourceId;
                $existingEvent = DailyChallengeEvent::query()
                    ->where('challenge_progress_id', $progress->challenge_progress_id)
                    ->where('source_type', $sourceType)
                    ->where('source_id', $sourceIdString)
                    ->exists();

                if ($existingEvent) {
                    return;
                }

                try {
                    DailyChallengeEvent::create([
                        'challenge_progress_id' => $progress->challenge_progress_id,
                        'student_id' => $studentId,
                        'challenge_definition_id' => $definition->challenge_definition_id,
                        'source_type' => $sourceType,
                        'source_id' => $sourceIdString,
                        'occurred_at' => now(),
                    ]);
                } catch (QueryException $exception) {
                    // Another request may have recorded this exact source event first.
                    if (($exception->errorInfo[0] ?? null) === '23000') {
                        return;
                    }

                    throw $exception;
                }

                $newCount = min($definition->target_count, $progress->current_count + 1);
                $isCompleted = $progress->is_completed || $newCount >= $definition->target_count;
                $completedAt = $progress->completed_at;

                if (!$progress->is_completed && $isCompleted) {
                    $completedAt = now();
                }

                $progress->update([
                    'current_count' => $newCount,
                    'is_completed' => $isCompleted,
                    'completed_at' => $completedAt,
                    'last_event_at' => now(),
                ]);

                if ($isCompleted && !$progress->reward_granted && $definition->reward_points > 0) {
                    $student = StudentProfile::query()
                        ->where('student_id', $studentId)
                        ->lockForUpdate()
                        ->first();

                    if (!$student) {
                        Log::warning('Daily challenge reward skipped because student profile was missing', [
                            'student_id' => $studentId,
                            'challenge_definition_id' => $definition->challenge_definition_id,
                        ]);

                        return;
                    }

                    $student->increment('current_points', $definition->reward_points);

                    Notification::createPoints(
                        (int) $student->user_Id,
                        (int) $definition->reward_points,
                        'Challenge complete: ' . $definition->title
                    );

                    $progress->update([
                        'reward_granted' => true,
                        'reward_granted_at' => now(),
                    ]);
                }
            });
        }
    }

    private function resolvePeriodWindow(string $periodType): array
    {
        $now = CarbonImmutable::now(config('app.timezone'));

        if ($periodType === 'weekly') {
            $start = $now->startOfWeek(CarbonImmutable::MONDAY);
            $end = $start->endOfWeek(CarbonImmutable::SUNDAY);

            return [$start, $end];
        }

        $start = $now->startOfDay();
        $end = $now->endOfDay();

        return [$start, $end];
    }
}
