import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/**
 * The quiz timer must not be clipped by the fixed navbar.
 *
 * Reported: the countdown appeared cut off behind the top nav. Both QuizTimer
 * and (a duplicated copy inside) QuestionNavigator sat at `fixed top-4 right-4
 * z-50`, while StudentLayout's navbar is `fixed top-0 w-full z-50` and 64px
 * tall — so the timer rendered underneath it.
 *
 * Asserted geometrically rather than by eye: the timer's top edge must clear
 * the navbar's bottom edge.
 */

const studentEmail = 'timer-position@example.com';
const password = 'password';

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
    execFileSync('php', ['artisan', ...args], { cwd: process.cwd(), env: e2eEnv, stdio: 'inherit' });
}

function tinker(statements) {
    artisan(['tinker', '--execute', statements.join(' ')]);
}

test.setTimeout(180_000);

test.beforeAll(() => {
    const dir = path.dirname(e2eDatabase);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    if (!existsSync(e2eDatabase)) writeFileSync(e2eDatabase, '');

    artisan(['migrate:fresh', '--force', '--seed']);

    tinker([
        `$u = App\\Models\\User::updateOrCreate(['email' => '${studentEmail}'], [`,
        "'name' => 'Timer Position Student',",
        `'password' => Illuminate\\Support\\Facades\\Hash::make('${password}'),`,
        "'role' => 'student',",
        "]);",
        "$u->forceFill(['email_verified_at' => now(), 'failed_login_attempts' => 0, 'locked_until' => null])->save();",
        "App\\Models\\StudentProfile::firstOrCreate(['user_Id' => $u->user_Id], ['current_points' => 0]);",
    ]);
});

test('the quiz timer clears the fixed navbar', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(studentEmail);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL(/dashboard|student\/onboarding/, { timeout: 30_000 });

    // Start the seeded placement test, which carries a 30-minute limit.
    await page.goto('/student/onboarding/start-test');
    await page.waitForURL(/submissions\/\d+/, { timeout: 30_000 });
    await page.waitForTimeout(600);

    const geometry = await page.evaluate(() => {
        const nav = document.querySelector('nav');
        // The timer is the fixed element showing a mm:ss countdown.
        const timer = [...document.querySelectorAll('div')].find(
            (el) =>
                getComputedStyle(el).position === 'fixed' &&
                /Time Remaining|Time's Up/.test(el.textContent ?? ''),
        );

        if (!nav || !timer) return null;

        const navRect = nav.getBoundingClientRect();
        const timerRect = timer.getBoundingClientRect();

        return {
            navBottom: navRect.bottom,
            timerTop: timerRect.top,
            timerRight: timerRect.right,
            viewportWidth: document.documentElement.clientWidth,
        };
    });

    expect(geometry, 'timer or navbar not found on the page').not.toBeNull();

    expect(
        geometry.timerTop,
        `Timer top (${geometry.timerTop}) overlaps the navbar bottom (${geometry.navBottom}).`,
    ).toBeGreaterThanOrEqual(geometry.navBottom);

    // And it must stay on screen.
    expect(geometry.timerRight).toBeLessThanOrEqual(geometry.viewportWidth);
});

test('only one timer is rendered', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(studentEmail);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL(/dashboard|student\/onboarding/, { timeout: 30_000 });

    await page.goto('/student/onboarding/start-test');
    await page.waitForURL(/submissions\/\d+/, { timeout: 30_000 });
    await page.waitForTimeout(600);

    // QuestionNavigator used to contain a second copy of the timer, stacked at
    // the same coordinates.
    const timerCount = await page.evaluate(
        () =>
            [...document.querySelectorAll('div')].filter((el) =>
                /^Time Remaining$/.test(el.textContent?.trim() ?? ''),
            ).length,
    );

    expect(timerCount).toBe(1);
});
