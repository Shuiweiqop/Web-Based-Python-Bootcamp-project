<?php

namespace Tests\Feature\Forum;

use App\Models\ForumPost;
use App\Models\ForumReply;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * The can_edit / can_delete / can_mark_solution flags each reply serialises.
 *
 * ReplyCard used to work these out in JavaScript by comparing raw ids, which
 * duplicated ForumReplyPolicy and disagreed with it. The flags exist so the
 * buttons the client renders and the rules the server enforces come from one
 * place.
 */
class ForumReplyPermissionPropsTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_reply_author_may_edit_and_delete_their_own_reply(): void
    {
        $author = $this->createStudent('author');
        $responder = $this->createStudent('responder');
        $post = $this->createPost($author);
        $reply = $this->createReply($post, $responder);

        $this->actingAs($responder);
        $reply = $reply->fresh();

        $this->assertTrue($reply->can_edit);
        $this->assertTrue($reply->can_delete);
        $this->assertFalse($reply->can_mark_solution, 'Accepting an answer is the post author\'s call.');
    }

    public function test_the_post_author_may_accept_an_answer_but_not_edit_it(): void
    {
        $author = $this->createStudent('author');
        $responder = $this->createStudent('responder');
        $post = $this->createPost($author);
        $reply = $this->createReply($post, $responder);

        $this->actingAs($author);
        $reply = $reply->fresh();

        $this->assertTrue($reply->can_mark_solution);
        $this->assertFalse($reply->can_edit);
        $this->assertFalse($reply->can_delete);
    }

    /**
     * The old client derived delete from authorship alone, so an administrator
     * never saw the button for a reply they are allowed to remove.
     */
    public function test_an_administrator_may_delete_any_reply_but_not_edit_it(): void
    {
        $author = $this->createStudent('author');
        $responder = $this->createStudent('responder');
        $admin = $this->createAdmin();
        $post = $this->createPost($author);
        $reply = $this->createReply($post, $responder);

        $this->actingAs($admin);
        $reply = $reply->fresh();

        $this->assertTrue($reply->can_delete, 'Moderation is why the flag is not just authorship.');
        $this->assertFalse($reply->can_edit);
        $this->assertFalse($reply->can_mark_solution);
    }

    public function test_an_unrelated_student_gets_no_permissions(): void
    {
        $author = $this->createStudent('author');
        $responder = $this->createStudent('responder');
        $bystander = $this->createStudent('bystander');
        $post = $this->createPost($author);
        $reply = $this->createReply($post, $responder);

        $this->actingAs($bystander);
        $reply = $reply->fresh();

        $this->assertFalse($reply->can_edit);
        $this->assertFalse($reply->can_delete);
        $this->assertFalse($reply->can_mark_solution);
    }

    /**
     * user_id has no cast on the table, and MySQL can return an integer column
     * as a string where sqlite returns an int. The old client compared with ===
     * and would have denied the real author in production while working in
     * development. The cast on the model is what closes that gap.
     */
    public function test_authorship_survives_an_id_that_arrives_as_a_string(): void
    {
        $author = $this->createStudent('author');
        $responder = $this->createStudent('responder');
        $post = $this->createPost($author);
        $reply = $this->createReply($post, $responder);

        $this->actingAs($responder);

        $reply = $reply->fresh();
        $reply->setRawAttributes(array_merge($reply->getAttributes(), [
            'user_id' => (string) $responder->user_Id,
        ]), true);

        $this->assertSame($responder->user_Id, $reply->user_id, 'The cast normalises it back to an int.');
        $this->assertTrue($reply->can_delete, 'A string id must still identify the author.');
    }

    public function test_the_flags_are_present_in_the_serialised_reply(): void
    {
        $author = $this->createStudent('author');
        $post = $this->createPost($author);
        $reply = $this->createReply($post, $author);

        $this->actingAs($author);

        $this->assertArrayHasKey('can_edit', $reply->fresh()->toArray());
        $this->assertArrayHasKey('can_delete', $reply->fresh()->toArray());
        $this->assertArrayHasKey('can_mark_solution', $reply->fresh()->toArray());
    }

    /**
     * can_mark_solution asks who wrote the post. Evaluated once per reply while
     * serialising a thread, that is a query each unless the post is already
     * loaded — so withForumDetail() eager-loads it.
     */
    public function test_serialising_a_thread_costs_no_extra_queries(): void
    {
        $author = $this->createStudent('author');
        $responder = $this->createStudent('responder');
        $post = $this->createPost($author);

        foreach (range(1, 5) as $i) {
            $this->createReply($post, $responder);
        }

        $this->actingAs($author);

        $loaded = ForumPost::withForumDetail()->findOrFail($post->post_id);

        DB::enableQueryLog();
        $loaded->replies->toArray();
        $queries = count(DB::getQueryLog());
        DB::disableQueryLog();

        $this->assertSame(
            0,
            $queries,
            'Serialising the permission flags must not query once per reply.'
        );
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
