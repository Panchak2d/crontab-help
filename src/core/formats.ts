import type { CronFormat } from '../types';

// Human-readable format names for error messages
const FORMAT_LABELS: Record<CronFormat, string> = {
  unix:   'Unix',
  github: 'GitHub Actions',
  quartz: 'Quartz',
  aws:    'AWS EventBridge',
};

export function formatLabel(format: CronFormat): string {
  return FORMAT_LABELS[format];
}

/**
 * Returns the expected field count for a given cron format.
 * Unix and GitHub Actions: 5 fields (min hour dom month dow)
 * Quartz: 6 fields (sec min hour dom month dow)
 * AWS EventBridge: 6 fields (min hour dom month dow year)
 */
export function expectedFieldCount(format: CronFormat): number {
  return format === 'quartz' || format === 'aws' ? 6 : 5;
}

/**
 * Quartz and AWS number weekdays 1–7 (1 = Sunday); Unix uses 0–6 (0 = Sunday).
 * Shifts numeric weekdays down by one; names, steps and the #n occurrence are left alone.
 */
function shiftWeekdayToUnix(field: string): string {
  return field
    .split(',')
    .map(item => {
      if (item === 'L') return '6';
      const [base, ...step] = item.split('/');
      const [day, ...occurrence] = base.split('#');
      const shifted = day.replace(/\d+/g, n => String(Math.max(Number(n) - 1, 0)));
      return [[shifted, ...occurrence].join('#'), ...step].join('/');
    })
    .join(',');
}

/**
 * Normalizes any cron format to a 5-field Unix expression
 * that cron-parser can consume.
 *
 * Quartz  → strip leading seconds field, renumber weekdays
 * AWS     → strip trailing year field, replace '?' with '*', renumber weekdays
 * Unix/GH → pass through, replacing any '?' with '*' for safety
 */
export function normalizeToUnix(expression: string, format: CronFormat): string {
  const fields = expression.trim().split(/\s+/);

  if (format === 'quartz' && fields.length === 6) {
    const five = fields.slice(1).map(f => (f === '?' ? '*' : f));
    five[4] = shiftWeekdayToUnix(five[4]);
    return five.join(' ');
  }

  if (format === 'aws' && fields.length === 6) {
    const five = fields.slice(0, 5).map(f => (f === '?' ? '*' : f));
    five[4] = shiftWeekdayToUnix(five[4]);
    return five.join(' ');
  }

  return fields.map(f => (f === '?' ? '*' : f)).join(' ');
}

/**
 * Splits a cron expression string into its individual field tokens.
 * Used across parser, FieldExplainer, and CronInput — centralised here
 * so the regex lives in one place.
 */
export function splitFields(expression: string): string[] {
  return expression.trim().split(/\s+/);
}
