import { COMMON_TIMEZONES } from './constants';

type IntlWithSupportedValues = typeof Intl & {
  supportedValuesOf?: (key: 'timeZone') => string[];
};

let cached: string[] | null = null;

/** Curated common zones first (UTC leading), then every IANA zone the runtime reports. */
export function getTimezones(): string[] {
  if (cached) return cached;
  const supported = (Intl as IntlWithSupportedValues).supportedValuesOf?.('timeZone') ?? [];
  // Merged so common aliases (e.g. Asia/Kolkata) stay valid when the runtime lists only canonical names
  cached = [...new Set(['UTC', ...COMMON_TIMEZONES, ...supported])];
  return cached;
}

export function isValidTimezone(tz: string): boolean {
  return getTimezones().includes(tz);
}
