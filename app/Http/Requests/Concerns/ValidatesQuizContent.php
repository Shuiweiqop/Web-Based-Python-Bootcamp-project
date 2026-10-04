<?php

namespace App\Http\Requests\Concerns;

use Illuminate\Validation\Validator;

/**
 * Shape checks for a quiz's content, shared by the exercise store and update
 * requests. A quiz is graded on the server from each question's correct
 * option, so one saved without a usable answer key can never be passed.
 *
 *     {"questions": [{"question": "...", "options": ["a", "b"], "correct": 1,
 *                     "points": 20, "explanation": "..."}]}
 */
trait ValidatesQuizContent
{
    protected function quizContentRules(): array
    {
        if ($this->input('exercise_type') !== 'quiz') {
            return [];
        }

        return [
            'content' => 'required|array',
            'content.questions' => 'required|array|min:1|max:50',
            'content.questions.*.question' => 'required|string|max:1000',
            'content.questions.*.options' => 'required|array|min:2|max:6',
            'content.questions.*.options.*' => 'required|string|max:300',
            'content.questions.*.correct' => 'required|integer|min:0',
            'content.questions.*.points' => 'nullable|numeric|min:0',
            'content.questions.*.explanation' => 'nullable|string|max:1000',
        ];
    }

    /** The correct option has to be one of the question's options. */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->input('exercise_type') !== 'quiz') {
                return;
            }

            foreach ((array) $this->input('content.questions', []) as $i => $question) {
                $options = is_array($question['options'] ?? null) ? $question['options'] : [];
                $correct = $question['correct'] ?? null;

                if (is_numeric($correct) && (int) $correct >= count($options)) {
                    $validator->errors()->add(
                        "content.questions.$i.correct",
                        'Question '.($i + 1).' has no option marked as correct.'
                    );
                }
            }
        });
    }
}
