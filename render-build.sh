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

# Rebuild the schema from scratch and seed. On Render's free tier the SQLite file lives on
# the ephemeral filesystem, so each boot starts fresh anyway — migrate:fresh guarantees a
# clean, consistent schema (avoids "table already exists" if a previous boot left the file
# half-initialized) and then seeds the full demo dataset.
#
# WARNING: migrate:fresh DROPS ALL TABLES. That's intended here (ephemeral demo DB). If you
# ever move to a persistent disk with real data, switch this back to `migrate --force` and
# guard the seed.
php artisan migrate:fresh --force --seed

# Production caches (rebuilt each boot).
php artisan storage:link || true
php artisan config:cache
php artisan route:cache
php artisan view:cache
