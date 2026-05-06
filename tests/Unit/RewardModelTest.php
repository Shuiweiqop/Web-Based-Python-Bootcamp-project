<?php

namespace Tests\Unit;

use App\Models\Reward;
use App\Models\StudentProfile;
use Tests\TestCase;

class RewardModelTest extends TestCase
{
    // No RefreshDatabase — these tests never touch the DB

    // ==================== canPurchase() ====================

    public function test_canPurchase_returns_false_when_inactive(): void
    {
        $reward = new Reward(['is_active' => false, 'stock_quantity' => -1]);
        $this->assertFalse($reward->canPurchase());
    }

    public function test_canPurchase_returns_true_when_active_with_unlimited_stock(): void
    {
        $reward = new Reward(['is_active' => true, 'stock_quantity' => -1]);
        $this->assertTrue($reward->canPurchase());
    }

    public function test_canPurchase_returns_true_when_active_with_null_stock(): void
    {
        $reward = new Reward(['is_active' => true, 'stock_quantity' => null]);
        $this->assertTrue($reward->canPurchase());
    }

    public function test_canPurchase_returns_true_when_active_with_positive_stock(): void
    {
        $reward = new Reward(['is_active' => true, 'stock_quantity' => 5]);
        $this->assertTrue($reward->canPurchase());
    }

    public function test_canPurchase_returns_false_when_stock_is_zero(): void
    {
        $reward = new Reward(['is_active' => true, 'stock_quantity' => 0]);
        $this->assertFalse($reward->canPurchase());
    }

    // ==================== getRarityBadge() ====================

    #[\PHPUnit\Framework\Attributes\DataProvider('rarityProvider')]
    public function test_getRarityBadge_returns_correct_label(string $rarity, string $expected): void
    {
        $reward = new Reward(['rarity' => $rarity]);
        $this->assertSame($expected, $reward->getRarityBadge());
    }

    public static function rarityProvider(): array
    {
        return [
            'legendary' => ['legendary', '🌟 Legendary'],
            'epic'      => ['epic',      '💜 Epic'],
            'rare'      => ['rare',      '💙 Rare'],
            'common'    => ['common',    '⚪ Common'],
            'unknown'   => ['special',   'Unknown'],
        ];
    }

    // ==================== TYPES / RARITIES constants ====================

    public function test_TYPES_constant_contains_all_reward_types(): void
    {
        $expected = ['avatar_frame', 'profile_background', 'badge', 'title', 'theme', 'effect'];
        $this->assertSame($expected, array_keys(Reward::TYPES));
    }

    public function test_RARITIES_constant_contains_all_rarity_levels(): void
    {
        $expected = ['common', 'rare', 'epic', 'legendary'];
        $this->assertSame($expected, array_keys(Reward::RARITIES));
    }

    // ==================== StudentProfile pure calculations ====================

    #[\PHPUnit\Framework\Attributes\DataProvider('pointsLevelProvider')]
    public function test_points_level_returns_correct_tier(int $points, string $expected): void
    {
        $profile = new StudentProfile(['current_points' => $points]);
        $this->assertSame($expected, $profile->points_level);
    }

    public static function pointsLevelProvider(): array
    {
        return [
            'newbie'       => [0,     'Newbie'],
            'beginner'     => [500,   'Beginner'],
            'intermediate' => [2000,  'Intermediate'],
            'advanced'     => [5000,  'Advanced'],
            'expert'       => [10000, 'Expert'],
        ];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('streakStatusProvider')]
    public function test_streak_status_returns_correct_label(int $days, string $expected): void
    {
        $profile = new StudentProfile(['streak_days' => $days]);
        $this->assertSame($expected, $profile->streak_status);
    }

    public static function streakStatusProvider(): array
    {
        return [
            'no streak'    => [0,  'Ready to Start!'],
            'started'      => [1,  'Getting Started!'],
            'building'     => [3,  'Building Momentum!'],
            'great streak' => [7,  'Great Streak!'],
            'on fire'      => [30, 'On Fire!'],
        ];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('rewardPointsProvider')]
    public function test_calculateTestRewardPoints_returns_correct_value(
        float $score,
        int $difficulty,
        int $streakDays,
        int $expected
    ): void {
        $profile = new StudentProfile(['streak_days' => $streakDays]);
        $this->assertSame($expected, $profile->calculateTestRewardPoints($score, $difficulty));
    }

    public static function rewardPointsProvider(): array
    {
        return [
            'perfect score no streak'        => [100, 1, 0, 60],
            'perfect score 3-day streak'     => [100, 1, 3, 66],   // 60 * 1.1
            'perfect score 7-day streak'     => [100, 1, 7, 72],   // 60 * 1.2
            'high score hard difficulty'     => [90,  3, 0, 75],   // 50 * 1.5
            'passing score medium difficulty'=> [70,  2, 0, 36],   // 30 * 1.2
            'fail score easy'                => [50,  1, 0, 10],
        ];
    }
}
