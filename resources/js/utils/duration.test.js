import { describe, expect, it } from 'vitest';
import { formatDurationHours } from './duration';

describe('formatDurationHours', () => {
  it('returns 0m for invalid/zero values', () => {
    expect(formatDurationHours(0)).toBe('0m');
    expect(formatDurationHours(-1)).toBe('0m');
    expect(formatDurationHours('abc')).toBe('0m');
  });

  it('formats minutes when below one hour', () => {
    expect(formatDurationHours(0.5)).toBe('30m');
  });

  it('formats full hours cleanly', () => {
    expect(formatDurationHours(2)).toBe('2h');
  });

  it('formats mixed hour and minutes', () => {
    expect(formatDurationHours(1.5)).toBe('1h 30m');
  });
});
