// app/panel/page.tsx — Panel / Enclosure Sizing + Cooling Calculator
"use client";

import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import ResultCard from "@/components/calc/ResultCard";
import { sizePanel, PanelResult } from "@/lib/calc/panel";
import type { Location, IpClass, CoolingMode } from "@/lib/calc/panel";

export default function PanelPage() {
  const [heatW, setHeatW] = useState("800");
  const [ambient, setAmbient] = useState("35");
  const [location, setLocation] = useState<Location>("indoor");
  const [ip, setIp] = useState<IpClass>("IP54");
  const [coolingMode, setCoolingMode] = useState<CoolingMode>("fan");
  const [space, setSpace] = useState<"compact" | "comfortable">("comfortable");

  const [result, setResult] = useState<PanelResult | null>(null);

  function handleCalc() {
    const r = sizePanel({
      totalHeatW: parseFloat(heatW) || 0,
      ambientC: parseFloat(ambient) || 35,
      location,
      ip,
      coolingMode,
      spacePreference: space,
    });
    setResult(r);
  }

  return (
    <CalcShell
      label="Panel Cooling"
      title="Panel / Enclosure Sizing"
      subtitle="IEC 60890 · XLTC & Rittal TS 8 — Natural / Fan / Air Conditioning"
    >
      {/* ─── Inputs ──────────────────────────────────────────────────── */}
      <div
        className="vinci-card"
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        <div className="sec-label">
          <span>Heat Load & Environment</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <FieldNumber
            label="Total Heat Load"
            unit="W"
            value={heatW}
            onChange={setHeatW}
            min={10}
            step={10}
            required
            hint="Sum of all component losses inside panel (drives + transformers + etc.)"
          />
          <FieldNumber
            label="Ambient Temperature"
            unit="°C"
            value={ambient}
            onChange={setAmbient}
            min={20}
            max={55}
            step={1}
            hint="Outside panel ambient (Indonesia typical: 35–40°C)"
          />
          <FieldSelect
            label="Installation Location"
            value={location}
            onChange={(v) => setLocation(v as Location)}
            options={[
              { value: "indoor", label: "Indoor — controlled room" },
              { value: "outdoor", label: "Outdoor — direct sun / rain" },
            ]}
            hint="Outdoor adds solar gain; requires IP55 minimum"
          />
          <FieldSelect
            label="IP Protection Class"
            value={ip}
            onChange={(v) => setIp(v as IpClass)}
            options={[
              { value: "IP54", label: "IP54 — Dust + splash (indoor)" },
              { value: "IP55", label: "IP55 — Dust + low-pressure jet" },
              { value: "IP66", label: "IP66 — Dust-tight + heavy seas" },
            ]}
            hint="IP66 requires sealed AC — fan+filter not compatible"
          />
        </div>

        <div className="sec-label" style={{ marginTop: 4 }}>
          <span>Cooling Strategy</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <FieldSelect
            label="Cooling Mode"
            value={coolingMode}
            onChange={(v) => setCoolingMode(v as CoolingMode)}
            options={[
              {
                value: "natural",
                label: "Natural — convection only (no fan)",
              },
              {
                value: "fan",
                label: "Forced Fan — exhaust + filter (IP54/55)",
              },
              {
                value: "ac",
                label: "Air Conditioning — sealed, any IP",
              },
            ]}
            hint="Natural: low heat load only. Fan: most common. AC: outdoor / high heat."
          />
          <FieldSelect
            label="Space Preference"
            value={space}
            onChange={(v) => setSpace(v as "compact" | "comfortable")}
            options={[
              { value: "comfortable", label: "Comfortable — 20% layout margin" },
              { value: "compact", label: "Compact — minimum footprint" },
            ]}
            hint="Comfortable allows cable management space and future expansion"
          />
        </div>

        <button
          className="btn-primary"
          onClick={handleCalc}
          style={{ marginTop: 8, width: "100%", justifyContent: "center" }}
        >
          Size Panel
        </button>
      </div>

      {/* ─── Enclosure Result ────────────────────────────────────────── */}
      {result && (
        <>
          <ResultCard
            title="Enclosure Selection"
            rows={[
              { label: "Part", value: result.part, accent: true },
              { label: "Dimensions (H×W×D)", value: result.dimMm, accent: true },
              { label: "Effective Surface Area", value: `${result.surfaceM2} m²` },
              {
                label: "Natural Dissipation",
                value: `${result.naturalDissW} W`,
              },
              { label: "Cooling Mode", value: result.cooling.toUpperCase() },
            ]}
            warnings={result.warnings}
          />

          {/* ─── Fan Spec ──────────────────────────────────────────── */}
          {result.fan && (
            <div className="vinci-card" style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="sec-label">
                <span>Fan Specification</span>
              </div>

              {/* Fan unit */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  { label: "Required Airflow", value: `${result.fan.airflowM3h} m³/h`, accent: true },
                  { label: "Rittal Fan Code", value: result.fan.rittalCode, accent: true },
                  { label: "XLTC Fan Code", value: result.fan.xltcCode, accent: true },
                  { label: "Fan Position", value: result.fan.position },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      padding: "12px 14px",
                      border: "1px solid var(--hairline-soft)",
                      borderRadius: "var(--r-md)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "var(--fs-xs)",
                        color: "var(--muted)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: row.accent ? "var(--fs-md)" : "var(--fs-sm)",
                        color: row.accent ? "var(--accent)" : "var(--fg)",
                        fontWeight: row.accent ? 600 : 400,
                        lineHeight: 1.4,
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Intake filter */}
              <div className="sec-label" style={{ marginTop: 8 }}>
                <span>Intake Filter</span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  { label: "Min Filter Area", value: `${result.fan.intake.filterAreaCm2} cm²`, accent: true },
                  { label: "Rittal Filter Code", value: result.fan.intake.rittalCode, accent: true },
                  { label: "XLTC Filter Code", value: result.fan.intake.xltcCode, accent: true },
                  { label: "Note", value: result.fan.intake.note },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      padding: "12px 14px",
                      border: "1px solid var(--hairline-soft)",
                      borderRadius: "var(--r-md)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "var(--fs-xs)",
                        color: "var(--muted)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: row.accent ? "var(--fs-md)" : "var(--fs-sm)",
                        color: row.accent ? "var(--accent)" : "var(--fg)",
                        fontWeight: row.accent ? 600 : 400,
                        lineHeight: 1.4,
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Exhaust filter */}
              <div className="sec-label" style={{ marginTop: 8 }}>
                <span>Exhaust Filter</span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  { label: "Min Filter Area", value: `${result.fan.exhaust.filterAreaCm2} cm²`, accent: true },
                  { label: "Rittal Filter Code", value: result.fan.exhaust.rittalCode, accent: true },
                  { label: "XLTC Filter Code", value: result.fan.exhaust.xltcCode, accent: true },
                  { label: "Note", value: result.fan.exhaust.note },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      padding: "12px 14px",
                      border: "1px solid var(--hairline-soft)",
                      borderRadius: "var(--r-md)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "var(--fs-xs)",
                        color: "var(--muted)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: row.accent ? "var(--fs-md)" : "var(--fs-sm)",
                        color: row.accent ? "var(--accent)" : "var(--fg)",
                        fontWeight: row.accent ? 600 : 400,
                        lineHeight: 1.4,
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── AC Spec ───────────────────────────────────────────── */}
          {result.ac && (
            <div
              className="vinci-card"
              style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div className="sec-label">
                <span>Air Conditioning Unit</span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  {
                    label: "Calculated Heat Load",
                    value: `${result.ac.heatLoadW} W (${result.ac.heatLoadBtu} BTU/h)`,
                    accent: false,
                  },
                  {
                    label: "Selected AC Capacity",
                    value: `${result.ac.nominalW} W`,
                    accent: true,
                  },
                  {
                    label: "AC in BTU/h",
                    value: `${result.ac.nominalBtu} BTU/h`,
                    accent: true,
                  },
                  {
                    label: "Rittal Blue e+ Code",
                    value: result.ac.rittalCode,
                    accent: true,
                  },
                  {
                    label: "XLTC AC Code",
                    value: result.ac.xltcCode,
                    accent: true,
                  },
                  {
                    label: "Operating Mode",
                    value: result.ac.mode,
                    accent: false,
                  },
                  {
                    label: "Installation Note",
                    value: result.ac.note,
                    accent: false,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      padding: "12px 14px",
                      border: "1px solid var(--hairline-soft)",
                      borderRadius: "var(--r-md)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "var(--fs-xs)",
                        color: "var(--muted)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: row.accent ? "var(--fs-md)" : "var(--fs-sm)",
                        color: row.accent ? "var(--accent)" : "var(--fg)",
                        fontWeight: row.accent ? 600 : 400,
                        lineHeight: 1.4,
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <footer
        style={{
          marginTop: 48,
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--muted-soft)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          paddingBottom: 16,
        }}
      >
        Engineered by dummJo · DummVinci Calculator · ABB Value Partner Standard
      </footer>
    </CalcShell>
  );
}
