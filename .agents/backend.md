# backend.md — Laravel rules

Scope: `app/`, `routes/`. You are here for PHP logic, AI, Judge0.
**MUST NOT** also read `frontend.md` / `database.md` / `testing.md` for this task.
Root law (Priority Order, Scope, permissions): [../AGENTS.md](../AGENTS.md).

## 1. Architecture — the one request flow

```
HTTP → Route (role middleware) → Controller (thin) → Service (logic+tx) → Model/Eloquent → DB
```

Per-layer prohibitions:

- **Controller** — MUST stay thin: resolve a Form Request, call one Service, return
  `Inertia::render(...)` or JSON. Business logic in a Controller is **FORBIDDEN** → put it in a Service.
  Raw SQL and multi-step writes here are **FORBIDDEN** → use a Service.
  Validation: inline `$request->validate()` is fine for simple rules (the common case here).
  Use a Form Request (`app/Http/Requests/*`) when rules are complex, reused across actions,
  or need authorization — **NEVER** hand-roll validation logic inside the action body.
- **Service** — owns business logic. MUST NOT touch `request()`, sessions, or response objects.
  Returns an array (`['success'=>..., ...]`) or throws a domain exception.
- **Model** — relations / scopes / casts only. External calls (HTTP, files) here are **FORBIDDEN**.

## 2. Naming table

| Thing | Convention | Example |
| --- | --- | --- |
| Controller | `{Area}{Entity}Controller`, RESTful methods | `AdminRewardController::store` |
| Route name | `admin.` / `student.` prefix | `admin.rewards.store` |
| Service | `{Domain}Service` | `RewardPurchaseService::purchase` |
| Form Request | `{Action}{Entity}Request` | `StoreLessonRequest` |
| Model primary key | `{entity}_id` — **NEVER** `id` | `reward_id`, `post_id` |
| Role string | `student` \| `administrator` only | `->middleware('role:administrator')` |

Guard role in code with `$user->isAdministrator()` / `$user->isStudent()`
(see [../app/Http/Middleware/CheckRole.php](../app/Http/Middleware/CheckRole.php)).

## 3. Defense (the bottom line)

**Transactions.** Any mutation of money / inventory / grades MUST run inside
`DB::transaction(fn () => ...)` with `lockForUpdate()` on contended rows. Reference:
[../app/Services/RewardPurchaseService.php](../app/Services/RewardPurchaseService.php).
A multi-step write without a transaction is **FORBIDDEN** (partial writes corrupt data).
Prefer the transaction in the Service next to the logic (ref above); a transaction opened in
a Controller is tolerated, but the enclosed business logic still belongs in a Service.

**Two catch patterns — pick by failure type:**

- *External call / IO / parsing* (Gemini, Judge0, `json_decode`): catch `\Throwable`
  **in the Service**, log, and return a graceful `['success'=>false, ...]`. NEVER throw a raw 500.
  Ref: [../app/Services/Judge0Service.php](../app/Services/Judge0Service.php).
- *Domain rule violation* (insufficient points, out of stock): `throw new \RuntimeException(...)`
  from the Service and let it **bubble to the Controller**. Ref: `RewardPurchaseService::assert*`.

**Catch placement.** `catch` lives in the **Service / Job** only. Controllers let domain
exceptions bubble (convert to a user response at the boundary). Swallowing an exception
silently (`catch (...) {}`) is **FORBIDDEN**.

**Standardized logging** — every log MUST be greppable and accountable:

```php
Log::error('reward.purchase.failed', [   // stable, greppable event key
    'action'    => 'purchase',           // what was attempted
    'reward_id' => $rewardId,            // domain key(s)
    'input'     => ['quantity' => $qty], // relevant params — masked, NEVER secrets
    'error'     => $e->getMessage(),     // concrete failure
]);
```

NEVER log secrets, passwords, or full request payloads. A bare `Log::error($e)` is FORBIDDEN.
Missing API keys MUST degrade gracefully, never 500.

## 4. Domain invariants (confirm impact before changing)

These are frozen magic values — changing one without checking call sites breaks behaviour:

- Judge0 Python language ID = **`71`** (`Judge0Service`).
- `DB::transaction` retry count = **`5`** for contended rows (`RewardPurchaseService`).
- Roles are exactly **`student`** and **`administrator`** — NEVER invent new role strings.
- Reward types: `profile_background`/`background`, `avatar_frame`, `title`/`profile_title`, `badge`.
- Points economy (`current_points`, `point_cost`, `stock_quantity`, `max_owned`, `deductPoints`)
  MUST only change through the Service — NEVER mutate balances/stock inline in a Controller.

## 5. Done

Definition of Done + commands: [testing.md](testing.md). At minimum: `vendor/bin/pint`
on touched files, then the affected `php artisan test --filter=...`, then `composer test`.
