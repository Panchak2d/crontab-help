import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../../src/components/ThemeToggle';

describe('ThemeToggle', () => {
  it('is an icon-only button with a name that flips with the theme', () => {
    document.documentElement.dataset.theme = 'dark';
    window.localStorage.setItem('crontab-help-theme', 'dark');
    render(<ThemeToggle />);
    const btn = screen.getByRole('button', { name: 'Switch to light mode' });
    expect(btn.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(btn).toHaveTextContent('');
    fireEvent.click(btn);
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
  });
});
