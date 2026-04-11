import { useState } from 'react';

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link to share your expression:', url);
    }
  }

  return (
    <button
      className={`share-btn${copied ? ' share-btn--copied' : ''}`}
      onClick={handleCopy}
      aria-label="Copy shareable link to clipboard"
    >
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}
