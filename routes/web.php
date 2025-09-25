<?php

use App\Http\Controllers\StudentLessonController;
use App\Http\Controllers\AdminLessonController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\AdminExerciseController;
use App\Http\Controllers\AdminTestController;
use App\Http\Controllers\TestController as StudentTestController; // 更新导入
use App\Http\Controllers\AdminQuestionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('LandingPage', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

// 只有登录且验证邮箱的用户可以访问 dashboard 与 admin 区
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/lessons', [LessonController::class, 'index'])->name('lessons.index');
    Route::get('/lessons/{lesson}', [LessonController::class, 'show'])->name('lessons.show');

    Route::post('/lessons/{lesson}/register', [LessonController::class, 'register'])->name('lessons.register');

    // Cancel registration
    Route::delete('/lessons/{lesson}/cancel-registration', [LessonController::class, 'cancelRegistration'])->name('lessons.cancel-registration');
    // View my registrations
    Route::get('/my-registrations', [LessonController::class, 'myRegistrations'])->name('lessons.my-registrations');

    // ==================== 学生游戏/练习路由 ====================
    Route::prefix('lessons/{lesson}/exercises')->name('lessons.exercises.')->group(function () {
        Route::get('/', [LessonController::class, 'exerciseIndex'])->name('index');
        Route::get('/{exercise}', [LessonController::class, 'exerciseShow'])->name('show');

        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/{exercise}', [LessonController::class, 'getExercise'])->name('get');
            Route::post('/{exercise}/submit', [LessonController::class, 'submitExercise'])->name('submit');
        });
    });

    // ==================== 学生测试路由（更新为新结构）====================
    Route::prefix('student')->name('student.')->middleware(['role:student'])->group(function () {
        // 课程中的测验列表
        Route::get('lessons/{lesson}/tests', [StudentTestController::class, 'indexForLesson'])
            ->name('lessons.tests.index');

        // 测验相关路由
        Route::prefix('tests')->name('tests.')->group(function () {
            // 查看测验详情和说明
            Route::get('{test}', [StudentTestController::class, 'show'])
                ->name('show');

            // 开始测验
            Route::post('{test}/start', [StudentTestController::class, 'start'])
                ->name('start');

            // 进行测验（答题页面）
            Route::get('{test}/take', [StudentTestController::class, 'take'])
                ->name('take');

            // 保存单个题目答案（AJAX）
            Route::post('{test}/save-answer', [StudentTestController::class, 'saveAnswer'])
                ->name('save-answer');

            // 提交测验
            Route::post('{test}/submit', [StudentTestController::class, 'submit'])
                ->name('submit');

            // 查看测验结果
            Route::get('{test}/results', [StudentTestController::class, 'results'])
                ->name('results');
        });

        // 测验历史记录
        Route::get('tests-history', [StudentTestController::class, 'history'])
            ->name('tests.history');
    });

    // Admin 区域
    Route::prefix('admin')->name('admin.')->middleware(['role:administrator'])->group(function () {
        Route::resource('lessons', AdminLessonController::class);
        Route::resource('exercises', AdminExerciseController::class);

        // 管理员练习路由
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

        // 管理员测试路由
        Route::prefix('lessons/{lesson}/tests')->name('lessons.tests.')->group(function () {
            // 基础测验管理
            Route::get('/', [AdminTestController::class, 'indexForLesson'])->name('index');
            Route::get('create', [AdminTestController::class, 'createForLesson'])->name('create');
            Route::post('/', [AdminTestController::class, 'storeForLesson'])->name('store');
            Route::get('{test}', [AdminTestController::class, 'showForLesson'])->name('show');
            Route::get('{test}/edit', [AdminTestController::class, 'editForLesson'])->name('edit');
            Route::put('{test}', [AdminTestController::class, 'updateForLesson'])->name('update');
            Route::delete('{test}', [AdminTestController::class, 'destroyForLesson'])->name('destroy');

            // 高级功能
            Route::post('{test}/duplicate', [AdminTestController::class, 'duplicate'])->name('duplicate');
            Route::get('{test}/preview', [AdminTestController::class, 'preview'])->name('preview');

            // 批量操作
            Route::post('bulk-update', [AdminTestController::class, 'bulkUpdate'])->name('bulk-update');
            Route::post('reorder', [AdminTestController::class, 'reorder'])->name('reorder');

            // ==================== 题目管理路由 ====================
            Route::prefix('{test}/questions')->name('questions.')->group(function () {
                // 基础题目管理
                Route::get('/', [AdminQuestionController::class, 'indexForTest'])->name('index');
                Route::get('create', [AdminQuestionController::class, 'createForTest'])->name('create');
                Route::post('/', [AdminQuestionController::class, 'storeForTest'])->name('store');
                Route::get('{question}', [AdminQuestionController::class, 'showForTest'])->name('show');
                Route::get('{question}/edit', [AdminQuestionController::class, 'editForTest'])->name('edit');
                Route::put('{question}', [AdminQuestionController::class, 'updateForTest'])->name('update');
                Route::delete('{question}', [AdminQuestionController::class, 'destroyForTest'])->name('destroy');

                // 高级功能
                Route::post('{question}/duplicate', [AdminQuestionController::class, 'duplicate'])->name('duplicate');
                Route::post('bulk-update', [AdminQuestionController::class, 'bulkUpdate'])->name('bulk-update');
                Route::post('reorder', [AdminQuestionController::class, 'reorder'])->name('reorder');
            });
        });
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
