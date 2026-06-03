"use client";

import { useState, useMemo } from "react";
import { useLang } from "@/lib/i18n";
import { SEVERITY_TABLE, SEVERITY_CATEGORIES } from "@/data/skf-microlog/severity";
import { getMachineSeverityZone, getGeneralSeverityZone, getBearingStage } from "@/lib/calc/skf-severity";
import { GLASS, inputStyleBase } from "../_shared";

interface Props { lang: "en" | "id" }

/**
 * Severity tab — machine-specific zone (with modifiers), ISO 20816 general zone,
 * and bearing-stage stage from gE enveloping. Pure derived rendering.
 */
export default function TabSeverity({ lang }: Props) {
  const { t } = useLang();
  const [velocityInput, setVelocityInput] = useState("");
  const [selectedCat, setSelectedCat] = useState(SEVERITY_CATEGORIES[0]);
  const [selectedSub, setSelectedSub] = useState("");
  const [geInput, setGeInput] = useState("");
  const [hasIsolator, setHasIsolator] = useState(false);
  const [hasGearbox, setHasGearbox] = useState(false);
  const [isNewMachine, setIsNewMachine] = useState(false);

  const filteredEntries = useMemo(() =>
    SEVERITY_TABLE.filter(e => e.category === selectedCat),
  [selectedCat]);

  const effectiveSub = useMemo(() => {
    if (filteredEntries.length > 0 && !filteredEntries.find(e => e.subType === selectedSub)) {
      return filteredEntries[0].subType;
    }
    return selectedSub;
  }, [filteredEntries, selectedSub]);

  const velocity = parseFloat(velocityInput);
  const ge = parseFloat(geInput);

  const machineResult = useMemo(() => {
    if (isNaN(velocity) || !effectiveSub) return null;
    return getMachineSeverityZone(velocity, effectiveSub, { isolator: hasIsolator, externalGearbox: hasGearbox, newMachine: isNewMachine }, lang);
  }, [velocity, effectiveSub, hasIsolator, hasGearbox, isNewMachine, lang]);

  const generalResult = useMemo(() => (isNaN(velocity) ? null : getGeneralSeverityZone(velocity, lang)), [velocity, lang]);
  const bearingResult = useMemo(() => (isNaN(ge) ? null : getBearingStage(ge, lang)), [ge, lang]);

  const inputStyle = { ...inputStyleBase };
  const selectStyle = { ...inputStyle, cursor: "pointer", appearance: "none" as const, WebkitAppearance: "none" as const } as const;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          📊 {lang === "id" ? "Keparahan Spesifik Mesin (Gambar 13)" : "Machine-Specific Severity (Figure 13)"}
        </h4>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 4 }}>
              {lang === "id" ? "KATEGORI MESIN" : "MACHINE CATEGORY"}
            </label>
            <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={selectStyle}>
              {SEVERITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 4 }}>
              {lang === "id" ? "SUB-TIPE MESIN" : "SUB-TYPE"}
            </label>
            <select value={effectiveSub} onChange={e => setSelectedSub(e.target.value)} style={selectStyle}>
              {filteredEntries.map(e => <option key={e.subType} value={e.subType}>{e.subType}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 4 }}>
              {lang === "id" ? "KECEPATAN VIBRASI (mm/s RMS)" : "VELOCITY (mm/s RMS)"}
            </label>
            <input type="number" step="0.1" min="0" placeholder="e.g. 5.5" value={velocityInput} onChange={e => setVelocityInput(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "flex-end" }}>
            <label style={{ fontSize: 11, color: "var(--fg-soft)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={hasIsolator} onChange={e => setHasIsolator(e.target.checked)} />
              {lang === "id" ? "Isolator Getaran / Mounting (+40%)" : "Vibration Isolator (+40%)"}
            </label>
            <label style={{ fontSize: 11, color: "var(--fg-soft)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={hasGearbox} onChange={e => setHasGearbox(e.target.checked)} />
              {lang === "id" ? "Roda Gigi Eksternal (+25%)" : "External Gearbox (+25%)"}
            </label>
            <label style={{ fontSize: 11, color: "var(--fg-soft)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={isNewMachine} onChange={e => setIsNewMachine(e.target.checked)} />
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                {lang === "id" ? "Mesin Baru / Rekondisi (33% batas Alarm 1)" : "New / Rebuilt Machine (33% Alarm 1 limit)"}
              </span>
            </label>
          </div>
        </div>

        {machineResult && (
          <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: `${machineResult.color}11`, border: `1px solid ${machineResult.color}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: machineResult.color, boxShadow: `0 0 12px ${machineResult.color}` }} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: machineResult.color }}>{machineResult.zone}</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--fg-soft)", margin: "8px 0 0", lineHeight: 1.5 }}>{machineResult.label}</p>
            <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
              <span>{t.home.calcs.skfMicrolog.alarm1}{machineResult.alarm1Adj.toFixed(1)} mm/s</span>
              <span>{t.home.calcs.skfMicrolog.alarm2}{machineResult.alarm2Adj.toFixed(1)} mm/s</span>
            </div>
          </div>
        )}
      </div>

      {generalResult && (
        <div style={{ ...GLASS, background: `${generalResult.color}08`, borderColor: `${generalResult.color}22` }}>
          <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 8 }}>
            {t.home.calcs.skfMicrolog.generalZone}
          </h4>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: generalResult.color }}>{generalResult.zone}</span>
            <span style={{ fontSize: 14, color: generalResult.color, fontWeight: 600 }}>— {generalResult.label}</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--fg-soft)", margin: "6px 0 0" }}>{generalResult.description}</p>
        </div>
      )}

      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          🎯 {lang === "id" ? "Kesehatan Bearing (gE Enveloping)" : "Bearing Health (gE Enveloping)"}
        </h4>
        <div>
          <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 4 }}>{t.home.calcs.skfMicrolog.geLevel}</label>
          <input type="number" step="0.1" min="0" placeholder="e.g. 0.8" value={geInput} onChange={e => setGeInput(e.target.value)} style={{ ...inputStyle, maxWidth: 200 }} />
        </div>
        {bearingResult && (
          <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: `${bearingResult.color}11`, border: `1px solid ${bearingResult.color}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: bearingResult.color, boxShadow: `0 0 10px ${bearingResult.color}` }} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: bearingResult.color }}>{bearingResult.stage}</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--fg-soft)", margin: "6px 0 0" }}>{bearingResult.action}</p>
          </div>
        )}
      </div>
    </div>
  );
}
