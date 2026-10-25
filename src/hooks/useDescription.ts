import { useEffect, useMemo, useState } from 'react';
import type { CronFormat } from '../types';
import { describeCronExpression, type DescribeResult } from '../core/describer';
import {
  getInitialLocale, isLocaleLoaded, loadLocale, storeLocale, type LocaleCode,
} from '../utils/locale';

const BLANK: DescribeResult = { description: '', isError: false };

export function useDescription(expression: string, format: CronFormat) {
  const [locale, setLocaleState] = useState<LocaleCode>(getInitialLocale);
  // Locale the visible text is actually written in. Null until the first chunk arrives,
  // so a non-English visitor never sees an English flash.
  const [applied, setApplied] = useState<LocaleCode | null>(() => (isLocaleLoaded(locale) ? locale : null));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (isLocaleLoaded(locale)) return;
    let stale = false;
    loadLocale(locale).then(
      () => { if (!stale) { setApplied(locale); setFailed(false); } },
      () => { if (!stale) { setApplied('en'); setFailed(true); } },
    );
    return () => { stale = true; };
  }, [locale]);

  function setLocale(next: LocaleCode) {
    setLocaleState(next);
    storeLocale(next);
    if (isLocaleLoaded(next)) {
      setApplied(next);
      setFailed(false);
    }
  }

  const describeResult = useMemo(
    () => (applied === null ? BLANK : describeCronExpression(expression, format, applied)),
    [expression, format, applied],
  );

  return {
    describeResult,
    locale,
    setLocale,
    descriptionLocale: applied ?? 'en',
    localeFailed: failed,
    localePending: applied !== locale && !failed,
  };
}
