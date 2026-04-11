import { useState, useMemo } from 'react';
import type { CronFormat } from '../types';
import { parseCronExpression } from '../core/parser';
import { describeCronExpression } from '../core/describer';

const DEFAULT_EXPRESSION = '*/5 * * * *';
const DEFAULT_FORMAT: CronFormat = 'unix';
const DEFAULT_TIMEZONE = 'UTC';

export function useCronState() {
  const [expression, setExpression] = useState<string>(DEFAULT_EXPRESSION);
  const [format, setFormat] = useState<CronFormat>(DEFAULT_FORMAT);
  const [timezone, setTimezone] = useState<string>(DEFAULT_TIMEZONE);
  const [cursorFieldIndex, setCursorFieldIndex] = useState<number>(-1);

  // useMemo keeps parse/describe from re-running on every unrelated render
  const parseResult = useMemo(
    () => parseCronExpression(expression, format, timezone),
    [expression, format, timezone]
  );

  const describeResult = useMemo(
    () => describeCronExpression(expression, format),
    [expression, format]
  );

  return {
    expression,
    setExpression,
    format,
    setFormat,
    timezone,
    setTimezone,
    cursorFieldIndex,
    setCursorFieldIndex,
    parseResult,
    describeResult,
  };
}
