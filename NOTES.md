# Project Notes

Working notes: pending work, gotchas, and setup reminders. Operating rules live
in [AGENTS.md](AGENTS.md); this file is the running scratchpad.

## Setup reminders (per clone / new environment)

- Enable the pre-push test gate: `git config core.hooksPath .githooks`
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
## Before go-live (not yet live — deferred until deployment)

Not blocking now; these only matter once the app is deployed.

- [ ] **Fresh production secrets** — the current keys in local `.env` (`GEMINI_API_KEY`,
  `JUDGE0_API_KEY`, Mailtrap `MAIL_*`) are dev/test-tier. Provision real production keys, keep
  `.env` out of the repo (already gitignored), and set `APP_DEBUG=false` + a real `APP_KEY`.
- [ ] **Turn on `main` branch protection** — the "never push red code" rule assumes CI gates
  merges. Enable required status checks in GitHub → Settings → Branches
  (remote: `Shuiweiqop/Web-Based-Python-Bootcamp-project`). Local pre-push hook is bypassable.
- [ ] **Decide the production queue driver** — locally `QUEUE_CONNECTION=database` (one job:
  `UpdateStudentPathProgress`), which is fine for a demo. Redis is wired in `.env` but unused
  by app code; pick a driver when real load is expected.

## Done this session (for context)

AGENTS.md system + `.agents/*` rules + `.claude/commands` macros + `.githooks`
pre-push gate; repo-wide Pint pass; frontend test setup + samples; dead-code
`json_decode` cleanup; magic values → config; code-execution hardening (#5);
defense-logging consistency (#6); unused-dep removal (#7); student leaderboard +
lifetime XP + level tiers; local SVG avatars (replaced external dicebear, fixed
CI e2e + privacy).
