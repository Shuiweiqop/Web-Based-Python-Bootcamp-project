# BACKEND — Laravel rules

Strict rules for `app/`, `routes/`. Back to router: [../Agent.md](../Agent.md).

## Architecture (non-negotiable)

- Controllers **MUST** stay thin: validate input, call a Service, return a
  response. Business logic in a Controller is **FORBIDDEN** → move it to
  `app/Services/*`.
- Input validation **MUST** use a Form Request (`app/Http/Requests/*`), **NEVER**
  inline `$request->validate()` for non-trivial rules.
- Reusable queries **MUST** use Eloquent scopes/relations on the Model, **NEVER**
  raw SQL scattered in controllers.

## Roles & auth

- Roles are exactly `'student'` or `'administrator'` — **NEVER** invent new role
  strings.
- Routes that need a role **MUST** be guarded:
  `->middleware('role:administrator')` / `->middleware('role:student')`
  (see [../app/Http/Middleware/CheckRole.php](../app/Http/Middleware/CheckRole.php)).
- In code, check with `$user->isAdministrator()` / `$user->isStudent()`.

## Defense & logging (the bottom line)

Every external call (Gemini, Judge0, HTTP, file/DB writes that can fail) **MUST**
follow this shape — it is already the house style, see
[../app/Services/Judge0Service.php](../app/Services/Judge0Service.php):

```php
try {
    // ... do the work
    return ['success' => true, /* ... */];
} catch (\Throwable $e) {
    Log::error('Judge0 submit failed', [
        'action' => 'executeCode',     // what was attempted
        'input'  => compact('stdin'),  // relevant params (NEVER log secrets)
        'error'  => $e->getMessage(),  // concrete failure
    ]);
    return ['success' => false, 'output' => 'Error: ...'];
}
```

- **MUST** include context (action, input, error) in the log — a bare
  `Log::error($e)` is FORBIDDEN; it makes failures untraceable.
- Missing API keys **MUST** degrade gracefully (return a `success => false`
  payload), **NEVER** throw a raw 500 to the user.
- **NEVER** log secrets, passwords, or full request payloads.

## After changes

1. `vendor/bin/pint` on touched files.
2. `php artisan test --filter=...` for the affected Feature/Unit test, then
   `composer test` before done.
