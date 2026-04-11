import type { CronFormat } from '../types';
import { CRON_FORMATS } from '../utils/constants';

interface Props {
  currentFormat: CronFormat;
  onChange: (format: CronFormat) => void;
}

export function FormatSelector({ currentFormat, onChange }: Props) {
  return (
    <div className="format-selector" role="tablist" aria-label="Cron format">
      {CRON_FORMATS.map(fmt => (
        <button
          key={fmt.id}
          role="tab"
          aria-selected={fmt.id === currentFormat}
          className={`format-tab${fmt.id === currentFormat ? ' format-tab--active' : ''}`}
          onClick={() => onChange(fmt.id)}
          title={fmt.description}
        >
          {fmt.label}
        </button>
      ))}
    </div>
  );
}
