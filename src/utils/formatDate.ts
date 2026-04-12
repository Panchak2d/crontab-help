/**
 * Formats a Date into a readable string for the next-runs panel.
 * Uses Intl.DateTimeFormat for correct timezone handling.
 */
export function formatNextRunDate(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

const MINUTE_MS = 60_000;
const HOUR_MS   = 60 * MINUTE_MS;
const DAY_MS    = 24 * HOUR_MS;
const MONTH_MS  = 30 * DAY_MS;

/**
 * Returns a concise relative time string like "in 4m" or "in 2d".
 */
export function formatRelativeTime(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  if (diffMs < 0) return 'in the past';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffMs / MINUTE_MS);
  const diffHr  = Math.floor(diffMs / HOUR_MS);
  const diffDay = Math.floor(diffMs / DAY_MS);

  if (diffSec < 60)  return `in ${diffSec}s`;
  if (diffMin < 60)  return `in ${diffMin}m`;
  if (diffHr  < 24)  return `in ${diffHr}h ${diffMin % 60}m`;
  if (diffDay < 30)  return `in ${diffDay}d`;
  return `in ${Math.floor(diffMs / MONTH_MS)}mo`;
}
