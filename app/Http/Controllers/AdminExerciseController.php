<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use App\Models\Lesson;
use App\Models\InteractiveExercise;

class AdminExerciseController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:administrator']);
    }

    /**
     * 全站 exercises（可通过 ?lesson_id= 过滤）
     */
    public function index(Request $request)
    {
        $query = InteractiveExercise::with('lesson')->orderBy('created_at', 'desc');

        if ($lessonId = $request->input('lesson_id')) {
            $query->where('lesson_id', $lessonId);
        }

        if ($q = $request->input('q')) {
            $query->where('title', 'like', '%' . addcslashes($q, '%_') . '%');
        }

        $exercises = $query->paginate(10)->withQueryString();
        $lessons = Lesson::orderBy('title')->get();

        return Inertia::render('Admin/Exercises/Index', [
            'exercises' => $exercises,
            'lessons' => $lessons,
            'filters' => $request->only(['q', 'lesson_id']),
        ]);
    }

    /**
     * admin/exercises/create (non-nested) OR admin/lessons/{lesson}/exercises/create (nested)
     */
    public function create(Request $request)
    {
        $lessons = Lesson::orderBy('title')->get();
        $routeLesson = $request->route('lesson');

        return Inertia::render('Admin/Exercises/Create', [
            'lessons' => $lessons,
            'selectedLessonId' => $request->input('lesson_id'),
            'lesson' => $routeLesson ? [
                'lesson_id' => $routeLesson->lesson_id,
                'title' => $routeLesson->title,
            ] : null,
        ]);
    }

    /**
     * POST admin/exercises (non-nested)
     */
    public function store(Request $request)
    {
        $rules = [
            'lesson_id' => 'required|exists:lessons,lesson_id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'exercise_type' => 'required|string',
            'asset_url' => 'nullable|url',
            'max_score' => 'nullable|integer|min:0',
            'time_limit_sec' => 'nullable|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ];

        if (Schema::hasColumn('interactive_exercises', 'content')) {
            $rules['content'] = 'nullable';
        }
        if (Schema::hasColumn('interactive_exercises', 'difficulty')) {
            $rules['difficulty'] = 'nullable|string';
        }
        if (Schema::hasColumn('interactive_exercises', 'starter_code')) {
            $rules['starter_code'] = 'nullable|string';
        }
        if (Schema::hasColumn('interactive_exercises', 'solution')) {
            $rules['solution'] = 'nullable|string';
        }

        // ⭐⭐⭐ 新增：Live Editor 字段验证 ⭐⭐⭐
        if (Schema::hasColumn('interactive_exercises', 'enable_live_editor')) {
            $rules['enable_live_editor'] = 'nullable|boolean';
        }
        if (Schema::hasColumn('interactive_exercises', 'coding_instructions')) {
            $rules['coding_instructions'] = 'nullable|string';
        }
        if (Schema::hasColumn('interactive_exercises', 'test_cases')) {
            $rules['test_cases'] = 'nullable|array';
            $rules['test_cases.*.input'] = 'nullable|string';
            $rules['test_cases.*.expected'] = 'required_with:test_cases|string';
            $rules['test_cases.*.description'] = 'nullable|string';
        }

        $data = $request->validate($rules);

        if (isset($data['content']) && is_array($data['content'])) {
            $data['content'] = json_encode($data['content']);
        }

        // ⭐ 设置默认值
        if (isset($data['enable_live_editor'])) {
            $data['enable_live_editor'] = (bool) $data['enable_live_editor'];
        }

        if (Schema::hasColumn('interactive_exercises', 'created_by')) {
            $data['created_by'] = $request->user()->getKey();
        }

        $exercise = InteractiveExercise::create($data);

        // ⭐ 记录日志（方便调试）
        Log::info('Exercise created', [
            'exercise_id' => $exercise->exercise_id,
            'type' => $exercise->exercise_type,
            'enable_live_editor' => $exercise->enable_live_editor ?? false,
            'test_cases_count' => is_array($exercise->test_cases) ? count($exercise->test_cases) : 0,
        ]);

        return redirect()
            ->route('admin.exercises.index')
            ->with('success', 'Exercise created successfully!');
    }

    /**
     * Show a single exercise (non-nested)
     */
    public function show(InteractiveExercise $exercise)
    {
        $exercise->load(['lesson', 'creator']);
        $exerciseArr = $exercise->toArray();
        $exerciseArr['exercise_id'] = $exercise->exercise_id;

        return Inertia::render('Admin/Exercises/Show', [
            'exercise' => $exerciseArr,
            'lesson' => $exercise->lesson ? [
                'lesson_id' => $exercise->lesson->lesson_id,
                'title' => $exercise->lesson->title,
            ] : null,
        ]);
    }

    /**
     * Edit page for single exercise (non-nested)
     */
    public function edit(InteractiveExercise $exercise)
    {
        Log::info('edit called', [
            'exercise_pk' => $exercise->getKeyName(),
            'exercise_id' => $exercise->exercise_id,
            'lesson_id' => $exercise->lesson_id,
        ]);

        $exercise->load('lesson');
        $exerciseArr = $exercise->toArray();
        $exerciseArr['exercise_id'] = $exercise->exercise_id;

        return Inertia::render('Admin/Exercises/Edit', [
            'exercise' => $exerciseArr,
            'lesson' => $exercise->lesson ? [
                'lesson_id' => $exercise->lesson->lesson_id,
                'title' => $exercise->lesson->title,
            ] : null,
        ]);
    }

    /**
     * Update non-nested exercise
     */
    public function update(Request $request, InteractiveExercise $exercise): RedirectResponse
    {
        $rules = [
            'lesson_id' => 'required|exists:lessons,lesson_id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'exercise_type' => 'required|string',
            'asset_url' => 'nullable|url',
            'max_score' => 'nullable|integer|min:0',
            'time_limit_sec' => 'nullable|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ];

        if (Schema::hasColumn('interactive_exercises', 'content')) {
            $rules['content'] = 'nullable';
        }
        if (Schema::hasColumn('interactive_exercises', 'difficulty')) {
            $rules['difficulty'] = 'nullable|string';
        }
        if (Schema::hasColumn('interactive_exercises', 'starter_code')) {
            $rules['starter_code'] = 'nullable|string';
        }
        if (Schema::hasColumn('interactive_exercises', 'solution')) {
            $rules['solution'] = 'nullable|string';
        }

        // ⭐ Live Editor 字段验证
        if (Schema::hasColumn('interactive_exercises', 'enable_live_editor')) {
            $rules['enable_live_editor'] = 'nullable|boolean';
        }
        if (Schema::hasColumn('interactive_exercises', 'coding_instructions')) {
            $rules['coding_instructions'] = 'nullable|string';
        }
        if (Schema::hasColumn('interactive_exercises', 'test_cases')) {
            $rules['test_cases'] = 'nullable|array';
        }

        $data = $request->validate($rules);

        if (isset($data['content']) && is_array($data['content'])) {
            $data['content'] = json_encode($data['content']);
        }

        $exercise->update($data);

        return redirect()
            ->route('admin.exercises.show', ['exercise' => $exercise->exercise_id])
            ->setStatusCode(303)
            ->with('success', 'Exercise updated.');
    }

    /**
     * Delete non-nested exercise
     */
    public function destroy(InteractiveExercise $exercise): RedirectResponse
    {
        $exercise->delete();

        return redirect()
            ->route('admin.exercises.index')
            ->setStatusCode()
            ->with('success', 'Exercise deleted.');
    }

    /* -------------------- 嵌套路由：lesson 下的 exercises -------------------- */

    public function indexForLesson(Lesson $lesson, Request $request)
    {
        $query = InteractiveExercise::where('lesson_id', $lesson->lesson_id)
            ->orderBy('created_at', 'desc');

        if ($q = $request->input('q')) {
            $query->where('title', 'like', "%{$q}%");
        }

        $exercises = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Exercises/Index', [
            'lesson' => [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
            ],
            'exercises' => $exercises,
            'filters' => $request->only('q'),
        ]);
    }

    public function createForLesson(Lesson $lesson)
    {
        return Inertia::render('Admin/Exercises/Create', [
            'lesson' => [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
            ],
        ]);
    }

    /**
     * ⭐⭐⭐ 嵌套路由的 store - 添加 Live Editor 支持 ⭐⭐⭐
     */
    public function storeForLesson(Request $request, Lesson $lesson)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'exercise_type' => 'required|string',
            'asset_url' => 'nullable|url',
            'max_score' => 'nullable|integer|min:0',
            'time_limit_sec' => 'nullable|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ];

        if (Schema::hasColumn('interactive_exercises', 'content')) {
            $rules['content'] = 'nullable';
        }
        if (Schema::hasColumn('interactive_exercises', 'difficulty')) {
            $rules['difficulty'] = 'nullable|string';
        }
        if (Schema::hasColumn('interactive_exercises', 'starter_code')) {
            $rules['starter_code'] = 'nullable|string';
        }
        if (Schema::hasColumn('interactive_exercises', 'solution')) {
            $rules['solution'] = 'nullable|string';
        }

        // ⭐⭐⭐ 新增：Live Editor 字段验证 ⭐⭐⭐
        if (Schema::hasColumn('interactive_exercises', 'enable_live_editor')) {
            $rules['enable_live_editor'] = 'nullable|boolean';
        }
        if (Schema::hasColumn('interactive_exercises', 'coding_instructions')) {
            $rules['coding_instructions'] = 'nullable|string';
        }
        if (Schema::hasColumn('interactive_exercises', 'test_cases')) {
            $rules['test_cases'] = 'nullable|array';
            $rules['test_cases.*.input'] = 'nullable|string';
            $rules['test_cases.*.expected'] = 'required_with:test_cases|string';
            $rules['test_cases.*.description'] = 'nullable|string';
        }

        $data = $request->validate($rules);

        if (isset($data['content']) && is_array($data['content'])) {
            $data['content'] = json_encode($data['content']);
        }

        $data['lesson_id'] = $lesson->lesson_id;
        if (Schema::hasColumn('interactive_exercises', 'created_by')) {
            $data['created_by'] = $request->user()->getKey();
        }

        $exercise = InteractiveExercise::create($data);

        // ⭐ 记录日志
        Log::info('Exercise created (nested)', [
            'exercise_id' => $exercise->exercise_id,
            'lesson_id' => $lesson->lesson_id,
            'type' => $exercise->exercise_type,
            'enable_live_editor' => $exercise->enable_live_editor ?? false,
        ]);

        return redirect()
            ->route('admin.lessons.show', ['lesson' => $lesson->lesson_id])
            ->with('success', 'Exercise created successfully.');
    }

    public function showForLesson(Lesson $lesson, InteractiveExercise $exercise)
    {
        if ($exercise->lesson_id !== $lesson->lesson_id) {
            abort(404);
        }

        $exerciseArr = $exercise->toArray();
        $exerciseArr['exercise_id'] = $exercise->exercise_id;

        return Inertia::render('Admin/Exercises/Show', [
            'lesson' => [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
            ],
            'exercise' => $exerciseArr,
        ]);
    }

    public function editForLesson(Lesson $lesson, InteractiveExercise $exercise)
    {
        if ($exercise->lesson_id !== $lesson->lesson_id) {
            abort(404, 'Exercise does not belong to this lesson');
        }

        $exerciseArr = $exercise->toArray();
        $exerciseArr['exercise_id'] = $exercise->exercise_id;

        return Inertia::render('Admin/Exercises/Edit', [
            'lesson' => [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
            ],
            'exercise' => $exerciseArr,
        ]);
    }

    /**
     * ⭐ Update 嵌套路由 - 添加 Live Editor 支持
     */
    public function updateForLesson(Request $request, Lesson $lesson, InteractiveExercise $exercise): RedirectResponse
    {
        if ($exercise->lesson_id !== $lesson->lesson_id) {
            abort(404);
        }

        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'exercise_type' => 'required|string',
            'asset_url' => 'nullable|url',
            'max_score' => 'nullable|integer|min:0',
            'time_limit_sec' => 'nullable|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ];

        if (Schema::hasColumn('interactive_exercises', 'content')) {
            $rules['content'] = 'nullable';
        }
        if (Schema::hasColumn('interactive_exercises', 'difficulty')) {
            $rules['difficulty'] = 'nullable|string';
        }
        if (Schema::hasColumn('interactive_exercises', 'starter_code')) {
            $rules['starter_code'] = 'nullable|string';
        }
        if (Schema::hasColumn('interactive_exercises', 'solution')) {
            $rules['solution'] = 'nullable|string';
        }

        // ⭐ Live Editor 字段
        if (Schema::hasColumn('interactive_exercises', 'enable_live_editor')) {
            $rules['enable_live_editor'] = 'nullable|boolean';
        }
        if (Schema::hasColumn('interactive_exercises', 'coding_instructions')) {
            $rules['coding_instructions'] = 'nullable|string';
        }
        if (Schema::hasColumn('interactive_exercises', 'test_cases')) {
            $rules['test_cases'] = 'nullable|array';
        }

        $data = $request->validate($rules);

        if (isset($data['content']) && is_array($data['content'])) {
            $data['content'] = json_encode($data['content']);
        }

        $data['lesson_id'] = $lesson->lesson_id;

        $exercise->update($data);

        return redirect()
            ->route('admin.lessons.show', ['lesson' => $lesson->lesson_id])
            ->setStatusCode(303)
            ->with('success', 'Exercise updated successfully.');
    }

    public function destroyForLesson(Lesson $lesson, InteractiveExercise $exercise): RedirectResponse
    {
        if ($exercise->lesson_id !== $lesson->lesson_id) {
            abort(404, 'Exercise does not belong to this lesson');
        }
        $exercise->delete();

        return redirect()
            ->route('admin.lessons.exercises.index', ['lesson' => $lesson->lesson_id])
            ->setStatusCode(303)
            ->with('success', 'Exercise deleted successfully.');
    }
}
