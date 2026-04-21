import RichText from "./RichText";

import { useLang } from "@/lib/i18n";

interface Props {
  label: string;
  title: string;
  subtitle: string;
  concept?: string;
  children: React.ReactNode;
}

export default function CalcShell({ label, title, subtitle, concept, children }: Props) {
  const { t } = useLang();
  return (
    <main style={{ maxWidth: 840, margin: "0 auto", padding: "64px 24px 120px" }}>
      {/* Brand & Section Label */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 28,
          height: 28,
          border: "1px solid var(--accent)",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: "var(--accent)",
          flexShrink: 0,
          background: "rgba(201,168,76,0.06)",
        }}>
          ◈
        </div>
        <div className="sec-label" style={{ marginBottom: 0 }}>
          <span>{label}</span>
        </div>
      </div>

      <h1 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(32px, 6.5vw, 56px)",
        fontWeight: 400,
        color: "var(--fg)",
        letterSpacing: "-0.035em",
        lineHeight: 0.95,
        margin: "0 0 16px",
      }}>
        {title}
      </h1>
      
      <p style={{
        fontFamily: "var(--font-mono)",
        fontSize: "clamp(12px, 1.5vw, 14px)",
        color: "var(--muted)",
        letterSpacing: "0.06em",
        margin: concept ? "0 0 32px" : "0 0 56px",
        lineHeight: 1.5,
        maxWidth: 620,
      }}>
        {subtitle}
      </p>

      {concept && (
        <div style={{
          marginBottom: 48, padding: "20px 24px",
          background: "linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(13,16,22,0.1) 100%)",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: 24, display: "flex", gap: 16,
          boxShadow: "var(--glass-shadow)"
        }}>
          <div style={{ color: "var(--accent)", marginTop: 4 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "var(--font-mono)" }}>{t.common.guidanceTheory}</span>
            <div style={{ fontSize: "14px", color: "var(--fg)", lineHeight: 1.6, opacity: 0.95 }}>
              <RichText text={concept} />
            </div>
          </div>
        </div>
      )}

      {children}
    </main>
  );
}
