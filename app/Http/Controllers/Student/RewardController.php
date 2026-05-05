<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use App\Models\RewardRecord;
use App\Models\StudentProfile;
use App\Models\StudentRewardInventory;
use App\Services\RewardPurchaseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        $rewards->getCollection()->transform(function ($reward) use ($ownedQuantities, $studentProfile) {
            $pk = $reward->getKey();
            $owned = (int) $ownedQuantities->get($pk, 0);
            $reward->owned_quantity = $owned;

            $withinOwnershipLimit = ($reward->max_owned ?? -1) < 0 || $owned < $reward->max_owned;

            $reward->can_purchase = ($studentProfile->current_points >= ($reward->point_cost ?? 0))
                && $reward->canPurchase()
                && $withinOwnershipLimit;

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
            'rewardTypes' => Reward::TYPES,
            'rarities'    => Reward::RARITIES,
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
    public function show(int|string $id)
    {
        $studentProfile = $this->getStudentProfile();
        $reward = Reward::where('is_active', true)
            ->where('reward_id', $id)
            ->firstOrFail();

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

    public function purchase(Request $request, int|string $rewardId)
    {
        $quantity = (int) ($request->validate([
            'quantity' => 'sometimes|integer|min:1|max:10',
        ])['quantity'] ?? 1);

        try {
            $result = app(RewardPurchaseService::class)
                ->purchase($this->getStudentProfile(), $rewardId, $quantity);

            $message = $result['message'];
        } catch (\RuntimeException $e) {
            $msg = $e->getMessage();
            return $request->header('X-Inertia') || !$request->wantsJson()
                ? back()->withErrors(['purchase' => $msg])
                : response()->json(['success' => false, 'message' => $msg], 422);
        }

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json(array_merge(['success' => true], $result));
        }

        return redirect()->route('student.inventory.index')->with('success', $message);
    }



    /**
     * 获取购买历史
     */
    public function history()
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
