<?php

namespace Tests\Feature;

use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminLessonQuickDraftTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_a_quick_draft_lesson_with_defaults(): void
    {
        $admin = User::factory()->administrator()->create();

        $response = $this->actingAs($admin)->post(route('admin.lessons.quick-draft'), [
            'title' => 'Quick loops shell',
            'difficulty' => 'beginner',
        ]);

        $lesson = Lesson::latest('lesson_id')->first();

        $this->assertNotNull($lesson);
        $response->assertRedirect(route('admin.lessons.show', $lesson->lesson_id));
        $this->assertSame('Quick loops shell', $lesson->title);
        $this->assertSame('draft', $lesson->status);
        $this->assertSame('markdown', $lesson->content_type);
        $this->assertSame(30, $lesson->estimated_duration);
        $this->assertSame(100, $lesson->completion_reward_points);
        $this->assertSame(0, $lesson->required_exercises);
        $this->assertSame(0, $lesson->required_tests);
        $this->assertSame((string) $admin->user_Id, (string) $lesson->created_by);
    }

    public function test_admin_lesson_show_exposes_build_checklist_for_new_drafts(): void
    {
        $admin = User::factory()->administrator()->create();

        $lesson = Lesson::create([
            'title' => 'Draft shell lesson',
            'content' => '',
            'content_type' => 'markdown',
            'difficulty' => 'beginner',
            'estimated_duration' => 30,
            'status' => 'draft',
            'completion_reward_points' => 100,
            'required_exercises' => 0,
            'required_tests' => 0,
            'min_exercise_score_percent' => 70,
            'created_by' => $admin->user_Id,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.lessons.show', $lesson->lesson_id));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Lessons/Show')
            ->where('buildChecklist.0.key', 'content')
            ->where('buildChecklist.0.done', false)
            ->where('buildChecklist.1.key', 'sections')
            ->where('buildChecklist.1.done', false)
            ->where('buildChecklist.2.key', 'practice')
            ->where('buildChecklist.2.done', false)
            ->where('buildChecklist.3.key', 'checks')
            ->where('buildChecklist.3.done', false)
            ->where('buildChecklist.4.key', 'publish')
            ->where('buildChecklist.4.done', false)
        );
    }
}
