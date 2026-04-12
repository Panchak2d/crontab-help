import { useEffect, useState } from 'react';
import { useCronState } from './hooks/useCronState';
import { useUrlSync, readFromUrl } from './hooks/useUrlSync';
import { FormatSelector } from './components/FormatSelector';
import { CronInput } from './components/CronInput';
import { Description } from './components/Description';
import { FieldExplainer } from './components/FieldExplainer';
import { NextRuns } from './components/NextRuns';
import { PresetPicker } from './components/PresetPicker';
import { ShareButton } from './components/ShareButton';
import type { CronFormat } from './types';

export default function App() {
  const {
    expression, setExpression,
    format,     setFormat,
    timezone,   setTimezone,
    parseResult, describeResult,
  } = useCronState();

  // Cursor field index is UI state — it belongs here, not in the data hook
  const [cursorFieldIndex, setCursorFieldIndex] = useState(-1);

  // Restore expression + format from URL hash on first load
  useEffect(() => {
    const { expression: urlExpr, format: urlFmt } = readFromUrl();
    if (urlExpr) setExpression(urlExpr);
    if (urlFmt)  setFormat(urlFmt);
    // setExpression and setFormat are stable useState setters — intentionally
    // excluded from deps to run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the URL hash in sync so every expression is shareable
  useUrlSync(expression, format);

  function handlePresetSelect(expr: string, fmt: CronFormat) {
    setExpression(expr);
    setFormat(fmt);
  }

  const edgeState = !expression.trim()
    ? 'empty'
    : parseResult.isValid ? 'valid' : 'invalid';

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          <span className="title-cron">crontab</span>
          <span className="title-dot">.</span>
          <span className="title-help">help</span>
        </h1>
        <div className="header-actions">
          <ShareButton />
          <a
            className="github-link"
            href="https://github.com/Panchak2d/crontab-help"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </header>

      <main className="app-main">
        <div className={`editor-zone editor-zone--${edgeState}`}>
          <FormatSelector currentFormat={format} onChange={setFormat} />

          <div className="format-support-strip" aria-label="Supported formats">
            <span className="format-support-label">Supports</span>
            <span className="format-support-badge">Unix / Linux</span>
            <span className="format-support-badge">GitHub Actions</span>
            <span className="format-support-badge">AWS EventBridge</span>
            <span className="format-support-badge">Quartz Scheduler</span>
          </div>

          <CronInput
            expression={expression}
            format={format}
            isValid={parseResult.isValid}
            onChange={setExpression}
            onCursorFieldChange={setCursorFieldIndex}
          />

          <Description
            description={describeResult.description}
            isError={describeResult.isError}
            isEmpty={!expression.trim()}
          />

          <FieldExplainer
            expression={expression}
            format={format}
            activeFieldIndex={cursorFieldIndex}
          />
        </div>

        <div className="panels-row">
          <NextRuns
            nextDates={parseResult.isValid ? parseResult.nextDates : []}
            timezone={timezone}
            onTimezoneChange={setTimezone}
            isValid={parseResult.isValid}
            errorMessage={parseResult.isValid ? undefined : parseResult.errorMessage}
          />
          <PresetPicker
            currentFormat={format}
            onSelect={handlePresetSelect}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Open source · MIT License ·{' '}
          <a
            href="https://github.com/Panchak2d/crontab-help"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contribute on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
