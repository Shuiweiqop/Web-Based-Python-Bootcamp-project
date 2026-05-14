<?php

use App\Http\Controllers\AdminLessonController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\AdminExerciseController;
use App\Http\Controllers\AdminTestController;
use App\Http\Controllers\StudentTestController;
use App\Http\Controllers\AdminQuestionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentProfileController;
use App\Http\Controllers\AdminRewardController;
use App\Http\Controllers\AdminDailyChallengeController;
use App\Http\Controllers\AdminProgressController;
use App\Http\Controllers\Student\RewardController as StudentRewardController;
use App\Http\Controllers\Student\InventoryController as StudentInventoryController;
use App\Http\Controllers\Student\NotificationController;
use App\Http\Controllers\Api\CodeExecutionController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\ForumReportController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Student\OnboardingController;
use App\Http\Controllers\Student\LearningPathController;
use App\Http\Controllers\Student\MissionController;
use App\Http\Controllers\GeminiController;
use App\Http\Controllers\AdminAILogController;
use App\Http\Controllers\AdminLearningPathController;
use App\Http\Controllers\AdminStudentPathController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\AILessonController;
use App\Http\Controllers\AdminPlacementTestController;
use App\Http\Controllers\AdminStudentController;
use App\Http\Controllers\QuestionImportController;
// ==================== Public Routes ====================
Route::get('/', [DashboardController::class, 'home'])->name('home');

// ==================== Authenticated Routes ====================
Route::middleware(['auth', 'verified'])->group(function () {

    // ==================== Dashboard ====================
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ==================== Lessons ====================
    Route::get('/lessons', [LessonController::class, 'index'])->name('lessons.index');
    Route::get('/lessons/{lesson}', [LessonController::class, 'show'])->name('lessons.show');
    Route::post('/lessons/{lesson}/register', [LessonController::class, 'register'])->name('lessons.register');
    Route::delete('/lessons/{lesson}/cancel-registration', [LessonController::class, 'cancelRegistration'])->name('lessons.cancel-registration');
    Route::post('/lessons/{lesson}/mark-content-complete', [LessonController::class, 'markContentComplete'])->name('lessons.mark-content-complete');
    Route::post('/lessons/{lesson}/complete', [LessonController::class, 'completeLesson'])->name('lessons.complete');
    Route::get('/my-registrations', [LessonController::class, 'myRegistrations'])->name('lessons.my-registrations');

    // ==================== Student Exercise Routes ====================
    Route::prefix('lessons/{lesson}/exercises')->name('lessons.exercises.')->group(function () {
        Route::get('/', [LessonController::class, 'exerciseIndex'])->name('index');
        Route::get('/{exercise}', [LessonController::class, 'exerciseShow'])->name('show');

        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/{exercise}', [LessonController::class, 'getExercise'])->name('get');
            Route::post('/{exercise}/submit', [ExerciseController::class, 'submit'])->name('submit');
        });
    });

    // ==================== Code Execution API Routes ====================
    Route::post('/api/code/execute', [CodeExecutionController::class, 'execute'])
        ->middleware('throttle:20,1')
        ->name('code.execute');
    Route::post('/api/gemini/chat', [GeminiController::class, 'chat'])
        ->middleware('throttle:15,1')
        ->name('gemini.chat');

    // ==================== Search API ====================
    Route::prefix('api')->name('api.')->group(function () {
        Route::get('/search', [SearchController::class, 'search'])->name('search');
        Route::get('/search/suggestions', [SearchController::class, 'suggestions'])->name('search.suggestions');
    });

    // ==================== Forum Routes ====================
    Route::prefix('forum')->name('forum.')->group(function () {
        // Forum home
        Route::get('/', [ForumController::class, 'index'])->name('index');

        // Create posts
        Route::get('/create', [ForumController::class, 'create'])->name('create');
        Route::post('/', [ForumController::class, 'store'])
            ->middleware('throttle:5,1')
            ->name('store');

        // Personal forum pages, with specific paths first
        Route::get('/user/my-posts', [ForumController::class, 'myPosts'])->name('my-posts');
        Route::get('/user/my-favorites', [ForumController::class, 'myFavorites'])->name('my-favorites');

        // View posts
        Route::get('/{id}', [ForumController::class, 'show'])->name('show');

        // Edit posts
        Route::get('/{id}/edit', [ForumController::class, 'edit'])->name('edit');
        Route::put('/{id}', [ForumController::class, 'update'])->name('update');

        // Delete posts
        Route::delete('/{id}', [ForumController::class, 'destroy'])->name('destroy');

        // Post interactions
        Route::post('/{id}/like', [ForumController::class, 'toggleLike'])->name('like');
        Route::post('/{id}/favorite', [ForumController::class, 'toggleFavorite'])->name('favorite');
        Route::post('/{id}/report', [ForumController::class, 'reportPost'])->name('report');

        // Admin-only post actions
        Route::post('/{id}/pin', [ForumController::class, 'togglePin'])->name('pin');
        Route::post('/{id}/lock', [ForumController::class, 'toggleLock'])->name('lock');

        // Reply routes
        Route::post('/{id}/reply', [ForumController::class, 'reply'])
            ->middleware('throttle:10,1')
            ->name('reply');
        Route::put('/reply/{replyId}', [ForumController::class, 'updateReply'])->name('reply.update');
        Route::delete('/reply/{replyId}', [ForumController::class, 'destroyReply'])->name('reply.destroy');
        Route::post('/reply/{replyId}/like', [ForumController::class, 'toggleReplyLike'])->name('reply.like');
        Route::post('/reply/{replyId}/report', [ForumController::class, 'reportReply'])->name('reply.report');
        Route::post('/reply/{replyId}/mark-solution', [ForumController::class, 'markSolution'])->name('reply.mark-solution');
    });

    // ==================== Student Area Routes ====================
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

    // ==================== Admin Area ====================
    Route::prefix('admin')->name('admin.')->middleware(['role:administrator'])->group(function () {

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
        Route::prefix('ai-lessons')->name('ai-lessons.')->group(function () {
            Route::get('/create', [AILessonController::class, 'create'])->name('create');
            Route::post('/generate', [AILessonController::class, 'generate'])->name('generate');
            Route::post('/store', [AILessonController::class, 'store'])->name('store');
            Route::get('/test-connection', [AILessonController::class, 'testConnection'])->name('test-connection');
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
        Route::resource('rewards', AdminRewardController::class);
        Route::get('daily-challenges', [AdminDailyChallengeController::class, 'index'])
            ->name('daily-challenges.index');
        Route::put('daily-challenges/{dailyChallengeDefinition}', [AdminDailyChallengeController::class, 'update'])
            ->name('daily-challenges.update');

        // ==================== Reward Customization Routes ====================
        Route::get('rewards/background/create', [AdminRewardController::class, 'createBackground'])
            ->name('rewards.background.create');
        Route::post('rewards/background', [AdminRewardController::class, 'storeBackground'])
            ->name('rewards.background.store');
        Route::post('rewards/{reward}/toggle-active', [AdminRewardController::class, 'toggleActive'])
            ->name('rewards.toggleActive');
        Route::post('rewards/batch/update-stock', [AdminRewardController::class, 'batchUpdateStock'])
            ->name('rewards.batchUpdateStock');
        Route::get('rewards/stats', [AdminRewardController::class, 'getStats'])
            ->name('rewards.stats');

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
});

// ==================== User Profile Routes ====================
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// ==================== Local Test Routes ====================
if (app()->environment('local')) {
    Route::middleware(['auth', 'role:administrator'])->get('/test-gemini', function () {
        try {
            $apiKey = config('services.gemini.key');

            if (!$apiKey) {
                return response()->json(['error' => 'API key not found']);
            }

            $response = \Illuminate\Support\Facades\Http::timeout(30)->post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}",
                [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => 'Say hello in one sentence']
                            ]
                        ]
                    ]
                ]
            );

            if ($response->failed()) {
                return response()->json([
                    'success' => false,
                    'error' => $response->json()
                ]);
            }

            $data = $response->json();

            return response()->json([
                'success' => true,
                'message' => $data['candidates'][0]['content']['parts'][0]['text'] ?? 'No response',
                'model_used' => 'gemini-2.5-flash'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    });
}

require __DIR__ . '/auth.php';
