<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('interactive_exercises', function (Blueprint $table) {
            // 是否启用 Live Editor（只对 coding 类型有效）
            $table->boolean('enable_live_editor')->default(false)->after('exercise_type');

            // 测试用例（JSON 格式）
            // 格式: [{"input":"5","expected":"120","description":"Test case 1"}]
            $table->json('test_cases')->nullable()->after('solution');

            // 编程题说明（可以用 HTML/Markdown）
            $table->text('coding_instructions')->nullable()->after('test_cases');
        });
    }

    public function down(): void
    {
        Schema::table('interactive_exercises', function (Blueprint $table) {
            $table->dropColumn([
                'enable_live_editor',
                'test_cases',
                'coding_instructions'
            ]);
        });
    }
};
