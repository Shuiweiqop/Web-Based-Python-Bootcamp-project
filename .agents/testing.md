# testing.md — tests & Definition of Done

Scope: writing/running tests and finishing any task.
**MUST NOT** also read `backend.md` / `frontend.md` / `database.md` for this task.
Root law: [../AGENTS.md](../AGENTS.md).

## 1. Commands

- `composer test` — full PHP suite (sqlite `:memory:`)
- `php artisan test --filter=Name` — one PHP test
- `npm run test:unit` — frontend (Vitest) · `npm run test:e2e` — Playwright
- `vendor/bin/pint` — format PHP

Tests live in `tests/Unit`, `tests/Feature` (PHP) and `tests/e2e` (Playwright);
frontend specs sit beside the code under `resources/js`.

## 2. Tests are mandatory

- Every new feature or bug fix MUST add/update a test. A change without a test is **NOT done**.
- PHP: `tests/Feature` for request→response, `tests/Unit` for Service logic.
- Use factories/seeders for data — NEVER hand-built rows.

## 3. The pre-push gate

`.githooks/pre-push` runs `composer test` + `npm run test:unit` before every push.
Enable once per clone: `git config core.hooksPath .githooks`.
Bypass (`git push --no-verify`) is **FORBIDDEN** except a declared emergency.

## 4. Definition of Done (check all)

- [ ] Code follows the relevant domain rules (`.agents/*.md`).
- [ ] `vendor/bin/pint` clean on touched PHP files.
- [ ] New/updated test covers the change.
- [ ] `composer test` green (+ `npm run test:unit` if `resources/js` changed).
- [ ] Diff is scoped to the task — no drive-by edits.
- [ ] Commit/push only after the user asks.
