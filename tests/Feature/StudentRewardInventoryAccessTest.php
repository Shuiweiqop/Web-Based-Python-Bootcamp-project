<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentRewardInventoryAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_cannot_access_student_rewards_or_inventory(): void
    {
        $admin = $this->createVerifiedUser('administrator');

        $this->actingAs($admin)
            ->withHeader('X-Inertia', 'true')
            ->get('/student/rewards')
            ->assertForbidden();

        $this->actingAs($admin)
            ->withHeader('X-Inertia', 'true')
            ->get('/student/inventory')
            ->assertForbidden();
    }

    public function test_student_can_access_rewards_and_inventory(): void
    {
        $student = $this->createVerifiedUser('student');

        $this->actingAs($student)
            ->get('/student/rewards')
            ->assertOk();

        $this->actingAs($student)
            ->get('/student/inventory')
            ->assertOk();
    }

    private function createVerifiedUser(string $role): User
    {
        $user = User::create([
            'name' => ucfirst($role).' Access Tester',
            'email' => $role.'-access-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => $role,
        ]);

        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();

        return $user->fresh();
    }
}
