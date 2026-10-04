<?php

use App\Http\Controllers\AdminAILogController;
use App\Http\Controllers\AdminDailyChallengeController;
use App\Http\Controllers\AdminExerciseController;
use App\Http\Controllers\AdminLearningPathController;
use App\Http\Controllers\AdminLessonController;
use App\Http\Controllers\AdminMasteryController;
use App\Http\Controllers\AdminPlacementTestController;
use App\Http\Controllers\AdminProgressController;
use App\Http\Controllers\AdminQuestionController;
use App\Http\Controllers\AdminRewardController;
use App\Http\Controllers\AdminStudentController;
use App\Http\Controllers\AdminStudentPathController;
use App\Http\Controllers\AdminTestController;
use App\Http\Controllers\AILessonController;
use App\Http\Controllers\ForumReportController;
use App\Http\Controllers\QuestionImportController;
use Illuminate\Support\Facades\Route;

/*
| Admin area: /admin/*, route names admin.*, administrators only
|
| Loaded from routes/web.php inside its auth + verified group, so these
| routes already carry that middleware. Order matters: specific paths are
| registered before the wildcard routes that would otherwise catch them.
*/

Route::prefix('admin')->name('admin.')->middleware(['role:administrator'])->group(function () {

    // ==================== Learning Outcomes (knowledge tracing) ====================
    Route::prefix('mastery')->name('mastery.')->group(function () {
        Route::get('/', [AdminMasteryController::class, 'index'])->name('index');
        Route::get('/students/{student}', [AdminMasteryController::class, 'show'])->name('show');
    });

    // ==================== Student Management ====================
    Route::prefix('students')->name('students.')->group(function () {
        Route::get('/', [AdminStudentController::class, 'index'])->name('index');
        Route::get('/{student}', [AdminStudentController::class, 'show'])->name('show');
        Route::get('/{student}/edit', [AdminStudentController::class, 'edit'])->name('edit');
        Route::put('/{student}', [AdminStudentController::class, 'update'])->name('update');
        Route::delete('/{student}', [AdminStudentController::class, 'destroy'])->name('destroy');
        Route::post('/{student}/adjust-points', [AdminStudentController::class, 'adjustPoints'])->name('adjust-points');
        Route::post('/{student}/reset-password', [AdminStudentController::class, 'resetPassword'])->name('reset-password');
    });

    // ==================== Placement Test Management ====================
    Route::prefix('placement-tests')->name('placement-tests.')->group(function () {
        // Basic CRUD routes, with specific paths first
        Route::get('/', [AdminPlacementTestController::class, 'index'])
            ->name('index');
        Route::get('/create', [AdminPlacementTestController::class, 'create'])
            ->name('create');
        Route::post('/', [AdminPlacementTestController::class, 'store'])
            ->name('store');
        Route::post('/{testId}/questions/import/preview', [QuestionImportController::class, 'preview'])
            ->name('questions.import.preview');
        Route::post('/{testId}/questions/import', [QuestionImportController::class, 'import'])
            ->name('questions.import');
        Route::get('/questions/template/{format}', [QuestionImportController::class, 'downloadTemplate'])
            ->name('questions.template');
        // Special action routes before parameter routes
        Route::post('/bulk-update', [AdminPlacementTestController::class, 'bulkUpdate'])
            ->name('bulk-update');

        // Single test actions
        Route::get('/{testId}', [AdminPlacementTestController::class, 'show'])
            ->name('show');
        Route::get('/{testId}/edit', [AdminPlacementTestController::class, 'edit'])
            ->name('edit');
        Route::put('/{testId}', [AdminPlacementTestController::class, 'update'])
            ->name('update');
        Route::delete('/{testId}', [AdminPlacementTestController::class, 'destroy'])
            ->name('destroy');

        // Test-related actions
        Route::post('/{testId}/set-default', [AdminPlacementTestController::class, 'setAsDefault'])
            ->name('set-default');
        Route::post('/{testId}/duplicate', [AdminPlacementTestController::class, 'duplicate'])
            ->name('duplicate');
        Route::get('/{testId}/preview', [AdminPlacementTestController::class, 'preview'])
            ->name('preview');
        Route::get('/{testId}/analytics', [AdminPlacementTestController::class, 'analytics'])
            ->name('analytics');

        // Question management nested under placement tests
        Route::prefix('{testId}/questions')->name('questions.')->group(function () {
            // Bulk actions, with specific paths first
            Route::post('/bulk-update', [AdminQuestionController::class, 'bulkUpdateForPlacementTest'])
                ->name('bulk-update');
            Route::post('/reorder', [AdminQuestionController::class, 'reorderForPlacementTest'])
                ->name('reorder');

            // CRUD actions
            Route::get('/', [AdminQuestionController::class, 'indexForPlacementTest'])
                ->name('index');
            Route::get('/create', [AdminQuestionController::class, 'createForPlacementTest'])
                ->name('create');
            Route::post('/', [AdminQuestionController::class, 'storeForPlacementTest'])
                ->name('store');

            // Single question actions
            Route::get('/{question}', [AdminQuestionController::class, 'showForPlacementTest'])
                ->name('show');
            Route::get('/{question}/edit', [AdminQuestionController::class, 'editForPlacementTest'])
                ->name('edit');
            Route::put('/{question}', [AdminQuestionController::class, 'updateForPlacementTest'])
                ->name('update');
            Route::delete('/{question}', [AdminQuestionController::class, 'destroyForPlacementTest'])
                ->name('destroy');
            Route::post('/{question}/duplicate', [AdminQuestionController::class, 'duplicateForPlacementTest'])
                ->name('duplicate');
        });
    });

    // ==================== Global Test Management ====================
    Route::prefix('tests')->name('tests.')->group(function () {
        Route::get('/', [AdminTestController::class, 'index'])->name('index');
        Route::get('/{test}', [AdminTestController::class, 'show'])->name('show');
        Route::get('/{test}/edit', [AdminTestController::class, 'edit'])->name('edit');
        Route::put('/{test}', [AdminTestController::class, 'update'])->name('update');
        Route::delete('/{test}', [AdminTestController::class, 'destroy'])->name('destroy');
        Route::post('/{test}/duplicate', [AdminTestController::class, 'duplicate'])->name('duplicate');
        Route::get('/{test}/preview', [AdminTestController::class, 'preview'])->name('preview');
    });

    // ==================== AI Lesson Generation Routes ====================
    // Admin-only (parent group), but still throttled: a single admin session
    // (or a scripted/compromised one) could otherwise burn the Gemini quota.
    // generate() actually calls Gemini, so it is the tightest limit.
    Route::prefix('ai-lessons')->name('ai-lessons.')->group(function () {
        Route::get('/create', [AILessonController::class, 'create'])->name('create');
        Route::post('/generate', [AILessonController::class, 'generate'])
            ->middleware('throttle:10,1')
            ->name('generate');
        Route::post('/store', [AILessonController::class, 'store'])
            ->middleware('throttle:20,1')
            ->name('store');
        Route::get('/test-connection', [AILessonController::class, 'testConnection'])
            ->middleware('throttle:6,1')
            ->name('test-connection');
    });

    // ==================== Student Learning Path Assignment Routes ====================
    Route::prefix('student-paths')->name('student-paths.')->group(function () {
        // Analytics report, with specific paths first
        Route::get('/analytics/overview', [AdminStudentPathController::class, 'analytics'])
            ->name('analytics');

        // Bulk actions
        Route::post('/bulk-assign', [AdminStudentPathController::class, 'bulkAssign'])
            ->name('bulk-assign');

        // CRUD
        Route::get('/', [AdminStudentPathController::class, 'index'])->name('index');
        Route::get('/create', [AdminStudentPathController::class, 'create'])->name('create');
        Route::post('/', [AdminStudentPathController::class, 'store'])->name('store');
        Route::get('/{studentPath}', [AdminStudentPathController::class, 'show'])->name('show');
        Route::get('/{studentPath}/edit', [AdminStudentPathController::class, 'edit'])->name('edit');
        Route::put('/{studentPath}', [AdminStudentPathController::class, 'update'])->name('update');
        Route::delete('/{studentPath}', [AdminStudentPathController::class, 'destroy'])->name('destroy');

        // Status action routes
        Route::post('/{studentPath}/pause', [AdminStudentPathController::class, 'pause'])->name('pause');
        Route::post('/{studentPath}/resume', [AdminStudentPathController::class, 'resume'])->name('resume');
        Route::post('/{studentPath}/update-progress', [AdminStudentPathController::class, 'updateProgress'])->name('update-progress');
    });

    // ==================== Learning Path Management Routes ====================
    Route::prefix('learning-paths')->name('learning-paths.')->group(function () {
        // CRUD
        Route::get('/', [AdminLearningPathController::class, 'index'])->name('index');
        Route::get('/create', [AdminLearningPathController::class, 'create'])->name('create');
        Route::post('/', [AdminLearningPathController::class, 'store'])->name('store');
        Route::get('/{path}', [AdminLearningPathController::class, 'show'])->name('show');
        Route::get('/{path}/edit', [AdminLearningPathController::class, 'edit'])->name('edit');
        Route::put('/{path}', [AdminLearningPathController::class, 'update'])->name('update');
        Route::delete('/{path}', [AdminLearningPathController::class, 'destroy'])->name('destroy');
        Route::post('/{path}/restore', [AdminLearningPathController::class, 'restore'])->name('restore');

        // Lesson management
        Route::get('/{path}/lessons', [AdminLearningPathController::class, 'manageLessons'])->name('lessons.manage');
        Route::post('/{path}/lessons', [AdminLearningPathController::class, 'addLesson'])->name('lessons.add');
        Route::delete('/{path}/lessons/{lesson}', [AdminLearningPathController::class, 'removeLesson'])->name('lessons.remove');
        Route::post('/{path}/lessons/reorder', [AdminLearningPathController::class, 'reorderLessons'])->name('lessons.reorder');
        Route::put('/{path}/lessons/{lesson}/settings', [AdminLearningPathController::class, 'updateLessonSettings'])->name('lessons.settings');

        // Other actions
        Route::post('/{path}/clone', [AdminLearningPathController::class, 'clone'])->name('clone');
        Route::get('/{path}/statistics', [AdminLearningPathController::class, 'statistics'])->name('statistics');
    });

    // ==================== Progress Management Routes ====================
    Route::prefix('progress')->name('progress.')->group(function () {
        // Overview and export, with specific paths first
        Route::get('/', [AdminProgressController::class, 'index'])->name('index');
        Route::get('/export', [AdminProgressController::class, 'export'])->name('export');

        // Lesson progress
        Route::get('/lesson/{lesson}', [AdminProgressController::class, 'showLesson'])->name('lesson');
        Route::post('/lesson/{lesson}/recalculate', [AdminProgressController::class, 'recalculateLesson'])->name('lesson.recalculate');

        // Student progress
        Route::get('/student/{student}', [AdminProgressController::class, 'showStudent'])->name('student');

        // Single progress details, with parameter routes last
        Route::get('/{progress}', [AdminProgressController::class, 'show'])->name('show');
        Route::post('/{progress}/recalculate', [AdminProgressController::class, 'recalculate'])->name('recalculate');
        Route::post('/{progress}/reset', [AdminProgressController::class, 'reset'])->name('reset');
    });

    // ==================== Resource Routes ====================
    Route::post('lessons/quick-draft', [AdminLessonController::class, 'quickDraft'])
        ->name('lessons.quick-draft');
    Route::resource('lessons', AdminLessonController::class);
    Route::resource('exercises', AdminExerciseController::class);

    // ==================== Reward Customization Routes ====================
    // These MUST be registered before Route::resource('rewards'): the
    // resource route rewards/{reward} matches first otherwise, so
    // /admin/rewards/stats resolves as reward id "stats" and 404s.
    Route::get('rewards/stats', [AdminRewardController::class, 'getStats'])
        ->name('rewards.stats');
    Route::get('rewards/background/create', [AdminRewardController::class, 'createBackground'])
        ->name('rewards.background.create');
    Route::post('rewards/background', [AdminRewardController::class, 'storeBackground'])
        ->name('rewards.background.store');
    Route::post('rewards/{reward}/toggle-active', [AdminRewardController::class, 'toggleActive'])
        ->name('rewards.toggleActive');
    Route::post('rewards/batch/update-stock', [AdminRewardController::class, 'batchUpdateStock'])
        ->name('rewards.batchUpdateStock');

    Route::resource('rewards', AdminRewardController::class);

    Route::get('daily-challenges', [AdminDailyChallengeController::class, 'index'])
        ->name('daily-challenges.index');
    Route::put('daily-challenges/{dailyChallengeDefinition}', [AdminDailyChallengeController::class, 'update'])
        ->name('daily-challenges.update');

    // ==================== Lesson Exercise Management Routes ====================
    Route::prefix('lessons/{lesson}/exercises')->name('lessons.exercises.')->group(function () {
        // Coding exercise routes, with specific paths first
        Route::get('/coding/create', [AdminExerciseController::class, 'createCodingExercise'])
            ->name('coding.create');

        // CRUD
        Route::get('/', [AdminExerciseController::class, 'indexForLesson'])->name('index');
        Route::get('/create', [AdminExerciseController::class, 'createForLesson'])->name('create');
        Route::post('/', [AdminExerciseController::class, 'storeForLesson'])->name('store');
        Route::get('/{exercise}', [AdminExerciseController::class, 'showForLesson'])->name('show');
        Route::get('/{exercise}/edit', [AdminExerciseController::class, 'editForLesson'])->name('edit');
        Route::put('/{exercise}', [AdminExerciseController::class, 'updateForLesson'])->name('update');
        Route::delete('/{exercise}', [AdminExerciseController::class, 'destroyForLesson'])->name('destroy');

        // Coding exercise editing
        Route::get('/{exercise}/coding/edit', [AdminExerciseController::class, 'editCodingExercise'])
            ->name('coding.edit');
    });

    // ==================== Lesson Test Management Routes ====================
    Route::prefix('lessons/{lesson}/tests')->name('lessons.tests.')->group(function () {
        // Bulk actions, with specific paths first
        Route::post('/bulk-update', [AdminTestController::class, 'bulkUpdate'])->name('bulk-update');
        Route::post('/reorder', [AdminTestController::class, 'reorder'])->name('reorder');

        // CRUD
        Route::get('/', [AdminTestController::class, 'indexForLesson'])->name('index');
        Route::get('/create', [AdminTestController::class, 'createForLesson'])->name('create');
        Route::post('/', [AdminTestController::class, 'storeForLesson'])->name('store');
        Route::get('/{test}', [AdminTestController::class, 'showForLesson'])->name('show');
        Route::get('/{test}/edit', [AdminTestController::class, 'editForLesson'])->name('edit');
        Route::put('/{test}', [AdminTestController::class, 'updateForLesson'])->name('update');
        Route::delete('/{test}', [AdminTestController::class, 'destroyForLesson'])->name('destroy');

        // Test actions
        Route::post('/{test}/duplicate', [AdminTestController::class, 'duplicate'])->name('duplicate');
        Route::get('/{test}/preview', [AdminTestController::class, 'preview'])->name('preview');

        // Question management nested under tests
        Route::prefix('{test}/questions')->name('questions.')->group(function () {
            // Bulk actions, with specific paths first
            Route::post('/bulk-update', [AdminQuestionController::class, 'bulkUpdate'])->name('bulk-update');
            Route::post('/reorder', [AdminQuestionController::class, 'reorder'])->name('reorder');

            // CRUD
            Route::get('/', [AdminQuestionController::class, 'indexForTest'])->name('index');
            Route::get('/create', [AdminQuestionController::class, 'createForTest'])->name('create');
            Route::post('/', [AdminQuestionController::class, 'storeForTest'])->name('store');
            Route::get('/{question}', [AdminQuestionController::class, 'showForTest'])->name('show');
            Route::get('/{question}/edit', [AdminQuestionController::class, 'editForTest'])->name('edit');
            Route::put('/{question}', [AdminQuestionController::class, 'updateForTest'])->name('update');
            Route::delete('/{question}', [AdminQuestionController::class, 'destroyForTest'])->name('destroy');

            // Question actions
            Route::post('/{question}/duplicate', [AdminQuestionController::class, 'duplicate'])->name('duplicate');
        });
    });

    // ==================== Forum Report Management Routes ====================
    Route::prefix('forum/reports')->name('forum.reports.')->group(function () {
        // Bulk actions, with specific paths first
        Route::post('/batch-update', [ForumReportController::class, 'batchUpdate'])->name('batch-update');

        // Report list
        Route::get('/', [ForumReportController::class, 'index'])->name('index');

        // Single report actions
        Route::get('/{id}', [ForumReportController::class, 'show'])->name('show');
        Route::post('/{id}/status', [ForumReportController::class, 'updateStatus'])->name('status');
        Route::post('/{id}/delete-content', [ForumReportController::class, 'deleteContent'])->name('delete-content');
        Route::delete('/{id}', [ForumReportController::class, 'destroy'])->name('destroy');
    });

    // ==================== AI Log Management Routes ====================
    Route::prefix('ai-logs')->name('ai-logs.')->group(function () {
        // Bulk actions, with specific paths first
        Route::post('/bulk-delete', [AdminAILogController::class, 'bulkDelete'])->name('bulk-delete');
        Route::post('/delete-preview', [AdminAILogController::class, 'deletePreview'])->name('delete-preview');

        // Main page
        Route::get('/', [AdminAILogController::class, 'index'])->name('index');

        // View sessions
        Route::get('/session/{sessionId}', [AdminAILogController::class, 'showSession'])->name('session');
        Route::delete('/session/{sessionId}', [AdminAILogController::class, 'deleteSession'])->name('delete-session');
    });
});
