import { useState } from 'react';
import { useCronState } from './hooks/useCronState';
import { useUrlSync } from './hooks/useUrlSync';
import { FormatSelector } from './components/FormatSelector';
import { CronInput } from './components/CronInput';
import { Description } from './components/Description';
import { FieldExplainer } from './components/FieldExplainer';
import { NextRuns } from './components/NextRuns';
import { PresetPicker } from './components/PresetPicker';
import { ShareButton } from './components/ShareButton';
import { ThemeToggle } from './components/ThemeToggle';
import { CopyActions } from './components/CopyActions';
import { SyntaxReference } from './components/SyntaxReference';
import { ScheduleBuilder } from './components/ScheduleBuilder';
import { LanguageSelect } from './components/LanguageSelect';
import { localeDir, localeLangTag } from './utils/locale';
import { convertExpression } from './core/builder';
import type { CronFormat } from './types';

export default function App() {
  const {
    expression, setExpression,
    format,     setFormat,
    timezone,   setTimezone,
    parseResult, describeResult,
    locale, setLocale, descriptionLocale, localeFailed, localePending,
  } = useCronState();

  // Cursor field index is UI state — it belongs here, not in the data hook
  const [cursorFieldIndex, setCursorFieldIndex] = useState(-1);

  // Keep the URL hash in sync so every expression is shareable
  useUrlSync(expression, format);

  function handlePresetSelect(expr: string, fmt: CronFormat) {
    setExpression(expr);
    setFormat(fmt);
  }

  function handleFormatChange(next: CronFormat) {
    const converted = convertExpression(expression, format, next);
    if (converted !== null) setExpression(converted);
    setFormat(next);
  }

  // Validator and placeholder messages are English regardless of the chosen locale
  const isTranslated = !describeResult.isError && expression.trim().length > 0;
  const descLocale = isTranslated ? descriptionLocale : 'en';

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
          <ThemeToggle />
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
          <FormatSelector currentFormat={format} onChange={handleFormatChange} />

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
            lang={localeLangTag(descLocale)}
            dir={localeDir(descLocale)}
          >
            <LanguageSelect locale={locale} failed={localeFailed} onChange={setLocale} />
          </Description>

          <CopyActions
            expression={expression}
            format={format}
            description={describeResult.description}
            locale={descriptionLocale}
            nextDates={parseResult.isValid ? parseResult.nextDates : []}
            timezone={timezone}
            isValid={parseResult.isValid && !describeResult.isError && !localePending}
          />

          <FieldExplainer
            expression={expression}
            format={format}
            activeFieldIndex={cursorFieldIndex}
            errorFieldIndex={parseResult.isValid ? -1 : parseResult.fieldIndex}
          />
        </div>

        <ScheduleBuilder expression={expression} format={format} onChange={setExpression} />

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

        <SyntaxReference currentFormat={format} />
      </main>

      <footer className="app-footer">
        <p>
          Press <kbd>/</kbd> to focus the input · Open source · MIT License ·{' '}
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
