# backend.md — Laravel (`app/`, `routes/`)

You're here for PHP logic: controllers, services, AI (Gemini), code execution (Judge0).
Root law (priorities, scope, what actually gates a push): [../AGENTS.md](../AGENTS.md).
If a task also touches the DB schema or a React page, read that file too.

## The request flow, and why each layer stays in its lane

```
HTTP → Route (role middleware) → Controller (thin) → Service (logic + transaction) → Model → DB
```

This split isn't style — it's what keeps business logic testable and writes atomic. The
existing services (`app/Services/*Service.php`) all follow it; match them.

- **Controller** — resolve/validate input, call one service, return `Inertia::render(...)`
  or JSON. Don't put business logic, raw SQL, or multi-step writes here — a service exists so
  that logic is unit-testable without an HTTP request. Inline `$request->validate()` is fine
  for simple rules (the common case); reach for a Form Request (`app/Http/Requests/`) when
  rules get complex, are reused, or need authorization.
- **Service** — owns the logic. It should never touch `request()`, the session, or a response
  object; if it does, it can't be reused off the HTTP path and can't be unit-tested cleanly.
  Return an array (`['success' => ..., ...]`) or throw a domain exception.
- **Model** — relations, scopes, casts. No HTTP calls or file IO from a model.

## Naming (match what's already there)

| Thing | Convention | Example |
| --- | --- | --- |
| Controller | `{Area}{Entity}Controller`, RESTful methods | `AdminRewardController::store` |
| Route name | `admin.` / `student.` prefix | `admin.rewards.store` |
| Service | `{Domain}Service` | `RewardPurchaseService::purchase` |
| Form Request | `{Action}{Entity}Request` | `StoreLessonRequest` |
| Model primary key | `{entity}_id`, not `id` | `reward_id`, `post_id` |

Roles are exactly `student` and `administrator` — no other role strings exist, and the
`role:` middleware + `$user->isStudent()` / `isAdministrator()`
([../app/Http/Middleware/CheckRole.php](../app/Http/Middleware/CheckRole.php)) assume only
those two. Inventing a third breaks authorization silently.

## Defense — the part that protects data

**Money / inventory / grade mutations run inside a transaction with a row lock.** A
multi-step write without one can partially apply and corrupt a balance. The reference
implementation is `RewardPurchaseService::purchase` — it opens `DB::transaction(...)` and
`lockForUpdate()`s the contended rows. Copy that shape; keep the transaction in the service,
next to the logic it protects.

**Two ways to handle failure — pick by what failed:**

- *An external call, IO, or parse failed* (Gemini, Judge0, `json_decode`): catch `\Throwable`
  **in the service**, log it, and return `['success' => false, ...]`. Don't let it become a
  raw 500. A missing API key must degrade to a graceful message, never crash.
  Ref: `app/Services/Judge0Service.php`.
- *A domain rule was violated* (not enough points, out of stock): `throw` from the service and
  let it **bubble up to the controller**, which turns it into the user-facing response.
  Ref: the `assert*` methods in `RewardPurchaseService`.

The rule underneath both: **`catch` belongs in the service or a job, never swallowed empty.**
An empty `catch (...) {}` hides a failure you'll never find again — if you catch, you log.

**Logs are for the person debugging this at 2am — make them greppable and safe:**

```php
Log::error('reward.purchase.failed', [   // stable event key you can grep for
    'action'    => 'purchase',
    'reward_id' => $rewardId,            // the domain keys involved
    'input'     => ['quantity' => $qty], // relevant params — never secrets
    'error'     => $e->getMessage(),
]);
```

Don't log `$request->validated()` or full payloads — that writes passwords and personal data
into `laravel.log`. Don't `Log::error($e)` bare — a stringified exception has no event key and
can't be found later. (The `/debug_log` macro scaffolds this shape.)

## Values you can't safely "tidy"

These look like magic numbers but call sites depend on them — check before changing:

- **Judge0 language ID** defaults to `71` (Python 3) via `JUDGE0_LANGUAGE_ID` in
  `config/services.php`. It's env-configurable, not hardcoded in the service — change the env
  or config, never a literal in code.
- **`RewardPurchaseService::TRANSACTION_ATTEMPTS = 5`** is passed as the retry count to
  `DB::transaction(..., 5)` ([../app/Services/RewardPurchaseService.php:55](../app/Services/RewardPurchaseService.php#L55)):
  the purchase retries up to 5 times on a deadlock/serialization conflict. Lowering it makes
  contended purchases fail under load; it is not a stray constant.
- **Reward types** the frontend and service both branch on:
  `profile_background`/`background`, `avatar_frame`, `title`/`profile_title`, `badge`.
  Adding a type means updating every place that switches on it, not just one.
- The **points economy** fields (`current_points`, `point_cost`, `stock_quantity`,
  `max_owned`) change only through the service — never mutate a balance or stock count inline
  in a controller.

## When you're done

`vendor/bin/pint` the files you touched, run the affected `php artisan test --filter=...`,
then `composer test`. Full checklist: [testing.md](testing.md).
