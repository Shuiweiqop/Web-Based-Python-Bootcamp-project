# testing.md — tests & "done"

You're here to write/run tests or decide a task is finished.
Root law: [../AGENTS.md](../AGENTS.md).

## Commands

- `composer test` — full PHP suite (sqlite `:memory:`)
- `php artisan test --filter=Name` — one PHP test
- `npm run test:unit` — frontend (Vitest)
- `npm run test:e2e` — Playwright admin browser smoke tests (needs the seeded e2e DB; see
  [database.md](database.md))
- `vendor/bin/pint` — format PHP

PHP tests live in `tests/Unit` (service logic) and `tests/Feature` (request→response).
Playwright specs live in `tests/e2e`. Frontend specs sit beside the code under `resources/js`.

## What running these tests actually gates

- **The pre-push hook** runs `composer test` + `npm run test:unit`. Enable it once per clone:
  `git config core.hooksPath .githooks`. It does **not** run e2e.
- **CI** additionally runs `npm run build` and Playwright e2e. So a push that passes the hook
  can still fail CI — watch CI after anything touching frontend or pages.
- `git push --no-verify` skips the hook. Don't, unless it's a stated emergency and you say so.

Note that Pint is not in either gate. It formats; it doesn't fail a build. Run it to avoid
noise, but a "clean Pint" is a courtesy, not a green light.

## A change without a test isn't finished

New feature or bug fix → add or update a test that would have caught the bug. Use
factories/seeders for test data, never hand-built rows (they drift from the real schema).
This is the one convention nothing enforces for you — CI runs the tests you write, but nothing
checks that you wrote them. That's on you.

## Definition of Done

- [ ] Follows the domain rules for the area you touched (`.agents/*.md`).
- [ ] A new/updated test covers the change.
- [ ] `composer test` green (and `npm run test:unit` if you touched `resources/js`).
- [ ] `vendor/bin/pint` run on the PHP files you touched (no unrelated files swept in).
- [ ] Diff is scoped to the task — no drive-by edits.
- [ ] Committed/pushed only after the user asked.
