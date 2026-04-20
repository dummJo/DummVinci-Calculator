"use client";
import { useState } from "react";
import CalcShell from "@/components/calc/CalcShell";
import Footer from "@/components/nav/Footer";
import { useLang } from "@/lib/i18n";
import supportData from "@/data/abb-support.json";
import drivesData from "@/data/abb-drives.json";
import { Search, ExternalLink, HelpCircle, X, Maximize2 } from "lucide-react";
import RichText from "@/components/calc/RichText";

export default function AbbSupportHub() {
  const { t } = useLang();
  const ts = t.support;

  const [searchCode, setSearchCode] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("ACS880");

  const matchedFaults = searchCode.trim().length >= 2 
    ? supportData.faults.filter(f => f.code.includes(searchCode.toUpperCase()) || f.title.toLowerCase().includes(searchCode.toLowerCase()))
    : [];

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
          <div style={{ position: "relative", marginTop: 16 }}>
            <input 
              type="text" 
              placeholder={ts.inputFault}
              value={searchCode}
              onChange={e => setSearchCode(e.target.value)}
              style={{
                width: "100%",
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: "var(--r-md)",
                padding: "16px 16px 16px 44px",
                color: "var(--fg)",
                fontFamily: "var(--font-mono)",
                fontSize: 16,
                outline: "none",
                transition: "border-color 0.2s"
              }}
            />
            <Search size={20} style={{ position: "absolute", left: 16, top: 16, color: "var(--accent)" }} />
          </div>

          {searchCode.trim().length >= 2 && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {matchedFaults.length > 0 ? matchedFaults.map(f => (
                <div key={f.code} style={{
                  padding: 16,
                  background: "rgba(0,0,0,0.3)",
                  borderLeft: "3px solid var(--accent)",
                  borderRadius: 8
                }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                     <span style={{ fontSize: 16, fontWeight: 700, color: "white", fontFamily: "var(--font-mono)" }}>{f.code}</span>
                     <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>{f.title}</span>
                   </div>
                   <div style={{ fontSize: 13, color: "var(--fg)", opacity: 0.8, lineHeight: 1.5 }}>
                     <RichText text={f.desc} />
                   </div>
                </div>
              )) : (
                <div style={{ padding: 16, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                  No fault codes matched "{searchCode}".
                </div>
              )}
            </div>
          )}
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

      <Footer />
    </CalcShell>
  );
}
