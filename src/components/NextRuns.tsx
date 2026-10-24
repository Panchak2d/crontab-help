import { useEffect, useState } from 'react';
import { getTimezones, isValidTimezone } from '../utils/timezones';
import { formatNextRunDate, formatRelativeTime } from '../utils/formatDate';

interface Props {
  nextDates: Date[];
  timezone: string;
  onTimezoneChange: (tz: string) => void;
  isValid: boolean;
  errorMessage?: string;
}

export function NextRuns({ nextDates, timezone, onTimezoneChange, isValid, errorMessage }: Props) {
  const nextRun = nextDates[0] ?? null;
  const [draft, setDraft] = useState(timezone);
  useEffect(() => setDraft(timezone), [timezone]);

  function handleTimezoneInput(value: string) {
    setDraft(value);
    if (isValidTimezone(value)) onTimezoneChange(value);
  }

  return (
    <section className="next-runs-panel">
      <div className="panel-header">
        <span className="panel-label">Next 10 Runs</span>
        <input
          className={`tz-select${isValidTimezone(draft) ? '' : ' tz-select--invalid'}`}
          list="tz-list"
          value={draft}
          onChange={e => handleTimezoneInput(e.target.value)}
          onBlur={() => setDraft(timezone)}
          onFocus={e => e.target.select()}
          spellCheck={false}
          autoComplete="off"
          aria-label="Timezone (IANA name)"
        />
        <datalist id="tz-list">
          {getTimezones().map(tz => <option key={tz} value={tz} />)}
        </datalist>
      </div>

      {!isValid ? (
        <div className="next-runs-empty">
          <p className="next-runs-empty-title">No schedule yet</p>
          <p className="next-runs-empty-reason">{errorMessage ?? 'Fix the expression above'}</p>
        </div>
      ) : (
        <>
          {/* Next run hero — the most important number */}
          {nextRun && (
            <div className="next-run-hero">
              <span className="next-run-hero-label">Next run</span>
              <span className="next-run-hero-relative">{formatRelativeTime(nextRun)}</span>
              <span className="next-run-hero-date">{formatNextRunDate(nextRun, timezone)}</span>
            </div>
          )}

          {/* Remaining runs */}
          <ol className="next-runs-list">
            {nextDates.slice(1).map((date, idx) => (
              <li key={date.toISOString()} className="next-run-item">
                <span className="run-index">#{idx + 2}</span>
                <span className="run-date">{formatNextRunDate(date, timezone)}</span>
                <span className="run-relative">{formatRelativeTime(date)}</span>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
