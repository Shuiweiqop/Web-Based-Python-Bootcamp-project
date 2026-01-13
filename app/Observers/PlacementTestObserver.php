<?php

namespace App\Observers;

use App\Models\PlacementTest;
use Illuminate\Support\Facades\Log;

class PlacementTestObserver
{
    /**
     * ✅ 统一处理：创建或更新前执行
     * 
     * saving() 事件会在 create 和 update 之前触发
     * 使用这个可以避免重复代码
     */
    public function saving(PlacementTest $test)
    {
        // 1️⃣ 检查是否正在激活测试
        if ($test->isDirty('status') && $test->status === 'active') {
            // 2️⃣ 停用所有其他激活的 placement tests
            $deactivatedCount = PlacementTest::where('test_id', '!=', $test->test_id ?? 0) // 处理新建时没有 ID 的情况
                ->where('status', 'active')
                ->update(['status' => 'inactive']);

            // 3️⃣ 记录日志
            if ($deactivatedCount > 0) {
                Log::info("PlacementTest Observer: Deactivated {$deactivatedCount} test(s) when activating test {$test->test_id}.", [
                    'test_id' => $test->test_id,
                    'title' => $test->title,
                    'deactivated_count' => $deactivatedCount,
                ]);
            }
        }
    }

    /**
     * ✅ 可选：记录测试被删除的日志
     */
    public function deleted(PlacementTest $test)
    {
        Log::info("PlacementTest deleted", [
            'test_id' => $test->test_id,
            'title' => $test->title,
            'status' => $test->status,
        ]);
    }
}
