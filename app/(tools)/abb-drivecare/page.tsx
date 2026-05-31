"use client";
// app/(tools)/abb-drivecare/page.tsx — PTTS ABB DriveCare Document Generator

import { useState, useEffect, useRef } from "react";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";
import {
  Printer,
  Camera,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from "lucide-react";

// ─── Types & Schemas ──────────────────────────────────────────────────────────
type Status = "done" | "no" | "na" | null;
type Priority = "urgent" | "inter" | "low";

interface ImageAttachment {
  url: string;      // Base64 compressed URL
  caption: string;  // Caption: e.g. "Pict Phase 1.1 - Clean heatsink"
}

interface ChecklistItem {
  id: string; // e.g. "1.1"
  titleEn: string;
  titleId: string;
  descEn: string;
  descId: string;
  priority: Priority;
}

interface Section {
  titleEn: string;
  titleId: string;
  items: ChecklistItem[];
}

interface UnitInfo {
  clientName: string;
  location: string;
  driveType: string;
  ratingKw: string;
  serialNumber: string;
  date: string;
  engineerName: string;
  runningHours: string;
}

// ─── Data: PM Checklist items (20 items across 5 sections) ───────────────────
const CHECKLIST_SECTIONS: Section[] = [
  {
    titleEn: "1. Visual & Environmental Inspections",
    titleId: "1. Inspeksi Visual & Lingkungan",
    items: [
      {
        id: "1.1",
        titleEn: "Ambient Temperature & Humidity",
        titleId: "Suhu & Kelembapan Sekitar",
        descEn: "Check that room temp is < 40°C, clean, and free of condensation.",
        descId: "Pastikan suhu ruangan < 40°C, bersih, dan bebas dari kondensasi.",
        priority: "low"
      },
      {
        id: "1.2",
        titleEn: "Cabinet Dust & Contamination Audit",
        titleId: "Akumulasi Debu & Kotoran Kabinet",
        descEn: "Verify no excessive dust, metal debris, or chemical residues.",
        descId: "Periksa kebersihan kabinet dari tumpukan debu, serpihan logam, atau residu kimia.",
        priority: "urgent"
      },
      {
        id: "1.3",
        titleEn: "Foreign Objects & Loose Parts Check",
        titleId: "Benda Asing & Suku Cadang Longgar",
        descEn: "Ensure no loose screws, washers, or cut wire pieces inside chassis.",
        descId: "Pastikan tidak ada sekrup, ring, atau sisa potongan kabel di dalam sasis.",
        priority: "urgent"
      },
      {
        id: "1.4",
        titleEn: "Cable Routing & Insulation Wear",
        titleId: "Jalur Kabel & Keausan Isolasi",
        descEn: "Inspect cables for physical damage, stress, or overheating signs.",
        descId: "Periksa kabel fasa dan kontrol dari tekukan tajam, gesekan, atau tanda panas berlebih.",
        priority: "low"
      }
    ]
  },
  {
    titleEn: "2. Electrical Connections & Tightness",
    titleId: "2. Koneksi Listrik & Kekencangan",
    items: [
      {
        id: "2.1",
        titleEn: "Main Power Terminals Torque Test",
        titleId: "Torsi Terminal Daya Utama (U1/V1/W1, U2/V2/W2)",
        descEn: "Check torque of power connections (U1, V1, W1, U2, V2, W2, UDC).",
        descId: "Periksa kekencangan terminal daya utama (U1, V1, W1, U2, V2, W2, UDC+/-).",
        priority: "urgent"
      },
      {
        id: "2.2",
        titleEn: "Control & Fieldbus Terminal Tightness",
        titleId: "Terminal Kabel Kontrol & Fieldbus",
        descEn: "Verify all I/O cards, STO terminals, and fieldbus plugs are tight.",
        descId: "Pastikan terminal I/O, konektor STO, dan modul komunikasi terpasang kencang.",
        priority: "inter"
      },
      {
        id: "2.3",
        titleEn: "Overheating & Oxidation Inspection",
        titleId: "Inspeksi Oksidasi & Panas Berlebih",
        descEn: "Look for discoloration, thermal deformation, or terminal oxidation.",
        descId: "Periksa perubahan warna, deformasi termal, atau tanda korosi pada terminal.",
        priority: "urgent"
      },
      {
        id: "2.4",
        titleEn: "Grounding (PE) Connection Audit",
        titleId: "Integritas Pembumian (PE / Grounding)",
        descEn: "Verify low resistance connection to main ground bar and motor frame.",
        descId: "Pastikan koneksi PE ke busbar panel dan rangka motor kencang dan korosi-free.",
        priority: "urgent"
      }
    ]
  },
  {
    titleEn: "3. Cleaning & Physical Maintenance",
    titleId: "3. Pembersihan & Perawatan Fisik",
    items: [
      {
        id: "3.1",
        titleEn: "Main Cooling Fan Functionality",
        titleId: "Kinerja Kipas Pendingin Utama",
        descEn: "Check fan rotation, listen for bearing noise, check run hours.",
        descId: "Periksa putaran kipas, dengarkan suara bearing, catat running hours kipas.",
        priority: "inter"
      },
      {
        id: "3.2",
        titleEn: "Heatsink Fins Dust Blowing",
        titleId: "Pembersihan Sirip Heatsink",
        descEn: "Blow dry compressed air or vacuum blockages from drive heatsink.",
        descId: "Bersihkan sela-sela sirip heatsink menggunakan kompresor udara kering atau vakum.",
        priority: "inter"
      },
      {
        id: "3.3",
        titleEn: "Air Filter Pads Cleanliness",
        titleId: "Kebersihan Filter Udara Panel",
        descEn: "Clean or replace intake and exhaust filter pads.",
        descId: "Bersihkan atau ganti filter busa udara di sisi inlet dan outlet panel.",
        priority: "low"
      },
      {
        id: "3.4",
        titleEn: "Internal Ribbon Cables & Board Seating",
        titleId: "Kabel Ribbon Internal & Dudukan Board",
        descEn: "Verify control panel cables and internal connections are seated.",
        descId: "Periksa kelurusan dan kekencangan sambungan flat ribbon cable internal.",
        priority: "inter"
      }
    ]
  },
  {
    titleEn: "4. Control Board & Firmware Audit",
    titleId: "4. Pemeriksaan Kontroler & Firmware",
    items: [
      {
        id: "4.1",
        titleEn: "DC Bus Capacitors Inspection",
        titleId: "Inspeksi Kapasitor DC Bus",
        descEn: "Check for bulging caps, fluid leakage, or structural venting.",
        descId: "Periksa fisik kapasitor elektrolit dari kebocoran cairan atau kembung.",
        priority: "urgent"
      },
      {
        id: "4.2",
        titleEn: "Control Panel & Parameter Backup",
        titleId: "Operasi Keypad & Cadangan Parameter",
        descEn: "Perform parameter backup to keypad or Drive Composer software.",
        descId: "Lakukan pencadangan (backup) parameter terbaru ke keypad atau Drive Composer.",
        priority: "low"
      },
      {
        id: "4.3",
        titleEn: "Fault Log Review & Firmware Version",
        titleId: "Review Riwayat Fault & Versi Firmware",
        descEn: "Read fault logs, document firmware version, note repeat faults.",
        descId: "Buka menu riwayat kesalahan, catat versi firmware dan fault berulang.",
        priority: "inter"
      },
      {
        id: "4.4",
        titleEn: "STO (Safe Torque Off) Function Test",
        titleId: "Pengujian Proteksi STO (Safe Torque Off)",
        descEn: "Trigger STO loop to ensure drive cuts output immediately.",
        descId: "Lepas loop STO untuk memastikan drive memutus output daya secara instan.",
        priority: "urgent"
      }
    ]
  },
  {
    titleEn: "5. Operational Tests & Measurements",
    titleId: "5. Pengujian Operasional & Pengukuran",
    items: [
      {
        id: "5.1",
        titleEn: "Input Voltage Balance Under Load",
        titleId: "Keseimbangan Tegangan Input saat Berbeban",
        descEn: "Measure and record L1-L2, L2-L3, L3-L1 grid voltages.",
        descId: "Ukur dan catat tegangan jala-jala L1-L2, L2-L3, L3-L1.",
        priority: "inter"
      },
      {
        id: "5.2",
        titleEn: "DC Link Voltage Measurement",
        titleId: "Pengukuran Tegangan DC Link",
        descEn: "Record DC link voltage parameter under standby and full speed.",
        descId: "Catat nilai parameter DC link pada kondisi diam dan putaran penuh.",
        priority: "inter"
      },
      {
        id: "5.3",
        titleEn: "Output Phase Currents Balance",
        titleId: "Keseimbangan Arus Fasa Output",
        descEn: "Measure output currents (U, V, W) with clamp meter or parameters.",
        descId: "Periksa keseimbangan arus keluaran motor (U, V, W) pada display parameter.",
        priority: "inter"
      },
      {
        id: "5.4",
        titleEn: "Motor Vibration & Noise Audit",
        titleId: "Pengamatan Kebisingan & Vibrasi Motor",
        descEn: "Aurally check motor bearing noise and physical frame vibrations.",
        descId: "Dengarkan suara bearing motor serta ukur getaran bodi motor.",
        priority: "low"
      }
    ]
  }
];

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
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // 70% quality compression
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function AbbDriveCarePage() {
  const { lang } = useLang();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ─── States ────────────────────────────────────────────────────────────────
  const [unitInfo, setUnitInfo] = useState<UnitInfo>({
    clientName: "",
    location: "",
    driveType: "ACS880-01-038A-4",
    ratingKw: "18.5",
    serialNumber: "",
    date: new Date().toISOString().split("T")[0],
    engineerName: "",
    runningHours: ""
  });

  const [answers, setAnswers] = useState<
    Record<
      string,
      {
        status: Status;
        comment: string;
        images: ImageAttachment[];
      }
    >
  >(() => {
    const initial: Record<string, { status: Status; comment: string; images: ImageAttachment[] }> = {};
    CHECKLIST_SECTIONS.forEach((s) => {
      s.items.forEach((item) => {
        Reflect.set(initial, item.id, { status: null, comment: "", images: [] });
      });
    });
    return initial;
  });

  const [showBulletin, setShowBulletin] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({});

  // ─── Load state from localStorage on mount ──────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedInfo = localStorage.getItem("ptts_drivecare_info");
      const savedAnswers = localStorage.getItem("ptts_drivecare_answers");
      setTimeout(() => {
        if (savedInfo) setUnitInfo(JSON.parse(savedInfo));
        if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
      }, 0);
    }
  }, []);

  // Save to local storage on changes
  const saveState = (newInfo: UnitInfo, newAnswers: typeof answers) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ptts_drivecare_info", JSON.stringify(newInfo));
      localStorage.setItem("ptts_drivecare_answers", JSON.stringify(newAnswers));
    }
  };

  const handleInfoChange = (field: keyof UnitInfo, value: string) => {
    const updatedInfo = { ...unitInfo, [field]: value };
    setUnitInfo(updatedInfo);
    saveState(updatedInfo, answers);
  };

  // ─── Checklist Handlers ─────────────────────────────────────────────────────
  const setStatus = (itemId: string, status: Status) => {
    const current = Reflect.get(answers, itemId) || { status: null, comment: "", images: [] };
    const nextItem = {
      ...current,
      status: current.status === status ? null : status
    };
    const updatedAnswers = { ...answers };
    Reflect.set(updatedAnswers, itemId, nextItem);
    setAnswers(updatedAnswers);
    saveState(unitInfo, updatedAnswers);
  };

  const handleCommentChange = (itemId: string, text: string) => {
    const current = Reflect.get(answers, itemId) || { status: null, comment: "", images: [] };
    const nextItem = {
      ...current,
      comment: text
    };
    const updatedAnswers = { ...answers };
    Reflect.set(updatedAnswers, itemId, nextItem);
    setAnswers(updatedAnswers);
    saveState(unitInfo, updatedAnswers);
  };

  const handleImageUpload = async (itemId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const current = Reflect.get(answers, itemId) || { status: null, comment: "", images: [] };
    const currentImages = current.images || [];
    if (currentImages.length >= 3) {
      alert(lang === "id" ? "Maksimum 3 gambar per parameter." : "Maximum 3 images per parameter.");
      return;
    }

    const newAttachments = [...currentImages];
    const uploadCount = Math.min(files.length, 3 - currentImages.length);

    for (let i = 0; i < uploadCount; i++) {
      const file = files.item(i)!;
      if (!file.type.match("image.*")) {
        alert(lang === "id" ? "Format berkas harus JPG, JPEG, atau PNG." : "File format must be JPG, JPEG, or PNG.");
        continue;
      }

      try {
        const compressedBase64 = await compressImage(file);
        // Default caption e.g. "Pict Phase 1.1 - Deskripsi"
        const defaultCaption = `Pict Phase ${itemId} - Photo ${newAttachments.length + 1}`;
        newAttachments.push({
          url: compressedBase64,
          caption: defaultCaption
        });
      } catch (error) {
        console.error("Image compression error:", error);
      }
    }

    const nextItem = {
      ...current,
      images: newAttachments
    };
    const updatedAnswers = { ...answers };
    Reflect.set(updatedAnswers, itemId, nextItem);
    setAnswers(updatedAnswers);
    saveState(unitInfo, updatedAnswers);
  };

  const removeImage = (itemId: string, imgIndex: number) => {
    const current = Reflect.get(answers, itemId) || { status: null, comment: "", images: [] };
    const currentImages = current.images || [];
    const newAttachments = currentImages.filter((_, idx) => idx !== imgIndex);

    // Re-number captions for the remaining pictures
    const renumberedAttachments = newAttachments.map((img, idx) => {
      // If it starts with the standard caption pattern, re-number it
      if (img.caption.startsWith(`Pict Phase ${itemId} - Photo`)) {
        return { ...img, caption: `Pict Phase ${itemId} - Photo ${idx + 1}` };
      }
      return img;
    });

    const nextItem = {
      ...current,
      images: renumberedAttachments
    };
    const updatedAnswers = { ...answers };
    Reflect.set(updatedAnswers, itemId, nextItem);
    setAnswers(updatedAnswers);
    saveState(unitInfo, updatedAnswers);
  };

  const handleCaptionChange = (itemId: string, imgIndex: number, text: string) => {
    const current = Reflect.get(answers, itemId) || { status: null, comment: "", images: [] };
    const currentImages = [...(current.images || [])];
    const targetImg = currentImages.at(imgIndex);
    if (targetImg) {
      targetImg.caption = text;
    }
    const nextItem = {
      ...current,
      images: currentImages
    };
    const updatedAnswers = { ...answers };
    Reflect.set(updatedAnswers, itemId, nextItem);
    setAnswers(updatedAnswers);
    saveState(unitInfo, updatedAnswers);
  };

  // ─── Calculation States ────────────────────────────────────────────────────
  const totalItems = CHECKLIST_SECTIONS.reduce((acc, s) => acc + s.items.length, 0);
  const completedCount = Object.values(answers).filter((a) => a.status !== null).length;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const failedItems = CHECKLIST_SECTIONS.flatMap((s) => s.items).filter(
    (item) => (Reflect.get(answers, item.id) as typeof answers[string] | undefined)?.status === "no"
  );

  // ─── Actions ────────────────────────────────────────────────────────────────
  const toggleSection = (idx: number) => {
    const updated = { ...collapsedSections };
    Reflect.set(updated, idx, !Reflect.get(updated, idx));
    setCollapsedSections(updated);
  };

  const clearForm = () => {
    if (
      confirm(
        lang === "id"
          ? "Apakah Anda yakin ingin mengosongkan seluruh formulir ini?"
          : "Are you sure you want to clear this entire form?"
      )
    ) {
      const resetAnswers: typeof answers = {};
      CHECKLIST_SECTIONS.forEach((s) => {
        s.items.forEach((item) => {
          Reflect.set(resetAnswers, item.id, { status: null, comment: "", images: [] });
        });
      });
      const resetInfo = {
        clientName: "",
        location: "",
        driveType: "ACS880-01-038A-4",
        ratingKw: "18.5",
        serialNumber: "",
        date: new Date().toISOString().split("T")[0],
        engineerName: "",
        runningHours: ""
      };
      setAnswers(resetAnswers);
      setUnitInfo(resetInfo);
      saveState(resetInfo, resetAnswers);
    }
  };

  const printDocument = () => {
    window.print();
  };

  return (
    <div className="page" style={{ padding: "28px 20px 100px", maxWidth: 900, margin: "0 auto" }}>
      {/* ─── Styles for Print & Editor ────────────────────────────────────── */}
      <style>{`
        /* Global & Layout overrides */
        .kop {
          display: block;
          margin-bottom: 12px;
          border-bottom: 2.5px solid var(--dark);
          padding-bottom: 6px;
        }
        .section-box {
          margin-bottom: 24px;
          border: 1px solid var(--border);
          border-radius: var(--r);
          background: #fff;
          box-shadow: var(--shadow);
          overflow: hidden;
        }
        .findings-card {
          background: #fff;
          border: 2px solid var(--red);
          border-radius: var(--r);
          padding: 16px 20px;
          margin-bottom: 24px;
          box-shadow: var(--shadow);
        }
        .bulletin-box {
          border: 2.5px solid var(--red);
          border-radius: var(--r);
          overflow: hidden;
          background: #fef7f6;
          margin-bottom: 24px;
          transition: all 0.28s ease;
        }
        .bulletin-head-bar {
          background: var(--red);
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #fff;
        }

        /* Responsive Grid for Image Upload Layouts */
        .image-attachments-grid {
          display: grid;
          gap: 16px;
          margin-top: 12px;
          width: 100%;
        }
        .image-layout-1 {
          grid-template-columns: 1fr;
          max-width: 500px;
          margin: 0 auto;
        }
        .image-layout-2 {
          grid-template-columns: 1fr 1fr;
        }
        .image-layout-3 {
          grid-template-columns: repeat(3, 1fr);
        }
        
        .img-item-wrap {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border);
          border-radius: var(--r);
          background: var(--light-2);
          overflow: hidden;
          position: relative;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .img-preview-box {
          width: 100%;
          aspect-ratio: 4 / 3;
          position: relative;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .img-preview-box img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .img-remove-btn {
          position: absolute;
          top: 6px;
          right: 6px;
          background: rgba(0,0,0,0.65);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: background 0.15s;
        }
        .img-remove-btn:hover {
          background: var(--red);
        }
        .img-caption-input {
          padding: 8px 12px;
          border: none;
          border-top: 1px solid var(--border);
          background: #fff;
          outline: none;
          font-family: var(--font-h);
          font-size: 11px;
          font-weight: 500;
          color: var(--dark);
        }

        /* ─── PRINT SPECIFIC RULES (Word-style output) ─────────────────────── */
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
            font-family: 'Lora', Georgia, serif !important;
            font-size: 12px !important;
          }
          .page {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            box-shadow: none !important;
          }
          /* Hide interactive/editing elements */
          .actions-row,
          .img-remove-btn,
          .bulletin-toggle-row,
          .st-btn,
          .upload-action-btn,
          .ci-status-group,
          .no-print {
            display: none !important;
          }
          
          /* Force sections to stay consistent and prevent breaking inside them */
          .section-box,
          .findings-card,
          .bulletin-box,
          .unit-card,
          .ci,
          .img-item-wrap {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-shadow: none !important;
            border-color: #000 !important;
          }
          
          .sec-head {
            background: #1c1c1a !important;
            color: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            cursor: default !important;
          }
          
          /* Replace editable textareas and inputs with plain text appearance */
          .u-input {
            border-bottom: none !important;
            font-weight: bold !important;
            padding: 0 !important;
          }
          .ci-comment {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            resize: none !important;
            font-style: italic !important;
            margin-top: 4px;
            display: block !important;
          }
          .img-caption-input {
            border-top: none !important;
            text-align: center;
            font-weight: bold !important;
            font-size: 12px !important;
            padding: 6px 0 !important;
          }
          
          /* Format status indications statically for print */
          .print-status-box {
            display: inline-block !important;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
            border: 1px solid #000;
            padding: 2px 8px;
            border-radius: 4px;
          }
          .print-status-done {
            background-color: #e4edd9 !important;
            color: #4a6b35 !important;
            border-color: #8cb870 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-status-no {
            background-color: #f5e0dd !important;
            color: #a83228 !important;
            border-color: #d98880 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-status-na {
            background-color: #ddeaf5 !important;
            color: #2a5c8a !important;
            border-color: #ddeaf5 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Spacing & margins optimization */
          @page {
            margin: 1.5cm 1.5cm 1.5cm 1.5cm;
          }
          .print-only-block {
            display: block !important;
          }
          .print-status-box-wrap {
            display: block !important;
          }
        }
      `}</style>

      {/* ─── KOP SURAT (Branding Header) ──────────────────────────────────── */}
      <div className="kop">
        <img
          src="/logo-dv-ptts.png"
          alt="PTTS — ABB Value Provider Logo Banner"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>

      {/* ─── DOCUMENT HEADER ──────────────────────────────────────────────── */}
      <div className="hd" style={{ marginTop: 20, marginBottom: 28, paddingBottom: 16, borderBottom: "1.5px solid var(--border)" }}>
        <div className="hd-label" style={{ fontFamily: "var(--font-h)", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "var(--orange)", textTransform: "uppercase", marginBottom: 6 }}>
          {"PTTS DriveCare"}
        </div>
        <h1 className="hd-title" style={{ fontFamily: "var(--font-h)", fontSize: 26, fontWeight: 800, color: "var(--dark)", margin: "0 0 4px" }}>
          {lang === "id" ? "Checklist Pemeliharaan Preventif ABB" : "ABB Preventive Maintenance Checklist"}
        </h1>
        <div className="hd-sub" style={{ fontSize: 14, color: "var(--gray)", fontStyle: "italic" }}>
          {lang === "id"
            ? "Laporan Pengujian Lapangan & Perawatan Preventif Unit VSD"
            : "VSD Unit Commissioning Field Testing & Preventive Maintenance Report"}
        </div>
      </div>

      {/* ─── ACTIONS ROW (No Print) ───────────────────────────────────────── */}
      <div className="actions actions-row" style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={printDocument} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Printer size={16} />
          {lang === "id" ? "Cetak / Simpan PDF" : "Print / Export PDF"}
        </button>
        <button className="btn btn-outline" onClick={clearForm} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <RotateCcw size={16} />
          {lang === "id" ? "Kosongkan Form" : "Clear Form"}
        </button>
      </div>

      {/* ─── SAFETY BULLETIN ──────────────────────────────────────────────── */}
      <div className="bulletin-box">
        <div className="bulletin-head-bar" style={{ cursor: "pointer" }} onClick={() => setShowBulletin(!showBulletin)}>
          <span style={{ fontFamily: "var(--font-h)", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            ⚠️ {lang === "id" ? "INSTRUKSI KESELAMATAN LOTO" : "LOTO SAFETY INSTRUCTIONS"}
          </span>
          <span className="no-print">
            {showBulletin ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
        {showBulletin && (
          <div className="bulletin-body" style={{ background: "#fef7f6", padding: 16, fontFamily: "var(--font-m)", fontSize: 12, color: "#2a1210", borderTop: "1.5px solid var(--red)" }}>
            <div style={{ fontWeight: 700, color: "var(--red)", marginBottom: 8, textTransform: "uppercase", fontSize: 10, letterSpacing: "0.04em" }}>
              {lang === "id" ? "Bahaya Sengatan Listrik!" : "Danger of Electrical Shock!"}
            </div>
            <p style={{ marginBottom: 8 }}>
              {lang === "id"
                ? "1. Pastikan incoming breaker di MDB telah dimatikan dan prosedur Lockout/Tagout (LOTO) telah dipasang sebelum membuka pintu panel."
                : "1. Ensure the incoming breaker at MDB is disconnected and Lockout/Tagout (LOTO) is applied before opening the panel door."}
            </p>
            <p>
              {lang === "id"
                ? "2. Setelah listrik dimatikan, tunggu minimal 5 MENIT agar kapasitor DC link membuang sisa muatan listrik sepenuhnya. Ukur tegangan DC+ ke DC- (< 50 VDC) sebelum menyentuh komponen terminal daya."
                : "2. After power-off, wait at least 5 MINUTES for the internal DC bus capacitors to discharge. Always measure the DC bus voltage (< 50 VDC) across DC+ and DC- terminals before touching terminals."}
            </p>
          </div>
        )}
      </div>

      {/* ─── UNIT DATA CARD ───────────────────────────────────────────────── */}
      <div className="unit-card" style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: "var(--r)", marginBottom: 28, boxShadow: "var(--shadow)", overflow: "hidden" }}>
        <div className="unit-card-head" style={{ background: "var(--dark-2)", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="unit-card-title" style={{ fontFamily: "var(--font-h)", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>
            {lang === "id" ? "IDENTITAS DRIVE & SISTEM" : "DRIVE & SYSTEM IDENTIFICATION"}
          </div>
          <div className="unit-card-hint" style={{ fontFamily: "var(--font-h)", fontSize: 10, color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
            {lang === "id" ? "Lengkapi sebelum mencetak" : "Complete before printing"}
          </div>
        </div>
        <div className="unit-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div className="unit-field" style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
            <div className="u-label" style={{ fontFamily: "var(--font-h)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray)" }}>
              {lang === "id" ? "Nama Klien" : "Client Name"}
            </div>
            <input
              type="text"
              className="u-input"
              value={unitInfo.clientName}
              placeholder={lang === "id" ? "cth. PT. Indofood Sukses Makmur" : "e.g. PT. Indofood"}
              onChange={(e) => handleInfoChange("clientName", e.target.value)}
              style={{ width: "100%", border: "none", borderBottom: "1.5px dashed var(--border)", background: "transparent", outline: "none", fontSize: 13, fontWeight: 600, color: "var(--dark)", padding: "2px 0 4px" }}
            />
          </div>
          <div className="unit-field" style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)" }}>
            <div className="u-label" style={{ fontFamily: "var(--font-h)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray)" }}>
              {lang === "id" ? "Lokasi Situs" : "Site Location"}
            </div>
            <input
              type="text"
              className="u-input"
              value={unitInfo.location}
              placeholder={lang === "id" ? "cth. Ruang Pompa STP - Cikarang" : "e.g. Pump Room STP"}
              onChange={(e) => handleInfoChange("location", e.target.value)}
              style={{ width: "100%", border: "none", borderBottom: "1.5px dashed var(--border)", background: "transparent", outline: "none", fontSize: 13, fontWeight: 600, color: "var(--dark)", padding: "2px 0 4px" }}
            />
          </div>
          <div className="unit-field" style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
            <div className="u-label" style={{ fontFamily: "var(--font-h)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray)" }}>
              {lang === "id" ? "Tipe VSD ABB" : "ABB VSD Type"}
            </div>
            <input
              type="text"
              className="u-input"
              value={unitInfo.driveType}
              placeholder="e.g. ACS880-01-038A-4"
              onChange={(e) => handleInfoChange("driveType", e.target.value)}
              style={{ width: "100%", border: "none", borderBottom: "1.5px dashed var(--border)", background: "transparent", outline: "none", fontSize: 13, fontWeight: 600, color: "var(--dark)", padding: "2px 0 4px" }}
            />
          </div>
          <div className="unit-field" style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)" }}>
            <div className="u-label" style={{ fontFamily: "var(--font-h)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray)" }}>
              {lang === "id" ? "Daya Motor (kW)" : "Motor Rating (kW)"}
            </div>
            <input
              type="text"
              className="u-input"
              value={unitInfo.ratingKw}
              placeholder="e.g. 18.5"
              onChange={(e) => handleInfoChange("ratingKw", e.target.value)}
              style={{ width: "100%", border: "none", borderBottom: "1.5px dashed var(--border)", background: "transparent", outline: "none", fontSize: 13, fontWeight: 600, color: "var(--dark)", padding: "2px 0 4px" }}
            />
          </div>
          <div className="unit-field" style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
            <div className="u-label" style={{ fontFamily: "var(--font-h)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray)" }}>
              {lang === "id" ? "Nomor Seri" : "Serial Number"}
            </div>
            <input
              type="text"
              className="u-input"
              value={unitInfo.serialNumber}
              placeholder={lang === "id" ? "cth. 3192004241" : "e.g. 3192004241"}
              onChange={(e) => handleInfoChange("serialNumber", e.target.value)}
              style={{ width: "100%", border: "none", borderBottom: "1.5px dashed var(--border)", background: "transparent", outline: "none", fontSize: 13, fontWeight: 600, color: "var(--dark)", padding: "2px 0 4px" }}
            />
          </div>
          <div className="unit-field" style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)" }}>
            <div className="u-label" style={{ fontFamily: "var(--font-h)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray)" }}>
              {lang === "id" ? "Tanggal Inspeksi" : "Inspection Date"}
            </div>
            <input
              type="date"
              className="u-input"
              value={unitInfo.date}
              onChange={(e) => handleInfoChange("date", e.target.value)}
              style={{ width: "100%", border: "none", borderBottom: "1.5px dashed var(--border)", background: "transparent", outline: "none", fontSize: 13, fontWeight: 600, color: "var(--dark)", padding: "2px 0 4px" }}
            />
          </div>
          <div className="unit-field" style={{ padding: "10px 20px", borderRight: "1px solid var(--border)" }}>
            <div className="u-label" style={{ fontFamily: "var(--font-h)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray)" }}>
              {lang === "id" ? "Teknisi Pemeliharaan" : "Service Engineer"}
            </div>
            <input
              type="text"
              className="u-input"
              value={unitInfo.engineerName}
              placeholder={lang === "id" ? "cth. Joko Susilo" : "e.g. Joko Susilo"}
              onChange={(e) => handleInfoChange("engineerName", e.target.value)}
              style={{ width: "100%", border: "none", borderBottom: "none", background: "transparent", outline: "none", fontSize: 13, fontWeight: 600, color: "var(--dark)", padding: "2px 0 4px" }}
            />
          </div>
          <div className="unit-field" style={{ padding: "10px 20px" }}>
            <div className="u-label" style={{ fontFamily: "var(--font-h)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray)" }}>
              {lang === "id" ? "Jam Kerja Drive (Hour Counter)" : "Drive Running Hours"}
            </div>
            <input
              type="text"
              className="u-input"
              value={unitInfo.runningHours}
              placeholder={lang === "id" ? "cth. 14205 jam" : "e.g. 14205 hrs"}
              onChange={(e) => handleInfoChange("runningHours", e.target.value)}
              style={{ width: "100%", border: "none", borderBottom: "none", background: "transparent", outline: "none", fontSize: 13, fontWeight: 600, color: "var(--dark)", padding: "2px 0 4px" }}
            />
          </div>
        </div>
      </div>

      {/* ─── PROGRESS BAR (No Print) ──────────────────────────────────────── */}
      <div className="prog-bar-wrap no-print" style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: "var(--r)", padding: "14px 20px", marginBottom: 24, boxShadow: "var(--shadow)", display: "flex", alignItems: "center", gap: 16 }}>
        <div className="prog-label" style={{ fontFamily: "var(--font-h)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--gray)" }}>
          {lang === "id" ? "PROGRES CHECKLIST" : "CHECKLIST PROGRESS"}
        </div>
        <div className="prog-track" style={{ flex: 1, height: 8, background: "var(--light-2)", borderRadius: 99, overflow: "hidden", border: "1px solid var(--border)" }}>
          <div className="prog-fill" style={{ height: "100%", background: "var(--orange)", borderRadius: 99, width: `${progressPercent}%`, transition: "width .4s ease" }} />
        </div>
        <div className="prog-count" style={{ fontFamily: "var(--font-h)", fontSize: 12, fontWeight: 700, color: "var(--dark)" }}>
          {completedCount} / {totalItems} ({progressPercent}%)
        </div>
      </div>

      {/* ─── FINDINGS CARD (Alert summary, page-break-inside avoid) ───────── */}
      {failedItems.length > 0 && (
        <div className="findings-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "var(--red)" }}>
            <AlertTriangle size={18} />
            <h4 style={{ fontFamily: "var(--font-h)", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {lang === "id" ? "TEMUAN PERINGATAN / FAULT" : "ALERT & CRITICAL FINDINGS SUMMARY"}
            </h4>
          </div>
          <p style={{ fontSize: 13, color: "var(--dark)", lineHeight: 1.5, marginBottom: 10 }}>
            {lang === "id"
              ? "Parameter checklist berikut ditandai bermasalah (NO/FAILED). Perhatikan dan lakukan tindakan korektif:"
              : "The following parameters failed visual or performance audits. Corrective actions required:"}
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.6 }}>
            {failedItems.map((item) => (
              <li key={item.id} style={{ marginBottom: 6 }}>
                <strong>{lang === "id" ? "Fase " : "Phase "}{item.id} - {lang === "id" ? item.titleId : item.titleEn}</strong>:{" "}
                <span style={{ color: "var(--red)", fontWeight: 700 }}>
                  {(Reflect.get(answers, item.id) as typeof answers[string] | undefined)?.comment || (lang === "id" ? "(Belum ada komentar temuan)" : "(No remediation comment specified)")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── LEGEND & SUMMARY (No Print) ──────────────────────────────────── */}
      <div className="legend no-print" style={{ display: "flex", gap: 18, marginBottom: 20, flexWrap: "wrap" }}>
        <div className="lg-item" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 500, color: "#4a4845" }}>
          <div className="lg-dot" style={{ width: 11, height: 11, borderRadius: "50%", background: "var(--red)" }} />
          <span>{lang === "id" ? "Prioritas Penting (Urgent)" : "Urgent Priority"}</span>
        </div>
        <div className="lg-item" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 500, color: "#4a4845" }}>
          <div className="lg-dot" style={{ width: 11, height: 11, borderRadius: "50%", background: "var(--amber)" }} />
          <span>{lang === "id" ? "Prioritas Menengah" : "Intermediate Priority"}</span>
        </div>
        <div className="lg-item" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 500, color: "#4a4845" }}>
          <div className="lg-dot" style={{ width: 11, height: 11, borderRadius: "50%", background: "var(--green)" }} />
          <span>{lang === "id" ? "Prioritas Rendah" : "Low Priority"}</span>
        </div>
      </div>

      {/* ─── SECTIONS LIST ────────────────────────────────────────────────── */}
      {CHECKLIST_SECTIONS.map((section, sIdx) => {
        const isCollapsed = !!Reflect.get(collapsedSections, sIdx);
        const sectionTitle = lang === "id" ? section.titleId : section.titleEn;

        // Calculate completed questions for this section
        const answeredInSection = section.items.filter((item) => (Reflect.get(answers, item.id) as typeof answers[string] | undefined)?.status !== null).length;
        const totalInSection = section.items.length;
        const allDoneInSection = answeredInSection === totalInSection;

        return (
          <div className="section-box" key={sIdx}>
            {/* Section Header */}
            <div
              className="sec-head"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "13px 20px",
                background: "var(--dark)",
                color: "#fff",
                cursor: "pointer",
                userSelect: "none"
              }}
              onClick={() => toggleSection(sIdx)}
            >
              <span className="sec-icon no-print">{isCollapsed ? "➕" : "➖"}</span>
              <h3 className="sec-title" style={{ fontFamily: "var(--font-h)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", flex: 1, margin: 0 }}>
                {sectionTitle}
              </h3>
              <span
                className={`sec-pill ${allDoneInSection ? "ok" : ""}`}
                style={{
                  fontFamily: "var(--font-h)",
                  fontSize: 10,
                  fontWeight: 700,
                  background: allDoneInSection ? "rgba(74, 107, 53, 0.35)" : "rgba(255,255,255,0.1)",
                  color: allDoneInSection ? "#a8d080" : "rgba(255,255,255,0.65)",
                  border: `1px solid ${allDoneInSection ? "rgba(74,107,53,0.4)" : "rgba(255,255,255,0.15)"}`,
                  padding: "3px 10px",
                  borderRadius: 99,
                  minWidth: 52,
                  textAlign: "center"
                }}
              >
                {answeredInSection} / {totalInSection}
              </span>
            </div>

            {/* Section Checklist Items */}
            {!isCollapsed && (
              <div className="sec-body" style={{ background: "#fff" }}>
                {section.items.map((item) => {
                  const currentAnswer = (Reflect.get(answers, item.id) as typeof answers[string] | undefined) || { status: null, comment: "", images: [] };
                  const isDone = currentAnswer.status === "done";
                  const isNo = currentAnswer.status === "no";
                  const isNa = currentAnswer.status === "na";

                  const itemTitle = lang === "id" ? item.titleId : item.titleEn;
                  const itemDesc = lang === "id" ? item.descId : item.descEn;

                  // Priority label details
                  let priorityLabel = "Low";
                  let priorityBadgeClass = "badge-l";
                  if (item.priority === "urgent") {
                    priorityLabel = lang === "id" ? "PENTING" : "URGENT";
                    priorityBadgeClass = "badge-u";
                  } else if (item.priority === "inter") {
                    priorityLabel = lang === "id" ? "SEDANG" : "INTER";
                    priorityBadgeClass = "badge-i";
                  } else {
                    priorityLabel = lang === "id" ? "RENDAH" : "LOW";
                    priorityBadgeClass = "badge-l";
                  }

                  const priorityContainerClass = `ci p-${item.priority === "inter" ? "inter" : item.priority === "urgent" ? "urgent" : "low"} ${currentAnswer.status === "done" ? "status-done" : ""}`;

                  return (
                    <div
                      className={priorityContainerClass}
                      key={item.id}
                      style={{
                        borderBottom: "1px solid var(--border)",
                        position: "relative",
                        paddingBottom: 14
                      }}
                    >
                      {/* Priority left indicator bar */}
                      <div
                        className="ci-bar"
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 5,
                          background: item.priority === "urgent" ? "var(--red)" : item.priority === "inter" ? "var(--amber)" : "var(--green)"
                        }}
                      />

                      {/* Checklist Content */}
                      <div className="ci-top" style={{ display: "flex", gap: 12, padding: "14px 20px 8px 24px" }}>
                        <div className="ci-content" style={{ flex: 1, minWidth: 0 }}>
                          <h4
                            className="ci-title"
                            style={{
                              fontFamily: "var(--font-h)",
                              fontSize: 14,
                              fontWeight: 700,
                              color: "var(--dark)",
                              margin: "0 0 4px",
                              textDecoration: isDone ? "line-through" : "none",
                              opacity: isDone ? 0.45 : 1
                            }}
                          >
                            <span style={{ fontFamily: "var(--font-mono)", marginRight: 8, opacity: 0.6 }}>{item.id}</span>
                            {itemTitle}
                          </h4>
                          <p
                            className="ci-desc"
                            style={{
                              fontSize: 12.5,
                              color: "var(--fg-soft)",
                              lineHeight: 1.5,
                              opacity: isDone ? 0.35 : 0.85
                            }}
                          >
                            {itemDesc}
                          </p>
                        </div>

                        {/* Priority Badge */}
                        <span
                          className={`badge ${priorityBadgeClass}`}
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            padding: "2px 8px",
                            borderRadius: 12,
                            border: "1px solid",
                            alignSelf: "flex-start",
                            backgroundColor: item.priority === "urgent" ? "var(--red-lt)" : item.priority === "inter" ? "var(--amber-lt)" : "var(--green-lt)",
                            color: item.priority === "urgent" ? "var(--red)" : item.priority === "inter" ? "var(--amber)" : "var(--green)",
                            borderColor: item.priority === "urgent" ? "#d98880" : item.priority === "inter" ? "#d4b060" : "#8cb870"
                          }}
                        >
                          {priorityLabel}
                        </span>

                        {/* Static Status for Print (Hidden in Editor) */}
                        <div style={{ display: "none" }} className="print-status-box-wrap">
                          {isDone && <span className="print-status-box print-status-done">{lang === "id" ? "SELESAI" : "DONE"}</span>}
                          {isNo && <span className="print-status-box print-status-no">{lang === "id" ? "BERMASALAH" : "FAILED"}</span>}
                          {isNa && <span className="print-status-box print-status-na">N/A</span>}
                        </div>
                      </div>

                      {/* Interactive Controls & Comment Footer */}
                      <div className="ci-foot" style={{ display: "flex", gap: 12, padding: "0 20px 0 24px", alignItems: "center" }}>
                        {/* Status Select Buttons */}
                        <div className="ci-status-group" style={{ display: "flex", gap: 6 }}>
                          <button
                            type="button"
                            className={`st-btn ${isDone ? "active-done" : ""}`}
                            onClick={() => setStatus(item.id, "done")}
                            style={{
                              fontFamily: "var(--font-h)",
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: "4px 10px",
                              borderRadius: 6,
                              border: `1.5px solid ${isDone ? "var(--green)" : "var(--border)"}`,
                              background: isDone ? "var(--green-lt)" : "var(--light)",
                              color: isDone ? "var(--green)" : "var(--gray)",
                              cursor: "pointer"
                            }}
                          >
                            {lang === "id" ? "Selesai" : "Done"}
                          </button>
                          <button
                            type="button"
                            className={`st-btn ${isNo ? "active-no" : ""}`}
                            onClick={() => setStatus(item.id, "no")}
                            style={{
                              fontFamily: "var(--font-h)",
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: "4px 10px",
                              borderRadius: 6,
                              border: `1.5px solid ${isNo ? "var(--red)" : "var(--border)"}`,
                              background: isNo ? "var(--red-lt)" : "var(--light)",
                              color: isNo ? "var(--red)" : "var(--gray)",
                              cursor: "pointer"
                            }}
                          >
                            {lang === "id" ? "Bermasalah" : "No"}
                          </button>
                          <button
                            type="button"
                            className={`st-btn ${isNa ? "active-na" : ""}`}
                            onClick={() => setStatus(item.id, "na")}
                            style={{
                              fontFamily: "var(--font-h)",
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: "4px 10px",
                              borderRadius: 6,
                              border: `1.5px solid ${isNa ? "var(--blue)" : "var(--border)"}`,
                              background: isNa ? "var(--blue-lt)" : "var(--light)",
                              color: isNa ? "var(--blue)" : "var(--gray)",
                              cursor: "pointer"
                            }}
                          >
                            N/A
                          </button>
                        </div>

                        {/* Comment input */}
                        <textarea
                          className="ci-comment"
                          value={currentAnswer.comment}
                          onChange={(e) => handleCommentChange(item.id, e.target.value)}
                          placeholder={
                            isNo
                              ? lang === "id"
                                ? "Jelaskan permasalahan / usulan perbaikan..."
                                : "Describe the fault or required action..."
                              : lang === "id"
                              ? "Tambahkan catatan inspeksi..."
                              : "Add inspection notes..."
                          }
                          style={{
                            flex: 1,
                            minWidth: 200,
                            fontFamily: "var(--font-b)",
                            fontSize: 12.5,
                            color: "var(--dark)",
                            background: "var(--light-2)",
                            border: "1.5px solid var(--border)",
                            borderRadius: 6,
                            padding: "4px 10px",
                            outline: "none",
                            resize: "vertical",
                            height: 32,
                            minHeight: 32,
                            lineHeight: 1.4
                          }}
                        />

                        {/* Image Uploader Button (No Print) */}
                        {currentAnswer.images.length < 3 && (
                          <div className="no-print">
                            <input
                              type="file"
                              accept="image/*"
                              ref={(el) => { Reflect.set(fileInputRefs.current, item.id, el); }}
                              onChange={(e) => handleImageUpload(item.id, e.target.files)}
                              style={{ display: "none" }}
                              multiple
                            />
                            <button
                              type="button"
                              className="upload-action-btn"
                              onClick={() => (Reflect.get(fileInputRefs.current, item.id) as HTMLInputElement | null)?.click()}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "5px 12px",
                                borderRadius: 6,
                                background: "#fff",
                                border: "1.5px solid var(--border)",
                                cursor: "pointer",
                                fontSize: 10.5,
                                fontFamily: "var(--font-h)",
                                fontWeight: 700,
                                color: "var(--gray)"
                              }}
                            >
                              <Camera size={14} />
                              <span>{lang === "id" ? "Foto" : "Photo"}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Display Image Attachments with Proportional Grid Layout */}
                      {currentAnswer.images.length > 0 && (
                        <div style={{ padding: "0 20px 0 24px" }}>
                          <div
                            className={`image-attachments-grid image-layout-${currentAnswer.images.length}`}
                          >
                            {currentAnswer.images.map((img, imgIdx) => (
                              <div className="img-item-wrap" key={imgIdx}>
                                {/* Delete button (No Print) */}
                                <button
                                  type="button"
                                  className="img-remove-btn"
                                  onClick={() => removeImage(item.id, imgIdx)}
                                >
                                  <X size={14} />
                                </button>
                                {/* Image view */}
                                <div className="img-preview-box">
                                  <img src={img.url} alt={`Inspection Photo ${imgIdx + 1}`} />
                                </div>
                                {/* Editable Caption */}
                                <input
                                  type="text"
                                  className="img-caption-input"
                                  value={img.caption}
                                  onChange={(e) => handleCaptionChange(item.id, imgIdx, e.target.value)}
                                  placeholder={`Pict Phase ${item.id} - Description`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* ─── SIGNATURE BLOCK (Print Only) ─────────────────────────────────── */}
      <div
        style={{ display: "none", marginTop: 50, borderTop: "1px solid #000", paddingTop: 20 }}
        className="print-only-block"
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ width: "220px", textAlign: "center" }}>
            <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 60 }}>
              {lang === "id" ? "Disiapkan Oleh," : "Prepared By,"}
            </div>
            <div style={{ textDecoration: "underline", fontWeight: "bold" }}>
              {unitInfo.engineerName || "Service Engineer"}
            </div>
            <div style={{ fontSize: 11, color: "#666" }}>{"PT Prima Tekindo Tirta Sejahtera"}</div>
          </div>
          <div style={{ width: "220px", textAlign: "center" }}>
            <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 60 }}>
              {lang === "id" ? "Disetujui Oleh Klien," : "Approved By Client,"}
            </div>
            <div style={{ borderBottom: "1px solid #000", width: "160px", margin: "0 auto", height: "16px" }}></div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
              {unitInfo.clientName || "Client Representative"}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
