"use client";
// app/(tools)/skf-microlog/page.tsx — SKF Microlog Learn (thin router).
//
// The original ~1965-line monolith was split into ./_components/ and ./_tabs/
// (Next.js underscore-prefix = private folder, not routable). This file only
// owns the tab selection, the cross-tab "jump to module" callback, and the
// page chrome. Each tab is its own client component with its own state.

import { useState, useCallback } from "react";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";

import { TABS, type TabKey } from "./_shared";
import TabModules    from "./_tabs/TabModules";
import TabSeverity   from "./_tabs/TabSeverity";
import TabDiagnostic from "./_tabs/TabDiagnostic";
import TabPaths      from "./_tabs/TabPaths";
import TabTools      from "./_tabs/TabTools";

export default function SkfMicrologPage() {
  const { t, lang } = useLang();
  const [activeTab, setActiveTab] = useState<TabKey>("modules");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  // Cross-tab navigation: clicking a node in TabPaths' dependency tree jumps
  // the user to the Modules tab with the module pre-selected, scrolled to top.
  const handleSelectModule = useCallback((id: string) => {
    setActiveTab("modules");
    setSelectedModuleId(id);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        .skf-tab-btn { transition: all 0.3s ease; position: relative; }
        .skf-tab-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .skf-tab-btn::after {
          content: '';
          position: absolute; bottom: -2px; left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 24px; height: 2px;
          background: var(--accent); border-radius: 1px;
          transition: transform 0.3s ease;
        }
        .skf-tab-active::after { transform: translateX(-50%) scaleX(1); }
      `}</style>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "56px 16px 140px", width: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: "rgba(var(--accent-rgb),0.15)", color: "var(--accent)", letterSpacing: "0.1em" }}>
              {t.home.calcs.skfMicrolog.learnTab}
            </span>
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>{t.home.calcs.skfMicrolog.knowledgeBase}</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 5vw, 36px)", color: "var(--fg)", margin: "0 0 6px" }}>
            {t.home.calcs.skfMicrolog.skfMicrologLabel}
          </h1>
          <p style={{ fontSize: 14, color: "var(--fg-soft)", lineHeight: 1.5, margin: 0, maxWidth: 600 }}>
            {lang === "id"
              ? "Platform pembelajaran analisis getaran untuk tim PTTS. 7 modul interaktif, kalkulator keparahan, diagram diagnostik, dan simulator balancing."
              : "Vibration analysis learning platform for PTTS team. 7 interactive modules, severity calculator, diagnostic charts, and balancing simulator."}
          </p>
        </div>

        {/* Tab Bar */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 24, overflowX: "auto",
          padding: "4px", borderRadius: 14,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--glass-border)",
        }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`skf-tab-btn ${activeTab === tab.key ? "skf-tab-active" : ""}`}
              style={{
                flex: 1, padding: "10px 8px", borderRadius: 10, fontSize: 11,
                fontWeight: activeTab === tab.key ? 700 : 500,
                fontFamily: "var(--font-mono)", cursor: "pointer",
                background: activeTab === tab.key ? "rgba(var(--accent-rgb),0.1)" : "transparent",
                color: activeTab === tab.key ? "var(--accent)" : "var(--muted)",
                border: "none", whiteSpace: "nowrap",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              }}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              <span>{lang === "id" ? tab.labelId : tab.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "modules"    && <TabModules    lang={lang} selectedId={selectedModuleId} setSelectedId={setSelectedModuleId} />}
        {activeTab === "severity"   && <TabSeverity   lang={lang} />}
        {activeTab === "diagnostic" && <TabDiagnostic lang={lang} />}
        {activeTab === "paths"      && <TabPaths      lang={lang} onSelectModule={handleSelectModule} />}
        {activeTab === "tools"      && <TabTools      lang={lang} />}
      </main>

      <Footer />
      <div style={{ textAlign: "center", padding: "0 0 120px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", opacity: 0.4 }}>
        {t.home.calcs.skfMicrolog.byDummVinci}
      </div>
    </div>
  );
}
