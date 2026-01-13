<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Log;

class ForumReplyLike extends Model
{
    use HasFactory;

    protected $table = 'forum_reply_likes';
    protected $primaryKey = 'like_id';

    protected $fillable = [
        'user_id',
        'reply_id',
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

    public function reply(): BelongsTo
    {
        return $this->belongsTo(ForumReply::class, 'reply_id', 'reply_id');
    }

    /* -------------------------
       Scopes
       ------------------------- */

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByReply($query, $replyId)
    {
        return $query->where('reply_id', $replyId);
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
    public static function toggle($userId, $replyId)
    {
        try {
            Log::info('=== Toggle Reply Like ===', [
                'user_id' => $userId,
                'reply_id' => $replyId,
                'step' => 'start'
            ]);

            $like = static::where('user_id', $userId)
                ->where('reply_id', $replyId)
                ->first();

            if ($like) {
                // Unlike
                $like->delete();

                // Decrement reply likes count
                $reply = ForumReply::where('reply_id', $replyId)->first();
                if ($reply) {
                    $reply->decrement('likes');
                    Log::info('Reply unliked', ['reply_id' => $replyId]);
                }

                return false; // Unliked
            } else {
                // Like
                $newLike = static::create([
                    'user_id' => $userId,
                    'reply_id' => $replyId,
                    'liked_at' => now()
                ]);

                Log::info('New reply like created', [
                    'like_id' => $newLike->like_id
                ]);

                // Increment reply likes count
                $reply = ForumReply::where('reply_id', $replyId)->first();
                if ($reply) {
                    $reply->increment('likes');
                    Log::info('Reply liked', ['reply_id' => $replyId]);
                }

                return true; // Liked
            }
        } catch (\Exception $e) {
            Log::error('=== Toggle Reply Like FAILED ===', [
                'user_id' => $userId,
                'reply_id' => $replyId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    // ✅ Check if reply is liked by user
    public static function isLiked($userId, $replyId)
    {
        try {
            return static::where('user_id', $userId)
                ->where('reply_id', $replyId)
                ->exists();
        } catch (\Exception $e) {
            Log::error('isLiked check failed', [
                'user_id' => $userId,
                'reply_id' => $replyId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
