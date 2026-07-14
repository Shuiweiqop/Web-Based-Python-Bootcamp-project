<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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

        // Additional students so ForumSeeder (which needs 10) has data. Named + explicit
        // instead of a factory: fakerphp/faker is a dev-only dependency and isn't installed
        // in production (composer install --no-dev), so User::factory() would fatal there.
        // All demo logins use the password 'student123'.
        $extraStudents = [
            ['name' => 'Ethan Ng', 'email' => 'ethan.ng@student.com', 'phone_number' => '010-111-2222'],
            ['name' => 'Fiona Lee', 'email' => 'fiona.lee@student.com', 'phone_number' => '011-222-3333'],
            ['name' => 'George Ho', 'email' => 'george.ho@student.com', 'phone_number' => '012-333-4444'],
            ['name' => 'Hannah Sim', 'email' => 'hannah.sim@student.com', 'phone_number' => '013-444-5555'],
            ['name' => 'Ivan Goh', 'email' => 'ivan.goh@student.com', 'phone_number' => '014-555-6666'],
            ['name' => 'Julia Ong', 'email' => 'julia.ong@student.com', 'phone_number' => '015-666-7777'],
        ];

        foreach ($extraStudents as $student) {
            User::firstOrCreate(
                ['email' => $student['email']],
                [
                    'name' => $student['name'],
                    'password' => Hash::make('student123'),
                    'phone_number' => $student['phone_number'],
                    'role' => 'student',
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
