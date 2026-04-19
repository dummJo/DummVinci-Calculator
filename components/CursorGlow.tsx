"use client";
import { useEffect } from "react";

/**
 * Writes --cx / --cy to .cursor-card elements on mouse move.
 * Throttled to one rAF per frame, reads rects in a batch to avoid
 * layout thrash. Re-scans the DOM at most every 500ms.
 */
export default function CursorGlow() {
  useEffect(() => {
    let rafId = 0;
    let lastX = 0;
    let lastY = 0;
    let cards: HTMLElement[] = [];
    let lastScan = 0;

    const scan = () => {
      cards = Array.from(document.querySelectorAll<HTMLElement>(".cursor-card"));
      lastScan = performance.now();
    };

    const flush = () => {
      rafId = 0;
      if (performance.now() - lastScan > 500) scan();
      const rects = cards.map((c) => c.getBoundingClientRect()); // batch reads
      for (let i = 0; i < cards.length; i++) {
        const r = rects[i];
        cards[i].style.setProperty("--cx", `${lastX - r.left}px`);
        cards[i].style.setProperty("--cy", `${lastY - r.top}px`);
      }
    };

    const onMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (rafId === 0) rafId = requestAnimationFrame(flush);
    };

    scan();
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
