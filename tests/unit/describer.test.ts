import { describe, it, expect } from 'vitest';
import { describeCronExpression } from '../../src/core/describer';

describe('describeCronExpression', () => {
  it('returns a placeholder for an empty expression', () => {
    const result = describeCronExpression('', 'unix');
    expect(result.isError).toBe(false);
    expect(result.description.length).toBeGreaterThan(0);
  });

  it('returns "Every minute" for * * * * *', () => {
    const result = describeCronExpression('* * * * *', 'unix');
    expect(result.isError).toBe(false);
    expect(result.description.toLowerCase()).toContain('every minute');
  });

  it('mentions the step interval for */5 * * * *', () => {
    const result = describeCronExpression('*/5 * * * *', 'unix');
    expect(result.isError).toBe(false);
    expect(result.description.toLowerCase()).toContain('5 minutes');
  });

  it('includes the hour for a daily-at-9 expression', () => {
    const result = describeCronExpression('0 9 * * *', 'unix');
    expect(result.isError).toBe(false);
    expect(result.description).toContain('09');
  });

  it('mentions Monday or Friday for a weekday expression', () => {
    const result = describeCronExpression('0 9 * * 1-5', 'unix');
    expect(result.isError).toBe(false);
    expect(result.description.toLowerCase()).toMatch(/monday|friday|through/);
  });

  it('normalises quartz format before describing', () => {
    const result = describeCronExpression('0 30 9 * * MON-FRI', 'quartz');
    expect(result.isError).toBe(false);
    expect(result.description.length).toBeGreaterThan(0);
  });

  it('normalises aws format before describing', () => {
    const result = describeCronExpression('0 12 * * ? *', 'aws');
    expect(result.isError).toBe(false);
    expect(result.description.length).toBeGreaterThan(0);
  });
});
