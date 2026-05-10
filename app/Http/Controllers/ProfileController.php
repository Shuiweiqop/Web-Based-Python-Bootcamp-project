<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function edit(Request $request)
    {
        $user = $request->user();

        $payload = [
            'id' => $user->getKey(),
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->profile_picture,
            'email_verified' => (bool) $user->email_verified_at,
        ];

        return Inertia::render('Profile/Edit', [
            'user' => $payload,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->getKey(), $user->getKeyName()),
            ],
            'avatar' => ['nullable', 'image', 'max:2048'],
            'password' => ['nullable', 'confirmed', Password::min(8)],
        ];

        $validated = $request->validate($rules);

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $path = $file->store('avatars', 'public');
            $oldPath = $user->getRawOriginal('profile_picture');

            if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }

            $user->profile_picture = $path;
        }

        if ($validated['email'] !== $user->email) {
            $user->email = $validated['email'];
            $user->email_verified_at = null;

            if (method_exists($user, 'sendEmailVerificationNotification')) {
                try {
                    $user->sendEmailVerificationNotification();
                } catch (\Throwable $e) {
                    Log::warning('Email verification send failed: ' . $e->getMessage());
                }
            }
        }

        $user->name = $validated['name'];

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return Redirect::route('profile.edit')->with('success', 'Profile updated successfully.');
    }

    public function destroy(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => ['required'],
        ]);

        if (! Hash::check($request->input('current_password'), $user->password)) {
            return Redirect::route('profile.edit')->withErrors([
                'current_password' => 'The current password is incorrect.',
            ]);
        }

        $profilePicture = $user->getRawOriginal('profile_picture');

        if ($profilePicture && Storage::disk('public')->exists($profilePicture)) {
            Storage::disk('public')->delete($profilePicture);
        }

        $userId = $user->getKey();

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $user->delete();

        Log::info("User {$userId} account deleted.");

        return Redirect::route('home')->with('success', 'Account deleted successfully.');
    }
}
