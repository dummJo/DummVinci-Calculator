"use client";

import { useEffect, useRef, useState } from "react";
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
 * Attention animation:
 *   – Fires 5 s after mount, repeats every 45 s.
 *   – A speech-bubble tooltip slides in from the right cycling through three
 *     invitation messages while the button pulses a ring.
 *   – Dismissed automatically after 7 s, or immediately when the user opens
 *     the form.
 */
const FEEDBACK_EMAIL = process.env.NEXT_PUBLIC_FEEDBACK_EMAIL ?? "dummvinci@gmail.com";

type FeedbackType = "bug" | "feature" | "feedback";

const TYPE_META: Record<FeedbackType, { label: string; icon: typeof Bug; color: string; invite: string; emoji: string }> = {
  feedback: { label: "Feedback",     icon: MessageSquare, color: "#3b82f6", invite: "Ada pertanyaan?",  emoji: "💬" },
  bug:      { label: "Bug report",   icon: Bug,           color: "#ef4444", invite: "Temukan bug?",      emoji: "🐛" },
  feature:  { label: "Feature idea", icon: Lightbulb,     color: "#f59e0b", invite: "Punya ide baru?",  emoji: "💡" },
};

const INVITE_CYCLE: FeedbackType[] = ["feedback", "bug", "feature"];

export default function FeedbackButton() {
  const [open, setOpen]       = useState(false);
  const [type, setType]       = useState<FeedbackType>("feedback");
  const [name, setName]       = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent]       = useState(false);
  const [copied, setCopied]   = useState(false);

  // Attention animation state
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleIdx, setBubbleIdx]         = useState(0);
  const [bubbleFading, setBubbleFading]   = useState(false);
  const [hovered, setHovered]             = useState(false);

  const bubbleTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleTimer   = useRef<ReturnType<typeof setInterval> | null>(null);
  const repeatTimer  = useRef<ReturnType<typeof setInterval> | null>(null);

  function showBubble() {
    setBubbleIdx(0);
    setBubbleFading(false);
    setBubbleVisible(true);

    // Cycle through invitation messages every 2.3 s
    let i = 0;
    cycleTimer.current = setInterval(() => {
      i = (i + 1) % INVITE_CYCLE.length;
      setBubbleIdx(i);
    }, 2300);

    // Fade out after 7 s
    bubbleTimer.current = setTimeout(() => {
      clearInterval(cycleTimer.current!);
      setBubbleFading(true);
      setTimeout(() => setBubbleVisible(false), 400);
    }, 7000);
  }

  function hideBubble() {
    clearTimeout(bubbleTimer.current!);
    clearInterval(cycleTimer.current!);
    setBubbleFading(true);
    setTimeout(() => setBubbleVisible(false), 300);
  }

  useEffect(() => {
    // First appearance: 5 s after mount
    const firstTimer = setTimeout(showBubble, 5000);
    // Repeat every 45 s
    repeatTimer.current = setInterval(showBubble, 45000);
    return () => {
      clearTimeout(firstTimer);
      clearInterval(repeatTimer.current!);
      clearInterval(cycleTimer.current!);
      clearTimeout(bubbleTimer.current!);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Esc to close form
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function openForm() {
    hideBubble();
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

  const TypeIcon         = TYPE_META[type].icon;
  const currentInviteKey = (INVITE_CYCLE[bubbleIdx] ?? "feedback") as FeedbackType;
  const currentInvite    = TYPE_META[currentInviteKey];
  const isAttentionMode  = bubbleVisible && !open;
  const bottomBase      = "calc(112px + env(safe-area-inset-bottom, 0px))";

  return (
    <>
      <style>{`
        /* Ring pulse emanating from button */
        @keyframes fb-ring {
          0%   { box-shadow: var(--fb-base-shadow), 0 0 0 0   rgba(var(--accent-rgb), 0.55); }
          70%  { box-shadow: var(--fb-base-shadow), 0 0 0 14px rgba(var(--accent-rgb), 0); }
          100% { box-shadow: var(--fb-base-shadow), 0 0 0 0   rgba(var(--accent-rgb), 0); }
        }
        /* Entry bounce when first appearing */
        @keyframes fb-bounce-in {
          0%   { transform: scale(0.7); opacity: 0; }
          55%  { transform: scale(1.12); opacity: 1; }
          75%  { transform: scale(0.95); }
          90%  { transform: scale(1.04); }
          100% { transform: scale(1); }
        }
        /* Speech-bubble slide in */
        @keyframes fb-slide-in {
          from { opacity: 0; transform: translateX(12px) scale(0.88); }
          to   { opacity: 1; transform: translateX(0)    scale(1); }
        }
        /* Message swap fade */
        @keyframes fb-msg-in {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Hover label slide in */
        @keyframes fb-label-in {
          from { opacity: 0; transform: translateX(6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        /* Notification dot pulse */
        @keyframes fb-dot {
          0%, 100% { transform: scale(1);    opacity: 1; }
          50%      { transform: scale(1.4);  opacity: 0.7; }
        }
        /* Gentle idle wiggle to keep attracting attention */
        @keyframes fb-wiggle {
          0%, 80%, 100% { transform: rotate(0deg); }
          85%           { transform: rotate(-9deg); }
          90%           { transform: rotate(8deg); }
          95%           { transform: rotate(-5deg); }
        }
      `}</style>

      {/* Speech-bubble invitation */}
      {isAttentionMode && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            right: "calc(16px + 44px + 10px)",
            bottom: bottomBase,
            zIndex: 141,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            gap: 0,
            animation: bubbleFading
              ? "none"
              : "fb-slide-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
            opacity: bubbleFading ? 0 : 1,
            transition: bubbleFading ? "opacity 0.35s ease" : "none",
          }}
        >
          {/* Bubble body */}
          <div
            style={{
              background: "var(--glass-bg, rgba(20,20,20,0.85))",
              backdropFilter: "blur(12px) saturate(160%)",
              WebkitBackdropFilter: "blur(12px) saturate(160%)",
              border: `1px solid ${currentInvite.color}55`,
              borderRadius: "12px 12px 4px 12px",
              padding: "9px 13px",
              minWidth: 148,
              boxShadow: `0 8px 24px rgba(0,0,0,0.28), 0 0 0 1px ${currentInvite.color}22`,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {/* Cycling message */}
            <div
              key={bubbleIdx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                animation: "fb-msg-in 0.28s ease both",
              }}
            >
              <span style={{ fontSize: 15, lineHeight: 1 }}>{currentInvite.emoji}</span>
              <span style={{
                fontFamily: "var(--font-display)",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--parchment, #faf9f5)",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
              }}>
                {currentInvite.invite}
              </span>
            </div>

            {/* Subtitle */}
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: currentInvite.color,
              opacity: 0.85,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}>
              Tap to tell us →
            </div>

            {/* Progress dots */}
            <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
              {INVITE_CYCLE.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === bubbleIdx ? 14 : 5,
                    height: 5,
                    borderRadius: 3,
                    background: i === bubbleIdx ? currentInvite.color : "rgba(255,255,255,0.2)",
                    transition: "width 0.3s ease, background 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Bubble tail → pointing right */}
          <div style={{
            width: 0,
            height: 0,
            borderTop: "7px solid transparent",
            borderBottom: "7px solid transparent",
            borderLeft: `8px solid ${currentInvite.color}55`,
            marginLeft: -1,
            alignSelf: "flex-end",
            marginBottom: 6,
            filter: "drop-shadow(1px 0 0 rgba(0,0,0,0.1))",
          }} />
        </div>
      )}

      {/* Hover label (desktop) */}
      {hovered && !open && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            right: "calc(16px + 44px + 8px)",
            bottom: bottomBase,
            zIndex: 141,
            pointerEvents: "none",
            animation: "fb-label-in 0.18s ease both",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{
            background: "var(--glass-bg, rgba(20,20,20,0.9))",
            border: "1px solid rgba(var(--accent-rgb), 0.3)",
            borderRadius: "8px 8px 4px 8px",
            padding: "6px 10px",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--accent)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}>
            Feedback / Bug / Idea
          </div>
          <div style={{
            width: 0,
            height: 0,
            borderTop: "5px solid transparent",
            borderBottom: "5px solid transparent",
            borderLeft: "6px solid rgba(var(--accent-rgb), 0.3)",
            marginLeft: -1,
          }} />
        </div>
      )}

      {/* Main FAB */}
      <button
        type="button"
        aria-label={open ? "Close feedback form" : "Send feedback"}
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openForm())}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "fixed",
          right: 16,
          bottom: bottomBase,
          zIndex: 142,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "1px solid var(--accent)",
          background: open
            ? "var(--accent)"
            : "var(--glass-bg)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          color: open ? "var(--bg)" : "var(--accent)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          // CSS custom prop so fb-ring can reference it
          ["--fb-base-shadow" as string]:
            "0 8px 20px rgba(0,0,0,0.18), 0 0 0 4px rgba(var(--accent-rgb), 0.05)",
          boxShadow:
            "0 8px 20px rgba(0,0,0,0.18), 0 0 0 4px rgba(var(--accent-rgb), 0.05)",
          animation: isAttentionMode
            ? "fb-ring 1.4s ease-out infinite, fb-wiggle 4s ease-in-out 1.5s infinite"
            : "fb-wiggle 4s ease-in-out 12s infinite",
          transition: "background 0.2s ease, color 0.2s ease, transform 0.15s ease",
          transform: hovered && !open ? "scale(1.1)" : "scale(1)",
        }}
      >
        {open
          ? <X size={18} strokeWidth={2.4} />
          : <MessageCircle size={18} strokeWidth={2.4} />}

        {/* Notification dot */}
        {!open && (
          <span style={{
            position: "absolute",
            top: 3,
            right: 3,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: isAttentionMode ? "#ef4444" : "var(--accent)",
            border: "1.5px solid var(--bg)",
            animation: isAttentionMode ? "fb-dot 1.1s ease-in-out infinite" : "none",
            opacity: isAttentionMode ? 1 : 0.6,
            transition: "opacity 0.3s",
          }} />
        )}
      </button>

      {/* Form modal */}
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
              animation: "fb-bounce-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
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
