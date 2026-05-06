<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExerciseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lesson_id'           => 'sometimes|required|exists:lessons,lesson_id',
            'title'               => 'required|string|max:255',
            'description'         => 'nullable|string',
            'exercise_type'       => 'required|string',
            'asset_url'           => 'nullable|url',
            'max_score'           => 'nullable|integer|min:0',
            'time_limit_sec'      => 'nullable|integer|min:0',
            'is_active'           => 'sometimes|boolean',
            'content'             => 'nullable',
            'difficulty'          => 'nullable|string',
            'starter_code'        => 'nullable|string',
            'solution'            => 'nullable|string',
            'enable_live_editor'  => 'nullable|boolean',
            'coding_instructions' => 'nullable|string',
            'test_cases'          => 'nullable|array',
        ];
    }
}
