<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AILessonGeneratorService
{
    private string $apiKey;
    private string $model = 'gemini-2.5-flash'; // 使用 Gemini Flash 模型

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');

        if (!$this->apiKey) {
            throw new \Exception('Gemini API key not configured');
        }
    }

    /**
     * 根据标题和视频URL生成课程内容
     */
    public function generateLesson(string $title, ?string $videoUrl = null, string $difficulty = 'beginner'): array
    {
        try {
            $prompt = $this->buildPrompt($title, $videoUrl, $difficulty);

            $response = Http::timeout(60)->post(
                "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}",
                [
                    'contents' => [
                        [
                            'parts' => [
                                [
                                    'text' => "You are an expert programming instructor. Generate structured lesson content in JSON format only. Do not include any markdown formatting or code blocks.\n\n" . $prompt
                                ]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.7,
                        'maxOutputTokens' => 8000,
                    ]
                ]
            );

            if ($response->failed()) {
                Log::error('Gemini API Error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                throw new \Exception('AI service unavailable: ' . $response->body());
            }

            $data = $response->json();

            // 检查是否有错误
            if (isset($data['error'])) {
                Log::error('Gemini API Error', ['error' => $data['error']]);
                throw new \Exception('API Error: ' . ($data['error']['message'] ?? 'Unknown error'));
            }

            // 检查是否有候选回复
            if (!isset($data['candidates']) || empty($data['candidates'])) {
                Log::error('No candidates in response', ['data' => $data]);
                throw new \Exception('AI 没有生成回复');
            }

            $candidate = $data['candidates'][0];

            // 检查 finishReason
            if (isset($candidate['finishReason']) && $candidate['finishReason'] === 'MAX_TOKENS') {
                Log::warning('Response truncated due to MAX_TOKENS');
            }

            // 提取文本
            if (!isset($candidate['content']['parts'][0]['text'])) {
                Log::error('No text in response', [
                    'candidate' => $candidate,
                    'finishReason' => $candidate['finishReason'] ?? 'unknown'
                ]);
                throw new \Exception('AI 没有生成文本内容');
            }

            $content = $candidate['content']['parts'][0]['text'];

            // 清理可能的 markdown 代码块标记
            $content = preg_replace('/```json\s*|\s*```/', '', $content);
            $content = trim($content);

            $lessonData = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('JSON Parse Error', [
                    'content' => $content,
                    'error' => json_last_error_msg()
                ]);
                throw new \Exception('Failed to parse AI response: ' . json_last_error_msg());
            }

            return $this->validateAndFormatResponse($lessonData);
        } catch (\Exception $e) {
            Log::error('AI Lesson Generation Failed', [
                'error' => $e->getMessage(),
                'title' => $title,
            ]);
            throw $e;
        }
    }

    /**
     * 构建 AI 提示词
     */
    private function buildPrompt(string $title, ?string $videoUrl, string $difficulty): string
    {
        $prompt = "Generate a programming lesson with the following details:\n\n";
        $prompt .= "Title: {$title}\n";
        $prompt .= "Difficulty Level: {$difficulty}\n";

        if ($videoUrl) {
            $prompt .= "Video Reference: {$videoUrl}\n";
        }

        $prompt .= "\nGenerate a structured lesson with:\n";
        $prompt .= "1. A clear lesson introduction\n";
        $prompt .= "2. 3-5 sections covering key concepts\n";
        $prompt .= "3. Code examples where applicable\n";
        $prompt .= "4. A summary section\n\n";

        $prompt .= "Return ONLY a JSON object (no markdown formatting) with this structure:\n";
        $prompt .= "{\n";
        $prompt .= '  "title": "Lesson title",' . "\n";
        $prompt .= '  "content": "Brief overview paragraph",' . "\n";
        $prompt .= '  "estimated_duration": 30,' . "\n";
        $prompt .= '  "sections": [' . "\n";
        $prompt .= '    {"title": "Section 1", "content": "Detailed content with examples"},' . "\n";
        $prompt .= '    {"title": "Section 2", "content": "More content"}' . "\n";
        $prompt .= '  ]' . "\n";
        $prompt .= "}";

        return $prompt;
    }

    /**
     * 验证并格式化 AI 返回的数据
     */
    private function validateAndFormatResponse(array $data): array
    {
        // 确保必需字段存在
        if (!isset($data['title']) || !isset($data['sections'])) {
            throw new \Exception('AI response missing required fields');
        }

        // 添加默认值
        return [
            'title' => $data['title'] ?? 'Untitled Lesson',
            'content' => $data['content'] ?? '',
            'estimated_duration' => $data['estimated_duration'] ?? 30,
            'sections' => $data['sections'] ?? [],
        ];
    }

    /**
     * 测试 API 连接
     */
    public function testConnection(): bool
    {
        try {
            // Gemini API 没有直接的模型列表端点，我们用一个简单的请求来测试
            $response = Http::timeout(10)->post(
                "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}",
                [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => 'Hello']
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'maxOutputTokens' => 10,
                    ]
                ]
            );

            return $response->successful() && isset($response->json()['candidates']);
        } catch (\Exception $e) {
            Log::error('Gemini Connection Test Failed', ['error' => $e->getMessage()]);
            return false;
        }
    }
}
