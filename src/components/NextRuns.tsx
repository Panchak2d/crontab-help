import { TIMEZONES } from '../utils/constants';
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

  return (
    <section className="next-runs-panel">
      <div className="panel-header">
        <span className="panel-label">Next 10 Runs</span>
        <select
          className="tz-select"
          value={timezone}
          onChange={e => onTimezoneChange(e.target.value)}
          aria-label="Timezone"
        >
          {TIMEZONES.map(tz => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
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
