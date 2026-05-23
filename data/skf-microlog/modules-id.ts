// data/skf-microlog/modules-id.ts
// Indonesian translations for all 7 SKF Microlog learning modules

export interface ModuleTranslation {
  tldr: string;
  mentalModel: string;
  sections: { title: string; content: string }[];
  activeRecall: { q: string; hint?: string }[];
  pitfalls: { pitfall: string; consequence: string; prevention: string }[];
  cheatSheet: string;
}

export const MODULES_ID: Record<string, ModuleTranslation> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 01 — Pelatihan Dasar Vibrasi
  // ═══════════════════════════════════════════════════════════════════════════
  "01": {
    tldr: "Dasar-dasar analisis getaran (vibrasi): teori ketidakseimbangan/unbalance (statik, couple, dinamik, overhung), panduan rasio L/D untuk balancing satu atau dua bidang, akselerasi vs kecepatan vs perpindahan (displacement), hukum gaya sentrifugal (F=mrω²), perilaku resonansi, kelas kualitas penyeimbangan ISO 1940, serta metode diagram vektor & tiga lingkaran.",
    mentalModel: "Semua mesin berputar pasti bergetar. Pertanyaannya bukan 'apakah ada getaran', melainkan 'seberapa besar, pada frekuensi berapa, dan apa maknanya'. Modul ini adalah fondasi teori yang membedakan apakah Anda akan menjadi teknisi yang reaktif atau analis yang prediktif.",
    sections: [
      { title: "Sumber Unbalance", content: "Toleransi manufaktur, akumulasi material, erosi, korosi, komponen rusak, kesalahan perakitan. Poin penting: 40% kasus getaran tinggi BUKAN disebabkan oleh unbalance — lakukan diagnosis terlebih dahulu." },
      { title: "Jenis Unbalance", content: "Statik (Gaya): Fase OB ≈ IB → koreksi 1 bidang. Couple (Pasangan): Fase OB vs IB berbeda ~180° → minimal 2 bidang. Dinamik: Fase antara 0°–180° → 2 bidang (kondisi standar di lapangan). Overhung: Vibrasi 1× tinggi pada arah aksial & radial → selalu 2 bidang." },
      { title: "Panduan Rasio L/D", content: "L/D < 0.5 → Satu bidang (selalu). 0.5 < L/D < 2: RPM > 150 → coba satu bidang dulu. L/D > 2 → Dua bidang (selalu)." },
      { title: "Akselerasi vs Kecepatan vs Perpindahan", content: "Frekuensi tinggi → akselerasi dominan (g). Frekuensi menengah (10 Hz–1 kHz) → kecepatan (mm/s, paling universal). Frekuensi rendah (<10 Hz) → perpindahan/displacement (μm p-p). SKF menggunakan kecepatan secara default karena standar ISO 10816 berbasis mm/s RMS." },
      { title: "Gaya vs Kecepatan — Hukum Kuadrat", content: "F = m·r·ω². Kecepatan RPM dua kali lipat = gaya naik empat kali lipat. Uji run-down: jika getaran naik lalu turun selama perlambatan → terdapat resonansi pada RPM tersebut." },
      { title: "Resonansi", content: "Terjadi ketika frekuensi eksitasi (1× RPM) menabrak frekuensi alami struktur. Tanda: lonjakan amplitudo + pergeseran fase ~180° pada kecepatan kritis. JANGAN PERNAH menyeimbangkan pada area resonansi — koefisien pengaruh menjadi tidak stabil." },
      { title: "Kelas Kualitas Balancing ISO 1940", content: "G 6.3 = turbin gas, motor besar, pompa, kipas, roda gigi (default industri). G 2.5 = motor kecil, mesin perkakas. Kelas × massa rotor × kecepatan operasi → sisa unbalance yang diizinkan." },
      { title: "Metode Diagram Vektor", content: "Run 0 → ukur O (amplitudo + fase). Tambahkan TW → Run O+T. Gambar vektor T (efek dari TW). CW = TW × (O/|T|). Pasang pada sudut yang dihitung." },
      { title: "Metode Tiga Lingkaran", content: "Untuk penyeimbangan tanpa referensi fase (pada area resonansi). 3 posisi TW (A/B/C berjarak ~120°). Gambar 3 lingkaran. Titik potong = lokasi koreksi. Memerlukan lebih banyak putaran tetapi tidak membutuhkan sensor tachometer." },
      { title: "Gejala Sebelum Menyeimbangkan", content: "5 pemeriksaan wajib: (1) Amplitudo stabil, (2) Fase stabil ±2°, (3) Energi dominan pada frekuensi 1×, (4) Arah radial dominan, (5) Fase bergeser 90° jika sensor diputar 90°." },
    ],
    activeRecall: [
      { q: "Kenapa gaya sentrifugal naik kuadrat terhadap RPM?", hint: "F = m·r·ω²" },
      { q: "Bagaimana membedakan unbalance statik vs couple menggunakan pembacaan fase?", hint: "Gunakan perbandingan fase OB vs IB" },
      { q: "Apa itu aturan 30/30?", hint: "Efek minimum trial weight (berat uji)" },
      { q: "Metode diagram vektor dalam 3 langkah utama?" },
      { q: "Kapan metode tiga lingkaran lebih tepat digunakan?" },
      { q: "Kelas ISO 1940 berapa yang digunakan untuk pompa industri?" },
      { q: "Sebutkan 5 gejala sebelum memulai balancing!" },
      { q: "L/D = 0.3, balancing satu bidang atau dua bidang?" },
      { q: "Apa konsekuensi melakukan balancing di dekat kecepatan kritis (resonansi)?" },
      { q: "Sebutkan rumus berat uji (trial weight) beserta variabel dan satuannya!" },
    ],
    pitfalls: [
      { pitfall: "Langsung melakukan balancing tanpa diagnosa", consequence: "40% kasus getaran tinggi bukan unbalance", prevention: "Lakukan pemeriksaan 5 gejala terlebih dahulu" },
      { pitfall: "Balancing di area resonansi", consequence: "Koefisien pengaruh menjadi tidak stabil", prevention: "Lakukan bump test / run-down test dulu" },
      { pitfall: "Berat uji (trial weight) terlalu kecil", consequence: "Melanggar aturan 30/30 → hasil kalkulasi salah", prevention: "Gunakan rumus estimasi, jangan tebak-tebak" },
      { pitfall: "Radius lokasi TW ≠ lokasi CW", consequence: "Kalkulasi proporsional menjadi tidak akurat", prevention: "Tandai posisi, pastikan menggunakan radius yang sama" },
      { pitfall: "TW tidak dilepas sebelum memasang CW", consequence: "Vektor koreksi menjadi ganda", prevention: "Selalu lepas TW kecuali memilih opsi Remain (Tetap)" },
      { pitfall: "Pemasangan sensor longgar", consequence: "Pembacaan frekuensi tinggi salah/berderau", prevention: "Gunakan stud atau lem perekat, jangan magnet biasa" },
      { pitfall: "Melewatkan pemeriksaan konsistensi fase", consequence: "Hasil kalkulasi tidak menentu", prevention: "Pastikan fase stabil dalam rentang ±2°" },
    ],
    cheatSheet: `ALUR KEPUTUSAN — Pekerjaan Balancing:
1. Vibrasi tinggi? → Cek 1× dominan, arah radial dominan, fase stabil
2. Bukan unbalance? → STOP. Lakukan diagnosa lain (looseness/misalignment/bearing)
3. Resonansi? → Lakukan run-down test → pilih RPM yang jauh dari kecepatan kritis
4. L/D? → <0.5 satu bidang, >2 dua bidang, di antaranya coba satu bidang dulu
5. Tipe? → Statik (OB=IB), Couple (180°), Dinamik (bervariasi)
6. Verifikasi? → Bandingkan hasil akhir dengan batas toleransi ISO 1940

RUMUS:
F = m·r·ω² (gaya sentrifugal)
TW(g) = (0.01·M·F) / (R·(RPM/1000)²)
CW = TW × (O / T)
Aturan 30/30: TW harus mengubah amplitudo ≥30% ATAU fase ≥30°`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 02 — Tabel Severity & Diagram Diagnostik
  // ═══════════════════════════════════════════════════════════════════════════
  "02": {
    tldr: "Dua referensi penting: (1) Tabel keparahan (Severity Table - Gambar 13) dengan batas alarm per jenis mesin dalam mm/s RMS, dan (2) Diagram Diagnostik Getaran (Tabel I) — 30+ tanda kerusakan meliputi unbalance, looseness, tahapan bearing, roda gigi, elektrikal, sabuk (belt), dan masalah hidrolik.",
    mentalModel: "File ini adalah kamus diagnosis Anda. Anda tidak perlu menghafal semuanya — cukup tahu cara mencarinya. Tabel keparahan memberi tahu 'seberapa besar getaran yang berlebihan?' sedangkan diagram diagnostik memberi tahu 'jika spektrumnya seperti ini, apa masalahnya?'",
    sections: [
      { title: "Tabel Keparahan (Gambar 13)", content: "Batas alarm spesifik mesin dari Technical Associates Charlotte. Mencakup: cooling tower, kompresor, blower/fan, motor/generator, chiller, turbin, pompa, dan mesin perkakas. Alarm 1 = peringatan, Alarm 2 = bahaya." },
      { title: "Faktor Penyesuaian (Adjustment Factors)", content: "Pemasangan isolator getaran (mount): +30-50% batas ambang. Roda gigi eksternal: +25%. Penerimaan mesin baru/rekondisi: ~33% dari batas Alarm 1." },
      { title: "Zona Umum ISO 20816", content: "Digunakan jika data spesifik mesin tidak tersedia: Zona A (<2.8 mm/s) Baik, B (2.8–4.5) Memuaskan, C (4.5–7.1) Kurang Memuaskan, D (>7.1) Tidak Dapat Diterima." },
      { title: "Bagan Diagnostik — Unbalance", content: "Gaya (A1): 1× radial dominan. Couple (A2): 1× + aksial tinggi, OB vs IB ~180° berbeda fase. Dinamik (A3): default kasus nyata. Overhung (A4): 1× aksial & radial tinggi." },
      { title: "Bagan Diagnostik — Kelonggaran (Looseness) & Gesekan", content: "Tipe A: struktural/fondasi, 1× radial dominan. Tipe B: pillowblock longgar / retak frame, 2× radial sering kali dominan. Tipe C: suaian tidak pas, banyak harmonik + bentuk gelombang terpotong + lantai derau naik. Gesekan (Rub): memicu resonansi alami." },
      { title: "Bagan Diagnostik — Bearing (Bantalan)", content: "Tahap 1: ultrasonik (250–350 kHz). Tahap 2: frekuensi alami berdering (30–120 kCPM). Tahap 3: frekuensi cacat BPFI/BPFO/BSF muncul. Tahap 4: derau broadband acak, kritis." },
      { title: "Bagan Diagnostik — Roda Gigi (Gears)", content: "Normal: GMF + harmonik kecil. Keausan: GMF 2× atau 3× > 1× GMF. Eksentrisitas: sideband tinggi. Miskonfigurasi arah: harmonik lebih tinggi. Gigi retak: lonjakan tajam per putaran pada time waveform." },
      { title: "Bagan Diagnostik — Elektrikal", content: "Eksentrisitas stator: 2× frekuensi jala-jala jembatan (120 Hz). Rotor eksentris: 2F_L + sideband pole pass. Batang rotor rusak (broken bar): 1× + sideband F_p." },
      { title: "Bagan Diagnostik — Hidrolik & Sabuk", content: "Blade pass: jumlah sudu × RPM. Kavitasi: broadband frekuensi tinggi acak (terdengar seperti kerikil). Sabuk (Belt): 3–4× frekuensi sabuk, sering kali 2× dominan." },
    ],
    activeRecall: [
      { q: "Berapa nilai Alarm 1 dan Alarm 2 untuk pompa sentrifugal horizontal umum?" },
      { q: "Kapan kita menerapkan faktor penyesuaian untuk isolator getaran?" },
      { q: "Zona C ISO 20816 — berapa rentang kecepatannya dalam mm/s?" },
      { q: "Bearing Tahap 1 — di kisaran frekuensi berapa kerusakannya terdeteksi?" },
      { q: "Bagaimana membedakan kelonggaran mekanis Tipe B vs Tipe C pada spektrum?" },
      { q: "Di frekuensi berapa oil whirl terjadi terhadap kecepatan putar RPM?" },
      { q: "Apa perbedaan spektrum eksentrisitas stator vs eksentrisitas rotor?" },
      { q: "Miskonfigurasi roda gigi — harmonik GMF mana yang biasanya dominan?" },
      { q: "Kavitasi — bagaimana deskripsi spektrumnya?" },
      { q: "Bearing Tahap 4 — kenapa puncak diskret cacat bearing malah hilang?" },
    ],
    pitfalls: [
      { pitfall: "Menggunakan batas alarm umum (generic) untuk semua mesin", consequence: "Alarm palsu atau alarm terlewat pada mesin kritis", prevention: "Gunakan batas spesifik mesin pada Gambar 13" },
      { pitfall: "Lupa menerapkan faktor penyesuaian isolator", consequence: "Batas alarm terlalu ketat sehingga sering trip palsu", prevention: "Periksa jenis dudukan/fondasi mesin" },
      { pitfall: "Bingung membedakan 2× frekuensi jala-jala vs 2× RPM", consequence: "Salah mendiagnosis masalah elektrikal vs mekanikal", prevention: "2F_L = 120 Hz (tetap), 2× RPM berubah mengikuti kecepatan motor" },
      { pitfall: "Mendiagnosis hanya dari satu puncak (peak) saja", consequence: "Melewatkan kombinasi kerusakan ganda", prevention: "Periksa seluruh spektrum + fase + bentuk gelombang waktu" },
      { pitfall: "Melewatkan waveform waktu untuk kerusakan gigi roda", consequence: "Gigi retak tunggal terlewat dari spektrum FFT biasa", prevention: "Waveform waktu menunjukkan lonjakan tajam setiap satu putaran penuh" },
    ],
    cheatSheet: `DIAGNOSIS CEPAT:
1× radial dominan, fase stabil → UNBALANCE
1× radial + aksial, fase OB≠IB → MISALIGNMENT
Banyak harmonik + lantai derau naik → KELONGGARAN Tipe C
Puncak pada 0.4–0.48× RPM → OIL WHIRL
2× frekuensi jala-jala + sideband Fp → EKSENTRISITAS ROTOR
BPFI / BPFO / BSF / FTF + harmonik → BEARING Tahap 3+
Hanya gE ultrasonik / HFD yang naik → BEARING Tahap 1–2
GMF + banyak sideband pada 1× gear → KEAUSAN GIGI
Broaband acak frekuensi tinggi → KAVITASI
2× frekuensi sabuk berdenyut → SABUK AUS/LONGGAR

RINGKASAN ISO 20816:
A: <2.8 mm/s | B: 2.8–4.5 | C: 4.5–7.1 | D: >7.1`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 03 — Modul Analyzer dBX
  // ═══════════════════════════════════════════════════════════════════════════
  "03": {
    tldr: "Modul Analyzer = akuisisi getaran waktu-nyata + analisis pasca-pengukuran pada Microlog dBX. Memiliki 4 mode: Real-Time Analysis, Raw Data Recording, Playback Analysis, dan Real-Time + Raw. Dilengkapi Data Review untuk kalkulasi offline (FFT, integrasi, filter, gE enveloping). Mendukung hingga 4 saluran (channel), 6 jenis kursor, ekspor ke CSV/UFF/XML.",
    mentalModel: "Analyzer adalah osiloskop + penganalisis spektrum + perekam dalam satu genggaman. Pikirkan sebagai pipa proses: Sensor → Unit Rekayasa → Komputasi FFT → Plot → Kursor/Analisis. Salah mengonfigurasi satu tahap saja akan merusak hasil di hilir.",
    sections: [
      { title: "4 Mode Operasi", content: "Real-Time Analysis: melihat FFT/order tracking secara langsung. Raw Data Recording: menyimpan waveform mentah ke memori. Playback: memutar ulang file rekaman seperti data langsung. Real-Time + Raw: kombinasi keduanya." },
      { title: "Konfigurasi Saluran (Channel)", content: "CH1/CH2 untuk sensor (CH5 khusus tacho). Kopling: ICP (akselerometer bertenaga bawaan). Sensitivitas: harus cocok dengan lembar data sensor (biasanya 100 mV/g). Deteksi: RMS. Tampilan: mm/s kecepatan." },
      { title: "Konfigurasi FFT", content: "F_max: 1000 Hz (umum), 50× RPM (bearing), 3.25× GMF (gear). Lines: default 1600 (Δf = F_max/Lines). Rata-rata (Averaging): Linier, 4 kali rata-rata, 50% overlap. Window: default Hanning." },
      { title: "Analisis Fase", content: "Membutuhkan tachometer pada CH5. Sangat kritis untuk mendeteksi: unbalance statik vs couple, misalignement (perbedaan 180° aksial OB vs IB), dan verifikasi resonansi kritis." },
      { title: "Fungsi Matematika", content: "FFT/Inverse FFT, Integrasi (akselerasi → kecepatan → displacement), Diferensiasi, Pembobotan (A/B/C), Filter (HP/LP/BP), gE enveloping offline. Memungkinkan analisis pasca-akuisisi tanpa perlu kembali ke lapangan." },
      { title: "Ekspor Data", content: "CSV (Excel), UFF (Universal File Format — kompatibel dengan MEScope untuk ODS), XML, ASCII (mentah)." },
    ],
    activeRecall: [
      { q: "Sebutkan 4 mode operasi di Modul Analyzer!" },
      { q: "ICP vs AC coupling — kapan kita menggunakan masing-masing?" },
      { q: "Berapa F_max untuk mesin 1500 RPM jika mencurigai kerusakan bearing?" },
      { q: "RMS vs Peak — mana yang digunakan sebagai standar tabel keparahan?" },
      { q: "Kapan kita perlu memodifikasi HP filter 5 Hz bawaan?" },
      { q: "Hanning vs Flat-top — kapan kita memilih Flat-top?" },
      { q: "Apa dampak negatif jika jumlah Lines diatur terlalu rendah?" },
      { q: "Bagaimana dBX menghitung kecepatan (velocity) dari sensor akselerometer?" },
      { q: "Analisis fase — saluran (channel) mana yang wajib digunakan untuk tacho?" },
      { q: "Format ekspor apa yang digunakan untuk ODS (MEScope)?" },
    ],
    pitfalls: [
      { pitfall: "Mengaktifkan kopling ICP pada sensor non-ICP", consequence: "Sirkuit terbuka / tidak ada sinyal sama sekali", prevention: "Periksa lembar data sensor yang digunakan" },
      { pitfall: "Salah memasukkan sensitivitas (mV/g)", consequence: "Pembacaan salah dengan faktor pengali hingga 10×", prevention: "Cek label kalibrasi pada sensor" },
      { pitfall: "F_max terlalu rendah untuk analisis bearing", consequence: "Melewatkan frekuensi cacat BPFO/BPFI", prevention: "Gunakan F_max minimal 50× RPM" },
      { pitfall: "Mengatur Lines terlalu rendah (misal 400)", consequence: "Puncak frekuensi yang berdekatan menyatu", prevention: "Gunakan minimal 1600 lines" },
      { pitfall: "Menggunakan deteksi Peak untuk perbandingan ISO", consequence: "Hasil pembacaan tidak sesuai standar (ISO menggunakan RMS)", prevention: "Selalu atur deteksi ke RMS untuk severity" },
      { pitfall: "Tachometer dipasang di saluran selain CH5", consequence: "Pembacaan sudut fase salah", prevention: "Tachometer HARUS dipasang di CH5" },
    ],
    cheatSheet: `KONFIGURASI CEPAT ANALYZER:
Kopling (Coupling): ICP (default akselerometer)
Deteksi (Detection): RMS (sesuai ISO 10816)
Tampilan (Display):  mm/s (Kecepatan)
Filter HP:           5 Hz
Tingkap (Window):    Hanning
F_max:               1000 Hz (overall), 50×RPM (bearing), 3.25×GMF (gear)
Lines:               1600 (default), 6400 (zoom)
Rata-rata:           4 linier, 50% overlap
Pemicu (Trigger):    Free Run (atau Tacho untuk fase)
Waterfall:           Dinonaktifkan (aktifkan hanya untuk transien)

PETA SALURAN: CH1, CH2 = Akselerometer | CH5 = Tachometer (selalu)
TATA LETAK: Default 2 ubin = Spektrum + Waveform`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 04 — Modul Balancing dBX
  // ═══════════════════════════════════════════════════════════════════════════
  "04": {
    tldr: "Asisten (wizard) yang mengotomatisasi metode vektor (1 bidang) dan metode koefisien pengaruh (multi-bidang). Konfigurasi: 1/2/3/4 bidang, Cantilevered (overhung), dan 3-Balancer. Logika alur selalu sama: Referensi → Berat Uji (Trial) → Koreksi → Trim/Refinement. Batas toleransi ISO 1940 terintegrasi dengan penegakan aturan 30/30.",
    mentalModel: "Balancing adalah seperti navigasi GPS. Anda menetapkan tujuan (toleransi ISO). GPS mengkalibrasi posisi awal (Reference Run), mengukur arah efek beban (Trial Run), menghitung rute (Correction Weight), dan melakukan koreksi rute jika meleset (Refinement).",
    sections: [
      { title: "6 Mode Konfigurasi", content: "Satu Bidang (L/D<0.5, 1 putaran uji). Dua Bidang (default, 2 putaran uji, 4 koefisien pengaruh). Tiga/Empat Bidang (poros panjang). Cantilevered (rotor overhung). 3-Balancers (posisi beban tetap pada 0°/120°/240°)." },
      { title: "Diagnostik Pra-Balancing", content: "ICP Bias Check: verifikasi sensor & kabel (Short/Normal/Open). ICP Power Check: verifikasi pasokan daya Microlog (~25.6V). Lakukan SEBELUM memulai prosedur balancing." },
      { title: "Toleransi ISO 1940", content: "Konfigurasi: Kelas Grade (default G6.3 untuk industri), Massa Rotor (kg), Kecepatan Maksimum (RPM), Radius Pasang Beban (mm). Perangkat lunak menghitung sisa unbalance yang diizinkan." },
      { title: "Koreksi Fase", content: "Arah putaran (CW/CCW), sudut tachometer, sudut akselerometer. Memetakan fase perangkat lunak ke posisi fisik rotor." },
      { title: "Aturan 30/30", content: "Berat uji harus menghasilkan: perubahan amplitudo ≥30% ATAU pergeseran fase ≥30° ATAU kombinasi keduanya. Gagal = TW terlalu ringan → kalkulasi tidak akurat." },
      { title: "Output Berat Koreksi", content: "Massa (g), Sudut Fase (°), Prediksi sisa unbalance. Fitur pembagi beban (split weight) dan pembulatan ke massa standar terdekat tersedia." },
      { title: "Simpan & Lanjutkan", content: "Disimpan sebagai file .bal. Memungkinkan melanjutkan pekerjaan keesokan harinya tanpa kehilangan data referensi." },
    ],
    activeRecall: [
      { q: "Sebutkan 6 mode konfigurasi pada Modul Balancing!" },
      { q: "Apa tujuan melakukan ICP Bias Check?" },
      { q: "Jelaskan aturan 30/30 dengan kata-kata sendiri!" },
      { q: "Kenapa balancing 2 bidang membutuhkan 2 putaran uji (trial runs) terpisah?" },
      { q: "Apa perbedaan pengaturan Remove vs Remain pada TW (berat uji)?" },
      { q: "Variabel apa saja yang dibutuhkan dalam rumus Estimator Berat Uji?" },
      { q: "Kipas 100kg pada 1500 RPM — berapa grade ISO 1940 standarnya?" },
      { q: "Kapan mode Cantilevered tidak menggunakan opsi Satu Bidang?" },
      { q: "Apa fungsi dari mode Manual Entry?" },
      { q: "Vibrasi run koreksi (V1) masih di atas toleransi — apa langkah selanjutnya?" },
    ],
    pitfalls: [
      { pitfall: "Melewatkan ICP Bias Check", consequence: "Kehilangan waktu 30 menit karena ternyata sensor mati sejak awal", prevention: "Selalu jalankan cek ini sebelum memulai" },
      { pitfall: "Salah memilih jumlah bidang (planes)", consequence: "Prosedur menjadi jauh lebih lama dengan hasil residual yang sama", prevention: "Periksa rasio L/D rotor (File 01)" },
      { pitfall: "Memasukkan kelas ISO Grade yang salah", consequence: "Over-balancing (buang waktu) atau under-balancing (tidak aman)", prevention: "Gunakan standar default G 6.3 untuk sebagian besar mesin industri" },
      { pitfall: "Berat uji terlalu kecil sehingga gagal aturan 30/30", consequence: "Kalkulasi berat koreksi salah", prevention: "Gunakan kalkulator estimator atau gandakan berat TW" },
      { pitfall: "Salah mengonfigurasi arah fase", consequence: "Berat koreksi dipasang di lokasi yang salah", prevention: "Periksa kembali arah putaran di setup" },
    ],
    cheatSheet: `ALUR BALANCING SATU BIDANG:
1. STOP — Konfigurasi: mode, toleransi, fase, cek sensor ICP
2. PUTAR — Putaran Awal (Initial Run - V0)
3. STOP — Pasang Berat Uji (Trial Weight - TW)
4. PUTAR — Putaran Uji (Trial Run - VT1) → VERIFIKASI aturan 30/30
5. STOP — Pasang Berat Koreksi (CW), lepas TW (kecuali remain)
6. PUTAR — Putaran Koreksi (V1) → cek terhadap toleransi ISO
7. STOP/PUTAR — Loop penyempurnaan (Trim Run) jika V1 > toleransi
8. SIMPAN — Simpan file pekerjaan untuk dokumentasi

PEMECAHAN MASALAH:
• Pembacaan tidak stabil → Cek dudukan sensor
• Fase berpindah-pindah → Cek sinyal tacho
• TW tidak memberikan efek → Perbesar berat TW (gunakan estimator)
• CW malah memperburuk → Koreksi fase terbalik 180°`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 05 — Template Pengukuran Velocity
  // ═══════════════════════════════════════════════════════════════════════════
  "05": {
    tldr: "Konfigurasi standar Analyzer untuk pemantauan kecepatan (velocity) keseluruhan (mm/s RMS) guna mengevaluasi keparahan getaran. Disimpan sekali, dipakai selamanya. Detail: kopling ICP, tingkap Hanning, deteksi RMS, tampilan mm/s, HP filter 5 Hz, F_max 1000 Hz, 1600 lines, 4 linier rata-rata, 50% overlap, Overall ditampilkan sebagai grafik batang (Bar).",
    mentalModel: "Pikirkan template seperti profil kamera. Profil 'Velocity' memiliki pengaturan ISO/shutter/aperture khusus. Anda tidak perlu menyetel ulang setiap memotret — cukup pilih profilnya. Dua profil wajib di lapangan: Velocity (ini) dan gE Enveloping (File 06).",
    sections: [
      { title: "Kenapa Memilih Velocity (mm/s)?", content: "RMS Kecepatan (Velocity RMS) mewakili tingkat energi getaran yang paling stabil di seluruh frekuensi mesin berputar standar (10 Hz–1 kHz). Standar ISO 10816/20816 dan tabel keparahan menggunakan mm/s RMS." },
      { title: "Kenapa Deteksi RMS?", content: "RMS mewakili energi rata-rata (dapat dibandingkan antar mesin). Peak mewakili nilai kejut sesaat. Peak-to-Peak digunakan untuk total simpangan (misal clearance bearing film oli). Cocokkan jenis deteksi dengan standar." },
      { title: "HP Filter 5 Hz", content: "Menghilangkan efek hanyut (drift) DC akibat integrasi matematika, serta meredam derau struktural frekuensi rendah. Ubah ke 2 Hz hanya untuk mesin dengan kecepatan < 300 RPM." },
      { title: "Tingkap (Window) Hanning", content: "Memberikan keseimbangan terbaik antara akurasi amplitudo dan resolusi frekuensi. Flat-top digunakan untuk kalibrasi single-tone. Rectangular untuk sinyal sinkron." },
      { title: "Langkah Konfigurasi Template", content: "12 Tahap: Buka → Mode (Waktu Nyata) → Konfigurasi Analyzer → Saluran (ICP, sensitivitas) → Unit (RMS, mm/s, 5Hz) → Fungsi FFT (TWF + Spektrum + Overall) → Frekuensi (F_max, 1600 lines) → Rata-rata (Lin, 4, 50%) → Trigger OFF → Waterfall OFF → Tata Letak (Overall=Bar) → Simpan Sebagai." },
      { title: "Variasi F_max Per Mesin", content: "RPM Rendah (<300): F_max 200 Hz (HP→2Hz). Industri Umum (1500–3600): F_max 1000 Hz. Turbin Kecepatan Tinggi (≥10000): F_max 5000–10000 Hz. Kompresor Multi-stage: F_max 2000 Hz." },
    ],
    activeRecall: [
      { q: "Kenapa kita memilih kopling ICP, bukan AC atau DC?" },
      { q: "Apa akibatnya jika menggunakan deteksi Peak untuk dibandingkan dengan tabel RMS?" },
      { q: "Kapan kita memodifikasi filter HP 5 Hz dan menjadi berapa?" },
      { q: "Hanning vs Flat-top — kapan kita harus memilih Flat-top?" },
      { q: "Kenapa plot Overall ditampilkan sebagai diagram batang, bukan garis?" },
      { q: "Berapa banyak harmonik yang dicakup oleh F_max 1000 Hz pada mesin 3600 RPM?" },
      { q: "Kenapa fitur Waterfall dinonaktifkan untuk pengukuran velocity overall?" },
      { q: "Bagaimana cara membuka template yang sudah disimpan?" },
      { q: "Jelaskan mengapa RMS mewakili representasi energi getaran!" },
      { q: "Kapan kita perlu mengaktifkan Channel 2?" },
    ],
    pitfalls: [
      { pitfall: "Lupa menyetel HP filter 5 Hz", consequence: "Nilai Overall melambung tinggi karena hanyut frekuensi rendah", prevention: "Selalu simpan parameter ini di dalam template" },
      { pitfall: "Menggunakan deteksi Peak dibanding ISO RMS", consequence: "Hasil pembacaan 1.4× lebih tinggi (faktor √2)", prevention: "Selalu setel ke RMS untuk perbandingan severity" },
      { pitfall: "Unit tampilan teratur ke g, bukan mm/s", consequence: "Data tidak dapat dibandingkan dengan standar ISO", prevention: "Atur unit di bagian Engineering Unit" },
      { pitfall: "F_max diatur terlalu rendah", consequence: "Melewatkan harmonik atas dan berisiko terjadinya aliasing sinyal", prevention: "F_max minimal harus 2.56× frekuensi tertinggi yang diharapkan" },
    ],
    cheatSheet: `DAFTAR PERIKSA TEMPLATE VELOCITY:
Mode:       Real-time analysis
Saluran:    ☑ FFT Ch 1
Kopling:    ICP
Tingkap:    Hanning
Deteksi:    RMS
Tampilan:   mm/s (Velocity)
Filter HP:  5 Hz
Fungsi FFT: ☑ Time wave ☑ Spectrum ☑ Overall
F_max:      1000 Hz (default)
Lines:      1600
Rata-rata:  Linier, 4 avg, 50% overlap
Pemicu:     OFF (Free Run)
Waterfall:  OFF
Overall:    Diagram Batang (Bar)
Simpan:     STD_VEL_OVERALL.dbx`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 06 — Template gE Enveloping
  // ═══════════════════════════════════════════════════════════════════════════
  "06": {
    tldr: "gE (gravitational acceleration Envelope) = teknik demodulasi untuk mendeteksi benturan bearing SEBELUM terlihat di spektrum velocity FFT. Mengisolasi benturan berulang dari elemen bergulir bearing. Perbedaan kritis dengan velocity: menggunakan bandpass filter 500 Hz–10 kHz. Deteksi kerusakan dini Tahap 1–2 adalah tujuan utama modul ini.",
    mentalModel: "Spektrum velocity biasa adalah seperti mendengar musik di restoran yang bising. gE Enveloping adalah seperti headphone peredam derau (noise-cancelling) yang memperkuat suara bisikan halus. Prosesnya: bandpass → penyearahan (rectify) → deteksi selubung (envelope) → FFT selubung → frekuensi cacat BPFI/BPFO muncul.",
    sections: [
      { title: "Apa itu gE?", content: "Envelope percepatan gravitasi. Mengukur tingkat keparahan benturan (impacting), bukan getaran stabil rata-rata. Level: <0.5 sehat, 0.5–1.0 kerusakan dini (Tahap 1–2), 1.0–2.0 kerusakan aktif (Tahap 3), >2.0 kritis." },
      { title: "Kenapa Tahap 1–2 Tidak Terlihat di Velocity?", content: "Tahap 1 terjadi di area ultrasonik (250–350 kHz). Tahap 2 memicu frekuensi alami bearing (30–120 kCPM). Keduanya berada jauh di luar jangkauan FFT velocity biasa. Baru pada Tahap 3 kerusakan terdeteksi di velocity." },
      { title: "Pemilihan Bandpass Filter gE", content: "5–100 Hz: <100 RPM. 50 Hz–1 kHz: 100–500 RPM. 500 Hz–10 kHz: standar industri (paling umum). 5–40 kHz: kecepatan tinggi >10000 RPM. Filter harus disetel lebih tinggi dari frekuensi dominan mesin." },
      { title: "Tren gE vs Pembacaan Tunggal", content: "Pembacaan tunggal memberikan bukti yang lemah. Tren waktu adalah kunci utama. Tren datar rendah = sehat. Tren naik perlahan = cacat berkembang. Lonjakan tiba-tiba = masalah pelumasan atau benturan." },
      { title: "Langkah Setup Template", content: "Sama seperti velocity, tetapi: Fungsi FFT = gE filter trend + Waveform + Spectrum. Bandpass gE = 500 Hz–10 kHz default. F_max envelope = 500 Hz. Plot tren sebagai diagram Batang." },
      { title: "Alur Kerja Diagnostik", content: "Pilih template gE → ukur di rumah bearing → baca tren gE (bandingkan baseline) → baca spektrum gE (cari puncak BPFI/BPFO) → gabungkan dengan velocity untuk diagnosis 2×2." },
    ],
    activeRecall: [
      { q: "Velocity FFT vs gE — apa perbedaan fisik yang dideteksi?" },
      { q: "Kenapa kerusakan bearing Tahap 1–2 tidak terlihat di spektrum velocity FFT biasa?" },
      { q: "Berapa bandpass gE default untuk pompa industri 1800 RPM?" },
      { q: "Apa arti fisik dari unit gE?" },
      { q: "Berapa F_max spektrum gE untuk mencakup hingga 3× BPFI?" },
      { q: "Kenapa tren gE lebih berharga dibanding satu kali pembacaan?" },
      { q: "Apa perbedaan filter HP 5 Hz vs bandpass filter gE?" },
      { q: "Nilai gE naik tapi spektrumnya datar — apa interpretasinya?" },
      { q: "Nilai velocity naik tapi nilai gE tetap datar — apa interpretasinya?" },
      { q: "Kenapa template gE harus dibuat terpisah dari template velocity?" },
    ],
    pitfalls: [
      { pitfall: "Memilih bandpass filter gE terlalu rendah (<500 Hz)", consequence: "Data terkontaminasi oleh vibrasi unbalance/misalignment biasa", prevention: "Gunakan minimal 500 Hz untuk industri umum" },
      { pitfall: "Memilih bandpass terlalu tinggi untuk mesin lambat", consequence: "Melewatkan frekuensi dering alami bearing", prevention: "Sesuaikan dengan tabel RPM mesin" },
      { pitfall: "Menilai bearing hanya dari satu kali pembacaan tanpa baseline", consequence: "Tidak dapat menentukan perkembangan kerusakan", prevention: "Kumpulkan 3–5 data awal sebagai baseline" },
      { pitfall: "Menggunakan sensor magnet pada frekuensi tinggi", consequence: "Respons sensor turun drastis di atas 1–2 kHz", prevention: "Gunakan dudukan stud (baut) atau lem perekat" },
    ],
    cheatSheet: `DAFTAR PERIKSA TEMPLATE gE:
Mode:       Real-time analysis
Kopling:    ICP
Tingkap:    Hanning
Deteksi:    RMS
Tampilan:   mm/s (spektrum), gE (tren)
Filter HP:  5 Hz
Fungsi FFT: ☑ gE filter trend ☑ Waveform ☑ Spectrum
Bandpass:   500 Hz – 10 kHz (default industri)
F_max:      500 Hz (envelope)
Lines:      1600
Rata-rata:  Linier, 4 avg, 50% overlap

FILTER gE PER KECEPATAN MESIN:
Sangat lambat (<100 RPM):  5–100 Hz
Lambat (100–500 RPM):    50 Hz–1 kHz
Standar industri:        500 Hz–10 kHz
Kecepatan tinggi (>10k): 5–40 kHz

DIAGNOSIS 2×2 (Velocity + gE):
Vel OK + gE OK   → Sehat/Normal
Vel OK + gE naik → Bearing dini (Tahap 1-2)
Vel naik + gE naik → Bearing Tahap 3, ganti
Vel naik + gE OK   → BUKAN masalah bearing`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 07 — Langkah Cepat Balancing
  // ═══════════════════════════════════════════════════════════════════════════
  "07": {
    tldr: "Kartu saku lapangan untuk penyeimbangan satu bidang (single-plane). Pola STOP-SPIN: Stop(Setup) → Putar(V0) → Stop(TW) → Putar(VT1) → Stop(CW) → Putar(V1) → Stop(Trim) → Putar(Final). Pantau 3 parameter setiap putaran: Amplitudo, Fase, dan RPM. Pencatatan berat uji: Metode, Massa, Posisi, dan Status TW. Target R% pelacakan residu: 100% → <10% → <5%.",
    mentalModel: "Penyeimbangan satu bidang adalah seperti pencarian biner (binary search) dalam koordinat polar. V0 menunjukkan posisi awal. VT1 adalah putaran uji. ΔV adalah efek dari berat uji. CW = -V0 × (TW/ΔV). Setiap putaran menyempitkan jarak rotor ke titik pusat (nol getaran).",
    sections: [
      { title: "Pola 8-Langkah STOP-SPIN", content: "1. STOP Setup → 2. PUTAR V0 → 3. STOP TW → 4. PUTAR VT1 (cek 30/30) → 5. STOP CW → 6. PUTAR V1 (cek toleransi) → 7. STOP Trim → 8. PUTAR Final. Setiap STOP wajib melakukan LOTO." },
      { title: "Verifikasi Pembacaan Data", content: "Sebelum menekan tombol Next: pastikan RPM stabil ±2, fase stabil ±2°, amplitudo konsisten di seluruh rata-rata. Jika berubah-ubah, masalahnya bukan unbalance." },
      { title: "Input Berat Uji (Trial Weight)", content: "4 Kolom input: Metode (Add/Cut), Massa Uji (gram), Posisi (derajat dari referensi tacho), Status TW (Remove/Remain). Cut berarti memotong/menggerinda. Remain berarti dilas permanen." },
      { title: "Output Berat Koreksi (CW)", content: "Massa (g), Sudut Fase (°), R% (rasio residu). R% 100% = kondisi awal. Target <10% (dalam batas aman). <5% = sangat baik. Alat bantu pembagi beban dan pembulatan berat tersedia." },
      { title: "Keselamatan: LOTO", content: "Setiap langkah STOP wajib mematikan mesin sepenuhnya + prosedur Lockout/Tagout (LOTO). Tunggu hingga putaran berhenti total. Menyentuh rotor yang masih berputar dapat menyebabkan kecelakaan fatal." },
      { title: "Tanda Kegagalan (Fail Flags)", content: "Fase tidak stabil >5°: cari masalah non-unbalance. Kecepatan RPM tidak stabil >2%: tunggu. Gagal aturan 30/30: perbesar berat TW. Hasil V1 lebih buruk dari V0: periksa arah sudut fase. Tidak konvergen: diagnosa ulang." },
    ],
    activeRecall: [
      { q: "Sebutkan urutan pola 8 langkah Stop-Spin!" },
      { q: "Sebutkan 4 kolom input utama pada isian Trial Weight!" },
      { q: "Apa perbedaan metode Add (Tambah) vs Cut (Potong)?" },
      { q: "Apa itu R% dan berapa nilai target kelulusannya?" },
      { q: "R% awal 100%, setelah pasang CW turun menjadi 12% — apa artinya?" },
      { q: "Kenapa langkah STOP wajib menerapkan LOTO?" },
      { q: "Perbedaan kecepatan motor sebesar 50 RPM antar putaran — apakah aman?" },
      { q: "Kapan kita memilih opsi After = Remain untuk berat uji?" },
      { q: "Bagaimana cara memverifikasi aturan 30/30 pada layar alat?" },
      { q: "Nilai V1 tipis di atas toleransi — apakah langsung disimpan atau lanjut trim?" },
    ],
    pitfalls: [
      { pitfall: "Melewatkan verifikasi sensor sebelum memulai", consequence: "Membuang waktu putaran padahal sensor tidak tersambung", prevention: "Selalu cek status bias ICP sebelum memutar mesin" },
      { pitfall: "Salah menentukan posisi derajat sudut TW", consequence: "Berat koreksi dipasang di tempat yang salah", prevention: "Tandai dan ukur fisik derajat di rotor secara hati-hati" },
      { pitfall: "Lupa memasang gembok keselamatan LOTO sebelum menyentuh rotor", consequence: "Risiko cedera fatal jika mesin menyala tiba-tiba", prevention: "Disiplin prosedur keselamatan tanpa toleransi" },
      { pitfall: "Lupa melepaskan berat uji (TW) saat memasang berat koreksi (CW)", consequence: "Terjadi koreksi berlebih (over-correction) karena beban ganda", prevention: "Lakukan verifikasi visual bahwa TW telah dilepas" },
    ],
    cheatSheet: `8 LANGKAH BALANCING SATU BIDANG:
1. STOP — Setup (mode, toleransi, arah fase, cek bias sensor)
2. PUTAR — Putaran awal untuk mengukur unbalance awal (V0)
3. STOP — Pasang Berat Uji (TW) pada rotor, catat detailnya
4. PUTAR — Putaran uji (VT1) → VERIFIKASI aturan 30/30
5. STOP — Hitung berat koreksi (CW), lepas TW, pasang CW
6. PUTAR — Putaran koreksi (V1) → bandingkan dengan toleransi ISO
7. STOP — Pasang berat trim (jika V1 masih di luar toleransi)
8. PUTAR — Putaran trim akhir → verifikasi hasil, SIMPAN data

DAFTAR EVALUASI PUTARAN:
• Kecepatan RPM stabil ±2 RPM
• Amplitudo stabil di seluruh 4 kali rata-rata
• Fase stabil dalam rentang ±2 derajat

ISIAN BERAT UJI:
Metode: Tambah (Add) | Potong (Cut)
Massa:  ___ gram
Sudut:  ___° (searah atau berlawanan putaran dari tacho)
Status: Dilepas (Remove) | Tetap (Remain)

PELACAKAN RASIO RESIDU (R%):
Awal (V0):       100%
Koreksi (V1):    Target < 10%
Trim (Akhir):    Target < 5%`,
  },
};
