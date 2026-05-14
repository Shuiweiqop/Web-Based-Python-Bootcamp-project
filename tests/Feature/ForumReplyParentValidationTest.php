<?php

namespace Tests\Feature;

use App\Models\ForumPost;
use App\Models\ForumReply;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ForumReplyParentValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_reply_parent_must_belong_to_the_same_post(): void
    {
        $author = $this->createVerifiedStudent('author');
        $student = $this->createVerifiedStudent('student');

        $firstPost = ForumPost::create([
            'user_id' => $author->user_Id,
            'title' => 'First help post',
            'content' => 'I need help with loops.',
            'category' => 'help',
        ]);

        $secondPost = ForumPost::create([
            'user_id' => $author->user_Id,
            'title' => 'Second help post',
            'content' => 'I need help with functions.',
            'category' => 'help',
        ]);

        $otherPostReply = ForumReply::create([
            'post_id' => $secondPost->post_id,
            'user_id' => $author->user_Id,
            'content' => 'This reply belongs to the second post.',
        ]);

        $response = $this->actingAs($student)
            ->from("/forum/{$firstPost->post_id}")
            ->post("/forum/{$firstPost->post_id}/reply", [
                'content' => 'Trying to nest under the wrong post.',
                'parent_reply_id' => $otherPostReply->reply_id,
            ]);

        $response->assertRedirect("/forum/{$firstPost->post_id}");
        $response->assertSessionHasErrors('parent_reply_id');

        $this->assertDatabaseMissing('forum_replies', [
            'post_id' => $firstPost->post_id,
            'parent_reply_id' => $otherPostReply->reply_id,
            'content' => 'Trying to nest under the wrong post.',
        ]);
    }

    private function createVerifiedStudent(string $name): User
    {
        $user = User::create([
            'name' => ucfirst($name),
            'email' => $name.'-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);

        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();

        return $user->fresh();
    }
}
