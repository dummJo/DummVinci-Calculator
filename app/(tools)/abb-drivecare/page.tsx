"use client";
// app/(tools)/abb-drivecare/page.tsx — PTTS ABB DriveCare Field Service PM Report

import { useState, useEffect, useRef } from "react";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";
import {
  Printer,
  Camera,
  X,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type TriStatus = "clean" | "medium" | "dirty" | "";
type RiskLevel = "low" | "medium" | "high" | "";
type VibrationLevel = "normal" | "high" | "unknown" | "";
type YesNoUnknown = "yes" | "no" | "unknown" | "";
type YesNo = "yes" | "no" | "";
type PassFailNa = "pass" | "fail" | "na" | "";
type DoneNotNa = "done" | "not_done" | "na" | "";
type InspectionStatus = TriStatus | DoneNotNa;

interface ImageAttachment {
  url: string;
  caption: string;
}

interface CustomerInfo {
  country: string;
  abbUnit: string;
  companyName: string;
  address: string;
  siteName: string;
  siteAddress: string;
  contactPerson: string;
  phone: string;
  email: string;
  contractNumber: string;
  jobNumber: string;
  poNumber: string;
}

interface ServiceProviderInfo {
  serviceEngineer: string;
  engineerEmail: string;
}

interface EquipmentDetails {
  assetName: string;
  serialNumber: string;
  shortTypeCode: string;
  longTypeCode: string;
  application: string;
  firmwareVersion: string;
  commissioningDate: string;
  dateOfEvent: string;
  partNumber: string;
  customerEquipmentId: string;
}

interface EnvironmentalConditions {
  cleanliness: TriStatus;
  corrosiveGasRisk: RiskLevel;
  vibrationLevel: VibrationLevel;
  airConditioning: YesNoUnknown;
  electricalRoom: YesNo;
  temperature: string;
  humidity: string;
  altitude: string;
  comments: string;
}

interface DailyWorkLog {
  activities: string;
  comments: string;
}

interface VisualRow {
  status: InspectionStatus;
  comments: string;
  images: ImageAttachment[];
}

interface MeasurementRowData {
  status: PassFailNa;
  value: string;
  comments: string;
}

interface ServiceActionRowData {
  status: DoneNotNa;
  materialCode: string;
  comments: string;
}

interface SignatureBlock {
  name: string;
  title: string;
  date: string;
}

interface ReportState {
  reportDate: string;
  customer: CustomerInfo;
  provider: ServiceProviderInfo;
  equipment: EquipmentDetails;
  environment: EnvironmentalConditions;
  workLog: DailyWorkLog;
  visual: Record<string, VisualRow>;
  measurements: Record<string, MeasurementRowData>;
  serviceActions: Record<string, ServiceActionRowData>;
  signaturePrepared: SignatureBlock;
  signatureCustomer: SignatureBlock;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const VISUAL_ITEMS = [
  { id: "vi1", en: "Cleanliness of Unit", id_: "Kebersihan Unit", type: "tri" as const },
  { id: "vi2", en: "Cleanliness of Heat Sink", id_: "Kebersihan Heat Sink", type: "tri" as const },
  { id: "vi3", en: "Corrosion Level of Unit", id_: "Tingkat Korosi Unit", type: "tri" as const },
  { id: "vi4", en: "Condition of Cooling Fan", id_: "Kondisi Kipas Pendingin", type: "done" as const },
  { id: "vi5", en: "Power Connections Tightening Torque Inspection", id_: "Inspeksi Torsi Sambungan Daya", type: "done" as const },
  { id: "vi6", en: "Power Module Solders / Press-Fits Inspection", id_: "Inspeksi Solder / Press-Fit Modul Daya", type: "done" as const },
  { id: "vi7", en: "Circuit Boards and Main Circuits Inspection", id_: "Inspeksi Board Sirkuit & Rangkaian Utama", type: "done" as const },
];

const MEASUREMENT_ITEMS = [
  { id: "m1", en: "Input Bridge Measurement", id_: "Pengukuran Input Bridge" },
  { id: "m2", en: "Line IGBT Measurement", id_: "Pengukuran IGBT Line" },
  { id: "m3", en: "INU Motor IGBT Measurement", id_: "Pengukuran IGBT Motor INU" },
  { id: "m4", en: "Temperature Sensor Measurement", id_: "Pengukuran Sensor Suhu" },
  { id: "m5", en: "Brake Chopper Measurement", id_: "Pengukuran Brake Chopper" },
  { id: "m6", en: "Charging Resistor Measurement", id_: "Pengukuran Resistor Charging" },
  { id: "m7", en: "Charging Capacitor Measurement", id_: "Pengukuran Kapasitor Charging" },
];

const SERVICE_ACTION_ITEMS = [
  { id: "sa1", en: "Cooling Fan Replacement", id_: "Penggantian Kipas Pendingin" },
  { id: "sa2", en: "Liquid Cooling System Maintenance", id_: "Perawatan Sistem Pendingin Cair" },
  { id: "sa3", en: "Backup Battery Replacement", id_: "Penggantian Baterai Cadangan" },
  { id: "sa4", en: "Heat Sink Temperature Check and Cleaning", id_: "Pemeriksaan Suhu & Pembersihan Heat Sink" },
  { id: "sa5", en: "Replacement of Circuit Boards", id_: "Penggantian Board Sirkuit" },
  { id: "sa6", en: "Replacement of DC-Link Capacitors", id_: "Penggantian Kapasitor DC-Link" },
  { id: "sa7", en: "Replacement of Charging / Discharging Resistors", id_: "Penggantian Resistor Charging / Discharging" },
  { id: "sa8", en: "Air Filter Replacement", id_: "Penggantian Filter Udara" },
];

const COMPANY_NAME = "PT Prima Tekindo Tirta Sejahtera (PTTS)";
const COMPANY_ADDR1 = "Jl. Pangeran Jayakarta Ruko 141 Blok A1 No.11";
const COMPANY_ADDR2 = "Jembatan Merah, Jakarta Pusat 10730 - Indonesia";
const COMPANY_TEL_FAX = "Tel : (021) 629 3028   |   Fax : (021) 629 3018";
const COMPANY_EMAIL = "Email : info@ptts.co.id";

function createInitialState(): ReportState {
  return {
    reportDate: new Date().toISOString().split("T")[0]!,
    customer: { country: "", abbUnit: "", companyName: "", address: "", siteName: "", siteAddress: "", contactPerson: "", phone: "", email: "", contractNumber: "", jobNumber: "", poNumber: "" },
    provider: { serviceEngineer: "", engineerEmail: "" },
    equipment: { assetName: "", serialNumber: "", shortTypeCode: "", longTypeCode: "", application: "", firmwareVersion: "", commissioningDate: "", dateOfEvent: "", partNumber: "", customerEquipmentId: "" },
    environment: { cleanliness: "", corrosiveGasRisk: "", vibrationLevel: "", airConditioning: "", electricalRoom: "", temperature: "", humidity: "", altitude: "", comments: "" },
    workLog: { activities: "", comments: "" },
    visual: Object.fromEntries(VISUAL_ITEMS.map(i => [i.id, { status: "" as InspectionStatus, comments: "", images: [] }])),
    measurements: Object.fromEntries(MEASUREMENT_ITEMS.map(i => [i.id, { status: "" as PassFailNa, value: "", comments: "" }])),
    serviceActions: Object.fromEntries(SERVICE_ACTION_ITEMS.map(i => [i.id, { status: "" as DoneNotNa, materialCode: "", comments: "" }])),
    signaturePrepared: { name: "", title: "Engineer", date: "" },
    signatureCustomer: { name: "", title: "Site Representative", date: "" },
  };
}

// ─── Image compression helper ────────────────────────────────────────────────
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 1000;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
        else { if (h > MAX) { w *= MAX / h; h = MAX; } }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const STORAGE_KEY = "ptts_drivecare_report_v2";

// ─── Extracted Sub-Components (must be outside main component) ────────────────

function SectionHeader({ id, title, collapsed, onToggle }: { id: string; title: string; collapsed: boolean; onToggle: (id: string) => void }) {
  return (
    <div
      className="sec-head"
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 20px", background: "var(--dark)", color: "#fff", cursor: "pointer", userSelect: "none" }}
      onClick={() => onToggle(id)}
    >
      <span className="sec-icon no-print">{collapsed ? "➕" : "➖"}</span>
      <h3 style={{ fontFamily: "var(--font-h)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", flex: 1, margin: 0 }}>{title}</h3>
      <span className="no-print">{collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}</span>
    </div>
  );
}

function FieldRow({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="unit-field" style={{ padding: "10px 20px" }}>
      <div className="u-label" style={{ fontFamily: "var(--font-h)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray)" }}>{label}</div>
      <input type="text" className="u-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || ""} style={{ width: "100%", border: "none", borderBottom: "1.5px dashed var(--border)", background: "transparent", outline: "none", fontSize: 13, fontWeight: 600, color: "var(--dark)", padding: "2px 0 4px", fontFamily: "var(--font-h)" }} />
    </div>
  );
}

function StatusSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { val: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="status-select"
      style={{ fontFamily: "var(--font-h)", fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 6, border: "1.5px solid var(--border)", background: value ? (value === "dirty" || value === "high" || value === "fail" ? "var(--red-lt)" : value === "medium" ? "var(--amber-lt)" : "var(--green-lt)") : "var(--light)", color: value ? (value === "dirty" || value === "high" || value === "fail" ? "var(--red)" : value === "medium" ? "var(--amber)" : "var(--green)") : "var(--gray)", outline: "none", cursor: "pointer", minWidth: 100 }}
    >
      <option value="">—</option>
      {options.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
    </select>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AbbDriveCarePage() {
  const { lang } = useLang();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [report, setReport] = useState<ReportState>(createInitialState);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setTimeout(() => {
          try { setReport(JSON.parse(saved)); } catch { /* ignore corrupt data */ }
        }, 0);
      }
    }
  }, []);

  // Save helper
  const save = (next: ReportState) => {
    setReport(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  // ─── Field Updaters ──────────────────────────────────────────────────────
  const updateCustomer = (field: keyof CustomerInfo, value: string) => {
    save({ ...report, customer: { ...report.customer, [field]: value } });
  };
  const updateProvider = (field: keyof ServiceProviderInfo, value: string) => {
    save({ ...report, provider: { ...report.provider, [field]: value } });
  };
  const updateEquipment = (field: keyof EquipmentDetails, value: string) => {
    save({ ...report, equipment: { ...report.equipment, [field]: value } });
  };
  const updateEnvironment = (field: keyof EnvironmentalConditions, value: string) => {
    save({ ...report, environment: { ...report.environment, [field]: value } });
  };
  const updateWorkLog = (field: keyof DailyWorkLog, value: string) => {
    save({ ...report, workLog: { ...report.workLog, [field]: value } });
  };
  const updateVisual = (id: string, field: keyof VisualRow, value: string) => {
    const current = Reflect.get(report.visual, id) as VisualRow | undefined;
    if (!current) return;
    const next = { ...current, [field]: value };
    save({ ...report, visual: { ...report.visual, [id]: next } });
  };
  const updateMeasurement = (id: string, field: keyof MeasurementRowData, value: string) => {
    const current = Reflect.get(report.measurements, id) as MeasurementRowData | undefined;
    if (!current) return;
    const next = { ...current, [field]: value };
    save({ ...report, measurements: { ...report.measurements, [id]: next } });
  };
  const updateServiceAction = (id: string, field: keyof ServiceActionRowData, value: string) => {
    const current = Reflect.get(report.serviceActions, id) as ServiceActionRowData | undefined;
    if (!current) return;
    const next = { ...current, [field]: value };
    save({ ...report, serviceActions: { ...report.serviceActions, [id]: next } });
  };
  const updateSignature = (who: "signaturePrepared" | "signatureCustomer", field: keyof SignatureBlock, value: string) => {
    const block = who === "signaturePrepared" ? { ...report.signaturePrepared } : { ...report.signatureCustomer };
    Reflect.set(block, field, value);
    if (who === "signaturePrepared") {
      save({ ...report, signaturePrepared: block });
    } else {
      save({ ...report, signatureCustomer: block });
    }
  };

  // ─── Image handlers for Visual Inspection ────────────────────────────────
  const handleImageUpload = async (itemId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const current = (Reflect.get(report.visual, itemId) as VisualRow | undefined);
    if (!current) return;
    const currentImages = current.images || [];
    if (currentImages.length >= 3) return;
    const newAttachments = [...currentImages];
    const uploadCount = Math.min(files.length, 3 - currentImages.length);
    for (let i = 0; i < uploadCount; i++) {
      const file = files.item(i);
      if (!file || !file.type.match("image.*")) continue;
      try {
        const compressed = await compressImage(file);
        newAttachments.push({ url: compressed, caption: `Photo ${newAttachments.length + 1}` });
      } catch (error) { console.error("Image compression error:", error); }
    }
    save({ ...report, visual: { ...report.visual, [itemId]: { ...current, images: newAttachments } } });
  };

  const removeImage = (itemId: string, imgIdx: number) => {
    const current = (Reflect.get(report.visual, itemId) as VisualRow | undefined);
    if (!current) return;
    const newImages = (current.images || []).filter((_, i) => i !== imgIdx);
    save({ ...report, visual: { ...report.visual, [itemId]: { ...current, images: newImages } } });
  };

  // ─── Actions ─────────────────────────────────────────────────────────────
  const clearForm = () => {
    const msg = lang === "id"
      ? "Apakah Anda yakin ingin mengosongkan seluruh formulir ini?"
      : "Are you sure you want to clear this entire form?";
    if (confirm(msg)) {
      save(createInitialState());
    }
  };

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => {
      const next = { ...prev };
      const currentVal = !!Reflect.get(prev, key);
      Reflect.set(next, key, !currentVal);
      return next;
    });
  };

  const triOptions = [{ val: "clean", label: "Clean" }, { val: "medium", label: "Medium" }, { val: "dirty", label: "Dirty" }];
  const doneOptions = [{ val: "done", label: "Done" }, { val: "not_done", label: "Not Done" }, { val: "na", label: "N/A" }];
  const passOptions = [{ val: "pass", label: "Pass" }, { val: "fail", label: "Fail" }, { val: "na", label: "N/A" }];
  const riskOptions = [{ val: "low", label: "Low" }, { val: "medium", label: "Medium" }, { val: "high", label: "High" }];
  const vibOptions = [{ val: "normal", label: "Normal" }, { val: "high", label: "High" }, { val: "unknown", label: "Unknown" }];
  const ynuOptions = [{ val: "yes", label: "Yes" }, { val: "no", label: "No" }, { val: "unknown", label: "Unknown" }];
  const ynOptions = [{ val: "yes", label: "Yes" }, { val: "no", label: "No" }];

  return (
    <div className="page" style={{ padding: "28px 20px 100px", maxWidth: 900, margin: "0 auto" }}>
      {/* ─── Styles ─────────────────────────────────────────────────────────── */}
      <style>{`
        :root {
          --dark: #0f0f0e; --dark-2: #1c1c1a; --light: #faf9f5; --light-2: #f2f0e8;
          --gray: #8a8880; --border: #d8d5cc; --orange: #c95f32; --orange-lt: #f5e8e1;
          --green: #4a6b35; --green-lt: #e4edd9; --red: #a83228; --red-lt: #f5e0dd;
          --amber: #8a6010; --amber-lt: #f5ecd4; --blue: #2a5c8a; --blue-lt: #ddeaf5;
          --font-h: 'Poppins', Arial, sans-serif; --font-b: 'Lora', Georgia, serif;
          --font-mono: 'SFMono-Regular','Menlo','Consolas', monospace;
          --r: 10px; --shadow: 0 1px 4px rgba(0,0,0,0.09), 0 1px 2px rgba(0,0,0,0.06);
        }
        .kop { display: block; margin-bottom: 0; padding: 20px 0 0; }
        .kop-divider { border: none; border-top: 2.5px solid var(--dark); margin: 8px 0 0; }
        .kop-sub-divider { border: none; border-top: 1px solid var(--border); margin: 3px 0 0; }
        .section-box { margin-bottom: 22px; border: 1px solid var(--border); border-radius: var(--r); background: #fff; box-shadow: var(--shadow); overflow: hidden; }
        .unit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
        .unit-field { border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); }
        .unit-field:nth-child(even) { border-right: none; }

        /* Tables */
        .rpt-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
        .rpt-table th { font-family: var(--font-h); font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray); padding: 8px 12px; text-align: left; border-bottom: 2px solid var(--border); background: var(--light-2); }
        .rpt-table td { padding: 8px 12px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        .rpt-table tr:last-child td { border-bottom: none; }
        .rpt-table .td-label { font-family: var(--font-h); font-weight: 600; font-size: 12.5px; color: var(--dark); min-width: 200px; }
        .rpt-table input, .rpt-table textarea { font-family: var(--font-h); font-size: 12px; font-weight: 500; color: var(--dark); border: none; border-bottom: 1px dashed var(--border); background: transparent; outline: none; padding: 2px 0; width: 100%; }
        .rpt-table textarea { resize: vertical; min-height: 24px; height: 28px; }

        /* Image grid */
        .img-grid { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
        .img-thumb { position: relative; width: 80px; height: 60px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border); }
        .img-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .img-thumb .img-del { position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 10px; }

        /* Static PTTS address */
        .ptts-address { font-family: var(--font-h); font-size: 12px; color: var(--dark); line-height: 1.7; padding: 16px 20px; }
        .ptts-address strong { font-weight: 700; }

        /* Signature */
        .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; padding: 30px 20px; }
        .sig-block { text-align: center; }
        .sig-label { font-family: var(--font-h); font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gray); margin-bottom: 6px; }
        .sig-line { border-bottom: 1px solid var(--dark); width: 200px; margin: 60px auto 6px; }
        .sig-input { font-family: var(--font-h); font-size: 12px; font-weight: 600; color: var(--dark); border: none; border-bottom: 1px dashed var(--border); background: transparent; outline: none; text-align: center; width: 200px; margin: 4px auto; display: block; }

        /* ─── PRINT ─────────────────────────────────────────────────────────── */
        @media print {
          html, body { background: #fff !important; background-image: none !important; color: #000 !important; font-family: 'Lora', Georgia, serif !important; font-size: 11px !important; margin: 0 !important; padding: 0 !important; }
          header[aria-label="Site header"], nav, .dv-ascii, [class*="SplashScreen"], [class*="CursorGlow"], [class*="SharedWatermark"], [class*="FeedbackButton"], button[aria-label*="feedback" i], button[aria-label*="theme" i], [data-vercel-speed-insights], script, .drivecare-footer-wrap { display: none !important; visibility: hidden !important; height: 0 !important; overflow: hidden !important; }
          #app-root { padding-bottom: 0 !important; min-height: auto !important; }
          .page { padding: 0 20px 20px !important; margin: 0 !important; max-width: 100% !important; box-shadow: none !important; }
          .actions-row, .no-print, .img-del, .sec-icon { display: none !important; }
          .kop { padding: 0 !important; margin-bottom: 0 !important; }
          .kop img { max-height: 80px !important; }
          .kop-divider { border-top: 2.5px solid #000 !important; margin: 6px 0 0 !important; }
          .kop-sub-divider { border-top: 1px solid #999 !important; margin: 3px 0 0 !important; }
          .section-box { page-break-inside: avoid !important; break-inside: avoid !important; box-shadow: none !important; border-color: #ccc !important; }
          .sec-head { background: #1c1c1a !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; cursor: default !important; }
          .u-input, .rpt-table input, .rpt-table textarea, .sig-input { border-bottom: none !important; font-weight: bold !important; background: transparent !important; background-image: none !important; }
          input, select, textarea { background-image: none !important; background-color: transparent !important; }
          .status-select { border: 1px solid #999 !important; -webkit-appearance: none; appearance: none; background: transparent !important; background-image: none !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .sig-grid { page-break-inside: avoid; }
          @page { margin: 1.5cm; }
          .rpt-table { page-break-inside: auto; }
          .rpt-table tr { page-break-inside: avoid; }
        }

        @media(max-width:560px) {
          .unit-grid { grid-template-columns: 1fr; }
          .unit-field { border-right: none !important; }
          .sig-grid { grid-template-columns: 1fr; gap: 30px; }
          .rpt-table { font-size: 11px; }
          .rpt-table th, .rpt-table td { padding: 6px 8px; }
        }
      `}</style>

      {/* ─── KOP SURAT ──────────────────────────────────────────────────────── */}
      <div className="kop">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-dv-ptts.png" alt="PTTS — ABB Value Provider Logo Banner" style={{ width: "100%", height: "auto", display: "block" }} />
        <hr className="kop-divider" />
        <hr className="kop-sub-divider" />
      </div>

      {/* ─── REPORT HEADER ──────────────────────────────────────────────────── */}
      <div style={{ marginTop: 20, marginBottom: 28, paddingBottom: 16, borderBottom: "1.5px solid var(--border)" }}>
        <div style={{ fontFamily: "var(--font-h)", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "var(--orange)", textTransform: "uppercase", marginBottom: 6 }}>
          {"PTTS DriveCare"}
        </div>
        <h1 style={{ fontFamily: "var(--font-h)", fontSize: 24, fontWeight: 800, color: "var(--dark)", margin: "0 0 4px" }}>
          {lang === "id" ? "Laporan Pemeliharaan Preventif — Field Service" : "Field Service Preventive Maintenance Report"}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
          <span style={{ fontFamily: "var(--font-h)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gray)" }}>
            {lang === "id" ? "Tanggal Laporan" : "Report Date"}
          </span>
          <input type="date" className="u-input" value={report.reportDate} onChange={(e) => save({ ...report, reportDate: e.target.value })}
            style={{ border: "none", borderBottom: "1.5px dashed var(--border)", background: "transparent", outline: "none", fontSize: 13, fontWeight: 600, color: "var(--dark)", padding: "2px 4px", fontFamily: "var(--font-h)" }} />
        </div>
      </div>

      {/* ─── ACTIONS ROW ────────────────────────────────────────────────────── */}
      <div className="actions-row no-print" style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-h)", fontSize: 12, fontWeight: 700, padding: "9px 20px", borderRadius: 8, border: "1.5px solid var(--dark)", background: "var(--dark)", color: "#fff", cursor: "pointer" }}>
          <Printer size={16} />
          {lang === "id" ? "Cetak / PDF" : "Print / PDF"}
        </button>
        <button className="btn btn-outline" onClick={clearForm} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-h)", fontSize: 12, fontWeight: 700, padding: "9px 20px", borderRadius: 8, border: "1.5px solid var(--border)", background: "#fff", color: "#52504c", cursor: "pointer" }}>
          <RotateCcw size={16} />
          {lang === "id" ? "Kosongkan" : "Clear Form"}
        </button>
      </div>

      {/* ═══ SECTION 1: CUSTOMER INFORMATION ═══════════════════════════════════ */}
      <div className="section-box">
        <SectionHeader id="s1" title={lang === "id" ? "1. Informasi Pelanggan" : "1. Customer Information"} collapsed={!!collapsedSections["s1"]} onToggle={toggleSection} />
        {!collapsedSections["s1"] && (
          <div className="unit-grid">
            <FieldRow label={lang === "id" ? "Negara" : "Country"} value={report.customer.country} onChange={(v) => updateCustomer("country", v)} placeholder="Indonesia" />
            <FieldRow label={lang === "id" ? "Unit ABB" : "ABB Unit"} value={report.customer.abbUnit} onChange={(v) => updateCustomer("abbUnit", v)} />
            <FieldRow label={lang === "id" ? "Nama Perusahaan" : "Company Name"} value={report.customer.companyName} onChange={(v) => updateCustomer("companyName", v)} />
            <FieldRow label={lang === "id" ? "Alamat" : "Address"} value={report.customer.address} onChange={(v) => updateCustomer("address", v)} />
            <FieldRow label={lang === "id" ? "Nama Site" : "Site Name"} value={report.customer.siteName} onChange={(v) => updateCustomer("siteName", v)} />
            <FieldRow label={lang === "id" ? "Alamat Site" : "Site Address"} value={report.customer.siteAddress} onChange={(v) => updateCustomer("siteAddress", v)} />
            <FieldRow label={lang === "id" ? "Kontak" : "Contact Person"} value={report.customer.contactPerson} onChange={(v) => updateCustomer("contactPerson", v)} />
            <FieldRow label={lang === "id" ? "Telepon" : "Phone"} value={report.customer.phone} onChange={(v) => updateCustomer("phone", v)} />
            <FieldRow label="Email" value={report.customer.email} onChange={(v) => updateCustomer("email", v)} />
            <FieldRow label={lang === "id" ? "Nomor Kontrak" : "Contract Number"} value={report.customer.contractNumber} onChange={(v) => updateCustomer("contractNumber", v)} />
            <FieldRow label={lang === "id" ? "Nomor Pekerjaan" : "Job Number"} value={report.customer.jobNumber} onChange={(v) => updateCustomer("jobNumber", v)} />
            <FieldRow label={lang === "id" ? "Nomor PO" : "PO Number"} value={report.customer.poNumber} onChange={(v) => updateCustomer("poNumber", v)} />
          </div>
        )}
      </div>

      {/* ═══ SECTION 2: SERVICE PROVIDER INFORMATION ═══════════════════════════ */}
      <div className="section-box">
        <SectionHeader id="s2" title={lang === "id" ? "2. Informasi Penyedia Layanan" : "2. Service Provider Information"} collapsed={!!collapsedSections["s2"]} onToggle={toggleSection} />
        {!collapsedSections["s2"] && (
          <>
            <div className="unit-grid">
              <FieldRow label="Service Engineer" value={report.provider.serviceEngineer} onChange={(v) => updateProvider("serviceEngineer", v)} placeholder="e.g. Joko Susilo" />
              <FieldRow label="Engineer Email" value={report.provider.engineerEmail} onChange={(v) => updateProvider("engineerEmail", v)} placeholder="engineer@ptts.co.id" />
            </div>
            <div className="ptts-address" style={{ borderTop: "1px solid var(--border)" }}>
              <strong>{COMPANY_NAME}</strong><br />
              {COMPANY_ADDR1}<br />
              {COMPANY_ADDR2}<br /><br />
              {COMPANY_TEL_FAX}<br />
              {COMPANY_EMAIL}
            </div>
          </>
        )}
      </div>

      {/* ═══ SECTION 3: EQUIPMENT DETAILS ══════════════════════════════════════ */}
      <div className="section-box">
        <SectionHeader id="s3" title={lang === "id" ? "3. Detail Peralatan" : "3. Equipment Details"} collapsed={!!collapsedSections["s3"]} onToggle={toggleSection} />
        {!collapsedSections["s3"] && (
          <div className="unit-grid">
            <FieldRow label={lang === "id" ? "Nama Aset" : "Asset Name"} value={report.equipment.assetName} onChange={(v) => updateEquipment("assetName", v)} />
            <FieldRow label="Serial Number" value={report.equipment.serialNumber} onChange={(v) => updateEquipment("serialNumber", v)} />
            <FieldRow label="Short Type Code" value={report.equipment.shortTypeCode} onChange={(v) => updateEquipment("shortTypeCode", v)} placeholder="e.g. ACQ580-01-206A-4" />
            <FieldRow label="Long Type Code" value={report.equipment.longTypeCode} onChange={(v) => updateEquipment("longTypeCode", v)} />
            <FieldRow label={lang === "id" ? "Aplikasi" : "Application"} value={report.equipment.application} onChange={(v) => updateEquipment("application", v)} />
            <FieldRow label={lang === "id" ? "Versi Firmware" : "Firmware Version"} value={report.equipment.firmwareVersion} onChange={(v) => updateEquipment("firmwareVersion", v)} />
            <FieldRow label={lang === "id" ? "Tanggal Komisioning" : "Commissioning Date"} value={report.equipment.commissioningDate} onChange={(v) => updateEquipment("commissioningDate", v)} />
            <FieldRow label={lang === "id" ? "Tanggal Kejadian" : "Date of Event"} value={report.equipment.dateOfEvent} onChange={(v) => updateEquipment("dateOfEvent", v)} />
            <FieldRow label="Part Number" value={report.equipment.partNumber} onChange={(v) => updateEquipment("partNumber", v)} />
            <FieldRow label={lang === "id" ? "ID Peralatan Pelanggan" : "Customer Equipment ID"} value={report.equipment.customerEquipmentId} onChange={(v) => updateEquipment("customerEquipmentId", v)} />
          </div>
        )}
      </div>

      {/* ═══ SECTION 3.1: ENVIRONMENTAL CONDITIONS ════════════════════════════ */}
      <div className="section-box">
        <SectionHeader id="s31" title={lang === "id" ? "3.1 Kondisi Lingkungan" : "3.1 Environmental Conditions"} collapsed={!!collapsedSections["s31"]} onToggle={toggleSection} />
        {!collapsedSections["s31"] && (
          <div style={{ padding: "16px 20px" }}>
            <table className="rpt-table">
              <thead><tr><th style={{ width: "55%" }}>{"Parameter"}</th><th>{"Status"}</th></tr></thead>
              <tbody>
                <tr><td className="td-label">{lang === "id" ? "Kebersihan Lingkungan" : "Cleanliness of Environment"}</td><td><StatusSelect value={report.environment.cleanliness} onChange={(v) => updateEnvironment("cleanliness", v)} options={triOptions} /></td></tr>
                <tr><td className="td-label">{lang === "id" ? "Risiko Gas Korosif" : "Risk Level for Corrosive Gases"}</td><td><StatusSelect value={report.environment.corrosiveGasRisk} onChange={(v) => updateEnvironment("corrosiveGasRisk", v)} options={riskOptions} /></td></tr>
                <tr><td className="td-label">{lang === "id" ? "Tingkat Getaran" : "Vibration Level"}</td><td><StatusSelect value={report.environment.vibrationLevel} onChange={(v) => updateEnvironment("vibrationLevel", v)} options={vibOptions} /></td></tr>
                <tr><td className="td-label">{lang === "id" ? "AC dengan Pendingin" : "Air Conditioning with Cooling"}</td><td><StatusSelect value={report.environment.airConditioning} onChange={(v) => updateEnvironment("airConditioning", v)} options={ynuOptions} /></td></tr>
                <tr><td className="td-label">{lang === "id" ? "Ruang Elektrikal" : "Electrical Room"}</td><td><StatusSelect value={report.environment.electricalRoom} onChange={(v) => updateEnvironment("electricalRoom", v)} options={ynOptions} /></td></tr>
                <tr><td className="td-label">{lang === "id" ? "Suhu" : "Temperature"}</td><td><input type="text" value={report.environment.temperature} onChange={(e) => updateEnvironment("temperature", e.target.value)} placeholder="e.g. 32°C" /></td></tr>
                <tr><td className="td-label">{lang === "id" ? "Kelembapan" : "Humidity"}</td><td><input type="text" value={report.environment.humidity} onChange={(e) => updateEnvironment("humidity", e.target.value)} placeholder="e.g. 65%" /></td></tr>
                <tr><td className="td-label">{lang === "id" ? "Ketinggian" : "Altitude"}</td><td><input type="text" value={report.environment.altitude} onChange={(e) => updateEnvironment("altitude", e.target.value)} placeholder="e.g. 15 m" /></td></tr>
              </tbody>
            </table>
            <div style={{ marginTop: 12 }}>
              <div className="u-label" style={{ fontFamily: "var(--font-h)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray)", marginBottom: 4 }}>{lang === "id" ? "Komentar" : "Comments"}</div>
              <textarea className="u-input" value={report.environment.comments} onChange={(e) => updateEnvironment("comments", e.target.value)} placeholder={lang === "id" ? "Catatan kondisi lingkungan..." : "Environmental condition notes..."} style={{ width: "100%", minHeight: 50, border: "1.5px solid var(--border)", borderRadius: 6, padding: "8px 10px", fontFamily: "var(--font-b)", fontSize: 12.5, color: "var(--dark)", background: "var(--light-2)", outline: "none", resize: "vertical" }} />
            </div>
          </div>
        )}
      </div>

      {/* ═══ SECTION 3.2: DAILY WORK LOG ══════════════════════════════════════ */}
      <div className="section-box">
        <SectionHeader id="s32" title={lang === "id" ? "3.2 Catatan Kerja Harian" : "3.2 Daily Work Log"} collapsed={!!collapsedSections["s32"]} onToggle={toggleSection} />
        {!collapsedSections["s32"] && (
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div className="u-label" style={{ fontFamily: "var(--font-h)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray)", marginBottom: 4 }}>{lang === "id" ? "Aktivitas yang Dilakukan" : "Activities Performed"}</div>
              <textarea className="u-input" value={report.workLog.activities} onChange={(e) => updateWorkLog("activities", e.target.value)} placeholder={lang === "id" ? "Deskripsi pekerjaan yang dilakukan..." : "Describe activities performed..."} style={{ width: "100%", minHeight: 80, border: "1.5px solid var(--border)", borderRadius: 6, padding: "8px 10px", fontFamily: "var(--font-b)", fontSize: 12.5, color: "var(--dark)", background: "var(--light-2)", outline: "none", resize: "vertical" }} />
            </div>
            <div>
              <div className="u-label" style={{ fontFamily: "var(--font-h)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray)", marginBottom: 4 }}>{lang === "id" ? "Komentar" : "Comments"}</div>
              <textarea className="u-input" value={report.workLog.comments} onChange={(e) => updateWorkLog("comments", e.target.value)} placeholder={lang === "id" ? "Catatan tambahan..." : "Additional remarks..."} style={{ width: "100%", minHeight: 60, border: "1.5px solid var(--border)", borderRadius: 6, padding: "8px 10px", fontFamily: "var(--font-b)", fontSize: 12.5, color: "var(--dark)", background: "var(--light-2)", outline: "none", resize: "vertical" }} />
            </div>
          </div>
        )}
      </div>

      {/* ═══ SECTION 4: SERVICE ACTIVITIES — EQUIPMENT HEADER ═════════════════ */}
      <div style={{ marginTop: 8, marginBottom: 8, padding: "12px 0", borderBottom: "1.5px solid var(--border)" }}>
        <div style={{ fontFamily: "var(--font-h)", fontSize: 16, fontWeight: 800, color: "var(--dark)" }}>
          {lang === "id" ? "4. Aktivitas Servis" : "4. Service Activities"}
        </div>
        <div style={{ fontFamily: "var(--font-h)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gray)", marginTop: 4 }}>
          {lang === "id" ? "Peralatan" : "Equipment"}: <span style={{ color: "var(--dark)", fontWeight: 800 }}>{report.equipment.shortTypeCode || "—"}</span>
          &nbsp;&nbsp;|&nbsp;&nbsp;S/N: <span style={{ color: "var(--dark)", fontWeight: 800 }}>{report.equipment.serialNumber || "—"}</span>
        </div>
      </div>

      {/* ═══ SECTION 4.1: VISUAL INSPECTION ═══════════════════════════════════ */}
      <div className="section-box">
        <SectionHeader id="s41" title={lang === "id" ? "4.1 Inspeksi Visual" : "4.1 Visual Inspection"} collapsed={!!collapsedSections["s41"]} onToggle={toggleSection} />
        {!collapsedSections["s41"] && (
          <div style={{ padding: "0" }}>
            <table className="rpt-table">
              <thead><tr>
                <th style={{ width: "40%" }}>{lang === "id" ? "Item Inspeksi" : "Inspection Item"}</th>
                <th style={{ width: "15%" }}>{"Status"}</th>
                <th>{lang === "id" ? "Komentar" : "Comments"}</th>
                <th className="no-print" style={{ width: 50 }}></th>
              </tr></thead>
              <tbody>
                {VISUAL_ITEMS.map((item) => {
                  const row = (Reflect.get(report.visual, item.id) as VisualRow | undefined) || { status: "" as InspectionStatus, comments: "", images: [] };
                  return (
                    <tr key={item.id}>
                      <td className="td-label">{lang === "id" ? item.id_ : item.en}</td>
                      <td><StatusSelect value={row.status} onChange={(v) => updateVisual(item.id, "status", v)} options={item.type === "tri" ? triOptions : doneOptions} /></td>
                      <td><input type="text" value={row.comments} onChange={(e) => updateVisual(item.id, "comments", e.target.value)} placeholder="..." /></td>
                      <td className="no-print">
                        {(row.images || []).length < 3 && (
                          <>
                            <input type="file" accept="image/*" ref={(el) => { Reflect.set(fileInputRefs.current, item.id, el); }} onChange={(e) => handleImageUpload(item.id, e.target.files)} style={{ display: "none" }} multiple />
                            <button onClick={() => (Reflect.get(fileInputRefs.current, item.id) as HTMLInputElement | null)?.click()} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 4, padding: "2px 6px", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "var(--gray)" }}>
                              <Camera size={12} />{lang === "id" ? "Foto" : "Pic"}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Show uploaded images below the table */}
            {VISUAL_ITEMS.map((item) => {
              const row = (Reflect.get(report.visual, item.id) as VisualRow | undefined);
              if (!row || !row.images || row.images.length === 0) return null;
              return (
                <div key={`img-${item.id}`} style={{ padding: "8px 12px", borderTop: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "var(--font-h)", fontSize: 10, fontWeight: 700, color: "var(--gray)", marginBottom: 4 }}>{lang === "id" ? item.id_ : item.en}</div>
                  <div className="img-grid">
                    {row.images.map((img, idx) => (
                      <div className="img-thumb" key={idx}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={img.caption} />
                        <button className="img-del no-print" onClick={() => removeImage(item.id, idx)}><X size={10} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
              <div className="u-label" style={{ fontFamily: "var(--font-h)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray)", marginBottom: 4 }}>{lang === "id" ? "Komentar Inspeksi Visual" : "Visual Inspection Comments"}</div>
              <textarea className="u-input" value={Object.values(report.visual).map(v => v.comments).filter(Boolean).join("; ")} readOnly style={{ width: "100%", minHeight: 30, border: "none", background: "transparent", fontFamily: "var(--font-b)", fontSize: 12, color: "var(--dark)", fontStyle: "italic" }} />
            </div>
          </div>
        )}
      </div>

      {/* ═══ SECTION 4.2: MEASUREMENTS & TESTING ═════════════════════════════ */}
      <div className="section-box">
        <SectionHeader id="s42" title={lang === "id" ? "4.2 Pengukuran & Pengujian" : "4.2 Measurements and Testing"} collapsed={!!collapsedSections["s42"]} onToggle={toggleSection} />
        {!collapsedSections["s42"] && (
          <table className="rpt-table">
            <thead><tr>
              <th style={{ width: "35%" }}>{lang === "id" ? "Pengukuran" : "Measurement"}</th>
              <th style={{ width: "15%" }}>{"Status"}</th>
              <th style={{ width: "15%" }}>{lang === "id" ? "Nilai" : "Value"}</th>
              <th>{lang === "id" ? "Komentar" : "Comments"}</th>
            </tr></thead>
            <tbody>
              {MEASUREMENT_ITEMS.map((item) => {
                const row = (Reflect.get(report.measurements, item.id) as MeasurementRowData | undefined) || { status: "" as PassFailNa, value: "", comments: "" };
                return (
                  <tr key={item.id}>
                    <td className="td-label">{lang === "id" ? item.id_ : item.en}</td>
                    <td><StatusSelect value={row.status} onChange={(v) => updateMeasurement(item.id, "status", v)} options={passOptions} /></td>
                    <td><input type="text" value={row.value} onChange={(e) => updateMeasurement(item.id, "value", e.target.value)} placeholder="—" /></td>
                    <td><input type="text" value={row.comments} onChange={(e) => updateMeasurement(item.id, "comments", e.target.value)} placeholder="..." /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ═══ SECTION 4.3: SERVICE ACTIONS ════════════════════════════════════ */}
      <div className="section-box">
        <SectionHeader id="s43" title={lang === "id" ? "4.3 Tindakan Servis" : "4.3 Service Actions"} collapsed={!!collapsedSections["s43"]} onToggle={toggleSection} />
        {!collapsedSections["s43"] && (
          <table className="rpt-table">
            <thead><tr>
              <th style={{ width: "35%" }}>{lang === "id" ? "Tindakan Servis" : "Service Action"}</th>
              <th style={{ width: "15%" }}>{"Status"}</th>
              <th style={{ width: "15%" }}>{lang === "id" ? "Kode Material" : "Material Code"}</th>
              <th>{lang === "id" ? "Komentar" : "Comments"}</th>
            </tr></thead>
            <tbody>
              {SERVICE_ACTION_ITEMS.map((item) => {
                const row = (Reflect.get(report.serviceActions, item.id) as ServiceActionRowData | undefined) || { status: "" as DoneNotNa, materialCode: "", comments: "" };
                return (
                  <tr key={item.id}>
                    <td className="td-label">{lang === "id" ? item.id_ : item.en}</td>
                    <td><StatusSelect value={row.status} onChange={(v) => updateServiceAction(item.id, "status", v)} options={doneOptions} /></td>
                    <td><input type="text" value={row.materialCode} onChange={(e) => updateServiceAction(item.id, "materialCode", e.target.value)} placeholder="—" /></td>
                    <td><input type="text" value={row.comments} onChange={(e) => updateServiceAction(item.id, "comments", e.target.value)} placeholder="..." /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ═══ SIGNATURES ════════════════════════════════════════════════════════ */}
      <div className="section-box" style={{ marginTop: 30 }}>
        <div style={{ background: "var(--dark)", padding: "13px 20px" }}>
          <h3 style={{ fontFamily: "var(--font-h)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#fff", margin: 0 }}>
            {lang === "id" ? "Tanda Tangan" : "Signatures"}
          </h3>
        </div>
        <div className="sig-grid">
          {/* Prepared by PTTS */}
          <div className="sig-block">
            <div className="sig-label">{lang === "id" ? "Disiapkan oleh — PTTS" : "Prepared by — PTTS"}</div>
            <div className="sig-line" />
            <input className="sig-input" value={report.signaturePrepared.name} onChange={(e) => updateSignature("signaturePrepared", "name", e.target.value)} placeholder={lang === "id" ? "Nama" : "Name"} />
            <input className="sig-input" value={report.signaturePrepared.title} onChange={(e) => updateSignature("signaturePrepared", "title", e.target.value)} placeholder="Engineer / Supervisor" />
            <input className="sig-input" type="date" value={report.signaturePrepared.date} onChange={(e) => updateSignature("signaturePrepared", "date", e.target.value)} />
          </div>
          {/* Acknowledged by Customer */}
          <div className="sig-block">
            <div className="sig-label">{lang === "id" ? "Disetujui oleh Pelanggan" : "Acknowledged by Customer"}</div>
            <div className="sig-line" />
            <input className="sig-input" value={report.signatureCustomer.name} onChange={(e) => updateSignature("signatureCustomer", "name", e.target.value)} placeholder={lang === "id" ? "Nama" : "Name"} />
            <input className="sig-input" value={report.signatureCustomer.title} onChange={(e) => updateSignature("signatureCustomer", "title", e.target.value)} placeholder="Site Representative" />
            <input className="sig-input" type="date" value={report.signatureCustomer.date} onChange={(e) => updateSignature("signatureCustomer", "date", e.target.value)} />
          </div>
        </div>
      </div>

      {/* ─── Footer (hidden on print) ─────────────────────────────────────── */}
      <div className="drivecare-footer-wrap" style={{ textAlign: "center", marginTop: 40 }}>
        <div style={{ fontFamily: "var(--font-h)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--gray)", textTransform: "uppercase", marginBottom: 12 }}>
          {"By DummVinci · DummVinci Calculator"}
        </div>
        <Footer />
      </div>
    </div>
  );
}
