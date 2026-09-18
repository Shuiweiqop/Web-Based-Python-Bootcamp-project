<?php

namespace Tests\Feature\Forum;

use App\Models\ForumPost;
use App\Models\ForumReply;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * The forum's authorization rules, end to end.
 *
 * These were written against the pre-policy controller to describe what it did,
 * then kept as the regression net once the rules moved into ForumPostPolicy and
 * ForumReplyPolicy. Every assertion here held before and after that move.
 *
 * The asymmetry pinned by test_administrator_cannot_edit_another_users_post is
 * the important one: an administrator may delete, pin and lock any post but may
 * NOT edit one. A blanket admin override in a policy before() hook would grant
 * that silently, so this test exists to stop it.
 */
class ForumAuthorizationCharacterizationTest extends TestCase
{
    use RefreshDatabase;

    // ==================== Post editing ====================

    public function test_author_can_open_the_edit_page_for_their_own_post(): void
    {
        $author = $this->createStudent('author');
        $post = $this->createPost($author);

        $this->actingAs($author)
            ->get("/forum/{$post->post_id}/edit")
            ->assertOk();
    }

    public function test_other_student_cannot_edit_someone_elses_post(): void
    {
        $author = $this->createStudent('author');
        $intruder = $this->createStudent('intruder');
        $post = $this->createPost($author);

        $this->actingAs($intruder)
            ->get("/forum/{$post->post_id}/edit")
            ->assertForbidden();

        $this->actingAs($intruder)
            ->put("/forum/{$post->post_id}", [
                'title' => 'Hijacked title',
                'content' => 'This update must never be applied.',
                'category' => 'general',
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('forum_posts', [
            'post_id' => $post->post_id,
            'title' => 'Hijacked title',
        ]);
    }

    /**
     * Administrators can delete, pin and lock any post — but NOT edit one.
     * A policy before() hook granting admins everything would break this.
     */
    public function test_administrator_cannot_edit_another_users_post(): void
    {
        $author = $this->createStudent('author');
        $admin = $this->createAdmin();
        $post = $this->createPost($author);

        $this->actingAs($admin)
            ->get("/forum/{$post->post_id}/edit")
            ->assertForbidden();

        $this->actingAs($admin)
            ->put("/forum/{$post->post_id}", [
                'title' => 'Admin rewrite',
                'content' => 'An administrator may not edit another users post.',
                'category' => 'general',
            ])
            ->assertForbidden();
    }

    public function test_author_can_update_their_own_post(): void
    {
        $author = $this->createStudent('author');
        $post = $this->createPost($author);

        $this->actingAs($author)
            ->put("/forum/{$post->post_id}", [
                'title' => 'Updated title',
                'content' => 'The author is allowed to change this.',
                'category' => 'help',
            ])
            ->assertRedirect("/forum/{$post->post_id}");

        $this->assertDatabaseHas('forum_posts', [
            'post_id' => $post->post_id,
            'title' => 'Updated title',
            'category' => 'help',
        ]);
    }

    // ==================== Post deletion ====================

    public function test_author_can_delete_their_own_post(): void
    {
        $author = $this->createStudent('author');
        $post = $this->createPost($author);

        $this->actingAs($author)->delete("/forum/{$post->post_id}");

        $this->assertDatabaseMissing('forum_posts', ['post_id' => $post->post_id]);
    }

    public function test_administrator_can_delete_another_users_post(): void
    {
        $author = $this->createStudent('author');
        $admin = $this->createAdmin();
        $post = $this->createPost($author);

        $this->actingAs($admin)->delete("/forum/{$post->post_id}");

        $this->assertDatabaseMissing('forum_posts', ['post_id' => $post->post_id]);
    }

    public function test_other_student_cannot_delete_someone_elses_post(): void
    {
        $author = $this->createStudent('author');
        $intruder = $this->createStudent('intruder');
        $post = $this->createPost($author);

        $this->actingAs($intruder)
            ->delete("/forum/{$post->post_id}")
            ->assertForbidden();

        $this->assertDatabaseHas('forum_posts', ['post_id' => $post->post_id]);
    }

    // ==================== Reply editing and deletion ====================

    public function test_other_student_cannot_edit_someone_elses_reply(): void
    {
        $author = $this->createStudent('author');
        $intruder = $this->createStudent('intruder');
        $post = $this->createPost($author);
        $reply = $this->createReply($post, $author);

        $this->actingAs($intruder)
            ->put("/forum/reply/{$reply->reply_id}", [
                'content' => 'Rewriting someone elses reply.',
            ])
            ->assertForbidden();
    }

    public function test_administrator_can_delete_another_users_reply(): void
    {
        $author = $this->createStudent('author');
        $admin = $this->createAdmin();
        $post = $this->createPost($author);
        $reply = $this->createReply($post, $author);

        $this->actingAs($admin)->delete("/forum/reply/{$reply->reply_id}");

        $this->assertDatabaseMissing('forum_replies', ['reply_id' => $reply->reply_id]);
    }

    public function test_other_student_cannot_delete_someone_elses_reply(): void
    {
        $author = $this->createStudent('author');
        $intruder = $this->createStudent('intruder');
        $post = $this->createPost($author);
        $reply = $this->createReply($post, $author);

        $this->actingAs($intruder)
            ->delete("/forum/reply/{$reply->reply_id}")
            ->assertForbidden();

        $this->assertDatabaseHas('forum_replies', ['reply_id' => $reply->reply_id]);
    }

    /**
     * Was test_known_bug_reply_can_edit_is_type_sensitive. The old
     * ForumReply::canEdit() compared with === and no (int) cast, unlike
     * canDelete() and ForumPost::canEdit(), so a user_id arriving from the
     * driver as a string denied the legitimate author.
     *
     * ForumReplyPolicy casts both sides, so the author is now recognised
     * whatever the id's type. This asserts the fix rather than the bug.
     */
    public function test_reply_authorship_is_not_sensitive_to_the_id_type(): void
    {
        $author = $this->createStudent('author');
        $post = $this->createPost($author);
        $reply = $this->createReply($post, $author);

        $this->assertTrue(
            $author->can('update', $reply),
            'The author may edit their own reply.'
        );

        $reply->forceFill(['user_id' => (string) $author->user_Id]);

        $this->assertTrue(
            $author->can('update', $reply),
            'A string user_id must still identify the author — this was the bug.'
        );
    }

    // ==================== Pin and lock (admin only) ====================

    public function test_student_cannot_pin_or_lock_a_post(): void
    {
        $author = $this->createStudent('author');
        $post = $this->createPost($author);

        $this->actingAs($author)
            ->post("/forum/{$post->post_id}/pin")
            ->assertForbidden();

        $this->actingAs($author)
            ->post("/forum/{$post->post_id}/lock")
            ->assertForbidden();

        $this->assertDatabaseHas('forum_posts', [
            'post_id' => $post->post_id,
            'is_pinned' => false,
            'is_locked' => false,
        ]);
    }

    public function test_administrator_can_pin_and_lock_a_post(): void
    {
        $author = $this->createStudent('author');
        $admin = $this->createAdmin();
        $post = $this->createPost($author);

        $this->actingAs($admin)->post("/forum/{$post->post_id}/pin");
        $this->actingAs($admin)->post("/forum/{$post->post_id}/lock");

        $this->assertDatabaseHas('forum_posts', [
            'post_id' => $post->post_id,
            'is_pinned' => true,
            'is_locked' => true,
        ]);
    }

    // ==================== Locked posts ====================

    public function test_student_cannot_reply_to_a_locked_post(): void
    {
        $author = $this->createStudent('author');
        $responder = $this->createStudent('responder');
        $post = $this->createPost($author);
        $post->forceFill(['is_locked' => true])->save();

        $this->actingAs($responder)
            ->from("/forum/{$post->post_id}")
            ->post("/forum/{$post->post_id}/reply", [
                'content' => 'Trying to reply to a locked post.',
            ])
            ->assertSessionHasErrors('error');

        $this->assertDatabaseMissing('forum_replies', ['post_id' => $post->post_id]);
    }

    public function test_administrator_can_reply_to_a_locked_post(): void
    {
        $author = $this->createStudent('author');
        $admin = $this->createAdmin();
        $post = $this->createPost($author);
        $post->forceFill(['is_locked' => true])->save();

        $this->actingAs($admin)
            ->post("/forum/{$post->post_id}/reply", [
                'content' => 'An administrator may still reply here.',
            ]);

        $this->assertDatabaseHas('forum_replies', [
            'post_id' => $post->post_id,
            'user_id' => $admin->user_Id,
        ]);
    }

    // ==================== Marking a solution ====================

    public function test_only_the_post_author_can_mark_a_solution(): void
    {
        $author = $this->createStudent('author');
        $responder = $this->createStudent('responder');
        $post = $this->createPost($author);
        $reply = $this->createReply($post, $responder);

        $this->actingAs($responder)
            ->post("/forum/reply/{$reply->reply_id}/mark-solution")
            ->assertForbidden();

        $this->actingAs($author)
            ->post("/forum/reply/{$reply->reply_id}/mark-solution");

        $this->assertDatabaseHas('forum_replies', [
            'reply_id' => $reply->reply_id,
            'is_solution' => true,
        ]);
    }

    /**
     * Administrators may delete replies but may NOT mark solutions — that is
     * reserved for the post author. Another asymmetry a before() hook would break.
     */
    public function test_administrator_cannot_mark_a_solution(): void
    {
        $author = $this->createStudent('author');
        $responder = $this->createStudent('responder');
        $admin = $this->createAdmin();
        $post = $this->createPost($author);
        $reply = $this->createReply($post, $responder);

        $this->actingAs($admin)
            ->post("/forum/reply/{$reply->reply_id}/mark-solution")
            ->assertForbidden();
    }

    public function test_marking_a_second_reply_as_solution_clears_the_first(): void
    {
        $author = $this->createStudent('author');
        $responder = $this->createStudent('responder');
        $post = $this->createPost($author);
        $first = $this->createReply($post, $responder);
        $second = $this->createReply($post, $responder);

        $this->actingAs($author)->post("/forum/reply/{$first->reply_id}/mark-solution");
        $this->actingAs($author)->post("/forum/reply/{$second->reply_id}/mark-solution");

        $this->assertDatabaseHas('forum_replies', [
            'reply_id' => $first->reply_id,
            'is_solution' => false,
        ]);
        $this->assertDatabaseHas('forum_replies', [
            'reply_id' => $second->reply_id,
            'is_solution' => true,
        ]);
    }

    // ==================== Inertia prop shape ====================

    public function test_student_show_page_receives_the_full_permission_prop_set(): void
    {
        $author = $this->createStudent('author');
        $post = $this->createPost($author);

        $this->actingAs($author)
            ->get("/forum/{$post->post_id}")
            ->assertInertia(fn (Assert $page) => $page
                ->component('Student/Forum/Show')
                ->has('post')
                ->has('isLiked')
                ->has('isFavorited')
                ->has('hasReported')
                ->where('canEdit', true)
                ->where('canDelete', true)
                ->where('canPin', false)
                ->where('canLock', false)
            );
    }

    public function test_non_author_student_sees_no_edit_or_delete_permission(): void
    {
        $author = $this->createStudent('author');
        $viewer = $this->createStudent('viewer');
        $post = $this->createPost($author);

        $this->actingAs($viewer)
            ->get("/forum/{$post->post_id}")
            ->assertInertia(fn (Assert $page) => $page
                ->component('Student/Forum/Show')
                ->where('canEdit', false)
                ->where('canDelete', false)
                ->where('canPin', false)
                ->where('canLock', false)
            );
    }

    public function test_administrator_show_page_grants_delete_pin_and_lock(): void
    {
        $author = $this->createStudent('author');
        $admin = $this->createAdmin();
        $post = $this->createPost($author);

        $this->actingAs($admin)
            ->get("/forum/{$post->post_id}")
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Forum/Show')
                ->has('hasReported')
                ->where('canEdit', false)
                ->where('canDelete', true)
                ->where('canPin', true)
                ->where('canLock', true)
            );
    }

    // ==================== Helpers ====================

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

    private function createPost(User $author): ForumPost
    {
        return ForumPost::create([
            'user_id' => $author->user_Id,
            'title' => 'A post about loops',
            'content' => 'The original content of the post.',
            'category' => 'general',
        ]);
    }

    private function createReply(ForumPost $post, User $author): ForumReply
    {
        return ForumReply::create([
            'post_id' => $post->post_id,
            'user_id' => $author->user_Id,
            'content' => 'A reply with enough characters.',
        ]);
    }
}
