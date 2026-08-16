<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

/**
 * Renders the PWA icon set from a single source design.
 *
 * A command rather than committed binaries alone: the PNGs ARE committed (the
 * build must not depend on this running), but when the icon changes there is
 * one place to change it and one command to regenerate every size, instead of
 * hand-exporting six files and hoping they stay consistent.
 *
 * Drawn with GD rather than rasterising the SVG, because GD ships with PHP and
 * an SVG rasteriser would be another dependency for six static files.
 */
class GeneratePwaIcons extends Command
{
    protected $signature = 'pwa:icons';

    protected $description = 'Generate the PWA icon PNGs into public/icons';

    /** Sizes required by the manifest, plus the apple-touch-icon. */
    private const SIZES = [96, 128, 192, 256, 384, 512];

    public function handle(): int
    {
        if (! extension_loaded('gd')) {
            $this->error('The gd extension is required. Enable extension=gd in php.ini.');

            return self::FAILURE;
        }

        $dir = public_path('icons');

        if (! is_dir($dir) && ! mkdir($dir, 0755, true) && ! is_dir($dir)) {
            $this->error("Could not create {$dir}");

            return self::FAILURE;
        }

        foreach (self::SIZES as $size) {
            $this->render($size, "{$dir}/icon-{$size}.png");
            $this->line("  icon-{$size}.png");
        }

        // iOS ignores the manifest icons and uses this one.
        $this->render(180, "{$dir}/apple-touch-icon.png");
        $this->line('  apple-touch-icon.png');

        $this->info('PWA icons written to public/icons.');

        return self::SUCCESS;
    }

    /**
     * Draw one icon at the given size.
     *
     * Everything is expressed as a fraction of $size so the design scales
     * cleanly rather than being tuned per resolution.
     */
    private function render(int $size, string $path): void
    {
        $img = imagecreatetruecolor($size, $size);
        imagesavealpha($img, true);
        imageantialias($img, true);

        // Diagonal indigo -> violet gradient, matching the UI's accent colour.
        for ($y = 0; $y < $size; $y++) {
            for ($x = 0; $x < $size; $x++) {
                $t = ($x + $y) / (2 * $size);
                $r = (int) round(79 + (124 - 79) * $t);
                $g = (int) round(70 + (58 - 70) * $t);
                $b = (int) round(229 + (237 - 229) * $t);
                imagesetpixel($img, $x, $y, imagecolorallocate($img, $r, $g, $b));
            }
        }

        $white = imagecolorallocate($img, 255, 255, 255);
        $stroke = max(3, (int) round($size * 0.055));

        $u = fn (float $fraction): float => $size * $fraction;

        // Left bracket  <  ·  right bracket  >  ·  slash  /
        $segments = [
            [[0.367, 0.402], [0.273, 0.500]],
            [[0.273, 0.500], [0.367, 0.598]],
            [[0.633, 0.402], [0.727, 0.500]],
            [[0.727, 0.500], [0.633, 0.598]],
            [[0.559, 0.352], [0.441, 0.648]],
        ];

        foreach ($segments as [[$x1, $y1], [$x2, $y2]]) {
            $this->thickLine($img, $u($x1), $u($y1), $u($x2), $u($y2), $stroke, $white);
        }

        imagepng($img, $path, 9);
        imagedestroy($img);
    }

    /**
     * Draw a line of a given width with rounded ends.
     *
     * imagesetthickness() does not apply to imageline() reliably across GD
     * builds, so the segment is drawn as a filled quad (the line body) plus a
     * disc at each end (the round caps, which also hide the seam where two
     * segments meet at an angle).
     */
    private function thickLine($img, float $x1, float $y1, float $x2, float $y2, int $width, int $color): void
    {
        $dx = $x2 - $x1;
        $dy = $y2 - $y1;
        $length = sqrt($dx * $dx + $dy * $dy);

        if ($length < 0.001) {
            return;
        }

        // Unit normal, scaled to half the stroke width.
        $nx = (-$dy / $length) * ($width / 2);
        $ny = ($dx / $length) * ($width / 2);

        imagefilledpolygon($img, [
            (int) round($x1 + $nx), (int) round($y1 + $ny),
            (int) round($x2 + $nx), (int) round($y2 + $ny),
            (int) round($x2 - $nx), (int) round($y2 - $ny),
            (int) round($x1 - $nx), (int) round($y1 - $ny),
        ], 4, $color);

        imagefilledellipse($img, (int) round($x1), (int) round($y1), $width, $width, $color);
        imagefilledellipse($img, (int) round($x2), (int) round($y2), $width, $width, $color);
    }
}
