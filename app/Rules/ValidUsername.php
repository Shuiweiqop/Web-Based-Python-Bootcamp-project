<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidUsername implements ValidationRule
{
    /**
     * 禁止的用户名列表（可以根据需要添加更多）
     */
    protected array $forbiddenWords = [
        'admin',
        'administrator',
        'root',
        'system',
        'moderator',
        'support',
        'help',
        'null',
        'undefined',
        'test',
        'demo',
    ];

    /**
     * 保留的用户名（系统使用）
     */
    protected array $reservedNames = [
        'api',
        'www',
        'mail',
        'ftp',
        'admin',
        'webmaster',
        'postmaster',
    ];

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $raw = (string) $value;

        // 检查是否为空或只包含空格（在 trim 之前判断）
        if ($raw === null || trim($raw) === '') {
            $fail('The username cannot be empty or contain only spaces.');
            return;
        }

        // 规范化：去两端空格并降小写，用于后续检查
        $username = mb_strtolower(trim($raw));

        // 检查长度（使用多字节安全函数）
        $len = mb_strlen($username);
        if ($len < 3) {
            $fail('The username must be at least 3 characters.');
            return;
        }

        if ($len > 50) {
            $fail('The username must not exceed 50 characters.');
            return;
        }

        // 只允许字母和空格（支持 Unicode 字母）
        if (!preg_match('/^[\p{L}\s]+$/u', $username)) {
            $fail('The username can only contain letters and spaces.');
            return;
        }

        // 检查是否以数字开头 —— 既然上面只允许字母，这行可移除；保留以防规则改动
        if (preg_match('/^\d/', $username)) {
            $fail('The username cannot start with a number.');
            return;
        }

        // 检查连续空格（使用规范化后的变量）
        if (preg_match('/\s{2,}/', $username)) {
            $fail('The username cannot contain consecutive spaces.');
            return;
        }

        // 首尾空格检查已通过 trim 处理，因此这里不再需要
        // 若仍想 double-check 可保留:
        // if ($username !== trim($username)) { ... }

        // 检查禁止的词汇（部分匹配）
        foreach ($this->forbiddenWords as $word) {
            if (stripos($username, $word) !== false) {
                $fail('This username contains forbidden words and cannot be used.');
                return;
            }
        }

        // 检查保留名称（精确匹配）
        if (in_array($username, $this->reservedNames, true)) {
            $fail('This username is reserved and cannot be used.');
            return;
        }

        // 检查是否包含常见的不当词汇模式
        if ($this->containsInappropriateContent($username)) {
            $fail('This username is not appropriate. Please choose another one.');
            return;
        }
    }

    /**
     * 检查是否包含不当内容
     */
    protected function containsInappropriateContent(string $username): bool
    {
        // 这里可以添加更复杂的检查逻辑
        // 例如：调用外部API检查敏感词等

        // 简单示例：检查重复字符（如 'aaaaaaa'）
        if (preg_match('/(.)\1{6,}/u', $username)) {
            return true;
        }

        return false;
    }
}
