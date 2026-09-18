<?php

namespace Tests\Feature\Forum;

use App\Models\ForumPost;
use App\Models\ForumReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Forum report moderation.
 *
 * Every method in ForumReportController used to repeat
 * `if (! ForumHelper::isAdmin()) abort(403)`, although the whole route group
 * already sits inside `role:administrator` (routes/web.php). Those six checks
 * are gone; these tests prove the route group alone still keeps students out.
 */
class ForumReportAccessTest extends TestCase
{
    use RefreshDatabase;

    /**
     * CheckRole answers a denied Inertia or JSON request with 403, but sends a
     * plain browser request to the login page instead. Real traffic from the
     * React app always carries X-Inertia, so 403 is the path that matters —
     * both are pinned so the redirect branch cannot be dropped by accident.
     */
    public function test_student_cannot_reach_the_report_queue(): void
    {
        $student = $this->createStudent('student');

        $this->actingAs($student)
            ->withHeader('X-Inertia', 'true')
            ->get('/admin/forum/reports')
            ->assertForbidden();
    }

    public function test_student_hitting_the_report_queue_without_inertia_is_redirected(): void
    {
        $student = $this->createStudent('student');

        $this->actingAs($student)
            ->get('/admin/forum/reports')
            ->assertRedirect(route('login'));
    }

    public function test_administrator_can_open_the_report_queue(): void
    {
        $admin = $this->createAdmin();

        $this->actingAs($admin)
            ->get('/admin/forum/reports')
            ->assertOk();
    }

    public function test_student_cannot_change_a_report_status(): void
    {
        $student = $this->createStudent('student');
        $report = $this->createReport();

        $this->actingAs($student)
            ->withHeader('X-Inertia', 'true')
            ->post("/admin/forum/reports/{$report->report_id}/status", [
                'status' => 'dismissed',
            ])
            ->assertForbidden();

        $this->assertDatabaseHas('forum_reports', [
            'report_id' => $report->report_id,
            'status' => 'pending',
        ]);
    }

    public function test_administrator_can_change_a_report_status(): void
    {
        $admin = $this->createAdmin();
        $report = $this->createReport();

        $this->actingAs($admin)
            ->post("/admin/forum/reports/{$report->report_id}/status", [
                'status' => 'resolved',
                'admin_notes' => 'Handled by a moderator.',
            ]);

        $this->assertDatabaseHas('forum_reports', [
            'report_id' => $report->report_id,
            'status' => 'resolved',
            'admin_notes' => 'Handled by a moderator.',
        ]);
    }

    /**
     * Was test_known_bug_resolving_a_report_does_not_record_the_admin. The
     * controller used to write 'reviewed_by', which is not in the model's
     * fillable list, so mass assignment discarded it and the reviewer column
     * stayed null however many times a report was actioned.
     */
    public function test_resolving_a_report_records_which_admin_did_it(): void
    {
        $admin = $this->createAdmin();
        $report = $this->createReport();

        $this->actingAs($admin)
            ->post("/admin/forum/reports/{$report->report_id}/status", [
                'status' => 'resolved',
            ]);

        $this->assertSame(
            (int) $admin->user_Id,
            (int) $report->fresh()->reviewed_by_admin_id,
            'The moderator who resolved the report must be recorded.'
        );
    }

    public function test_administrator_can_delete_reported_content(): void
    {
        $admin = $this->createAdmin();
        $author = $this->createStudent('author');
        $post = ForumPost::create([
            'user_id' => $author->user_Id,
            'title' => 'A post that breaks the rules',
            'content' => 'Reported content awaiting moderation.',
            'category' => 'general',
        ]);
        $report = $this->createReport($post);

        $this->actingAs($admin)
            ->post("/admin/forum/reports/{$report->report_id}/delete-content");

        $this->assertDatabaseMissing('forum_posts', ['post_id' => $post->post_id]);
        $this->assertDatabaseHas('forum_reports', [
            'report_id' => $report->report_id,
            'status' => 'resolved',
        ]);
    }

    private function createReport(?ForumPost $post = null): ForumReport
    {
        $reporter = $this->createStudent('reporter');

        if (! $post) {
            $author = $this->createStudent('author');
            $post = ForumPost::create([
                'user_id' => $author->user_Id,
                'title' => 'A reported post',
                'content' => 'Content that someone flagged.',
                'category' => 'general',
            ]);
        }

        return ForumReport::create([
            'reporter_user_id' => $reporter->user_Id,
            'reportable_type' => 'post',
            'reportable_id' => $post->post_id,
            'reason' => 'spam',
            'description' => 'This looks like spam to me.',
            'status' => 'pending',
        ]);
    }

    private function createStudent(string $name): User
    {
        return $this->createUser($name, 'student');
    }

    private function createAdmin(): User
    {
        return $this->createUser('admin', 'administrator');
    }

    private function createUser(string $name, string $role): User
    {
        $user = User::create([
            'name' => ucfirst($name),
            'email' => $name.'-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => $role,
        ]);

        $user->forceFill(['email_verified_at' => now()])->save();

        return $user->fresh();
    }
}
