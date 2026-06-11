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
  "Every fault code is a confession the machine has been waiting to make. Commissioning is learning to hear it before it must be spoken.",
  "Cavitation does not announce itself. It carves the impeller in silence, one collapsed bubble at a time — the way neglect carves every system that was never measured.",
  "A crane holds ten tonnes the way a promise holds its weight: not by strength alone, but by every torque limit written down before the first lift.",
  "Production does not stop on the day of the fault. It stopped on the day a parameter was left at default — the line simply took months to notice.",
  "Water remembers every pressure it was promised. The pump that keeps that promise was configured by an engineer who refused to guess.",
  "Steel obeys gravity every hour of every day, without exception. Your only argument against it is the parameter set. Make it incorruptible.",
];
const QUOTES_ID = [
  "Setiap fault code adalah pengakuan yang sudah lama ingin diucapkan mesin. Commissioning adalah belajar mendengarnya sebelum ia terpaksa bicara.",
  "Kavitasi tidak pernah mengumumkan kedatangannya. Ia mengukir impeller dalam diam, satu gelembung runtuh demi satu — seperti kelalaian mengukir setiap sistem yang tak pernah diukur.",
  "Crane menahan sepuluh ton seperti janji menahan beratnya: bukan oleh kekuatan semata, melainkan oleh setiap batas torsi yang dituliskan sebelum angkatan pertama.",
  "Produksi tidak berhenti pada hari fault terjadi. Ia berhenti pada hari sebuah parameter dibiarkan default — lini hanya butuh berbulan-bulan untuk menyadarinya.",
  "Air mengingat setiap tekanan yang pernah dijanjikan kepadanya. Pompa yang menepati janji itu dikonfigurasi oleh engineer yang menolak menebak.",
  "Baja menaati gravitasi setiap jam, setiap hari, tanpa kecuali. Satu-satunya bantahanmu adalah parameter set. Jadikan ia tak tergoyahkan.",
];

// ─── Domain SVG — ACQ580 "Aqua Protocol" — Da Vinci sketch style ─────────────
function AquaSVG() {
  return (
    <svg viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 150, height: "auto" }}>
      <defs>
        <style>{`
          @keyframes aqSkFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
          .aqsk-body{animation:aqSkFloat 5s ease-in-out infinite}
        `}</style>
      </defs>
      {/* Vitruvian construction circle */}
      <circle cx="100" cy="112" r="88" stroke="#4a2c08" strokeWidth="0.5" strokeDasharray="2.5 4" opacity="0.28"/>
      <circle cx="100" cy="112" r="68" stroke="#4a2c08" strokeWidth="0.3" strokeDasharray="1 5" opacity="0.15"/>
      {/* Proportion guide lines */}
      <line x1="12" y1="112" x2="188" y2="112" stroke="#6b3f12" strokeWidth="0.4" strokeDasharray="3 4" opacity="0.18"/>
      <line x1="100" y1="24" x2="100" y2="210" stroke="#6b3f12" strokeWidth="0.4" strokeDasharray="3 4" opacity="0.18"/>

      <g className="aqsk-body">
        {/* Head — circle construction + cross-hatch shade */}
        <circle cx="100" cy="46" r="21" stroke="#4a2c08" strokeWidth="1.2" fill="rgba(180,130,60,0.12)"/>
        <circle cx="100" cy="46" r="11" stroke="#4a2c08" strokeWidth="0.7" fill="none" opacity="0.45"/>
        {/* Cross-hatch right side of head */}
        <line x1="107" y1="36" x2="119" y2="48" stroke="#6b3f12" strokeWidth="0.5" opacity="0.38"/>
        <line x1="111" y1="38" x2="121" y2="52" stroke="#6b3f12" strokeWidth="0.5" opacity="0.32"/>
        <line x1="115" y1="42" x2="121" y2="56" stroke="#6b3f12" strokeWidth="0.5" opacity="0.28"/>
        {/* Eyes */}
        <line x1="92" y1="44" x2="96" y2="44" stroke="#4a2c08" strokeWidth="1" strokeLinecap="round"/>
        <line x1="104" y1="44" x2="108" y2="44" stroke="#4a2c08" strokeWidth="1" strokeLinecap="round"/>
        {/* Nose bridge */}
        <path d="M100 44 L100 50" stroke="#4a2c08" strokeWidth="0.7" strokeLinecap="round"/>
        {/* Mouth */}
        <path d="M95 53 Q100 56 105 53" stroke="#4a2c08" strokeWidth="0.8" fill="none"/>
        {/* Measurement ticks around head */}
        {[0,45,90,135,180,225,270,315].map((deg,i) => {
          const rad = (deg * Math.PI) / 180;
          return <line key={i}
            x1={100 + Math.cos(rad) * 22} y1={46 + Math.sin(rad) * 22}
            x2={100 + Math.cos(rad) * 26} y2={46 + Math.sin(rad) * 26}
            stroke="#6b3f12" strokeWidth="0.6" opacity="0.35"/>;
        })}

        {/* Neck */}
        <line x1="100" y1="67" x2="100" y2="80" stroke="#4a2c08" strokeWidth="1.4" strokeLinecap="round"/>
        {/* Collarbone */}
        <line x1="80" y1="80" x2="120" y2="80" stroke="#4a2c08" strokeWidth="0.8" opacity="0.5"/>

        {/* Torso outline */}
        <path d="M80 80 L76 136 L100 142 L124 136 L120 80 Z" stroke="#4a2c08" strokeWidth="1" fill="rgba(180,130,60,0.08)"/>
        {/* Horizontal cross-hatch on torso */}
        {[0,7,14,21,28,35,42,49].map(y => (
          <line key={y} x1="80" y1={83+y} x2="120" y2={83+y} stroke="#6b3f12" strokeWidth="0.4" opacity="0.3"/>
        ))}
        {/* Vertical cross-hatch */}
        {[0,8,16,24,32,40].map(x => (
          <line key={x} x1={82+x} y1="80" x2={82+x} y2="140" stroke="#6b3f12" strokeWidth="0.3" opacity="0.15"/>
        ))}

        {/* Shoulders */}
        <path d="M100 83 L62 96 L54 114" stroke="#4a2c08" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M100 83 L138 96 L146 114" stroke="#4a2c08" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Shoulder joint circles */}
        <circle cx="62" cy="96" r="5" stroke="#4a2c08" strokeWidth="0.7" fill="none" opacity="0.5"/>
        <circle cx="138" cy="96" r="5" stroke="#4a2c08" strokeWidth="0.7" fill="none" opacity="0.5"/>

        {/* Left arm — trident */}
        <path d="M54 114 Q36 130 30 152" stroke="#4a2c08" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <line x1="30" y1="144" x2="30" y2="160" stroke="#4a2c08" strokeWidth="1.1"/>
        <line x1="24" y1="147" x2="24" y2="160" stroke="#4a2c08" strokeWidth="0.7" opacity="0.65"/>
        <line x1="36" y1="147" x2="36" y2="160" stroke="#4a2c08" strokeWidth="0.7" opacity="0.65"/>
        {/* Trident annotation */}
        <line x1="30" y1="162" x2="42" y2="162" stroke="#6b3f12" strokeWidth="0.5" opacity="0.3"/>

        {/* Right arm — measurement device */}
        <path d="M146 114 Q162 130 168 150" stroke="#4a2c08" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <rect x="162" y="144" width="14" height="20" rx="1" stroke="#4a2c08" strokeWidth="0.9" fill="rgba(180,130,60,0.15)"/>
        <line x1="165" y1="149" x2="173" y2="149" stroke="#4a2c08" strokeWidth="0.6" opacity="0.55"/>
        <line x1="165" y1="153" x2="173" y2="153" stroke="#4a2c08" strokeWidth="0.6" opacity="0.55"/>
        <line x1="165" y1="157" x2="173" y2="157" stroke="#4a2c08" strokeWidth="0.6" opacity="0.55"/>
        {/* Elbow joint */}
        <circle cx="146" cy="114" r="4" stroke="#4a2c08" strokeWidth="0.7" fill="none" opacity="0.4"/>

        {/* Legs */}
        <line x1="96" y1="142" x2="86" y2="178" stroke="#4a2c08" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="104" y1="142" x2="114" y2="178" stroke="#4a2c08" strokeWidth="1.4" strokeLinecap="round"/>
        {/* Knee joints */}
        <circle cx="90" cy="162" r="3.5" stroke="#4a2c08" strokeWidth="0.6" fill="none" opacity="0.4"/>
        <circle cx="110" cy="162" r="3.5" stroke="#4a2c08" strokeWidth="0.6" fill="none" opacity="0.4"/>
        {/* Feet — wave */}
        <path d="M78 178 Q82 173 86 178 Q90 183 94 178" stroke="#4a2c08" strokeWidth="0.9" fill="none"/>
        <path d="M110 178 Q114 173 118 178 Q122 183 126 178" stroke="#4a2c08" strokeWidth="0.9" fill="none"/>
      </g>

      {/* Water waves — base */}
      <path d="M16 202 Q34 193 52 202 Q70 211 88 202 Q106 193 124 202 Q142 211 160 202 Q178 193 196 202"
        stroke="#4a2c08" strokeWidth="1" fill="none" opacity="0.45"/>
      <path d="M10 212 Q30 204 50 212 Q70 220 90 212 Q110 204 130 212 Q150 220 170 212 Q190 204 210 212"
        stroke="#4a2c08" strokeWidth="0.6" fill="none" opacity="0.22"/>
      {/* Measurement annotation marks */}
      <line x1="16" y1="195" x2="16" y2="218" stroke="#6b3f12" strokeWidth="0.5" opacity="0.25"/>
      <line x1="196" y1="195" x2="196" y2="218" stroke="#6b3f12" strokeWidth="0.5" opacity="0.25"/>
      <line x1="16" y1="202" x2="26" y2="202" stroke="#6b3f12" strokeWidth="0.5" opacity="0.3"/>
    </svg>
  );
}

// ─── Domain SVG — ACS880 "Iron Covenant" — Da Vinci sketch style ─────────────
function IronSVG() {
  return (
    <svg viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 150, height: "auto" }}>
      <defs>
        <style>{`
          @keyframes irSkPulse{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
          .irsk-body{animation:irSkPulse 4s ease-in-out infinite}
        `}</style>
      </defs>
      {/* Construction octagon — da Vinci geometric guide */}
      <polygon points="100,18 146,34 170,78 170,128 146,172 100,188 54,172 30,128 30,78 54,34"
        stroke="#4a2c08" strokeWidth="0.5" strokeDasharray="2 4" fill="none" opacity="0.22"/>
      {/* Proportion guides */}
      <line x1="14" y1="106" x2="186" y2="106" stroke="#6b3f12" strokeWidth="0.4" strokeDasharray="3 4" opacity="0.16"/>
      <line x1="100" y1="14" x2="100" y2="206" stroke="#6b3f12" strokeWidth="0.4" strokeDasharray="3 4" opacity="0.16"/>

      <g className="irsk-body">
        {/* Head — gear construction */}
        <circle cx="100" cy="48" r="24" stroke="#4a2c08" strokeWidth="1.2" fill="rgba(180,130,60,0.1)"/>
        <circle cx="100" cy="48" r="14" stroke="#4a2c08" strokeWidth="0.7" fill="rgba(180,130,60,0.06)" opacity="0.6"/>
        {/* Gear teeth around head */}
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return <line key={i}
            x1={100 + Math.cos(rad) * 25} y1={48 + Math.sin(rad) * 25}
            x2={100 + Math.cos(rad) * 31} y2={48 + Math.sin(rad) * 31}
            stroke="#6b3f12" strokeWidth={i % 2 === 0 ? "1" : "0.6"} opacity="0.45"/>;
        })}
        {/* Cross-hatch on head right side */}
        <line x1="108" y1="36" x2="122" y2="50" stroke="#6b3f12" strokeWidth="0.5" opacity="0.35"/>
        <line x1="112" y1="38" x2="124" y2="54" stroke="#6b3f12" strokeWidth="0.5" opacity="0.28"/>
        <line x1="116" y1="42" x2="124" y2="58" stroke="#6b3f12" strokeWidth="0.5" opacity="0.22"/>
        {/* Angular visor eyes */}
        <path d="M88 44 L95 48 L88 52" stroke="#4a2c08" strokeWidth="1.2" fill="none"/>
        <path d="M112 44 L105 48 L112 52" stroke="#4a2c08" strokeWidth="1.2" fill="none"/>
        <line x1="95" y1="56" x2="105" y2="56" stroke="#4a2c08" strokeWidth="0.8" opacity="0.5"/>

        {/* Neck + I-beam crossbar */}
        <line x1="100" y1="72" x2="100" y2="88" stroke="#4a2c08" strokeWidth="2" strokeLinecap="round"/>
        <line x1="90" y1="80" x2="110" y2="80" stroke="#4a2c08" strokeWidth="1.2" opacity="0.6"/>

        {/* Torso — I-beam structural */}
        <line x1="100" y1="88" x2="100" y2="140" stroke="#4a2c08" strokeWidth="2"/>
        <line x1="88" y1="116" x2="112" y2="116" stroke="#4a2c08" strokeWidth="1.2" opacity="0.55"/>
        <line x1="88" y1="88" x2="112" y2="88" stroke="#4a2c08" strokeWidth="1.2" opacity="0.45"/>
        <line x1="88" y1="140" x2="112" y2="140" stroke="#4a2c08" strokeWidth="1.2" opacity="0.45"/>
        {/* Cross-hatch on torso flanges */}
        {[0,7,14,21,28,34,41,48].map(y => (
          <line key={y} x1="88" y1={90+y} x2="112" y2={90+y} stroke="#6b3f12" strokeWidth="0.4" opacity="0.28"/>
        ))}

        {/* Shoulders — I-beam */}
        <path d="M100 92 L66 102" stroke="#4a2c08" strokeWidth="2" strokeLinecap="round"/>
        <path d="M100 92 L134 102" stroke="#4a2c08" strokeWidth="2" strokeLinecap="round"/>
        <line x1="62" y1="98" x2="62" y2="108" stroke="#4a2c08" strokeWidth="1.5"/>
        <line x1="138" y1="98" x2="138" y2="108" stroke="#4a2c08" strokeWidth="1.5"/>

        {/* Left arm — crane arm + hook */}
        <path d="M66 102 L42 90 L30 126" stroke="#4a2c08" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        {/* Crane hook */}
        <path d="M30 126 Q20 140 30 150 Q40 160 44 148" stroke="#4a2c08" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <circle cx="30" cy="126" r="4" stroke="#4a2c08" strokeWidth="0.8" fill="none" opacity="0.5"/>
        {/* Load line */}
        <line x1="36" y1="148" x2="36" y2="165" stroke="#4a2c08" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4"/>
        {/* Force vector arrow */}
        <line x1="36" y1="162" x2="32" y2="158" stroke="#6b3f12" strokeWidth="0.6" opacity="0.35"/>
        <line x1="36" y1="162" x2="40" y2="158" stroke="#6b3f12" strokeWidth="0.6" opacity="0.35"/>

        {/* Right arm — power terminal */}
        <path d="M134 102 L158 90 L168 118" stroke="#4a2c08" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <circle cx="134" cy="102" r="4" stroke="#4a2c08" strokeWidth="0.7" fill="none" opacity="0.5"/>
        <rect x="162" y="112" width="14" height="22" rx="1" stroke="#4a2c08" strokeWidth="0.9" fill="rgba(180,130,60,0.12)"/>
        <line x1="165" y1="118" x2="173" y2="118" stroke="#4a2c08" strokeWidth="0.6" opacity="0.5"/>
        <line x1="165" y1="122" x2="173" y2="122" stroke="#4a2c08" strokeWidth="0.6" opacity="0.5"/>
        <line x1="165" y1="126" x2="173" y2="126" stroke="#4a2c08" strokeWidth="0.6" opacity="0.5"/>

        {/* Legs — structural double-line */}
        <path d="M96 140 L84 178" stroke="#4a2c08" strokeWidth="2" strokeLinecap="round"/>
        <path d="M104 140 L116 178" stroke="#4a2c08" strokeWidth="2" strokeLinecap="round"/>
        {/* Base plates */}
        <line x1="78" y1="178" x2="92" y2="178" stroke="#4a2c08" strokeWidth="2"/>
        <line x1="112" y1="178" x2="122" y2="178" stroke="#4a2c08" strokeWidth="2"/>
        {/* Knee bolts */}
        <circle cx="87" cy="161" r="3" stroke="#4a2c08" strokeWidth="0.7" fill="none" opacity="0.45"/>
        <circle cx="113" cy="161" r="3" stroke="#4a2c08" strokeWidth="0.7" fill="none" opacity="0.45"/>
      </g>

      {/* Ground lines with annotation */}
      <line x1="24" y1="194" x2="176" y2="194" stroke="#4a2c08" strokeWidth="1.2" opacity="0.45"/>
      <line x1="14" y1="200" x2="186" y2="200" stroke="#4a2c08" strokeWidth="0.5" opacity="0.2"/>
      {/* Structural annotation marks */}
      <line x1="24" y1="188" x2="24" y2="200" stroke="#6b3f12" strokeWidth="0.5" opacity="0.3"/>
      <line x1="176" y1="188" x2="176" y2="200" stroke="#6b3f12" strokeWidth="0.5" opacity="0.3"/>
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
      subtitle: lang === "id" ? "Kodeks Sang Penjaga Air" : "The Waterkeeper's Codex",
      tagline: lang === "id"
        ? "Air tidak pernah berdebat — ia berkavitasi, ia memukul pipa, ia menemukan katup yang kau lupakan. Pegang setpoint seperti sumpah. Atur barisan multipump bagai estafet pelari. Jadikan tekanan janji yang ditepati di setiap pipa."
        : "Water does not argue — it cavitates, it hammers, it finds the valve you forgot. Hold the setpoint as a vow. Marshal the multipump line like a relay of runners. Make pressure a promise kept in every pipe.",
      color: "#4a9eff",
      colorBg: "rgba(74,158,255,0.08)",
      colorBorder: "rgba(74,158,255,0.3)",
      Icon: AquaSVG,
      tag: lang === "id" ? "Daulat Air" : "Dominion of Water",
    },
    {
      key: "ACS880" as const,
      codename: "IRON COVENANT",
      subtitle: lang === "id" ? "Grimoir Sang Penguasa Crane" : "The Crane Master's Grimoire",
      tagline: lang === "id"
        ? "Gravitasi tidak pernah kalah — ia hanya menunggu rem terbuka terlalu dini. Buktikan torsi sebelum baja meninggalkan tanah. Kendalikan DTC seperti napas yang ditahan. Setiap angkatan adalah perjanjian dengan beban — ditandatangani dalam parameter, ditepati dalam milimeter."
        : "Gravity has never lost — it only waits for a brake that opens too soon. Prove the torque before the steel leaves the ground. Command DTC like a held breath. Every lift is a treaty with the load — signed in parameters, honored in millimeters.",
      color: "var(--accent)",
      colorBg: "rgba(228,199,89,0.08)",
      colorBorder: "rgba(228,199,89,0.3)",
      Icon: IronSVG,
      tag: lang === "id" ? "Daulat Besi" : "Dominion of Iron",
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
        <style>{`
          @keyframes vsdRise {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .vsd-rise { animation: vsdRise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
        `}</style>

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
          <div className="vsd-rise" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--accent)", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.8 }}>
            PTTS PRAXIS · ABB VSD · COMMISSIONING DOCTRINE
          </div>

          <div className="vsd-rise" style={{ minHeight: 96, display: "flex", alignItems: "center", justifyContent: "center", animationDelay: "0.15s" }}>
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
          <div className="vsd-rise" style={{ display: "flex", gap: 8, animationDelay: "0.3s" }}>
            {quotes.map((_, i) => (
              <div key={i} style={{
                width: i === quoteIdx ? 20 : 6, height: 6, borderRadius: 3,
                background: i === quoteIdx ? "var(--accent)" : "rgba(255,255,255,0.12)",
                transition: "all 0.4s ease",
              }}/>
            ))}
          </div>

          <div className="vsd-rise" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", animationDelay: "0.45s" }}>
            <button
              onClick={() => setPhase("select")}
              style={{
                padding: "14px 32px", borderRadius: 12, cursor: "pointer",
                background: "var(--accent)", color: "#000",
                fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 800,
                letterSpacing: "0.12em", textTransform: "uppercase", border: "none",
              }}
            >
              {lang === "id" ? "MULAI RITUS COMMISSIONING →" : "BEGIN THE COMMISSIONING RITE →"}
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
              {lang === "id" ? "Lewati prolog" : "Skip the prologue"}
            </button>
          </div>

          <Link className="vsd-rise" href="/tutorials" style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", textDecoration: "none", opacity: 0.55, animationDelay: "0.6s" }}>
            ← {lang === "id" ? "Kembali ke Panduan Pengujian" : "Back to Testing Tutorials"}
          </Link>
        </div>
      </div>
    );
  }

  // ── Select phase ─────────────────────────────────────────────────────────────
  if (phase === "select") {
    const isDragging = dragStartX !== null;
    return (
      <div style={{
        minHeight: "100svh", display: "flex", flexDirection: "column",
        alignItems: "center", padding: "44px 0 52px",
        position: "relative", overflow: "hidden",
      }}>
        <style>{`
          @keyframes sealPulse { 0%,100%{box-shadow:0 2px 8px rgba(139,105,20,0.5),inset 0 1px 0 rgba(255,255,255,0.25)} 50%{box-shadow:0 2px 16px rgba(201,168,76,0.8),inset 0 1px 0 rgba(255,255,255,0.35)} }
          @keyframes parchRise { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
          .parch-rise { animation: parchRise 0.75s cubic-bezier(0.22,1,0.36,1) both; }
        `}</style>

        {/* Faint Roman column lines on background */}
        <svg style={{ position:"fixed", inset:0, width:"100%", height:"100%", opacity:0.025, pointerEvents:"none", zIndex:0 }}
          viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          <line x1="80" y1="0" x2="80" y2="600" stroke="#c9a84c" strokeWidth="3"/>
          <line x1="720" y1="0" x2="720" y2="600" stroke="#c9a84c" strokeWidth="3"/>
          <rect x="70" y="0" width="20" height="16" fill="#c9a84c"/>
          <rect x="710" y="0" width="20" height="16" fill="#c9a84c"/>
          <rect x="70" y="584" width="20" height="16" fill="#c9a84c"/>
          <rect x="710" y="584" width="20" height="16" fill="#c9a84c"/>
          {Array.from({length:18}).map((_,i)=>(
            <line key={i} x1="0" y1={i*34} x2="800" y2={i*34} stroke="#c9a84c" strokeWidth="0.5"/>
          ))}
        </svg>

        {/* Header */}
        <div className="parch-rise" style={{ textAlign:"center", marginBottom:36, zIndex:1, padding:"0 24px" }}>
          <div style={{ fontSize:8, fontFamily:"var(--font-mono)", color:"#c9a84c", letterSpacing:"0.38em", textTransform:"uppercase", marginBottom:10, opacity:0.7 }}>
            ✦ CODEX ELECTORUM · ELIGERE DOMINIUM ✦
          </div>
          <h1 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(22px,5.5vw,36px)", color:"var(--fg)", margin:0, lineHeight:1.1, letterSpacing:"-0.02em" }}>
            {lang === "id" ? "Dua Elemen. Satu Sumpah." : "Two Elements. One Oath."}
          </h1>
          <p style={{ fontSize:12, color:"var(--muted)", marginTop:10, fontStyle:"italic" }}>
            {lang === "id"
              ? "Geser kiri atau kanan — domain yang kau pilih akan memilihmu kembali"
              : "Swipe left or right — the domain you choose will choose you back"}
          </p>
        </div>

        {/* ═══ SLIDING CAROUSEL ═══ */}
        <div
          className="parch-rise"
          style={{ width:"100%", maxWidth:400, overflow:"hidden", zIndex:1, animationDelay:"0.12s", cursor: isDragging ? "grabbing" : "grab" }}
          onMouseLeave={handleDragEnd}
          onMouseMove={e => { if (dragStartX !== null) setDragOffset(e.clientX - dragStartX); }}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onTouchMove={e => { if (dragStartX !== null) setDragOffset(e.touches[0].clientX - dragStartX); }}
        >
          {/* Sliding track — 200% wide, each card 50% = 100% of viewport */}
          <div style={{
            display:"flex",
            width:"200%",
            transform:`translateX(calc(${-activeDomain * 50}% + ${dragOffset}px))`,
            transition: isDragging ? "none" : "transform 0.42s cubic-bezier(0.34,1.56,0.64,1)",
            willChange:"transform",
            userSelect:"none",
          }}>
            {domains.map((d, idx) => {
              const isActive = activeDomain === idx;
              return (
                <div key={d.key}
                  style={{ width:"50%", padding:"0 12px", boxSizing:"border-box" }}
                  onMouseDown={e => setDragStartX(e.clientX)}
                  onTouchStart={e => setDragStartX(e.touches[0].clientX)}
                  onClick={() => { if (Math.abs(dragOffset) < 8) switchDomain(idx as 0|1); }}
                >
                  {/* ── ROMAN / DA VINCI CARD ── */}
                  <div style={{
                    position:"relative",
                    borderRadius: 3,
                    background: isActive
                      ? "linear-gradient(168deg,#f7ead4 0%,#edd9a4 42%,#dcc07a 100%)"
                      : "linear-gradient(168deg,#2a2010 0%,#1e1808 100%)",
                    border:`2px solid ${isActive ? "#8b6914" : "rgba(139,105,20,0.22)"}`,
                    boxShadow: isActive
                      ? "0 0 0 1px rgba(201,168,76,0.6), 0 12px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)"
                      : "0 4px 20px rgba(0,0,0,0.5)",
                    padding:"26px 22px 22px",
                    minHeight:488,
                    display:"flex", flexDirection:"column", gap:14,
                    transition: isDragging ? "none" : "box-shadow 0.4s ease",
                    overflow:"hidden",
                  }}>

                    {/* ── Corner ornaments via SVG overlay ── */}
                    <svg style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", pointerEvents:"none" }}
                      viewBox="0 0 376 488" preserveAspectRatio="none">
                      {/* Top-left corner */}
                      <path d="M7 7 L7 38 M7 7 L38 7" stroke={isActive ? "#7a5a10" : "rgba(139,105,20,0.3)"} strokeWidth="1.8" fill="none"/>
                      <path d="M13 13 L13 28 M13 13 L28 13" stroke={isActive ? "#c9a84c" : "rgba(201,168,76,0.18)"} strokeWidth="0.8" fill="none"/>
                      <circle cx="7" cy="7" r="2.5" fill={isActive ? "#8b6914" : "rgba(139,105,20,0.25)"}/>
                      {/* Top-right corner */}
                      <path d="M369 7 L369 38 M369 7 L338 7" stroke={isActive ? "#7a5a10" : "rgba(139,105,20,0.3)"} strokeWidth="1.8" fill="none"/>
                      <path d="M363 13 L363 28 M363 13 L348 13" stroke={isActive ? "#c9a84c" : "rgba(201,168,76,0.18)"} strokeWidth="0.8" fill="none"/>
                      <circle cx="369" cy="7" r="2.5" fill={isActive ? "#8b6914" : "rgba(139,105,20,0.25)"}/>
                      {/* Bottom-left corner */}
                      <path d="M7 481 L7 450 M7 481 L38 481" stroke={isActive ? "#7a5a10" : "rgba(139,105,20,0.3)"} strokeWidth="1.8" fill="none"/>
                      <path d="M13 475 L13 460 M13 475 L28 475" stroke={isActive ? "#c9a84c" : "rgba(201,168,76,0.18)"} strokeWidth="0.8" fill="none"/>
                      <circle cx="7" cy="481" r="2.5" fill={isActive ? "#8b6914" : "rgba(139,105,20,0.25)"}/>
                      {/* Bottom-right corner */}
                      <path d="M369 481 L369 450 M369 481 L338 481" stroke={isActive ? "#7a5a10" : "rgba(139,105,20,0.3)"} strokeWidth="1.8" fill="none"/>
                      <path d="M363 475 L363 460 M363 475 L348 475" stroke={isActive ? "#c9a84c" : "rgba(201,168,76,0.18)"} strokeWidth="0.8" fill="none"/>
                      <circle cx="369" cy="481" r="2.5" fill={isActive ? "#8b6914" : "rgba(139,105,20,0.25)"}/>
                      {/* Top arch divider */}
                      <path d="M130 0 Q188 22 246 0" stroke={isActive ? "rgba(139,105,20,0.5)" : "rgba(139,105,20,0.15)"} strokeWidth="1" fill="none"/>
                      {/* Horizontal rule pair */}
                      <line x1="18" y1="196" x2="358" y2="196" stroke={isActive ? "rgba(122,90,16,0.4)" : "rgba(139,105,20,0.12)"} strokeWidth="0.9"/>
                      <line x1="18" y1="199" x2="358" y2="199" stroke={isActive ? "rgba(201,168,76,0.22)" : "rgba(201,168,76,0.06)"} strokeWidth="0.5"/>
                      {/* Column flutes — left & right decorative */}
                      <line x1="22" y1="44" x2="22" y2="452" stroke={isActive ? "rgba(139,105,20,0.12)" : "rgba(139,105,20,0.05)"} strokeWidth="0.7"/>
                      <line x1="354" y1="44" x2="354" y2="452" stroke={isActive ? "rgba(139,105,20,0.12)" : "rgba(139,105,20,0.05)"} strokeWidth="0.7"/>
                    </svg>

                    {/* Top row: domain tag + wax seal */}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", position:"relative", zIndex:1 }}>
                      <span style={{
                        fontSize:7.5, fontFamily:"var(--font-mono)", fontWeight:700, letterSpacing:"0.18em",
                        padding:"3px 8px", borderRadius:2, textTransform:"uppercase",
                        background: isActive ? "rgba(122,90,16,0.12)" : "rgba(255,255,255,0.04)",
                        color: isActive ? "#5c3a06" : "rgba(201,168,76,0.4)",
                        border:`0.5px solid ${isActive ? "rgba(122,90,16,0.45)" : "rgba(201,168,76,0.16)"}`,
                      }}>{d.tag}</span>
                      {/* Wax seal */}
                      <div style={{
                        width:30, height:30, borderRadius:"50%",
                        background: isActive
                          ? "radial-gradient(circle at 38% 36%, #e2c060, #8b6914 70%)"
                          : "radial-gradient(circle at 38% 36%, rgba(201,168,76,0.2), rgba(139,105,20,0.08))",
                        border:`1.5px solid ${isActive ? "#7a5a10" : "rgba(139,105,20,0.2)"}`,
                        boxShadow: isActive ? undefined : "none",
                        animation: isActive ? "sealPulse 2.8s ease-in-out infinite" : "none",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:11, color: isActive ? "#2c1400" : "rgba(201,168,76,0.3)",
                        fontWeight:900, fontFamily:"var(--font-mono)",
                      }}>{idx === 0 ? "Ⅰ" : "Ⅱ"}</div>
                    </div>

                    {/* Da Vinci SVG illustration */}
                    <div style={{ display:"flex", justifyContent:"center", padding:"2px 0", position:"relative", zIndex:1 }}>
                      <d.Icon/>
                    </div>

                    {/* Text block */}
                    <div style={{ display:"flex", flexDirection:"column", gap:6, position:"relative", zIndex:1 }}>
                      <div style={{
                        fontFamily:"var(--font-mono)", fontSize:7.5, letterSpacing:"0.24em", textTransform:"uppercase",
                        color: isActive ? "#6b4008" : "rgba(201,168,76,0.3)",
                      }}>{d.key} · CODEX {idx === 0 ? "I" : "II"}</div>
                      <h2 style={{
                        fontFamily:"var(--font-display)", fontSize:21, margin:0,
                        letterSpacing:"-0.01em", lineHeight:1.1,
                        color: isActive ? "#2c1a0e" : "rgba(201,168,76,0.45)",
                      }}>{d.codename}</h2>
                      <div style={{
                        fontFamily:"var(--font-body)", fontSize:11, fontStyle:"italic",
                        color: isActive ? "#5c3d1e" : "rgba(201,168,76,0.28)",
                      }}>{d.subtitle}</div>
                      <p style={{
                        fontSize:12, lineHeight:1.6, margin:0,
                        color: isActive ? "#3d2b1f" : "rgba(201,168,76,0.22)",
                        display:"-webkit-box", WebkitLineClamp:4, WebkitBoxOrient:"vertical", overflow:"hidden",
                      }}>{d.tagline}</p>
                    </div>

                    {/* Footer */}
                    <div style={{
                      marginTop:"auto", paddingTop:12, position:"relative", zIndex:1,
                      borderTop:`1px solid ${isActive ? "rgba(122,90,16,0.35)" : "rgba(139,105,20,0.1)"}`,
                      display:"flex", justifyContent:"space-between", alignItems:"center",
                    }}>
                      <span style={{ fontSize:10, fontFamily:"var(--font-mono)", color: isActive ? "#6b4c30" : "rgba(201,168,76,0.25)" }}>
                        {challengesByDrive(d.key).length} {lang === "id" ? "tantangan" : "challenges"}
                      </span>
                      {isActive && (
                        <span style={{ fontSize:9, fontFamily:"var(--font-mono)", fontWeight:700, color:"#7a5a10", letterSpacing:"0.12em" }}>
                          ELECTUS ✦
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="parch-rise" style={{ display:"flex", gap:12, marginTop:18, zIndex:1, alignItems:"center", animationDelay:"0.22s" }}>
          {domains.map((_, idx) => (
            <button key={idx} onClick={() => switchDomain(idx as 0|1)} style={{
              width: activeDomain === idx ? 22 : 7,
              height: 7, borderRadius: 4,
              background: activeDomain === idx ? "#c9a84c" : "rgba(201,168,76,0.22)",
              border: "none", cursor: "pointer", padding: 0,
              transition: "all 0.32s ease",
              boxShadow: activeDomain === idx ? "0 0 8px rgba(201,168,76,0.5)" : "none",
            }}/>
          ))}
        </div>
        <div className="parch-rise" style={{ fontSize:9, fontFamily:"var(--font-mono)", color:"rgba(201,168,76,0.3)", letterSpacing:"0.16em", marginTop:6, zIndex:1, animationDelay:"0.28s" }}>
          ← SWIPE →
        </div>

        {/* CTA */}
        <div className="parch-rise" style={{ marginTop:28, zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:12, animationDelay:"0.34s" }}>
          <button
            onClick={() => setPhase("challenges")}
            style={{
              padding:"13px 34px", borderRadius:3, cursor:"pointer",
              background:"linear-gradient(155deg,#d4a832,#8b6914)",
              color:"#1a0e00",
              fontFamily:"var(--font-mono)", fontSize:11, fontWeight:800,
              letterSpacing:"0.15em", textTransform:"uppercase", border:"none",
              boxShadow:"0 4px 22px rgba(139,105,20,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            {lang === "id"
              ? `MASUK KE ${activeDomainData.codename} →`
              : `ENTER ${activeDomainData.codename} →`}
          </button>
          <button
            onClick={() => setPhase("intro")}
            style={{ background:"none", border:"none", cursor:"pointer", fontSize:10, fontFamily:"var(--font-mono)", color:"rgba(201,168,76,0.38)", letterSpacing:"0.08em" }}
          >
            ← {lang === "id" ? "Kembali ke prolog" : "Return to the prologue"}
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
