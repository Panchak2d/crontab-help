import { describe, it, expect } from 'vitest';
import { getTimezones, isValidTimezone } from '../../src/utils/timezones';
import { buildExplanation } from '../../src/utils/explanation';

describe('timezones', () => {
  it('lists UTC first and includes zones beyond the curated list', () => {
    const list = getTimezones();
    expect(list[0]).toBe('UTC');
    expect(list).toContain('Asia/Kolkata');
    expect(list.length).toBeGreaterThan(12);
  });

  it('validates only known IANA names', () => {
    expect(isValidTimezone('Europe/Paris')).toBe(true);
    expect(isValidTimezone('Mars/Olympus')).toBe(false);
    expect(isValidTimezone('')).toBe(false);
  });
});

describe('buildExplanation', () => {
  it('includes expression, format, meaning, timezone and numbered runs', () => {
    const out = buildExplanation(
      ' 0 9 * * 1-5 ', 'unix', 'At 09:00, Monday through Friday',
      [new Date('2026-10-26T09:00:00Z')], 'UTC',
    );
    expect(out).toContain('Expression: 0 9 * * 1-5\n');
    expect(out).toContain('Format: Unix');
    expect(out).toContain('Timezone: UTC');
    expect(out).toContain('  1. Mon, Oct 26, 2026, 09:00:00');
    expect(out).toContain('Language: English (en)');
    expect(
      buildExplanation('0 9 * * *', 'unix', 'x', [], 'UTC', 'de'),
    ).toContain('Language: Deutsch (de)');
  });
});
