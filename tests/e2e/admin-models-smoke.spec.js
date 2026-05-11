import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expectNoBrowserFailures, installBrowserFailureGuards } from './support/browser-failure-guards.js';

const adminEmail = 'admin-models@example.com';
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

function artisan(args) {
  execFileSync('php', ['artisan', ...args], {
    cwd: process.cwd(),
    env: e2eEnv,
    stdio: 'inherit',
  });
}

function currentResourceUrl(page) {
  return page.url().replace(/[?#].*$/, '').replace(/\/$/, '');
}

async function loginAsAdmin(page) {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill(adminEmail);
  await page.getByLabel('Password').fill(adminPassword);
  await page.getByRole('button', { name: /log in/i }).click();

  await expect(page).toHaveURL(/dashboard/);
}

async function createSeedLesson() {
  artisan([
    'tinker',
    '--execute',
    [
      "$admin = App\\Models\\User::where('email', 'admin-models@example.com')->firstOrFail();",
      "App\\Models\\Lesson::updateOrCreate(['title' => 'Smoke Seed Lesson'], [",
      "'content' => 'Seed lesson for admin browser smoke tests.',",
      "'content_type' => 'markdown',",
      "'difficulty' => 'beginner',",
      "'estimated_duration' => 20,",
      "'status' => 'draft',",
      "'completion_reward_points' => 50,",
      "'required_exercises' => 0,",
      "'required_tests' => 0,",
      "'min_exercise_score_percent' => 70,",
      "'created_by' => $admin->user_Id,",
      "]);",
    ].join(' '),
  ]);
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
      "$user = App\\Models\\User::updateOrCreate(['email' => 'admin-models@example.com'], [",
      "'name' => 'Admin Models Smoke',",
      "'password' => Illuminate\\Support\\Facades\\Hash::make('password'),",
      "'role' => 'administrator',",
      "]);",
      "$user->forceFill(['email_verified_at' => now(), 'failed_login_attempts' => 0, 'locked_until' => null])->save();",
    ].join(' '),
  ]);
  createSeedLesson();
});

test.beforeEach(async ({ page }) => {
  installBrowserFailureGuards(page);

  await loginAsAdmin(page);
});

test.afterEach(async ({ page }) => {
  expectNoBrowserFailures(page);
});

test('admin can create and edit a lesson', async ({ page }) => {
  const lessonName = `Smoke Lesson ${runId}`;
  const editedLessonName = `${lessonName} Edited`;

  await page.goto('/admin/lessons/create');
  await expect(page.getByRole('heading', { name: /create new lesson/i })).toBeVisible();

  await page.getByPlaceholder('e.g., Introduction to Python Programming').fill(lessonName);
  await page.locator('textarea[required]').fill('# Smoke lesson\n\nCreated by Playwright.');
  await page.getByRole('button', { name: /02\. Structure & Publishing/i }).click();
  await page.getByRole('button', { name: /^create lesson$/i }).click();

  await expect(page).toHaveURL(/\/admin\/lessons\/\d+$/);
  await expect(page.getByText(lessonName)).toBeVisible();

  await page.goto(`${currentResourceUrl(page)}/edit`);
  await expect(page.getByRole('heading', { name: /edit lesson/i })).toBeVisible();
  await page.getByPlaceholder('e.g., Python Loops and Iteration').fill(editedLessonName);
  await page.getByRole('button', { name: /continue to step 2/i }).click();
  await page.getByRole('button', { name: /save changes/i }).click();

  await expect(page).toHaveURL(/\/admin\/lessons\/\d+$/);
  await expect(page.getByText(editedLessonName)).toBeVisible();
});

test('admin can create and edit an exercise', async ({ page }) => {
  const exerciseName = `Smoke Exercise ${runId}`;
  const editedExerciseName = `${exerciseName} Edited`;

  await page.goto('/admin/exercises/create');
  await expect(page.getByRole('heading', { name: /create new exercise/i })).toBeVisible();

  await page.locator('select').first().selectOption({ index: 1 });
  await page.getByPlaceholder('e.g., Python Variables Practice').fill(exerciseName);
  await page.getByPlaceholder(/Describe what students will learn/i).fill('Created by Playwright smoke test.');
  await page.getByRole('button', { name: /^create exercise$/i }).click();

  await expect(page).toHaveURL(/\/admin\/exercises$/);
  await expect(page.getByText(exerciseName)).toBeVisible();

  await page
    .locator('tr')
    .filter({ hasText: exerciseName })
    .locator('a[href*="/admin/exercises/"][href$="/edit"]')
    .click();

  await expect(page.getByRole('heading', { name: /edit exercise/i })).toBeVisible();
  await page.getByPlaceholder('e.g., Python Variables Practice').fill(editedExerciseName);
  await page.getByRole('button', { name: /save changes/i }).click();

  await expect(page).toHaveURL(/\/admin\/exercises\/\d+$/);
  await expect(page.getByText(editedExerciseName)).toBeVisible();
});

test('admin can create and edit a lesson test', async ({ page }) => {
  const testName = `Smoke Lesson Test ${runId}`;
  const editedTestName = `${testName} Edited`;

  await page.goto('/admin/lessons/1/tests/create');
  await expect(page.getByRole('heading', { name: /create test for:/i })).toBeVisible();

  await page.getByPlaceholder(/Python Basics Quiz/i).fill(testName);
  await page.getByPlaceholder(/Brief description/i).fill('Created by Playwright smoke test.');
  await page.getByPlaceholder(/Instructions for students/i).fill('Answer the questions carefully.');
  await page.getByRole('button', { name: /^create test$/i }).click();

  await expect(page).toHaveURL(/\/admin\/lessons\/\d+\/tests\/\d+$/);
  await expect(page.getByText(testName)).toBeVisible();

  await page.goto(`${currentResourceUrl(page)}/edit`);
  await expect(page.getByRole('heading', { name: /edit test/i })).toBeVisible();
  await page.getByPlaceholder(/Python Basics Quiz/i).fill(editedTestName);
  await page.getByRole('button', { name: /save changes/i }).click();

  await expect(page).toHaveURL(/\/admin\/lessons\/\d+\/tests\/\d+$/);
  await expect(page.getByText(editedTestName)).toBeVisible();
});

test('admin can create and edit a placement test', async ({ page }) => {
  const placementName = `Smoke Placement Test ${runId}`;
  const editedPlacementName = `${placementName} Edited`;

  await page.goto('/admin/placement-tests/create');
  await expect(page.getByRole('heading', { name: /create placement test/i })).toBeVisible();

  await page.getByPlaceholder('e.g., Python Skill Assessment').fill(placementName);
  await page.getByPlaceholder('Brief description of the test').fill('Created by Playwright smoke test.');
  await page.getByPlaceholder(/Instructions that students/i).fill('Complete this placement test.');
  await page.getByRole('button', { name: /^create test$/i }).click();

  await expect(page).toHaveURL(/\/admin\/placement-tests\/\d+$/);
  await expect(page.getByText(placementName)).toBeVisible();

  await page.goto(`${currentResourceUrl(page)}/edit`);
  await expect(page.getByRole('heading', { name: /edit placement test/i })).toBeVisible();
  await page.getByPlaceholder('e.g., Python Skill Assessment').fill(editedPlacementName);
  await page.getByRole('button', { name: /save changes/i }).click();

  await expect(page).toHaveURL(/\/admin\/placement-tests\/\d+$/);
  await expect(page.getByText(editedPlacementName)).toBeVisible();
});

test('admin can create and edit a learning path', async ({ page }) => {
  const pathName = `Smoke Learning Path ${runId}`;
  const editedPathName = `${pathName} Edited`;

  await page.goto('/admin/learning-paths/create');
  await expect(page.getByRole('heading', { name: /create new learning path/i })).toBeVisible();

  await page.getByPlaceholder('e.g., Python for Beginners').fill(pathName);
  await page.getByPlaceholder(/Brief description of what students/i).fill('Created by Playwright smoke test.');
  await page.getByPlaceholder(/What will students be able to do/i).fill('Build and debug small Python programs.');
  await page.getByPlaceholder(/What should students know/i).fill('Basic computer literacy.');
  await page.getByPlaceholder('e.g., 40').fill('12');
  await page.getByRole('button', { name: /^create learning path$/i }).click();

  await expect(page).toHaveURL(/\/admin\/learning-paths\/\d+$/);
  await expect(page.getByText(pathName)).toBeVisible();

  await page.goto(`${currentResourceUrl(page)}/edit`);
  await expect(page.getByRole('heading', { name: /edit learning path/i })).toBeVisible();
  await page.getByPlaceholder('e.g., Python for Beginners').fill(editedPathName);
  await page.getByRole('button', { name: /save changes/i }).click();

  await expect(page).toHaveURL(/\/admin\/learning-paths\/\d+$/);
  await expect(page.getByText(editedPathName)).toBeVisible();
});
