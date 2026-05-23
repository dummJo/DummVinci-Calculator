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
  options: string[];
  correctAnswer: number;
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
      { q: "Kenapa centrifugal force naik kuadrat terhadap RPM?", options: ["Karena rumus F = m·r·ω², di mana ω adalah kecepatan sudut", "Karena massa bertambah saat berputar cepat", "Karena gesekan bantalan meningkat", "Karena resonansi struktur terjadi pada kuadrat kecepatan"], correctAnswer: 0, hint: "F = m·r·ω²" },
      { q: "Beda static vs couple unbalance pakai phase reading?", options: ["Static: phase sama, Couple: phase beda 90°", "Static: phase beda 180°, Couple: phase sama", "Static: phase OB ≈ IB, Couple: phase OB vs IB ~180°", "Tidak ada bedanya dari phase"], correctAnswer: 2, hint: "OB vs IB phase" },
      { q: "Apa 30/30 rule?", options: ["Trial weight harus mengubah 30% speed atau 30° phase", "Trial weight harus mengubah ≥30% amplitude ATAU ≥30° phase", "Harus running mesin selama 30 menit dan 30 detik", "Target residual unbalance di bawah 30 mm/s"], correctAnswer: 1, hint: "Trial weight effect minimum" },
      { q: "Vector diagram method dalam 3 langkah inti?", options: ["Reference run, Trial run, Correction", "Ukur 3 kali di kecepatan berbeda", "Hitung massa, ukur getaran, pasang weight", "Gambar 3 lingkaran, cari titik temu"], correctAnswer: 0 },
      { q: "Kapan three-circle method lebih tepat?", options: ["Saat mesin beroperasi di bawah 1000 RPM", "Saat tidak ada tachometer / phase reference", "Untuk menyeimbangkan rotor berat (lebih dari 100kg)", "Saat phase reading sangat stabil"], correctAnswer: 1 },
      { q: "ISO 1940 grade berapa untuk pompa industri?", options: ["G 1.0", "G 2.5", "G 6.3", "G 16"], correctAnswer: 2 },
      { q: "5 symptom sebelum mulai balancing?", options: ["Amplitude & phase stabil, 1× dominan, dominan radial, phase shift 90° saat sensor diputar", "Mesin baru di-overhaul, getaran > 10 mm/s, bearing panas", "Resonansi terlihat, 2× dominan, looseness tinggi", "Spectrum bersih, tidak ada harmonik, kecepatan stabil"], correctAnswer: 0 },
      { q: "L/D = 0.3, single atau dual plane?", options: ["Dual plane selalu", "Single plane", "Harus coba single dulu, kalau gagal dual", "Tiga bidang (3-plane)"], correctAnswer: 1 },
      { q: "Konsekuensi balancing di RPM dekat critical speed?", options: ["Lebih cepat mendapat hasil", "Tidak ada bedanya", "Influence coefficient tidak stabil karena phase shifting drastis", "Membutuhkan trial weight lebih kecil"], correctAnswer: 2 },
      { q: "Formula trial weight — sebutkan variabel dan dimensinya.", options: ["Massa rotor, F_max, RPM", "Massa rotor, Gaya centrifugal (biasanya 10% bobot), Radius, RPM", "Panjang rotor, Diameter, Kecepatan", "Kecepatan vibrasi, phase, radius koreksi"], correctAnswer: 1 },
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
      { q: "Alarm 1 dan Alarm 2 untuk pompa centrifugal horizontal?", options: ["Alarm 1 = 2.8, Alarm 2 = 4.5 mm/s", "Warning (Alarm 1) dan Fault (Alarm 2) merujuk threshold di Figure 13", "Alarm 1 = 4.5, Alarm 2 = 7.1 mm/s", "Sama persis dengan toleransi ISO 1940"], correctAnswer: 1 },
      { q: "Kapan apply adjustment factor isolator?", options: ["Hanya untuk mesin di atas 1000 RPM", "Saat mesin dipasang pada rigid foundation", "Saat mesin dipasang di atas vibration isolator (+30-50% threshold)", "Hanya pada mesin di bawah 300 RPM"], correctAnswer: 2 },
      { q: "ISO 20816 Zone C — berapa range mm/s?", options: ["<2.8 mm/s", "2.8–4.5 mm/s", "4.5–7.1 mm/s", ">7.1 mm/s"], correctAnswer: 2 },
      { q: "Bearing Stage 1 — di frequency range berapa?", options: ["0-100 Hz", "1× sampai 10× RPM", "30-120 kCPM", "Ultrasonic (250–350 kHz)"], correctAnswer: 3 },
      { q: "Bedakan looseness Type B vs Type C dari spectrum?", options: ["Type B: 1× dominan, Type C: 2× dominan", "Type B: 2× dominan, Type C: Banyak harmonik & subharmonik", "Type B: broadband noise, Type C: subharmonic", "Tidak bisa dibedakan lewat spectrum"], correctAnswer: 1 },
      { q: "Oil whirl di frequency berapa terhadap RPM?", options: ["Tepat di 1× RPM", "Di sekitar 0.4–0.48× RPM", "Selalu di 2× RPM", "Non-synchronous di atas 5× RPM"], correctAnswer: 1 },
      { q: "Stator vs rotor eccentricity — beda spectrum-nya?", options: ["Stator: 2× line freq (120 Hz). Rotor: 2× line freq + pole pass sidebands", "Stator: 1× RPM, Rotor: 2× RPM", "Stator: High frequency, Rotor: Low frequency", "Keduanya sama persis, butuh phase untuk membedakan"], correctAnswer: 0 },
      { q: "Gear misalignment — GMF harmonic mana yang dominan?", options: ["1× GMF saja", "Higher harmonics dari GMF (2×, 3× GMF)", "Subharmonics dari GMF", "Semua harmonik rata"], correctAnswer: 1 },
      { q: "Cavitation — deskripsi spectrum-nya?", options: ["Puncak tajam di 1× BPF (Blade Pass Freq)", "Broadband noise acak di frekuensi tinggi (Random HF broadband)", "Harmonik di kelipatan 50 Hz", "Hanya terlihat di time waveform"], correctAnswer: 1 },
      { q: "Bearing Stage 4 — kenapa discrete peaks malah hilang?", options: ["Karena bearing sudah kembali balance", "Karena defect sudah meluas/merata sehingga menghasilkan broadband noise", "Karena sensor tidak lagi bisa mendeteksi frekuensi bearing", "Karena ada penambahan pelumas"], correctAnswer: 1 },
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
      { q: "4 operational mode Analyzer Module?", options: ["Real-Time Analysis, Raw Data Recording, Playback Analysis, Real-Time + Raw", "FFT, Order Tracking, Coast-down, Bump Test", "Velocity, Acceleration, Displacement, gE Enveloping", "Single-plane, Two-plane, Three-plane, Four-plane"], correctAnswer: 0 },
      { q: "ICP vs AC coupling — kapan pakai mana?", options: ["ICP untuk tacho, AC untuk accelerometer", "ICP untuk powered accel (default), AC untuk unpowered sensor/proximity", "AC untuk semua sensor baru", "ICP untuk low frequency, AC untuk high frequency"], correctAnswer: 1 },
      { q: "F_max untuk mesin 1500 RPM curiga bearing?", options: ["1000 Hz", "5000 Hz", "50× RPM (sekitar 1250 Hz)", "10× RPM (sekitar 250 Hz)"], correctAnswer: 2 },
      { q: "RMS vs Peak — yang mana standard severity?", options: ["Peak", "Peak-to-Peak", "RMS (sesuai standar ISO)", "Average"], correctAnswer: 2 },
      { q: "HP filter 5 Hz — kapan modifikasi?", options: ["Hanya dimodifikasi menjadi 2 Hz untuk mesin lambat < 300 RPM", "Dimodifikasi menjadi 50 Hz di mesin turbin", "Tidak boleh dimodifikasi sama sekali", "Ubah menjadi 10 Hz untuk pompa"], correctAnswer: 0 },
      { q: "Hanning vs Flat-top — kapan pakai mana?", options: ["Hanning untuk calibration, Flat-top untuk default", "Hanning: Best amplitude/freq balance (default). Flat-top: untuk calibration/single-tone", "Hanning untuk high-speed, Flat-top untuk low-speed", "Sama saja, hanya beda tampilan warna"], correctAnswer: 1 },
      { q: "Apa yang terjadi kalau Lines terlalu rendah?", options: ["F_max otomatis turun", "Peak berdekatan akan tercampur (resolusi rendah)", "Proses pengukuran menjadi sangat lama", "Batere alat cepat habis"], correctAnswer: 1 },
      { q: "dBX hitung velocity dari accelerometer gimana?", options: ["Melalui hardware filter", "Diukur langsung oleh sensor", "Proses mathematical Integration dari accel (g) ke velocity (mm/s)", "Dikalibrasi dengan tabel konversi"], correctAnswer: 2 },
      { q: "Phase analysis — channel mana untuk tacho?", options: ["CH1", "CH2", "CH3", "CH5 (always)"], correctAnswer: 3 },
      { q: "Export format untuk ODS tools (MEScope)?", options: ["CSV", "UFF (Universal File Format)", "XML", "PDF"], correctAnswer: 1 },
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
      { q: "6 mode konfigurasi Balancing Module?", options: ["Unbalance, Misalignment, Looseness, Bearing, Gear, Electrical", "One Plane, Two Planes, Three Planes, Four Planes, Cantilevered, 3-Balancers", "Static, Couple, Dynamic, Overhung, Rigid, Flexible", "Add, Cut, Move, Split, Combine, Remain"], correctAnswer: 1 },
      { q: "ICP Bias Check — apa yang dilakukan?", options: ["Mengecek apakah rotor berputar", "Verify koneksi sensor+kabel (Short/Normal/Open)", "Mengukur phase reference", "Menghitung gaya sentrifugal"], correctAnswer: 1 },
      { q: "30/30 rule dengan kata sendiri?", options: ["Harus menambah berat 30 gram pada sudut 30 derajat", "Mesin harus dijalankan selama 30 menit atau suhu naik 30°", "Trial weight harus mengubah amplitude minimal 30% ATAU phase minimal 30°", "Sisa unbalance harus di bawah 30% dari awal"], correctAnswer: 2 },
      { q: "Kenapa 2-plane butuh 2 trial runs terpisah?", options: ["Untuk mengecek validitas data", "Karena harus memasang beban di dua sisi sekaligus", "Untuk menghitung 4 influence coefficients (silang antara plane 1 & 2)", "Sesuai standar ISO 1940"], correctAnswer: 2 },
      { q: "Remove vs Remain pada TW setting?", options: ["Remove: lepas trial weight sebelum Correction. Remain: dilas/permanen", "Remove: hapus data, Remain: simpan data", "Remove: turunkan RPM, Remain: pertahankan RPM", "Remove: kurangi berat, Remain: tambah berat"], correctAnswer: 0 },
      { q: "Test Weight Estimator formula — variabelnya?", options: ["RPM dan Panjang rotor", "Mass (M), Centrifugal Force limit (F), Radius (R), dan RPM", "Diameter rotor dan frekuensi resonansi", "Beban maksimal dan arus motor"], correctAnswer: 1 },
      { q: "Fan 100kg 1500 RPM — ISO 1940 grade?", options: ["G 1.0", "G 2.5", "G 6.3 (default industrial)", "G 16"], correctAnswer: 2 },
      { q: "Kapan Cantilevered mode bukan One Plane?", options: ["Saat mesin di bawah 500 RPM", "Saat rotor berat (overhung) dan unbalance berupa Couple, butuh koreksi 2 bidang", "Saat panjang rotor lebih pendek dari diameternya", "Selalu sama dengan One Plane"], correctAnswer: 1 },
      { q: "Manual Entry mode — fungsinya?", options: ["Input data dari alat lain jika sensor rusak", "Untuk kalkulasi teori tanpa menyalakan mesin", "Melanjutkan perhitungan dari data amplitude/phase yang sudah dicatat sebelumnya", "Mengkalibrasi tachometer"], correctAnswer: 2 },
      { q: "V1 above tolerance — langkah berikutnya?", options: ["Menyerah dan mengganti rotor", "Langsung copot semua beban koreksi", "Lakukan Refinement loop (trim) menggunakan data yang sudah ada", "Ulangi prosedur dari awal (V0)"], correctAnswer: 2 },
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
      { q: "Kenapa coupling ICP, bukan AC atau DC?", options: ["ICP menyuplai power untuk accelerometer internal (standard analyzer)", "AC lebih baik untuk accelerometer", "DC digunakan untuk vibrasi berfrekuensi tinggi", "ICP hanya dipakai untuk sensor proximity"], correctAnswer: 0 },
      { q: "Detection Peak dibanding severity table RMS — apa yang terjadi?", options: ["Nilai akan terlihat sama", "Reading Peak akan terlihat 1.4× lebih tinggi dari seharusnya (RMS), bikin panik palsu", "Reading Peak akan lebih rendah dari RMS", "Alat akan error"], correctAnswer: 1 },
      { q: "HP filter 5 Hz — kapan modifikasi dan ke berapa?", options: ["Tidak pernah dimodifikasi", "Dimodifikasi menjadi 50 Hz jika di luar ruangan", "Modifikasi ke 2 Hz HANYA untuk mesin lambat (< 300 RPM)", "Modifikasi ke 10 Hz untuk mengurangi noise"], correctAnswer: 2 },
      { q: "Hanning vs Flat-top — kapan pilih Flat-top?", options: ["Selalu, karena flat-top lebih rata", "Hanya saat mengukur phase", "Saat kalibrasi atau mengukur single-tone amplitude yang butuh akurasi tinggi", "Saat mesin bergetar sangat kuat"], correctAnswer: 2 },
      { q: "Overall plot Bar chart — kenapa bukan Line?", options: ["Karena lebih hemat baterai", "Bar chart langsung menunjukkan perbandingan visual terhadap batas alarm, line chart butuh trend waktu", "Line chart tidak didukung di Microlog", "Bar chart bisa diprint berwarna"], correctAnswer: 1 },
      { q: "F_max 1000 Hz cover berapa harmonics untuk mesin 3600 RPM?", options: ["Sekitar 16 harmonics (3600 RPM = 60 Hz, 1000/60 = 16.6)", "10 harmonics", "100 harmonics", "Hanya 1 harmonics utama"], correctAnswer: 0 },
      { q: "Kenapa Waterfall disabled untuk velocity overall?", options: ["Memakan banyak memori", "Waterfall hanya berguna untuk transient analysis (seperti coast-down/run-up), bukan steady-state overall", "Waterfall membuat alat hang", "Waterfall tidak didukung pada mode velocity"], correctAnswer: 1 },
      { q: "Cara open saved template?", options: ["Buat baru tiap kali", "File -> Open Setup -> Pilih file .dbx", "Harus konek ke komputer dulu", "Scan barcode mesin"], correctAnswer: 1 },
      { q: "RMS = energy representation — jelaskan.", options: ["Hanya mengukur impact terbesar", "Mewakili daya destruktif rata-rata getaran, bukan sekedar peak sesaat", "RMS adalah nilai root mean square yang selalu nol", "Tidak ada bedanya dengan Peak-to-Peak"], correctAnswer: 1 },
      { q: "Kapan enable Channel 2?", options: ["Selalu enable CH2", "Hanya kalau mesinnya besar", "Saat mengukur 2 sumbu secara bersamaan (misal Horizontal & Vertical) untuk hemat waktu", "Kalau CH1 rusak"], correctAnswer: 2 },
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
      { q: "Velocity FFT vs gE — apa yang di-detect berbeda?", options: ["Velocity: overall vibration, gE: specific defect impacts", "Keduanya mendeteksi hal yang sama", "Velocity mendeteksi impact bearing, gE mendeteksi unbalance", "Velocity untuk mesin lambat, gE untuk mesin cepat"], correctAnswer: 0 },
      { q: "Kenapa Stage 1–2 invisible di velocity FFT?", options: ["Karena tertutup noise mesin", "Frekuensinya terlalu tinggi (ultrasonic 250-350 kHz & 30-120 kCPM) di atas F_max velocity (1000 Hz)", "Karena amplitudonya sangat besar", "Karena bearing stage 1-2 belum rusak"], correctAnswer: 1 },
      { q: "gE bandpass default industrial pump 1800 RPM?", options: ["5–100 Hz", "50 Hz–1 kHz", "500 Hz–10 kHz", "5–40 kHz"], correctAnswer: 2 },
      { q: "Unit gE — apa physical meaning?", options: ["Velocity envelope", "Gravitational acceleration (g) dari sinyal yang sudah di-demodulate (Envelope)", "Displacement dalam mikron", "Peak-to-Peak energy"], correctAnswer: 1 },
      { q: "F_max gE spectrum untuk cover 3× BPFI?", options: ["100 Hz", "500 Hz (cukup untuk melihat repetisi impact dari bearing faults)", "5000 Hz", "10000 Hz"], correctAnswer: 1 },
      { q: "gE Trend lebih powerful dari single reading — kenapa?", options: ["Karena single reading gE bisa fluktuatif, trend lambat naik = bearing defect sedang berkembang", "Karena gE hanya bisa dibaca dalam bentuk trend", "Karena alat tidak bisa single reading", "Trend menunjukkan unbalance"], correctAnswer: 0 },
      { q: "HP filter 5 Hz vs gE bandpass — bedanya?", options: ["Tidak ada bedanya", "HP filter membuang frekuensi <5 Hz, gE bandpass mengisolasi area resonansi tinggi (500Hz-10kHz) sebelum demodulasi", "HP filter untuk gE, bandpass untuk velocity", "HP filter membuang noise, bandpass menambah gain"], correctAnswer: 1 },
      { q: "gE naik tapi spectrum flat — interpretasi?", options: ["Alat rusak", "Masalah pelumasan (rubbing noise tanpa impact spesifik) atau cavitation", "Bearing hancur total", "Unbalance yang parah"], correctAnswer: 1 },
      { q: "Velocity naik tapi gE flat — interpretasi?", options: ["Bukan masalah bearing (kemungkinan unbalance, misalignment, looseness struktural)", "Bearing Stage 3", "Sensor rusak", "Mesin resonansi"], correctAnswer: 0 },
      { q: "Kenapa template gE terpisah dari velocity?", options: ["Karena butuh lisensi software beda", "Karena proses akuisisinya beda (butuh hardware demodulator / digital envelope filter sebelum FFT)", "Untuk menghabiskan memori", "Karena satu channel hanya bisa satu tipe"], correctAnswer: 1 },
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
      { q: "Urutan 8 step Stop-Spin pattern?", options: ["Stop, Setup, Spin, Stop, Spin, Stop, Spin, Final", "Setup(Stop) → V0(Spin) → TW(Stop) → VT1(Spin) → CW(Stop) → V1(Spin) → Trim(Stop) → Final(Spin)", "Spin(V0) → Stop(TW) → Spin(CW) → Trim", "Tidak ada urutan pasti"], correctAnswer: 1 },
      { q: "4 field di Trial Weight entry?", options: ["Method, Mass, Position, After", "Size, Shape, Weight, Color", "Radius, RPM, Force, Mass", "Channel, Phase, Amplitude, Frequency"], correctAnswer: 0 },
      { q: "Method Add vs Cut — bedanya?", options: ["Add menambah vibrasi, Cut mengurangi vibrasi", "Add: memasang beban (baut/las), Cut: membuang beban (grinding/bor)", "Add untuk rotor besar, Cut untuk rotor kecil", "Tidak ada pilihan Cut di dBX"], correctAnswer: 1 },
      { q: "R% arti dan target value?", options: ["Radius %, target 100%", "Residual ratio (sisa unbalance vs awal). Target <10% untuk toleransi baik, <5% sangat baik", "RPM %, target <2%", "Reliability %, target >90%"], correctAnswer: 1 },
      { q: "R% awal 100%, setelah CW 12% — interpretasi?", options: ["Balancing gagal", "Vibrasi turun 88% dari awal (hampir masuk target 10%)", "Vibrasi naik 12%", "Alat rusak"], correctAnswer: 1 },
      { q: "Kenapa STOP wajib LOTO?", options: ["Agar hemat listrik", "Karena safety hazard ekstrim jika mesin berputar saat operator menyentuh rotor", "Sesuai prosedur ISO", "Agar data tersimpan"], correctAnswer: 1 },
      { q: "RPM beda 50 RPM dari initial — OK atau problem?", options: ["OK", "Problem! RPM beda = gaya sentrifugal beda (kuadratik) & influence coefficient berubah", "Bagus, berarti mesin membaik", "Tergantung ukuran rotor"], correctAnswer: 1 },
      { q: "After = Remain — kapan dipakai?", options: ["Jika trial weight dilas permanen dan tidak bisa dilepas saat memasang CW", "Selalu dipakai agar cepat", "Jika hasil balancing sudah bagus", "Jika CW tidak tersedia"], correctAnswer: 0 },
      { q: "Cara verify 30/30 dari display?", options: ["Lihat V1", "Bandingkan V0 (Reference) dengan VT1 (Trial). Harus berubah 30% ampitudo atau 30° phase", "Lihat nilai R%", "Bandingkan dengan ISO 1940"], correctAnswer: 1 },
      { q: "V1 borderline tolerance — save atau lanjut trim?", options: ["Save dan selesai", "Aman untuk dibiarkan", "Lanjut trim (Refinement) untuk menurunkan R% di bawah 10% atau 5%", "Ulang dari V0"], correctAnswer: 2 },
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
