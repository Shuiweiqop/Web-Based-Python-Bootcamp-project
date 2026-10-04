<?php

use App\Http\Controllers\Api\CodeExecutionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\GeminiController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PwaController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;

// ==================== Public Routes ====================
Route::get('/', [DashboardController::class, 'home'])->name('home');

// PWA manifest. Must be unauthenticated: the browser fetches it to decide
// whether the app is installable, and does so without the session.
Route::get('/manifest.webmanifest', [PwaController::class, 'manifest'])->name('pwa.manifest');

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
            // Throttled like code.execute: a coding submission is graded by
            // running every test case on Judge0.
            Route::post('/{exercise}/submit', [ExerciseController::class, 'submit'])
                ->middleware('throttle:20,1')
                ->name('submit');
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
    require __DIR__.'/student.php';

    // ==================== Admin Area ====================
    require __DIR__.'/admin.php';
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

            if (! $apiKey) {
                return response()->json(['error' => 'API key not found']);
            }

            $response = \Illuminate\Support\Facades\Http::timeout(30)->post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}",
                [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => 'Say hello in one sentence'],
                            ],
                        ],
                    ],
                ]
            );

            if ($response->failed()) {
                return response()->json([
                    'success' => false,
                    'error' => $response->json(),
                ]);
            }

            $data = $response->json();

            return response()->json([
                'success' => true,
                'message' => $data['candidates'][0]['content']['parts'][0]['text'] ?? 'No response',
                'model_used' => 'gemini-2.5-flash',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ]);
        }
    });
}

require __DIR__.'/auth.php';
