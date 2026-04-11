import { describe, it, expect } from 'vitest';
import { formatNextRunDate, formatRelativeTime } from '../../src/utils/formatDate';

describe('formatNextRunDate', () => {
  it('returns a non-empty string for a valid date', () => {
    const date = new Date('2025-06-15T09:00:00Z');
    const result = formatNextRunDate(date, 'UTC');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes the year in the output', () => {
    const date = new Date('2025-06-15T09:00:00Z');
    const result = formatNextRunDate(date, 'UTC');
    expect(result).toContain('2025');
  });

  it('formats in UTC timezone correctly', () => {
    const date = new Date('2025-06-15T09:00:00Z');
    const result = formatNextRunDate(date, 'UTC');
    expect(result).toContain('09');
  });
});

describe('formatRelativeTime', () => {
  it('returns "in X s" for near-future dates', () => {
    const soon = new Date(Date.now() + 30_000); // 30 seconds
    const result = formatRelativeTime(soon);
    expect(result).toMatch(/^in \d+s$/);
  });

  it('returns "in X m" for minutes-future dates', () => {
    const fiveMin = new Date(Date.now() + 5 * 60_000);
    const result = formatRelativeTime(fiveMin);
    expect(result).toMatch(/^in \d+m$/);
  });

  it('returns "in the past" for past dates', () => {
    const past = new Date(Date.now() - 60_000);
    const result = formatRelativeTime(past);
    expect(result).toBe('in the past');
  });

  it('handles hours correctly', () => {
    const twoHours = new Date(Date.now() + 2 * 3600_000 + 30 * 60_000);
    const result = formatRelativeTime(twoHours);
    expect(result).toMatch(/^in \d+h \d+m$/);
  });

  it('handles days correctly', () => {
    const threeDays = new Date(Date.now() + 3 * 24 * 3600_000);
    const result = formatRelativeTime(threeDays);
    expect(result).toMatch(/^in \d+d$/);
  });
});
