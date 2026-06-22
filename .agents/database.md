# database.md — schema & environments

Scope: `database/`, schema, query/connection concerns.
**MUST NOT** also read `backend.md` / `frontend.md` / `testing.md` for this task.
Root law: [../AGENTS.md](../AGENTS.md).

## 1. Three environments — never confuse them

| Context | Connection | Defined in |
| --- | --- | --- |
| Local dev | MySQL (confirm the dev's actual `.env`) | `.env` |
| PHPUnit | SQLite `:memory:`, queue `sync` | [../phpunit.xml](../phpunit.xml) |
| Playwright e2e | `database/e2e.sqlite`, app port 8010 | [../playwright.config.js](../playwright.config.js) |

- Tests **NEVER** touch the dev DB — PHPUnit forces its own in-memory DB.
- Before e2e: `php artisan migrate --force && php artisan db:seed --force` against `database/e2e.sqlite`.

## 2. Rules

- Schema changes MUST be a **new migration** in `database/migrations/`.
  Editing an already-shipped migration is **FORBIDDEN** → add a new one.
- Migrations MUST be reversible (`down()`) and run on **both** MySQL and SQLite →
  vendor-only SQL is FORBIDDEN; use the schema builder.
- Primary keys are custom `{entity}_id`, **not** `id` — match the existing model
  (`protected $primaryKey`) when adding tables/columns.
- Test/dev data MUST come from factories/seeders → hand-inserted rows are FORBIDDEN.
- All access goes through Eloquent. Raw `DB::statement` is a last resort and MUST carry a
  comment justifying why the query builder couldn't do it.

## 3. Done

After a migration: run it on sqlite (`php artisan migrate` in test env) and confirm
`composer test` is green. Full DoD: [testing.md](testing.md).
