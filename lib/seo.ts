// lib/seo.ts — single source of truth for per-route SEO metadata.
// Consumed by server code (page.tsx metadata exports, sitemap.ts, robots.ts).
//
// NOTE: titles are intentionally duplicated from lib/i18n.ts (T.en.*.title) —
// that module is "use client" and cannot be imported into server code.
// Descriptions are authored SEO copy (~120–160 chars), not UI subtitles.

import type { Metadata } from "next";

export const SITE_URL = `https://${process.env.NEXT_PUBLIC_CANONICAL_HOST ?? "ptts-praxis.vercel.app"}`;
export const SITE_NAME = "PTTS Praxis";

export type SeoEntry = {
  path: "/" | `/${string}`;
  title: string;          // fed into the root layout title template "%s · PTTS Praxis"
  description: string;
  noindex?: boolean;      // robots noindex + excluded from sitemap
  priority?: number;      // sitemap priority, default 0.7
};

export const SEO = {
  home:            { path: "/", title: "PTTS Praxis", description: "Presales engineering suite by PT Prima Tekindo Tirta Sejahtera: cable sizing, VSD, breaker, busbar, panel & power-quality calculators to IEC standards.", priority: 1 },
  cable:           { path: "/cable", title: "Cable Sizing Calculator", description: "Size Cu conductors per IEC 60364-5-52 and PUIL 2011 — PVC/XLPE insulation, installation method C, derating factors, voltage drop and grounding." },
  vsd:             { path: "/vsd", title: "VSD + Airflow Calculator", description: "Select ABB drives — ACQ580 (HVAC-R), ACS880 (industrial/crane) — with airflow and panel thermal sizing for variable speed drive installations." },
  breaker:         { path: "/breaker", title: "MCCB / MCB Selector", description: "Select Siemens 5SL, 5SY and 3VA breakers per IEC 60947-2 and IEC 60898 — trip curves B/C/D, breaking capacity and frame selection." },
  busbar:          { path: "/busbar", title: "Busbar Sizing Calculator", description: "Size rectangular Cu/Al flat-bar busbars per DIN 43671 and IEC 61439-1 Annex N — ampacity, arrangement and temperature-rise checks." },
  brakingResistor: { path: "/braking-resistor", title: "Braking Resistor Sizing", description: "Size braking resistors for crane hoist and traverse duty — STAHL CraneSystems standard, ABB ACS880 R+/R- chopper ratings and duty cycle." },
  panel:           { path: "/panel", title: "Panel / Enclosure Sizing", description: "Thermal sizing for electrical enclosures per IEC 60890 — XLTC and Rittal TS 8, natural convection, forced-fan and air-conditioned cooling." },
  unified:         { path: "/unified", title: "Unified Motor Starter Sizing", description: "VSD, cable and breaker sizing in one flow — ABB drives with Siemens protection, from motor nameplate to complete starter specification." },
  abbSupport:      { path: "/abb-support", title: "ABB Drive Support Hub", description: "ABB drive troubleshooting — error/fault code lookup, product manuals, dimension data and drive status word decoder for ACS/ACQ series." },
  plc:             { path: "/plc", title: "PLC I/O Module Sizing", description: "Size Siemens S7-1200 and S7-1500 Gen 2 PLC systems — I/O module count, expansion limits and power budget calculation." },
  starter:         { path: "/starter", title: "Motor Starter Sizing", description: "DOL and star-delta starter sizing — Siemens SIRIUS 3RV2 MPCB, 3RT2 contactors and 3RA2 assemblies from motor rating." },
  panelLayout:     { path: "/panel-layout", title: "Panel Layout Estimator", description: "Estimate minimum enclosure dimensions from a component list per IEC 61439 — layout planning for LV switchboard and control panels." },
  convert:         { path: "/convert", title: "Unit Converter", description: "Quick field-engineering unit conversions — power, pressure, flow, torque, temperature and more for electrical and mechanical work." },
  pid:             { path: "/pid", title: "PID Simulator", description: "Interactive PID tuning simulator — step response for motor, pump and compressor loops with live gain adjustment." },
  tutorials:       { path: "/tutorials", title: "Testing Tutorials", description: "Field testing guides — multimeter measurement and insulation-resistance test procedures for electrical commissioning." },
  vsdChallenges:   { path: "/tutorials/vsd-challenges", title: "VSD Commissioning Challenges", description: "Hands-on ABB drive commissioning guides — ACQ580 multipump setups and ACS880 crane application challenges." },
  skfMicrolog:     { path: "/skf-microlog", title: "SKF Microlog Learn", description: "Vibration analysis learning path — 7 modules covering SKF Microlog data collection plus an ISO severity calculator." },
  abbDrivecare:    { path: "/abb-drivecare", title: "ABB DriveCare PDF Gen", description: "Generate ABB VSD preventive-maintenance PDF reports — DriveCare inspection documentation for service engineers." },
  icc:             { path: "/icc", title: "Short-circuit Icc Calculator", description: "IEC 60909 fault current calculation — three-phase Icc, peak current Ip and required breaker Icu at each point in the network." },
  transformer:     { path: "/transformer", title: "Transformer Sizing", description: "Distribution transformer kVA selection per IEC 60076 — impedance %Z, voltage regulation and secondary short-circuit current." },
  selectivity:     { path: "/selectivity", title: "Selectivity Study", description: "Breaker discrimination study per IEC 60947-2 — In-ratio rules and trip-matrix check for upstream/downstream coordination." },
  capacitorKvar:   { path: "/capacitor-kvar", title: "Capacitor kVAR Calculator", description: "Power factor correction sizing — required capacitor bank kVAR from measured cos φ to target, with analysis report and XLS/PDF export." },
  workOrder:       { path: "/work-order", title: "Work Order Generator", description: "Create structured field-service work orders — order info, team assignment and task descriptions, ready to print and share.", noindex: true },
  game:            { path: "/game", title: "Arcade", description: "Take a break — classic mini-games built into PTTS Praxis.", noindex: true },
  game2048:        { path: "/game/2048", title: "2048", description: "Play 2048 — slide and merge tiles to reach 2048.", noindex: true },
  gameMinesweeper: { path: "/game/minesweeper", title: "Minesweeper", description: "Play Minesweeper — clear the board without hitting a mine.", noindex: true },
  gameSnake:       { path: "/game/snake", title: "Snake", description: "Play Snake — classic grid snake game.", noindex: true },
  gameSolitaire:   { path: "/game/solitaire", title: "Solitaire", description: "Play Klondike Solitaire.", noindex: true },
  gameTetris:      { path: "/game/tetris", title: "Tetris", description: "Play a classic falling-blocks game.", noindex: true },
} as const satisfies Record<string, SeoEntry>;

// Shared card image. Declared explicitly because the shallow metadata merge
// below also wipes the app/opengraph-image.tsx file-convention injection —
// pages that export their own openGraph object would otherwise ship no image.
const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "PTTS Praxis — engineering calculators by PT Prima Tekindo Tirta Sejahtera",
};

export function toolMetadata(key: keyof typeof SEO): Metadata {
  const e: SeoEntry = SEO[key];
  return {
    // Home keeps the layout's default title — otherwise it would render
    // as "PTTS Praxis · PTTS Praxis" through the title template.
    ...(e.path === "/" ? {} : { title: e.title }),
    description: e.description,
    alternates: { canonical: e.path },
    // Complete objects on purpose — Next.js metadata merging is shallow per
    // top-level key, so a partial openGraph here would drop the layout's
    // siteName/type instead of merging with them.
    openGraph: { type: "website", siteName: SITE_NAME, url: e.path, title: e.title, description: e.description, images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: e.title, description: e.description, images: [OG_IMAGE] },
    ...(e.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
