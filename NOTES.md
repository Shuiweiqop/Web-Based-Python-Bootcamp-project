# Project Notes

Working notes: pending work, gotchas, and setup reminders. Operating rules live
in [AGENTS.md](AGENTS.md); this file is the running scratchpad.

## Setup reminders (per clone / new environment)

- Enable the pre-push test gate: `git config core.hooksPath .githooks`
- Enable the PHP **gd** extension (uncomment `extension=gd` in `php.ini`) — the
  reward-image tests use `UploadedFile::fake()->image()` and error out without it.
  CI already has gd; this is a local-env gap only.
- Apply DB migrations: `php artisan migrate` (the leaderboard needs the
  `lifetime_points` column on `student_profiles`).
- Start the app: `composer run dev`.

## Gotchas

Durable operating gotchas now live in the AGENTS files, where they're read during
the matching task (pre-push≠CI → [AGENTS.md](AGENTS.md) + [.agents/testing.md](.agents/testing.md);
Ziggy full-reload and the desktop-nav allowlist → [.agents/frontend.md](.agents/frontend.md)).
This section is for fresh, still-loose observations before they graduate there.

- **Repo is Pint-clean as of the repo-wide pass.** Run `vendor/bin/pint` on
  touched PHP files before committing; it should produce no drive-by noise.

## Pending work (next steps)

- [ ] **#4 AI endpoint rate limiting** — the `ai-lessons` generation routes are
  not throttled, and Gemini calls have no cost guardrails. (`gemini.chat` and
  `code.execute` already have `throttle`.) Good next task: small, security/cost.
- [ ] **Leaderboard fairness follow-up** — ranking now uses `lifetime_points`,
  backfilled to current balance. A more accurate historical backfill (from
  points-awarded history) could be done if needed.
- [ ] **Retention / learning-outcomes analytics dashboard** — large feature,
  scope TBD (active-students trend, at-risk students, hardest lessons/questions,
  placement→now improvement).
- [ ] **Drop the dead `openai-php/client` dependency + fix misleading copy** —
  AI generation actually calls the Gemini REST API directly
  ([AILessonGeneratorService.php](app/Services/AILessonGeneratorService.php), `Http::post` to
  `generativelanguage.googleapis.com`); nothing in `app/` uses the OpenAI client. Remove it
  from `composer.json`, and fix the two "OpenAI API" strings in
  [AILessonController::testConnection](app/Http/Controllers/AILessonController.php) that talk
  about OpenAI while connecting to Gemini. Small, safe cleanup (continues the #7 unused-dep line).
## Deploy for interview demo (goal: a live URL an interviewer can click and try)

The app is feature-complete and green in CI, but has never been deployed. Target here is a
**public demo**, not production ops — so backups / monitoring / GDPR are deliberately out of
scope. Do these top-to-bottom; the first three are the ones that actually make or break a demo.

**Recommended free stack:** **Render** — already used on other projects here, so no new
platform to learn, and "deployed on Render" is a clean interview answer. This app needs a
*long-running* PHP process + a background worker, which the static/serverless free tiers
(Vercel, Netlify, Cloudflare Pages, GitHub Pages) can't host — Render's web service can.
Secrets go in Render's env-vars UI. AI stays on your own Gemini + Judge0 keys.

> ⚠️ **Two Render free-tier facts to plan around:**
> 1. The free web service **sleeps when idle** (~30–60s cold start) — hit the URL a minute
>    before you demo so it's warm.
> 2. Render's free managed DB is **Postgres, not MySQL.** This app is MySQL locally. Two ways
>    out — see the DB task below.
>
> Alternatives if Render doesn't fit: **Railway** (web+worker+MySQL in one project, but a
> $5/mo usage credit, not always-free) · **Fly.io** (3 free VMs, no sleep, needs `fly.toml`) ·
> **Oracle Cloud Always Free** (a real 4-core/24GB VM, permanent, but you configure the whole
> box yourself).

### Must do (a demo fails without these)

- [ ] **Deploy to Render** (a web service + a worker; `git push` deploy). The build must run
  `npm run build`, then `php artisan migrate --force` and seed the demo data. Serve over
  Render's HTTPS URL, never a raw `localhost`.
- [ ] **Sort out the database** — Render's free DB is Postgres. Pick one:
  - **Keep MySQL (lowest risk):** point at **PlanetScale** (MySQL-compatible free tier), leave
    `DB_CONNECTION=mysql`, no migration changes — matches local exactly.
  - **Go Postgres:** switch `DB_CONNECTION=pgsql` to Render Postgres or **Neon** (free, auto-wakes),
    then **actually run the migrations against Postgres to confirm they pass** — this is exactly
    the "migrations run on more than MySQL" rule in `.agents/database.md`. Likely fine, but verify.
- [ ] **Production `.env` in Render's env-vars UI, never in the repo.** Set `APP_ENV=production`,
  `APP_DEBUG=false`, and a fresh `APP_KEY` (`php artisan key:generate`). *Interview stakes:* a
  key visible in the repo is an instant red flag to a technical interviewer — this is scoring,
  not just hygiene. (Overkill for a solo demo, but if asked about secrets management: Doppler /
  Infisical both have free tiers ≤5 users.)
- [ ] **Working AI keys for the demo.** The live Gemini + Judge0 keys must have quota, or the
  "generate a lesson" / "run code" demo dies mid-pitch. Confirm both call paths work on the
  deployed URL, not just locally.
- [ ] **Throttle the AI routes before the URL is public** (NOTES #4). Without it, one person
  (or a bot) can burn your Gemini quota and kill the demo for everyone. Small change, big payoff.

### Should do (makes the demo smooth / credible)

- [ ] **Seed 2–3 known demo accounts** (one `administrator`, one `student`) with predictable
  passwords you can type on stage — don't fumble login during an interview.
- [ ] **A real transactional mailer** *(only if you'll demo signup/verification email).*
  Mailtrap is a sandbox — its mail never reaches a real inbox. Free options that actually
  deliver: **Resend** (3,000/mo, 100/day — cleanest Laravel fit) or **Brevo** (300/day).
  Skip entirely if the demo won't show an email flow.
- [ ] **Handle the one background job** (`UpdateStudentPathProgress`). Best: a Render
  background worker running `php artisan queue:work` (`database` driver, no Redis). If the free
  tier won't run a always-on worker, the demo-grade fallback is `QUEUE_CONNECTION=sync` so the
  job just runs inline on the request — fine at demo scale, skip the worker entirely.
- [ ] **Clean up before the code gets read** — drop the dead `openai-php/client` dep + fix the
  "OpenAI" copy (see pending work above); the README testing snapshot (§10) is stale now that
  local tests pass. An interviewer often reads the repo, not just the site.

### Not needed for an interview demo (skip on purpose)

DB backups, error monitoring (Sentry), branch protection, privacy policy, high-availability
queue. These matter for real users, not a demo — adding them now is over-engineering the pitch.

## Done this session (for context)

AGENTS.md system + `.agents/*` rules + `.claude/commands` macros + `.githooks`
pre-push gate; repo-wide Pint pass; frontend test setup + samples; dead-code
`json_decode` cleanup; magic values → config; code-execution hardening (#5);
defense-logging consistency (#6); unused-dep removal (#7); student leaderboard +
lifetime XP + level tiers; local SVG avatars (replaced external dicebear, fixed
CI e2e + privacy).
