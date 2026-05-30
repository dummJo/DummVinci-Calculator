"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { buildShareUrl } from "@/lib/share-link";
import type { ToolId } from "@/lib/state-store";

interface Props {
  tool: ToolId;
  inputs: Record<string, unknown>;
  /** Hidden when there's no result yet to share. */
  enabled?: boolean;
}

/**
 * Copies a self-contained share URL to the clipboard.
 * The URL encodes the form inputs in the hash so a recipient lands on
 * the exact same calculation — the SharedWatermark then announces brand
 * attribution on the recipient's view.
 */
export default function ShareButton({ tool, inputs, enabled = true }: Props) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  async function handleShare() {
    const url = buildShareUrl(tool, inputs);
    if (!url) return;
    try {
      // Web Share API where available (mobile native share sheet) — fall back to clipboard.
      const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
      if (nav.share) {
        await nav.share({ title: "DummVinci calculation", url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  }

  if (!enabled) return null;

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={copied ? "Link copied" : "Share calculation"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 18px",
        border: `1px solid ${copied ? "var(--accent)" : "var(--glass-border)"}`,
        color: copied ? "var(--accent)" : "var(--fg-soft)",
        background: copied ? "rgba(var(--accent-rgb), 0.10)" : "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        borderRadius: 999,
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        cursor: "pointer",
        transition: "all 0.18s ease",
      }}
    >
      {copied ? <Check size={14} strokeWidth={2.4} /> : <Share2 size={14} strokeWidth={2.4} />}
      <span>{error ? "Failed" : copied ? "Copied" : "Share"}</span>
    </button>
  );
}
