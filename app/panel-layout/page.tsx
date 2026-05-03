"use client";
import React, { useState, useRef, useEffect } from "react";
import CalcShell from "@/components/calc/CalcShell";
import Footer from "@/components/nav/Footer";
import { useLang } from "@/lib/i18n";
import { componentLibrary, ENCLOSURES, PanelComponent } from "@/lib/calc/panelLayoutData";
import { Plus, Trash2, Filter, Box, Minimize2, Printer, Settings2, Grid, Layers, MousePointer2 } from "lucide-react";

interface PlacedItem {
  id: string; // unique instance ID
  comp: PanelComponent;
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string; // used for custom nameplates
}

export default function PanelLayoutPage() {
  const { t } = useLang();
  const tl = t.panelLayout || { title: "Panel Layout", subtitle: "Estimator" };

  const [encId, setEncId] = useState(ENCLOSURES[0].id);
  const activeEnc = ENCLOSURES.find((e) => e.id === encId) || ENCLOSURES[0];

  const [items, setItems] = useState<PlacedItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  
  const [viewMode, setViewMode] = useState<"inner" | "outer" | "iso">("inner");
  const [snapToGrid, setSnapToGrid] = useState(true);
  
  // Iso 3D Rotation State
  const [isoRot, setIsoRot] = useState({ x: -15, y: -25 });
  const [isIsoDragging, setIsIsoDragging] = useState(false);
  const [isoDragStart, setIsoDragStart] = useState({ mouseX: 0, mouseY: 0, rotX: 0, rotY: 0 });
  
  // Selection & Grouping
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffsets, setDragOffsets] = useState<{ id: string; ox: number; oy: number }[]>([]);
  const [marquee, setMarquee] = useState<{ sx: number; sy: number; cx: number; cy: number } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Load from local storage on mount
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const savedItems = localStorage.getItem("dummvinci_estimator_items");
    const savedEnc = localStorage.getItem("dummvinci_estimator_enc");
    if (savedItems) {
      try { setItems(JSON.parse(savedItems)); } catch (e) {}
    }
    if (savedEnc && ENCLOSURES.some(e => e.id === savedEnc)) {
      setEncId(savedEnc);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("dummvinci_estimator_items", JSON.stringify(items));
      localStorage.setItem("dummvinci_estimator_enc", encId);
    }
  }, [items, encId, isLoaded]);

  const categories = ["All", ...Array.from(new Set(componentLibrary.map((c) => c.category)))];
  const filteredLibrary = activeCategory === "All" 
    ? componentLibrary 
    : componentLibrary.filter((c) => c.category === activeCategory);

  const handleAddComponent = (comp: PanelComponent) => {
    let startX = 20;
    let startY = 20;
    const gap = 15; // 15mm human-readable gap
    const gridStep = 25;

    const isOuter = ["Door Accessory", "Meter", "Label", "Logo", "Cooling"].includes(comp.category);
    const boundsW = isOuter ? activeEnc.extW : activeEnc.w;
    const boundsH = isOuter ? activeEnc.extH : activeEnc.h;

    // Smart placement: next to last selected item OR last added item
    const referenceItem = items.find(i => selectedIds.includes(i.id)) || items[items.length - 1];

    if (referenceItem) {
      startX = referenceItem.x + referenceItem.w + gap;
      startY = referenceItem.y;
      if (startX + comp.width > boundsW) {
        startX = 20; 
        startY = referenceItem.y + referenceItem.h + gap;
      }
      if (startY + comp.height > boundsH) {
         startX = 20;
         startY = 20;
      }
    }

    if (snapToGrid) {
       startX = Math.round(startX / gridStep) * gridStep;
       startY = Math.round(startY / gridStep) * gridStep;
    }

    const newItem: PlacedItem = {
      id: Math.random().toString(36).substring(2, 9),
      comp, x: startX, y: startY, w: comp.width, h: comp.height,
      label: comp.category === "Label" ? "PANEL NAME" : undefined
    };
    
    setItems((prev) => [...prev, newItem]);
    setSelectedIds([newItem.id]);
    setViewMode(isOuter ? "outer" : "inner");
  };

  const handleRemoveItems = (ids: string[]) => {
    setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
    setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
  };

  const clearAllItems = () => {
    if (confirm("Are you sure you want to clear the entire layout?")) {
      setItems([]);
      setSelectedIds([]);
    }
  };

  const onCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || viewMode === "iso") return;
    
    // Only start marquee if clicking directly on the canvas background
    if (e.target === e.currentTarget) {
       e.currentTarget.setPointerCapture(e.pointerId);
       
       const currentW = viewMode === "outer" ? activeEnc.extW : activeEnc.w;
       const rect = canvasRef.current!.getBoundingClientRect();
       const scale = rect.width / currentW;
       const mouseX = (e.clientX - rect.left) / scale;
       const mouseY = (e.clientY - rect.top) / scale;

       setMarquee({ sx: mouseX, sy: mouseY, cx: mouseX, cy: mouseY });
       setSelectedIds([]);
    }
  };

  const onItemPointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    if (e.button !== 0 || viewMode === "iso") return;
    e.stopPropagation();
    
    if (canvasRef.current) canvasRef.current.setPointerCapture(e.pointerId);
    
    let newSelection = selectedIds;
    // If holding Shift, add to selection. Otherwise, if not in selection, select only this.
    if (e.shiftKey) {
      if (!selectedIds.includes(id)) newSelection = [...selectedIds, id];
    } else {
      if (!selectedIds.includes(id)) newSelection = [id];
    }
    setSelectedIds(newSelection);
    
    const currentW = viewMode === "outer" ? activeEnc.extW : activeEnc.w;
    const rect = canvasRef.current!.getBoundingClientRect();
    const scale = rect.width / currentW;
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    const offsets = newSelection.map(selId => {
       const it = items.find(i => i.id === selId);
       return { id: selId, ox: mouseX - (it ? it.x : 0), oy: mouseY - (it ? it.y : 0) };
    });
    setDragOffsets(offsets);
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canvasRef.current || viewMode === "iso") return;
    
    const currentW = viewMode === "outer" ? activeEnc.extW : activeEnc.w;
    const currentH = viewMode === "outer" ? activeEnc.extH : activeEnc.h;
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = rect.width / currentW;
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    if (marquee) {
       setMarquee(prev => prev ? { ...prev, cx: mouseX, cy: mouseY } : null);
       
       const left = Math.min(marquee.sx, mouseX);
       const right = Math.max(marquee.sx, mouseX);
       const top = Math.min(marquee.sy, mouseY);
       const bottom = Math.max(marquee.sy, mouseY);

       const intersectingIds = items.filter(it => {
         const isOuter = ["Door Accessory", "Meter", "Label", "Logo", "Cooling"].includes(it.comp.category);
         if (viewMode === "inner" && isOuter) return false;
         if (viewMode === "outer" && !isOuter) return false;

         const itRight = it.x + it.w;
         const itBottom = it.y + it.h;
         return !(it.x > right || itRight < left || it.y > bottom || itBottom < top);
       }).map(it => it.id);

       setSelectedIds(intersectingIds);
       return;
    }

    if (isDragging) {
      setItems(prev => {
        const next = [...prev];
        dragOffsets.forEach(off => {
           const itIndex = next.findIndex(i => i.id === off.id);
           if (itIndex > -1) {
              const it = next[itIndex];
              let newX = mouseX - off.ox;
              let newY = mouseY - off.oy;

              if (snapToGrid) {
                 newX = Math.round(newX / 25) * 25;
                 newY = Math.round(newY / 25) * 25;
              }

              if (newX < 0) newX = 0;
              if (newY < 0) newY = 0;
              if (newX + it.w > currentW) newX = currentW - it.w;
              if (newY + it.h > currentH) newY = currentH - it.h;

              next[itIndex] = { ...it, x: newX, y: newY };
           }
        });
        return next;
      });
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (marquee) setMarquee(null);
    if (isDragging) setIsDragging(false);
    if (canvasRef.current && canvasRef.current.hasPointerCapture(e.pointerId)) {
       canvasRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const onIsoPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsIsoDragging(true);
    setIsoDragStart({ mouseX: e.clientX, mouseY: e.clientY, rotX: isoRot.x, rotY: isoRot.y });
  };

  const onIsoPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isIsoDragging) return;
    const deltaX = e.clientX - isoDragStart.mouseX;
    const deltaY = e.clientY - isoDragStart.mouseY;
    setIsoRot({
      x: isoDragStart.rotX - deltaY * 0.5,
      y: isoDragStart.rotY + deltaX * 0.5
    });
  };

  const onIsoPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsIsoDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const renderFanFilter = () => (
    <div style={{
      width: "100%", height: "100%", background: "#dcdcdc", 
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

  const renderCADVisual = (item: PlacedItem) => {
    const { comp, w, h, label } = item;
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
      case "Cooling":
        return renderFanFilter();
      case "Door Accessory":
        const isEstop = comp.partCode.includes("E-Stop");
        const isSelector = comp.partCode.includes("Selector");
        return (
           <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#d4d4d4", borderRadius: w === h ? "50%" : 4, border: "2px solid #a0a0a0", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
              <div style={{ width: "70%", height: "70%", background: comp.color, borderRadius: isEstop ? "10%" : "50%", border: "1px solid rgba(0,0,0,0.2)", boxShadow: "inset 0 4px 6px rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                 {isSelector && <div style={{ width: "20%", height: "80%", background: "#fff", borderRadius: 2 }} />}
              </div>
           </div>
        );
      case "Meter":
        const isDigital = comp.partCode.includes("Digital");
        return (
           <div style={{ width: "100%", height: "100%", background: comp.color, border: "2px solid #444", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "10%", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.2)" }}>
              {isDigital ? (
                <div style={{ background: "#111", padding: "4%", borderRadius: 2, color: "#f00", fontFamily: "var(--font-mono)", fontSize: "clamp(8px, 2vw, 16px)", fontWeight: 800 }}>000.0</div>
              ) : (
                <>
                  <div style={{ width: "60%", height: "30%", borderTop: "2px solid #111", borderTopLeftRadius: "50%", borderTopRightRadius: "50%", position: "relative" }}>
                     <div style={{ position: "absolute", bottom: 0, left: "10%", width: "2px", height: "120%", background: "#f00", transform: "rotate(30deg)", transformOrigin: "bottom" }} />
                  </div>
                  <div style={{ fontSize: "clamp(4px, 1vw, 10px)", color: "#111", fontWeight: 700 }}>A</div>
                </>
              )}
           </div>
        );
      case "Label":
        return (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(to bottom, #e0e0e0, #c0c0c0)", border: "1px solid #777", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 2, boxShadow: "inset 0 1px 2px #fff, 0 2px 4px rgba(0,0,0,0.2)", overflow: "hidden" }}>
             <span style={{ fontSize: "clamp(8px, 1.5vw, 14px)", fontWeight: 800, color: "#111", textTransform: "uppercase", textAlign: "center", padding: "0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
               {label || "LABEL"}
             </span>
          </div>
        );
      case "Logo":
        let imgUrl = "";
        if (comp.brand === "ABB") imgUrl = "https://upload.wikimedia.org/wikipedia/commons/0/00/ABB_logo.svg";
        else if (comp.brand === "Siemens") imgUrl = "https://upload.wikimedia.org/wikipedia/commons/5/5f/Siemens-logo.svg";
        else if (comp.brand === "PTTS") {
           return (
             <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #1d4ed8", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                <span style={{ color: "#1d4ed8", fontWeight: 900, fontSize: "clamp(8px, 2.5vw, 24px)", fontFamily: "var(--font-display)" }}>PTTS</span>
             </div>
           );
        }

        if (imgUrl) {
           return (
             <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", borderRadius: 2, padding: "5%" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgUrl} alt={comp.brand} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
             </div>
           );
        }

        return (
          <div style={{ width: "100%", height: "100%", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <span style={{ fontSize: "clamp(12px, 3vw, 32px)", fontWeight: 900, color: comp.color, letterSpacing: "0.05em", fontFamily: "var(--font-display)", textShadow: "1px 1px 0 #fff" }}>
               {comp.brand === "DummVinci" ? "By DummVinci" : comp.brand}
             </span>
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

  if (!isLoaded) return null;

  const currentViewW = viewMode === "outer" ? activeEnc.extW : activeEnc.w;
  const currentViewH = viewMode === "outer" ? activeEnc.extH : activeEnc.h;

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
              <button
                onClick={() => setViewMode("iso")}
                style={{
                  background: viewMode === "iso" ? "var(--accent)" : "transparent",
                  color: viewMode === "iso" ? "#000" : "var(--fg)",
                  border: "none", padding: "6px 16px", borderRadius: 6,
                  fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: 8
                }}
              >
                <Layers size={14} /> Isometric
              </button>
            </div>
          </div>

          <div style={{ width: 1, height: 32, background: "var(--border)" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input 
                type="checkbox" 
                id="snapToggle" 
                checked={snapToGrid} 
                onChange={(e) => setSnapToGrid(e.target.checked)} 
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--accent)" }}
              />
              <label htmlFor="snapToggle" style={{ fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Grid size={16} /> Snap to Grid (25mm)
              </label>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={clearAllItems}
              style={{
                background: "transparent", color: "var(--muted)", border: "1px solid var(--border)",
                padding: "10px 16px", borderRadius: 6, fontSize: 13, fontWeight: 700,
                display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#ef4444"; }}
              onMouseOut={(e) => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              Clear Layout
            </button>
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

            {/* Properties Panel */}
            {selectedIds.length > 0 && (
              <div className="vinci-card" style={{ marginTop: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent)" }}>
                  <Settings2 size={16} />
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Properties</span>
                </div>
                
                {selectedIds.length === 1 && (() => {
                  const selItem = items.find(i => i.id === selectedIds[0]);
                  if (!selItem) return null;

                  const isWiring = selItem.comp.category === "Wiring";
                  const isLabel = selItem.comp.category === "Label";
                  const isLogo = selItem.comp.category === "Logo";
                  
                  return (
                    <>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{selItem.comp.partCode}</div>
                      
                      {isLabel && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <label style={{ fontSize: 12, color: "var(--muted)" }}>Nameplate Text:</label>
                          <input 
                            type="text" 
                            value={selItem.label || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setItems(prev => prev.map(i => i.id === selItem.id ? { ...i, label: val } : i));
                            }}
                            style={{
                              background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)",
                              color: "var(--fg)", padding: "8px", borderRadius: 4, fontFamily: "var(--font-mono)",
                              fontSize: 14, width: "100%", outline: "none"
                            }}
                          />
                        </div>
                      )}

                      {(isWiring || isLabel || isLogo) ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                            <label style={{ fontSize: 12, color: "var(--muted)" }}>Width (mm):</label>
                            <input 
                              type="number" min="10" step="10" value={selItem.w}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 10;
                                setItems(prev => prev.map(i => i.id === selItem.id ? { ...i, w: val } : i));
                              }}
                              style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", color: "var(--fg)", padding: "8px", borderRadius: 4, width: "100%", outline: "none" }}
                            />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                            <label style={{ fontSize: 12, color: "var(--muted)" }}>Height (mm):</label>
                            <input 
                              type="number" min="10" step="10" value={selItem.h}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 10;
                                setItems(prev => prev.map(i => i.id === selItem.id ? { ...i, h: val } : i));
                              }}
                              style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", color: "var(--fg)", padding: "8px", borderRadius: 4, width: "100%", outline: "none" }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          Size: {selItem.w} x {selItem.h} mm
                        </div>
                      )}
                      
                      <button 
                        onClick={() => handleRemoveItems([selItem.id])} 
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

                {selectedIds.length > 1 && (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      <MousePointer2 size={16} /> {selectedIds.length} Items Selected
                    </div>
                    <button 
                      onClick={() => handleRemoveItems(selectedIds)} 
                      style={{ 
                        marginTop: 8, background: "transparent", color: "#ef4444", 
                        border: "1px solid #ef4444", padding: "6px", borderRadius: 4, 
                        cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                      }}
                    >
                      <Trash2 size={14} /> Delete Selection Group
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Canvas Area */}
          <div className="print-area" style={{ flex: "2 1 450px", display: "flex", justifyContent: "center", background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 32, border: "1px dashed var(--border)" }}>
            
            {/* INNER VIEW (Mounting Plate) */}
            {viewMode === "inner" && (
              <div
                ref={canvasRef}
                onPointerDown={onCanvasPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                style={{
                  position: "relative", width: "100%", maxWidth: 500,
                  aspectRatio: `${activeEnc.w} / ${activeEnc.h}`,
                  background: "#fdfdfd", // Galvanized plate color
                  boxShadow: "0 10px 40px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,0,0,0.05)",
                  border: "2px solid #aaa", overflow: "hidden", touchAction: "none",
                  transition: "aspect-ratio 0.3s ease", cursor: "crosshair"
                }}
              >
                {/* Grid Background */}
                <div className="no-print" style={{
                  position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: "linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)",
                  backgroundSize: `${(50 / activeEnc.w) * 100}% ${(50 / activeEnc.h) * 100}%`,
                  opacity: 0.5, pointerEvents: "none"
                }} />

                {/* Marquee Selection Box */}
                {marquee && (
                   <div style={{
                     position: "absolute",
                     left: `${(Math.min(marquee.sx, marquee.cx) / currentViewW) * 100}%`,
                     top: `${(Math.min(marquee.sy, marquee.cy) / currentViewH) * 100}%`,
                     width: `${(Math.abs(marquee.cx - marquee.sx) / currentViewW) * 100}%`,
                     height: `${(Math.abs(marquee.cy - marquee.sy) / currentViewH) * 100}%`,
                     background: "rgba(16, 185, 129, 0.2)",
                     border: "1px dashed #10b981",
                     pointerEvents: "none", zIndex: 100
                   }} />
                )}

                {/* Items */}
                {items.map((item) => {
                  const wPct = (item.w / activeEnc.w) * 100;
                  const hPct = (item.h / activeEnc.h) * 100;
                  const xPct = (item.x / activeEnc.w) * 100;
                  const yPct = (item.y / activeEnc.h) * 100;
                  const isSelected = selectedIds.includes(item.id);
                  const isItemDragging = isDragging && isSelected;

                  // Only show internal components
                  if (["Door Accessory", "Meter", "Label", "Logo", "Cooling"].includes(item.comp.category)) {
                     return null; 
                  }

                  return (
                    <div
                      key={item.id}
                      onPointerDown={(e) => onItemPointerDown(e, item.id)}
                      style={{
                        position: "absolute", left: `${xPct}%`, top: `${yPct}%`,
                        width: `${wPct}%`, height: `${hPct}%`,
                        boxShadow: isItemDragging ? "0 20px 30px rgba(0,0,0,0.5)" : (isSelected ? "0 0 0 2px var(--accent), 0 4px 8px rgba(0,0,0,0.3)" : "0 4px 8px rgba(0,0,0,0.3)"),
                        opacity: isItemDragging ? 0.85 : 1,
                        cursor: isItemDragging ? "grabbing" : "grab",
                        zIndex: isItemDragging ? 10 : (isSelected ? 5 : 1),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transform: isItemDragging ? "scale(1.02)" : "scale(1)",
                        transition: isItemDragging ? "none" : "box-shadow 0.2s, transform 0.2s, top 0.1s, left 0.1s"
                      }}
                    >
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
                        {renderCADVisual(item)}
                      </div>
                      
                      {item.comp.category !== "Cooling" && (
                        <div style={{
                          position: "relative", zIndex: 1, color: "#000",
                          fontSize: "clamp(6px, 1vw, 10px)", fontWeight: 800, textAlign: "center",
                          fontFamily: "var(--font-mono)", textShadow: "0 0 3px #fff, 0 0 1px #fff",
                          padding: 2, pointerEvents: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%"
                        }}>
                          {item.comp.partCode}
                        </div>
                      )}
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
                ref={canvasRef}
                onPointerDown={onCanvasPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                style={{
                  position: "relative", width: "100%", maxWidth: 450,
                  aspectRatio: `${activeEnc.extW} / ${activeEnc.extH}`,
                  background: "linear-gradient(135deg, #e6e6e6 0%, #c0c0c0 100%)", // Metallic gradient
                  boxShadow: "0 25px 50px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.9), inset -2px -2px 5px rgba(0,0,0,0.2)",
                  borderRadius: 4, overflow: "hidden", touchAction: "none",
                  border: "2px solid #a0a0a0",
                  transition: "aspect-ratio 0.3s ease", cursor: "crosshair"
                }}
              >
                {/* Optional Plinth for Floorstand */}
                {activeEnc.extH >= 1700 && (
                   <div style={{
                     position: "absolute", bottom: 0, left: 0, right: 0, height: "8%",
                     background: "linear-gradient(to bottom, #444 0%, #222 100%)", 
                     borderTop: "3px solid #111",
                     boxShadow: "inset 0 4px 6px rgba(0,0,0,0.8)", pointerEvents: "none"
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
                  pointerEvents: "none"
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
                    <div style={{
                      position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
                      width: "30%", height: "15%", background: "#000", borderRadius: "50%"
                    }} />
                  </div>
                  
                  <div style={{
                    position: "absolute", top: "50%", left: activeEnc.extW >= 1000 ? "25%" : "50%", transform: "translate(-50%, -50%)",
                    color: "rgba(0,0,0,0.15)", fontSize: "clamp(16px, 4vw, 24px)", fontWeight: 800, fontFamily: "var(--font-display)",
                    textTransform: "uppercase", letterSpacing: "0.2em", pointerEvents: "none",
                    textShadow: "1px 1px 0px rgba(255,255,255,0.4)"
                  }}>
                    {activeEnc.extW}x{activeEnc.extH}
                  </div>
                </div>

                {/* Marquee Selection Box */}
                {marquee && (
                   <div style={{
                     position: "absolute",
                     left: `${(Math.min(marquee.sx, marquee.cx) / currentViewW) * 100}%`,
                     top: `${(Math.min(marquee.sy, marquee.cy) / currentViewH) * 100}%`,
                     width: `${(Math.abs(marquee.cx - marquee.sx) / currentViewW) * 100}%`,
                     height: `${(Math.abs(marquee.cy - marquee.sy) / currentViewH) * 100}%`,
                     background: "rgba(16, 185, 129, 0.2)",
                     border: "1px dashed #10b981",
                     pointerEvents: "none", zIndex: 100
                   }} />
                )}

                {/* Items on Outer Door */}
                {items.map((item) => {
                  const wPct = (item.w / activeEnc.extW) * 100;
                  const hPct = (item.h / activeEnc.extH) * 100;
                  const xPct = (item.x / activeEnc.extW) * 100;
                  const yPct = (item.y / activeEnc.extH) * 100;
                  const isSelected = selectedIds.includes(item.id);
                  const isItemDragging = isDragging && isSelected;

                  // Only show external components
                  if (!["Door Accessory", "Meter", "Label", "Logo", "Cooling"].includes(item.comp.category)) {
                     return null; 
                  }

                  return (
                    <div
                      key={item.id}
                      onPointerDown={(e) => onItemPointerDown(e, item.id)}
                      style={{
                        position: "absolute", left: `${xPct}%`, top: `${yPct}%`,
                        width: `${wPct}%`, height: `${hPct}%`,
                        boxShadow: isItemDragging ? "0 20px 30px rgba(0,0,0,0.5)" : (isSelected ? "0 0 0 2px var(--accent), 0 4px 8px rgba(0,0,0,0.3)" : "none"),
                        opacity: isItemDragging ? 0.85 : 1,
                        cursor: isItemDragging ? "grabbing" : "grab",
                        zIndex: isItemDragging ? 10 : (isSelected ? 5 : 2),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transform: isItemDragging ? "scale(1.02)" : "scale(1)",
                        transition: isItemDragging ? "none" : "box-shadow 0.2s, transform 0.2s, top 0.1s, left 0.1s"
                      }}
                    >
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
                        {renderCADVisual(item)}
                      </div>
                    </div>
                  );
                })}
                
                {/* Print Context Overlay */}
                <div style={{ display: "none", position: "absolute", bottom: -20, left: 0, right: 0, justifyContent: "space-between", color: "#000", fontSize: 12, fontFamily: "var(--font-mono)" }} className="print-footer">
                  <div><b>DUMMVINCI ESTIMATOR</b></div>
                  <div>Outer Dimension: {activeEnc.extW}x{activeEnc.extH}mm</div>
                </div>

              </div>
            )}

            {/* ISOMETRIC 3D VIEW */}
            {viewMode === "iso" && (() => {
              const baseScale = activeEnc.extH >= 1700 ? 300 / activeEnc.extH : 400 / activeEnc.extH;
              const pxW = activeEnc.extW * baseScale;
              const pxH = activeEnc.extH * baseScale;
              const pxD = (activeEnc.extD || 200) * baseScale;

              return (
              <div
                onPointerDown={onIsoPointerDown}
                onPointerMove={onIsoPointerMove}
                onPointerUp={onIsoPointerUp}
                style={{
                  position: "relative", width: "100%", height: 600,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  perspective: 1500, cursor: isIsoDragging ? "grabbing" : "grab",
                  background: "radial-gradient(circle at center, #444 0%, #111 100%)",
                  borderRadius: 12, border: "2px solid #555", overflow: "hidden",
                  boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)"
                }}
              >
                <div style={{ position: "absolute", top: 16, right: 16, color: "#aaa", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                  Hint: Drag to rotate
                </div>
                
                <div style={{
                  position: "relative", width: pxW, height: pxH,
                  transformStyle: "preserve-3d",
                  transform: `rotateX(${isoRot.x}deg) rotateY(${isoRot.y}deg)`,
                  transition: isIsoDragging ? "none" : "transform 0.1s ease"
                }}>
                  
                  {/* Left Face */}
                  <div style={{
                    position: "absolute", width: pxD, height: pxH, background: "linear-gradient(to right, #666, #999)",
                    border: "1px solid #444", transform: `rotateY(-90deg) translateZ(${pxW / 2}px)`
                  }} />

                  {/* Right Face */}
                  <div style={{
                    position: "absolute", width: pxD, height: pxH, background: "linear-gradient(to right, #999, #777)",
                    border: "1px solid #444", transform: `rotateY(90deg) translateZ(${pxW / 2}px)`
                  }} />

                  {/* Top Face */}
                  <div style={{
                    position: "absolute", width: pxW, height: pxD, background: "#ccc",
                    border: "1px solid #444", transform: `rotateX(90deg) translateZ(${pxH / 2}px)`
                  }} />

                  {/* Bottom Face */}
                  <div style={{
                    position: "absolute", width: pxW, height: pxD, background: "#444",
                    border: "1px solid #222", transform: `rotateX(-90deg) translateZ(${pxH / 2}px)`
                  }} />

                  {/* Back Face */}
                  <div style={{
                    position: "absolute", width: pxW, height: pxH, background: "#777",
                    border: "1px solid #444", transform: `translateZ(-${pxD / 2}px) rotateY(180deg)`
                  }} />

                  {/* Front Door (Solid) */}
                  <div style={{
                    position: "absolute", width: pxW, height: pxH, 
                    background: "linear-gradient(135deg, #d8d8d8 0%, #a8a8a8 100%)",
                    border: "2px solid #666", transform: `translateZ(${pxD / 2}px)`,
                    boxShadow: "inset 0 0 10px rgba(0,0,0,0.1)"
                  }}>
                    {/* Double Door Seam if width >= 1000 */}
                    {activeEnc.extW >= 1000 && (
                      <div style={{
                        position: "absolute", left: "50%", top: 0, bottom: 0, width: "2px",
                        background: "rgba(0,0,0,0.2)", boxShadow: "1px 0 0 rgba(255,255,255,0.6)"
                      }} />
                    )}

                    {/* Render Outer Door Items */}
                    {items.filter(i => ["Door Accessory", "Meter", "Label", "Logo", "Cooling"].includes(i.comp.category)).map(item => {
                      const wPct = (item.w / activeEnc.extW) * 100;
                      const hPct = (item.h / activeEnc.extH) * 100;
                      const xPct = (item.x / activeEnc.extW) * 100;
                      const yPct = (item.y / activeEnc.extH) * 100;
                      return (
                        <div key={item.id} style={{ position: "absolute", left: `${xPct}%`, top: `${yPct}%`, width: `${wPct}%`, height: `${hPct}%`, pointerEvents: "none" }}>
                          {renderCADVisual(item)}
                        </div>
                      )
                    })}
                  </div>

                  {/* Plinth for Floorstand */}
                  {activeEnc.extH >= 1700 && (
                    <div style={{
                      position: "absolute", width: pxW, height: 30, background: "#333",
                      border: "1px solid #111", transform: `translateY(${pxH}px) translateZ(${pxD / 2 - 15}px)`
                    }} />
                  )}
                  {activeEnc.extH >= 1700 && (
                    <div style={{
                      position: "absolute", width: pxW, height: 30, background: "#222",
                      border: "1px solid #111", transform: `translateY(${pxH}px) translateZ(-${pxD / 2 - 15}px)`
                    }} />
                  )}
                  {activeEnc.extH >= 1700 && (
                    <div style={{
                      position: "absolute", width: pxD, height: 30, background: "#2a2a2a",
                      border: "1px solid #111", transform: `translateY(${pxH}px) rotateY(-90deg) translateZ(${pxW / 2}px)`
                    }} />
                  )}
                  {activeEnc.extH >= 1700 && (
                    <div style={{
                      position: "absolute", width: pxD, height: 30, background: "#2a2a2a",
                      border: "1px solid #111", transform: `translateY(${pxH}px) rotateY(90deg) translateZ(${pxW / 2}px)`
                    }} />
                  )}

                </div>
              </div>
              );
            })()}

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
