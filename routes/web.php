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
use App\Http\Controllers\GeminiController;
use App\Http\Controllers\AdminAILogController;
use App\Http\Controllers\AdminLearningPathController;
use App\Http\Controllers\AdminStudentPathController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\AILessonController;
use App\Http\Controllers\AdminPlacementTestController;
use App\Http\Controllers\AdminStudentController;
use App\Http\Controllers\QuestionImportController;
// ==================== 公开路由 ====================
Route::get('/', [DashboardController::class, 'home'])->name('home');

// ==================== 需要认证的路由 ====================
Route::middleware(['auth', 'verified'])->group(function () {

    // ==================== Dashboard ====================
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ==================== Lessons ====================
    Route::get('/lessons', [LessonController::class, 'index'])->name('lessons.index');
    Route::get('/lessons/{lesson}', [LessonController::class, 'show'])->name('lessons.show');
    Route::post('/lessons/{lesson}/register', [LessonController::class, 'register'])->name('lessons.register');
    Route::delete('/lessons/{lesson}/cancel-registration', [LessonController::class, 'cancelRegistration'])->name('lessons.cancel-registration');
    Route::post('/lessons/{lesson}/complete', [LessonController::class, 'completeLesson'])->name('lessons.complete');
    Route::get('/my-registrations', [LessonController::class, 'myRegistrations'])->name('lessons.my-registrations');

    // ==================== 学生游戏/练习路由 ====================
    Route::prefix('lessons/{lesson}/exercises')->name('lessons.exercises.')->group(function () {
        Route::get('/', [LessonController::class, 'exerciseIndex'])->name('index');
        Route::get('/{exercise}', [LessonController::class, 'exerciseShow'])->name('show');

        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/{exercise}', [LessonController::class, 'getExercise'])->name('get');
            Route::post('/{exercise}/submit', [ExerciseController::class, 'submit'])->name('submit');
        });
    });

    // ==================== 代码执行 API 路由 ====================
    Route::post('/api/code/execute', [CodeExecutionController::class, 'execute'])->name('code.execute');
    Route::post('/api/gemini/chat', [GeminiController::class, 'chat'])->name('gemini.chat');

    // ==================== 搜索 API ====================
    Route::prefix('api')->name('api.')->group(function () {
        Route::get('/search', [SearchController::class, 'search'])->name('search');
        Route::get('/search/suggestions', [SearchController::class, 'suggestions'])->name('search.suggestions');
    });

    // ==================== 论坛路由 ====================
    Route::prefix('forum')->name('forum.')->group(function () {
        // 论坛首页
        Route::get('/', [ForumController::class, 'index'])->name('index');

        // 创建帖子
        Route::get('/create', [ForumController::class, 'create'])->name('create');
        Route::post('/', [ForumController::class, 'store'])->name('store');

        // 个人页面（具体路径优先）
        Route::get('/user/my-posts', [ForumController::class, 'myPosts'])->name('my-posts');
        Route::get('/user/my-favorites', [ForumController::class, 'myFavorites'])->name('my-favorites');

        // 查看帖子
        Route::get('/{id}', [ForumController::class, 'show'])->name('show');

        // 编辑帖子
        Route::get('/{id}/edit', [ForumController::class, 'edit'])->name('edit');
        Route::put('/{id}', [ForumController::class, 'update'])->name('update');

        // 删除帖子
        Route::delete('/{id}', [ForumController::class, 'destroy'])->name('destroy');

        // 帖子互动操作
        Route::post('/{id}/like', [ForumController::class, 'toggleLike'])->name('like');
        Route::post('/{id}/favorite', [ForumController::class, 'toggleFavorite'])->name('favorite');
        Route::post('/{id}/report', [ForumController::class, 'reportPost'])->name('report');

        // Admin 专用操作
        Route::post('/{id}/pin', [ForumController::class, 'togglePin'])->name('pin');
        Route::post('/{id}/lock', [ForumController::class, 'toggleLock'])->name('lock');

        // 回复相关
        Route::post('/{id}/reply', [ForumController::class, 'reply'])->name('reply');
        Route::put('/reply/{replyId}', [ForumController::class, 'updateReply'])->name('reply.update');
        Route::delete('/reply/{replyId}', [ForumController::class, 'destroyReply'])->name('reply.destroy');
        Route::post('/reply/{replyId}/like', [ForumController::class, 'toggleReplyLike'])->name('reply.like');
        Route::post('/reply/{replyId}/report', [ForumController::class, 'reportReply'])->name('reply.report');
        Route::post('/reply/{replyId}/mark-solution', [ForumController::class, 'markSolution'])->name('reply.mark-solution');
    });

    // ==================== 学生端路由 ====================
    Route::prefix('student')->name('student.')->group(function () {

        // ==================== 入学评估（Onboarding）====================
        Route::prefix('onboarding')->name('onboarding.')->group(function () {
            Route::get('/', [OnboardingController::class, 'index'])->name('index');
            Route::get('/start-test', [OnboardingController::class, 'startTest'])->name('start-test');
            Route::get('/result/{submission}', [OnboardingController::class, 'result'])->name('result');
            Route::post('/accept-path/{path}', [OnboardingController::class, 'acceptPath'])->name('accept-path');
            Route::post('/choose-path', [OnboardingController::class, 'choosePath'])->name('choose-path');
            Route::get('/skip', [OnboardingController::class, 'skip'])->name('skip');
        });

        // ==================== 学习路径路由 ====================
        Route::prefix('paths')->name('paths.')->group(function () {
            Route::get('/', [LearningPathController::class, 'index'])->name('index');
            Route::get('/browse', [LearningPathController::class, 'browse'])->name('browse');
            Route::get('/{path}', [LearningPathController::class, 'show'])->name('show');
            Route::get('/{path}/progress', [LearningPathController::class, 'progress'])->name('progress');
            Route::post('/{path}/enroll', [LearningPathController::class, 'enroll'])->name('enroll');
            Route::post('/{path}/pause', [LearningPathController::class, 'pause'])->name('pause');
            Route::post('/{path}/resume', [LearningPathController::class, 'resume'])->name('resume');
        });

        // ==================== 学生个人资料路由 ====================
        Route::prefix('profile')->name('profile.')->group(function () {
            Route::get('/', [StudentProfileController::class, 'show'])->name('show');
            Route::get('/edit', [StudentProfileController::class, 'edit'])->name('edit');
            Route::put('/', [StudentProfileController::class, 'update'])->name('update');
            Route::get('/rewards', [StudentProfileController::class, 'rewards'])->name('rewards.index');
            Route::get('/statistics', [StudentProfileController::class, 'statistics'])->name('statistics');
            Route::get('/history', [StudentProfileController::class, 'history'])->name('history');
            Route::get('/points', [StudentProfileController::class, 'points'])->name('points');
        });

        // ==================== 测验相关路由 ====================
        Route::middleware(['role:student'])->group(function () {
            // 课程测验列表和详情
            Route::get('lessons/{lesson}/tests', [StudentTestController::class, 'index'])
                ->name('lessons.tests.index');
            Route::get('lessons/{lesson}/tests/{test}', [StudentTestController::class, 'show'])
                ->name('lessons.tests.show');
            Route::post('lessons/{lesson}/tests/{test}/start', [StudentTestController::class, 'start'])
                ->name('lessons.tests.start');


            // 提交答案
            Route::get('submissions/{submission}', [StudentTestController::class, 'taking'])
                ->name('submissions.taking');
            Route::post('submissions/{submission}/answer', [StudentTestController::class, 'submitAnswer'])
                ->name('submissions.answer');
            Route::post('submissions/{submission}/complete', [StudentTestController::class, 'complete'])
                ->name('submissions.complete');
            Route::get('submissions/{submission}/result', [StudentTestController::class, 'result'])
                ->name('submissions.result');
        });

        // ==================== 通知系统路由 ====================
        Route::prefix('notifications')->name('notifications.')->group(function () {
            // API 路由（具体路径优先）
            Route::get('/unread', [NotificationController::class, 'unread'])
                ->name('unread');
            Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])
                ->name('read-all');
            Route::post('/read-multiple', [NotificationController::class, 'markMultipleAsRead'])
                ->name('read-multiple');

            // 批量操作
            Route::delete('/bulk/delete', [NotificationController::class, 'destroyMultiple'])
                ->name('destroy-multiple');
            Route::delete('/clear/read', [NotificationController::class, 'clearRead'])
                ->name('clear-read');

            // 通知中心页面
            Route::get('/', [NotificationController::class, 'index'])
                ->name('index');

            // 单个通知操作（参数路由放最后）
            Route::post('/{notification}/read', [NotificationController::class, 'markAsRead'])
                ->name('read');
            Route::delete('/{notification}', [NotificationController::class, 'destroy'])
                ->name('destroy');
        });

        // ==================== 学生奖励系统路由 ====================
        Route::get('/rewards', [StudentRewardController::class, 'index'])->name('rewards.index');
        Route::get('/rewards/history', [StudentRewardController::class, 'history'])->name('rewards.history');
        Route::get('/rewards/{id}', [StudentRewardController::class, 'show'])->name('rewards.show');
        Route::post('/rewards/{id}/purchase', [StudentRewardController::class, 'purchase'])->name('rewards.purchase');

        // ==================== 统一的库存管理路由 ====================
        Route::controller(StudentInventoryController::class)->prefix('inventory')->name('inventory.')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/equipped', 'equipped')->name('equipped');
            Route::post('/{id}/equip', 'equip')->name('equip');
            Route::post('/{id}/unequip', 'unequip')->name('unequip');
            Route::post('/{id}/toggle', 'toggle')->name('toggle');
        });
    });

    // ==================== Admin 区域 ====================
    Route::prefix('admin')->name('admin.')->middleware(['role:administrator'])->group(function () {

        // ==================== 学生管理 ====================
        Route::prefix('students')->name('students.')->group(function () {
            Route::get('/', [AdminStudentController::class, 'index'])->name('index');
            Route::get('/{student}', [AdminStudentController::class, 'show'])->name('show');
            Route::get('/{student}/edit', [AdminStudentController::class, 'edit'])->name('edit');
            Route::put('/{student}', [AdminStudentController::class, 'update'])->name('update');
            Route::delete('/{student}', [AdminStudentController::class, 'destroy'])->name('destroy');
            Route::post('/{student}/adjust-points', [AdminStudentController::class, 'adjustPoints'])->name('adjust-points');
            Route::post('/{student}/reset-password', [AdminStudentController::class, 'resetPassword'])->name('reset-password');
        });

        // ==================== 入学评估测试管理（独立，不需要 lesson）====================
        Route::prefix('placement-tests')->name('placement-tests.')->group(function () {
            // 基础 CRUD（具体路径优先）
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
            // 特殊操作路由（在参数路由之前）
            Route::post('/bulk-update', [AdminPlacementTestController::class, 'bulkUpdate'])
                ->name('bulk-update');

            // 单个测试操作（参数路由）
            Route::get('/{testId}', [AdminPlacementTestController::class, 'show'])
                ->name('show');
            Route::get('/{testId}/edit', [AdminPlacementTestController::class, 'edit'])
                ->name('edit');
            Route::put('/{testId}', [AdminPlacementTestController::class, 'update'])
                ->name('update');
            Route::delete('/{testId}', [AdminPlacementTestController::class, 'destroy'])
                ->name('destroy');

            // 测试相关操作
            Route::post('/{testId}/set-default', [AdminPlacementTestController::class, 'setAsDefault'])
                ->name('set-default');
            Route::post('/{testId}/duplicate', [AdminPlacementTestController::class, 'duplicate'])
                ->name('duplicate');
            Route::get('/{testId}/preview', [AdminPlacementTestController::class, 'preview'])
                ->name('preview');
            Route::get('/{testId}/analytics', [AdminPlacementTestController::class, 'analytics'])
                ->name('analytics');

            // 题目管理（嵌套在 placement test 下）
            Route::prefix('{testId}/questions')->name('questions.')->group(function () {
                // 批量操作（具体路径优先）
                Route::post('/bulk-update', [AdminQuestionController::class, 'bulkUpdateForPlacementTest'])
                    ->name('bulk-update');
                Route::post('/reorder', [AdminQuestionController::class, 'reorderForPlacementTest'])
                    ->name('reorder');

                // CRUD 操作
                Route::get('/', [AdminQuestionController::class, 'indexForPlacementTest'])
                    ->name('index');
                Route::get('/create', [AdminQuestionController::class, 'createForPlacementTest'])
                    ->name('create');
                Route::post('/', [AdminQuestionController::class, 'storeForPlacementTest'])
                    ->name('store');

                // 单个题目操作（参数路由）
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

        // ==================== 全局测试管理（查看所有测试）====================
        Route::prefix('tests')->name('tests.')->group(function () {
            Route::get('/', [AdminTestController::class, 'index'])->name('index');
            Route::get('/{test}', [AdminTestController::class, 'show'])->name('show');
            Route::get('/{test}/edit', [AdminTestController::class, 'edit'])->name('edit');
            Route::put('/{test}', [AdminTestController::class, 'update'])->name('update');
            Route::delete('/{test}', [AdminTestController::class, 'destroy'])->name('destroy');
            Route::post('/{test}/duplicate', [AdminTestController::class, 'duplicate'])->name('duplicate');
            Route::get('/{test}/preview', [AdminTestController::class, 'preview'])->name('preview');
        });

        // ==================== AI 课程生成路由 ====================
        Route::prefix('ai-lessons')->name('ai-lessons.')->group(function () {
            Route::get('/create', [AILessonController::class, 'create'])->name('create');
            Route::post('/generate', [AILessonController::class, 'generate'])->name('generate');
            Route::post('/store', [AILessonController::class, 'store'])->name('store');
            Route::get('/test-connection', [AILessonController::class, 'testConnection'])->name('test-connection');
        });

        // ==================== 学生学习路径管理路由 ====================
        Route::prefix('student-paths')->name('student-paths.')->group(function () {
            // 分析报告（具体路径优先）
            Route::get('/analytics/overview', [AdminStudentPathController::class, 'analytics'])
                ->name('analytics');

            // 批量操作
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

            // 操作路由
            Route::post('/{studentPath}/pause', [AdminStudentPathController::class, 'pause'])->name('pause');
            Route::post('/{studentPath}/resume', [AdminStudentPathController::class, 'resume'])->name('resume');
            Route::post('/{studentPath}/update-progress', [AdminStudentPathController::class, 'updateProgress'])->name('update-progress');
        });

        // ==================== 学习路径管理路由 ====================
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

            // 课程管理
            Route::get('/{path}/lessons', [AdminLearningPathController::class, 'manageLessons'])->name('lessons.manage');
            Route::post('/{path}/lessons', [AdminLearningPathController::class, 'addLesson'])->name('lessons.add');
            Route::delete('/{path}/lessons/{lesson}', [AdminLearningPathController::class, 'removeLesson'])->name('lessons.remove');
            Route::post('/{path}/lessons/reorder', [AdminLearningPathController::class, 'reorderLessons'])->name('lessons.reorder');
            Route::put('/{path}/lessons/{lesson}/settings', [AdminLearningPathController::class, 'updateLessonSettings'])->name('lessons.settings');

            // 其他操作
            Route::post('/{path}/clone', [AdminLearningPathController::class, 'clone'])->name('clone');
            Route::get('/{path}/statistics', [AdminLearningPathController::class, 'statistics'])->name('statistics');
        });

        // ==================== 课程进度管理路由 ====================
        Route::prefix('progress')->name('progress.')->group(function () {
            // 总览和导出（具体路径优先）
            Route::get('/', [AdminProgressController::class, 'index'])->name('index');
            Route::get('/export', [AdminProgressController::class, 'export'])->name('export');

            // 课程进度
            Route::get('/lesson/{lesson}', [AdminProgressController::class, 'showLesson'])->name('lesson');
            Route::post('/lesson/{lesson}/recalculate', [AdminProgressController::class, 'recalculateLesson'])->name('lesson.recalculate');

            // 学生进度
            Route::get('/student/{student}', [AdminProgressController::class, 'showStudent'])->name('student');

            // 单个进度详情（参数路由放最后）
            Route::get('/{progress}', [AdminProgressController::class, 'show'])->name('show');
            Route::post('/{progress}/recalculate', [AdminProgressController::class, 'recalculate'])->name('recalculate');
            Route::post('/{progress}/reset', [AdminProgressController::class, 'reset'])->name('reset');
        });

        // ==================== Resource 路由 ====================
        Route::resource('lessons', AdminLessonController::class);
        Route::resource('exercises', AdminExerciseController::class);
        Route::resource('rewards', AdminRewardController::class)->except(['destroy']);

        // ==================== 奖励自定义路由 ====================
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

        // ==================== 课程练习管理路由 ====================
        Route::prefix('lessons/{lesson}/exercises')->name('lessons.exercises.')->group(function () {
            // Coding Exercise 专用路由（具体路径优先）
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

            // Coding Exercise 编辑
            Route::get('/{exercise}/coding/edit', [AdminExerciseController::class, 'editCodingExercise'])
                ->name('coding.edit');
        });

        // ==================== 课程测试管理路由（需要 lesson 上下文）====================
        Route::prefix('lessons/{lesson}/tests')->name('lessons.tests.')->group(function () {
            // 批量操作（具体路径优先）
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

            // 测试操作
            Route::post('/{test}/duplicate', [AdminTestController::class, 'duplicate'])->name('duplicate');
            Route::get('/{test}/preview', [AdminTestController::class, 'preview'])->name('preview');

            // 题目管理路由（嵌套在 test 下）
            Route::prefix('{test}/questions')->name('questions.')->group(function () {
                // 批量操作（具体路径优先）
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

                // 题目操作
                Route::post('/{question}/duplicate', [AdminQuestionController::class, 'duplicate'])->name('duplicate');
            });
        });

        // ==================== 论坛举报管理路由 ====================
        Route::prefix('forum/reports')->name('forum.reports.')->group(function () {
            // 批量操作（具体路径优先）
            Route::post('/batch-update', [ForumReportController::class, 'batchUpdate'])->name('batch-update');

            // 举报列表
            Route::get('/', [ForumReportController::class, 'index'])->name('index');

            // 单个举报操作
            Route::get('/{id}', [ForumReportController::class, 'show'])->name('show');
            Route::post('/{id}/status', [ForumReportController::class, 'updateStatus'])->name('status');
            Route::post('/{id}/delete-content', [ForumReportController::class, 'deleteContent'])->name('delete-content');
            Route::delete('/{id}', [ForumReportController::class, 'destroy'])->name('destroy');
        });

        // ==================== AI 日志管理路由 ====================
        Route::prefix('ai-logs')->name('ai-logs.')->group(function () {
            // 批量操作（具体路径优先）
            Route::post('/bulk-delete', [AdminAILogController::class, 'bulkDelete'])->name('bulk-delete');
            Route::post('/delete-preview', [AdminAILogController::class, 'deletePreview'])->name('delete-preview');

            // 主页面
            Route::get('/', [AdminAILogController::class, 'index'])->name('index');

            // 查看会话
            Route::get('/session/{sessionId}', [AdminAILogController::class, 'showSession'])->name('session');
            Route::delete('/session/{sessionId}', [AdminAILogController::class, 'deleteSession'])->name('delete-session');
        });
    });
});

// ==================== 用户个人资料路由 ====================
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// ==================== 测试路由（仅限本地管理员）====================
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
