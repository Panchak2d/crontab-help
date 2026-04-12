import { CronExpressionParser } from 'cron-parser';
import type { CronFormat } from '../types';
import { normalizeToUnix, expectedFieldCount, splitFields, formatLabel } from './formats';

export interface ParserSuccess {
  isValid: true;
  nextDates: Date[];
}

export interface ParserError {
  isValid: false;
  errorMessage: string;
}

export type ParserResult = ParserSuccess | ParserError;

// Field names indexed by format — used to name the offending field in errors
const FIELD_NAMES: Record<CronFormat, string[]> = {
  unix:   ['minute', 'hour', 'day-of-month', 'month', 'day-of-week'],
  github: ['minute', 'hour', 'day-of-month', 'month', 'day-of-week'],
  quartz: ['second', 'minute', 'hour', 'day-of-month', 'month', 'day-of-week'],
  aws:    ['minute', 'hour', 'day-of-month', 'month', 'day-of-week', 'year'],
};

/**
 * Converts a raw cron-parser error into an actionable human message.
 * Tries to name the specific field that caused the problem.
 */
function humaniseError(raw: string, expression: string, format: CronFormat): string {
  const fields = splitFields(expression);
  const fieldNames = FIELD_NAMES[format];

  const rangeMatch = raw.match(/Value (\S+) is out of range/i)
    || raw.match(/Field value (\S+) is not in range \d+-\d+/i);
  if (rangeMatch) {
    const badValue = rangeMatch[1];
    const fieldIndex = fields.findIndex(f => f.includes(badValue));
    const fieldName = fieldIndex >= 0 ? (fieldNames[fieldIndex] ?? 'field') : 'a field';
    return `"${badValue}" is not valid for ${fieldName}. Check the allowed range.`;
  }

  if (raw.toLowerCase().includes('empty')) {
    return 'Expression has an empty field. Use * to mean "any value".';
  }

  const charMatch = raw.match(/Unexpected char: (.)/);
  if (charMatch) {
    return `Unexpected character "${charMatch[1]}". Valid characters: digits, * / - , L W #`;
  }

  if (raw.includes('/0')) {
    return 'Step value cannot be zero (e.g. */0 is invalid — use */5 for every 5 units).';
  }

  return raw.length < 100 ? raw : 'Invalid expression. Check each field is within its allowed range.';
}

/**
 * Parses a cron expression and returns the next N scheduled run dates.
 *
 * Validates field count before parsing so the error message names the missing
 * fields rather than surfacing a raw cron-parser exception.
 */
export function parseCronExpression(
  expression: string,
  format: CronFormat,
  timezone: string,
  count = 10,
): ParserResult {
  const trimmed = expression.trim();
  if (!trimmed) {
    return { isValid: false, errorMessage: 'Enter a cron expression above' };
  }

  const fields = splitFields(trimmed);
  const expected = expectedFieldCount(format);

  if (fields.length !== expected) {
    const fieldNames = FIELD_NAMES[format];
    const got = fields.length;
    const hint = expected > got
      ? `Missing: ${fieldNames.slice(got).join(', ')}`
      : `Remove the extra ${got - expected} field${got - expected > 1 ? 's' : ''}`;
    return {
      isValid: false,
      errorMessage: `${formatLabel(format)} needs ${expected} fields, got ${got}. ${hint}.`,
    };
  }

  try {
    const unixExpr = normalizeToUnix(trimmed, format);
    const interval = CronExpressionParser.parse(unixExpr, { tz: timezone });
    const nextDates = interval.take(count).map(dt => dt.toDate());
    return { isValid: true, nextDates };
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : 'Invalid cron expression';
    return { isValid: false, errorMessage: humaniseError(raw, trimmed, format) };
  }
}
