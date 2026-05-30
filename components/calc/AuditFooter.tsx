"use client";

import { useEffect, useState, useCallback } from "react";
import { Fingerprint, Lock, PenLine, Check } from "lucide-react";
import { fingerprintInputs, signOff, getSignOff, type SignOff } from "@/lib/audit";
import { track } from "@/lib/analytics";

/**
 * ISO 9001 traceability strip shown under a result.
 *   • Always: auto fingerprint (ƒ <hash>) + timestamp + cited standards.
 *   • Optional: "Sign & Lock" → records reviewer name/role against the
 *     fingerprint; thereafter shows a lock with signatory + signature hash.
 *
 * Internal QA aid — not a legal certification (stated in the tooltip).
 */
export default function AuditFooter({
  inputs,
  standards,
}: {
  inputs: Record<string, unknown>;
  standards?: string;
}) {
  const [fp, setFp] = useState<string>("");
  const [existing, setExisting] = useState<SignOff | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Engineer");
  const computedAt = useState(() => Date.now())[0];

  // Recompute fingerprint whenever the inputs change.
  useEffect(() => {
    let alive = true;
    fingerprintInputs(inputs).then(h => {
      if (!alive) return;
      setFp(h);
      setExisting(getSignOff(h));
    });
    return () => { alive = false; };
  }, [inputs]);

  const handleSign = useCallback(async () => {
    if (!fp || !name.trim()) return;
    const rec = await signOff(fp, name.trim(), role);
    setExisting(rec);
    setFormOpen(false);
    track("sign-off", { role });
  }, [fp, name, role]);

  const dateStr = new Date(computedAt).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div
      style={{
        marginTop: 12,
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid var(--glass-border)",
        background: "var(--glass-bg)",
        fontFamily: "var(--font-mono)",
        fontSize: 10.5,
        color: "var(--muted)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "6px 12px",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--accent)" }}>
        <Fingerprint size={12} strokeWidth={2.2} />
        ƒ {fp || "…"}
      </span>
      <span>· {dateStr}</span>
      {standards && <span>· {standards}</span>}

      <span style={{ flex: 1 }} />

      {existing ? (
        <span
          title={`Signed ${new Date(existing.signedAt).toLocaleString()} · sig ${existing.signature}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--accent)", fontWeight: 700 }}
        >
          <Lock size={12} strokeWidth={2.4} />
          {existing.name} · {existing.role}
        </span>
      ) : formOpen ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name"
            aria-label="Reviewer name"
            style={signInput}
          />
          <select value={role} onChange={e => setRole(e.target.value)} aria-label="Reviewer role" style={signInput}>
            <option>Engineer</option>
            <option>Senior</option>
            <option>PM</option>
          </select>
          <button type="button" onClick={handleSign} disabled={!name.trim()} style={signBtn(!!name.trim())}>
            <Check size={12} strokeWidth={2.6} /> Confirm
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          title="Records who reviewed this result (internal QA, not a legal certification)"
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 999,
            border: "1px solid var(--glass-border)",
            background: "rgba(var(--accent-rgb), 0.06)",
            color: "var(--accent)", cursor: "pointer",
            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}
        >
          <PenLine size={11} strokeWidth={2.4} /> Sign &amp; Lock
        </button>
      )}
    </div>
  );
}

const signInput: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: 8,
  border: "1px solid var(--glass-border)",
  background: "var(--popout-bg)",
  color: "var(--popout-fg)",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  outline: "none",
  maxWidth: 120,
};

function signBtn(enabled: boolean): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "5px 10px", borderRadius: 999, border: "none",
    background: enabled ? "var(--accent)" : "var(--glass-border)",
    color: enabled ? "var(--bg-deep, #090807)" : "var(--muted)",
    cursor: enabled ? "pointer" : "not-allowed",
    fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 800,
    letterSpacing: "0.06em", textTransform: "uppercase",
  };
}
