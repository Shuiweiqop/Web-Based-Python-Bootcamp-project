<?php

namespace Tests\Feature\Forum;

use App\Models\ForumPost;
use App\Models\ForumReply;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Forum reply notifications.
 *
 * A reply used to notify its recipient twice: ForumReplyObserver::created()
 * sent one and ForumController::reply() sent another inline for the same event,
 * with a different type and title. The inline block is gone and the observer
 * owns this now — it fires on the model event, so a reply created anywhere
 * still notifies, which is why it was the copy worth keeping.
 *
 * The requests still send parent_reply_id explicitly, matching ReplyForm.jsx,
 * which always includes the key.
 */
class ForumReplyNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_reply_notifies_the_post_author_once(): void
    {
        $author = $this->createStudent('author');
        $responder = $this->createStudent('responder');
        $post = $this->createPost($author);

        $this->actingAs($responder)
            ->post("/forum/{$post->post_id}/reply", [
                'content' => 'Here is an answer to your question.',
                'parent_reply_id' => null,
            ]);

        $notifications = $this->replyNotificationsFor($author);

        $this->assertCount(
            1,
            $notifications,
            'The observer is the only sender; the controller no longer duplicates it.'
        );

        $this->assertSame(
            'social',
            $notifications->first()->type,
            'The surviving notification is the one sent by the observer.'
        );
    }

    public function test_a_nested_reply_notifies_the_parent_author_once(): void
    {
        $author = $this->createStudent('author');
        $firstResponder = $this->createStudent('first');
        $secondResponder = $this->createStudent('second');

        $post = $this->createPost($author);
        $parentReply = ForumReply::create([
            'post_id' => $post->post_id,
            'user_id' => $firstResponder->user_Id,
            'content' => 'An initial reply to the post.',
        ]);

        Notification::query()->delete();

        $this->actingAs($secondResponder)
            ->post("/forum/{$post->post_id}/reply", [
                'content' => 'Replying to your comment specifically.',
                'parent_reply_id' => $parentReply->reply_id,
            ]);

        $this->assertCount(
            1,
            $this->replyNotificationsFor($firstResponder),
            'The parent reply author is notified exactly once.'
        );
    }

    public function test_replying_to_your_own_post_notifies_nobody(): void
    {
        $author = $this->createStudent('author');
        $post = $this->createPost($author);

        $this->actingAs($author)
            ->post("/forum/{$post->post_id}/reply", [
                'content' => 'Adding some more context to my own post.',
                'parent_reply_id' => null,
            ]);

        $this->assertSame(
            0,
            $this->replyNotificationsFor($author)->count(),
            'Self-replies must not notify the author, before or after the fix.'
        );
    }

    /**
     * The anchor came from the controller's copy, which is gone, so it was
     * ported onto the observer's. Without it the notification lands at the top
     * of a long thread instead of at the reply.
     */
    public function test_at_least_one_notification_deep_links_to_the_reply_anchor(): void
    {
        $author = $this->createStudent('author');
        $responder = $this->createStudent('responder');
        $post = $this->createPost($author);

        $this->actingAs($responder)
            ->post("/forum/{$post->post_id}/reply", [
                'content' => 'An answer that should be linkable.',
                'parent_reply_id' => null,
            ]);

        $reply = ForumReply::where('post_id', $post->post_id)->firstOrFail();
        $urls = $this->replyNotificationsFor($author)->pluck('action_url');

        $this->assertTrue(
            $urls->contains(fn ($url) => str_ends_with((string) $url, "#reply-{$reply->reply_id}")),
            'A reply notification must deep link to the reply itself.'
        );
    }

    /**
     * reply() used to branch on $validated['parent_reply_id'], which Laravel
     * omits entirely when the request did not send it — so a client leaving the
     * field out skipped notifications instead of being treated as a top-level
     * reply. Notifications now come from the observer, which reads the model
     * rather than the request, so the payload shape no longer decides.
     */
    public function test_omitting_parent_reply_id_still_notifies_the_post_author(): void
    {
        $author = $this->createStudent('author');
        $responder = $this->createStudent('responder');
        $post = $this->createPost($author);

        $this->actingAs($responder)
            ->post("/forum/{$post->post_id}/reply", [
                'content' => 'A reply sent without the parent key at all.',
            ]);

        $this->assertDatabaseHas('forum_replies', [
            'post_id' => $post->post_id,
            'user_id' => $responder->user_Id,
        ]);

        $this->assertSame(
            1,
            $this->replyNotificationsFor($author)->count(),
            'A reply notifies once whether or not the client sent parent_reply_id.'
        );
    }

    /**
     * Reply notifications only. Posting a reply also awards points, which sends
     * its own unrelated notification, so counting every row would conflate the
     * two. 'social' is the observer's; 'community' was the removed inline copy
     * and is still matched so a regression that resurrects it would be caught.
     */
    private function replyNotificationsFor(User $user): Collection
    {
        return Notification::where('user_Id', $user->user_Id)
            ->whereIn('type', ['social', 'community'])
            ->get();
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
            'title' => 'How do I use a for loop?',
            'content' => 'I am stuck on iterating over a list.',
            'category' => 'help',
        ]);
    }
}
