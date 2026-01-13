<?php
// app/Models/StudentRewardInventory.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class StudentRewardInventory extends Model
{
    use HasFactory;

    protected $table = 'student_reward_inventory';
    protected $primaryKey = 'inventory_id';

    protected $fillable = [
        'student_id',
        'reward_id',
        'quantity',
        'obtained_at',
        'is_equipped',
        'equipped_at',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'is_equipped' => 'boolean',
        'obtained_at' => 'datetime',
        'equipped_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /* -------------------------
       关系定义
       ------------------------- */

    /**
     * 所属的学生
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id', 'student_id');
    }

    /**
     * 所属的奖励
     */
    public function reward(): BelongsTo
    {
        return $this->belongsTo(Reward::class, 'reward_id', 'reward_id');
    }

    /* -------------------------
       业务方法
       ------------------------- */

    /**
     * 增加数量
     */
    public function addQuantity(int $amount = 1): self
    {
        $this->increment('quantity', $amount);
        $this->refresh();
        return $this;
    }

    /**
     * 减少数量
     */
    public function reduceQuantity(int $amount = 1): bool
    {
        if ($this->quantity < $amount) {
            return false;
        }

        $this->decrement('quantity', $amount);
        $this->refresh();

        // 如果数量为 0，可以选择删除记录或保留
        if ($this->quantity <= 0) {
            $this->is_equipped = false;
            $this->equipped_at = null;
            $this->save();
        }

        return true;
    }

    /**
     * 装备奖励
     * 会自动卸下同类型的其他奖励
     */
    public function equip(): bool
    {
        return DB::transaction(function () {
            $rewardType = $this->reward->reward_type;

            // 1. 卸下该学生所有同类型的奖励
            self::where('student_id', $this->student_id)
                ->where('is_equipped', true)
                ->whereHas('reward', function ($q) use ($rewardType) {
                    $q->where('reward_type', $rewardType);
                })
                ->update([
                    'is_equipped' => false,
                    'equipped_at' => null,
                ]);

            // 2. 装备当前奖励
            $this->update([
                'is_equipped' => true,
                'equipped_at' => now(),
            ]);

            return true;
        });
    }

    /**
     * 卸下奖励
     */
    public function unequip(): bool
    {
        $this->update([
            'is_equipped' => false,
            'equipped_at' => null,
        ]);

        return true;
    }

    /**
     * 检查是否可以装备
     */
    public function canEquip(): bool
    {
        return $this->quantity > 0 && !$this->is_equipped;
    }

    /**
     * 检查是否可以卸下
     */
    public function canUnequip(): bool
    {
        return $this->is_equipped;
    }

    /* -------------------------
       访问器
       ------------------------- */

    /**
     * 获取装备状态文本
     */
    public function getEquipStatusAttribute(): string
    {
        return $this->is_equipped ? '已装备' : '未装备';
    }

    /**
     * 获取装备时长（小时）
     */
    public function getEquippedDurationAttribute(): ?int
    {
        if (!$this->is_equipped || !$this->equipped_at) {
            return null;
        }

        return now()->diffInHours($this->equipped_at);
    }

    /* -------------------------
       作用域
       ------------------------- */

    /**
     * 已装备的奖励
     */
    public function scopeEquipped($query)
    {
        return $query->where('is_equipped', true);
    }

    /**
     * 未装备的奖励
     */
    public function scopeUnequipped($query)
    {
        return $query->where('is_equipped', false);
    }

    /**
     * 按奖励类型筛选
     */
    public function scopeByRewardType($query, string $type)
    {
        return $query->whereHas('reward', function ($q) use ($type) {
            $q->where('reward_type', $type);
        });
    }

    /**
     * 有库存的（数量大于0）
     */
    public function scopeHasStock($query)
    {
        return $query->where('quantity', '>', 0);
    }

    /**
     * 最近获得的
     */
    public function scopeRecentlyObtained($query, int $days = 7)
    {
        return $query->where('obtained_at', '>=', now()->subDays($days));
    }
}
