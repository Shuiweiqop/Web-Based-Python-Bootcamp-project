<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use App\Models\RewardRecord;
use App\Models\StudentProfile;
use App\Models\StudentRewardInventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RewardController extends Controller
{
    /**
     * Get current student profile
     */
    protected function getStudentProfile()
    {
        $user = Auth::user();
        return StudentProfile::where('user_Id', $user->user_Id)->firstOrFail();
    }

    public function index(Request $request)
    {
        $studentProfile = $this->getStudentProfile();

        $query = Reward::where('is_active', true)
            ->where(function ($q) {
                $q->where('stock_quantity', '>', 0)
                    ->orWhereNull('stock_quantity')
                    ->orWhere('stock_quantity', -1);
            });

        // 筛选
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('reward_type', $request->type);
        }
        if ($request->filled('rarity') && $request->rarity !== 'all') {
            $query->where('rarity', $request->rarity);
        }
        if ($request->filled('max_price')) {
            $query->where('point_cost', '<=', (int) $request->max_price);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // 安全排序：只允许 asc/desc
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = strtolower($request->get('order', 'desc')) === 'asc' ? 'asc' : 'desc';
        $validSorts = ['created_at', 'point_cost', 'name', 'rarity'];
        if (in_array($sortBy, $validSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $rewards = $query->paginate(12)->withQueryString();

        // 更安全且效率更高的 owned quantities：用 DB 聚合得到 [reward_id => total]
        $ownedQuantities = StudentRewardInventory::where('student_id', $studentProfile->student_id)
            ->selectRaw('reward_id, SUM(quantity) as total')
            ->groupBy('reward_id')
            ->pluck('total', 'reward_id'); // Collection keyed by reward_id

        // 为每个奖励添加拥有数量信息与是否可购买（注意主键不一定叫 reward_id）
        $rewards->getCollection()->transform(function ($reward) use ($ownedQuantities, $studentProfile) {
            // 使用 model 的主键值以防不同命名（id / reward_id）
            $pk = $reward->getKey();
            $reward->owned_quantity = (int) ($ownedQuantities->get($pk, 0));

            // 注意：确保 Reward 模型有 canPurchase() 和 canStudentOwn($student_id) 方法
            $reward->can_purchase = ($studentProfile->current_points >= ($reward->point_cost ?? 0))
                && (method_exists($reward, 'canPurchase') ? $reward->canPurchase() : true)
                && (method_exists($reward, 'canStudentOwn') ? $reward->canStudentOwn($studentProfile->student_id) : true);

            return $reward;
        });

        return Inertia::render('Student/Rewards/Index', [
            'rewards' => $rewards,
            'studentPoints' => $studentProfile->current_points,
            'studentProfile' => [
                'student_id' => $studentProfile->student_id,
                'current_points' => $studentProfile->current_points,
                'points_level' => $studentProfile->points_level,
            ],
            'rewardTypes' => [
                'avatar_frame' => '头像框',
                'profile_background' => '背景',
                'badge' => '徽章',
                'title' => '称号',
                'theme' => '主题',
                'effect' => '特效',
            ],
            'rarities' => [
                'common' => '普通',
                'rare' => '稀有',
                'epic' => '史诗',
                'legendary' => '传说',
            ],
            'filters' => [
                'type' => $request->get('type', 'all'),
                'rarity' => $request->get('rarity', 'all'),
                'max_price' => $request->get('max_price'),
                'search' => $request->get('search', ''),
                'sort' => $sortBy,
                'order' => $sortOrder,
            ],
        ]);
    }


    /**
     * 显示单个奖励详情
     */
    public function show($id)
    {
        $studentProfile = $this->getStudentProfile();
        $reward = Reward::where('is_active', true)
            ->where(function ($q) use ($id) {
                // 如果传进来是数字，尝试匹配模型主键或 reward_id 字段
                $q->where($q->getModel()->getKeyName(), $id)
                    ->orWhere('reward_id', $id);
            })->firstOrFail();

        // 获取拥有数量
        $ownedQuantity = StudentRewardInventory::where('student_id', $studentProfile->student_id)
            ->where('reward_id', $reward->reward_id)
            ->sum('quantity');

        // 判断是否可以购买
        $canPurchase = $studentProfile->current_points >= $reward->point_cost
            && $reward->canPurchase()
            && $reward->canStudentOwn($studentProfile->student_id);

        // 获取已购买此奖励的学生数量
        $purchaseCount = RewardRecord::where('reward_id', $reward->reward_id)
            ->where('issued_by', 'student_purchase')
            ->count();

        return Inertia::render('Student/Rewards/Show', [
            'reward' => $reward,
            'studentPoints' => $studentProfile->current_points,
            'ownedQuantity' => $ownedQuantity,
            'canPurchase' => $canPurchase,
            'purchaseCount' => $purchaseCount,
        ]);
    }

    /**
     * 购买奖励
     */
    /**
     * 购买奖励 — 使用 DB::transaction() closure 简化事务与回滚，支持 AJAX/Inertia JSON 返回
     */
    /**
     * 购买奖励 — 完整实现（与 reward_records 表含 points_before/points_after/points_changed 对齐）
     */
    public function purchase(Request $request, $rewardId)
    {
        $data = $request->validate([
            'quantity' => 'sometimes|integer|min:1|max:10',
        ]);
        $quantity = (int) ($data['quantity'] ?? 1);

        try {
            $result = DB::transaction(function () use ($rewardId, $quantity) {
                // 1) 取得并锁定 student profile
                $studentProfile = $this->getStudentProfile();
                $studentProfile = StudentProfile::where('student_id', $studentProfile->student_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                // 2) 锁定 reward
                $rewardQuery = Reward::where(function ($q) use ($rewardId) {
                    $q->where($q->getModel()->getKeyName(), $rewardId)
                        ->orWhere('reward_id', $rewardId);
                });
                $reward = $rewardQuery->lockForUpdate()->firstOrFail();

                // 3) 验证可购买性
                if (method_exists($reward, 'canPurchase') && !$reward->canPurchase()) {
                    throw new \RuntimeException('此奖励暂时无法购买。');
                }

                // 4) 计算价格 & 积分检查
                $pricePerUnit = (int) ($reward->point_cost ?? 0);
                $totalCost = $pricePerUnit * $quantity;
                if ($studentProfile->current_points < $totalCost) {
                    throw new \RuntimeException("积分不足！需要 {$totalCost} 积分，您当前有 {$studentProfile->current_points} 积分。");
                }

                // 5) 库存检查并减少（若存在库存限制）
                if (!is_null($reward->stock_quantity) && $reward->stock_quantity !== -1) {
                    if ($reward->stock_quantity < $quantity) {
                        throw new \RuntimeException("库存不足！仅剩 {$reward->stock_quantity} 个。");
                    }
                    // 尝试调用模型方法减少库存，若没有则用原子 decrement
                    if (method_exists($reward, 'decreaseStock')) {
                        if (!$reward->decreaseStock($quantity)) {
                            throw new \RuntimeException('库存更新失败，请重试。');
                        }
                    } else {
                        $affected = Reward::where($reward->getKeyName(), $reward->getKey())
                            ->where('stock_quantity', '>=', $quantity)
                            ->decrement('stock_quantity', $quantity);
                        if (!$affected) {
                            throw new \RuntimeException('库存更新失败，请重试。');
                        }
                        $reward->refresh();
                    }
                }

                // 6) 拥有上限检查
                $currentOwned = StudentRewardInventory::where('student_id', $studentProfile->student_id)
                    ->where('reward_id', $reward->getKey())
                    ->sum('quantity');

                if (($reward->max_owned ?? -1) !== -1 && ($currentOwned + $quantity) > $reward->max_owned) {
                    $remaining = max(0, $reward->max_owned - $currentOwned);
                    throw new \RuntimeException("超过拥有上限！您最多还能购买 {$remaining} 个。");
                }

                // 7) 扣分（保存前记录）
                $pointsBefore = $studentProfile->current_points;
                // 使用模型方法扣分（确保该方法会 save() 并 refresh()）
                if (!method_exists($studentProfile, 'deductPoints')) {
                    // 兜底：直接修改并保存
                    $studentProfile->current_points = max(0, $studentProfile->current_points - $totalCost);
                    $studentProfile->save();
                    $studentProfile->refresh();
                } else {
                    $studentProfile->deductPoints($totalCost);
                }
                $pointsAfter = $studentProfile->current_points;
                $pointsChanged = $pointsAfter - $pointsBefore; // 通常为负数

                // 8) 写入或累加背包（firstOrCreate 在 transaction 内）
                $inventory = StudentRewardInventory::firstOrCreate(
                    [
                        'student_id' => $studentProfile->student_id,
                        'reward_id' => $reward->getKey(),
                    ],
                    [
                        'quantity' => 0,
                        'obtained_at' => now(),
                        'is_equipped' => false,
                    ]
                );

                if ($inventory->wasRecentlyCreated) {
                    $inventory->quantity = $quantity;
                    $inventory->save();
                } else {
                    $inventory->addQuantity($quantity);
                }

                // 9) 写购买记录 —— 注意：表含 points_before/points_after/points_changed
                // 确保 RewardRecord 模型 fillable 包含这些字段
                RewardRecord::create([
                    'student_id'    => $studentProfile->student_id,
                    'reward_id'     => $reward->getKey(), // 或 $reward->reward_id，按你主键
                    'quantity'      => $quantity,
                    'points_spent'  => $totalCost,
                    'points_before' => $pointsBefore,
                    'points_after'  => $pointsAfter,
                    'points_changed' => $pointsChanged,
                    'issued_by'     => 'student_purchase',
                    'issued_at'     => now(),
                ]);

                // 10) 日志 & 返回数据
                Log::info('✅ 奖励购买成功', [
                    'student_id' => $studentProfile->student_id,
                    'reward_id'  => $reward->getKey(),
                    'quantity'   => $quantity,
                    'points_spent' => $totalCost,
                    'points_remaining' => $pointsAfter,
                ]);

                return [
                    'message' => "成功购买 {$reward->name} x{$quantity}！消耗 {$totalCost} 积分。",
                    'remaining_points' => $pointsAfter,
                    'inventory_quantity' => $inventory->quantity,
                    'reward' => $reward,
                    'inventory' => $inventory,
                ];
            }, 5); // 重试事务 5 次以防死锁

            // 事务成功后，根据请求类型返回
            $message = $result['message'] ?? '购买成功';

            // 如果是 Inertia 发起的请求（带 X-Inertia header），**不要返回 JSON**，而是重定向
            if ($request->header('X-Inertia')) {
                return redirect()->route('student.inventory.index')->with('success', $message);
            }

            // 纯 AJAX / API 请求可以返回 JSON
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json(array_merge(['success' => true], $result));
            }

            // 传统表单提交也 redirect
            return redirect()->route('student.inventory.index')->with('success', $message);
        } catch (\Throwable $e) {
            // 遇到异常：记录并对不同请求类型返回合适响应
            Log::error('❌ 奖励购买失败', [
                'error' => $e->getMessage(),
                'reward_id' => $rewardId,
                'trace' => $e->getTraceAsString(),
            ]);

            $msg = $e instanceof \RuntimeException ? $e->getMessage() : '购买失败，请稍后重试。';

            if ($request->header('X-Inertia')) {
                // Inertia 请求：返回 redirect/back withErrors（Inertia 会把它转回客户端）
                return back()->withErrors(['purchase' => $msg]);
            }

            if ($request->wantsJson() || $request->ajax()) {
                return response()->json(['success' => false, 'message' => $msg], 422);
            }

            return back()->withErrors(['purchase' => $msg]);
        }
    }



    /**
     * 获取购买历史
     */
    public function history(Request $request)
    {
        $studentProfile = $this->getStudentProfile();

        $records = RewardRecord::where('student_id', $studentProfile->student_id)
            ->with('reward')
            ->orderBy('issued_at', 'desc')
            ->paginate(20);

        return Inertia::render('Student/Rewards/History', [
            'records' => $records,
            'studentPoints' => $studentProfile->current_points,
        ]);
    }
}
