"use client";

import { useLang } from "@/lib/i18n";
import type { ModuleData } from "@/data/skf-microlog/modules";
import { GLASS, getModuleIdData, getTagColor } from "../_shared";

interface Props {
  mod: ModuleData;
  onClick: () => void;
  isActive: boolean;
  lang: "en" | "id";
}

/** One module tile in the catalog grid — title, tag chip, file-id, tldr. */
export default function ModuleCard({ mod, onClick, isActive, lang }: Props) {
  const { t } = useLang();
  const title = lang === "id" ? mod.titleId : mod.titleEn;
  const modDataId = getModuleIdData(mod.id);
  const tldr = lang === "id" && modDataId ? modDataId.tldr : mod.tldr;

  return (
    <button
      onClick={onClick}
      id={`module-card-${mod.id}`}
      style={{
        ...GLASS,
        width: "100%",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.3s ease",
        borderColor: isActive ? "var(--accent)" : "var(--glass-border)",
        background: isActive ? "rgba(var(--accent-rgb),0.08)" : "var(--glass-bg)",
        transform: isActive ? "scale(1.01)" : "scale(1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: 28 }}>{mod.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
              padding: "2px 8px", borderRadius: 6,
              background: `${getTagColor(mod.tag)}22`,
              color: getTagColor(mod.tag),
            }}>
              {mod.tag}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", opacity: 0.7 }}>
              {t.home.calcs.skfMicrolog.fileTag} {mod.id}
            </span>
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--fg)", margin: "4px 0 0" }}>
            {title}
          </h3>
        </div>
      </div>
      <p style={{ fontSize: 13, color: "var(--fg-soft)", lineHeight: 1.5, margin: 0 }}>
        {tldr.slice(0, 140)}…
      </p>
    </button>
  );
}
