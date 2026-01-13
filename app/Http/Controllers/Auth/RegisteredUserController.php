<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Otp;
use App\Mail\OtpMail;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request - Step 1: Send OTP
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        try {
            // 生成 6 位数 OTP
            $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            // 删除该邮箱之前的所有 OTP
            Otp::where('email', $request->email)->delete();

            // 创建新的 OTP，10 分钟后过期
            Otp::create([
                'email' => $request->email,
                'otp' => $otpCode,
                'expires_at' => Carbon::now()->addMinutes(10)
            ]);

            // 发送邮件
            Mail::to($request->email)->send(new OtpMail($otpCode));

            // 将注册信息临时存储在 session 中
            session([
                'registration_data' => [
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => $request->password,
                ]
            ]);

            return redirect()->route('register.verify-otp')->with('success', 'OTP has been sent to your email!');
        } catch (\Exception $e) {
            return back()->withErrors([
                'email' => 'Failed to send OTP. Please try again.'
            ])->withInput();
        }
    }

    /**
     * Show OTP verification page
     */
    public function showVerifyOtp(): Response|RedirectResponse
    {
        $registrationData = session('registration_data');

        if (!$registrationData) {
            return redirect()->route('register');
        }

        return Inertia::render('Auth/RegisterVerifyOtp', [
            'email' => $registrationData['email']
        ]);
    }

    /**
     * Verify OTP and create user
     */
    public function verifyOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'otp' => 'required|string|size:6'
        ]);

        $registrationData = session('registration_data');

        if (!$registrationData) {
            return redirect()->route('register')->withErrors([
                'otp' => 'Registration session expired. Please register again.'
            ]);
        }

        // 查找 OTP 记录
        $otp = Otp::where('email', $registrationData['email'])
            ->where('otp', $request->otp)
            ->first();

        // 检查 OTP 是否存在
        if (!$otp) {
            return back()->withErrors([
                'otp' => 'Invalid OTP code. Please check and try again.'
            ]);
        }

        // 检查是否过期
        if ($otp->isExpired()) {
            $otp->delete();
            return back()->withErrors([
                'otp' => 'OTP has expired. Please request a new one.'
            ]);
        }

        // OTP 验证成功，创建用户
        // 强制所有注册用户为学生角色
        $user = User::create([
            'name' => $registrationData['name'],
            'email' => $registrationData['email'],
            'password' => Hash::make($registrationData['password']),
            'role' => 'student', // 所有注册用户都是学生
        ]);

        // 删除 OTP 记录
        $otp->delete();

        // 清除 session 中的注册数据
        session()->forget('registration_data');

        // 触发注册事件
        event(new Registered($user));

        // 登录用户
        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }

    /**
     * Resend OTP
     */
    public function resendOtp(Request $request): RedirectResponse
    {
        $registrationData = session('registration_data');

        if (!$registrationData) {
            return redirect()->route('register')->withErrors([
                'otp' => 'Registration session expired. Please register again.'
            ]);
        }

        try {
            // 生成新的 OTP
            $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            // 删除旧的 OTP
            Otp::where('email', $registrationData['email'])->delete();

            // 创建新的 OTP
            Otp::create([
                'email' => $registrationData['email'],
                'otp' => $otpCode,
                'expires_at' => Carbon::now()->addMinutes(10)
            ]);

            // 发送邮件
            Mail::to($registrationData['email'])->send(new OtpMail($otpCode));

            return back()->with('success', 'New OTP has been sent to your email!');
        } catch (\Exception $e) {
            return back()->withErrors([
                'otp' => 'Failed to resend OTP. Please try again.'
            ]);
        }
    }
}
