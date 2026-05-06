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
            'answer'            => 'required|array',
            'answer.completed'  => 'required|boolean',
            'answer.score'      => 'required|numeric|min:0',
            'time_spent'        => 'nullable|numeric|min:0',
        ];
    }
}
