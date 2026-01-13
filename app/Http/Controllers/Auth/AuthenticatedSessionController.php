<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request): RedirectResponse
    {
        // ✅ 添加调试日志
        Log::info('🔐 Login attempt started', [
            'email' => $request->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'session_id' => $request->session()->getId(),
            'has_csrf_token' => $request->header('X-CSRF-TOKEN') !== null,
            'has_xsrf_token' => $request->header('X-XSRF-TOKEN') !== null,
        ]);

        // 1. 验证登录凭证格式
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string|min:8',
        ], [
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 8 characters.',
        ]);

        // 2. 检查速率限制（防止暴力破解）
        $this->checkTooManyFailedAttempts($request);

        // 3. 检查用户是否存在
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            RateLimiter::hit($this->throttleKey($request), 60);

            Log::warning('❌ Login failed - User not found', ['email' => $request->email]);

            throw ValidationException::withMessages([
                'email' => 'No account found with this email address.',
            ]);
        }

        // 4. 检查账户状态
        if ($user->email_verified_at === null) {
            Log::warning('❌ Login failed - Email not verified', ['email' => $request->email]);

            throw ValidationException::withMessages([
                'email' => 'Please verify your email address before logging in.',
            ]);
        }

        // 5. 尝试认证
        if (!Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey($request), 60);

            Log::warning('❌ Login failed - Invalid password', ['email' => $request->email]);

            throw ValidationException::withMessages([
                'password' => 'The provided password is incorrect.',
            ]);
        }

        // 6. 认证成功 - 清除速率限制
        RateLimiter::clear($this->throttleKey($request));

        // 7. 重新生成 session（防止 session fixation 攻击）
        $request->session()->regenerate();

        Log::info('✅ Login successful', [
            'user_id' => $user->user_Id,
            'email' => $user->email,
            'new_session_id' => $request->session()->getId(),
        ]);

        // 8. 记录登录日志（可选）
        $this->logSuccessfulLogin($user, $request);

        // 9. 根据角色重定向
        return $this->redirectBasedOnRole($user);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Log::info('🚪 Logout attempt', [
            'user_id' => Auth::id(),
            'session_id' => $request->session()->getId(),
        ]);

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        Log::info('✅ Logout successful');

        return redirect('/');
    }

    /**
     * Check if too many failed attempts
     */
    protected function checkTooManyFailedAttempts(Request $request): void
    {
        $key = $this->throttleKey($request);
        $maxAttempts = 5;
        $decayMinutes = 15;

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);
            $minutes = ceil($seconds / 60);

            throw ValidationException::withMessages([
                'email' => "Too many login attempts. Please try again in {$minutes} minutes.",
            ]);
        }
    }

    /**
     * Get the rate limiting throttle key
     */
    protected function throttleKey(Request $request): string
    {
        return strtolower($request->input('email')) . '|' . $request->ip();
    }

    /**
     * Log successful login
     */
    protected function logSuccessfulLogin(User $user, Request $request): void
    {
        // 更新最后登录时间（如果字段存在）
        if (method_exists($user, 'update')) {
            try {
                $user->update([
                    'last_login_at' => now(),
                    'last_login_ip' => $request->ip(),
                ]);
            } catch (\Exception $e) {
                // 如果字段不存在，忽略错误
                Log::debug('Could not update last_login fields: ' . $e->getMessage());
            }
        }
    }

    /**
     * Redirect based on user role
     */
    protected function redirectBasedOnRole(User $user): RedirectResponse
    {
        if ($user->role === 'administrator') {
            return redirect()->intended(route('dashboard'));
        }

        if ($user->role === 'student') {
            return redirect()->intended(route('dashboard'));
        }

        // 默认重定向
        return redirect()->intended(route('dashboard'));
    }
}
