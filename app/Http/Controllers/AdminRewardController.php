<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use App\Models\User;
use App\Services\NotificationService; // ✅ 新增
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AdminRewardController extends Controller
{
    // ✅ 新增：注入 NotificationService
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Check if user is administrator
     */
    protected function checkAdmin()
    {
        if (Auth::user()->role !== 'administrator') {
            abort(403, 'Unauthorized access.');
        }
    }

    /**
     * Display reward listing
     */
    public function index(Request $request)
    {
        $this->checkAdmin();

        $query = Reward::query();

        // 🔧 修复：搜索
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                    ->orWhere('description', 'like', "%$search%");
            });
        }

        // 🔧 修复：类型筛选 - 排除 'all'
        if ($request->filled('reward_type') && $request->reward_type !== 'all') {
            $query->where('reward_type', $request->reward_type);
        }

        // 🔧 修复：稀有度筛选 - 排除 'all'
        if ($request->filled('rarity') && $request->rarity !== 'all') {
            $query->where('rarity', $request->rarity);
        }

        // 🔧 关键修复：状态筛选 - 只在值为 '0' 或 '1' 时才筛选
        if ($request->filled('is_active') && in_array($request->is_active, ['0', '1'], true)) {
            $query->where('is_active', (bool) $request->is_active);
        }

        $rewards = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Admin/Rewards/Index', [
            'rewards' => $rewards,
            'filters' => [
                'search' => $request->search ?? '',
                'reward_type' => $request->reward_type ?? 'all',
                'is_active' => $request->is_active ?? 'all',
                'rarity' => $request->rarity ?? 'all',
            ],
        ]);
    }

    /**
     * Show create reward form
     */
    public function create()
    {
        $this->checkAdmin();

        return Inertia::render('Admin/Rewards/Create', [
            'rewardTypes' => [
                'avatar_frame' => 'Avatar Frame',
                'profile_background' => 'Profile Background',
                'badge' => 'Badge/Achievement',
                'title' => 'Title',
                'theme' => 'UI Theme',
                'effect' => 'Effect',
            ],
            'rarities' => [
                'common' => 'Common',
                'rare' => 'Rare',
                'epic' => 'Epic',
                'legendary' => 'Legendary',
            ],
        ]);
    }

    /**
     * Store new reward
     * ✅ 修复：添加通知功能
     */
    public function store(Request $request)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'reward_type' => 'required|in:avatar_frame,profile_background,badge,title,theme,effect',
            'rarity' => 'required|in:common,rare,epic,legendary',
            'stock_quantity' => 'required|integer|min:-1',
            'point_cost' => 'required|integer|min:0',
            'max_owned' => 'required|integer|min:-1',
            'apply_instructions' => 'nullable|string',
            'metadata' => 'nullable|string',
            'reward_image' => 'nullable|image|mimes:png,jpg,jpeg,svg,gif,webp|max:20480',
        ]);

        try {
            $imageUrl = null;
            $metadata = null;

            // 处理 profile_background 的 base64 图片
            if ($validated['reward_type'] === 'profile_background' && $request->filled('metadata')) {
                $decodedMetadata = json_decode($request->metadata, true);

                if (json_last_error() !== JSON_ERROR_NONE) {
                    return back()
                        ->withInput()
                        ->withErrors(['metadata' => 'Invalid metadata format: ' . json_last_error_msg()]);
                }

                // 处理 base64 图片
                if (isset($decodedMetadata['url']) && preg_match('/^data:image\/(\w+);base64,/', $decodedMetadata['url'], $matches)) {
                    $imageType = $matches[1];
                    $base64Data = substr($decodedMetadata['url'], strpos($decodedMetadata['url'], ',') + 1);
                    $imageData = base64_decode($base64Data);

                    if ($imageData === false) {
                        throw new \Exception('Failed to decode base64 image');
                    }

                    $fileName = 'backgrounds/' . time() . '_' . uniqid() . '.' . $imageType;

                    if (!Storage::disk('public')->exists('backgrounds')) {
                        Storage::disk('public')->makeDirectory('backgrounds');
                    }

                    Storage::disk('public')->put($fileName, $imageData);
                    $imageUrl = Storage::url($fileName);
                    $decodedMetadata['url'] = $imageUrl;

                    Log::info('✅ 背景图片保存成功', ['url' => $imageUrl]);
                }

                // ✅ 修复：直接保存前端的 metadata，不转换
                Log::info('💾 保存 profile_background metadata', [
                    'has_effects' => isset($decodedMetadata['effects']),
                    'effects' => $decodedMetadata['effects'] ?? null,
                ]);

                $metadata = $decodedMetadata;
            } elseif ($request->filled('metadata')) {
                $decodedMetadata = json_decode($request->metadata, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    return back()
                        ->withInput()
                        ->withErrors(['metadata' => 'Invalid metadata format: ' . json_last_error_msg()]);
                }
                $metadata = $decodedMetadata;
            }

            // 处理普通图片上传
            if ($request->hasFile('reward_image')) {
                $file = $request->file('reward_image');
                $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('rewards', $fileName, 'public');
                $imageUrl = Storage::url($path);
            }

            // 创建奖励
            $reward = Reward::create([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'reward_type' => $validated['reward_type'],
                'rarity' => $validated['rarity'],
                'stock_quantity' => $validated['stock_quantity'],
                'point_cost' => $validated['point_cost'],
                'max_owned' => $validated['max_owned'],
                'image_url' => $imageUrl,
                'apply_instructions' => $validated['apply_instructions'] ?? null,
                'metadata' => $metadata ?: null,
                'is_active' => filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN),
            ]);

            Log::info('🎉 奖励创建成功！', [
                'reward_id' => $reward->reward_id,
                'has_effects' => isset($metadata['effects']),
            ]);

            // ✅ 🔔 如果奖励激活，发送通知给所有学生
            if ($reward->is_active) {
                $this->notifyAllStudents($reward, 'new');
            }

            return Inertia::location(route('admin.rewards.index'));
        } catch (\Exception $e) {
            Log::error('💥 创建奖励失败', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create reward: ' . $e->getMessage()]);
        }
    }

    /**
     * Display reward details
     */
    public function show(Reward $reward)
    {
        $this->checkAdmin();

        $reward->load(['rewardRecords' => function ($q) {
            $q->latest('issued_at')->limit(20);
        }]);

        // ✅ 解析 metadata
        $parsedMetadata = null;
        if ($reward->metadata) {
            try {
                $parsedMetadata = is_string($reward->metadata)
                    ? json_decode($reward->metadata, true)
                    : $reward->metadata;

                Log::info('📦 [Show] Parsed metadata', [
                    'reward_id' => $reward->reward_id,
                    'has_effects' => isset($parsedMetadata['effects']),
                    'metadata_keys' => array_keys($parsedMetadata),
                ]);

                // ✅ 如果是 profile_background，记录 effects 详情
                if ($reward->reward_type === 'profile_background' && isset($parsedMetadata['effects'])) {
                    Log::info('🎨 [Show] Background effects', [
                        'animation_enabled' => $parsedMetadata['effects']['animation']['enabled'] ?? 'not set',
                        'animation_type' => $parsedMetadata['effects']['animation']['type'] ?? 'not set',
                        'effects_structure' => array_keys($parsedMetadata['effects']),
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('❌ [Show] Failed to parse metadata', [
                    'error' => $e->getMessage(),
                    'reward_id' => $reward->reward_id,
                ]);
                $parsedMetadata = [];
            }
        }

        // ✅ 替换 reward 的 metadata 为解析后的版本
        $rewardData = $reward->toArray();
        $rewardData['metadata'] = $parsedMetadata;

        $distributionStats = [
            'total_distributed' => $reward->rewardRecords->count(),
            'by_system' => $reward->rewardRecords->where('issued_by', 'system')->count(),
            'by_admin' => $reward->rewardRecords->where('issued_by', 'admin')->count(),
            'by_student' => $reward->rewardRecords->where('issued_by', 'student_purchase')->count(),
        ];

        return Inertia::render('Admin/Rewards/Show', [
            'reward' => $rewardData,  // ✅ 使用解析后的数据
            'distribution_stats' => $distributionStats,
        ]);
    }

    public function edit(Reward $reward)
    {
        $this->checkAdmin();

        Log::info('📝 打开编辑页面', [
            'reward_id' => $reward->reward_id,
            'reward_type' => $reward->reward_type,
            'has_metadata' => !empty($reward->metadata),
        ]);

        // ✅ 解析 metadata
        $parsedMetadata = null;
        if ($reward->metadata) {
            try {
                $parsedMetadata = is_string($reward->metadata)
                    ? json_decode($reward->metadata, true)
                    : $reward->metadata;

                Log::info('📦 [Edit] Parsed metadata', [
                    'reward_id' => $reward->reward_id,
                    'has_effects' => isset($parsedMetadata['effects']),
                    'metadata_keys' => array_keys($parsedMetadata ?? []),
                ]);

                // ✅ 如果是 profile_background，记录 effects 详情
                if ($reward->reward_type === 'profile_background' && isset($parsedMetadata['effects'])) {
                    Log::info('🎨 [Edit] Background effects', [
                        'effects_is_array' => is_array($parsedMetadata['effects']),
                        'effects_count' => count($parsedMetadata['effects']),
                        'animation_enabled' => $parsedMetadata['effects']['animation']['enabled'] ?? 'not set',
                        'animation_type' => $parsedMetadata['effects']['animation']['type'] ?? 'not set',
                        'effects_structure' => is_array($parsedMetadata['effects']) ? array_keys($parsedMetadata['effects']) : 'not array',
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('❌ [Edit] Failed to parse metadata', [
                    'error' => $e->getMessage(),
                    'reward_id' => $reward->reward_id,
                ]);
                $parsedMetadata = [];
            }
        }

        // ✅ 构建返回数据
        $rewardData = $reward->toArray();
        $rewardData['metadata'] = $parsedMetadata;

        Log::info('✅ [Edit] Sending data to frontend', [
            'reward_id' => $reward->reward_id,
            'metadata_type' => gettype($rewardData['metadata']),
            'has_effects' => isset($rewardData['metadata']['effects']),
        ]);

        return Inertia::render('Admin/Rewards/Edit', [
            'reward' => $rewardData,  // ✅ 使用解析后的数据
            'rewardTypes' => [
                'avatar_frame' => 'Avatar Frame',
                'profile_background' => 'Profile Background',
                'badge' => 'Badge/Achievement',
                'title' => 'Title',
                'theme' => 'UI Theme',
                'effect' => 'Effect',
            ],
            'rarities' => [
                'common' => 'Common',
                'rare' => 'Rare',
                'epic' => 'Epic',
                'legendary' => 'Legendary',
            ],
        ]);
    }

    /**
     * Update reward
     * ✅ 修复：添加通知功能
     */
    public function update(Request $request, Reward $reward)
    {
        $this->checkAdmin();

        Log::info('🔄 开始更新奖励', [
            'reward_id' => $reward->reward_id,
            'request_data' => $request->except(['reward_image']),
            'has_image' => $request->hasFile('reward_image'),
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'reward_type' => 'required|in:avatar_frame,profile_background,badge,title,theme,effect',
            'rarity' => 'required|in:common,rare,epic,legendary',
            'stock_quantity' => 'required|integer|min:-1',
            'point_cost' => 'required|integer|min:0',
            'max_owned' => 'required|integer|min:-1',
            'apply_instructions' => 'nullable|string',
            'metadata' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'reward_image' => 'nullable|image|mimes:png,jpg,jpeg,svg,gif,webp|max:20480',
        ]);

        Log::info('✅ 验证通过', ['validated' => $validated]);

        try {
            // ✅ 记录旧状态
            $wasInactive = !$reward->is_active;

            // 处理图片上传
            $imageUrl = $reward->image_url; // 保留原图

            if ($request->hasFile('reward_image')) {
                $file = $request->file('reward_image');

                Log::info('📸 处理新图片上传', [
                    'original_name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'mime' => $file->getMimeType(),
                ]);

                // 删除旧图片
                if ($reward->image_url) {
                    $oldPath = str_replace('/storage/', '', $reward->image_url);
                    if (Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                        Log::info('🗑️ 已删除旧图片', ['path' => $oldPath]);
                    }
                }

                // 上传新图片
                $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('rewards', $fileName, 'public');
                $imageUrl = Storage::url($path);

                Log::info('✅ 新图片上传成功', [
                    'path' => $path,
                    'url' => $imageUrl,
                ]);
            } else {
                Log::info('⚠️ 未上传新图片，保留原图片', ['image_url' => $imageUrl]);
            }

            // ✅ 关键修复：直接保存前端发送的 metadata，不做转换
            $metadata = $reward->metadata; // 保留原 metadata

            if ($request->filled('metadata')) {
                Log::info('📦 解析 metadata', ['raw' => $request->metadata]);

                $decodedMetadata = json_decode($request->metadata, true);

                if (json_last_error() !== JSON_ERROR_NONE) {
                    Log::error('❌ Metadata JSON 解析失败', [
                        'error' => json_last_error_msg(),
                    ]);

                    return back()
                        ->withInput()
                        ->withErrors(['metadata' => 'Invalid metadata format: ' . json_last_error_msg()]);
                }

                // ✅ 对于 profile_background，直接保存前端的数据结构
                // 不需要调用 transformEffectsToMetadata，因为前端已经发送了正确的格式
                if ($validated['reward_type'] === 'profile_background') {
                    Log::info('💾 保存 profile_background metadata', [
                        'background_type' => $decodedMetadata['background_type'] ?? 'unknown',
                        'has_effects' => isset($decodedMetadata['effects']),
                        'effects_structure' => isset($decodedMetadata['effects']) ? array_keys($decodedMetadata['effects']) : [],
                    ]);

                    // ✅ 验证 effects 结构
                    if (isset($decodedMetadata['effects'])) {
                        $effects = $decodedMetadata['effects'];

                        Log::info('🔍 Effects 详细信息', [
                            'animation_enabled' => $effects['animation']['enabled'] ?? 'not set',
                            'animation_type' => $effects['animation']['type'] ?? 'not set',
                            'animation_duration' => $effects['animation']['duration'] ?? 'not set',
                            'full_animation' => $effects['animation'] ?? 'not set',
                        ]);
                    }

                    $metadata = $decodedMetadata;
                } else {
                    // 其他类型直接保存
                    $metadata = $decodedMetadata;
                }

                Log::info('✅ Metadata 处理完成');
            }

            // ✅ 修复：正确处理 is_active
            $isActive = $request->boolean('is_active', $reward->is_active);

            Log::info('📝 准备更新数据', [
                'name' => $validated['name'],
                'is_active' => $isActive,
                'has_new_image' => $imageUrl !== $reward->image_url,
                'metadata_length' => is_string($metadata) ? strlen($metadata) : strlen(json_encode($metadata ?? [])),
            ]);

            // 更新奖励
            $reward->update([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'reward_type' => $validated['reward_type'],
                'rarity' => $validated['rarity'],
                'stock_quantity' => $validated['stock_quantity'],
                'point_cost' => $validated['point_cost'],
                'max_owned' => $validated['max_owned'],
                'image_url' => $imageUrl,
                'apply_instructions' => $validated['apply_instructions'] ?? null,
                'metadata' => $metadata,
                'is_active' => $isActive,
            ]);

            Log::info('🎉 奖励更新成功！', [
                'admin_id' => Auth::id(),
                'reward_id' => $reward->reward_id,
                'reward_name' => $reward->name,
            ]);

            // ✅ 🔔 如果从未激活变为激活，发送通知
            if ($wasInactive && $isActive) {
                $this->notifyAllStudents($reward, 'activated');
            }

            return Inertia::location(route('admin.rewards.index'));
        } catch (\Exception $e) {
            Log::error('💥 更新奖励失败', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'admin_id' => Auth::id(),
                'reward_id' => $reward->reward_id,
            ]);

            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update reward: ' . $e->getMessage()]);
        }
    }

    /**
     * Toggle reward active status
     * ✅ 修复：添加通知功能
     */
    public function toggleActive(Reward $reward)
    {
        $this->checkAdmin();

        try {
            $newStatus = !$reward->is_active;
            $reward->update(['is_active' => $newStatus]);

            $statusText = $newStatus ? 'activated' : 'deactivated';

            Log::info('✅ 奖励状态切换成功', [
                'admin_id' => Auth::id(),
                'reward_id' => $reward->reward_id,
                'reward_name' => $reward->name,
                'new_status' => $statusText,
            ]);

            // ✅ 🔔 如果重新激活，发送通知
            if ($newStatus) {
                $this->notifyAllStudents($reward, 'reactivated');
            }

            return back()->with('success', "Reward '{$reward->name}' has been {$statusText} successfully!");
        } catch (\Exception $e) {
            Log::error('❌ 切换奖励状态失败', [
                'error' => $e->getMessage(),
                'reward_id' => $reward->reward_id ?? null,
            ]);

            return back()->withErrors(['error' => 'Failed to toggle status.']);
        }
    }

    /**
     * Batch update stock
     */
    public function batchUpdateStock(Request $request)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'updates' => 'required|array',
            'updates.*.reward_id' => 'required|integer|exists:reward_catalog,reward_id',
            'updates.*.stock_quantity' => 'required|integer|min:-1',
        ]);

        try {
            foreach ($validated['updates'] as $update) {
                Reward::where('reward_id', $update['reward_id'])
                    ->update(['stock_quantity' => $update['stock_quantity']]);
            }

            Log::info('Batch stock update completed', [
                'admin_id' => Auth::id(),
                'count' => count($validated['updates']),
            ]);

            return response()->json(['success' => true, 'message' => 'Stock updated successfully!']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update stock.'], 500);
        }
    }

    /**
     * Get statistics
     */
    public function getStats()
    {
        $this->checkAdmin();

        return response()->json([
            'total_rewards' => Reward::count(),
            'active_rewards' => Reward::where('is_active', true)->count(),
            'by_type' => Reward::selectRaw('reward_type, count(*) as count')
                ->groupBy('reward_type')
                ->pluck('count', 'reward_type'),
            'by_rarity' => Reward::selectRaw('rarity, count(*) as count')
                ->groupBy('rarity')
                ->pluck('count', 'rarity'),
        ]);
    }

    public function createBackground()
    {
        $this->checkAdmin();

        return Inertia::render('Admin/Rewards/CreateBackground', [
            'rarities' => [
                'common' => 'Common',
                'rare' => 'Rare',
                'epic' => 'Epic',
                'legendary' => 'Legendary',
            ],
        ]);
    }

    /**
     * Store background reward
     * ✅ 修复：添加通知功能
     */
    public function storeBackground(Request $request)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'rarity' => 'required|in:common,rare,epic,legendary',
            'point_cost' => 'required|integer|min:0',
            'metadata' => 'required|array',
            'metadata.url' => 'required|string',
            'metadata.type' => 'required|string',
            'metadata.effects' => 'nullable|array',
        ]);

        try {
            $metadata = $validated['metadata'];
            $imageUrl = null;

            // 检查是否是 base64 图片
            if (preg_match('/^data:image\/(\w+);base64,/', $metadata['url'], $matches)) {
                $imageType = $matches[1];
                $base64Data = substr($metadata['url'], strpos($metadata['url'], ',') + 1);
                $imageData = base64_decode($base64Data);

                if ($imageData === false) {
                    throw new \Exception('Failed to decode base64 image');
                }

                $fileName = 'backgrounds/' . time() . '_' . uniqid() . '.' . $imageType;

                if (!Storage::disk('public')->exists('backgrounds')) {
                    Storage::disk('public')->makeDirectory('backgrounds');
                }

                Storage::disk('public')->put($fileName, $imageData);
                $imageUrl = Storage::url($fileName);

                // 更新 URL
                $metadata['url'] = $imageUrl;

                Log::info('✅ 背景图片保存成功', [
                    'filename' => $fileName,
                    'url' => $imageUrl,
                    'size' => strlen($imageData),
                ]);
            }

            // ✅ 修复：直接保存前端的 metadata，不转换
            Log::info('💾 保存 background metadata', [
                'has_effects' => isset($metadata['effects']),
                'effects' => $metadata['effects'] ?? null,
            ]);

            // 创建奖励
            $reward = Reward::create([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'reward_type' => 'profile_background',
                'rarity' => $validated['rarity'],
                'stock_quantity' => -1,
                'point_cost' => $validated['point_cost'],
                'max_owned' => 1,
                'image_url' => $imageUrl,
                'metadata' => $metadata,
                'is_active' => true,
            ]);

            Log::info('🎉 背景奖励创建成功', [
                'reward_id' => $reward->reward_id,
                'name' => $reward->name,
                'has_effects' => isset($metadata['effects']),
            ]);

            // ✅ 🔔 发送通知给所有学生
            $this->notifyAllStudents($reward, 'new');

            return Inertia::location(route('admin.rewards.index'));
        } catch (\Exception $e) {
            Log::error('💥 创建背景奖励失败', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create background: ' . $e->getMessage()]);
        }
    }
    /**
     * ✅ 最终修复版本：发送通知给所有学生
     * 
     * @param Reward $reward 奖励对象
     * @param string $action 动作类型: 'new', 'activated', 'reactivated'
     */
    protected function notifyAllStudents(Reward $reward, string $action = 'new')
    {
        try {
            Log::info('🔔 [START] Sending notifications', [
                'reward_id' => $reward->reward_id,
                'reward_name' => $reward->name,
                'action' => $action,
            ]);

            // 1. 获取所有学生用户
            $studentIds = User::where('role', 'student')->pluck('user_Id')->toArray();

            Log::info('📋 Student IDs fetched', [
                'count' => count($studentIds),
                'sample_ids' => array_slice($studentIds, 0, 3),
            ]);

            if (empty($studentIds)) {
                Log::warning('⚠️ No students found to notify');
                return;
            }

            // 2. 根据不同动作设置不同的消息
            $messages = [
                'new' => [
                    'title' => "🎁 New Reward Available!",
                    'message' => "Check out '{$reward->name}' in the rewards shop! ({$reward->point_cost} points)",
                ],
                'activated' => [
                    'title' => "🔄 Reward Back in Stock!",
                    'message' => "'{$reward->name}' is now available again! ({$reward->point_cost} points)",
                ],
                'reactivated' => [
                    'title' => "✨ Reward Reactivated!",
                    'message' => "'{$reward->name}' is back! Don't miss out! ({$reward->point_cost} points)",
                ],
            ];

            $messageData = $messages[$action] ?? $messages['new'];

            Log::info('💬 Message prepared', $messageData);

            // 3. ✅ 批量创建通知数据 - 使用正确的字段名
            $insertData = array_map(function ($userId) use ($reward, $messageData) {
                return [
                    'user_Id' => $userId,
                    'type' => 'reward',
                    'priority' => 'normal',
                    'title' => $messageData['title'],
                    'message' => $messageData['message'],
                    'icon' => 'gift',              // ✅ 正确：使用 icon（不是 display_icon）
                    'color' => 'purple',           // ✅ 正确：使用 color（不是 display_color）
                    'action_url' => route('student.rewards.index'),
                    'data' => json_encode([
                        'reward_id' => $reward->reward_id,
                        'reward_name' => $reward->name,
                        'point_cost' => $reward->point_cost,
                        'rarity' => $reward->rarity,
                    ]),
                    'is_read' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }, $studentIds);

            Log::info('📦 Insert data prepared', [
                'total_records' => count($insertData),
                'sample_record' => $insertData[0] ?? null,
            ]);

            // 4. 批量插入通知
            DB::beginTransaction();

            try {
                $inserted = \App\Models\Notification::insert($insertData);

                Log::info('💾 Database insert completed', [
                    'success' => $inserted,
                    'records_count' => count($insertData),
                ]);

                // 5. 验证插入结果
                $verifyCount = \App\Models\Notification::where('type', 'reward')
                    ->where('created_at', '>=', now()->subMinute())
                    ->count();

                Log::info('✅ Verification check', [
                    'newly_created' => $verifyCount,
                    'expected' => count($insertData),
                    'match' => $verifyCount >= count($insertData),
                ]);

                DB::commit();
            } catch (\Exception $insertError) {
                DB::rollBack();
                Log::error('💥 Database insert failed', [
                    'error' => $insertError->getMessage(),
                    'line' => $insertError->getLine(),
                ]);
                throw $insertError;
            }

            Log::info('✅ 🔔 Notifications sent successfully!', [
                'reward_id' => $reward->reward_id,
                'reward_name' => $reward->name,
                'student_count' => count($studentIds),
                'action' => $action,
            ]);
        } catch (\Exception $e) {
            // 通知发送失败不应该影响主流程，所以只记录错误
            Log::error('❌ Failed to send notifications', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'reward_id' => $reward->reward_id ?? null,
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * ✅ 辅助方法：转换 effects 为 metadata 格式（保留以防需要）
     */
    private function transformEffectsToMetadata($metadata)
    {
        if (!isset($metadata['effects'])) {
            return [
                'background_type' => 'image',
                'url' => $metadata['url'] ?? null,
            ];
        }

        $effects = $metadata['effects'];

        // 映射动画强度
        $animationIntensityMap = [
            'scale' => 'medium',
            'rotate' => 'high',
            'float' => 'low',
            'Ken-Burns' => 'legendary',
        ];

        $animationType = $effects['animation']['type'] ?? 'scale';
        $animationIntensity = $animationIntensityMap[$animationType] ?? 'medium';

        // 构建动画调色板
        $animationPalette = ['#10b981', '#3b82f6', '#8b5cf6'];
        if (isset($effects['layers']['particles']) && $effects['layers']['particles']) {
            $animationPalette[] = $effects['layers']['particleColor'] ?? '#ffffff';
        }

        return [
            // 基础信息
            'background_type' => 'image',
            'url' => $metadata['url'] ?? null,

            // 动画设置
            'animated' => $effects['animation']['enabled'] ?? false,
            'animation_intensity' => $animationIntensity,
            'animation_type' => $animationType,
            'animation_duration' => $effects['animation']['duration'] ?? 20,
            'animation_palette' => $animationPalette,

            // 基础特效
            'blur' => $effects['blur'] ?? 0,
            'opacity' => $effects['opacity'] ?? 1,
            'overlay_color' => $effects['overlayColor'] ?? '#000000',
            'overlay_opacity' => $effects['overlayOpacity'] ?? 0,

            // 滤镜
            'filters' => [
                'brightness' => $effects['filters']['brightness'] ?? 100,
                'contrast' => $effects['filters']['contrast'] ?? 100,
                'grayscale' => $effects['filters']['grayscale'] ?? 0,
                'saturate' => $effects['filters']['saturate'] ?? 100,
            ],

            // 粒子效果
            'particles_enabled' => $effects['layers']['particles'] ?? false,
            'particle_color' => $effects['layers']['particleColor'] ?? '#ffffff',
            'particle_count' => $effects['layers']['particleCount'] ?? 20,

            // 徽章
            'badge_enabled' => $effects['layers']['badge'] ?? false,
            'badge_position' => $effects['layers']['badgePosition'] ?? 'top-right',

            // 保留原始 effects 供调试
            '_original_effects' => $effects,
        ];
    }
}
