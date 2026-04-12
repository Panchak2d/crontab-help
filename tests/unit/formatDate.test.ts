import { describe, it, expect } from 'vitest';
import { formatNextRunDate, formatRelativeTime } from '../../src/utils/formatDate';

describe('formatNextRunDate', () => {
  it('returns a non-empty string for a valid date', () => {
    const result = formatNextRunDate(new Date('2025-06-15T09:00:00Z'), 'UTC');
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes the year in the output', () => {
    const result = formatNextRunDate(new Date('2025-06-15T09:00:00Z'), 'UTC');
    expect(result).toContain('2025');
  });

  it('reflects the 09:00 UTC hour correctly', () => {
    const result = formatNextRunDate(new Date('2025-06-15T09:00:00Z'), 'UTC');
    expect(result).toContain('09');
  });
});

describe('formatRelativeTime', () => {
  it('returns "in Xs" for dates less than a minute away', () => {
    const result = formatRelativeTime(new Date(Date.now() + 30_000));
    expect(result).toMatch(/^in \d+s$/);
  });

  it('returns "in Xm" for dates a few minutes away', () => {
    const result = formatRelativeTime(new Date(Date.now() + 5 * 60_000));
    expect(result).toMatch(/^in \d+m$/);
  });

  it('returns "in Xh Ym" for dates a few hours away', () => {
    const result = formatRelativeTime(new Date(Date.now() + 2 * 3_600_000 + 30 * 60_000));
    expect(result).toMatch(/^in \d+h \d+m$/);
  });

  it('returns "in Xd" for dates multiple days away', () => {
    const result = formatRelativeTime(new Date(Date.now() + 3 * 86_400_000));
    expect(result).toMatch(/^in \d+d$/);
  });

  it('returns "in the past" for dates that have already passed', () => {
    const result = formatRelativeTime(new Date(Date.now() - 60_000));
    expect(result).toBe('in the past');
  });
});
