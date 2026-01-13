<?php

namespace App\Events;

use App\Models\Lesson;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LessonCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $lesson;

    public function __construct(Lesson $lesson)
    {
        $this->lesson = $lesson;
    }
}
