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
        // 若路由中有 lesson model，这里会取得 model（route model binding）
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

        $data = $request->validate($rules);

        if (isset($data['content']) && is_array($data['content'])) {
            $data['content'] = json_encode($data['content']);
        }

        if (Schema::hasColumn('interactive_exercises', 'created_by')) {
            $data['created_by'] = $request->user()->getKey();
        }

        $exercise = InteractiveExercise::create($data);

        // 若你想要在非嵌套创建后跳回该 lesson 的 exercises 页，可用下面这种逻辑：
        // return redirect()->route('admin.lessons.exercises.index', ['lesson' => $data['lesson_id']]);

        return redirect()
            ->route('admin.exercises.index')
            ->with('success', 'Exercise created.');
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

        $data = $request->validate($rules);

        if (isset($data['content']) && is_array($data['content'])) {
            $data['content'] = json_encode($data['content']);
        }

        $exercise->update($data);

        // 返回 303，告知客户端用 GET 去请求重定向目标，避免 PUT/PATCH 被重发或造成重定向环
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
            ->setStatusCode(303)
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

        $data = $request->validate($rules);

        if (isset($data['content']) && is_array($data['content'])) {
            $data['content'] = json_encode($data['content']);
        }

        $data['lesson_id'] = $lesson->lesson_id;
        if (Schema::hasColumn('interactive_exercises', 'created_by')) {
            $data['created_by'] = $request->user()->getKey();
        }

        InteractiveExercise::create($data);

        return redirect()
            ->route('admin.lessons.exercises.index', ['lesson' => $lesson->lesson_id])
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

        $data = $request->validate($rules);

        if (isset($data['content']) && is_array($data['content'])) {
            $data['content'] = json_encode($data['content']);
        }

        // 保持 lesson_id 不变（安全）
        $data['lesson_id'] = $lesson->lesson_id;

        $exercise->update($data);

        // 重定向到嵌套的 show（或你偏好到 index），这里我重定向到嵌套 show
        return redirect()
            ->route('admin.lessons.exercises.show', ['lesson' => $lesson->lesson_id, 'exercise' => $exercise->exercise_id])
            ->setStatusCode(303)
            ->with('success', 'Exercise updated successfully.');
    }

    public function destroyForLesson(Lesson $lesson, InteractiveExercise $exercise): RedirectResponse
    {
        // 确保该 exercise 属于传入的 lesson，防止越权删除或错误的组合路由触发
        if ($exercise->lesson_id !== $lesson->lesson_id) {
            abort(404, 'Exercise does not belong to this lesson');
        }
        $exercise->delete();

        // 使用 303，告知客户端用 GET 去请求重定向页面，避免把 DELETE 重复提交
        return redirect()
            ->route('admin.lessons.exercises.index', ['lesson' => $lesson->lesson_id])
            ->setStatusCode(303)
            ->with('success', 'Exercise deleted successfully.');
    }
}
