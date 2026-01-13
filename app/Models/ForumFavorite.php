<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ForumFavorite extends Model
{
    use HasFactory;

    protected $table = 'forum_favorites';
    protected $primaryKey = 'favorite_id';

    protected $fillable = [
        'user_id',  // ✅ 改用 user_id
        'post_id',
        'favorited_at'
    ];

    protected $casts = [
        'favorited_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /* -------------------------
       关系定义 (Relationships)
       ------------------------- */

    // ✅ Favorite belongs to a user (Admin or Student)
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_Id');
    }

    // Favorite belongs to a post
    public function post(): BelongsTo
    {
        return $this->belongsTo(ForumPost::class, 'post_id', 'post_id');
    }

    /* -------------------------
       Scopes
       ------------------------- */

    // Get favorites by user
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Get favorites by post
    public function scopeByPost($query, $postId)
    {
        return $query->where('post_id', $postId);
    }

    // Recent favorites
    public function scopeRecent($query)
    {
        return $query->orderBy('favorited_at', 'desc');
    }

    /* -------------------------
       Boot Method
       ------------------------- */

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($favorite) {
            if (!$favorite->favorited_at) {
                $favorite->favorited_at = now();
            }
        });
    }

    /* -------------------------
       Static Methods
       ------------------------- */

    // ✅ Toggle favorite
    public static function toggle($userId, $postId)
    {
        $favorite = static::where('user_id', $userId)
            ->where('post_id', $postId)
            ->first();

        if ($favorite) {
            $favorite->delete();
            return false; // Unfavorited
        } else {
            static::create([
                'user_id' => $userId,
                'post_id' => $postId
            ]);
            return true; // Favorited
        }
    }

    // ✅ Check if post is favorited by user
    public static function isFavorited($userId, $postId)
    {
        return static::where('user_id', $userId)
            ->where('post_id', $postId)
            ->exists();
    }
}
