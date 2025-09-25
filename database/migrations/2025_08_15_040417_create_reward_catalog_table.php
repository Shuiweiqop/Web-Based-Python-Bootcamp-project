<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reward_catalog', function (Blueprint $table) {
            $table->id('reward_id');
            $table->string('name', 255); // Increased from 10 for better flexibility
            $table->text('description'); // Changed to TEXT for longer descriptions
            $table->enum('reward_type', [
                'badge',           // Virtual badges/achievements
                'certificate',     // Completion certificates
                'avatar',          // Profile avatar items
                'theme'            // UI themes/skins
            ]);
            $table->integer('stock_quantity')->default(0)->comment('Use -1 for unlimited stock');
            $table->integer('point_cost')->default(0);
            $table->text('image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes for better performance
            $table->index('reward_type');
            $table->index('is_active');
            $table->index('point_cost');
            $table->index(['reward_type', 'is_active']);
            $table->index(['point_cost', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reward_catalog');
    }
};
