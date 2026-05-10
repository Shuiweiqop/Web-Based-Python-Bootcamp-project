import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const adminEmail = 'reward-admin@example.com';
const adminPassword = 'password';
const rewardName = `Smoke Title ${Date.now()}`;

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

test('admin can create and edit a title reward', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill(adminEmail);
  await page.getByLabel('Password').fill(adminPassword);
  await page.getByRole('button', { name: /log in/i }).click();

  await expect(page).toHaveURL(/dashboard/);

  await page.goto('/admin/rewards/create');
  await expect(page.getByRole('heading', { name: /create new reward/i })).toBeVisible();

  await page.locator('input[name="name"]').fill(rewardName);
  await page.locator('textarea[name="description"]').fill('Created by Playwright smoke test.');
  await page.locator('select[name="reward_type"]').selectOption('title');
  await page.locator('select[name="rarity"]').selectOption('rare');
  await page.locator('input[name="point_cost"]').fill('25');
  await page.locator('input[name="stock_quantity"]').fill('10');
  await page.locator('input[name="max_owned"]').fill('1');
  await page.getByPlaceholder('e.g.: Python Master').fill('Smoke Champion');
  await page.getByRole('button', { name: /create reward/i }).click();

  await expect(page).toHaveURL(/\/admin\/rewards$/);
  await expect(page.getByText(rewardName)).toBeVisible();

  const editLink = page.locator(`a[href*="/admin/rewards/"][href$="/edit"]`).first();
  await editLink.click();

  await expect(page.getByRole('heading', { name: /edit reward/i })).toBeVisible();
  await page.locator('input[name="name"]').fill(`${rewardName} Edited`);
  await page.getByRole('button', { name: /save changes/i }).click();

  await expect(page).toHaveURL(/\/admin\/rewards$/);
  await expect(page.getByText(`${rewardName} Edited`)).toBeVisible();
});
