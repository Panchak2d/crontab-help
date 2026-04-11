import { describe, it, expect } from 'vitest';
import { parseCronExpression } from '../../src/core/parser';

describe('parseCronExpression — unix format', () => {
  it('returns 10 dates for a valid expression', () => {
    const result = parseCronExpression('*/5 * * * *', 'unix', 'UTC');
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.nextDates).toHaveLength(10);
    }
  });

  it('returns Date objects (not strings)', () => {
    const result = parseCronExpression('0 9 * * *', 'unix', 'UTC');
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      result.nextDates.forEach(d => expect(d).toBeInstanceOf(Date));
    }
  });

  it('returns dates in ascending order', () => {
    const result = parseCronExpression('0 * * * *', 'unix', 'UTC');
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      for (let i = 1; i < result.nextDates.length; i++) {
        expect(result.nextDates[i].getTime()).toBeGreaterThan(result.nextDates[i - 1].getTime());
      }
    }
  });

  it('returns error for empty expression', () => {
    const result = parseCronExpression('', 'unix', 'UTC');
    expect(result.isValid).toBe(false);
  });

  it('returns error for wrong field count', () => {
    const result = parseCronExpression('* * *', 'unix', 'UTC');
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.errorMessage).toContain('5');
    }
  });

  it('returns error for out-of-range values', () => {
    const result = parseCronExpression('99 * * * *', 'unix', 'UTC');
    expect(result.isValid).toBe(false);
  });

  it('handles day-of-week range correctly (MON-FRI)', () => {
    const result = parseCronExpression('0 9 * * 1-5', 'unix', 'UTC');
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      result.nextDates.forEach(d => {
        const day = d.getUTCDay();
        // Day 1=Mon through 5=Fri
        expect(day).toBeGreaterThanOrEqual(1);
        expect(day).toBeLessThanOrEqual(5);
      });
    }
  });

  it('handles step expressions (*/15)', () => {
    const result = parseCronExpression('*/15 * * * *', 'unix', 'UTC');
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      result.nextDates.forEach(d => {
        expect(d.getUTCMinutes() % 15).toBe(0);
      });
    }
  });
});

describe('parseCronExpression — quartz format', () => {
  it('parses valid 6-field quartz expression', () => {
    const result = parseCronExpression('0 30 9 * * MON-FRI', 'quartz', 'UTC');
    expect(result.isValid).toBe(true);
  });

  it('returns error when given 5 fields for quartz', () => {
    const result = parseCronExpression('* * * * *', 'quartz', 'UTC');
    expect(result.isValid).toBe(false);
    if (!result.isValid) expect(result.errorMessage).toContain('6');
  });
});

describe('parseCronExpression — timezone', () => {
  it('accepts UTC timezone', () => {
    const result = parseCronExpression('0 9 * * *', 'unix', 'UTC');
    expect(result.isValid).toBe(true);
  });

  it('accepts America/New_York timezone', () => {
    const result = parseCronExpression('0 9 * * *', 'unix', 'America/New_York');
    expect(result.isValid).toBe(true);
  });
});

describe('parseCronExpression — count parameter', () => {
  it('returns requested number of dates', () => {
    const result = parseCronExpression('* * * * *', 'unix', 'UTC', 5);
    expect(result.isValid).toBe(true);
    if (result.isValid) expect(result.nextDates).toHaveLength(5);
  });
});
