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
        Schema::create('users', function (Blueprint $table) {
            // Primary Key - user_Id
            $table->id('user_Id'); // This creates an auto-incrementing INT(10) UNSIGNED primary key

            // User Information
            $table->string('name', 100)->comment('Name of user');
            $table->string('email', 100)->unique()->comment('User email address');
            $table->string('password', 60)->comment('User hashed password');
            $table->string('phone_number', 20)->nullable()->comment('User phone contact');
            $table->text('profile_picture')->nullable()->comment('Path or URL to profile photo');

            // Role field (for your FYP system: administrator, student)
            $table->enum('role', ['administrator', 'student'])->default('student');

            // Email verification (Laravel standard)
            $table->timestamp('email_verified_at')->nullable();

            // Remember token for "Remember me" functionality
            $table->rememberToken();

            // Timestamps - created_at and updated_at
            $table->timestamps(); // This creates both created_at and updated_at timestamp columns

            // Indexes for better performance
            $table->index('email');
            $table->index('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
