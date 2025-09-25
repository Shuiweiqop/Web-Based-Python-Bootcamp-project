<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share([
            // 只把需要给前端的字段暴露出去，避免泄漏敏感字段
            'auth' => function () {
                $user = Auth::user();
                if (! $user) {
                    return ['user' => null];
                }

                return [
                    'user' => [
                        // 使用 getKey() 可以兼容非默认主键（例如 user_id / user_Id）
                        'id'    => $user->getKey(),
                        'name'  => $user->name,
                        'email' => $user->email,
                        'role'  => $user->role ?? null,
                    ],
                ];
            },

            // 方便前端显示 flash 消息
            'flash' => function () {
                return [
                    'success' => session('success'),
                    'error'   => session('error'),
                ];
            },
        ]);
    }
}
