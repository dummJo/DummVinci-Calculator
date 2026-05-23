// data/skf-microlog/diagnostic-patterns-id.ts
// Indonesian translations for diagnostic patterns and quick diagnosis

export interface DiagnosticPatternTranslation {
  name: string;
  spectrum: string;
  phase: string;
  correction: string;
  standard?: string;
}

export const DIAGNOSTIC_PATTERNS_ID: Record<string, DiagnosticPatternTranslation> = {
  // A. Unbalance
  "A1": {
    name: "Unbalance Gaya (Force Unbalance)",
    spectrum: "Dominan 1× radial. Skala sebanding dengan kuadrat kecepatan.",
    phase: "OB ≈ IB horisontal & vertikal (±30°). Sudut 90° H↔V pada setiap bearing.",
    correction: "Balancing 1 bidang (single plane)",
    standard: "ISO 21940-11 / ISO 20816-1"
  },
  "A2": {
    name: "Unbalance Pasangan (Couple Unbalance)",
    spectrum: "1× radial + aksial tinggi.",
    phase: "OB vs IB berbeda fase ~180° (±30°). Sudut 90° H↔V.",
    correction: "Memerlukan ≥ 2 bidang balancing",
    standard: "ISO 21940-11 / ISO 20816-1"
  },
  "A3": {
    name: "Unbalance Dinamik (Dynamic Unbalance)",
    spectrum: "Dominan 1× radial. Kondisi default di lapangan.",
    phase: "OB vs IB berbeda fase antara 0°–180°, tetapi perbedaan H cocok dengan perbedaan V (±30°).",
    correction: "Memerlukan 2 bidang balancing",
    standard: "ISO 21940-11 / ISO 20816-1"
  },
  "A4": {
    name: "Rotor Overhung (Menggantung)",
    spectrum: "1× aksial & radial tinggi.",
    phase: "Fase aksial sefase (in-phase), fase radial tidak stabil. Selisih H cocok dengan selisih V (±30°).",
    correction: "2 bidang balancing (kombinasi gaya + pasangan)",
    standard: "ISO 21940-11 / ISO 20816-1"
  },

  // M. Misalignment
  "M1": {
    name: "Ketidaklurusan Poros (Shaft Misalignment - Angular & Offset)",
    spectrum: "1× dan 2× aksial tinggi, terkadang 2× radial. Sangat terarah sepanjang jalur poros aksial.",
    phase: "Berlawanan fase 180° (±30°) melintasi kopling (aksial H vs V, atau OB vs IB).",
    correction: "Luruskan poros menggunakan laser alignment atau dial indicator sesuai toleransi (< 0.05 mm untuk 1500 RPM).",
    standard: "ISO 13373-3 / ISO 20816-1"
  },

  // B. Eccentric Rotor
  "B1": {
    name: "Rotor Eksentris (Puli, Roda Gigi, Armature Motor)",
    spectrum: "Getaran terbesar pada 1× frekuensi putar komponen eksentris, arah getaran melintasi garis tengah kedua poros.",
    phase: "Fase H vs V biasanya 0° atau 180° (gerakan garis lurus).",
    correction: "Balancing biasanya mengurangi getaran di satu arah tetapi memperburuk arah lainnya. Perbaiki masalah fisik eksentrisitas.",
    standard: "ISO 20816-1 / ANSI S2.19"
  },

  // C. Mechanical Looseness
  "C1": {
    name: "Kelonggaran Tipe A — Struktural",
    spectrum: "1× RPM radial dominan.",
    phase: "Beda fase 90°–180° antara pengukuran vertikal pada baut, kaki mesin, dan baseplate.",
    correction: "Kencangkan baut kaki mesin, perbaiki grouting, perbaiki soft foot",
    standard: "ISO 13373-3"
  },
  "C2": {
    name: "Kelonggaran Tipe B — Pillowblock Longgar / Retakan",
    spectrum: "2× RPM radial sering kali dominan.",
    phase: "—",
    correction: "Kencangkan baut, periksa keretakan frame atau pedestal",
    standard: "ISO 13373-3"
  },
  "C3": {
    name: "Kelonggaran Tipe C — Suaian Longgar (Improper Fit)",
    spectrum: "Banyak harmonik (3×, 4×, 5×...) + bentuk gelombang terpotong (truncated) + lantai derau naik. Sering muncul subharmonik ½×, 1.5×, 2.5×.",
    phase: "Tidak stabil, bervariasi antara pengukuran.",
    correction: "Periksa suaian liner bearing, suaian poros, kekencangan impeller. Sangat terarah — periksa di setiap kenaikan sudut 30°.",
    standard: "ISO 13373-3"
  },

  // D. Rotor Rub
  "D1": {
    name: "Gesekan Rotor (Rotor Rub)",
    spectrum: "Mirip kelonggaran — banyak harmonik + lantai derau naik. Memicu frekuensi alami + subharmonik pecahan bulat (1/2, 1/3, 1/4...).",
    phase: "Bervariasi. Gesekan penuh (full annular rub) dapat memicu reverse precession → katastropik.",
    correction: "Periksa celah seal, celah bearing, ekspansi termal.",
    standard: "ISO 13373-3"
  },

  // E. Journal Bearing Problems
  "E1": {
    name: "Keausan Journal Bearing / Clearance Longgar",
    spectrum: "Deretan harmonik kecepatan putar (hingga 10–20×). Journal tergores/aus → vertikal tinggi, horisontal rendah.",
    phase: "—",
    correction: "Ganti bantalan journal (bearing shells)",
    standard: "ISO 7919-3 / ISO 20816-1"
  },
  "E2": {
    name: "Instabilitas Oil Whirl",
    spectrum: "Puncak pada 0.40–0.48× RPM. Sering kali amplitudonya parah.",
    phase: "Forward precession.",
    correction: "Periksa celah bearing (berlebih jika > 40% celah desain), tekanan oli pelumas, beban awal bearing",
    standard: "ISO 7919-3 / ISO 13373-3"
  },
  "E3": {
    name: "Oil Whip",
    spectrum: "Terjadi pada/di atas 2× frekuensi kritis rotor. Pusaran oli mengunci frekuensi kritis rotor dan menetap di sana bahkan pada RPM yang lebih tinggi.",
    phase: "Sangat tidak stabil.",
    correction: "Darurat — kondisi yang sangat tidak stabil. Kurangi kecepatan, tingkatkan beban bearing, ubah geometri bearing.",
    standard: "ISO 7919-3 / ISO 13373-3"
  },

  // F. Rolling Element Bearings
  "F1": {
    name: "Bearing Tahap 1 — Ultrasonik",
    spectrum: "Frekuensi ultrasonik (250–350 kHz, kemudian turun ke 20–60 kHz). Terdeteksi via Spike Energy (gSE), HFD(g), Shock Pulse, atau gE enveloping.",
    phase: "—",
    correction: "Pantau dengan tren gE enveloping. Biasanya ~0.25 gSE.",
    standard: "ISO 15242 / SKF Severity Stage 1"
  },
  "F2": {
    name: "Bearing Tahap 2 — Frekuensi Alami Berdering",
    spectrum: "Frekuensi alami bearing berdering (30–120 kCPM). Sidebands mulai muncul di akhir Tahap 2.",
    phase: "—",
    correction: "Rencanakan penggantian bearing. Spike energy ~0.25→0.5 gSE.",
    standard: "ISO 15242 / SKF Severity Stage 2"
  },
  "F3": {
    name: "Bearing Tahap 3 — Frekuensi Cacat Muncul",
    spectrum: "BPFI, BPFO, BSF, FTF dan harmoniknya muncul di spektrum velocity biasa. Sidebands membesar. Kerusakan fisik terlihat.",
    phase: "—",
    correction: "Ganti bearing sekarang. Spike energy ~1.0 gSE+.",
    standard: "ISO 13373-3 / SKF Severity Stage 3"
  },
  "F4": {
    name: "Bearing Tahap 4 — Katastropik",
    spectrum: "1× RPM membesar + harmonik berjalan berlipat ganda. Puncak diskret cacat bearing menghilang → digantikan lantai derau broadband acak.",
    phase: "—",
    correction: "Segera matikan mesin — kegagalan katastropik akan terjadi.",
    standard: "ISO 13373-3 / SKF Severity Stage 4"
  },

  // G. Hydraulic & Aerodynamic
  "G1": {
    name: "Blade Pass / Vane Pass (Turbulensi Impeller)",
    spectrum: "BPF = jumlah sudu × RPM. Bawaan mesin — bermasalah hanya jika amplitudo tinggi (celah tidak rata, resonansi, keausan impeller).",
    phase: "—",
    correction: "Periksa keseragaman celah rotor/stator, kelurusan pipa, celah wear ring.",
    standard: "ISO 10816-7 / HI 9.6.4"
  },
  "G2": {
    name: "Turbulensi Aliran (Flow Turbulence)",
    spectrum: "Getaran frekuensi rendah acak (50–2000 CPM) akibat variasi tekanan/kecepatan aliran.",
    phase: "—",
    correction: "Perbaiki kondisi inlet aliran, kurangi penyempitan pipa.",
    standard: "ISO 10816-7"
  },
  "G3": {
    name: "Kavitasi (Cavitation)",
    spectrum: "Broadband acak frekuensi tinggi, terkadang ditumpangi harmonik BPF. Terdengar seperti 'kerikil yang mengalir'.",
    phase: "—",
    correction: "Tingkatkan aliran masuk / NPSH. Sangat merusak impeller.",
    standard: "ISO 10816-7 / HI 9.6.4"
  },

  // H. Gears
  "H1": {
    name: "Gear Mesh Normal",
    spectrum: "Kecepatan gigi & pinion + GMF + harmonik GMF kecil dengan sideband RPM rendah.",
    phase: "—",
    correction: "Kondisi normal — tidak perlu tindakan.",
    standard: "ISO 8579-2"
  },
  "H2": {
    name: "Keausan Gigi (Tooth Wear)",
    spectrum: "Eksitasi frekuensi alami gigi + sideband pada kecepatan putar gigi. GMF 2× atau 3× sering kali lebih tinggi dari 1× GMF.",
    phase: "—",
    correction: "Rencanakan penggantian roda gigi.",
    standard: "ISO 13373-9 / AGMA 6000"
  },
  "H3": {
    name: "Eksentrisitas Gigi / Backlash Longgar",
    spectrum: "Sideband amplitudo tinggi di sekitar GMF. 1× RPM tinggi jika eksentrisitas dominan. Backlash → amplitudo GMF menurun saat beban naik.",
    phase: "—",
    correction: "Periksa kelurusan roda gigi dan celah backlash.",
    standard: "ISO 13373-9 / AGMA 6000"
  },
  "H4": {
    name: "Miskonfigurasi Roda Gigi (Gear Misalignment)",
    spectrum: "Harmonik GMF ke-2 atau lebih tinggi dengan sideband 1×. Sering kali 1× GMF kecil tetapi 2× atau 3× GMF besar.",
    phase: "—",
    correction: "Luruskan kembali poros gigi. F_max minimal harus menangkap 3 harmonik GMF.",
    standard: "ISO 13373-9"
  },
  "H5": {
    name: "Gigi Retak / Patah",
    spectrum: "Lonjakan tajam pada time waveform setiap satu putaran gigi rusak (10–20× lebih tinggi dari 1× RPM di FFT).",
    phase: "—",
    correction: "Paling baik dideteksi pada time waveform, bukan spektrum. Ganti gigi segera.",
    standard: "ISO 13373-9"
  },

  // I. AC Induction Motors
  "I1": {
    name: "Eksentrisitas Stator / Laminasi Korslet",
    spectrum: "2× frekuensi jala-jala tinggi (2F_L = 120 Hz / 7200 CPM). Sangat terarah.",
    phase: "—",
    correction: "Selisih celah udara > 5% (10% untuk sinkron) → periksa stator bore.",
    standard: "IEEE 841 / NEMA MG 1"
  },
  "I2": {
    name: "Rotor Eksentris (Celah Udara Bervariasi)",
    spectrum: "2F_L dikelilingi sideband pole pass (F_p). F_p = slip × jumlah kutub (biasanya 20–120 CPM).",
    phase: "—",
    correction: "Gunakan zoom spectrum untuk membedakan 2F_L vs harmonik kecepatan putar.",
    standard: "IEEE 841 / NEMA MG 1"
  },
  "I3": {
    name: "Batang Rotor Retak / Rusak (Broken Rotor Bar)",
    spectrum: "1× tinggi dengan sideband F_p. Sideband F_p juga muncul di sekitar harmonik 2×, 3×, 4×, 5×. Batang longgar → sideband 2F_L di sekitar RBPF.",
    phase: "—",
    correction: "Pantau sideband RBPF (jumlah batang × RPM). Rencanakan perbaikan/penggantian rotor.",
    standard: "IEEE 841 / NEMA MG 1"
  },
  "I4": {
    name: "Masalah Fase (Koneksi Longgar)",
    spectrum: "Puncak 2F_L dengan sideband 1/3 F_L. Amplitudo getaran dapat melebihi 25 mm/s.",
    phase: "—",
    correction: "Periksa semua koneksi listrik.",
    standard: "IEEE 841 / NEMA MG 1"
  },

  // Belt Drives
  "L1": {
    name: "Sabuk Aus / Longgar / Tidak Seragam",
    spectrum: "Kelipatan 3–4× frekuensi sabuk. Sering kali 2× frekuensi sabuk dominan. Amplitudo tidak stabil.",
    phase: "—",
    correction: "Ganti sabuk, gunakan satu set sabuk yang seragam.",
    standard: "ISO 10816-3"
  },
  "L2": {
    name: "Ketidaklurusan Sabuk/Puli",
    spectrum: "1× aksial tinggi dari penggerak atau beban.",
    phase: "Berlawanan fase aksial antara motor & fan (180°).",
    correction: "Luruskan posisi puli.",
    standard: "ISO 10816-3"
  },
  "L3": {
    name: "Puli Eksentris",
    spectrum: "1× RPM puli eksentris, paling tinggi searah dengan sabuk.",
    phase: "Fase H vs V ~0° atau 180° (gerakan linier).",
    correction: "Ganti puli eksentris.",
    standard: "ISO 10816-3"
  },
  "L4": {
    name: "Resonansi Sabuk",
    spectrum: "Amplitudo tinggi jika frekuensi alami sabuk ≈ RPM motor atau RPM beban.",
    phase: "—",
    correction: "Ubah ketegangan sabuk untuk menggeser frekuensi alami.",
    standard: "ISO 10816-3"
  }
};

export const QUICK_DIAGNOSIS_ID: { signature: string; suspect: string; targetPatternId: string }[] = [
  { signature: "1× radial dominan, fase stabil", suspect: "UNBALANCE", targetPatternId: "A1" },
  { signature: "1× radial + aksial, fase OB≠IB", suspect: "MISALIGNMENT", targetPatternId: "M1" },
  { signature: "Banyak harmonik + lantai derau naik", suspect: "KELONGGARAN Tipe C", targetPatternId: "C3" },
  { signature: "Puncak 0.4–0.48× RPM", suspect: "OIL WHIRL", targetPatternId: "E2" },
  { signature: "2× jala-jala (120 Hz) + sideband Fp", suspect: "EKSENTRISITAS ROTOR", targetPatternId: "I2" },
  { signature: "2× jala-jala terarah (tanpa Fp)", suspect: "EKSENTRISITAS STATOR", targetPatternId: "I1" },
  { signature: "BPFI / BPFO / BSF / FTF + harmonik", suspect: "BEARING Tahap 3+", targetPatternId: "F3" },
  { signature: "Hanya gE ultrasonik / HFD yang naik", suspect: "BEARING Tahap 1–2", targetPatternId: "F1" },
  { signature: "GMF + banyak sideband pada 1× gear", suspect: "KEAUSAN GIGI", targetPatternId: "H2" },
  { signature: "2GMF / 3GMF > 1GMF", suspect: "MISKONFIGURASI GIGI", targetPatternId: "H4" },
  { signature: "Lonjakan tajam di time waveform per rev", suspect: "GIGI RETAK/PATAH", targetPatternId: "H5" },
  { signature: "Broadband acak frekuensi tinggi + BPF", suspect: "KAVITASI", targetPatternId: "G3" },
  { signature: "2× frekuensi sabuk berdenyut", suspect: "SABUK AUS/LONGGAR", targetPatternId: "L1" },
  { signature: "Amplitudo keseluruhan berdenyut (beat)", suspect: "GETARAN BEAT", targetPatternId: "L4" }
];
