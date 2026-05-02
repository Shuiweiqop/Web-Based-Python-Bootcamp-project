<?php

namespace Tests\Feature;

use App\Models\ForumPost;
use App\Models\ForumReply;
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
            ->where('performance.2.value', 100)
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
