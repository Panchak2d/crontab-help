import { useId, useMemo } from 'react';
import type { CronFormat } from '../types';
import {
  HOUR_STEPS, MINUTE_STEPS, WEEKDAY_NAMES,
  buildExpression, parseBuilderState, toggleValue,
  type BuilderState, type DaysField, type MonthField, type TimeField,
} from '../core/builder';

interface Props {
  expression: string;
  format: CronFormat;
  onChange: (expression: string) => void;
}

interface ChipOption {
  value: number;
  label: string;
}

interface TimeSpec {
  label: string;
  everyLabel: string;
  stepUnit: string;
  pickLabel: string;
  steps: number[];
  options: ChipOption[];
  defaultStep: number;
  defaultAt: number;
}

const pad = (n: number) => String(n).padStart(2, '0');
const sequence = (count: number, first: number): ChipOption[] =>
  Array.from({ length: count }, (_, i) => ({ value: i + first, label: pad(i + first) }));

const MINUTE_SPEC: TimeSpec = {
  label: 'Minute', everyLabel: 'Every minute', stepUnit: 'minutes', pickLabel: 'At selected minutes',
  steps: MINUTE_STEPS, options: sequence(60, 0), defaultStep: 5, defaultAt: 0,
};
const HOUR_SPEC: TimeSpec = {
  label: 'Hour', everyLabel: 'Every hour', stepUnit: 'hours', pickLabel: 'At selected hours',
  steps: HOUR_STEPS, options: sequence(24, 0), defaultStep: 6, defaultAt: 9,
};

const MONTH_OPTIONS: ChipOption[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  .map((label, i) => ({ value: i + 1, label }));
const DAY_OPTIONS: ChipOption[] = Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: String(i + 1) }));
const WEEKDAY_OPTIONS: ChipOption[] = [1, 2, 3, 4, 5, 6, 0].map(n => ({
  value: n,
  label: WEEKDAY_NAMES[n][0] + WEEKDAY_NAMES[n].slice(1).toLowerCase(),
}));

function Chips({ legend, options, selected, onToggle }: {
  legend: string;
  options: ChipOption[];
  selected: number[];
  onToggle: (value: number) => void;
}) {
  return (
    <div className="builder-chips" role="group" aria-label={legend}>
      {options.map(option => (
        <label key={option.value} className="builder-chip">
          <input
            type="checkbox"
            checked={selected.includes(option.value)}
            onChange={() => onToggle(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

function TimeControl({ spec, field, onChange }: {
  spec: TimeSpec;
  field: TimeField;
  onChange: (field: TimeField) => void;
}) {
  const id = useId();

  function changeMode(mode: TimeField['mode']) {
    if (mode === 'any') onChange({ mode });
    else if (mode === 'step') onChange({ mode, step: spec.defaultStep });
    else onChange({ mode, values: [spec.defaultAt] });
  }

  return (
    <div className="builder-field">
      <label className="builder-label" htmlFor={id}>{spec.label}</label>
      <div className="builder-controls">
        <select id={id} className="builder-select" value={field.mode}
          onChange={e => changeMode(e.target.value as TimeField['mode'])}>
          <option value="any">{spec.everyLabel}</option>
          <option value="step">At a regular interval</option>
          <option value="at">{spec.pickLabel}</option>
        </select>
        {field.mode === 'step' && (
          <select className="builder-select" aria-label={`${spec.label} interval`} value={field.step}
            onChange={e => onChange({ mode: 'step', step: Number(e.target.value) })}>
            {spec.steps.map(n => <option key={n} value={n}>Every {n} {spec.stepUnit}</option>)}
          </select>
        )}
        {field.mode === 'at' && (
          <Chips legend={spec.pickLabel} options={spec.options} selected={field.values}
            onToggle={v => onChange({ mode: 'at', values: toggleValue(field.values, v) })} />
        )}
      </div>
    </div>
  );
}

function DaysControl({ days, onChange }: { days: DaysField; onChange: (days: DaysField) => void }) {
  const name = useId();
  const labelId = useId();
  const modes: { mode: DaysField['mode']; label: string }[] = [
    { mode: 'every', label: 'Every day' },
    { mode: 'week', label: 'Days of the week' },
    { mode: 'month', label: 'Days of the month' },
  ];

  function changeMode(mode: DaysField['mode']) {
    if (mode === 'every') onChange({ mode });
    else if (mode === 'week') onChange({ mode, weekdays: [1, 2, 3, 4, 5] });
    else onChange({ mode, days: [1] });
  }

  return (
    <div className="builder-field" role="group" aria-labelledby={labelId}>
      <span className="builder-label" id={labelId}>Days</span>
      <div className="builder-controls">
        <div className="builder-radios">
          {modes.map(({ mode, label }) => (
            <label key={mode} className="builder-radio">
              <input type="radio" name={name} checked={days.mode === mode} onChange={() => changeMode(mode)} />
              {label}
            </label>
          ))}
        </div>
        {days.mode === 'week' && (
          <Chips legend="Selected weekdays" options={WEEKDAY_OPTIONS} selected={days.weekdays}
            onToggle={v => onChange({ mode: 'week', weekdays: toggleValue(days.weekdays, v) })} />
        )}
        {days.mode === 'month' && (
          <Chips legend="Selected days of the month" options={DAY_OPTIONS} selected={days.days}
            onToggle={v => onChange({ mode: 'month', days: toggleValue(days.days, v) })} />
        )}
      </div>
    </div>
  );
}

function MonthControl({ month, onChange }: { month: MonthField; onChange: (month: MonthField) => void }) {
  const id = useId();
  return (
    <div className="builder-field">
      <label className="builder-label" htmlFor={id}>Month</label>
      <div className="builder-controls">
        <select id={id} className="builder-select" value={month.mode}
          onChange={e => onChange(e.target.value === 'any' ? { mode: 'any' } : { mode: 'at', months: [1] })}>
          <option value="any">Every month</option>
          <option value="at">Selected months</option>
        </select>
        {month.mode === 'at' && (
          <Chips legend="Selected months" options={MONTH_OPTIONS} selected={month.months}
            onToggle={v => onChange({ mode: 'at', months: toggleValue(month.months, v) })} />
        )}
      </div>
    </div>
  );
}

const FORMAT_HINTS: Partial<Record<CronFormat, string>> = {
  quartz: 'Seconds are fixed at 0. The unused day field gets ?.',
  aws: 'Year is fixed at *. The unused day field gets ?.',
};

export function ScheduleBuilder({ expression, format, onChange }: Props) {
  const parsed = useMemo(() => parseBuilderState(expression, format), [expression, format]);
  const state = parsed.kind === 'ok' ? parsed.state : null;

  function apply(patch: Partial<BuilderState>) {
    if (state) onChange(buildExpression({ ...state, ...patch }, format));
  }

  return (
    <details className="builder">
      <summary className="builder-summary">Schedule builder</summary>
      <div className="builder-body">
        {state ? (
          <>
            <TimeControl spec={MINUTE_SPEC} field={state.minute} onChange={minute => apply({ minute })} />
            <TimeControl spec={HOUR_SPEC} field={state.hour} onChange={hour => apply({ hour })} />
            <DaysControl days={state.days} onChange={days => apply({ days })} />
            <MonthControl month={state.month} onChange={month => apply({ month })} />
            <p className="builder-hint">
              {FORMAT_HINTS[format] ? `${FORMAT_HINTS[format]} ` : ''}At least one value stays selected.
            </p>
          </>
        ) : (
          <p className="builder-note" role="status">
            {parsed.kind === 'invalid'
              ? 'The expression is not valid for this format yet. Fix it to use the builder.'
              : 'This expression is too complex for the builder. Edit it in the input above; it is left unchanged.'}
          </p>
        )}
      </div>
    </details>
  );
}
