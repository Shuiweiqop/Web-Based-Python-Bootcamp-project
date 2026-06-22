# AGENTS.md

Web-based Python learning platform — **Laravel 12 + Inertia 2 + React 19**.
Package managers: **composer** (PHP), **npm** (JS). Shell: **PowerShell on Windows**.

## Routing — read ONE file, then stop

| Task touches… | Read ONLY | MUST NOT also read |
| --- | --- | --- |
| `app/`, `routes/` — PHP logic, AI, Judge0 | [.agents/backend.md](.agents/backend.md) | the other three |
| `resources/js/` — React / Inertia / Tailwind | [.agents/frontend.md](.agents/frontend.md) | the other three |
| migrations / schema / queries / test DB | [.agents/database.md](.agents/database.md) | the other three |
| writing/running tests, finishing a task | [.agents/testing.md](.agents/testing.md) | the other three |

The always-on rules below apply to **every** task regardless of domain.

## Commands (required infra noted)

- `composer run dev` — server+queue+logs+vite · needs PHP 8.2+, a DB (MySQL or sqlite)
- `composer test` — PHP suite · sqlite `:memory:`, no infra
- `npm run test:unit` — frontend · `npm run test:e2e` — Playwright (needs seeded `database/e2e.sqlite`, port 8010)
- `php artisan test --filter=Name` · `vendor/bin/pint` (format PHP) · `npm run build`
- One-time per clone: `git config core.hooksPath .githooks` (pre-push test gate)

## Permissions

- **Do freely:** read code; run tests / pint / build; edit files the task requires.
- **Ask first:** `git commit` / `git push`; migrations or schema changes; deleting data; adding dependencies; anything touching `.env` or secrets.

## Priority Order (higher wins on conflict)

1. **Data integrity & security** — points/inventory/grades correctness, no secret leak
2. These AGENTS rules
3. User instruction
4. Convenience / speed

If a user instruction would corrupt data or leak secrets → **STOP, warn, and do not proceed** until they confirm.

## Global law

- **NEVER** commit secrets — keys live in `.env` (see [.env.example](.env.example)).
- **NEVER** edit generated files: `ziggy-routes.js`, `package-lock.json`, `composer.lock`, `public/build/*`.
- **NEVER** push red/untested code (the pre-push hook enforces this).

## Scope discipline

- Change ONLY files the task needs. Drive-by rename/reformat is **FORBIDDEN**.
- Spot an unrelated problem → propose it, do NOT fix it in this diff.
- Hardcoded constants are frozen — NEVER "tidy" them; check domain invariants first.
- One task = one focused diff. If it needs a big change → STOP and ask.

## Inheritance

No parent/sibling AGENTS.md exists (checked `meeting-ai-platform`). This file is authoritative.
Macros: [.claude/commands/](.claude/commands/) → `/make_safe_api`, `/debug_log`. Human overview: [README.md](README.md).
