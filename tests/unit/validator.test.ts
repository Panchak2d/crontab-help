import { describe, it, expect } from 'vitest';
import { validateExpression } from '../../src/core/validator';
import { normalizeToUnix } from '../../src/core/formats';
import { parseCronExpression } from '../../src/core/parser';
import { CRON_PRESETS } from '../../src/utils/constants';

const first = (e: string, f: Parameters<typeof validateExpression>[1]) => validateExpression(e, f)[0];

describe('validateExpression', () => {
  it('names the field and allowed range for an out-of-range value', () => {
    const issue = first('75 * * * *', 'unix');
    expect(issue.fieldIndex).toBe(0);
    expect(issue.message).toContain('Minute');
    expect(issue.message).toContain('0–59');
  });

  it('rejects ? in unix and github with a hint to use *', () => {
    expect(first('0 12 ? * *', 'unix').message).toContain('Use *');
    expect(first('0 12 * * 7', 'github').message).toContain('0–6');
  });

  it('rejects an invalid step and a stray comma', () => {
    expect(first('*/0 * * * *', 'unix').message).toContain('step');
    expect(first('1,,2 * * * *', 'unix').message).toContain('empty');
  });

  it('requires ? in exactly one day field for aws and quartz', () => {
    expect(first('0 9 * * MON-FRI *', 'aws').message).toContain('requires ?');
    expect(first('0 9 ? * ? *', 'aws').message).toContain('both be ?');
    expect(first('0 0 9 * * MON', 'quartz').fieldIndex).toBe(5);
    expect(validateExpression('0 9 ? * MON-FRI *', 'aws')).toEqual([]);
  });

  it('accepts quartz/aws specials and rejects weekday 0', () => {
    for (const e of ['0 0 0 L * ?', '0 0 0 15W * ?', '0 0 0 ? * 6#3', '0 0 0 ? * FRIL', '0 0 0 LW * ?', '0 0 0 L-3 * ?']) {
      expect(validateExpression(e, 'quartz'), e).toEqual([]);
    }
    expect(first('0 0 0 ? * 0', 'quartz').message).toContain('1–7');
    expect(first('0 0 0 ? * 1#6', 'quartz').message).toContain('1–5');
  });

  it('returns nothing when the field count is wrong (parser reports that)', () => {
    expect(validateExpression('* * *', 'unix')).toEqual([]);
  });
});

describe('weekday renumbering for quartz and aws', () => {
  it('shifts 1–7 (1 = Sunday) to unix 0–6', () => {
    expect(normalizeToUnix('0 9 ? * 2 *', 'aws')).toBe('0 9 * * 1');
    expect(normalizeToUnix('0 9 ? * 2-6 *', 'aws')).toBe('0 9 * * 1-5');
    expect(normalizeToUnix('0 0 9 ? * 1,7', 'quartz')).toBe('0 9 * * 0,6');
  });

  it('keeps names, steps and the #n occurrence untouched', () => {
    expect(normalizeToUnix('0 9 ? * MON-FRI *', 'aws')).toBe('0 9 * * MON-FRI');
    expect(normalizeToUnix('0 9 ? * 6#3 *', 'aws')).toBe('0 9 * * 5#3');
    expect(normalizeToUnix('0 0 9 ? * 1-7/2', 'quartz')).toBe('0 9 * * 0-6/2');
  });

  it('schedules aws weekday 2 on Monday', () => {
    const r = parseCronExpression('0 9 ? * 2 *', 'aws', 'UTC');
    expect(r.isValid).toBe(true);
    if (r.isValid) expect(r.nextDates[0].getUTCDay()).toBe(1);
  });
});

describe('presets', () => {
  it.each(CRON_PRESETS.map(p => [p.label, p] as const))('%s is valid in its own format', (_l, p) => {
    const r = parseCronExpression(p.expression, p.format, 'UTC');
    expect(r.isValid, r.isValid ? '' : r.errorMessage).toBe(true);
  });
});
