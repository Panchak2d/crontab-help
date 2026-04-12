import type { CronFormat } from '../types';
import { CRON_FORMATS } from '../utils/constants';
import { splitFields } from '../core/formats';

interface Props {
  expression: string;
  format: CronFormat;
  activeFieldIndex: number;
}

export function FieldExplainer({ expression, format, activeFieldIndex }: Props) {
  const formatDef = CRON_FORMATS.find(f => f.id === format);
  if (!formatDef) return null;

  const exprFields = splitFields(expression);

  return (
    <div className="field-explainer" aria-label="Field breakdown">
      {formatDef.fields.map((field, i) => {
        const isActive = i === activeFieldIndex;
        return (
          <div
            key={field.name}
            className={`field-pill${isActive ? ' field-pill--active' : ''}`}
            title={`${field.label}: ${field.range}`}
          >
            <span className="field-value">{exprFields[i] ?? '*'}</span>
            <span className="field-label">{field.label}</span>
            <span className="field-range">{field.range}</span>
          </div>
        );
      })}
    </div>
  );
}
