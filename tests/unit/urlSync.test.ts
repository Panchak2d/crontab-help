import { describe, it, expect, beforeEach } from 'vitest';
import { readFromUrl } from '../../src/hooks/useUrlSync';

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
