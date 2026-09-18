<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Every unauthenticated page must offer a way out.
 *
 * Login and Register do not use GuestLayout — they render their own full-screen
 * layouts — so they inherited none of its chrome, including the logo that links
 * home. A visitor who clicked "Log in" from the landing page had no way back
 * except the browser's back button.
 *
 * Asserted against the source rather than rendered output because these are
 * Inertia pages: the server returns a JSON page object, not HTML containing the
 * link, so an HTTP assertion could not see it.
 */
class AuthPagesHaveExitLinkTest extends TestCase
{
    // The landing page queries lessons, so it needs a migrated schema.
    use RefreshDatabase;

    /** Pages with their own layout, and where each should lead back to. */
    private const PAGES = [
        'Login.jsx' => '/',
        'Register.jsx' => '/',
        // Mid-flow pages return to the step before, not to the landing page:
        // dropping someone out of a half-finished signup loses their progress.
        'RegisterVerifyOtp.jsx' => "route('register')",
        'VerifyOtp.jsx' => "route('login')",
    ];

    public function test_every_standalone_auth_page_links_somewhere_back(): void
    {
        foreach (self::PAGES as $page => $expectedTarget) {
            $source = file_get_contents(resource_path("js/Pages/Auth/{$page}"));

            $this->assertStringContainsString(
                'Link',
                $source,
                "{$page} imports no Link component, so it cannot navigate anywhere."
            );

            $this->assertStringContainsString(
                $expectedTarget,
                $source,
                "{$page} has no link back to {$expectedTarget} — a visitor who lands here is stuck."
            );
        }
    }

    /**
     * The pages that DO use GuestLayout get their exit from its logo, so that
     * link has to stay.
     */
    public function test_guest_layout_logo_still_links_home(): void
    {
        $layout = file_get_contents(resource_path('js/Layouts/GuestLayout.jsx'));

        $this->assertStringContainsString('href="/"', $layout);
    }

    public function test_landing_page_is_reachable_without_authentication(): void
    {
        $this->get(route('home'))->assertOk();
    }

    /**
     * A logged-in student must still be able to reach the landing page — the
     * home route must not redirect them away from it.
     */
    public function test_landing_page_is_reachable_while_logged_in(): void
    {
        $user = \App\Models\User::factory()->student()->create();

        $this->actingAs($user)->get(route('home'))->assertOk();
    }
}
