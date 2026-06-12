"use client";

import { useState, useMemo } from "react";
import * as XLSX from "xlsx";

// ─── Design tokens ──────────────────────────────────────────────
const T = {
  bg: "#10141A", panel: "#171C24", panel2: "#1D2430", line: "#2A3342",
  amber: "#F5B62E", amberDim: "#8A6A1F", text: "#E8EDF4", mut: "#8A95A6",
  good: "#3FBF7F", warn: "#F5B62E", bad: "#E85C4A",
  mono: "'IBM Plex Mono','SFMono-Regular',Consolas,monospace",
  sans: "'Inter','Segoe UI',system-ui,sans-serif",
};

const fmt = (n: number, d = 2) =>
  isFinite(n) ? n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

// ─── i18n ───────────────────────────────────────────────────────
const STR = {
  en: {
    title: "Capacitor kVAR Engineering Calculator",
    slogan: "Precision in Power, Excellence in Reliability",
    s01: "Measurement Input", s02: "Calculation Trace",
    s03: "Capacitor Analysis Report", s04: "Engineering Conclusion",
    s05: "Measurement Log",
    measCap: "Measured Capacitance", voltage: "Voltage", freqL: "Frequency",
    phaseL: "Phase", ph1: "1Φ Single", ph3: "3Φ Three",
    optional: "Optional — for health assessment",
    nameplateL: "Nameplate Capacitance", rated: "rated",
    unitIdL: "Unit ID / Tag", unitIdPh: "e.g. CAP-01",
    iL1: "Current L1 (R)", iL2: "Current L2 (S)", iL3: "Current L3 (T)",
    starWarn: "⚠ Three-phase formula assumes the entered voltage is applied directly across each capacitor element (delta connection with line voltage, or per-phase value). For star-connected banks measured with line-to-line voltage, divide V by √3 before entry.",
    step1: "Step 1 — convert capacitance",
    step2_1: "Step 2 — reactive power (single phase)",
    step2_3: "Step 2 — reactive power (three phase)",
    step3: "Step 3 — convert to kVAR",
    capMeas: "Capacitance (measured)", capName: "Capacitance (nameplate)",
    voltageR: "Voltage", freqR: "Frequency", phaseR: "Phase type",
    threePhase: "Three phase", singlePhase: "Single phase",
    output: "Calculated output",
    devR: "Deviation from nameplate", unbR: "Current unbalance",
    overall: "Overall condition",
    criteria: "Assessment criteria per industrial PFC maintenance practice; capacitance tolerance reference IEC 60831-1 (−5% / +10% for units ≤100 kVAR). Field measurement: ABB/Hitachi CB2000 or equivalent.",
    empty: "Enter capacitance, voltage, and frequency to generate the analysis report.",
    footer: "PT PRIMA ANJAYA SANTOSO · POWER TRANSMISSION INDUSTRIAL DIVISION",
    addBtn: "＋ Add to Log",
    clearBtn: "Clear",
    clearConfirm: "Clear all logged measurements?",
    xlsBtn: "Excel",
    pdfBtn: "PDF / Print",
    logEmpty: "No measurements logged yet. Calculate, then press “Add to Log”.",
    printHint: "If the print dialog does not appear, an HTML report file will download instead — open it and print to PDF.",
    th: { no: "No", id: "Unit ID", cap: "Capacitance (µF)", farad: "C (Farad)", phase: "Phase", volt: "Voltage (VAC)", freq: "Freq (Hz)", kvar: "kVAR", dev: "Dev (%)", status: "Status", time: "Time" },
    pdfTitle: "Capacitor Measurement Report",
    rows: "rows",
    cls: { Excellent: "Excellent", Good: "Good", Monitor: "Monitor", Investigate: "Investigate", "Replace Recommended": "Replace Recommended", Abnormal: "Abnormal", Critical: "Critical" } as Record<string, string>,
    dev0_5: (d: string) => `Capacitance is within ±5% of nameplate (${d}%). Dielectric condition is considered healthy; capacity loss is negligible.`,
    dev5_10: (d: string) => `Capacitance deviates ${d}% from nameplate — acceptable, but indicates early-stage aging. Record as baseline for trending.`,
    dev10_15: (d: string) => `Capacitance deviation of ${d}% indicates measurable dielectric degradation. Reactive power output is reduced proportionally. Re-measure within 3–6 months and trend.`,
    dev15_20: (d: string) => `Deviation of ${d}% indicates significant element loss (possible internal fuse operation or dielectric breakdown). Perform tan-delta / capacitance verification per IEC 60831 and plan corrective action.`,
    dev20: (d: string) => `Deviation exceeds 20% (${d}%). The unit no longer delivers rated kVAR and the failure mode may propagate. Replacement is recommended; continued service carries elevated risk.`,
    noNameplate: "No nameplate value entered — health assessment vs. rated capacitance is not available. Enter nameplate µF for deviation analysis.",
    unb0_5: (u: string) => `Phase current unbalance of ${u}% is within normal limits, indicating uniform capacitance across phases.`,
    unb5_10: (u: string) => `Current unbalance of ${u}% warrants monitoring — possible uneven capacitance loss between phases.`,
    unb10: (u: string) => `Current unbalance of ${u}% is abnormal. Investigate per-phase capacitance, blown internal fuses, or loose connections before returning to service.`,
  },
  id: {
    title: "Kalkulator kVAR Kapasitor Teknik",
    slogan: "Presisi dalam Daya, Keunggulan dalam Keandalan",
    s01: "Input Pengukuran", s02: "Rincian Perhitungan",
    s03: "Laporan Analisis Kapasitor", s04: "Kesimpulan Teknik",
    s05: "Log Pengukuran",
    measCap: "Kapasitansi Terukur", voltage: "Tegangan", freqL: "Frekuensi",
    phaseL: "Fasa", ph1: "1Φ Satu Fasa", ph3: "3Φ Tiga Fasa",
    optional: "Opsional — untuk penilaian kondisi",
    nameplateL: "Kapasitansi Nameplate", rated: "rating",
    unitIdL: "ID Unit / Tag", unitIdPh: "mis. CAP-01",
    iL1: "Arus L1 (R)", iL2: "Arus L2 (S)", iL3: "Arus L3 (T)",
    starWarn: "⚠ Rumus tiga fasa mengasumsikan tegangan yang dimasukkan adalah tegangan yang langsung terpasang pada tiap elemen kapasitor (koneksi delta dengan tegangan line, atau nilai per fasa). Untuk bank koneksi star yang diukur dengan tegangan line-to-line, bagi V dengan √3 sebelum dimasukkan.",
    step1: "Langkah 1 — konversi kapasitansi",
    step2_1: "Langkah 2 — daya reaktif (satu fasa)",
    step2_3: "Langkah 2 — daya reaktif (tiga fasa)",
    step3: "Langkah 3 — konversi ke kVAR",
    capMeas: "Kapasitansi (terukur)", capName: "Kapasitansi (nameplate)",
    voltageR: "Tegangan", freqR: "Frekuensi", phaseR: "Tipe fasa",
    threePhase: "Tiga fasa", singlePhase: "Satu fasa",
    output: "Output terhitung",
    devR: "Deviasi terhadap nameplate", unbR: "Ketidakseimbangan arus",
    overall: "Kondisi keseluruhan",
    criteria: "Kriteria penilaian mengacu pada praktik pemeliharaan PFC industri; referensi toleransi kapasitansi IEC 60831-1 (−5% / +10% untuk unit ≤100 kVAR). Pengukuran lapangan: ABB/Hitachi CB2000 atau setara.",
    empty: "Masukkan kapasitansi, tegangan, dan frekuensi untuk menghasilkan laporan analisis.",
    footer: "PT PRIMA ANJAYA SANTOSO · DIVISI INDUSTRI TRANSMISI DAYA",
    addBtn: "＋ Tambah ke Log",
    clearBtn: "Hapus",
    clearConfirm: "Hapus semua data pengukuran di log?",
    xlsBtn: "Excel",
    pdfBtn: "PDF / Cetak",
    logEmpty: "Belum ada pengukuran tercatat. Hitung, lalu tekan “Tambah ke Log”.",
    printHint: "Jika dialog cetak tidak muncul, file laporan HTML akan diunduh — buka file tersebut lalu cetak ke PDF.",
    th: { no: "No", id: "ID Unit", cap: "Kapasitansi (µF)", farad: "C (Farad)", phase: "Fasa", volt: "Tegangan (VAC)", freq: "Frek (Hz)", kvar: "kVAR", dev: "Dev (%)", status: "Status", time: "Waktu" },
    pdfTitle: "Laporan Pengukuran Kapasitor",
    rows: "baris",
    cls: { Excellent: "Sangat Baik", Good: "Baik", Monitor: "Pantau", Investigate: "Investigasi", "Replace Recommended": "Disarankan Ganti", Abnormal: "Abnormal", Critical: "Kritis" } as Record<string, string>,
    dev0_5: (d: string) => `Kapasitansi berada dalam ±5% dari nameplate (${d}%). Kondisi dielektrik dinilai sehat; penurunan kapasitas tidak signifikan.`,
    dev5_10: (d: string) => `Kapasitansi menyimpang ${d}% dari nameplate — masih dapat diterima, namun mengindikasikan penuaan tahap awal. Catat sebagai baseline untuk trending.`,
    dev10_15: (d: string) => `Deviasi kapasitansi sebesar ${d}% mengindikasikan degradasi dielektrik yang terukur. Output daya reaktif berkurang secara proporsional. Ukur ulang dalam 3–6 bulan dan lakukan trending.`,
    dev15_20: (d: string) => `Deviasi sebesar ${d}% mengindikasikan kehilangan elemen yang signifikan (kemungkinan fuse internal bekerja atau breakdown dielektrik). Lakukan verifikasi tan-delta / kapasitansi sesuai IEC 60831 dan rencanakan tindakan korektif.`,
    dev20: (d: string) => `Deviasi melebihi 20% (${d}%). Unit tidak lagi menghasilkan kVAR sesuai rating dan mode kegagalan dapat merambat. Penggantian direkomendasikan; pengoperasian lanjutan membawa risiko tinggi.`,
    noNameplate: "Nilai nameplate belum dimasukkan — penilaian kondisi terhadap kapasitansi rating tidak tersedia. Masukkan µF nameplate untuk analisis deviasi.",
    unb0_5: (u: string) => `Ketidakseimbangan arus fasa sebesar ${u}% berada dalam batas normal, menunjukkan kapasitansi yang merata antar fasa.`,
    unb5_10: (u: string) => `Ketidakseimbangan arus sebesar ${u}% perlu dipantau — kemungkinan terjadi kehilangan kapasitansi yang tidak merata antar fasa.`,
    unb10: (u: string) => `Ketidakseimbangan arus sebesar ${u}% abnormal. Investigasi kapasitansi per fasa, fuse internal yang putus, atau koneksi longgar sebelum dioperasikan kembali.`,
  },
};

type Lang = "en" | "id";
type Str = typeof STR.en;

// ─── Classification ─────────────────────────────────────────────
function classifyDeviation(absDev: number) {
  if (absDev <= 5) return { key: "Excellent", color: T.good };
  if (absDev <= 10) return { key: "Good", color: T.good };
  if (absDev <= 15) return { key: "Monitor", color: T.warn };
  if (absDev <= 20) return { key: "Investigate", color: T.warn };
  return { key: "Replace Recommended", color: T.bad };
}
function classifyUnbalance(u: number) {
  if (u < 3) return { key: "Excellent", color: T.good };
  if (u <= 5) return { key: "Good", color: T.good };
  if (u <= 10) return { key: "Monitor", color: T.warn };
  if (u <= 15) return { key: "Abnormal", color: T.bad };
  return { key: "Critical", color: T.bad };
}

// ─── Export helpers ──────────────────────────────────────────────
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function buildReportHTML(log: LogEntry[], t: Str, lang: Lang) {
  const esc = (s: unknown) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const head = [t.th.no, t.th.id, t.th.cap, t.th.farad, t.th.phase, t.th.volt, t.th.freq, t.th.kvar, t.th.dev, t.th.status, t.th.time];
  const body = log.map((x) => [
    x.no, esc(x.unitId), fmt(x.uF), x.farad.toExponential(4),
    x.phase === 3 ? "3Φ" : "1Φ", fmt(x.volt, 0), fmt(x.freq, 0),
    fmt(x.kvar), x.dev == null ? "—" : fmt(x.dev), esc(t.cls[x.status]), esc(x.time),
  ]);
  return `<!doctype html><html><head><meta charset="utf-8"><title>${t.pdfTitle}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;margin:32px;}
  h1{font-size:18px;margin:0;} .sub{font-size:11px;color:#666;margin:4px 0 18px;}
  .brand{font-size:11px;letter-spacing:2px;color:#b8860b;font-weight:bold;}
  table{border-collapse:collapse;width:100%;font-size:11px;}
  th,td{border:1px solid #999;padding:5px 7px;text-align:left;}
  th{background:#1d2430;color:#fff;}
  tr:nth-child(even) td{background:#f4f4f4;}
  .foot{margin-top:24px;font-size:10px;color:#888;text-align:center;letter-spacing:1px;}
</style></head><body>
<div class="brand">PT PRIMA ANJAYA SANTOSO</div>
<h1>${t.pdfTitle}</h1>
<div class="sub">${new Date().toLocaleString(lang === "id" ? "id-ID" : "en-GB")} · ${log.length} ${t.rows}</div>
<table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
<tbody>${body.map((row) => `<tr>${row.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>
<div class="foot">${t.footer}</div>
</body></html>`;
}

// ─── UI atoms ────────────────────────────────────────────────────
function Field({ label, unit, value, onChange, placeholder, type = "number" }: {
  label: string; unit?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontFamily: T.sans, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, marginBottom: 6 }}>
        {label} {unit && <span style={{ color: T.amberDim }}>({unit})</span>}
      </div>
      <input
        type={type} inputMode={type === "number" ? "decimal" : "text"}
        value={value} placeholder={placeholder || "0"}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", boxSizing: "border-box",
          background: T.bg, border: `1px solid ${T.line}`, borderRadius: 6,
          color: T.text, fontFamily: T.mono, fontSize: 16, padding: "12px 12px", outline: "none",
        }}
        onFocus={(e) => (e.target.style.borderColor = T.amber)}
        onBlur={(e) => (e.target.style.borderColor = T.line)}
      />
    </label>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontFamily: T.mono, fontSize: 12, fontWeight: 600,
      color, border: `1px solid ${color}`, borderRadius: 4,
      padding: "2px 8px", whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.line}` }}>
      <span style={{ fontFamily: T.sans, fontSize: 13, color: T.mut }}>{k}</span>
      <span style={{ fontFamily: T.mono, fontSize: 14, color: accent || T.text, textAlign: "right" }}>{v}</span>
    </div>
  );
}

function SectionTitle({ no, children }: { no: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 14px" }}>
      <span style={{ fontFamily: T.mono, fontSize: 11, color: T.amber }}>{no}</span>
      <h2 style={{ margin: 0, fontFamily: T.sans, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.text }}>
        {children}
      </h2>
      <div style={{ flex: 1, height: 1, background: T.line, minWidth: 12 }} />
    </div>
  );
}

function Btn({ onClick, children, kind = "ghost", disabled, grow }: {
  onClick: () => void; children: React.ReactNode; kind?: "primary" | "ghost" | "danger";
  disabled?: boolean; grow?: boolean;
}) {
  const styles = {
    primary: { background: T.amber, color: "#10141A", border: `1px solid ${T.amber}` },
    ghost: { background: "transparent", color: T.text, border: `1px solid ${T.line}` },
    danger: { background: "transparent", color: T.bad, border: `1px solid ${T.bad}` },
  }[kind];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles, opacity: disabled ? 0.4 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: T.mono, fontSize: 13, fontWeight: 600, letterSpacing: "0.04em",
      padding: "12px 16px", borderRadius: 6, minHeight: 44,
      flex: grow ? "1 1 auto" : "0 0 auto",
    }}>{children}</button>
  );
}

// ─── Types ───────────────────────────────────────────────────────
interface LogEntry {
  no: number; unitId: string; uF: number; farad: number; phase: number;
  volt: number; freq: number; kvar: number; dev: number | null;
  status: string; statusColor: string; time: string;
}

// ─── Main component ──────────────────────────────────────────────
export default function CapacitorCalculator() {
  const [lang, setLang] = useState<Lang>("en");
  const t = STR[lang];

  const [unitId, setUnitId] = useState("");
  const [uF, setUF] = useState("");
  const [volt, setVolt] = useState("400");
  const [freq, setFreq] = useState("50");
  const [phase, setPhase] = useState(3);
  const [nameplate, setNameplate] = useState("");
  const [iR, setIR] = useState("");
  const [iS, setIS] = useState("");
  const [iT, setIT] = useState("");

  const [log, setLog] = useState<LogEntry[]>([]);
  const [hint, setHint] = useState("");

  const r = useMemo(() => {
    const C_uF = parseFloat(uF);
    const V = parseFloat(volt);
    const f = parseFloat(freq);
    if (!(C_uF > 0 && V > 0 && f > 0)) return null;

    const C = C_uF * 1e-6;
    const perPhaseVAR = 2 * Math.PI * f * C * V * V;
    const VAR = phase === 3 ? 3 * perPhaseVAR : perPhaseVAR;
    const kVAR = VAR / 1000;

    const np = parseFloat(nameplate);
    let dev: number | null = null, devClass: ReturnType<typeof classifyDeviation> | null = null;
    if (np > 0) { dev = ((C_uF - np) / np) * 100; devClass = classifyDeviation(Math.abs(dev)); }

    const Ia = parseFloat(iR), Ib = parseFloat(iS), Ic = parseFloat(iT);
    let unb: number | null = null, unbClass: ReturnType<typeof classifyUnbalance> | null = null;
    if (phase === 3 && Ia > 0 && Ib > 0 && Ic > 0) {
      const Iavg = (Ia + Ib + Ic) / 3;
      unb = (Math.max(Math.abs(Ia - Iavg), Math.abs(Ib - Iavg), Math.abs(Ic - Iavg)) / Iavg) * 100;
      unbClass = classifyUnbalance(unb);
    }

    let overall = { key: "Good", color: T.good };
    const sev = (cls: { key: string } | null) =>
      !cls ? 0 :
      cls.key === "Excellent" || cls.key === "Good" ? 0 :
      cls.key === "Monitor" ? 1 :
      cls.key === "Investigate" || cls.key === "Abnormal" ? 2 : 3;
    const worst = Math.max(sev(devClass), sev(unbClass));
    if (worst === 1) overall = { key: "Monitor", color: T.warn };
    if (worst === 2) overall = { key: "Investigate", color: T.warn };
    if (worst === 3) overall = { key: "Critical", color: T.bad };

    return { C_uF, V, f, C, VAR, kVAR, dev, devClass, unb, unbClass, overall, np };
  }, [uF, volt, freq, phase, nameplate, iR, iS, iT]);

  const conclusion = useMemo(() => {
    if (!r) return null;
    const lines: string[] = [];
    if (r.devClass) {
      const d = Math.abs(r.dev!), ds = fmt(r.dev!);
      if (d <= 5) lines.push(t.dev0_5(ds));
      else if (d <= 10) lines.push(t.dev5_10(ds));
      else if (d <= 15) lines.push(t.dev10_15(ds));
      else if (d <= 20) lines.push(t.dev15_20(ds));
      else lines.push(t.dev20(ds));
    } else lines.push(t.noNameplate);
    if (r.unbClass) {
      const us = fmt(r.unb!);
      if (r.unb! < 5) lines.push(t.unb0_5(us));
      else if (r.unb! <= 10) lines.push(t.unb5_10(us));
      else lines.push(t.unb10(us));
    }
    return lines;
  }, [r, t]);

  const addToLog = () => {
    if (!r) return;
    setLog((prev) => [...prev, {
      no: prev.length + 1,
      unitId: unitId.trim() || `CAP-${String(prev.length + 1).padStart(2, "0")}`,
      uF: r.C_uF, farad: r.C, phase, volt: r.V, freq: r.f,
      kvar: r.kVAR, dev: r.dev, status: r.overall.key, statusColor: r.overall.color,
      time: new Date().toLocaleString(lang === "id" ? "id-ID" : "en-GB"),
    }]);
  };

  const clearLog = () => {
    if (window.confirm(t.clearConfirm)) setLog([]);
  };

  const exportExcel = () => {
    try {
      const rows = log.map((x) => ({
        [t.th.no]: x.no,
        [t.th.id]: x.unitId,
        [t.th.cap]: x.uF,
        [t.th.farad]: x.farad,
        [t.th.phase]: x.phase === 3 ? "3P" : "1P",
        [t.th.volt]: x.volt,
        [t.th.freq]: x.freq,
        [t.th.kvar]: Number(x.kvar.toFixed(3)),
        [t.th.dev]: x.dev == null ? "" : Number(x.dev.toFixed(2)),
        [t.th.status]: t.cls[x.status],
        [t.th.time]: x.time,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = [{ wch: 5 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 7 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 9 }, { wch: 18 }, { wch: 20 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Measurements");
      const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      downloadBlob(
        new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
        "capacitor-measurement-log.xlsx"
      );
      setHint("");
    } catch {
      const head = [t.th.no, t.th.id, t.th.cap, t.th.farad, t.th.phase, t.th.volt, t.th.freq, t.th.kvar, t.th.dev, t.th.status, t.th.time];
      const lines = [head.join(",")].concat(
        log.map((x) => [
          x.no, `"${x.unitId}"`, x.uF, x.farad, x.phase === 3 ? "3P" : "1P",
          x.volt, x.freq, x.kvar.toFixed(3), x.dev == null ? "" : x.dev.toFixed(2),
          `"${t.cls[x.status]}"`, `"${x.time}"`,
        ].join(","))
      );
      downloadBlob(new Blob([lines.join("\n")], { type: "text/csv" }), "capacitor-measurement-log.csv");
    }
  };

  const exportPDF = () => {
    const html = buildReportHTML(log, t, lang);
    try {
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
      document.body.appendChild(iframe);
      const doc = iframe.contentDocument || iframe.contentWindow!.document;
      doc.open(); doc.write(html); doc.close();
      iframe.onload = null;
      setTimeout(() => {
        try {
          iframe.contentWindow!.focus();
          iframe.contentWindow!.print();
        } catch {
          downloadBlob(new Blob([html], { type: "text/html" }), "capacitor-report.html");
        }
        setTimeout(() => document.body.removeChild(iframe), 60000);
      }, 350);
      setHint(t.printHint);
    } catch {
      downloadBlob(new Blob([html], { type: "text/html" }), "capacitor-report.html");
    }
  };

  const phaseBtn = (val: number, label: string) => (
    <button onClick={() => setPhase(val)} style={{
      flex: 1, padding: "12px 0", cursor: "pointer", minHeight: 44,
      fontFamily: T.mono, fontSize: 13, fontWeight: 600,
      background: phase === val ? T.amber : T.bg,
      color: phase === val ? "#10141A" : T.mut,
      border: `1px solid ${phase === val ? T.amber : T.line}`,
      borderRadius: 6,
    }}>{label}</button>
  );

  const langBtn = (code: Lang, label: string) => (
    <button onClick={() => setLang(code)} aria-pressed={lang === code} style={{
      padding: "8px 16px", cursor: "pointer", minHeight: 36,
      fontFamily: T.mono, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em",
      background: lang === code ? T.amber : "transparent",
      color: lang === code ? "#10141A" : T.mut,
      border: "none", borderRadius: 4,
    }}>{label}</button>
  );

  const thStyle: React.CSSProperties = { fontFamily: T.sans, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut, textAlign: "left", padding: "8px 10px", borderBottom: `1px solid ${T.line}`, whiteSpace: "nowrap" };
  const tdStyle: React.CSSProperties = { fontFamily: T.mono, fontSize: 13, color: T.text, padding: "8px 10px", borderBottom: `1px solid ${T.line}`, whiteSpace: "nowrap" };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, padding: "0 0 100px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;600;700&display=swap');
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
        input[type=number]{ -moz-appearance:textfield; }
        .cap-header { display:flex; flex-wrap:wrap; align-items:center; gap:12px; padding:18px 16px; }
        .cap-main { max-width:1040px; margin:0 auto; padding:20px 12px; display:grid; gap:20px; }
        .cap-card { padding:16px; }
        .cap-btn-bar { display:flex; gap:8px; flex-wrap:wrap; }
        @media (min-width:640px){
          .cap-header { padding:22px 24px; }
          .cap-main { padding:28px 20px; gap:28px; }
          .cap-card { padding:22px; }
        }
        @media (max-width:639px){
          .cap-title { font-size:16px !important; }
          .cap-slogan { display:none; }
        }
      `}</style>

      <header className="cap-header" style={{ borderBottom: `1px solid ${T.line}` }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.amber, letterSpacing: "0.14em" }}>PT PRIMA ANJAYA SANTOSO</div>
          <h1 className="cap-title" style={{ margin: "4px 0 0", fontFamily: T.sans, fontWeight: 700, fontSize: 20, letterSpacing: "0.02em" }}>{t.title}</h1>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          <div className="cap-slogan" style={{ fontFamily: T.sans, fontSize: 12, color: T.mut, fontStyle: "italic" }}>{t.slogan}</div>
          <div style={{ display: "flex", gap: 2, border: `1px solid ${T.line}`, borderRadius: 6, padding: 2, background: T.panel }}>
            {langBtn("en", "EN")}{langBtn("id", "ID")}
          </div>
        </div>
      </header>

      <main className="cap-main">

        {/* 01 Input */}
        <section className="cap-card" style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10 }}>
          <SectionTitle no="01">{t.s01}</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
            <Field label={t.unitIdL} value={unitId} onChange={setUnitId} placeholder={t.unitIdPh} type="text" />
            <Field label={t.measCap} unit="µF" value={uF} onChange={setUF} placeholder="e.g. 245.6" />
            <Field label={t.voltage} unit="VAC" value={volt} onChange={setVolt} />
            <Field label={t.freqL} unit="Hz" value={freq} onChange={setFreq} />
            <div>
              <div style={{ fontFamily: T.sans, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, marginBottom: 6 }}>{t.phaseL}</div>
              <div style={{ display: "flex", gap: 8 }}>{phaseBtn(1, t.ph1)}{phaseBtn(3, t.ph3)}</div>
            </div>
          </div>

          <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px dashed ${T.line}` }}>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.mut, marginBottom: 12 }}>{t.optional}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14 }}>
              <Field label={t.nameplateL} unit="µF" value={nameplate} onChange={setNameplate} placeholder={t.rated} />
              {phase === 3 && <>
                <Field label={t.iL1} unit="A" value={iR} onChange={setIR} />
                <Field label={t.iL2} unit="A" value={iS} onChange={setIS} />
                <Field label={t.iL3} unit="A" value={iT} onChange={setIT} />
              </>}
            </div>
          </div>

          {phase === 3 && (
            <div style={{ marginTop: 14, fontFamily: T.sans, fontSize: 12, color: T.mut, lineHeight: 1.5 }}>{t.starWarn}</div>
          )}
        </section>

        {r && (
          <>
            {/* 02 Trace */}
            <section className="cap-card" style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10 }}>
              <SectionTitle no="02">{t.s02}</SectionTitle>
              <div style={{ fontFamily: T.mono, fontSize: 13, lineHeight: 2, color: T.text, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <div style={{ color: T.mut }}>{t.step1}</div>
                <div>C = {fmt(r.C_uF, 2)} µF × 10⁻⁶ = <span style={{ color: T.amber }}>{r.C.toExponential(4)} F</span></div>
                <div style={{ color: T.mut, marginTop: 8 }}>{phase === 3 ? t.step2_3 : t.step2_1}</div>
                <div>Q = {phase === 3 ? "3 × " : ""}2π × {fmt(r.f, 0)} × {r.C.toExponential(3)} × {fmt(r.V, 0)}²</div>
                <div>Q = <span style={{ color: T.amber }}>{fmt(r.VAR, 1)} VAR</span></div>
                <div style={{ color: T.mut, marginTop: 8 }}>{t.step3}</div>
                <div>Q = {fmt(r.VAR, 1)} ÷ 1000 = <span style={{ color: T.amber, fontWeight: 600 }}>{fmt(r.kVAR, 2)} kVAR</span></div>
              </div>
            </section>

            {/* 03 Report */}
            <section className="cap-card" style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10 }}>
              <SectionTitle no="03">{t.s03}</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24 }}>
                <div>
                  <Row k={t.capMeas} v={`${fmt(r.C_uF)} µF`} />
                  {r.np > 0 && <Row k={t.capName} v={`${fmt(r.np)} µF`} />}
                  <Row k={t.voltageR} v={`${fmt(r.V, 0)} VAC`} />
                  <Row k={t.freqR} v={`${fmt(r.f, 0)} Hz`} />
                  <Row k={t.phaseR} v={phase === 3 ? t.threePhase : t.singlePhase} />
                  <Row k={t.output} v={`${fmt(r.kVAR)} kVAR`} accent={T.amber} />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6, padding: "8px 0", borderBottom: `1px solid ${T.line}` }}>
                    <span style={{ fontFamily: T.sans, fontSize: 13, color: T.mut }}>{t.devR}</span>
                    {r.devClass
                      ? <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontFamily: T.mono, fontSize: 14 }}>{fmt(r.dev!)}%</span>
                          <Badge label={t.cls[r.devClass.key]} color={r.devClass.color} />
                        </span>
                      : <span style={{ fontFamily: T.mono, fontSize: 13, color: T.mut }}>n/a</span>}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6, padding: "8px 0", borderBottom: `1px solid ${T.line}` }}>
                    <span style={{ fontFamily: T.sans, fontSize: 13, color: T.mut }}>{t.unbR}</span>
                    {r.unbClass
                      ? <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontFamily: T.mono, fontSize: 14 }}>{fmt(r.unb!)}%</span>
                          <Badge label={t.cls[r.unbClass.key]} color={r.unbClass.color} />
                        </span>
                      : <span style={{ fontFamily: T.mono, fontSize: 13, color: T.mut }}>n/a</span>}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "14px 0" }}>
                    <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t.overall}</span>
                    <Badge label={t.cls[r.overall.key]} color={r.overall.color} />
                  </div>
                </div>
              </div>
              <div className="cap-btn-bar" style={{ marginTop: 12 }}>
                <Btn onClick={addToLog} kind="primary" grow>{t.addBtn}</Btn>
              </div>
            </section>

            {/* 04 Conclusion */}
            <section className="cap-card" style={{ background: T.panel2, border: `1px solid ${T.line}`, borderLeft: `3px solid ${r.overall.color}`, borderRadius: 10 }}>
              <SectionTitle no="04">{t.s04}</SectionTitle>
              <ul style={{ margin: 0, paddingLeft: 18, fontFamily: T.sans, fontSize: 14, lineHeight: 1.7, color: T.text }}>
                {conclusion!.map((c, i) => <li key={i} style={{ marginBottom: 8 }}>{c}</li>)}
              </ul>
              <div style={{ marginTop: 14, fontFamily: T.sans, fontSize: 12, color: T.mut }}>{t.criteria}</div>
            </section>
          </>
        )}

        {!r && (
          <div style={{ textAlign: "center", padding: "24px 0", fontFamily: T.sans, fontSize: 14, color: T.mut }}>{t.empty}</div>
        )}

        {/* 05 Measurement log */}
        <section className="cap-card" style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10 }}>
          <SectionTitle no="05">
            {t.s05}{log.length > 0 && <span style={{ fontFamily: T.mono, fontSize: 12, color: T.amber, marginLeft: 8 }}>({log.length})</span>}
          </SectionTitle>

          <div className="cap-btn-bar" style={{ marginBottom: 14 }}>
            <Btn onClick={exportExcel} disabled={!log.length} grow>⬇ {t.xlsBtn}</Btn>
            <Btn onClick={exportPDF} disabled={!log.length} grow>🖨 {t.pdfBtn}</Btn>
            <Btn onClick={clearLog} kind="danger" disabled={!log.length} grow>✕ {t.clearBtn}</Btn>
          </div>

          {hint && (
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.mut, marginBottom: 12, lineHeight: 1.5 }}>{hint}</div>
          )}

          {log.length === 0 ? (
            <div style={{ fontFamily: T.sans, fontSize: 13, color: T.mut, padding: "8px 0" }}>{t.logEmpty}</div>
          ) : (
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", margin: "0 -16px", padding: "0 16px" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 760 }}>
                <thead>
                  <tr>
                    <th style={thStyle}>{t.th.no}</th>
                    <th style={thStyle}>{t.th.id}</th>
                    <th style={thStyle}>{t.th.cap}</th>
                    <th style={thStyle}>{t.th.farad}</th>
                    <th style={thStyle}>{t.th.phase}</th>
                    <th style={thStyle}>{t.th.volt}</th>
                    <th style={thStyle}>{t.th.freq}</th>
                    <th style={thStyle}>{t.th.kvar}</th>
                    <th style={thStyle}>{t.th.dev}</th>
                    <th style={thStyle}>{t.th.status}</th>
                    <th style={thStyle}>{t.th.time}</th>
                  </tr>
                </thead>
                <tbody>
                  {log.map((x) => (
                    <tr key={x.no}>
                      <td style={{ ...tdStyle, color: T.amber }}>{x.no}</td>
                      <td style={tdStyle}>{x.unitId}</td>
                      <td style={tdStyle}>{fmt(x.uF)}</td>
                      <td style={tdStyle}>{x.farad.toExponential(4)}</td>
                      <td style={tdStyle}>{x.phase === 3 ? "3Φ" : "1Φ"}</td>
                      <td style={tdStyle}>{fmt(x.volt, 0)}</td>
                      <td style={tdStyle}>{fmt(x.freq, 0)}</td>
                      <td style={{ ...tdStyle, color: T.amber, fontWeight: 600 }}>{fmt(x.kvar)}</td>
                      <td style={tdStyle}>{x.dev == null ? "—" : `${fmt(x.dev)}%`}</td>
                      <td style={tdStyle}><Badge label={t.cls[x.status]} color={x.statusColor} /></td>
                      <td style={{ ...tdStyle, color: T.mut, fontSize: 12 }}>{x.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer style={{ textAlign: "center", fontFamily: T.mono, fontSize: 11, color: T.mut, letterSpacing: "0.08em", padding: "0 16px" }}>{t.footer}</footer>
    </div>
  );
}
