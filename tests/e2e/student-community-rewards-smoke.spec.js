import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expectNoBrowserFailures, installBrowserFailureGuards } from './support/browser-failure-guards.js';

const studentEmail = 'student-community-smoke@example.com';
const studentPassword = 'password';

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

function tinker(statements) {
  artisan(['tinker', '--execute', statements.join(' ')]);
}

async function postFromPage(page, url, data = {}) {
  return await page.evaluate(async ({ url, data }) => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'X-CSRF-TOKEN': token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return {
      ok: response.ok,
      status: response.status,
      text: await response.text(),
    };
  }, { url, data });
}

async function loginAsStudent(page) {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill(studentEmail);
  await page.getByLabel('Password').fill(studentPassword);
  await page.getByRole('button', { name: /log in/i }).click();
  await expect(page).toHaveURL(/dashboard|student\/onboarding/);
}

test.beforeAll(() => {
  const databaseDir = path.dirname(e2eDatabase);
  if (!existsSync(databaseDir)) mkdirSync(databaseDir, { recursive: true });
  if (!existsSync(e2eDatabase)) writeFileSync(e2eDatabase, '');

  artisan(['migrate:fresh', '--force']);

  tinker([
    "$student = App\\Models\\User::updateOrCreate(['email' => 'student-community-smoke@example.com'], [",
    "'name' => 'Community Smoke Student',",
    "'password' => Illuminate\\Support\\Facades\\Hash::make('password'),",
    "'role' => 'student',",
    "]);",
    "$student->forceFill(['email_verified_at' => now(), 'failed_login_attempts' => 0, 'locked_until' => null])->save();",
    "$profile = App\\Models\\StudentProfile::firstOrCreate(['user_Id' => $student->user_Id], ['current_points' => 200]);",
    "$profile->update(['current_points' => 200]);",
    "$replyUser = App\\Models\\User::updateOrCreate(['email' => 'student-community-reply@example.com'], [",
    "'name' => 'Community Reply Student',",
    "'password' => Illuminate\\Support\\Facades\\Hash::make('password'),",
    "'role' => 'student',",
    "]);",
    "$replyUser->forceFill(['email_verified_at' => now(), 'failed_login_attempts' => 0, 'locked_until' => null])->save();",
    "App\\Models\\StudentProfile::firstOrCreate(['user_Id' => $replyUser->user_Id], ['current_points' => 0]);",
    "$post = App\\Models\\ForumPost::updateOrCreate(['title' => 'Community Smoke Help Post'], [",
    "'user_id' => $student->user_Id,",
    "'content' => 'I need help understanding a Python loop example.',",
    "'category' => 'help',",
    "'is_locked' => false,",
    "]);",
    "App\\Models\\ForumReply::updateOrCreate(['post_id' => $post->post_id, 'content' => 'Use range to repeat work in a for loop.'], [",
    "'user_id' => $replyUser->user_Id,",
    "'parent_id' => null,",
    "'is_solution' => false,",
    "]);",
    "App\\Models\\Reward::updateOrCreate(['name' => 'Community Smoke Title'], [",
    "'description' => 'A title reward used by the student smoke test.',",
    "'reward_type' => 'title',",
    "'rarity' => 'common',",
    "'stock_quantity' => 5,",
    "'point_cost' => 25,",
    "'max_owned' => 1,",
    "'metadata' => ['title_text' => 'Smoke Solver'],",
    "'is_active' => true,",
    "]);",
  ]);
});

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.bunny.net/**', route => route.fulfill({ status: 204, body: '' }));
  await loginAsStudent(page);
  installBrowserFailureGuards(page);
});

test.afterEach(async ({ page }) => {
  expectNoBrowserFailures(page);
});

test('student can toggle forum solution and purchase then equip a reward', async ({ page }) => {
  const seed = execFileSync(
    'php',
    ['artisan', 'tinker', '--execute', [
      "$post = App\\Models\\ForumPost::where('title', 'Community Smoke Help Post')->firstOrFail();",
      "$reply = App\\Models\\ForumReply::where('post_id', $post->post_id)->firstOrFail();",
      "$reward = App\\Models\\Reward::where('name', 'Community Smoke Title')->firstOrFail();",
      "echo json_encode(['post' => $post->post_id, 'reply' => $reply->reply_id, 'reward' => $reward->reward_id]);",
    ].join(' ')],
    { cwd: process.cwd(), env: e2eEnv }
  ).toString();
  const { post, reply, reward } = JSON.parse(seed.slice(seed.indexOf('{')));

  await page.goto(`/forum/${post}`);
  await expect(page.getByText('Community Smoke Help Post')).toBeVisible();
  await expect(page.getByText('Use range to repeat work in a for loop.')).toBeVisible();

  let result = await postFromPage(page, `/forum/reply/${reply}/mark-solution`);
  expect(result.ok, result.text).toBeTruthy();
  await page.goto(`/forum/${post}`);
  await expect(page.getByText(/best answer|solution/i).first()).toBeVisible();

  result = await postFromPage(page, `/forum/reply/${reply}/mark-solution`);
  expect(result.ok, result.text).toBeTruthy();
  await page.goto(`/forum/${post}`);
  await expect(page.getByText('Community Smoke Help Post')).toBeVisible();

  await page.goto('/student/rewards');
  await expect(page.getByText('Community Smoke Title').first()).toBeVisible();

  result = await postFromPage(page, `/student/rewards/${reward}/purchase`, { quantity: 1 });
  expect(result.ok, result.text).toBeTruthy();

  const inventoryId = execFileSync(
    'php',
    ['artisan', 'tinker', '--execute', [
      "$student = App\\Models\\User::where('email', 'student-community-smoke@example.com')->firstOrFail()->studentProfile;",
      "$reward = App\\Models\\Reward::where('name', 'Community Smoke Title')->firstOrFail();",
      "$item = App\\Models\\StudentRewardInventory::where('student_id', $student->student_id)->where('reward_id', $reward->reward_id)->firstOrFail();",
      "echo $item->inventory_id;",
    ].join(' ')],
    { cwd: process.cwd(), env: e2eEnv }
  ).toString().trim().split(/\s+/).pop();

  result = await postFromPage(page, `/student/inventory/${inventoryId}/equip`);
  expect(result.ok, result.text).toBeTruthy();

  await page.goto('/student/inventory');
  await expect(page.getByText('Community Smoke Title').first()).toBeVisible();
  await expect(page.getByText(/equipped/i).first()).toBeVisible();
});
