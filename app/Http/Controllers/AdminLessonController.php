<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;

class AdminLessonController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:administrator']);
    }

    public function index(Request $request)
    {
        $query = Lesson::with(['creator', 'interactiveExercises', 'tests'])
            ->orderBy('created_at', 'desc');

        // 搜索过滤
        if ($q = $request->input('q')) {
            $query->where('title', 'like', "%{$q}%")
                ->orWhere('content', 'like', "%{$q}%");
        }

        // 难度过滤
        if ($difficulty = $request->input('difficulty')) {
            $query->where('difficulty', $difficulty);
        }

        // 状态过滤
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $lessons = $query->paginate(10)->withQueryString();

        // 添加统计信息
        $lessons->getCollection()->transform(function ($lesson) {
            $lesson->exercises_count = $lesson->interactiveExercises->count();
            $lesson->tests_count = $lesson->tests->count();
            $lesson->registrations_count = $lesson->registrations()->count();
            return $lesson;
        });

        return Inertia::render('Admin/Lessons/Index', [
            'lessons' => $lessons,
            'filters' => $request->only(['q', 'difficulty', 'status']),
            'statistics' => [
                'total_lessons' => Lesson::count(),
                'active_lessons' => Lesson::where('status', 'active')->count(),
                'draft_lessons' => Lesson::where('status', 'draft')->count(),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Lessons/Create');
    }

    public function store(Request $request)
    {
        // ✅ 完整验证（包含 sections）
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'video_url' => 'nullable|url',
            'difficulty' => 'required|string|in:beginner,intermediate,advanced',
            'estimated_duration' => 'nullable|integer|min:1|max:1440',
            'status' => 'required|in:active,inactive,draft',
            'completion_reward_points' => 'nullable|integer|min:0|max:10000',
            'required_exercises' => 'nullable|integer|min:0',
            'required_tests' => 'nullable|integer|min:0',
            'min_exercise_score_percent' => 'nullable|numeric|min:0|max:100',
            // 🔥 新增：sections 验证
            'sections' => 'nullable|array',
            'sections.*.title' => 'required_with:sections|string|max:255',
            'sections.*.content' => 'required_with:sections|string',
            'sections.*.order_index' => 'required_with:sections|integer|min:1',
        ]);

        DB::beginTransaction();

        try {
            // 1️⃣ 设置默认值
            $lessonData = Arr::except($data, ['sections']); // 排除 sections
            $lessonData['created_by'] = $request->user()->user_Id ?? $request->user()->id;
            $lessonData['required_exercises'] = $lessonData['required_exercises'] ?? 0;
            $lessonData['required_tests'] = $lessonData['required_tests'] ?? 0;
            $lessonData['min_exercise_score_percent'] = $lessonData['min_exercise_score_percent'] ?? 70.00;

            // 2️⃣ 创建 Lesson
            $lesson = Lesson::create($lessonData);

            // 3️⃣ 创建 Sections（如果有）
            if (isset($data['sections']) && is_array($data['sections'])) {
                foreach ($data['sections'] as $sectionData) {
                    $lesson->sections()->create([
                        'title' => $sectionData['title'],
                        'content' => $sectionData['content'],
                        'order_index' => $sectionData['order_index'],
                    ]);
                }

                Log::info('Lesson sections created', [
                    'lesson_id' => $lesson->lesson_id,
                    'sections_count' => count($data['sections']),
                ]);
            }

            DB::commit();

            Log::info('Lesson created', [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
                'has_sections' => isset($data['sections']),
                'created_by' => $request->user()->id,
            ]);

            return redirect()
                ->route('admin.lessons.show', $lesson->lesson_id)
                ->with('success', 'Lesson created successfully! You can now add exercises and tests.');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Lesson creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'Failed to create lesson: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function show(Lesson $lesson)
    {
        // 🔥 强制刷新 lesson，确保获取最新数据
        $lesson->refresh();

        // 🔥 加载所有关联关系
        $lesson->load([
            'creator',
            'sections' => function ($query) {
                $query->orderBy('order_index');
            },
            'interactiveExercises' => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
            'tests' => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
            'registrations' => function ($query) {
                $query->with('student.user')->latest();
            }
        ]);

        // 🔥 调试：打印 sections 数据
        Log::info('Lesson Show Data', [
            'lesson_id' => $lesson->lesson_id,
            'title' => $lesson->title,
            'sections_count' => $lesson->sections->count(),
            'sections' => $lesson->sections->toArray(),
        ]);

        // 🔥 确保 sections 被正确序列化
        $sectionsData = $lesson->sections->map(function ($section) {
            return [
                'id' => $section->lesson_section_id ?? $section->id,
                'lesson_id' => $section->lesson_id,
                'title' => $section->title,
                'content' => $section->content,
                'order_index' => $section->order_index,
                'created_at' => $section->created_at,
                'updated_at' => $section->updated_at,
            ];
        })->toArray();

        return Inertia::render('Admin/Lessons/Show', [
            'lesson' => [
                'id' => $lesson->lesson_id,
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
                'content' => $lesson->content,
                'content_type' => $lesson->content_type,
                'video_url' => $lesson->video_url,
                'difficulty' => $lesson->difficulty,
                'estimated_duration' => $lesson->estimated_duration,
                'status' => $lesson->status,
                'completion_reward_points' => $lesson->completion_reward_points,
                'required_exercises' => $lesson->required_exercises,
                'required_tests' => $lesson->required_tests,
                'min_exercise_score_percent' => $lesson->min_exercise_score_percent,
                'ai_generated' => $lesson->ai_generated ?? false,
                'created_at' => $lesson->created_at,
                'updated_at' => $lesson->updated_at,
            ],
            'sections' => $sectionsData, // 🔥 显式传递 sections
            'exercises' => $lesson->interactiveExercises,
            'tests' => $lesson->tests,
            'statistics' => [
                'exercises_count' => $lesson->interactiveExercises->count(),
                'active_exercises_count' => $lesson->interactiveExercises->where('is_active', true)->count(),
                'tests_count' => $lesson->tests->count(),
                'active_tests_count' => $lesson->tests->where('status', 'active')->count(),
                'total_registrations' => $lesson->registrations->count(),
                'completed_registrations' => $lesson->registrations->where('registration_status', 'completed')->count(),
                'sections_count' => $lesson->sections->count(),
            ],
        ]);
    }

    // 在你的 AdminLessonController.php 中
    // 找到 update 方法并完全替换为：

    public function update(Request $request, Lesson $lesson)
    {
        // ✅ 完整的验证（包含所有字段）
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'video_url' => 'nullable|url',
            'difficulty' => 'required|string|in:beginner,intermediate,advanced',
            'estimated_duration' => 'nullable|integer|min:1|max:1440',
            'completion_reward_points' => 'nullable|integer|min:0|max:10000',
            'status' => 'nullable|in:active,inactive,draft',
            'required_exercises' => 'nullable|integer|min:0',
            'required_tests' => 'nullable|integer|min:0',
            'min_exercise_score_percent' => 'nullable|numeric|min:0|max:100',
            // 🔥 Sections 验证
            'sections' => 'nullable|array',
            'sections.*.id' => 'nullable|integer',
            'sections.*.title' => 'required_with:sections|string|max:255',
            'sections.*.content' => 'required_with:sections|string',
            'sections.*.order_index' => 'required_with:sections|integer|min:1',
        ]);

        DB::beginTransaction();

        try {
            // 1️⃣ 更新 lesson 基本信息（排除 sections）
            $lessonData = Arr::except($data, ['sections']);

            // 🔥 如果没有提供 status，保持原有值
            if (!isset($lessonData['status'])) {
                unset($lessonData['status']);
            }

            $lesson->update($lessonData);

            // 2️⃣ 更新 sections（如果有）
            if (isset($data['sections']) && is_array($data['sections'])) {
                // 删除所有旧的 sections
                $lesson->sections()->delete();

                // 创建新的 sections
                foreach ($data['sections'] as $sectionData) {
                    $lesson->sections()->create([
                        'title' => $sectionData['title'],
                        'content' => $sectionData['content'],
                        'order_index' => $sectionData['order_index'],
                    ]);
                }

                Log::info('Lesson sections updated', [
                    'lesson_id' => $lesson->lesson_id,
                    'sections_count' => count($data['sections']),
                ]);
            }

            DB::commit();

            Log::info('Lesson updated successfully', [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
                'has_sections' => isset($data['sections']),
                'updated_by' => $request->user()->id,
            ]);

            // 🔥 关键：使用 303 状态码避免重定向循环
            return redirect()
                ->route('admin.lessons.show', $lesson->lesson_id)
                ->setStatusCode(303)  // ✅ 必须加这个
                ->with('success', 'Lesson updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Lesson update failed', [
                'lesson_id' => $lesson->lesson_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'Failed to update lesson: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function edit(Lesson $lesson)
    {
        // 🔥 加载 sections
        $lesson->load('sections');

        return Inertia::render('Admin/Lessons/Edit', [
            'lesson' => $lesson,
            'sections' => $lesson->sections,
            'current_exercises_count' => $lesson->interactiveExercises()->where('is_active', true)->count(),
            'current_tests_count' => $lesson->tests()->where('status', 'active')->count(),
        ]);
    }


    public function destroy(Lesson $lesson)
    {
        $lessonTitle = $lesson->title;
        $lessonId = $lesson->lesson_id;

        // 删除会级联删除 exercises, tests, registrations (如果外键设置了 cascade)
        $lesson->delete();

        Log::info('Lesson deleted', [
            'lesson_id' => $lessonId,
            'title' => $lessonTitle,
            'deleted_by' => auth()->id(),
        ]);

        return redirect()
            ->route('admin.lessons.index')
            ->setStatusCode(303)
            ->with('success', 'Lesson and all related content deleted successfully.');
    }

    /**
     * 批量更新状态
     */
    public function bulkUpdateStatus(Request $request)
    {
        $data = $request->validate([
            'lesson_ids' => 'required|array',
            'lesson_ids.*' => 'exists:lessons,lesson_id',
            'status' => 'required|in:active,inactive,draft',
        ]);

        $count = Lesson::whereIn('lesson_id', $data['lesson_ids'])
            ->update(['status' => $data['status']]);

        return redirect()
            ->route('admin.lessons.index')
            ->with('success', "Updated status for {$count} lesson(s).");
    }

    /**
     * 自动更新完成要求（根据当前 exercises 和 tests 数量）
     */
    public function updateCompletionRequirements(Lesson $lesson)
    {
        $lesson->updateCompletionRequirements();

        return redirect()
            ->route('admin.lessons.show', $lesson->lesson_id)
            ->with('success', 'Completion requirements updated based on current exercises and tests.');
    }

    /**
     * 复制课程
     */
    public function duplicate(Lesson $lesson)
    {
        $newLesson = $lesson->replicate();
        $newLesson->title = $lesson->title . ' (Copy)';
        $newLesson->status = 'draft';
        $newLesson->created_by = auth()->user()->user_Id ?? auth()->id();
        $newLesson->save();

        // 可选：复制 exercises 和 tests
        foreach ($lesson->interactiveExercises as $exercise) {
            $newExercise = $exercise->replicate();
            $newExercise->lesson_id = $newLesson->lesson_id;
            $newExercise->save();
        }

        foreach ($lesson->tests as $test) {
            $newTest = $test->replicate();
            $newTest->lesson_id = $newLesson->lesson_id;
            $newTest->save();

            // 复制问题
            foreach ($test->questions as $question) {
                $newQuestion = $question->replicate();
                $newQuestion->test_id = $newTest->test_id;
                $newQuestion->save();

                // 复制选项
                foreach ($question->options as $option) {
                    $newOption = $option->replicate();
                    $newOption->question_id = $newQuestion->question_id;
                    $newOption->save();
                }
            }
        }

        Log::info('Lesson duplicated', [
            'original_lesson_id' => $lesson->lesson_id,
            'new_lesson_id' => $newLesson->lesson_id,
        ]);

        return redirect()
            ->route('admin.lessons.edit', $newLesson->lesson_id)
            ->with('success', 'Lesson duplicated successfully. You can now modify the copy.');
    }
}
