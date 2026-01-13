<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    public function __construct()
    {
        // 确保用户已登录
        $this->middleware('auth');
    }

    /**
     * 显示编辑个人资料的页面（Inertia + React）
     */
    public function edit(Request $request)
    {
        $user = $request->user();

        // 返回给前端的 user 数据（删掉敏感字段）
        $payload = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
            'email_verified' => (bool) $user->email_verified_at,
            // 你可以在这里添加更多字段（profile bio, username 等）
        ];

        return Inertia::render('Profile/Edit', [
            'user' => $payload,
        ]);
    }

    /**
     * 更新用户资料
     */
    public function update(Request $request)
    {
        $user = $request->user();

        // 基本验证规则（根据你 DB 的字段调整）
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'avatar' => ['nullable', 'image', 'max:2048'], // 最大 2MB
            // 如果前端允许改密码，则下面验证
            'password' => ['nullable', 'confirmed', Password::min(8)],
        ];

        $validated = $request->validate($rules);

        // 处理头像上传
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');

            // 存储到 public disk 的 avatars 目录
            $path = $file->store('avatars', 'public');

            // 删除旧头像（如果存在并且不是默认）
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            $user->avatar = $path;
        }

        // 处理邮箱变更：如果改了邮箱，清除 email_verified_at 并尝试发送验证邮件
        if ($validated['email'] !== $user->email) {
            $user->email = $validated['email'];
            $user->email_verified_at = null;

            // 如果 User implements MustVerifyEmail，会有这个方法
            if (method_exists($user, 'sendEmailVerificationNotification')) {
                try {
                    $user->sendEmailVerificationNotification();
                } catch (\Throwable $e) {
                    // 不要因为邮件发送失败而中断更新，记录日志或忽略
                    Log::warning('Email verification send failed: ' . $e->getMessage());
                }
            }
        }

        // 名称更新
        $user->name = $validated['name'];

        // 如果要改密码且提供了密码
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return Redirect::route('profile.edit')->with('success', '个人资料已更新。');
    }

    /**
     * 删除用户（需当前密码确认）
     */
    public function destroy(Request $request)
    {
        $user = $request->user();

        // 验证当前密码（前端传 current_password）
        $request->validate([
            'current_password' => ['required'],
        ]);

        if (!Hash::check($request->input('current_password'), $user->password)) {
            return Redirect::route('profile.edit')->withErrors(['current_password' => '当前密码错误。']);
        }

        // 删除头像文件（若存在）
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        // 先拿 id 做日志（可选）
        $userId = $user->id;

        // 注销并删除用户
        Auth::logout();

        // 删除 session
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // 删除记录
        $user->delete();

        // 可选：记录删除事件
        Log::info("User {$userId} account deleted.");

        return Redirect::route('home')->with('success', '帐号已被删除。');
    }
}
