<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\StoreLessonRequest;
use App\Http\Requests\Admin\UpdateLessonRequest;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminLessonController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:administrator']);
    }

    public function index(Request $request)
    {
        $query = Lesson::with(['creator'])
            ->withCount([
                'interactiveExercises as exercises_count',
                'tests as tests_count',
                'registrations as registrations_count',
            ])
            ->orderBy('created_at', 'desc');

        if ($q = $request->input('q')) {
            $query->where('title', 'like', "%{$q}%")
                ->orWhere('content', 'like', "%{$q}%");
        }

        if ($difficulty = $request->input('difficulty')) {
            $query->where('difficulty', $difficulty);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $lessons = $query->paginate(10)->withQueryString();

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

    private const DRAFT_DEFAULTS = [
        'estimated_duration'        => 30,
        'completion_reward_points'  => 100,
        'min_exercise_score_percent' => 70,
    ];

    public function quickDraft(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'difficulty' => 'required|string|in:beginner,intermediate,advanced',
        ]);

        $createdBy = $request->user()->user_Id;

        $lesson = Lesson::create([
            'title'                      => $data['title'],
            'content'                    => '',
            'content_type'               => 'markdown',
            'difficulty'                 => $data['difficulty'],
            'estimated_duration'         => self::DRAFT_DEFAULTS['estimated_duration'],
            'status'                     => 'draft',
            'completion_reward_points'   => self::DRAFT_DEFAULTS['completion_reward_points'],
            'required_exercises'         => 0,
            'required_tests'             => 0,
            'min_exercise_score_percent' => self::DRAFT_DEFAULTS['min_exercise_score_percent'],
            'created_by'                 => $createdBy,
        ]);

        Log::info('Quick draft lesson created', [
            'lesson_id'  => $lesson->lesson_id,
            'title'      => $lesson->title,
            'created_by' => $createdBy,
        ]);

        return redirect()
            ->route('admin.lessons.show', $lesson->lesson_id)
            ->with('success', 'Draft lesson created. Follow the checklist to finish content, practice, checks, and publishing.');
    }

    public function store(StoreLessonRequest $request)
    {
        $data = $request->validated();

        DB::beginTransaction();

        try {
            $lessonData = Arr::except($data, ['sections']);
            $lessonData['created_by']                 = $request->user()->user_Id;
            $lessonData['required_exercises']         = $lessonData['required_exercises'] ?? 0;
            $lessonData['required_tests']             = $lessonData['required_tests'] ?? 0;
            $lessonData['min_exercise_score_percent'] = $lessonData['min_exercise_score_percent'] ?? 70.00;

            $lesson = Lesson::create($lessonData);
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
                'lesson_id'   => $lesson->lesson_id,
                'title'       => $lesson->title,
                'has_sections' => isset($data['sections']),
                'created_by'  => $request->user()->user_Id,
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
        $lesson->refresh();

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
            'sections' => $sectionsData,
            'exercises' => $lesson->interactiveExercises,
            'tests' => $lesson->tests,
            'buildChecklist' => $this->buildLessonChecklist($lesson),
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

    private function buildLessonChecklist(Lesson $lesson): array
    {
        $hasContent = filled(trim((string) $lesson->content));
        $hasSections = $lesson->sections->isNotEmpty();
        $hasExercises = $lesson->interactiveExercises->isNotEmpty();
        $hasTests = $lesson->tests->isNotEmpty();
        $isPublished = $lesson->status === 'active';

        return [
            [
                'key' => 'content',
                'title' => 'Write lesson overview',
                'description' => $hasContent
                    ? 'Your core lesson content is in place.'
                    : 'Add the teaching content students should read before they practice.',
                'done' => $hasContent,
                'actionLabel' => $hasContent ? 'Refine content' : 'Add lesson content',
                'href' => route('admin.lessons.edit', $lesson->lesson_id),
            ],
            [
                'key' => 'sections',
                'title' => 'Add lesson sections',
                'description' => $hasSections
                    ? 'Sections are set up to guide the learning flow.'
                    : 'Break the lesson into clear sections if you want a more guided teaching flow.',
                'done' => $hasSections,
                'actionLabel' => $hasSections ? 'Review sections' : 'Create sections',
                'href' => route('admin.lessons.edit', $lesson->lesson_id),
            ],
            [
                'key' => 'practice',
                'title' => 'Attach practice',
                'description' => $hasExercises
                    ? 'Students already have practice waiting after content.'
                    : 'Add at least one exercise so students can apply the lesson immediately.',
                'done' => $hasExercises,
                'actionLabel' => $hasExercises ? 'Manage practices' : 'Add practice',
                'href' => $hasExercises
                    ? route('admin.lessons.exercises.index', $lesson->lesson_id)
                    : route('admin.lessons.exercises.create', $lesson->lesson_id),
            ],
            [
                'key' => 'checks',
                'title' => 'Set final checks',
                'description' => $hasTests
                    ? 'Lesson checks are ready to confirm understanding.'
                    : 'Add a test or quiz so students can prove they are ready to finish the lesson.',
                'done' => $hasTests,
                'actionLabel' => $hasTests ? 'Manage checks' : 'Add check',
                'href' => $hasTests
                    ? route('admin.lessons.tests.index', $lesson->lesson_id)
                    : route('admin.lessons.tests.create', $lesson->lesson_id),
            ],
            [
                'key' => 'publish',
                'title' => 'Publish lesson',
                'description' => $isPublished
                    ? 'This lesson is already live for students.'
                    : 'Review the completion rules, reward, and status before making the lesson live.',
                'done' => $isPublished,
                'actionLabel' => $isPublished ? 'Review live lesson' : 'Review publish settings',
                'href' => route('admin.lessons.edit', $lesson->lesson_id),
            ],
        ];
    }

    public function update(UpdateLessonRequest $request, Lesson $lesson)
    {
        $data = $request->validated();

        DB::beginTransaction();

        try {
            $lessonData = Arr::except($data, ['sections']);

            if (!isset($lessonData['status'])) {
                unset($lessonData['status']);
            }

            $lesson->update($lessonData);
            if (isset($data['sections']) && is_array($data['sections'])) {
                $lesson->sections()->delete();

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
                'lesson_id'   => $lesson->lesson_id,
                'title'       => $lesson->title,
                'has_sections' => isset($data['sections']),
                'updated_by'  => $request->user()->user_Id,
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
