"use client";

import { useEffect, useRef } from "react";
import { createMorph, DURATION, type MorphHandle } from "@/lib/motion/morphEngine";

/**
 * "One Shape" — the 14 s, 120 BPM loop in which a single element morphs through
 * eleven real PTTS Praxis components.
 *
 * Shares lib/motion/morphEngine.ts with the offline renderer in motion/, so the
 * page and the exported video can never drift apart.
 *
 * Not mounted anywhere yet — see motion/HANDOFF.md.
 */
export default function MorphLoop({
  /** A still frame, in seconds, held under prefers-reduced-motion. */
  staticFrame = 11.5,
  className,
}: {
  staticFrame?: number;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let morph: MorphHandle | null = null;
    let raf = 0;
    let stage: HTMLDivElement | null = null;

    // globals.css:875-890 neutralises every animation under this query. Honour
    // the same contract: hold one frame rather than animating at 0.001ms.
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const build = () => {
      if (morph) { morph.destroy(); morph = null; }
      if (stage) { stage.remove(); stage = null; }
      cancelAnimationFrame(raf);

      // The composition is authored for a 1440 square. Scale the camera rather
      // than wrapping in transform: scale() — the engine then lays text out at
      // its final pixel size instead of rasterising it at the wrong one.
      const side = Math.max(1, Math.min(host.clientWidth, host.clientHeight || host.clientWidth));
      const scale = side / 1440;

      stage = document.createElement("div");
      stage.style.cssText =
        `position:relative;width:${side}px;height:${side}px;overflow:hidden;` +
        `border-radius:var(--r-lg);margin:0 auto`;
      host.appendChild(stage);

      morph = createMorph(stage, { frame: { w: side, h: side }, scale });

      if (mq.matches) {
        morph.seek(staticFrame);
        return;
      }
      const t0 = performance.now();
      const loop = () => {
        morph?.seek(((performance.now() - t0) / 1000) % DURATION);
        raf = requestAnimationFrame(loop);
      };
      loop();
    };

    build();

    const ro = new ResizeObserver(build);
    ro.observe(host);
    mq.addEventListener("change", build);

    return () => {
      ro.disconnect();
      mq.removeEventListener("change", build);
      cancelAnimationFrame(raf);
      morph?.destroy();
      stage?.remove();
    };
  }, [staticFrame]);

  return (
    <div
      ref={hostRef}
      className={className}
      aria-hidden="true"
      style={{ width: "100%", aspectRatio: "1 / 1" }}
    />
  );
}
