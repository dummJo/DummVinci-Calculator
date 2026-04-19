"use client";

interface Option { value: string; label: string }

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  hint?: string;
}

export default function FieldSelect({ label, value, onChange, options, hint }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--fs-xs)",
        color: "var(--fg-soft)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}>
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: "var(--bg-raised)",
          border: "1px solid var(--glass-border)",
          borderRadius: "var(--r-md)",
          color: "var(--fg)",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-sm)",
          padding: "10px 14px",
          width: "100%",
          outline: "none",
          cursor: "pointer",
          transition: "border-color 0.18s ease",
        }}
        onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
        onBlur={e => (e.currentTarget.style.borderColor = "var(--glass-border)")}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {hint && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-soft)", letterSpacing: "0.02em" }}>
          {hint}
        </div>
      )}
    </div>
  );
}
