import { useState } from 'react';
import type { CronFormat } from '../types';
import { copyText } from '../utils/clipboard';
import { buildExplanation } from '../utils/explanation';

interface Props {
  expression: string;
  format: CronFormat;
  description: string;
  nextDates: Date[];
  timezone: string;
  isValid: boolean;
}

type CopiedKind = 'expression' | 'explanation' | null;

export function CopyActions({ expression, format, description, nextDates, timezone, isValid }: Props) {
  const [copied, setCopied] = useState<CopiedKind>(null);
  const hasExpression = expression.trim().length > 0;

  async function handleCopy(kind: Exclude<CopiedKind, null>) {
    const text = kind === 'expression'
      ? expression.trim()
      : buildExplanation(expression, format, description, nextDates, timezone);
    if (!(await copyText(text))) {
      window.prompt('Copy this text:', text);
      return;
    }
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="copy-actions">
      <button
        className={`share-btn${copied === 'expression' ? ' share-btn--copied' : ''}`}
        onClick={() => handleCopy('expression')}
        disabled={!hasExpression}
      >
        {copied === 'expression' ? 'Copied!' : 'Copy expression'}
      </button>
      <button
        className={`share-btn${copied === 'explanation' ? ' share-btn--copied' : ''}`}
        onClick={() => handleCopy('explanation')}
        disabled={!isValid}
        title="Expression, plain-English meaning, timezone and next runs"
      >
        {copied === 'explanation' ? 'Copied!' : 'Copy explanation'}
      </button>
    </div>
  );
}
