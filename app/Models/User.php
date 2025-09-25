<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    protected $primaryKey = 'user_Id';

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone_number',
        'profile_picture',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // Role helper methods
    public function isAdministrator(): bool
    {
        return $this->role === 'administrator';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    // Profile picture attribute
    protected function profilePicture(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $value ? (filter_var($value, FILTER_VALIDATE_URL) ? $value : asset('storage/' . $value)) : null,
        );
    }

    // Get user initials
    public function getInitialsAttribute(): string
    {
        $names = explode(' ', $this->name);
        $initials = '';

        foreach ($names as $name) {
            $initials .= strtoupper(substr($name, 0, 1));
        }

        return substr($initials, 0, 2);
    }

    // Formatted phone attribute
    public function getFormattedPhoneAttribute(): ?string
    {
        if (!$this->phone_number) {
            return null;
        }

        $phone = preg_replace('/[^0-9]/', '', $this->phone_number);

        if (strlen($phone) === 10 && substr($phone, 0, 1) === '0') {
            return substr($phone, 0, 3) . '-' . substr($phone, 3, 3) . '-' . substr($phone, 6);
        } elseif (strlen($phone) === 11 && substr($phone, 0, 2) === '60') {
            return '+60 ' . substr($phone, 2, 2) . '-' . substr($phone, 4, 3) . '-' . substr($phone, 7);
        }

        return $this->phone_number;
    }

    /**
     * MAIN RELATIONSHIP: User has one Student Profile
     */
    public function studentProfile(): HasOne
    {
        return $this->hasOne(StudentProfile::class, 'user_Id', 'user_Id');
    }

    /**
     * REMOVED: The problematic accessor method
     * Instead, access the relationship directly:
     * - $user->studentProfile (loads the relationship)
     * - $user->studentProfile() (returns the relationship query builder)
     */

    /**
     * Safely get or create student profile (only for students)
     */
    public function getOrCreateStudentProfile()
    {
        if (!$this->isStudent()) {
            return null;
        }

        return $this->studentProfile()->firstOrCreate(
            ['user_Id' => $this->user_Id],
            [
                'current_points' => 0,
                'total_lessons_completed' => 0,
                'total_tests_taken' => 0,
                'average_score' => 0.00,
                'streak_days' => 0,
                'last_activity_date' => now()->toDateString(),
            ]
        );
    }

    // Scopes
    public function scopeRole($query, $role)
    {
        return $query->where('role', $role);
    }

    public function scopeAdministrators($query)
    {
        return $query->where('role', 'administrator');
    }

    public function scopeStudents($query)
    {
        return $query->where('role', 'student');
    }

    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    /**
     * Boot method
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (empty($user->role)) {
                $user->role = 'student';
            }
        });

        static::created(function ($user) {
            if ($user->role === 'student') {
                $user->studentProfile()->create([
                    'current_points' => 0,
                    'total_lessons_completed' => 0,
                    'total_tests_taken' => 0,
                    'average_score' => 0.00,
                    'streak_days' => 0,
                    'last_activity_date' => now()->toDateString(),
                ]);
            }
        });

        static::updated(function ($user) {
            if ($user->isDirty('role')) {
                $originalRole = $user->getOriginal('role');
                $newRole = $user->role;

                if ($originalRole === 'student' && $newRole === 'administrator') {
                    $user->studentProfile()->delete();
                }

                if ($originalRole === 'administrator' && $newRole === 'student') {
                    $user->studentProfile()->create([
                        'current_points' => 0,
                        'total_lessons_completed' => 0,
                        'total_tests_taken' => 0,
                        'average_score' => 0.00,
                        'streak_days' => 0,
                        'last_activity_date' => now()->toDateString(),
                    ]);
                }
            }
        });
    }
}
