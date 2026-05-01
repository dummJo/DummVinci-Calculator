"use client";
import { useEffect } from "react";

// ─── 8 Authentic Vincinian Icons from dummJo/portfolio ────────────────────────
const ICONS_SVG_STRINGS = [
  // 1 · Vitruvian Man
  `<svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="6" fill="#0e0d0b"/><circle cx="20" cy="20" r="16" stroke="#c9a96e" stroke-width="1" /><rect x="6" y="6" width="28" height="28" stroke="#c9a96e" stroke-width="0.8" /><line x1="20" y1="10" x2="20" y2="30" stroke="#c9a96e" stroke-width="1.2" /><line x1="10" y1="16" x2="30" y2="16" stroke="#c9a96e" stroke-width="1.2" /><circle cx="20" cy="9" r="2.5" stroke="#c9a96e" stroke-width="0.8" /><line x1="15" y1="30" x2="20" y2="22" stroke="#c9a96e" stroke-width="0.8" /><line x1="25" y1="30" x2="20" y2="22" stroke="#c9a96e" stroke-width="0.8" /></svg>`,

  // 2 · Eye Study
  `<svg width="32" height="32" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="20" fill="#0e0d0b"/><path d="M10 60 C25 35,95 35,110 60 C95 85,25 85,10 60Z" stroke="#c9a96e" stroke-width="2" /><circle cx="60" cy="60" r="20" stroke="#c9a96e" stroke-width="1.5" /><circle cx="60" cy="60" r="10" stroke="#c9a96e" stroke-width="1.5" /><circle cx="60" cy="60" r="4" fill="#c9a96e" fill-opacity="0.3" stroke="#c9a96e" stroke-width="1" /></svg>`,

  // 3 · Flying Machine
  `<svg width="32" height="32" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="20" fill="#0e0d0b"/><path d="M60 40 L20 25 Q15 20 20 15 L60 30" stroke="#c9a96e" stroke-width="2" /><path d="M60 40 L100 25 Q105 20 100 15 L60 30" stroke="#c9a96e" stroke-width="2" /><line x1="60" y1="30" x2="60" y2="90" stroke="#c9a96e" stroke-width="1.5" /><path d="M40 85 Q60 100 80 85" stroke="#c9a96e" stroke-width="1.5" /></svg>`,

  // 4 · Compass
  `<svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="6" fill="#0e0d0b"/><path d="M20 8 L10 32 M20 8 L30 32" stroke="#c9a96e" stroke-width="2" /><circle cx="20" cy="8" r="1.5" stroke="#c9a96e" stroke-width="1.5" /><path d="M14 24 Q20 22 26 24" stroke="#c9a96e" stroke-width="1" stroke-dasharray="2 2" /></svg>`,

  // 5 · Golden Spiral
  `<svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="8" fill="#0e0d0b"/><path d="M 36 24 A 12 12 0 0 1 24 36 A 12 12 0 0 1 12 24 A 12 12 0 0 1 24 12" stroke="#c9a96e" stroke-width="1.5" /><path d="M 30 24 A 6 6 0 0 1 24 30 A 6 6 0 0 1 18 24 A 6 6 0 0 1 24 18" stroke="#c9a96e" stroke-width="1" /></svg>`,

  // 6 · Skull
  `<svg width="32" height="32" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="20" fill="#0e0d0b"/><path d="M35 55 Q35 25 60 25 Q85 25 85 55 Q85 75 75 85 L70 95 L50 95 L45 85 Q35 75 35 55Z" stroke="#c9a96e" stroke-width="2" /><circle cx="48" cy="58" r="8" stroke="#c9a96e" stroke-width="1.5" /><circle cx="72" cy="58" r="8" stroke="#c9a96e" stroke-width="1.5" /><path d="M55 75 L60 70 L65 75" stroke="#c9a96e" stroke-width="1.5" /></svg>`,

  // 7 · Ballista
  `<svg width="32" height="32" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="20" fill="#0e0d0b"/><line x1="20" y1="70" x2="100" y2="70" stroke="#c9a96e" stroke-width="2" /><path d="M40 70 L95 70" stroke="#c9a96e" stroke-width="1.5" /><circle cx="28" cy="95" r="10" stroke="#c9a96e" stroke-width="1.5" /><circle cx="92" cy="95" r="10" stroke="#c9a96e" stroke-width="1.5" /></svg>`,

  // 8 · Arial Screw
  `<svg width="32" height="32" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="20" fill="#0e0d0b"/><ellipse cx="60" cy="30" rx="40" ry="10" stroke="#c9a96e" stroke-width="2" /><line x1="60" y1="30" x2="60" y2="90" stroke="#c9a96e" stroke-width="1.5" /><path d="M30 60 Q60 50 90 60" stroke="#c9a96e" stroke-width="1" stroke-dasharray="2 2" /></svg>`,
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
