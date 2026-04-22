<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * Usage in routes/web.php:
     *   ->middleware('role:admin,manager')
     *
     * If no roles are provided, middleware will act as auth + optional email-verified check (see $requireRole flag below).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  mixed ...$roles
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // 如果未登录：对 AJAX 返回 401 JSON，否则重定向到 login
        if (!Auth::check()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return redirect()->guest(route('login'));
        }

        $user = Auth::user();

        // 如果你的项目没有 email_verified_at 字段或不需要验证，删除或调整此块
        if (property_exists($user, 'email_verified_at') && is_null($user->email_verified_at)) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Email not verified.'], 403);
            }
            return redirect()->route('verification.notice');
        }

        // 如果没有传 roles 参数，默认行为：只做 auth + email-verify（上面已完成）
        if (empty($roles)) {
            return $next($request);
        }

        // 规范化用户 role 与传入 roles，做大小写不敏感比较并用严格比较
        $userRole = strtolower((string) ($user->role ?? ''));
        $acceptable = array_map(fn($r) => strtolower(trim((string)$r)), $roles);

        if (in_array($userRole, $acceptable, true)) {
            return $next($request);
        }

        // 无权限：AJAX 返回 403 JSON；浏览器则 abort 或定向到无权限页
        if ($request->expectsJson() || $request->header('X-Inertia')) {
            abort(403);
        }

        // 纯浏览器请求（非 Inertia）
        return redirect()->route('login');
    }
}
