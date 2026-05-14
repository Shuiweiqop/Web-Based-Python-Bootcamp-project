<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use App\Models\StudentRewardInventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/**
 * ✅ 库存管理控制器（Inertia 专用）
 * 
 * 关键点：
 * 1. equip/unequip 方法只返回 back()（Inertia 响应）
 * 2. AppServiceProvider 会自动重新加载 equipped 数据
 * 3. equipped() 方法支持 AJAX（用于手动刷新）
 */
class InventoryController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:student']);
    }

    /**
     * 获取当前学生资料
     */
    protected function getStudentProfile()
    {
        $user = Auth::user();
        return StudentProfile::where('user_Id', $user->user_Id)->firstOrFail();
    }

    /**
     * 显示库存页面
     * 
     * GET /student/inventory
     */
    public function index(Request $request)
    {
        $studentProfile = $this->getStudentProfile();

        $query = StudentRewardInventory::with('reward')
            ->where('student_id', $studentProfile->student_id)
            ->where('quantity', '>', 0);

        // 筛选：类型
        if ($request->filled('type') && $request->type !== 'all') {
            $query->whereHas('reward', function ($q) use ($request) {
                $q->where('reward_type', $request->type);
            });
        }

        // 筛选：装备状态
        if ($request->filled('equipped')) {
            $query->where('is_equipped', $request->equipped === 'true');
        }

        // 排序
        $query->orderBy('is_equipped', 'desc')
            ->orderBy('obtained_at', 'desc');

        $inventoryItems = $query->get();

        // 格式化数据
        $inventory = $inventoryItems->map(function ($item) {
            if (!$item->reward) {
                Log::warning('Missing reward relationship', [
                    'inventory_id' => $item->inventory_id,
                    'reward_id' => $item->reward_id,
                ]);
                return null;
            }

            return [
                'inventory_id' => $item->inventory_id,
                'id' => $item->inventory_id, // ✅ 别名
                'reward_id' => $item->reward_id,
                'name' => $item->reward->name,
                'reward_name' => $item->reward->name, // ✅ 别名
                'description' => $item->reward->description,
                'reward_type' => $item->reward->reward_type,
                'type' => $item->reward->reward_type, // ✅ 别名
                'rarity' => $item->reward->rarity,
                'image_url' => $item->reward->image_url,
                'quantity' => $item->quantity,
                'is_equipped' => (bool) $item->is_equipped,
                'obtained_at' => $item->obtained_at?->diffForHumans(),
                'metadata' => is_string($item->reward->metadata)
                    ? json_decode($item->reward->metadata, true)
                    : ($item->reward->metadata ?? []),
                // ✅ 完整的 reward 对象
                'reward' => [
                    'reward_id' => $item->reward->reward_id,
                    'reward_name' => $item->reward->name,
                    'name' => $item->reward->name,
                    'reward_type' => $item->reward->reward_type,
                    'rarity' => $item->reward->rarity,
                    'image_url' => $item->reward->image_url,
                    'metadata' => is_string($item->reward->metadata)
                        ? json_decode($item->reward->metadata, true)
                        : ($item->reward->metadata ?? []),
                ],
            ];
        })->filter()->values();

        // 统计信息
        $stats = [
            'total_rewards' => $inventoryItems->sum('quantity'),
            'equipped_count' => $inventoryItems->where('is_equipped', true)->count(),
            'unique_rewards' => $inventoryItems->count(),
            'by_type' => $inventoryItems->groupBy(function ($item) {
                return $item->reward->reward_type;
            })->map(function ($items) {
                return $items->sum('quantity');
            })->toArray(),
        ];

        return Inertia::render('Student/Inventory/Index', [
            'inventory' => $inventory->toArray(),
            'currentPoints' => $studentProfile->current_points,
            'stats' => $stats,
            'rewardTypes' => [
                'avatar_frame' => 'Avatar Frame',
                'profile_background' => 'Background',
                'badge' => 'Badge',
                'profile_title' => 'Title',
                'theme' => 'Theme',
                'effect' => 'Effect',
            ],
            'filters' => [
                'type' => $request->get('type', 'all'),
                'equipped' => $request->get('equipped'),
            ],
        ]);
    }

    /**
     * ✅ 获取当前装备状态（仅支持 AJAX）
     * 
     * GET /student/inventory/equipped
     * 
     * 用途：手动刷新装备状态，不用于 Inertia router 调用
     */
    public function equipped(Request $request)
    {
        try {
            $studentProfile = $this->getStudentProfile();
            $snapshot = $studentProfile->getEquippedSnapshot();

            Log::info('📡 Fetched equipped status', [
                'student_id' => $studentProfile->student_id,
                'has_background' => $snapshot['background'] !== null,
            ]);

            // ✅ 只支持 AJAX/JSON 请求
            return response()->json([
                'success' => true,
                'equipped' => $snapshot,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch equipped status', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load equipped items'
            ], 500);
        }
    }

    /**
     * ✅ 装备物品（只返回 Inertia 响应）
     * 
     * POST /student/inventory/{id}/equip
     */
    public function equip($inventoryId)
    {
        DB::beginTransaction();
        try {
            $studentProfile = $this->getStudentProfile();

            $inventory = StudentRewardInventory::where('inventory_id', $inventoryId)
                ->where('student_id', $studentProfile->student_id)
                ->with('reward')
                ->firstOrFail();

            $rewardType = $inventory->reward->reward_type;

            // 卸载同类型的其他物品
            StudentRewardInventory::where('student_id', $studentProfile->student_id)
                ->where('inventory_id', '!=', $inventoryId)
                ->whereHas('reward', function ($q) use ($rewardType) {
                    $q->where('reward_type', $rewardType);
                })
                ->update([
                    'is_equipped' => false,
                    'equipped_at' => null,
                ]);

            // 装备选中的物品
            $inventory->update([
                'is_equipped' => true,
                'equipped_at' => now(),
            ]);

            // ✅ 更新装备快照（触发 AppServiceProvider 重新加载）
            $studentProfile->updateEquippedSnapshot();

            DB::commit();

            Log::info('✅ Item equipped successfully', [
                'student_id' => $studentProfile->student_id,
                'inventory_id' => $inventoryId,
                'reward_name' => $inventory->reward->name,
                'reward_type' => $rewardType,
            ]);

            // ✅ 只返回 Inertia 响应（back 会触发 props 更新）
            return back()->with('success', "Successfully equipped {$inventory->reward->name}!");
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('❌ Failed to equip item', [
                'error' => $e->getMessage(),
                'inventory_id' => $inventoryId,
            ]);

            return back()->withErrors([
                'equip' => 'Failed to equip item. Please try again.'
            ]);
        }
    }

    /**
     * ✅ 卸下物品（只返回 Inertia 响应）
     * 
     * POST /student/inventory/{id}/unequip
     */
    public function unequip($inventoryId)
    {
        DB::beginTransaction();
        try {
            $studentProfile = $this->getStudentProfile();

            $inventory = StudentRewardInventory::where('inventory_id', $inventoryId)
                ->where('student_id', $studentProfile->student_id)
                ->with('reward')
                ->firstOrFail();

            // 卸下物品
            $inventory->update([
                'is_equipped' => false,
                'equipped_at' => null,
            ]);

            // ✅ 更新装备快照（触发 AppServiceProvider 重新加载）
            $studentProfile->updateEquippedSnapshot();

            DB::commit();

            Log::info('✅ Item unequipped successfully', [
                'student_id' => $studentProfile->student_id,
                'inventory_id' => $inventoryId,
                'reward_name' => $inventory->reward->name,
            ]);

            // ✅ 只返回 Inertia 响应（back 会触发 props 更新）
            return back()->with('success', "Successfully unequipped {$inventory->reward->name}!");
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('❌ Failed to unequip item', [
                'error' => $e->getMessage(),
                'inventory_id' => $inventoryId,
            ]);

            return back()->withErrors([
                'unequip' => 'Failed to unequip item. Please try again.'
            ]);
        }
    }

    /**
     * 切换装备状态
     * 
     * POST /student/inventory/{id}/toggle
     */
    public function toggle($inventoryId)
    {
        try {
            $studentProfile = $this->getStudentProfile();

            $inventory = StudentRewardInventory::where('inventory_id', $inventoryId)
                ->where('student_id', $studentProfile->student_id)
                ->firstOrFail();

            if ($inventory->is_equipped) {
                return $this->unequip($inventoryId);
            } else {
                return $this->equip($inventoryId);
            }
        } catch (\Exception $e) {
            Log::error('Failed to toggle equip status', [
                'error' => $e->getMessage(),
                'inventory_id' => $inventoryId,
            ]);

            return back()->withErrors([
                'toggle' => 'Failed to toggle item. Please try again.'
            ]);
        }
    }
}
