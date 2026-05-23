// data/skf-microlog/learning-paths-id.ts
// Indonesian translations for learning paths, goals, iterations, and pitfalls

export interface LearningGoalTranslation {
  title: string;
  description: string;
  readingPath: { moduleId: string; sections?: string; note: string }[];
  timeEstimate: string;
}

export interface LearningIterationTranslation {
  title: string;
  duration: string;
  steps: string[];
}

export interface CrossCuttingPitfallTranslation {
  pitfall: string;
  note: string;
}

export const LEARNING_GOALS_ID: Record<string, LearningGoalTranslation> = {
  "A": {
    title: "Membaca vibrasi & memutuskan kapan alarm",
    description: "Mampu membaca tingkat keparahan (severity), menyetel template velocity, dan menentukan batas alarm untuk setiap jenis mesin.",
    readingPath: [
      { moduleId: "01", sections: "§1–6", note: "Akselerasi/kecepatan/perpindahan, mengapa gaya naik terhadap kuadrat kecepatan" },
      { moduleId: "02", sections: "§2 + §4", note: "Tabel severity + bagan diagnostik" },
      { moduleId: "03", sections: "§1–4", note: "Dasar-dasar konfigurasi analyzer" },
      { moduleId: "05", note: "Template velocity — membuat & menyimpan di dBX" }
    ],
    timeEstimate: "1–2 minggu dibarengi praktek langsung di lapangan"
  },
  "B": {
    title: "Mendeteksi kerusakan bearing sebelum gagal katastropik",
    description: "Mampu mendeteksi cacat bearing Tahap 1–2 menggunakan gE enveloping sebelum terdeteksi pada spektrum FFT velocity biasa.",
    readingPath: [
      { moduleId: "01", sections: "§5", note: "Akselerasi vs kecepatan vs displacement — kenapa frekuensi tinggi butuh akselerasi" },
      { moduleId: "02", sections: "§4 kasus F", note: "Bearing elemen bergulir — 4 Tahapan Kerusakan" },
      { moduleId: "03", sections: "§3 + §6", note: "Konfigurasi FFT + fungsi matematika" },
      { moduleId: "06", note: "Template gE enveloping — TAHAP PALING KRITIS" },
      { moduleId: "02", sections: "§4 kasus F", note: "Kembali ke interpretasi diagnostik spektrum" }
    ],
    timeEstimate: "2–4 minggu dibarengi pengamatan tren baseline pada 3–5 mesin"
  },
  "C": {
    title: "Melakukan balancing rotor sendiri",
    description: "Mampu melakukan balancing satu bidang (single-plane) dan dua bidang (multi-plane) menggunakan Microlog dBX.",
    readingPath: [
      { moduleId: "01", note: "Keseluruhan — teori harus kuat. Terutama Metode Diagram Vektor & Metode Tiga Lingkaran" },
      { moduleId: "02", sections: "§4 kasus A", note: "Tanda unbalance — pastikan masalahnya benar-benar unbalance terlebih dahulu" },
      { moduleId: "04", note: "Keseluruhan — referensi modul balancing" },
      { moduleId: "07", note: "Panduan cepat langkah balancing lapangan" }
    ],
    timeEstimate: "1–3 bulan dengan latihan terbimbing (supervisi)"
  },
  "D": {
    title: "Manajer Operasional — Membangun program vibrasi di pabrik",
    description: "Membangun program pemantauan kondisi getaran: menentukan alarm, menyusun template, menyusun alur kerja teknisi.",
    readingPath: [
      { moduleId: "00", note: "Membangun mental model program pemeliharaan prediktif" },
      { moduleId: "01", sections: "§1, §6", note: "Justifikasi biaya: kenapa pemantauan getaran menguntungkan bisnis" },
      { moduleId: "02", sections: "§2", note: "Menetapkan batas alarm untuk setiap kelas peralatan" },
      { moduleId: "05", note: "Menyusun template standar velocity untuk setiap kelas mesin" },
      { moduleId: "06", note: "Menyusun template gE — diserahkan ke teknisi untuk diukur rutin" },
      { moduleId: "03", note: "Membaca sekilas — memahami kapabilitas alat ukur yang dimiliki tim" }
    ],
    timeEstimate: "2–4 minggu belajar + 1–2 bulan implementasi lapangan"
  }
};

export const LEARNING_ITERATIONS_ID: LearningIterationTranslation[] = [
  {
    title: "Iterasi 1: Survei",
    duration: "1–2 jam",
    steps: [
      "Buka semua 7 modul. Baca hanya bagian TL;DR + Mental Model di setiap modul.",
      "Tujuan: mendapatkan gambaran besar (big picture) sebelum masuk ke detail teknis.",
      "Hasil akhir: mampu menjelaskan kepada orang lain dalam 1 menit tentang isi dan alasan adanya modul-modul ini."
    ]
  },
  {
    title: "Iterasi 2: Membaca Mendalam",
    duration: "4–6 jam (tersebar 2–3 hari)",
    steps: [
      "Pilih tujuan belajar (A/B/C/D), baca alur belajarnya sambil mencatat:",
      "• Konsep baru yang ditemui — buat daftar",
      "• Konsep lama dari sudut pandang baru — buat daftar",
      "• Konsep yang tadinya dikira paham padahal belum — buat daftar (paling penting)",
      "Jangan melewatkan pertanyaan Active Recall di setiap modul."
    ]
  },
  {
    title: "Iterasi 3: Tanya Jawab Mandiri (Active Recall)",
    duration: "~30 menit per modul",
    steps: [
      "Tutup halaman/modul. Jawab pertanyaan Active Recall dari ingatan Anda.",
      "Jawaban benar → tingkat kepercayaan diri terkalibrasi",
      "Jawaban salah → bendera merah, baca ulang bagian terkait",
      "Tidak tahu jawaban → titik buta (blind spot), prioritas belajar berikutnya"
    ]
  },
  {
    title: "Iterasi 4: Terapkan di Lapangan",
    duration: "Di lapangan",
    steps: [
      "Pilih satu mesin operasional di pabrik.",
      "Terapkan alur kerja lengkap (Tujuan A atau B).",
      "Dokumentasikan: pengaturan alat, hasil pembacaan, interpretasi, dan tindakan lanjutan.",
      "Bandingkan dengan hasil analis senior (jika ada). Lakukan evaluasi berkala."
    ]
  },
  {
    title: "Iterasi 5: Ajarkan ke Orang Lain",
    duration: "Paling efektif",
    steps: [
      "Pilih satu teknisi junior.",
      "Bimbing mereka mempelajari satu modul pilihan Anda.",
      "Mampu menjelaskan tanpa melihat modul = paham. Masih harus melihat modul = belum sepenuhnya paham.",
      "Teknik Feynman: Jika Anda tidak dapat menjelaskannya dengan cara sederhana kepada anak usia 12 tahun, Anda belum benar-benar memahaminya."
    ]
  }
];

export const CROSS_CUTTING_PITFALLS_ID: CrossCuttingPitfallTranslation[] = [
  { pitfall: "Melakukan balancing tanpa diagnosa terlebih dahulu", note: "40% kasus getaran tinggi disebabkan masalah selain unbalance" },
  { pitfall: "Menggunakan FFT velocity biasa untuk deteksi dini bearing", note: "Melewatkan kerusakan Tahap 1–2; wajib gunakan gE enveloping" },
  { pitfall: "Melewatkan analisis fase", note: "Pola fase adalah tanda ketiga yang sangat penting, tidak bersifat opsional" },
  { pitfall: "Berat uji (trial weight) terlalu kecil", note: "Gagal memicu aturan 30/30 sehingga perhitungan berat koreksi menjadi salah" },
  { pitfall: "Batas alarm severity tidak disesuaikan", note: "Penggunaan isolator/roda gigi eksternal memicu alarm palsu atau alarm terlewat" },
  { pitfall: "Menggunakan dudukan sensor magnet untuk frekuensi tinggi", note: "Tanggapan frekuensi turun di atas 1–2 kHz; wajib gunakan baut stud atau lem" },
  { pitfall: "Menggunakan satu template umum untuk semua jenis mesin", note: "Template spesifik kelas mesin wajib dibuat untuk menghindari salah ukur" },
  { pitfall: "Menyimpan data di folder acak yang tidak terorganisir", note: "Menyulitkan pemantauan tren karena pengarsipan yang kacau" },
  { pitfall: "Hanya sekadar penekan tombol alat, bukan penganalisis", note: "Menerapkan pemeliharaan reaktif, bukan prediktif yang bernilai tinggi" }
];
