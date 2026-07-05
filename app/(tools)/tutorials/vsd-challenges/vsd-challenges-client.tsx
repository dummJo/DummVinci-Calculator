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

// ─── Domain SVG — ACQ580 "Aqua Protocol" — Yu-Gi-Oh water guardian ──────────
function AquaSVG() {
  return (
    <svg viewBox="0 0 160 220" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 148, height: "auto" }}>
      <defs>
        <radialGradient id="aqYgAura" cx="50%" cy="72%" r="50%">
          <stop offset="0%" stopColor="#00bfff" stopOpacity="0.45"/>
          <stop offset="100%" stopColor="#00bfff" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="aqYgGem" cx="38%" cy="34%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9"/>
          <stop offset="45%" stopColor="#00d4ff" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#0055aa" stopOpacity="1"/>
        </radialGradient>
        <style>{`
          @keyframes aqYgFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
          @keyframes aqYgPulse{0%,100%{opacity:0.75}50%{opacity:1}}
          .aqyg-char{animation:aqYgFloat 4s ease-in-out infinite}
          .aqyg-glow{animation:aqYgPulse 2s ease-in-out infinite}
        `}</style>
      </defs>
      <ellipse cx="80" cy="174" rx="72" ry="40" fill="url(#aqYgAura)"/>
      <path d="M12 194 Q80 176 148 194 Q80 212 12 194 Z" fill="#0d4a7a" opacity="0.65"/>
      <path d="M22 194 Q80 180 138 194" stroke="#4ab8e8" strokeWidth="1.2" fill="none" opacity="0.6"/>
      <path d="M8 202 Q80 188 152 202" stroke="#2a90c0" strokeWidth="0.7" fill="none" opacity="0.35"/>

      <g className="aqyg-char">
        {/* Robe / lower body */}
        <path d="M56 98 Q38 140 36 180 Q52 198 80 200 Q108 198 124 180 Q122 140 104 98 Z"
          fill="#0a4a80" stroke="#2a7ab8" strokeWidth="1.5"/>
        <path d="M80 100 L80 196" stroke="#3ab0e0" strokeWidth="1.5" opacity="0.4"/>
        <path d="M42 148 Q60 138 78 148 Q96 158 114 148" stroke="#4ab8e8" strokeWidth="1" fill="none" opacity="0.7"/>
        <path d="M39 164 Q60 154 80 164 Q100 174 121 164" stroke="#4ab8e8" strokeWidth="0.9" fill="none" opacity="0.6"/>
        <path d="M40 178 Q62 168 80 178 Q98 188 120 178" stroke="#3ab0e0" strokeWidth="0.8" fill="none" opacity="0.5"/>
        <path d="M76 115 Q80 111 84 115 L86 130 Q80 133 74 130 Z" fill="#4ab8e8" opacity="0.35"/>
        {/* Chest armor */}
        <path d="M52 84 Q80 72 108 84 L113 125 Q80 133 47 125 Z"
          fill="#1460a8" stroke="#3a9edc" strokeWidth="1.6"/>
        <path d="M58 88 Q80 81 102 88" stroke="#7acfe8" strokeWidth="0.9" opacity="0.6"/>
        <path d="M55 114 Q80 110 105 114" stroke="#7acfe8" strokeWidth="0.8" opacity="0.5"/>
        {/* Chest gem */}
        <ellipse cx="80" cy="103" rx="9" ry="11" fill="url(#aqYgGem)" className="aqyg-glow"/>
        <path d="M71 103 L80 92 L89 103 L80 114 Z" stroke="#89ecff" strokeWidth="0.8" fill="none" opacity="0.7"/>
        <ellipse cx="77" cy="99" rx="3" ry="4" fill="white" opacity="0.45"/>
        {/* Pauldrons */}
        <path d="M50 86 Q30 80 24 95 Q22 110 44 106 Q52 102 52 94 Z"
          fill="#1460a8" stroke="#3a9edc" strokeWidth="1.3"/>
        <path d="M110 86 Q130 80 136 95 Q138 110 116 106 Q108 102 108 94 Z"
          fill="#1460a8" stroke="#3a9edc" strokeWidth="1.3"/>
        <circle cx="32" cy="97" r="3.5" fill="#00aaff" stroke="#4ab8e8" strokeWidth="0.8" className="aqyg-glow"/>
        <circle cx="128" cy="97" r="3.5" fill="#00aaff" stroke="#4ab8e8" strokeWidth="0.8" className="aqyg-glow"/>
        {/* Left arm */}
        <path d="M46 96 Q26 112 18 136" stroke="#1460a8" strokeWidth="11" strokeLinecap="round" fill="none"/>
        <path d="M46 96 Q26 112 18 136" stroke="#3a9edc" strokeWidth="1.4" fill="none"/>
        <circle cx="18" cy="138" r="5.5" fill="#1a70b8" stroke="#3a9edc" strokeWidth="1"/>
        {/* TRIDENT */}
        <line x1="10" y1="162" x2="10" y2="46" stroke="#3ab0e0" strokeWidth="2.8" strokeLinecap="round"/>
        <line x1="6" y1="58" x2="10" y2="44" stroke="#00d4ff" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="10" y1="44" x2="10" y2="26" stroke="#00d4ff" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="14" y1="58" x2="10" y2="44" stroke="#00d4ff" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="2" y1="42" x2="10" y2="26" stroke="#00d4ff" strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="18" y1="42" x2="10" y2="26" stroke="#00d4ff" strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx="2" cy="41" r="2.5" fill="#00ffff" opacity="0.9" className="aqyg-glow"/>
        <circle cx="10" cy="25" r="2.5" fill="#00ffff" opacity="0.9" className="aqyg-glow"/>
        <circle cx="18" cy="41" r="2.5" fill="#00ffff" opacity="0.9" className="aqyg-glow"/>
        <line x1="4" y1="60" x2="16" y2="60" stroke="#00a8cc" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="6" y1="98" x2="14" y2="98" stroke="#3ab0e0" strokeWidth="1" opacity="0.6"/>
        <line x1="6" y1="112" x2="14" y2="112" stroke="#3ab0e0" strokeWidth="1" opacity="0.6"/>
        <line x1="6" y1="126" x2="14" y2="126" stroke="#3ab0e0" strokeWidth="1" opacity="0.6"/>
        {/* Right arm — casting magic */}
        <path d="M114 96 Q134 90 142 72" stroke="#1460a8" strokeWidth="11" strokeLinecap="round" fill="none"/>
        <path d="M114 96 Q134 90 142 72" stroke="#3a9edc" strokeWidth="1.4" fill="none"/>
        <circle cx="143" cy="70" r="5.5" fill="#1a70b8" stroke="#3a9edc" strokeWidth="1"/>
        {/* Magic orb */}
        <circle cx="150" cy="58" r="13" fill="#002a55" stroke="#3a9edc" strokeWidth="1.3"/>
        <circle cx="150" cy="58" r="9" fill="#0080cc" opacity="0.75" className="aqyg-glow"/>
        <circle cx="150" cy="58" r="5" fill="#00d4ff" opacity="0.9" className="aqyg-glow"/>
        <circle cx="147" cy="55" r="2" fill="white" opacity="0.8"/>
        <path d="M158 50 Q164 42 160 34" stroke="#00d4ff" strokeWidth="1" fill="none" opacity="0.65" strokeDasharray="2 2"/>
        <path d="M160 55 Q170 50 172 42" stroke="#89d4f5" strokeWidth="1" fill="none" opacity="0.5" strokeDasharray="2 2"/>
        <path d="M154 46 Q154 38 150 30" stroke="#00ffff" strokeWidth="1" fill="none" opacity="0.55" strokeDasharray="2 2"/>
        {/* Neck */}
        <rect x="68" y="64" width="24" height="12" rx="5" fill="#1a70b8" stroke="#3a9edc" strokeWidth="1"/>
        {/* Head */}
        <ellipse cx="80" cy="50" rx="23" ry="25" fill="#d4a070"/>
        <ellipse cx="80" cy="50" rx="23" ry="25" stroke="#b07848" strokeWidth="1.2" fill="none"/>
        <path d="M57 50 Q57 68 80 74 Q103 68 103 50" fill="#c09060" opacity="0.4"/>
        {/* Eyes */}
        <ellipse cx="71" cy="45" rx="5.5" ry="4.5" fill="#004cb8"/>
        <ellipse cx="89" cy="45" rx="5.5" ry="4.5" fill="#004cb8"/>
        <ellipse cx="71" cy="45" rx="3.2" ry="2.8" fill="#00aaff" className="aqyg-glow"/>
        <ellipse cx="89" cy="45" rx="3.2" ry="2.8" fill="#00aaff" className="aqyg-glow"/>
        <circle cx="69.5" cy="44" r="1.2" fill="white" opacity="0.85"/>
        <circle cx="87.5" cy="44" r="1.2" fill="white" opacity="0.85"/>
        <path d="M65 39 Q70 36 76 38" stroke="#4a2800" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        <path d="M84 38 Q90 36 95 39" stroke="#4a2800" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        <path d="M78 52 Q80 57 82 52" stroke="#b07848" strokeWidth="0.9" fill="none"/>
        <path d="M72 62 Q80 66 88 62" stroke="#8a5030" strokeWidth="1.3" fill="none"/>
        {/* Hair */}
        <path d="M57 40 Q54 20 72 12 Q80 8 88 12 Q106 20 103 40" fill="#18286a" stroke="#243888" strokeWidth="1"/>
        <path d="M57 40 Q48 62 50 84 Q48 102 52 118" stroke="#18286a" strokeWidth="13" strokeLinecap="round" fill="none"/>
        <path d="M57 40 Q48 62 50 84 Q48 102 52 118" stroke="#243888" strokeWidth="1.4" fill="none"/>
        <path d="M103 40 Q112 62 110 84 Q112 102 108 118" stroke="#18286a" strokeWidth="13" strokeLinecap="round" fill="none"/>
        <path d="M103 40 Q112 62 110 84 Q112 102 108 118" stroke="#243888" strokeWidth="1.4" fill="none"/>
        {/* Crown */}
        <path d="M60 27 L64 14 L68 24 L80 8 L92 24 L96 14 L100 27" stroke="#00ccff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="80" cy="7" r="4.5" fill="#00ffff" stroke="#89ecff" strokeWidth="1.2" className="aqyg-glow"/>
        <circle cx="64" cy="13" r="2.8" fill="#89d4f5" stroke="#00ccff" strokeWidth="0.8"/>
        <circle cx="96" cy="13" r="2.8" fill="#89d4f5" stroke="#00ccff" strokeWidth="0.8"/>
        <path d="M60 27 Q80 22 100 27" stroke="#00a8cc" strokeWidth="1.6" fill="none"/>
      </g>
      {/* Water splash fx */}
      <path d="M5 186 Q18 174 14 162" stroke="#4ab8e8" strokeWidth="1.5" fill="none" opacity="0.55"/>
      <circle cx="5" cy="172" r="1.5" fill="#00d4ff" opacity="0.5"/>
      <path d="M155 186 Q142 174 146 162" stroke="#4ab8e8" strokeWidth="1.5" fill="none" opacity="0.55"/>
      <circle cx="155" cy="172" r="1.5" fill="#00d4ff" opacity="0.5"/>
      <circle cx="22" cy="145" r="1" fill="#00d4ff" opacity="0.4"/>
      <circle cx="145" cy="140" r="1" fill="#00d4ff" opacity="0.4"/>
    </svg>
  );
}

// ─── Domain SVG — ACS880 "Iron Covenant" — Yu-Gi-Oh iron titan ──────────────
function IronSVG() {
  return (
    <svg viewBox="0 0 160 220" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 148, height: "auto" }}>
      <defs>
        <radialGradient id="irYgAura" cx="50%" cy="65%" r="52%">
          <stop offset="0%" stopColor="#ffaa00" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#ffaa00" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="irYgCore" cx="38%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9"/>
          <stop offset="40%" stopColor="#ffdd44" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#cc6600" stopOpacity="1"/>
        </radialGradient>
        <style>{`
          @keyframes irYgRise{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
          @keyframes irYgFlare{0%,100%{opacity:0.7}50%{opacity:1}}
          .iryg-char{animation:irYgRise 5s ease-in-out infinite}
          .iryg-core{animation:irYgFlare 1.8s ease-in-out infinite}
        `}</style>
      </defs>
      <ellipse cx="80" cy="188" rx="65" ry="28" fill="url(#irYgAura)"/>
      <rect x="18" y="202" width="124" height="5" rx="2.5" fill="#3a2a04" stroke="#9a7828" strokeWidth="1"/>
      <rect x="12" y="206" width="136" height="3" rx="1.5" fill="#2a1e02" opacity="0.6"/>

      <g className="iryg-char">
        {/* Legs */}
        <path d="M60 152 L50 178 L38 183 L36 198 L58 200 L66 183 L70 156 Z"
          fill="#222234" stroke="#545470" strokeWidth="1.3"/>
        <ellipse cx="54" cy="176" rx="9" ry="5.5" fill="#383850" stroke="#707090" strokeWidth="1"/>
        <path d="M34 196 L62 196 L64 204 L32 204 Z" fill="#303044" stroke="#545470" strokeWidth="1"/>
        <path d="M100 152 L110 178 L122 183 L124 198 L102 200 L94 183 L90 156 Z"
          fill="#222234" stroke="#545470" strokeWidth="1.3"/>
        <ellipse cx="106" cy="176" rx="9" ry="5.5" fill="#383850" stroke="#707090" strokeWidth="1"/>
        <path d="M126 196 L98 196 L96 204 L128 204 Z" fill="#303044" stroke="#545470" strokeWidth="1"/>
        {/* Torso */}
        <path d="M44 92 Q80 80 116 92 L122 152 Q80 163 38 152 Z"
          fill="#222234" stroke="#4a4a68" strokeWidth="1.8"/>
        <path d="M50 98 Q80 89 110 98" stroke="#686890" strokeWidth="0.8" opacity="0.7"/>
        <path d="M46 120 Q80 113 114 120" stroke="#686890" strokeWidth="0.8" opacity="0.6"/>
        <path d="M44 142 Q80 136 116 142" stroke="#686890" strokeWidth="0.7" opacity="0.5"/>
        <line x1="80" y1="93" x2="80" y2="155" stroke="#4a4a68" strokeWidth="1" opacity="0.55"/>
        <path d="M42 144 Q80 138 118 144 L120 155 Q80 163 40 155 Z" fill="#303048" stroke="#565678" strokeWidth="1.2"/>
        <circle cx="68" cy="150" r="3" fill="#ffcc00" opacity="0.9" className="iryg-core"/>
        <circle cx="80" cy="150" r="3" fill="#ffcc00" opacity="0.9" className="iryg-core"/>
        <circle cx="92" cy="150" r="3" fill="#ffcc00" opacity="0.9" className="iryg-core"/>
        {/* Power core */}
        <polygon points="80,90 90,104 86,120 74,120 70,104" stroke="#ffcc00" strokeWidth="1.6" fill="#12121e"/>
        <polygon points="80,90 90,104 86,120 74,120 70,104" fill="url(#irYgCore)" opacity="0.75" className="iryg-core"/>
        <circle cx="80" cy="105" r="8" fill="#ffaa00" opacity="0.75" className="iryg-core"/>
        <circle cx="80" cy="105" r="4.5" fill="#ffee88" opacity="0.9" className="iryg-core"/>
        <circle cx="78.5" cy="103" r="1.8" fill="white" opacity="0.9"/>
        {[[-16,-6],[-18,0],[-16,6],[16,-6],[18,0],[16,6],[0,-18],[0,18]].map(([dx,dy],i) => (
          <line key={i} x1={80+dx*0.48} y1={105+dy*0.48} x2={80+dx} y2={105+dy}
            stroke="#ffcc00" strokeWidth="1.1" opacity="0.5" className="iryg-core"/>
        ))}
        {/* Pauldrons */}
        <path d="M42 92 Q16 84 10 102 Q8 122 34 118 Q44 114 44 104 Z"
          fill="#2c2c42" stroke="#565678" strokeWidth="1.6"/>
        <path d="M42 92 Q24 86 16 100 Q12 112 30 110" stroke="#747494" strokeWidth="0.8" fill="none" opacity="0.7"/>
        <circle cx="22" cy="103" r="4.5" fill="#ffaa00" opacity="0.8" stroke="#ffcc00" strokeWidth="0.8" className="iryg-core"/>
        <path d="M118 92 Q144 84 150 102 Q152 122 126 118 Q116 114 116 104 Z"
          fill="#2c2c42" stroke="#565678" strokeWidth="1.6"/>
        <path d="M118 92 Q136 86 144 100 Q148 112 130 110" stroke="#747494" strokeWidth="0.8" fill="none" opacity="0.7"/>
        <circle cx="138" cy="103" r="4.5" fill="#ffaa00" opacity="0.8" stroke="#ffcc00" strokeWidth="0.8" className="iryg-core"/>
        {/* Left arm — crane */}
        <path d="M40 102 Q16 114 8 138" stroke="#222234" strokeWidth="13" strokeLinecap="round" fill="none"/>
        <path d="M40 102 Q16 114 8 138" stroke="#4a4a68" strokeWidth="1.4" fill="none"/>
        <circle cx="24" cy="118" r="5.5" fill="#303048" stroke="#6a6a8a" strokeWidth="1.2"/>
        <path d="M8 138 Q4 154 6 168" stroke="#222234" strokeWidth="11" strokeLinecap="round" fill="none"/>
        <path d="M8 138 Q4 154 6 168" stroke="#4a4a68" strokeWidth="1.4" fill="none"/>
        <line x1="7" y1="165" x2="7" y2="108" stroke="#8a8aaa" strokeWidth="2"/>
        <line x1="10" y1="165" x2="10" y2="112" stroke="#6a6a7a" strokeWidth="0.8" opacity="0.5"/>
        {/* CRANE HOOK — gold */}
        <path d="M7 165 Q-5 180 4 190 Q14 198 18 186" stroke="#ffcc00" strokeWidth="3.2" fill="none" strokeLinecap="round"/>
        <circle cx="7" cy="165" r="4" fill="#3a3a52" stroke="#8a8aaa" strokeWidth="1.2"/>
        <path d="M7 165 Q-5 180 4 190 Q14 198 18 186" stroke="white" strokeWidth="0.8" fill="none" opacity="0.35"/>
        <circle cx="13" cy="186" r="2" fill="#ffee88" opacity="0.8"/>
        {/* Right arm — power gauntlet */}
        <path d="M120 102 Q144 114 152 138" stroke="#222234" strokeWidth="13" strokeLinecap="round" fill="none"/>
        <path d="M120 102 Q144 114 152 138" stroke="#4a4a68" strokeWidth="1.4" fill="none"/>
        <circle cx="136" cy="118" r="5.5" fill="#303048" stroke="#6a6a8a" strokeWidth="1.2"/>
        <path d="M152 138 Q160 152 156 166 Q148 172 140 165 Q134 152 140 140 Z"
          fill="#2c2c42" stroke="#6a6a88" strokeWidth="1.5"/>
        <line x1="137" y1="150" x2="158" y2="148" stroke="#545470" strokeWidth="0.8" opacity="0.6"/>
        <line x1="136" y1="158" x2="156" y2="158" stroke="#545470" strokeWidth="0.8" opacity="0.5"/>
        <circle cx="148" cy="152" r="7" fill="#ffaa00" opacity="0.32" className="iryg-core"/>
        <circle cx="148" cy="152" r="4" fill="#ffcc00" opacity="0.55" className="iryg-core"/>
        <circle cx="148" cy="152" r="1.8" fill="white" opacity="0.7" className="iryg-core"/>
        {/* Neck */}
        <rect x="66" y="68" width="28" height="14" rx="4" fill="#222234" stroke="#4a4a68" strokeWidth="1.2"/>
        <path d="M58 74 Q80 68 102 74 L104 82 Q80 86 56 82 Z" fill="#2c2c42" stroke="#565678" strokeWidth="1.1"/>
        {/* Helmet */}
        <path d="M50 60 Q50 30 80 22 Q110 30 110 60 L110 76 Q80 84 50 76 Z"
          fill="#222234" stroke="#4a4a68" strokeWidth="1.9"/>
        <path d="M70 22 Q80 12 90 22 L92 34 Q80 30 68 34 Z" fill="#2c2c42" stroke="#565678" strokeWidth="1.3"/>
        <path d="M74 14 L80 6 L86 14" stroke="#ffcc00" strokeWidth="1.6" fill="none"/>
        <circle cx="80" cy="5" r="3.5" fill="#ffaa00" stroke="#ffcc00" strokeWidth="1" className="iryg-core"/>
        {/* Visor */}
        <path d="M54 52 Q54 66 80 70 Q106 66 106 52 L106 44 Q80 38 54 44 Z"
          fill="#12121e" stroke="#3a3a58" strokeWidth="1"/>
        <path d="M57 50 Q80 44 103 50" stroke="#ffcc00" strokeWidth="3" opacity="0.9" strokeLinecap="round" className="iryg-core"/>
        <path d="M57 50 Q80 44 103 50" stroke="white" strokeWidth="1.2" opacity="0.45" strokeLinecap="round"/>
        <ellipse cx="70" cy="53" rx="7.5" ry="4.5" fill="#ffaa00" opacity="0.8" className="iryg-core"/>
        <ellipse cx="90" cy="53" rx="7.5" ry="4.5" fill="#ffaa00" opacity="0.8" className="iryg-core"/>
        <ellipse cx="70" cy="53" rx="5" ry="3" fill="#ffee44" opacity="0.6" className="iryg-core"/>
        <ellipse cx="90" cy="53" rx="5" ry="3" fill="#ffee44" opacity="0.6" className="iryg-core"/>
        {/* Vents */}
        <line x1="52" y1="58" x2="47" y2="56" stroke="#4a4a68" strokeWidth="1.2"/>
        <line x1="52" y1="63" x2="47" y2="61" stroke="#4a4a68" strokeWidth="1.2"/>
        <line x1="52" y1="68" x2="47" y2="66" stroke="#4a4a68" strokeWidth="1.2"/>
        <line x1="108" y1="58" x2="113" y2="56" stroke="#4a4a68" strokeWidth="1.2"/>
        <line x1="108" y1="63" x2="113" y2="61" stroke="#4a4a68" strokeWidth="1.2"/>
        <line x1="108" y1="68" x2="113" y2="66" stroke="#4a4a68" strokeWidth="1.2"/>
        <path d="M56 36 Q80 30 104 36" stroke="#4a4a68" strokeWidth="0.9" fill="none" opacity="0.6"/>
        <line x1="80" y1="22" x2="80" y2="38" stroke="#4a4a68" strokeWidth="0.8" opacity="0.5"/>
      </g>
      {/* Ground sparks */}
      <line x1="28" y1="202" x2="24" y2="195" stroke="#ffcc00" strokeWidth="1.2" opacity="0.4"/>
      <line x1="42" y1="204" x2="40" y2="197" stroke="#ffcc00" strokeWidth="1" opacity="0.3"/>
      <line x1="118" y1="202" x2="122" y2="195" stroke="#ffcc00" strokeWidth="1.2" opacity="0.4"/>
      <line x1="132" y1="204" x2="134" y2="197" stroke="#ffcc00" strokeWidth="1" opacity="0.3"/>
    </svg>
  );
}

// ─── Card art emblems (Yu-Gi-Oh style artwork) ───────────────────────────────
function PumpEmblem() {
  return (
    <svg viewBox="0 0 90 90" width="68%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="45" cy="38" r="22" stroke="#7fb8ff" strokeWidth="2"/>
      {[0, 72, 144, 216, 288].map(d => {
        const r = (d * Math.PI) / 180;
        return <path key={d}
          d={`M45 38 Q ${45 + Math.cos(r) * 27} ${38 + Math.sin(r) * 27} ${45 + Math.cos(r + 0.75) * 18} ${38 + Math.sin(r + 0.75) * 18}`}
          stroke="#aacfff" strokeWidth="1.6" fill="none"/>;
      })}
      <circle cx="45" cy="38" r="5" fill="#cfe4ff"/>
      <path d="M12 70 Q22 63 32 70 Q42 77 52 70 Q62 63 72 70" stroke="#5d9bdc" strokeWidth="2" fill="none"/>
      <path d="M16 79 Q26 73 36 79 Q46 85 56 79 Q66 73 76 79" stroke="#3c70a8" strokeWidth="1.4" fill="none" opacity="0.7"/>
    </svg>
  );
}

function CraneEmblem() {
  return (
    <svg viewBox="0 0 90 90" width="68%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="45" cy="32" r="15" stroke="#ffd97a" strokeWidth="2"/>
      {[0, 45, 90, 135, 180, 225, 270, 315].map(d => {
        const r = (d * Math.PI) / 180;
        return <line key={d}
          x1={45 + Math.cos(r) * 15} y1={32 + Math.sin(r) * 15}
          x2={45 + Math.cos(r) * 20} y2={32 + Math.sin(r) * 20}
          stroke="#ffd97a" strokeWidth="2"/>;
      })}
      <circle cx="45" cy="32" r="5" fill="#ffe9a8"/>
      <line x1="45" y1="47" x2="45" y2="60" stroke="#e8b94f" strokeWidth="2"/>
      <path d="M45 60 Q36 70 45 77 Q53 82 56 73" stroke="#e8b94f" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <line x1="20" y1="85" x2="70" y2="85" stroke="#9a7a28" strokeWidth="2"/>
    </svg>
  );
}

// ─── Unique philosophical art per challenge ──────────────────────────────────
const ART_AQ = { main: "#7fb8ff", soft: "#aacfff", deep: "#3c70a8", fill: "#cfe4ff", bg: "rgba(127,184,255,0.07)" };
const ART_IR = { main: "#ffd97a", soft: "#ffe9a8", deep: "#9a7a28", fill: "#e8b94f", bg: "rgba(255,217,122,0.07)" };

const CARD_EPITHETS: Record<string, { en: string; id: string }> = {
  "acq580-simple":          { en: "“The first drop teaches the river its direction.”",        id: "“Tetes pertama mengajari sungai arah alirnya.”" },
  "acq580-multipump":       { en: "“No runner carries the relay alone.”",                     id: "“Tak ada pelari yang membawa estafet sendirian.”" },
  "acq580-timer":           { en: "“Water that knows the hour never wastes the night.”",      id: "“Air yang mengenal waktu tak menyia-nyiakan malam.”" },
  "acq580-analog":          { en: "“Between 4 and 20 lies the whole truth.”",                 id: "“Di antara 4 dan 20 terbentang seluruh kebenaran.”" },
  "acq580-pump-curve":      { en: "“The curve is the river's confession, drawn by hand.”",    id: "“Kurva adalah pengakuan sungai, digambar oleh tangan.”" },
  "acq580-anti-cavitation": { en: "“What collapses in silence must be guarded in advance.”",  id: "“Yang runtuh dalam diam harus dijaga sejak awal.”" },
  "acs880-initial":         { en: "“Before commanding the iron, let the iron know itself.”",  id: "“Sebelum memerintah besi, biarkan besi mengenal dirinya.”" },
  "acs880-n5050":           { en: "“The load never touches the ground it was promised above.”", id: "“Beban tak pernah menyentuh tanah yang dijanjikan di atasnya.”" },
};

function ChallengeArt({ id, isACS }: { id: string; isACS: boolean }) {
  const C = isACS ? ART_IR : ART_AQ;
  const base = { viewBox: "0 0 90 90", width: "70%", fill: "none" as const, xmlns: "http://www.w3.org/2000/svg" };

  switch (id) {
    // "The First Drop" — every system begins with one motion
    case "acq580-simple": return (
      <svg {...base}>
        <path d="M45 10 C45 10 32 28 32 37 a13 13 0 0 0 26 0 C58 28 45 10 45 10 Z" stroke={C.main} strokeWidth="2" fill={C.bg}/>
        <circle cx="40" cy="34" r="3" stroke={C.soft} strokeWidth="1" opacity="0.7"/>
        <line x1="45" y1="54" x2="45" y2="60" stroke={C.soft} strokeWidth="1.2" strokeDasharray="2 3" opacity="0.7"/>
        <ellipse cx="45" cy="68" rx="9" ry="3" stroke={C.main} strokeWidth="1.6"/>
        <ellipse cx="45" cy="70" rx="19" ry="5.5" stroke={C.soft} strokeWidth="1.1" opacity="0.6"/>
        <ellipse cx="45" cy="72" rx="30" ry="8" stroke={C.deep} strokeWidth="0.9" opacity="0.4"/>
      </svg>
    );
    // "The Relay" — harmony of many hands
    case "acq580-multipump": return (
      <svg {...base}>
        <path d="M45 22 L67 58 L23 58 Z" stroke={C.deep} strokeWidth="0.9" strokeDasharray="3 3" opacity="0.5"/>
        {[[45,22],[67,58],[23,58]].map(([x,y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="12" stroke={C.main} strokeWidth="1.8" fill={C.bg}/>
            <line x1={x-5} y1={y} x2={x+5} y2={y} stroke={C.soft} strokeWidth="1.2"/>
            <line x1={x} y1={y-5} x2={x} y2={y+5} stroke={C.soft} strokeWidth="1.2"/>
            <circle cx={x} cy={y} r="2" fill={C.fill}/>
          </g>
        ))}
        <path d="M14 80 Q24 74 34 80 Q44 86 54 80 Q64 74 74 80" stroke={C.deep} strokeWidth="1.4" fill="none" opacity="0.7"/>
      </svg>
    );
    // "The Hourglass of Water" — water obeying time
    case "acq580-timer": return (
      <svg {...base}>
        <line x1="26" y1="14" x2="64" y2="14" stroke={C.main} strokeWidth="2.4"/>
        <line x1="26" y1="78" x2="64" y2="78" stroke={C.main} strokeWidth="2.4"/>
        <path d="M30 14 L30 26 Q30 38 45 46 Q60 38 60 26 L60 14" stroke={C.main} strokeWidth="1.8" fill="none"/>
        <path d="M30 78 L30 66 Q30 54 45 46 Q60 54 60 66 L60 78" stroke={C.main} strokeWidth="1.8" fill="none"/>
        <path d="M34 22 Q40 26 45 24 Q51 22 56 25 L56 26 Q56 35 45 42 Q34 35 34 26 Z" fill={C.bg} stroke={C.soft} strokeWidth="0.8"/>
        <line x1="45" y1="48" x2="45" y2="68" stroke={C.soft} strokeWidth="1" strokeDasharray="1.5 2.5"/>
        <path d="M37 72 Q41 69 45 72 Q49 75 53 72" stroke={C.soft} strokeWidth="1.2" fill="none"/>
      </svg>
    );
    // "The Balance of Truth" — translating between two worlds (4–20 mA)
    case "acq580-analog": return (
      <svg {...base}>
        <line x1="45" y1="16" x2="45" y2="70" stroke={C.main} strokeWidth="1.8"/>
        <line x1="33" y1="76" x2="57" y2="76" stroke={C.main} strokeWidth="2"/>
        <line x1="18" y1="26" x2="72" y2="26" stroke={C.main} strokeWidth="1.8"/>
        <circle cx="45" cy="21" r="3.5" stroke={C.soft} strokeWidth="1.4"/>
        <line x1="18" y1="26" x2="18" y2="42" stroke={C.soft} strokeWidth="0.9"/>
        <line x1="72" y1="26" x2="72" y2="42" stroke={C.soft} strokeWidth="0.9"/>
        <path d="M8 42 L28 42 Q26 52 18 52 Q10 52 8 42 Z" stroke={C.main} strokeWidth="1.4" fill={C.bg}/>
        <path d="M62 42 L82 42 Q80 52 72 52 Q64 52 62 42 Z" stroke={C.main} strokeWidth="1.4" fill={C.bg}/>
        <path d="M18 29 C18 29 14.5 34.5 14.5 37 a3.5 3.5 0 0 0 7 0 C21.5 34.5 18 29 18 29 Z" stroke={C.soft} strokeWidth="1.2" fill={C.bg}/>
        <path d="M64 36 L68 36 L70 31 L74 41 L76 36 L80 36" stroke={C.soft} strokeWidth="1.2" fill="none"/>
      </svg>
    );
    // "The Cartographer" — mapping the invisible (Q-H curve)
    case "acq580-pump-curve": return (
      <svg {...base}>
        <line x1="18" y1="14" x2="18" y2="72" stroke={C.main} strokeWidth="1.6"/>
        <line x1="18" y1="72" x2="78" y2="72" stroke={C.main} strokeWidth="1.6"/>
        <path d="M18 24 Q44 26 58 40 Q70 52 74 68" stroke={C.soft} strokeWidth="2" fill="none"/>
        <path d="M18 60 Q36 54 50 44 Q62 36 74 22" stroke={C.deep} strokeWidth="1.2" fill="none" strokeDasharray="4 3" opacity="0.7"/>
        <circle cx="54" cy="42" r="3.5" stroke={C.fill} strokeWidth="1.6"/>
        <line x1="54" y1="42" x2="54" y2="72" stroke={C.soft} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.6"/>
        <line x1="18" y1="42" x2="54" y2="42" stroke={C.soft} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.6"/>
        <path d="M64 10 L58 26 M64 10 L70 26" stroke={C.main} strokeWidth="1.4"/>
        <circle cx="64" cy="9" r="2.5" stroke={C.main} strokeWidth="1.2"/>
      </svg>
    );
    // "The Silent Shield" — guarding the impeller from collapsing bubbles
    case "acq580-anti-cavitation": return (
      <svg {...base}>
        <path d="M45 12 L70 20 L70 44 Q70 64 45 76 Q20 64 20 44 L20 20 Z" stroke={C.main} strokeWidth="1.8" fill={C.bg}/>
        <circle cx="45" cy="42" r="13" stroke={C.soft} strokeWidth="1.6"/>
        {[0, 72, 144, 216, 288].map(d => {
          const r = (d * Math.PI) / 180;
          return <path key={d}
            d={`M45 42 Q ${45 + Math.cos(r) * 16} ${42 + Math.sin(r) * 16} ${45 + Math.cos(r + 0.7) * 11} ${42 + Math.sin(r + 0.7) * 11}`}
            stroke={C.soft} strokeWidth="1.2" fill="none"/>;
        })}
        <circle cx="45" cy="42" r="3" fill={C.fill}/>
        <circle cx="11" cy="30" r="3" stroke={C.deep} strokeWidth="1" opacity="0.6"/>
        <path d="M76 25 l5 5 M81 25 l-5 5" stroke={C.deep} strokeWidth="1.1" opacity="0.6"/>
        <circle cx="80" cy="48" r="2.2" stroke={C.deep} strokeWidth="1" opacity="0.5"/>
        <path d="M8 50 l5 5 M13 50 l-5 5" stroke={C.deep} strokeWidth="1.1" opacity="0.5"/>
      </svg>
    );
    // "The Awakened Eye" — the machine learning itself (ID run)
    case "acs880-initial": return (
      <svg {...base}>
        <circle cx="45" cy="45" r="22" stroke={C.main} strokeWidth="2"/>
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(d => {
          const r = (d * Math.PI) / 180;
          return <line key={d}
            x1={45 + Math.cos(r) * 22} y1={45 + Math.sin(r) * 22}
            x2={45 + Math.cos(r) * 28} y2={45 + Math.sin(r) * 28}
            stroke={C.main} strokeWidth="1.8"/>;
        })}
        <path d="M27 45 Q45 30 63 45 Q45 60 27 45 Z" stroke={C.soft} strokeWidth="1.6" fill={C.bg}/>
        <circle cx="45" cy="45" r="6.5" stroke={C.soft} strokeWidth="1.4"/>
        <circle cx="45" cy="45" r="2.5" fill={C.fill}/>
        <line x1="45" y1="6" x2="45" y2="11" stroke={C.deep} strokeWidth="1" opacity="0.7"/>
        <line x1="45" y1="79" x2="45" y2="84" stroke={C.deep} strokeWidth="1" opacity="0.7"/>
        <line x1="6" y1="45" x2="11" y2="45" stroke={C.deep} strokeWidth="1" opacity="0.7"/>
        <line x1="79" y1="45" x2="84" y2="45" stroke={C.deep} strokeWidth="1" opacity="0.7"/>
      </svg>
    );
    // "The Covenant of Gravity" — the load held above the ground by written law
    case "acs880-n5050": return (
      <svg {...base}>
        {[10, 20, 30].map(y => (
          <ellipse key={y} cx="45" cy={y} rx="3.5" ry="5.5" stroke={C.main} strokeWidth="1.6"/>
        ))}
        <path d="M45 36 L45 42 Q34 52 45 59 Q54 64 57 55" stroke={C.main} strokeWidth="2.4" fill="none" strokeLinecap="round"/>
        <circle cx="45" cy="69" r="11" stroke={C.soft} strokeWidth="1.6"/>
        <ellipse cx="45" cy="69" rx="11" ry="4.5" stroke={C.soft} strokeWidth="0.8" opacity="0.6"/>
        <ellipse cx="45" cy="69" rx="4.5" ry="11" stroke={C.soft} strokeWidth="0.8" opacity="0.6"/>
        <line x1="18" y1="87" x2="72" y2="87" stroke={C.deep} strokeWidth="1.6" opacity="0.8"/>
        {[24, 36, 48, 60].map(x => (
          <line key={x} x1={x} y1="87" x2={x - 4} y2="90" stroke={C.deep} strokeWidth="0.8" opacity="0.5"/>
        ))}
      </svg>
    );
    default:
      return isACS ? <CraneEmblem/> : <PumpEmblem/>;
  }
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

// ─── Challenge detail — slide-by-slide tutorial wizard ───────────────────────
function ChallengeDetail({
  challenge, lang, completedIds, onComplete,
}: {
  challenge: VsdChallenge;
  lang: string;
  completedIds: string[];
  onComplete: (id: string) => void;
}) {
  const [slide, setSlide] = useState(0);
  const [checkedPrereqs, setCheckedPrereqs] = useState<Record<number, boolean>>({});
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const isCompleted = completedIds.includes(challenge.id);
  const prereqs = lang === "id" ? challenge.prerequisitesId : challenge.prerequisitesEn;
  const isACS = challenge.drive === "ACS880";
  const accent = isACS ? "var(--accent)" : "#4a9eff";
  const accentSoft = isACS ? "rgba(228,199,89,0.3)" : "rgba(74,158,255,0.3)";
  const accentBg = isACS ? "rgba(228,199,89,0.12)" : "rgba(74,158,255,0.12)";

  // Slide 0 = prerequisites, 1..N = steps, last = limits + sign-off
  const totalSlides = challenge.steps.length + 2;
  const isPrereq = slide === 0;
  const isFinal = slide === totalSlides - 1;
  const stepIdx = slide - 1;
  const step = !isPrereq && !isFinal ? challenge.steps[stepIdx] : null;

  const go = (d: number) => setSlide(s => Math.max(0, Math.min(totalSlides - 1, s + d)));

  return (
    <div style={{
      background: "rgba(0,0,0,0.35)", borderRadius: 20,
      border: `1px solid ${accentSoft}`,
      padding: "24px 24px 18px", display: "flex", flexDirection: "column", gap: 18,
    }}>
      <style>{`@keyframes vsdSlideIn{from{opacity:0;transform:translateX(26px)}to{opacity:1;transform:translateX(0)}}`}</style>

      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{
            fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.12em",
            padding: "3px 8px", borderRadius: 4, textTransform: "uppercase",
            background: accentBg, color: accent,
          }}>{challenge.drive}</span>
          <DifficultyDots level={challenge.difficulty}/>
          <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            ~{challenge.estimatedMinutes} min · {challenge.steps.length} {lang === "id" ? "langkah" : "steps"}
          </span>
          {isCompleted && (
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#22c55e" }}>
              ✓ {lang === "id" ? "Selesai" : "Completed"}
            </span>
          )}
        </div>
        <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 19, color: accent, lineHeight: 1.2 }}>
          {lang === "id" ? challenge.titleId : challenge.titleEn}
        </h2>
      </div>

      {/* Slide progress segments */}
      <div style={{ display: "flex", gap: 4 }}>
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            aria-label={`Slide ${i + 1}`}
            style={{
              flex: 1, height: 6, borderRadius: 3, border: "none", cursor: "pointer", padding: 0,
              background: i <= slide ? accent : "rgba(255,255,255,0.08)",
              opacity: i === slide ? 1 : i < slide ? 0.4 : 1,
              transition: "all 0.25s",
            }}
          />
        ))}
      </div>

      {/* Slide content — swipeable */}
      <div
        key={slide}
        onTouchStart={e => {
          // Don't hijack swipes that start inside scrollable tables
          if ((e.target as HTMLElement).closest("[data-noswipe]")) { touchStart.current = null; return; }
          touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchEnd={e => {
          if (touchStart.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStart.current.x;
          const dy = e.changedTouches[0].clientY - touchStart.current.y;
          touchStart.current = null;
          // Only a deliberate horizontal swipe: long distance AND clearly more horizontal than vertical
          if (Math.abs(dx) > 110 && Math.abs(dx) > Math.abs(dy) * 2) go(dx < 0 ? 1 : -1);
        }}
        style={{ minHeight: 300, animation: "vsdSlideIn 0.35s ease both", display: "flex", flexDirection: "column", gap: 16 }}
      >
        {/* Slide label */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: accent, color: "#000",
            fontSize: 12, fontWeight: 800, fontFamily: "var(--font-mono)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{isPrereq ? "✓" : isFinal ? "★" : stepIdx + 1}</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              {isPrereq
                ? (lang === "id" ? "Persiapan" : "Preparation")
                : isFinal
                  ? (lang === "id" ? "Penyelesaian" : "Completion")
                  : `${lang === "id" ? "Langkah" : "Step"} ${stepIdx + 1} / ${challenge.steps.length}`}
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--fg)", lineHeight: 1.25 }}>
              {isPrereq
                ? (lang === "id" ? "Prasyarat sebelum mulai" : "Prerequisites before you begin")
                : isFinal
                  ? (lang === "id" ? "Batas, referensi & tanda selesai" : "Limits, references & sign-off")
                  : (lang === "id" ? step!.titleId : step!.titleEn)}
            </span>
          </div>
        </div>

        {/* ── Slide 0: prerequisites checklist ── */}
        {isPrereq && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 4 }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--fg-soft)", lineHeight: 1.55 }}>
              {lang === "id" ? challenge.objectiveId : challenge.objectiveEn}
            </p>
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
        )}

        {/* ── Step slides ── */}
        {step && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingLeft: 4 }}>
            <p style={{ margin: 0, fontSize: 14, color: "var(--fg-soft)", lineHeight: 1.65 }}>
              {lang === "id" ? step.descId : step.descEn}
            </p>
            {step.params && step.params.length > 0 && (
              <div data-noswipe style={{ overflowX: "auto", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                      {["Code", "Parameter", lang === "id" ? "Nilai Set" : "Set Value", "Unit", lang === "id" ? "Catatan" : "Note"].map(h => (
                        <th key={h} style={{
                          padding: "7px 10px", textAlign: "left", fontSize: 9,
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

        {/* ── Final slide: limits + manual ref + sign-off ── */}
        {isFinal && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingLeft: 4 }}>
            {challenge.limitSettings.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                  {lang === "id" ? "Referensi Pengaturan Batas" : "Limit Settings Reference"}
                </div>
                <div data-noswipe style={{ overflowX: "auto", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
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

            <div style={{
              padding: "10px 14px", borderRadius: 8,
              background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)",
              display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
            }}>
              <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {lang === "id" ? "Ref. Manual" : "Manual Ref"}:
              </span>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg-soft)" }}>{challenge.manualRef}</span>
            </div>

            <button
              onClick={() => onComplete(challenge.id)}
              style={{
                padding: "14px 24px", borderRadius: 12, cursor: "pointer", alignSelf: "flex-start",
                fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em",
                background: isCompleted ? "rgba(34,197,94,0.15)" : accent,
                color: isCompleted ? "#22c55e" : "#000",
                border: `1px solid ${isCompleted ? "rgba(34,197,94,0.4)" : "transparent"}`,
                transition: "all 0.2s", textTransform: "uppercase",
              }}
            >
              {isCompleted
                ? (lang === "id" ? "✓ Selesai — klik untuk batalkan" : "✓ Completed — click to undo")
                : (lang === "id" ? "Tandai Selesai ★" : "Mark Complete ★")}
            </button>
          </div>
        )}
      </div>

      {/* Slide navigation bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <button
          onClick={() => go(-1)}
          disabled={slide === 0}
          style={{
            padding: "10px 18px", borderRadius: 10, cursor: slide === 0 ? "default" : "pointer",
            background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
            color: slide === 0 ? "rgba(255,255,255,0.18)" : "var(--fg-soft)",
            fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
          }}
        >← {lang === "id" ? "Sebelumnya" : "Previous"}</button>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
          {slide + 1} / {totalSlides}
        </span>
        <button
          onClick={() => go(1)}
          disabled={isFinal}
          style={{
            padding: "10px 18px", borderRadius: 10, cursor: isFinal ? "default" : "pointer",
            background: isFinal ? "transparent" : accent,
            border: isFinal ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
            color: isFinal ? "rgba(255,255,255,0.18)" : "#000",
            fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 800, letterSpacing: "0.06em",
          }}
        >{lang === "id" ? "Berikutnya" : "Next"} →</button>
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

      {/* Challenge cards grid — Yu-Gi-Oh trading card style */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 18, marginBottom: 28 }}>
        {domainChallenges.map(c => {
          const isSelected = selectedChallenge?.id === c.id;
          const isDone = completedIds.includes(c.id);
          const isACS = c.drive === "ACS880";
          return (
            <button
              key={c.id}
              onClick={() => selectChallenge(c)}
              style={{
                aspectRatio: "59 / 86", padding: 0, border: "none", cursor: "pointer",
                background: "transparent", textAlign: "left", position: "relative",
                transform: isSelected ? "translateY(-8px) scale(1.04)" : "none",
                transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), filter 0.25s",
                filter: isSelected
                  ? `drop-shadow(0 14px 28px ${isACS ? "rgba(228,199,89,0.35)" : "rgba(74,158,255,0.35)"})`
                  : "drop-shadow(0 6px 14px rgba(0,0,0,0.45))",
              }}
            >
              {/* Outer card frame */}
              <div style={{
                position: "absolute", inset: 0, borderRadius: 10,
                background: isACS
                  ? "linear-gradient(155deg,#caa64b 0%,#9a7a28 45%,#6e5418 100%)"
                  : "linear-gradient(155deg,#5b8fc9 0%,#2e5f96 45%,#1c3f6b 100%)",
                border: `1px solid ${isSelected ? (isACS ? "#ffd97a" : "#9cc8ff") : "rgba(0,0,0,0.5)"}`,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.4)",
                padding: 7, boxSizing: "border-box",
                display: "flex", flexDirection: "column", gap: 4,
              }}>
                {/* Name bar + attribute orb */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 4,
                  background: "linear-gradient(180deg,#f6eed6,#dcc89a)",
                  borderRadius: 3, padding: "4px 6px",
                  border: "1px solid rgba(0,0,0,0.4)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
                }}>
                  <span style={{
                    flex: 1, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10.5,
                    lineHeight: 1.15, color: "#1c1206",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {lang === "id" ? c.titleId : c.titleEn}
                  </span>
                  <div style={{
                    width: 17, height: 17, borderRadius: "50%", flexShrink: 0,
                    background: isACS
                      ? "radial-gradient(circle at 35% 30%,#ffe9a8,#b8860b)"
                      : "radial-gradient(circle at 35% 30%,#bfe0ff,#1d6fd1)",
                    border: "1px solid rgba(0,0,0,0.45)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, color: "#fff", fontWeight: 900,
                    textShadow: "0 1px 1px rgba(0,0,0,0.6)",
                  }}>{isACS ? "⚙" : "≋"}</div>
                </div>

                {/* Level stars */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 2, padding: "0 3px" }}>
                  {Array.from({ length: c.difficulty }).map((_, i) => (
                    <span key={i} style={{
                      fontSize: 11, color: "#ffd34d", lineHeight: 1,
                      textShadow: "0 0 3px rgba(180,80,0,0.9), 0 1px 1px rgba(0,0,0,0.6)",
                    }}>★</span>
                  ))}
                </div>

                {/* Art box */}
                <div style={{
                  flex: 1, minHeight: 0, margin: "0 3px",
                  border: "2px solid #2a1c08",
                  boxShadow: "inset 0 0 18px rgba(0,0,0,0.55)",
                  background: isACS
                    ? "radial-gradient(circle at 50% 38%, #4a3a14, #181006 75%)"
                    : "radial-gradient(circle at 50% 38%, #14365c, #07111e 75%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", overflow: "hidden",
                }}>
                  <ChallengeArt id={c.id} isACS={isACS}/>
                  {isDone && (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(120deg, transparent 30%, rgba(120,255,180,0.12) 50%, transparent 70%)",
                      display: "flex", alignItems: "flex-start", justifyContent: "flex-end", padding: 4,
                    }}>
                      <span style={{
                        fontSize: 9, background: "rgba(34,197,94,0.85)", color: "#fff",
                        borderRadius: 3, padding: "1px 5px", fontWeight: 800,
                      }}>✓</span>
                    </div>
                  )}
                </div>

                {/* Type line */}
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 7, fontWeight: 800, letterSpacing: "0.05em",
                  color: "#1c1206", background: "linear-gradient(180deg,#f6eed6,#dcc89a)",
                  border: "1px solid rgba(0,0,0,0.4)", borderRadius: 2, padding: "2px 5px",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  [ {isACS ? "IRON / CRANE" : "AQUA / PUMP"} / COMMISSIONING ]
                </div>

                {/* Effect text box + stats */}
                <div style={{
                  background: "#efe4c4", border: "1px solid rgba(0,0,0,0.4)",
                  borderRadius: 2, padding: "5px 6px",
                  display: "flex", flexDirection: "column", gap: 3,
                }}>
                  {CARD_EPITHETS[c.id] && (
                    <p style={{
                      margin: 0, fontSize: 7.5, lineHeight: 1.3, color: "#4a3416", fontStyle: "italic",
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {lang === "id" ? CARD_EPITHETS[c.id].id : CARD_EPITHETS[c.id].en}
                    </p>
                  )}
                  <p style={{
                    margin: 0, fontSize: 8.5, lineHeight: 1.35, color: "#241808",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {lang === "id" ? c.objectiveId : c.objectiveEn}
                  </p>
                  <div style={{
                    borderTop: "1px solid rgba(0,0,0,0.35)", paddingTop: 3,
                    display: "flex", justifyContent: "flex-end", gap: 9,
                    fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 800, color: "#1c1206",
                  }}>
                    <span>STEP/{c.steps.length}</span>
                    <span>MIN/{c.estimatedMinutes}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Challenge detail */}
      <div ref={detailRef}>
        {selectedChallenge && (
          <ChallengeDetail
            key={selectedChallenge.id}
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
          div[style*="repeat(auto-fill, minmax(185px, 1fr))"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </CalcShell>
  );
}
