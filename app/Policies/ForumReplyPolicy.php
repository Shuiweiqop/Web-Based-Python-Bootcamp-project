<?php

namespace App\Policies;

use App\Models\ForumPost;
use App\Models\ForumReply;
use App\Models\User;

/**
 * Authorization for forum replies.
 *
 * Same shape as ForumPostPolicy, and the same reasoning about before(): an
 * administrator may delete any reply, but marking a reply as the accepted
 * solution belongs to the author of the POST being answered — not to the
 * administrator, and not to the author of the reply itself.
 */
class ForumReplyPolicy
{
    public function create(User $user): bool
    {
        return $this->participates($user);
    }

    /**
     * Authors only. The old ForumReply::canEdit() compared without an (int)
     * cast, so a string id from the driver denied the real author; the cast in
     * owns() is what fixes that.
     */
    public function update(User $user, ForumReply $reply): bool
    {
        return $this->owns($user, $reply);
    }

    public function delete(User $user, ForumReply $reply): bool
    {
        return $this->owns($user, $reply) || $this->isAdmin($user);
    }

    public function like(User $user, ForumReply $reply): bool
    {
        return $this->participates($user);
    }

    /**
     * Only the author of the post may accept an answer to it.
     *
     * The post is read from an already-loaded relation when there is one. This
     * ability is evaluated once per reply while serialising a thread, and
     * reaching through $reply->post unconditionally would lazy-load the same
     * post once per reply.
     */
    public function markSolution(User $user, ForumReply $reply): bool
    {
        $post = $reply->relationLoaded('post')
            ? $reply->post
            : ForumPost::select('post_id', 'user_id')->find($reply->post_id);

        return $post !== null
            && (int) $post->user_id === (int) $user->user_Id;
    }

    public function report(User $user, ForumReply $reply): bool
    {
        return $this->participates($user) && ! $this->owns($user, $reply);
    }

    private function owns(User $user, ForumReply $reply): bool
    {
        return (int) $reply->user_id === (int) $user->user_Id;
    }

    private function isAdmin(User $user): bool
    {
        return $user->role === 'administrator';
    }

    private function participates(User $user): bool
    {
        return in_array($user->role, ['administrator', 'student'], true);
    }
}
