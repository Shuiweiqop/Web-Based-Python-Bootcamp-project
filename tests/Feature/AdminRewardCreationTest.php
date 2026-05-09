<?php

namespace Tests\Feature;

use App\Models\Reward;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AdminRewardCreationTest extends TestCase
{
    use RefreshDatabase;

    #[DataProvider('rewardTypeProvider')]
    public function test_admin_can_create_each_reward_type(
        string $rewardType,
        array $metadata,
        ?string $imageName,
        bool $expectsImage
    ): void {
        Storage::fake('public');

        $admin = User::factory()->administrator()->create();
        $payload = [
            'name' => "Test {$rewardType}",
            'description' => "Create flow coverage for {$rewardType}.",
            'reward_type' => $rewardType,
            'rarity' => 'rare',
            'stock_quantity' => -1,
            'point_cost' => 125,
            'max_owned' => 1,
            'apply_instructions' => 'Use from inventory.',
            'metadata' => json_encode($metadata),
            'is_active' => '1',
        ];

        if ($imageName) {
            $payload['reward_image'] = UploadedFile::fake()->image($imageName, 512, 512)->size(1024);
        }

        $response = $this->actingAs($admin)->post(route('admin.rewards.store'), $payload);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('admin.rewards.index'));

        $reward = Reward::query()->where('name', "Test {$rewardType}")->first();

        $this->assertNotNull($reward);
        $this->assertSame($rewardType, $reward->reward_type);
        $this->assertSame('rare', $reward->rarity);
        $this->assertSame(125, $reward->point_cost);
        $this->assertSame(-1, $reward->stock_quantity);
        $this->assertSame(1, $reward->max_owned);
        $this->assertTrue($reward->is_active);
        if ($metadata === []) {
            $this->assertNull($reward->metadata);
        } else {
            $this->assertSame($metadata, $reward->metadata);
        }

        if ($expectsImage) {
            $this->assertNotNull($reward->image_url);
            Storage::disk('public')->assertExists(str_replace('/storage/', '', $reward->image_url));
        } else {
            $this->assertNull($reward->image_url);
        }
    }

    public static function rewardTypeProvider(): array
    {
        return [
            'avatar frame' => [
                'avatar_frame',
                ['frame_dimensions' => ['width' => 512, 'height' => 512], 'animation' => ['type' => 'pulse']],
                'avatar-frame.png',
                true,
            ],
            'profile background' => [
                'profile_background',
                ['type' => 'image', 'effects' => ['blur' => 0, 'opacity' => 1], 'info' => ['width' => 1920, 'height' => 1080]],
                'profile-background.jpg',
                true,
            ],
            'badge' => [
                'badge',
                ['shape' => 'circle', 'glow_color' => '#8B5CF6', 'background_color' => '#111827', 'icon_dimensions' => ['width' => 256, 'height' => 256]],
                'badge.png',
                true,
            ],
            'title' => [
                'title',
                ['title_text' => 'Supreme Coder', 'text_color' => '#3B82F6', 'gradient' => ['enabled' => false], 'effects' => ['glow' => true], 'icon' => 'none'],
                null,
                false,
            ],
            'theme' => [
                'theme',
                [],
                null,
                false,
            ],
            'effect' => [
                'effect',
                [],
                null,
                false,
            ],
        ];
    }
}
