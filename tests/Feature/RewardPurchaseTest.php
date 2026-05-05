<?php

namespace Tests\Feature;

use App\Models\Reward;
use App\Models\StudentProfile;
use App\Models\StudentRewardInventory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RewardPurchaseTest extends TestCase
{
    use RefreshDatabase;

    private function makeStudent(int $points = 500): array
    {
        $user = User::factory()->student()->create();
        $profile = $user->studentProfile;
        $profile->update(['current_points' => $points]);
        $profile->refresh();

        return [$user, $profile];
    }

    private function makeReward(array $overrides = []): Reward
    {
        return Reward::create(array_merge([
            'name' => 'Test Badge',
            'description' => 'A test badge.',
            'reward_type' => 'badge',
            'rarity' => 'common',
            'point_cost' => 100,
            'stock_quantity' => -1,
            'max_owned' => -1,
            'is_active' => true,
        ], $overrides));
    }

    public function test_student_can_purchase_reward_and_points_are_deducted(): void
    {
        [$user, $profile] = $this->makeStudent(500);
        $reward = $this->makeReward(['point_cost' => 100]);

        $response = $this->actingAs($user)
            ->post(route('student.rewards.purchase', $reward->reward_id));

        $response->assertRedirect(route('student.inventory.index'));

        $this->assertDatabaseHas('student_reward_inventory', [
            'student_id' => $profile->student_id,
            'reward_id' => $reward->reward_id,
            'quantity' => 1,
        ]);

        $this->assertDatabaseHas('student_profiles', [
            'student_id' => $profile->student_id,
            'current_points' => 400,
        ]);

        $this->assertDatabaseHas('reward_records', [
            'student_id' => $profile->student_id,
            'reward_id' => $reward->reward_id,
            'quantity' => 1,
            'points_spent' => 100,
            'points_before' => 500,
            'points_after' => 400,
            'issued_by' => 'student_purchase',
        ]);
    }

    public function test_purchase_is_rejected_when_student_has_insufficient_points(): void
    {
        [$user, $profile] = $this->makeStudent(50);
        $reward = $this->makeReward(['point_cost' => 100]);

        $response = $this->actingAs($user)
            ->post(route('student.rewards.purchase', $reward->reward_id));

        $response->assertSessionHasErrors(['purchase']);

        $this->assertDatabaseMissing('student_reward_inventory', [
            'student_id' => $profile->student_id,
            'reward_id' => $reward->reward_id,
        ]);

        $this->assertDatabaseHas('student_profiles', [
            'student_id' => $profile->student_id,
            'current_points' => 50,
        ]);
    }

    public function test_purchase_is_rejected_when_student_already_owns_maximum_quantity(): void
    {
        [$user, $profile] = $this->makeStudent(500);
        $reward = $this->makeReward(['point_cost' => 100, 'max_owned' => 1]);

        StudentRewardInventory::create([
            'student_id' => $profile->student_id,
            'reward_id' => $reward->reward_id,
            'quantity' => 1,
            'obtained_at' => now(),
            'is_equipped' => false,
        ]);

        $response = $this->actingAs($user)
            ->post(route('student.rewards.purchase', $reward->reward_id));

        $response->assertSessionHasErrors(['purchase']);

        $this->assertDatabaseHas('student_reward_inventory', [
            'student_id' => $profile->student_id,
            'reward_id' => $reward->reward_id,
            'quantity' => 1,
        ]);

        $this->assertDatabaseHas('student_profiles', [
            'student_id' => $profile->student_id,
            'current_points' => 500,
        ]);
    }

    public function test_purchase_is_rejected_when_reward_is_inactive(): void
    {
        [$user, $profile] = $this->makeStudent(500);
        $reward = $this->makeReward(['is_active' => false]);

        $this->actingAs($user)
            ->post(route('student.rewards.purchase', $reward->reward_id))
            ->assertSessionHasErrors(['purchase']);

        $this->assertDatabaseMissing('student_reward_inventory', [
            'student_id' => $profile->student_id,
            'reward_id'  => $reward->reward_id,
        ]);

        $this->assertDatabaseHas('student_profiles', [
            'student_id'     => $profile->student_id,
            'current_points' => 500,
        ]);
    }

    public function test_purchase_is_rejected_when_reward_is_out_of_stock(): void
    {
        [$user, $profile] = $this->makeStudent(500);
        $reward = $this->makeReward(['stock_quantity' => 0]);

        $this->actingAs($user)
            ->post(route('student.rewards.purchase', $reward->reward_id))
            ->assertSessionHasErrors(['purchase']);

        $this->assertDatabaseMissing('student_reward_inventory', [
            'student_id' => $profile->student_id,
            'reward_id'  => $reward->reward_id,
        ]);

        $this->assertDatabaseHas('student_profiles', [
            'student_id'     => $profile->student_id,
            'current_points' => 500,
        ]);
    }

    public function test_multi_quantity_purchase_deducts_correct_points(): void
    {
        [$user, $profile] = $this->makeStudent(500);
        $reward = $this->makeReward(['point_cost' => 100]);

        $this->actingAs($user)
            ->post(route('student.rewards.purchase', $reward->reward_id), ['quantity' => 3])
            ->assertRedirect(route('student.inventory.index'));

        $this->assertDatabaseHas('student_profiles', [
            'student_id'     => $profile->student_id,
            'current_points' => 200,
        ]);

        $this->assertDatabaseHas('student_reward_inventory', [
            'student_id' => $profile->student_id,
            'reward_id'  => $reward->reward_id,
            'quantity'   => 3,
        ]);

        $this->assertDatabaseHas('reward_records', [
            'student_id'    => $profile->student_id,
            'reward_id'     => $reward->reward_id,
            'quantity'      => 3,
            'points_spent'  => 300,
            'points_before' => 500,
            'points_after'  => 200,
        ]);
    }

    public function test_stock_is_decremented_after_purchase(): void
    {
        [$user] = $this->makeStudent(500);
        $reward = $this->makeReward(['point_cost' => 100, 'stock_quantity' => 5]);

        $this->actingAs($user)
            ->post(route('student.rewards.purchase', $reward->reward_id), ['quantity' => 2])
            ->assertRedirect(route('student.inventory.index'));

        $this->assertDatabaseHas('reward_catalog', [
            'reward_id'      => $reward->reward_id,
            'stock_quantity' => 3,
        ]);
    }
}
