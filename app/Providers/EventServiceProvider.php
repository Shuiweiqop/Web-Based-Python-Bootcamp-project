<?php

namespace App\Providers;

use App\Events\LessonCreated;
use App\Listeners\SendLessonCreatedNotifications;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        LessonCreated::class => [
            SendLessonCreatedNotifications::class,
        ],
    ];

    public function boot()
    {
        //
    }
}
