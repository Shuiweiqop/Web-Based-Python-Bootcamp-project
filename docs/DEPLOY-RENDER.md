# Deploy to Render (interview demo)

A public HTTPS URL for the app, free tier, **SQLite on a persistent disk** — no external
database service to sign up for, zero migration changes (all 62 migrations + the seeder are
verified to run on a real sqlite file locally).

> Why SQLite and not MySQL/Postgres: PlanetScale dropped its free MySQL tier, and moving to
> Postgres would mean rewriting the MySQL-only raw SQL in a few migrations (`MODIFY COLUMN
> ENUM`, `ENGINE=InnoDB`). SQLite needs none of that and is plenty for a demo. Trade-off: not
> for real concurrent load — fine for an interview, not for production.

## 1. Create the Web Service

1. [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service** → connect
   the GitHub repo.
2. Settings:
   - **Language:** `PHP` (native — no Docker needed)
   - **Build Command:** `./render-build.sh`
   - **Start Command:** `php artisan serve --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free

## 2. Add a Persistent Disk (this is what keeps your data)

Render's free filesystem is wiped on every deploy/restart, so the SQLite file must live on a
mounted disk.

- In the service → **Disks** → **Add Disk**
  - **Name:** `data`
  - **Mount Path:** `/var/data`
  - **Size:** 1 GB (smallest; more than enough)

## 3. Environment variables (Environment tab)

Secrets go here, **never in the repo** — a key visible in the repo is an instant red flag in a
technical interview.

```
APP_NAME=CodeLearn
APP_ENV=production
APP_DEBUG=false
APP_KEY=                 # generate locally: php artisan key:generate --show  → paste the base64: value
APP_URL=https://YOUR-SERVICE.onrender.com

DB_CONNECTION=sqlite
DB_DATABASE=/var/data/database.sqlite   # MUST be on the mounted disk from step 2

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=sync    # runs the one job (UpdateStudentPathProgress) inline — no separate worker

LOG_CHANNEL=stderr       # Render captures stdout/stderr as logs

GEMINI_API_KEY=          # your key — confirm it still has quota
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=          # your key
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
JUDGE0_LANGUAGE_ID=71
```

## 4. Deploy

Push to `main` (or click **Manual Deploy**). The build script (`render-build.sh`) will:
install deps → `npm run build` → create the SQLite file on the disk if missing → `migrate
--force` → seed demo data **once** (guarded by a `.seeded` marker so redeploys don't wipe live
data) → cache config/routes/views.

## 5. After the first deploy

- Open `https://YOUR-SERVICE.onrender.com` and log in with a seeded account.
- Test the two AI paths on the live URL: **generate an AI lesson** (admin) and **run code** in
  an exercise — these hit Gemini + Judge0, so confirm the keys work in production, not just
  locally.

## Gotchas

- **Free instance sleeps when idle** (~30–60s cold start). Hit the URL a minute before you demo
  so it's warm.
- **Re-seeding:** to reset demo data, delete `/var/data/.seeded` (and the sqlite file) via the
  Render **Shell**, then redeploy.
- **AI routes are throttled** (generate 10/min, test-connection 6/min) — normal during a demo,
  but don't be surprised by a 429 if you mash the button.
