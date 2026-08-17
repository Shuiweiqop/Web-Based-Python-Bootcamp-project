<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class PwaController extends Controller
{
    /**
     * The web app manifest.
     *
     * Served by Laravel rather than sitting in public/ as a static file so the
     * name follows APP_NAME. A hardcoded manifest silently disagrees with the
     * rest of the app the moment the deployment renames it.
     */
    public function manifest(): JsonResponse
    {
        $name = config('app.name', 'Laravel');

        return response()->json([
            'name' => $name,
            // Home screens truncate at roughly 12 characters.
            'short_name' => str($name)->limit(12, '')->toString(),
            'description' => 'Learn Python through interactive lessons, exercises, and quizzes.',
            'start_url' => '/dashboard',
            // 'standalone' is what removes the browser chrome and makes an
            // installed instance look like a native app.
            'display' => 'standalone',
            'orientation' => 'portrait-primary',
            'background_color' => '#4f46e5',
            'theme_color' => '#4f46e5',
            'lang' => str_replace('_', '-', app()->getLocale()),
            'dir' => 'ltr',
            'categories' => ['education', 'productivity'],
            'icons' => $this->icons(),
            'shortcuts' => [
                [
                    'name' => 'My Skills',
                    'short_name' => 'Skills',
                    'url' => '/student/skills',
                    'icons' => [['src' => '/icons/icon-192.png', 'sizes' => '192x192']],
                ],
                [
                    'name' => 'Lessons',
                    'short_name' => 'Lessons',
                    'url' => '/lessons',
                    'icons' => [['src' => '/icons/icon-192.png', 'sizes' => '192x192']],
                ],
            ],
        ], 200, [
            // Installability is re-checked on every visit, so the manifest must
            // not be pinned in a long cache when the name or icons change.
            'Cache-Control' => 'public, max-age=3600',
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    /**
     * Icon set.
     *
     * Each size is declared twice, as 'any' and as 'maskable'. Android crops a
     * maskable icon to the launcher's shape and pads it if the declaration is
     * missing, which produces the "small icon floating in a white circle" look;
     * declaring both lets the platform pick the right one per context.
     *
     * @return array<int, array<string, string>>
     */
    private function icons(): array
    {
        $icons = [];

        foreach ([96, 128, 192, 256, 384, 512] as $size) {
            $icons[] = [
                'src' => "/icons/icon-{$size}.png",
                'sizes' => "{$size}x{$size}",
                'type' => 'image/png',
                'purpose' => 'any',
            ];
            $icons[] = [
                'src' => "/icons/icon-{$size}.png",
                'sizes' => "{$size}x{$size}",
                'type' => 'image/png',
                'purpose' => 'maskable',
            ];
        }

        return $icons;
    }
}
