import { useRef, useState } from 'react';
import type { CronFormat } from '../types';
import { CRON_FORMATS } from '../utils/constants';

interface Props {
  expression: string;
  format: CronFormat;
  isValid: boolean;
  onChange: (value: string) => void;
  onCursorFieldChange: (fieldIndex: number) => void;
}

function getCursorFieldIndex(input: HTMLInputElement, fieldCount: number): number {
  const pos = input.selectionStart ?? 0;
  const fieldsBeforeCursor = input.value.slice(0, pos).split(/\s+/).length - 1;
  return Math.min(fieldsBeforeCursor, fieldCount - 1);
}

export function CronInput({ expression, format, isValid, onChange, onCursorFieldChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Resolve format definition once per render, not twice
  const formatDef = CRON_FORMATS.find(f => f.id === format);
  const [touched, setTouched] = useState(false);

  function updateCursorField() {
    if (!inputRef.current || !formatDef) return;
    onCursorFieldChange(getCursorFieldIndex(inputRef.current, formatDef.fields.length));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTouched(true);
    onChange(e.target.value);
  }

  const hasContent = expression.trim().length > 0;
  const showValidation = touched && hasContent;

  return (
    <div className="cron-input-wrapper">
      <input
        ref={inputRef}
        type="text"
        className="cron-input"
        value={expression}
        onChange={handleChange}
        onKeyUp={updateCursorField}
        onClick={updateCursorField}
        onFocus={updateCursorField}
        placeholder={formatDef?.placeholder ?? '* * * * *'}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        aria-label="Cron expression"
        aria-invalid={showValidation && !isValid}
      />
      <span
        className={[
          'validity-indicator',
          showValidation ? (isValid ? 'validity-indicator--valid' : 'validity-indicator--invalid') : '',
          showValidation ? 'validity-indicator--visible' : '',
        ].join(' ').trim()}
      >
        {showValidation && (isValid ? 'valid' : 'invalid')}
      </span>
    </div>
  );
}
