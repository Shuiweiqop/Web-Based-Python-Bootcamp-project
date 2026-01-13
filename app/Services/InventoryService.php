<?php

namespace App\Services;

use App\Models\StudentProfile;
use App\Models\StudentRewardInventory;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Collection;
use Exception;

class InventoryService
{
    /**
     * 获取某个 studentProfile 的 inventory（可 filter）
     */
    public function listInventory(StudentProfile $profile, array $filters = [], int $perPage = 0)
    {
        $q = $profile->rewardInventory()->with('reward')->where('quantity', '>', 0);

        if (!empty($filters['type']) && $filters['type'] !== 'all') {
            $type = $filters['type'];
            $q->whereHas('reward', fn($qq) => $qq->where('reward_type', $type));
        }

        if (isset($filters['equipped'])) {
            $is_eq = filter_var($filters['equipped'], FILTER_VALIDATE_BOOLEAN);
            $q->where('is_equipped', $is_eq);
        }

        if (!empty($filters['search'])) {
            $s = $filters['search'];
            $q->whereHas('reward', fn($qq) => $qq->where('reward_name', 'LIKE', "%{$s}%")->orWhere('description', 'LIKE', "%{$s}%"));
        }

        $q->orderBy('is_equipped', 'desc')->orderBy('obtained_at', 'desc');

        if ($perPage > 0) return $q->paginate($perPage);

        return $q->get();
    }

    /**
     * 获取格式化的 equipped snapshot（保证字段一致）
     */
    public function getEquippedSnapshot(StudentProfile $profile): array
    {
        // 使用 model helper（如果存在），否则 fallback 查询
        if (method_exists($profile, 'getEquippedSnapshot')) {
            $snap = $profile->getEquippedSnapshot();
        } else {
            // fallback: 查找 is_equipped items
            $items = StudentRewardInventory::with('reward')
                ->where('student_id', $profile->student_id)
                ->where('is_equipped', true)
                ->get();

            $snap = [
                'background' => null,
                'profile_background' => null,
                'avatar_frame' => null,
                'title' => null,
                'badges' => [],
            ];

            foreach ($items as $inv) {
                $type = $inv->reward->reward_type ?? null;
                $entry = $this->formatInventoryEntry($inv);
                if ($type === 'badge') $snap['badges'][] = $entry;
                else {
                    $snap[$type] = $entry;
                    if ($type === 'profile_background') $snap['background'] = $entry;
                }
            }
        }

        // 保证字段存在且规范
        return array_merge([
            'background' => null,
            'profile_background' => null,
            'avatar_frame' => null,
            'title' => null,
            'badges' => []
        ], $snap);
    }

    /**
     * equip action
     */
    public function equip(StudentProfile $profile, int $inventoryId): array
    {
        return DB::transaction(function () use ($profile, $inventoryId) {
            $inv = $profile->rewardInventory()->with('reward')->where('inventory_id', $inventoryId)->firstOrFail();
            $type = $inv->reward->reward_type ?? null;

            // Unequip same type others
            if ($type) {
                $profile->rewardInventory()
                    ->whereHas('reward', fn($q) => $q->where('reward_type', $type))
                    ->where('inventory_id', '!=', $inventoryId)
                    ->update(['is_equipped' => false, 'equipped_at' => null]);
            }

            $inv->update(['is_equipped' => true, 'equipped_at' => now()]);

            // 更新 snapshot（model method 如果存在）
            if (method_exists($profile, 'updateEquippedSnapshot')) {
                $profile->updateEquippedSnapshot();
            }

            // refresh and return snapshot
            $profile->refresh();
            return $this->getEquippedSnapshot($profile);
        });
    }

    /**
     * unequip action
     */
    public function unequip(StudentProfile $profile, int $inventoryId): array
    {
        return DB::transaction(function () use ($profile, $inventoryId) {
            $inv = $profile->rewardInventory()->where('inventory_id', $inventoryId)->firstOrFail();

            $inv->update(['is_equipped' => false, 'equipped_at' => null]);

            if (method_exists($profile, 'updateEquippedSnapshot')) {
                $profile->updateEquippedSnapshot();
            }

            $profile->refresh();
            // 关键：确保返回的对应键被设为 null（避免前端被覆盖）
            $snapshot = $this->getEquippedSnapshot($profile);
            // 强制把类型为该 inv.reward.reward_type 的键设为 null（以防 model 未清理）
            try {
                $rewardType = optional($inv->reward)->reward_type;
                if ($rewardType) {
                    if ($rewardType === 'badge') {
                        // 移除该 badge（以 inventory_id 为准）
                        $snapshot['badges'] = array_values(array_filter($snapshot['badges'], fn($b) => ($b['id'] ?? null) !== $inv->inventory_id));
                    } else {
                        if (isset($snapshot[$rewardType])) $snapshot[$rewardType] = null;
                        if ($rewardType === 'profile_background' && isset($snapshot['background'])) $snapshot['background'] = null;
                    }
                }
            } catch (\Throwable $e) {
                // ignore format guard
            }

            return $snapshot;
        });
    }

    /**
     * 将 inventory item 格式化为前端期望的 entry
     */
    public function formatInventoryEntry(StudentRewardInventory $inv): array
    {
        $r = $inv->reward;
        $meta = is_string($r->metadata) ? json_decode($r->metadata, true) : ($r->metadata ?? []);
        return [
            'id' => $inv->inventory_id,
            'reward_id' => $inv->reward_id,
            'name' => $r->reward_name ?? $r->name ?? null,
            'image_url' => $r->image_url ?? null,
            'reward_type' => $r->reward_type ?? null,
            'rarity' => $r->rarity ?? null,
            'metadata' => $meta,
        ];
    }
}
