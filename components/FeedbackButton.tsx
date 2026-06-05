"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X, Send, Bug, Lightbulb, MessageSquare } from "lucide-react";
import { track } from "@/lib/analytics";

/**
 * Floating feedback / report-to-admin button.
 *
 * On submit, builds a `mailto:` link with a structured subject + body and
 * opens the user's default mail client. Recipient is configurable via
 * NEXT_PUBLIC_FEEDBACK_EMAIL (defaults to the project owner). The mailto
 * approach is zero-infra and works on any device with a mail client; if
 * the user prefers to copy the message instead, the "Copy" fallback puts
 * the formatted body on the clipboard with the recipient address.
 *
 * UX: no auto-popup tooltip — the button alone invites interaction via a
 * slow, subtle "breathing" glow and a gentle notification dot. Opening the
 * form slides a bottom sheet up from below (no bouncy scale).
 */
const FEEDBACK_EMAIL = process.env.NEXT_PUBLIC_FEEDBACK_EMAIL ?? "dummvinci@gmail.com";

type FeedbackType = "bug" | "feature" | "feedback";
const TYPE_META: Record<FeedbackType, { label: string; icon: typeof Bug; color: string }> = {
  feedback: { label: "Feedback",     icon: MessageSquare, color: "#3b82f6" },
  bug:      { label: "Bug report",   icon: Bug,           color: "#ef4444" },
  feature:  { label: "Feature idea", icon: Lightbulb,     color: "#f59e0b" },
};

export default function FeedbackButton() {
  const [open, setOpen]       = useState(false);
  const [type, setType]       = useState<FeedbackType>("feedback");
  const [name, setName]       = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent]       = useState(false);
  const [copied, setCopied]   = useState(false);
  const [hovered, setHovered] = useState(false);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function openForm() {
    setOpen(true);
    track("feedback-open");
  }

  function buildMail(): { mailto: string; body: string; subject: string } {
    const subject = `[PTTS Praxis ${TYPE_META[type].label}] ${message.slice(0, 60) || "(no summary)"}`;
    const meta = typeof window !== "undefined"
      ? `URL: ${window.location.href}\nUA: ${navigator.userAgent}`
      : "";
    const body = [
      `Type: ${TYPE_META[type].label}`,
      name ? `From: ${name}` : "",
      "",
      message || "(no message)",
      "",
      "—",
      meta,
    ].filter(Boolean).join("\n");
    const mailto = `mailto:${encodeURIComponent(FEEDBACK_EMAIL)}`
      + `?subject=${encodeURIComponent(subject)}`
      + `&body=${encodeURIComponent(body)}`;
    return { mailto, body, subject };
  }

  function handleSubmit() {
    if (!message.trim()) return;
    const { mailto } = buildMail();
    track("feedback-sent", { type });
    setSent(true);
    setTimeout(() => { window.location.href = mailto; }, 0);
    setTimeout(() => { setSent(false); setOpen(false); setMessage(""); }, 1400);
  }

  async function handleCopy() {
    const { body, subject } = buildMail();
    try {
      await navigator.clipboard.writeText(
        `To: ${FEEDBACK_EMAIL}\nSubject: ${subject}\n\n${body}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked — ignore */ }
  }

  const TypeIcon = TYPE_META[type].icon;

  return (
    <>
      <style>{`
        /* Slow, subtle breathing glow — invites without a popup */
        @keyframes fb-breathe {
          0%, 100% { box-shadow: var(--fb-base-shadow), 0 0 0 0  rgba(var(--accent-rgb), 0); }
          50%      { box-shadow: var(--fb-base-shadow), 0 0 0 7px rgba(var(--accent-rgb), 0.12); }
        }
        /* Gentle notification dot pulse */
        @keyframes fb-dot {
          0%, 100% { transform: scale(1);    opacity: 0.85; }
          50%      { transform: scale(1.18); opacity: 0.55; }
        }
        /* Bottom sheet slides up — smooth, no overshoot */
        @keyframes fb-sheet-in {
          from { transform: translateY(100%); opacity: 0.4; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        /* Backdrop fade */
        @keyframes fb-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fb-fab, .fb-dot, .fb-sheet, .fb-backdrop { animation: none !important; }
        }
      `}</style>

      {/* Main FAB — the only resting-state UI */}
      <button
        type="button"
        className="fb-fab"
        aria-label={open ? "Close feedback form" : "Send feedback, report a bug, or ask a question"}
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openForm())}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "fixed",
          right: 16,
          bottom: "calc(112px + env(safe-area-inset-bottom, 0px))",
          zIndex: 142,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "1px solid var(--accent)",
          background: open ? "var(--accent)" : "var(--glass-bg)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          color: open ? "var(--bg)" : "var(--accent)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          ["--fb-base-shadow" as string]:
            "0 8px 20px rgba(0,0,0,0.18), 0 0 0 4px rgba(var(--accent-rgb), 0.05)",
          boxShadow:
            "0 8px 20px rgba(0,0,0,0.18), 0 0 0 4px rgba(var(--accent-rgb), 0.05)",
          // Slow breathing glow at rest; stops while the form is open.
          animation: open ? "none" : "fb-breathe 3.6s ease-in-out infinite",
          transition: "background 0.25s ease, color 0.25s ease, transform 0.2s ease",
          transform: hovered && !open ? "scale(1.08)" : "scale(1)",
        }}
      >
        {open
          ? <X size={18} strokeWidth={2.4} />
          : <MessageCircle size={18} strokeWidth={2.4} />}

        {/* Subtle notification dot */}
        {!open && (
          <span
            className="fb-dot"
            style={{
              position: "absolute",
              top: 3,
              right: 3,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--accent)",
              border: "1.5px solid var(--bg)",
              animation: "fb-dot 2.6s ease-in-out infinite",
            }}
          />
        )}
      </button>

      {/* Form — bottom sheet sliding up from below */}
      {open && (
        <div
          className="fb-backdrop"
          data-no-ptr=""
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 139,
            background: "rgba(0,0,0,0.32)",
            backdropFilter: "blur(5px) saturate(130%)",
            WebkitBackdropFilter: "blur(5px) saturate(130%)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 16,
            paddingBottom: "calc(172px + env(safe-area-inset-bottom, 0px))",
            animation: "fb-backdrop-in 0.3s ease both",
          }}
        >
          <div
            className="fb-sheet"
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              background: "var(--popout-bg)",
              color: "var(--popout-fg)",
              border: "1px solid var(--popout-border)",
              borderRadius: 20,
              padding: 18,
              boxShadow: "0 24px 60px rgba(0,0,0,0.32)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              animation: "fb-sheet-in 0.42s cubic-bezier(0.32, 0.72, 0, 1) both",
              willChange: "transform",
            }}
          >
            {/* Grab handle — bottom-sheet affordance */}
            <div
              aria-hidden="true"
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                background: "var(--popout-muted)",
                opacity: 0.35,
                margin: "-4px auto 4px",
              }}
            />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3
                id="feedback-title"
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  color: "var(--popout-fg)",
                }}
              >
                Report &amp; Feedback
              </h3>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                style={{
                  background: "rgba(var(--accent-rgb), 0.06)",
                  border: "1px solid var(--popout-border)",
                  color: "var(--popout-muted)",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={14} strokeWidth={2.4} />
              </button>
            </div>

            {/* Type pills */}
            <div role="radiogroup" aria-label="Feedback type" style={{ display: "flex", gap: 6 }}>
              {(Object.keys(TYPE_META) as FeedbackType[]).map(k => {
                const meta = TYPE_META[k];
                const active = type === k;
                const Icon = meta.icon;
                return (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setType(k)}
                    style={{
                      flex: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "8px 6px",
                      borderRadius: 10,
                      border: `1px solid ${active ? meta.color : "var(--popout-border)"}`,
                      background: active ? `${meta.color}1a` : "transparent",
                      color: active ? meta.color : "var(--popout-muted)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "all 0.16s ease",
                    }}
                  >
                    <Icon size={12} strokeWidth={2.4} />
                    {meta.label}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
            />

            <textarea
              placeholder={`Describe the ${TYPE_META[type].label.toLowerCase()}…`}
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              style={{ ...inputStyle, resize: "vertical", minHeight: 90, fontFamily: "var(--font-sans)" }}
              required
            />

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!message.trim()}
                style={{
                  flex: "1 1 160px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px 18px",
                  borderRadius: 999,
                  border: "none",
                  background: message.trim() ? "var(--accent)" : "var(--popout-border)",
                  color: message.trim() ? "var(--popout-bg)" : "var(--popout-muted)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: message.trim() ? "pointer" : "not-allowed",
                  boxShadow: message.trim() ? "0 6px 18px rgba(var(--accent-rgb), 0.32)" : "none",
                  transition: "transform 0.12s ease, box-shadow 0.16s ease",
                }}
              >
                {sent ? <TypeIcon size={14} strokeWidth={2.4} /> : <Send size={14} strokeWidth={2.4} />}
                {sent ? "Sent — thank you" : "Send via email"}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!message.trim()}
                style={{
                  padding: "12px 16px",
                  borderRadius: 999,
                  border: "1px solid var(--popout-border)",
                  background: "transparent",
                  color: "var(--popout-fg)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: message.trim() ? "pointer" : "not-allowed",
                  opacity: message.trim() ? 1 : 0.5,
                }}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <p style={{
              margin: 0,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--popout-muted)",
              letterSpacing: "0.04em",
              opacity: 0.8,
            }}>
              Routes to <strong style={{ color: "var(--popout-fg)" }}>{FEEDBACK_EMAIL}</strong>.
              Your message is sent through your own mail app — nothing is uploaded by the site.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid var(--popout-border)",
  background: "rgba(var(--accent-rgb), 0.04)",
  color: "var(--popout-fg)",
  fontFamily: "var(--font-mono)",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};
