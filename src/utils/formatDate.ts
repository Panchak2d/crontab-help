/**
 * Formats a Date object into a human-readable string for the "next runs" panel.
 * Uses Intl.DateTimeFormat so it correctly handles all timezones.
 */
export function formatNextRunDate(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return formatter.format(date);
}

/**
 * Returns a relative time label like "in 3 minutes" or "in 2 days".
 */
export function formatRelativeTime(date: Date): string {
  const nowMs = Date.now();
  const diffMs = date.getTime() - nowMs;

  if (diffMs < 0) return 'in the past';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60)  return `in ${diffSec}s`;
  if (diffMin < 60)  return `in ${diffMin}m`;
  if (diffHr  < 24)  return `in ${diffHr}h ${diffMin % 60}m`;
  if (diffDay < 30)  return `in ${diffDay}d`;
  return `in ${Math.floor(diffDay / 30)}mo`;
}
