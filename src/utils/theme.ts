export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'crontab-help-theme';

export function getInitialTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // Storage can be blocked; fall through to the system preference
  }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

export function storeTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Preference simply won't persist
  }
}
