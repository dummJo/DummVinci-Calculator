// Scale harness: renders the 1440-authored composition into a 720 box the way
// components/MorphLoop.tsx does, so the scaled path gets the same scrutiny.
import { createMorph } from '../../lib/motion/morphEngine';
const stage = document.getElementById('stage');
if (!stage) throw new Error('#stage missing');
const SIDE = 720;
stage.style.cssText = `position:relative;width:${SIDE}px;height:${SIDE}px;overflow:hidden`;
const m = createMorph(stage, { frame: { w: SIDE, h: SIDE }, scale: SIDE / 1440 });
(window as unknown as { seek: (t: number) => void; __ready: boolean }).seek = m.seek;
(window as unknown as { __ready: boolean }).__ready = true;
m.seek(0);
export {};
