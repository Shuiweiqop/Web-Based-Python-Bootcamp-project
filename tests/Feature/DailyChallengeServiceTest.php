<?php

namespace Tests\Feature;

use App\Models\DailyChallengeCycleReward;
use App\Models\DailyChallengeDefinition;
use App\Models\DailyChallengeEvent;
use App\Models\DailyChallengeProgress;
use App\Models\Notification;
use App\Models\User;
use App\Services\DailyChallengeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DailyChallengeServiceTest extends TestCase
{
    use RefreshDatabase;

    private DailyChallengeService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(DailyChallengeService::class);
    }

    public function test_exercise_completion_is_deduplicated_by_source_id(): void
    {
        $student = $this->createStudent();

        $summary = $this->service->recordExerciseCompletion($student->student_id, 501);
        $duplicateSummary = $this->service->recordExerciseCompletion($student->student_id, 501);

        $student->refresh();

        $focusSprint = $this->definition('daily_focus_sprint');
        $practiceCombo = $this->definition('daily_practice_combo');
        $weeklyRun = $this->definition('weekly_consistency_run');

        $this->assertSame(30, $student->current_points);
        $this->assertSame(3, DailyChallengeProgress::where('student_id', $student->student_id)->count());
        $this->assertSame(3, DailyChallengeEvent::where('student_id', $student->student_id)->count());
        $this->assertTrue($summary['show_toast']);
        $this->assertSame(30, $summary['points_earned']);
        $this->assertCount(3, $summary['missions_updated']);
        $this->assertFalse($duplicateSummary['show_toast']);
        $this->assertSame(0, $duplicateSummary['points_earned']);
        $this->assertCount(0, $duplicateSummary['missions_updated']);

        $this->assertProgressState($student->student_id, $focusSprint->challenge_definition_id, 1, true, true);
        $this->assertProgressState($student->student_id, $practiceCombo->challenge_definition_id, 1, false, false);
        $this->assertProgressState($student->student_id, $weeklyRun->challenge_definition_id, 1, false, false);
    }

    public function test_full_clear_bonus_is_awarded_once_after_all_daily_missions_are_completed(): void
    {
        $student = $this->createStudent();

        $this->recordDailyFullClear($student->student_id);
        $this->service->recordForumReplyCreated($student->student_id, 999);

        $student->refresh();

        $this->assertSame(265, $student->current_points);
        $this->assertSame(1, DailyChallengeCycleReward::where('student_id', $student->student_id)
            ->where('bonus_code', 'daily_full_clear')
            ->count());
        $this->assertSame(6, Notification::where('user_Id', $student->user_Id)->count());
    }

    public function test_three_day_mission_streak_awards_milestone_bonus(): void
    {
        $student = $this->createStudent();

        DailyChallengeCycleReward::create([
            'student_id' => $student->student_id,
            'period_type' => 'daily',
            'period_start' => now()->subDays(2)->toDateString(),
            'period_end' => now()->subDays(2)->toDateString(),
            'bonus_code' => 'daily_full_clear',
            'title' => 'Full Clear Bonus',
            'reward_points' => 90,
            'granted_at' => now()->subDays(2),
            'metadata' => ['completed_definitions' => 4],
        ]);

        DailyChallengeCycleReward::create([
            'student_id' => $student->student_id,
            'period_type' => 'daily',
            'period_start' => now()->subDay()->toDateString(),
            'period_end' => now()->subDay()->toDateString(),
            'bonus_code' => 'daily_full_clear',
            'title' => 'Full Clear Bonus',
            'reward_points' => 90,
            'granted_at' => now()->subDay(),
            'metadata' => ['completed_definitions' => 4],
        ]);

        $this->recordDailyFullClear($student->student_id);

        $student->refresh();

        $this->assertSame(305, $student->current_points);
        $this->assertDatabaseHas('daily_challenge_cycle_rewards', [
            'student_id' => $student->student_id,
            'bonus_code' => 'daily_streak_3',
            'reward_points' => 40,
        ]);
    }

    public function test_dashboard_board_includes_daily_weekly_and_streak_summary(): void
    {
        $student = $this->createStudent();

        $this->recordDailyFullClear($student->student_id);

        $board = $this->service->getDashboardBoard($student->student_id);

        $this->assertCount(4, $board['daily']);
        $this->assertCount(3, $board['weekly']);
        $this->assertSame(4, $board['summary']['daily_total']);
        $this->assertSame(4, $board['summary']['daily_completed']);
        $this->assertSame(3, $board['summary']['weekly_total']);
        $this->assertSame(0, $board['summary']['weekly_completed']);
        $this->assertSame(595, $board['summary']['total_points_available']);
        $this->assertTrue($board['summary']['daily_full_clear_bonus_earned']);
        $this->assertSame(1, $board['summary']['mission_streak']['current_streak']);
        $this->assertSame(3, $board['summary']['mission_streak']['next_milestone_days']);
        $this->assertSame(2, $board['summary']['mission_streak']['days_to_next_milestone']);
    }

    private function createStudent()
    {
        $user = User::create([
            'name' => 'Test Student',
            'email' => 'student'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
            'email_verified_at' => now(),
        ]);

        return $user->fresh()->studentProfile->fresh();
    }

    private function definition(string $code): DailyChallengeDefinition
    {
        return DailyChallengeDefinition::where('code', $code)->firstOrFail();
    }

    private function assertProgressState(
        int $studentId,
        int $definitionId,
        int $currentCount,
        bool $isCompleted,
        bool $rewardGranted
    ): void {
        $progress = DailyChallengeProgress::where('student_id', $studentId)
            ->where('challenge_definition_id', $definitionId)
            ->firstOrFail();

        $this->assertSame($currentCount, $progress->current_count);
        $this->assertSame($isCompleted, $progress->is_completed);
        $this->assertSame($rewardGranted, $progress->reward_granted);
    }

    private function recordDailyFullClear(int $studentId): void
    {
        $this->service->recordExerciseCompletion($studentId, 101);
        $this->service->recordExerciseCompletion($studentId, 102);
        $this->service->recordExerciseCompletion($studentId, 103);
        $this->service->recordTestPassed($studentId, 201);
        $this->service->recordForumReplyCreated($studentId, 301);
    }
}
