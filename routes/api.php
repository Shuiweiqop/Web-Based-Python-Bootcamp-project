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
use App\Http\Controllers\Student\RewardController as StudentRewardController;
use App\Http\Controllers\Student\InventoryController as StudentInventoryController;
use App\Http\Controllers\Api\CodeExecutionController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\OtpController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Http\Controllers\SearchController;
// ==================== Landing Page (公开访问) ====================
Route::get('/', [DashboardController::class, 'home'])->name('home');

// ==================== OTP 路由（guest 用户可访问）====================
Route::middleware('guest')->group(function () {
    // 显示 OTP 验证页面
    Route::get('/verify-otp', [OtpController::class, 'show'])->name('otp.show');

    // 发送 OTP
    Route::post('/otp/send', [OtpController::class, 'send'])->name('otp.send');

    // 验证 OTP
    Route::post('/otp/verify', [OtpController::class, 'verify'])->name('otp.verify');
});

// ==================== 需要认证的路由 ====================
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Lessons
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

    // ==================== 代码执行 API 路由（学生） ====================
    Route::post('/api/code/execute', [CodeExecutionController::class, 'execute'])->name('code.execute');

    // ==================== 论坛路由 ====================
    Route::prefix('forum')->name('forum.')->group(function () {
        // 论坛首页
        Route::get('/', [ForumController::class, 'index'])->name('index');

        // 创建帖子
        Route::get('/create', [ForumController::class, 'create'])->name('create');
        Route::post('/', [ForumController::class, 'store'])->name('store');

        // 查看帖子
        Route::get('/{id}', [ForumController::class, 'show'])->name('show');

        // 编辑帖子
        Route::get('/{id}/edit', [ForumController::class, 'edit'])->name('edit');
        Route::put('/{id}', [ForumController::class, 'update'])->name('update');

        // 删除帖子
        Route::delete('/{id}', [ForumController::class, 'destroy'])->name('destroy');

        // 回复相关
        Route::post('/{id}/reply', [ForumController::class, 'reply'])->name('reply');
        Route::put('/reply/{replyId}', [ForumController::class, 'updateReply'])->name('reply.update');
        Route::delete('/reply/{replyId}', [ForumController::class, 'destroyReply'])->name('reply.destroy');

        // 标记最佳答案
        Route::post('/reply/{replyId}/mark-solution', [ForumController::class, 'markSolution'])->name('reply.mark-solution');

        // AJAX 操作
        Route::post('/{id}/like', [ForumController::class, 'toggleLike'])->name('like');
        Route::post('/reply/{replyId}/like', [ForumController::class, 'toggleReplyLike'])->name('reply.like');
        Route::post('/{id}/favorite', [ForumController::class, 'toggleFavorite'])->name('favorite');

        // Admin 专用
        Route::post('/{id}/pin', [ForumController::class, 'togglePin'])->name('pin');
        Route::post('/{id}/lock', [ForumController::class, 'toggleLock'])->name('lock');

        // 个人页面
        Route::get('/user/my-posts', [ForumController::class, 'myPosts'])->name('my-posts');
        Route::get('/user/my-favorites', [ForumController::class, 'myFavorites'])->name('my-favorites');
    });

    // ==================== 学生端路由 ====================
    Route::prefix('student')->name('student.')->group(function () {
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
            Route::get('lessons/{lesson}/tests', [TestController::class, 'index'])
                ->name('lessons.tests.index');
            Route::get('lessons/{lesson}/tests/{test}', [TestController::class, 'show'])
                ->name('lessons.tests.show');
            Route::post('lessons/{lesson}/tests/{test}/start', [TestController::class, 'start'])
                ->name('lessons.tests.start');

            // Submission 相关（答题进行中）
            Route::get('submissions/{submission}', [StudentTestController::class, 'taking'])
                ->name('submissions.taking');
            Route::post('submissions/{submission}/answer', [StudentTestController::class, 'submitAnswer'])
                ->name('submissions.answer');
            Route::post('submissions/{submission}/complete', [StudentTestController::class, 'complete'])
                ->name('submissions.complete');
            Route::get('submissions/{submission}/result', [StudentTestController::class, 'result'])
                ->name('submissions.result');
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
        // ==================== 奖励自定义路由（在 resource 之前）====================
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

        // ==================== Resource 路由 ====================
        Route::resource('lessons', AdminLessonController::class);
        Route::resource('exercises', AdminExerciseController::class);
        Route::resource('rewards', AdminRewardController::class);

        // ==================== 管理员练习路由 ====================
        Route::get('lessons/{lesson}/exercises', [AdminExerciseController::class, 'indexForLesson'])
            ->name('lessons.exercises.index');
        Route::get('lessons/{lesson}/exercises/create', [AdminExerciseController::class, 'createForLesson'])
            ->name('lessons.exercises.create');
        Route::post('lessons/{lesson}/exercises', [AdminExerciseController::class, 'storeForLesson'])
            ->name('lessons.exercises.store');
        Route::get('lessons/{lesson}/exercises/{exercise}', [AdminExerciseController::class, 'showForLesson'])
            ->name('lessons.exercises.show');
        Route::get('lessons/{lesson}/exercises/{exercise}/edit', [AdminExerciseController::class, 'editForLesson'])
            ->name('lessons.exercises.edit');
        Route::put('lessons/{lesson}/exercises/{exercise}', [AdminExerciseController::class, 'updateForLesson'])
            ->name('lessons.exercises.update');
        Route::delete('lessons/{lesson}/exercises/{exercise}', [AdminExerciseController::class, 'destroyForLesson'])
            ->name('lessons.exercises.destroy');

        // 管理员 Coding Exercise 专用路由
        Route::prefix('lessons/{lesson}/exercises')->name('lessons.exercises.')->group(function () {
            Route::get('/coding/create', [AdminExerciseController::class, 'createCodingExercise'])
                ->name('coding.create');
            Route::get('/{exercise}/coding/edit', [AdminExerciseController::class, 'editCodingExercise'])
                ->name('coding.edit');
        });

        // ==================== 管理员测验路由 ====================
        Route::prefix('lessons/{lesson}/tests')->name('lessons.tests.')->group(function () {
            Route::get('/', [AdminTestController::class, 'indexForLesson'])->name('index');
            Route::get('/create', [AdminTestController::class, 'createForLesson'])->name('create');
            Route::post('/', [AdminTestController::class, 'storeForLesson'])->name('store');
            Route::get('/{test}', [AdminTestController::class, 'showForLesson'])->name('show');
            Route::get('/{test}/edit', [AdminTestController::class, 'editForLesson'])->name('edit');
            Route::put('/{test}', [AdminTestController::class, 'updateForLesson'])->name('update');
            Route::delete('/{test}', [AdminTestController::class, 'destroyForLesson'])->name('destroy');

            Route::post('/{test}/duplicate', [AdminTestController::class, 'duplicate'])->name('duplicate');
            Route::get('/{test}/preview', [AdminTestController::class, 'preview'])->name('preview');
            Route::post('/bulk-update', [AdminTestController::class, 'bulkUpdate'])->name('bulk-update');
            Route::post('/reorder', [AdminTestController::class, 'reorder'])->name('reorder');

            // 题目管理路由
            Route::prefix('/{test}/questions')->name('questions.')->group(function () {
                Route::get('/', [AdminQuestionController::class, 'indexForTest'])->name('index');
                Route::get('/create', [AdminQuestionController::class, 'createForTest'])->name('create');
                Route::post('/', [AdminQuestionController::class, 'storeForTest'])->name('store');
                Route::get('/{question}', [AdminQuestionController::class, 'showForTest'])->name('show');
                Route::get('/{question}/edit', [AdminQuestionController::class, 'editForTest'])->name('edit');
                Route::put('/{question}', [AdminQuestionController::class, 'updateForTest'])->name('update');
                Route::delete('/{question}', [AdminQuestionController::class, 'destroyForTest'])->name('destroy');

                Route::post('/{question}/duplicate', [AdminQuestionController::class, 'duplicate'])->name('duplicate');
                Route::post('/bulk-update', [AdminQuestionController::class, 'bulkUpdate'])->name('bulk-update');
                Route::post('/reorder', [AdminQuestionController::class, 'reorder'])->name('reorder');
            });
        });
    });
});

// ==================== 用户个人资料路由 ====================
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// ==================== 测试路由 ====================
Route::get('/test-storage', function () {
    dd(Storage::disk('public')->path('rewards'));
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/search', [SearchController::class, 'search']);
    Route::get('/search/suggestions', [SearchController::class, 'suggestions']);
});

require __DIR__ . '/auth.php';
