<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
        // 可选：如果用 Mix/Vite 需要版本控制，可以 return mix('manifest.json') 或类似逻辑
    }

    public function share(Request $request): array
    {
        // 只调用一次 user，避免重复访问
        $user = $request->user();

        // 若你的 users 表主键是 user_Id，确保 User 模型已设置 protected $primaryKey = 'user_Id'
        $sharedUser = null;

        if ($user) {
            $sharedUser = [
                // 强制转 int，确保前端判断稳定
                'id' => (int) $user->user_Id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                // 如需额外非敏感字段可以在这里加，但不要暴露密码、tokens 等
            ];
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $sharedUser,
            ],
            // 下面两个是常用的：flash 消息和 validation errors（Inertia 很多页面会需要）
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],
            // 如果你有权限系统，建议把常用能力也一起分享
            // 'can' => [
            //     'updateProfile' => $user ? $user->can('update', $user) : false,
            // ],
        ]);
    }
}
