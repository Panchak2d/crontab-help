import { describe, it, expect, afterEach, vi } from 'vitest';
import { readdirSync } from 'node:fs';
import { describeCronExpression } from '../../src/core/describer';
import {
  LOCALES, getInitialLocale, loadLocale, localeLangTag, matchLocale, storeLocale,
  type LocaleCode,
} from '../../src/utils/locale';
import type { CronFormat } from '../../src/types';

const SAMPLES: Array<[string, CronFormat]> = [
  ['*/5 * * * *', 'unix'],
  ['0 9 * * 1-5', 'github'],
  ['0 30 9 ? * MON-FRI', 'quartz'],
  ['0 12 * * ? *', 'aws'],
];
const NON_EN = LOCALES.map(l => l.code).filter(c => c !== 'en');

describe('shipped locales', () => {
  it('matches the locale files in the installed cronstrue', () => {
    const shipped = readdirSync('node_modules/cronstrue/locales')
      .filter(f => f.endsWith('.js') && !f.endsWith('.min.js'))
      .map(f => f.slice(0, -3))
      .sort();
    expect(LOCALES.map(l => l.code).sort()).toEqual(shipped);
  });

  it.each(NON_EN)('%s describes every format, differs from English, keeps 24h time', async code => {
    await loadLocale(code);
    for (const [expr, format] of SAMPLES) {
      const en = describeCronExpression(expr, format, 'en');
      const out = describeCronExpression(expr, format, code);
      expect(out.isError).toBe(false);
      expect(out.description.length).toBeGreaterThan(0);
      expect(out.description).not.toBe(en.description);
    }
    expect(describeCronExpression('0 15 * * *', 'unix', code).description).not.toMatch(/\b[AP]M\b/);
  });
});

describe('browser tag matching', () => {
  it.each([
    ['de-AT', 'de'], ['pt-BR', 'pt_BR'], ['pt-PT', 'pt_PT'], ['pt', 'pt_BR'],
    ['zh-Hant-TW', 'zh_TW'], ['zh-CN', 'zh_CN'], ['zh', 'zh_CN'], ['nn-NO', 'nb'],
    ['ms-MY', 'my'], ['EN-us', 'en'],
  ])('%s -> %s', (tag, code) => expect(matchLocale(tag)).toBe(code));

  it('does not treat Burmese (my) as Malay, and rejects unsupported tags', () => {
    expect(matchLocale('my')).toBeNull();
    expect(matchLocale('xx-YY')).toBeNull();
  });

  it('uses the cronstrue code `my` for lang as Malay', () => {
    expect(localeLangTag('my')).toBe('ms');
    expect(localeLangTag('pt_BR')).toBe('pt-BR');
  });
});

describe('locale persistence', () => {
  const realStorage = Object.getOwnPropertyDescriptor(window, 'localStorage')!;

  function blockStorage() {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() { throw new DOMException('blocked', 'SecurityError'); },
    });
  }
  function setBrowserLanguages(langs: string[]) {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(langs);
  }

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', realStorage);
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('round-trips a stored choice and ignores junk', () => {
    setBrowserLanguages(['fr-FR']);
    storeLocale('ja');
    expect(getInitialLocale()).toBe('ja');
    window.localStorage.setItem('crontab-help-locale', 'klingon');
    expect(getInitialLocale()).toBe('fr');
  });

  it('falls back to the first supported browser language, then English', () => {
    setBrowserLanguages(['xx', 'es-MX', 'de']);
    expect(getInitialLocale()).toBe('es');
    setBrowserLanguages(['xx']);
    expect(getInitialLocale()).toBe('en');
  });

  it('works with storage blocked', () => {
    blockStorage();
    setBrowserLanguages(['it-IT']);
    expect(getInitialLocale()).toBe('it');
    expect(() => storeLocale('de' as LocaleCode)).not.toThrow();
  });
});
