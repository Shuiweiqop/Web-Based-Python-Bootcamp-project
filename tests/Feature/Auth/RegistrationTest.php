<?php

namespace Tests\Feature\Auth;

use App\Mail\OtpMail;
use App\Models\Otp;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        Mail::fake();

        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('register.verify-otp'));
        $this->assertGuest();

        Mail::assertSent(OtpMail::class);

        $otp = Otp::where('email', 'test@example.com')->first();

        $this->assertNotNull($otp);

        $response = $this->post(route('register.verify-otp.submit'), [
            'otp' => $otp->otp,
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }
}
