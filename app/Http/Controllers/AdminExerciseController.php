<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExerciseRequest;
use App\Http\Requests\UpdateExerciseRequest;
use App\Models\InteractiveExercise;
use App\Models\Lesson;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminExerciseController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:administrator']);
    }

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
            'lessons'   => $lessons,
            'filters'   => $request->only(['q', 'lesson_id']),
        ]);
    }

    public function create(Request $request)
    {
        $lessons = Lesson::orderBy('title')->get();
        $routeLesson = $request->route('lesson');

        return Inertia::render('Admin/Exercises/Create', [
            'lessons'          => $lessons,
            'selectedLessonId' => $request->input('lesson_id'),
            'lesson'           => $routeLesson ? [
                'lesson_id' => $routeLesson->lesson_id,
                'title'     => $routeLesson->title,
            ] : null,
        ]);
    }

    public function store(StoreExerciseRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()->getKey();

        $exercise = InteractiveExercise::create($data);

        Log::info('Exercise created', [
            'exercise_id'       => $exercise->exercise_id,
            'type'              => $exercise->exercise_type,
            'enable_live_editor' => $exercise->enable_live_editor ?? false,
            'test_cases_count'  => is_array($exercise->test_cases) ? count($exercise->test_cases) : 0,
        ]);

        return redirect()
            ->route('admin.exercises.index')
            ->with('success', 'Exercise created successfully!');
    }

    public function show(InteractiveExercise $exercise)
    {
        $exercise->load(['lesson', 'creator']);
        $exerciseArr = $exercise->toArray();
        $exerciseArr['exercise_id'] = $exercise->exercise_id;

        return Inertia::render('Admin/Exercises/Show', [
            'exercise' => $exerciseArr,
            'lesson'   => $exercise->lesson ? [
                'lesson_id' => $exercise->lesson->lesson_id,
                'title'     => $exercise->lesson->title,
            ] : null,
        ]);
    }

    public function edit(InteractiveExercise $exercise)
    {
        $exercise->load('lesson');
        $exerciseArr = $exercise->toArray();
        $exerciseArr['exercise_id'] = $exercise->exercise_id;

        return Inertia::render('Admin/Exercises/Edit', [
            'exercise' => $exerciseArr,
            'lesson'   => $exercise->lesson ? [
                'lesson_id' => $exercise->lesson->lesson_id,
                'title'     => $exercise->lesson->title,
            ] : null,
        ]);
    }

    public function update(UpdateExerciseRequest $request, InteractiveExercise $exercise): RedirectResponse
    {
        $exercise->update($request->validated());

        return redirect()
            ->route('admin.exercises.show', ['exercise' => $exercise->exercise_id])
            ->with('success', 'Exercise updated.')
            ->setStatusCode(303);
    }

    public function destroy(InteractiveExercise $exercise): RedirectResponse
    {
        $exercise->delete();

        return redirect()
            ->route('admin.exercises.index')
            ->with('success', 'Exercise deleted.');
    }

    /* -------------------- 嵌套路由：lesson 下的 exercises -------------------- */

    public function indexForLesson(Lesson $lesson, Request $request)
    {
        $query = InteractiveExercise::where('lesson_id', $lesson->lesson_id)
            ->orderBy('created_at', 'desc');

        if ($q = $request->input('q')) {
            $query->where('title', 'like', '%' . addcslashes($q, '%_') . '%');
        }

        $exercises = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Exercises/Index', [
            'lesson'    => ['lesson_id' => $lesson->lesson_id, 'title' => $lesson->title],
            'exercises' => $exercises,
            'filters'   => $request->only('q'),
        ]);
    }

    public function createForLesson(Lesson $lesson)
    {
        return Inertia::render('Admin/Exercises/Create', [
            'lesson' => ['lesson_id' => $lesson->lesson_id, 'title' => $lesson->title],
        ]);
    }

    public function storeForLesson(StoreExerciseRequest $request, Lesson $lesson): RedirectResponse
    {
        $data = $request->validated();
        $data['lesson_id']  = $lesson->lesson_id;
        $data['created_by'] = $request->user()->getKey();

        $exercise = InteractiveExercise::create($data);

        Log::info('Exercise created (nested)', [
            'exercise_id'        => $exercise->exercise_id,
            'lesson_id'          => $lesson->lesson_id,
            'type'               => $exercise->exercise_type,
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
            'lesson'   => ['lesson_id' => $lesson->lesson_id, 'title' => $lesson->title],
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
            'lesson'   => ['lesson_id' => $lesson->lesson_id, 'title' => $lesson->title],
            'exercise' => $exerciseArr,
        ]);
    }

    public function updateForLesson(UpdateExerciseRequest $request, Lesson $lesson, InteractiveExercise $exercise): RedirectResponse
    {
        if ($exercise->lesson_id !== $lesson->lesson_id) {
            abort(404);
        }

        $data = $request->validated();
        $data['lesson_id'] = $lesson->lesson_id;
        $exercise->update($data);

        return redirect()
            ->route('admin.lessons.show', ['lesson' => $lesson->lesson_id])
            ->with('success', 'Exercise updated successfully.')
            ->setStatusCode(303);
    }

    public function destroyForLesson(Lesson $lesson, InteractiveExercise $exercise): RedirectResponse
    {
        if ($exercise->lesson_id !== $lesson->lesson_id) {
            abort(404, 'Exercise does not belong to this lesson');
        }

        $exercise->delete();

        return redirect()
            ->route('admin.lessons.exercises.index', ['lesson' => $lesson->lesson_id])
            ->with('success', 'Exercise deleted successfully.');
    }
}
