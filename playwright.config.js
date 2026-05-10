import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const appPort = process.env.PLAYWRIGHT_APP_PORT || '8010';
const vitePort = process.env.PLAYWRIGHT_VITE_PORT || '5174';
const appUrl = `http://127.0.0.1:${appPort}`;
const e2eDatabase = path.resolve('database/e2e.sqlite');
const browserChannel = process.env.PLAYWRIGHT_BROWSER_CHANNEL || (process.env.CI ? undefined : 'chrome');

const e2eEnv = {
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

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: appUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: `php artisan serve --host=127.0.0.1 --port=${appPort}`,
      url: `${appUrl}/login`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: e2eEnv,
    },
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${vitePort}`,
      url: `http://127.0.0.1:${vitePort}/@vite/client`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(browserChannel ? { channel: browserChannel } : {}),
      },
    },
  ],
});
