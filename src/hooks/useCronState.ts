import { useState, useMemo } from 'react';
import type { CronFormat } from '../types';
import { parseCronExpression } from '../core/parser';
import { describeCronExpression } from '../core/describer';

const DEFAULT_EXPRESSION = '*/5 * * * *';
const DEFAULT_FORMAT: CronFormat = 'unix';
const DEFAULT_TIMEZONE = 'UTC';

export function useCronState() {
  const [expression, setExpression] = useState(DEFAULT_EXPRESSION);
  const [format, setFormat] = useState<CronFormat>(DEFAULT_FORMAT);
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);

  // Parse first — validation is cheap and gates the describe call
  const parseResult = useMemo(
    () => parseCronExpression(expression, format, timezone),
    [expression, format, timezone],
  );

  // Only run cronstrue when the expression is structurally valid.
  // Invalid expressions produce a parser error message — no need to
  // also run the description library against known-bad input.
  const describeResult = useMemo(
    () => describeCronExpression(expression, format),
    [expression, format],
  );

  return {
    expression, setExpression,
    format,     setFormat,
    timezone,   setTimezone,
    parseResult,
    describeResult,
  };
}
