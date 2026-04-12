import { describe, it, expect } from 'vitest';
import { parseCronExpression } from '../../src/core/parser';

describe('parseCronExpression — valid unix expressions', () => {
  it('returns 10 dates for a valid expression', () => {
    const result = parseCronExpression('*/5 * * * *', 'unix', 'UTC');
    expect(result.isValid).toBe(true);
    if (result.isValid) expect(result.nextDates).toHaveLength(10);
  });

  it('returns Date objects, not strings or numbers', () => {
    const result = parseCronExpression('0 9 * * *', 'unix', 'UTC');
    if (result.isValid) result.nextDates.forEach(d => expect(d).toBeInstanceOf(Date));
  });

  it('returns dates in ascending order', () => {
    const result = parseCronExpression('0 * * * *', 'unix', 'UTC');
    if (result.isValid) {
      for (let i = 1; i < result.nextDates.length; i++) {
        expect(result.nextDates[i].getTime()).toBeGreaterThan(result.nextDates[i - 1].getTime());
      }
    }
  });

  it('constrains results to weekday range for MON-FRI expressions', () => {
    const result = parseCronExpression('0 9 * * 1-5', 'unix', 'UTC');
    if (result.isValid) {
      result.nextDates.forEach(d => {
        const day = d.getUTCDay(); // 1=Mon, 5=Fri
        expect(day).toBeGreaterThanOrEqual(1);
        expect(day).toBeLessThanOrEqual(5);
      });
    }
  });

  it('aligns step expressions to the expected minute values', () => {
    const result = parseCronExpression('*/15 * * * *', 'unix', 'UTC');
    if (result.isValid) {
      result.nextDates.forEach(d => expect(d.getUTCMinutes() % 15).toBe(0));
    }
  });

  it('respects the count parameter', () => {
    const result = parseCronExpression('* * * * *', 'unix', 'UTC', 5);
    if (result.isValid) expect(result.nextDates).toHaveLength(5);
  });
});

describe('parseCronExpression — error cases', () => {
  it('returns an error for an empty expression', () => {
    const result = parseCronExpression('', 'unix', 'UTC');
    expect(result.isValid).toBe(false);
  });

  it('returns an error that mentions the expected field count when too few fields', () => {
    const result = parseCronExpression('* * *', 'unix', 'UTC');
    expect(result.isValid).toBe(false);
    if (!result.isValid) expect(result.errorMessage).toContain('5');
  });

  it('names the missing fields in the error message', () => {
    const result = parseCronExpression('* * *', 'unix', 'UTC');
    if (!result.isValid) expect(result.errorMessage).toContain('Missing');
  });

  it('returns an error for out-of-range values', () => {
    const result = parseCronExpression('99 * * * *', 'unix', 'UTC');
    expect(result.isValid).toBe(false);
  });

  it('returns an error for whitespace-only input', () => {
    const result = parseCronExpression('   ', 'unix', 'UTC');
    expect(result.isValid).toBe(false);
  });
});

describe('parseCronExpression — format validation', () => {
  it('parses a valid 6-field quartz expression', () => {
    const result = parseCronExpression('0 30 9 * * MON-FRI', 'quartz', 'UTC');
    expect(result.isValid).toBe(true);
  });

  it('rejects 5 fields when quartz format is selected', () => {
    const result = parseCronExpression('* * * * *', 'quartz', 'UTC');
    expect(result.isValid).toBe(false);
    if (!result.isValid) expect(result.errorMessage).toContain('6');
  });

  it('includes the format name in the field-count error', () => {
    const result = parseCronExpression('* * * * *', 'quartz', 'UTC');
    if (!result.isValid) expect(result.errorMessage).toContain('Quartz');
  });
});

describe('parseCronExpression — timezone handling', () => {
  it('accepts UTC as the timezone', () => {
    expect(parseCronExpression('0 9 * * *', 'unix', 'UTC').isValid).toBe(true);
  });

  it('accepts a named IANA timezone', () => {
    expect(parseCronExpression('0 9 * * *', 'unix', 'America/New_York').isValid).toBe(true);
  });
});
