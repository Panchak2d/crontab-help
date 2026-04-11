import { useRef, useState } from 'react';
import type { CronFormat } from '../types';
import { CRON_FORMATS } from '../utils/constants';

interface Props {
  expression: string;
  format: CronFormat;
  isValid: boolean;
  onChange: (expr: string) => void;
  onCursorChange: (fieldIndex: number) => void;
}

function getCursorFieldIndex(input: HTMLInputElement, format: CronFormat): number {
  const pos = input.selectionStart ?? 0;
  const textUpToCursor = input.value.slice(0, pos);
  const fieldsBefore = textUpToCursor.split(/\s+/).length - 1;
  const fmt = CRON_FORMATS.find(f => f.id === format);
  if (!fmt) return -1;
  return Math.min(fieldsBefore, fmt.fields.length - 1);
}

export function CronInput({ expression, format, isValid, onChange, onCursorChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fmt = CRON_FORMATS.find(f => f.id === format);
  const [touched, setTouched] = useState(false);

  function handleCursorUpdate() {
    if (!inputRef.current) return;
    onCursorChange(getCursorFieldIndex(inputRef.current, format));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTouched(true);
    onChange(e.target.value);
  }

  const hasContent = expression.trim().length > 0;
  const showValidation = touched && hasContent;

  const validityClass = showValidation
    ? isValid ? 'validity-indicator--valid' : 'validity-indicator--invalid'
    : '';

  const visibilityClass = showValidation ? 'validity-indicator--visible' : '';

  return (
    <div className="cron-input-wrapper">
      <input
        ref={inputRef}
        type="text"
        className="cron-input"
        value={expression}
        onChange={handleChange}
        onKeyUp={handleCursorUpdate}
        onClick={handleCursorUpdate}
        onFocus={handleCursorUpdate}
        placeholder={fmt?.placeholder ?? '* * * * *'}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        aria-label="Cron expression"
        aria-invalid={showValidation && !isValid}
      />
      <span className={`validity-indicator ${validityClass} ${visibilityClass}`}>
        {showValidation && (isValid ? 'valid' : 'invalid')}
      </span>
    </div>
  );
}
