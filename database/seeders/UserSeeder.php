<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Administrator Account
        User::firstOrCreate(
            ['email' => 'admin@codelearn.com'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('admin123'),
                'phone_number' => '012-345-6789',
                'role' => 'administrator',
                'email_verified_at' => now(),
            ]
        );

        // Create Sample Student Accounts
        User::firstOrCreate(
            ['email' => 'alice.wong@student.com'],
            [
                'name' => 'Alice Wong',
                'password' => Hash::make('student123'),
                'phone_number' => '016-789-0123',
                'role' => 'student',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'bob.chen@student.com'],
            [
                'name' => 'Bob Chen',
                'password' => Hash::make('student123'),
                'phone_number' => '017-890-1234',
                'role' => 'student',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'charlie.lim@student.com'],
            [
                'name' => 'Charlie Lim',
                'password' => Hash::make('student123'),
                'phone_number' => '018-901-2345',
                'role' => 'student',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'diana.tan@student.com'],
            [
                'name' => 'Diana Tan',
                'password' => Hash::make('student123'),
                'phone_number' => '019-012-3456',
                'role' => 'student',
                'email_verified_at' => now(),
            ]
        );

        // Create more sample students using factory if you have one
        // User::factory()->count(20)->student()->create();
    }
}
