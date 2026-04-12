import cronstrue from 'cronstrue';
import type { CronFormat } from '../types';
import { normalizeToUnix } from './formats';

export interface DescribeResult {
  description: string;
  isError: boolean;
}

/**
 * Converts a cron expression into a plain-English description.
 *
 * Uses cronstrue after normalizing to Unix 5-field format.
 * Returns a placeholder when the expression is empty so the
 * UI always has something to display.
 */
export function describeCronExpression(expression: string, format: CronFormat): DescribeResult {
  const trimmed = expression.trim();

  if (!trimmed) {
    return { description: 'Type a cron expression above to see what it means', isError: false };
  }

  try {
    const unixExpr = normalizeToUnix(trimmed, format);
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
