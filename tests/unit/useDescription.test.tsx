import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const pending = new Map<string, { resolve: () => void; reject: () => void }>();
const loaded = new Set<string>(['en']);

vi.mock('../../src/utils/locale', async importOriginal => {
  const real = await importOriginal<typeof import('../../src/utils/locale')>();
  return {
    ...real,
    getInitialLocale: () => 'en',
    isLocaleLoaded: (c: string) => loaded.has(c),
    loadLocale: (c: string) =>
      new Promise<void>((resolve, reject) => {
        pending.set(c, { resolve: () => { loaded.add(c); resolve(); }, reject: () => reject(new Error('chunk')) });
      }),
  };
});

import { useDescription } from '../../src/hooks/useDescription';

describe('useDescription', () => {
  beforeEach(() => { pending.clear(); loaded.clear(); loaded.add('en'); });

  it('keeps the previous text while loading and ignores an out-of-date load', async () => {
    const { result } = renderHook(() => useDescription('*/5 * * * *', 'unix'));
    const english = result.current.describeResult.description;

    act(() => result.current.setLocale('de'));
    act(() => result.current.setLocale('fr'));
    expect(result.current.localePending).toBe(true);
    expect(result.current.describeResult.description).toBe(english);

    await act(async () => { pending.get('fr')!.resolve(); });
    await waitFor(() => expect(result.current.descriptionLocale).toBe('fr'));
    await act(async () => { pending.get('de')!.resolve(); });

    expect(result.current.descriptionLocale).toBe('fr');
    expect(result.current.localePending).toBe(false);
  });

  it('falls back to English and flags the failure when a chunk fails', async () => {
    const { result } = renderHook(() => useDescription('*/5 * * * *', 'unix'));
    act(() => result.current.setLocale('de'));
    await act(async () => { pending.get('de')!.reject(); });

    expect(result.current.localeFailed).toBe(true);
    expect(result.current.descriptionLocale).toBe('en');
    expect(result.current.locale).toBe('de');
    expect(result.current.localePending).toBe(false);
  });
});
