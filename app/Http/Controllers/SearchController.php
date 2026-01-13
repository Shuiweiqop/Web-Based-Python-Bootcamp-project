<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\Reward;
use App\Models\ForumPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    /**
     * Global search across the platform
     */
    public function search(Request $request)
    {
        $query = $request->input('q', '');
        $category = $request->input('category', 'all');
        $limit = $request->input('limit', 10);

        // 验证输入
        if (strlen($query) < 2) {
            return response()->json([
                'success' => true,
                'results' => [],
                'message' => 'Please enter at least 2 characters'
            ]);
        }

        Log::info('Search request', [
            'query' => $query,
            'category' => $category,
            'user_id' => Auth::id(),
        ]);

        $results = [];

        try {
            // 根据类别搜索
            if ($category === 'all' || $category === 'lessons') {
                $lessonResults = $this->searchLessons($query, $limit);
                $results = array_merge($results, $lessonResults);
                Log::info('Lesson search', ['count' => count($lessonResults)]);
            }

            if ($category === 'all' || $category === 'rewards') {
                $rewardResults = $this->searchRewards($query, $limit);
                $results = array_merge($results, $rewardResults);
                Log::info('Reward search', ['count' => count($rewardResults)]);
            }

            if ($category === 'all' || $category === 'forum') {
                $forumResults = $this->searchForum($query, $limit);
                $results = array_merge($results, $forumResults);
                Log::info('Forum search', ['count' => count($forumResults)]);
            }

            // 按相关性排序
            usort($results, function ($a, $b) use ($query) {
                $aScore = $this->calculateRelevance($a, $query);
                $bScore = $this->calculateRelevance($b, $query);
                return $bScore - $aScore;
            });

            // 限制结果数量
            $results = array_slice($results, 0, $limit);

            Log::info('Search completed', [
                'query' => $query,
                'results_count' => count($results),
            ]);

            return response()->json([
                'success' => true,
                'results' => $results,
                'query' => $query,
                'category' => $category,
            ]);
        } catch (\Exception $e) {
            Log::error('Search failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'query' => $query,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Search failed: ' . $e->getMessage(),
                'results' => [],
            ], 500);
        }
    }

    /**
     * Search lessons
     */
    private function searchLessons($query, $limit)
    {
        try {
            $lessons = Lesson::where('status', 'active')
                ->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                        ->orWhere('content', 'like', "%{$query}%");
                })
                ->select([
                    'lesson_id',
                    'title',
                    'content',
                    'difficulty',
                    'completion_reward_points',
                    'estimated_duration'
                ])
                ->limit($limit)
                ->get();

            return $lessons->map(function ($lesson) {
                // 从 content 中提取描述
                $description = $this->extractDescription($lesson->content);

                return [
                    'id' => $lesson->lesson_id,
                    'type' => 'lesson',
                    'title' => $lesson->title,
                    'description' => $description,
                    'route' => 'lessons.show',
                    'params' => ['lesson' => $lesson->lesson_id],
                    'metadata' => [
                        'difficulty' => $lesson->difficulty ?? 'intermediate',
                        'reward_points' => $lesson->completion_reward_points ?? 0,
                        'duration' => $lesson->estimated_duration ?? 0,
                    ],
                ];
            })->toArray();
        } catch (\Exception $e) {
            Log::error('Lesson search error', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Search rewards
     */
    private function searchRewards($query, $limit)
    {
        try {
            $rewards = Reward::where('is_active', true)
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%");
                })
                ->select([
                    'reward_id',
                    'name',
                    'description',
                    'rarity',
                    'point_cost',
                    'reward_type',
                    'stock_quantity'
                ])
                ->limit($limit)
                ->get();

            return $rewards->map(function ($reward) {
                return [
                    'id' => $reward->reward_id,
                    'type' => 'reward',
                    'title' => $reward->name,
                    'description' => $this->truncate($reward->description ?? 'No description available', 100),
                    'route' => 'student.rewards.index',
                    'params' => [],
                    'metadata' => [
                        'rarity' => $reward->rarity ?? 'common',
                        'point_cost' => $reward->point_cost ?? 0,
                        'reward_type' => $reward->reward_type ?? 'item',
                        'in_stock' => $reward->stock_quantity !== 0,
                    ],
                ];
            })->toArray();
        } catch (\Exception $e) {
            Log::error('Reward search error', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Search forum posts
     */
    private function searchForum($query, $limit)
    {
        // 检查是否有 ForumPost 模型
        if (!class_exists('App\Models\ForumPost')) {
            Log::info('ForumPost model not found, skipping forum search');
            return [];
        }

        try {
            $posts = ForumPost::where('status', 'published')
                ->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                        ->orWhere('content', 'like', "%{$query}%");
                })
                ->with('author:user_id,name')
                ->select([
                    'post_id',
                    'title',
                    'content',
                    'author_id',
                    'replies_count'
                ])
                ->limit($limit)
                ->get();

            return $posts->map(function ($post) {
                return [
                    'id' => $post->post_id,
                    'type' => 'forum',
                    'title' => $post->title,
                    'description' => $this->truncate($post->content ?? '', 100),
                    'route' => 'forum.show',
                    'params' => ['id' => $post->post_id],
                    'metadata' => [
                        'author' => $post->author->name ?? 'Unknown',
                        'replies_count' => $post->replies_count ?? 0,
                    ],
                ];
            })->toArray();
        } catch (\Exception $e) {
            Log::warning('Forum search error', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Calculate relevance score for sorting
     */
    private function calculateRelevance($result, $query)
    {
        $score = 0;
        $queryLower = strtolower($query);
        $titleLower = strtolower($result['title'] ?? '');
        $descLower = strtolower($result['description'] ?? '');

        // Exact match in title = highest score
        if ($titleLower === $queryLower) {
            $score += 100;
        }

        // Title starts with query
        if (strpos($titleLower, $queryLower) === 0) {
            $score += 50;
        }

        // Title contains query (position matters)
        $titlePos = strpos($titleLower, $queryLower);
        if ($titlePos !== false) {
            $score += max(30 - ($titlePos * 0.5), 10);
        }

        // Description contains query
        if ($descLower && strpos($descLower, $queryLower) !== false) {
            $score += 10;
        }

        // Type weighting
        switch ($result['type']) {
            case 'lesson':
                $score *= 1.2; // Lessons get higher priority
                break;
            case 'forum':
                $score *= 1.0;
                break;
            case 'reward':
                $score *= 0.8;
                break;
        }

        return $score;
    }

    /**
     * Extract description from HTML content
     */
    private function extractDescription($content)
    {
        if (empty($content)) {
            return 'No description available';
        }

        // Remove HTML tags
        $text = strip_tags($content);

        // Remove extra whitespace
        $text = preg_replace('/\s+/', ' ', $text);

        // Truncate to 100 characters
        return $this->truncate(trim($text), 100);
    }

    /**
     * Truncate text to specified length
     */
    private function truncate($text, $length = 100)
    {
        if (empty($text)) {
            return '';
        }

        // Remove extra whitespace first
        $text = preg_replace('/\s+/', ' ', trim($text));

        if (mb_strlen($text) <= $length) {
            return $text;
        }

        // Try to cut at word boundary
        $truncated = mb_substr($text, 0, $length);
        $lastSpace = mb_strrpos($truncated, ' ');

        if ($lastSpace !== false && $lastSpace > $length * 0.7) {
            $truncated = mb_substr($truncated, 0, $lastSpace);
        }

        return $truncated . '...';
    }

    /**
     * Get search suggestions (autocomplete)
     */
    public function suggestions(Request $request)
    {
        $query = $request->input('q', '');

        if (strlen($query) < 2) {
            return response()->json([
                'success' => true,
                'suggestions' => []
            ]);
        }

        $suggestions = [];

        try {
            // Get top 5 lesson titles
            $lessons = Lesson::where('status', 'active')
                ->where('title', 'like', "%{$query}%")
                ->limit(5)
                ->pluck('title')
                ->toArray();

            $suggestions = array_merge($suggestions, $lessons);

            // Get top 5 reward names
            $rewards = Reward::where('is_active', true)
                ->where('name', 'like', "%{$query}%")
                ->limit(5)
                ->pluck('name')
                ->toArray();

            $suggestions = array_merge($suggestions, $rewards);

            // Remove duplicates and limit to 10
            $suggestions = array_unique($suggestions);
            $suggestions = array_slice($suggestions, 0, 10);

            return response()->json([
                'success' => true,
                'suggestions' => array_values($suggestions),
            ]);
        } catch (\Exception $e) {
            Log::error('Suggestions failed', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => true,
                'suggestions' => [],
            ]);
        }
    }
}
