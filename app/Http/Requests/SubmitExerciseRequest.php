<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitExerciseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'answer' => 'required|array',
            'answer.completed' => 'required|boolean',
            'answer.score' => 'required|numeric|min:0',
            // Coding submissions are re-run on Judge0; cap the payload as the
            // Run endpoint does.
            'answer.code' => 'sometimes|string|max:50000',
            // Quiz submissions: the chosen option index per question.
            'answer.selections' => 'sometimes|array|max:200',
            'answer.selections.*' => 'nullable|integer|min:0',
            // Fill-in-the-blank submissions: what was typed, per sentence then per blank.
            'answer.answers' => 'sometimes|array|max:200',
            'answer.answers.*' => 'array|max:50',
            'answer.answers.*.*' => 'nullable|string|max:500',
            'time_spent' => 'nullable|numeric|min:0',
        ];
    }
}
