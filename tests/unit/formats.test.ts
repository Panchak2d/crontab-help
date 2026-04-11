import { describe, it, expect } from 'vitest';
import { normalizeToUnix, expectedFieldCount } from '../../src/core/formats';

describe('normalizeToUnix', () => {
  it('passes through unix expression unchanged', () => {
    expect(normalizeToUnix('*/5 * * * *', 'unix')).toBe('*/5 * * * *');
  });

  it('passes through github expression unchanged', () => {
    expect(normalizeToUnix('30 5 * * 1,3,5', 'github')).toBe('30 5 * * 1,3,5');
  });

  it('strips leading seconds field from quartz expression', () => {
    expect(normalizeToUnix('0 30 9 * * MON-FRI', 'quartz')).toBe('30 9 * * MON-FRI');
  });

  it('handles quartz expression with 5 fields gracefully (passthrough)', () => {
    // If someone passes fewer fields it normalizes as-is
    expect(normalizeToUnix('* * * * *', 'quartz')).toBe('* * * * *');
  });

  it('strips trailing year field from aws expression', () => {
    expect(normalizeToUnix('0 10 ? * MON-FRI *', 'aws')).toBe('0 10 * * MON-FRI');
  });

  it('replaces ? with * in aws expression', () => {
    const result = normalizeToUnix('0 12 ? * * *', 'aws');
    expect(result).not.toContain('?');
  });

  it('replaces ? with * in unix passthrough', () => {
    const result = normalizeToUnix('0 12 ? * *', 'unix');
    expect(result).not.toContain('?');
  });

  it('handles aws expression with year field stripped correctly', () => {
    const result = normalizeToUnix('0 10 ? * MON-FRI 2025', 'aws');
    expect(result).toBe('0 10 * * MON-FRI');
  });
});

describe('expectedFieldCount', () => {
  it('returns 5 for unix', () => expect(expectedFieldCount('unix')).toBe(5));
  it('returns 5 for github', () => expect(expectedFieldCount('github')).toBe(5));
  it('returns 6 for quartz', () => expect(expectedFieldCount('quartz')).toBe(6));
  it('returns 6 for aws', () => expect(expectedFieldCount('aws')).toBe(6));
});
