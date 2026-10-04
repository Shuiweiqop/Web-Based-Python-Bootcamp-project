<?php

use App\Http\Controllers\Student\InventoryController as StudentInventoryController;
use App\Http\Controllers\Student\LeaderboardController;
use App\Http\Controllers\Student\LearningPathController;
use App\Http\Controllers\Student\MasteryController as StudentMasteryController;
use App\Http\Controllers\Student\MissionController;
use App\Http\Controllers\Student\NotificationController;
use App\Http\Controllers\Student\OnboardingController;
use App\Http\Controllers\Student\RewardController as StudentRewardController;
use App\Http\Controllers\StudentProfileController;
use App\Http\Controllers\StudentTestController;
use Illuminate\Support\Facades\Route;

/*
| Student area: /student/*, route names student.*
|
| Loaded from routes/web.php inside its auth + verified group, so these
| routes already carry that middleware. Order matters: specific paths are
| registered before the wildcard routes that would otherwise catch them.
*/

Route::prefix('student')->name('student.')->group(function () {

    // ==================== Onboarding Assessment ====================
    Route::prefix('onboarding')->name('onboarding.')->group(function () {
        Route::get('/', [OnboardingController::class, 'index'])->name('index');
        Route::get('/start-test', [OnboardingController::class, 'startTest'])->name('start-test');
        Route::get('/result/{submission}', [OnboardingController::class, 'result'])->name('result');
        Route::post('/accept-path/{path}', [OnboardingController::class, 'acceptPath'])->name('accept-path');
        Route::post('/choose-path', [OnboardingController::class, 'choosePath'])->name('choose-path');
        Route::get('/skip', [OnboardingController::class, 'skip'])->name('skip');
    });

    // ==================== Learning Path Routes ====================
    Route::prefix('paths')->name('paths.')->group(function () {
        Route::get('/', [LearningPathController::class, 'index'])->name('index');
        Route::get('/browse', [LearningPathController::class, 'browse'])->name('browse');
        Route::get('/catalog/{path}', [LearningPathController::class, 'preview'])->name('preview');
        Route::get('/{path}', [LearningPathController::class, 'show'])->name('show');
        Route::get('/{path}/progress', [LearningPathController::class, 'progress'])->name('progress');
        Route::post('/{path}/enroll', [LearningPathController::class, 'enroll'])->name('enroll');
        Route::post('/{path}/pause', [LearningPathController::class, 'pause'])->name('pause');
        Route::post('/{path}/resume', [LearningPathController::class, 'resume'])->name('resume');
        Route::post('/{path}/set-primary', [LearningPathController::class, 'setAsPrimary'])->name('set-primary');
    });

    Route::get('/missions', [MissionController::class, 'index'])->name('missions.index');
    Route::get('/missions/history', [MissionController::class, 'history'])->name('missions.history');
    Route::get('/missions/archive', [MissionController::class, 'archive'])->name('missions.archive');

    // ==================== Student Profile Routes ====================
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [StudentProfileController::class, 'show'])->name('show');
        Route::get('/edit', [StudentProfileController::class, 'edit'])->name('edit');
        Route::put('/', [StudentProfileController::class, 'update'])->name('update');
        Route::get('/rewards', [StudentProfileController::class, 'rewards'])->name('rewards.index');
        Route::get('/statistics', [StudentProfileController::class, 'statistics'])->name('statistics');
        Route::get('/history', [StudentProfileController::class, 'history'])->name('history');
        Route::get('/points', [StudentProfileController::class, 'points'])->name('points');
    });

    // ==================== Student Test Routes ====================
    Route::middleware(['role:student'])->group(function () {
        // Points leaderboard
        Route::get('leaderboard', [LeaderboardController::class, 'index'])
            ->name('leaderboard');

        // Skill report — per-concept mastery from the knowledge-tracing model
        Route::get('skills', [StudentMasteryController::class, 'index'])
            ->name('skills');

        // Lesson test listing and details
        Route::get('lessons/{lesson}/tests', [StudentTestController::class, 'index'])
            ->name('lessons.tests.index');
        Route::get('lessons/{lesson}/tests/{test}', [StudentTestController::class, 'show'])
            ->name('lessons.tests.show');
        Route::post('lessons/{lesson}/tests/{test}/start', [StudentTestController::class, 'start'])
            ->name('lessons.tests.start');

        // Submit answers
        Route::get('submissions/{submission}', [StudentTestController::class, 'taking'])
            ->name('submissions.taking');
        Route::post('submissions/{submission}/answer', [StudentTestController::class, 'submitAnswer'])
            ->name('submissions.answer');
        Route::post('submissions/{submission}/complete', [StudentTestController::class, 'complete'])
            ->name('submissions.complete');
        Route::get('submissions/{submission}/result', [StudentTestController::class, 'result'])
            ->name('submissions.result');
    });

    // ==================== Notification Routes ====================
    Route::prefix('notifications')->name('notifications.')->group(function () {
        // API routes, with specific paths first
        Route::get('/unread', [NotificationController::class, 'unread'])
            ->name('unread');
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])
            ->name('read-all');
        Route::post('/read-multiple', [NotificationController::class, 'markMultipleAsRead'])
            ->name('read-multiple');

        // Bulk actions
        Route::delete('/bulk/delete', [NotificationController::class, 'destroyMultiple'])
            ->name('destroy-multiple');
        Route::delete('/clear/read', [NotificationController::class, 'clearRead'])
            ->name('clear-read');

        // Notification center page
        Route::get('/', [NotificationController::class, 'index'])
            ->name('index');

        // Single-notification actions, with parameter routes last
        Route::post('/{notification}/read', [NotificationController::class, 'markAsRead'])
            ->name('read');
        Route::delete('/{notification}', [NotificationController::class, 'destroy'])
            ->name('destroy');
    });

    // ==================== Student Reward Routes ====================
    Route::get('/rewards', [StudentRewardController::class, 'index'])->name('rewards.index');
    Route::get('/rewards/history', [StudentRewardController::class, 'history'])->name('rewards.history');
    Route::get('/rewards/{id}', [StudentRewardController::class, 'show'])->name('rewards.show');
    Route::post('/rewards/{id}/purchase', [StudentRewardController::class, 'purchase'])
        ->middleware('throttle:5,1')
        ->name('rewards.purchase');

    // ==================== Student Inventory Routes ====================
    Route::controller(StudentInventoryController::class)->prefix('inventory')->name('inventory.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/equipped', 'equipped')->name('equipped');
        Route::post('/{id}/equip', 'equip')->name('equip');
        Route::post('/{id}/unequip', 'unequip')->name('unequip');
        Route::post('/{id}/toggle', 'toggle')->name('toggle');
    });
});
