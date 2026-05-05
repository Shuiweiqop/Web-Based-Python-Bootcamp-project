<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reward extends Model
{
    protected $table = 'reward_catalog';
    protected $primaryKey = 'reward_id';
    public $timestamps = true;

    const TYPES = [
        'avatar_frame' => 'Avatar Frame',
        'profile_background' => 'Background',
        'badge' => 'Badge',
        'title' => 'Title',
        'theme' => 'Theme',
        'effect' => 'Effect',
    ];

    const RARITIES = [
        'common' => 'Common',
        'rare' => 'Rare',
        'epic' => 'Epic',
        'legendary' => 'Legendary',
    ];

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

    public function getRouteKeyName()
    {
        return 'reward_id';
    }

    public function rewardRecords(): HasMany
    {
        return $this->hasMany(RewardRecord::class, 'reward_id', 'reward_id');
    }

    public function inventoryItems(): HasMany
    {
        return $this->hasMany(StudentRewardInventory::class, 'reward_id', 'reward_id');
    }

    public function canPurchase(): bool
    {
        $stock = $this->stock_quantity;

        return (bool) ($this->is_active && ($stock === null || $stock < 0 || $stock > 0));
    }

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

    public function increaseStock(int $quantity = 1): void
    {
        if ($this->stock_quantity >= 0 && $quantity > 0) {
            $this->increment('stock_quantity', $quantity);
            $this->refresh();
        }
    }

    public function getRarityBadge(): string
    {
        return match ($this->rarity) {
            'legendary' => '🌟 Legendary',
            'epic' => '💜 Epic',
            'rare' => '💙 Rare',
            'common' => '⚪ Common',
            default => 'Unknown',
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
