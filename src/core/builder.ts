import type { CronFormat } from '../types';
import { expectedFieldCount, splitFields } from './formats';
import { validateExpression } from './validator';

export type TimeField =
  | { mode: 'any' }
  | { mode: 'step'; step: number }
  | { mode: 'at'; values: number[] };

export type DaysField =
  | { mode: 'every' }
  | { mode: 'week'; weekdays: number[] }
  | { mode: 'month'; days: number[] };

export type MonthField =
  | { mode: 'any' }
  | { mode: 'at'; months: number[] };

/** Weekdays are stored as 0–6 with 0 = Sunday, whatever the cron format. */
export interface BuilderState {
  minute: TimeField;
  hour: TimeField;
  days: DaysField;
  month: MonthField;
}

export type BuilderParse =
  | { kind: 'ok'; state: BuilderState }
  | { kind: 'invalid' }
  | { kind: 'complex' };

// Only divisors of the period: other steps leave an uneven gap when the field wraps (e.g. */7 → 56 then 0)
export const MINUTE_STEPS = [2, 3, 4, 5, 6, 10, 12, 15, 20, 30];
export const HOUR_STEPS = [2, 3, 4, 6, 8, 12];

export const WEEKDAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export const DEFAULT_BUILDER_STATE: BuilderState = {
  minute: { mode: 'any' },
  hour: { mode: 'any' },
  days: { mode: 'every' },
  month: { mode: 'any' },
};

const isExtended = (format: CronFormat) => format === 'quartz' || format === 'aws';
const isFiveField = (format: CronFormat) => format === 'unix' || format === 'github';

/** Collapses runs of three or more consecutive values into a-b ranges. */
function formatValues(values: number[], render: (n: number) => string = String): string {
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  const parts: string[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    if (j - i >= 2) {
      parts.push(`${render(sorted[i])}-${render(sorted[j])}`);
    } else {
      for (let k = i; k <= j; k++) parts.push(render(sorted[k]));
    }
    i = j + 1;
  }
  return parts.join(',');
}

function timeText(field: TimeField): string {
  if (field.mode === 'any') return '*';
  if (field.mode === 'step') return `*/${field.step}`;
  return formatValues(field.values);
}

/** Weekdays are emitted as SUN–SAT names, which every supported format reads identically, so no per-format numbering is needed. */
export function buildExpression(state: BuilderState, format: CronFormat): string {
  const extended = isExtended(format);
  const month = state.month.mode === 'any' ? '*' : formatValues(state.month.months);
  let dom = '*';
  let dow = extended ? '?' : '*';
  if (state.days.mode === 'week') {
    dow = formatValues(state.days.weekdays, n => WEEKDAY_NAMES[n]);
    if (extended) dom = '?';
  } else if (state.days.mode === 'month') {
    dom = formatValues(state.days.days);
  }

  const core = [timeText(state.minute), timeText(state.hour), dom, month, dow];
  if (format === 'quartz') return ['0', ...core].join(' ');
  if (format === 'aws') return [...core, '*'].join(' ');
  return core.join(' ');
}

type Resolver = (token: string) => number | null;

const numberToken: Resolver = token => (/^\d+$/.test(token) ? Number(token) : null);

function nameResolver(names: string[], firstValue: number): Resolver {
  return token => {
    if (/^\d+$/.test(token)) return Number(token);
    const index = names.indexOf(token.toUpperCase());
    return index === -1 ? null : index + firstValue;
  };
}

function parseList(value: string, resolve: Resolver, min: number, max: number): number[] | null {
  const out = new Set<number>();
  for (const item of value.split(',')) {
    const [from, to, ...rest] = item.split('-');
    if (rest.length > 0) return null;
    const a = resolve(from);
    const b = to === undefined ? a : resolve(to);
    if (a === null || b === null || a > b || a < min || b > max) return null;
    for (let n = a; n <= b; n++) out.add(n);
  }
  return [...out].sort((x, y) => x - y);
}

function parseTimeField(value: string, max: number, steps: number[]): TimeField | null {
  if (value === '*') return { mode: 'any' };
  const step = value.match(/^\*\/(\d+)$/);
  if (step) {
    const n = Number(step[1]);
    if (n === 1) return { mode: 'any' };
    return steps.includes(n) ? { mode: 'step', step: n } : null;
  }
  const values = parseList(value, numberToken, 0, max);
  return values && { mode: 'at', values };
}

function parseWeekdays(value: string, format: CronFormat): number[] | null {
  const extended = isExtended(format);
  const sunday = extended ? 1 : 0;
  const max = extended || format === 'unix' ? 7 : 6;
  const numbers = parseList(value, nameResolver(WEEKDAY_NAMES, sunday), sunday, max);
  return numbers && [...new Set(numbers.map(n => (n - sunday) % 7))].sort((a, b) => a - b);
}

function parseDays(dom: string, dow: string, format: CronFormat): DaysField | null {
  const domAny = dom === '*' || dom === '?';
  const dowAny = dow === '*' || dow === '?';
  if (domAny && dowAny) return { mode: 'every' };
  if (domAny) {
    const weekdays = parseWeekdays(dow, format);
    return weekdays && { mode: 'week', weekdays };
  }
  if (dowAny) {
    const days = parseList(dom, numberToken, 1, 31);
    return days && { mode: 'month', days };
  }
  // Unix cron treats a restricted day-of-month and day-of-week as "either", which the builder does not model
  return null;
}

function readFields(fields: string[], format: CronFormat): BuilderState | null {
  let core = fields;
  if (format === 'quartz') {
    if (fields[0] !== '0') return null;
    core = fields.slice(1);
  } else if (format === 'aws') {
    if (fields[5] !== '*') return null;
    core = fields.slice(0, 5);
  }

  const [min, hour, dom, mon, dow] = core;
  const minute = parseTimeField(min, 59, MINUTE_STEPS);
  const hours = parseTimeField(hour, 23, HOUR_STEPS);
  const days = parseDays(dom, dow, format);
  const months = mon === '*' ? [] : parseList(mon, nameResolver(MONTH_NAMES, 1), 1, 12);
  if (!minute || !hours || !days || !months) return null;

  return {
    minute,
    hour: hours,
    days,
    month: mon === '*' ? { mode: 'any' } : { mode: 'at', months },
  };
}

/**
 * Reads an expression into builder state.
 * An empty expression yields the default state; `invalid` means the expression
 * fails validation for the format, `complex` means it is valid but not representable.
 */
export function parseBuilderState(expression: string, format: CronFormat): BuilderParse {
  const trimmed = expression.trim();
  if (!trimmed) return { kind: 'ok', state: DEFAULT_BUILDER_STATE };

  const fields = splitFields(trimmed);
  if (fields.length !== expectedFieldCount(format) || validateExpression(trimmed, format).length > 0) {
    return { kind: 'invalid' };
  }
  const state = readFields(fields, format);
  return state ? { kind: 'ok', state } : { kind: 'complex' };
}

/**
 * Rewrites an expression for another format, or returns null to leave it untouched:
 * empty, unrepresentable, or already valid as-is between the two 5-field formats.
 */
export function convertExpression(expression: string, from: CronFormat, to: CronFormat): string | null {
  if (from === to || !expression.trim()) return null;
  if (isFiveField(from) && isFiveField(to) && validateExpression(expression, to).length === 0) return null;
  const parsed = parseBuilderState(expression, from);
  return parsed.kind === 'ok' ? buildExpression(parsed.state, to) : null;
}

/** Toggles a value in a sorted set, never removing the last one. */
export function toggleValue(values: number[], value: number): number[] {
  if (!values.includes(value)) return [...values, value].sort((a, b) => a - b);
  return values.length > 1 ? values.filter(v => v !== value) : values;
}
