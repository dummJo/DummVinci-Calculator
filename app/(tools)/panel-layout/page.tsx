"use client";
import React, { useState, useRef, useEffect, useMemo, useSyncExternalStore } from "react";
import CalcShell from "@/components/calc/CalcShell";
import Footer from "@/components/nav/Footer";
import { useLang } from "@/lib/i18n";
import { componentLibrary, ENCLOSURES, PanelComponent } from "@/lib/calc/panelLayoutData";
import { Plus, Trash2, Search, Box, Minimize2, Maximize2, Printer, FileText, Settings2, Grid, Layers, MousePointer2, Copy, Activity, ChevronLeft } from "lucide-react";

interface PlacedItem {
  id: string; // unique instance ID
  comp: PanelComponent;
  x: number; // local x in panel
  y: number; // local y in panel
  w: number; // actual width in mm
  h: number; // actual height in mm
  label?: string; // custom designation (e.g. Q1, VSD1)
  wx?: number; // wiring diagram X
  wy?: number; // wiring diagram Y
}

/** Stable category list for library sidebar (componentLibrary is static). */
const PANEL_COMPONENT_CATEGORIES = ["All", ...Array.from(new Set(componentLibrary.map((c) => c.category)))];

function designationPrefix(cat: string): string {
  if (cat === "MCCB" || cat === "MCB") return "Q";
  if (cat === "VSD") return "U";
  if (cat === "Contactor") return "KM";
  if (cat === "Transformer") return "T";
  if (cat === "PLC") return "K";
  if (cat === "Terminal Block") return "X";
  if (cat === "Cooling") return "M";
  if (cat === "Meter") return "P";
  return "K";
}

function generatePanelItemTag(category: string, currentItems: PlacedItem[]): string {
  const prefix = designationPrefix(category);
  const count = currentItems.filter((i) => designationPrefix(i.comp.category) === prefix).length;
  return `${prefix}${count + 1}`;
}

// ─── Print Header (extracted outside component body per react-hooks/static-components) ────
function PrintHeader({ projectName, customerName }: { projectName: string; customerName: string }) {
  return (
    <div className="print-header" style={{ display: "none" }}>
      <div className="print-header-left">
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#1d4ed8", letterSpacing: "-0.02em" }}>DUMMVINCI INDUSTRIAL ESTIMATOR</h1>
        <p style={{ margin: 0, fontSize: 14, color: "#444", fontWeight: 700 }}>IEC 61439 | Technical Layout Proposal</p>
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
           <div style={{ display: "flex", flexDirection: "column" }}>
             <span style={{ fontSize: 9, color: "#888", textTransform: "uppercase" }}>Date</span>
             <span style={{ fontSize: 11, fontWeight: 700, color: "#111" }}>{new Date().toLocaleDateString('en-GB')}</span>
           </div>
           <div style={{ display: "flex", flexDirection: "column" }}>
             <span style={{ fontSize: 9, color: "#888", textTransform: "uppercase" }}>Project Reference</span>
             <span style={{ fontSize: 11, fontWeight: 700, color: "#111" }}>{projectName}</span>
           </div>
           <div style={{ display: "flex", flexDirection: "column" }}>
             <span style={{ fontSize: 9, color: "#888", textTransform: "uppercase" }}>Customer</span>
             <span style={{ fontSize: 11, fontWeight: 700, color: "#111" }}>{customerName}</span>
           </div>
        </div>
      </div>
      <div className="print-header-right">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src="https://www.ptts.co.id/uploads/1/3/3/7/133745061/logo-web_orig.png" alt="PTTS" style={{ height: 48 }} />
           <div style={{ width: 1, height: 40, background: "#ddd" }} />
           <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: "#000", lineHeight: 1 }}>By DummVinci</span>
              <span style={{ fontSize: 8, color: "#888", textAlign: "right" }}>ABB Value Partner</span>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function PanelLayoutPage() {
  const { t } = useLang();
  const tl = t.panelLayout || { title: "Panel Layout", subtitle: "Estimator" };

  const [encId, setEncId] = useState(() => {
    if (typeof window === "undefined") return ENCLOSURES[0].id;
    const saved = localStorage.getItem("dummvinci_estimator_enc");
    return saved && ENCLOSURES.some(e => e.id === saved) ? saved : ENCLOSURES[0].id;
  });
  const activeEnc = useMemo(
    () => ENCLOSURES.find((e) => e.id === encId) || ENCLOSURES[0],
    [encId],
  );

  const [items, setItems] = useState<PlacedItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("dummvinci_estimator_items");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [viewMode, setViewMode] = useState<"inner" | "outer" | "sld">("inner");
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(false);
  
  const [projectName, setProjectName] = useState("DummVinci Industrial Case");
  const [customerName, setCustomerName] = useState("PT Prima Tekindo Tirta Sejahtera");

  // Drawing Metadata (IEC standard) — hydrated from localStorage
  const savedMeta = typeof window !== "undefined" ? (() => {
    try { const raw = localStorage.getItem("dummvinci_estimator_meta"); return raw ? JSON.parse(raw) : null; } catch { return null; }
  })() : null;
  const [drawnBy, setDrawnBy] = useState(savedMeta?.drawnBy ?? "");
  const [checkedBy, setCheckedBy] = useState(savedMeta?.checkedBy ?? "");
  const [approvedBy, setApprovedBy] = useState(savedMeta?.approvedBy ?? "");
  const [revNo] = useState(savedMeta?.revNo ?? "01");
  const [revDate] = useState(savedMeta?.revDate ?? new Date().toLocaleDateString());
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  
  // Selection & Grouping
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffsets, setDragOffsets] = useState<{ id: string; ox: number; oy: number }[]>([]);
  const [marquee, setMarquee] = useState<{ sx: number; sy: number; cx: number; cy: number } | null>(null);

  // Clipboard
  const [clipboard, setClipboard] = useState<PlacedItem[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showFocusLibrary, setShowFocusLibrary] = useState(false);
  const sldRef = useRef<HTMLDivElement>(null);
  /** Monotonic IDs for placed components (avoids impure Math.random in handlers flagged by react-hooks/purity). */
  const placedItemIdSeq = useRef(0);
  const allocPlacedId = () => {
    placedItemIdSeq.current += 1;
    return `pl-${placedItemIdSeq.current}`;
  };

  const toggleFullScreen = () => {
    if (!sldRef.current) return;
    if (!document.fullscreenElement) {
      sldRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const [exportSettings, setExportSettings] = useState({
    paperSize: "A4",
    orientation: "landscape",
    isColor: true
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Hydration flag — localStorage already read via lazy initializers above
  // Hydration flag — localStorage already read via lazy initializers above
  const isLoaded = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );


  // Save to local storage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("dummvinci_estimator_items", JSON.stringify(items));
      localStorage.setItem("dummvinci_estimator_enc", encId);
      localStorage.setItem("dummvinci_estimator_meta", JSON.stringify({ drawnBy, checkedBy, approvedBy, revNo, revDate }));
    }
  }, [items, encId, drawnBy, checkedBy, approvedBy, revNo, revDate, isLoaded]);

  // --- Keyboard Shortcuts (AutoCAD Feel) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input box
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "SELECT") return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Delete / Backspace
      if (e.key === "Delete" || e.key === "Backspace") {
         if (selectedIds.length > 0) {
            e.preventDefault();
            setItems(prev => prev.filter(i => !selectedIds.includes(i.id)));
            setSelectedIds([]);
         }
      }

      // Escape to deselect
      if (e.key === "Escape") {
         e.preventDefault();
         setSelectedIds([]);
         setMarquee(null);
      }

      // Ctrl+C (Copy)
      if (cmdOrCtrl && e.key.toLowerCase() === "c") {
         const selected = items.filter(i => selectedIds.includes(i.id));
         if (selected.length > 0) {
            e.preventDefault();
            setClipboard(selected);
         }
      }

      // Ctrl+V (Paste)
      if (cmdOrCtrl && e.key.toLowerCase() === "v") {
         if (clipboard.length > 0) {
            e.preventDefault();
            const newIds: string[] = [];
            const newItems = clipboard.map(item => {
               const newId = allocPlacedId();
               newIds.push(newId);
               return { ...item, id: newId, x: item.x + 25, y: item.y + 25 }; // Offset paste 25mm
            });
            setItems(prev => [...prev, ...newItems]);
            setSelectedIds(newIds);
            
            // Switch viewmode if pasting outer components
            const isOuter = ["Door Accessory", "Meter", "Label", "Logo", "Cooling"].includes(newItems[0].comp.category);
            setViewMode(isOuter ? "outer" : "inner");
         }
      }

      // Ctrl+A (Select All in current view)
      if (cmdOrCtrl && e.key.toLowerCase() === "a") {
         e.preventDefault();
         const viewItems = items.filter(it => {
            const isOuter = ["Door Accessory", "Meter", "Label", "Logo", "Cooling"].includes(it.comp.category);
            return viewMode === "outer" ? isOuter : !isOuter;
         });
         setSelectedIds(viewItems.map(i => i.id));
      }

      // Arrow Keys (Nudge)
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
         if (selectedIds.length > 0) {
            e.preventDefault();
            const step = e.shiftKey ? 25 : 1; // Shift jumps by grid size (25mm), otherwise 1mm
            let dx = 0; let dy = 0;
            if (e.key === "ArrowUp") dy = -step;
            if (e.key === "ArrowDown") dy = step;
            if (e.key === "ArrowLeft") dx = -step;
            if (e.key === "ArrowRight") dx = step;

            setItems(prev => prev.map(it => {
               if (selectedIds.includes(it.id)) {
                  let nx = it.x + dx; let ny = it.y + dy;
                  const cw = viewMode === "outer" ? activeEnc.extW : activeEnc.w;
                  const ch = viewMode === "outer" ? activeEnc.extH : activeEnc.h;
                  if (nx < 0) nx = 0; if (ny < 0) ny = 0;
                  if (nx + it.w > cw) nx = cw - it.w;
                  if (ny + it.h > ch) ny = ch - it.h;
                  return { ...it, x: nx, y: ny };
               }
               return it;
            }));
         }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, selectedIds, clipboard, viewMode, activeEnc]);


  const categories = PANEL_COMPONENT_CATEGORIES;
  const filteredLibrary = useMemo(() => {
    return componentLibrary.filter((c) => {
      const matchesCat = activeCategory === "All" || c.category === activeCategory;
      if (!searchQuery.trim()) return matchesCat;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        c.partCode.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

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
      id: allocPlacedId(),
      comp, x: startX, y: startY, w: comp.width, h: comp.height,
      label: generatePanelItemTag(comp.category, items),
      wx: 100 + (items.length % 8) * 80, // Spread out in SLD view
      wy: 200 + Math.floor(items.length / 8) * 120
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

  const duplicateSelected = () => {
     const selected = items.filter(i => selectedIds.includes(i.id));
     if (selected.length === 0) return;
     
     const newIds: string[] = [];
     const newItems = selected.map((item, idx) => {
        const newId = allocPlacedId();
        newIds.push(newId);
        // Generate tag for the new item, considering the already duplicated items in the loop
        const currentTempItems = [...items, ...selected.slice(0, idx)];
        return { 
           ...item, 
           id: newId, 
           x: item.x + 25, y: item.y + 25, 
           label: generatePanelItemTag(item.comp.category, currentTempItems),
           wx: (item.wx ?? 100) + 40, // Offset in SLD view
           wy: (item.wy ?? 200) + 40
        }; 
     });
     setItems(prev => [...prev, ...newItems]);
     setSelectedIds(newIds);
  };




  const onCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    
    if (e.target === e.currentTarget) {
        e.currentTarget.setPointerCapture(e.pointerId);
        
        const currentW = viewMode === "sld" ? 1200 : (viewMode === "outer" ? activeEnc.extW : activeEnc.w);
        const rect = canvasRef.current!.getBoundingClientRect();
        const scale = rect.width / currentW;
        const mouseX = (e.clientX - rect.left) / scale;
        const mouseY = (e.clientY - rect.top) / scale;

        setMarquee({ sx: mouseX, sy: mouseY, cx: mouseX, cy: mouseY });
        setSelectedIds([]);
    }
  };

  const onItemPointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    
    if (canvasRef.current) canvasRef.current.setPointerCapture(e.pointerId);
    
    let newSelection = selectedIds;
    if (e.shiftKey) {
      if (!selectedIds.includes(id)) newSelection = [...selectedIds, id];
    } else {
      if (!selectedIds.includes(id)) newSelection = [id];
    }
    setSelectedIds(newSelection);
    
    const currentW = viewMode === "sld" ? 1200 : (viewMode === "outer" ? activeEnc.extW : activeEnc.w);
    const rect = canvasRef.current!.getBoundingClientRect();
    const scale = rect.width / currentW;
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    const offsets = newSelection.map(selId => {
       const it = items.find(i => i.id === selId);
       // Consistent fallback with renderer
       const posX = viewMode === "sld" ? (it?.wx ?? 100) : (it?.x ?? 0);
       const posY = viewMode === "sld" ? (it?.wy ?? 200) : (it?.y ?? 0);
       return { id: selId, ox: mouseX - posX, oy: mouseY - posY };
    });
    setDragOffsets(offsets);
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    
    const currentW = viewMode === "sld" ? 1200 : (viewMode === "outer" ? activeEnc.extW : activeEnc.w);
    const currentH = viewMode === "sld" ? 800 : (viewMode === "outer" ? activeEnc.extH : activeEnc.h);
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
         if (viewMode === "sld") {
            const isOuter = ["Door Accessory", "Meter", "Label", "Logo", "Cooling"].includes(it.comp.category);
            if (isOuter) return false;
            const wx = it.wx ?? 100;
            const wy = it.wy ?? 200;
            return !(wx > right || (wx + 60) < left || wy > bottom || (wy + 80) < top);
         }

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

              if (snapToGrid && viewMode !== "sld") {
                 newX = Math.round(newX / 25) * 25;
                 newY = Math.round(newY / 25) * 25;
              }

              if (viewMode === "sld") {
                // In SLD mode, we just update wx/wy without physical boundary checks
                next[itIndex] = { ...it, wx: newX, wy: newY };
              } else {
                if (newX < 0) newX = 0;
                if (newY < 0) newY = 0;
                if (newX + it.w > currentW) newX = currentW - it.w;
                if (newY + it.h > currentH) newY = currentH - it.h;
                next[itIndex] = { ...it, x: newX, y: newY };
              }
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





  const renderFanFilter = () => (
    <div style={{
      width: "100%", height: "100%", background: "linear-gradient(135deg, #e0e0e0, #bdbdbd)", 
      border: "2px solid #999", borderRadius: 8, display: "flex", 
      alignItems: "center", justifyContent: "center",
      boxShadow: "inset 0 4px 10px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.3)",
      position: "relative", overflow: "hidden"
    }}>
      {/* Grill Mesh */}
      <div style={{
        width: "85%", height: "85%", 
        backgroundImage: `
          linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px),
          linear-gradient(0deg, rgba(0,0,0,0.1) 1px, transparent 1px)
        `,
        backgroundSize: "4px 4px",
        borderRadius: 4, border: "1px solid #888",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
      }} />
      {/* Louvers */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 15%, rgba(0,0,0,0.05) 15%, rgba(0,0,0,0.05) 20%)",
        pointerEvents: "none"
      }} />
      {/* Screws */}
      <div style={{ position: "absolute", top: "5%", left: "5%", width: "4%", height: "4%", background: "#aaa", borderRadius: "50%", border: "1px solid #777" }} />
      <div style={{ position: "absolute", top: "5%", right: "5%", width: "4%", height: "4%", background: "#aaa", borderRadius: "50%", border: "1px solid #777" }} />
      <div style={{ position: "absolute", bottom: "5%", left: "5%", width: "4%", height: "4%", background: "#aaa", borderRadius: "50%", border: "1px solid #777" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "5%", width: "4%", height: "4%", background: "#aaa", borderRadius: "50%", border: "1px solid #777" }} />
    </div>
  );

  const renderCADVisual = (item: PlacedItem) => {
    const { comp, w, h, label } = item;
    switch (comp.category) {
      case "VSD":
        const isABB = comp.brand === "ABB";
        return (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(to bottom, #e5e5e5 0%, #c0c0c0 100%)", borderRadius: 2, display: "flex", flexDirection: "column", boxSizing: "border-box", border: "1px solid #777", boxShadow: "inset 1px 1px 2px #fff, inset -1px -1px 3px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.3)", position: "relative", overflow: "hidden" }}>
            {/* Vents Top */}
            <div style={{ width: "100%", height: "10%", backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)" }} />
            
            {/* Main Body */}
            <div style={{ flex: 1, padding: "5%", display: "flex", flexDirection: "column", alignItems: "center", gap: "5%", position: "relative", zIndex: 1 }}>
               {/* Accent Strip */}
               <div style={{ position: "absolute", left: "10%", top: 0, bottom: 0, width: "3%", background: comp.color, boxShadow: "1px 0 2px rgba(0,0,0,0.3)" }} />
               
               {/* Assistant Control Panel (Keypad) */}
               <div style={{ width: "60%", height: "35%", background: "#222", borderRadius: 4, display: "flex", flexDirection: "column", padding: "3%", boxSizing: "border-box", border: "1px solid #000", boxShadow: "0 2px 5px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)" }}>
                  <div style={{ width: "100%", height: "40%", background: "linear-gradient(to bottom, #d4f0ff, #8cbcd6)", borderRadius: 1, border: "1px solid #111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: "clamp(3px, 0.8vw, 6px)", fontFamily: "var(--font-mono)", color: "#111", transform: "scale(0.8)" }}>{isABB ? "ABB" : ""}</div>
                  </div>
                  <div style={{ flex: 1, marginTop: "5%", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "5%" }}>
                     {Array.from({length: 6}).map((_, i) => <div key={i} style={{ background: "#444", borderRadius: 1, borderBottom: "1px solid #000" }} />)}
                  </div>
               </div>
               
               {/* Label Plate */}
               <div style={{ width: "50%", height: "10%", background: "#fff", border: "1px solid #888", borderRadius: 1, alignSelf: "flex-end", marginRight: "10%" }} />
            </div>

            {/* Vents Bottom */}
            <div style={{ width: "100%", height: "15%", background: "#333", borderTop: "2px solid #111", display: "flex", justifyContent: "space-around", alignItems: "center", padding: "0 10%", boxSizing: "border-box" }}>
               {Array.from({length: 4}).map((_, i) => <div key={i} style={{ width: "10%", height: "60%", background: "#111", borderRadius: 1 }} />)}
            </div>
          </div>
        );
      case "MCCB":
        return (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(to right, #b8b8b8, #e0e0e0, #b8b8b8)", border: "1px solid #555", borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box", padding: "2% 0", boxShadow: "0 2px 6px rgba(0,0,0,0.4), inset 1px 1px 2px #fff" }}>
            {/* Top Terminals */}
            <div style={{ width: "80%", height: "10%", display: "flex", justifyContent: "space-around" }}>
               {Array.from({length: 3}).map((_, i) => <div key={i} style={{ width: "20%", height: "100%", background: "#888", borderRadius: "50%", border: "1px solid #444", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)" }} />)}
            </div>
            
            {/* Toggle Mechanism */}
            <div style={{ width: "50%", height: "40%", background: "#333", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #222", boxShadow: "inset 0 4px 6px rgba(0,0,0,0.6)" }}>
               <div style={{ width: "60%", height: "60%", background: "linear-gradient(to bottom, #444, #111)", borderRadius: 2, borderTop: "2px solid #666", borderBottom: "2px solid #000", position: "relative" }}>
                 <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: "40%", height: "20%", background: "#fff", opacity: 0.8 }} />
               </div>
            </div>

            {/* Bottom Terminals & Branding Strip */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
               <div style={{ width: "80%", height: "4px", background: comp.color, opacity: 0.8 }} />
               <div style={{ width: "80%", height: "10%", display: "flex", justifyContent: "space-around", paddingBottom: "2px" }}>
                  {Array.from({length: 3}).map((_, i) => <div key={i} style={{ width: "20%", height: "100%", background: "#888", borderRadius: "50%", border: "1px solid #444", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)" }} />)}
               </div>
            </div>
          </div>
        );
      case "Terminal Block":
        return (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(to right, #cfaf8c, #e8cfb3, #cfaf8c)", display: "flex", flexDirection: "row", border: "1px solid #a6845e", boxSizing: "border-box", borderRadius: 1, boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
            {Array.from({length: 10}).map((_, i) => (
               <div key={i} style={{ flex: 1, borderRight: "1px solid rgba(0,0,0,0.15)", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", padding: "10% 0" }}>
                  {/* Top Screw */}
                  <div style={{ width: "60%", paddingTop: "60%", background: "#888", borderRadius: "50%", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)", border: "1px solid #666" }} />
                  <div style={{ flex: 1 }} />
                  {/* Label Marker */}
                  <div style={{ width: "80%", height: "20%", background: "#fff", border: "1px solid #ccc", margin: "20% 0" }} />
                  <div style={{ flex: 1 }} />
                  {/* Bottom Screw */}
                  <div style={{ width: "60%", paddingTop: "60%", background: "#888", borderRadius: "50%", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)", border: "1px solid #666" }} />
               </div>
            ))}
          </div>
        );
      case "Wiring":
        const isHorizontal = w > h;
        return (
          <div style={{ 
            width: "100%", height: "100%", 
            background: comp.brand === "Weidmuller" ? "linear-gradient(to bottom, #d4d4d4, #bbb)" : "#959595", 
            boxSizing: "border-box", 
            display: "flex", 
            flexDirection: isHorizontal ? "row" : "column", 
            border: "1px solid #666",
            boxShadow: "inset 0 1px 2px #fff, 0 1px 3px rgba(0,0,0,0.3)"
          }}>
             <div style={{ 
               flex: 1, 
               backgroundImage: isHorizontal 
                 ? "repeating-linear-gradient(to right, transparent, transparent 8px, rgba(0,0,0,0.3) 8px, rgba(0,0,0,0.3) 12px)" 
                 : "repeating-linear-gradient(to bottom, transparent, transparent 8px, rgba(0,0,0,0.3) 8px, rgba(0,0,0,0.3) 12px)",
               opacity: 0.8
             }} />
          </div>
        );
      case "Networking":
        return (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(to right, #222, #333, #222)", borderRadius: 2, border: "1px solid #111", padding: "5%", display: "flex", flexDirection: "column", gap: "5%", boxSizing: "border-box", boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.4)", position: "relative" }}>
            {/* Branding Strip */}
            <div style={{ position: "absolute", top: 0, left: "5%", width: "10%", height: "100%", background: comp.color, opacity: 0.8 }} />
            
            {/* Ports */}
            {Array.from({length: 4}).map((_, i) => (
               <div key={i} style={{ flex: 1, background: "#111", borderRadius: 2, border: "1px solid #000", position: "relative", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "5%", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6)" }}>
                 {/* RJ45 Pins */}
                 <div style={{ width: "50%", height: "50%", backgroundImage: "repeating-linear-gradient(to right, transparent, transparent 10%, #d4af37 10%, #d4af37 20%)" }} />
                 {/* Status LED */}
                 <div style={{ position: "absolute", left: "10%", top: "50%", transform: "translateY(-50%)", width: "10%", paddingTop: "10%", background: "#10b981", borderRadius: "50%", boxShadow: "0 0 2px #10b981" }} />
               </div>
            ))}
          </div>
        );
      case "Cooling":
        return renderFanFilter();
      case "Door Accessory":
        const isEstop = comp.partCode.includes("E-Stop");
        const isSelector = comp.partCode.includes("Selector");
        const isKeypad = comp.partCode.includes("Keypad");
        
        if (isKeypad) {
           return (
             <div style={{ width: "100%", height: "100%", background: "#111", borderRadius: 4, border: "2px solid #333", display: "flex", flexDirection: "column", padding: "5%", boxSizing: "border-box", boxShadow: "0 4px 6px rgba(0,0,0,0.5)" }}>
                {/* LCD Screen with backlight effect */}
                <div style={{ width: "100%", height: "40%", background: "linear-gradient(135deg, #4dabf7, #228be6)", borderRadius: 2, marginBottom: "10%", border: "1px solid #111", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <div style={{ width: "80%", height: "60%", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 1 }} />
                </div>
                {/* Keypad buttons */}
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "5%" }}>
                   {Array.from({length: 3}).map((_, i) => <div key={i} style={{ background: "#d4af37", borderRadius: "50%", boxShadow: "0 1px 2px rgba(0,0,0,0.5)" }} />)}
                   {Array.from({length: 6}).map((_, i) => <div key={i} style={{ background: "#444", borderRadius: "2px", borderBottom: "1px solid #000" }} />)}
                </div>
             </div>
           );
        }

        return (
           <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#d4d4d4", borderRadius: w === h ? "50%" : 4, border: "2px solid #a0a0a0", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
              <div style={{ width: "70%", height: "70%", background: comp.color, borderRadius: isEstop ? "10%" : "50%", border: "1px solid rgba(0,0,0,0.2)", boxShadow: "inset 0 4px 6px rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                 {isSelector && <div style={{ width: "20%", height: "80%", background: "#fff", borderRadius: 2, transform: "rotate(45deg)" }} />}
              </div>
           </div>
        );
      case "Meter":
        const isDigital = comp.partCode.includes("Digital");
        const isVolt = comp.partCode.includes("Volt");
        return (
           <div style={{ width: "100%", height: "100%", background: "#fff", border: "2px solid #444", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "5%", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.1), 0 2px 5px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden" }}>
              {isDigital ? (
                <div style={{ background: "#111", padding: "8% 12%", borderRadius: 2, color: "#f00", fontFamily: "var(--font-mono)", fontSize: "clamp(8px, 2vw, 16px)", fontWeight: 800, border: "1px solid #333" }}>000.0</div>
              ) : (
                <>
                  {/* Scale Markings */}
                  <div style={{ position: "absolute", top: "15%", width: "80%", height: "50%", borderTop: "2px solid #333", borderRadius: "100% 100% 0 0" }}>
                     {Array.from({length: 11}).map((_, i) => (
                       <div key={i} style={{ position: "absolute", bottom: 0, left: "50%", width: 1, height: i % 5 === 0 ? 8 : 4, background: "#333", transformOrigin: "bottom", transform: `translateX(-50%) rotate(${(i-5) * 15}deg) translateY(-25px)` }} />
                     ))}
                  </div>
                  {/* Needle */}
                  <div style={{ position: "absolute", bottom: "10%", left: "50%", width: "2px", height: "70%", background: "#f00", transformOrigin: "bottom", transform: "translateX(-50%) rotate(-30deg)", zIndex: 2 }} />
                  {/* Pivot */}
                  <div style={{ position: "absolute", bottom: "-5%", left: "50%", transform: "translateX(-50%)", width: "15%", paddingTop: "15%", background: "#222", borderRadius: "50%", zIndex: 3 }} />
                  <div style={{ fontSize: "clamp(6px, 1.2vw, 12px)", color: "#111", fontWeight: 900, zIndex: 4, position: "absolute", bottom: "15%" }}>{isVolt ? "V" : "A"}</div>
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
        else if (comp.brand === "PTTS") imgUrl = "https://www.ptts.co.id/uploads/1/3/3/7/133745061/logo-web_orig.png";

        if (imgUrl) {
           return (
             <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", borderRadius: comp.brand === "PTTS" ? "50%" : 2, padding: "5%" }}>
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
      case "PLC":
        const isS71500 = comp.partCode.includes("S7-15") || comp.partCode.includes("SM 5");
        return (
          <div style={{ width: "100%", height: "100%", background: isS71500 ? "linear-gradient(to bottom, #1a3a4a, #0d2530)" : "linear-gradient(to bottom, #e8e8e8, #c8c8c8)", border: `1px solid ${isS71500 ? "#0a1e28" : "#999"}`, borderRadius: 2, display: "flex", flexDirection: "column", boxSizing: "border-box", boxShadow: "0 2px 5px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,255,255,0.2)", overflow: "hidden", position: "relative" }}>
            {/* Top connector strip */}
            <div style={{ width: "100%", height: "12%", background: isS71500 ? "#0a1e28" : "#555", display: "flex", justifyContent: "space-around", alignItems: "center", padding: "0 5%", boxSizing: "border-box" }}>
              {Array.from({length: Math.min(6, Math.round(w / 15))}).map((_, i) => <div key={i} style={{ width: "8%", height: "50%", background: "#aaa", borderRadius: 1 }} />)}
            </div>
            {/* Status LED strip */}
            <div style={{ display: "flex", gap: "3%", padding: "3% 8%", boxSizing: "border-box" }}>
              {Array.from({length: 4}).map((_, i) => <div key={i} style={{ width: "8%", paddingTop: "8%", borderRadius: "50%", background: i === 0 ? "#10b981" : i === 1 ? "#f59e0b" : "#333", boxShadow: i < 2 ? `0 0 3px ${i === 0 ? "#10b981" : "#f59e0b"}` : "none" }} />)}
            </div>
            {/* Brand accent */}
            <div style={{ position: "absolute", left: 0, top: "15%", bottom: "15%", width: "4%", background: comp.color }} />
            {/* Center label area */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "65%", height: "45%", background: isS71500 ? "rgba(0,200,200,0.15)" : "#fff", border: `1px solid ${isS71500 ? "rgba(0,200,200,0.3)" : "#bbb"}`, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "clamp(4px, 0.7vw, 7px)", fontFamily: "var(--font-mono)", color: isS71500 ? "#6dd" : "#333", fontWeight: 800 }}>{isS71500 ? "S7-1500" : "S7-1200"}</span>
              </div>
            </div>
            {/* Bottom connector strip */}
            <div style={{ width: "100%", height: "12%", background: isS71500 ? "#0a1e28" : "#555", display: "flex", justifyContent: "space-around", alignItems: "center", padding: "0 5%", boxSizing: "border-box" }}>
              {Array.from({length: Math.min(6, Math.round(w / 15))}).map((_, i) => <div key={i} style={{ width: "8%", height: "50%", background: "#aaa", borderRadius: 1 }} />)}
            </div>
          </div>
        );
      case "Contactor":
        return (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(to right, #c0c0c0, #e0e0e0, #c0c0c0)", border: "1px solid #666", borderRadius: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box", padding: "3% 0", boxShadow: "0 2px 5px rgba(0,0,0,0.35), inset 1px 1px 2px #fff" }}>
            {/* Top terminals */}
            <div style={{ width: "80%", height: "8%", display: "flex", justifyContent: "space-around" }}>
              {Array.from({length: 3}).map((_, i) => <div key={i} style={{ width: "18%", height: "100%", background: "#888", borderRadius: 2, border: "1px solid #555" }} />)}
            </div>
            {/* Arc chamber */}
            <div style={{ width: "70%", height: "30%", background: "#333", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #222", boxShadow: "inset 0 3px 5px rgba(0,0,0,0.5)" }}>
              <div style={{ width: "50%", height: "50%", background: "linear-gradient(to bottom, #555, #222)", borderRadius: 2, borderTop: "2px solid #777" }} />
            </div>
            {/* Coil section + brand strip */}
            <div style={{ width: "85%", height: "20%", background: "rgba(0,0,0,0.06)", borderRadius: 2, display: "flex", alignItems: "center", gap: "5%", padding: "0 5%", boxSizing: "border-box" }}>
              <div style={{ width: "30%", height: "60%", background: comp.color, borderRadius: 2, opacity: 0.9 }} />
              <div style={{ flex: 1, height: "40%", background: "#fff", border: "1px solid #ccc", borderRadius: 1 }} />
            </div>
            {/* Bottom terminals */}
            <div style={{ width: "80%", height: "8%", display: "flex", justifyContent: "space-around" }}>
              {Array.from({length: 3}).map((_, i) => <div key={i} style={{ width: "18%", height: "100%", background: "#888", borderRadius: 2, border: "1px solid #555" }} />)}
            </div>
          </div>
        );
      case "Relay":
        return (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #e8e8e8, #d0d0d0)", border: "1px solid #888", borderRadius: 2, display: "flex", flexDirection: "column", alignItems: "center", padding: "8% 5%", boxSizing: "border-box", boxShadow: "0 2px 4px rgba(0,0,0,0.25), inset 1px 1px 2px #fff", position: "relative" }}>
            {/* Brand accent line */}
            <div style={{ position: "absolute", top: 0, left: "8%", width: "12%", height: "100%", background: comp.color, opacity: 0.7 }} />
            {/* Timer dial / indicator */}
            <div style={{ width: "55%", paddingTop: "55%", background: "#fff", border: "2px solid #aaa", borderRadius: "50%", position: "relative", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.15)" }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", width: "2px", height: "35%", background: comp.color, transformOrigin: "top", transform: "translate(-50%, 0) rotate(45deg)" }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "20%", paddingTop: "20%", background: "#333", borderRadius: "50%" }} />
            </div>
            {/* Base */}
            <div style={{ width: "90%", height: "25%", background: "#aaa", border: "1px solid #777", borderRadius: 2, marginTop: "auto", display: "flex", justifyContent: "space-around", alignItems: "center", padding: "0 5%", boxSizing: "border-box" }}>
              {Array.from({length: 4}).map((_, i) => <div key={i} style={{ width: "12%", paddingTop: "12%", background: "#666", borderRadius: "50%" }} />)}
            </div>
          </div>
        );
      case "MCB":
        return (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(to right, #d5d5d5, #eee, #d5d5d5)", border: "1px solid #888", borderRadius: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "5% 0", boxSizing: "border-box", boxShadow: "0 2px 4px rgba(0,0,0,0.3), inset 1px 1px 2px #fff" }}>
            {/* Top terminal */}
            <div style={{ width: "50%", height: "8%", background: "#888", borderRadius: 2, border: "1px solid #555" }} />
            {/* Toggle */}
            <div style={{ width: "40%", height: "35%", background: "#333", borderRadius: 3, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "10% 0", boxSizing: "border-box", border: "1px solid #111" }}>
              <div style={{ width: "50%", height: "60%", background: comp.color, borderRadius: 2, border: "1px solid rgba(0,0,0,0.3)" }} />
            </div>
            {/* Rating label */}
            <div style={{ width: "70%", height: "12%", background: "#fff", border: "1px solid #bbb", borderRadius: 1 }} />
            {/* Bottom terminal */}
            <div style={{ width: "50%", height: "8%", background: "#888", borderRadius: 2, border: "1px solid #555" }} />
          </div>
        );
      case "SPD":
        return (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(to bottom, #e0e0e0, #c8c8c8)", border: "1px solid #888", borderRadius: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8%", boxSizing: "border-box", boxShadow: "0 2px 4px rgba(0,0,0,0.3), inset 1px 1px 2px #fff", position: "relative" }}>
            {/* Status window */}
            <div style={{ width: "40%", height: "20%", background: "#10b981", borderRadius: 3, border: "1px solid #0d9668", boxShadow: "0 0 6px rgba(16,185,129,0.5)" }} />
            {/* Lightning symbol hint */}
            <div style={{ fontSize: "clamp(8px, 2vw, 16px)", fontWeight: 900, color: "#f59e0b", textShadow: "0 0 4px rgba(245,158,11,0.3)" }}>⚡</div>
            {/* Brand strip */}
            <div style={{ position: "absolute", bottom: "5%", width: "80%", height: "8%", background: comp.color, borderRadius: 1, opacity: 0.7 }} />
          </div>
        );
      case "Transformer":
        return (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #d4d4d4, #b0b0b0)", border: "2px solid #888", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", boxShadow: "0 3px 8px rgba(0,0,0,0.35), inset 1px 1px 3px #fff", position: "relative", overflow: "hidden" }}>
            {/* E-I lamination pattern */}
            <div style={{ width: "60%", height: "70%", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "repeating-linear-gradient(to bottom, #999 0px, #999 2px, #bbb 2px, #bbb 4px)", borderRadius: 2, border: "1px solid #777" }} />
              {/* Coil windings */}
              <div style={{ position: "absolute", top: "15%", left: "-10%", width: "35%", height: "70%", background: comp.color, opacity: 0.7, borderRadius: "30%", border: "1px solid rgba(0,0,0,0.2)" }} />
              <div style={{ position: "absolute", top: "15%", right: "-10%", width: "35%", height: "70%", background: "#1d4ed8", opacity: 0.6, borderRadius: "30%", border: "1px solid rgba(0,0,0,0.2)" }} />
            </div>
            {/* Terminals */}
            <div style={{ position: "absolute", top: "5%", left: "10%", width: "10%", paddingTop: "10%", background: "#888", borderRadius: "50%", border: "1px solid #555" }} />
            <div style={{ position: "absolute", top: "5%", right: "10%", width: "10%", paddingTop: "10%", background: "#888", borderRadius: "50%", border: "1px solid #555" }} />
            <div style={{ position: "absolute", bottom: "5%", left: "10%", width: "10%", paddingTop: "10%", background: "#888", borderRadius: "50%", border: "1px solid #555" }} />
            <div style={{ position: "absolute", bottom: "5%", right: "10%", width: "10%", paddingTop: "10%", background: "#888", borderRadius: "50%", border: "1px solid #555" }} />
          </div>
        );
      case "Control":
      default:
        return (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #eee 0%, #ccc 100%)", border: "1px solid #999", borderRadius: 2, display: "flex", flexDirection: "column", boxSizing: "border-box", boxShadow: "0 2px 5px rgba(0,0,0,0.3), inset 1px 1px 2px #fff" }}>
             {/* Header Area */}
             <div style={{ width: "100%", height: "20%", background: "rgba(0,0,0,0.05)", borderBottom: "1px solid #aaa", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10%", boxSizing: "border-box" }}>
               {Array.from({length: 2}).map((_, i) => <div key={i} style={{ width: "15%", paddingTop: "15%", background: "#888", borderRadius: "50%", border: "1px solid #555" }} />)}
             </div>
             
             {/* Body Area */}
             <div style={{ flex: 1, padding: "10%", display: "flex", flexDirection: "column", gap: "10%", position: "relative" }}>
                {/* Brand / Status Indicator */}
                <div style={{ position: "absolute", top: "10%", right: "10%", width: "15%", paddingTop: "15%", background: comp.color, borderRadius: "50%", boxShadow: `0 0 4px ${comp.color}` }} />
                
                {/* Circuit / Component detailing */}
                <div style={{ width: "60%", height: "40%", background: "#bbb", border: "1px solid #999", borderRadius: 2, display: "flex", gap: "2px", padding: "2px", boxSizing: "border-box" }}>
                   <div style={{ flex: 1, background: "rgba(0,0,0,0.1)" }} />
                   <div style={{ flex: 1, background: "rgba(0,0,0,0.1)" }} />
                </div>
                <div style={{ width: "80%", height: "10%", background: "#fff", border: "1px solid #aaa", borderRadius: 1 }} />
             </div>

             {/* Footer Area */}
             <div style={{ width: "100%", height: "20%", background: "rgba(0,0,0,0.05)", borderTop: "1px solid #aaa", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10%", boxSizing: "border-box" }}>
               {Array.from({length: 2}).map((_, i) => <div key={i} style={{ width: "15%", paddingTop: "15%", background: "#888", borderRadius: "50%", border: "1px solid #555" }} />)}
             </div>
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
                onClick={() => setViewMode("sld")}
                style={{
                  background: viewMode === "sld" ? "var(--accent)" : "transparent",
                  color: viewMode === "sld" ? "#000" : "var(--fg)",
                  border: "none", padding: "6px 16px", borderRadius: 6,
                  fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: 8
                }}
              >
                <Activity size={14} /> SLD Schema
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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input 
                type="checkbox" 
                id="dimToggle" 
                checked={showDimensions} 
                onChange={(e) => setShowDimensions(e.target.checked)} 
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#10b981" }}
              />
              <label htmlFor="dimToggle" style={{ fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#10b981" }}>
                <Layers size={16} /> Show Dimensions (CAD)
              </label>
            </div>
          </div>

          <div style={{ flex: 1 }} />
          
          <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 12px" }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>Export Metadata</label>
            <input 
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", color: "var(--fg)", fontSize: 11, padding: "4px 8px", borderRadius: 4, outline: "none" }}
            />
            <input 
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", color: "var(--fg)", fontSize: 11, padding: "4px 8px", borderRadius: 4, outline: "none" }}
            />
          </div>

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
            <div className="vinci-card" style={{ padding: 16, maxHeight: 650, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", margin: 0 }}>
                  Library
                </h3>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", opacity: 0.7 }}>
                  {filteredLibrary.length} items
                </span>
              </div>

              {/* Search Input */}
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
                <input
                  type="text"
                  placeholder="Search component..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
                    color: "var(--fg)", padding: "8px 10px 8px 30px", borderRadius: 6,
                    fontFamily: "var(--font-mono)", fontSize: 12, outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Category Pill Tabs */}
              <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4, flexShrink: 0 }}>
                {categories.map(c => {
                  const count = c === "All" ? componentLibrary.length : componentLibrary.filter(x => x.category === c).length;
                  return (
                    <button
                      key={c}
                      onClick={() => setActiveCategory(c)}
                      style={{
                        padding: "3px 8px", borderRadius: 12, fontSize: 9,
                        fontFamily: "var(--font-mono)", textTransform: "uppercase",
                        letterSpacing: "0.04em", border: "1px solid",
                        cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                        background: activeCategory === c ? "var(--accent)" : "transparent",
                        color: activeCategory === c ? "#000" : "var(--muted)",
                        borderColor: activeCategory === c ? "var(--accent)" : "var(--border)",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {c} <span style={{ opacity: 0.6 }}>({count})</span>
                    </button>
                  );
                })}
              </div>

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
                      
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button 
                          onClick={duplicateSelected}
                          style={{ 
                            flex: 1, background: "transparent", color: "var(--fg)", 
                            border: "1px solid var(--border)", padding: "6px", borderRadius: 4, 
                            cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                          }}
                        >
                          <Copy size={14} /> Duplicate
                        </button>
                        <button 
                          onClick={() => handleRemoveItems([selItem.id])} 
                          style={{ 
                            flex: 1, background: "transparent", color: "#ef4444", 
                            border: "1px solid #ef4444", padding: "6px", borderRadius: 4, 
                            cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                          }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </>
                  );
                })()}

                {selectedIds.length > 1 && (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      <MousePointer2 size={16} /> {selectedIds.length} Items Selected
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button 
                        onClick={duplicateSelected}
                        style={{ 
                          flex: 1, background: "transparent", color: "var(--fg)", 
                          border: "1px solid var(--border)", padding: "6px", borderRadius: 4, 
                          cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                        }}
                      >
                        <Copy size={14} /> Duplicate Group
                      </button>
                      <button 
                        onClick={() => handleRemoveItems(selectedIds)} 
                        style={{ 
                          flex: 1, background: "transparent", color: "#ef4444", 
                          border: "1px solid #ef4444", padding: "6px", borderRadius: 4, 
                          cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                        }}
                      >
                        <Trash2 size={14} /> Delete Group
                      </button>
                    </div>
                  </>
                )}
                
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                   <div><b>Pro Tips (Keyboard):</b></div>
                   <div>• <b>Ctrl+C / Ctrl+V</b> to Copy Paste</div>
                   <div>• <b>Arrow Keys</b> to Nudge (Shift to jump)</div>
                   <div>• <b>Delete</b> to Remove</div>
                   <div>• <b>Ctrl+A</b> to Select All</div>
                </div>
              </div>
            )}
          </div>

          {/* Canvas Area */}
          <div className="print-area" style={{ flex: "2 1 450px", display: "flex", flexDirection: "column", justifyContent: "center", background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 32, border: "1px dashed var(--border)" }}>
                 <PrintHeader projectName={projectName} customerName={customerName} />
                 
                 {/* INNER VIEW (Mounting Plate) */}
            {viewMode === "inner" && (
              <div style={{
                 position: "relative", width: "100%", maxWidth: 500 * (activeEnc.extW / activeEnc.w),
                 aspectRatio: `${activeEnc.extW} / ${activeEnc.extH}`,
                 background: "repeating-linear-gradient(45deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)",
                 border: "2px solid #888", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
                 boxShadow: "inset 0 4px 10px rgba(0,0,0,0.1)"
              }}>
                <div
                  ref={canvasRef}
                  onPointerDown={onCanvasPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  style={{
                    position: "relative", width: `${(activeEnc.w / activeEnc.extW) * 100}%`, height: `${(activeEnc.h / activeEnc.extH) * 100}%`,
                    background: "#fdfdfd", // Galvanized plate color
                    boxShadow: "0 10px 40px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,0,0,0.05)",
                    border: "2px solid #aaa", overflow: "hidden", touchAction: "none", cursor: "crosshair"
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
                        {/* Tagging Overlay (International Standard) */}
                        <div style={{ 
                          position: "absolute", top: -14, left: 0, 
                          background: isSelected ? "#10b981" : "#fff", 
                          color: isSelected ? "#fff" : "#000",
                          fontSize: 8, fontWeight: 900, padding: "1px 4px", 
                          borderRadius: "2px 2px 0 0", border: "1px solid #000", borderBottom: "none",
                          zIndex: 100, fontFamily: "var(--font-mono)", whiteSpace: "nowrap"
                        }}>
                          {item.label}
                        </div>

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

                        {showDimensions && (
                           <>
                             <div style={{ position: "absolute", top: -8, left: 0, width: "100%", height: 1, background: "#10b981", pointerEvents: "none", zIndex: 20 }}>
                                <div style={{ position: "absolute", top: -3, left: 0, width: 1, height: 7, background: "#10b981" }} />
                                <div style={{ position: "absolute", top: -3, right: 0, width: 1, height: 7, background: "#10b981" }} />
                                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", color: "#10b981", fontSize: 8, fontWeight: 800, fontFamily: "var(--font-mono)", textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000" }}>W: {item.w}</div>
                             </div>
                             <div style={{ position: "absolute", top: 0, left: -8, width: 1, height: "100%", background: "#10b981", pointerEvents: "none", zIndex: 20 }}>
                                <div style={{ position: "absolute", top: 0, left: -3, width: 7, height: 1, background: "#10b981" }} />
                                <div style={{ position: "absolute", bottom: 0, left: -3, width: 7, height: 1, background: "#10b981" }} />
                                <div style={{ position: "absolute", top: "50%", left: -16, transform: "translateY(-50%) rotate(-90deg)", color: "#10b981", fontSize: 8, fontWeight: 800, fontFamily: "var(--font-mono)", textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000" }}>H: {item.h}</div>
                             </div>
                             <div style={{ position: "absolute", top: -20, left: -24, color: "#10b981", fontSize: 8, fontWeight: 800, fontFamily: "var(--font-mono)", textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000", pointerEvents: "none", zIndex: 20 }}>
                                ({Math.round(item.x)}, {Math.round(item.y)})
                             </div>
                           </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Print Context Overlay */}
                <div style={{ display: "none", position: "absolute", bottom: -20, left: 0, right: 0, justifyContent: "space-between", color: "#000", fontSize: 12, fontFamily: "var(--font-mono)" }} className="print-footer">
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
                        position: "absolute",
                        width: `${wPct}%`,
                        height: `${hPct}%`,
                        left: `${xPct}%`,
                        top: `${yPct}%`,
                        zIndex: isSelected ? 50 : 10,
                        cursor: "grab",
                        border: isSelected ? "2px solid #10b981" : "1px solid transparent",
                        boxShadow: isSelected ? "0 0 15px rgba(16, 185, 129, 0.5)" : "none",
                        transition: isItemDragging ? "none" : "all 0.1s ease",
                        opacity: isItemDragging ? 0.8 : 1,
                      }}
                    >
                      {/* Tagging Overlay (International Standard) */}
                      <div style={{ 
                        position: "absolute", top: -14, left: 0, 
                        background: isSelected ? "#10b981" : "rgba(255,255,255,0.9)", 
                        color: isSelected ? "#fff" : "#000",
                        fontSize: 8, fontWeight: 900, padding: "1px 4px", 
                        borderRadius: "1px 1px 0 0", border: "1px solid #000", borderBottom: "none",
                        zIndex: 100, fontFamily: "var(--font-mono)", whiteSpace: "nowrap"
                      }}>
                        {item.label}
                      </div>

                      {renderCADVisual(item)}

                      {showDimensions && (
                         <>
                           <div style={{ position: "absolute", top: -8, left: 0, width: "100%", height: 1, background: "#10b981", pointerEvents: "none", zIndex: 20 }}>
                              <div style={{ position: "absolute", top: -3, left: 0, width: 1, height: 7, background: "#10b981" }} />
                              <div style={{ position: "absolute", top: -3, right: 0, width: 1, height: 7, background: "#10b981" }} />
                              <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", color: "#10b981", fontSize: 8, fontWeight: 800, fontFamily: "var(--font-mono)", textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000" }}>W: {item.w}</div>
                           </div>
                           <div style={{ position: "absolute", top: 0, left: -8, width: 1, height: "100%", background: "#10b981", pointerEvents: "none", zIndex: 20 }}>
                              <div style={{ position: "absolute", top: 0, left: -3, width: 7, height: 1, background: "#10b981" }} />
                              <div style={{ position: "absolute", bottom: 0, left: -3, width: 7, height: 1, background: "#10b981" }} />
                              <div style={{ position: "absolute", top: "50%", left: -16, transform: "translateY(-50%) rotate(-90deg)", color: "#10b981", fontSize: 8, fontWeight: 800, fontFamily: "var(--font-mono)", textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000" }}>H: {item.h}</div>
                           </div>
                           <div style={{ position: "absolute", top: -20, left: -24, color: "#10b981", fontSize: 8, fontWeight: 800, fontFamily: "var(--font-mono)", textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000", pointerEvents: "none", zIndex: 20 }}>
                              ({Math.round(item.x)}, {Math.round(item.y)})
                           </div>
                         </>
                      )}
                    </div>
                  );
                })}
                
                {/* Print Context Overlay */}
                <div style={{ display: "none", position: "absolute", bottom: -20, left: 0, right: 0, justifyContent: "space-between", color: "#000", fontSize: 12, fontFamily: "var(--font-mono)" }} className="print-footer">
                  <div>Outer Dimension: {activeEnc.extW}x{activeEnc.extH}mm</div>
                </div>

                {/* Top-view clearance inset — door swing arc + 1000 mm front walkway per IEC 61439-1.
                    Renders the panel footprint (top-down), a quarter-circle door swing, and a
                    dashed band of mandatory walkway depth. Symbolic, not to absolute scale. */}
                {showDimensions && (() => {
                  const depth = activeEnc.extD ?? 300;
                  const width = activeEnc.extW;
                  const clearance = 1000; // mm, IEC 61439-1 minimum
                  // SVG viewbox: footprint at top, clearance band below.
                  const vbW = width;
                  const vbH = depth + clearance + 40; // padding
                  return (
                    <div
                      title={`Door swing + ${clearance} mm front clearance (IEC 61439-1)`}
                      style={{
                        position: "absolute", right: 8, bottom: 8,
                        width: 120, height: 120,
                        background: "rgba(255,255,255,0.92)",
                        border: "1px solid rgba(0,0,0,0.25)",
                        borderRadius: 6,
                        padding: 4,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                        pointerEvents: "none",
                      }}
                    >
                      <svg viewBox={`-20 -10 ${vbW + 40} ${vbH}`} width="100%" height="100%">
                        {/* Walkway band */}
                        <rect
                          x="0" y={depth + 4} width={vbW} height={clearance}
                          fill="rgba(0,120,255,0.08)"
                          stroke="#0078ff" strokeWidth="6" strokeDasharray="24 16"
                        />
                        <text x={vbW / 2} y={depth + clearance / 2 + 80} textAnchor="middle"
                          fontSize="120" fill="#0078ff" fontFamily="var(--font-mono)" fontWeight="700">
                          {clearance} mm
                        </text>
                        {/* Panel footprint */}
                        <rect x="0" y="0" width={vbW} height={depth}
                          fill="#222" stroke="#000" strokeWidth="4" />
                        {/* Door arc — quarter circle from left hinge */}
                        <path
                          d={`M 0,${depth} A ${depth},${depth} 0 0 0 ${depth},0`}
                          fill="none" stroke="#d97757" strokeWidth="5" strokeDasharray="14 10"
                        />
                        {/* Hinge marker */}
                        <circle cx="0" cy={depth} r="14" fill="#d97757" />
                        {/* "TOP VIEW" label */}
                        <text x={vbW / 2} y="-30" textAnchor="middle"
                          fontSize="90" fill="#666" fontFamily="var(--font-mono)" fontWeight="700">
                          TOP VIEW
                        </text>
                      </svg>
                    </div>
                  );
                })()}

              </div>
            )}

            {/* PROFESSIONAL WIRING DIAGRAM VIEW (SLD PRO) */}
            {viewMode === "sld" && (() => {
              
              const renderWiringSymbol = (item: PlacedItem) => {
                const isSelected = selectedIds.includes(item.id);
                const isHovered = hoveredId === item.id;
                const wx = item.wx ?? 100;
                const wy = item.wy ?? 200;

                // Professional IEC designations
                const getDesignation = (category: string) => {
                  if (category === "MCCB" || category === "MCB") return "Q";
                  if (category === "VSD") return "U";
                  if (category === "Contactor") return "KM";
                  if (category === "Transformer") return "T";
                  if (category === "PLC") return "K";
                  return "X";
                };

                const idx = items.filter(i => i.comp.category === item.comp.category).findIndex(i => i.id === item.id);
                const designation = item.label || `${getDesignation(item.comp.category)}${idx + 1}`;

                // Phase logic: determine if 1 or 3 phase
                const is3P = ["MCCB", "VSD", "Transformer"].includes(item.comp.category) || 
                             (["MCB", "Contactor"].includes(item.comp.category) && (item.comp.partCode.includes("3P") || item.comp.partCode.includes("3RT")));
                
                // Derivation Logic: Find parent component directly above this one
                const parent = items.find(p => 
                  p.id !== item.id && 
                  !["Label", "Logo", "Cooling"].includes(p.comp.category) &&
                  Math.abs((p.wx ?? 100) - wx) < 40 && // Roughly same column
                  (p.wy ?? 200) < wy - 60 // Must be above
                );

                const connectionTop = parent ? (parent.wy ?? 200) + 80 : 60; // Connect to parent bottom or main busbar
                const connectionY = connectionTop - wy;

                return (
                  <div 
                    key={item.id}
                    onPointerDown={(e) => onItemPointerDown(e, item.id)}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      position: "absolute", left: wx, top: wy,
                      cursor: "grab", transition: isDragging ? "none" : "all 0.1s",
                      zIndex: isSelected ? 100 : (isHovered ? 50 : 10),
                      transform: isHovered ? "scale(1.05)" : "none"
                    }}
                  >
                    {/* Vertical connection lines (Phased and Smart) */}
                    <div style={{ position: "absolute", top: connectionY, left: 30, width: 1, height: -connectionY, borderLeft: "1.5px solid #000" }}>
                       {/* Phase indicators (/// for 3P, / for 1P) */}
                       <div style={{ position: "absolute", top: "50%", left: -5, transform: "rotate(-45deg)", fontSize: 8, fontWeight: 900, whiteSpace: "nowrap" }}>
                         {is3P ? "///" : "/"}
                       </div>
                       {/* Connection dot if to busbar */}
                       {!parent && (
                         <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: 4, background: "#000", borderRadius: "50%", transform: "translate(-1.5px, -2px)" }} />
                       )}
                    </div>
                    {is3P && !parent && wy > 80 && (
                      <div style={{ position: "absolute", top: 80 - wy, left: 20, width: 1, height: wy - 80, borderLeft: "1px solid #000" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: 4, background: "#000", borderRadius: "50%", transform: "translate(-1.5px, -2px)" }} />
                      </div>
                    )}
                    {is3P && !parent && wy > 100 && (
                      <div style={{ position: "absolute", top: 100 - wy, left: 10, width: 1, height: wy - 100, borderLeft: "1px solid #000" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: 4, background: "#000", borderRadius: "50%", transform: "translate(-1.5px, -2px)" }} />
                      </div>
                    )}

                    <div style={{
                      width: 60, height: 80, background: "#fff", border: isSelected ? "2.5px solid var(--accent)" : "1.5px solid #000",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      boxShadow: isSelected ? "0 10px 20px rgba(0,0,0,0.2), 0 0 15px var(--accent)" : (isHovered ? "0 5px 15px rgba(0,0,0,0.1)" : "none")
                    }}>
                       {/* SVG Symbol inside box */}
                       <div style={{ width: 40, height: 40 }}>
                         {item.comp.category === "MCCB" || item.comp.category === "MCB" ? (
                           <svg width="40" height="40" viewBox="0 0 40 40">
                             <path d="M20 5 V15 M20 25 V35" stroke="#000" strokeWidth="1.5" />
                             <path d="M20 15 L35 25" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                             <circle cx="20" cy="15" r="1.5" fill="#000" />
                           </svg>
                         ) : item.comp.category === "VSD" ? (
                           <svg width="40" height="40" viewBox="0 0 40 40">
                             <rect x="5" y="5" width="30" height="30" fill="none" stroke="#000" strokeWidth="1.5" />
                             <path d="M5 35 L35 5" stroke="#000" strokeWidth="1" />
                             <text x="8" y="18" fontSize="8" fontWeight="bold">~</text>
                             <text x="24" y="32" fontSize="8" fontWeight="bold">=</text>
                           </svg>
                         ) : item.comp.category === "Contactor" ? (
                           <svg width="40" height="40" viewBox="0 0 40 40">
                             <rect x="10" y="10" width="20" height="20" fill="none" stroke="#000" strokeWidth="1" />
                             <path d="M5 20 H10 M30 20 H35" stroke="#000" strokeWidth="1" />
                             <path d="M15 10 V30 M25 10 V30" stroke="#000" strokeWidth="1" strokeDasharray="2 2" />
                           </svg>
                         ) : item.comp.category === "Transformer" ? (
                           <svg width="40" height="40" viewBox="0 0 40 40">
                             <circle cx="15" cy="20" r="10" fill="none" stroke="#000" strokeWidth="1.5" />
                             <circle cx="25" cy="20" r="10" fill="none" stroke="#000" strokeWidth="1.5" />
                           </svg>
                         ) : item.comp.category === "PLC" ? (
                           <div style={{ width: "90%", height: "90%", border: "1px dashed #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 900 }}>CPU</div>
                         ) : (
                           <div style={{ width: 30, height: 30, border: "1px solid #999", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>{item.comp.category}</div>
                         )}
                       </div>
                    </div>
                    <div style={{ textAlign: "center", marginTop: 4 }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: isSelected ? "var(--accent)" : "#000", fontFamily: "var(--font-mono)" }}>{designation}</div>
                      <div style={{ fontSize: 7, color: "#666", fontWeight: 700 }}>{item.comp.brand}</div>
                      <div style={{ fontSize: 6, color: "var(--accent)", fontWeight: 900, marginTop: 1 }}>{is3P ? "3-PHASE" : "1-PHASE"}</div>
                    </div>
                  </div>
                );
              };

              return (
                <div 
                  ref={sldRef}
                  style={{
                    width: "100%", height: isFullScreen ? "100vh" : 800, background: "#fff", border: isFullScreen ? "none" : "2px solid #000",
                    position: "relative", overflow: "hidden", cursor: marquee ? "crosshair" : "default"
                  }}
                >
                  {/* Drawing Frame / Coordinates */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 20, borderBottom: "1px solid #000", display: "flex", justifyContent: "space-around", fontSize: 9, fontWeight: 900, alignItems: "center", background: "#f8f8f8" }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <span key={n}>{n}</span>)}
                  </div>
                  <div style={{ position: "absolute", top: 20, left: 0, bottom: 100, width: 20, borderRight: "1px solid #000", display: "flex", flexDirection: "column", justifyContent: "space-around", fontSize: 9, fontWeight: 900, alignItems: "center", background: "#f8f8f8" }}>
                    {['A', 'B', 'C', 'D'].map(l => <span key={l}>{l}</span>)}
                  </div>

                  {/* Main Busbars (AC) */}
                  <div style={{ position: "absolute", top: 60, left: 40, right: 40, borderTop: "1.5px solid #000" }}>
                    <span style={{ position: "absolute", left: -30, top: -8, fontSize: 8, fontWeight: 900 }}>L1</span>
                  </div>
                  <div style={{ position: "absolute", top: 80, left: 40, right: 40, borderTop: "1.5px solid #000" }}>
                    <span style={{ position: "absolute", left: -30, top: -8, fontSize: 8, fontWeight: 900 }}>L2</span>
                  </div>
                  <div style={{ position: "absolute", top: 100, left: 40, right: 40, borderTop: "1.5px solid #000" }}>
                    <span style={{ position: "absolute", left: -30, top: -8, fontSize: 8, fontWeight: 900 }}>L3</span>
                  </div>
                  <div style={{ position: "absolute", top: 120, left: 40, right: 40, borderTop: "1px dashed #666" }}>
                    <span style={{ position: "absolute", left: -30, top: -8, fontSize: 8, fontWeight: 900 }}>N</span>
                  </div>
                  <div style={{ position: "absolute", top: 140, left: 40, right: 40, borderTop: "1.5px solid #10b981" }}>
                    <span style={{ position: "absolute", left: -30, top: -8, fontSize: 8, fontWeight: 900, color: "#10b981" }}>PE</span>
                  </div>

                  {/* Component Rendering */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 100 }} onPointerDown={onCanvasPointerDown}>
                    {items.filter(i => !["Label", "Logo", "Cooling"].includes(i.comp.category)).map(item => renderWiringSymbol(item))}
                  </div>

                  {/* Professional Title Block (Bottom) */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, borderTop: "2px solid #000", display: "flex", background: "#fff" }}>
                     <div style={{ flex: 2, borderRight: "1px solid #000", padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: 7, color: "#666", textTransform: "uppercase" }}>Project Name / Job:</div>
                          <div style={{ fontSize: 11, fontWeight: 900, color: "#000" }}>{projectName || "Panel Inverter For PIT 7"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 7, color: "#666", textTransform: "uppercase" }}>Client:</div>
                          <div style={{ fontSize: 10, fontWeight: 700 }}>{customerName || "Amerta Indah Otsuka"}</div>
                        </div>
                     </div>
                     <div style={{ flex: 2, borderRight: "1px solid #000", padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 7, color: "#666", textTransform: "uppercase" }}>Drawing Title:</div>
                        <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 1 }}>WIRING DIAGRAM</div>
                        <div style={{ fontSize: 8, color: "#444" }}>DUMMVINCI SLD ENGINE v2.6.0</div>
                     </div>
                     <div style={{ flex: 1.5, borderRight: "1px solid #000", padding: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        {/* PTTS Logo */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="https://www.ptts.co.id/uploads/1/3/3/7/133745061/logo-web_orig.png" alt="PTTS" style={{ height: 32 }} />
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 6, fontWeight: 800 }}>PT. PRIMA TEKINDO TIRTA</div>
                            <div style={{ fontSize: 6, fontWeight: 800 }}>SEJAHTERA</div>
                          </div>
                        </div>
                     </div>
                     <div style={{ flex: 1, padding: 8, display: "grid", gridTemplateColumns: "1fr 1fr", fontSize: 6, gap: 4 }}>
                        <div style={{ borderBottom: "0.5px solid #eee" }}>DATE:<br/><b>{revDate}</b></div>
                        <div style={{ borderBottom: "0.5px solid #eee" }}>REV NO:<br/><b>{revNo}</b></div>
                        <div style={{ borderBottom: "0.5px solid #eee" }}>DRAWN:<br/><b>{drawnBy}</b></div>
                        <div style={{ borderBottom: "0.5px solid #eee" }}>CHECKED:<br/><b>{checkedBy}</b></div>
                        <div style={{ borderBottom: "0.5px solid #eee" }}>APPROVED:<br/><b>{approvedBy}</b></div>
                        <div style={{ borderBottom: "0.5px solid #eee" }}>SHEET:<br/><b>1 / 5</b></div>
                     </div>
                  </div>

                  {/* Metadata Floating Form */}
                  <div className="no-print" style={{ position: "absolute", top: 30, right: 30, zIndex: 200 }}>
                    <button 
                      onClick={() => setShowMetadataForm(!showMetadataForm)}
                      style={{ background: "#000", color: "var(--accent)", border: "none", padding: "8px 16px", borderRadius: 4, fontWeight: 900, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}
                    >
                      <Settings2 size={14} /> {showMetadataForm ? "CLOSE SETTINGS" : "EDIT SHEET INFO"}
                    </button>
                    
                    {/* Full Screen Toggle Button */}
                    <button 
                      onClick={toggleFullScreen}
                      style={{ marginTop: 8, background: isFullScreen ? "var(--accent)" : "#000", color: isFullScreen ? "#000" : "var(--accent)", border: "none", padding: "8px 16px", borderRadius: 4, fontWeight: 900, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, width: "100%", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}
                    >
                      {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />} 
                      {isFullScreen ? "EXIT FOCUS MODE" : "FOCUS DRAFTING"}
                    </button>

                    {/* Floating Library Toggle (Only in Focus Mode) */}
                    {isFullScreen && (
                      <button 
                        onClick={() => setShowFocusLibrary(!showFocusLibrary)}
                        style={{ marginTop: 8, background: showFocusLibrary ? "var(--accent)" : "rgba(255,255,255,0.1)", color: showFocusLibrary ? "#000" : "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "10px", borderRadius: 4, fontWeight: 900, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, width: "100%", justifyContent: "center", backdropFilter: "blur(5px)" }}
                      >
                        <Box size={14} /> {showFocusLibrary ? "HIDE LIBRARY" : "SHOW LIBRARY"}
                      </button>
                    )}
                    
                    {showMetadataForm && (
                      <div style={{ marginTop: 8, background: "rgba(0,0,0,0.95)", color: "#fff", padding: 20, borderRadius: 8, width: 300, backdropFilter: "blur(10px)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", border: "1px solid #444", maxHeight: "80vh", overflowY: "auto" }}>
                        <div style={{ fontSize: 10, fontWeight: 900, color: "var(--accent)", marginBottom: 16, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}><FileText size={14}/> SHEET & PLOT SETTINGS</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                           <label style={{ fontSize: 9 }}>
                             DRAWN BY:
                             <input value={drawnBy} onChange={e => setDrawnBy(e.target.value.toUpperCase())} placeholder="N/A" style={{ width: "100%", background: "#222", border: "1px solid #444", color: "#fff", padding: "4px 8px", fontSize: 11, marginTop: 4 }} />
                           </label>
                           <label style={{ fontSize: 9 }}>
                             CHECKED BY:
                             <input value={checkedBy} onChange={e => setCheckedBy(e.target.value.toUpperCase())} placeholder="N/A" style={{ width: "100%", background: "#222", border: "1px solid #444", color: "#fff", padding: "4px 8px", fontSize: 11, marginTop: 4 }} />
                           </label>
                           <label style={{ fontSize: 9 }}>
                             APPROVED BY:
                             <input value={approvedBy} onChange={e => setApprovedBy(e.target.value.toUpperCase())} placeholder="N/A" style={{ width: "100%", background: "#222", border: "1px solid #444", color: "#fff", padding: "4px 8px", fontSize: 11, marginTop: 4 }} />
                           </label>
                           
                           <div style={{ height: 1, background: "#444", margin: "4px 0" }} />
                           
                           <div style={{ fontSize: 10, fontWeight: 900, color: "var(--accent)", marginBottom: 4 }}>AUTOCAD PLOT OPTIONS</div>
                           <label style={{ fontSize: 9 }}>
                             PAPER SIZE:
                             <select value={exportSettings.paperSize} onChange={e => setExportSettings(p => ({...p, paperSize: e.target.value}))} style={{ width: "100%", background: "#222", border: "1px solid #444", color: "#fff", padding: "4px 8px", fontSize: 11, marginTop: 4 }}>
                               <option value="A4">ISO A4 (297 x 210 mm)</option>
                               <option value="A3">ISO A3 (420 x 297 mm)</option>
                             </select>
                           </label>
                           <div style={{ display: "flex", gap: 12 }}>
                             <label style={{ fontSize: 9, flex: 1 }}>
                               MODE:
                               <select value={exportSettings.isColor ? "color" : "bw"} onChange={e => setExportSettings(p => ({...p, isColor: e.target.value === "color"}))} style={{ width: "100%", background: "#222", border: "1px solid #444", color: "#fff", padding: "4px 8px", fontSize: 11, marginTop: 4 }}>
                                 <option value="color">Full Color</option>
                                 <option value="bw">Technical B&W</option>
                               </select>
                             </label>
                             <label style={{ fontSize: 9, flex: 1 }}>
                               ORIENT:
                               <select value={exportSettings.orientation} onChange={e => setExportSettings(p => ({...p, orientation: e.target.value as "landscape" | "portrait"}))} style={{ width: "100%", background: "#222", border: "1px solid #444", color: "#fff", padding: "4px 8px", fontSize: 11, marginTop: 4 }}>
                                 <option value="landscape">Landscape</option>
                                 <option value="portrait">Portrait</option>
                               </select>
                             </label>
                           </div>

                           <button onClick={() => { setShowMetadataForm(false); window.print(); }} style={{ background: "var(--accent)", color: "#000", border: "none", padding: "10px", fontWeight: 900, fontSize: 11, marginTop: 8, cursor: "pointer", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                             <Printer size={16} /> PLOT TO PDF
                           </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Floating Focus Library (Machined Industrial Style) */}
                  {isFullScreen && showFocusLibrary && (
                    <div style={{ position: "absolute", left: 20, top: 80, bottom: 60, width: 280, background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)", border: "1.5px solid #333", borderRadius: 4, backdropFilter: "blur(20px)", zIndex: 300, display: "flex", flexDirection: "column", padding: 16, boxShadow: "0 20px 50px rgba(0,0,0,0.8), inset 0 0 10px rgba(0,0,0,0.5)", backgroundImage: "radial-gradient(#333 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
                       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, borderBottom: "1px solid #333", paddingBottom: 10 }}>
                          <div style={{ fontSize: 10, fontWeight: 900, color: "var(--accent)", display: "flex", alignItems: "center", gap: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                             <Box size={14}/> 
                             <span>Component Repository</span>
                             <div style={{ width: 6, height: 6, background: "#10b981", borderRadius: "50%", boxShadow: "0 0 4px #10b981" }} /> {/* Status LED */}
                          </div>
                          <button onClick={() => setShowFocusLibrary(false)} style={{ background: "#222", border: "1px solid #444", color: "#fff", cursor: "pointer", padding: "2px 6px", borderRadius: 2 }}><ChevronLeft size={14}/></button>
                       </div>
                       
                       <div style={{ position: "relative", marginBottom: 12 }}>
                         <input 
                           placeholder="FILTER PARTS..."
                           value={searchQuery}
                           onChange={e => setSearchQuery(e.target.value)}
                           style={{ width: "100%", background: "#000", border: "1px solid #444", borderRadius: 2, color: "var(--accent)", padding: "8px 12px", fontSize: 10, outline: "none", fontFamily: "var(--font-mono)", fontWeight: 700 }}
                         />
                         <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 8, color: "#444" }}>[CTRL+F]</div>
                       </div>

                       <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }} className="custom-scrollbar">
                          {componentLibrary
                            .filter(c => !["Label", "Logo", "Cooling", "Wiring"].includes(c.category))
                            .filter(c => c.partCode.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(c => (
                            <div 
                              key={c.partCode} 
                              onClick={() => { handleAddComponent(c); setShowFocusLibrary(false); }}
                              style={{ padding: "12px", borderRadius: 2, background: "#111", border: "1px solid #222", cursor: "pointer", transition: "all 0.15s", position: "relative", overflow: "hidden" }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "#1a1a1a"; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.background = "#111"; }}
                            >
                               <div style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "0.02em" }}>{c.partCode}</div>
                               <div style={{ fontSize: 8, color: "#666", display: "flex", justifyContent: "space-between", marginTop: 4, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                                  <span>{c.category}</span>
                                  <span style={{ color: "var(--accent)", opacity: 0.7 }}>{c.brand}</span>
                               </div>
                               {/* Industrial accent line */}
                               <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: c.color || "#444" }} />
                            </div>
                          ))}
                       </div>
                       
                       <div style={{ marginTop: 12, paddingTop: 8, borderTop: "1px solid #222", fontSize: 8, color: "#444", fontFamily: "var(--font-mono)", display: "flex", justifyContent: "space-between" }}>
                          <span>PTTS_CAD_V2.8</span>
                          <span>{componentLibrary.length} SYMBOLS</span>
                       </div>
                    </div>
                  )}

                  {/* Engineering Floating Toolbar (Machined Control Strip) */}
                  <div className="no-print" style={{ position: "absolute", left: isFullScreen ? "50%" : 30, bottom: isFullScreen ? 40 : 120, transform: isFullScreen ? "translateX(-50%)" : "none", background: "linear-gradient(to bottom, #1a1a1a, #0a0a0a)", border: "1.5px solid #444", borderRadius: 4, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4, zIndex: 400, boxShadow: "0 15px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                     <div style={{ padding: "0 8px", fontSize: 8, fontWeight: 900, color: "#444", fontFamily: "var(--font-mono)", borderRight: "1px solid #333" }}>TOOLS</div>
                     
                     <button onClick={() => setSelectedIds([])} style={{ background: selectedIds.length === 0 ? "var(--accent)" : "none", border: "none", color: selectedIds.length === 0 ? "#000" : "#fff", cursor: "pointer", padding: 8, borderRadius: 2 }} title="Select Mode"><MousePointer2 size={16} /></button>
                     
                     <div style={{ width: 1, height: 16, background: "#333", margin: "0 4px" }} />
                     
                     <button onClick={() => selectedIds.length > 0 && duplicateSelected()} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 8, borderRadius: 2 }} onMouseEnter={e => e.currentTarget.style.background = "#222"} onMouseLeave={e => e.currentTarget.style.background = "none"} title="Copy/Duplicate"><Copy size={16} /></button>
                     <button onClick={() => selectedIds.forEach(id => setItems(prev => prev.filter(i => i.id !== id)))} style={{ background: "none", border: "none", color: "#f44", cursor: "pointer", padding: 8, borderRadius: 2 }} onMouseEnter={e => e.currentTarget.style.background = "rgba(244,67,54,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "none"} title="Delete Selected"><Trash2 size={16} /></button>
                     
                     <div style={{ width: 1, height: 16, background: "#333", margin: "0 4px" }} />
                     
                     <button onClick={() => setShowFocusLibrary(!showFocusLibrary)} style={{ background: showFocusLibrary ? "var(--accent)" : "none", border: "none", color: showFocusLibrary ? "#000" : "var(--accent)", cursor: "pointer", padding: 8, borderRadius: 2 }} title="Add Components"><Plus size={16} /></button>
                     
                     <div style={{ width: 1, height: 16, background: "#333", margin: "0 4px" }} />
                     
                     <button onClick={toggleFullScreen} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 8, borderRadius: 2 }} title="Exit Focus"><Minimize2 size={16} /></button>
                  </div>

                  {/* Program Status Bar (Industrial Console Style) */}
                  {isFullScreen && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 26, background: "#050505", borderTop: "1.5px solid #222", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", fontSize: 9, fontFamily: "var(--font-mono)", color: "#555", zIndex: 450, textTransform: "uppercase" }}>
                       <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                          <div style={{ color: "var(--accent)", fontWeight: 900, display: "flex", alignItems: "center", gap: 6 }}>
                             <div style={{ width: 8, height: 8, background: "var(--accent)", borderRadius: 1, boxShadow: "0 0 5px var(--accent)" }} />
                             DUMMVINCI_CORE_V2.8.5
                          </div>
                          <span>SESSION: {new Date().toLocaleTimeString()}</span>
                          <span style={{ color: selectedIds.length > 0 ? "#fff" : "#555" }}>OBJ_SELECTED: {selectedIds.length}</span>
                       </div>
                       <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                          <span>BUSBAR: L1-L2-L3-N-PE (400V)</span>
                          <div style={{ background: "#111", padding: "2px 8px", borderRadius: 2, border: "1px solid #333", color: "#fff" }}>
                             X: {Math.round(items[0]?.wx || 0)} | Y: {Math.round(items[0]?.wy || 0)}
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              );
            })()}


          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: ${exportSettings.paperSize} ${exportSettings.orientation};
            margin: 0;
          }
          body * { visibility: hidden; }
          
          .print-area, .print-area * { visibility: visible; }
          .print-area { 
            position: absolute; left: 0; top: 0; width: 100%; height: 100%;
            margin: 0; padding: 0 !important; background: #fff !important; border: none !important; box-shadow: none !important; 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            filter: ${exportSettings.isColor ? "none" : "grayscale(1) contrast(1.1)"};
          }
          
          .no-print { display: none !important; }
        }
      `}} />
      <Footer />
    </CalcShell>
  );
}
