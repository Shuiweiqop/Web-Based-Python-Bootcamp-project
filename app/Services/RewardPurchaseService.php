<?php

namespace App\Services;

use App\Models\Reward;
use App\Models\RewardRecord;
use App\Models\StudentProfile;
use App\Models\StudentRewardInventory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RewardPurchaseService
{
    public function purchase(StudentProfile $student, int|string $rewardId, int $quantity = 1): array
    {
        return DB::transaction(function () use ($student, $rewardId, $quantity) {
            $student = StudentProfile::where('student_id', $student->student_id)
                ->lockForUpdate()
                ->firstOrFail();

            $reward = Reward::where('reward_id', $rewardId)
                ->lockForUpdate()
                ->firstOrFail();

            $this->assertPurchasable($reward);
            $this->assertSufficientPoints($student, $reward, $quantity);
            $this->assertStock($reward, $quantity);
            $this->assertOwnershipLimit($student, $reward, $quantity);

            $pointsBefore = $student->current_points;
            $totalCost = $reward->point_cost * $quantity;

            $student->deductPoints($totalCost);
            $this->updateInventory($student, $reward, $quantity);
            $this->recordPurchase($student, $reward, $quantity, $pointsBefore, $totalCost);

            Log::info('Reward purchase completed successfully', [
                'student_id' => $student->student_id,
                'reward_id' => $reward->reward_id,
                'quantity' => $quantity,
                'points_spent' => $totalCost,
                'points_remaining' => $student->current_points,
            ]);

            return [
                'message' => "Successfully purchased {$reward->name} x{$quantity}. Spent {$totalCost} points.",
                'remaining_points' => $student->current_points,
            ];
        }, 5);
    }

    private function assertPurchasable(Reward $reward): void
    {
        if (! $reward->canPurchase()) {
            throw new \RuntimeException('This reward is currently unavailable for purchase.');
        }
    }

    private function assertSufficientPoints(StudentProfile $student, Reward $reward, int $quantity): void
    {
        $total = $reward->point_cost * $quantity;

        if ($student->current_points < $total) {
            throw new \RuntimeException(
                "Not enough points. You need {$total} points, but you currently have {$student->current_points}."
            );
        }
    }

    private function assertStock(Reward $reward, int $quantity): void
    {
        if (is_null($reward->stock_quantity) || $reward->stock_quantity < 0) {
            return;
        }

        if ($reward->stock_quantity < $quantity) {
            throw new \RuntimeException("Not enough stock. Only {$reward->stock_quantity} left.");
        }

        $affected = Reward::where('reward_id', $reward->reward_id)
            ->where('stock_quantity', '>=', $quantity)
            ->decrement('stock_quantity', $quantity);

        if (! $affected) {
            throw new \RuntimeException('Failed to update stock. Please try again.');
        }
    }

    private function assertOwnershipLimit(StudentProfile $student, Reward $reward, int $quantity): void
    {
        if (($reward->max_owned ?? -1) < 0) {
            return;
        }

        $owned = (int) StudentRewardInventory::where('student_id', $student->student_id)
            ->where('reward_id', $reward->reward_id)
            ->sum('quantity');

        if (($owned + $quantity) > $reward->max_owned) {
            $remaining = max(0, $reward->max_owned - $owned);
            throw new \RuntimeException("Purchase limit exceeded. You can only buy {$remaining} more.");
        }
    }

    private function updateInventory(StudentProfile $student, Reward $reward, int $quantity): void
    {
        $inventory = StudentRewardInventory::firstOrCreate(
            [
                'student_id' => $student->student_id,
                'reward_id' => $reward->reward_id,
            ],
            [
                'quantity' => 0,
                'obtained_at' => now(),
                'is_equipped' => false,
            ]
        );

        $inventory->wasRecentlyCreated
            ? $inventory->update(['quantity' => $quantity])
            : $inventory->addQuantity($quantity);
    }

    private function recordPurchase(
        StudentProfile $student,
        Reward $reward,
        int $quantity,
        int $pointsBefore,
        int $totalCost
    ): void {
        RewardRecord::create([
            'student_id' => $student->student_id,
            'reward_id' => $reward->reward_id,
            'quantity' => $quantity,
            'points_spent' => $totalCost,
            'points_before' => $pointsBefore,
            'points_after' => $student->current_points,
            'points_changed' => $student->current_points - $pointsBefore,
            'issued_by' => 'student_purchase',
            'issued_at' => now(),
        ]);
    }
}
