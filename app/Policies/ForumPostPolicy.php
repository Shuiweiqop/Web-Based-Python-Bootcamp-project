<?php

namespace App\Policies;

use App\Models\ForumPost;
use App\Models\User;

/**
 * Authorization for forum posts.
 *
 * Laravel 12 discovers this automatically from the App\Models\ForumPost ->
 * App\Policies\ForumPostPolicy naming convention, so there is nothing to
 * register.
 *
 * There is deliberately no before() hook. Administrators may delete, pin and
 * lock any post, but they may NOT edit one — that is the author's alone. A
 * blanket admin override would grant editing silently, which is an expansion of
 * privilege rather than a refactor, so the admin branch is written out
 * explicitly on each ability that actually has one.
 *
 * Ids are compared with an (int) cast on both sides. The database driver can
 * hand back user_id as a string, and a strict comparison against an int would
 * then deny the legitimate author.
 */
class ForumPostPolicy
{
    /**
     * Who may use the forum at all. Both roles can; the check exists so the
     * rule has one home rather than being spelled out per action.
     */
    public function viewAny(User $user): bool
    {
        return $this->participates($user);
    }

    public function view(User $user, ForumPost $post): bool
    {
        return $this->participates($user);
    }

    public function create(User $user): bool
    {
        return $this->participates($user);
    }

    /**
     * Authors only — administrators included in the denial.
     */
    public function update(User $user, ForumPost $post): bool
    {
        return $this->owns($user, $post);
    }

    public function delete(User $user, ForumPost $post): bool
    {
        return $this->owns($user, $post) || $this->isAdmin($user);
    }

    public function pin(User $user, ForumPost $post): bool
    {
        return $this->isAdmin($user);
    }

    public function lock(User $user, ForumPost $post): bool
    {
        return $this->isAdmin($user);
    }

    public function reply(User $user, ForumPost $post): bool
    {
        return $this->participates($user);
    }

    public function like(User $user, ForumPost $post): bool
    {
        return $this->participates($user);
    }

    public function favorite(User $user, ForumPost $post): bool
    {
        return $this->participates($user);
    }

    /**
     * Reporting your own post is pointless, so it is refused.
     */
    public function report(User $user, ForumPost $post): bool
    {
        return $this->participates($user) && ! $this->owns($user, $post);
    }

    private function owns(User $user, ForumPost $post): bool
    {
        return (int) $post->user_id === (int) $user->user_Id;
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
