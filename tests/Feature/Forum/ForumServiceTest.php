<?php

namespace Tests\Feature\Forum;

use App\Models\ForumPost;
use App\Models\ForumReply;
use App\Models\Notification;
use App\Models\User;
use App\Services\ForumService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * ForumService — the writes that used to sit in the controller without a
 * transaction between them.
 */
class ForumServiceTest extends TestCase
{
    use RefreshDatabase;

    private ForumService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ForumService::class);
    }

    public function test_liking_and_unliking_returns_the_counter_to_zero(): void
    {
        $author = $this->createStudent('author');
        $liker = $this->createStudent('liker');
        $post = $this->createPost($author);

        $this->assertTrue($this->service->togglePostLike($post, $liker));
        $this->assertSame(1, $post->fresh()->likes);

        $this->assertFalse($this->service->togglePostLike($post, $liker));
        $this->assertSame(0, $post->fresh()->likes);
    }

    /**
     * The counter is a read-modify-write on the post row. Several likers in
     * sequence must each be counted exactly once — the write now happens with
     * the row locked, so a concurrent like cannot overwrite another's result.
     */
    public function test_each_liker_is_counted_once(): void
    {
        $author = $this->createStudent('author');
        $post = $this->createPost($author);

        foreach (['a', 'b', 'c'] as $name) {
            $this->service->togglePostLike($post, $this->createStudent($name));
        }

        $this->assertSame(3, $post->fresh()->likes);
        $this->assertSame(3, $post->postLikes()->count());
    }

    public function test_liking_your_own_post_does_not_notify_you(): void
    {
        $author = $this->createStudent('author');
        $post = $this->createPost($author);

        $this->service->togglePostLike($post, $author);

        $this->assertSame(
            0,
            Notification::where('user_Id', $author->user_Id)->where('title', '❤️ Post Liked')->count()
        );
    }

    /**
     * A popular post would otherwise send the author one notification per
     * liker, burying everything else in their feed.
     *
     * The coalescing existed but never fired: the lookup cast post_id to a
     * string while the JSON column holds a number, so whereJsonContains never
     * matched an existing notification and every like created a new one.
     */
    public function test_repeat_likes_within_the_window_fold_into_one_notification(): void
    {
        $author = $this->createStudent('author');
        $post = $this->createPost($author);

        foreach (['a', 'b', 'c'] as $name) {
            $this->service->togglePostLike($post, $this->createStudent($name));
        }

        $notifications = Notification::where('user_Id', $author->user_Id)
            ->where('title', '❤️ Post Liked')
            ->get();

        $this->assertCount(1, $notifications, 'Likes in the same window coalesce.');
        $this->assertSame(3, $notifications->first()->data['likers_count']);
        $this->assertStringContainsString('2 others', $notifications->first()->message);
    }

    public function test_marking_a_solution_clears_the_previous_one(): void
    {
        $author = $this->createStudent('author');
        $responder = $this->createStudent('responder');
        $post = $this->createPost($author);
        $first = $this->createReply($post, $responder);
        $second = $this->createReply($post, $responder);

        $this->service->toggleSolution($first, $author);
        $this->service->toggleSolution($second, $author);

        $this->assertFalse($first->fresh()->is_solution);
        $this->assertTrue($second->fresh()->is_solution);
        $this->assertSame(
            1,
            ForumReply::where('post_id', $post->post_id)->where('is_solution', true)->count(),
            'A post has at most one accepted solution.'
        );
    }

    public function test_marking_a_solution_notifies_the_reply_author(): void
    {
        $author = $this->createStudent('author');
        $responder = $this->createStudent('responder');
        $post = $this->createPost($author);
        $reply = $this->createReply($post, $responder);

        $this->service->toggleSolution($reply, $author);

        $this->assertSame(
            1,
            Notification::where('user_Id', $responder->user_Id)->where('title', '⭐ Best Answer')->count()
        );
    }

    public function test_accepting_your_own_reply_does_not_notify_you(): void
    {
        $author = $this->createStudent('author');
        $post = $this->createPost($author);
        $reply = $this->createReply($post, $author);

        $this->service->toggleSolution($reply, $author);

        $this->assertSame(
            0,
            Notification::where('user_Id', $author->user_Id)->where('title', '⭐ Best Answer')->count()
        );
    }

    /**
     * Validation proves the parent id exists somewhere, not that it belongs to
     * this thread. Nesting under a reply from another post would corrupt the
     * tree, so the service refuses it.
     */
    public function test_a_parent_reply_from_another_post_is_rejected(): void
    {
        $author = $this->createStudent('author');
        $first = $this->createPost($author);
        $second = $this->createPost($author);
        $foreign = $this->createReply($second, $author);

        $this->expectException(\RuntimeException::class);

        $this->service->resolveParentReply($first, $foreign->reply_id);
    }

    public function test_a_parent_reply_from_the_same_post_is_accepted(): void
    {
        $author = $this->createStudent('author');
        $post = $this->createPost($author);
        $parent = $this->createReply($post, $author);

        $this->assertSame(
            $parent->reply_id,
            $this->service->resolveParentReply($post, $parent->reply_id)?->reply_id
        );

        $this->assertNull(
            $this->service->resolveParentReply($post, null),
            'A top-level reply has no parent.'
        );
    }

    public function test_reply_content_is_sanitised_on_create_and_update(): void
    {
        $author = $this->createStudent('author');
        $post = $this->createPost($author);

        $result = $this->service->createReply($post, $author, [
            'content' => '<p>Safe</p><script>alert(1)</script>',
            'parent_reply_id' => null,
        ]);

        $this->assertStringNotContainsString('<script>', $result['reply']->content);
        $this->assertStringContainsString('<p>Safe</p>', $result['reply']->content);

        $updated = $this->service->updateReply($result['reply'], '<b>Bold</b><script>alert(2)</script>');

        $this->assertStringNotContainsString('<script>', $updated->content);
    }

    private function createStudent(string $name): User
    {
        $user = User::create([
            'name' => ucfirst($name),
            'email' => $name.'-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
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
