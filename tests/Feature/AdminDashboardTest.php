<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_shows_real_recent_activity_and_performance_sections(): void
    {
        $admin = $this->createVerifiedUser('administrator', 'Admin Dashboard User');
        $student = $this->createVerifiedUser('student', 'Recent Student');

        $response = $this->actingAs($admin)->get(route('dashboard'));

        $response->assertOk();
        $response->assertSee('Recent Student joined the platform');
        $response->assertSee('Course Completion Rate');
        $response->assertSee('active students in the last 7 days', false);
    }

    private function createVerifiedUser(string $role, string $name): User
    {
        $user = User::create([
            'name' => $name,
            'email' => strtolower(str_replace(' ', '-', $name)) . '-' . uniqid() . '@example.com',
            'password' => 'password',
            'role' => $role,
        ]);

        $user->forceFill(['email_verified_at' => now()])->save();

        return $user->fresh();
    }
}
