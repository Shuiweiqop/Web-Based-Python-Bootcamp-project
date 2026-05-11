import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expectNoBrowserFailures, installBrowserFailureGuards } from './support/browser-failure-guards.js';

const adminEmail = 'admin-mgmt@example.com';
const adminPassword = 'password';

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

function artisan(args) {
  execFileSync('php', ['artisan', ...args], {
    cwd: process.cwd(),
    env: e2eEnv,
    stdio: 'inherit',
  });
}

test.beforeAll(() => {
  const databaseDir = path.dirname(e2eDatabase);
  if (!existsSync(databaseDir)) mkdirSync(databaseDir, { recursive: true });
  if (!existsSync(e2eDatabase)) writeFileSync(e2eDatabase, '');

  artisan(['migrate:fresh', '--force']);

  artisan([
    'tinker', '--execute',
    [
      "$admin = App\\Models\\User::updateOrCreate(['email' => 'admin-mgmt@example.com'], [",
      "'name' => 'Admin Mgmt',",
      "'password' => Illuminate\\Support\\Facades\\Hash::make('password'),",
      "'role' => 'administrator',",
      "]);",
      "$admin->forceFill(['email_verified_at' => now(), 'failed_login_attempts' => 0, 'locked_until' => null])->save();",
    ].join(' '),
  ]);

  artisan([
    'tinker', '--execute',
    [
      "$student = App\\Models\\User::updateOrCreate(['email' => 'student-smoke@example.com'], [",
      "'name' => 'Smoke Student',",
      "'password' => Illuminate\\Support\\Facades\\Hash::make('password'),",
      "'role' => 'student',",
      "]);",
      "$student->forceFill(['email_verified_at' => now(), 'failed_login_attempts' => 0, 'locked_until' => null])->save();",
      "App\\Models\\StudentProfile::firstOrCreate(['user_Id' => \$student->user_Id], ['current_points' => 0]);",
    ].join(' '),
  ]);

  artisan([
    'tinker', '--execute',
    [
      "$admin = App\\Models\\User::where('email', 'admin-mgmt@example.com')->firstOrFail();",
      "App\\Models\\LearningPath::updateOrCreate(['title' => 'Smoke Seed Path'], [",
      "'description' => 'Seed path for management smoke tests.',",
      "'learning_outcomes' => 'Understand basic concepts.',",
      "'prerequisites' => 'None.',",
      "'difficulty_level' => 'beginner',",
      "'estimated_duration_hours' => 10,",
      "'is_active' => true,",
      "'created_by' => \$admin->user_Id,",
      "]);",
    ].join(' '),
  ]);

  artisan([
    'tinker', '--execute',
    [
      "$admin = App\\Models\\User::where('email', 'admin-mgmt@example.com')->firstOrFail();",
      "App\\Models\\Lesson::updateOrCreate(['title' => 'Smoke Seed Lesson'], [",
      "'content' => 'Seed lesson content.',",
      "'content_type' => 'markdown',",
      "'difficulty' => 'beginner',",
      "'estimated_duration' => 20,",
      "'status' => 'active',",
      "'completion_reward_points' => 50,",
      "'required_exercises' => 0,",
      "'required_tests' => 0,",
      "'min_exercise_score_percent' => 70,",
      "'created_by' => \$admin->user_Id,",
      "]);",
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

test.beforeEach(async ({ page }) => {
  installBrowserFailureGuards(page);
  await loginAsAdmin(page);
});

test.afterEach(async ({ page }) => {
  expectNoBrowserFailures(page);
});

test('admin can view the students index', async ({ page }) => {
  await page.goto('/admin/students');
  await expect(page.getByText('Smoke Student')).toBeVisible();
});

test('admin can view a student profile', async ({ page }) => {
  await page.goto('/admin/students');
  // The show link is an icon-only button with title="View Details"
  await page.getByTitle('View Details').first().click();
  await expect(page).toHaveURL(/\/admin\/students\/\d+/);
  await expect(page.getByText('Smoke Student').first()).toBeVisible();
});

test('admin can assign a learning path to a student', async ({ page }) => {
  await page.goto('/admin/student-paths/create');
  await expect(page.getByRole('heading', { name: /assign learning path/i })).toBeVisible();

  // Option text is rendered as "Name (email)" and "Title (difficulty)"
  await page.locator('select').first().selectOption({ label: 'Smoke Student (student-smoke@example.com)' });
  await page.locator('select').nth(1).selectOption({ label: 'Smoke Seed Path (beginner)' });
  await page.getByRole('button', { name: /assign path/i }).click();

  await expect(page).toHaveURL(/\/admin\/student-paths\/\d+$/);
  await expect(page.getByText(/Smoke Student/)).toBeVisible();
  await expect(page.getByText(/Smoke Seed Path/)).toBeVisible();
});

test('admin can edit a student path assignment', async ({ page }) => {
  await page.goto('/admin/student-paths');
  await page.getByRole('link', { name: /view details/i }).first().click();
  await expect(page).toHaveURL(/\/admin\/student-paths\/\d+$/);

  await page.getByRole('link', { name: /edit settings/i }).click();
  await expect(page.getByRole('heading', { name: /edit assignment/i })).toBeVisible();

  await page.getByRole('button', { name: /^paused$/i }).click();
  await page.getByRole('button', { name: /save changes/i }).click();

  await expect(page).toHaveURL(/\/admin\/student-paths\/\d+$/);
  await expect(page.getByText(/paused/i)).toBeVisible();
});

test('admin can view daily challenge definitions', async ({ page }) => {
  await page.goto('/admin/daily-challenges');
  await expect(page.getByRole('heading', { name: /mission configuration/i })).toBeVisible();
  // Definitions are seeded by migration — verify at least one form renders
  await expect(page.getByRole('button', { name: /save mission/i }).first()).toBeVisible();
});

test('admin can view the progress index', async ({ page }) => {
  await page.goto('/admin/progress');
  await expect(page.getByRole('heading', { name: /progress analytics/i })).toBeVisible();
});

test('admin can view the AI logs index', async ({ page }) => {
  await page.goto('/admin/ai-logs');
  await expect(page.getByText(/AI Chat Logs/i)).toBeVisible();
});

test('admin can manage lessons in a learning path', async ({ page }) => {
  await page.goto('/admin/learning-paths');
  // Path title is in an h3, not a link; action links say "View" (icon + text)
  await page.getByRole('link', { name: /^view$/i }).first().click();
  await expect(page).toHaveURL(/\/admin\/learning-paths\/\d+$/);

  await page.getByRole('link', { name: /manage lessons/i }).first().click();
  await expect(page).toHaveURL(/\/admin\/learning-paths\/\d+\/lessons$/);
  await expect(page.getByRole('heading', { name: /manage lessons/i })).toBeVisible();

  await page.getByRole('button', { name: /^add lesson$/i }).first().click();
  await expect(page.getByText(/add lesson to path/i)).toBeVisible();

  await page.getByRole('combobox').last().selectOption({ label: 'Smoke Seed Lesson (beginner)' });
  await page.getByRole('button', { name: /^add lesson$/i }).last().click();

  await expect(page.getByText('Smoke Seed Lesson')).toBeVisible();
});
