// Locales shipped by cronstrue 3.x (node_modules/cronstrue/locales). Native names so a
// reader can find their language without knowing the English word for it.
export const LOCALES = [
  { code: 'en', name: 'English' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'ar', name: 'العربية' },
  { code: 'be', name: 'Беларуская' },
  { code: 'bg', name: 'Български' },
  { code: 'ca', name: 'Català' },
  { code: 'cs', name: 'Čeština' },
  { code: 'da', name: 'Dansk' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'fa', name: 'فارسی' },
  { code: 'fi', name: 'Suomi' },
  { code: 'fr', name: 'Français' },
  { code: 'he', name: 'עברית' },
  { code: 'hr', name: 'Hrvatski' },
  { code: 'hu', name: 'Magyar' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'it', name: 'Italiano' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'my', name: 'Bahasa Melayu' },
  { code: 'nb', name: 'Norsk bokmål' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'pl', name: 'Polski' },
  { code: 'pt_BR', name: 'Português (Brasil)' },
  { code: 'pt_PT', name: 'Português (Portugal)' },
  { code: 'ro', name: 'Română' },
  { code: 'ru', name: 'Русский' },
  { code: 'sk', name: 'Slovenčina' },
  { code: 'sl', name: 'Slovenščina' },
  { code: 'sr', name: 'Srpski' },
  { code: 'sv', name: 'Svenska' },
  { code: 'sw', name: 'Kiswahili' },
  { code: 'th', name: 'ไทย' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'uk', name: 'Українська' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'zh_CN', name: '简体中文' },
  { code: 'zh_TW', name: '繁體中文' },
] as const;

export type LocaleCode = (typeof LOCALES)[number]['code'];
export const DEFAULT_LOCALE: LocaleCode = 'en';

const STORAGE_KEY = 'crontab-help-locale';
const RTL: ReadonlySet<LocaleCode> = new Set(['ar', 'fa', 'he']);

// Explicit paths so Vite emits one small lazy chunk per locale. Each module registers
// itself on the shared cronstrue instance as a side effect of being evaluated.
const LOADERS: Record<Exclude<LocaleCode, 'en'>, () => Promise<unknown>> = {
  af: () => import('cronstrue/locales/af'),
  ar: () => import('cronstrue/locales/ar'),
  be: () => import('cronstrue/locales/be'),
  bg: () => import('cronstrue/locales/bg'),
  ca: () => import('cronstrue/locales/ca'),
  cs: () => import('cronstrue/locales/cs'),
  da: () => import('cronstrue/locales/da'),
  de: () => import('cronstrue/locales/de'),
  es: () => import('cronstrue/locales/es'),
  fa: () => import('cronstrue/locales/fa'),
  fi: () => import('cronstrue/locales/fi'),
  fr: () => import('cronstrue/locales/fr'),
  he: () => import('cronstrue/locales/he'),
  hr: () => import('cronstrue/locales/hr'),
  hu: () => import('cronstrue/locales/hu'),
  id: () => import('cronstrue/locales/id'),
  it: () => import('cronstrue/locales/it'),
  ja: () => import('cronstrue/locales/ja'),
  ko: () => import('cronstrue/locales/ko'),
  my: () => import('cronstrue/locales/my'),
  nb: () => import('cronstrue/locales/nb'),
  nl: () => import('cronstrue/locales/nl'),
  pl: () => import('cronstrue/locales/pl'),
  pt_BR: () => import('cronstrue/locales/pt_BR'),
  pt_PT: () => import('cronstrue/locales/pt_PT'),
  ro: () => import('cronstrue/locales/ro'),
  ru: () => import('cronstrue/locales/ru'),
  sk: () => import('cronstrue/locales/sk'),
  sl: () => import('cronstrue/locales/sl'),
  sr: () => import('cronstrue/locales/sr'),
  sv: () => import('cronstrue/locales/sv'),
  sw: () => import('cronstrue/locales/sw'),
  th: () => import('cronstrue/locales/th'),
  tr: () => import('cronstrue/locales/tr'),
  uk: () => import('cronstrue/locales/uk'),
  vi: () => import('cronstrue/locales/vi'),
  zh_CN: () => import('cronstrue/locales/zh_CN'),
  zh_TW: () => import('cronstrue/locales/zh_TW'),
};

const loaded = new Set<LocaleCode>([DEFAULT_LOCALE]);

export function isLocaleLoaded(code: LocaleCode): boolean {
  return loaded.has(code);
}

export async function loadLocale(code: LocaleCode): Promise<void> {
  if (loaded.has(code) || code === 'en') return;
  await LOADERS[code]();
  loaded.add(code);
}

export function isLocaleCode(value: unknown): value is LocaleCode {
  return LOCALES.some(l => l.code === value);
}

export function localeName(code: LocaleCode): string {
  return LOCALES.find(l => l.code === code)?.name ?? code;
}

/** BCP 47 tag for the `lang` attribute (pt_BR -> pt-BR; cronstrue's `my` is Malay -> ms). */
export function localeLangTag(code: LocaleCode): string {
  return code === 'my' ? 'ms' : code.replace('_', '-');
}

export function localeDir(code: LocaleCode): 'rtl' | 'ltr' {
  return RTL.has(code) ? 'rtl' : 'ltr';
}

// Lower-cased browser tags -> cronstrue code. cronstrue's `my` is Malay, but the browser
// tag `my` is Burmese (unsupported), so `my` is reachable only through `ms`.
const TAG_TO_LOCALE: Record<string, LocaleCode> = {
  ...Object.fromEntries(LOCALES.filter(l => l.code !== 'my').map(l => [l.code.toLowerCase(), l.code])),
  ms: 'my',
  pt: 'pt_BR',
  zh: 'zh_CN',
  zh_hans: 'zh_CN',
  zh_hant: 'zh_TW',
  zh_hk: 'zh_TW',
  zh_mo: 'zh_TW',
  zh_sg: 'zh_CN',
  no: 'nb',
  nn: 'nb',
  iw: 'he',
  in: 'id',
};

/** Maps a browser language tag ("pt-BR", "zh-Hant-TW", "de-AT") to a shipped locale, or null. */
export function matchLocale(tag: string): LocaleCode | null {
  const parts = tag.toLowerCase().split(/[-_]/);
  for (let n = parts.length; n > 0; n--) {
    const hit = TAG_TO_LOCALE[parts.slice(0, n).join('_')];
    if (hit) return hit;
  }
  return null;
}

/** Stored choice, else the first supported browser language, else English. */
export function getInitialLocale(): LocaleCode {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocaleCode(stored)) return stored;
  } catch {
    // Storage can be blocked; fall through to the browser language
  }
  const tags = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of tags) {
    const hit = tag ? matchLocale(tag) : null;
    if (hit) return hit;
  }
  return DEFAULT_LOCALE;
}

export function storeLocale(code: LocaleCode): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Preference simply won't persist
  }
}
