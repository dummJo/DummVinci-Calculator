// data/skf-microlog/diagnostic-patterns.ts
// Illustrated Vibration Diagnostic Chart — Table I
// Source: 02-Vibration-Severity-Diagnostics-Charts.md §4

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DiagnosticPattern {
  id: string;
  category: string;
  name: string;
  spectrum: string;
  phase: string;
  correction: string;
  standard?: string;
}

// ─── Full Diagnostic Chart ────────────────────────────────────────────────────

export const DIAGNOSTIC_PATTERNS: DiagnosticPattern[] = [
  // A. Unbalance (4 sub-types)
  { id: "A1", category: "Unbalance", name: "Force Unbalance",
    spectrum: "Dominant 1× radial. Square-of-speed scaling.",
    phase: "OB ≈ IB horizontals & verticals (±30°). 90° H↔V on each bearing.",
    correction: "1 plane balancing",
    standard: "ISO 21940-11 / ISO 20816-1" },
  { id: "A2", category: "Unbalance", name: "Couple Unbalance",
    spectrum: "1× radial + high axial.",
    phase: "OB vs IB ~180° apart (±30°). 90° H↔V.",
    correction: "Equal weights in 2 planes 180° out of phase",
    standard: "ISO 21940-11 / ISO 20816-1" },
  { id: "A3", category: "Unbalance", name: "Dynamic Unbalance",
    spectrum: "Dominant 1× radial. Default real-world case.",
    phase: "OB vs IB between 0°–180° but H-diff matches V-diff (±30°).",
    correction: "2 planes required",
    standard: "ISO 21940-11 / ISO 20816-1" },
  { id: "A4", category: "Unbalance", name: "Overhung Rotor",
    spectrum: "High 1× both axial & radial.",
    phase: "Axial in-phase, radial unsteady. H-diff matches V-diff (±30°).",
    correction: "2 planes (force + couple)",
    standard: "ISO 21940-11 / ISO 20816-1" },

  // M. Misalignment (added for shaft coordination)
  { id: "M1", category: "Misalignment", name: "Shaft Misalignment (Angular & Offset)",
    spectrum: "High 1× and 2× axial, sometimes 2× radial. Directional along axial shaft path.",
    phase: "180° out-of-phase (±30°) across the coupling (axial H vs V, or OB vs IB).",
    correction: "Laser alignment or dial indicator alignment to tolerance (< 0.05 mm for 1500 RPM).",
    standard: "ISO 13373-3 / ISO 20816-1" },

  // B. Eccentric Rotor
  { id: "B1", category: "Eccentricity", name: "Eccentric Rotor (Pulley, Gear, Motor Armature)",
    spectrum: "Largest vibration at 1× of eccentric component, direction thru centerline of two rotors.",
    phase: "Phase H vs V usually 0° or 180° (straight-line motion).",
    correction: "Balancing usually reduces 1 direction but worsens the other. Fix eccentricity root cause.",
    standard: "ISO 20816-1 / ANSI S2.19" },

  // C. Mechanical Looseness (3 types)
  { id: "C1", category: "Looseness", name: "Type A — Structural Looseness",
    spectrum: "1× RPM radial dominant.",
    phase: "90°–180° phase diff between vertical reading on bolt, foot, baseplate.",
    correction: "Retorque machine feet, fix grouting, correct soft foot",
    standard: "ISO 13373-3" },
  { id: "C2", category: "Looseness", name: "Type B — Loose Pillowblock / Cracks",
    spectrum: "2× RPM radial often dominant.",
    phase: "—",
    correction: "Tighten bolts, inspect for frame/pedestal cracks",
    standard: "ISO 13373-3" },
  { id: "C3", category: "Looseness", name: "Type C — Improper Fit",
    spectrum: "Many harmonics (3×, 4×, 5×...) + truncated waveform + raised noise floor. Often subharmonics ½×, 1.5×, 2.5×.",
    phase: "Unstable, varies widely between measurements.",
    correction: "Check bearing liner fit, shaft fit, impeller tightness. Highly directional — check at 30° increments.",
    standard: "ISO 13373-3" },

  // D. Rotor Rub
  { id: "D1", category: "Looseness", name: "Rotor Rub",
    spectrum: "Similar to looseness — many harmonics + raised noise floor. Excites natural resonances + integer fraction subharmonics (1/2, 1/3, 1/4...).",
    phase: "Variable. Full annular rub can induce reverse precession → catastrophic.",
    correction: "Investigate seal clearances, bearing clearances, thermal growth.",
    standard: "ISO 13373-3" },

  // E. Journal Bearing Problems
  { id: "E1", category: "Journal Bearing", name: "Wear / Clearance",
    spectrum: "Series of running speed harmonics (up to 10–20×). Wiped journal → high vertical, low horizontal.",
    phase: "—",
    correction: "Replace bearing shells",
    standard: "ISO 7919-3 / ISO 20816-1" },
  { id: "E2", category: "Journal Bearing", name: "Oil Whirl Instability",
    spectrum: "0.40–0.48× RPM peak. Often severe amplitude.",
    phase: "Forwards precession.",
    correction: "Check bearing clearance (excessive when > 40% of clearance), lube pressure, bearing preload",
    standard: "ISO 7919-3 / ISO 13373-3" },
  { id: "E3", category: "Journal Bearing", name: "Oil Whip",
    spectrum: "Occurs at/above 2× rotor critical freq. Whirl 'locks onto' rotor critical and stays there even at higher RPM.",
    phase: "Inherently unstable.",
    correction: "Urgent — inherently unstable condition. Reduce speed, increase bearing load, change bearing geometry.",
    standard: "ISO 7919-3 / ISO 13373-3" },

  // F. Rolling Element Bearings — 4 Stages
  { id: "F1", category: "Bearing", name: "Stage 1 — Ultrasonic",
    spectrum: "Ultrasonic range (250–350 kHz, later drops to 20–60 kHz). Detectable via Spike Energy (gSE), HFD(g), Shock Pulse, or gE enveloping.",
    phase: "—",
    correction: "Monitor with gE enveloping. ~0.25 gSE typical.",
    standard: "ISO 15242 / SKF Severity Stage 1" },
  { id: "F2", category: "Bearing", name: "Stage 2 — Natural Frequency Excitation",
    spectrum: "Bearing component natural frequencies 'ring' (30–120 kCPM). Sidebands appear at end of Stage 2.",
    phase: "—",
    correction: "Plan replacement. Spike energy ~0.25→0.5 gSE.",
    standard: "ISO 15242 / SKF Severity Stage 2" },
  { id: "F3", category: "Bearing", name: "Stage 3 — Defect Frequencies Visible",
    spectrum: "BPFI, BPFO, BSF, FTF and harmonics appear in velocity spectrum. Sidebands grow. Wear visible.",
    phase: "—",
    correction: "Replace bearings now. Spike energy ~1.0 gSE+.",
    standard: "ISO 13373-3 / SKF Severity Stage 3" },
  { id: "F4", category: "Bearing", name: "Stage 4 — Catastrophic",
    spectrum: "1× RPM grows + running speed harmonics multiply. Discrete bearing defect peaks disappear → replaced by random broadband noise floor.",
    phase: "—",
    correction: "Immediate shutdown — catastrophic failure imminent.",
    standard: "ISO 13373-3 / SKF Severity Stage 4" },

  // G. Hydraulic & Aerodynamic
  { id: "G1", category: "Hydraulic", name: "Blade Pass / Vane Pass",
    spectrum: "BPF = #blades × RPM. Inherent — problem only if amplitude high (unequal gap, resonance, impeller wear ring seize).",
    phase: "—",
    correction: "Check rotor/stator gap uniformity, pipe alignment, wear ring clearance.",
    standard: "ISO 10816-7 / HI 9.6.4" },
  { id: "G2", category: "Hydraulic", name: "Flow Turbulence",
    spectrum: "Random low-freq vibration (50–2000 CPM) from pressure/velocity variations.",
    phase: "—",
    correction: "Improve inlet flow conditions, reduce restrictions.",
    standard: "ISO 10816-7" },
  { id: "G3", category: "Hydraulic", name: "Cavitation",
    spectrum: "Random high-freq broadband, sometimes superimposed with BPF harmonics. Sounds like 'gravel passing.'",
    phase: "—",
    correction: "Increase inlet flow / NPSH. Highly destructive to impeller.",
    standard: "ISO 10816-7 / HI 9.6.4" },

  // H. Gears
  { id: "H1", category: "Gear", name: "Normal Gear Mesh",
    spectrum: "Gear & pinion speeds + GMF + small GMF harmonics with low RPM sidebands.",
    phase: "—",
    correction: "Normal — no action required.",
    standard: "ISO 8579-2" },
  { id: "H2", category: "Gear", name: "Tooth Wear",
    spectrum: "Excitation of gear natural frequency + sidebands at gear running speed. 2× or 3× GMF often higher than 1× GMF.",
    phase: "—",
    correction: "Plan gear replacement.",
    standard: "ISO 13373-9 / AGMA 6000" },
  { id: "H3", category: "Gear", name: "Gear Eccentricity / Backlash",
    spectrum: "High amplitude sidebands around GMF. 1× RPM high if eccentricity dominant. Backlash → GMF decreases with load.",
    phase: "—",
    correction: "Check gear alignment and backlash clearance.",
    standard: "ISO 13373-9 / AGMA 6000" },
  { id: "H4", category: "Gear", name: "Gear Misalignment",
    spectrum: "2nd-or-higher GMF harmonics with 1× sidebands. Often small 1×GMF but big 2× or 3× GMF.",
    phase: "—",
    correction: "Realign gear shafts. F_max must capture min 3 GMF harmonics.",
    standard: "ISO 13373-9" },
  { id: "H5", category: "Gear", name: "Cracked / Broken Tooth",
    spectrum: "Spike in time waveform every revolution of bad gear (10–20× higher than 1×RPM in FFT).",
    phase: "—",
    correction: "Best detected in time waveform, not spectrum. Replace gear immediately.",
    standard: "ISO 13373-9" },

  // I. AC Induction Motors
  { id: "I1", category: "Electrical", name: "Stator Eccentricity / Shorted Laminations",
    spectrum: "High 2× line frequency (2F_L = 120 Hz / 7200 CPM). Very directional.",
    phase: "—",
    correction: "Differential air gap > 5% (10% for sync) → investigate stator bore.",
    standard: "IEEE 841 / NEMA MG 1" },
  { id: "I2", category: "Electrical", name: "Eccentric Rotor (Variable Air Gap)",
    spectrum: "2F_L surrounded by pole pass frequency (F_p) sidebands. F_p = slip × #poles (typically 20–120 CPM).",
    phase: "—",
    correction: "Use zoom spectrum to resolve 2F_L vs running-speed harmonic.",
    standard: "IEEE 841 / NEMA MG 1" },
  { id: "I3", category: "Electrical", name: "Broken / Cracked Rotor Bar",
    spectrum: "High 1× with F_p sidebands. F_p sidebands also around 2×, 3×, 4×, 5× harmonics. Loose bar → 2F_L sidebands around RBPF.",
    phase: "—",
    correction: "Monitor RBPF (#bars × RPM) sidebands. Plan rotor repair/replacement.",
    standard: "IEEE 841 / NEMA MG 1" },
  { id: "I4", category: "Electrical", name: "Phasing Problem (Loose Connector)",
    spectrum: "2F_L peak with 1/3 F_L sidebands. Can exceed 1.0 in/s.",
    phase: "—",
    correction: "Check all electrical connections.",
    standard: "IEEE 841 / NEMA MG 1" },

  // Belt Drives
  { id: "L1", category: "Belt", name: "Worn / Loose / Mismatched Belts",
    spectrum: "3–4 multiples of belt freq. Often 2× belt freq dominant. Unsteady amplitudes.",
    phase: "—",
    correction: "Replace belts, match set lengths.",
    standard: "ISO 10816-3" },
  { id: "L2", category: "Belt", name: "Belt/Pulley Misalignment",
    spectrum: "High 1× axial of driver or driven.",
    phase: "Out-of-phase axial between motor & fan (180°).",
    correction: "Realign pulleys.",
    standard: "ISO 10816-3" },
  { id: "L3", category: "Belt", name: "Eccentric Pulleys",
    spectrum: "1× RPM of eccentric pulley, highest in-line with belts.",
    phase: "Phase H vs V ~0° or 180° (linear motion).",
    correction: "Replace eccentric pulley.",
    standard: "ISO 10816-3" },
  { id: "L4", category: "Belt", name: "Belt Resonance",
    spectrum: "High amplitude when belt natural freq ≈ motor or driven RPM.",
    phase: "—",
    correction: "Change belt tension to shift natural frequency.",
    standard: "ISO 10816-3" },
];

// ─── Quick Diagnosis Lookup with target ID ─────────────────────────────────────

export interface QuickDiagnosis {
  signature: string;
  suspect: string;
  targetPatternId: string;
}

export const QUICK_DIAGNOSIS: QuickDiagnosis[] = [
  { signature: "1× radial dominant, phase stable", suspect: "UNBALANCE", targetPatternId: "A1" },
  { signature: "1× radial + axial, phase OB≠IB", suspect: "MISALIGNMENT", targetPatternId: "M1" },
  { signature: "Many harmonics + noise floor", suspect: "LOOSENESS Type C", targetPatternId: "C3" },
  { signature: "0.4–0.48× RPM peak", suspect: "OIL WHIRL", targetPatternId: "E2" },
  { signature: "2× line freq (120 Hz) + Fp sidebands", suspect: "ROTOR ECCENTRICITY", targetPatternId: "I2" },
  { signature: "2× line freq directional (no Fp)", suspect: "STATOR ECCENTRICITY", targetPatternId: "I1" },
  { signature: "BPFI / BPFO / BSF / FTF + harmonics", suspect: "BEARING Stage 3+", targetPatternId: "F3" },
  { signature: "Ultrasonic gE / HFD elevated only", suspect: "BEARING Stage 1–2", targetPatternId: "F1" },
  { signature: "GMF + many sidebands at 1× gear", suspect: "GEAR TOOTH WEAR", targetPatternId: "H2" },
  { signature: "2GMF / 3GMF > 1GMF", suspect: "GEAR MISALIGNMENT", targetPatternId: "H4" },
  { signature: "Spike in time waveform per rev", suspect: "CRACKED/BROKEN TOOTH", targetPatternId: "H5" },
  { signature: "Random high-freq + BPF harmonics", suspect: "CAVITATION", targetPatternId: "G3" },
  { signature: "2× belt freq pulsating", suspect: "BELT WORN/LOOSE", targetPatternId: "L1" },
  { signature: "Pulsating overall amplitude (beat)", suspect: "BEAT VIBRATION", targetPatternId: "L4" },
];

// ─── Diagnostic Categories (for filter UI) ───────────────────────────────────

export const DIAGNOSTIC_CATEGORIES = [
  ...new Set(DIAGNOSTIC_PATTERNS.map(p => p.category))
];
