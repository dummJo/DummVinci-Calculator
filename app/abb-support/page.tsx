"use client";
import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import Footer from "@/components/nav/Footer";
import { useLang } from "@/lib/i18n";
import supportData from "@/data/abb-support.json";
import drivesData from "@/data/abb-drives.json";
import { Search, ExternalLink, HelpCircle, X, Maximize2 } from "lucide-react";

export default function AbbSupportHub() {
  const { t } = useLang();
  const ts = t.support;

  const [searchCode, setSearchCode] = useState("");
  const [activeFault, setActiveFault] = useState<any>(null);
  const [selectedFamily, setSelectedFamily] = useState("ACS880");

  const handleSearch = () => {
    const found = supportData.faults.find(f => f.code === searchCode || f.title.toLowerCase().includes(searchCode.toLowerCase()));
    if (found) setActiveFault(found);
  };

  const filteredDrives = drivesData.filter(d => d.family.startsWith(selectedFamily.split(" ")[0]));

  return (
    <CalcShell label="ABB HUB" title={ts.title} subtitle={ts.subtitle}>
      <div className="vinci-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }}>
        
        {/* FAULT SEARCH */}
        <div className="vinci-card" style={{ 
          background: "linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(13,16,22,0) 100%)",
          border: "1px solid var(--accent)" 
        }}>
          <div className="sec-label"><span>ERROR CODE LOOKUP</span></div>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input 
                type="text" 
                placeholder={ts.inputFault}
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                style={{
                  width: "100%",
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--r-md)",
                  padding: "12px 14px 12px 40px",
                  color: "var(--fg)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 14,
                  outline: "none"
                }}
              />
              <Search size={18} style={{ position: "absolute", left: 14, top: 13, color: "var(--muted)" }} />
            </div>
            <button className="btn-primary" onClick={handleSearch}>{ts.btnSearch}</button>
          </div>
        </div>

        {/* MANUAL SHORTCUTS */}
        <div className="vinci-card">
          <div className="sec-label"><span>{ts.secManuals}</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginTop: 16 }}>
            {supportData.manuals.map((m, i) => (
              <a 
                key={i} 
                href={m.link} 
                target="_blank" 
                rel="noopener"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "var(--bg-raised)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--r-md)",
                  textDecoration: "none",
                  transition: "all 0.2s ease"
                }}
                className="hover-lift"
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--fg)", fontWeight: 600 }}>{m.family}</span>
                <ExternalLink size={14} style={{ color: "var(--accent)" }} />
              </a>
            ))}
          </div>
        </div>

        {/* DIMENSIONS LOOKUP */}
        <div className="vinci-card" style={{ overflowX: "auto" }}>
          <div className="sec-label"><span>{ts.secSpecs}</span></div>
          <div style={{ display: "flex", gap: 12, marginTop: 16, marginBottom: 20 }}>
            {["ACS880", "ACQ580", "ACS380"].map(f => (
              <button 
                key={f}
                onClick={() => setSelectedFamily(f)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  border: "1px solid",
                  borderColor: selectedFamily === f ? "var(--accent)" : "var(--glass-border)",
                  background: selectedFamily === f ? "rgba(201,168,76,0.1)" : "transparent",
                  color: selectedFamily === f ? "var(--accent)" : "var(--muted)",
                  cursor: "pointer"
                }}
              >
                {f}
              </button>
            ))}
          </div>
          
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hairline-bold)" }}>
                <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>{ts.colCode}</th>
                <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>{ts.colKw}</th>
                <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>{ts.colFrame}</th>
                <th style={{ textAlign: "right", padding: "12px 8px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>{ts.colDim}</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrives.map((d, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--hairline-soft)" }}>
                  <td style={{ padding: "12px 8px", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--fg)" }}>{d.code}</td>
                  <td style={{ padding: "12px 8px", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{d.ratedKw}</td>
                  <td style={{ padding: "12px 8px", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>{d.frame}</td>
                  <td style={{ padding: "12px 8px", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg)", textAlign: "right" }}>
                    {d.h} × {d.w} × {d.d} mm
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FAULT SOLUTION */}
      {activeFault && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(8px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }}>
          <div 
            className="vinci-card"
            style={{ 
              maxWidth: 400, 
              width: "100%", 
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
              border: "1px solid var(--accent)",
              position: "relative"
            }}
          >
            <button 
              onClick={() => setActiveFault(null)}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <HelpCircle size={32} style={{ color: "var(--accent)" }} />
              <div>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--accent)", letterSpacing: "0.1em" }}>{ts.modalSolution}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--fg)" }}>FAULT {activeFault.code}</div>
              </div>
            </div>
            <div style={{ 
              fontSize: 16, 
              fontWeight: 600, 
              color: "var(--fg)", 
              marginBottom: 12, 
              fontFamily: "var(--font-display)" 
            }}>
              {activeFault.title}
            </div>
            <div style={{ 
              fontSize: 14, 
              color: "var(--muted)", 
              lineHeight: 1.6, 
              fontFamily: "var(--font-mono)",
              background: "rgba(255,255,255,0.03)",
              padding: 16,
              borderRadius: 8
            }}>
              {activeFault.desc}
            </div>
            <button 
              className="btn-primary" 
              onClick={() => setActiveFault(null)}
              style={{ width: "100%", marginTop: 24 }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      <Footer />
    </CalcShell>
  );
}
