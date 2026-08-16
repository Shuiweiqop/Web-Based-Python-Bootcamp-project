import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';

/**
 * Mobile responsiveness audit.
 *
 * Not a pass/fail smoke test — a survey. It walks every parameter-free page at
 * a phone viewport and reports which ones actually break, so the PWA work can
 * be scoped from measurements instead of guesses.
 *
 * What it measures, and why these three:
 *   - horizontal overflow: the page body scrolls sideways. The single most
 *     obvious "this site isn't built for phones" signal.
 *   - offending elements: WHICH nodes are wider than the viewport, so a fix
 *     has somewhere to start rather than "the page is broken".
 *   - tap target size: controls under 32px are hard to hit accurately with a
 *     thumb (Apple/Google both advise ~44px).
 *
 * Run with:  npx playwright test mobile-responsive-audit --reporter=list
 * Screenshots land in tests/e2e/__mobile-audit__/.
 */

const VIEWPORT = { width: 375, height: 812 }; // iPhone X/11/12/13 logical size
const MIN_TAP_TARGET = 32;
const SHOT_DIR = path.resolve('tests/e2e/__mobile-audit__');

const adminEmail = 'admin-mobile-audit@example.com';
const studentEmail = 'student-mobile-audit@example.com';
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

/** Pages reachable without a route parameter, grouped by the role that sees them. */
const GUEST_PAGES = [
  ['home', '/'],
  ['login', '/login'],
  ['register', '/register'],
  ['forgot-password', '/forgot-password'],
];

const STUDENT_PAGES = [
  ['dashboard', '/dashboard'],
  ['lessons.index', '/lessons'],
  ['lessons.my-registrations', '/my-registrations'],
  ['forum.index', '/forum'],
  ['forum.create', '/forum/create'],
  ['forum.my-posts', '/forum/user/my-posts'],
  ['forum.my-favorites', '/forum/user/my-favorites'],
  ['student.skills', '/student/skills'],
  ['student.leaderboard', '/student/leaderboard'],
  ['student.missions.index', '/student/missions'],
  ['student.missions.history', '/student/missions/history'],
  ['student.missions.archive', '/student/missions/archive'],
  ['student.paths.index', '/student/paths'],
  ['student.paths.browse', '/student/paths/browse'],
  ['student.rewards.index', '/student/rewards'],
  ['student.rewards.history', '/student/rewards/history'],
  ['student.inventory.index', '/student/inventory'],
  ['student.inventory.equipped', '/student/inventory/equipped'],
  ['student.notifications.index', '/student/notifications'],
  ['student.profile.show', '/student/profile'],
  ['student.profile.edit', '/student/profile/edit'],
  ['student.profile.statistics', '/student/profile/statistics'],
  ['student.profile.history', '/student/profile/history'],
  ['student.profile.points', '/student/profile/points'],
  ['student.profile.rewards', '/student/profile/rewards'],
  ['student.onboarding.index', '/student/onboarding'],
  ['profile.edit', '/profile'],
];

const ADMIN_PAGES = [
  ['admin.dashboard', '/dashboard'],
  ['admin.mastery.index', '/admin/mastery'],
  ['admin.students.index', '/admin/students'],
  ['admin.lessons.index', '/admin/lessons'],
  ['admin.lessons.create', '/admin/lessons/create'],
  ['admin.exercises.index', '/admin/exercises'],
  ['admin.exercises.create', '/admin/exercises/create'],
  ['admin.tests.index', '/admin/tests'],
  ['admin.rewards.index', '/admin/rewards'],
  ['admin.rewards.create', '/admin/rewards/create'],
  ['admin.rewards.stats', '/admin/rewards/stats'],
  ['admin.learning-paths.index', '/admin/learning-paths'],
  ['admin.learning-paths.create', '/admin/learning-paths/create'],
  ['admin.student-paths.index', '/admin/student-paths'],
  ['admin.student-paths.analytics', '/admin/student-paths/analytics/overview'],
  ['admin.placement-tests.index', '/admin/placement-tests'],
  ['admin.progress.index', '/admin/progress'],
  ['admin.daily-challenges.index', '/admin/daily-challenges'],
  ['admin.forum.reports.index', '/admin/forum/reports'],
  ['admin.ai-logs.index', '/admin/ai-logs'],
  ['admin.ai-lessons.create', '/admin/ai-lessons/create'],
];

/** Collected across all tests so the final report can rank the worst offenders. */
const findings = [];

/**
 * Measure one page at the phone viewport.
 *
 * Overflow is measured against documentElement.clientWidth rather than the
 * configured viewport: that accounts for a scrollbar and matches what the user
 * can actually swipe.
 */
async function auditPage(page, label, url) {
  const result = { label, url, status: 'ok', overflow: 0, offenders: [], smallTaps: 0, error: null };

  try {
    // 'load' rather than 'networkidle': several pages hold long-lived
    // connections (notification polling), so networkidle never settles and the
    // audit stalls waiting for silence that never comes.
    const response = await page.goto(url, { waitUntil: 'load', timeout: 20_000 });

    if (response && response.status() >= 400) {
      result.status = `http ${response.status()}`;
      // Capture the Laravel error text: a page that 500s cannot be audited for
      // layout, and the reason is worth surfacing rather than swallowing.
      try {
        const body = await page.locator('body').innerText({ timeout: 3000 });
        const line = body.split('\n').map((l) => l.trim()).filter(Boolean)
          .find((l) => /error|exception|undefined|null|call to|sqlstate/i.test(l));
        result.error = (line ?? body.split('\n')[0] ?? '').slice(0, 160);
      } catch {
        result.error = 'could not read error body';
      }
      findings.push(result);

      return result;
    }

    // Let layout settle — several pages animate in on mount.
    await page.waitForTimeout(400);

    const measured = await page.evaluate((minTap) => {
      const doc = document.documentElement;
      const viewport = doc.clientWidth;
      const overflow = Math.max(0, doc.scrollWidth - viewport);

      const offenders = [];
      const seen = new Set();

      for (const el of document.querySelectorAll('body *')) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        // Only elements that actually extend past the right edge.
        if (rect.right <= viewport + 1) continue;

        const style = getComputedStyle(el);
        // An element inside its own horizontal scroller is fine by design.
        const inScroller = el.closest('[style*="overflow-x"], .overflow-x-auto, .overflow-x-scroll');
        if (inScroller && inScroller !== el) continue;
        if (style.position === 'fixed') continue;

        const tag = el.tagName.toLowerCase();
        const cls = (el.className && typeof el.className === 'string')
          ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
          : '';
        const key = `${tag}${cls}`;
        if (seen.has(key)) continue;
        seen.add(key);

        offenders.push({
          selector: key.slice(0, 90),
          width: Math.round(rect.width),
          right: Math.round(rect.right),
        });

        if (offenders.length >= 5) break;
      }

      // Interactive controls too small to hit reliably with a thumb.
      let smallTaps = 0;
      for (const el of document.querySelectorAll('a, button, [role="button"], input[type="checkbox"]')) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        if (rect.height < minTap || rect.width < minTap) smallTaps++;
      }

      return { viewport, overflow, offenders, smallTaps };
    }, MIN_TAP_TARGET);

    result.overflow = measured.overflow;
    result.offenders = measured.offenders;
    result.smallTaps = measured.smallTaps;
    result.status = measured.overflow > 0 ? 'OVERFLOW' : 'ok';

    await page.screenshot({
      path: path.join(SHOT_DIR, `${label.replace(/[^a-z0-9.-]/gi, '_')}.png`),
      fullPage: false,
    });
  } catch (error) {
    result.status = 'error';
    result.error = String(error.message ?? error).split('\n')[0].slice(0, 120);
  }

  findings.push(result);

  return result;
}

async function login(page, email) {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /log in/i }).click();
  await page.waitForURL(/dashboard|student\/onboarding/, { timeout: 30_000 });
}

test.describe.configure({ mode: 'serial' });
test.setTimeout(180_000);

test.beforeAll(() => {
  const databaseDir = path.dirname(e2eDatabase);
  if (!existsSync(databaseDir)) mkdirSync(databaseDir, { recursive: true });
  if (!existsSync(e2eDatabase)) writeFileSync(e2eDatabase, '');
  if (existsSync(SHOT_DIR)) rmSync(SHOT_DIR, { recursive: true, force: true });
  mkdirSync(SHOT_DIR, { recursive: true });

  // Full seed so pages render with realistic content — an empty table hides
  // exactly the overflow this audit is looking for.
  // MOBILE_AUDIT_SKIP_SEED=1 reuses the existing e2e database when re-running
  // the audit after a fix, which is the common case and saves ~40s.
  if (!process.env.MOBILE_AUDIT_SKIP_SEED) {
    artisan(['migrate:fresh', '--force', '--seed']);
  }

  tinker([
    `$admin = App\\Models\\User::updateOrCreate(['email' => '${adminEmail}'], [`,
    "'name' => 'Mobile Audit Admin',",
    `'password' => Illuminate\\Support\\Facades\\Hash::make('${password}'),`,
    "'role' => 'administrator',",
    "]);",
    "$admin->forceFill(['email_verified_at' => now(), 'failed_login_attempts' => 0, 'locked_until' => null])->save();",
    `$student = App\\Models\\User::updateOrCreate(['email' => '${studentEmail}'], [`,
    "'name' => 'Mobile Audit Student',",
    `'password' => Illuminate\\Support\\Facades\\Hash::make('${password}'),`,
    "'role' => 'student',",
    "]);",
    "$student->forceFill(['email_verified_at' => now(), 'failed_login_attempts' => 0, 'locked_until' => null])->save();",
    "$p = App\\Models\\StudentProfile::firstOrCreate(['user_Id' => $student->user_Id], ['current_points' => 500]);",
    // Give the audit student real mastery data so the skills page is populated
    // rather than showing its empty state.
    "$svc = app(App\\Services\\Mastery\\ConceptMasteryService::class);",
    "$svc->ensureAllConceptsTracked($p);",
    "foreach (App\\Models\\StudentConceptMastery::where('student_id', $p->student_id)->get() as $i => $row) {",
    "$row->update(['mastery' => 0.25 + ($i * 0.06), 'initial_mastery' => 0.30, 'confidence' => 0.8, 'attempts' => 8, 'correct' => 4]);",
    "}",
  ]);
});

test('guest pages at 375px', async ({ browser }) => {
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  for (const [label, url] of GUEST_PAGES) {
    await auditPage(page, label, url);
  }

  await context.close();
});

// Split into halves: one login plus ~14 page loads fits comfortably inside the
// per-test timeout, where all 27 at once did not.
const STUDENT_HALVES = [
  STUDENT_PAGES.slice(0, Math.ceil(STUDENT_PAGES.length / 2)),
  STUDENT_PAGES.slice(Math.ceil(STUDENT_PAGES.length / 2)),
];

STUDENT_HALVES.forEach((pages, i) => {
  test(`student pages at 375px (part ${i + 1})`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();

    await login(page, studentEmail);

    for (const [label, url] of pages) {
      await auditPage(page, label, url);
    }

    await context.close();
  });
});

const ADMIN_HALVES = [
  ADMIN_PAGES.slice(0, Math.ceil(ADMIN_PAGES.length / 2)),
  ADMIN_PAGES.slice(Math.ceil(ADMIN_PAGES.length / 2)),
];

ADMIN_HALVES.forEach((pages, i) => {
  test(`admin pages at 375px (part ${i + 1})`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();

    await login(page, adminEmail);

    for (const [label, url] of pages) {
      await auditPage(page, `admin_${label}`, url);
    }

    await context.close();
  });
});

test('report', async () => {
  const broken = findings.filter((f) => f.status === 'OVERFLOW').sort((a, b) => b.overflow - a.overflow);
  const errored = findings.filter((f) => f.status === 'error' || f.status.startsWith('http'));
  const clean = findings.filter((f) => f.status === 'ok');

  const lines = [];
  lines.push('');
  lines.push('='.repeat(78));
  lines.push(`MOBILE AUDIT @ ${VIEWPORT.width}x${VIEWPORT.height}`);
  lines.push('='.repeat(78));
  lines.push(`Pages checked : ${findings.length}`);
  lines.push(`Clean         : ${clean.length}`);
  lines.push(`Overflowing   : ${broken.length}`);
  lines.push(`Errored       : ${errored.length}`);
  lines.push('');

  if (broken.length) {
    lines.push('-- HORIZONTAL OVERFLOW (worst first) ' + '-'.repeat(40));
    for (const f of broken) {
      lines.push(`  +${String(f.overflow).padStart(4)}px  ${f.label}   ${f.url}`);
      for (const o of f.offenders.slice(0, 3)) {
        lines.push(`            ${o.selector}  (w=${o.width}, right=${o.right})`);
      }
    }
    lines.push('');
  }

  const tappy = findings.filter((f) => f.smallTaps > 0).sort((a, b) => b.smallTaps - a.smallTaps).slice(0, 10);
  if (tappy.length) {
    lines.push(`-- SMALL TAP TARGETS (< ${MIN_TAP_TARGET}px) ` + '-'.repeat(38));
    for (const f of tappy) {
      lines.push(`  ${String(f.smallTaps).padStart(4)}  ${f.label}`);
    }
    lines.push('');
  }

  if (errored.length) {
    lines.push('-- COULD NOT AUDIT ' + '-'.repeat(56));
    for (const f of errored) {
      lines.push(`  ${f.status.padEnd(10)} ${f.label}  ${f.error ?? ''}`);
    }
    lines.push('');
  }

  lines.push(`Screenshots: ${SHOT_DIR}`);
  lines.push('='.repeat(78));

  const report = lines.join('\n');
  console.log(report);
  writeFileSync(path.join(SHOT_DIR, 'REPORT.txt'), report, 'utf8');

  // The audit reports; it does not gate. Failing here would just block the
  // information we ran it to collect.
  expect(findings.length).toBeGreaterThan(0);
});
