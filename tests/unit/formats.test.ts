import { describe, it, expect } from 'vitest';
import {
  normalizeToUnix,
  expectedFieldCount,
  splitFields,
  formatLabel,
} from '../../src/core/formats';

describe('normalizeToUnix', () => {
  it('passes through a unix expression unchanged', () => {
    expect(normalizeToUnix('*/5 * * * *', 'unix')).toBe('*/5 * * * *');
  });

  it('passes through a github expression unchanged', () => {
    expect(normalizeToUnix('30 5 * * 1,3,5', 'github')).toBe('30 5 * * 1,3,5');
  });

  it('strips the leading seconds field from a quartz expression', () => {
    expect(normalizeToUnix('0 30 9 * * MON-FRI', 'quartz')).toBe('30 9 * * MON-FRI');
  });

  it('passes through a quartz expression with fewer than 6 fields without crashing', () => {
    expect(normalizeToUnix('* * * * *', 'quartz')).toBe('* * * * *');
  });

  it('strips the trailing year field from an aws expression', () => {
    expect(normalizeToUnix('0 10 ? * MON-FRI *', 'aws')).toBe('0 10 * * MON-FRI');
  });

  it('strips a 4-digit year field from an aws expression', () => {
    expect(normalizeToUnix('0 10 ? * MON-FRI 2025', 'aws')).toBe('0 10 * * MON-FRI');
  });

  it('replaces ? with * in aws expressions', () => {
    expect(normalizeToUnix('0 12 ? * * *', 'aws')).not.toContain('?');
  });

  it('replaces ? with * in unix expressions', () => {
    expect(normalizeToUnix('0 12 ? * *', 'unix')).not.toContain('?');
  });
});

describe('expectedFieldCount', () => {
  it('returns 5 for unix',   () => expect(expectedFieldCount('unix')).toBe(5));
  it('returns 5 for github', () => expect(expectedFieldCount('github')).toBe(5));
  it('returns 6 for quartz', () => expect(expectedFieldCount('quartz')).toBe(6));
  it('returns 6 for aws',    () => expect(expectedFieldCount('aws')).toBe(6));
});

describe('splitFields', () => {
  it('splits a standard expression into tokens', () => {
    expect(splitFields('*/5 * * * *')).toEqual(['*/5', '*', '*', '*', '*']);
  });

  it('trims leading and trailing whitespace before splitting', () => {
    expect(splitFields('  0 9 * * *  ')).toEqual(['0', '9', '*', '*', '*']);
  });

  it('collapses multiple spaces between fields', () => {
    expect(splitFields('0  9  *  *  *')).toEqual(['0', '9', '*', '*', '*']);
  });

  it('handles a 6-field quartz expression', () => {
    expect(splitFields('0 30 9 * * MON-FRI')).toHaveLength(6);
  });
});

describe('formatLabel', () => {
  it('returns a readable label for each format', () => {
    expect(formatLabel('unix')).toBe('Unix');
    expect(formatLabel('github')).toBe('GitHub Actions');
    expect(formatLabel('quartz')).toBe('Quartz');
    expect(formatLabel('aws')).toBe('AWS EventBridge');
  });
});
