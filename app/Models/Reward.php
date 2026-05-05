<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;


class Reward extends Model
{
    protected $table = 'reward_catalog';
    protected $primaryKey = 'reward_id';
    public $timestamps = true;

    protected $fillable = [
        'name',
        'description',
        'reward_type',
        'rarity',
        'stock_quantity',
        'point_cost',
        'max_owned',
        'image_url',
        'apply_instructions',
        'metadata',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'stock_quantity' => 'integer',
        'point_cost' => 'integer',
        'max_owned' => 'integer',
    ];

    // ==================== ✅ 添加这两个方法 ====================

    /**
     * 添加 'id' 访问器，让前端可以使用 reward.id
     * 这样 Inertia.js 和 React 都能正常工作
     */
    protected $appends = ['id'];

    public function getIdAttribute()
    {
        return $this->reward_id;
    }

    // ==================== Route Model Binding Configuration ====================

    /**
     * Get the route key for the model.
     * This tells Laravel to use 'reward_id' instead of 'id' for route binding
     */
    public function getRouteKeyName()
    {
        return 'reward_id';
    }

    // ==================== 关系 ====================

    public function rewardRecords(): HasMany
    {
        return $this->hasMany(RewardRecord::class, 'reward_id', 'reward_id');
    }

    public function inventoryItems(): HasMany
    {
        return $this->hasMany(StudentRewardInventory::class, 'reward_id', 'reward_id');
    }

    // ==================== 方法 ====================

    /**
     * 检查奖励是否可购买
     */
    public function canPurchase(): bool
    {
        $stock = $this->stock_quantity;
        return (bool) ($this->is_active && ($stock === null || $stock < 0 || $stock > 0));
    }

    /**
     * 原子扣减库存。调用方必须已持有外层事务与行锁。
     * 返回 true = 扣减成功（或无限库存），false = 库存不足。
     */
    public function decreaseStock(int $quantity = 1): bool
    {
        if ($this->stock_quantity < 0) {
            return true;
        }

        $affected = self::where('reward_id', $this->reward_id)
            ->where('stock_quantity', '>=', $quantity)
            ->decrement('stock_quantity', $quantity);

        return $affected > 0;
    }

    /**
     * 增加库存
     */
    public function increaseStock(int $quantity = 1): void
    {
        if ($this->stock_quantity >= 0 && $quantity > 0) {
            $this->increment('stock_quantity', $quantity);
            // 同步当前实例的值
            $this->refresh();
        }
    }

    /**
     * 获取稀有度标签（UI 使用）
     */
    public function getRarityBadge(): string
    {
        return match ($this->rarity) {
            'legendary' => '🌟 传说',
            'epic' => '💜 史诗',
            'rare' => '💙 稀有',
            'common' => '⚪ 普通',
            default => '未知',
        };
    }

    public function canStudentOwn(int $studentId): bool
    {
        if (($this->max_owned ?? -1) < 0) {
            return true;
        }

        $ownCount = (int) StudentRewardInventory::where('student_id', $studentId)
            ->where('reward_id', $this->reward_id)
            ->sum('quantity');

        return $ownCount < $this->max_owned;
    }

    // ==================== Scopes ====================

    public function scopeActive(Builder $query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType(Builder $query, string $type)
    {
        return $query->where('reward_type', $type);
    }

    public function scopeByRarity(Builder $query, string $rarity)
    {
        return $query->where('rarity', $rarity);
    }

    public function scopeAffordable(Builder $query, int $points)
    {
        return $query->where('point_cost', '<=', $points);
    }
}
