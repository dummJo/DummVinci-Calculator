"use client";

import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * "Why Praxis?" — the philosophical layer of the brand. Reveals the
 * Aristotelian three modes (theoria · poiesis · praxis), maps them onto
 * the engineer's daily work, and surfaces the money line that anchors
 * the brand: industry pays for problems solved, not knowledge possessed.
 *
 * Triggered by a discrete glyph button on the landing hero; closes via
 * X, click-outside, or Esc.
 */
export default function PraxisModal() {
  const { t } = useLang();
  const m = t.home.praxisModal;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Inline keyframes so the trigger pill has its own subtle breathing accent
          (independent of the global no-motion reduced-motion guard). */}
      <style>{`
        @keyframes praxis-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0); }
          50%      { box-shadow: 0 0 0 6px rgba(var(--accent-rgb), 0.06); }
        }
        @keyframes praxis-sheen {
          0%   { transform: translateX(-100%) skewX(-12deg); opacity: 0; }
          40%  { opacity: 0.55; }
          100% { transform: translateX(180%)  skewX(-12deg); opacity: 0; }
        }
        @keyframes praxis-modal-in {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes praxis-pillar-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes praxis-orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .praxis-trigger, .praxis-trigger::before { animation: none !important; }
          .praxis-sheet, .praxis-pillar           { animation: none !important; }
          .praxis-orbit                            { animation: none !important; }
        }
      `}</style>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="praxis-trigger"
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 18px 10px 14px",
          borderRadius: 999,
          border: "1px solid rgba(var(--accent-rgb), 0.35)",
          background: "linear-gradient(135deg, rgba(var(--accent-rgb), 0.10), rgba(var(--accent-rgb), 0.02) 60%, transparent)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          color: "var(--accent)",
          fontFamily: "var(--font-display)",
          fontSize: 12,
          letterSpacing: "0.04em",
          cursor: "pointer",
          overflow: "hidden",
          animation: "praxis-glow 3.6s ease-in-out infinite",
        }}
      >
        {/* Light sheen sweep — premium feel without crowding. */}
        <span aria-hidden style={{
          position: "absolute",
          top: 0, left: 0, height: "100%", width: "32%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
          animation: "praxis-sheen 4.5s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "0.18em",
          color: "var(--accent)",
          textShadow: "0 0 12px rgba(var(--accent-rgb), 0.5)",
          position: "relative",
        }}>{t.home.praxisGlyph}</span>
        <span style={{ opacity: 0.45, position: "relative" }}>·</span>
        <span style={{ fontWeight: 700, position: "relative" }}>{t.home.praxisTriggerLabel}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="praxis-modal-title"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "radial-gradient(circle at 50% 30%, rgba(var(--accent-rgb), 0.10), rgba(0,0,0,0.6))",
            backdropFilter: "blur(10px) saturate(140%)",
            WebkitBackdropFilter: "blur(10px) saturate(140%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="praxis-sheet"
            style={{
              width: "100%",
              maxWidth: 560,
              maxHeight: "85vh",
              overflowY: "auto",
              background: "var(--popout-bg)",
              color: "var(--popout-fg)",
              border: "1px solid var(--popout-border)",
              borderRadius: 24,
              padding: 28,
              boxShadow: "0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(var(--accent-rgb), 0.10)",
              position: "relative",
              animation: "praxis-modal-in 0.42s cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
          >
            {/* Top accent bar — fades in/out across the width */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 3,
              background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
              opacity: 0.85,
              borderRadius: "24px 24px 0 0",
            }} />

            {/* Subtle corner orbit decoration around the Greek glyph */}
            <div aria-hidden style={{
              position: "absolute", top: 28, left: 28, width: 90, height: 90,
              pointerEvents: "none", zIndex: 0,
            }}>
              <svg viewBox="0 0 100 100" width="100%" height="100%" className="praxis-orbit"
                style={{ animation: "praxis-orbit 22s linear infinite", opacity: 0.18 }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="2 6" />
                <circle cx="92" cy="50" r="2.2" fill="var(--accent)" />
              </svg>
            </div>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, position: "relative", zIndex: 1 }}>
              <div>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 42,
                  fontWeight: 400,
                  letterSpacing: "0.06em",
                  color: "var(--accent)",
                  lineHeight: 1,
                  marginBottom: 8,
                  textShadow: "0 0 28px rgba(var(--accent-rgb), 0.32)",
                }}>
                  {t.home.praxisGlyph}
                </div>
                <h2 id="praxis-modal-title" style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  color: "var(--popout-fg)",
                }}>
                  {m.title}
                </h2>
              </div>
              <button
                type="button"
                aria-label={m.closeLabel}
                onClick={() => setOpen(false)}
                style={{
                  background: "rgba(var(--accent-rgb), 0.06)",
                  border: "1px solid var(--popout-border)",
                  color: "var(--popout-muted)",
                  width: 32, height: 32, borderRadius: "50%",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0,
                }}
              >
                <X size={16} strokeWidth={2.4} />
              </button>
            </div>

            {/* Intro epigraph */}
            <blockquote style={{
              margin: "0 0 22px",
              padding: "12px 16px",
              borderLeft: "3px solid var(--accent)",
              fontFamily: "var(--font-display)",
              fontSize: 15,
              fontStyle: "italic",
              lineHeight: 1.55,
              color: "var(--popout-fg)",
              opacity: 0.92,
            }}>
              {m.intro}
            </blockquote>

            {/* Aristotle's three modes */}
            <Section title={m.aristotleTitle}>
              <ThreeRow
                rows={[
                  { tag: "θεωρία", color: "#3b82f6", text: m.aristotleTheoria },
                  { tag: "ποίησις", color: "#f59e0b", text: m.aristotlePoiesis },
                  { tag: "πρᾶξις",  color: "var(--accent)", text: m.aristotlePraxis  },
                ]}
              />
            </Section>

            {/* Engineering translation */}
            <Section title={m.engineeringTitle}>
              <ThreeRow
                rows={[
                  { tag: "Theoria", color: "#3b82f6", text: m.engineeringTheoria },
                  { tag: "Poiesis", color: "#f59e0b", text: m.engineeringPoiesis },
                  { tag: "Praxis",  color: "var(--accent)", text: m.engineeringPraxis  },
                ]}
              />
            </Section>

            {/* Money line */}
            <div style={{
              marginTop: 22,
              padding: 16,
              borderRadius: 14,
              background: "rgba(var(--accent-rgb), 0.06)",
              border: "1px solid rgba(var(--accent-rgb), 0.18)",
            }}>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--popout-muted)",
                marginBottom: 6,
                fontWeight: 700,
              }}>
                {m.moneyLineLead}
              </div>
              <p style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontSize: 17,
                fontWeight: 700,
                lineHeight: 1.45,
                color: "var(--popout-fg)",
                letterSpacing: "-0.01em",
              }}>
                {m.moneyLine}
              </p>
              <div style={{
                marginTop: 8,
                fontSize: 13,
                color: "var(--popout-muted)",
                fontStyle: "italic",
              }}>
                {m.moneyLineTail}
              </div>
            </div>

            {/* Closing line — three pillars in the tool */}
            <div style={{
              marginTop: 18,
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              lineHeight: 1.55,
              color: "var(--popout-muted)",
              letterSpacing: "0.02em",
            }}>
              <Sparkles size={13} strokeWidth={2.2} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
              <span>{m.attribution}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--popout-muted)",
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <span>{title}</span>
        <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, var(--popout-border), transparent)" }} />
      </div>
      {children}
    </div>
  );
}

function ThreeRow({ rows }: { rows: { tag: string; color: string; text: string }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((r, i) => (
        <div
          key={i}
          className="praxis-pillar"
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 12,
            alignItems: "center",
            padding: "10px 14px",
            borderRadius: 12,
            background: "rgba(var(--accent-rgb), 0.04)",
            border: "1px solid rgba(var(--accent-rgb), 0.10)",
            position: "relative",
            overflow: "hidden",
            animation: `praxis-pillar-in 0.42s cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 90}ms both`,
            transition: "transform 0.22s ease, background 0.22s ease, border-color 0.22s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${r.color}14`;
            e.currentTarget.style.borderColor = `${r.color}66`;
            e.currentTarget.style.transform = "translateX(2px)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(var(--accent-rgb), 0.04)";
            e.currentTarget.style.borderColor = "rgba(var(--accent-rgb), 0.10)";
            e.currentTarget.style.transform = "translateX(0)";
          }}
        >
          {/* Vertical accent stripe — the spine of the pillar */}
          <span aria-hidden style={{
            position: "absolute", left: 0, top: 8, bottom: 8, width: 3,
            borderRadius: 2, background: r.color, opacity: 0.7,
          }} />
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            minWidth: 72, padding: "3px 10px",
            fontFamily: "var(--font-display)",
            fontSize: 13, fontWeight: 800,
            color: r.color,
            background: `${r.color}1a`,
            border: `1px solid ${r.color}40`,
            borderRadius: 999,
            letterSpacing: "0.04em",
          }}>
            {r.tag}
          </span>
          <span style={{
            fontSize: 13.5,
            lineHeight: 1.55,
            color: "var(--popout-fg)",
          }}>
            {r.text}
          </span>
        </div>
      ))}
    </div>
  );
}
