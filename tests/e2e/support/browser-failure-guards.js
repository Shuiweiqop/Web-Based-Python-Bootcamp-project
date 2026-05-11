import { expect } from '@playwright/test';

const failuresByPage = new WeakMap();

function isIgnoredRequestFailure(request, failureText) {
  return failureText === 'net::ERR_ABORTED' && request.url().includes('/audio/bgm/');
}

function isIgnoredResponse(response) {
  return response.status() === 409 && response.request().method() !== 'GET';
}

function isIgnoredConsoleError(messageText) {
  return /Failed to load resource: the server responded with a status of 409 \(Conflict\)/.test(messageText);
}

export function installBrowserFailureGuards(page) {
  const failures = [];
  failuresByPage.set(page, failures);

  page.on('pageerror', (error) => {
    failures.push(`pageerror: ${error.message}`);
  });

  page.on('console', (message) => {
    if (message.type() === 'error' && !isIgnoredConsoleError(message.text())) {
      failures.push(`console error: ${message.text()}`);
    }
  });

  page.on('response', (response) => {
    if (response.status() >= 400 && !isIgnoredResponse(response)) {
      failures.push(`response error: ${response.request().method()} ${response.status()} ${response.url()}`);
    }
  });

  page.on('requestfailed', (request) => {
    const failureText = request.failure()?.errorText ?? '';
    if (isIgnoredRequestFailure(request, failureText)) {
      return;
    }

    failures.push(`request failed: ${request.method()} ${request.url()} ${failureText}`);
  });
}

export function expectNoBrowserFailures(page) {
  const failures = failuresByPage.get(page) ?? [];
  expect(failures).toEqual([]);
}
