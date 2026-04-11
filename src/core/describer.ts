import cronstrue from 'cronstrue';
import type { CronFormat } from '../types';
import { normalizeToUnix } from './formats';

export interface DescribeResult {
  description: string;
  isError: boolean;
}

/**
 * Converts a cron expression to a plain-English description.
 * Uses cronstrue v3.14 under the hood.
 * Normalizes expression to Unix 5-field before describing.
 */
export function describeCronExpression(
  expression: string,
  format: CronFormat
): DescribeResult {
  const trimmed = expression.trim();
  if (!trimmed) {
    return { description: 'Enter a cron expression above', isError: false };
  }

  try {
    const unixExpr = normalizeToUnix(trimmed, format);
    // Use 24-hour format for clarity in international context
    const description = cronstrue.toString(unixExpr, {
      use24HourTimeFormat: true,
      throwExceptionOnParseError: true,
    });
    return { description, isError: false };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Cannot describe expression';
    return { description: message, isError: true };
  }
}
