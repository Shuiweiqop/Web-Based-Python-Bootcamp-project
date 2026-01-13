<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use App\Models\StudentRewardInventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class StudentEquipController extends Controller
{
    /**
     * Get current student profile
     */
    protected function getStudentProfile()
    {
        $user = Auth::user();
        return StudentProfile::where('user_Id', $user->user_Id)->firstOrFail();
    }

    /**
     * 获取背包物品列表 (API - 返回 JSON)
     */
    public function getInventory(Request $request)
    {
        try {
            $studentProfile = $this->getStudentProfile();

            $query = StudentRewardInventory::with('reward')
                ->where('student_id', $studentProfile->student_id)
                ->hasStock(); // 使用 Model 的 scope

            // 类型过滤
            if ($request->filled('type') && $request->type !== 'all') {
                $query->byRewardType($request->type); // 使用 Model 的 scope
            }

            // 稀有度过滤
            if ($request->filled('rarity') && $request->rarity !== 'all') {
                $query->whereHas('reward', function ($q) use ($request) {
                    $q->where('rarity', $request->rarity);
                });
            }

            // 搜索
            if ($request->filled('search')) {
                $search = $request->search;
                $query->whereHas('reward', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // 排序：已装备的在前
            $query->orderBy('is_equipped', 'desc')
                ->orderBy('obtained_at', 'desc');

            // 分页
            $perPage = $request->get('per_page', 20);
            $items = $query->paginate($perPage);

            // 格式化数据（匹配前端 useInventory 和 RewardCard 期望的格式）
            $formattedItems = $items->map(function ($inventory) {
                return [
                    // ✅ 主要字段
                    'id' => $inventory->inventory_id,
                    'reward_id' => $inventory->reward_id,
                    'name' => $inventory->reward->name,
                    'image_url' => $inventory->reward->image_url,
                    'type' => $inventory->reward->reward_type,
                    'reward_type' => $inventory->reward->reward_type,
                    'rarity' => $inventory->reward->rarity,
                    'description' => $inventory->reward->description,
                    'quantity' => $inventory->quantity,
                    'is_equipped' => $inventory->is_equipped,
                    'obtained_at' => $inventory->obtained_at?->toISOString(),

                    // ✅ Metadata（支持动画背景等）
                    'metadata' => is_string($inventory->reward->metadata)
                        ? json_decode($inventory->reward->metadata, true)
                        : ($inventory->reward->metadata ?? []),

                    // ✅ 嵌套的 reward 对象（兼容前端多种取值方式）
                    'reward' => [
                        'reward_id' => $inventory->reward_id,
                        'reward_name' => $inventory->reward->name,
                        'name' => $inventory->reward->name,
                        'reward_type' => $inventory->reward->reward_type,
                        'image_url' => $inventory->reward->image_url,
                        'rarity' => $inventory->reward->rarity,
                        'description' => $inventory->reward->description,
                        'points_cost' => $inventory->reward->points_cost,
                        'metadata' => is_string($inventory->reward->metadata)
                            ? json_decode($inventory->reward->metadata, true)
                            : ($inventory->reward->metadata ?? []),
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'items' => $formattedItems,
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Failed to fetch inventory', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load inventory: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 获取单个物品详情
     */
    public function getInventoryItem($id)
    {
        try {
            $studentProfile = $this->getStudentProfile();

            $inventory = StudentRewardInventory::with('reward')
                ->where('inventory_id', $id)
                ->where('student_id', $studentProfile->student_id)
                ->hasStock()
                ->firstOrFail();

            return response()->json([
                'success' => true,
                'item' => [
                    'id' => $inventory->inventory_id,
                    'reward_id' => $inventory->reward_id,
                    'name' => $inventory->reward->name,
                    'image_url' => $inventory->reward->image_url,
                    'type' => $inventory->reward->reward_type,
                    'reward_type' => $inventory->reward->reward_type,
                    'rarity' => $inventory->reward->rarity,
                    'description' => $inventory->reward->description,
                    'quantity' => $inventory->quantity,
                    'is_equipped' => $inventory->is_equipped,
                    'metadata' => is_string($inventory->reward->metadata)
                        ? json_decode($inventory->reward->metadata, true)
                        : ($inventory->reward->metadata ?? []),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found'
            ], 404);
        }
    }

    /**
     * 获取当前装备状态
     */
    public function getEquipped()
    {
        try {
            $studentProfile = $this->getStudentProfile();

            // 使用 Model 的 scope
            $equippedItems = StudentRewardInventory::with('reward')
                ->where('student_id', $studentProfile->student_id)
                ->equipped() // 使用 Model 的 scope
                ->hasStock()
                ->get();

            $equipped = [
                'background' => null,
                'profile_background' => null,
                'avatar_frame' => null,
                'title' => null,
                'badges' => []
            ];

            foreach ($equippedItems as $inventory) {
                $type = $inventory->reward->reward_type;
                $data = [
                    'id' => $inventory->reward_id,
                    'name' => $inventory->reward->name,
                    'reward_name' => $inventory->reward->name,
                    'image_url' => $inventory->reward->image_url,
                    'reward_type' => $type,
                    'type' => $type,
                    'rarity' => $inventory->reward->rarity,
                    'metadata' => is_string($inventory->reward->metadata)
                        ? json_decode($inventory->reward->metadata, true)
                        : ($inventory->reward->metadata ?? [])
                ];

                if ($type === 'badge') {
                    $equipped['badges'][] = $data;
                } else {
                    $equipped[$type] = $data;
                    // ✅ 兼容：profile_background → background
                    if ($type === 'profile_background') {
                        $equipped['background'] = $data;
                    }
                }
            }

            return response()->json([
                'success' => true,
                'equipped' => $equipped
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Failed to get equipped items', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load equipped items'
            ], 500);
        }
    }

    /**
     * 装备物品
     */
    /**
     * 装备物品
     */
    public function equip(Request $request)
    {
        $request->validate([
            'item_id' => 'required|integer|exists:student_reward_inventory,inventory_id'
        ]);

        try {
            $studentProfile = $this->getStudentProfile();
            $itemId = $request->input('item_id');

            // ✅ 查找物品
            $inventory = StudentRewardInventory::with('reward')
                ->where('inventory_id', $itemId)
                ->where('student_id', $studentProfile->student_id)
                ->hasStock()
                ->firstOrFail();

            // ✅ 检查是否可以装备
            if (!$inventory->canEquip()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Item is already equipped or cannot be equipped'
                ], 400);
            }

            // ✅ 使用 Model 的 equip() 方法（自动处理同类型卸载）
            $inventory->equip();

            Log::info('✅ Item equipped', [
                'student_id' => $studentProfile->student_id,
                'inventory_id' => $itemId,
                'reward_id' => $inventory->reward_id,
                'reward_name' => $inventory->reward->name,
                'type' => $inventory->reward->reward_type
            ]);

            // ✅ 返回最新装备状态
            return $this->getEquipped();
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found or not owned'
            ], 404);
        } catch (\Exception $e) {
            Log::error('❌ Failed to equip item', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to equip item: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 卸载物品
     */
    public function unequip(Request $request)
    {
        $request->validate([
            'item_id' => 'required|integer|exists:student_reward_inventory,inventory_id'
        ]);

        try {
            $studentProfile = $this->getStudentProfile();
            $itemId = $request->input('item_id');

            // ✅ 查找物品
            $inventory = StudentRewardInventory::with('reward')
                ->where('inventory_id', $itemId)
                ->where('student_id', $studentProfile->student_id)
                ->firstOrFail();

            // ✅ 检查是否已装备
            if (!$inventory->is_equipped) {
                return response()->json([
                    'success' => false,
                    'message' => 'Item is not equipped'
                ], 400);
            }

            // ✅ 使用 Model 的 unequip() 方法
            $inventory->unequip();

            Log::info('✅ Item unequipped', [
                'student_id' => $studentProfile->student_id,
                'inventory_id' => $itemId,
                'reward_id' => $inventory->reward_id,
                'reward_name' => $inventory->reward->name,
                'type' => $inventory->reward->reward_type
            ]);

            // ✅ 返回最新装备状态
            return $this->getEquipped();
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('❌ Failed to unequip item', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to unequip item: ' . $e->getMessage()
            ], 500);
        }
    }
    /**
     * 卸载指定类型的所有物品
     */
    public function unequipAll(Request $request)
    {
        $request->validate([
            'type' => 'required|string|in:background,profile_background,avatar_frame,title,badge'
        ]);

        try {
            $studentProfile = $this->getStudentProfile();
            $type = $request->input('type');

            return $this->unequipByType($studentProfile, $type);
        } catch (\Exception $e) {
            Log::error('❌ Failed to unequip all', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to unequip items'
            ], 500);
        }
    }

    /**
     * 卸载指定类型的物品（内部方法）
     */
    private function unequipByType($studentProfile, $type)
    {
        try {
            // ✅ 获取该类型已装备的物品
            $equippedItems = StudentRewardInventory::where('student_id', $studentProfile->student_id)
                ->equipped()
                ->byRewardType($type)
                ->get();

            // ✅ 使用 Model 的 unequip() 方法
            foreach ($equippedItems as $inventory) {
                $inventory->unequip();
            }

            Log::info('✅ Items unequipped', [
                'student_id' => $studentProfile->student_id,
                'type' => $type,
                'count' => $equippedItems->count()
            ]);

            // ✅ 返回最新装备状态
            return $this->getEquipped();
        } catch (\Exception $e) {
            Log::error('❌ Failed to unequip items', [
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }
}
