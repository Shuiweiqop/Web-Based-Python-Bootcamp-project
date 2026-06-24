<?php

namespace Tests\Feature;

use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LeaderboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_leaderboard_orders_students_by_points_descending(): void
    {
        $this->makeStudent('Low', 100);
        $top = $this->makeStudent('High', 900);
        $this->makeStudent('Mid', 500);

        $response = $this->actingAs($top->user)->get(route('student.leaderboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Student/Leaderboard/Index')
            ->where('leaderboard.0.name', 'High')
            ->where('leaderboard.0.rank', 1)
            ->where('leaderboard.0.is_me', true)
            ->where('leaderboard.1.name', 'Mid')
            ->where('leaderboard.2.name', 'Low')
            ->where('me.rank', 1)
            ->where('me.total_players', 3)
        );
    }

    public function test_current_student_rank_is_reported_when_outside_visible_order(): void
    {
        $me = $this->makeStudent('Me', 10);
        $this->makeStudent('A', 100);
        $this->makeStudent('B', 200);

        $response = $this->actingAs($me->user)->get(route('student.leaderboard'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('me.rank', 3)
            ->where('me.points', 10)
        );
    }

    public function test_non_students_cannot_access_the_leaderboard(): void
    {
        $admin = $this->makeUser('administrator');

        $this->actingAs($admin)
            ->get(route('student.leaderboard'))
            ->assertRedirect(route('login'));
    }

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('student.leaderboard'))->assertRedirect(route('login'));
    }

    private function makeStudent(string $name, int $points): StudentProfile
    {
        $user = $this->makeUser('student', $name);

        // User::created auto-provisions a StudentProfile for students.
        $profile = $user->studentProfile;
        $profile->update(['current_points' => $points]);

        return $profile->fresh('user');
    }

    private function makeUser(string $role, ?string $name = null): User
    {
        $user = User::create([
            'name' => $name ?? ucfirst($role) . ' User',
            'email' => $role . uniqid() . '@example.com',
            'password' => 'password',
            'role' => $role,
        ]);

        $user->forceFill(['email_verified_at' => now()])->save();

        return $user->fresh();
    }
}
