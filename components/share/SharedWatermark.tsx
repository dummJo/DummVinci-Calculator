"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { isSharedView, clearShareHash } from "@/lib/share-link";
import { track } from "@/lib/analytics";

// Subscribe to URL hash changes (back/forward, programmatic replaceState fires manually below).
function subscribeHash(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

/**
 * Persistent attribution overlay shown whenever the page was opened from a
 * DummVinci share link. Visible bottom-right, dismissable. Mounts globally
 * in layout — no-op unless the URL hash starts with the share prefix.
 *
 * Brand acquisition: every shared calc carries our mark.
 */
export default function SharedWatermark() {
  // SSR snapshot is always false (no window); client snapshot reads the live hash.
  // useSyncExternalStore handles the SSR-to-client transition without a hydration mismatch.
  const present = useSyncExternalStore(
    subscribeHash,
    () => isSharedView(),
    () => false,
  );
  // Local dismiss flag — once dismissed we hide even if hash is still around (the
  // dismiss handler also strips it via history.replaceState).
  const [dismissed, setDismissed] = useState(false);

  // Fire the "shared link opened" goal exactly once per shared landing.
  const tracked = useRef(false);
  useEffect(() => {
    if (present && !tracked.current) {
      tracked.current = true;
      track("share-link-opened");
    }
  }, [present]);

  if (!present || dismissed) return null;

  return (
    <div
      role="status"
      aria-label="Shared via PTTS Praxis · by DummVinci"
      style={{
        position: "fixed",
        right: 16,
        // Stack above the feedback FAB (44px tall @ bottom:112px) so both stay
        // tappable — they otherwise share this corner and the watermark (z150)
        // would cover the FAB (z142).
        bottom: "calc(172px + env(safe-area-inset-bottom, 0px))",
        zIndex: 150,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        border: "1px solid var(--accent)",
        borderRadius: 999,
        boxShadow: "0 10px 30px rgba(0,0,0,0.18), 0 0 0 4px rgba(var(--accent-rgb), 0.08)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "var(--fg)",
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "var(--font-display)",
        letterSpacing: "-0.01em",
        fontSize: 13,
      }}>
        <span style={{ fontWeight: 300, fontStyle: "italic", opacity: 0.7 }}>PTTS</span>
        <span style={{ fontWeight: 800, color: "var(--accent)" }}>Praxis</span>
      </span>
      <span style={{ opacity: 0.65 }}>·</span>
      <span style={{ opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.12em" }}>
        Shared calculation
      </span>
      <span style={{ opacity: 0.55, fontSize: 9 }}>by DummVinci</span>
      <button
        type="button"
        aria-label="Dismiss share banner"
        onClick={() => { clearShareHash(); setDismissed(true); }}
        style={{
          marginLeft: 4,
          background: "rgba(var(--accent-rgb), 0.08)",
          border: "1px solid var(--glass-border)",
          color: "var(--accent)",
          width: 22, height: 22,
          borderRadius: "50%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <X size={12} strokeWidth={2.4} />
      </button>
    </div>
  );
}
