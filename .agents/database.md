# database.md — schema & the three DB environments

You're here for migrations, schema, and connection concerns (`database/`).
Root law: [../AGENTS.md](../AGENTS.md). A schema change almost always pairs with a
backend change — read [backend.md](backend.md) too.

## Three databases, and which one you're actually hitting

Confusing these is the classic way to "lose" data or debug a phantom failure:

| When | Connection | Set in |
| --- | --- | --- |
| Local dev | MySQL (or whatever this dev's `.env` says) | `.env` |
| `composer test` / PHPUnit | SQLite `:memory:`, queue `sync` | [../phpunit.xml](../phpunit.xml) |
| Playwright e2e | file `database/e2e.sqlite`, app on port 8010 | [../playwright.config.js](../playwright.config.js) |

The test suites **never** touch the dev DB — PHPUnit forces its own in-memory database, so a
test run can't corrupt your local data. Before running e2e, seed its DB:
`DB_CONNECTION=sqlite DB_DATABASE=database/e2e.sqlite php artisan migrate --force && ... db:seed --force`
(this is exactly what CI does).

## Migration rules, and the reason for each

- **A shipped migration is frozen — add a new migration, never edit the old one.** Someone
  else has already run it; editing it means their DB and yours silently diverge. A new
  migration re-runs everywhere.
- **Migrations must run on both MySQL and SQLite** (dev is MySQL, both test suites are SQLite).
  Use the schema builder, not vendor-specific SQL, or CI's SQLite step goes red. Give every
  migration a real `down()`.
- **Primary keys are custom `{entity}_id`, not `id`.** When you add a table or a foreign key,
  match the existing model's `protected $primaryKey` — assuming `id` will break the relation.
- Access data through Eloquent. A raw `DB::statement` is a last resort and needs a comment
  saying why the query builder couldn't do it (usually: it could).

## When you're done

Run the migration against SQLite (in the test env) and confirm `composer test` is green — that
proves it works on the connection CI uses. Full checklist: [testing.md](testing.md).
