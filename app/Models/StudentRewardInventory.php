<?php

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

    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id', 'student_id');
    }

    public function reward(): BelongsTo
    {
        return $this->belongsTo(Reward::class, 'reward_id', 'reward_id');
    }

    public function addQuantity(int $amount = 1): self
    {
        $this->increment('quantity', $amount);
        $this->refresh();

        return $this;
    }

    public function reduceQuantity(int $amount = 1): bool
    {
        if ($this->quantity < $amount) {
            return false;
        }

        $this->decrement('quantity', $amount);
        $this->refresh();

        if ($this->quantity <= 0) {
            $this->is_equipped = false;
            $this->equipped_at = null;
            $this->save();
        }

        return true;
    }

    public function equip(): bool
    {
        return DB::transaction(function () {
            $rewardType = $this->reward->reward_type;

            self::where('student_id', $this->student_id)
                ->where('is_equipped', true)
                ->whereHas('reward', function ($query) use ($rewardType) {
                    $query->where('reward_type', $rewardType);
                })
                ->update([
                    'is_equipped' => false,
                    'equipped_at' => null,
                ]);

            $this->update([
                'is_equipped' => true,
                'equipped_at' => now(),
            ]);

            return true;
        });
    }

    public function unequip(): bool
    {
        $this->update([
            'is_equipped' => false,
            'equipped_at' => null,
        ]);

        return true;
    }

    public function canEquip(): bool
    {
        return $this->quantity > 0 && ! $this->is_equipped;
    }

    public function canUnequip(): bool
    {
        return $this->is_equipped;
    }

    public function getEquipStatusAttribute(): string
    {
        return $this->is_equipped ? 'Equipped' : 'Not Equipped';
    }

    public function getEquippedDurationAttribute(): ?int
    {
        if (! $this->is_equipped || ! $this->equipped_at) {
            return null;
        }

        return now()->diffInHours($this->equipped_at);
    }

    public function scopeEquipped($query)
    {
        return $query->where('is_equipped', true);
    }

    public function scopeUnequipped($query)
    {
        return $query->where('is_equipped', false);
    }

    public function scopeByRewardType($query, string $type)
    {
        return $query->whereHas('reward', function ($q) use ($type) {
            $q->where('reward_type', $type);
        });
    }

    public function scopeHasStock($query)
    {
        return $query->where('quantity', '>', 0);
    }

    public function scopeRecentlyObtained($query, int $days = 7)
    {
        return $query->where('obtained_at', '>=', now()->subDays($days));
    }
}
