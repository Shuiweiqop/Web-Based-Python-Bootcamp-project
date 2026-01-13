<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        $existingColumns = Schema::getColumnListing('test_submissions');

        Schema::table('test_submissions', function (Blueprint $table) use ($existingColumns) {
            if (!in_array('is_completed', $existingColumns)) {
                $table->boolean('is_completed')->default(false);
            }

            if (!in_array('is_placement_test', $existingColumns)) {
                $table->boolean('is_placement_test')->default(false);
            }

            if (!in_array('recommended_path_id', $existingColumns)) {
                $table->unsignedBigInteger('recommended_path_id')->nullable();
            }

            if (!in_array('recommendation_confidence', $existingColumns)) {
                $table->decimal('recommendation_confidence', 5, 2)->nullable();
            }

            if (!in_array('recommendation_message', $existingColumns)) {
                $table->text('recommendation_message')->nullable();
            }
        });

        // 添加外键（如果 recommended_path_id 列存在且外键不存在）
        if (
            in_array('recommended_path_id', Schema::getColumnListing('test_submissions'))
            && Schema::hasTable('learning_paths')
        ) {

            if (!$this->foreignKeyExists('test_submissions', 'test_submissions_recommended_path_id_foreign')) {
                Schema::table('test_submissions', function (Blueprint $table) {
                    $table->foreign('recommended_path_id')
                        ->references('path_id')
                        ->on('learning_paths')
                        ->onDelete('set null');
                });
            }
        }
    }

    public function down()
    {
        // 检查外键是否存在
        if ($this->foreignKeyExists('test_submissions', 'test_submissions_recommended_path_id_foreign')) {
            Schema::table('test_submissions', function (Blueprint $table) {
                $table->dropForeign(['recommended_path_id']);
            });
        }

        $existingColumns = Schema::getColumnListing('test_submissions');

        Schema::table('test_submissions', function (Blueprint $table) use ($existingColumns) {
            $columnsToRemove = [
                'recommendation_message',
                'recommendation_confidence',
                'recommended_path_id',
                'is_placement_test',
                'is_completed',
            ];

            foreach ($columnsToRemove as $column) {
                if (in_array($column, $existingColumns)) {
                    $table->dropColumn($column);
                }
            }
        });
    }

    /**
     * 检查外键是否存在
     */
    private function foreignKeyExists($table, $foreignKey)
    {
        try {
            $connection = Schema::getConnection();
            $databaseName = $connection->getDatabaseName();

            $result = $connection->select("
                SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                WHERE TABLE_SCHEMA = ? 
                AND TABLE_NAME = ? 
                AND CONSTRAINT_NAME = ? 
                AND CONSTRAINT_TYPE = 'FOREIGN KEY'
            ", [$databaseName, $table, $foreignKey]);

            return count($result) > 0;
        } catch (\Exception $e) {
            return false;
        }
    }
};
