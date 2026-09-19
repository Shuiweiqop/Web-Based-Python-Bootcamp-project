<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * NotificationService addresses notifications to the right column.
 *
 * The notifications table keys its recipient as user_Id, but the service spelled
 * it user_id throughout. Reads appeared to work because sqlite folds column
 * names, which MySQL on Linux does not — and the writes were worse: user_id is
 * not fillable, so mass assignment dropped it and the notification was stored
 * with no recipient at all.
 */
class NotificationServiceRecipientTest extends TestCase
{
    use RefreshDatabase;

    private NotificationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(NotificationService::class);
    }

    public function test_a_notification_is_stored_against_its_recipient(): void
    {
        $user = $this->createUser();

        $this->service->notifyMultipleUsers([$user->user_Id], 'system', [
            'title' => 'Scheduled maintenance',
            'message' => 'The platform will be briefly unavailable.',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_Id' => $user->user_Id,
            'title' => 'Scheduled maintenance',
        ]);

        $this->assertSame(
            0,
            Notification::whereNull('user_Id')->count(),
            'A notification with no recipient reaches nobody.'
        );
    }

    public function test_an_announcement_reaches_every_user(): void
    {
        $first = $this->createUser();
        $second = $this->createUser();

        $sent = $this->service->notifyAllUsers('Term starts', 'Classes resume Monday.');

        $this->assertSame(2, $sent);

        foreach ([$first, $second] as $user) {
            $this->assertDatabaseHas('notifications', [
                'user_Id' => $user->user_Id,
                'title' => 'Term starts',
            ]);
        }

        $this->assertSame(0, Notification::whereNull('user_Id')->count());
    }

    public function test_counts_are_scoped_to_one_user(): void
    {
        $mine = $this->createUser();
        $theirs = $this->createUser();

        $this->service->notifyMultipleUsers([$mine->user_Id], 'system', [
            'title' => 'For me',
            'message' => 'Mine alone.',
        ]);

        $this->assertSame(1, $this->service->getUnreadCount($mine->user_Id));
        $this->assertSame(
            0,
            $this->service->getUnreadCount($theirs->user_Id),
            'Scoping by the wrong column would return everyone\'s notifications.'
        );
    }

    private function createUser(): User
    {
        $user = User::create([
            'name' => 'Student',
            'email' => 'student-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);

        $user->forceFill(['email_verified_at' => now()])->save();

        return $user->fresh();
    }
}
