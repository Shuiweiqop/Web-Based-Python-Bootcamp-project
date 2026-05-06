<?php

namespace Tests\Unit;

use App\Models\Reward;
use App\Models\StudentProfile;
use App\Services\RewardPurchaseService;
use ReflectionMethod;
use Tests\TestCase;

class RewardPurchaseServiceTest extends TestCase
{
    // No RefreshDatabase — only testing methods that need no DB queries

    private function callPrivate(string $method, array $args): mixed
    {
        $m = new ReflectionMethod(RewardPurchaseService::class, $method);
        $m->setAccessible(true);
        return $m->invoke(new RewardPurchaseService(), ...$args);
    }

    // ==================== assertPurchasable ====================

    public function test_assertPurchasable_throws_when_inactive(): void
    {
        $reward = new Reward(['is_active' => false, 'stock_quantity' => -1]);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('unavailable');

        $this->callPrivate('assertPurchasable', [$reward]);
    }

    public function test_assertPurchasable_throws_when_stock_is_zero(): void
    {
        $reward = new Reward(['is_active' => true, 'stock_quantity' => 0]);

        $this->expectException(\RuntimeException::class);

        $this->callPrivate('assertPurchasable', [$reward]);
    }

    public function test_assertPurchasable_passes_when_active_with_unlimited_stock(): void
    {
        $reward = new Reward(['is_active' => true, 'stock_quantity' => -1]);

        // No exception = pass
        $this->callPrivate('assertPurchasable', [$reward]);
        $this->assertTrue(true);
    }

    // ==================== assertSufficientPoints ====================

    public function test_assertSufficientPoints_throws_when_not_enough_points(): void
    {
        $student = new StudentProfile(['current_points' => 50]);
        $reward  = new Reward(['point_cost' => 100]);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Not enough points');

        $this->callPrivate('assertSufficientPoints', [$student, $reward, 1]);
    }

    public function test_assertSufficientPoints_throws_when_multi_quantity_exceeds_balance(): void
    {
        $student = new StudentProfile(['current_points' => 250]);
        $reward  = new Reward(['point_cost' => 100]);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('You need 300 points');

        $this->callPrivate('assertSufficientPoints', [$student, $reward, 3]);
    }

    public function test_assertSufficientPoints_passes_with_exact_balance(): void
    {
        $student = new StudentProfile(['current_points' => 100]);
        $reward  = new Reward(['point_cost' => 100]);

        $this->callPrivate('assertSufficientPoints', [$student, $reward, 1]);
        $this->assertTrue(true);
    }

    public function test_assertSufficientPoints_passes_with_surplus_balance(): void
    {
        $student = new StudentProfile(['current_points' => 500]);
        $reward  = new Reward(['point_cost' => 100]);

        $this->callPrivate('assertSufficientPoints', [$student, $reward, 3]);
        $this->assertTrue(true);
    }

    // ==================== assertStock (no-DB cases only) ====================

    public function test_assertStock_passes_immediately_for_unlimited_stock(): void
    {
        // stock_quantity < 0 → returns early, no DB query
        $reward = new Reward(['stock_quantity' => -1]);

        $this->callPrivate('assertStock', [$reward, 5]);
        $this->assertTrue(true);
    }

    public function test_assertStock_passes_immediately_for_null_stock(): void
    {
        $reward = new Reward(['stock_quantity' => null]);

        $this->callPrivate('assertStock', [$reward, 5]);
        $this->assertTrue(true);
    }

    public function test_assertStock_throws_when_requested_quantity_exceeds_available(): void
    {
        $reward = new Reward(['stock_quantity' => 2]);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Not enough stock');

        $this->callPrivate('assertStock', [$reward, 5]);
    }

    // ==================== assertOwnershipLimit (no-DB cases only) ====================

    public function test_assertOwnershipLimit_passes_when_no_limit_set(): void
    {
        $student = new StudentProfile();
        $reward  = new Reward(['max_owned' => -1]);

        // max_owned < 0 → no DB query, returns early
        $this->callPrivate('assertOwnershipLimit', [$student, $reward, 1]);
        $this->assertTrue(true);
    }

    public function test_assertOwnershipLimit_passes_when_max_owned_is_null(): void
    {
        $student = new StudentProfile();
        $reward  = new Reward(['max_owned' => null]);

        $this->callPrivate('assertOwnershipLimit', [$student, $reward, 1]);
        $this->assertTrue(true);
    }
}
