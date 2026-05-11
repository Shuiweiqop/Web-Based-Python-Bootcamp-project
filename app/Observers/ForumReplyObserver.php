<?php

namespace App\Observers;

use App\Models\ForumReply;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class ForumReplyObserver
{
    /**
     * Triggered when a reply is created
     */
    public function created(ForumReply $reply)
    {
        try {
            // Get the post and reply author
            $post = $reply->post;
            $replyAuthor = $reply->user;

            if (!$post || !$replyAuthor) {
                return;
            }

            // 1️⃣ Notify the post author (if the replier is not the author)
            if ($reply->user_id !== $post->user_id) {
                $this->notifyPostAuthor($reply, $post, $replyAuthor);
            }

            // 2️⃣ If this is a nested reply, notify the parent reply author
            if ($reply->parent_reply_id) {
                $parentReply = $reply->parentReply;
                if ($parentReply && $reply->user_id !== $parentReply->user_id) {
                    $this->notifyParentReplyAuthor($reply, $parentReply, $replyAuthor);
                }
            }

            Log::info('✅ Forum reply notifications created', [
                'reply_id' => $reply->reply_id,
                'post_id' => $post->post_id,
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Failed to create forum reply notification', [
                'error' => $e->getMessage(),
                'reply_id' => $reply->reply_id ?? null,
            ]);
        }
    }

    /**
     * Notify the post author
     */
    protected function notifyPostAuthor($reply, $post, $replyAuthor)
    {
        $postAuthor = $post->user;
        if (!$postAuthor) {
            return;
        }

        // Ensure the post author has a user_Id
        if (!$postAuthor->user_Id) {
            Log::warning('Post author has no user_Id', ['post_id' => $post->post_id]);
            return;
        }

        Notification::create([
            'user_Id' => $postAuthor->user_Id,
            'type' => 'social',
            'priority' => 'normal',
            'title' => 'Someone replied to your post',
            'message' => "{$replyAuthor->name} replied to your post \"{$post->title}\"",
            'icon' => 'message-circle',
            'color' => 'blue',
            'data' => [
                'post_id' => $post->post_id,
                'reply_id' => $reply->reply_id,
                'author_name' => $replyAuthor->name,
                'reply_preview' => mb_substr(strip_tags($reply->content), 0, 100),
            ],
            'action_url' => route('forum.show', $post->post_id),
            'action_text' => 'View Reply',
        ]);
    }

    /**
     * Notify the parent reply author (nested reply)
     */
    protected function notifyParentReplyAuthor($reply, $parentReply, $replyAuthor)
    {
        $parentAuthor = $parentReply->user;
        if (!$parentAuthor) {
            return;
        }

        // Ensure the parent reply author has a user_Id
        if (!$parentAuthor->user_Id) {
            Log::warning('Parent reply author has no user_Id', ['reply_id' => $parentReply->reply_id]);
            return;
        }

        $post = $reply->post;

        Notification::create([
            'user_Id' => $parentAuthor->user_Id,
            'type' => 'social',
            'priority' => 'normal',
            'title' => 'Someone replied to you',
            'message' => "{$replyAuthor->name} replied to your comment in \"{$post->title}\"",
            'icon' => 'at-sign',
            'color' => 'purple',
            'data' => [
                'post_id' => $post->post_id,
                'reply_id' => $reply->reply_id,
                'parent_reply_id' => $parentReply->reply_id,
                'author_name' => $replyAuthor->name,
                'reply_preview' => mb_substr(strip_tags($reply->content), 0, 100),
            ],
            'action_url' => route('forum.show', $post->post_id),
            'action_text' => 'View Reply',
        ]);
    }
}
