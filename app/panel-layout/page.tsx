"use client";
import CalcShell from "@/components/calc/CalcShell";
import Footer from "@/components/nav/Footer";
import { useLang } from "@/lib/i18n";
import { Hammer } from "lucide-react";

export default function PanelLayoutPage() {
  const { t } = useLang();
  const tl = (t as any).panelLayout || { title: "Panel Layout", subtitle: "Coming Soon" };

  return (
    <CalcShell label="IEC 61439" title={tl.title} subtitle={tl.subtitle} concept={tl.concept}>
      <div className="vinci-card" style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "80px 24px",
        textAlign: "center",
        gap: 16
      }}>
        <div style={{ 
          width: 64, 
          height: 64, 
          borderRadius: "50%", 
          background: "rgba(201,168,76,0.1)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          color: "var(--accent)",
          marginBottom: 8
        }}>
          <Hammer size={32} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, margin: 0 }}>
          {tl.underConstTitle}
        </h2>
        <p style={{ color: "var(--muted)", maxWidth: 400, fontSize: 14 }}>
          {tl.underConstDesc}
        </p>
      </div>
      <Footer />
    </CalcShell>
  );
}
