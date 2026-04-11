import { describe, it, expect } from 'vitest';
import { describeCronExpression } from '../../src/core/describer';

describe('describeCronExpression', () => {
  it('returns "Every minute" for * * * * *', () => {
    const result = describeCronExpression('* * * * *', 'unix');
    expect(result.isError).toBe(false);
    expect(result.description.toLowerCase()).toContain('every minute');
  });

  it('returns "Every 5 minutes" for */5 * * * *', () => {
    const result = describeCronExpression('*/5 * * * *', 'unix');
    expect(result.isError).toBe(false);
    expect(result.description.toLowerCase()).toContain('5 minutes');
  });

  it('returns a description mentioning 9 for daily-at-9', () => {
    const result = describeCronExpression('0 9 * * *', 'unix');
    expect(result.isError).toBe(false);
    expect(result.description).toContain('09');
  });

  it('describes weekday expression correctly', () => {
    const result = describeCronExpression('0 9 * * 1-5', 'unix');
    expect(result.isError).toBe(false);
    // cronstrue should mention Monday or Friday or through
    expect(result.description.toLowerCase()).toMatch(/monday|friday|through/);
  });

  it('returns empty prompt for empty expression', () => {
    const result = describeCronExpression('', 'unix');
    expect(result.isError).toBe(false);
    expect(result.description).toContain('Enter');
  });

  it('handles quartz format by stripping seconds field', () => {
    const result = describeCronExpression('0 30 9 * * MON-FRI', 'quartz');
    expect(result.isError).toBe(false);
    expect(result.description).toBeTruthy();
  });

  it('handles aws format by stripping year field', () => {
    const result = describeCronExpression('0 12 * * ? *', 'aws');
    expect(result.isError).toBe(false);
    expect(result.description).toBeTruthy();
  });
});
