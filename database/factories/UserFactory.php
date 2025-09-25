<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'phone_number' => $this->generateMalaysianPhone(),
            'profile_picture' => null,
            'role' => fake()->randomElement(['student', 'administrator']),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Create administrator user
     */
    public function administrator(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => 'administrator',
            'name' => fake()->name() . ' (Admin)',
        ]);
    }

    /**
     * Create student user
     */
    public function student(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => 'student',
        ]);
    }

    /**
     * Generate Malaysian phone number format
     */
    private function generateMalaysianPhone(): string
    {
        $prefixes = ['010', '011', '012', '013', '014', '015', '016', '017', '018', '019'];
        $prefix = fake()->randomElement($prefixes);
        $number = fake()->numerify('#######');

        return $prefix . '-' . substr($number, 0, 3) . '-' . substr($number, 3);
    }

    /**
     * User with profile picture
     */
    public function withProfilePicture(): static
    {
        return $this->state(fn(array $attributes) => [
            'profile_picture' => 'profile-pictures/' . fake()->uuid() . '.jpg',
        ]);
    }
}
