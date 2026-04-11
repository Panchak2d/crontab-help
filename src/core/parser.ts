import { CronExpressionParser } from 'cron-parser';
import type { CronFormat } from '../types';
import { normalizeToUnix, expectedFieldCount } from './formats';

export interface ParserSuccess {
  isValid: true;
  nextDates: Date[];
}

export interface ParserError {
  isValid: false;
  errorMessage: string;
}

export type ParserResult = ParserSuccess | ParserError;

// Field names by format for human-friendly error messages
const FIELD_NAMES: Record<CronFormat, string[]> = {
  unix:   ['minute', 'hour', 'day-of-month', 'month', 'day-of-week'],
  github: ['minute', 'hour', 'day-of-month', 'month', 'day-of-week'],
  quartz: ['second', 'minute', 'hour', 'day-of-month', 'month', 'day-of-week'],
  aws:    ['minute', 'hour', 'day-of-month', 'month', 'day-of-week', 'year'],
};

/**
 * Converts a raw cron-parser error into something a human can act on.
 */
function humaniseError(raw: string, expression: string, format: CronFormat): string {
  const fields = expression.trim().split(/\s+/);
  const fieldNames = FIELD_NAMES[format];

  // "Field value X is not in range Y-Z" → name the field
  const rangeMatch = raw.match(/Value (\S+) is out of range/i)
    || raw.match(/Field value (\S+) is not in range (\d+)-(\d+)/i);
  if (rangeMatch) {
    const badValue = rangeMatch[1];
    const fieldIndex = fields.findIndex(f => f.includes(badValue));
    const fieldName = fieldIndex >= 0 ? fieldNames[fieldIndex] ?? 'field' : 'a field';
    return `"${badValue}" is not valid for ${fieldName}. Check the allowed range.`;
  }

  // Too many spaces / empty tokens
  if (raw.toLowerCase().includes('empty')) {
    return 'Expression has an empty field. Make sure each field has a value (use * for "any").';
  }

  // Unknown character
  const charMatch = raw.match(/Unexpected char: (.)/);
  if (charMatch) {
    return `Unexpected character "${charMatch[1]}" in expression. Valid characters: digits, *, /, -, , and L W #.`;
  }

  // Slash step issues
  if (raw.includes('/0')) return 'Step value cannot be zero (e.g. */0 is invalid — try */5 for every 5 units).';

  return raw.length < 80 ? raw : 'Invalid cron expression. Check each field is within its allowed range.';
}

/**
 * Parses a cron expression and returns the next N run dates.
 * Uses cron-parser v5 API: CronExpressionParser.parse() + .take()
 */
export function parseCronExpression(
  expression: string,
  format: CronFormat,
  timezone: string,
  count: number = 10
): ParserResult {
  const trimmed = expression.trim();

  if (!trimmed) {
    return { isValid: false, errorMessage: 'Enter a cron expression above' };
  }

  const fields = trimmed.split(/\s+/);
  const expected = expectedFieldCount(format);

  if (fields.length !== expected) {
    const fieldNames = FIELD_NAMES[format];
    const got = fields.length;
    const missing = expected > got
      ? `Missing: ${fieldNames.slice(got).join(', ')}`
      : `Too many fields — remove the extra ${got - expected}`;
    return {
      isValid: false,
      errorMessage: `${format === 'unix' || format === 'github' ? 'Unix' : format === 'quartz' ? 'Quartz' : 'AWS'} format needs ${expected} fields, got ${got}. ${missing}.`,
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
