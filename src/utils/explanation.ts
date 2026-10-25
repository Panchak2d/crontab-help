import type { CronFormat } from '../types';
import { formatLabel } from '../core/formats';
import { formatNextRunDate } from './formatDate';
import { localeName, type LocaleCode } from './locale';

export function buildExplanation(
  expression: string,
  format: CronFormat,
  description: string,
  nextDates: Date[],
  timezone: string,
  locale: LocaleCode = 'en',
): string {
  const lines = [
    `Expression: ${expression.trim()}`,
    `Format: ${formatLabel(format)}`,
    `Meaning: ${description}`,
    `Language: ${localeName(locale)} (${locale})`,
    `Timezone: ${timezone}`,
    'Next runs:',
    ...nextDates.map((d, i) => `  ${i + 1}. ${formatNextRunDate(d, timezone)}`),
  ];
  return lines.join('\n');
}
