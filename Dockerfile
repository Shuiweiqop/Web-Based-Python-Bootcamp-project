# Laravel 12 + Vite + SQLite — image for Render (or any Docker host).
# Two stages: build the frontend assets with Node, then run on PHP.

# ---------- Stage 1: build Vite assets ----------
FROM node:22-alpine AS assets
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build          # outputs to public/build

# ---------- Stage 2: PHP runtime ----------
FROM php:8.2-cli-alpine

# System libs + PHP extensions (mirrors the CI extension list).
RUN apk add --no-cache \
        bash git libzip-dev libpng-dev freetype-dev libjpeg-turbo-dev icu-dev oniguruma-dev sqlite-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" gd zip pdo_sqlite mbstring \
    && rm -rf /var/cache/apk/*

# Composer (copied from the official image).
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Install PHP deps first (better layer caching), without running artisan scripts
# that need a full app/.env present yet.
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# App source, plus the already-built assets from stage 1.
COPY . .
COPY --from=assets /app/public/build ./public/build

RUN composer dump-autoload --optimize \
    && chmod +x render-build.sh

# Render provides $PORT at runtime. Migrations/seed/caches run in render-build.sh
# on each boot (SQLite lives on the ephemeral filesystem on the free tier).
CMD ["sh", "-c", "./render-build.sh && php artisan serve --host 0.0.0.0 --port ${PORT:-8000}"]
