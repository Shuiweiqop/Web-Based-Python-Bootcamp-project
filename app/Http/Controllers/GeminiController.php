<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\AISessionLog;
use Illuminate\Support\Str;

class GeminiController extends Controller
{
    public function chat(Request $request)
    {
        try {
            $request->validate([
                'message' => 'required|string|max:5000',
                'lesson_id' => 'nullable|integer|exists:lessons,lesson_id',
            ]);

            $apiKey = config('services.gemini.key');

            if (!$apiKey) {
                return response()->json([
                    'success' => false,
                    'error' => 'Gemini API key not configured.'
                ], 500);
            }

            // Get conversation history for this lesson/context from session
            $conversationHistory = $this->getConversationHistory($request->input('lesson_id'));

            // Build contents array
            $contents = [];

            // Add conversation history
            foreach ($conversationHistory as $turn) {
                $contents[] = [
                    'role' => $turn['role'],
                    'parts' => [['text' => $turn['text']]]
                ];
            }

            // Add current message
            $contents[] = [
                'role' => 'user',
                'parts' => [['text' => $request->message]]
            ];

            // 🔥 使用 gemini-2.5-flash（你测试成功的模型）
            $response = Http::timeout(30)->post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}",
                [
                    'contents' => $contents,
                    'systemInstruction' => [
                        'parts' => [
                            ['text' => $this->getSystemPrompt($request->lesson_id, $request->message)]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.7,
                        'maxOutputTokens' => 8000,
                    ]
                ]
            );

            if ($response->failed()) {
                \Log::error('Gemini API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                // 特殊处理 429 错误
                if ($response->status() === 429) {
                    return response()->json([
                        'success' => false,
                        'error' => '⏳ AI is currently busy. Please wait a moment and try again.'
                    ], 429);
                }

                return response()->json([
                    'success' => false,
                    'error' => 'Failed to get response from AI. Status: ' . $response->status()
                ], 500);
            }

            $data = $response->json();

            // Check for errors
            if (isset($data['error'])) {
                \Log::error('Gemini API Error', ['error' => $data['error']]);
                return response()->json([
                    'success' => false,
                    'error' => 'API Error: ' . ($data['error']['message'] ?? 'Unknown error')
                ], 500);
            }

            // Check if candidates exist
            if (!isset($data['candidates']) || empty($data['candidates'])) {
                \Log::error('No candidates in response', ['data' => $data]);
                return response()->json([
                    'success' => false,
                    'error' => 'AI did not generate a response.'
                ], 500);
            }

            $candidate = $data['candidates'][0];

            // Check finishReason
            if (isset($candidate['finishReason']) && $candidate['finishReason'] === 'SAFETY') {
                return response()->json([
                    'success' => false,
                    'error' => 'Response blocked by safety filters. Please rephrase your question.'
                ], 400);
            }

            if (isset($candidate['finishReason']) && $candidate['finishReason'] === 'MAX_TOKENS') {
                \Log::warning('Response truncated due to MAX_TOKENS');
            }

            // Extract text - handle missing parts
            if (!isset($candidate['content']['parts'][0]['text'])) {
                \Log::error('No text in response', [
                    'candidate' => $candidate,
                    'finishReason' => $candidate['finishReason'] ?? 'unknown'
                ]);

                return response()->json([
                    'success' => false,
                    'error' => 'AI did not generate text content. Please try simplifying your question.'
                ], 500);
            }

            $replyText = $candidate['content']['parts'][0]['text'];

            // Save conversation history (keep last 20 messages = 10 turns)
            $conversationHistory[] = ['role' => 'user', 'text' => $request->message];
            $conversationHistory[] = ['role' => 'model', 'text' => $replyText];
            $this->storeConversationHistory(
                $request->input('lesson_id'),
                array_slice($conversationHistory, -20)
            );

            // 🔥 计算当前提示级别
            $currentHintLevel = $this->calculateHintLevel(count($conversationHistory) / 2);

            // Log to database
            $this->logAISession($request, $replyText);

            return response()->json([
                'success' => true,
                'message' => $replyText,
                'hint_level' => $currentHintLevel, // 🔥 返回提示级别
                'total_messages' => count($conversationHistory) / 2
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid input: ' . implode(', ', $e->validator->errors()->all())
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Gemini chat error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'An unexpected error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate system prompt for hint-based tutoring with progressive disclosure
     */
    private function getSystemPrompt($lessonId = null, $userMessage = '')
    {
        // 🔥 计算对话轮数（用于渐进式提示）
        $conversationHistory = $this->getConversationHistory($lessonId);
        $messageCount = count($conversationHistory) / 2; // 每轮包含 user + model

        // 🔥 根据对话轮数调整提示级别
        $hintLevel = $this->calculateHintLevel($messageCount);

        $basePrompt = "You are a programming tutor assistant using a **PROGRESSIVE HINT SYSTEM**. You gradually provide more specific help as the student asks more questions.

**🎯 CURRENT HINT LEVEL: {$hintLevel}/5**

**PROGRESSIVE HINT LEVELS:**

**Level 1 (Messages 1-2): Socratic Questions Only**
- Ask guiding questions to help them think
- NO direct hints about implementation
- Focus on understanding the problem
- Example: \"What do you think this problem is asking you to do? What's the first step?\"

**Level 2 (Messages 3-4): Conceptual Hints**
- Provide high-level concepts needed
- Still NO code or specific syntax
- Example: \"This problem requires iteration. Think about how you'd go through each item one by one.\"

**Level 3 (Messages 5-6): Algorithm Structure**
- Provide algorithmic approach in plain language
- Mention specific language features (but no code)
- Example: \"You'll need a for loop to go through the array, and an if statement to check each condition.\"

**Level 4 (Messages 7-8): Pseudocode**
- Provide pseudocode or structural outline
- Use generic syntax, not actual code
- Example:
  ```
  FOR each item in list:
      IF item meets condition:
          add to result
  RETURN result
  ```

**Level 5 (Messages 9+): Near-Complete Example**
- Provide a very similar example with different variable names
- Student still needs to adapt it to their problem
- Example: Show a solution to a similar but different problem
- Still encourage them to modify it themselves

**RESPONSE GUIDELINES FOR LEVEL {$hintLevel}:**
" . $this->getHintLevelInstructions($hintLevel) . "

**TONE:**
- Friendly and encouraging at all levels
- Acknowledge their persistence
- Celebrate progress: \"Great question! You're making progress.\"
- If at Level 5, remind them: \"You've worked hard on this. Here's a detailed example to help you understand the pattern.\"

**IMPORTANT:**
- NEVER jump ahead to higher levels
- Progress naturally through the levels
- If student shows their code attempt, you can provide more specific feedback even at lower levels";

        // Detect if user is requesting code directly
        $lowerMessage = strtolower($userMessage);
        $codeKeywords = ['code', 'answer', 'solution', 'write for me', 'give me', 'show me', 'complete code'];

        $requestingCode = false;
        foreach ($codeKeywords as $keyword) {
            if (str_contains($lowerMessage, $keyword)) {
                $requestingCode = true;
                break;
            }
        }

        if ($requestingCode && $hintLevel < 4) {
            $basePrompt .= "\n\n⚠️ ALERT: Student is requesting direct code, but they're only at Level {$hintLevel}.
- Gently explain that you want to help them learn
- Provide hints appropriate for Level {$hintLevel}
- Encourage them to try implementing based on your hints
- Remind them they're building understanding that will help them long-term";
        }

        // Add lesson-specific context
        if ($lessonId) {
            try {
                $lesson = \App\Models\Lesson::find($lessonId);
                if ($lesson) {
                    $basePrompt .= "\n\n**CURRENT LESSON CONTEXT:**";
                    $basePrompt .= "\n- Lesson: {$lesson->title}";
                    $basePrompt .= "\n- Focus: Guide student to understand core concepts of '{$lesson->title}'";

                    if (!empty($lesson->description)) {
                        $basePrompt .= "\n- Learning objectives: {$lesson->description}";
                    }
                }
            } catch (\Exception $e) {
                \Log::warning('Could not fetch lesson context', ['lesson_id' => $lessonId]);
            }
        }

        return $basePrompt;
    }

    /**
     * 🔥 Calculate hint level based on message count
     */
    private function calculateHintLevel($messageCount)
    {
        if ($messageCount <= 2) return 1;
        if ($messageCount <= 4) return 2;
        if ($messageCount <= 6) return 3;
        if ($messageCount <= 8) return 4;
        return 5;
    }

    /**
     * 🔥 Get specific instructions for each hint level
     */
    private function getHintLevelInstructions($level)
    {
        $instructions = [
            1 => "- Ask questions to help them understand the problem
- NO hints about implementation yet
- Focus on problem comprehension
- Example: 'What is this problem asking you to find? What information do you have?'",

            2 => "- Introduce relevant programming concepts
- Mention general approaches (loops, conditionals, etc.)
- Still avoid specific syntax
- Example: 'This requires checking each element. What programming structure lets you go through items one by one?'",

            3 => "- Describe the algorithm structure clearly
- Mention specific language features (for loop, if statement, etc.)
- Break down into logical steps
- Example: 'You need: 1) A for loop through the array, 2) An if condition to check values, 3) A way to store results'",

            4 => "- Provide pseudocode or step-by-step outline
- Use generic syntax that's language-agnostic
- Show the logical flow clearly
- Example: 'Here's the structure:
  ```
  create empty result
  for each number in list:
      if number > threshold:
          add to result
  return result
  ```'",

            5 => "- Provide a detailed example with similar logic
- Use different variable names and context
- Student should adapt it to their problem
- Explain each part
- Example: Show a working solution to find even numbers, when they're trying to find odd numbers
- Still encourage them to understand and modify rather than copy"
        ];

        return $instructions[$level] ?? $instructions[5];
    }

    /**
     * Clear conversation history
     */
    public function clearConversation(Request $request)
    {
        $request->validate([
            'lesson_id' => 'nullable|integer',
        ]);

        if ($request->filled('lesson_id')) {
            $contextKey = $this->getAIContextKey($request->input('lesson_id'));
            $conversations = session('ai_conversations', []);
            $sessionIds = session('ai_session_ids', []);

            unset($conversations[$contextKey], $sessionIds[$contextKey]);

            session([
                'ai_conversations' => $conversations,
                'ai_session_ids' => $sessionIds,
            ]);
        } else {
            session()->forget('ai_conversation');
            session()->forget('ai_session_id');
            session()->forget('ai_conversations');
            session()->forget('ai_session_ids');
        }

        return response()->json([
            'success' => true,
            'message' => 'Conversation cleared successfully.'
        ]);
    }

    /**
     * Log AI session to database
     */
    private function logAISession(Request $request, string $response)
    {
        try {
            // Get current student ID
            $studentId = auth()->check() ? (auth()->user()->studentProfile->student_id ?? null) : null;

            if (!$studentId) {
                \Log::warning('AI session log skipped: No student profile found');
                return;
            }

            // Generate or get session ID for this lesson/context (stored in session)
            $contextKey = $this->getAIContextKey($request->input('lesson_id'));
            $sessionIds = session('ai_session_ids', []);
            $sessionId = $sessionIds[$contextKey] ?? null;
            if (!$sessionId) {
                $sessionId = Str::uuid()->toString();
                $sessionIds[$contextKey] = $sessionId;
                session(['ai_session_ids' => $sessionIds]);
            }

            // Create log record
            AISessionLog::create([
                'student_id' => $studentId,
                'ai_session_id' => $sessionId,
                'lesson_id' => $request->input('lesson_id'),
                'prompt' => $request->input('message'),
                'response' => $response,
                'timestamp' => now(),
            ]);
        } catch (\Exception $e) {
            // Logging failure should not affect main functionality
            \Log::error('Failed to log AI session', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    private function getAIContextKey($lessonId = null): string
    {
        return $lessonId ? 'lesson_' . (int) $lessonId : 'global';
    }

    private function getConversationHistory($lessonId = null): array
    {
        $contextKey = $this->getAIContextKey($lessonId);
        $conversations = session('ai_conversations', []);

        return $conversations[$contextKey] ?? [];
    }

    private function storeConversationHistory($lessonId, array $conversationHistory): void
    {
        $contextKey = $this->getAIContextKey($lessonId);
        $conversations = session('ai_conversations', []);
        $conversations[$contextKey] = $conversationHistory;

        session(['ai_conversations' => $conversations]);
    }
}
