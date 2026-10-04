import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import useIsDark from './useIsDark';

const setTheme = (dark) => {
  document.documentElement.classList.toggle('dark', dark);
  window.dispatchEvent(new Event('theme-changed'));
};

describe('useIsDark', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark');
    localStorage.clear();
  });

  it('starts from the class on <html> when the layout has applied it', () => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'light');

    expect(renderHook(() => useIsDark()).result.current).toBe(true);
  });

  it('falls back to the saved choice before the layout has applied it', () => {
    localStorage.setItem('theme', 'light');
    expect(renderHook(() => useIsDark()).result.current).toBe(false);

    localStorage.setItem('theme', 'dark');
    expect(renderHook(() => useIsDark()).result.current).toBe(true);
  });

  it('defaults to dark when nothing is saved, as the layout does', () => {
    expect(renderHook(() => useIsDark()).result.current).toBe(true);
  });

  it('follows theme-changed events', () => {
    localStorage.setItem('theme', 'light');
    const { result } = renderHook(() => useIsDark());

    act(() => setTheme(true));
    expect(result.current).toBe(true);

    act(() => setTheme(false));
    expect(result.current).toBe(false);
  });

  it('stops listening once unmounted', () => {
    const { result, unmount } = renderHook(() => useIsDark());
    unmount();

    expect(() => act(() => setTheme(false))).not.toThrow();
    expect(result.current).toBe(true);
  });
});
