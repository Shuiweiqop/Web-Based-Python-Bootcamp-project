<?php

namespace App\Http\Controllers;

use App\Models\ForumPost;
use App\Models\ForumReply;
use App\Models\ForumReport;
use App\Helpers\ForumHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ForumReportController extends Controller
{
    /**
     * 显示所有举报列表（Admin 专用）
     */
    public function index(Request $request)
    {
        if (!ForumHelper::isAdmin()) {
            abort(403, 'Only administrators can view reports.');
        }

        $query = ForumReport::with([
            'reporter',
            'post.user',
            'reply.user',
            'reply.post'
        ])->latest();

        // 筛选状态
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // 筛选类型
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('reportable_type', $request->type);
        }

        // 筛选原因
        if ($request->has('reason') && $request->reason !== 'all') {
            $query->where('reason', $request->reason);
        }

        $reports = $query->paginate(20);

        // 统计数据
        $stats = [
            'total' => ForumReport::count(),
            'pending' => ForumReport::where('status', 'pending')->count(),
            'reviewing' => ForumReport::where('status', 'reviewing')->count(),
            'resolved' => ForumReport::where('status', 'resolved')->count(),
            'dismissed' => ForumReport::where('status', 'dismissed')->count(),
        ];

        // ✅ 简化数据结构，避免 React 渲染对象错误
        $reasons = ForumHelper::getReportReasons();
        $statuses = ForumHelper::getReportStatuses();

        return Inertia::render('Admin/Forum/Reports/Index', [
            'reports' => $reports,
            'stats' => $stats,
            'filters' => [
                'status' => $request->status ?? 'all',
                'type' => $request->type ?? 'all',
                'reason' => $request->reason ?? 'all',
            ],
            'reasons' => $reasons, // Inertia 会自动序列化
            'statuses' => $statuses, // Inertia 会自动序列化
        ]);
    }

    /**
     * 显示单个举报详情
     */
    public function show($id)
    {
        if (!ForumHelper::isAdmin()) {
            abort(403, 'Only administrators can view reports.');
        }

        $report = ForumReport::with([
            'reporter',
            'post.user',
            'post.replies',
            'reply.user',
            'reply.post'
        ])->findOrFail($id);

        // 如果是 pending 状态，自动改为 reviewing
        if ($report->status === 'pending') {
            $report->update(['status' => 'reviewing']);
        }

        return Inertia::render('Admin/Forum/Reports/Show', [
            'report' => $report,
            'statuses' => ForumHelper::getReportStatuses(),
        ]);
    }

    /**
     * 更新举报状态
     */
    public function updateStatus(Request $request, $id)
    {
        if (!ForumHelper::isAdmin()) {
            abort(403, 'Only administrators can update reports.');
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,reviewing,resolved,dismissed',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        try {
            $report = ForumReport::findOrFail($id);

            $report->update([
                'status' => $validated['status'],
                'admin_notes' => $validated['admin_notes'] ?? $report->admin_notes,
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

            return back()->with('success', 'Report status updated successfully!');
        } catch (\Exception $e) {
            Log::error('Update report status failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to update report status.');
        }
    }

    /**
     * 批量更新举报状态
     */
    public function batchUpdate(Request $request)
    {
        if (!ForumHelper::isAdmin()) {
            abort(403, 'Only administrators can update reports.');
        }

        $validated = $request->validate([
            'report_ids' => 'required|array',
            'report_ids.*' => 'exists:forum_reports,report_id',
            'status' => 'required|in:pending,reviewing,resolved,dismissed',
        ]);

        try {
            ForumReport::whereIn('report_id', $validated['report_ids'])
                ->update([
                    'status' => $validated['status'],
                    'reviewed_by' => auth()->id(),
                    'reviewed_at' => now(),
                ]);

            $count = count($validated['report_ids']);
            return back()->with('success', "{$count} reports updated successfully!");
        } catch (\Exception $e) {
            Log::error('Batch update reports failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to update reports.');
        }
    }

    /**
     * 删除举报的内容（帖子或回复）
     */
    public function deleteContent($id)
    {
        if (!ForumHelper::isAdmin()) {
            abort(403, 'Only administrators can delete reported content.');
        }

        try {
            $report = ForumReport::findOrFail($id);

            if ($report->reportable_type === 'post') {
                $post = ForumPost::find($report->reportable_id);
                if ($post) {
                    $post->delete();
                    $message = 'Post deleted successfully!';
                }
            } elseif ($report->reportable_type === 'reply') {
                $reply = ForumReply::find($report->reportable_id);
                if ($reply) {
                    $reply->delete();
                    $message = 'Reply deleted successfully!';
                }
            }

            // 更新举报状态
            $report->update([
                'status' => 'resolved',
                'admin_notes' => 'Content deleted by admin',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

            return back()->with('success', $message ?? 'Content deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Delete reported content failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to delete content.');
        }
    }

    /**
     * 删除举报记录
     */
    public function destroy($id)
    {
        if (!ForumHelper::isAdmin()) {
            abort(403, 'Only administrators can delete reports.');
        }

        try {
            $report = ForumReport::findOrFail($id);
            $report->delete();

            return redirect()->route('admin.forum.reports.index')
                ->with('success', 'Report deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Delete report failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to delete report.');
        }
    }
}
