<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * Tests the PWA install contract.
 *
 * A browser decides whether to offer "Add to Home Screen" by checking the
 * manifest, and does so silently — a broken field just means the prompt never
 * appears, with no error anywhere. These assert the conditions that decision
 * depends on.
 */
class PwaTest extends TestCase
{
    /**
     * The browser fetches the manifest without the session, so requiring auth
     * would make the app permanently uninstallable.
     */
    public function test_manifest_is_reachable_without_logging_in(): void
    {
        $this->get(route('pwa.manifest'))->assertOk();
    }

    public function test_manifest_declares_the_fields_install_depends_on(): void
    {
        $manifest = $this->get(route('pwa.manifest'))->json();

        $this->assertNotEmpty($manifest['name']);
        $this->assertNotEmpty($manifest['short_name']);
        $this->assertSame('standalone', $manifest['display'], 'Anything else keeps the browser chrome.');
        $this->assertNotEmpty($manifest['start_url']);
        $this->assertNotEmpty($manifest['icons']);
    }

    public function test_manifest_name_follows_the_app_config(): void
    {
        config(['app.name' => 'Custom Platform Name']);

        $manifest = $this->get(route('pwa.manifest'))->json();

        $this->assertSame('Custom Platform Name', $manifest['name']);
    }

    /** Home screens truncate long labels, so short_name has to stay short. */
    public function test_short_name_is_truncated_for_the_home_screen(): void
    {
        config(['app.name' => 'An Extremely Long Application Name']);

        $manifest = $this->get(route('pwa.manifest'))->json();

        $this->assertLessThanOrEqual(12, strlen($manifest['short_name']));
    }

    /**
     * Chrome requires a 192px and a 512px icon before it will offer install.
     */
    public function test_manifest_includes_the_icon_sizes_chrome_requires(): void
    {
        $sizes = collect($this->get(route('pwa.manifest'))->json('icons'))
            ->pluck('sizes')
            ->unique();

        $this->assertTrue($sizes->contains('192x192'));
        $this->assertTrue($sizes->contains('512x512'));
    }

    /**
     * Without a maskable declaration Android pads the icon inside a white
     * circle instead of filling the launcher shape.
     */
    public function test_manifest_declares_maskable_icons(): void
    {
        $purposes = collect($this->get(route('pwa.manifest'))->json('icons'))
            ->pluck('purpose')
            ->unique();

        $this->assertTrue($purposes->contains('maskable'));
        $this->assertTrue($purposes->contains('any'));
    }

    /** Every declared icon must exist, or install fails silently. */
    public function test_every_declared_icon_file_exists(): void
    {
        foreach ($this->get(route('pwa.manifest'))->json('icons') as $icon) {
            $path = public_path(ltrim($icon['src'], '/'));

            $this->assertFileExists($path, "Manifest declares {$icon['src']} but the file is missing.");
        }
    }

    public function test_apple_touch_icon_exists(): void
    {
        // iOS ignores the manifest entirely and reads this file.
        $this->assertFileExists(public_path('icons/apple-touch-icon.png'));
    }

    public function test_service_worker_and_offline_page_are_served(): void
    {
        // The service worker must sit at the root: its scope is its directory,
        // so /js/sw.js could not control the whole app.
        $this->assertFileExists(public_path('sw.js'));
        $this->assertFileExists(public_path('offline.html'));
    }

    /**
     * Caching a POST would let the worker replay a submission; caching
     * cross-origin responses would break Judge0 and Gemini calls.
     */
    public function test_service_worker_only_handles_same_origin_gets(): void
    {
        $sw = file_get_contents(public_path('sw.js'));

        $this->assertStringContainsString("request.method !== 'GET'", $sw);
        $this->assertStringContainsString('url.origin !== self.location.origin', $sw);
    }

    /**
     * HTML carries session state and a CSRF token. Serving a cached page would
     * show a logged-out shell to a logged-in user, or a stale CSRF token.
     */
    public function test_service_worker_does_not_cache_html_navigations(): void
    {
        $sw = file_get_contents(public_path('sw.js'));

        $this->assertStringContainsString("request.mode === 'navigate'", $sw);
        // Navigation must go to the network first and only fall back offline.
        $this->assertMatchesRegularExpression('/fetch\(request\)\s*\.catch/', $sw);
    }

    public function test_blade_layout_links_the_manifest_and_icons(): void
    {
        $blade = file_get_contents(resource_path('views/app.blade.php'));

        $this->assertStringContainsString('rel="manifest"', $blade);
        $this->assertStringContainsString('apple-touch-icon', $blade);
        $this->assertStringContainsString('theme-color', $blade);
    }
}
