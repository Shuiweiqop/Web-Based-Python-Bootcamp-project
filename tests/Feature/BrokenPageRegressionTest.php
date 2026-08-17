<?php

namespace Tests\Feature;

use App\Models\Lesson;
use App\Models\Reward;
use App\Models\StudentLearningPath;
use App\Models\Test;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Regression tests for five pages that returned 500 or 404 in production code.
 *
 * All five were found by the mobile audit sweeping every parameter-free route
 * (tests/e2e/mobile-responsive-audit.spec.js) — none had any test coverage, so
 * nothing caught them. These assert the pages simply load, which is exactly the
 * bar they previously failed to clear.
 */
class BrokenPageRegressionTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'administrator']);
    }

    private function student(): User
    {
        return User::factory()->student()->create();
    }

    /**
     * StudentProfileController::edit did not exist, though both the route and
     * Student/Profile/Edit.jsx did.
     */
    public function test_student_profile_edit_page_loads(): void
    {
        $response = $this->actingAs($this->student())->get(route('student.profile.edit'));

        $response->assertOk();
    }

    /**
     * The points ledger queried `points_change` and `reason`; reward_records
     * has neither (the columns are `points_changed` and `issued_by`).
     */
    public function test_student_points_page_loads(): void
    {
        $response = $this->actingAs($this->student())->get(route('student.profile.points'));

        $response->assertOk();
    }

    public function test_student_points_page_loads_with_reward_history(): void
    {
        $user = $this->student();
        $profile = $user->studentProfile;

        $reward = Reward::create([
            'name' => 'Test Badge',
            'description' => 'A badge.',
            'reward_type' => 'badge',
            'rarity' => 'common',
            'point_cost' => 50,
            'stock_quantity' => -1,
            'max_owned' => -1,
            'is_active' => true,
        ]);

        // Exercise both branches of the ledger: an award and a purchase.
        $profile->rewardRecords()->create([
            'reward_id' => $reward->reward_id,
            'quantity' => 1,
            'points_spent' => 0,
            'points_before' => 0,
            'points_after' => 100,
            'points_changed' => 100,
            'issued_by' => 'system',
        ]);

        $profile->rewardRecords()->create([
            'reward_id' => $reward->reward_id,
            'quantity' => 1,
            'points_spent' => 50,
            'points_before' => 100,
            'points_after' => 50,
            'points_changed' => -50,
            'issued_by' => 'student_purchase',
        ]);

        $response = $this->actingAs($user)->get(route('student.profile.points'));

        $response->assertOk();
    }

    /**
     * AdminTestController::index did not exist, though the admin/tests route
     * group pointed at it.
     */
    public function test_admin_global_tests_index_loads(): void
    {
        $lesson = Lesson::create([
            'title' => 'L', 'description' => 'd', 'content' => 'c',
            'difficulty' => 'beginner', 'status' => 'active',
        ]);

        Test::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Quiz', 'description' => 'd',
            'status' => 'active', 'test_type' => 'lesson',
        ]);

        // A standalone test (no lesson) must not break the listing — the
        // placement test is exactly this shape.
        Test::create([
            'lesson_id' => null,
            'title' => 'Placement', 'description' => 'd',
            'status' => 'active', 'test_type' => 'placement',
        ]);

        $response = $this->actingAs($this->admin())->get(route('admin.tests.index'));

        $response->assertOk();
    }

    /**
     * The monthly-trends query used DATE_FORMAT, which is MySQL-only. Every
     * environment here runs SQLite, so this page 500'd everywhere — including
     * the deployed demo.
     */
    public function test_admin_student_path_analytics_loads_on_sqlite(): void
    {
        $response = $this->actingAs($this->admin())->get(route('admin.student-paths.analytics'));

        $response->assertOk();
    }

    public function test_admin_student_path_analytics_loads_with_assignment_data(): void
    {
        $student = $this->student()->studentProfile;

        $path = \App\Models\LearningPath::create([
            'title' => 'Beginner Path',
            'description' => 'd',
            'difficulty_level' => 'beginner',
            'status' => 'active',
            'min_score_required' => 0,
            'max_score_required' => 60,
        ]);

        StudentLearningPath::create([
            'student_id' => $student->student_id,
            'path_id' => $path->path_id,
            'assigned_by' => 'system',
            'status' => 'completed',
            'assigned_at' => now()->subMonths(2),
        ]);

        $response = $this->actingAs($this->admin())->get(route('admin.student-paths.analytics'));

        $response->assertOk();
    }

    /**
     * rewards/stats was registered after Route::resource('rewards'), so
     * rewards/{reward} matched first and "stats" was read as a reward id.
     */
    public function test_admin_rewards_stats_route_is_not_shadowed_by_the_resource_route(): void
    {
        $response = $this->actingAs($this->admin())->get(route('admin.rewards.stats'));

        $response->assertOk();
    }

    /**
     * The reordering that fixed stats must not have broken the resource route
     * it was moved ahead of.
     */
    public function test_admin_rewards_resource_routes_still_work(): void
    {
        $reward = Reward::create([
            'name' => 'Badge',
            'description' => 'd',
            'reward_type' => 'badge',
            'rarity' => 'common',
            'point_cost' => 10,
            'stock_quantity' => -1,
            'max_owned' => -1,
            'is_active' => true,
        ]);

        $admin = $this->admin();

        $this->actingAs($admin)->get(route('admin.rewards.index'))->assertOk();
        $this->actingAs($admin)->get(route('admin.rewards.show', $reward->reward_id))->assertOk();
    }
}
