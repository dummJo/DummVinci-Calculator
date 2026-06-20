"use client";
import { useState, useCallback } from "react";

// ── Token System ──────────────────────────────────────────────────────────────
const T = {
  bg:          "#141413",
  bgCard:      "#1d1c1b",
  bgInput:     "rgba(255,255,255,0.04)",
  fg:          "#f0ece8",
  fgSoft:      "#c5bfb8",
  muted:       "#8a8278",
  mutedSoft:   "#6b6460",
  accent:      "#c4693a",
  accentR:     "196,105,58",
  glass:       "rgba(255,255,255,0.04)",
  glassBorder: "rgba(255,255,255,0.09)",
  hairline:    "rgba(255,255,255,0.07)",
  hairlineSoft:"rgba(255,255,255,0.05)",
  rPill:       "999px",
  rMd:         "12px",
  rSm:         "8px",
  display:     "'Inter', system-ui, -apple-system, sans-serif",
  mono:        "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
  ok:          "#16a34a",
  err:         "#dc2626",
};

const ac = (a: number) => `rgba(${T.accentR},${a})`;

// ── Types ─────────────────────────────────────────────────────────────────────
interface Task { deskripsi: string; status: string; }
interface FormData {
  customerName: string; customerPIC: string; customerPhone: string;
  prPoNumber: string;   orderDate: string;   orderNumber: string;
  startDate: string;    endDate: string;     descHeader: string;
  picProject: string;   sales: string;       crew: string; comments: string;
  tasks: Task[];
  alasan: string; solusi: string;
  sigPIC: string; sigSales: string; sigAdmin: string; sigCustomer: string;
}

const N_ROWS = 18;
const BLANK: FormData = {
  customerName: "", customerPIC: "", customerPhone: "",
  prPoNumber:   "", orderDate:   "", orderNumber:   "",
  startDate:    "", endDate:     "", descHeader:    "",
  picProject:   "", sales:       "", crew:          "", comments: "",
  tasks: Array.from({ length: N_ROWS }, () => ({ deskripsi: "", status: "" })),
  alasan: "", solusi: "",
  sigPIC: "", sigSales: "", sigAdmin: "", sigCustomer: "",
};

// ── Root ──────────────────────────────────────────────────────────────────────
export default function WorkOrderApp() {
  const [view, setView] = useState<"form" | "preview">("form");
  const [d, setD]       = useState<FormData>({ ...BLANK, tasks: BLANK.tasks.map(t => ({ ...t })) });
  const [logo, setLogo] = useState<string | null>(null);

  const set  = useCallback((k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setD(p => ({ ...p, [k]: e.target.value })), []);

  const setT = useCallback((i: number, k: keyof Task) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setD(p => {
      const tasks = p.tasks.map((t, idx) => idx === i ? { ...t, [k]: e.target.value } : t);
      return { ...p, tasks };
    }), []);

  const uploadLogo = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => setLogo(ev.target?.result as string);
    r.readAsDataURL(f); e.target.value = "";
  }, []);

  const reset = useCallback(() => {
    setD({ ...BLANK, tasks: BLANK.tasks.map(t => ({ ...t })) });
    setLogo(null);
  }, []);

  return view === "preview"
    ? <PreviewView d={d} logo={logo} onBack={() => setView("form")} onUploadLogo={uploadLogo}/>
    : <FormView  d={d} logo={logo} set={set} setT={setT} onGenerate={() => setView("preview")} onUploadLogo={uploadLogo} onReset={reset}/>;
}

// ── STEP 1 — Input Form ───────────────────────────────────────────────────────
interface FormViewProps {
  d: FormData; logo: string | null;
  set: (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setT: (i: number, k: keyof Task) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void; onUploadLogo: (e: React.ChangeEvent<HTMLInputElement>) => void; onReset: () => void;
}

function FormView({ d, set, setT, onGenerate, onUploadLogo, onReset }: FormViewProps) {
  const [rows,    setRows]    = useState(5);
  const [confirm, setConfirm] = useState(false);

  return (
    <div style={{ fontFamily: T.display, background: T.bg, minHeight: "100vh", paddingBottom: 80 }}>
      <style>{`
        * { box-sizing: border-box; }
        ::placeholder { color: ${T.mutedSoft}; opacity: 1; }
        input:focus, textarea:focus { outline: none; }
        textarea { resize: vertical; }
        .wo-inp:hover  { border-color: rgba(${T.accentR},.35) !important; }
        .wo-inp:focus  { border-color: ${T.accent} !important; background: rgba(${T.accentR},.06) !important; }
        .wo-row-task:hover td { background: rgba(255,255,255,.025) !important; }
      `}</style>

      {/* Reset confirm modal */}
      {confirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)",
          zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)" }}>
          <div style={{ background:T.bgCard, border:`1px solid ${T.glassBorder}`, borderRadius:T.rMd,
            padding:"28px 32px", textAlign:"center", maxWidth:320, width:"90%" }}>
            <div style={{ fontFamily:T.mono, fontSize:11, color:T.accent, letterSpacing:"0.14em",
              textTransform:"uppercase", marginBottom:10 }}>⚠ Konfirmasi</div>
            <div style={{ fontSize:15, fontWeight:700, color:T.fg, marginBottom:6 }}>Reset semua field?</div>
            <div style={{ fontSize:13, color:T.muted, marginBottom:24 }}>Data yang sudah diisi akan dihapus.</div>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => { onReset(); setConfirm(false); setRows(5); }} style={pill(T.err)}>
                Ya, Reset
              </button>
              <button onClick={() => setConfirm(false)}
                style={pill(T.glass, { color:T.fgSoft, border:`1px solid ${T.glassBorder}` })}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div style={{ borderBottom:`1px solid ${T.hairline}`, background:T.bgCard,
        backdropFilter:"blur(16px)", padding:"0 20px", height:52,
        display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
        position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:6, border:`1px solid ${T.glassBorder}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            background:ac(.08), color:T.accent, fontSize:14 }}>◈</div>
          <div>
            <span style={{ fontFamily:T.display, fontSize:14, fontWeight:300, fontStyle:"italic",
              color:T.fgSoft, opacity:.7 }}>PTTS</span>
            <span style={{ fontFamily:T.display, fontSize:14, fontWeight:800, color:T.accent, marginLeft:2 }}>Praxis</span>
            <span style={{ fontFamily:T.mono, fontSize:8, color:T.accent, opacity:.5,
              letterSpacing:"0.15em", textTransform:"uppercase", marginLeft:6 }}>Work Order</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <Stepper step={1}/>
          <label style={{ ...pill(T.glass, { cursor:"pointer", color:T.fgSoft, border:`1px solid ${T.glassBorder}`, fontSize:11 }) }}>
            📁 Logo
            <input type="file" accept="image/*" style={{ display:"none" }} onChange={onUploadLogo}/>
          </label>
          <button onClick={() => setConfirm(true)}
            style={pill(T.glass, { color:T.err, border:`1px solid rgba(220,38,38,.25)`, fontSize:11 })}>
            Reset
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:680, margin:"0 auto", padding:"28px 16px 0" }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontFamily:T.mono, fontSize:10, color:T.accent, letterSpacing:"0.16em",
            textTransform:"uppercase", marginBottom:6, display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:3, height:14, borderRadius:2, background:T.accent, flexShrink:0 }}/>
            Generator Dokumen
            <div style={{ flex:1, height:1, background:T.hairline }}/>
          </div>
          <div style={{ fontFamily:T.display, fontSize:26, fontWeight:800, color:T.fg,
            letterSpacing:"-0.03em", lineHeight:1 }}>Work Order Baru</div>
          <div style={{ fontFamily:T.mono, fontSize:11, color:T.muted, marginTop:6 }}>
            Isi kolom berikut · hasil otomatis terbentuk sebagai dokumen A4
          </div>
        </div>

        {/* SECTION: Informasi Order */}
        <Card title="Informasi Order" tag="Order">
          <FRow>
            <FInput label="Customer Name" value={d.customerName} onChange={set("customerName")} ph="PT / Nama Individu"/>
          </FRow>
          <FRow cols={2}>
            <FInput label="Customer PIC"   value={d.customerPIC}   onChange={set("customerPIC")}   ph="Nama contact person"/>
            <FInput label="Customer Phone" value={d.customerPhone} onChange={set("customerPhone")} ph="+62 ..."/>
          </FRow>
          <FRow cols={3}>
            <FInput label="Order Date"   value={d.orderDate}   onChange={set("orderDate")}   ph="dd/mm/yyyy"/>
            <FInput label="Order Number" value={d.orderNumber} onChange={set("orderNumber")} ph="WO-2026-XXX"/>
            <FInput label="PR / PO Number" value={d.prPoNumber} onChange={set("prPoNumber")} ph="PO-XXXX"/>
          </FRow>
          <FRow cols={2}>
            <FInput label="Start Date" value={d.startDate} onChange={set("startDate")} ph="dd/mm/yyyy"/>
            <FInput label="End Date"   value={d.endDate}   onChange={set("endDate")}   ph="dd/mm/yyyy"/>
          </FRow>
          <FRow>
            <FInput label="Deskripsi Pekerjaan (Ringkasan)" value={d.descHeader} onChange={set("descHeader")} ph="Ringkasan singkat pekerjaan"/>
          </FRow>
        </Card>

        {/* SECTION: Tim */}
        <Card title="Tim" tag="Personnel">
          <FRow cols={2}>
            <FInput label="PIC Project" value={d.picProject} onChange={set("picProject")} ph="Nama PIC internal"/>
            <FInput label="Sales"       value={d.sales}      onChange={set("sales")}      ph="Nama Sales"/>
          </FRow>
          <FRow>
            <FInput label="Crew / Teknisi" value={d.crew} onChange={set("crew")} ph="Nama teknisi yang ditugaskan (pisah koma jika lebih dari satu)"/>
          </FRow>
          <FRow>
            <FTextarea label="Comments" value={d.comments} onChange={set("comments")} rows={2}/>
          </FRow>
        </Card>

        {/* SECTION: Deskripsi Pekerjaan */}
        <Card title="Deskripsi Pekerjaan" tag={`Task · ${rows}/${N_ROWS}`}>
          <div style={{ overflowX:"auto", margin:"0 -2px" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <colgroup>
                <col style={{ width:32 }}/>
                <col/>
                <col style={{ width:180 }}/>
              </colgroup>
              <thead>
                <tr>
                  {["#","Deskripsi Pekerjaan","Status"].map((h, i) => (
                    <th key={h} style={{ fontFamily:T.mono, fontSize:9, fontWeight:600, color:T.muted,
                      letterSpacing:"0.12em", textTransform:"uppercase",
                      textAlign: i===0 ? "center" : "left",
                      padding:"6px 8px", borderBottom:`1px solid ${T.hairline}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.tasks.slice(0, rows).map((task, i) => (
                  <tr key={i} className="wo-row-task">
                    <td style={{ textAlign:"center", fontFamily:T.mono, fontSize:10,
                      color:T.mutedSoft, padding:"1px 4px", borderBottom:`1px solid ${T.hairlineSoft}` }}>
                      {i+1}
                    </td>
                    <td style={{ padding:"2px 4px", borderBottom:`1px solid ${T.hairlineSoft}` }}>
                      <input value={task.deskripsi} onChange={setT(i,"deskripsi")}
                        className="wo-inp"
                        placeholder={i===0 ? "Tuliskan pekerjaan utama..." : ""}
                        style={taskInp()}/>
                    </td>
                    <td style={{ padding:"2px 4px", borderBottom:`1px solid ${T.hairlineSoft}` }}>
                      <input value={task.status} onChange={setT(i,"status")}
                        className="wo-inp"
                        placeholder={i===0 ? "Selesai / Proses..." : ""}
                        style={taskInp()}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:10 }}>
            {rows < N_ROWS && (
              <button onClick={() => setRows(r => Math.min(r+5, N_ROWS))}
                style={pill(T.glass, { color:T.accent, border:`1px dashed ${ac(.4)}`, fontSize:11 })}>
                + Tambah Baris ({rows}/{N_ROWS})
              </button>
            )}
            {rows > 5 && (
              <button onClick={() => setRows(5)}
                style={pill(T.glass, { color:T.mutedSoft, border:`1px solid ${T.hairline}`, fontSize:11 })}>
                Sembunyikan kosong
              </button>
            )}
          </div>
        </Card>

        {/* SECTION: Alasan & Solusi */}
        <Card title="Alasan & Solusi" tag="Jika tidak selesai">
          <FRow cols={2}>
            <FTextarea label="Alasan Kenapa Tidak Selesai" value={d.alasan} onChange={set("alasan")} rows={3}/>
            <FTextarea label="Solusi"                      value={d.solusi} onChange={set("solusi")} rows={3}/>
          </FRow>
        </Card>

        {/* SECTION: Tanda Tangan */}
        <Card title="Tanda Tangan" tag="Sign-off">
          <FRow cols={4}>
            <FInput label="PIC Project" value={d.sigPIC}      onChange={set("sigPIC")}      ph="Nama"/>
            <FInput label="Sales"       value={d.sigSales}    onChange={set("sigSales")}    ph="Nama"/>
            <FInput label="Admin"       value={d.sigAdmin}    onChange={set("sigAdmin")}    ph="Nama"/>
            <FInput label="Customer"    value={d.sigCustomer} onChange={set("sigCustomer")} ph="Nama"/>
          </FRow>
        </Card>

        {/* CTA */}
        <div style={{ marginTop:8, marginBottom:40 }}>
          <button onClick={onGenerate} style={{
            width:"100%", padding:"15px 24px",
            background:`linear-gradient(135deg, ${T.accent}, #a0502a)`,
            border:"none", borderRadius:T.rMd, cursor:"pointer",
            fontFamily:T.display, fontSize:15, fontWeight:800, color:"#0e0e0d",
            letterSpacing:"0.04em",
            boxShadow:`0 8px 24px ${ac(.35)}, inset 0 1px 0 rgba(255,255,255,.15)`,
            display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          }}>
            Generate Work Order
            <span style={{ fontFamily:T.mono, fontSize:18, lineHeight:1 }}>→</span>
          </button>
          <div style={{ fontFamily:T.mono, fontSize:10, color:T.mutedSoft, textAlign:"center",
            marginTop:10, letterSpacing:"0.06em" }}>
            Hasil akan muncul sebagai dokumen A4 · Print → Save as PDF
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STEP 2 — A4 Preview ───────────────────────────────────────────────────────
interface PreviewViewProps {
  d: FormData; logo: string | null;
  onBack: () => void; onUploadLogo: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function PreviewView({ d, logo, onBack, onUploadLogo }: PreviewViewProps) {
  const bTd = (o: React.CSSProperties = {}): React.CSSProperties => ({
    border:"1px solid #9aa3ad", padding:"3px 7px", fontSize:11,
    fontFamily:"'Segoe UI',Arial,sans-serif", verticalAlign:"middle", height:22, ...o,
  });
  const lTd = (o: React.CSSProperties = {}): React.CSSProperties =>
    bTd({ background:"#45586c", color:"#fff", fontWeight:700, whiteSpace:"nowrap", ...o });
  const vTd = (o: React.CSSProperties = {}): React.CSSProperties =>
    bTd({ background:"#fff", ...o });
  const hTd = (o: React.CSSProperties = {}): React.CSSProperties =>
    bTd({ background:"#dfe3e8", fontWeight:700, textAlign:"center", ...o });

  const SIGS = [
    { label:"PIC Project", val:d.sigPIC      },
    { label:"Sales",       val:d.sigSales    },
    { label:"Admin",       val:d.sigAdmin    },
    { label:"Customer",    val:d.sigCustomer },
  ];

  return (
    <div style={{ fontFamily:T.display, background:"#dde0e5", minHeight:"100vh", padding:20 }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; margin: 0; padding: 0; }
          .wo-a4 { box-shadow: none !important; padding: 8mm 10mm !important; margin: 0 !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print" style={{ maxWidth:794, margin:"0 auto 14px",
        background:T.bgCard, border:`1px solid ${T.glassBorder}`, borderRadius:T.rMd,
        padding:"10px 14px", display:"flex", gap:10, flexWrap:"wrap", alignItems:"center",
        backdropFilter:"blur(16px)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginRight:4 }}>
          <div style={{ width:24, height:24, borderRadius:6, border:`1px solid ${T.glassBorder}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            background:ac(.08), color:T.accent, fontSize:12 }}>◈</div>
          <span style={{ fontFamily:T.mono, fontSize:10, color:T.accent, letterSpacing:"0.1em",
            textTransform:"uppercase" }}>Praxis · WO</span>
        </div>
        <Stepper step={2}/>
        <div style={{ flex:1 }}/>
        <button onClick={onBack}
          style={pill(T.glass, { color:T.fgSoft, border:`1px solid ${T.glassBorder}`, fontSize:12 })}>
          ← Kembali Edit
        </button>
        <button onClick={() => window.print()} style={pill(T.accent)}>
          🖨️ Cetak / PDF
        </button>
        <label style={{ ...pill(T.glass, { color:T.fgSoft, border:`1px solid ${T.glassBorder}`, fontSize:12 }), cursor:"pointer" }}>
          📁 Logo
          <input type="file" accept="image/*" style={{ display:"none" }} onChange={onUploadLogo}/>
        </label>
        <span style={{ fontFamily:T.mono, fontSize:10, color:T.mutedSoft }}>
          Chrome → Print → <em>Save as PDF</em> · A4
        </span>
      </div>

      {/* A4 Page */}
      <div className="wo-a4" style={{ maxWidth:794, margin:"0 auto", background:"#fff",
        padding:"28px 32px", boxShadow:"0 2px 16px rgba(0,0,0,.18)" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div>
            <div style={{ fontSize:20, fontWeight:800, color:"#45586c", marginBottom:4 }}>
              PT. PRIMA TEKINDO TIRTA SEJAHTERA
            </div>
            <div style={{ fontSize:10.5, lineHeight:1.6, color:"#333", fontFamily:"'Segoe UI',Arial,sans-serif" }}>
              Jl. Pangeran Jayakarta Ruko 141 Blok A1 No.11<br/>
              Jembatan Merah, Jakarta Pusat 10730 - Indonesia<br/>
              Telp : (021) 629 3028 / Fax : (021) 629 3018<br/>
              Email : info@ptts.co.id
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ width:84, height:84, marginLeft:"auto" }}>
              {logo
                ? <img src={logo} alt="Logo" style={{ width:84, height:84, objectFit:"contain" }}/>
                : <PttsLogoSVG/>
              }
            </div>
            <div style={{ fontSize:18, fontWeight:700, color:"#45586c", letterSpacing:2, marginTop:8 }}>
              WORK ORDER FORM
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <table style={{ borderCollapse:"collapse", width:"100%", marginBottom:5 }}>
          <tbody>
            <tr>
              <td style={lTd({ width:130 })}>Customer Name</td>
              <td style={vTd({ width:284 })}>{d.customerName||<Dash/>}</td>
              <td style={lTd({ textAlign:"center", width:107 })}>ORDER DATE</td>
              <td style={lTd({ textAlign:"center", width:107 })}>ORDER NUMBER</td>
            </tr>
            <tr>
              <td style={lTd()}>Customer PIC</td>
              <td style={vTd()}>{d.customerPIC||<Dash/>}</td>
              <td style={vTd({ textAlign:"center" })}>{d.orderDate||""}</td>
              <td style={vTd({ textAlign:"center" })}>{d.orderNumber||""}</td>
            </tr>
            <tr>
              <td style={lTd()}>Customer Phone</td>
              <td style={vTd()}>{d.customerPhone||<Dash/>}</td>
              <td style={lTd({ textAlign:"center" })}>START DATE</td>
              <td style={lTd({ textAlign:"center" })}>END DATE</td>
            </tr>
            <tr>
              <td style={lTd()}>PR / PO Number</td>
              <td style={vTd()}>{d.prPoNumber||<Dash/>}</td>
              <td style={vTd({ textAlign:"center" })}>{d.startDate||""}</td>
              <td style={vTd({ textAlign:"center" })}>{d.endDate||""}</td>
            </tr>
            <tr>
              <td style={lTd()}>Deskripsi Pekerjaan</td>
              <td style={vTd()} colSpan={3}>{d.descHeader||<Dash/>}</td>
            </tr>
          </tbody>
        </table>

        {/* PIC Block */}
        <table style={{ borderCollapse:"collapse", width:"100%", marginBottom:5 }}>
          <tbody>
            <tr>
              <td style={lTd({ width:130 })}>PIC Project</td>
              <td style={vTd({ width:316 })}>{d.picProject||<Dash/>}</td>
              <td style={lTd({ textAlign:"center", width:80 })}>Sales</td>
              <td style={vTd()}>{d.sales||<Dash/>}</td>
            </tr>
            <tr>
              <td style={lTd()}>Crew</td>
              <td style={vTd()} colSpan={3}>{d.crew||<Dash/>}</td>
            </tr>
            <tr>
              <td style={lTd()}>Comments</td>
              <td style={vTd()} colSpan={3}>{d.comments||<Dash/>}</td>
            </tr>
          </tbody>
        </table>

        {/* Tasks */}
        <table style={{ borderCollapse:"collapse", width:"100%" }}>
          <colgroup>
            <col/>
            <col style={{ width:220 }}/>
          </colgroup>
          <thead>
            <tr>
              <th style={hTd()}>DESKRIPSI PEKERJAAN</th>
              <th style={hTd()}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {d.tasks.map((task, i) => (
              <tr key={i}>
                <td style={bTd({ background:"#fff", height:23 })}>{task.deskripsi}</td>
                <td style={bTd({ background:"#fff", height:23 })}>{task.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Reason / Solution */}
        <table style={{ borderCollapse:"collapse", width:"100%", border:"2px solid #2b2b2b", marginTop:14 }}>
          <thead>
            <tr>
              <th style={hTd({ width:"50%" })}>ALASAN KENAPA TIDAK SELESAI</th>
              <th style={hTd({ width:"50%" })}>SOLUSI</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={bTd({ background:"#fff", height:100, verticalAlign:"top" })}>
                <span style={{ whiteSpace:"pre-wrap", fontSize:11 }}>{d.alasan}</span>
              </td>
              <td style={bTd({ background:"#fff", height:100, verticalAlign:"top" })}>
                <span style={{ whiteSpace:"pre-wrap", fontSize:11 }}>{d.solusi}</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Signatures */}
        <div style={{ display:"flex", justifyContent:"space-between",
          textAlign:"center", fontSize:12, marginTop:36,
          fontFamily:"'Segoe UI',Arial,sans-serif" }}>
          {SIGS.map(({ label, val }) => (
            <div key={label} style={{ width:"23%" }}>
              <div style={{ marginBottom:52 }}>{label}</div>
              <div style={{ borderTop:"1px solid #bbb", paddingTop:5 }}>
                ({val || "      "})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Shared Components ─────────────────────────────────────────────────────────

function Card({ title, tag, children }: { title: string; tag: string; children: React.ReactNode }) {
  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.glassBorder}`, borderRadius:T.rMd,
      padding:"16px", marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
        <div style={{ width:3, height:14, borderRadius:2, background:T.accent,
          opacity:.8, flexShrink:0 }}/>
        <span style={{ fontFamily:T.mono, fontSize:10, fontWeight:600, color:T.accent,
          letterSpacing:"0.14em", textTransform:"uppercase" }}>{title}</span>
        <div style={{ flex:1, height:1, background:T.hairline }}/>
        <span style={{ fontFamily:T.mono, fontSize:9, color:T.mutedSoft,
          letterSpacing:"0.06em" }}>{tag}</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {children}
      </div>
    </div>
  );
}

function FRow({ cols = 1, children }: { cols?: number; children: React.ReactNode }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols}, 1fr)`, gap:10 }}>
      {children}
    </div>
  );
}

function FInput({ label, value, onChange, ph = "" }: {
  label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; ph?: string;
}) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <label style={{ fontFamily:T.mono, fontSize:10, fontWeight:600, color:T.muted,
        letterSpacing:"0.06em", textTransform:"uppercase" }}>
        {label}
      </label>
      <input value={value} onChange={onChange} placeholder={ph}
        className="wo-inp" style={inputS()}/>
    </div>
  );
}

function FTextarea({ label, value, onChange, rows = 3 }: {
  label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number;
}) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <label style={{ fontFamily:T.mono, fontSize:10, fontWeight:600, color:T.muted,
        letterSpacing:"0.06em", textTransform:"uppercase" }}>
        {label}
      </label>
      <textarea value={value} onChange={onChange} rows={rows}
        className="wo-inp" style={inputS({ resize:"vertical" })}/>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
      {[1,2].map(s => (
        <span key={s} style={{
          fontFamily:T.mono, fontSize:9, fontWeight:700, letterSpacing:"0.08em",
          padding:"3px 8px", borderRadius:T.rPill,
          background: s===step ? T.accent  : T.glass,
          color:       s===step ? "#0e0e0d" : T.mutedSoft,
          border:      s===step ? "none"    : `1px solid ${T.glassBorder}`,
        }}>
          {s===1 ? "01 · Isi Data" : "02 · Preview"}
        </span>
      ))}
    </div>
  );
}

const Dash = () => <span style={{ color:"#ccc" }}>—</span>;

function PttsLogoSVG() {
  return (
    <svg viewBox="0 0 100 100" width={84} height={84} xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#fff" stroke="#173a6b" strokeWidth="3.5"/>
      <text x="50" y="44" textAnchor="middle" fontFamily="Arial"
        fontSize="23" fontWeight="900" fill="#173a6b" letterSpacing="1.5">PTTS</text>
      <text x="50" y="57" textAnchor="middle" fontFamily="Arial"
        fontSize="6.5" fontWeight="600" fill="#45586c" letterSpacing="0.5">PRIMA TEKINDO</text>
      <path d="M14 67 q10-9 18 0 t18 0 t18 0 t16 0" fill="none" stroke="#2f7bc4" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M14 76 q10-9 18 0 t18 0 t18 0 t16 0" fill="none" stroke="#5aa0dc" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M14 84 q10-9 18 0 t18 0 t18 0 t16 0" fill="none" stroke="#9cc6ec" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────
const pill = (bg: string, o: React.CSSProperties = {}): React.CSSProperties => ({
  fontSize:12, fontWeight:600, cursor:"pointer",
  border:"none", borderRadius:T.rPill, padding:"7px 14px",
  color: bg===T.accent ? "#0e0e0d" : "#fff",
  background:bg, display:"inline-flex", alignItems:"center", gap:5,
  fontFamily:T.mono, letterSpacing:"0.03em", ...o,
});

const inputS = (o: React.CSSProperties = {}): React.CSSProperties => ({
  background: T.bgInput,
  border: `1px solid ${T.glassBorder}`,
  borderRadius: T.rSm,
  color: T.fg,
  fontSize: 13,
  padding: "8px 10px",
  fontFamily: T.display,
  width:"100%",
  transition: "border-color 0.18s, background 0.18s",
  ...o,
});

const taskInp = (): React.CSSProperties => ({
  border: "none",
  outline: "none",
  background: "transparent",
  width: "100%",
  fontSize: 12,
  color: T.fgSoft,
  padding: "5px 6px",
  fontFamily: T.display,
  borderRadius: 4,
  transition: "background 0.15s",
});
