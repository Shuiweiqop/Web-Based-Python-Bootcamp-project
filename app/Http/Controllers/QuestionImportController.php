<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PlacementTest;
use App\Models\Question;
use App\Models\QuestionOption;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class QuestionImportController extends Controller
{
    /**
     * 预览导入的题目（不保存）
     */
    public function preview(Request $request, $testId)
    {
        $request->validate([
            'file' => 'required|file|mimes:json,csv,txt,xlsx,xls|max:10240', // 10MB max
        ]);

        $test = PlacementTest::findOrFail($testId);
        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();

        try {
            // 根据文件类型解析
            $questions = $this->parseFile($file, $extension);

            // 验证所有题目
            $validatedQuestions = $this->validateQuestions($questions);

            return response()->json([
                'success' => true,
                'questions' => $validatedQuestions,
                'count' => count($validatedQuestions),
                'message' => 'File parsed successfully. Review the questions before importing.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * 执行批量导入
     */
    public function import(Request $request, $testId)
    {
        $request->validate([
            'questions' => 'required|array',
            'questions.*.type' => 'required|in:mcq,coding,true_false,short_answer',
            'questions.*.question_text' => 'required|string',
        ]);

        $test = PlacementTest::findOrFail($testId);

        DB::beginTransaction();
        try {
            $importedCount = 0;
            $errors = [];

            foreach ($request->input('questions') as $index => $questionData) {
                try {
                    $this->createQuestion($test, $questionData);
                    $importedCount++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'index' => $index + 1,
                        'question' => $questionData['question_text'] ?? 'Unknown',
                        'error' => $e->getMessage(),
                    ];
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'imported' => $importedCount,
                'errors' => $errors,
                'message' => "{$importedCount} questions imported successfully.",
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'error' => 'Import failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 解析上传的文件
     */
    private function parseFile($file, $extension)
    {
        $content = file_get_contents($file->getRealPath());

        switch ($extension) {
            case 'json':
                return $this->parseJson($content);
            case 'csv':
            case 'txt':
                return $this->parseCsv($file->getRealPath());
            case 'xlsx':
            case 'xls':
                return $this->parseExcel($file->getRealPath());
            default:
                throw new \Exception('Unsupported file format');
        }
    }

    /**
     * 解析 JSON 文件
     */
    private function parseJson($content)
    {
        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Invalid JSON format: ' . json_last_error_msg());
        }

        // 支持两种格式：
        // 1. { "questions": [...] }
        // 2. [...]
        if (isset($data['questions']) && is_array($data['questions'])) {
            return $data['questions'];
        }

        if (is_array($data) && isset($data[0])) {
            return $data;
        }

        throw new \Exception('Invalid JSON structure. Expected array of questions.');
    }

    /**
     * 解析 CSV 文件
     */
    private function parseCsv($filePath)
    {
        $questions = [];
        $handle = fopen($filePath, 'r');

        if (!$handle) {
            throw new \Exception('Unable to read CSV file');
        }

        // 读取标题行
        $headers = fgetcsv($handle);
        if (!$headers) {
            throw new \Exception('CSV file is empty');
        }

        // 标准化标题（移除空格，转小写）
        $headers = array_map(function ($h) {
            return strtolower(trim($h));
        }, $headers);

        while (($row = fgetcsv($handle)) !== false) {
            if (empty(array_filter($row))) continue; // 跳过空行

            $question = [];
            foreach ($headers as $index => $header) {
                $question[$header] = $row[$index] ?? '';
            }

            // 解析选项（如果是 MCQ）
            if (isset($question['type']) && $question['type'] === 'mcq') {
                $question['options'] = $this->parseOptionsFromCsv($question);
            }

            $questions[] = $question;
        }

        fclose($handle);
        return $questions;
    }

    /**
     * 从 CSV 行解析 MCQ 选项
     */
    private function parseOptionsFromCsv($row)
    {
        $options = [];
        $labels = ['A', 'B', 'C', 'D', 'E', 'F'];

        foreach ($labels as $label) {
            $optionKey = 'option_' . strtolower($label);
            if (!empty($row[$optionKey])) {
                $options[] = [
                    'option_label' => $label,
                    'option_text' => $row[$optionKey],
                    'is_correct' => ($row['correct_answer'] ?? '') === $label,
                ];
            }
        }

        return $options;
    }

    /**
     * 解析 Excel 文件（需要 PhpSpreadsheet）
     */
    private function parseExcel($filePath)
    {
        // 检查是否安装了 PhpSpreadsheet
        if (!class_exists('\PhpOffice\PhpSpreadsheet\IOFactory')) {
            throw new \Exception('PhpSpreadsheet library not installed. Please run: composer require phpoffice/phpspreadsheet');
        }

        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($filePath);
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();

        if (empty($rows)) {
            throw new \Exception('Excel file is empty');
        }

        $headers = array_map(function ($h) {
            return strtolower(trim($h));
        }, $rows[0]);

        $questions = [];
        for ($i = 1; $i < count($rows); $i++) {
            $row = $rows[$i];
            if (empty(array_filter($row))) continue;

            $question = [];
            foreach ($headers as $index => $header) {
                $question[$header] = $row[$index] ?? '';
            }

            if (isset($question['type']) && $question['type'] === 'mcq') {
                $question['options'] = $this->parseOptionsFromCsv($question);
            }

            $questions[] = $question;
        }

        return $questions;
    }

    /**
     * 验证题目数据
     */
    private function validateQuestions($questions)
    {
        $validated = [];

        foreach ($questions as $index => $q) {
            $validator = Validator::make($q, [
                'type' => 'required|in:mcq,coding,true_false,short_answer',
                'question_text' => 'required|string',
                'points' => 'nullable|integer|min:1|max:100',
                'difficulty_level' => 'nullable|integer|min:1|max:3',
            ]);

            if ($validator->fails()) {
                throw new \Exception("Question " . ($index + 1) . " validation failed: " . $validator->errors()->first());
            }

            $validated[] = [
                'type' => $q['type'],
                'question_text' => $q['question_text'],
                'code_snippet' => $q['code_snippet'] ?? null,
                'correct_answer' => $q['correct_answer'] ?? null,
                'explanation' => $q['explanation'] ?? null,
                'points' => (int) ($q['points'] ?? 10),
                'difficulty_level' => (int) ($q['difficulty_level'] ?? 2),
                'order' => (int) ($q['order'] ?? 0),
                'status' => $q['status'] ?? 'active',
                'options' => $q['options'] ?? [],
            ];
        }

        return $validated;
    }

    /**
     * 创建单个题目
     */
    private function createQuestion($test, $questionData)
    {
        $question = Question::create([
            'test_id' => $test->test_id,
            'type' => $questionData['type'],
            'question_text' => $questionData['question_text'],
            'code_snippet' => $questionData['code_snippet'],
            'correct_answer' => $questionData['correct_answer'],
            'explanation' => $questionData['explanation'],
            'points' => $questionData['points'],
            'difficulty_level' => $questionData['difficulty_level'],
            'order' => $questionData['order'],
            'status' => $questionData['status'],
        ]);

        // 如果是 MCQ，创建选项
        if ($questionData['type'] === 'mcq' && !empty($questionData['options'])) {
            foreach ($questionData['options'] as $index => $option) {
                QuestionOption::create([
                    'question_id' => $question->question_id,
                    'option_label' => $option['option_label'] ?? chr(65 + $index), // A, B, C...
                    'option_text' => $option['option_text'],
                    'is_correct' => $option['is_correct'] ?? false,
                    'order' => $index + 1,
                ]);
            }
        }

        return $question;
    }

    /**
     * 下载示例模板
     */
    public function downloadTemplate($format = 'json')
    {
        switch ($format) {
            case 'json':
                return $this->downloadJsonTemplate();
            case 'csv':
                return $this->downloadCsvTemplate();
            default:
                abort(404);
        }
    }

    /**
     * JSON 模板
     */
    private function downloadJsonTemplate()
    {
        $template = [
            'questions' => [
                [
                    'type' => 'mcq',
                    'question_text' => 'What is the output of print(2 ** 3)?',
                    'code_snippet' => 'print(2 ** 3)',
                    'correct_answer' => 'A',
                    'explanation' => '2 ** 3 means 2 to the power of 3, which equals 8.',
                    'points' => 10,
                    'difficulty_level' => 1,
                    'order' => 1,
                    'status' => 'active',
                    'options' => [
                        ['option_label' => 'A', 'option_text' => '8', 'is_correct' => true],
                        ['option_label' => 'B', 'option_text' => '6', 'is_correct' => false],
                        ['option_label' => 'C', 'option_text' => '9', 'is_correct' => false],
                        ['option_label' => 'D', 'option_text' => '5', 'is_correct' => false],
                    ]
                ],
                [
                    'type' => 'true_false',
                    'question_text' => 'Python is a statically typed language.',
                    'correct_answer' => 'false',
                    'explanation' => 'Python is dynamically typed.',
                    'points' => 5,
                    'difficulty_level' => 1,
                    'order' => 2,
                    'status' => 'active',
                ],
                [
                    'type' => 'short_answer',
                    'question_text' => 'What keyword is used to define a function in Python?',
                    'correct_answer' => 'def',
                    'explanation' => 'The def keyword is used to define functions.',
                    'points' => 5,
                    'difficulty_level' => 1,
                    'order' => 3,
                    'status' => 'active',
                ]
            ]
        ];

        $json = json_encode($template, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        return response($json)
            ->header('Content-Type', 'application/json')
            ->header('Content-Disposition', 'attachment; filename="questions_template.json"');
    }

    /**
     * CSV 模板
     */
    private function downloadCsvTemplate()
    {
        $csv = "type,question_text,option_a,option_b,option_c,option_d,correct_answer,points,difficulty_level,explanation\n";
        $csv .= "mcq,\"What is 2+2?\",\"3\",\"4\",\"5\",\"6\",B,10,1,\"Basic arithmetic\"\n";
        $csv .= "true_false,\"Python is compiled.\",\"\",\"\",\"\",\"\",false,5,1,\"Python is interpreted\"\n";
        $csv .= "short_answer,\"What is the capital of France?\",\"\",\"\",\"\",\"\",Paris,5,1,\"Capital city\"\n";

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="questions_template.csv"');
    }
}
