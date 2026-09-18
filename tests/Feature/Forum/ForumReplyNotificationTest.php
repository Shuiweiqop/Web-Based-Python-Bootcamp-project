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
 * Pins the CURRENT notification behaviour for forum replies, which is wrong:
 * every reply produces TWO notifications for the same recipient.
 *
 * ForumReplyObserver::created() sends one (type 'social') and
 * ForumController::reply() sends another inline (type 'community') for the same
 * event. Neither knows about the other.
 *
 * These requests all send parent_reply_id explicitly, because that is what the
 * real client does: ReplyForm.jsx builds its useForm state with
 * `parent_reply_id: parentReplyId` (defaulting to null), so the key is always
 * present in the payload. It matters — ForumController::reply() branches on
 * `$validated['parent_reply_id']`, and Laravel drops a nullable key from the
 * validated array when it is absent, which would raise an undefined-key warning
 * and skip the inline block entirely. Omitting the key here would hide the bug.
 *
 * The test_known_bug_* methods assert the duplicate, so fixing it turns them
 * red and the fix has to be deliberate. When the inline block is removed, the
 * expected counts drop from 2 to 1 and the 'community' assertions go away.
 */
class ForumReplyNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_known_bug_a_reply_notifies_the_post_author_twice(): void
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
            2,
            $notifications,
            'KNOWN BUG: the observer and the controller each send one notification.'
        );

        $this->assertEqualsCanonicalizing(
            ['community', 'social'],
            $notifications->pluck('type')->all(),
            'KNOWN BUG: one duplicate comes from the controller, one from the observer.'
        );
    }

    public function test_known_bug_a_nested_reply_notifies_the_parent_author_twice(): void
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
            2,
            $this->replyNotificationsFor($firstResponder),
            'KNOWN BUG: the parent reply author is notified twice.'
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
     * The notification carries a deep link to the reply. The controller's copy
     * includes the #reply-{id} anchor; the observer's does not. Whichever
     * survives must keep the anchor, so pin that at least one has it today.
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
     * ForumController::reply() reads $validated['parent_reply_id'] directly.
     * Laravel omits a nullable key from the validated array when the request
     * did not send it, so a client that leaves the field out silently skips the
     * inline notification block instead of treating it as a top-level reply.
     *
     * The current UI always sends the key, so this is latent rather than
     * broken. It is pinned because the extraction must not depend on the key's
     * presence — the fix is to read it with ?? null.
     */
    public function test_known_bug_omitting_parent_reply_id_skips_the_inline_notification(): void
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
            'KNOWN BUG: with the key omitted only the observer notifies, so the count drops to 1.'
        );
    }

    /**
     * Reply notifications only. Posting a reply also awards points, which sends
     * its own unrelated notification, so counting every row would conflate the
     * two. 'community' is the controller's inline copy, 'social' the observer's.
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
