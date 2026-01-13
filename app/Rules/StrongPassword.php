<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class StrongPassword implements ValidationRule
{
    /**
     * 常见的弱密码列表
     */
    protected array $commonPasswords = [
        'password',
        'password123',
        '12345678',
        'qwerty123',
        'abc123456',
        'password1',
        'welcome123',
        'admin123',
        'letmein123',
    ];

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $password = $value;

        // 检查最小长度
        if (strlen($password) < 8) {
            $fail('The password must be at least 8 characters long.');
            return;
        }

        // 检查最大长度
        if (strlen($password) > 128) {
            $fail('The password must not exceed 128 characters.');
            return;
        }

        // 检查是否包含至少一个小写字母
        if (!preg_match('/[a-z]/', $password)) {
            $fail('The password must contain at least one lowercase letter.');
            return;
        }

        // 检查是否包含至少一个大写字母
        if (!preg_match('/[A-Z]/', $password)) {
            $fail('The password must contain at least one uppercase letter.');
            return;
        }

        // 检查是否包含至少一个数字
        if (!preg_match('/\d/', $password)) {
            $fail('The password must contain at least one number.');
            return;
        }

        // 检查是否包含至少一个特殊字符
        if (!preg_match('/[@$!%*?&#]/', $password)) {
            $fail('The password must contain at least one special character (@$!%*?&#).');
            return;
        }

        // 检查是否是常见弱密码
        $lowerPassword = strtolower($password);
        foreach ($this->commonPasswords as $common) {
            if ($lowerPassword === $common || strpos($lowerPassword, $common) !== false) {
                $fail('This password is too common. Please choose a stronger password.');
                return;
            }
        }

        // 检查是否包含连续字符（如：123, abc, 111）
        if ($this->hasSequentialChars($password)) {
            $fail('The password should not contain sequential characters (e.g., 123, abc).');
            return;
        }

        // 检查是否包含过多重复字符
        if ($this->hasRepeatingChars($password)) {
            $fail('The password contains too many repeating characters.');
            return;
        }
    }

    /**
     * 检查是否包含连续字符
     */
    protected function hasSequentialChars(string $password): bool
    {
        // 检查连续数字（123, 234, 345...）
        for ($i = 0; $i <= 7; $i++) {
            $sequence = (string)$i . (string)($i + 1) . (string)($i + 2);
            if (stripos($password, $sequence) !== false) {
                return true;
            }
        }

        // 检查连续字母（abc, bcd, cde...）
        for ($i = ord('a'); $i <= ord('x'); $i++) {
            $sequence = chr($i) . chr($i + 1) . chr($i + 2);
            if (stripos($password, $sequence) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * 检查是否有过多重复字符
     */
    protected function hasRepeatingChars(string $password): bool
    {
        // 检查是否有字符重复超过3次（如：aaaa, 1111）
        return preg_match('/(.)\1{3,}/', $password) === 1;
    }
}
