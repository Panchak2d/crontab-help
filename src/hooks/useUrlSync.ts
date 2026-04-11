import { useEffect } from 'react';
import type { CronFormat } from '../types';

/**
 * Encodes the expression in the URL hash as base64url so it survives
 * copy-paste and bookmark without a server. Format: #expr=<b64>&fmt=<fmt>
 *
 * base64url replaces '+' with '-' and '/' with '_' so the hash is
 * safe to copy as a plain URL without percent-encoding.
 */

const VALID_FORMATS: CronFormat[] = ['unix', 'quartz', 'github', 'aws'];

function toBase64Url(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(str: string): string {
  try {
    // Restore base64 padding stripped by toBase64Url
    const padded = str + '==='.slice((str.length + 3) % 4);
    return atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  } catch {
    return '';
  }
}

export function readFromUrl(): { expression: string | null; format: CronFormat | null } {
  const hash = window.location.hash.slice(1); // strip leading '#'
  if (!hash) return { expression: null, format: null };

  const params = new URLSearchParams(hash);
  const encoded = params.get('expr');
  const rawFmt = params.get('fmt');

  const expression = encoded ? fromBase64Url(encoded) : null;

  // Runtime validation: reject any fmt value that isn't a known CronFormat.
  // The TypeScript cast alone provides no runtime safety — an attacker or
  // a stale URL could inject an arbitrary string here.
  const format: CronFormat | null =
    rawFmt !== null && (VALID_FORMATS as string[]).includes(rawFmt)
      ? (rawFmt as CronFormat)
      : null;

  return { expression, format };
}

export function useUrlSync(expression: string, format: CronFormat) {
  useEffect(() => {
    const encoded = toBase64Url(expression);
    const hash = `#expr=${encoded}&fmt=${format}`;
    // replaceState keeps the Back button clean — no history entry per keystroke
    window.history.replaceState(null, '', hash);
  }, [expression, format]);
}
