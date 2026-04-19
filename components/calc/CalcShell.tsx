interface Props {
  label: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function CalcShell({ label, title, subtitle, children }: Props) {
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
        margin: "0 0 32px",
        lineHeight: 1.6,
      }}>
        {subtitle}
      </p>
      {children}
    </main>
  );
}
