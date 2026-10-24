import type { CronFormat } from '../types';
import { expectedFieldCount, formatLabel, splitFields } from './formats';

export interface FieldIssue {
  fieldIndex: number;
  message: string;
}

interface FieldSpec {
  label: string;
  min: number;
  max: number;
  names?: Record<string, number>;
  question?: boolean;
  last?: boolean;
  lastWeekday?: boolean;
  nearestWeekday?: boolean;
  nthLast?: boolean;
  nth?: boolean;
}

const MONTH_NAMES: Record<string, number> = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
};

function dayNames(sundayValue: number): Record<string, number> {
  return {
    SUN: sundayValue, MON: sundayValue + 1, TUE: sundayValue + 2, WED: sundayValue + 3,
    THU: sundayValue + 4, FRI: sundayValue + 5, SAT: sundayValue + 6,
  };
}

const MINUTE: FieldSpec = { label: 'Minute', min: 0, max: 59 };
const SECOND: FieldSpec = { label: 'Second', min: 0, max: 59 };
const HOUR: FieldSpec = { label: 'Hour', min: 0, max: 23 };
const MONTH: FieldSpec = { label: 'Month', min: 1, max: 12, names: MONTH_NAMES };
const DOM_PLAIN: FieldSpec = { label: 'Day (month)', min: 1, max: 31 };
const DOM_EXT: FieldSpec = {
  ...DOM_PLAIN, question: true, last: true, lastWeekday: true, nearestWeekday: true, nthLast: true,
};
const DOW_UNIX: FieldSpec = { label: 'Day (week)', min: 0, max: 7, names: dayNames(0) };
const DOW_GITHUB: FieldSpec = { label: 'Day (week)', min: 0, max: 6, names: dayNames(0) };
const DOW_EXT: FieldSpec = {
  label: 'Day (week)', min: 1, max: 7, names: dayNames(1),
  question: true, last: true, nthLast: true, nth: true,
};
const YEAR: FieldSpec = { label: 'Year', min: 1970, max: 2199 };

const SPECS: Record<CronFormat, FieldSpec[]> = {
  unix:   [MINUTE, HOUR, DOM_PLAIN, MONTH, DOW_UNIX],
  github: [MINUTE, HOUR, DOM_PLAIN, MONTH, DOW_GITHUB],
  quartz: [SECOND, MINUTE, HOUR, DOM_EXT, MONTH, DOW_EXT],
  aws:    [MINUTE, HOUR, DOM_EXT, MONTH, DOW_EXT, YEAR],
};

function rangeText(spec: FieldSpec): string {
  return `${spec.min}–${spec.max}${spec.names ? ' or a name' : ''}`;
}

function checkValue(token: string, spec: FieldSpec): string | null {
  const value = /^\d+$/.test(token) ? Number(token) : spec.names?.[token.toUpperCase()];
  if (value === undefined) {
    return `"${token}" is not a valid value. Use ${rangeText(spec)}, *, a range (a-b), a list (a,b) or a step (*/n).`;
  }
  if (value < spec.min || value > spec.max) {
    return `"${token}" is out of range. Allowed: ${spec.min}–${spec.max}.`;
  }
  return null;
}

function checkItem(item: string, spec: FieldSpec, format: CronFormat): string | null {
  if (item === '') return 'has an empty entry. Remove the stray comma.';
  if (item === '?') {
    return spec.question ? null : `"?" is not supported in ${formatLabel(format)}. Use * for "any value".`;
  }
  if (spec.last && item === 'L') return null;
  if (spec.lastWeekday && item === 'LW') return null;

  const offset = item.match(/^L-(\d+)$/);
  if (offset && spec.nthLast && spec.label === 'Day (month)') {
    const n = Number(offset[1]);
    return n >= 1 && n <= 30 ? null : `"${item}" offset must be 1–30.`;
  }
  const weekday = item.match(/^(\d+)W$/);
  if (weekday && spec.nearestWeekday) return checkValue(weekday[1], spec);
  const lastDow = item.match(/^([A-Za-z0-9]+)L$/);
  if (lastDow && spec.nthLast && spec.label === 'Day (week)') return checkValue(lastDow[1], spec);
  const nth = item.match(/^([A-Za-z0-9]+)#(\d+)$/);
  if (nth && spec.nth) {
    const err = checkValue(nth[1], spec);
    if (err) return err;
    const n = Number(nth[2]);
    return n >= 1 && n <= 5 ? null : `"${item}": the occurrence after # must be 1–5.`;
  }

  const [base, step, ...extra] = item.split('/');
  if (extra.length > 0) return `"${item}" has more than one "/".`;
  if (step !== undefined && (!/^\d+$/.test(step) || Number(step) < 1)) {
    return `step "${step}" must be a positive number (e.g. */5 for every 5).`;
  }
  if (base === '*') return null;

  if (base.includes('-')) {
    const [from, to, ...more] = base.split('-');
    if (more.length > 0 || !from || !to) return `"${item}" is not a valid range. Use a-b.`;
    return checkValue(from, spec) ?? checkValue(to, spec);
  }
  return checkValue(base, spec);
}

/**
 * Returns one issue per offending field plus any cross-field rule violation.
 * Field-count mismatches are reported by the parser, so a wrong count yields no issues here.
 */
export function validateExpression(expression: string, format: CronFormat): FieldIssue[] {
  const fields = splitFields(expression);
  if (fields.length !== expectedFieldCount(format)) return [];

  const specs = SPECS[format];
  const issues: FieldIssue[] = [];

  fields.forEach((field, i) => {
    for (const item of field.split(',')) {
      const problem = checkItem(item, specs[i], format);
      if (problem) {
        issues.push({ fieldIndex: i, message: `${specs[i].label}: ${problem}` });
        return;
      }
    }
  });

  if (format === 'quartz' || format === 'aws') {
    const domIndex = format === 'quartz' ? 3 : 2;
    const dowIndex = domIndex + 2;
    const domIsQ = fields[domIndex] === '?';
    const dowIsQ = fields[dowIndex] === '?';
    const alreadyBad = issues.some(i => i.fieldIndex === domIndex || i.fieldIndex === dowIndex);
    if (!alreadyBad && domIsQ === dowIsQ) {
      const example = format === 'aws' ? '0 9 ? * MON-FRI *' : '0 0 9 ? * MON-FRI';
      issues.push({
        fieldIndex: dowIndex,
        message: domIsQ
          ? 'Day (month) and Day (week) cannot both be ?. Keep ? in only one of them.'
          : `${formatLabel(format)} requires ? in either Day (month) or Day (week). Example: ${example}`,
      });
    }
  }

  return issues.sort((a, b) => a.fieldIndex - b.fieldIndex);
}
