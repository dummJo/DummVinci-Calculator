import RichText from "./RichText";

interface Props {
  label: string;
  title: string;
  subtitle: string;
  concept?: string;
  children: React.ReactNode;
}

export default function CalcShell({ label, title, subtitle, concept, children }: Props) {
  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 40px" }}>
      <div className="sec-label" style={{ marginBottom: 8 }}>
        <span>{label}</span>
      </div>
      <h1 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(26px, 5vw, 38px)",
        fontWeight: 400,
        color: "var(--fg)",
        letterSpacing: "-0.02em",
        lineHeight: 1.1,
        margin: "0 0 8px",
      }}>
        {title}
      </h1>
      <p style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--fs-xs)",
        color: "var(--muted)",
        letterSpacing: "0.04em",
        margin: concept ? "0 0 24px" : "0 0 32px",
        lineHeight: 1.6,
      }}>
        {subtitle}
      </p>

      {concept && (
        <div style={{
          marginBottom: 32, padding: 16,
          background: "linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(201,168,76,0.02) 100%)",
          border: "1px solid rgba(201,168,76,0.25)",
          borderRadius: 20, display: "flex", gap: 14,
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05)"
        }}>
          <div style={{ color: "var(--accent)", marginTop: 2 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}>Engineering 101 (Newbie Guide)</span>
            <span style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.65, opacity: 0.9 }}>
              <RichText text={concept} />
            </span>
          </div>
        </div>
      )}

      {children}
    </main>
  );
}
