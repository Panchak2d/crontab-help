import { describe, it, expect } from 'vitest';
import type { CronFormat } from '../../src/types';
import {
  buildExpression, convertExpression, parseBuilderState, toggleValue,
  DEFAULT_BUILDER_STATE, type BuilderState, type DaysField, type MonthField, type TimeField,
} from '../../src/core/builder';
import { validateExpression } from '../../src/core/validator';
import { parseCronExpression } from '../../src/core/parser';
import { describeCronExpression } from '../../src/core/describer';

const FORMATS: CronFormat[] = ['unix', 'github', 'quartz', 'aws'];

const MINUTES: TimeField[] = [
  { mode: 'any' }, { mode: 'step', step: 15 }, { mode: 'at', values: [0] },
  { mode: 'at', values: [0, 15, 30, 45] }, { mode: 'at', values: [5, 6, 7, 8, 9, 59] },
];
const HOURS: TimeField[] = [
  { mode: 'any' }, { mode: 'step', step: 6 }, { mode: 'at', values: [9] }, { mode: 'at', values: [9, 10, 11, 12, 17] },
];
const DAYS: DaysField[] = [
  { mode: 'every' }, { mode: 'week', weekdays: [1, 2, 3, 4, 5] }, { mode: 'week', weekdays: [0, 6] },
  { mode: 'week', weekdays: [0, 1, 2, 3, 4, 5, 6] }, { mode: 'month', days: [1] }, { mode: 'month', days: [1, 15, 31] },
];
const MONTHS: MonthField[] = [
  { mode: 'any' }, { mode: 'at', months: [1] }, { mode: 'at', months: [1, 4, 7, 10] },
  { mode: 'at', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
];

function allStates(): BuilderState[] {
  const out: BuilderState[] = [];
  for (const minute of MINUTES) for (const hour of HOURS) for (const days of DAYS) for (const month of MONTHS) {
    out.push({ minute, hour, days, month });
  }
  return out;
}

describe('builder output', () => {
  it.each(FORMATS)('every sweep state is valid, parseable, describable and round-trips in %s', format => {
    for (const state of allStates()) {
      const expr = buildExpression(state, format);
      expect(validateExpression(expr, format), expr).toEqual([]);
      expect(parseCronExpression(expr, format, 'UTC').isValid, expr).toBe(true);
      expect(describeCronExpression(expr, format).isError, expr).toBe(false);
      expect(parseBuilderState(expr, format), expr).toEqual({ kind: 'ok', state });
    }
  });

  it.each(FORMATS)('each weekday lands on the right day of the week in %s', format => {
    for (let day = 0; day <= 6; day++) {
      const expr = buildExpression({ ...DEFAULT_BUILDER_STATE, minute: { mode: 'at', values: [0] }, days: { mode: 'week', weekdays: [day] } }, format);
      const result = parseCronExpression(expr, format, 'UTC');
      if (!result.isValid) throw new Error(expr);
      expect(result.nextDates.every(d => d.getUTCDay() === day), expr).toBe(true);
    }
  });

  it('places ? in whichever day field is unused for Quartz and AWS', () => {
    const week: BuilderState = { ...DEFAULT_BUILDER_STATE, days: { mode: 'week', weekdays: [1, 2, 3, 4, 5] } };
    const month: BuilderState = { ...DEFAULT_BUILDER_STATE, days: { mode: 'month', days: [1] } };
    expect(buildExpression(week, 'quartz')).toBe('0 * * ? * MON-FRI');
    expect(buildExpression(week, 'aws')).toBe('* * ? * MON-FRI *');
    expect(buildExpression(month, 'quartz')).toBe('0 * * 1 * ?');
    expect(buildExpression(DEFAULT_BUILDER_STATE, 'aws')).toBe('* * * * ? *');
  });
});

describe('parseBuilderState', () => {
  it('reads typed expressions the builder can represent, including Unix Sunday as 7 and names', () => {
    expect(parseBuilderState('0 9 * * 7', 'unix')).toMatchObject({ kind: 'ok', state: { days: { mode: 'week', weekdays: [0] } } });
    expect(parseBuilderState('0 0 9 ? * mon-fri', 'quartz')).toMatchObject({ kind: 'ok', state: { days: { mode: 'week', weekdays: [1, 2, 3, 4, 5] } } });
    expect(parseBuilderState('0 0 1 jan,jul *', 'unix')).toMatchObject({ kind: 'ok', state: { month: { mode: 'at', months: [1, 7] } } });
  });

  it('treats an empty expression as the default state', () => {
    expect(parseBuilderState('  ', 'unix')).toEqual({ kind: 'ok', state: DEFAULT_BUILDER_STATE });
  });

  it.each([
    ['*/7 * * * *', 'unix'],
    ['0 0 1 * 1', 'unix'],
    ['0 0 0 L * ?', 'quartz'],
    ['0 0 9 ? * 2#1', 'quartz'],
    ['5 0 9 ? * MON', 'quartz'],
    ['0 9 ? * MON 2026', 'aws'],
    ['0-30/5 * * * *', 'unix'],
  ] as [string, CronFormat][])('marks valid-but-unrepresentable %s as complex', (expr, format) => {
    expect(parseBuilderState(expr, format).kind).toBe('complex');
  });

  it.each([['abc', 'unix'], ['* * * *', 'unix'], ['0 0 9 * * *', 'quartz'], ['61 * * * *', 'unix']] as [string, CronFormat][])(
    'marks %s as invalid', (expr, format) => {
      expect(parseBuilderState(expr, format).kind).toBe('invalid');
    });
});

describe('convertExpression', () => {
  it('re-generates field count, weekday numbering and ? placement across formats', () => {
    expect(convertExpression('0 9 * * 1-5', 'unix', 'quartz')).toBe('0 0 9 ? * MON-FRI');
    expect(convertExpression('0 9 * * 1-5', 'unix', 'aws')).toBe('0 9 ? * MON-FRI *');
    expect(convertExpression('0 0 9 ? * MON-FRI', 'quartz', 'unix')).toBe('0 9 * * MON-FRI');
    expect(convertExpression('*/5 * * * *', 'unix', 'quartz')).toBe('0 */5 * * * ?');
  });

  it('leaves unix/github expressions that are already valid unchanged, and fixes Sunday = 7', () => {
    expect(convertExpression('0 9 * * 1-5', 'unix', 'github')).toBeNull();
    expect(convertExpression('0 9 * * 7', 'unix', 'github')).toBe('0 9 * * SUN');
  });

  it('never rewrites empty, invalid or complex input', () => {
    expect(convertExpression('', 'unix', 'quartz')).toBeNull();
    expect(convertExpression('0 0 0 L * ?', 'quartz', 'unix')).toBeNull();
    expect(convertExpression('garbage', 'unix', 'aws')).toBeNull();
  });
});

describe('toggleValue', () => {
  it('adds in order, removes, and keeps the last value', () => {
    expect(toggleValue([1, 5], 3)).toEqual([1, 3, 5]);
    expect(toggleValue([1, 3], 3)).toEqual([1]);
    expect(toggleValue([1], 1)).toEqual([1]);
  });
});
