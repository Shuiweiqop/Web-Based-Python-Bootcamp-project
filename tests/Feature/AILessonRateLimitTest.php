<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\AILessonGeneratorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class AILessonRateLimitTest extends TestCase
{
    use RefreshDatabase;

    /**
     * The generate route calls Gemini, so it carries the tightest throttle (10/min).
     * A single admin session that loops past that must be blocked with a 429 — this is
     * the Gemini cost/abuse guard, not a permission check (admin already passed the group).
     */
    public function test_generate_route_is_throttled_after_10_requests_per_minute(): void
    {
        $admin = User::factory()->administrator()->create();

        // Never actually hit Gemini — a successful stub keeps the focus on the limiter.
        $this->mock(AILessonGeneratorService::class, function ($mock) {
            $mock->shouldReceive('generateLesson')->andReturn([
                'title' => 'Stub',
                'sections' => [],
            ]);
        });

        $payload = [
            'title' => 'Loops in Python',
            'difficulty' => 'beginner',
        ];

        for ($i = 0; $i < 10; $i++) {
            $this->actingAs($admin)
                ->postJson(route('admin.ai-lessons.generate'), $payload)
                ->assertOk();
        }

        // The 11th within the same minute is rate-limited.
        $this->actingAs($admin)
            ->postJson(route('admin.ai-lessons.generate'), $payload)
            ->assertStatus(429);
    }

    public function test_test_connection_route_is_throttled_after_6_requests_per_minute(): void
    {
        $admin = User::factory()->administrator()->create();

        $this->mock(AILessonGeneratorService::class, function ($mock) {
            $mock->shouldReceive('testConnection')->andReturn(true);
        });

        for ($i = 0; $i < 6; $i++) {
            $this->actingAs($admin)
                ->getJson(route('admin.ai-lessons.test-connection'))
                ->assertOk();
        }

        $this->actingAs($admin)
            ->getJson(route('admin.ai-lessons.test-connection'))
            ->assertStatus(429);
    }

    protected function tearDown(): void
    {
        Mockery::close();

        parent::tearDown();
    }
}
