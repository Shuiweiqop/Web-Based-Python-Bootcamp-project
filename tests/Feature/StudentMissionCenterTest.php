<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\DailyChallengeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentMissionCenterTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_view_mission_center_with_reward_history(): void
    {
        $user = $this->createVerifiedUser('student');
        $student = $user->studentProfile;

        app(DailyChallengeService::class)->recordExerciseCompletion($student->student_id, 101);
        app(DailyChallengeService::class)->recordExerciseCompletion($student->student_id, 102);
        app(DailyChallengeService::class)->recordExerciseCompletion($student->student_id, 103);
        app(DailyChallengeService::class)->recordTestPassed($student->student_id, 201);
        app(DailyChallengeService::class)->recordForumReplyCreated($student->student_id, 301);

        $response = $this->actingAs($user)->get(route('student.missions.index'));

        $response->assertOk();
        $response->assertSee('daily_full_clear');
        $response->assertSee('daily_focus_sprint');
    }

    public function test_student_can_open_dedicated_mission_history_and_archive_pages(): void
    {
        $user = $this->createVerifiedUser('student');
        $student = $user->studentProfile;

        app(DailyChallengeService::class)->recordExerciseCompletion($student->student_id, 401);
        app(DailyChallengeService::class)->recordExerciseCompletion($student->student_id, 402);
        app(DailyChallengeService::class)->recordExerciseCompletion($student->student_id, 403);
        app(DailyChallengeService::class)->recordTestPassed($student->student_id, 501);
        app(DailyChallengeService::class)->recordForumReplyCreated($student->student_id, 601);

        $historyResponse = $this->actingAs($user)->get(route('student.missions.history'));
        $historyResponse->assertOk();
        $historyResponse->assertSee('daily_full_clear');

        $archiveResponse = $this->actingAs($user)->get(route('student.missions.archive'));
        $archiveResponse->assertOk();
        $archiveResponse->assertSee('daily_focus_sprint');
    }

    public function test_administrator_cannot_access_student_mission_center(): void
    {
        $admin = $this->createVerifiedUser('administrator');

        $response = $this->actingAs($admin)
            ->withHeader('X-Inertia', 'true')
            ->get(route('student.missions.index'));

        $response->assertForbidden();
    }

    private function createVerifiedUser(string $role): User
    {
        $user = User::create([
            'name' => ucfirst($role) . ' Mission User',
            'email' => $role . '-mission-' . uniqid() . '@example.com',
            'password' => 'password',
            'role' => $role,
        ]);

        $user->forceFill(['email_verified_at' => now()])->save();

        return $user->fresh();
    }
}
