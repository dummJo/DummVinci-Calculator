// data/skf-microlog/learning-paths.ts
// Goal-based reading paths + dependency tree
// Source: 00-INDEX.md

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LearningGoal {
  id: "A" | "B" | "C" | "D";
  title: string;
  description: string;
  readingPath: { moduleId: string; sections?: string; note: string }[];
  timeEstimate: string;
}

export interface LearningIteration {
  title: string;
  duration: string;
  steps: string[];
}

// ─── 4 Goal-Based Reading Paths ───────────────────────────────────────────────

export const LEARNING_GOALS: LearningGoal[] = [
  {
    id: "A",
    title: "Baca vibrasi & decide kapan alarm",
    description: "Bisa membaca severity, setup velocity template, dan determine alarm level per machine type.",
    readingPath: [
      { moduleId: "01", sections: "§1–6", note: "Acceleration/velocity/displacement, kenapa hukum kuadrat speed" },
      { moduleId: "02", sections: "§2 + §4", note: "Severity tables + diagnostic chart" },
      { moduleId: "03", sections: "§1–4", note: "Analyzer setup basics" },
      { moduleId: "05", note: "Velocity template — bikin & save di dBX" },
    ],
    timeEstimate: "1–2 minggu sambil hands-on di lapangan",
  },
  {
    id: "B",
    title: "Detect bearing fault sebelum catastrophic",
    description: "Bisa deteksi bearing defect Stage 1–2 menggunakan gE enveloping sebelum terdeteksi di velocity FFT.",
    readingPath: [
      { moduleId: "01", sections: "§5", note: "Acceleration vs velocity vs displacement — kenapa high-freq butuh accel" },
      { moduleId: "02", sections: "§4 case F", note: "Rolling Element Bearings — 4 Failure Stages" },
      { moduleId: "03", sections: "§3 + §6", note: "FFT setup + math functions" },
      { moduleId: "06", note: "gE enveloping template — MOST CRITICAL" },
      { moduleId: "02", sections: "§4 case F", note: "Kembali ke diagnostic interpretation" },
    ],
    timeEstimate: "2–4 minggu sambil baseline trending pada 3–5 mesin",
  },
  {
    id: "C",
    title: "Balancing rotor sendiri",
    description: "Bisa melakukan single-plane dan multi-plane balancing menggunakan Microlog dBX.",
    readingPath: [
      { moduleId: "01", note: "Entire — theory harus kuat. Terutama Vector Diagram Method & Three-Circle Method" },
      { moduleId: "02", sections: "§4 case A", note: "Unbalance signatures — verify benar unbalance dulu" },
      { moduleId: "04", note: "Entire — balancing module reference" },
      { moduleId: "07", note: "Quick steps cheat sheet — laminate ini" },
    ],
    timeEstimate: "1–3 bulan dengan supervised practice",
  },
  {
    id: "D",
    title: "Ops manager — setup vibration program di pabrik",
    description: "Membangun program vibration monitoring: define alarm, assign template, organize workflow.",
    readingPath: [
      { moduleId: "00", note: "Bangun mental model dulu (file ini)" },
      { moduleId: "01", sections: "§1, §6", note: "Cost justification: kenapa vibrasi matters bisnisnya" },
      { moduleId: "02", sections: "§2", note: "Define alarm thresholds per equipment class" },
      { moduleId: "05", note: "Define standard velocity templates per machine class" },
      { moduleId: "06", note: "Define gE templates — diserahkan ke teknisi" },
      { moduleId: "03", note: "Skim — paham capability tool yang dimiliki team" },
    ],
    timeEstimate: "2–4 minggu study + 1–2 bulan implementasi",
  },
];

// ─── Dependency Tree ASCII Art ────────────────────────────────────────────────

export const DEPENDENCY_TREE = `                     ┌──────────────────────────┐
                     │   01 — Basic Vibration   │
                     │       (THEORY)           │
                     │  WAJIB BACA PERTAMA      │
                     └────────────┬─────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
┌──────────────────┐  ┌──────────────────────┐  ┌────────────────────┐
│  02 — Severity   │  │  03 — Analyzer       │  │  04 — Balancing    │
│     & Charts     │  │       Module         │  │      Module        │
│   (REFERENCE)    │  │      (TOOL)          │  │      (TOOL)        │
└──────────────────┘  └──────────┬───────────┘  └─────────┬──────────┘
                                 │                         │
                      ┌──────────┼──────────┐              │
                      ▼          ▼                         ▼
             ┌─────────────┐ ┌──────────────┐  ┌─────────────────────┐
             │ 05 — Velo-  │ │ 06 — gE      │  │  07 — Quick Balance │
             │ city Templ. │ │   Template   │  │      Steps          │
             │   (SOP)     │ │    (SOP)     │  │   (CHEAT SHEET)     │
             └─────────────┘ └──────────────┘  └─────────────────────┘`;

// ─── 5 Learning Iterations ────────────────────────────────────────────────────

export const LEARNING_ITERATIONS: LearningIteration[] = [
  {
    title: "Iteration 1: Survey",
    duration: "1–2 jam",
    steps: [
      "Buka semua 7 file. Baca hanya TL;DR + Mental Model di setiap file.",
      "Tujuan: dapet big picture sebelum nyemplung ke detail.",
      "End state: bisa jelasin ke orang lain dalam 1 menit apa yang ada di sini dan kenapa file-file-nya ada.",
    ],
  },
  {
    title: "Iteration 2: Deep Read",
    duration: "4–6 jam (spread 2–3 hari)",
    steps: [
      "Pick goal (A/B/C/D), baca reading path sambil isi catatan:",
      "• Konsep yang baru — list",
      "• Konsep yang dilihat dari angle baru — list",
      "• Konsep yang kira ngerti tapi sebenarnya gak — list (paling penting)",
      "Jangan skip Active Recall questions di setiap module.",
    ],
  },
  {
    title: "Iteration 3: Active Recall",
    duration: "~30 menit per module",
    steps: [
      "Tutup file. Jawab Active Recall dari memori.",
      "Yang bener → confidence calibrated",
      "Yang salah → red flag, re-read section terkait",
      "Yang gak tau jawabannya → blind spot, prioritas study berikutnya",
    ],
  },
  {
    title: "Iteration 4: Apply",
    duration: "Di lapangan",
    steps: [
      "Pilih 1 mesin di pabrik.",
      "Apply workflow lengkap (Goal A or B).",
      "Document: setup, reading, interpretation, action.",
      "Bandingkan dengan senior analyst (kalau ada). Iterate.",
    ],
  },
  {
    title: "Iteration 5: Teach",
    duration: "Most powerful",
    steps: [
      "Pilih 1 junior teknisi.",
      "Walk them through 1 file (your choice).",
      "Bisa jelasin tanpa nyontek file = paham. Masih perlu nyontek = belum.",
      "Feynman Technique: Kalau gak bisa jelasin ke 12-year-old, belum paham.",
    ],
  },
];

// ─── Cross-Cutting Pitfalls (File 00) ─────────────────────────────────────────

export const CROSS_CUTTING_PITFALLS = [
  { pitfall: "Balancing tanpa diagnose dulu", files: "01, 02, 04", note: "40% case high-vibration BUKAN unbalance" },
  { pitfall: "Pakai velocity FFT untuk bearing detect", files: "02, 06", note: "Miss Stage 1–2; pakai gE" },
  { pitfall: "Skip phase analysis", files: "01, 02, 03", note: "Phase pattern = signature ketiga, gak optional" },
  { pitfall: "Trial weight kekecilan", files: "01, 04, 07", note: "Fail 30/30 → calc garbage" },
  { pitfall: "Severity threshold gak di-adjust", files: "02", note: "Isolator/external gearbox → false alarm or missed alarm" },
  { pitfall: "Sensor mounting magnet di high-freq", files: "03, 06", note: "Above 1–2 kHz response drops; pakai stud/adhesive" },
  { pitfall: "Template generic untuk all machines", files: "05, 06", note: "Variant per machine class wajib" },
  { pitfall: "Save data di lokasi gak terorganisir", files: "03, 04", note: "Gak bisa trend kalau filing chaotic" },
  { pitfall: "Pure button-pusher, bukan analyst", files: "All", note: "Reactive maintenance, bukan predictive" },
];
