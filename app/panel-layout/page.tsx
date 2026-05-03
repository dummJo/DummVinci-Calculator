"use client";
import React, { useState, useRef } from "react";
import CalcShell from "@/components/calc/CalcShell";
import Footer from "@/components/nav/Footer";
import { useLang } from "@/lib/i18n";
import { componentLibrary, ENCLOSURES, PanelComponent } from "@/lib/calc/panelLayoutData";
import { Plus, Trash2, MousePointer2 } from "lucide-react";

interface PlacedItem {
  id: string; // unique instance ID
  comp: PanelComponent;
  x: number;
  y: number;
}

export default function PanelLayoutPage() {
  const { t } = useLang();
  // Using translated strings if available
  const tl = t.panelLayout || { title: "Panel Layout", subtitle: "Estimator" };

  const [encId, setEncId] = useState(ENCLOSURES[0].id);
  const activeEnc = ENCLOSURES.find((e) => e.id === encId) || ENCLOSURES[0];

  const [items, setItems] = useState<PlacedItem[]>([]);
  
  // Dragging state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Add component to canvas (starts at top left)
  const handleAddComponent = (comp: PanelComponent) => {
    const newItem: PlacedItem = {
      id: Math.random().toString(36).substring(2, 9),
      comp,
      x: 20,
      y: 20,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    if (e.button !== 0) return; // Only left click
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    
    const item = items.find((i) => i.id === id);
    if (!item || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const scale = canvasRect.width / activeEnc.w;

    const mouseX = (e.clientX - canvasRect.left) / scale;
    const mouseY = (e.clientY - canvasRect.top) / scale;

    setDragOffset({
      x: mouseX - item.x,
      y: mouseY - item.y,
    });
    setDraggingId(id);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingId || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const scale = canvasRect.width / activeEnc.w;

    const mouseX = (e.clientX - canvasRect.left) / scale;
    const mouseY = (e.clientY - canvasRect.top) / scale;

    let newX = mouseX - dragOffset.x;
    let newY = mouseY - dragOffset.y;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === draggingId) {
          // Snap to bounds roughly
          if (newX < 0) newX = 0;
          if (newY < 0) newY = 0;
          if (newX + item.comp.width > activeEnc.w) newX = activeEnc.w - item.comp.width;
          if (newY + item.comp.height > activeEnc.h) newY = activeEnc.h - item.comp.height;

          return { ...item, x: newX, y: newY };
        }
        return item;
      })
    );
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingId) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDraggingId(null);
    }
  };

  return (
    <CalcShell label="IEC 61439" title={tl.title} subtitle={tl.subtitle} concept={tl.concept}>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 40 }}>
        {/* Settings Bar */}
        <div className="vinci-card" style={{ padding: 16, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase" }}>
              Enclosure Size
            </label>
            <select
              value={encId}
              onChange={(e) => setEncId(e.target.value)}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--fg)",
                padding: "8px 12px",
                borderRadius: 6,
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                outline: "none"
              }}
            >
              {ENCLOSURES.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.w}x{e.h}mm)
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }} />
          
          <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 8 }}>
            <MousePointer2 size={16} />
            <span>Drag items on canvas to arrange. Canvas auto-scales.</span>
          </div>
        </div>

        {/* Editor Layout */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          
          {/* Component Palette */}
          <div style={{ flex: "1 1 250px", minWidth: 250 }}>
            <div className="vinci-card" style={{ padding: 16, maxHeight: 650, overflowY: "auto" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>
                Component Library
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {componentLibrary.map((c) => (
                  <div key={c.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px", border: "1px solid var(--border)", borderRadius: 6,
                    background: "rgba(255,255,255,0.02)", transition: "all 0.2s"
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 11, color: c.color, fontWeight: 700 }}>{c.brand} {c.category}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{c.partCode}</span>
                      <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                        {c.width}x{c.height}mm
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddComponent(c)}
                      style={{
                        background: "var(--bg)", border: "1px solid var(--border)",
                        color: "var(--fg)", width: 32, height: 32, borderRadius: 4,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "all 0.2s"
                      }}
                      title={`Add ${c.partCode}`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div style={{ flex: "2 1 450px", display: "flex", justifyContent: "center", alignItems: "flex-start", background: "var(--bg-card)", borderRadius: 12, padding: 24, border: "1px dashed var(--border)" }}>
            
            <div
              ref={canvasRef}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 450, // Visual limit
                aspectRatio: `${activeEnc.w} / ${activeEnc.h}`,
                background: "#f0f0f0", // Backplate color (galvanized steel simulation)
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                border: "2px solid #aaa",
                overflow: "hidden",
                touchAction: "none" // Prevent scrolling while dragging
              }}
            >
              {/* Grid Background */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: "linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)",
                backgroundSize: `${(50 / activeEnc.w) * 100}% ${(50 / activeEnc.h) * 100}%`,
                opacity: 0.5, pointerEvents: "none"
              }} />

              {/* Items */}
              {items.map((item) => {
                const wPct = (item.comp.width / activeEnc.w) * 100;
                const hPct = (item.comp.height / activeEnc.h) * 100;
                const xPct = (item.x / activeEnc.w) * 100;
                const yPct = (item.y / activeEnc.h) * 100;

                const isDragging = draggingId === item.id;

                return (
                  <div
                    key={item.id}
                    onPointerDown={(e) => onPointerDown(e, item.id)}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    style={{
                      position: "absolute",
                      left: `${xPct}%`,
                      top: `${yPct}%`,
                      width: `${wPct}%`,
                      height: `${hPct}%`,
                      backgroundColor: item.comp.color,
                      border: isDragging ? "2px solid #fff" : "1px solid rgba(0,0,0,0.5)",
                      boxShadow: isDragging ? "0 8px 16px rgba(0,0,0,0.5)" : "0 2px 4px rgba(0,0,0,0.3)",
                      opacity: 0.95,
                      cursor: isDragging ? "grabbing" : "grab",
                      zIndex: isDragging ? 10 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: isDragging ? "none" : "box-shadow 0.2s"
                    }}
                  >
                    {/* Delete Button */}
                    <div style={{
                      position: "absolute", top: 0, right: 0, 
                      transform: "translate(50%, -50%)", zIndex: 11,
                      display: isDragging ? "none" : "block"
                    }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id); }}
                        style={{
                          background: "#ff4444", color: "#fff", border: "none",
                          width: 20, height: 20, borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                          padding: 0
                        }}
                        title="Remove"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Label inside box */}
                    <div style={{
                      color: "#fff", fontSize: "clamp(8px, 1.2vw, 12px)", fontWeight: 700,
                      textAlign: "center", fontFamily: "var(--font-mono)",
                      textShadow: "0 1px 2px rgba(0,0,0,0.8)", padding: 2,
                      pointerEvents: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%"
                    }}>
                      {item.comp.partCode}
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
        </div>

      </div>
      <Footer />
    </CalcShell>
  );
}
