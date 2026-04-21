import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Option { value: string; label: string }

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  hint?: string;
  required?: boolean;
}

export default function FieldSelect({ label, value, onChange, options, hint, required }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <label style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-xs)",
          color: "var(--fg-soft)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontWeight: 600,
        }}>
          {label}
        </label>
        {required && <span style={{ color: "var(--accent)", fontSize: 14, lineHeight: 1 }}>•</span>}
      </div>

      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            appearance: "none",
            background: focused ? "rgba(255,255,255,0.05)" : "var(--bg-raised)",
            border: `1px solid ${focused ? "var(--accent)" : "var(--glass-border)"}`,
            borderRadius: "var(--r-md)",
            color: "var(--fg)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--fs-sm)",
            padding: "12px 40px 12px 16px",
            width: "100%",
            outline: "none",
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: focused ? "0 0 0 4px rgba(201,168,76,0.12)" : "none",
          } as React.CSSProperties}
        >
          {options.map(o => (
            <option key={o.value} value={o.value} style={{ background: "#0d1016", color: "#fff" }}>{o.label}</option>
          ))}
        </select>
        
        <div style={{ 
          position: "absolute", 
          right: 14, 
          top: "50%", 
          transform: "translateY(-50%)", 
          pointerEvents: "none",
          color: focused ? "var(--accent)" : "var(--muted)",
          transition: "color 0.2s"
        }}>
          <ChevronDown size={14} />
        </div>
      </div>

      {hint && (
        <div style={{ 
          fontFamily: "var(--font-mono)", 
          fontSize: 10, 
          color: "var(--muted-soft)", 
          letterSpacing: "0.02em",
          paddingLeft: 4,
          opacity: 0.8
        }}>
          {hint}
        </div>
      )}
    </div>
  );
}
