<?php

namespace App\Http\Controllers;

use App\Models\Otp;
use App\Mail\OtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class OtpController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        // 生成 6 位数 OTP
        $otpCode = rand(100000, 999999);

        // 删除旧的 OTP
        Otp::where('email', $request->email)->delete();

        // 创建新的 OTP
        Otp::create([
            'email' => $request->email,
            'otp' => $otpCode,
            'expires_at' => Carbon::now()->addMinutes(10)
        ]);

        // 发送邮件
        Mail::to($request->email)->send(new OtpMail($otpCode));

        return back()->with('success', 'OTP has been sent to your email!');
    }

    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6'
        ]);

        $otp = Otp::where('email', $request->email)
            ->where('otp', $request->otp)
            ->first();

        if (!$otp) {
            return back()->withErrors(['otp' => 'Invalid OTP code.']);
        }

        if ($otp->isExpired()) {
            $otp->delete();
            return back()->withErrors(['otp' => 'OTP has expired.']);
        }

        // OTP 验证成功
        $otp->delete();

        return redirect()->route('dashboard')->with('success', 'Email verified successfully!');
    }
}
