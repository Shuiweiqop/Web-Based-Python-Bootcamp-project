<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Log;

class ForumPostLike extends Model
{
    use HasFactory;

    protected $table = 'forum_post_likes';
    protected $primaryKey = 'like_id';

    protected $fillable = [
        'user_id',
        'post_id',
        'liked_at'
    ];

    protected $casts = [
        'liked_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /* -------------------------
       关系定义 (Relationships)
       ------------------------- */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_Id');
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(ForumPost::class, 'post_id', 'post_id');
    }

    /* -------------------------
       Scopes
       ------------------------- */

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByPost($query, $postId)
    {
        return $query->where('post_id', $postId);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('liked_at', 'desc');
    }

    /* -------------------------
       Boot Method
       ------------------------- */

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($like) {
            if (!$like->liked_at) {
                $like->liked_at = now();
            }
        });
    }

    /* -------------------------
       Static Methods
       ------------------------- */

    // ✅ Toggle like with error handling
    public static function toggle($userId, $postId)
    {
        try {
            Log::info('=== Toggle Post Like ===', [
                'user_id' => $userId,
                'post_id' => $postId,
                'step' => 'start'
            ]);

            $like = static::where('user_id', $userId)
                ->where('post_id', $postId)
                ->first();

            Log::info('Like check result', [
                'like_exists' => $like !== null,
                'like_id' => $like ? $like->like_id : null
            ]);

            if ($like) {
                // Unlike
                $like->delete();

                // Decrement post likes count
                $post = ForumPost::where('post_id', $postId)->first();
                if ($post) {
                    $post->decrement('likes');
                    Log::info('Post unliked, likes decremented', [
                        'post_id' => $postId,
                        'new_likes_count' => $post->fresh()->likes
                    ]);
                }

                return false; // Unliked
            } else {
                // Like
                $newLike = static::create([
                    'user_id' => $userId,
                    'post_id' => $postId,
                    'liked_at' => now()
                ]);

                Log::info('New like created', [
                    'like_id' => $newLike->like_id
                ]);

                // Increment post likes count
                $post = ForumPost::where('post_id', $postId)->first();
                if ($post) {
                    $post->increment('likes');
                    Log::info('Post liked, likes incremented', [
                        'post_id' => $postId,
                        'new_likes_count' => $post->fresh()->likes
                    ]);
                }

                return true; // Liked
            }
        } catch (\Exception $e) {
            Log::error('=== Toggle Like FAILED ===', [
                'user_id' => $userId,
                'post_id' => $postId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e; // Re-throw to be caught by controller
        }
    }

    // ✅ Check if post is liked by user
    public static function isLiked($userId, $postId)
    {
        try {
            return static::where('user_id', $userId)
                ->where('post_id', $postId)
                ->exists();
        } catch (\Exception $e) {
            Log::error('isLiked check failed', [
                'user_id' => $userId,
                'post_id' => $postId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
