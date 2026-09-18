<?php

namespace App\Services;

use App\Helpers\ForumHelper;
use App\Models\ForumFavorite;
use App\Models\ForumPost;
use App\Models\ForumPostLike;
use App\Models\ForumReply;
use App\Models\ForumReplyLike;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Writes for the forum: replies, solutions, likes and favourites.
 *
 * The controller keeps authorization, validation and the Inertia response. What
 * lives here is everything that touches more than one row, because none of it
 * used to be atomic. A reply wrote the reply, the student's streak and the
 * daily-challenge progress as three unrelated statements; marking a solution
 * cleared the previous one and set the new one in two; and both like toggles
 * wrote a row and then adjusted a counter on the parent, which is a
 * read-modify-write that loses likes under concurrency. Each of those is now a
 * transaction, and the counter rows are locked.
 *
 * Failures throw RuntimeException with a message meant for the user; the
 * controller catches and turns it into a redirect. This follows
 * RewardPurchaseService and ConceptMasteryService.
 */
class ForumService
{
    /**
     * Retries for a transaction that hits a deadlock or serialization conflict.
     */
    private const TRANSACTION_ATTEMPTS = 3;

    /**
     * Likes on the same post within this window fold into one notification
     * rather than sending a fresh one per liker.
     */
    private const LIKE_NOTIFICATION_WINDOW_MINUTES = 5;

    public function __construct(
        private readonly DailyChallengeService $dailyChallenges,
    ) {}

    /**
     * Create a reply, bump the author's streak and record challenge progress.
     *
     * @return array{reply: ForumReply, missionProgress: mixed}
     */
    public function createReply(ForumPost $post, User $author, array $input): array
    {
        $parentReplyId = $input['parent_reply_id'] ?? null;

        return DB::transaction(function () use ($post, $author, $input, $parentReplyId) {
            $reply = ForumReply::create([
                'post_id' => $post->post_id,
                'user_id' => $author->user_Id,
                'parent_reply_id' => $parentReplyId,
                'content' => ForumHelper::sanitizeContent($input['content']),
            ]);

            // Notifications are not sent here: ForumReplyObserver fires on the
            // create above and owns them, so a reply made anywhere notifies.

            $missionProgress = $this->recordReplyForStudent($reply);

            Log::info('Forum reply created', [
                'reply_id' => $reply->reply_id,
                'post_id' => $post->post_id,
                'user_id' => $author->user_Id,
                'parent_reply_id' => $parentReplyId,
            ]);

            return ['reply' => $reply, 'missionProgress' => $missionProgress];
        }, self::TRANSACTION_ATTEMPTS);
    }

    /**
     * Resolve the parent of a nested reply, rejecting one from another post.
     *
     * Validation only proves the id exists somewhere; it says nothing about
     * which thread it belongs to, and nesting under a foreign reply would
     * corrupt the tree.
     */
    public function resolveParentReply(ForumPost $post, int|string|null $parentReplyId): ?ForumReply
    {
        if (empty($parentReplyId)) {
            return null;
        }

        $parent = ForumReply::where('reply_id', $parentReplyId)
            ->where('post_id', $post->post_id)
            ->first();

        if (! $parent) {
            throw new \RuntimeException('The parent reply does not belong to this post.');
        }

        return $parent;
    }

    public function updateReply(ForumReply $reply, string $content): ForumReply
    {
        $reply->update(['content' => ForumHelper::sanitizeContent($content)]);

        return $reply;
    }

    public function deleteReply(ForumReply $reply): void
    {
        $reply->delete();
    }

    /**
     * Toggle a reply's accepted-solution flag.
     *
     * Marking runs in a transaction with the post's replies locked: clearing
     * the previous solution and setting the new one are two writes, and a
     * concurrent mark would otherwise leave a post with two solutions.
     *
     * @return array{isSolution: bool, message: string}
     */
    public function toggleSolution(ForumReply $reply, User $actor): array
    {
        return DB::transaction(function () use ($reply, $actor) {
            ForumReply::where('post_id', $reply->post_id)
                ->lockForUpdate()
                ->get();

            if ($reply->is_solution) {
                $reply->unmarkAsSolution();

                return ['isSolution' => false, 'message' => 'Solution unmarked successfully!'];
            }

            $reply->markAsSolution();

            if ((int) $reply->user_id !== (int) $actor->user_Id) {
                $this->notifyBestAnswer($reply, $actor);
            }

            return ['isSolution' => true, 'message' => 'Reply marked as solution!'];
        }, self::TRANSACTION_ATTEMPTS);
    }

    /**
     * Like or unlike a post, and notify the author on a like.
     */
    public function togglePostLike(ForumPost $post, User $liker): bool
    {
        $isLiked = DB::transaction(function () use ($post, $liker) {
            ForumPost::where('post_id', $post->post_id)->lockForUpdate()->first();

            return ForumPostLike::toggle($liker->user_Id, $post->post_id);
        }, self::TRANSACTION_ATTEMPTS);

        // Outside the transaction: a notification failure must not roll back
        // the like, and the coalescing read below wants the committed state.
        if ($isLiked && (int) $post->user_id !== (int) $liker->user_Id) {
            $this->notifyPostLiked($post, $liker);
        }

        return $isLiked;
    }

    public function toggleReplyLike(ForumReply $reply, User $liker): bool
    {
        $isLiked = DB::transaction(function () use ($reply, $liker) {
            ForumReply::where('reply_id', $reply->reply_id)->lockForUpdate()->first();

            return ForumReplyLike::toggle($liker->user_Id, $reply->reply_id);
        }, self::TRANSACTION_ATTEMPTS);

        if ($isLiked && (int) $reply->user_id !== (int) $liker->user_Id) {
            $this->notifyReplyLiked($reply, $liker);
        }

        return $isLiked;
    }

    public function toggleFavorite(ForumPost $post, User $user): bool
    {
        return ForumFavorite::toggle($user->user_Id, $post->post_id);
    }

    /**
     * Streak and daily-challenge progress, for students only.
     *
     * The challenge call is best-effort: a reply that was written must not be
     * lost because the gamification layer failed.
     */
    private function recordReplyForStudent(ForumReply $reply): mixed
    {
        if (! ForumHelper::isStudent()) {
            return null;
        }

        $student = ForumHelper::getCurrentStudentProfile();

        if (! $student) {
            return null;
        }

        $student->updateStreak();

        try {
            return $this->dailyChallenges->recordForumReplyCreated(
                (int) $student->student_id,
                (int) $reply->reply_id
            );
        } catch (\Throwable $e) {
            Log::warning('Failed to record forum-reply daily challenge event', [
                'student_id' => $student->student_id,
                'reply_id' => $reply->reply_id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    private function notifyBestAnswer(ForumReply $reply, User $postAuthor): void
    {
        $post = ForumPost::find($reply->post_id);

        Notification::create([
            'user_Id' => $reply->user_id,
            'type' => 'community',
            'priority' => 'high',
            'title' => '⭐ Best Answer',
            'message' => "{$postAuthor->name} marked your reply as the best answer!",
            'icon' => 'star',
            'color' => 'yellow',
            'data' => [
                'post_id' => $reply->post_id,
                'reply_id' => $reply->reply_id,
                'post_title' => $post?->title ?? '',
                'post_author' => $postAuthor->name,
            ],
            'action_url' => route('forum.show', $reply->post_id).'#reply-'.$reply->reply_id,
            'action_text' => 'View Post',
        ]);
    }

    /**
     * Notify a post author that someone liked their post, folding repeat likes
     * within the window into the existing notification instead of sending a new
     * one each time. A popular post would otherwise bury everything else.
     */
    private function notifyPostLiked(ForumPost $post, User $liker): void
    {
        try {
            $recent = Notification::where('user_Id', $post->user_id)
                ->where('type', 'community')
                ->where('title', '❤️ Post Liked')
                ->where('created_at', '>=', now()->subMinutes(self::LIKE_NOTIFICATION_WINDOW_MINUTES))
                // (int), not (string): post_id is written to the JSON column as
                // a number, and the old (string) cast never matched, so this
                // lookup always missed and every like sent a fresh notification.
                ->whereJsonContains('data->post_id', (int) $post->post_id)
                ->first();

            if (! $recent) {
                Notification::create([
                    'user_Id' => $post->user_id,
                    'type' => 'community',
                    'priority' => 'low',
                    'title' => '❤️ Post Liked',
                    'message' => "{$liker->name} liked your post",
                    'icon' => 'heart',
                    'color' => 'red',
                    'data' => [
                        'post_id' => $post->post_id,
                        'likers' => [$liker->name],
                        'likers_count' => 1,
                        'post_title' => Str::limit($post->title, 50),
                    ],
                    'action_url' => route('forum.show', $post->post_id),
                    'action_text' => 'View Post',
                ]);

                return;
            }

            $data = $recent->data ?? [];
            $likers = array_values(array_unique([...($data['likers'] ?? []), $liker->name]));
            $count = count($likers);

            $recent->update([
                'message' => $count > 1
                    ? "{$likers[0]} and ".($count - 1).' others liked your post'
                    : "{$liker->name} liked your post",
                'is_read' => false,
                'data' => array_merge($data, [
                    'likers' => $likers,
                    'likers_count' => $count,
                ]),
            ]);
        } catch (\Exception $e) {
            // A like is worth more than its notification.
            Log::error('Failed to send like notification: '.$e->getMessage(), [
                'post_id' => $post->post_id,
            ]);
        }
    }

    private function notifyReplyLiked(ForumReply $reply, User $liker): void
    {
        try {
            Notification::create([
                'user_Id' => $reply->user_id,
                'type' => 'community',
                'priority' => 'low',
                'title' => '👍 Reply Liked',
                'message' => "{$liker->name} liked your reply",
                'icon' => 'thumbs-up',
                'color' => 'purple',
                'data' => [
                    'post_id' => $reply->post_id,
                    'reply_id' => $reply->reply_id,
                    'liker_name' => $liker->name,
                    'reply_preview' => Str::limit($reply->content, 100),
                ],
                'action_url' => route('forum.show', $reply->post_id).'#reply-'.$reply->reply_id,
                'action_text' => 'View Reply',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send reply like notification: '.$e->getMessage(), [
                'reply_id' => $reply->reply_id,
            ]);
        }
    }
}
