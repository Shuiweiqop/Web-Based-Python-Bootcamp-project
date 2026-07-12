# AGENTS.md

Web-based Python learning platform for students + admins (lessons, gamified
exercises, AI-authored lessons, forum). **Laravel 12 + Inertia 2 + React 19.**
Package managers: **composer** (PHP), **npm** (JS). Shell here: **PowerShell on Windows**.

## Read the file your task touches. When unsure, read it.

| Task touches | Read |
| --- | --- |
| `app/`, `routes/` — controllers, services, AI (Gemini), code exec (Judge0) | [.agents/backend.md](.agents/backend.md) |
| `resources/js/` — React pages, Inertia props, Tailwind, Ziggy `route()` | [.agents/frontend.md](.agents/frontend.md) |
| `database/` — migrations, schema, the three DB environments | [.agents/database.md](.agents/database.md) |
| writing/running tests, or deciding a task is "done" | [.agents/testing.md](.agents/testing.md) |

A task that spans several areas (a points/inventory change touches backend **and**
database; a new page touches backend **and** frontend) — read all the relevant files.
Reading an extra file costs a few thousand tokens; missing one costs a data bug.

The rest of this file is true for **every** task, no matter what it touches.

## Commands (and the infra each needs)

- `composer run dev` — server + queue + logs + vite together · needs PHP 8.2+ and a DB
- `composer test` — full PHP suite · runs on sqlite `:memory:`, needs nothing else
- `php artisan test --filter=Name` — one PHP test
- `npm run test:unit` — frontend (Vitest) · fast, no infra
- `npm run test:e2e` — Playwright · needs a seeded `database/e2e.sqlite` and app port 8010 (see [.agents/database.md](.agents/database.md))
- `vendor/bin/pint` — format PHP (see the note under Scope discipline before relying on it)
- `npm run build` — production assets · slow; only to verify a build, not a routine check
- One-time per clone: `git config core.hooksPath .githooks` — turns on the pre-push test gate

## Permissions

- **Do freely:** read anything; run tests / pint / build; edit the files the task needs.
- **Ask first, every time:** `git commit` / `git push`; creating or running migrations;
  deleting data; adding a dependency; touching `.env` or anything secret.

## Priority Order (higher wins when they conflict)

1. **Data integrity & security** — points / inventory / grades stay correct; no secret leaks
2. The rules in these AGENTS files
3. What the user asked for
4. Speed / convenience

**If following a user instruction would corrupt data or leak a secret, stop and say so
before doing it.** Don't guess a way to satisfy both — surface the conflict.

## What can actually stop you (know the difference)

Only two things turn red in this repo, and neither is Markdown:

- **CI** ([.github/workflows/ci.yml](.github/workflows/ci.yml)) on every push/PR to `main`:
  `npm run build`, PHPUnit, Vitest, **and Playwright e2e**.
- **The pre-push hook** ([.githooks/pre-push](.githooks/pre-push)): `composer test` +
  `npm run test:unit`. It does **not** run e2e — so a push that is green locally can still
  fail CI on an e2e test. After frontend/page changes, watch CI.

Everything else in these files — Pint formatting, "thin controllers", the naming tables —
is a convention nothing enforces automatically. That's exactly why it's written down. It
also means **you** are the only check on it; there is no linter to catch a slip.

## Scope discipline

Change only the files this one task needs. If you spot an unrelated bug, a magic value, or
something worth reformatting — **propose it, don't fix it in this diff.** Unrelated cleanup
belongs in a separate change.

If the real scope turns out much larger than what was asked (a "small fix" that needs a
schema change, say), **stop and ask** before expanding it.

Note on `vendor/bin/pint`: it *reformats* PHP; it doesn't gate anything (not in CI, not in
the hook). Run it on the files you touched so you don't add formatting noise — but never let
it sweep unrelated files into your diff. That is scope creep with a formatter's blessing.

## Never edit generated files

`ziggy-routes.js`, `package-lock.json`, `composer.lock`, `public/build/*`. They're outputs —
edit the source and regenerate. Secrets live only in `.env` (template: [.env.example](.env.example)).

## If none of this matches your task

Don't invent a rule from thin air. Ask, or say you don't know. A wrong guess about
points/grades/inventory logic is far more expensive than a question.

Human overview: [README.md](README.md) · running scratchpad of gotchas: [NOTES.md](NOTES.md) ·
command macros: [.claude/commands/](.claude/commands/) (`/make_safe_api`, `/debug_log`).
No parent or sibling AGENTS.md exists — this file is authoritative.
