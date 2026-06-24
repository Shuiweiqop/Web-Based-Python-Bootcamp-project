<?php

namespace Tests\Feature;

use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentProfilePointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_add_points_raises_both_balance_and_lifetime_xp(): void
    {
        $profile = $this->student();

        $profile->addPoints(300);

        $profile->refresh();
        $this->assertSame(300, $profile->current_points);
        $this->assertSame(300, $profile->lifetime_points);
    }

    public function test_spending_lowers_balance_but_not_lifetime_xp(): void
    {
        $profile = $this->student();
        $profile->addPoints(300);

        $profile->deductPoints(200);

        $profile->refresh();
        $this->assertSame(100, $profile->current_points, 'balance drops when spending');
        $this->assertSame(300, $profile->lifetime_points, 'lifetime XP is preserved');
    }

    public function test_level_is_derived_from_lifetime_xp(): void
    {
        $profile = $this->student();

        $profile->addPoints(2000);   // -> Intermediate (>= 2000)
        $profile->deductPoints(2000); // balance back to 0, level must hold

        $profile->refresh();
        $info = $profile->levelInfo();

        $this->assertSame(0, $profile->current_points);
        $this->assertSame('Intermediate', $profile->points_level);
        $this->assertSame(3, $info['level']);
        $this->assertSame('Advanced', $info['next_label']);
        $this->assertSame(3000, $info['xp_needed']); // 5000 - 2000
    }

    private function student(): StudentProfile
    {
        $user = User::create([
            'name' => 'Student ' . uniqid(),
            'email' => 'student' . uniqid() . '@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);
        $user->forceFill(['email_verified_at' => now()])->save();

        return $user->fresh()->studentProfile;
    }
}
