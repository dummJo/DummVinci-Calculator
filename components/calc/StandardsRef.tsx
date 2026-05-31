"use client";

import { useState, useId } from "react";
import { BookOpen } from "lucide-react";
import { STANDARD_REFS, type StandardRefCode } from "@/lib/standards-refs";

/**
 * Small inline "cite the standard" affordance. Renders a book icon + the
 * standard title; click/hover reveals a popover with the paraphrased clause
 * summary and where the tool's value comes from.
 *
 * Keyboard- and screen-reader-accessible: the trigger is a real button with
 * aria-expanded and the popover is aria-describedby-linked.
 */
export default function StandardsRef({ code }: { code: StandardRefCode }) {
  const [open, setOpen] = useState(false);
  const ref = Reflect.get(STANDARD_REFS, code) as typeof STANDARD_REFS[keyof typeof STANDARD_REFS] | undefined;
  const popId = useId();
  if (!ref) return null;

  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={open ? popId : undefined}
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onBlur={() => setOpen(false)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 8px",
          borderRadius: 999,
          border: "1px solid var(--glass-border)",
          background: "rgba(var(--accent-rgb), 0.06)",
          color: "var(--accent)",
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          cursor: "help",
          lineHeight: 1.4,
        }}
      >
        <BookOpen size={11} strokeWidth={2.4} />
        {ref.title}
      </button>

      {open && (
        <span
          id={popId}
          role="tooltip"
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: 0,
            zIndex: 60,
            width: 300,
            maxWidth: "78vw",
            padding: 14,
            borderRadius: 12,
            background: "var(--popout-bg)",
            color: "var(--popout-fg)",
            border: "1px solid var(--popout-border)",
            boxShadow: "0 14px 36px rgba(0,0,0,0.3)",
            fontFamily: "var(--font-sans)",
            textTransform: "none",
            letterSpacing: "normal",
            cursor: "default",
          }}
        >
          <span style={{
            display: "block",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 800,
            color: "var(--accent)",
            marginBottom: 6,
          }}>{ref.title}</span>
          <span style={{ display: "block", fontSize: 12.5, lineHeight: 1.55, color: "var(--popout-fg)" }}>
            {ref.summary}
          </span>
          <span style={{
            display: "block",
            marginTop: 8,
            paddingTop: 8,
            borderTop: "1px dashed var(--popout-border)",
            fontSize: 10.5,
            color: "var(--popout-muted)",
            fontFamily: "var(--font-mono)",
          }}>
            {ref.source}
          </span>
        </span>
      )}
    </span>
  );
}
