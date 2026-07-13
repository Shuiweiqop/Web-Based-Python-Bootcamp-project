#!/usr/bin/env bash
# Render build script — Laravel + Vite, SQLite on a persistent disk.
# Set this as the Render "Build Command": ./render-build.sh
set -o errexit  # fail the build on any error

# 1. PHP + JS deps (no dev deps in production; build the frontend assets)
composer install --no-dev --optimize-autoloader --no-interaction
npm ci
npm run build

# 2. SQLite database on the Render persistent disk.
#    DB_DATABASE must point at a path on the mounted disk (e.g. /var/data/database.sqlite)
#    so data survives redeploys. Create the file on first deploy; keep it afterwards.
if [ -n "$DB_DATABASE" ] && [ ! -f "$DB_DATABASE" ]; then
  echo "Creating SQLite database at $DB_DATABASE"
  mkdir -p "$(dirname "$DB_DATABASE")"
  touch "$DB_DATABASE"
fi

# 3. Schema + first-run demo data.
#    migrate --force is idempotent (only runs new migrations).
php artisan migrate --force
#    Seed only once — guard with a marker file on the persistent disk so redeploys
#    don't re-seed and clobber data an interviewer may have created live.
SEED_MARKER="$(dirname "$DB_DATABASE")/.seeded"
if [ ! -f "$SEED_MARKER" ]; then
  echo "First deploy — seeding demo data"
  php artisan db:seed --force
  touch "$SEED_MARKER"
fi

# 4. Laravel production caches (rebuilt each deploy).
php artisan storage:link || true
php artisan config:cache
php artisan route:cache
php artisan view:cache
