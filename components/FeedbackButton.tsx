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
 */
const FEEDBACK_EMAIL = process.env.NEXT_PUBLIC_FEEDBACK_EMAIL ?? "dummvinci@gmail.com";

type FeedbackType = "bug" | "feature" | "feedback";
const TYPE_META: Record<FeedbackType, { label: string; icon: typeof Bug; color: string }> = {
  bug:      { label: "Bug report",  icon: Bug,            color: "#ef4444" },
  feature:  { label: "Feature idea", icon: Lightbulb,     color: "#f59e0b" },
  feedback: { label: "Feedback",     icon: MessageSquare, color: "#3b82f6" },
};

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("feedback");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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
    // Fire analytics + flip UI state BEFORE handing the page off to the mail
    // handler. Some browsers stall script execution while the OS dispatches
    // mailto:, so doing it the other way around can lose the analytics ping.
    track("feedback-sent", { type });
    setSent(true);
    // Defer the navigation by a tick so the state update / analytics request
    // flush onto the wire before the browser context-switches.
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
      <button
        type="button"
        aria-label={open ? "Close feedback form" : "Send feedback"}
        aria-expanded={open}
        onClick={() => { setOpen(o => !o); if (!open) track("feedback-open"); }}
        style={{
          position: "fixed",
          right: 16,
          bottom: "calc(112px + env(safe-area-inset-bottom, 0px))",
          zIndex: 140,
          width: 44, height: 44,
          borderRadius: "50%",
          border: "1px solid var(--accent)",
          background: "var(--glass-bg)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          color: "var(--accent)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 8px 20px rgba(0,0,0,0.18), 0 0 0 4px rgba(var(--accent-rgb), 0.05)",
        }}
      >
        {open ? <X size={18} strokeWidth={2.4} /> : <MessageCircle size={18} strokeWidth={2.4} />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 139,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px) saturate(140%)",
            WebkitBackdropFilter: "blur(8px) saturate(140%)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 16,
            paddingBottom: "calc(172px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div
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
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 id="feedback-title" style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                color: "var(--popout-fg)",
              }}>
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
                  width: 28, height: 28, borderRadius: "50%",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
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
