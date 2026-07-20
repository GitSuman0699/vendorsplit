'use client';

import { useState } from 'react';

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Create the full absolute URL
      const fullUrl = `${window.location.origin}${url}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button 
      onClick={handleCopy}
      className={`btn btn-sm ${copied ? 'btn-primary' : 'btn-secondary'}`}
      style={{ flex: 1, background: copied ? 'var(--color-success)' : undefined, borderColor: copied ? 'var(--color-success)' : undefined }}
      title="Copy the magic login link for this vendor"
    >
      {copied ? '✓ Copied!' : '🔗 Copy Link'}
    </button>
  );
}
