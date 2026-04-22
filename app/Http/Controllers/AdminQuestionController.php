<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Lesson;
use App\Models\Test;
use App\Models\Question;
use App\Models\QuestionOption;
use Illuminate\Support\Facades\Log;

class AdminQuestionController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:administrator']);
    }

    // GET admin/lessons/{lesson}/tests/{test}/questions
    public function indexForTest(Lesson $lesson, Test $test, Request $request)
    {
        if ($test->lesson_id !== $lesson->lesson_id) {
            abort(404);
        }

        $query = Question::with(['options'])
            ->where('test_id', $test->test_id)
            ->orderBy('order');

        // Search filters
        if ($q = $request->input('q')) {
            $query->where('question_text', 'like', "%{$q}%");
        }

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($difficulty = $request->input('difficulty')) {
            $query->where('difficulty_level', $difficulty);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $questions = $query->paginate(15)->withQueryString();

        // Transform questions data
        $questions->getCollection()->transform(function ($question) {
            return [
                'question_id' => $question->question_id,
                'type' => $question->type,
                'type_name' => $question->type_name,
                'question_text' => substr($question->question_text, 0, 100) . (strlen($question->question_text) > 100 ? '...' : ''),
                'points' => $question->points,
                'difficulty_level' => $question->difficulty_level,
                'difficulty_name' => $question->difficulty_name,
                'order' => $question->order,
                'status' => $question->status,
                'options_count' => $question->options->count(),
                'created_at' => $question->created_at,
                'updated_at' => $question->updated_at,
            ];
        });

        return Inertia::render('Admin/Questions/Index', [
            'lesson' => [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
            ],
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'questions_count' => $test->questions_count,
                'total_points' => $test->total_points,
            ],
            'questions' => $questions,
            'filters' => $request->only(['q', 'type', 'difficulty', 'status']),
            'typeOptions' => Question::TYPES,
            'difficultyOptions' => [
                1 => 'Easy',
                2 => 'Medium',
                3 => 'Hard',
            ],
            'statusOptions' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
            ],
        ]);
    }

    // GET admin/lessons/{lesson}/tests/{test}/questions/create
    public function createForTest(Lesson $lesson, Test $test)
    {
        if ($test->lesson_id !== $lesson->lesson_id) {
            abort(404);
        }

        return Inertia::render('Admin/Questions/Create', [
            'lesson' => [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
            ],
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
            ],
            'typeOptions' => Question::TYPES,
            'difficultyOptions' => [
                1 => 'Easy',
                2 => 'Medium',
                3 => 'Hard',
            ],
            'statusOptions' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
            ],
        ]);
    }

    // POST admin/lessons/{lesson}/tests/{test}/questions
    public function storeForTest(Request $request, Lesson $lesson, Test $test)
    {
        if ($test->lesson_id !== $lesson->lesson_id) {
            abort(404);
        }

        // DEBUG: log incoming payload
        Log::debug('storeForTest payload', $request->all());

        // 为 MCQ 类型设置默认的 correct_answer
        if ($request->input('type') === Question::TYPE_MCQ) {
            $request->merge(['correct_answer' => 'See options below']);
        }

        // Normalize options (ensure boolean is_correct)
        if ($request->has('options')) {
            $normalized = collect($request->input('options'))->map(function ($opt) {
                $opt = array_merge(['label' => '', 'text' => '', 'is_correct' => false], (array) $opt);
                $isCorrect = $opt['is_correct'];
                if (is_string($isCorrect)) {
                    $isCorrect = in_array(strtolower($isCorrect), ['1', 'true', 'yes', 'on'], true);
                } else {
                    $isCorrect = (bool) $isCorrect;
                }
                $opt['is_correct'] = $isCorrect;
                return $opt;
            })->values()->all();

            $request->merge(['options' => $normalized]);
            Log::debug('Normalized options', $normalized);

            // 检查是否有正确答案被选中
            $hasCorrectOption = collect($normalized)->contains('is_correct', true);
            if (!$hasCorrectOption) {
                return back()->withErrors(['options' => 'At least one option must be marked as correct.']);
            }
        }

        $rules = [
            'type' => 'required|in:' . implode(',', array_keys(Question::TYPES)),
            'question_text' => 'required|string|max:2000',
            'code_snippet' => 'nullable|string|max:5000',
            'correct_answer' => 'required|string|max:5000',
            'explanation' => 'nullable|string|max:1000',
            'points' => 'nullable|integer|min:1|max:100',
            'difficulty_level' => 'nullable|integer|in:1,2,3',
            'order' => 'nullable|integer|min:0',
            'status' => 'nullable|in:active,inactive',
            'metadata' => 'nullable|array',
        ];

        if ($request->input('type') === Question::TYPE_MCQ) {
            $rules['options'] = 'required|array|min:2|max:6';
            $rules['options.*.text'] = 'required|string|max:500';
            $rules['options.*.label'] = 'required|string|max:5';
            $rules['options.*.is_correct'] = 'required|boolean';
        }

        $validated = $request->validate($rules);

        $data = $validated;
        $data['test_id'] = $test->test_id;
        $data['points'] = $data['points'] ?? 10;
        $data['difficulty_level'] = $data['difficulty_level'] ?? 1;
        $data['status'] = $data['status'] ?? 'active';
        $data['order'] = $data['order'] ?? $this->getNextOrder($test->test_id);

        DB::beginTransaction();
        try {
            $question = Question::create($data);
            Log::debug('Question created id: ' . $question->question_id, ['data' => $data]);

            if ($request->input('type') === Question::TYPE_MCQ) {
                foreach ($request->input('options', []) as $index => $optionData) {
                    $opt = QuestionOption::create([
                        'question_id' => $question->question_id,
                        'option_label' => $optionData['label'],
                        'option_text' => $optionData['text'],
                        'is_correct' => $optionData['is_correct'],
                        'order' => $index + 1,
                    ]);
                    Log::debug('QuestionOption created id: ' . $opt->option_id, ['option' => $optionData]);
                }
            }

            DB::commit();
            Log::debug('DB commit success for question id: ' . $question->question_id);

            return redirect()->route('admin.lessons.tests.questions.index', [
                'lesson' => $lesson->lesson_id,
                'test' => $test->test_id
            ])->with('success', 'Question created successfully.');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Failed to create question: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all()
            ]);
            return back()->withErrors(['error' => 'Failed to create question: ' . $e->getMessage()]);
        }
    }

    // GET admin/lessons/{lesson}/tests/{test}/questions/{question}/edit
    public function editForTest(Lesson $lesson, Test $test, Question $question)
    {
        if ($test->lesson_id !== $lesson->lesson_id || $question->test_id !== $test->test_id) {
            abort(404);
        }

        $question->load(['options']);

        $questionData = [
            'question_id' => $question->question_id,
            'type' => $question->type,
            'question_text' => $question->question_text,
            'code_snippet' => $question->code_snippet,
            'correct_answer' => $question->correct_answer,
            'explanation' => $question->explanation,
            'points' => $question->points,
            'difficulty_level' => $question->difficulty_level,
            'order' => $question->order,
            'status' => $question->status,
            'metadata' => $question->metadata,
            'options' => $question->options->map(function ($option) {
                return [
                    'option_id' => $option->option_id,
                    'option_label' => $option->option_label,
                    'option_text' => $option->option_text,
                    'is_correct' => $option->is_correct,
                    'order' => $option->order,
                ];
            }),
        ];

        return Inertia::render('Admin/Questions/Edit', [
            'lesson' => [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
            ],
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
            ],
            'question' => $questionData,
            'typeOptions' => Question::TYPES,
            'difficultyOptions' => [
                1 => 'Easy',
                2 => 'Medium',
                3 => 'Hard',
            ],
            'statusOptions' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
            ],
        ]);
    }

    // PUT admin/lessons/{lesson}/tests/{test}/questions/{question}
    public function updateForTest(Request $request, Lesson $lesson, Test $test, Question $question)
    {
        if ($test->lesson_id !== $lesson->lesson_id || $question->test_id !== $test->test_id) {
            abort(404);
        }

        $rules = [
            'type' => 'required|in:' . implode(',', array_keys(Question::TYPES)),
            'question_text' => 'required|string|max:2000',
            'code_snippet' => 'nullable|string|max:5000',
            'correct_answer' => 'required|string|max:5000',
            'explanation' => 'nullable|string|max:1000',
            'points' => 'nullable|integer|min:1|max:100',
            'difficulty_level' => 'nullable|integer|in:1,2,3',
            'order' => 'nullable|integer|min:0',
            'status' => 'nullable|in:active,inactive',
            'metadata' => 'nullable|array',
        ];

        // Add conditional validation for MCQ
        if ($request->input('type') === Question::TYPE_MCQ) {
            $rules['options'] = 'required|array|min:2|max:6';
            $rules['options.*.text'] = 'required|string|max:500';
            $rules['options.*.label'] = 'required|string|max:5';
            $rules['options.*.is_correct'] = 'required|boolean';

            // Validate that at least one option is correct
            $request->validate($rules);

            $options = $request->input('options', []);
            $hasCorrectOption = collect($options)->contains('is_correct', true);

            if (!$hasCorrectOption) {
                return back()->withErrors(['options' => 'At least one option must be marked as correct.']);
            }
        } else {
            $request->validate($rules);
        }

        $data = $request->only(array_keys($rules));

        DB::beginTransaction();
        try {
            // Update question
            $question->update($data);

            // Handle MCQ options
            if ($request->input('type') === Question::TYPE_MCQ) {
                // Delete existing options
                $question->options()->delete();

                // Create new options
                $options = $request->input('options', []);
                foreach ($options as $index => $optionData) {
                    QuestionOption::create([
                        'question_id' => $question->question_id,
                        'option_label' => $optionData['label'],
                        'option_text' => $optionData['text'],
                        'is_correct' => $optionData['is_correct'],
                        'order' => $index + 1,
                    ]);
                }
            } else {
                // If changing from MCQ to other type, delete options
                $question->options()->delete();
            }

            DB::commit();

            return redirect()->route('admin.lessons.tests.questions.index', [
                'lesson' => $lesson->lesson_id,
                'test' => $test->test_id
            ])->with('success', 'Question updated successfully.')
                ->setStatusCode(303);
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to update question. Please try again.']);
        }
    }

    // DELETE admin/lessons/{lesson}/tests/{test}/questions/{question}
    public function destroyForTest(Lesson $lesson, Test $test, Question $question)
    {
        if ($test->lesson_id !== $lesson->lesson_id || $question->test_id !== $test->test_id) {
            abort(404);
        }

        // Check if question has any submission answers
        if ($question->submissionAnswers()->exists()) {
            return back()->withErrors([
                'error' => 'Cannot delete question that has student answers. Please set it as inactive instead.'
            ]);
        }

        $question->delete();

        return redirect()->route('admin.lessons.tests.questions.index', [
            'lesson' => $lesson->lesson_id,
            'test' => $test->test_id
        ])
            ->setStatusCode(303)
            ->with('success', 'Question deleted successfully.');
    }

    // POST admin/lessons/{lesson}/tests/{test}/questions/bulk-update
    public function bulkUpdate(Request $request, Lesson $lesson, Test $test)
    {
        if ($test->lesson_id !== $lesson->lesson_id) {
            abort(404);
        }

        $request->validate([
            'question_ids' => 'required|array',
            'question_ids.*' => 'exists:questions,question_id',
            'action' => 'required|in:activate,deactivate,delete',
        ]);

        $questionIds = $request->input('question_ids');
        $action = $request->input('action');

        // Ensure all questions belong to this test
        $questions = Question::whereIn('question_id', $questionIds)
            ->where('test_id', $test->test_id)
            ->get();

        if ($questions->count() !== count($questionIds)) {
            return back()->withErrors(['error' => 'Some questions do not belong to this test.']);
        }

        // Check for submission answers if deleting
        if ($action === 'delete') {
            $questionsWithAnswers = $questions->filter(function ($question) {
                return $question->submissionAnswers()->exists();
            });

            if ($questionsWithAnswers->isNotEmpty()) {
                return back()->withErrors([
                    'error' => 'Cannot delete questions that have student answers. Please set them as inactive instead.'
                ]);
            }
        }

        switch ($action) {
            case 'activate':
                Question::whereIn('question_id', $questionIds)->update(['status' => 'active']);
                $message = 'Questions activated successfully.';
                break;
            case 'deactivate':
                Question::whereIn('question_id', $questionIds)->update(['status' => 'inactive']);
                $message = 'Questions deactivated successfully.';
                break;
            case 'delete':
                Question::whereIn('question_id', $questionIds)->delete();
                $message = 'Questions deleted successfully.';
                break;
        }

        return redirect()->route('admin.lessons.tests.questions.index', [
            'lesson' => $lesson->lesson_id,
            'test' => $test->test_id
        ])->with('success', $message);
    }

    // POST admin/lessons/{lesson}/tests/{test}/questions/reorder
    public function reorder(Request $request, Lesson $lesson, Test $test)
    {
        if ($test->lesson_id !== $lesson->lesson_id) {
            abort(404);
        }

        $request->validate([
            'questions' => 'required|array',
            'questions.*.question_id' => 'required|exists:questions,question_id',
            'questions.*.order' => 'required|integer|min:0',
        ]);

        foreach ($request->input('questions') as $questionData) {
            Question::where('question_id', $questionData['question_id'])
                ->where('test_id', $test->test_id)
                ->update(['order' => $questionData['order']]);
        }

        return response()->json(['success' => true, 'message' => 'Questions reordered successfully.']);
    }

    // POST admin/lessons/{lesson}/tests/{test}/questions/{question}/duplicate
    public function duplicate(Lesson $lesson, Test $test, Question $question)
    {
        if ($test->lesson_id !== $lesson->lesson_id || $question->test_id !== $test->test_id) {
            abort(404);
        }

        DB::beginTransaction();
        try {
            // Create duplicate question
            $newQuestion = $question->replicate();
            $newQuestion->question_text = $question->question_text . ' (Copy)';
            $newQuestion->order = $this->getNextOrder($test->test_id);
            $newQuestion->save();

            // Copy options for MCQ questions
            if ($question->type === Question::TYPE_MCQ) {
                foreach ($question->options as $option) {
                    $newOption = $option->replicate();
                    $newOption->question_id = $newQuestion->question_id;
                    $newOption->save();
                }
            }

            DB::commit();

            return redirect()->route('admin.lessons.tests.questions.show', [
                'lesson' => $lesson->lesson_id,
                'test' => $test->test_id,
                'question' => $newQuestion->question_id
            ])->with('success', 'Question duplicated successfully. You can now modify the copy.');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to duplicate question. Please try again.']);
        }
    }

    // Helper method to get the next order number for questions in a test
    private function getNextOrder($testId)
    {
        $maxOrder = Question::where('test_id', $testId)->max('order');
        return ($maxOrder ?? 0) + 1;
    }
    public function showForTest(Lesson $lesson, Test $test, Question $question)
    {
        if ($test->lesson_id !== $lesson->lesson_id || $question->test_id !== $test->test_id) {
            abort(404);
        }

        $question->load(['options']);

        $questionData = [
            'question_id' => $question->question_id,
            'type' => $question->type,
            'type_name' => $question->type_name,
            'question_text' => $question->question_text,
            'code_snippet' => $question->code_snippet,
            'correct_answer' => $question->correct_answer,
            'explanation' => $question->explanation,
            'points' => $question->points,
            'difficulty_level' => $question->difficulty_level,
            'difficulty_name' => $question->difficulty_name,
            'order' => $question->order,
            'status' => $question->status,
            'metadata' => $question->metadata,
            'created_at' => $question->created_at,
            'updated_at' => $question->updated_at,
            'options' => $question->options->map(function ($option) {
                return [
                    'option_id' => $option->option_id,
                    'option_label' => $option->option_label,
                    'option_text' => $option->option_text,
                    'is_correct' => $option->is_correct,
                    'order' => $option->order,
                ];
            }),
        ];

        return Inertia::render('Admin/Questions/Show', [
            'lesson' => [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
            ],
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
            ],
            'question' => $questionData,
        ]);
    }
    /**
     * Display questions for placement test (no lesson context)
     */
    public function indexForPlacementTest($testId, Request $request)
    {
        $test = Test::where('test_type', 'placement')->findOrFail($testId);

        $query = Question::with(['options'])
            ->where('test_id', $test->test_id)
            ->orderBy('order');

        // Search filters
        if ($q = $request->input('q')) {
            $query->where('question_text', 'like', "%{$q}%");
        }

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($difficulty = $request->input('difficulty')) {
            $query->where('difficulty_level', $difficulty);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $questions = $query->paginate(15)->withQueryString();

        // Transform questions data
        $questions->getCollection()->transform(function ($question) {
            return [
                'question_id' => $question->question_id,
                'type' => $question->type,
                'type_name' => $question->type_name,
                'question_text' => substr($question->question_text, 0, 100) . (strlen($question->question_text) > 100 ? '...' : ''),
                'points' => $question->points,
                'difficulty_level' => $question->difficulty_level,
                'difficulty_name' => $question->difficulty_name,
                'order' => $question->order,
                'status' => $question->status,
                'options_count' => $question->options->count(),
                'created_at' => $question->created_at,
                'updated_at' => $question->updated_at,
            ];
        });

        return Inertia::render('Admin/PlacementTest/Questions/Index', [
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'test_type' => $test->test_type,
                'questions_count' => $test->questions_count,
                'total_points' => $test->total_points,
            ],
            'questions' => $questions,
            'filters' => $request->only(['q', 'type', 'difficulty', 'status']),
            'typeOptions' => Question::TYPES,
            'difficultyOptions' => [
                1 => 'Easy',
                2 => 'Medium',
                3 => 'Hard',
            ],
            'statusOptions' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
            ],
        ]);
    }

    /**
     * Show create form for placement test question
     */
    public function createForPlacementTest($testId)
    {
        $test = Test::where('test_type', 'placement')->findOrFail($testId);

        return Inertia::render('Admin/PlacementTest/Questions/Create', [
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'test_type' => $test->test_type,
            ],
            'typeOptions' => Question::TYPES,
            'difficultyOptions' => [
                1 => 'Easy',
                2 => 'Medium',
                3 => 'Hard',
            ],
            'statusOptions' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
            ],
        ]);
    }

    /**
     * Store question for placement test
     */
    public function storeForPlacementTest(Request $request, $testId)
    {
        $test = Test::where('test_type', 'placement')->findOrFail($testId);

        Log::debug('storeForPlacementTest payload', $request->all());

        // 为 MCQ 类型设置默认的 correct_answer
        if ($request->input('type') === Question::TYPE_MCQ) {
            $request->merge(['correct_answer' => 'See options below']);
        }

        // Normalize options
        if ($request->has('options')) {
            $normalized = collect($request->input('options'))->map(function ($opt) {
                $opt = array_merge(['label' => '', 'text' => '', 'is_correct' => false], (array) $opt);
                $isCorrect = $opt['is_correct'];
                if (is_string($isCorrect)) {
                    $isCorrect = in_array(strtolower($isCorrect), ['1', 'true', 'yes', 'on'], true);
                } else {
                    $isCorrect = (bool) $isCorrect;
                }
                $opt['is_correct'] = $isCorrect;
                return $opt;
            })->values()->all();

            $request->merge(['options' => $normalized]);
            Log::debug('Normalized options', $normalized);

            $hasCorrectOption = collect($normalized)->contains('is_correct', true);
            if (!$hasCorrectOption) {
                return back()->withErrors(['options' => 'At least one option must be marked as correct.']);
            }
        }

        $rules = [
            'type' => 'required|in:' . implode(',', array_keys(Question::TYPES)),
            'question_text' => 'required|string|max:2000',
            'code_snippet' => 'nullable|string|max:5000',
            'correct_answer' => 'required|string|max:5000',
            'explanation' => 'nullable|string|max:1000',
            'points' => 'nullable|integer|min:1|max:100',
            'difficulty_level' => 'nullable|integer|in:1,2,3',
            'order' => 'nullable|integer|min:0',
            'status' => 'nullable|in:active,inactive',
            'metadata' => 'nullable|array',
        ];

        if ($request->input('type') === Question::TYPE_MCQ) {
            $rules['options'] = 'required|array|min:2|max:6';
            $rules['options.*.text'] = 'required|string|max:500';
            $rules['options.*.label'] = 'required|string|max:5';
            $rules['options.*.is_correct'] = 'required|boolean';
        }

        $validated = $request->validate($rules);

        $data = $validated;
        $data['test_id'] = $test->test_id;
        $data['points'] = $data['points'] ?? 10;
        $data['difficulty_level'] = $data['difficulty_level'] ?? 1;
        $data['status'] = $data['status'] ?? 'active';
        $data['order'] = $data['order'] ?? $this->getNextOrder($test->test_id);

        DB::beginTransaction();
        try {
            $question = Question::create($data);
            Log::debug('Question created id: ' . $question->question_id, ['data' => $data]);

            if ($request->input('type') === Question::TYPE_MCQ) {
                foreach ($request->input('options', []) as $index => $optionData) {
                    $opt = QuestionOption::create([
                        'question_id' => $question->question_id,
                        'option_label' => $optionData['label'],
                        'option_text' => $optionData['text'],
                        'is_correct' => $optionData['is_correct'],
                        'order' => $index + 1,
                    ]);
                    Log::debug('QuestionOption created id: ' . $opt->option_id, ['option' => $optionData]);
                }
            }

            DB::commit();
            Log::debug('DB commit success for question id: ' . $question->question_id);

            return redirect()->route('admin.placement-tests.questions.index', $test->test_id)
                ->with('success', 'Question created successfully.');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Failed to create question: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all()
            ]);
            return back()->withErrors(['error' => 'Failed to create question: ' . $e->getMessage()]);
        }
    }

    /**
     * Show edit form for placement test question
     */
    public function editForPlacementTest($testId, $questionId)
    {
        $test = Test::where('test_type', 'placement')->findOrFail($testId);
        $question = Question::where('test_id', $test->test_id)->findOrFail($questionId);
        $question->load(['options']);

        $questionData = [
            'question_id' => $question->question_id,
            'type' => $question->type,
            'question_text' => $question->question_text,
            'code_snippet' => $question->code_snippet,
            'correct_answer' => $question->correct_answer,
            'explanation' => $question->explanation,
            'points' => $question->points,
            'difficulty_level' => $question->difficulty_level,
            'order' => $question->order,
            'status' => $question->status,
            'metadata' => $question->metadata,
            'options' => $question->options->map(function ($option) {
                return [
                    'option_id' => $option->option_id,
                    'option_label' => $option->option_label,
                    'option_text' => $option->option_text,
                    'is_correct' => $option->is_correct,
                    'order' => $option->order,
                ];
            }),
        ];

        return Inertia::render('Admin/PlacementTest/Questions/Edit', [
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'test_type' => $test->test_type,
            ],
            'question' => $questionData,
            'typeOptions' => Question::TYPES,
            'difficultyOptions' => [
                1 => 'Easy',
                2 => 'Medium',
                3 => 'Hard',
            ],
            'statusOptions' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
            ],
        ]);
    }

    /**
     * Update placement test question
     */
    public function updateForPlacementTest(Request $request, $testId, $questionId)
    {
        $test = Test::where('test_type', 'placement')->findOrFail($testId);
        $question = Question::where('test_id', $test->test_id)->findOrFail($questionId);

        $rules = [
            'type' => 'required|in:' . implode(',', array_keys(Question::TYPES)),
            'question_text' => 'required|string|max:2000',
            'code_snippet' => 'nullable|string|max:5000',
            'correct_answer' => 'required|string|max:5000',
            'explanation' => 'nullable|string|max:1000',
            'points' => 'nullable|integer|min:1|max:100',
            'difficulty_level' => 'nullable|integer|in:1,2,3',
            'order' => 'nullable|integer|min:0',
            'status' => 'nullable|in:active,inactive',
            'metadata' => 'nullable|array',
        ];

        if ($request->input('type') === Question::TYPE_MCQ) {
            $rules['options'] = 'required|array|min:2|max:6';
            $rules['options.*.text'] = 'required|string|max:500';
            $rules['options.*.label'] = 'required|string|max:5';
            $rules['options.*.is_correct'] = 'required|boolean';

            $request->validate($rules);

            $options = $request->input('options', []);
            $hasCorrectOption = collect($options)->contains('is_correct', true);

            if (!$hasCorrectOption) {
                return back()->withErrors(['options' => 'At least one option must be marked as correct.']);
            }
        } else {
            $request->validate($rules);
        }

        $data = $request->only(array_keys($rules));

        DB::beginTransaction();
        try {
            $question->update($data);

            if ($request->input('type') === Question::TYPE_MCQ) {
                $question->options()->delete();

                $options = $request->input('options', []);
                foreach ($options as $index => $optionData) {
                    QuestionOption::create([
                        'question_id' => $question->question_id,
                        'option_label' => $optionData['label'],
                        'option_text' => $optionData['text'],
                        'is_correct' => $optionData['is_correct'],
                        'order' => $index + 1,
                    ]);
                }
            } else {
                $question->options()->delete();
            }

            DB::commit();

            return redirect()->route('admin.placement-tests.questions.index', $test->test_id)
                ->with('success', 'Question updated successfully.')
                ->setStatusCode(303);
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to update question. Please try again.']);
        }
    }

    /**
     * Delete placement test question
     */
    public function destroyForPlacementTest($testId, $questionId)
    {
        $test = Test::where('test_type', 'placement')->findOrFail($testId);
        $question = Question::where('test_id', $test->test_id)->findOrFail($questionId);

        if ($question->submissionAnswers()->exists()) {
            return back()->withErrors([
                'error' => 'Cannot delete question that has student answers. Please set it as inactive instead.'
            ]);
        }

        $question->delete();

        return redirect()->route('admin.placement-tests.questions.index', $test->test_id)
            ->setStatusCode(303)
            ->with('success', 'Question deleted successfully.');
    }

    /**
     * Show placement test question details
     */
    public function showForPlacementTest($testId, $questionId)
    {
        $test = Test::where('test_type', 'placement')->findOrFail($testId);
        $question = Question::where('test_id', $test->test_id)->findOrFail($questionId);
        $question->load(['options']);

        $questionData = [
            'question_id' => $question->question_id,
            'type' => $question->type,
            'type_name' => $question->type_name,
            'question_text' => $question->question_text,
            'code_snippet' => $question->code_snippet,
            'correct_answer' => $question->correct_answer,
            'explanation' => $question->explanation,
            'points' => $question->points,
            'difficulty_level' => $question->difficulty_level,
            'difficulty_name' => $question->difficulty_name,
            'order' => $question->order,
            'status' => $question->status,
            'metadata' => $question->metadata,
            'created_at' => $question->created_at,
            'updated_at' => $question->updated_at,
            'options' => $question->options->map(function ($option) {
                return [
                    'option_id' => $option->option_id,
                    'option_label' => $option->option_label,
                    'option_text' => $option->option_text,
                    'is_correct' => $option->is_correct,
                    'order' => $option->order,
                ];
            }),
        ];

        return Inertia::render('Admin/PlacementTest/Questions/Show', [
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'test_type' => $test->test_type,
            ],
            'question' => $questionData,
        ]);
    }

    // Bulk operations and reorder methods...
    public function bulkUpdateForPlacementTest(Request $request, $testId)
    {
        $test = Test::where('test_type', 'placement')->findOrFail($testId);

        $request->validate([
            'question_ids' => 'required|array',
            'question_ids.*' => 'exists:questions,question_id',
            'action' => 'required|in:activate,deactivate,delete',
        ]);

        $questionIds = $request->input('question_ids');
        $action = $request->input('action');

        $questions = Question::whereIn('question_id', $questionIds)
            ->where('test_id', $test->test_id)
            ->get();

        if ($questions->count() !== count($questionIds)) {
            return back()->withErrors(['error' => 'Some questions do not belong to this test.']);
        }

        if ($action === 'delete') {
            $questionsWithAnswers = $questions->filter(function ($question) {
                return $question->submissionAnswers()->exists();
            });

            if ($questionsWithAnswers->isNotEmpty()) {
                return back()->withErrors([
                    'error' => 'Cannot delete questions that have student answers.'
                ]);
            }
        }

        switch ($action) {
            case 'activate':
                Question::whereIn('question_id', $questionIds)->update(['status' => 'active']);
                $message = 'Questions activated successfully.';
                break;
            case 'deactivate':
                Question::whereIn('question_id', $questionIds)->update(['status' => 'inactive']);
                $message = 'Questions deactivated successfully.';
                break;
            case 'delete':
                Question::whereIn('question_id', $questionIds)->delete();
                $message = 'Questions deleted successfully.';
                break;
        }

        return redirect()->route('admin.placement-tests.questions.index', $test->test_id)
            ->with('success', $message);
    }

    public function reorderForPlacementTest(Request $request, $testId)
    {
        $test = Test::where('test_type', 'placement')->findOrFail($testId);

        $request->validate([
            'questions' => 'required|array',
            'questions.*.question_id' => 'required|exists:questions,question_id',
            'questions.*.order' => 'required|integer|min:0',
        ]);

        foreach ($request->input('questions') as $questionData) {
            Question::where('question_id', $questionData['question_id'])
                ->where('test_id', $test->test_id)
                ->update(['order' => $questionData['order']]);
        }

        return response()->json(['success' => true, 'message' => 'Questions reordered successfully.']);
    }

    public function duplicateForPlacementTest($testId, $questionId)
    {
        $test = Test::where('test_type', 'placement')->findOrFail($testId);
        $question = Question::where('test_id', $test->test_id)->findOrFail($questionId);

        DB::beginTransaction();
        try {
            $newQuestion = $question->replicate();
            $newQuestion->question_text = $question->question_text . ' (Copy)';
            $newQuestion->order = $this->getNextOrder($test->test_id);
            $newQuestion->save();

            if ($question->type === Question::TYPE_MCQ) {
                foreach ($question->options as $option) {
                    $newOption = $option->replicate();
                    $newOption->question_id = $newQuestion->question_id;
                    $newOption->save();
                }
            }

            DB::commit();

            return redirect()->route('admin.placement-tests.questions.show', [
                'testId' => $test->test_id,
                'question' => $newQuestion->question_id
            ])->with('success', 'Question duplicated successfully.');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to duplicate question.']);
        }
    }
}
