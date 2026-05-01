<?php

namespace Tests\Feature;

use App\Models\DailyChallengeDefinition;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDailyChallengeControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_daily_challenge_configuration_index(): void
    {
        $admin = $this->createUser('administrator');

        $response = $this->actingAs($admin)->get(route('admin.daily-challenges.index'));

        $response->assertOk();
        $response->assertSee('daily_focus_sprint');
    }

    public function test_admin_can_update_daily_challenge_definition(): void
    {
        $admin = $this->createUser('administrator');
        $definition = DailyChallengeDefinition::where('code', 'daily_focus_sprint')->firstOrFail();

        $response = $this->actingAs($admin)->put(route('admin.daily-challenges.update', $definition), [
            'title' => 'Focus Sprint Reloaded',
            'description' => 'Complete 2 exercises today with the updated mission settings.',
            'period_type' => 'daily',
            'action_type' => 'exercise_completed',
            'target_count' => 2,
            'reward_points' => 55,
            'is_active' => false,
            'display_order' => 15,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('daily_challenge_definitions', [
            'challenge_definition_id' => $definition->challenge_definition_id,
            'title' => 'Focus Sprint Reloaded',
            'target_count' => 2,
            'reward_points' => 55,
            'is_active' => 0,
            'display_order' => 15,
        ]);
    }

    public function test_student_cannot_access_admin_daily_challenge_configuration(): void
    {
        $student = $this->createUser('student');

        $response = $this->actingAs($student)
            ->withHeader('X-Inertia', 'true')
            ->get(route('admin.daily-challenges.index'));

        $response->assertForbidden();
    }

    private function createUser(string $role): User
    {
        $user = User::create([
            'name' => ucfirst($role) . ' User',
            'email' => $role . uniqid() . '@example.com',
            'password' => 'password',
            'role' => $role,
        ]);

        $user->forceFill(['email_verified_at' => now()])->save();

        return $user->fresh();
    }
}
