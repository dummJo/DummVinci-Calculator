"use client";

interface Props {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}

export default function FieldToggle({ label, checked, onChange, hint }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--glass-bg)",
          border: `1px solid ${checked ? "var(--accent)" : "var(--glass-border)"}`,
          borderRadius: "var(--r-md)",
          padding: "10px 14px",
          cursor: "pointer",
          transition: "border-color 0.18s ease",
          textAlign: "left",
          width: "100%",
        }}
      >
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-xs)",
          color: checked ? "var(--accent)" : "var(--fg-soft)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          transition: "color 0.18s ease",
        }}>
          {label}
        </span>
        <span style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: checked ? "var(--accent)" : "var(--hairline)",
          position: "relative",
          flexShrink: 0,
          transition: "background 0.2s ease",
        }}>
          <span style={{
            position: "absolute",
            top: 4,
            left: checked ? 24 : 4,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: checked ? "#0d1016" : "var(--muted)",
            transition: "left 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease",
            boxShadow: checked ? "0 2px 4px rgba(0,0,0,0.2)" : "none",
          }} />
        </span>
      </button>
      {hint && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-soft)", letterSpacing: "0.02em" }}>
          {hint}
        </div>
      )}
    </div>
  );
}
