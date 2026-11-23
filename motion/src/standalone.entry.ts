/**
 * Capture entry point for the standalone HTML file.
 *
 * The engine itself lives in lib/motion/morphEngine.ts and is shared with
 * components/MorphLoop.tsx — this file only wires it to the capture harness so
 * the two deliverables can never drift apart.
 */
import { createMorph, DURATION } from '../../lib/motion/morphEngine';

declare global {
  interface Window {
    seek(t: number): void;
    DUR: number;
    __ready: boolean;
  }
}

const stage = document.getElementById('stage');
if (!stage) throw new Error('#stage missing');

const morph = createMorph(stage, {
  paintBackground: true,
  frame: { w: 1440, h: 1440 },
});

window.seek = morph.seek;
window.DUR = DURATION;
window.__ready = true;

// Interactive preview only. capture.mjs drives seek() directly and never starts
// this loop, so capture stays deterministic.
if (!location.search.includes('capture')) {
  const t0 = performance.now();
  const loop = (): void => {
    morph.seek((performance.now() - t0) / 1000);
    requestAnimationFrame(loop);
  };
  loop();
} else {
  morph.seek(0);
}

export {};
