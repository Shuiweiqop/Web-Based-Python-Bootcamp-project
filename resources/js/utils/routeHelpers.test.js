import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  isCurrentRoute,
  resourceRoutes,
  safeRoute,
} from './routeHelpers';

// These helpers depend on the global Ziggy `route()` which does not exist in the
// node test environment. When it is absent, `route()` throws and safeRoute falls
// back to manual URL construction — that fallback is what we mostly exercise here.

afterEach(() => {
  delete global.route;
  vi.restoreAllMocks();
});

describe('safeRoute (Ziggy available)', () => {
  it('reduces an absolute URL to its pathname', () => {
    global.route = () => 'https://app.test/admin/rewards/1';
    expect(safeRoute('admin.rewards.show', 1)).toBe('/admin/rewards/1');
  });

  it('passes a relative URL through unchanged', () => {
    global.route = () => '/admin/rewards/1';
    expect(safeRoute('admin.rewards.show', 1)).toBe('/admin/rewards/1');
  });
});

describe('safeRoute (fallback construction)', () => {
  it('builds simple resource index routes', () => {
    expect(safeRoute('admin.rewards.index')).toBe('/admin/rewards');
    expect(safeRoute('lessons.index')).toBe('/lessons');
    expect(safeRoute('dashboard')).toBe('/dashboard');
  });

  it('injects a scalar id param', () => {
    expect(safeRoute('admin.rewards.show', 1)).toBe('/admin/rewards/1');
    expect(safeRoute('admin.lessons.edit', 7)).toBe('/admin/lessons/7/edit');
  });

  it('injects array params for nested routes', () => {
    expect(safeRoute('admin.lessons.tests.show', [3, 9])).toBe('/admin/lessons/3/tests/9');
    expect(safeRoute('admin.lessons.tests.questions.edit', [3, 9, 5])).toBe(
      '/admin/lessons/3/tests/9/questions/5/edit'
    );
  });

  it('injects object params by value order', () => {
    expect(safeRoute('lessons.exercises.show', { lesson: 2, exercise: 8 })).toBe(
      '/lessons/2/exercises/8'
    );
  });

  it('returns null for an unknown route', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(safeRoute('totally.unknown.route', 1)).toBeNull();
  });
});

describe('resourceRoutes', () => {
  it('omits id-bound routes when no id is given', () => {
    const routes = resourceRoutes('admin.lessons', { lessonId: 4 });
    expect(routes.index).toBe('/admin/lessons');
    expect(routes.show).toBeNull();
    expect(routes.edit).toBeNull();
  });

  it('builds id-bound routes when an id is given', () => {
    const routes = resourceRoutes('admin.lessons', { id: 4 });
    expect(routes.show).toBe('/admin/lessons/4');
    expect(routes.edit).toBe('/admin/lessons/4/edit');
    expect(routes.destroy).toBe('/admin/lessons/4');
  });
});

describe('isCurrentRoute', () => {
  it('matches an exact route name', () => {
    global.route = () => ({ current: () => 'admin.lessons.edit' });
    expect(isCurrentRoute('admin.lessons.edit')).toBe(true);
    expect(isCurrentRoute('admin.lessons.create')).toBe(false);
  });

  it('matches wildcard prefixes', () => {
    global.route = () => ({ current: () => 'admin.lessons.edit' });
    expect(isCurrentRoute('admin.lessons.*')).toBe(true);
    expect(isCurrentRoute('admin.rewards.*')).toBe(false);
  });

  it('accepts an array of patterns', () => {
    global.route = () => ({ current: () => 'rewards.index' });
    expect(isCurrentRoute(['admin.lessons.*', 'rewards.*'])).toBe(true);
  });
});
