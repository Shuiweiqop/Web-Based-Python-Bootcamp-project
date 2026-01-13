<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Lesson;
use App\Models\Test;

class AdminTestController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:administrator']);
    }

    // GET admin/lessons/{lesson}/tests
    public function indexForLesson(Lesson $lesson, Request $request)
    {
        $query = Test::with(['questions'])
            ->where('lesson_id', $lesson->lesson_id)
            ->orderBy('order');

        // Search filters
        if ($q = $request->input('q')) {
            $query->where('title', 'like', "%{$q}%");
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $tests = $query->paginate(10)->withQueryString();

        // Add computed fields to each test
        $tests->getCollection()->transform(function ($test) {
            return [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'description' => $test->description,
                'status' => $test->status,
                'order' => $test->order,
                'time_limit' => $test->time_limit,
                'passing_score' => $test->passing_score,
                'max_attempts' => $test->max_attempts,
                'questions_count' => $test->questions->count(),
                'total_points' => $test->total_points,
                'created_at' => $test->created_at,
                'updated_at' => $test->updated_at,
            ];
        });

        return Inertia::render('Admin/Tests/Index', [
            'lesson' => [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
            ],
            'tests' => $tests,
            'filters' => $request->only(['q', 'status']),
            'statusOptions' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
                'draft' => 'Draft',
            ],
        ]);
    }

    // GET admin/lessons/{lesson}/tests/create
    public function createForLesson(Lesson $lesson)
    {
        return Inertia::render('Admin/Tests/Create', [
            'lesson' => [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
            ],
            'statusOptions' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
                'draft' => 'Draft',
            ],
        ]);
    }

    // POST admin/lessons/{lesson}/tests
    public function storeForLesson(Request $request, Lesson $lesson)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'instructions' => 'nullable|string|max:2000',
            'time_limit' => 'nullable|integer|min:1|max:999',
            'max_attempts' => 'nullable|integer|min:1|max:10',
            'passing_score' => 'nullable|integer|min:1|max:100',
            'shuffle_questions' => 'boolean',
            'show_results_immediately' => 'boolean',
            'allow_review' => 'boolean',
            'status' => 'nullable|in:active,inactive,draft',
            'order' => 'nullable|integer|min:0',
        ]);

        // Set defaults
        $data['lesson_id'] = $lesson->lesson_id;
        $data['test_type'] = 'lesson'; // ✅ 添加这一行
        $data['max_attempts'] = $data['max_attempts'] ?? 3;
        $data['passing_score'] = $data['passing_score'] ?? 70;
        $data['shuffle_questions'] = $request->boolean('shuffle_questions');
        $data['show_results_immediately'] = $request->boolean('show_results_immediately', true);
        $data['allow_review'] = $request->boolean('allow_review', true);
        $data['status'] = $data['status'] ?? 'draft';
        $data['order'] = $data['order'] ?? $this->getNextOrder($lesson->lesson_id);

        $test = Test::create($data);

        return redirect()->route('admin.lessons.tests.show', [
            'lesson' => $lesson->lesson_id,
            'test' => $test->test_id
        ])
            ->with('success', 'Test created successfully. Now add questions to complete the test.');
    }

    // GET admin/lessons/{lesson}/tests/{test}
    public function showForLesson(Lesson $lesson, Test $test)
    {
        if ($test->lesson_id !== $lesson->lesson_id) {
            abort(404);
        }

        $test->load(['questions.options', 'submissions']);

        // Transform questions data
        $questionsData = $test->questions->map(function ($question) {
            return [
                'question_id' => $question->question_id,
                'type' => $question->type,
                'type_name' => $question->type_name,
                'question_text' => $question->question_text,
                'points' => $question->points,
                'difficulty_level' => $question->difficulty_level,
                'difficulty_name' => $question->difficulty_name,
                'order' => $question->order,
                'status' => $question->status,
                'options_count' => $question->options->count(),
                'created_at' => $question->created_at,
            ];
        });

        // Get submission statistics
        $submissionStats = [
            'total_attempts' => $test->submissions()->count(),
            'completed' => $test->submissions()->whereIn('status', ['submitted', 'timeout'])->count(),
            'in_progress' => $test->submissions()->where('status', 'in_progress')->count(),
            'average_score' => round($test->submissions()
                ->whereIn('status', ['submitted', 'timeout'])
                ->avg('score') ?? 0, 2),
        ];

        return Inertia::render('Admin/Tests/Show', [
            'lesson' => [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title
            ],
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'description' => $test->description,
                'instructions' => $test->instructions,
                'time_limit' => $test->time_limit,
                'max_attempts' => $test->max_attempts,
                'passing_score' => $test->passing_score,
                'shuffle_questions' => $test->shuffle_questions,
                'show_results_immediately' => $test->show_results_immediately,
                'allow_review' => $test->allow_review,
                'status' => $test->status,
                'order' => $test->order,
                'questions_count' => $test->questions_count,
                'total_points' => $test->total_points,
                'created_at' => $test->created_at,
                'updated_at' => $test->updated_at,
            ],
            'questions' => $questionsData,
            'submissionStats' => $submissionStats,
        ]);
    }

    // GET admin/lessons/{lesson}/tests/{test}/edit
    public function editForLesson(Lesson $lesson, Test $test)
    {
        if ($test->lesson_id !== $lesson->lesson_id) {
            abort(404);
        }

        return Inertia::render('Admin/Tests/Edit', [
            'lesson' => [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title
            ],
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'description' => $test->description,
                'instructions' => $test->instructions,
                'time_limit' => $test->time_limit,
                'max_attempts' => $test->max_attempts,
                'passing_score' => $test->passing_score,
                'shuffle_questions' => $test->shuffle_questions,
                'show_results_immediately' => $test->show_results_immediately,
                'allow_review' => $test->allow_review,
                'status' => $test->status,
                'order' => $test->order,
            ],
            'statusOptions' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
                'draft' => 'Draft',
            ],
        ]);
    }

    // PUT admin/lessons/{lesson}/tests/{test}
    // app/Http/Controllers/AdminTestController.php

    public function updateForLesson(Request $request, Lesson $lesson, Test $test)
    {
        if ($test->lesson_id !== $lesson->lesson_id) {
            abort(404);
        }

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'instructions' => 'nullable|string|max:2000',
            'time_limit' => 'nullable|integer|min:1|max:999',
            'max_attempts' => 'nullable|integer|min:1|max:10',
            'passing_score' => 'nullable|integer|min:1|max:100',
            'shuffle_questions' => 'boolean',
            'show_results_immediately' => 'boolean',
            'allow_review' => 'boolean',
            'status' => 'nullable|in:active,inactive,draft',
            'order' => 'nullable|integer|min:0',
        ]);

        $data['shuffle_questions'] = $request->boolean('shuffle_questions');
        $data['show_results_immediately'] = $request->boolean('show_results_immediately');
        $data['allow_review'] = $request->boolean('allow_review');

        $test->update($data);

        // 使用 Inertia::location 或者 back()
        return redirect()->route('admin.lessons.tests.show', [
            'lesson' => $lesson->lesson_id,
            'test' => $test->test_id,
        ])->setStatusCode(303)->with('success', 'Test updated successfully.');
    }

    // DELETE admin/lessons/{lesson}/tests/{test}
    public function destroyForLesson(Lesson $lesson, Test $test)
    {
        if ($test->lesson_id !== $lesson->lesson_id) {
            abort(404);
        }

        // Check if test has any submissions
        if ($test->submissions()->exists()) {
            return back()->withErrors([
                'error' => 'Cannot delete test that has student submissions. Please archive it instead.'
            ]);
        }

        $test->delete();

        return redirect()->route('admin.lessons.tests.index', ['lesson' => $lesson->lesson_id])
            ->setStatusCode(303)
            ->with('success', 'Test deleted successfully.');
    }

    // Helper method to get the next order number for tests in a lesson
    private function getNextOrder($lessonId)
    {
        $maxOrder = Test::where('lesson_id', $lessonId)->max('order');
        return ($maxOrder ?? 0) + 1;
    }

    // Bulk actions
    public function bulkUpdate(Request $request, Lesson $lesson)
    {
        $request->validate([
            'test_ids' => 'required|array',
            'test_ids.*' => 'exists:tests,test_id',
            'action' => 'required|in:activate,deactivate,delete',
        ]);

        $testIds = $request->input('test_ids');
        $action = $request->input('action');

        // Ensure all tests belong to the lesson
        $tests = Test::whereIn('test_id', $testIds)
            ->where('lesson_id', $lesson->lesson_id)
            ->get();

        if ($tests->count() !== count($testIds)) {
            return back()->withErrors(['error' => 'Some tests do not belong to this lesson.']);
        }

        // Check for submissions if deleting
        if ($action === 'delete') {
            $testsWithSubmissions = $tests->filter(function ($test) {
                return $test->submissions()->exists();
            });

            if ($testsWithSubmissions->isNotEmpty()) {
                $titles = $testsWithSubmissions->pluck('title')->implode(', ');
                return back()->withErrors([
                    'error' => "Cannot delete tests with submissions: {$titles}. Please set them as inactive instead."
                ]);
            }
        }

        switch ($action) {
            case 'activate':
                Test::whereIn('test_id', $testIds)->update(['status' => 'active']);
                $message = 'Tests activated successfully.';
                break;
            case 'deactivate':
                Test::whereIn('test_id', $testIds)->update(['status' => 'inactive']);
                $message = 'Tests deactivated successfully.';
                break;
            case 'delete':
                Test::whereIn('test_id', $testIds)->delete();
                $message = 'Tests deleted successfully.';
                break;
        }

        return redirect()->route('admin.lessons.tests.index', ['lesson' => $lesson->lesson_id])
            ->with('success', $message);
    }

    // Reorder tests
    public function reorder(Request $request, Lesson $lesson)
    {
        $request->validate([
            'tests' => 'required|array',
            'tests.*.test_id' => 'required|exists:tests,test_id',
            'tests.*.order' => 'required|integer|min:0',
        ]);

        foreach ($request->input('tests') as $testData) {
            Test::where('test_id', $testData['test_id'])
                ->where('lesson_id', $lesson->lesson_id)
                ->update(['order' => $testData['order']]);
        }

        return response()->json(['success' => true, 'message' => 'Tests reordered successfully.']);
    }

    // Duplicate test
    public function duplicate(Lesson $lesson, Test $test)
    {
        if ($test->lesson_id !== $lesson->lesson_id) {
            abort(404);
        }

        // Create new test
        $newTest = $test->replicate();
        $newTest->title = $test->title . ' (Copy)';
        $newTest->status = 'draft';
        $newTest->order = $this->getNextOrder($lesson->lesson_id);
        $newTest->save();

        // Copy all questions and their options
        foreach ($test->questions as $question) {
            $newQuestion = $question->replicate();
            $newQuestion->test_id = $newTest->test_id;
            $newQuestion->save();

            // Copy options for MCQ questions
            if ($question->type === 'mcq') {
                foreach ($question->options as $option) {
                    $newOption = $option->replicate();
                    $newOption->question_id = $newQuestion->question_id;
                    $newOption->save();
                }
            }
        }

        return redirect()->route('admin.lessons.tests.show', [
            'lesson' => $lesson->lesson_id,
            'test' => $newTest->test_id
        ])
            ->with('success', 'Test duplicated successfully. You can now modify the copy.');
    }

    // Preview test (as student would see it)
    public function preview(Lesson $lesson, Test $test)
    {
        if ($test->lesson_id !== $lesson->lesson_id) {
            abort(404);
        }

        $test->load(['questions.options']);

        return Inertia::render('Admin/Tests/Preview', [
            'lesson' => [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title
            ],
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'description' => $test->description,
                'instructions' => $test->instructions,
                'time_limit' => $test->time_limit,
                'questions_count' => $test->questions_count,
                'total_points' => $test->total_points,
            ],
            'questions' => $test->questions->map(function ($question) {
                return [
                    'question_id' => $question->question_id,
                    'type' => $question->type,
                    'question_text' => $question->question_text,
                    'code_snippet' => $question->code_snippet,
                    'points' => $question->points,
                    'options' => $question->options->map(function ($option) {
                        return [
                            'option_id' => $option->option_id,
                            'option_label' => $option->option_label,
                            'option_text' => $option->option_text,
                        ];
                    }),
                ];
            }),
        ]);
    }
}
