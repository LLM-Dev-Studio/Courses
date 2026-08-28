"use client";

import { useState } from "react";

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) - link remains selectable/clickable.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center rounded-lg border border-[var(--sand-400)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--green-800)] transition hover:bg-[var(--sand-100)]"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
