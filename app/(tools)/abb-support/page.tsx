"use client";
import { useState, useMemo } from "react";
import CalcShell from "@/components/calc/CalcShell";
import Footer from "@/components/nav/Footer";
import { useLang } from "@/lib/i18n";
import supportData from "@/data/abb-support.json";
import drivesData from "@/data/abb-drives.json";
import { STATUS_WORDS, SYMPTOM_SCENARIOS } from "@/data/status-word";
import { Search, ExternalLink, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import RichText from "@/components/calc/RichText";

type Section = "faults" | "manuals" | "dims" | "statusword";

const SEV_COLORS = {
  ok:       { bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.35)",  text: "#4ade80" },
  warn:     { bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.35)", text: "#fbbf24" },
  fault:    { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.35)",  text: "#f87171" },
  info:     { bg: "rgba(99,179,237,0.10)", border: "rgba(99,179,237,0.35)", text: "#63b3ed" },
  reserved: { bg: "transparent",            border: "transparent",            text: "var(--muted)" },
};

export default function AbbSupportHub() {
  const { t, lang } = useLang();
  const ts = t.support;

  const [activeSection, setActiveSection] = useState<Section>("faults");
  const [searchCode, setSearchCode] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("ACS880");
  const [swParam, setSwParam] = useState("06.11");
  const [swValue, setSwValue] = useState("");
  const [openSymptom, setOpenSymptom] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const matchedFaults = searchCode.trim().length >= 2
    ? supportData.faults.filter(f =>
        f.code.includes(searchCode.toUpperCase()) ||
        f.title.toLowerCase().includes(searchCode.toLowerCase()))
    : [];

  const filteredDrives = drivesData.filter(d => d.family.startsWith(selectedFamily.split(" ")[0]));

  const swDef = STATUS_WORDS.find(s => s.param === swParam)!;

  const parsedN = parseInt(swValue);
  const validN = !isNaN(parsedN) && parsedN >= 0 && parsedN <= 65535;
  const hexStr = validN ? "0x" + parsedN.toString(16).toUpperCase().padStart(4, "0") : "—";

  const decoded = useMemo(() => {
    if (!validN) return null;
    return swDef.bits.map(b => ({ ...b, active: Boolean((parsedN >> b.bit) & 1) }));
  }, [swValue, swParam, swDef, validN, parsedN]);

  const activeCritical = decoded?.filter(b => b.active && (b.severity === "fault" || b.severity === "warn")) ?? [];

  const handleCopy = () => {
    if (!decoded || !validN) return;
    const lines = [
      `ABB Drive ${swDef.param} (${swDef.label}) = ${swValue} (${hexStr})`,
      `Binary: ${parsedN.toString(2).padStart(16, "0")}`,
      "",
      ...decoded
        .filter(b => b.active)
        .sort((a, b) => b.bit - a.bit)
        .map(b => `Bit ${b.bit} [${b.name}] = 1 → ${b.true}`),
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const TABS: { key: Section; label: string }[] = [
    { key: "faults",     label: ts.swTabFaults },
    { key: "manuals",    label: ts.swTabManuals },
    { key: "dims",       label: ts.swTabDims },
    { key: "statusword", label: ts.secStatusWord },
  ];

  return (
    <CalcShell label="ABB HUB" title={ts.title} subtitle={ts.subtitle} concept={ts.concept}>

      {/* TAB BAR */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key)}
            style={{
              padding: "8px 18px",
              borderRadius: 20,
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              border: "1px solid",
              borderColor: activeSection === tab.key ? "var(--accent)" : "var(--glass-border)",
              background: activeSection === tab.key ? "rgba(var(--accent-rgb), 0.12)" : "transparent",
              color: activeSection === tab.key ? "var(--accent)" : "var(--muted)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="vinci-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }}>

        {/* ── FAULT SEARCH ── */}
        {activeSection === "faults" && (
          <div className="vinci-card" style={{
            background: "linear-gradient(135deg, rgba(var(--accent-rgb), 0.08) 0%, rgba(13,16,22,0) 100%)",
            border: "1px solid var(--accent)"
          }}>
            <div className="sec-label"><span>{ts.title.toUpperCase()}</span></div>
            <div style={{ position: "relative", marginTop: 16 }}>
              <input
                type="text"
                placeholder={ts.inputFault}
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--r-md)",
                  padding: "16px 16px 16px 44px",
                  color: "var(--fg)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 16,
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
              />
              <Search size={20} style={{ position: "absolute", left: 16, top: 16, color: "var(--accent)" }} />
            </div>
            {searchCode.trim().length >= 2 && (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                {matchedFaults.length > 0 ? matchedFaults.map(f => (
                  <div key={f.code} style={{
                    padding: 16,
                    background: "rgba(0,0,0,0.3)",
                    borderLeft: "3px solid var(--accent)",
                    borderRadius: 8,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "white", fontFamily: "var(--font-mono)" }}>{f.code}</span>
                      <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>{f.title}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--fg)", opacity: 0.8, lineHeight: 1.5 }}>
                      <RichText text={f.desc} />
                    </div>
                  </div>
                )) : (
                  <div style={{ padding: 16, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                    No results for &quot;{searchCode}&quot;.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── MANUALS ── */}
        {activeSection === "manuals" && (
          <div className="vinci-card">
            <div className="sec-label"><span>{ts.secManuals}</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginTop: 16 }}>
              {supportData.manuals.map((m, i) => (
                <a
                  key={i}
                  href={m.link}
                  target="_blank"
                  rel="noopener"
                  className="hover-lift"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: "var(--bg-raised)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "var(--r-md)",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--fg)", fontWeight: 600 }}>{m.family}</span>
                  <ExternalLink size={14} style={{ color: "var(--accent)" }} />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── DIMENSIONS ── */}
        {activeSection === "dims" && (
          <div className="vinci-card" style={{ overflowX: "auto" }}>
            <div className="sec-label"><span>{ts.secSpecs}</span></div>
            <div style={{ display: "flex", gap: 12, marginTop: 16, marginBottom: 20 }}>
              {["ACS880", "ACQ580", "ACS380"].map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedFamily(f)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    border: "1px solid",
                    borderColor: selectedFamily === f ? "var(--accent)" : "var(--glass-border)",
                    background: selectedFamily === f ? "rgba(var(--accent-rgb), 0.1)" : "transparent",
                    color: selectedFamily === f ? "var(--accent)" : "var(--muted)",
                    cursor: "pointer",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--hairline-bold)" }}>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>{ts.colCode}</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>{ts.colKw}</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>{ts.colFrame}</th>
                  <th style={{ textAlign: "right", padding: "12px 8px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>{ts.colDim}</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrives.map((d, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--hairline-soft)" }}>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--fg)" }}>{d.code}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{d.ratedKw}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>{d.frame}</td>
                    <td style={{ padding: "12px 8px", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg)", textAlign: "right" }}>
                      {d.h} × {d.w} × {d.d} mm
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── STATUS WORD DECODER ── */}
        {activeSection === "statusword" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Input card */}
            <div className="vinci-card">
              <div className="sec-label"><span>{ts.secStatusWord.toUpperCase()}</span></div>
              <style>{`
                .sw-input-row {
                  display: grid;
                  grid-template-columns: 1fr;
                  gap: 16px;
                }
                @media (min-width: 640px) {
                  .sw-input-row { grid-template-columns: 220px 1fr; }
                }
              `}</style>
              <div className="sw-input-row" style={{ marginTop: 16, alignItems: "end" }}>

                {/* Parameter select */}
                <div>
                  <label style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 6 }}>
                    {ts.swParam}
                  </label>
                  <select
                    value={swParam}
                    onChange={e => { setSwParam(e.target.value); setSwValue(""); }}
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "var(--r-md)",
                      padding: "10px 12px",
                      color: "var(--fg)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 14,
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    {STATUS_WORDS.map(sw => (
                      <option key={sw.param} value={sw.param}>
                        {sw.param} — {lang === "id" ? sw.labelId : sw.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Decimal input */}
                <div>
                  <label style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 6 }}>
                    {ts.swInputLabel}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={65535}
                    placeholder={ts.swInputPlaceholder}
                    value={swValue}
                    onChange={e => setSwValue(e.target.value)}
                    style={{
                      width: "100%",
                      background: "var(--glass-bg)",
                      border: `1px solid ${validN ? "var(--accent)" : "var(--glass-border)"}`,
                      borderRadius: "var(--r-md)",
                      padding: "16px 18px",
                      color: "var(--fg)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 24,
                      fontWeight: 700,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Register description */}
              <p style={{ marginTop: 10, fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
                {lang === "id" ? swDef.descId : swDef.desc}
              </p>

              {/* Hex + Binary display */}
              {validN && (
                <div style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{
                    padding: "8px 16px",
                    background: "var(--bg-raised)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "var(--r-md)",
                    fontFamily: "var(--font-mono)",
                    minWidth: 80,
                  }}>
                    <span style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 2 }}>{ts.swHex}</span>
                    <span style={{ fontSize: 18, color: "var(--accent)", fontWeight: 700 }}>{hexStr}</span>
                  </div>
                  <div style={{
                    padding: "8px 16px",
                    background: "var(--bg-raised)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "var(--r-md)",
                    flex: 1,
                    minWidth: 280,
                  }}>
                    <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 6 }}>
                      {ts.swBinary} — bit 15 → 0
                    </span>
                    <div style={{ display: "flex", gap: 3 }}>
                      {Array.from({ length: 16 }, (_, i) => 15 - i).map(bitIdx => {
                        const active = Boolean((parsedN >> bitIdx) & 1);
                        const b = swDef.bits.find(x => x.bit === bitIdx);
                        const sev = b?.severity ?? "reserved";
                        const c = SEV_COLORS[sev];
                        return (
                          <div
                            key={bitIdx}
                            title={`Bit ${bitIdx}: ${b?.name ?? "Reserved"}`}
                            style={{
                              flex: 1,
                              height: 28,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 4,
                              border: `1px solid ${active ? c.border : "var(--hairline-soft)"}`,
                              background: active ? c.bg : "transparent",
                              fontFamily: "var(--font-mono)",
                              fontSize: 11,
                              fontWeight: 700,
                              color: active ? c.text : "var(--muted)",
                              cursor: "default",
                              minWidth: 0,
                            }}
                          >
                            {active ? "1" : "0"}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
                      {Array.from({ length: 16 }, (_, i) => 15 - i).map(bitIdx => (
                        <div key={bitIdx} style={{ flex: 1, textAlign: "center", fontSize: 8, color: "var(--muted)", fontFamily: "var(--font-mono)", minWidth: 0 }}>
                          {bitIdx}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bit decode table */}
            <div className="vinci-card" style={{ overflowX: "auto" }}>
              {!decoded ? (
                <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, padding: "32px 0" }}>
                  {ts.swNoInput}
                </p>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                      {decoded.filter(b => b.active).length} {ts.swActiveBits}
                      {decoded.filter(b => b.active).length === 0 && (
                        <span style={{ marginLeft: 8, color: "var(--muted)", fontStyle: "italic" }}>— {ts.swAllZero}</span>
                      )}
                    </span>
                    <button
                      onClick={handleCopy}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "6px 14px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                        border: "1px solid var(--glass-border)",
                        background: "transparent",
                        color: copied ? "#4ade80" : "var(--muted)",
                        cursor: "pointer",
                        transition: "color 0.2s",
                      }}
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? ts.swCopied : ts.swCopy}
                    </button>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--hairline-bold)" }}>
                        <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", width: 36 }}>{ts.swBit}</th>
                        <th style={{ textAlign: "left",   padding: "10px 8px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>{ts.swBitName}</th>
                        <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", width: 36 }}>{ts.swValue}</th>
                        <th style={{ textAlign: "left",   padding: "10px 8px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", width: "22%" }}>{ts.swStatus}</th>
                        <th style={{ textAlign: "left",   padding: "10px 8px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>{ts.swImplication}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...decoded].reverse().map(b => {
                        const c = b.active && b.severity !== "reserved" ? SEV_COLORS[b.severity] : null;
                        const isReserved = b.severity === "reserved";
                        return (
                          <tr
                            key={b.bit}
                            style={{
                              borderBottom: "1px solid var(--hairline-soft)",
                              background: c ? c.bg : "transparent",
                              opacity: isReserved ? 0.3 : 1,
                            }}
                          >
                            <td style={{ padding: "9px 8px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>
                              {b.bit}
                            </td>
                            <td style={{ padding: "9px 8px", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: b.active ? 600 : 400, color: b.active && c ? c.text : "var(--fg)" }}>
                              {b.name}
                            </td>
                            <td style={{ padding: "9px 8px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: b.active && c ? c.text : "var(--muted)" }}>
                              {b.active ? "1" : "0"}
                            </td>
                            <td style={{ padding: "9px 8px", fontSize: 12, color: b.active && c ? c.text : "var(--muted)" }}>
                              {b.active ? b.true : b.false}
                            </td>
                            <td style={{ padding: "9px 8px", fontSize: 11, color: "var(--muted)", lineHeight: 1.4 }}>
                              {lang === "id" ? b.implId : b.impl}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </div>

            {/* Critical bit alerts */}
            {activeCritical.length > 0 && (
              <div className="vinci-card" style={{ border: `1px solid ${SEV_COLORS.fault.border}`, background: SEV_COLORS.fault.bg }}>
                <div className="sec-label"><span>DIAGNOSTIC ALERTS</span></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                  {activeCritical.map(b => {
                    const c = SEV_COLORS[b.severity];
                    return (
                      <div key={b.bit} style={{
                        padding: "10px 14px",
                        background: "rgba(0,0,0,0.3)",
                        borderLeft: `3px solid ${c.text}`,
                        borderRadius: 6,
                      }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: c.text, fontWeight: 700, marginBottom: 4 }}>
                          {swDef.param} · Bit {b.bit} [{b.name}] = 1
                        </div>
                        <div style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.5 }}>
                          {lang === "id" ? b.implId : b.impl}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Symptom Quick-Check */}
            <div className="vinci-card">
              <div className="sec-label"><span>{ts.swSymptoms.toUpperCase()}</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                {SYMPTOM_SCENARIOS.map(sc => (
                  <div key={sc.id} style={{ border: "1px solid var(--glass-border)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
                    <button
                      onClick={() => setOpenSymptom(openSymptom === sc.id ? null : sc.id)}
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        background: openSymptom === sc.id ? "rgba(var(--accent-rgb),0.08)" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--fg)",
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        fontWeight: 600,
                        textAlign: "left",
                        gap: 8,
                      }}
                    >
                      <span style={{ flex: 1 }}>{lang === "id" ? sc.symptomId : sc.symptom}</span>
                      {openSymptom === sc.id
                        ? <ChevronUp size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                        : <ChevronDown size={14} style={{ color: "var(--muted)", flexShrink: 0 }} />}
                    </button>
                    {openSymptom === sc.id && (
                      <div style={{ padding: "0 16px 16px 16px" }}>
                        <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 10 }}>
                          {lang === "id" ? sc.mechanismId : sc.mechanism}
                        </p>
                        <div style={{ marginBottom: 10 }}>
                          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 600 }}>CHECK BITS:</span>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                            {sc.bits.map((check, i) => (
                              <span key={i} style={{
                                padding: "3px 10px",
                                borderRadius: 12,
                                fontSize: 11,
                                fontFamily: "var(--font-mono)",
                                background: "var(--bg-raised)",
                                border: "1px solid var(--glass-border)",
                                color: "var(--fg)",
                              }}>
                                {check.param} bit {check.bit} = {check.expected}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div style={{
                          padding: "10px 14px",
                          background: "rgba(var(--accent-rgb),0.06)",
                          borderLeft: "2px solid var(--accent)",
                          borderRadius: 4,
                          fontSize: 12,
                          color: "var(--fg)",
                          lineHeight: 1.6,
                        }}>
                          {lang === "id" ? sc.mitigationId : sc.mitigation}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      <Footer />
    </CalcShell>
  );
}
