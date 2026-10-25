import { useState, useMemo } from 'react';
import type { CronFormat } from '../types';
import { parseCronExpression } from '../core/parser';
import { readFromUrl } from './useUrlSync';
import { useDescription } from './useDescription';

const DEFAULT_EXPRESSION = '*/5 * * * *';
const DEFAULT_FORMAT: CronFormat = 'unix';
const DEFAULT_TIMEZONE = 'UTC';

export function useCronState() {
  // Read the URL before the first render so the sync effect never overwrites it
  const [initial] = useState(readFromUrl);
  const [expression, setExpression] = useState(initial.expression || DEFAULT_EXPRESSION);
  const [format, setFormat] = useState<CronFormat>(initial.format ?? DEFAULT_FORMAT);
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);

  // Parse first — validation is cheap and gates the describe call
  const parseResult = useMemo(
    () => parseCronExpression(expression, format, timezone),
    [expression, format, timezone],
  );

  const description = useDescription(expression, format);

  return {
    expression, setExpression,
    format,     setFormat,
    timezone,   setTimezone,
    parseResult,
    ...description,
  };
}
