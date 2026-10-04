import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expectNoBrowserFailures, installBrowserFailureGuards } from './support/browser-failure-guards.js';

// Quiz, fill-in-the-blank and sorting are graded on the server: the page gets
// the exercise without its answer key, submits what the student did, and
// shows the score and review the server sends back. These play each one
// through the real UI.

const studentEmail = 'student-graded-exercises@example.com';
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

function artisan(args, options = {}) {
  return execFileSync('php', ['artisan', ...args], {
    cwd: process.cwd(),
    env: e2eEnv,
    stdio: options.capture ? 'pipe' : 'inherit',
  });
}

function tinker(statements, options = {}) {
  return artisan(['tinker', '--execute', statements.join(' ')], options);
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
    return { ok: response.ok, status: response.status, text: await response.text() };
  }, { url, data });
}

// The props Inertia rendered the page with: everything the browser was sent.
async function pageProps(page) {
  return await page.evaluate(() => JSON.parse(document.getElementById('app').dataset.page).props);
}

// The results screen shows 0 until the server's grade arrives, so wait for it.
async function expectFinalScore(page, score) {
  const card = page.getByText('Final Score', { exact: true }).locator('..');
  await expect(card).toContainText(new RegExp(`^\\s*Final Score\\s*${score}\\s*/`));
}

let ids;

test.beforeAll(() => {
  const databaseDir = path.dirname(e2eDatabase);
  if (!existsSync(databaseDir)) mkdirSync(databaseDir, { recursive: true });
  if (!existsSync(e2eDatabase)) writeFileSync(e2eDatabase, '');

  artisan(['migrate:fresh', '--force']);

  const output = tinker([
    "$student = App\\Models\\User::updateOrCreate(['email' => '" + studentEmail + "'], [",
    "'name' => 'Graded Exercises Student',",
    "'password' => Illuminate\\Support\\Facades\\Hash::make('" + studentPassword + "'),",
    "'role' => 'student',",
    "]);",
    "$student->forceFill(['email_verified_at' => now(), 'failed_login_attempts' => 0, 'locked_until' => null])->save();",
    "App\\Models\\StudentProfile::firstOrCreate(['user_Id' => $student->user_Id], ['current_points' => 0]);",
    "$lesson = App\\Models\\Lesson::updateOrCreate(['title' => 'Graded Exercises Lesson'], [",
    "'content' => 'Practice with server-graded exercises.',",
    "'content_type' => 'markdown',",
    "'difficulty' => 'beginner',",
    "'estimated_duration' => 20,",
    "'status' => 'active',",
    "'completion_reward_points' => 30,",
    "'required_exercises' => 3,",
    "'required_tests' => 0,",
    "]);",
    "$quiz = App\\Models\\InteractiveExercise::create(['lesson_id' => $lesson->lesson_id, 'title' => 'Graded Quiz', 'exercise_type' => 'quiz', 'max_score' => 100, 'is_active' => true, 'content' => ['questions' => [",
    "['question' => 'Comment character?', 'options' => ['//', '#'], 'correct' => 1],",
    "['question' => 'Print output?', 'options' => ['echo()', 'print()'], 'correct' => 1, 'explanation' => 'print() writes to stdout.'],",
    "]]]);",
    "$blank = App\\Models\\InteractiveExercise::create(['lesson_id' => $lesson->lesson_id, 'title' => 'Graded Blanks', 'exercise_type' => 'fill_blank', 'max_score' => 100, 'is_active' => true, 'content' => ['sentences' => [",
    "['text' => '___ shows output', 'blanks' => [['correctAnswer' => 'print', 'alternativeAnswers' => ['print()']]]],",
    "['text' => 'A ___ loop repeats', 'blanks' => [['correctAnswer' => 'while', 'hint' => 'Not for']]],",
    "]]]);",
    "$sort = App\\Models\\InteractiveExercise::create(['lesson_id' => $lesson->lesson_id, 'title' => 'Graded Sorting', 'exercise_type' => 'sorting', 'max_score' => 100, 'is_active' => true, 'content' => ['instruction' => 'Put the debugging steps in order', 'items' => [",
    "['id' => 'item-1700000000001', 'text' => 'Write the code', 'correctOrder' => 1],",
    "['id' => 'item-1700000000002', 'text' => 'Run it', 'correctOrder' => 2],",
    "['id' => 'item-1700000000003', 'text' => 'Read the error', 'correctOrder' => 3],",
    "['id' => 'item-1700000000004', 'text' => 'Fix the bug', 'correctOrder' => 4],",
    "]]]);",
    "echo json_encode(['lesson' => $lesson->lesson_id, 'quiz' => $quiz->exercise_id, 'blank' => $blank->exercise_id, 'sort' => $sort->exercise_id]);",
  ], { capture: true }).toString();

  ids = JSON.parse(output.slice(output.indexOf('{')));
});

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.bunny.net/**', route => route.fulfill({ status: 204, body: '' }));

  await page.goto('/login');
  await page.getByLabel('Email Address').fill(studentEmail);
  await page.getByLabel('Password').fill(studentPassword);
  await page.getByRole('button', { name: /log in/i }).click();
  await expect(page).toHaveURL(/dashboard|student\/onboarding/);

  // Register and finish the reading once; repeat calls are harmless.
  await page.goto(`/lessons/${ids.lesson}`);
  await postFromPage(page, `/lessons/${ids.lesson}/register`);
  const read = await postFromPage(page, `/lessons/${ids.lesson}/mark-content-complete`);
  expect(read.ok, read.text).toBeTruthy();

  installBrowserFailureGuards(page);
});

test.afterEach(async ({ page }) => {
  expectNoBrowserFailures(page);
});

test('quiz: answer key stays on the server, and the review shows the right option', async ({ page }) => {
  await page.goto(`/lessons/${ids.lesson}/exercises/${ids.quiz}`);

  const props = await pageProps(page);
  for (const question of props.exercise.content.questions) {
    expect(question).not.toHaveProperty('correct');
    expect(question).not.toHaveProperty('explanation');
  }

  await page.getByRole('button', { name: /start game/i }).click();
  await page.getByLabel('#').check();
  await page.getByLabel('echo()').check();
  await page.getByRole('button', { name: /submit answers/i }).click();

  await expectFinalScore(page, 50);
  await expect(page.getByText('Answer Review')).toBeVisible();
  await expect(page.getByText('Correct answer:')).toBeVisible();
  await expect(page.getByText('print() writes to stdout.')).toBeVisible();
});

test('fill in the blank: answers stay on the server, alternatives are accepted', async ({ page }) => {
  await page.goto(`/lessons/${ids.lesson}/exercises/${ids.blank}`);

  const props = await pageProps(page);
  for (const sentence of props.exercise.content.sentences) {
    for (const blank of sentence.blanks) {
      expect(blank).not.toHaveProperty('correctAnswer');
      expect(blank).not.toHaveProperty('alternativeAnswers');
    }
  }
  await expect(page.getByText(/Blank 1: Not for/)).toBeVisible();

  await page.getByLabel('Sentence 1, blank 1').fill('PRINT()');
  await page.getByLabel('Sentence 2, blank 1').fill('while');
  await page.getByRole('button', { name: /submit answers/i }).click();

  await expectFinalScore(page, 100);
  await expect(page.getByText('Answer Review')).toBeVisible();
});

test('sorting: the order cannot be read from the page, and putting it right scores full marks', async ({ page }) => {
  await page.goto(`/lessons/${ids.lesson}/exercises/${ids.sort}`);

  const props = await pageProps(page);
  for (const item of props.exercise.content.items) {
    expect(item).not.toHaveProperty('correctOrder');
    expect(item.id).not.toContain('1700000000');
  }

  await page.getByRole('button', { name: /start game/i }).click();

  // Move each step into place with the arrow buttons.
  const correct = ['Write the code', 'Run it', 'Read the error', 'Fix the bug'];
  const shownOrder = async () => {
    const labels = await page.getByRole('button', { name: /^Move .* down$/ }).evaluateAll(
      (buttons) => buttons.map((b) => b.getAttribute('aria-label'))
    );
    return labels.map((label) => label.replace(/^Move /, '').replace(/ down$/, ''));
  };

  for (let target = 0; target < correct.length; target += 1) {
    let at = (await shownOrder()).indexOf(correct[target]);
    while (at > target) {
      await page.getByRole('button', { name: `Move ${correct[target]} up` }).click();
      at -= 1;
    }
  }
  expect(await shownOrder()).toEqual(correct);

  await page.getByRole('button', { name: /submit order/i }).click();

  await expectFinalScore(page, 100);
  await expect(page.getByText('Answer Review')).toBeVisible();
  await expect(page.getByText('Position 4')).toBeVisible();
});
