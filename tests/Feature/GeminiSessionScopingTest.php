<?php

namespace Tests\Feature;

use App\Models\AISessionLog;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GeminiSessionScopingTest extends TestCase
{
    use RefreshDatabase;

    public function test_ai_chat_history_and_log_sessions_are_scoped_per_lesson(): void
    {
        config(['services.gemini.key' => 'fake-key']);

        $user = $this->createVerifiedStudent();
        $firstLesson = $this->createLesson('Loops');
        $secondLesson = $this->createLesson('Functions');

        $payloads = [];
        Http::fake(function ($request) use (&$payloads) {
            $payloads[] = $request->data();

            return Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Helpful scoped reply'],
                            ],
                        ],
                    ],
                ],
            ]);
        });

        $this->actingAs($user)->postJson('/api/gemini/chat', [
            'lesson_id' => $firstLesson->lesson_id,
            'message' => 'How do loops work?',
        ])->assertOk()->assertJson(['success' => true]);

        $this->actingAs($user)->postJson('/api/gemini/chat', [
            'lesson_id' => $secondLesson->lesson_id,
            'message' => 'How do functions work?',
        ])->assertOk()->assertJson(['success' => true]);

        $this->assertCount(2, $payloads);
        $this->assertCount(1, $payloads[0]['contents']);
        $this->assertCount(1, $payloads[1]['contents']);
        $this->assertSame('How do functions work?', $payloads[1]['contents'][0]['parts'][0]['text']);

        $logs = AISessionLog::orderBy('ai_session_log_id')->get();
        $this->assertCount(2, $logs);
        $this->assertNotSame($logs[0]->ai_session_id, $logs[1]->ai_session_id);
        $this->assertSame($firstLesson->lesson_id, $logs[0]->lesson_id);
        $this->assertSame($secondLesson->lesson_id, $logs[1]->lesson_id);
    }

    private function createVerifiedStudent(): User
    {
        $user = User::create([
            'name' => 'AI Scope Tester',
            'email' => 'ai-scope-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);

        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();

        return $user->fresh();
    }

    private function createLesson(string $title): Lesson
    {
        return Lesson::create([
            'title' => $title,
            'content' => 'Lesson body',
            'difficulty' => 'beginner',
            'status' => 'active',
            'completion_reward_points' => 100,
            'required_exercises' => 0,
            'required_tests' => 0,
            'min_exercise_score_percent' => 70,
        ]);
    }
}
