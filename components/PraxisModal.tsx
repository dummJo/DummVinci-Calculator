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
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          borderRadius: 999,
          border: "1px solid var(--glass-border)",
          background: "var(--glass-bg)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          color: "var(--accent)",
          fontFamily: "var(--font-display)",
          fontSize: 12,
          letterSpacing: "0.04em",
          cursor: "pointer",
        }}
      >
        <span style={{
          fontFamily: "var(--font-display)",
          letterSpacing: "0.22em",
          opacity: 0.85,
        }}>{t.home.praxisGlyph}</span>
        <span style={{ opacity: 0.7 }}>·</span>
        <span style={{ fontWeight: 600 }}>{t.home.praxisTriggerLabel}</span>
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
              boxShadow: "0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(var(--accent-rgb), 0.08)",
              position: "relative",
            }}
          >
            {/* Top accent bar */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 3,
              background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
              opacity: 0.85,
              borderRadius: "24px 24px 0 0",
            }} />

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 36,
                  fontWeight: 400,
                  letterSpacing: "0.06em",
                  color: "var(--accent)",
                  lineHeight: 1,
                  marginBottom: 6,
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
        <div key={i} style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 12,
          alignItems: "baseline",
          padding: "8px 12px",
          borderRadius: 10,
          background: "rgba(var(--accent-rgb), 0.04)",
          border: "1px solid rgba(var(--accent-rgb), 0.10)",
        }}>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: 13,
            fontWeight: 700,
            color: r.color,
            minWidth: 64,
            letterSpacing: "0.04em",
          }}>
            {r.tag}
          </span>
          <span style={{
            fontSize: 13.5,
            lineHeight: 1.5,
            color: "var(--popout-fg)",
          }}>
            {r.text}
          </span>
        </div>
      ))}
    </div>
  );
}
