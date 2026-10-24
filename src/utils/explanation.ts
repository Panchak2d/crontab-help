import type { CronFormat } from '../types';
import { formatLabel } from '../core/formats';
import { formatNextRunDate } from './formatDate';

export function buildExplanation(
  expression: string,
  format: CronFormat,
  description: string,
  nextDates: Date[],
  timezone: string,
): string {
  const lines = [
    `Expression: ${expression.trim()}`,
    `Format: ${formatLabel(format)}`,
    `Meaning: ${description}`,
    `Timezone: ${timezone}`,
    'Next runs:',
    ...nextDates.map((d, i) => `  ${i + 1}. ${formatNextRunDate(d, timezone)}`),
  ];
  return lines.join('\n');
}
