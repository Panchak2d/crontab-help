import { describe, it, expect, beforeEach } from 'vitest';
import { readFromUrl, toBase64Url, fromBase64Url } from '../../src/hooks/useUrlSync';

// Helper: set the URL hash directly
function setHash(hash: string) {
  Object.defineProperty(window, 'location', {
    value: { hash, href: `http://localhost/${hash}` },
    writable: true,
  });
}

describe('readFromUrl', () => {
  beforeEach(() => {
    setHash('');
  });

  it('returns nulls when hash is empty', () => {
    setHash('');
    const result = readFromUrl();
    expect(result.expression).toBeNull();
    expect(result.format).toBeNull();
  });

  it('decodes a base64url-encoded expression from the hash', () => {
    // Encode "*/5 * * * *" manually: btoa("*/5 * * * *") = "Ki81ICogKiAqICo="
    // base64url strip padding: "Ki81ICogKiAqICo"
    setHash('#expr=Ki81ICogKiAqICo&fmt=unix');
    const result = readFromUrl();
    expect(result.expression).toBe('*/5 * * * *');
    expect(result.format).toBe('unix');
  });

  it('returns null expression for malformed base64', () => {
    setHash('#expr=!!!invalid!!!&fmt=unix');
    const result = readFromUrl();
    expect(result.expression).toBe('');
  });
});

describe('base64url codec', () => {
  it('round-trips non-Latin1 text without throwing', () => {
    const input = '0 9 * * 日 €';
    expect(fromBase64Url(toBase64Url(input))).toBe(input);
  });

  it('returns empty string for bytes that are not valid UTF-8', () => {
    expect(fromBase64Url('_w')).toBe('');
  });
});
