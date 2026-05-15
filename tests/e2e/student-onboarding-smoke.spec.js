import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expectNoBrowserFailures, installBrowserFailureGuards } from './support/browser-failure-guards.js';

const studentEmail = 'student-onboarding-smoke@example.com';
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
    "$admin = App\\Models\\User::updateOrCreate(['email' => 'admin-onboarding-smoke@example.com'], [",
    "'name' => 'Onboarding Smoke Admin',",
    "'password' => Illuminate\\Support\\Facades\\Hash::make('password'),",
    "'role' => 'administrator',",
    "]);",
    "$admin->forceFill(['email_verified_at' => now(), 'failed_login_attempts' => 0, 'locked_until' => null])->save();",
    "$student = App\\Models\\User::updateOrCreate(['email' => 'student-onboarding-smoke@example.com'], [",
    "'name' => 'Onboarding Smoke Student',",
    "'password' => Illuminate\\Support\\Facades\\Hash::make('password'),",
    "'role' => 'student',",
    "]);",
    "$student->forceFill(['email_verified_at' => now(), 'failed_login_attempts' => 0, 'locked_until' => null])->save();",
    "$profile = App\\Models\\StudentProfile::firstOrCreate(['user_Id' => $student->user_Id], ['current_points' => 0]);",
    "$path = App\\Models\\LearningPath::updateOrCreate(['title' => 'Onboarding Smoke Beginner Path'], [",
    "'description' => 'Recommended beginner placement path.',",
    "'learning_outcomes' => 'Start Python confidently.',",
    "'prerequisites' => 'None.',",
    "'difficulty_level' => 'beginner',",
    "'min_score_required' => 0,",
    "'max_score_required' => 100,",
    "'estimated_duration_hours' => 8,",
    "'display_order' => 1,",
    "'is_active' => true,",
    "'created_by' => $admin->user_Id,",
    "]);",
    "$test = App\\Models\\Test::updateOrCreate(['title' => 'Onboarding Smoke Placement Test'], [",
    "'description' => 'Placement test smoke seed.',",
    "'instructions' => 'Answer one question.',",
    "'time_limit' => 10,",
    "'max_attempts' => 1,",
    "'passing_score' => 0,",
    "'shuffle_questions' => false,",
    "'show_results_immediately' => true,",
    "'allow_review' => true,",
    "'status' => 'active',",
    "'test_type' => 'placement',",
    "]);",
    "$submission = App\\Models\\TestSubmission::updateOrCreate(['test_id' => $test->test_id, 'student_id' => $profile->student_id, 'attempt_number' => 1], [",
    "'started_at' => now()->subMinutes(5),",
    "'submitted_at' => now(),",
    "'time_spent' => 120,",
    "'score' => 80,",
    "'total_questions' => 1,",
    "'correct_answers' => 1,",
    "'status' => 'submitted',",
    "'recommended_path_id' => $path->path_id,",
    "'is_completed' => true,",
    "'is_placement_test' => true,",
    "'recommendation_confidence' => 95,",
    "'recommendation_message' => 'Your result fits this beginner path.',",
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

test('student without a learning path can open the paths empty state', async ({ page }) => {
  await page.goto('/student/paths');

  await expect(page.getByRole('heading', { name: /no learning paths yet/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /take placement test/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /browse paths/i })).toBeVisible();
});

test('student can view and accept placement recommendation', async ({ page }) => {
  const seed = execFileSync(
    'php',
    ['artisan', 'tinker', '--execute', [
      "$student = App\\Models\\User::where('email', 'student-onboarding-smoke@example.com')->firstOrFail()->studentProfile;",
      "$submission = App\\Models\\TestSubmission::where('student_id', $student->student_id)->firstOrFail();",
      "echo json_encode(['submission' => $submission->submission_id, 'path' => $submission->recommended_path_id]);",
    ].join(' ')],
    { cwd: process.cwd(), env: e2eEnv }
  ).toString();
  const { submission, path: pathId } = JSON.parse(seed.slice(seed.indexOf('{')));

  await page.goto(`/student/onboarding/result/${submission}`);
  await expect(page.getByText('Onboarding Smoke Beginner Path')).toBeVisible();

  const result = await postFromPage(page, `/student/onboarding/accept-path/${pathId}`, {
    submission_id: submission,
  });
  expect(result.ok, result.text).toBeTruthy();

  await page.goto('/student/paths');
  await expect(page.getByText('Onboarding Smoke Beginner Path').first()).toBeVisible();
});
