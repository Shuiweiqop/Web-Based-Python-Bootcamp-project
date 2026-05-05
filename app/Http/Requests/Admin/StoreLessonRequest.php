<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreLessonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'administrator';
    }

    public function rules(): array
    {
        return [
            'title'                      => ['required', 'string', 'max:255'],
            'content'                    => ['nullable', 'string'],
            'content_type'               => ['required', 'string', 'in:text,markdown,html'],
            'video_url'                  => ['nullable', 'url'],
            'difficulty'                 => ['required', 'string', 'in:beginner,intermediate,advanced'],
            'estimated_duration'         => ['nullable', 'integer', 'min:1', 'max:1440'],
            'status'                     => ['required', 'in:active,inactive,draft'],
            'completion_reward_points'   => ['nullable', 'integer', 'min:0', 'max:10000'],
            'required_exercises'         => ['nullable', 'integer', 'min:0'],
            'required_tests'             => ['nullable', 'integer', 'min:0'],
            'min_exercise_score_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'sections'                   => ['nullable', 'array'],
            'sections.*.title'           => ['required_with:sections', 'string', 'max:255'],
            'sections.*.content'         => ['required_with:sections', 'string'],
            'sections.*.order_index'     => ['required_with:sections', 'integer', 'min:1'],
        ];
    }
}
