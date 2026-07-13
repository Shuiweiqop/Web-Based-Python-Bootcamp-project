#!/usr/bin/env bash
# Runtime setup for the containerized app (called on each deploy/boot by the Dockerfile CMD).
# Dependencies + Vite assets are already baked into the image at build time, so this script
# only does the things that need the live environment + the persistent disk:
#   create the SQLite file, run migrations, seed once, cache config.
set -o errexit

# SQLite database on the Render persistent disk.
# DB_DATABASE must point at the mounted disk (e.g. /var/data/database.sqlite) so data
# survives redeploys. Create it on first boot; keep it afterwards.
if [ -n "$DB_DATABASE" ] && [ ! -f "$DB_DATABASE" ]; then
  echo "Creating SQLite database at $DB_DATABASE"
  mkdir -p "$(dirname "$DB_DATABASE")"
  touch "$DB_DATABASE"
fi

# Schema (idempotent — only new migrations run).
php artisan migrate --force

# Seed demo data once. A marker on the persistent disk stops redeploys from
# re-seeding and clobbering data an interviewer may have created live.
if [ -n "$DB_DATABASE" ]; then
  SEED_MARKER="$(dirname "$DB_DATABASE")/.seeded"
  if [ ! -f "$SEED_MARKER" ]; then
    echo "First boot — seeding demo data"
    php artisan db:seed --force
    touch "$SEED_MARKER"
  fi
fi

# Production caches (rebuilt each boot).
php artisan storage:link || true
php artisan config:cache
php artisan route:cache
php artisan view:cache
