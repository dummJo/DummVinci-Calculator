"use client";
import React, { useState, useRef } from "react";
import CalcShell from "@/components/calc/CalcShell";
import Footer from "@/components/nav/Footer";
import { useLang } from "@/lib/i18n";
import { componentLibrary, ENCLOSURES, PanelComponent } from "@/lib/calc/panelLayoutData";
import { Plus, Trash2, MousePointer2, Filter, Box, Minimize2, Wind, Printer, Settings2 } from "lucide-react";

interface PlacedItem {
  id: string; // unique instance ID
  comp: PanelComponent;
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function PanelLayoutPage() {
  const { t } = useLang();
  const tl = t.panelLayout || { title: "Panel Layout", subtitle: "Estimator" };

  const [encId, setEncId] = useState(ENCLOSURES[0].id);
  const activeEnc = ENCLOSURES.find((e) => e.id === encId) || ENCLOSURES[0];

  const [items, setItems] = useState<PlacedItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  
  const [viewMode, setViewMode] = useState<"inner" | "outer">("inner");
  const [includeFans, setIncludeFans] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Dragging state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const categories = ["All", ...Array.from(new Set(componentLibrary.map((c) => c.category)))];
  const filteredLibrary = activeCategory === "All" 
    ? componentLibrary 
    : componentLibrary.filter((c) => c.category === activeCategory);

  const handleAddComponent = (comp: PanelComponent) => {
    // Drop exactly in the middle to prevent off-screen
    const newItem: PlacedItem = {
      id: Math.random().toString(36).substring(2, 9),
      comp,
      x: (activeEnc.w - comp.width) / 2,
      y: (activeEnc.h - comp.height) / 2,
      w: comp.width,
      h: comp.height
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedId(newItem.id);
    setViewMode("inner"); // Force back to inner view to place it
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    if (e.button !== 0 || viewMode === "outer") return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    
    setSelectedId(id);
    
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
          // Snap to bounds smoothly
          if (newX < 0) newX = 0;
          if (newY < 0) newY = 0;
          if (newX + item.w > activeEnc.w) newX = activeEnc.w - item.w;
          if (newY + item.h > activeEnc.h) newY = activeEnc.h - item.h;

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

  const renderCADVisual = (comp: PanelComponent, w: number, h: number) => {
    switch (comp.category) {
      case "VSD":
        return (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(to bottom, #d0d0d0 0%, #a0a0a0 100%)", borderRadius: 2, display: "flex", flexDirection: "column", padding: "5%", boxSizing: "border-box" }}>
            <div style={{ width: "70%", height: "15%", background: "#111", margin: "0 auto", borderRadius: 2, boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)" }} />
            <div style={{ flex: 1 }} />
            <div style={{ width: "90%", height: "20%", borderTop: "2px solid #666", borderBottom: "2px solid #666", margin: "0 auto", opacity: 0.4 }} />
          </div>
        );
      case "MCCB":
        return (
          <div style={{ width: "100%", height: "100%", background: "#c8c8c8", border: "1px solid #888", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
            <div style={{ width: "30%", height: "35%", background: "#222", borderRadius: 2, boxShadow: "inset 0 4px 0px #000, 0 2px 4px rgba(0,0,0,0.3)" }} />
          </div>
        );
      case "Terminal Block":
        return (
          <div style={{ width: "100%", height: "100%", background: "#f4a261", display: "flex", flexDirection: "row", border: "1px solid #d48241", boxSizing: "border-box" }}>
            {Array.from({length: 10}).map((_, i) => (
               <div key={i} style={{ flex: 1, borderRight: "1px solid rgba(0,0,0,0.15)" }} />
            ))}
          </div>
        );
      case "Wiring":
        if (comp.brand === "Weidmuller") { 
          return (
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(to bottom, #f0f0f0 0%, #b0b0b0 40%, #808080 50%, #b0b0b0 60%, #f0f0f0 100%)", boxSizing: "border-box", borderTop: "1px solid #fff", borderBottom: "1px solid #666" }}>
               <div style={{ width: "100%", height: "15%", background: "rgba(0,0,0,0.1)", marginTop: "12px" }} />
            </div>
          );
        } else { 
          const isHorizontal = w > h;
          return (
            <div style={{ width: "100%", height: "100%", background: "#a0a0a0", boxSizing: "border-box", display: "flex", flexDirection: isHorizontal ? "row" : "column", border: "1px solid #888" }}>
               <div style={{ flex: 1, backgroundImage: `repeating-linear-gradient(${isHorizontal ? 'to right' : 'to bottom'}, transparent, transparent 6px, rgba(0,0,0,0.25) 6px, rgba(0,0,0,0.25) 10px)` }} />
            </div>
          );
        }
      case "Networking":
        return (
          <div style={{ width: "100%", height: "100%", background: "#2d3142", borderRadius: 2, border: "1px solid #1a1c26", padding: "10%", display: "flex", flexDirection: "column", gap: "10%", boxSizing: "border-box" }}>
            <div style={{ flex: 1, background: "#1a1c26", borderRadius: 2, border: "1px solid #000" }} />
            <div style={{ flex: 1, background: "#1a1c26", borderRadius: 2, border: "1px solid #000" }} />
            <div style={{ flex: 1, background: "#1a1c26", borderRadius: 2, border: "1px solid #000" }} />
          </div>
        );
      case "Control":
      default:
        return (
          <div style={{ width: "100%", height: "100%", background: "rgba(240,240,240,0.95)", border: "1px solid #999", borderRadius: 2, display: "flex", alignItems: "flex-start", padding: "10%", boxSizing: "border-box" }}>
             <div style={{ width: "25%", aspectRatio: "1", background: comp.color, borderRadius: "50%", boxShadow: `0 0 6px ${comp.color}` }} />
          </div>
        );
    }
  };

  const renderFanFilter = () => (
    <div style={{
      width: "100%", aspectRatio: "1", background: "#dcdcdc", 
      border: "1px solid #aaa", borderRadius: 4, display: "flex", 
      alignItems: "center", justifyContent: "center",
      boxShadow: "inset 0 4px 10px rgba(0,0,0,0.1), 0 2px 5px rgba(0,0,0,0.2)"
    }}>
      <div style={{
        width: "90%", height: "90%", 
        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, #aaa 4px, #aaa 8px)",
        borderRadius: 2, border: "1px solid #999"
      }} />
    </div>
  );

  return (
    <CalcShell label="IEC 61439" title={tl.title} subtitle={tl.subtitle} concept={tl.concept}>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 40 }}>
        
        {/* Top Controls Bar */}
        <div className="vinci-card no-print" style={{ padding: 16, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Panel Frame (XLTC / Rittal)
            </label>
            <select
              value={encId}
              onChange={(e) => setEncId(e.target.value)}
              style={{
                background: "var(--bg)", border: "1px solid var(--border)",
                color: "var(--fg)", padding: "8px 12px", borderRadius: 6,
                fontFamily: "var(--font-mono)", fontSize: 13, outline: "none", cursor: "pointer"
              }}
            >
              {ENCLOSURES.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ width: 1, height: 32, background: "var(--border)" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              View Mode
            </label>
            <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", padding: 4, borderRadius: 8, gap: 4 }}>
              <button
                onClick={() => setViewMode("inner")}
                style={{
                  background: viewMode === "inner" ? "var(--accent)" : "transparent",
                  color: viewMode === "inner" ? "#000" : "var(--fg)",
                  border: "none", padding: "6px 16px", borderRadius: 6,
                  fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: 8
                }}
              >
                <Minimize2 size={14} /> Inner Plate
              </button>
              <button
                onClick={() => setViewMode("outer")}
                style={{
                  background: viewMode === "outer" ? "var(--accent)" : "transparent",
                  color: viewMode === "outer" ? "#000" : "var(--fg)",
                  border: "none", padding: "6px 16px", borderRadius: 6,
                  fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: 8
                }}
              >
                <Box size={14} /> Outer Door
              </button>
            </div>
          </div>

          <div style={{ width: 1, height: 32, background: "var(--border)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input 
              type="checkbox" 
              id="fanToggle" 
              checked={includeFans} 
              onChange={(e) => setIncludeFans(e.target.checked)} 
              style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--accent)" }}
            />
            <label htmlFor="fanToggle" style={{ fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Wind size={16} /> Fan / Filters
            </label>
          </div>

          <div style={{ flex: 1 }} />

          <button
            onClick={() => window.print()}
            style={{
              background: "#10b981", color: "#fff", border: "none",
              padding: "10px 16px", borderRadius: 6, fontSize: 13, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
              boxShadow: "0 2px 4px rgba(16, 185, 129, 0.4)"
            }}
          >
            <Printer size={16} /> Export PDF
          </button>

        </div>

        {/* Editor Layout */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
          
          {/* Sidebar */}
          <div className="no-print" style={{ flex: "1 1 250px", minWidth: 250 }}>
            <div className="vinci-card" style={{ padding: 16, maxHeight: 650, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", margin: 0 }}>
                  Library
                </h3>
                <Filter size={14} color="var(--muted)" />
              </div>

              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                style={{
                  background: "var(--bg)", border: "1px solid var(--border)",
                  color: "var(--fg)", padding: "8px", borderRadius: 6,
                  fontFamily: "var(--font-mono)", fontSize: 13, outline: "none",
                  width: "100%", cursor: "pointer"
                }}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", paddingRight: 4 }}>
                {filteredLibrary.map((c) => (
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
                        cursor: "pointer", transition: "all 0.2s", flexShrink: 0
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "var(--accent)", e.currentTarget.style.color = "#000")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "var(--bg)", e.currentTarget.style.color = "var(--fg)")}
                      title={`Add ${c.partCode}`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Properties Panel for Wiring Components */}
            {selectedId && items.find(i => i.id === selectedId) && (
              <div className="vinci-card" style={{ marginTop: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent)" }}>
                  <Settings2 size={16} />
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Properties</span>
                </div>
                
                {(() => {
                  const selItem = items.find(i => i.id === selectedId)!;
                  const isWiring = selItem.comp.category === "Wiring";
                  
                  return (
                    <>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{selItem.comp.partCode}</div>
                      
                      {isWiring ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <label style={{ fontSize: 12, color: "var(--muted)" }}>Length Dimension (mm):</label>
                          <input 
                            type="number" 
                            min="10"
                            step="10"
                            value={selItem.w > selItem.h ? selItem.w : selItem.h}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 10;
                              setItems(prev => prev.map(i => {
                                if (i.id === selectedId) {
                                  if (i.w > i.h) return { ...i, w: val };
                                  return { ...i, h: val };
                                }
                                return i;
                              }));
                            }}
                            style={{
                              background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)",
                              color: "var(--fg)", padding: "8px", borderRadius: 4, fontFamily: "var(--font-mono)",
                              fontSize: 14, width: "100%", outline: "none"
                            }}
                          />
                          <span style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                            * Adjust DIN Rail / Duct length directly
                          </span>
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          Size: {selItem.w} x {selItem.h} mm
                        </div>
                      )}
                      
                      <button 
                        onClick={() => handleRemoveItem(selectedId)} 
                        style={{ 
                          marginTop: 8, background: "transparent", color: "#ef4444", 
                          border: "1px solid #ef4444", padding: "6px", borderRadius: 4, 
                          cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                        }}
                      >
                        <Trash2 size={14} /> Delete Component
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Canvas Area */}
          <div className="print-area" style={{ flex: "2 1 450px", display: "flex", justifyContent: "center", background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 32, border: "1px dashed var(--border)" }}>
            
            {/* INNER VIEW (Mounting Plate) */}
            {viewMode === "inner" && (
              <div
                ref={canvasRef}
                style={{
                  position: "relative", width: "100%", maxWidth: 500,
                  aspectRatio: `${activeEnc.w} / ${activeEnc.h}`,
                  background: "#fdfdfd", // Galvanized plate color
                  boxShadow: "0 10px 40px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,0,0,0.05)",
                  border: "2px solid #aaa", overflow: "hidden", touchAction: "none",
                  transition: "aspect-ratio 0.3s ease"
                }}
              >
                {/* Grid Background */}
                <div className="no-print" style={{
                  position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: "linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)",
                  backgroundSize: `${(50 / activeEnc.w) * 100}% ${(50 / activeEnc.h) * 100}%`,
                  opacity: 0.5, pointerEvents: "none"
                }} />

                {/* Items */}
                {items.map((item) => {
                  const wPct = (item.w / activeEnc.w) * 100;
                  const hPct = (item.h / activeEnc.h) * 100;
                  const xPct = (item.x / activeEnc.w) * 100;
                  const yPct = (item.y / activeEnc.h) * 100;
                  const isDragging = draggingId === item.id;
                  const isSelected = selectedId === item.id;

                  return (
                    <div
                      key={item.id}
                      onPointerDown={(e) => onPointerDown(e, item.id)}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      style={{
                        position: "absolute", left: `${xPct}%`, top: `${yPct}%`,
                        width: `${wPct}%`, height: `${hPct}%`,
                        boxShadow: isDragging ? "0 20px 30px rgba(0,0,0,0.5)" : (isSelected ? "0 0 0 2px var(--accent), 0 4px 8px rgba(0,0,0,0.3)" : "0 4px 8px rgba(0,0,0,0.3)"),
                        opacity: isDragging ? 0.85 : 1,
                        cursor: isDragging ? "grabbing" : "grab",
                        zIndex: isDragging ? 10 : (isSelected ? 5 : 1),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transform: isDragging ? "scale(1.02)" : "scale(1)",
                        transition: isDragging ? "none" : "box-shadow 0.2s, transform 0.2s, top 0.1s, left 0.1s"
                      }}
                    >
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: "hidden" }}>
                        {renderCADVisual(item.comp, item.w, item.h)}
                      </div>

                      <div style={{
                        position: "relative", zIndex: 1, color: "#000",
                        fontSize: "clamp(6px, 1vw, 10px)", fontWeight: 800, textAlign: "center",
                        fontFamily: "var(--font-mono)", textShadow: "0 0 3px #fff, 0 0 1px #fff",
                        padding: 2, pointerEvents: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%"
                      }}>
                        {item.comp.partCode}
                      </div>
                    </div>
                  );
                })}

                {/* Print Context Overlay */}
                <div style={{ display: "none", position: "absolute", bottom: 8, left: 8, right: 8, justifyContent: "space-between", color: "#000", fontSize: 12, fontFamily: "var(--font-mono)" }} className="print-footer">
                  <div><b>DUMMVINCI ESTIMATOR</b></div>
                  <div>Enclosure: {activeEnc.name} (Mounting Area: {activeEnc.w}x{activeEnc.h}mm)</div>
                </div>

              </div>
            )}

            {/* OUTER VIEW (Enclosure Box) */}
            {viewMode === "outer" && (
              <div
                style={{
                  position: "relative", width: "100%", maxWidth: 450,
                  aspectRatio: `${activeEnc.extW} / ${activeEnc.extH}`,
                  background: "linear-gradient(135deg, #e6e6e6 0%, #c0c0c0 100%)", // Metallic gradient
                  boxShadow: "0 25px 50px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.9), inset -2px -2px 5px rgba(0,0,0,0.2)",
                  borderRadius: 4, overflow: "hidden",
                  border: "2px solid #a0a0a0",
                  transition: "aspect-ratio 0.3s ease"
                }}
              >
                {/* Optional Plinth for Floorstand */}
                {activeEnc.extH >= 1700 && (
                   <div style={{
                     position: "absolute", bottom: 0, left: 0, right: 0, height: "8%",
                     background: "linear-gradient(to bottom, #444 0%, #222 100%)", 
                     borderTop: "3px solid #111",
                     boxShadow: "inset 0 4px 6px rgba(0,0,0,0.8)"
                   }} />
                )}

                {/* Door / Bevel */}
                <div style={{
                  position: "absolute", 
                  top: "1.5%", left: "1.5%", right: "1.5%", 
                  bottom: activeEnc.extH >= 1700 ? "9.5%" : "1.5%",
                  border: "2px solid rgba(0,0,0,0.2)", borderRadius: 2,
                  boxShadow: "inset 2px 2px 5px rgba(255,255,255,0.7), inset -2px -2px 5px rgba(0,0,0,0.3)",
                  background: "linear-gradient(135deg, #d8d8d8 0%, #b8b8b8 100%)",
                }}>
                  {/* Hinges (Left side) */}
                  <div style={{ position: "absolute", left: "-2px", top: "15%", width: "4px", height: "8%", background: "#888", borderRadius: 2, border: "1px solid #555" }} />
                  <div style={{ position: "absolute", left: "-2px", bottom: "15%", width: "4px", height: "8%", background: "#888", borderRadius: 2, border: "1px solid #555" }} />
                  {activeEnc.extH >= 1000 && (
                    <div style={{ position: "absolute", left: "-2px", top: "50%", transform: "translateY(-50%)", width: "4px", height: "8%", background: "#888", borderRadius: 2, border: "1px solid #555" }} />
                  )}

                  {/* Double Door Seam if width >= 1000 */}
                  {activeEnc.extW >= 1000 && (
                    <div style={{
                      position: "absolute", left: "50%", top: 0, bottom: 0, width: "2px",
                      background: "rgba(0,0,0,0.2)", boxShadow: "1px 0 0 rgba(255,255,255,0.6)"
                    }} />
                  )}

                  {/* Handle / Lock */}
                  <div style={{
                    position: "absolute", top: "50%", 
                    right: activeEnc.extW >= 1000 ? "51.5%" : "3%", 
                    width: activeEnc.extW >= 1000 ? "2%" : "4%", height: "12%",
                    background: "linear-gradient(to right, #333 0%, #111 100%)", 
                    transform: "translateY(-50%)", borderRadius: 3,
                    boxShadow: "2px 4px 6px rgba(0,0,0,0.5), inset 1px 1px 2px rgba(255,255,255,0.2)",
                    border: "1px solid #000"
                  }}>
                    {/* Keyhole */}
                    <div style={{
                      position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
                      width: "30%", height: "15%", background: "#000", borderRadius: "50%"
                    }} />
                  </div>

                  {/* Tent / Fort Fan Filters */}
                  {includeFans && (
                    <>
                      {/* Bottom Left (Intake) */}
                      <div style={{ position: "absolute", bottom: "8%", left: "8%", width: activeEnc.extW >= 800 ? "20%" : "25%" }}>
                        {renderFanFilter()}
                      </div>
                      {/* Top Right (Exhaust) */}
                      <div style={{ position: "absolute", top: "8%", right: activeEnc.extW >= 1000 ? "58%" : "8%", width: activeEnc.extW >= 800 ? "20%" : "25%" }}>
                        {renderFanFilter()}
                      </div>
                    </>
                  )}
                  
                  <div style={{
                    position: "absolute", top: "50%", left: activeEnc.extW >= 1000 ? "25%" : "50%", transform: "translate(-50%, -50%)",
                    color: "rgba(0,0,0,0.15)", fontSize: "clamp(16px, 4vw, 24px)", fontWeight: 800, fontFamily: "var(--font-display)",
                    textTransform: "uppercase", letterSpacing: "0.2em", pointerEvents: "none",
                    textShadow: "1px 1px 0px rgba(255,255,255,0.4)"
                  }}>
                    {activeEnc.extW}x{activeEnc.extH}
                  </div>
                </div>
                
                {/* Print Context Overlay */}
                <div style={{ display: "none", position: "absolute", bottom: -20, left: 0, right: 0, justifyContent: "space-between", color: "#000", fontSize: 12, fontFamily: "var(--font-mono)" }} className="print-footer">
                  <div><b>DUMMVINCI ESTIMATOR</b></div>
                  <div>Outer Dimension: {activeEnc.extW}x{activeEnc.extH}mm</div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          
          /* Show canvas area and force it to fill the page cleanly */
          .print-area, .print-area * { visibility: visible; }
          .print-area { 
            position: absolute; left: 0; top: 0; width: 100%; height: auto;
            margin: 0; padding: 0 !important; background: none !important; border: none !important; box-shadow: none !important; 
          }
          
          /* Hide non-printable elements */
          .no-print { display: none !important; }
          
          /* Show custom print footers */
          .print-footer { display: flex !important; }
        }
      `}} />
      <Footer />
    </CalcShell>
  );
}
