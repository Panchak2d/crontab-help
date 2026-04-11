import type { CronFormat } from '../types';
import { CRON_FORMATS } from '../utils/constants';

interface Props {
  expression: string;
  format: CronFormat;
  activeFieldIndex: number;
}

export function FieldExplainer({ expression, format, activeFieldIndex }: Props) {
  const fmt = CRON_FORMATS.find(f => f.id === format);
  if (!fmt) return null;

  const exprFields = expression.trim().split(/\s+/);

  return (
    <div className="field-explainer" aria-label="Field breakdown">
      {fmt.fields.map((field, i) => {
        const value = exprFields[i] ?? '*';
        const isActive = i === activeFieldIndex;
        return (
          <div
            key={field.name}
            className={`field-pill${isActive ? ' field-pill--active' : ''}`}
            title={`${field.label}: ${field.range}`}
          >
            <span className="field-value">{value}</span>
            <span className="field-label">{field.label}</span>
            <span className="field-range">{field.range}</span>
          </div>
        );
      })}
    </div>
  );
}
