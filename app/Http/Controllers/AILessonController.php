<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\LessonSection;
use App\Services\AILessonGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AILessonController extends Controller
{
    private AILessonGeneratorService $aiService;

    public function __construct(AILessonGeneratorService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * 显示 AI 创建课程页面
     */
    public function create()
    {
        return Inertia::render('Admin/Lessons/CreateWithAI', [
            'difficulties' => ['beginner', 'intermediate', 'advanced'],
        ]);
    }

    /**
     * 生成 AI 课程内容（预览）
     */
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'video_url' => 'nullable|url',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
        ]);

        try {
            $lessonData = $this->aiService->generateLesson(
                $validated['title'],
                $validated['video_url'] ?? null,
                $validated['difficulty']
            );

            return response()->json([
                'success' => true,
                'data' => $lessonData,
                'message' => 'Lesson content generated successfully! Review and edit before saving.',
            ]);
        } catch (\Exception $e) {
            Log::error('AI Generation Error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate lesson. Please try again later.',
            ], 500);
        }
    }

    /**
     * 保存 AI 生成的课程
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'estimated_duration' => 'nullable|integer|min:1',
            'video_url' => 'nullable|url',
            'ai_source_url' => 'nullable|url',
            'sections' => 'required|array|min:1',
            'sections.*.title' => 'required|string|max:255',
            'sections.*.content' => 'required|string',
            'status' => 'nullable|in:draft,active,inactive',
        ]);

        DB::beginTransaction();

        try {
            // 创建课程
            $lesson = Lesson::create([
                'title' => $validated['title'],
                'content' => $validated['content'] ?? '',
                'difficulty' => $validated['difficulty'],
                'estimated_duration' => $validated['estimated_duration'] ?? 30,
                'video_url' => $validated['video_url'] ?? null,
                'status' => $validated['status'] ?? 'draft',
                'created_by' => Auth::id(),
                'ai_generated' => true,
                'ai_source_url' => $validated['ai_source_url'] ?? null,
                'content_type' => 'markdown',
            ]);

            // 创建章节
            foreach ($validated['sections'] as $index => $section) {
                LessonSection::create([
                    'lesson_id' => $lesson->lesson_id,
                    'title' => $section['title'],
                    'content' => $section['content'],
                    'order_index' => $index + 1,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'AI-generated lesson saved successfully!',
                'lesson_id' => $lesson->lesson_id,
                'redirect' => route('admin.lessons.edit', $lesson->lesson_id),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('AI Lesson Save Error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to save lesson. Please try again later.',
            ], 500);
        }
    }

    /**
     * 测试 AI 服务连接
     */
    public function testConnection()
    {
        $isConnected = $this->aiService->testConnection();

        return response()->json([
            'success' => $isConnected,
            'message' => $isConnected
                ? 'OpenAI API connection successful!'
                : 'Failed to connect to OpenAI API. Check your API key.',
        ]);
    }
}
