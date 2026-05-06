<?php

namespace App\Jobs;

use App\Models\StudentProfile;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class UpdateStudentPathProgress implements ShouldQueue
{
    use Queueable;

    public function __construct(private int $studentId) {}

    public function handle(): void
    {
        $student = StudentProfile::find($this->studentId);
        $student?->updateAllPathProgress();
    }
}
