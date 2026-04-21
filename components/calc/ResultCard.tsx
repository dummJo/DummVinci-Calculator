"use client";
import { useLang } from "@/lib/i18n";

interface Row { label: string; value: string | number; accent?: boolean }

interface Props {
  title: string;
  rows: Row[];
  recommendation?: string;
  warnings?: string[];
  features?: string[];
  featuresLabel?: string;
}

export default function ResultCard({ title, rows, recommendation, warnings, features, featuresLabel }: Props) {
  const { t } = useLang();

  return (
    <div className="vinci-card result-card-enter" style={{ marginTop: 32, padding: "24px 28px" }}>
      {/* header */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: "1px solid var(--hairline-soft)",
      }}>
        <div style={{
          padding: "2px 8px",
          background: "var(--accent-pill-bg)",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
        }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: "var(--accent)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}>
            {t.common.resultLabel}
          </span>
        </div>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: "18px",
          color: "var(--fg)",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}>
          {title.includes(" ") ? (
            <>
              <span style={{ fontWeight: 800 }}>{title.split(" ")[0]}</span>
              {" "}
              <span style={{ fontWeight: 400, opacity: 0.8 }}>{title.split(" ").slice(1).join(" ")}</span>
            </>
          ) : (
            <span style={{ fontWeight: 800 }}>{title}</span>
          )}
        </span>
      </div>

      {/* rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
            paddingBottom: 14,
            borderBottom: i < rows.length - 1 ? "1px solid var(--hairline-soft)" : "none",
          }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              flexShrink: 0,
            }}>
              {r.label}
            </span>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: r.accent ? "16px" : "14px",
              color: r.accent ? "var(--accent)" : "var(--fg)",
              fontWeight: r.accent ? 700 : 400,
              textAlign: "right",
            }}>
              {r.value}
            </span>
          </div>
        ))}
      </div>

      {/* features */}
      {features && features.length > 0 && (
        <div style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: "1px solid var(--hairline-soft)",
        }}>
           <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: "var(--muted)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}>
            {featuresLabel || "Key Features"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--fs-xs)",
                color: "var(--accent)",
                lineHeight: 1.4,
              }}>
                <span style={{ fontSize: 10, marginTop: 1 }}>◈</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

       {/* recommendation */}
      {recommendation && (
        <div style={{
          marginTop: 16,
          padding: "10px 14px",
          background: "rgba(201,168,76,0.07)",
          border: "1px solid var(--gold-deep)",
          borderRadius: "var(--r-md)",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-xs)",
          color: "var(--parchment-dim)",
          lineHeight: 1.65,
          letterSpacing: "0.02em",
        }}>
          {recommendation}
        </div>
      )}

      {/* warnings */}
      {warnings && warnings.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {warnings.map((w, i) => (
            <div key={i} style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--fs-xs)",
              color: "#e8a045",
              lineHeight: 1.5,
            }}>
              <span style={{ flexShrink: 0 }}>⚠</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
