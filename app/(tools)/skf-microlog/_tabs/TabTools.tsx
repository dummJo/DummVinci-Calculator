"use client";

import { useState, useMemo, useCallback } from "react";
import { useLang } from "@/lib/i18n";
import { getDiagnosticFlow, recommendGeFilter } from "@/lib/calc/skf-severity";
import { GLASS, inputStyleBase } from "../_shared";

// Sensor calibration: mm/s of vibration per gram of trial weight.
// Sensor phase lag: degrees behind the trial-weight angular position.
// Module-scope constants so React's exhaustive-deps lint stays clean.
const CALIBRATION_FACTOR = 0.45;
const LAG_ANGLE_DEG = -45;

interface Props { lang: "en" | "id" }

/** Tools / Sim tab — gE filter recommender, 2×2 diagnostic grid, and the 8-step
 *  single-plane balancing simulator with live vector circle + console log. */
export default function TabTools({ lang }: Props) {
  const { t } = useLang();

  // ── gE filter recommender ─────────────────────────────────────────────
  const [rpmInput, setRpmInput] = useState("");
  const rpm = parseFloat(rpmInput);
  const filterRec = useMemo(() => (isNaN(rpm) || rpm <= 0 ? null : recommendGeFilter(rpm, lang)), [rpm, lang]);

  // ── 2×2 diagnostic grid ───────────────────────────────────────────────
  const [velTrend, setVelTrend] = useState<"ok" | "rising">("ok");
  const [geTrend, setGeTrend]   = useState<"ok" | "rising">("ok");
  const diagFlow = useMemo(() => getDiagnosticFlow(velTrend, geTrend, lang), [velTrend, geTrend, lang]);

  // ── Single-Plane Balancing Simulator ──────────────────────────────────
  const [simStep, setSimStep] = useState(1);
  const [simRotorMass, setSimRotorMass] = useState(80);
  const [simRpm, setSimRpm] = useState(1500);
  const [simRadius, setSimRadius] = useState(250);
  const [simV0, setSimV0] = useState({ amp: 8.6, phase: 125 });
  const [simTwMass, setSimTwMass] = useState("10.0");
  const [simTwAngle, setSimTwAngle] = useState("0");
  const [simAfterTw, setSimAfterTw] = useState<"remove" | "remain">("remove");
  const [simV1, setSimV1] = useState({ amp: 0.0, phase: 0 });
  const [simResultLogs, setSimResultLogs] = useState<string[]>([]);
  const [simCwRecommendation, setSimCwRecommendation] = useState({ mass: 0, angle: 0 });

  const twMassNum  = parseFloat(simTwMass)  || 0;
  const twAngleNum = parseFloat(simTwAngle) || 0;

  const simVt1 = useMemo(() => {
    const v0x = simV0.amp * Math.cos((simV0.phase * Math.PI) / 180);
    const v0y = simV0.amp * Math.sin((simV0.phase * Math.PI) / 180);
    const twEffAngle = twAngleNum + LAG_ANGLE_DEG;
    const twx = twMassNum * CALIBRATION_FACTOR * Math.cos((twEffAngle * Math.PI) / 180);
    const twy = twMassNum * CALIBRATION_FACTOR * Math.sin((twEffAngle * Math.PI) / 180);
    const vt1x = v0x + twx;
    const vt1y = v0y + twy;
    const amp = Math.sqrt(vt1x * vt1x + vt1y * vt1y);
    let phase = (Math.atan2(vt1y, vt1x) * 180) / Math.PI;
    if (phase < 0) phase += 360;
    return { amp, phase };
  }, [simV0, twMassNum, twAngleNum]);

  const rule3030Check = useMemo(() => {
    if (twMassNum <= 0) return { passed: false, ampDiff: 0, phaseDiff: 0 };
    const ampRatio = simVt1.amp / simV0.amp;
    const ampDiffPct = Math.abs(ampRatio - 1) * 100;
    let phaseDiff = Math.abs(simVt1.phase - simV0.phase);
    if (phaseDiff > 180) phaseDiff = 360 - phaseDiff;
    return { passed: ampDiffPct >= 30 || phaseDiff >= 30, ampDiff: ampDiffPct, phaseDiff };
  }, [simVt1, simV0, twMassNum]);

  const computeCW = useCallback(() => {
    const v0x  = simV0.amp  * Math.cos((simV0.phase  * Math.PI) / 180);
    const v0y  = simV0.amp  * Math.sin((simV0.phase  * Math.PI) / 180);
    const vt1x = simVt1.amp * Math.cos((simVt1.phase * Math.PI) / 180);
    const vt1y = simVt1.amp * Math.sin((simVt1.phase * Math.PI) / 180);
    const dvx = vt1x - v0x;
    const dvy = vt1y - v0y;
    const dvAmp = Math.sqrt(dvx * dvx + dvy * dvy);
    let dvPhase = (Math.atan2(dvy, dvx) * 180) / Math.PI;
    if (dvPhase < 0) dvPhase += 360;
    const hAmp = dvAmp / twMassNum;
    const hPhase = dvPhase - twAngleNum;
    const cwAmp = simV0.amp / hAmp;
    let cwPhase = simV0.phase + 180 - hPhase;
    while (cwPhase < 0) cwPhase += 360;
    while (cwPhase >= 360) cwPhase -= 360;
    setSimCwRecommendation({ mass: parseFloat(cwAmp.toFixed(1)), angle: parseFloat(cwPhase.toFixed(0)) });
  }, [simV0, simVt1, twMassNum, twAngleNum]);

  const handleStartSim = () => {
    setSimStep(2);
    setSimResultLogs([lang === "id"
      ? `Mengkalibrasi putaran awal (V0). Terdeteksi getaran: ${simV0.amp.toFixed(1)} mm/s RMS pada ${simV0.phase}°`
      : `Reference run V0 completed. Initial vibration: ${simV0.amp.toFixed(1)} mm/s RMS @ ${simV0.phase}°`]);
  };

  const handleRunTrial = () => {
    computeCW();
    setSimStep(4);
    const logStr = lang === "id"
      ? `Putaran Uji (VT1) selesai. Getaran terukur: ${simVt1.amp.toFixed(1)} mm/s @ ${simVt1.phase.toFixed(0)}°`
      : `Trial Weight Run VT1 completed. Vibration: ${simVt1.amp.toFixed(1)} mm/s @ ${simVt1.phase.toFixed(0)}°`;
    const ruleStr = rule3030Check.passed
      ? (lang === "id" ? `✓ Aturan 30/30 LULUS. Amplitudo bergeser ${rule3030Check.ampDiff.toFixed(0)}%, sudut geser ${rule3030Check.phaseDiff.toFixed(0)}°.` : `✓ 30/30 Rule PASSED. Amplitude shift ${rule3030Check.ampDiff.toFixed(0)}%, phase shift ${rule3030Check.phaseDiff.toFixed(0)}°.`)
      : (lang === "id" ? `✗ Aturan 30/30 GAGAL! TW terlalu kecil (Amp geser ${rule3030Check.ampDiff.toFixed(0)}%, sudut geser ${rule3030Check.phaseDiff.toFixed(0)}°). Naikkan berat TW.` : `✗ 30/30 Rule FAILED! TW too small (Amp shift ${rule3030Check.ampDiff.toFixed(0)}%, phase shift ${rule3030Check.phaseDiff.toFixed(0)}°). Increase TW mass.`);
    setSimResultLogs(prev => [...prev, logStr, ruleStr]);
  };

  const handleRunCorrection = () => {
    setSimStep(6);
    let finalAmp = 0.45;
    let finalPhase = 90;
    let logStr = "";
    if (simAfterTw === "remain") {
      finalAmp = 6.2;
      finalPhase = 210;
      logStr = lang === "id"
        ? `✗ GAWAT! Amplitudo tersisa ${finalAmp.toFixed(1)} mm/s. Sisa unbalance tinggi karena berat uji TW tidak dilepas!`
        : `✗ WARNING! Residual vibration remains high at ${finalAmp.toFixed(1)} mm/s. Trial weight was NOT physically removed!`;
    } else {
      logStr = lang === "id"
        ? `✓ Sukses! Amplitudo teredam drastis menjadi ${finalAmp.toFixed(1)} mm/s RMS (LULUS standar ISO 1940 G6.3)`
        : `✓ Success! Residual vibration reduced to ${finalAmp.toFixed(1)} mm/s RMS (PASSED ISO 1940 G6.3 limits)`;
    }
    setSimV1({ amp: finalAmp, phase: finalPhase });
    setSimResultLogs(prev => [...prev, logStr]);
  };

  const handleResetSim = () => {
    setSimStep(1);
    setSimV0({ amp: 8.6, phase: 125 });
    setSimTwMass("10.0");
    setSimTwAngle("0");
    setSimAfterTw("remove");
    setSimResultLogs([]);
  };

  const inputStyle = { ...inputStyleBase };
  const cellStyle = (active: boolean) => ({
    padding: "16px", borderRadius: 10, cursor: "pointer",
    background: active ? "rgba(var(--accent-rgb),0.15)" : "rgba(255,255,255,0.02)",
    border: `1px solid ${active ? "var(--accent)" : "rgba(255,255,255,0.05)"}`,
    textAlign: "center" as const, transition: "all 0.2s ease",
  });

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* gE Filter Recommender */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          🎯 {lang === "id" ? "Rekomendasi Filter Bandpass gE" : "gE Bandpass Filter Recommendation"}
        </h4>
        <div>
          <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", display: "block", marginBottom: 4 }}>
            {lang === "id" ? "RPM MESIN" : "MACHINE RPM"}
          </label>
          <input type="number" min="1" placeholder="e.g. 1800" value={rpmInput} onChange={e => setRpmInput(e.target.value)} style={inputStyle} />
        </div>
        {filterRec && (
          <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: "rgba(var(--accent-rgb),0.08)", border: "1px solid rgba(var(--accent-rgb),0.2)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
              {filterRec.lowHz} Hz — {filterRec.highHz.toLocaleString()} Hz
            </div>
            <p style={{ fontSize: 12, color: "var(--fg-soft)", margin: "6px 0 0" }}>{filterRec.name}</p>
          </div>
        )}
      </div>

      {/* 2×2 Diagnostic Grid */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          🔬 {lang === "id" ? "Matriks Diagnostik Kecepatan + gE (Klik Grid)" : "Velocity + gE Diagnostic Grid (Click to toggle)"}
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <button onClick={() => { setVelTrend("ok");     setGeTrend("ok");     }} style={cellStyle(velTrend === "ok" && geTrend === "ok")}>
            <div style={{ fontSize: 18 }}>🟢</div>
            <div style={{ fontSize: 11, color: "var(--fg)", fontWeight: 700 }}>{t.home.calcs.skfMicrolog.statusOkOk}</div>
            <div style={{ fontSize: 9, color: "var(--muted)" }}>{lang === "id" ? "Kondisi Sehat" : "Healthy State"}</div>
          </button>
          <button onClick={() => { setVelTrend("ok");     setGeTrend("rising"); }} style={cellStyle(velTrend === "ok" && geTrend === "rising")}>
            <div style={{ fontSize: 18 }}>🟡</div>
            <div style={{ fontSize: 11, color: "var(--fg)", fontWeight: 700 }}>{t.home.calcs.skfMicrolog.statusOkRising}</div>
            <div style={{ fontSize: 9, color: "var(--muted)" }}>{lang === "id" ? "Bearing Dini" : "Early Bearing"}</div>
          </button>
          <button onClick={() => { setVelTrend("rising"); setGeTrend("ok");     }} style={cellStyle(velTrend === "rising" && geTrend === "ok")}>
            <div style={{ fontSize: 18 }}>🔵</div>
            <div style={{ fontSize: 11, color: "var(--fg)", fontWeight: 700 }}>{t.home.calcs.skfMicrolog.statusRisingOk}</div>
            <div style={{ fontSize: 9, color: "var(--muted)" }}>{lang === "id" ? "Struktural / Unbalance" : "Structural/Unbalance"}</div>
          </button>
          <button onClick={() => { setVelTrend("rising"); setGeTrend("rising"); }} style={cellStyle(velTrend === "rising" && geTrend === "rising")}>
            <div style={{ fontSize: 18 }}>🔴</div>
            <div style={{ fontSize: 11, color: "var(--fg)", fontWeight: 700 }}>{t.home.calcs.skfMicrolog.statusRisingRising}</div>
            <div style={{ fontSize: 9, color: "var(--muted)" }}>{lang === "id" ? "Kerusakan Bearing Aktif" : "Active Bearing Defect"}</div>
          </button>
        </div>
        <div style={{ padding: 16, borderRadius: 12, background: `${diagFlow.color}11`, border: `1px solid ${diagFlow.color}33` }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: diagFlow.color }}>{diagFlow.diagnosis}</div>
          <p style={{ fontSize: 13, color: "var(--fg-soft)", margin: "8px 0 0", lineHeight: 1.5 }}>{diagFlow.action}</p>
        </div>
      </div>

      {/* Single-Plane Balancing Simulator */}
      <div style={GLASS}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 14 }}>
          ⚖️ {lang === "id" ? "Simulator Balancing Satu Bidang (8-Langkah)" : "Single-Plane Balancing Simulator (8-Step)"}
        </h4>

        {/* Visual Vector Circle (compass convention: 0° top, CW). */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ position: "relative", width: 140, height: 140, borderRadius: "50%", border: "2px solid var(--border)", background: "var(--bg-deep)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.18)" }}>
            <div style={{ position: "absolute", left: "50%", top: "50%", width: 6, height: 6, borderRadius: "50%", background: "var(--fg)", transform: "translate(-50%, -50%)" }} />
            <div style={{ position: "absolute", top: 4,    left: "50%", transform: "translateX(-50%)", fontSize: 8, color: "var(--muted)" }}>0°</div>
            <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", fontSize: 8, color: "var(--muted)" }}>180°</div>
            <div style={{ position: "absolute", left: 6,   top: "50%", transform: "translateY(-50%)", fontSize: 8, color: "var(--muted)" }}>270°</div>
            <div style={{ position: "absolute", right: 6,  top: "50%", transform: "translateY(-50%)", fontSize: 8, color: "var(--muted)" }}>90°</div>

            {simStep >= 2 && <Dot phase={simV0.phase} r={45} size={10} color="#ef4444" glow title="V0 Vector" />}
            {simStep >= 3 && <Dot phase={twAngleNum}  r={45} size={8}  color="#f59e0b" glow title="Trial Weight" />}
            {simStep >= 4 && <Dot phase={simVt1.phase} r={35} size={6}  color="#fbbf24" title="VT1 Vector" />}
            {simStep >= 5 && <Dot phase={simCwRecommendation.angle} r={45} size={10} color="#22c55e" glow title="Correction Weight" />}
          </div>
        </div>

        {/* Step Guide Wizard */}
        <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.04)" }}>
          {simStep === 1 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 12 }}>
                {lang === "id" ? "Langkah 1: Konfigurasi Parameter Mesin" : "Step 1: Configure Machine Parameters"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 9, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{t.home.calcs.skfMicrolog.rotorMass}</label>
                  <input type="number" value={simRotorMass} onChange={e => setSimRotorMass(parseInt(e.target.value) || 0)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 9, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{t.home.calcs.skfMicrolog.speed}</label>
                  <input type="number" value={simRpm} onChange={e => setSimRpm(parseInt(e.target.value) || 0)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 9, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{t.home.calcs.skfMicrolog.radius}</label>
                  <input type="number" value={simRadius} onChange={e => setSimRadius(parseInt(e.target.value) || 0)} style={inputStyle} />
                </div>
              </div>
              <button onClick={handleStartSim} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "var(--accent)", color: "#000", border: "none", fontWeight: 700, cursor: "pointer" }}>
                {lang === "id" ? "MULAI PUTARAN AWAL (V0)" : "START REFERENCE RUN (V0)"}
              </button>
            </div>
          )}

          {simStep === 2 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>
                {lang === "id" ? "Langkah 2 & 3: Estimasi & Pemasangan Berat Uji (TW)" : "Step 2 & 3: Estimate & Install Trial Weight (TW)"}
              </div>
              <p style={{ fontSize: 12, color: "var(--fg-soft)", lineHeight: 1.5, margin: "0 0 12px" }}>
                {lang === "id" ? "Berdasarkan massa rotor, rumus memperkirakan berat uji sekitar ~10 gram. Pasang berat uji fisik pada rotor dan catat massanya di bawah." : "Based on rotor configuration, the calculated trial weight is ~10 grams. Install TW physically on rotor and enter values below."}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 9, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{t.home.calcs.skfMicrolog.twMass}</label>
                  <input type="text" value={simTwMass} onChange={e => setSimTwMass(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 9, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{t.home.calcs.skfMicrolog.twAngle}</label>
                  <input type="text" value={simTwAngle} onChange={e => setSimTwAngle(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <button onClick={handleRunTrial} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "var(--accent)", color: "#000", border: "none", fontWeight: 700, cursor: "pointer" }}>
                {lang === "id" ? "JALANKAN PUTARAN BERA UJI (VT1)" : "RUN TRIAL WEIGHT SPIN (VT1)"}
              </button>
            </div>
          )}

          {simStep === 4 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>
                {lang === "id" ? "Langkah 4 & 5: Rekomendasi Berat Koreksi" : "Step 4 & 5: Correction Weight Recommendation"}
              </div>
              <p style={{ fontSize: 12, color: "var(--fg-soft)", lineHeight: 1.5, margin: "0 0 12px" }}>
                {lang === "id" ? "Aturan 30/30 terpenuhi. Perangkat lunak Microlog menghitung Berat Koreksi (CW) yang diperlukan untuk meredam unbalance." : "30/30 Rule checked. The Microlog software calculates the required Correction Weight (CW) to offset the unbalance."}
              </p>
              <div style={{ padding: 12, borderRadius: 8, background: "rgba(0,0,0,0.3)", marginBottom: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>
                  {lang === "id" ? "REKOMENDASI BERAT KOREKSI (CW)" : "RECOMMENDED CORRECTION WEIGHT (CW)"}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#22c55e", marginTop: 4 }}>
                  {simCwRecommendation.mass} gram @ {simCwRecommendation.angle}°
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 6 }}>
                  {lang === "id" ? "STATUS BERAT UJI (TW) LAPANGAN" : "FIELD TRIAL WEIGHT STATUS"}
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setSimAfterTw("remove")}
                    style={{
                      flex: 1, padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: simAfterTw === "remove" ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                      color: simAfterTw === "remove" ? "#22c55e" : "var(--muted)",
                      border: `1px solid ${simAfterTw === "remove" ? "#22c55e44" : "transparent"}`,
                      cursor: "pointer",
                    }}>
                    {lang === "id" ? "Lepas Berat Uji (Remove)" : "Remove Trial Weight"}
                  </button>
                  <button onClick={() => setSimAfterTw("remain")}
                    style={{
                      flex: 1, padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: simAfterTw === "remain" ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)",
                      color: simAfterTw === "remain" ? "#ef4444" : "var(--muted)",
                      border: `1px solid ${simAfterTw === "remain" ? "#ef444444" : "transparent"}`,
                      cursor: "pointer",
                    }}>
                    {lang === "id" ? "Biarkan Terpasang (Remain)" : "Leave TW (Remain)"}
                  </button>
                </div>
              </div>
              <button onClick={handleRunCorrection} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "var(--accent)", color: "#000", border: "none", fontWeight: 700, cursor: "pointer" }}>
                {lang === "id" ? "JALANKAN PUTARAN KOREKSI (V1)" : "RUN CORRECTION SPIN (V1)"}
              </button>
            </div>
          )}

          {simStep === 6 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>
                {lang === "id" ? "Langkah 6 & 8: Verifikasi Sisa Vibrasi" : "Step 6 & 8: Verify Residual Vibration"}
              </div>
              <div style={{ padding: 12, borderRadius: 8, background: simV1.amp < 1.0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", marginBottom: 16, border: `1px solid ${simV1.amp < 1.0 ? "#22c55e" : "#ef4444"}33` }}>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>
                  {lang === "id" ? "GETARAN RESIDU AKHIR (V1)" : "FINAL RESIDUAL VIBRATION (V1)"}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: simV1.amp < 1.0 ? "#22c55e" : "#ef4444", marginTop: 4 }}>
                  {simV1.amp.toFixed(2)} mm/s RMS
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-soft)", marginTop: 4 }}>
                  {simV1.amp < 1.0
                    ? (lang === "id" ? "Lulus kualifikasi standar penyeimbangan G6.3." : "Passed balancing G6.3 standards.")
                    : (lang === "id" ? "Melebihi toleransi! Cek ulang instalasi fisik beban." : "Outside limits! Re-check physical weight installation.")}
                </div>
              </div>
              <button onClick={handleResetSim} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "var(--fg)", border: "none", fontWeight: 700, cursor: "pointer" }}>
                {t.home.calcs.skfMicrolog.resetSim}
              </button>
            </div>
          )}

          {simResultLogs.length > 0 && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                {t.home.calcs.skfMicrolog.consoleLog}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-soft)" }}>
                {simResultLogs.map((log, index) => (<div key={index} style={{ whiteSpace: "pre-wrap" }}>◈ {log}</div>))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Compass-convention vector dot used by the simulator's circle. */
function Dot({ phase, r, size, color, glow, title }: {
  phase: number; r: number; size: number; color: string; glow?: boolean; title?: string;
}) {
  return (
    <div title={title}
      style={{
        position: "absolute",
        left: `calc(50% + ${Math.sin((phase * Math.PI) / 180) * r}px)`,
        top:  `calc(50% - ${Math.cos((phase * Math.PI) / 180) * r}px)`,
        width: size, height: size, borderRadius: "50%", background: color,
        transform: "translate(-50%, -50%)",
        boxShadow: glow ? `0 0 ${Math.max(8, size)}px ${color}` : undefined,
      }} />
  );
}
