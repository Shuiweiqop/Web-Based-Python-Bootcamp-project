# AGENT.md

Python learning platform — Laravel 12 + Inertia 2 + React 19. Package managers:
**composer** (PHP), **npm** (JS). Shell is **PowerShell on Windows**.

This file is a router. Read the rules for the domain you are touching — do not
load all of them at once.

| You are working on… | MUST read first |
| --- | --- |
| Controllers, Services, Models, routes, AI/Judge0 | [docs/BACKEND.md](docs/BACKEND.md) |
| `resources/js` (Pages, Components, Inertia, Tailwind) | [docs/FRONTEND.md](docs/FRONTEND.md) |
| Migrations, schema, queries, test/dev DB | [docs/DATABASE.md](docs/DATABASE.md) |

## Universal rules (always apply)

- **NEVER** commit secrets. Keys (`GEMINI_API_KEY`, `JUDGE0_API_KEY`) live in `.env`.
- **NEVER** edit generated files: `ziggy-routes.js`, `package-lock.json`, `composer.lock`, `public/build/*`.
- **MUST** run the relevant tests before claiming done (commands below).
- **MUST** run the test suite and confirm it passes **before every `git commit` or `git push`** — never commit red or untested code.
- **MUST** add/update tests for every new feature or bug fix (`tests/Feature` or `tests/Unit` for PHP, Vitest for `resources/js`). A feature without a test is **not done**.
- **MUST** commit/push only when the user explicitly asks.

## Commands

- `composer run dev` — server + queue + logs + vite
- `composer test` — PHP · `npm run test:unit` — frontend · `npm run test:e2e` — Playwright
- `php artisan test --filter=Name` — single PHP test
- `vendor/bin/pint` — format PHP · `npm run build` — production build

## Setup (one-time, per clone)

Enable the pre-push test gate: `git config core.hooksPath .githooks`
(runs `composer test` + `npm run test:unit` before each push; bypass only with
`git push --no-verify` in emergencies).

Project overview for humans: [README.md](README.md).
