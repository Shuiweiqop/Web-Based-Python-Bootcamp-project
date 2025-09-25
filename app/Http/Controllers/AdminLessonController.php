<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminLessonController extends Controller
{
    public function index(Request $request)
    {
        $query = Lesson::with(['creator', 'exercises', 'tests'])->orderBy('created_at', 'desc');

        if ($q = $request->input('q')) {
            $query->where('title', 'like', "%{$q}%");
        }

        $lessons = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Lessons/Index', [
            'lessons' => $lessons,
            'filters' => $request->only('q'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Lessons/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'difficulty' => 'required|string|in:beginner,intermediate,advanced',
            'duration' => 'nullable|integer|min:1|max:1440',
        ]);

        // Add the authenticated user as the creator
        $data['created_by'] = $request->user()->id;

        $lesson = Lesson::create($data);

        return redirect()
            ->route('admin.lessons.show', $lesson->lesson_id)
            ->with('success', 'Lesson created successfully! You can now add exercises and tests.');
    }

    public function show(Lesson $lesson)
    {
        $lesson->load(['creator', 'exercises', 'tests']);

        return Inertia::render('Admin/Lessons/Show', [
            'lesson' => $lesson,
            'exercisesCount' => $lesson->exercises->count(),
            'testsCount' => $lesson->tests->count()
        ]);
    }

    public function edit(Lesson $lesson)
    {
        return Inertia::render('Admin/Lessons/Edit', [
            'lesson' => $lesson
        ]);
    }

    public function update(Request $request, Lesson $lesson)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'difficulty' => 'required|string|in:beginner,intermediate,advanced',
            'duration' => 'nullable|integer|min:1|max:1440',
        ]);

        $lesson->update($data);

        return redirect()
            ->route('admin.lessons.show', $lesson->lesson_id)
            ->with('success', 'Lesson updated successfully.');
    }

    public function destroy(Lesson $lesson)
    {
        // This will cascade delete exercises and tests due to foreign key constraints
        $lesson->delete();

        return redirect()
            ->route('admin.lessons.index')
            ->setStatusCode(303)
            ->with('success', 'Lesson and all related content deleted successfully.');
    }
}
