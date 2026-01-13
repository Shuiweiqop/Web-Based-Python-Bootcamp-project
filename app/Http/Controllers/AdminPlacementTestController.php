<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PlacementTest;  // 使用专门的模型
use Illuminate\Support\Facades\DB;

class AdminPlacementTestController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:administrator']);
    }

    /**
     * 列出所有 Placement Tests
     */
    public function index(Request $request)
    {
        $query = PlacementTest::with(['questions'])
            ->orderBy('created_at', 'desc');

        // 搜索过滤
        if ($q = $request->input('q')) {
            $query->where('title', 'like', "%{$q}%");
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $tests = $query->paginate(10)->withQueryString();

        // 计算统计数据
        $allPlacementTests = PlacementTest::withoutGlobalScopes()->where('test_type', 'placement');
        $stats = [
            'total_placement_tests' => $allPlacementTests->count(),
            'active_tests' => $allPlacementTests->clone()->where('status', 'active')->count(),
            'total_submissions' => \App\Models\TestSubmission::whereIn(
                'test_id',
                $allPlacementTests->pluck('test_id')
            )->whereIn('status', ['submitted', 'timeout'])->count(),
            'default_test_id' => config('recommendation.default_placement_test_id'),
        ];

        // 转换数据
        $tests->getCollection()->transform(function ($test) {
            $testStats = $test->getPlacementTestStats();

            return [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'description' => $test->description,
                'status' => $test->status,
                'time_limit' => $test->time_limit,
                'questions_count' => $test->questions->count(),
                'total_points' => $test->total_points,
                'total_submissions' => $test->submissions()->count(),
                'average_score' => $testStats['average_score'] ?? 0,
                'is_default' => config('recommendation.default_placement_test_id') === $test->test_id,
                'created_at' => $test->created_at->format('M d, Y'),
                'updated_at' => $test->updated_at->format('M d, Y'),
                'stats' => $testStats,
            ];
        });

        return Inertia::render('Admin/PlacementTest/Index', [
            'tests' => $tests,
            'stats' => $stats,
            'filters' => $request->only(['q', 'status']),
            'statusOptions' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
                'draft' => 'Draft',
            ],
        ]);
    }

    /**
     * 显示创建表单
     */
    public function create()
    {
        return Inertia::render('Admin/PlacementTest/Create', [
            'statusOptions' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
                'draft' => 'Draft',
            ],
        ]);
    }

    /**
     * 创建新的 Placement Test
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'instructions' => 'nullable|string|max:2000',
            'time_limit' => 'nullable|integer|min:1|max:999',
            'shuffle_questions' => 'boolean',
            'status' => 'nullable|in:active,inactive,draft',
            'skill_tags' => 'nullable|array',  // Placement 专属
        ]);

        // 设置布尔值
        $data['shuffle_questions'] = $request->boolean('shuffle_questions', true);
        $data['show_results_immediately'] = false;  // Placement 默认不立即显示
        $data['allow_review'] = false;
        $data['status'] = $data['status'] ?? 'draft';

        // 注意：不需要手动设置 test_type，模型会自动处理
        $test = PlacementTest::create($data);

        return redirect()->route('admin.placement-tests.show', $test->test_id)
            ->with('success', 'Placement test created successfully. Now add questions to complete the test.');
    }

    /**
     * 显示 Placement Test 详情
     */
    public function show($testId)
    {
        $test = PlacementTest::with(['questions.options', 'submissions'])
            ->findOrFail($testId);

        // 转换题目数据
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

        // 获取提交统计（使用父类的统计方法）
        $stats = $test->getPlacementTestStats();

        return Inertia::render('Admin/PlacementTest/Show', [
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'description' => $test->description,
                'instructions' => $test->instructions,
                'time_limit' => $test->time_limit,
                'shuffle_questions' => $test->shuffle_questions,
                'status' => $test->status,
                'questions_count' => $test->questions_count,
                'total_points' => $test->total_points,
                'skill_tags' => $test->skill_tags,  // Placement 专属
                'created_at' => $test->created_at,
                'updated_at' => $test->updated_at,
            ],
            'questions' => $questionsData,
            'stats' => $stats,
        ]);
    }

    /**
     * 显示编辑表单
     */
    public function edit($testId)
    {
        $test = PlacementTest::findOrFail($testId);

        return Inertia::render('Admin/PlacementTest/Edit', [
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'description' => $test->description,
                'instructions' => $test->instructions,
                'time_limit' => $test->time_limit,
                'shuffle_questions' => $test->shuffle_questions,
                'status' => $test->status,
                'skill_tags' => $test->skill_tags,
            ],
            'statusOptions' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
                'draft' => 'Draft',
            ],
        ]);
    }

    /**
     * 更新 Placement Test
     */
    public function update(Request $request, $testId)
    {
        $test = PlacementTest::findOrFail($testId);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'instructions' => 'nullable|string|max:2000',
            'time_limit' => 'nullable|integer|min:1|max:999',
            'shuffle_questions' => 'boolean',
            'status' => 'nullable|in:active,inactive,draft',
            'skill_tags' => 'nullable|array',
        ]);

        $data['shuffle_questions'] = $request->boolean('shuffle_questions');

        $test->update($data);

        return redirect()->route('admin.placement-tests.show', $test->test_id)
            ->setStatusCode(303)
            ->with('success', 'Placement test updated successfully.');
    }

    /**
     * 删除 Placement Test
     */
    public function destroy($testId)
    {
        $test = PlacementTest::findOrFail($testId);

        // 检查是否有提交记录
        if ($test->submissions()->exists()) {
            return back()->withErrors([
                'error' => 'Cannot delete placement test that has student submissions. Please set it as inactive instead.'
            ]);
        }

        $test->delete();

        return redirect()->route('admin.placement-tests.index')
            ->setStatusCode(303)
            ->with('success', 'Placement test deleted successfully.');
    }

    /**
     * 复制 Placement Test
     */
    public function duplicate($testId)
    {
        $test = PlacementTest::findOrFail($testId);

        DB::beginTransaction();
        try {
            // 创建副本
            $newTest = $test->replicate();
            $newTest->title = $test->title . ' (Copy)';
            $newTest->status = 'draft';
            $newTest->save();

            // 复制所有题目和选项
            foreach ($test->questions as $question) {
                $newQuestion = $question->replicate();
                $newQuestion->test_id = $newTest->test_id;
                $newQuestion->save();

                // 复制 MCQ 选项
                if ($question->type === 'mcq') {
                    foreach ($question->options as $option) {
                        $newOption = $option->replicate();
                        $newOption->question_id = $newQuestion->question_id;
                        $newOption->save();
                    }
                }
            }

            DB::commit();

            return redirect()->route('admin.placement-tests.show', $newTest->test_id)
                ->with('success', 'Placement test duplicated successfully.');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to duplicate placement test.']);
        }
    }

    /**
     * 预览 Placement Test
     */
    public function preview($testId)
    {
        $test = PlacementTest::with(['questions.options'])->findOrFail($testId);

        return Inertia::render('Admin/PlacementTest/Preview', [
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'description' => $test->description,
                'instructions' => $test->instructions,
                'time_limit' => $test->time_limit,
                'questions_count' => $test->questions_count,
                'total_points' => $test->total_points,
                'shuffle_questions' => $test->shuffle_questions,
            ],
            'questions' => $test->questions->map(function ($question) {
                return [
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
            }),
        ]);
    }

    /**
     * 批量操作
     */
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'test_ids' => 'required|array',
            'test_ids.*' => 'exists:tests,test_id',
            'action' => 'required|in:activate,deactivate,delete',
        ]);

        $testIds = $request->input('test_ids');
        $action = $request->input('action');

        // 确保所有测试都是 placement 类型
        $tests = PlacementTest::whereIn('test_id', $testIds)->get();

        if ($tests->count() !== count($testIds)) {
            return back()->withErrors(['error' => 'Some tests are not placement tests.']);
        }

        // 如果是删除操作，检查是否有提交
        if ($action === 'delete') {
            $testsWithSubmissions = $tests->filter(fn($test) => $test->submissions()->exists());

            if ($testsWithSubmissions->isNotEmpty()) {
                return back()->withErrors([
                    'error' => 'Cannot delete tests with submissions. Please set them as inactive instead.'
                ]);
            }
        }

        switch ($action) {
            case 'activate':
                PlacementTest::whereIn('test_id', $testIds)->update(['status' => 'active']);
                $message = 'Placement tests activated successfully.';
                break;
            case 'deactivate':
                PlacementTest::whereIn('test_id', $testIds)->update(['status' => 'inactive']);
                $message = 'Placement tests deactivated successfully.';
                break;
            case 'delete':
                PlacementTest::whereIn('test_id', $testIds)->delete();
                $message = 'Placement tests deleted successfully.';
                break;
        }

        return redirect()->route('admin.placement-tests.index')
            ->with('success', $message);
    }
}
