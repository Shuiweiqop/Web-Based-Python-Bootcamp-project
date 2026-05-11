import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { deflateSync } from 'node:zlib';
import { expectNoBrowserFailures, installBrowserFailureGuards } from './support/browser-failure-guards.js';

const adminEmail = 'reward-admin@example.com';
const adminPassword = 'password';
const runId = Date.now();

test.setTimeout(120_000);

const appPort = process.env.PLAYWRIGHT_APP_PORT || '8010';
const appUrl = `http://127.0.0.1:${appPort}`;
const e2eDatabase = path.resolve('database/e2e.sqlite');
const e2eEnv = {
  ...process.env,
  APP_ENV: 'testing',
  APP_DEBUG: 'true',
  APP_URL: appUrl,
  DB_CONNECTION: 'sqlite',
  DB_DATABASE: e2eDatabase,
  SESSION_DRIVER: 'file',
  CACHE_STORE: 'array',
  QUEUE_CONNECTION: 'sync',
  MAIL_MAILER: 'array',
};

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  const result = Buffer.alloc(4);
  result.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return result;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);

  return Buffer.concat([length, typeBuffer, data, crc32(Buffer.concat([typeBuffer, data]))]);
}

function makePng(width, height) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const stride = 1 + width * 4;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * stride;
    raw[rowStart] = 0;
    for (let x = 0; x < width; x += 1) {
      const offset = rowStart + 1 + x * 4;
      raw[offset] = 59;
      raw[offset + 1] = Math.round(130 + (x / width) * 80);
      raw[offset + 2] = Math.round(246 - (y / height) * 100);
      raw[offset + 3] = 255;
    }
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

const squarePng = makePng(256, 256);
const widePng = makePng(320, 180);

function artisan(args) {
  execFileSync('php', ['artisan', ...args], {
    cwd: process.cwd(),
    env: e2eEnv,
    stdio: 'inherit',
  });
}

test.beforeAll(() => {
  const databaseDir = path.dirname(e2eDatabase);
  if (!existsSync(databaseDir)) {
    mkdirSync(databaseDir, { recursive: true });
  }

  if (!existsSync(e2eDatabase)) {
    writeFileSync(e2eDatabase, '');
  }

  artisan(['migrate:fresh', '--force']);
  artisan([
    'tinker',
    '--execute',
    [
      "$user = App\\Models\\User::updateOrCreate(['email' => 'reward-admin@example.com'], [",
      "'name' => 'Reward Admin',",
      "'password' => Illuminate\\Support\\Facades\\Hash::make('password'),",
      "'role' => 'administrator',",
      "]);",
      "$user->forceFill(['email_verified_at' => now(), 'failed_login_attempts' => 0, 'locked_until' => null])->save();",
    ].join(' '),
  ]);
});

async function loginAsAdmin(page) {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill(adminEmail);
  await page.getByLabel('Password').fill(adminPassword);
  await page.getByRole('button', { name: /log in/i }).click();

  await expect(page).toHaveURL(/dashboard/);
}

async function uploadFirstFileInput(page, name, buffer = squarePng) {
  await page.locator('input[type="file"]').first().setInputFiles({
    name,
    mimeType: 'image/png',
    buffer,
  });
}

async function fillBaseRewardFields(page, rewardName, rewardType) {
  await page.locator('input[name="name"]').fill(rewardName);
  await page.locator('textarea[name="description"]').fill(`Created by Playwright smoke test for ${rewardType}.`);
  await page.locator('select[name="reward_type"]').selectOption(rewardType);
  await page.locator('select[name="rarity"]').selectOption('rare');
  await page.locator('input[name="point_cost"]').fill('25');
  await page.locator('input[name="stock_quantity"]').fill('10');
  await page.locator('input[name="max_owned"]').fill('1');
}

async function configureRewardType(page, rewardType) {
  if (rewardType === 'title') {
    await page.getByPlaceholder('e.g.: Python Master').fill('Smoke Champion');
    return;
  }

  if (rewardType === 'badge') {
    await uploadFirstFileInput(page, 'smoke-badge.png');
    await expect(page.getByText(/preview/i).first()).toBeVisible();
    return;
  }

  if (rewardType === 'avatar_frame') {
    await uploadFirstFileInput(page, 'smoke-avatar-frame.png');
    await expect(page.getByText(/preview/i).first()).toBeVisible();
    return;
  }

  if (rewardType === 'profile_background') {
    await uploadFirstFileInput(page, 'smoke-profile-background.png', widePng);
    await expect(page.getByRole('heading', { name: /crop image/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /apply crop/i })).toBeEnabled();
    await page.getByRole('button', { name: /apply crop/i }).click();
    await expect(page.getByRole('button', { name: /apply crop/i })).toBeHidden();
    await expect(page.getByRole('button', { name: /re-crop/i })).toBeVisible();
  }
}

async function createAndEditReward(page, rewardType) {
  const rewardName = `Smoke ${rewardType} ${runId}`;
  const editedRewardName = `${rewardName} Edited`;

  await page.goto('/admin/rewards/create');
  await expect(page.getByRole('heading', { name: /create new reward/i })).toBeVisible();

  await fillBaseRewardFields(page, rewardName, rewardType);
  await configureRewardType(page, rewardType);
  await page.getByRole('button', { name: /create reward/i }).click();

  await expect(page).toHaveURL(/\/admin\/rewards$/);
  await expect(page.getByText(rewardName)).toBeVisible();

  await page
    .locator('tr')
    .filter({ hasText: rewardName })
    .locator('a[href*="/admin/rewards/"][href$="/edit"]')
    .click();

  await expect(page.getByRole('heading', { name: /edit reward/i })).toBeVisible();
  await page.locator('input[name="name"]').fill(editedRewardName);
  await page.getByRole('button', { name: /save changes/i }).click();

  await expect(page).toHaveURL(/\/admin\/rewards$/);
  await expect(page.getByText(editedRewardName)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  installBrowserFailureGuards(page);
  await loginAsAdmin(page);
});

test.afterEach(async ({ page }) => {
  expectNoBrowserFailures(page);
});

for (const rewardType of ['badge', 'avatar_frame', 'profile_background', 'title', 'theme', 'effect']) {
  test(`admin can create and edit a ${rewardType} reward`, async ({ page }) => {
    await createAndEditReward(page, rewardType);
  });
}
