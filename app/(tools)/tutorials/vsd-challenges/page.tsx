"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import CalcShell from "@/components/calc/CalcShell";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";
import { vsdChallenges, challengesByDrive } from "@/data/vsd-challenges";
import type { VsdChallenge } from "@/data/vsd-challenges";

// ─── Philosophical intro quotes ──────────────────────────────────────────────
const QUOTES_EN = [
  "The machine speaks through fault codes. Commissioning is the art of listening.",
  "A drive misconfigured today becomes a production halt tomorrow. Precision is not optional.",
  "Between the motor's potential and the load's demand lies the commissioning engineer's discipline.",
  "In the language of drives — every parameter is a covenant. Every setting is a promise to the system.",
  "Flow cannot be forced into submission. It must be configured, calibrated, and trusted.",
  "Steel does not forgive gravity. The crane that moves safely does so through deliberate design.",
];
const QUOTES_ID = [
  "Mesin berbicara melalui fault code. Commissioning adalah seni mendengarkannya.",
  "Drive yang salah konfigurasi hari ini adalah henti produksi esok hari. Presisi bukan pilihan.",
  "Di antara potensi motor dan tuntutan beban, terdapat disiplin engineer commissioning.",
  "Dalam bahasa drive — setiap parameter adalah perjanjian. Setiap pengaturan adalah janji kepada sistem.",
  "Aliran tidak bisa dipaksa tunduk. Ia harus dikonfigurasi, dikalibrasi, dan dipercaya.",
  "Baja tidak mengampuni gravitasi. Crane yang bergerak selamat melakukannya melalui desain yang disengaja.",
];

// ─── Domain SVG — ACQ580 "Aqua Protocol" ────────────────────────────────────
function AquaSVG() {
  return (
    <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 160, height: "auto" }}>
      <defs>
        <radialGradient id="aqGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4a9eff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#4a9eff" stopOpacity="0" />
        </radialGradient>
        <style>{`
          @keyframes aqFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
          @keyframes aqPulse{0%,100%{opacity:0.5}50%{opacity:1}}
          .aq-body{animation:aqFloat 4s ease-in-out infinite}
          .aq-ring{animation:aqPulse 2.5s ease-in-out infinite}
        `}</style>
      </defs>
      <circle cx="100" cy="108" r="82" stroke="rgba(74,158,255,0.12)" strokeWidth="1"/>
      <circle cx="100" cy="108" r="70" stroke="rgba(74,158,255,0.06)" strokeWidth="1" strokeDasharray="4 3"/>
      <circle cx="100" cy="108" r="72" fill="url(#aqGlow)"/>
      <g className="aq-body">
        {/* Head — water-drop rings */}
        <circle cx="100" cy="52" r="22" stroke="#4a9eff" strokeWidth="1.5" fill="rgba(74,158,255,0.07)" className="aq-ring"/>
        <circle cx="100" cy="52" r="13" stroke="#4a9eff" strokeWidth="1" fill="rgba(74,158,255,0.12)"/>
        <circle cx="100" cy="52" r="5" fill="#4a9eff" opacity="0.9"/>
        {/* Tick marks around head */}
        {[0,60,120,180,240,300].map((deg) => {
          const r=(deg*Math.PI)/180;
          return <line key={deg}
            x1={100+Math.cos(r)*16} y1={52+Math.sin(r)*16}
            x2={100+Math.cos(r)*22} y2={52+Math.sin(r)*22}
            stroke="#4a9eff" strokeWidth="1" opacity="0.6"/>;
        })}
        {/* Neck */}
        <line x1="100" y1="74" x2="100" y2="87" stroke="#4a9eff" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Shoulders */}
        <path d="M100 90 L60 107 L55 120" stroke="#4a9eff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M100 90 L140 107 L145 120" stroke="#4a9eff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Spine — sine-wave */}
        <path d="M100 90 Q96 102 100 114 Q104 126 100 138" stroke="#4a9eff" strokeWidth="1.5" fill="none"/>
        {/* Left arm — trident tips */}
        <path d="M60 107 Q38 122 32 142" stroke="#4a9eff" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8"/>
        <line x1="32" y1="135" x2="32" y2="150" stroke="#4a9eff" strokeWidth="1" opacity="0.7"/>
        <line x1="27" y1="138" x2="27" y2="150" stroke="#4a9eff" strokeWidth="1" opacity="0.5"/>
        <line x1="37" y1="138" x2="37" y2="150" stroke="#4a9eff" strokeWidth="1" opacity="0.5"/>
        <circle cx="32" cy="150" r="2" fill="#4a9eff"/>
        <circle cx="27" cy="150" r="1.5" fill="#4a9eff" opacity="0.6"/>
        <circle cx="37" cy="150" r="1.5" fill="#4a9eff" opacity="0.6"/>
        {/* Right arm — measurement terminal */}
        <path d="M140 107 Q162 122 168 142" stroke="#4a9eff" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8"/>
        <rect x="162" y="136" width="12" height="18" rx="2" stroke="#4a9eff" strokeWidth="1" fill="rgba(74,158,255,0.15)" opacity="0.8"/>
        <line x1="166" y1="140" x2="170" y2="140" stroke="#4a9eff" strokeWidth="1" opacity="0.6"/>
        <line x1="166" y1="145" x2="170" y2="145" stroke="#4a9eff" strokeWidth="1" opacity="0.6"/>
        {/* Legs */}
        <line x1="96" y1="138" x2="88" y2="167" stroke="#4a9eff" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="104" y1="138" x2="112" y2="167" stroke="#4a9eff" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Feet — wave lines */}
        <path d="M80 167 Q84 162 88 167 Q92 172 96 167" stroke="#4a9eff" strokeWidth="1" fill="none" opacity="0.6"/>
        <path d="M108 167 Q112 162 116 167 Q120 172 124 167" stroke="#4a9eff" strokeWidth="1" fill="none" opacity="0.6"/>
      </g>
      {/* Base waves */}
      <path d="M20 195 Q35 185 50 195 Q65 205 80 195 Q95 185 110 195 Q125 205 140 195 Q155 185 170 195 Q185 205 200 195"
        stroke="rgba(74,158,255,0.3)" strokeWidth="1.5" fill="none"/>
      <path d="M10 205 Q28 196 46 205 Q64 214 82 205 Q100 196 118 205 Q136 214 154 205 Q172 196 190 205"
        stroke="rgba(74,158,255,0.12)" strokeWidth="1" fill="none"/>
      {/* Floating circuit nodes */}
      {[[22,78],[178,90],[18,140],[182,135],[45,175],[155,175]].map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r={i%2===0?2:1.5} fill="#4a9eff" opacity={0.35+i*0.05}/>
      ))}
    </svg>
  );
}

// ─── Domain SVG — ACS880 "Iron Covenant" ─────────────────────────────────────
function IronSVG() {
  return (
    <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 160, height: "auto" }}>
      <defs>
        <radialGradient id="irGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e4c759" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#e4c759" stopOpacity="0"/>
        </radialGradient>
        <style>{`
          @keyframes irPulse{0%,100%{opacity:0.55}50%{opacity:1}}
          @keyframes irRay{0%,100%{opacity:0.15}60%{opacity:0.6}}
          .ir-body{animation:irPulse 3s ease-in-out infinite}
          .ir-ray{animation:irRay 2s ease-in-out infinite}
        `}</style>
      </defs>
      {/* Outer octagonal frame */}
      <polygon points="100,20 148,36 174,82 174,130 148,176 100,192 52,176 26,130 26,82 52,36"
        stroke="rgba(228,199,89,0.18)" strokeWidth="1" fill="url(#irGlow)"/>
      {/* Gear ring around head */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg,i)=>{
        const r=(deg*Math.PI)/180;
        return <line key={i}
          x1={100+Math.cos(r)*38} y1={58+Math.sin(r)*38}
          x2={100+Math.cos(r)*46} y2={58+Math.sin(r)*46}
          stroke="rgba(228,199,89,0.4)" strokeWidth={i%2===0?"1.5":"1"}/>;
      })}
      <circle cx="100" cy="58" r="32" stroke="#e4c759" strokeWidth="1.5" fill="rgba(228,199,89,0.06)" className="ir-body"/>
      <circle cx="100" cy="58" r="18" stroke="#e4c759" strokeWidth="1" fill="rgba(228,199,89,0.1)"/>
      {/* Angular visor eyes */}
      <path d="M86 52 L94 56 L86 60" stroke="#e4c759" strokeWidth="1.5" fill="none"/>
      <path d="M114 52 L106 56 L114 60" stroke="#e4c759" strokeWidth="1.5" fill="none"/>
      <line x1="94" y1="66" x2="106" y2="66" stroke="#e4c759" strokeWidth="1" opacity="0.6"/>
      {/* Neck + crossbar */}
      <line x1="100" y1="90" x2="100" y2="108" stroke="#e4c759" strokeWidth="2"/>
      <line x1="93" y1="98" x2="107" y2="98" stroke="#e4c759" strokeWidth="1.5"/>
      {/* Shoulders — I-beam */}
      <path d="M100 108 L64 118" stroke="#e4c759" strokeWidth="2" strokeLinecap="round"/>
      <path d="M100 108 L136 118" stroke="#e4c759" strokeWidth="2" strokeLinecap="round"/>
      <line x1="60" y1="114" x2="60" y2="124" stroke="#e4c759" strokeWidth="1.5"/>
      <line x1="140" y1="114" x2="140" y2="124" stroke="#e4c759" strokeWidth="1.5"/>
      {/* Body — I-beam torso */}
      <line x1="100" y1="108" x2="100" y2="148" stroke="#e4c759" strokeWidth="2"/>
      <line x1="92" y1="130" x2="108" y2="130" stroke="#e4c759" strokeWidth="1.5" opacity="0.6"/>
      {/* Left arm — crane arm + hook */}
      <path d="M64 118 L40 108 L30 140" stroke="#e4c759" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M30 140 Q22 153 30 161 Q38 169 42 159" stroke="#e4c759" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="30" cy="140" r="2.5" fill="#e4c759"/>
      {/* Right arm — power terminal */}
      <path d="M136 118 L160 108 L172 134" stroke="#e4c759" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <rect x="166" y="128" width="14" height="20" rx="2" stroke="#e4c759" strokeWidth="1.5" fill="rgba(228,199,89,0.1)"/>
      <line x1="169" y1="134" x2="177" y2="134" stroke="#e4c759" strokeWidth="1"/>
      <line x1="169" y1="139" x2="177" y2="139" stroke="#e4c759" strokeWidth="1"/>
      <line x1="169" y1="144" x2="177" y2="144" stroke="#e4c759" strokeWidth="1"/>
      {/* Legs — structural */}
      <path d="M96 148 L84 178" stroke="#e4c759" strokeWidth="2" strokeLinecap="round"/>
      <path d="M104 148 L116 178" stroke="#e4c759" strokeWidth="2" strokeLinecap="round"/>
      <line x1="80" y1="178" x2="88" y2="178" stroke="#e4c759" strokeWidth="2"/>
      <line x1="112" y1="178" x2="120" y2="178" stroke="#e4c759" strokeWidth="2"/>
      {/* Energy rays */}
      {[[-28,0],[-20,20],[28,0],[20,20],[-10,-28],[10,-28]].map(([dx,dy],i)=>(
        <line key={i}
          x1={100+dx*0.65} y1={130+dy*0.65}
          x2={100+dx} y2={130+dy}
          stroke="#e4c759" strokeWidth="1" opacity="0.25" className="ir-ray"/>
      ))}
      {/* Base ground line */}
      <line x1="28" y1="196" x2="172" y2="196" stroke="rgba(228,199,89,0.4)" strokeWidth="2"/>
      <line x1="18" y1="202" x2="182" y2="202" stroke="rgba(228,199,89,0.12)" strokeWidth="1"/>
    </svg>
  );
}

// ─── Difficulty dots ─────────────────────────────────────────────────────────
function DifficultyDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1,2,3].map(d => (
        <div key={d} style={{
          width: 6, height: 6, borderRadius: "50%",
          background: d <= level ? "var(--accent)" : "rgba(255,255,255,0.12)",
          boxShadow: d <= level ? "0 0 6px var(--accent)" : "none",
          transition: "all 0.2s",
        }}/>
      ))}
    </div>
  );
}

// ─── Challenge detail ─────────────────────────────────────────────────────────
function ChallengeDetail({
  challenge, lang, completedIds, onComplete,
}: {
  challenge: VsdChallenge;
  lang: string;
  completedIds: string[];
  onComplete: (id: string) => void;
}) {
  const [openSteps, setOpenSteps] = useState<Record<number, boolean>>({ 0: true });
  const [checkedPrereqs, setCheckedPrereqs] = useState<Record<number, boolean>>({});
  const isCompleted = completedIds.includes(challenge.id);
  const prereqs = lang === "id" ? challenge.prerequisitesId : challenge.prerequisitesEn;
  const isACS = challenge.drive === "ACS880";
  const accent = isACS ? "#4a9eff" : "var(--accent)";

  return (
    <div style={{
      background: "rgba(0,0,0,0.35)", borderRadius: 20,
      border: `1px solid ${isACS ? "rgba(74,158,255,0.25)" : "rgba(228,199,89,0.25)"}`,
      padding: 28, display: "flex", flexDirection: "column", gap: 24,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{
              fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.12em",
              padding: "3px 8px", borderRadius: 4, textTransform: "uppercase",
              background: isACS ? "rgba(74,158,255,0.15)" : "rgba(228,199,89,0.15)",
              color: accent,
            }}>{challenge.drive}</span>
            <DifficultyDots level={challenge.difficulty}/>
            <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              ~{challenge.estimatedMinutes} min · {challenge.steps.length} {lang === "id" ? "langkah" : "steps"}
            </span>
          </div>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 20, color: accent, lineHeight: 1.2 }}>
            {lang === "id" ? challenge.titleId : challenge.titleEn}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "var(--fg-soft)", lineHeight: 1.5, maxWidth: 560 }}>
            {lang === "id" ? challenge.objectiveId : challenge.objectiveEn}
          </p>
        </div>
        <button
          onClick={() => onComplete(challenge.id)}
          style={{
            padding: "10px 18px", borderRadius: 10, cursor: "pointer",
            fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            background: isCompleted ? "rgba(34,197,94,0.15)" : "transparent",
            color: isCompleted ? "#22c55e" : accent,
            border: `1px solid ${isCompleted ? "rgba(34,197,94,0.4)" : accent}`,
            transition: "all 0.2s", whiteSpace: "nowrap",
          }}
        >
          {isCompleted
            ? (lang === "id" ? "✓ Selesai" : "✓ Completed")
            : (lang === "id" ? "Tandai Selesai" : "Mark Complete")}
        </button>
      </div>

      {/* Prerequisites */}
      <div>
        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
          {lang === "id" ? "Prasyarat" : "Prerequisites"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {prereqs.map((p, i) => (
            <label key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={!!checkedPrereqs[i]}
                onChange={e => setCheckedPrereqs(prev => ({ ...prev, [i]: e.target.checked }))}
                style={{ marginTop: 3, accentColor: accent }}
              />
              <span style={{
                fontSize: 13, color: checkedPrereqs[i] ? "var(--muted)" : "var(--fg-soft)",
                lineHeight: 1.4, textDecoration: checkedPrereqs[i] ? "line-through" : "none",
                transition: "color 0.2s",
              }}>{p}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Steps accordion */}
      <div>
        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
          {lang === "id" ? "Langkah Commissioning" : "Commissioning Steps"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {challenge.steps.map((step, i) => {
            const open = !!openSteps[i];
            return (
              <div key={i} style={{
                borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s",
                border: `1px solid ${open
                  ? (isACS ? "rgba(74,158,255,0.3)" : "rgba(228,199,89,0.3)")
                  : "rgba(255,255,255,0.05)"}`,
                background: open ? "rgba(255,255,255,0.025)" : "transparent",
              }}>
                <button
                  onClick={() => setOpenSteps(prev => ({ ...prev, [i]: !open }))}
                  style={{
                    width: "100%", padding: "12px 16px", background: "none", border: "none",
                    cursor: "pointer", display: "flex", gap: 12, alignItems: "center", textAlign: "left",
                  }}
                >
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    background: open ? accent : "rgba(255,255,255,0.08)",
                    color: open ? "#000" : "var(--muted)",
                    fontSize: 10, fontWeight: 800, fontFamily: "var(--font-mono)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 14, fontWeight: open ? 700 : 400, color: open ? "var(--fg)" : "var(--fg-soft)", flex: 1 }}>
                    {lang === "id" ? step.titleId : step.titleEn}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--muted)", opacity: 0.5 }}>{open ? "▲" : "▼"}</span>
                </button>
                {open && (
                  <div style={{ padding: "0 16px 16px 50px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--fg-soft)", lineHeight: 1.6 }}>
                      {lang === "id" ? step.descId : step.descEn}
                    </p>
                    {step.params && step.params.length > 0 && (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                          <thead>
                            <tr>
                              {["Code", "Parameter", lang === "id" ? "Nilai Set" : "Set Value", "Unit", lang === "id" ? "Catatan" : "Note"].map(h => (
                                <th key={h} style={{
                                  padding: "6px 10px", textAlign: "left", fontSize: 9,
                                  fontFamily: "var(--font-mono)", color: "var(--muted)",
                                  textTransform: "uppercase", letterSpacing: "0.08em",
                                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                                  whiteSpace: "nowrap",
                                }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {step.params.map((p, pi) => (
                              <tr key={pi} style={{ background: pi % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                                <td style={{ padding: "7px 10px", fontFamily: "var(--font-mono)", color: accent, fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" }}>{p.code}</td>
                                <td style={{ padding: "7px 10px", color: "var(--fg-soft)" }}>{lang === "id" ? p.nameId : p.nameEn}</td>
                                <td style={{ padding: "7px 10px", fontFamily: "var(--font-mono)", color: "var(--fg)", fontWeight: 600 }}>{p.setValue}</td>
                                <td style={{ padding: "7px 10px", color: "var(--muted)", whiteSpace: "nowrap" }}>{p.unit ?? "—"}</td>
                                <td style={{ padding: "7px 10px", color: "var(--muted)", fontStyle: "italic", fontSize: 11 }}>{p.note ?? "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Limit settings */}
      {challenge.limitSettings.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            {lang === "id" ? "Referensi Pengaturan Batas" : "Limit Settings Reference"}
          </div>
          <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                  {["Code", lang === "id" ? "Nama" : "Name", "Min", "Max", lang === "id" ? "Tipikal" : "Typical", "Unit"].map(h => (
                    <th key={h} style={{
                      padding: "8px 12px", textAlign: "left", fontSize: 9,
                      fontFamily: "var(--font-mono)", color: "var(--muted)",
                      textTransform: "uppercase", letterSpacing: "0.08em",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {challenge.limitSettings.map((ls, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                    <td style={{ padding: "7px 12px", fontFamily: "var(--font-mono)", color: accent, fontWeight: 700, fontSize: 12 }}>{ls.param}</td>
                    <td style={{ padding: "7px 12px", color: "var(--fg-soft)" }}>{lang === "id" ? ls.nameId : ls.nameEn}</td>
                    <td style={{ padding: "7px 12px", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{ls.min ?? "—"}</td>
                    <td style={{ padding: "7px 12px", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{ls.max ?? "—"}</td>
                    <td style={{ padding: "7px 12px", color: "var(--fg)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{ls.typical ?? "—"}</td>
                    <td style={{ padding: "7px 12px", color: "var(--muted)" }}>{ls.unit ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual ref */}
      <div style={{
        padding: "10px 14px", borderRadius: 8,
        background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)",
        display: "flex", gap: 8, alignItems: "center",
      }}>
        <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {lang === "id" ? "Ref. Manual" : "Manual Ref"}:
        </span>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg-soft)" }}>{challenge.manualRef}</span>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
type Phase = "intro" | "select" | "challenges";

export default function VsdChallengesPage() {
  const { lang } = useLang();
  const [phase, setPhase] = useState<Phase>("intro");
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteFade, setQuoteFade] = useState(true);
  const [activeDomain, setActiveDomain] = useState<0 | 1>(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [selectedChallenge, setSelectedChallenge] = useState<VsdChallenge | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const detailRef = useRef<HTMLDivElement>(null);

  const quotes = lang === "id" ? QUOTES_ID : QUOTES_EN;
  const domainKey = activeDomain === 0 ? "ACQ580" : "ACS880";
  const domainChallenges = useMemo(() => challengesByDrive(domainKey), [domainKey]);

  useEffect(() => {
    const stored = localStorage.getItem("ptts-challenge-completed");
    if (stored) { try { setCompletedIds(JSON.parse(stored)); } catch {} }
  }, []);

  // Rotate quotes
  useEffect(() => {
    if (phase !== "intro") return;
    const id = setInterval(() => {
      setQuoteFade(false);
      setTimeout(() => { setQuoteIdx(i => (i + 1) % quotes.length); setQuoteFade(true); }, 500);
    }, 3200);
    return () => clearInterval(id);
  }, [phase, quotes.length]);

  const handleComplete = useCallback((id: string) => {
    setCompletedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("ptts-challenge-completed", JSON.stringify(next));
      return next;
    });
  }, []);

  const switchDomain = useCallback((idx: 0 | 1) => {
    setActiveDomain(idx);
    setSelectedChallenge(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (Math.abs(dragOffset) > 80) switchDomain(dragOffset < 0 ? 1 : 0);
    setDragStartX(null);
    setDragOffset(0);
  }, [dragOffset, switchDomain]);

  const selectChallenge = (c: VsdChallenge) => {
    setSelectedChallenge(prev => prev?.id === c.id ? null : c);
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const domains = useMemo(() => [
    {
      key: "ACQ580" as const,
      codename: "AQUA PROTOCOL",
      subtitle: lang === "id" ? "Kodeks Sang Penjaga Air" : "Codex of the Waterkeeper",
      tagline: lang === "id"
        ? "Di mana tekanan menjadi ketaatan dan aliran menjadi logika. Kuasai urutan multipump. Taklukkan sinyal analog. Jadikan air tunduk pada kehendak."
        : "Where pressure becomes obedience and flow becomes logic. Master the multipump sequence. Command the analog signal. Make water serve the will.",
      color: "#4a9eff",
      colorBg: "rgba(74,158,255,0.08)",
      colorBorder: "rgba(74,158,255,0.3)",
      Icon: AquaSVG,
      tag: lang === "id" ? "Domain Air" : "Water Domain",
    },
    {
      key: "ACS880" as const,
      codename: "IRON COVENANT",
      subtitle: lang === "id" ? "Grimoir Sang Penguasa Crane" : "Grimoire of the Crane Master",
      tagline: lang === "id"
        ? "Di mana gravitasi adalah lawan dan torsi adalah tameng. Commission hoist. Taklukkan N5050. Jadikan baja bergerak dengan niat."
        : "Where gravity is the adversary and torque is the shield. Commission the hoist. Tame the N5050. Make steel move with intention.",
      color: "var(--accent)",
      colorBg: "rgba(228,199,89,0.08)",
      colorBorder: "rgba(228,199,89,0.3)",
      Icon: IronSVG,
      tag: lang === "id" ? "Domain Berat" : "Heavy-Duty Domain",
    },
  ], [lang]);

  const activeDomainData = domains[activeDomain];
  const totalCompleted = completedIds.length;
  const totalChallenges = vsdChallenges.length;

  // ── Intro phase ─────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div style={{
        minHeight: "100svh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        {/* Background circuit decoration */}
        <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", opacity: 0.04, pointerEvents: "none", zIndex: 0 }}
          viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1={0} y1={i * 52} x2={800} y2={i * 52 + (i % 3 === 0 ? 80 : 0)}
              stroke="#e4c759" strokeWidth="1" strokeDasharray="8 6"/>
          ))}
          {Array.from({ length: 14 }).map((_, i) => (
            <circle key={i} cx={i * 62} cy={200 + (i % 4) * 60} r="3" fill="#e4c759"/>
          ))}
        </svg>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
          <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--accent)", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.8 }}>
            PTTS PRAXIS · ABB VSD · COMMISSIONING DOCTRINE
          </div>

          <div style={{ minHeight: 96, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(15px, 3.5vw, 21px)",
              fontStyle: "italic", color: "var(--fg)", lineHeight: 1.65, margin: 0,
              opacity: quoteFade ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}>
              &ldquo;{quotes[quoteIdx]}&rdquo;
            </p>
          </div>

          {/* Quote progress dots */}
          <div style={{ display: "flex", gap: 8 }}>
            {quotes.map((_, i) => (
              <div key={i} style={{
                width: i === quoteIdx ? 20 : 6, height: 6, borderRadius: 3,
                background: i === quoteIdx ? "var(--accent)" : "rgba(255,255,255,0.12)",
                transition: "all 0.4s ease",
              }}/>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={() => setPhase("select")}
              style={{
                padding: "14px 32px", borderRadius: 12, cursor: "pointer",
                background: "var(--accent)", color: "#000",
                fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 800,
                letterSpacing: "0.12em", textTransform: "uppercase", border: "none",
              }}
            >
              {lang === "id" ? "MULAI COMMISSIONING →" : "BEGIN COMMISSIONING →"}
            </button>
            <button
              onClick={() => setPhase("challenges")}
              style={{
                padding: "14px 24px", borderRadius: 12, cursor: "pointer",
                background: "transparent", color: "var(--fg-soft)",
                fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
                letterSpacing: "0.08em", border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {lang === "id" ? "Lewati intro" : "Skip intro"}
            </button>
          </div>

          <Link href="/tutorials" style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", textDecoration: "none", opacity: 0.55 }}>
            ← {lang === "id" ? "Kembali ke Panduan Pengujian" : "Back to Testing Tutorials"}
          </Link>
        </div>
      </div>
    );
  }

  // ── Select phase ─────────────────────────────────────────────────────────────
  if (phase === "select") {
    return (
      <div style={{
        minHeight: "100svh", display: "flex", flexDirection: "column",
        alignItems: "center", padding: "48px 16px 48px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ textAlign: "center", marginBottom: 48, zIndex: 1 }}>
          <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--accent)", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.7, marginBottom: 16 }}>
            {lang === "id" ? "PILIH DOMAIN COMMISSIONING" : "SELECT YOUR COMMISSIONING DOMAIN"}
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 6vw, 42px)", color: "var(--fg)", margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            {lang === "id" ? "Dua Jalan. Satu Misi." : "Two Paths. One Mission."}
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 12, fontStyle: "italic" }}>
            {lang === "id" ? "Geser atau klik untuk memilih domain Anda" : "Swipe or click to choose your domain"}
          </p>
        </div>

        {/* Swipeable cards */}
        <div
          style={{ display: "flex", gap: 20, justifyContent: "center", alignItems: "stretch", flexWrap: "wrap", width: "100%", maxWidth: 860, zIndex: 1 }}
          onMouseLeave={handleDragEnd}
          onMouseMove={e => { if (dragStartX !== null) setDragOffset(e.clientX - dragStartX); }}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onTouchMove={e => { if (dragStartX !== null) setDragOffset(e.touches[0].clientX - dragStartX); }}
        >
          {domains.map((d, idx) => {
            const isActive = activeDomain === idx;
            const tiltY = isActive && dragStartX !== null ? dragOffset * 0.04 : 0;
            return (
              <div
                key={d.key}
                onMouseDown={e => setDragStartX(e.clientX)}
                onTouchStart={e => setDragStartX(e.touches[0].clientX)}
                onClick={() => { if (Math.abs(dragOffset) < 10) switchDomain(idx as 0 | 1); }}
                style={{
                  flex: "1 1 300px", maxWidth: 380, minHeight: 460,
                  borderRadius: 24, padding: 32, cursor: "pointer",
                  background: isActive ? d.colorBg : "rgba(255,255,255,0.02)",
                  border: `1.5px solid ${isActive ? d.colorBorder : "rgba(255,255,255,0.07)"}`,
                  boxShadow: isActive
                    ? `0 0 60px ${d.color === "var(--accent)" ? "rgba(228,199,89,0.15)" : "rgba(74,158,255,0.15)"}, 0 20px 60px rgba(0,0,0,0.4)`
                    : "0 8px 32px rgba(0,0,0,0.25)",
                  transform: `scale(${isActive ? 1.02 : 0.955}) rotateY(${tiltY}deg)`,
                  transition: dragStartX !== null ? "box-shadow 0.1s" : "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                  display: "flex", flexDirection: "column", gap: 20,
                  opacity: isActive ? 1 : 0.55,
                  userSelect: "none",
                  perspective: "1000px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{
                    fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.15em",
                    padding: "3px 10px", borderRadius: 4, textTransform: "uppercase",
                    background: isActive ? `${d.color === "var(--accent)" ? "rgba(228,199,89,0.15)" : "rgba(74,158,255,0.15)"}` : "rgba(255,255,255,0.05)",
                    color: isActive ? d.color : "var(--muted)",
                  }}>{d.tag}</span>
                  {isActive && <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, boxShadow: `0 0 12px ${d.color}` }}/>}
                </div>

                <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
                  <d.Icon/>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.2em", textTransform: "uppercase" }}>{d.key}</div>
                  <h2 style={{
                    fontFamily: "var(--font-display)", fontSize: 26, margin: 0, letterSpacing: "-0.01em", lineHeight: 1.1,
                    color: isActive ? d.color : "var(--fg-soft)",
                  }}>{d.codename}</h2>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>{d.subtitle}</div>
                  <p style={{ fontSize: 13, color: "var(--fg-soft)", lineHeight: 1.6, margin: 0 }}>{d.tagline}</p>
                </div>

                <div style={{
                  marginTop: "auto", paddingTop: 16,
                  borderTop: `1px solid ${isActive ? (d.color === "var(--accent)" ? "rgba(228,199,89,0.25)" : "rgba(74,158,255,0.25)") : "rgba(255,255,255,0.05)"}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
                    {challengesByDrive(d.key).length} {lang === "id" ? "tantangan" : "challenges"}
                  </span>
                  {isActive && (
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: d.color, fontWeight: 700 }}>
                      {lang === "id" ? "AKTIF ↗" : "ACTIVE ↗"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 40, zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => setPhase("challenges")}
            style={{
              padding: "14px 40px", borderRadius: 12, cursor: "pointer",
              background: activeDomain === 1 ? "var(--accent)" : "#4a9eff",
              color: "#000",
              fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 800,
              letterSpacing: "0.12em", textTransform: "uppercase", border: "none",
            }}
          >
            {lang === "id"
              ? `MASUK KE ${activeDomainData.codename} →`
              : `ENTER ${activeDomainData.codename} →`}
          </button>
          <button
            onClick={() => setPhase("intro")}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", opacity: 0.55 }}
          >
            ← {lang === "id" ? "Kembali ke intro" : "Back to intro"}
          </button>
        </div>
      </div>
    );
  }

  // ── Challenges phase ──────────────────────────────────────────────────────
  return (
    <CalcShell
      label={domainKey}
      title={activeDomainData.codename}
      subtitle={activeDomainData.subtitle}
      concept={activeDomainData.tagline}
    >
      {/* Domain switcher */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
        {domains.map((d, idx) => (
          <button
            key={d.key}
            onClick={() => switchDomain(idx as 0 | 1)}
            style={{
              padding: "8px 16px", borderRadius: 8, cursor: "pointer",
              background: activeDomain === idx ? (d.color === "var(--accent)" ? "rgba(228,199,89,0.12)" : "rgba(74,158,255,0.12)") : "transparent",
              border: `1px solid ${activeDomain === idx ? d.colorBorder : "rgba(255,255,255,0.08)"}`,
              color: activeDomain === idx ? d.color : "var(--fg-soft)",
              fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: activeDomain === idx ? 700 : 400,
              letterSpacing: "0.08em", transition: "all 0.2s",
            }}
          >{d.codename}</button>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
          {totalCompleted}/{totalChallenges} {lang === "id" ? "selesai" : "completed"}
        </div>
        <button
          onClick={() => setPhase("select")}
          style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 10 }}
        >↖ {lang === "id" ? "Ganti domain" : "Change domain"}</button>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 28, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
        <div style={{
          height: "100%", borderRadius: 2,
          background: activeDomain === 1 ? "var(--accent)" : "#4a9eff",
          width: `${(totalCompleted / Math.max(totalChallenges, 1)) * 100}%`,
          transition: "width 0.6s ease",
        }}/>
      </div>

      {/* Challenge cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
        {domainChallenges.map(c => {
          const isSelected = selectedChallenge?.id === c.id;
          const isDone = completedIds.includes(c.id);
          const isACS = c.drive === "ACS880";
          const accent = isACS ? "#4a9eff" : "var(--accent)";
          return (
            <button
              key={c.id}
              onClick={() => selectChallenge(c)}
              style={{
                padding: 20, borderRadius: 16, cursor: "pointer", textAlign: "left",
                background: isSelected ? (isACS ? "rgba(74,158,255,0.1)" : "rgba(228,199,89,0.1)") : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${isSelected ? (isACS ? "rgba(74,158,255,0.4)" : "rgba(228,199,89,0.4)") : "rgba(255,255,255,0.06)"}`,
                boxShadow: isDone ? "0 0 20px rgba(34,197,94,0.08)" : "none",
                transition: "all 0.2s", position: "relative", overflow: "hidden",
              }}
            >
              {isDone && (
                <div style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderStyle: "solid", borderWidth: "0 36px 36px 0", borderColor: "transparent rgba(34,197,94,0.5) transparent transparent" }}>
                  <span style={{ position: "absolute", top: 4, right: -28, fontSize: 10, color: "#fff" }}>✓</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <DifficultyDots level={c.difficulty}/>
                <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>~{c.estimatedMinutes} min</span>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 15, color: isSelected ? accent : "var(--fg)", marginBottom: 8, lineHeight: 1.3 }}>
                {lang === "id" ? c.titleId : c.titleEn}
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {lang === "id" ? c.objectiveId : c.objectiveEn}
              </p>
              <div style={{ marginTop: 12, fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
                {c.steps.length} {lang === "id" ? "langkah" : "steps"}
                {isSelected && <span style={{ color: accent, marginLeft: 8 }}>▲ {lang === "id" ? "Buka" : "Open"}</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Challenge detail */}
      <div ref={detailRef}>
        {selectedChallenge && (
          <ChallengeDetail
            challenge={selectedChallenge}
            lang={lang}
            completedIds={completedIds}
            onComplete={handleComplete}
          />
        )}
      </div>

      <Footer/>

      <style jsx global>{`
        @media (max-width:640px) {
          div[style*="repeat(auto-fill, minmax(280px, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </CalcShell>
  );
}
