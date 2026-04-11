import type { CronFormat } from '../types';

/**
 * Normalizes an expression to 5-field Unix format so cron-parser can handle it.
 * Quartz: strip the leading seconds field.
 * AWS: strip the trailing year field, replace '?' with '*'.
 * Unix + GitHub: pass through unchanged.
 */
export function normalizeToUnix(expression: string, format: CronFormat): string {
  const fields = expression.trim().split(/\s+/);

  if (format === 'quartz' && fields.length === 6) {
    // Drop field 0 (seconds) → 5-field unix
    return fields.slice(1).join(' ');
  }

  if (format === 'aws' && fields.length === 6) {
    // Drop field 5 (year), replace '?' with '*'
    return fields
      .slice(0, 5)
      .map(f => (f === '?' ? '*' : f))
      .join(' ');
  }

  // Replace '?' with '*' for safety (unix/github passthrough)
  return fields.map(f => (f === '?' ? '*' : f)).join(' ');
}

/**
 * Returns the expected field count for a given format.
 */
export function expectedFieldCount(format: CronFormat): number {
  if (format === 'quartz' || format === 'aws') return 6;
  return 5;
}
