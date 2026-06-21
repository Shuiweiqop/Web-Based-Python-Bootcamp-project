# DATABASE — schema & environments

Strict rules for `database/` and DB access. Back to router: [../Agent.md](../Agent.md).

## Three environments — do not confuse them

| Context | Connection | Where defined |
| --- | --- | --- |
| Local dev | MySQL (check the dev's actual `.env`) | `.env` |
| PHPUnit | SQLite `:memory:`, queue `sync` | [../phpunit.xml](../phpunit.xml) |
| Playwright e2e | `database/e2e.sqlite`, app on port 8010 | [../playwright.config.js](../playwright.config.js) |

- Tests **NEVER** touch the dev database — PHPUnit forces its own in-memory DB.
- Before running e2e: seed the e2e file →
  `php artisan migrate --force && php artisan db:seed --force` against
  `database/e2e.sqlite`.

## Rules

- Schema changes **MUST** be a new migration in `database/migrations/` — editing
  an already-shipped migration is FORBIDDEN.
- Migrations **MUST** be reversible (`down()`) and run on both MySQL and SQLite
  (avoid vendor-only SQL).
- Test data **MUST** come from factories/seeders, **NEVER** hand-inserted rows.
- All DB access goes through Eloquent models; raw `DB::statement` is a last
  resort and **MUST** be justified in a comment.
