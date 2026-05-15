import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expectNoBrowserFailures, installBrowserFailureGuards } from './support/browser-failure-guards.js';

const studentEmail = 'student-learning-smoke@example.com';
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
    "$admin = App\\Models\\User::updateOrCreate(['email' => 'admin-learning-smoke@example.com'], [",
    "'name' => 'Learning Smoke Admin',",
    "'password' => Illuminate\\Support\\Facades\\Hash::make('password'),",
    "'role' => 'administrator',",
    "]);",
    "$admin->forceFill(['email_verified_at' => now(), 'failed_login_attempts' => 0, 'locked_until' => null])->save();",
    "$student = App\\Models\\User::updateOrCreate(['email' => 'student-learning-smoke@example.com'], [",
    "'name' => 'Learning Smoke Student',",
    "'password' => Illuminate\\Support\\Facades\\Hash::make('password'),",
    "'role' => 'student',",
    "]);",
    "$student->forceFill(['email_verified_at' => now(), 'failed_login_attempts' => 0, 'locked_until' => null])->save();",
    "App\\Models\\StudentProfile::firstOrCreate(['user_Id' => $student->user_Id], ['current_points' => 0]);",
  ]);

  tinker([
    "$admin = App\\Models\\User::where('email', 'admin-learning-smoke@example.com')->firstOrFail();",
    "$lesson = App\\Models\\Lesson::updateOrCreate(['title' => 'Student Learning Smoke Lesson'], [",
    "'content' => 'Practice variables, expressions, and a short check.',",
    "'content_type' => 'markdown',",
    "'difficulty' => 'beginner',",
    "'estimated_duration' => 20,",
    "'status' => 'active',",
    "'completion_reward_points' => 30,",
    "'required_exercises' => 1,",
    "'required_tests' => 1,",
    "'min_exercise_score_percent' => 70,",
    "'created_by' => $admin->user_Id,",
    "]);",
    "App\\Models\\InteractiveExercise::updateOrCreate(['lesson_id' => $lesson->lesson_id, 'title' => 'Student Learning Smoke Exercise'], [",
    "'description' => 'Complete the quick practice.',",
    "'instructions' => 'Submit a passing practice score.',",
    "'exercise_type' => 'drag_drop',",
    "'content' => ['prompt' => 'Match Python values'],",
    "'solution' => ['completed' => true],",
    "'max_score' => 100,",
    "'hints' => [],",
    "'difficulty_level' => 1,",
    "'estimated_time' => 5,",
    "'order' => 1,",
    "'is_active' => true,",
    "]);",
    "$test = App\\Models\\Test::updateOrCreate(['title' => 'Student Learning Smoke Test'], [",
    "'lesson_id' => $lesson->lesson_id,",
    "'description' => 'One-question smoke test.',",
    "'instructions' => 'Answer the question.',",
    "'time_limit' => 10,",
    "'max_attempts' => 3,",
    "'passing_score' => 70,",
    "'shuffle_questions' => false,",
    "'show_results_immediately' => true,",
    "'allow_review' => true,",
    "'status' => 'active',",
    "'order' => 1,",
    "'test_type' => 'lesson',",
    "]);",
    "App\\Models\\Question::updateOrCreate(['test_id' => $test->test_id, 'question_text' => 'Which keyword creates a variable value?'], [",
    "'type' => 'short_answer',",
    "'correct_answer' => 'assignment',",
    "'explanation' => 'Assignments bind values to names.',",
    "'points' => 10,",
    "'difficulty_level' => 1,",
    "'order' => 1,",
    "'status' => 'active',",
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

test('student can register, complete content, pass exercise and pass the lesson test', async ({ page }) => {
  await page.goto('/lessons');
  await expect(page.getByText('Student Learning Smoke Lesson')).toBeVisible();

  const ids = execFileSync(
    'php',
    ['artisan', 'tinker', '--execute', [
      "$lesson = App\\Models\\Lesson::where('title', 'Student Learning Smoke Lesson')->firstOrFail();",
      "$exercise = App\\Models\\InteractiveExercise::where('lesson_id', $lesson->lesson_id)->firstOrFail();",
      "$test = App\\Models\\Test::where('lesson_id', $lesson->lesson_id)->firstOrFail();",
      "$question = App\\Models\\Question::where('test_id', $test->test_id)->firstOrFail();",
      "echo json_encode(['lesson' => $lesson->lesson_id, 'exercise' => $exercise->exercise_id, 'test' => $test->test_id, 'question' => $question->question_id]);",
    ].join(' ')],
    { cwd: process.cwd(), env: e2eEnv }
  ).toString();
  const { lesson, exercise, test: testId, question } = JSON.parse(ids.slice(ids.indexOf('{')));

  await page.goto(`/lessons/${lesson}`);
  await expect(page.getByRole('heading', { name: 'Student Learning Smoke Lesson' }).first()).toBeVisible();

  let result = await postFromPage(page, `/lessons/${lesson}/register`);
  expect(result.ok, result.text).toBeTruthy();
  result = await postFromPage(page, `/lessons/${lesson}/mark-content-complete`);
  expect(result.ok, result.text).toBeTruthy();

  result = await postFromPage(page, `/lessons/${lesson}/exercises/api/${exercise}/submit`, {
    answer: { completed: true, score: 100 },
    time_spent: 45,
  });
  expect(result.ok, result.text).toBeTruthy();
  expect(JSON.parse(result.text)).toMatchObject({ success: true });

  result = await postFromPage(page, `/student/lessons/${lesson}/tests/${testId}/start`);
  expect(result.ok, result.text).toBeTruthy();

  const submissionId = execFileSync(
    'php',
    ['artisan', 'tinker', '--execute', [
      "$student = App\\Models\\User::where('email', 'student-learning-smoke@example.com')->firstOrFail()->studentProfile;",
      "$test = App\\Models\\Test::where('title', 'Student Learning Smoke Test')->firstOrFail();",
      "$submission = App\\Models\\TestSubmission::where('student_id', $student->student_id)->where('test_id', $test->test_id)->where('status', 'in_progress')->latest('submission_id')->firstOrFail();",
      "echo $submission->submission_id;",
    ].join(' ')],
    { cwd: process.cwd(), env: e2eEnv }
  ).toString().trim().split(/\s+/).pop();

  result = await postFromPage(page, `/student/submissions/${submissionId}/answer`, {
    question_id: question,
    answer_text: 'assignment',
  });
  expect(result.ok, result.text).toBeTruthy();
  expect(JSON.parse(result.text)).toMatchObject({ success: true });

  result = await postFromPage(page, `/student/submissions/${submissionId}/complete`);
  expect(result.ok, result.text).toBeTruthy();

  await page.goto(`/student/submissions/${submissionId}/result`);
  await expect(page.getByText('Student Learning Smoke Test')).toBeVisible();
  await expect(page.getByText(/100|passed/i).first()).toBeVisible();

  await page.goto(`/lessons/${lesson}`);
  await expect(page.getByRole('heading', { name: 'Student Learning Smoke Lesson' }).first()).toBeVisible();
});
