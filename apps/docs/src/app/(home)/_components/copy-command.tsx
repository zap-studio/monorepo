'use client';

import { Check, Clipboard } from 'lucide-react';
import { useState } from 'react';

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // reset after 2s
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  return (
    <div className="relative">
      <pre className="overflow-x-auto px-4 py-3 text-sm">
        <code>{command}</code>
      </pre>
      <button
        aria-label="Copy command"
        className="absolute top-2 right-2 rounded-md p-1 text-fd-muted-foreground hover:text-foreground"
        onClick={copyToClipboard}
        type="button"
      >
        {copied ? (
          <Check className="size-4" />
        ) : (
          <Clipboard className="size-4" />
        )}
      </button>
    </div>
  );
}
