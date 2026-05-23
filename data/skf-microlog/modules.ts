// data/skf-microlog/modules.ts
// All 7 SKF Microlog learning module content
// Source: Files 01–07 from /Projects/PTTS/01_Projects/SKF-Microlog/_Data/

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModuleSection {
  title: string;
  content: string;
}

export interface ActiveRecallQuestion {
  q: string;
  hint?: string;
}

export interface PitfallEntry {
  pitfall: string;
  consequence: string;
  prevention: string;
}

export interface ModuleData {
  id: string;
  titleEn: string;
  titleId: string;
  tag: string; // THEORY | REFERENCE | TOOL | SOP | CHEAT SHEET
  icon: string;
  tldr: string;
  mentalModel: string;
  sections: ModuleSection[];
  activeRecall: ActiveRecallQuestion[];
  pitfalls: PitfallEntry[];
  cheatSheet: string;
  connections: string[]; // related module IDs
}

// ─── Module Data ──────────────────────────────────────────────────────────────

export const MODULES: ModuleData[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 01 — Basic Vibration Training
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "01",
    titleEn: "Basic Vibration Training",
    titleId: "Pelatihan Dasar Vibrasi",
    tag: "THEORY",
    icon: "📐",
    tldr: "Vibration analysis fundamentals: unbalance theory (static/couple/dynamic/overhung), L/D ratio guide for single vs dual plane, acceleration vs velocity vs displacement, centrifugal force law (F=mrω²), resonance behavior, ISO 1940 balance quality grades, and the vector diagram + three-circle balancing methods.",
    mentalModel: "Semua mesin berputar akan bervibrasi. Pertanyaannya bukan 'ada vibrasi atau tidak', tapi 'berapa besar, di frekuensi mana, dan apa artinya'. File ini = fondasi teori yang menentukan apakah lo jadi operator yang reactive atau analyst yang predictive.",
    sections: [
      { title: "Unbalance Sources", content: "Manufacturing tolerances, material buildup, erosion, corrosion, broken parts, assembly errors. Key insight: 40% high-vibration cases are NOT unbalance — diagnose first." },
      { title: "Unbalance Types", content: "Static (Force): Phase OB ≈ IB → 1 plane correction. Couple: Phase OB vs IB ~180° → min 2 planes. Dynamic: Phase between 0°–180° → 2 planes (real-world default). Overhung: High 1× axial + radial → always 2 planes." },
      { title: "L/D Ratio Guide", content: "L/D < 0.5 → Single plane (always). 0.5 < L/D < 2: RPM > 150 → try single first. L/D > 2 → Two plane (always)." },
      { title: "Acceleration vs Velocity vs Displacement", content: "High freq → acceleration dominan (g). Mid freq (10 Hz–1 kHz) → velocity (mm/s, paling universal). Low freq (<10 Hz) → displacement (μm p-p). SKF defaults velocity because ISO 10816 uses mm/s RMS." },
      { title: "Force vs Speed — Square Law", content: "F = m·r·ω². Double RPM = quadruple force. Run-down test: if vibration rises then falls during deceleration → resonance at that RPM." },
      { title: "Resonance", content: "When forcing frequency (1× RPM) hits structural natural frequency. Signs: amplitude spike + ~180° phase shift at critical speed. NEVER balance at resonance — influence coefficient unstable." },
      { title: "ISO 1940 Balance Quality Grades", content: "G 6.3 = gas turbine, large motor, pump, fan, gear (default industrial). G 2.5 = small motor, machine tool. Grade × rotor mass × operating speed → permissible unbalance." },
      { title: "Vector Diagram Method", content: "Run 0 → measure O (amplitude + phase). Add TW → Run O+T. Construct vector T (effect of TW). CW = TW × (O/|T|). Apply at calculated angle." },
      { title: "Three-Circle Method", content: "For balancing without phase ref (at resonance). 3 TW positions (A/B/C ~120° apart). Draw 3 circles. Intersection = correction point. More runs but no tachometer needed." },
      { title: "Symptoms Before Balancing", content: "5 mandatory checks: (1) Stable amplitude, (2) Stable phase ±2°, (3) Energy at 1× dominant, (4) Predominant radial, (5) Phase shifts 90° when sensor rotated 90°." },
    ],
    activeRecall: [
      { q: "Kenapa centrifugal force naik kuadrat terhadap RPM?", hint: "F = m·r·ω²" },
      { q: "Beda static vs couple unbalance pakai phase reading?", hint: "OB vs IB phase" },
      { q: "Apa 30/30 rule?", hint: "Trial weight effect minimum" },
      { q: "Vector diagram method dalam 3 langkah inti?" },
      { q: "Kapan three-circle method lebih tepat?" },
      { q: "ISO 1940 grade berapa untuk pompa industri?" },
      { q: "5 symptom sebelum mulai balancing?" },
      { q: "L/D = 0.3, single atau dual plane?" },
      { q: "Konsekuensi balancing di RPM dekat critical speed?" },
      { q: "Formula trial weight — sebutkan variabel dan dimensinya." },
    ],
    pitfalls: [
      { pitfall: "Langsung balancing tanpa diagnose", consequence: "40% kasus bukan unbalance", prevention: "Cek 5 symptoms dulu" },
      { pitfall: "Balancing di resonance", consequence: "Influence coefficient gak stabil", prevention: "Bump test / run-down dulu" },
      { pitfall: "Trial weight terlalu kecil", consequence: "Gagal 30/30 rule → calc garbage", prevention: "Pakai rumus, jangan kira-kira" },
      { pitfall: "Radius TW ≠ CW", consequence: "Proportional calc salah", prevention: "Mark posisi, pakai radius sama" },
      { pitfall: "TW gak di-remove sebelum CW", consequence: "Vektor double", prevention: "Selalu lepas TW kecuali set Remain" },
      { pitfall: "Sensor mounting longgar", consequence: "False high-freq reading", prevention: "Stud/adhesive, bukan magnet" },
      { pitfall: "Skip phase consistency check", consequence: "Spurious results", prevention: "Phase harus ±2° stable" },
    ],
    cheatSheet: `DECISION TREE — Balancing Job
1. Vibrasi tinggi? → Cek 1× dominan, radial, phase stable
2. Bukan unbalance? → STOP. Diagnose (looseness/align/bearing)
3. Resonance? → Run-down test → pilih RPM jauh dari critical
4. L/D? → <0.5 single, >2 dual, in-between coba single first
5. Tipe? → Static (OB=IB), Couple (180°), Dynamic (varies)
6. Verify? → Compare final vs ISO 1940 tolerance

FORMULAS:
F = m·r·ω² (centrifugal force)
TW(g) = (0.01·M·F) / (R·(RPM/1000)²)
CW = TW × (O / T)
30/30 rule: TW must change ≥30% amplitude OR ≥30° phase`,
    connections: ["02", "03", "04"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 02 — Severity & Diagnostic Charts
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "02",
    titleEn: "Vibration Severity & Diagnostic Charts",
    titleId: "Tabel Severity Vibrasi & Diagram Diagnostik",
    tag: "REFERENCE",
    icon: "📊",
    tldr: "Two critical references: (1) Severity table (Figure 13) with alarm thresholds per machine type in mm/s RMS, and (2) Illustrated Vibration Diagnostic Chart (Table I) — 30+ fault signatures covering unbalance, looseness, bearing stages, gears, electrical, belts, and hydraulic problems.",
    mentalModel: "File ini = kamus diagnosis. Lo gak hafal semuanya — lo tahu cara navigasinya. Severity table = 'berapa terlalu banyak?' Diagnostic chart = 'kalau spectrum kayak gini, masalahnya apa?'",
    sections: [
      { title: "Severity Table (Figure 13)", content: "Machine-specific alarm thresholds from Technical Associates. Covers: cooling towers, compressors, blowers/fans, motors/generators, chillers, turbines, pumps, machine tools. Alarm 1 = warning, Alarm 2 = fault." },
      { title: "Adjustment Factors", content: "Vibration isolator mounted: +30-50% threshold. External gearbox: +25%. New/rebuilt acceptance: ~33% of Alarm 1." },
      { title: "ISO 20816 General Zones", content: "When machine-specific data unavailable: Zone A (<2.8 mm/s) Good, B (2.8–4.5) Satisfactory, C (4.5–7.1) Unsatisfactory, D (>7.1) Unacceptable." },
      { title: "Diagnostic Chart — Unbalance", content: "Force (A1): 1× radial dominant. Couple (A2): 1× + high axial, OB vs IB ~180°. Dynamic (A3): default real-world. Overhung (A4): high 1× axial + radial." },
      { title: "Diagnostic Chart — Looseness & Rub", content: "Type A: structural, 1× dominant. Type B: loose pillowblock, 2× dominant. Type C: improper fit, many harmonics + subharmonics. Rub: excites natural resonances." },
      { title: "Diagnostic Chart — Bearings", content: "Stage 1: ultrasonic (250–350 kHz). Stage 2: natural freq ring (30–120 kCPM). Stage 3: BPFI/BPFO/BSF visible. Stage 4: broadband noise, catastrophic." },
      { title: "Diagnostic Chart — Gears", content: "Normal: GMF + small harmonics. Wear: 2× or 3× GMF > 1× GMF. Eccentricity: high sidebands. Misalignment: higher harmonics. Cracked tooth: spike per revolution in time waveform." },
      { title: "Diagnostic Chart — Electrical", content: "Stator eccentricity: 2× line freq (120 Hz). Eccentric rotor: 2F_L + pole pass sidebands. Broken rotor bar: 1× + F_p sidebands." },
      { title: "Diagnostic Chart — Hydraulic & Belts", content: "Blade pass: #blades × RPM. Cavitation: random HF broadband. Belt: 3–4× belt freq, often 2× dominant." },
    ],
    activeRecall: [
      { q: "Alarm 1 dan Alarm 2 untuk pompa centrifugal horizontal?" },
      { q: "Kapan apply adjustment factor isolator?" },
      { q: "ISO 20816 Zone C — berapa range mm/s?" },
      { q: "Bearing Stage 1 — di frequency range berapa?" },
      { q: "Bedakan looseness Type B vs Type C dari spectrum?" },
      { q: "Oil whirl di frequency berapa terhadap RPM?" },
      { q: "Stator vs rotor eccentricity — beda spectrum-nya?" },
      { q: "Gear misalignment — GMF harmonic mana yang dominan?" },
      { q: "Cavitation — deskripsi spectrum-nya?" },
      { q: "Bearing Stage 4 — kenapa discrete peaks malah hilang?" },
    ],
    pitfalls: [
      { pitfall: "Pakai alarm threshold generic", consequence: "False alarm atau missed alarm per machine type", prevention: "Cari machine-specific di Figure 13" },
      { pitfall: "Lupa adjustment factor isolator", consequence: "Alarm terlalu ketat", prevention: "Cek mounting type" },
      { pitfall: "Bingung 2× line freq vs 2× RPM", consequence: "Salah diagnose electrical vs mechanical", prevention: "2F_L = 120 Hz (fixed), 2× RPM varies with speed" },
      { pitfall: "Diagnose dari 1 peak saja", consequence: "Miss combination faults", prevention: "Check entire spectrum + phase + time waveform" },
      { pitfall: "Skip time waveform untuk gear fault", consequence: "Miss cracked tooth", prevention: "Time waveform shows spike per revolution" },
    ],
    cheatSheet: `QUICK DIAGNOSIS:
1× radial dominant, phase stable → UNBALANCE
1× radial + axial, phase OB≠IB → MISALIGNMENT
Many harmonics + noise floor → LOOSENESS Type C
0.4–0.48× RPM peak → OIL WHIRL
2× line freq + Fp sidebands → ROTOR ECCENTRICITY
BPFI/BPFO/BSF + harmonics → BEARING Stage 3+
Ultrasonic gE elevated only → BEARING Stage 1–2
GMF + many sidebands → GEAR WEAR
Random HF broadband → CAVITATION

ISO 20816 QUICK:
A: <2.8 mm/s  B: 2.8–4.5  C: 4.5–7.1  D: >7.1`,
    connections: ["01", "03", "06"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 03 — dBX Analyzer Module
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "03",
    titleEn: "dBX Analyzer Module",
    titleId: "Modul Analyzer dBX",
    tag: "TOOL",
    icon: "🔬",
    tldr: "Analyzer Module = real-time vibration acquisition + post-analysis on Microlog dBX. 4 modes: Real-Time Analysis, Raw Data Recording, Playback Analysis, Real-Time + Raw. Plus Data Review for offline math (FFT, integration, differentiation, filters, gE enveloping). Up to 4 channels, 6 cursor types, export to CSV/UFF/XML.",
    mentalModel: "Analyzer = oscilloscope + spectrum analyzer + recorder in one tool. Setup as pipeline: Sensor → Engineering Unit → FFT Computation → Plot → Cursor/Analysis. Misconfigure any stage = garbage downstream.",
    sections: [
      { title: "4 Operational Modes", content: "Real-Time Analysis: live FFT/order tracking. Raw Data Recording: save waveform to disk. Playback: replay file as if live. Real-Time + Raw: combo (live + backup)." },
      { title: "Channel Setup", content: "CH1/CH2 for sensors (CH5 = tacho always). Coupling: ICP (powered accel default). Sensitivity: must match sensor datasheet (100 mV/g typical). Detection: RMS (ISO standard). Display: mm/s velocity." },
      { title: "FFT Setup", content: "F_max: 1000 Hz (overall), 50× RPM (bearing), 3.25× GMF (gear). Lines: 1600 default (Δf = F_max/Lines). Averaging: Linear, 4 avg, 50% overlap. Window: Hanning default." },
      { title: "Phase Analysis", content: "Requires tacho on CH5. Critical for: static vs couple unbalance, misalignment detection (180° axial OB vs IB), resonance crossing verification." },
      { title: "Mathematical Functions", content: "FFT/Inverse FFT, Integration (accel → velocity → displacement), Differentiation, Weighting (A/B/C), Filters (HP/LP/BP), gE enveloping (offline). Apply post-acquisition without returning to field." },
      { title: "Data Export", content: "CSV (Excel), UFF (Universal File Format — MEScope compatible for ODS), XML (custom systems), ASCII (raw text fallback)." },
    ],
    activeRecall: [
      { q: "4 operational mode Analyzer Module?" },
      { q: "ICP vs AC coupling — kapan pakai mana?" },
      { q: "F_max untuk mesin 1500 RPM curiga bearing?" },
      { q: "RMS vs Peak — yang mana standard severity?" },
      { q: "HP filter 5 Hz — kapan modifikasi?" },
      { q: "Hanning vs Flat-top — kapan pakai mana?" },
      { q: "Apa yang terjadi kalau Lines terlalu rendah?" },
      { q: "dBX hitung velocity dari accelerometer gimana?" },
      { q: "Phase analysis — channel mana untuk tacho?" },
      { q: "Export format untuk ODS tools (MEScope)?" },
    ],
    pitfalls: [
      { pitfall: "ICP coupling tanpa sensor ICP", consequence: "Open circuit / no signal", prevention: "Cek datasheet sensor" },
      { pitfall: "Salah sensitivity (mV/g)", consequence: "Reading off by factor 10×", prevention: "Cross-check sensor label" },
      { pitfall: "F_max kerendahan untuk bearing", consequence: "Miss BPFO/BPFI", prevention: "Pakai 50× RPM" },
      { pitfall: "Lines kerendahan (400)", consequence: "Peak mix dengan adjacent", prevention: "Min 1600 lines" },
      { pitfall: "Detection Peak untuk ISO compare", consequence: "Mismatch (ISO pakai RMS)", prevention: "Selalu RMS untuk severity" },
      { pitfall: "Tacho di channel salah", consequence: "Phase reading wrong", prevention: "Tacho HARUS di CH5" },
      { pitfall: "Lupa save template", consequence: "Setup ulang tiap kali", prevention: "Save as Project" },
    ],
    cheatSheet: `ANALYZER QUICK SETUP:
Coupling:  ICP (default accelerometer)
Detection: RMS (match ISO 10816)
Display:   mm/s velocity
HP filter: 5 Hz
Window:    Hanning
F_max:     1000 Hz (overall), 50×RPM (bearing), 3.25×GMF (gear)
Lines:     1600 (default), 6400 (zoom)
Averages:  4 linear, 50% overlap
Trigger:   Free Run (or Tacho for phase)
Waterfall: Disabled (enable for transient only)

CHANNEL MAP: CH1,CH2 = Accel | CH5 = Tacho (always)
LAYOUT: 2-tile default = Spectrum + Waveform`,
    connections: ["01", "02", "05", "06"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 04 — dBX Balancing Module
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "04",
    titleEn: "dBX Balancing Module",
    titleId: "Modul Balancing dBX",
    tag: "TOOL",
    icon: "⚖️",
    tldr: "Wizard that automates vector method (1-plane) and influence coefficient method (multi-plane). Configurations: 1/2/3/4 plane, Cantilevered, 3-Balancer. Logic is always the same: Reference → Trial → Correction → Trim/Refinement. ISO 1940 tolerance built-in. 30/30 rule enforcement.",
    mentalModel: "GPS navigation for balancing. You set destination (ISO tolerance). GPS calibrates position (Reference Run), measures direction (Trial Run), recalculates route (Correction), and re-routes if needed (Refinement).",
    sections: [
      { title: "6 Configuration Modes", content: "One Plane (L/D<0.5, 1 trial run). Two Planes (default, 2 trial runs, 4 influence coefficients). Three/Four Planes (long shafts). Cantilevered (overhung rotor). 3-Balancers (fixed weight positions at 0°/120°/240°)." },
      { title: "Pre-Balance Diagnostics", content: "ICP Bias Check: verify sensor+cable (Short/Normal/Open). ICP Power Check: verify Microlog power supply (~25.6V). Run BEFORE any balancing session." },
      { title: "ISO 1940 Tolerance", content: "Configure: Grade (G6.3 default industrial), Rotor Mass (kg), Max Speed (RPM), Radius (mm). Software calculates permissible unbalance automatically." },
      { title: "Phase Correction", content: "Direction of rotation (CW/CCW), Tachometer angle, Accelerometer angle. Maps software phase to physical rotor position." },
      { title: "30/30 Rule", content: "Trial weight must produce: ≥30% amplitude change OR ≥30° phase shift OR combination. Fail = TW too small → calc not accurate." },
      { title: "Correction Weight Output", content: "Mass (g), Phase angle (°), Residual prediction. Tools: split weight into 2 angles, adjust to nearest standard mass." },
      { title: "Save & Resume", content: "Save as .bal file. Can continue mid-procedure next day or redo from saved reference data." },
    ],
    activeRecall: [
      { q: "6 mode konfigurasi Balancing Module?" },
      { q: "ICP Bias Check — apa yang dilakukan?" },
      { q: "30/30 rule dengan kata sendiri?" },
      { q: "Kenapa 2-plane butuh 2 trial runs terpisah?" },
      { q: "Remove vs Remain pada TW setting?" },
      { q: "Test Weight Estimator formula — variabelnya?" },
      { q: "Fan 100kg 1500 RPM — ISO 1940 grade?" },
      { q: "Kapan Cantilevered mode bukan One Plane?" },
      { q: "Manual Entry mode — fungsinya?" },
      { q: "V1 above tolerance — langkah berikutnya?" },
    ],
    pitfalls: [
      { pitfall: "Skip ICP Bias Check", consequence: "30 menit baru sadar sensor mati", prevention: "Always run before start" },
      { pitfall: "Salah pilih # planes", consequence: "Procedure lebih lama, residual sama", prevention: "Cek L/D ratio (File 01)" },
      { pitfall: "ISO Grade salah", consequence: "Over-balance (waste) atau under-balance", prevention: "Default G 6.3 most industrial" },
      { pitfall: "TW terlalu kecil → fail 30/30", consequence: "CW result salah", prevention: "Pakai estimator atau double TW" },
      { pitfall: "Phase correction salah", consequence: "CW dipasang di tempat salah", prevention: "Triple-check di setup" },
      { pitfall: "Skip refinement", consequence: "Borderline result → balik lagi", prevention: "Always trim below tolerance" },
      { pitfall: "Coast-down belum selesai saat kerja", consequence: "Safety hazard", prevention: "LOCKOUT/TAGOUT setiap stop" },
    ],
    cheatSheet: `SINGLE-PLANE FLOWCHART:
1. STOP — Setup: mode, tolerance, phase, ICP check
2. SPIN — Reference run (V0)
3. STOP — Attach Trial Weight (TW)
4. SPIN — Trial run (VT1) → verify 30/30
5. STOP — Install Correction Weight (CW), remove TW
6. SPIN — Correction run (V1) → check vs tolerance
7. STOP+SPIN — Refinement loop (if V1 > tolerance)
8. SAVE — Job file for documentation

TROUBLESHOOTING:
Reading unstable → Check sensor mount
Phase wandering → Check tacho signal
TW no effect → Bigger TW (use estimator)
CW wrong way → Phase correction off by 180°
Won't converge → Maybe NOT unbalance`,
    connections: ["01", "02", "03", "07"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 05 — Velocity Measurement Template
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "05",
    titleEn: "Velocity Measurement Template",
    titleId: "Template Pengukuran Velocity",
    tag: "SOP",
    icon: "📋",
    tldr: "Standardized Analyzer setup for overall velocity (mm/s RMS) severity assessment. Save once, reuse forever. Key: ICP coupling, Hanning window, RMS detection, mm/s display, 5 Hz HP filter, 1000 Hz F_max, 1600 lines, 4 linear averages 50% overlap, Overall as Bar chart.",
    mentalModel: "Camera profile for vibration measurement. Profile 'Velocity' has specific ISO/shutter/aperture. Don't setup every shot — pick profile. Two essential profiles: Velocity (this) and gE Enveloping (File 06).",
    sections: [
      { title: "Why Velocity (mm/s)?", content: "Velocity RMS = energy representation, most stable across typical rotating machinery frequency range (10 Hz–1 kHz). ISO 10816/20816 standard uses velocity RMS. File 02 severity tables all in mm/s RMS." },
      { title: "Why RMS Detection?", content: "RMS = average energy (comparable across machines, ISO standard). Peak = max instantaneous (for impacts). Peak-to-Peak = total swing (bearing oil film). Match detection to standard." },
      { title: "HP Filter 5 Hz", content: "Removes DC drift from integration, rejects structural low-freq noise. Override to 2 Hz only for machines < 300 RPM." },
      { title: "Window = Hanning", content: "Best amplitude/frequency balance. Flat-top for calibration/single-tone. Rectangular for synchronized signals only." },
      { title: "Template Setup Steps", content: "12 stages: Open → Mode (Real-time) → Analyzer Setup → Channel (ICP, sensitivity) → Engineering Unit (RMS, mm/s, 5Hz) → FFT Function (TWF+Spectrum+Overall) → FFT Freq (F_max, 1600 lines) → FFT Avg (Lin, 4, 50%) → Trigger OFF → Waterfall OFF → Layout (Overall=Bar) → Save As." },
      { title: "Per-Machine F_max Variants", content: "Low-RPM (<300): 200 Hz (HP→2Hz). General industrial (1500–3600): 1000 Hz. High-speed turbine (≥10000): 5000–10000 Hz. Multi-stage compressor: 2000 Hz." },
    ],
    activeRecall: [
      { q: "Kenapa coupling ICP, bukan AC atau DC?" },
      { q: "Detection Peak dibanding severity table RMS — apa yang terjadi?" },
      { q: "HP filter 5 Hz — kapan modifikasi dan ke berapa?" },
      { q: "Hanning vs Flat-top — kapan pilih Flat-top?" },
      { q: "Overall plot Bar chart — kenapa bukan Line?" },
      { q: "F_max 1000 Hz cover berapa harmonics untuk mesin 3600 RPM?" },
      { q: "Kenapa Waterfall disabled untuk velocity overall?" },
      { q: "Cara open saved template?" },
      { q: "RMS = energy representation — jelaskan." },
      { q: "Kapan enable Channel 2?" },
    ],
    pitfalls: [
      { pitfall: "Lupa HP filter 5 Hz", consequence: "Overall meledak dari low-freq drift", prevention: "Always in template" },
      { pitfall: "Detection Peak vs ISO RMS", consequence: "Reading 1.4× too high (√2 factor)", prevention: "Always RMS for severity" },
      { pitfall: "Display unit g bukan mm/s", consequence: "Apples to oranges", prevention: "Set di Engineering Unit" },
      { pitfall: "F_max kerendahan", consequence: "Miss harmonics + alias risk", prevention: "≥ 2.56× highest expected freq" },
      { pitfall: "Averaging skip (# = 1)", consequence: "Spectrum jittery", prevention: "Min 4 linear" },
      { pitfall: "Pakai template lama setelah ganti sensor", consequence: "Sensitivity mismatch", prevention: "Update sensitivity tiap ganti sensor" },
    ],
    cheatSheet: `VELOCITY TEMPLATE CHECKLIST:
Mode:       Real-time analysis
Channel:    ☑ FFT Ch 1
Coupling:   ICP
Window:     Hanning
Detection:  RMS
Display:    mm/s (Velocity)
HP filter:  5 Hz
FFT:        ☑ Time wave ☑ Spectrum ☑ Overall
F_max:      1000 Hz (default)
Lines:      1600
Averages:   Linear, 4 avg, 50% overlap
Trigger:    OFF (Free Run)
Waterfall:  OFF
Overall:    Bar chart
Save:       STD_VEL_OVERALL.dbx`,
    connections: ["01", "02", "03", "06"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 06 — gE Enveloping Template
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "06",
    titleEn: "gE Enveloping Measurement Template",
    titleId: "Template Pengukuran gE Enveloping",
    tag: "SOP",
    icon: "🎯",
    tldr: "gE (gravitational acceleration Envelope) = demodulation technique to detect bearing impact BEFORE visible in velocity FFT. Isolates repetitive impacts from rolling element bearings. Critical difference from velocity: bandpass filter 500 Hz–10 kHz, gE filter trend enabled. Stages 1–2 detection = this file's raison d'être.",
    mentalModel: "Velocity FFT = hearing music in a noisy restaurant. gE Enveloping = noise-cancelling headphones that amplify whispers. Process: bandpass → rectify → envelope detection → FFT of envelope → BPFI/BPFO/BSF/FTF peaks appear.",
    sections: [
      { title: "What is gE?", content: "Gravitational acceleration Envelope. Measures impact severity, not steady-state vibration. Levels: <0.5 healthy, 0.5–1.0 early defect (Stage 1–2), 1.0–2.0 active defect (Stage 3), >2.0 severe." },
      { title: "Why Stage 1–2 Invisible in Velocity?", content: "Stage 1: ultrasonic (250–350 kHz). Stage 2: bearing natural freq (30–120 kCPM). Both above velocity FFT range. By Stage 3, damage is already significant." },
      { title: "Bandpass Filter Selection", content: "5–100 Hz: <100 RPM. 50 Hz–1 kHz: 100–500 RPM. 500 Hz–10 kHz: standard industrial (most common). 5–40 kHz: high-speed >10000 RPM. Must be HIGHER than dominant machine energy." },
      { title: "gE Trend vs Single Reading", content: "Single reading = weak evidence. Trend over time = strong. Flat low = healthy. Slow upward = developing defect. Sudden spike = impact/lube issue." },
      { title: "Template Setup Steps", content: "Same base as velocity template, but: FFT Function = gE filter trend + Waveform + Spectrum. gE bandpass = 500 Hz–10 kHz default. F_max envelope = 500 Hz. Trend plot as Bar." },
      { title: "Diagnostic Workflow", content: "Load gE template → measure at bearing housing → read gE trend (compare baseline) → read gE spectrum (look for BPFO/BPFI/BSF/FTF peaks) → combine with velocity for 2×2 diagnosis matrix." },
    ],
    activeRecall: [
      { q: "Velocity FFT vs gE — apa yang di-detect berbeda?" },
      { q: "Kenapa Stage 1–2 invisible di velocity FFT?" },
      { q: "gE bandpass default industrial pump 1800 RPM?" },
      { q: "Unit gE — apa physical meaning?" },
      { q: "F_max gE spectrum untuk cover 3× BPFI?" },
      { q: "gE Trend lebih powerful dari single reading — kenapa?" },
      { q: "HP filter 5 Hz vs gE bandpass — bedanya?" },
      { q: "gE naik tapi spectrum flat — interpretasi?" },
      { q: "Velocity naik tapi gE flat — interpretasi?" },
      { q: "Kenapa template gE terpisah dari velocity?" },
    ],
    pitfalls: [
      { pitfall: "Bandpass terlalu rendah (<500 Hz)", consequence: "Contaminated unbalance/misalignment", prevention: "Set ≥ 500 Hz industrial" },
      { pitfall: "Bandpass terlalu tinggi di slow machine", consequence: "Miss bearing natural freq", prevention: "Adjust per RPM table" },
      { pitfall: "Cuma 1 reading tanpa baseline", consequence: "Gak bisa judge trend", prevention: "Build 3–5 baseline readings" },
      { pitfall: "Sensor magnet mount di high-freq", consequence: "Response drop >1–2 kHz", prevention: "Stud/adhesive mount" },
      { pitfall: "1× RPM peak = bearing fault", consequence: "False alarm (1× = residual unbalance)", prevention: "BPFI/BPFO di non-integer × RPM" },
      { pitfall: "gE pada sleeve bearing", consequence: "Useless (no rolling element impact)", prevention: "Cek bearing type dulu" },
      { pitfall: "Measurement saat varying load", consequence: "Inconsistent reading", prevention: "Standardize steady-state" },
    ],
    cheatSheet: `gE TEMPLATE CHECKLIST:
Mode:       Real-time analysis
Coupling:   ICP
Window:     Hanning
Detection:  RMS
Display:    mm/s (display), gE (trend)
HP filter:  5 Hz
FFT:        ☑ gE filter trend ☑ Waveform ☑ Spectrum
gE bandpass: 500 Hz – 10 kHz (default industrial)
F_max:      500 Hz (envelope)
Lines:      1600
Averages:   4 linear, 50% overlap

gE FILTER PER MACHINE:
Very slow (<100 RPM):    5–100 Hz
Slow (100–500 RPM):      50 Hz–1 kHz
Standard industrial:     500 Hz–10 kHz
High-speed (>10k RPM):   5–40 kHz

DIAGNOSTIC FLOW (Velocity + gE):
Vel OK + gE OK    → Healthy
Vel OK + gE rise  → Early bearing (1–2)
Vel rise + gE rise → Stage 3, plan replace
Vel rise + gE OK   → NOT bearing`,
    connections: ["01", "02", "03", "05"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 07 — Quick Balancing Steps
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "07",
    titleEn: "Quick Balancing Steps via dBX",
    titleId: "Langkah Cepat Balancing via dBX",
    tag: "CHEAT SHEET",
    icon: "⚡",
    tldr: "Field pocket card for single-plane balancing. STOP-SPIN pattern: Stop(Setup) → Spin(V0) → Stop(TW) → Spin(VT1) → Stop(CW) → Spin(V1) → Stop(Trim) → Spin(Final). Track 3 things per spin: Amplitude, Phase, RPM. Trial weight: Method, Mass, Position, After. R% tracking: 100% → <10% → <5%.",
    mentalModel: "Single-plane balancing = binary search in polar coordinates. V0 = initial position. VT1 = probe. ΔV = effect of probe. CW = -V0 × (TW/ΔV). Each iteration narrows distance to origin (zero unbalance).",
    sections: [
      { title: "8-Step STOP-SPIN Pattern", content: "1. STOP Setup → 2. SPIN V0 → 3. STOP TW → 4. SPIN VT1 (30/30 check) → 5. STOP CW → 6. SPIN V1 (tolerance check) → 7. STOP Trim → 8. SPIN Final. Every STOP = LOTO." },
      { title: "Measurement Verification", content: "Before pressing Next: RPM stable ±2, Phase stable ±2°, Amplitude consistent across averaging. If wandering → non-unbalance issue." },
      { title: "Trial Weight Entry", content: "4 fields: Method (Add/Cut), Trial Mass (gram), Position (degree from tacho ref), After (Remove/Remain). Cut = grinding/drilling. Remain = welded permanent." },
      { title: "Correction Weight Output", content: "Mass (g), Phase angle (°), R% (residual ratio). R% 100% = initial. Target <10% (in tolerance). <5% = well below. Split weight and nearest-standard-mass tools available." },
      { title: "Safety: LOTO", content: "Every STOP = full machine stop + lockout. Coast-down complete. Power isolated. Verify zero energy. Touch rotor while spinning = injury." },
      { title: "Fail Flags", content: "Phase wandering >5°: investigate non-unbalance. RPM not stable >2%: wait. 30/30 fail: bigger TW. V1 worse than V0: phase correction error. No convergence: re-diagnose (maybe NOT unbalance)." },
    ],
    activeRecall: [
      { q: "Urutan 8 step Stop-Spin pattern?" },
      { q: "4 field di Trial Weight entry?" },
      { q: "Method Add vs Cut — bedanya?" },
      { q: "R% arti dan target value?" },
      { q: "R% awal 100%, setelah CW 12% — interpretasi?" },
      { q: "Kenapa STOP wajib LOTO?" },
      { q: "RPM beda 50 RPM dari initial — OK atau problem?" },
      { q: "After = Remain — kapan dipakai?" },
      { q: "Cara verify 30/30 dari display?" },
      { q: "V1 borderline tolerance — save atau lanjut trim?" },
    ],
    pitfalls: [
      { pitfall: "Skip ICP Bias Check", consequence: "Run 30+ menit sensor mati", prevention: "Always check before proceed" },
      { pitfall: "TW position salah degree", consequence: "CW dipasang salah", prevention: "Mark angle fisik di rotor" },
      { pitfall: "Lupa LOTO sebelum touch rotor", consequence: "Safety hazard", prevention: "Procedural discipline" },
      { pitfall: "RPM beda >2% antar runs", consequence: "Influence coefficient inconsistent", prevention: "Wait RPM stable ±2" },
      { pitfall: "Lupa remove TW saat install CW", consequence: "Over-correction (TW+CW)", prevention: "Visual verify TW removed" },
      { pitfall: "Final < tolerance tapi gak save", consequence: "Next time mulai dari awal", prevention: "File → Save before LOTO" },
      { pitfall: "Phase wandering >5°", consequence: "Result not reliable", prevention: "Investigate looseness/resonance/load" },
      { pitfall: "Document hanya hasil akhir", consequence: "History lost for troubleshoot", prevention: "Save V0/VT1/V1/Vfinal + photos" },
    ],
    cheatSheet: `8 STEPS SINGLE-PLANE:
1. STOP — Setup (mode, tolerance, phase, ICP check)
2. SPIN — Initial run (V0)
3. STOP — Attach Trial Weight
4. SPIN — Trial run (VT1) → VERIFY 30/30
5. STOP — Install Correction Weight (remove TW)
6. SPIN — Correction run (V1) → check tolerance
7. STOP — Install Trim Weight (if needed)
8. SPIN — Final trim run → verify, SAVE

PER SPIN CHECKLIST:
• RPM stable ±2 RPM
• Amplitude consistent ×4 averages
• Phase stable ±2°

TRIAL WEIGHT ENTRY:
Method:   Add | Cut
Mass:     ___ g
Position: ___° (from tacho)
After:    Remove | Remain

R% TRACKING:
Initial (V0):  100%
After CW (V1): target < 10%
After Trim:    target < 5%

FAIL FLAGS — STOP & INVESTIGATE:
✗ Phase wandering > 5°
✗ RPM not stable (>2%)
✗ 30/30 fail
✗ V1 worse than V0 (check phase correction)
✗ Won't converge (re-diagnose File 01 §9)`,
    connections: ["01", "02", "04", "05"],
  },
];

// ─── Helper: Get module by ID ─────────────────────────────────────────────────

export function getModuleById(id: string): ModuleData | undefined {
  return MODULES.find(m => m.id === id);
}

// ─── Module tags for filter UI ────────────────────────────────────────────────

export const MODULE_TAGS = [...new Set(MODULES.map(m => m.tag))];
