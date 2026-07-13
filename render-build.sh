#!/usr/bin/env bash
# Runtime setup for the containerized app (called on each deploy/boot by the Dockerfile CMD).
# Dependencies + Vite assets are baked into the image at build time, so this only does the
# things that need the live environment: create the SQLite file, migrate, seed, cache config.
#
# NOTE: Render's free tier has no persistent disk, so the SQLite file lives on the container's
# ephemeral filesystem and resets on every redeploy/restart. That's fine for a demo — each boot
# re-seeds a clean, predictable dataset. If you later add a persistent disk (paid), point
# DB_DATABASE at its mount path and the same script keeps the data instead.
set -o errexit

# SQLite database file. Defaults to a path inside the app if DB_DATABASE is unset.
DB_FILE="${DB_DATABASE:-/app/database/database.sqlite}"
if [ ! -f "$DB_FILE" ]; then
  echo "Creating SQLite database at $DB_FILE"
  mkdir -p "$(dirname "$DB_FILE")"
  touch "$DB_FILE"
fi

# Schema (idempotent — only new migrations run).
php artisan migrate --force

# Seed demo data. If the DB is fresh (no users yet), seed it. This is safe to run every boot:
# on an ephemeral filesystem the DB is new each time, so demo data is always present; on a
# persistent disk the guard skips re-seeding so live data is kept.
if [ "$(php artisan tinker --execute='echo \App\Models\User::count();' 2>/dev/null | tail -n1)" = "0" ]; then
  echo "Empty database — seeding demo data"
  php artisan db:seed --force
fi

# Production caches (rebuilt each boot).
php artisan storage:link || true
php artisan config:cache
php artisan route:cache
php artisan view:cache
