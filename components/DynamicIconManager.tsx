"use client";
import { useEffect, useState } from "react";

// ─── 8 Vincinian Icons based on dummjo.dev aesthetics ────────────────────────
// Each is 32x32. We will convert them to Data URLs for the favicon.

const ICONS_SVG_STRINGS = [
  // 1 · Vitruvian Man
  `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="6" fill="#0e0d0b"/><circle cx="16" cy="16" r="11.5" stroke="#c9a96e" strokeWidth="1"/><rect x="5.5" y="5.5" width="21" height="21" stroke="#c9a96e" strokeWidth="0.7"/><line x1="16" y1="9.5" x2="16" y2="23.5" stroke="#c9a96e" strokeWidth="1.3"/><line x1="8.5" y1="16" x2="23.5" y2="16" stroke="#c9a96e" strokeWidth="1.1"/><circle cx="16" cy="8" r="1.8" stroke="#c9a96e" strokeWidth="0.9" fill="#0e0d0b"/><line x1="10" y1="13.5" x2="16" y2="16" stroke="#c9a96e" strokeWidth="0.8" opacity="0.75"/><line x1="22" y1="13.5" x2="16" y2="16" stroke="#c9a96e" strokeWidth="0.8" opacity="0.75"/><line x1="12.5" y1="24.5" x2="16" y2="19" stroke="#c9a96e" strokeWidth="0.8" opacity="0.75"/><line x1="19.5" y1="24.5" x2="16" y2="19" stroke="#c9a96e" strokeWidth="0.8" opacity="0.75"/></svg>`,

  // 2 · Compass (Drafting)
  `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="6" fill="#0e0d0b"/><circle cx="16" cy="7" r="2" stroke="#c9a96e" strokeWidth="1" fill="#0e0d0b"/><line x1="16" y1="9" x2="10" y2="25" stroke="#c9a96e" strokeWidth="1.3"/><line x1="16" y1="9" x2="22" y2="25" stroke="#c9a96e" strokeWidth="1.3"/><line x1="10" y1="25" x2="10" y2="27.5" stroke="#c9a96e" strokeWidth="1"/><line x1="22" y1="25" x2="22" y2="27.5" stroke="#c9a96e" strokeWidth="1"/><path d="M11.5 19 Q16 21 20.5 19" stroke="#c9a96e" strokeWidth="0.8" fill="none" opacity="0.6"/><circle cx="16" cy="7" r="4.5" stroke="#c9a96e" strokeWidth="0.6" strokeDasharray="1.5 2" opacity="0.5"/></svg>`,

  // 3 · Golden Spiral
  `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="6" fill="#0e0d0b"/><rect x="5" y="5" width="22" height="22" stroke="#c9a96e" strokeWidth="0.6" opacity="0.4"/><rect x="5" y="5" width="13.5" height="13.5" stroke="#c9a96e" strokeWidth="0.5" opacity="0.35"/><rect x="18.5" y="5" width="8.5" height="8.5" stroke="#c9a96e" strokeWidth="0.5" opacity="0.35"/><path d="M27 5 Q18.5 5 18.5 13.5 Q18.5 18.5 23.5 18.5 Q27 18.5 27 14.5" stroke="#c9a96e" strokeWidth="1.3" fill="none" strokeLinecap="round"/></svg>`,

  // 4 · Anatomical Eye
  `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="6" fill="#0e0d0b"/><path d="M5 16 Q10 9 16 9 Q22 9 27 16 Q22 23 16 23 Q10 23 5 16Z" stroke="#c9a96e" strokeWidth="1.1" fill="none"/><circle cx="16" cy="16" r="4.5" stroke="#c9a96e" strokeWidth="1"/><circle cx="16" cy="16" r="2" fill="#c9a96e" opacity="0.55"/></svg>`,

  // 5 · Flying Machine (Wing Study)
  `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="6" fill="#0e0d0b"/><path d="M6 12 Q14 8 16 16 M16 16 Q18 8 26 12" stroke="#c9a96e" strokeWidth="1.2"/><path d="M6 12 L12 24 M26 12 L20 24" stroke="#c9a96e" strokeWidth="0.8" opacity="0.6"/><path d="M12 24 Q16 26 20 24" stroke="#c9a96e" strokeWidth="0.8" opacity="0.6"/><line x1="16" y1="16" x2="16" y2="28" stroke="#c9a96e" strokeWidth="1"/></svg>`,

  // 6 · Trebuchet (Counterweight)
  `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="6" fill="#0e0d0b"/><path d="M8 26 L16 10 L24 26" stroke="#c9a96e" strokeWidth="1.2"/><circle cx="16" cy="10" r="1.5" fill="#c9a96e"/><line x1="10" y1="14" x2="22" y2="6.5" stroke="#c9a96e" strokeWidth="1.5"/><rect x="20.5" y="4" width="3" height="5" stroke="#c9a96e" strokeWidth="0.8" opacity="0.7"/></svg>`,

  // 7 · Human Skull (MDB)
  `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="6" fill="#0e0d0b"/><path d="M10 18 Q10 8 16 8 Q22 8 22 18 Q22 24 16 24 Q10 24 10 18Z" stroke="#c9a96e" strokeWidth="1.2"/><circle cx="13" cy="17" r="1.5" stroke="#c9a96e"/><circle cx="19" cy="17" r="1.5" stroke="#c9a96e"/><path d="M13 22 H19" stroke="#c9a96e" strokeWidth="0.8" opacity="0.6"/></svg>`,

  // 8 · Dodecahedron (Geometry)
  `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="6" fill="#0e0d0b"/><path d="M16 6 L24 10 L24 22 L16 26 L8 22 L8 10 Z" stroke="#c9a96e" strokeWidth="1"/><path d="M16 6 L16 14 M24 10 L16 14 M8 10 L16 14 M16 26 L16 18 M24 22 L16 18 M8 22 L16 18" stroke="#c9a96e" strokeWidth="0.8" opacity="0.6"/></svg>`,
];

export default function DynamicIconManager() {
  useEffect(() => {
    let currentIdx = 0;
    
    const updateFavicon = (index: number) => {
      const svg = ICONS_SVG_STRINGS[index];
      const encoded = btoa(svg);
      const dataUrl = `data:image/svg+xml;base64,${encoded}`;
      
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = dataUrl;
    };

    // Initial update
    updateFavicon(0);

    const interval = setInterval(() => {
      currentIdx = (currentIdx + 1) % ICONS_SVG_STRINGS.length;
      updateFavicon(currentIdx);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  return null;
}

export { ICONS_SVG_STRINGS };
