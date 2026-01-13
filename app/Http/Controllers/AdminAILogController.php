<?php

namespace App\Http\Controllers;

use App\Models\AISessionLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AdminAILogController extends Controller
{
    /**
     * 显示所有 AI 日志
     */
    public function index(Request $request)
    {
        $query = AISessionLog::with(['student.user', 'lesson'])
            ->orderBy('timestamp', 'desc');

        // 搜索过滤
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('prompt', 'like', "%{$search}%")
                    ->orWhere('response', 'like', "%{$search}%");
            });
        }

        // 学生过滤
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        // 课程过滤
        if ($request->has('lesson_id')) {
            $query->where('lesson_id', $request->lesson_id);
        }

        // 日期过滤
        if ($request->has('date_from')) {
            $query->whereDate('timestamp', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('timestamp', '<=', $request->date_to);
        }

        $logs = $query->paginate(50);

        // 统计数据
        $stats = [
            'total_queries' => AISessionLog::count(),
            'today_queries' => AISessionLog::whereDate('timestamp', today())->count(),
            'unique_students' => AISessionLog::distinct('student_id')->count(),
            'avg_per_student' => round(AISessionLog::count() / max(AISessionLog::distinct('student_id')->count(), 1), 1),
        ];

        return Inertia::render('Admin/AILogs/Index', [
            'logs' => $logs,
            'stats' => $stats,
            'filters' => $request->only(['search', 'student_id', 'lesson_id', 'date_from', 'date_to'])
        ]);
    }

    /**
     * 查看单个会话的所有消息
     */
    public function showSession($sessionId)
    {
        $logs = AISessionLog::with(['student.user', 'lesson'])
            ->where('ai_session_id', $sessionId)
            ->orderBy('timestamp', 'asc')
            ->get();

        if ($logs->isEmpty()) {
            abort(404, 'Session not found');
        }

        return Inertia::render('Admin/AILogs/Session', [
            'logs' => $logs,
            'session_id' => $sessionId,
            'student' => $logs->first()->student,
            'lesson' => $logs->first()->lesson,
        ]);
    }

    /**
     * 🗑️ 批量删除日志
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'type' => 'required|in:selected,date_range,all_old',
            'ids' => 'required_if:type,selected|array',
            'ids.*' => 'integer|exists:ai_session_logs,ai_session_log_id',
            'date_from' => 'required_if:type,date_range|date',
            'date_to' => 'required_if:type,date_range|date|after_or_equal:date_from',
            'days_old' => 'required_if:type,all_old|integer|min:1',
        ]);

        try {
            $deletedCount = 0;

            switch ($request->type) {
                case 'selected':
                    // 删除选中的记录
                    $deletedCount = AISessionLog::whereIn('ai_session_log_id', $request->ids)->delete();
                    break;

                case 'date_range':
                    // 删除日期范围内的记录
                    $deletedCount = AISessionLog::whereBetween('timestamp', [
                        Carbon::parse($request->date_from)->startOfDay(),
                        Carbon::parse($request->date_to)->endOfDay(),
                    ])->delete();
                    break;

                case 'all_old':
                    // 删除 N 天前的所有记录
                    $cutoffDate = Carbon::now()->subDays($request->days_old);
                    $deletedCount = AISessionLog::where('timestamp', '<', $cutoffDate)->delete();
                    break;
            }

            return redirect()->back()->with('success', "Successfully deleted {$deletedCount} log entries.");
        } catch (\Exception $e) {
            \Log::error('Bulk delete failed', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return redirect()->back()->with('error', 'Failed to delete logs. Please try again.');
        }
    }

    /**
     * 🗑️ 删除单个会话
     */
    public function deleteSession($sessionId)
    {
        try {
            $deletedCount = AISessionLog::where('ai_session_id', $sessionId)->delete();

            return redirect()->route('admin.ai-logs.index')
                ->with('success', "Successfully deleted session with {$deletedCount} messages.");
        } catch (\Exception $e) {
            \Log::error('Session delete failed', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);

            return redirect()->back()->with('error', 'Failed to delete session. Please try again.');
        }
    }

    /**
     * 📊 获取删除预览统计
     */
    public function deletePreview(Request $request)
    {
        $request->validate([
            'type' => 'required|in:date_range,all_old',
            'date_from' => 'required_if:type,date_range|date',
            'date_to' => 'required_if:type,date_range|date',
            'days_old' => 'required_if:type,all_old|integer|min:1',
        ]);

        $count = 0;

        if ($request->type === 'date_range') {
            $count = AISessionLog::whereBetween('timestamp', [
                Carbon::parse($request->date_from)->startOfDay(),
                Carbon::parse($request->date_to)->endOfDay(),
            ])->count();
        } else if ($request->type === 'all_old') {
            $cutoffDate = Carbon::now()->subDays($request->days_old);
            $count = AISessionLog::where('timestamp', '<', $cutoffDate)->count();
        }

        return response()->json([
            'count' => $count,
            'message' => $count > 0
                ? "This will delete {$count} log entries."
                : "No logs found matching the criteria."
        ]);
    }
}
