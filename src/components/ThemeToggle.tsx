import { useState } from 'react';
import { applyTheme, getInitialTheme, storeTheme, type Theme } from '../utils/theme';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    storeTheme(next);
  }

  return (
    <button
      className="share-btn"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
