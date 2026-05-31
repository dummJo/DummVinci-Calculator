"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { History, ChevronDown } from "lucide-react";
import {
  listSnapshotsStable,
  bumpSnapshotVersion,
  type CalcSnapshot,
  type ToolId,
} from "@/lib/state-store";

const EMPTY_LIST: CalcSnapshot[] = [];

// Subscribe to storage changes (other tabs) and the same-tab "calc-snapshot-saved"
// event dispatched by pushSnapshot. For cross-tab storage events we also bump the
// version so listSnapshotsStable returns a fresh array.
function subscribeSnapshots(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = () => { bumpSnapshotVersion(); cb(); };
  const onSaved = () => cb();
  window.addEventListener("storage", onStorage);
  window.addEventListener("calc-snapshot-saved", onSaved);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("calc-snapshot-saved", onSaved);
  };
}

interface Props {
  tool: ToolId;
  /** Called when the user picks a snapshot — caller restores form state. */
  onRestore: (snap: CalcSnapshot) => void;
}

/**
 * Compact "history" trigger + dropdown listing recent calculations for a tool.
 * Hidden when there is no history yet (zero-clutter for first-time visitors).
 */
export default function RecentDropdown({ tool, onRestore }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync read from localStorage with cross-tab + same-tab change subscription.
  // listSnapshotsStable returns a stable reference until something mutates the
  // store (required by useSyncExternalStore — otherwise React 19 throws
  // "getSnapshot should be cached" and the whole page render crashes).
  const items = useSyncExternalStore<CalcSnapshot[]>(
    subscribeSnapshots,
    () => listSnapshotsStable(tool, 5),
    () => EMPTY_LIST,
  );

  // Click-outside to close
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px 10px 14px",
          border: "1px solid var(--glass-border)",
          color: "var(--fg-soft)",
          background: "var(--glass-bg)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          borderRadius: 999,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        <History size={14} strokeWidth={2.4} />
        <span>Recent</span>
        <span style={{
          fontSize: 9,
          padding: "2px 6px",
          borderRadius: 999,
          background: "rgba(var(--accent-rgb), 0.12)",
          color: "var(--accent)",
        }}>{items.length}</span>
        <ChevronDown size={12} strokeWidth={2.4} style={{
          transition: "transform 0.18s ease",
          transform: open ? "rotate(180deg)" : "rotate(0)",
        }}/>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 280,
            maxWidth: 360,
            zIndex: 50,
            background: "var(--popout-bg)",
            color: "var(--popout-fg)",
            border: "1px solid var(--popout-border)",
            borderRadius: 14,
            padding: 6,
            boxShadow: "0 16px 40px rgba(0,0,0,0.28)",
          }}
        >
          {items.map(snap => (
            <button
              key={snap.id}
              role="menuitem"
              type="button"
              onClick={() => { onRestore(snap); setOpen(false); }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 10,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "inherit",
                transition: "background 0.14s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--accent-rgb), 0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--popout-fg)",
                marginBottom: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {snap.label ?? snapshotFallbackLabel(snap)}
              </div>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--popout-muted)",
                letterSpacing: "0.08em",
              }}>
                {formatRelative(snap.createdAt)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function snapshotFallbackLabel(snap: CalcSnapshot): string {
  const entries = Object.entries(snap.inputs).slice(0, 3);
  return entries.map(([k, v]) => `${k}=${String(v)}`).join(" · ");
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}
