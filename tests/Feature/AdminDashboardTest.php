<?php

namespace Tests\Feature;

use App\Models\ForumPost;
use App\Models\ForumReply;
use App\Models\ForumReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_uses_a_true_global_activity_timeline(): void
    {
        $admin = $this->createVerifiedUser('administrator', 'Admin Dashboard User');
        $studentA = $this->createVerifiedUser('student', 'Alpha Student');
        $studentB = $this->createVerifiedUser('student', 'Beta Student');

        $studentA->forceFill(['created_at' => now()->subHour(), 'updated_at' => now()->subHour()])->save();
        $studentB->forceFill(['created_at' => now()->subMinutes(50), 'updated_at' => now()->subMinutes(50)])->save();

        $anchorPost = ForumPost::create([
            'user_id' => $studentA->user_Id,
            'title' => 'Anchor post',
            'content' => 'Starting the thread.',
            'category' => 'general',
        ]);

        $anchorPost->forceFill(['created_at' => now()->subMinutes(10), 'updated_at' => now()->subMinutes(10)])->save();

        $olderPost = ForumPost::create([
            'user_id' => $studentB->user_Id,
            'title' => 'Older forum post',
            'content' => 'This should fall out of the top timeline.',
            'category' => 'general',
        ]);

        $olderPost->forceFill(['created_at' => now()->subMinutes(20), 'updated_at' => now()->subMinutes(20)])->save();

        $timestamps = [
            now()->subMinute(),
            now()->subMinutes(2),
            now()->subMinutes(3),
            now()->subMinutes(4),
            now()->subMinutes(5),
            now()->subMinutes(6),
        ];

        foreach ($timestamps as $index => $timestamp) {
            $reply = ForumReply::create([
                'post_id' => $anchorPost->post_id,
                'user_id' => $index % 2 === 0 ? $studentA->user_Id : $studentB->user_Id,
                'content' => 'Reply #' . ($index + 1),
            ]);

            $reply->forceFill(['created_at' => $timestamp, 'updated_at' => $timestamp])->save();
        }

        $response = $this->actingAs($admin)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->where('recentActivity.0.type', 'forum_reply')
            ->where('recentActivity.5.type', 'forum_reply')
            ->missing('recentActivity.6')
            ->where('recentActivity', fn ($items) => collect($items)->every(
                fn (array $item) => $item['type'] === 'forum_reply'
            ))
        );
    }

    public function test_admin_dashboard_counts_active_students_once_across_multiple_activity_sources(): void
    {
        $admin = $this->createVerifiedUser('administrator', 'Admin Dashboard User');
        $studentA = $this->createVerifiedUser('student', 'Active Student A');
        $studentB = $this->createVerifiedUser('student', 'Active Student B');

        $studentA->forceFill(['created_at' => now()->subHour(), 'updated_at' => now()->subHour()])->save();
        $studentB->forceFill(['created_at' => now()->subMinutes(50), 'updated_at' => now()->subMinutes(50)])->save();

        $post = ForumPost::create([
            'user_id' => $studentA->user_Id,
            'title' => 'Student A post',
            'content' => 'Counting as activity source one.',
            'category' => 'general',
        ]);

        ForumReply::create([
            'post_id' => $post->post_id,
            'user_id' => $studentA->user_Id,
            'content' => 'Student A also replied.',
        ]);

        ForumReply::create([
            'post_id' => $post->post_id,
            'user_id' => $studentB->user_Id,
            'content' => 'Student B replied once.',
        ]);

        $response = $this->actingAs($admin)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->where('stats.active_students', 2)
            ->where('summaryCards.active_students.value', 2)
            ->where('performance.2.value', 100)
        );
    }

    public function test_admin_dashboard_summary_cards_use_real_growth_data(): void
    {
        $admin = $this->createVerifiedUser('administrator', 'Admin Dashboard User');

        $previousMonthStudent = $this->createVerifiedUser('student', 'Previous Month Student');
        $currentMonthStudentA = $this->createVerifiedUser('student', 'Current Month Student A');
        $currentMonthStudentB = $this->createVerifiedUser('student', 'Current Month Student B');

        $previousMonthStudent->forceFill([
            'created_at' => now()->subMonthNoOverflow()->startOfMonth()->addDays(2),
            'updated_at' => now()->subMonthNoOverflow()->startOfMonth()->addDays(2),
        ])->save();
        $currentMonthStudentA->forceFill([
            'created_at' => now()->startOfMonth()->addDay(),
            'updated_at' => now()->startOfMonth()->addDay(),
        ])->save();
        $currentMonthStudentB->forceFill([
            'created_at' => now()->startOfMonth()->addDays(2),
            'updated_at' => now()->startOfMonth()->addDays(2),
        ])->save();

        $response = $this->actingAs($admin)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->where('summaryCards.total_students.value', 3)
            ->where('summaryCards.total_students.trend.label', '+100%')
            ->where('summaryCards.total_students.caption', '+1 new students vs last month')
        );
    }

    public function test_admin_dashboard_health_status_uses_real_moderation_and_security_signals(): void
    {
        $admin = $this->createVerifiedUser('administrator', 'Admin Dashboard User');
        $reporter = $this->createVerifiedUser('student', 'Report Student');
        $offender = $this->createVerifiedUser('student', 'Locked Student');

        ForumReport::create([
            'reporter_user_id' => $reporter->user_Id,
            'reportable_type' => 'post',
            'reportable_id' => 999,
            'reason' => 'spam',
            'description' => 'Needs review',
            'status' => 'pending',
        ]);

        $offender->forceFill(['locked_until' => now()->addHour()])->save();

        $response = $this->actingAs($admin)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->where('healthStatus.state', 'attention')
            ->where('healthStatus.label', 'Needs Attention')
            ->where('healthStatus.summary', '1 pending reports, 1 locked accounts')
        );
    }

    public function test_admin_dashboard_performance_labels_match_metric_scope(): void
    {
        $admin = $this->createVerifiedUser('administrator', 'Admin Dashboard User');

        $response = $this->actingAs($admin)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->where('performance.0.label', 'Tracked Lesson Completion Rate')
            ->where('performance.1.label', 'Attempt Pass Rate')
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
