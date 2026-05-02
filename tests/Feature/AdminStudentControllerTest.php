<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminStudentControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_filter_student_management_to_locked_accounts(): void
    {
        $admin = $this->createVerifiedUser('administrator', 'Admin Dashboard User');
        $lockedStudent = $this->createVerifiedUser('student', 'Locked Student');
        $activeStudent = $this->createVerifiedUser('student', 'Active Student');

        $lockedStudent->forceFill(['locked_until' => now()->addHour()])->save();

        $response = $this->actingAs($admin)->get(route('admin.students.index', ['status' => 'locked']));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/StudentManagement/Index')
            ->where('filters.status', 'locked')
            ->where('students.data', fn ($students) => count($students) === 1
                && $students[0]['user_Id'] === $lockedStudent->user_Id)
        );
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
