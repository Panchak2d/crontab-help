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
 * Normalizes any cron format to a 5-field Unix expression
 * that cron-parser can consume.
 *
 * Quartz  → strip leading seconds field
 * AWS     → strip trailing year field, replace '?' with '*'
 * Unix/GH → pass through, replacing any '?' with '*' for safety
 */
export function normalizeToUnix(expression: string, format: CronFormat): string {
  const fields = expression.trim().split(/\s+/);

  if (format === 'quartz' && fields.length === 6) {
    return fields.slice(1).join(' ');
  }

  if (format === 'aws' && fields.length === 6) {
    return fields
      .slice(0, 5)
      .map(f => (f === '?' ? '*' : f))
      .join(' ');
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
