/**
 * PTTS Praxis — "One Shape" motion engine.
 *
 * One element morphs through eleven real PTTS Praxis components on a 120 BPM
 * grid, 7 bars, 28 beats, 14.000 s, looping exactly.
 *
 * CONTRACT — do not break:
 *   • Every style is a pure function of time, written inside seek(t). No CSS
 *     transitions, no CSS animations, no timers, no state between frames.
 *     seek(3.2) produces the same pixels regardless of what ran before it.
 *   • Springs are closed-form step responses. A value that changes target N
 *     times is the sum of N step responses, so it stays pure in t.
 *   • The camera is a scalar K applied by MULTIPLYING authored px, never by
 *     transform: scale(). Text is laid out at its final pixel size and so
 *     rasterises crisply at any zoom — which is also why nothing here needs
 *     (or may have) will-change.
 *
 * Geometry is authored in the site's NATIVE px and cited to the component it
 * came from. Anything the repo does not contain is marked [INVENT] and listed
 * in motion/HANDOFF.md.
 *
 * Single source of truth: motion/build.py bundles this same file into the
 * standalone capture HTML, and components/MorphLoop.tsx imports it for the site.
 */

// ─── Grid ──────────────────────────────────────────────────────────────────
const BPM = 120;
const BEAT = 60 / BPM;
const BARS = 7;
export const DURATION = BARS * 4 * BEAT; // 14.000 s
const b = (n: number): number => n * BEAT;

// ─── Spring: closed-form unit step response ────────────────────────────────
interface Spring { w: number; z: number }

function stepResp(x: number, w: number, z: number): number {
  if (x <= 0) return 0;
  if (z < 1) {
    const wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * x) * (Math.cos(wd * x) + (z * w / wd) * Math.sin(wd * x));
  }
  return 1 - Math.exp(-w * x) * (1 + w * x);
}

// House springs, tuned to the easings this site actually ships.
//   SNAP  ~ nav's cubic-bezier(0.32,0.72,0,1) 0.22s   (BottomTabBar.tsx:677)
//   POP   ~ FieldToggle's cubic-bezier(0.34,1.56,0.64,1) (FieldToggle.tsx:56);
//           z=0.62 overshoots ~9%, matching that curve's bounce.
//   CAM   — the camera; slower than the shape but fast enough to arrive with it.
//   SEAL  — stiff enough that the final morph settles below 1e-4 by t=14.000,
//           which is what makes the last frame identical to the first.
const SNAP: Spring = { w: 26, z: 1.0 };
const POP:  Spring = { w: 22, z: 0.62 };
const CAM:  Spring = { w: 19, z: 1.0 };
const SEAL: Spring = { w: 30, z: 1.0 };

// The leading edge must clearly outrun the trailing one or the stretch is not
// readable at 60fps. A first tuning (30/0.70 vs 19/0.80) only widened the knob
// 20% at peak; this pair reaches ~70%. The lead overshoots its travel by ~6%,
// inside the brief's "a tiny overshoot at most". [INVENT]
const EDGE_L: Spring = { w: 34, z: 0.62 };
const EDGE_T: Spring = { w: 15, z: 0.85 };

interface Key { t: number; v: number; sp?: Spring }

/**
 * A list of {t, v} targets becomes a pure function of time:
 *   value(t) = v0 + SUM_i (v_i - v_i-1) * stepResp(t - t_i)
 * The last keyframe of every track runs SEAL, because a spring is only
 * asymptotic: with CAM (w=19) the camera is still ~1% from target 0.4 s later,
 * which at K≈5 is a visible jump across the loop seam.
 */
function track(kfs: Key[], sp: Spring = SNAP): (t: number) => number {
  return (t: number): number => {
    let v = kfs[0].v;
    for (let i = 1; i < kfs.length; i++) {
      const s = kfs[i].sp ?? (i === kfs.length - 1 ? SEAL : sp);
      v += (kfs[i].v - kfs[i - 1].v) * stepResp(t - kfs[i].t, s.w, s.z);
    }
    return v;
  };
}

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, c: number, x: number): number => a + (c - a) * x;

/**
 * Content visibility. An exit must FINISH before the next layer's enter BEGINS,
 * or two texts are legible inside the morphing container at once.
 */
const FADE = 0.10;
function vis(t: number, tin: number, tout: number): number {
  return Math.min(clamp01((t - tin) / FADE), 1 - clamp01((t - tout) / FADE));
}

// ─── Timing convention ─────────────────────────────────────────────────────
// A transition must FINISH on its beat, not start on it, or the frame captured
// at that beat lands mid-morph. The first beat sheet was retuned for exactly
// this. The camera needs a longer lead than the shape: measuring showed K still
// at 4.72 when W had reached 300, which put the tab bar at 98% of the frame.
const LEAD = 0.30;
const LEAD_K = 0.45;
const st  = (beat: number): number => b(beat) - LEAD;
const stK = (beat: number): number => b(beat) - LEAD_K;

// ─── Shape tracks (native site px) ─────────────────────────────────────────
const W = track([
  { t: 0,        v: 208 }, // .btn-primary 11px 28px      (globals.css:658-671)
  { t: 1.00,     v: 46  }, // click -> collapse to a circle
  { t: st(7),    v: 176 }, // TopBar wordmark island      (TopBar.tsx:88-112)
  { t: st(11),   v: 180 }, // FieldNumber                 (FieldNumber.tsx:56-72)
  { t: st(13),   v: 200 }, // SplashScreen track 200x4    (SplashScreen.tsx:268-274)
  { t: st(17),   v: 44  }, // FieldToggle track 44x24     (FieldToggle.tsx:43-46)
  { t: st(19),   v: 300 }, // tab bar                     [INVENT]
  { t: st(22),   v: 520 }, // .vinci-card                 (globals.css:528-541)
  { t: st(24),   v: 420 }, // command field
  { t: st(27),   v: 360 }, // toast / AuditFooter stamp
  { t: 13.60,    v: 208 }, // back to the button
]);

const H = track([
  { t: 0,      v: 46 }, { t: 1.00, v: 46 }, { t: st(7), v: 46 },
  { t: st(11), v: 44 },
  { t: st(13), v: 4  },
  { t: st(17), v: 24 },
  { t: st(19), v: 56 },
  { t: st(22), v: 300 },
  { t: st(24), v: 44 },
  { t: st(27), v: 40 },
  { t: 13.60,  v: 46 },
]);

const R = track([
  { t: 0,      v: 999 }, { t: 1.00, v: 999 }, { t: st(7), v: 999 },
  { t: st(11), v: 4   }, // --r-md  (globals.css:76)
  { t: st(13), v: 2   }, // SplashScreen track radius
  { t: st(17), v: 12  }, // FieldToggle track radius
  { t: st(19), v: 28  },
  { t: st(22), v: 8   }, // --r-lg  (globals.css:77)
  { t: st(24), v: 8   },
  { t: st(27), v: 999 },
  { t: 13.60,  v: 999 },
]);

// K is chosen so each state's dominant dimension lands near 1000-1200 px of a
// 1440 frame, while keeping that state's own border:radius:type ratios true.
const K = track([
  { t: 0,         v: 5.00 }, // 208 x 5.00 = 1040
  { t: 1.00,      v: 13.5 }, //  46 x 13.5 =  621
  { t: stK(7),    v: 5.60 }, // 176 x 5.60 =  986
  { t: stK(11),   v: 5.40 }, // 180 x 5.40 =  972
  { t: stK(13),   v: 5.20 }, // 200 x 5.20 = 1040
  { t: stK(17),   v: 18.0 }, //  44 x 18.0 =  792
  { t: stK(19),   v: 3.60 }, // 300 x 3.60 = 1080
  { t: stK(22),   v: 2.40 }, // 520 x 2.40 = 1248 w, 300 x 2.40 = 720 h
  { t: stK(24),   v: 2.80 }, // 420 x 2.80 = 1176
  { t: stK(27),   v: 3.10 }, // 360 x 3.10 = 1116
  { t: 13.60,     v: 5.00 },
], CAM);

// .cl-cta-pill:active scale(0.98), 0.12s  (BottomTabBar.tsx:454)
const PRESS = track([{ t: 0, v: 1 }, { t: 1.00, v: 0.98 }, { t: 1.12, v: 1 }]);

// ─── Bars 4-5: the ampacity drag ───────────────────────────────────────────
// Direct manipulation: while held the value comes from the cursor position; on
// release it springs back from wherever it was. Past 100% the bar stretches
// using PullToRefresh's OWN rubber-band law (PullToRefresh.tsx:78) rather than
// an invented curve:  eased = 115 * (1 - exp(-dy / 90))
// Beat 14 grabs, beat 15 is maximum stretch, beat 16 is settled.
const GRAB = 6.78;
const REL = 7.45;
const FILL_BASE = track([{ t: 0, v: 0 }, { t: st(13), v: 0.78 }], POP);

function fillPct(t: number): number {
  if (t < GRAB) return FILL_BASE(t);
  if (t < REL) return 0.78 + 0.40 * clamp01((t - GRAB) / (REL - GRAB));
  return 1.18 + (1.00 - 1.18) * stepResp(t - REL, POP.w, POP.z);
}

function overflowPx(t: number): number {
  const over = Math.max(0, fillPct(t) - 1) * 200;
  return 115 * (1 - Math.exp(-over / 90));
}

// ─── Bars 5-6: dual-edge springs ───────────────────────────────────────────
const knobLead  = track([{ t: 0, v: 4 }, { t: 8.75, v: 24 }], EDGE_L);
const knobTrail = track([{ t: 0, v: 4 }, { t: 8.75, v: 24 }], EDGE_T);
const TABX = [0, 75, 150, 225]; // four slots across 300 native px
const tabLead  = track([{ t: 0, v: 0 }, { t: 9.80, v: TABX[1] }, { t: 10.30, v: TABX[0] }], EDGE_L);
const tabTrail = track([{ t: 0, v: 0 }, { t: 9.80, v: TABX[1] }, { t: 10.30, v: TABX[0] }], EDGE_T);

// ─── Bar 3: the ThemeToggle wipe ───────────────────────────────────────────
// View Transition circle(0) -> circle(endRadius), 580 ms,
// cubic-bezier(0.22,1,0.36,1), plus btnBurst scale 1 -> 1.38 over 400 ms.
// (ThemeToggle.tsx:60-107, :131-133). Each wipe must be COMPLETE on its beat,
// so it starts 0.45 s before it.
const WIPE1 = 4.05;
const WIPE2 = 5.05;
const easeQuint = (x: number): number => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 5));

function wipeState(t: number): number {
  return clamp01(easeQuint((t - WIPE1) / 0.580) - easeQuint((t - WIPE2) / 0.580));
}

function burst(t: number): number {
  const p = Math.max(clamp01((t - WIPE1) / 0.40), clamp01((t - WIPE2) / 0.40));
  return 1 + 0.38 * (p < 1 ? Math.sin(p * Math.PI) : 0);
}

// ─── Cursor ────────────────────────────────────────────────────────────────
// Positions are derived from each state's on-screen geometry (native size x its
// camera K, centred on the frame), so the cursor lands on the thing it operates
// rather than near it. [INVENT: CursorGlow.tsx returns null — the repo has no
// drawn cursor, no pointer sprite and no click ripple.]
//
// Each segment uses smoothstep, whose derivative is zero at both endpoints, so
// the cursor's speed as well as its position matches across the loop seam.
interface Way { t: number; x: number; y: number }
const CURSOR: Way[] = [
  { t: 0.00,  x: 1180, y: 1180 },
  { t: 0.50,  x: 770,  y: 760  }, // lands on the button
  { t: 1.00,  x: 762,  y: 752  }, // click
  { t: 1.60,  x: 742,  y: 744  },
  { t: 3.30,  x: 800,  y: 728  },
  { t: 4.05,  x: 846,  y: 720  }, // ThemeToggle — first click
  { t: 5.05,  x: 846,  y: 720  }, // second click, back to light
  { t: 5.85,  x: 1130, y: 720  }, // the + stepper
  { t: 6.78,  x: 1011, y: 720  }, // grabs the fill at 78% of the 1040 px track
  { t: 7.45,  x: 1338, y: 720  }, // drags to the stretched right edge
  { t: 7.60,  x: 1338, y: 720  }, // release
  { t: 8.75,  x: 860,  y: 720  }, // toggle
  { t: 9.80,  x: 585,  y: 720  }, // tab VSD   (slot 1 centre)
  { t: 10.30, x: 315,  y: 720  }, // tab CABLE (slot 0 centre)
  { t: 11.42, x: 806,  y: 693  }, // onto the curve at 45 degC
  { t: 12.28, x: 500,  y: 720  }, // types
  { t: 12.95, x: 500,  y: 720  }, // enter
  { t: 13.40, x: 900,  y: 900  }, // leaves
  { t: 14.00, x: 1180, y: 1180 }, // == t=0
];

function cursorAt(t: number): { x: number; y: number } {
  for (let i = 0; i < CURSOR.length - 1; i++) {
    const a = CURSOR[i];
    const c = CURSOR[i + 1];
    if (t >= a.t && t <= c.t) {
      const p = c.t - a.t ? (t - a.t) / (c.t - a.t) : 0;
      const e = p * p * (3 - 2 * p);
      return { x: lerp(a.x, c.x, e), y: lerp(a.y, c.y, e) };
    }
  }
  return { x: CURSOR[0].x, y: CURSOR[0].y };
}

// The ring starts 0.06 s BEFORE the click so it is already visible in a frame
// captured exactly on the beat — otherwise sin(0) = 0 and the beat looks inert.
const CLICKS = [1.00, 4.05, 5.05, 5.85, 8.75, 9.80, 10.30, 12.95];

function clickPulse(t: number): number {
  let m = 0;
  for (const c of CLICKS) {
    const p = (t - c + 0.06) / 0.30;
    if (p >= 0 && p <= 1) m = Math.max(m, Math.sin(p * Math.PI));
  }
  return m;
}

// ─── Palettes (app/globals.css:115-231) ────────────────────────────────────
interface Palette {
  bg: string; fg: string; chrome: string; face: string;
  border: string; glass: string; muted: string; spend: string;
  trackBg: string; dot: string;
  toggleOff: string; knobOff: string; knobOn: string;
}

const LIGHT: Palette = {
  bg: '#F5E6DF', fg: '#000000', chrome: '#000000', face: '#FAF9F5',
  border: 'rgba(0,0,0,0.16)', glass: 'rgba(245,230,223,0.80)',
  muted: 'rgba(0,0,0,0.55)',
  // In light theme --accent IS #000000 (globals.css:131). #D97757 lives at
  // --bg-accent (:121) and --selection-bg (:143). Spending it as THE accent is
  // a recorded brand decision, not a token reading. See HANDOFF.md.
  spend: '#D97757',
  trackBg: 'rgba(0,0,0,0.15)', dot: 'rgba(0,0,0,0.16)',
  // The shipped FieldToggle puts a --muted (#0F0F0F) knob on a --hairline
  // (#3d372e) track when off — dark on dark. At 44 px that passes unnoticed;
  // at 792 px it reads as a fault, so --parchment-low is used instead.
  toggleOff: '#3d372e', knobOff: '#b0aea5', knobOn: '#FAF9F5',
};

const DARK: Palette = {
  bg: '#141413', fg: '#faf9f5', chrome: '#faf9f5', face: '#1f1f1e',
  border: 'rgba(250,249,245,0.08)', glass: 'rgba(31,31,30,0.65)',
  muted: '#908e86', spend: '#d97757',
  trackBg: 'rgba(217,119,87,0.15)', dot: 'rgba(250,249,245,0.06)',
  toggleOff: '#3d372e', knobOff: '#908e86', knobOn: '#0d1016',
};

// ─── Real engineering content ──────────────────────────────────────────────
// IEC 60364-5-52 Table B.52.14 — ambient temperature correction factors,
// 30 degC reference, cables in air. Never fabricate catalogue data (AGENTS.md).
const DERATE_PVC: Array<[number, number]> =
  [[25, 1.06], [30, 1.00], [35, 0.94], [40, 0.87], [45, 0.79], [50, 0.71], [55, 0.61], [60, 0.50]];
const DERATE_XLPE: Array<[number, number]> =
  [[25, 1.04], [30, 1.00], [35, 0.96], [40, 0.91], [45, 0.87], [50, 0.82], [55, 0.76], [60, 0.71]];
const TABS = ['CABLE', 'VSD', 'BREAKER', 'PANEL'];

// lucide-react@1.7.0; the repo's stroke-width is 2.4 (ShareButton.tsx:73).
const ICON_CHECK = 'M20 6 9 17l-5-5';
const ICON_SEARCH = 'm21 21-4.34-4.34';

// The var() carries its OWN fallback. Without one, an undefined --font-inter
// makes var(--font-inter) guaranteed-invalid, which invalidates the WHOLE
// font-family declaration — the element then falls back to the inherited font,
// not to the rest of the list. That bites exactly when the engine is embedded
// somewhere next/font has not defined the variable, and it is the same trap as
// the self-referential --font-mono at globals.css:33.
const FONT_SANS = "var(--font-inter, Inter), system-ui, sans-serif";
// Not var(--font-mono): globals.css:33 declares that property in terms of
// itself, which is invalid at computed-value time. The literal stack is used.
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

const NS = 'http://www.w3.org/2000/svg';

function div(parent: HTMLElement | null): HTMLDivElement {
  const n = document.createElement('div');
  if (parent) parent.appendChild(n);
  return n;
}

function sv<K extends keyof SVGElementTagNameMap>(
  tag: K, attrs: Record<string, string | number> | null, parent: Element | null,
): SVGElementTagNameMap[K] {
  const n = document.createElementNS(NS, tag);
  if (attrs) for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  if (parent) parent.appendChild(n);
  return n;
}

const LAYER_IDS = ['btn', 'load', 'check', 'island', 'field', 'bar',
                   'toggle', 'tabs', 'chart', 'cmdk', 'toast'] as const;
type LayerId = typeof LAYER_IDS[number];

interface Stack {
  root: HTMLDivElement;
  bg: HTMLDivElement;
  shape: HTMLDivElement;
  box: Record<LayerId, HTMLDivElement>;
  el: Record<string, HTMLElement>;
  ldSvg: SVGSVGElement; ldArc: SVGCircleElement;
  ckSvg: SVGSVGElement; ckPath: SVGPathElement;
  chSvg: SVGSVGElement; chGrid: SVGGElement;
  chP1: SVGPathElement; chP2: SVGPathElement;
  chDot: SVGCircleElement; chTipBox: SVGRectElement; chTip: SVGTextElement;
  chAxis: SVGTextElement[];
  cmSvg: SVGSVGElement;
  tabTxt: HTMLElement[];
}

// Chart geometry, in native units inside a 520x300 viewBox.
const PLOT = { x: 56, y: 48, w: 420, h: 190 };
const cx = (temp: number): number => PLOT.x + ((temp - 25) / 35) * PLOT.w;
const cy = (f: number): number => PLOT.y + ((1.10 - f) / 0.65) * PLOT.h;
const pathFor = (pts: Array<[number, number]>): string =>
  pts.map((p, i) => (i ? 'L' : 'M') + cx(p[0]).toFixed(2) + ' ' + cy(p[1]).toFixed(2)).join(' ');
const D_PVC = pathFor(DERATE_PVC);
const D_XLPE = pathFor(DERATE_XLPE);

export interface MorphOptions {
  /** Paint the canvas colour and dot lattice. Off when the host page already has them. */
  paintBackground?: boolean;
  /** Frame size in px. The composition is authored for a 1440 square. */
  frame?: { w: number; h: number };
  /**
   * Uniform scale, for rendering the 1440-authored composition into a smaller
   * box. It multiplies the camera rather than applying a CSS transform, so text
   * is still laid out at its final pixel size and stays crisp — a
   * transform: scale() wrapper would rasterise it at the wrong size.
   * Pass frame as the already-scaled box, e.g. { w: 720, h: 720 } with scale 0.5.
   */
  scale?: number;
}

export interface MorphHandle {
  seek(t: number): void;
  readonly duration: number;
  destroy(): void;
}

function buildStack(): Stack {
  const root = div(null);
  root.style.cssText = 'position:absolute;inset:0;overflow:hidden';
  const bg = div(root);
  bg.style.cssText = 'position:absolute;inset:0';
  const shape = div(root);
  shape.style.cssText = 'position:absolute;overflow:hidden';
  const sat = div(root);
  sat.style.cssText = 'position:absolute;inset:0;pointer-events:none';

  const box = {} as Record<LayerId, HTMLDivElement>;
  for (const id of LAYER_IDS) {
    const d = div(shape);
    d.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;' +
                      'justify-content:center;white-space:nowrap';
    box[id] = d;
  }
  const el: Record<string, HTMLElement> = {};
  const span = (parent: HTMLElement, key: string): HTMLElement => {
    const s = document.createElement('span');
    parent.appendChild(s);
    el[key] = s;
    return s;
  };

  span(box.btn, 'btnText');

  const ldSvg = sv('svg', { viewBox: '0 0 46 46', fill: 'none' }, box.load);
  const ldArc = sv('circle', { cx: 23, cy: 23, r: 15, fill: 'none', 'stroke-linecap': 'round' }, ldSvg);

  const ckSvg = sv('svg', { viewBox: '0 0 24 24', fill: 'none' }, box.check);
  const ckPath = sv('path', {
    d: ICON_CHECK, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
  }, ckSvg);

  box.island.style.alignItems = 'baseline';
  span(box.island, 'wmDumm');
  span(box.island, 'wmVinci');
  span(box.island, 'wmSuite');

  box.field.style.justifyContent = 'space-between';
  span(box.field, 'fdMinus');
  span(box.field, 'fdVal');
  span(box.field, 'fdPlus');

  box.bar.style.justifyContent = 'flex-start';
  const barFill = div(box.bar);
  barFill.style.height = '100%';
  el.barFill = barFill;

  box.toggle.style.justifyContent = 'flex-start';
  const knob = div(box.toggle);
  el.knob = knob;

  const tabInd = div(box.tabs);
  el.tabInd = tabInd;
  const tabTxt = TABS.map(() => {
    const s = document.createElement('span');
    box.tabs.appendChild(s);
    return s as HTMLElement;
  });

  const chSvg = sv('svg', { viewBox: '0 0 520 300', fill: 'none' }, box.chart);
  const chGrid = sv('g', null, chSvg);
  for (let i = 0; i < 5; i++) sv('line', null, chGrid);
  const chP1 = sv('path', { d: D_PVC, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, chSvg);
  const chP2 = sv('path', { d: D_XLPE, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, chSvg);
  const chDot = sv('circle', { r: 4 }, chSvg);
  const chTipBox = sv('rect', { rx: 4 }, chSvg);
  const chTip = sv('text', { 'text-anchor': 'middle' }, chSvg);
  const chAxis: SVGTextElement[] = [];
  for (let i = 0; i < 4; i++) chAxis.push(sv('text', { 'text-anchor': 'middle' }, chSvg));

  box.cmdk.style.justifyContent = 'flex-start';
  const cmSvg = sv('svg', { viewBox: '0 0 24 24', fill: 'none' }, box.cmdk);
  sv('circle', { cx: 11, cy: 11, r: 8, fill: 'none' }, cmSvg);
  sv('path', { d: ICON_SEARCH, fill: 'none', 'stroke-linecap': 'round' }, cmSvg);
  span(box.cmdk, 'cmText');
  span(box.cmdk, 'cmChip');

  span(box.toast, 'toText');

  const satLabel = div(sat);
  satLabel.style.cssText = 'position:absolute;white-space:nowrap';
  el.satLabel = satLabel;
  const satRow = div(sat);
  satRow.style.cssText = 'position:absolute;white-space:nowrap';
  el.satRow = satRow;

  return { root, bg, shape, box, el, ldSvg, ldArc, ckSvg, ckPath,
           chSvg, chGrid, chP1, chP2, chDot, chTipBox, chTip, chAxis, cmSvg, tabTxt };
}

export function createMorph(stage: HTMLElement, opts: MorphOptions = {}): MorphHandle {
  const paintBg = opts.paintBackground ?? true;
  const S = opts.scale ?? 1;
  const FW = opts.frame?.w ?? 1440;
  const FH = opts.frame?.h ?? 1440;
  const CXp = FW / 2;
  const CYp = FH / 2;

  const SL = buildStack();
  const SD = buildStack();
  stage.appendChild(SL.root);
  stage.appendChild(SD.root);

  const cursorSvg = sv('svg', { width: 260, height: 260 }, stage);
  cursorSvg.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none';
  const curRing = sv('circle', { fill: 'none' }, cursorSvg);
  const curArrow = sv('path', { 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, cursorSvg);

  const LEN_PVC = SL.chP1.getTotalLength();
  const LEN_XLPE = SL.chP2.getTotalLength();

  function paint(St: Stack, t: number, P: Palette): void {
    const k = K(t) * S;
    const u = (v: number): string => v * k + 'px';
    const el = St.el;

    if (paintBg) {
      // globals.css:239-244. 1440/80 = 18, so the lattice tiles the square
      // frame with no partial cell at the edge.
      St.bg.style.background = P.bg;
      St.bg.style.backgroundImage =
        'radial-gradient(circle at 1px 1px,' + P.dot + ' .5px,transparent 0)';
      St.bg.style.backgroundSize = '80px 80px';
    }

    const w = (W(t) + overflowPx(t)) * k;
    const h = H(t) * k;
    const scale = PRESS(t) * (t > WIPE1 - 0.05 && t < WIPE2 + 0.60 ? burst(t) : 1);
    const sw = w * scale;
    const sh = h * scale;
    const sst = St.shape.style;
    sst.width = sw + 'px';
    sst.height = sh + 'px';
    sst.left = CXp - sw / 2 + 'px';
    sst.top = CYp - sh / 2 + 'px';
    sst.borderRadius = Math.min(R(t) * k, sh / 2) + 'px';

    // Skin, decided by time window rather than layer opacity so it never lags a
    // morph. No box-shadow and no background-image anywhere: the recorded brand
    // decision is "clean chrome, our motion", so .btn-primary:hover's 24 px
    // accent glow (globals.css:685) is deliberately not reproduced.
    const isTrack = t >= 6.20 && t < 8.28;
    const isToggle = t >= 8.20 && t < 9.28;
    const isToast = t >= 13.20 && t < 13.70;
    const knobOn = knobLead(t) > 12;
    if (isToast) { sst.background = P.chrome; sst.border = 'none'; }
    else if (isToggle) { sst.background = knobOn ? P.chrome : P.toggleOff; sst.border = 'none'; }
    else if (isTrack) { sst.background = P.trackBg; sst.border = 'none'; }
    else {
      const flash = clamp01(1 - Math.abs(t - 13.02) / 0.14); // beat 26: the Enter
      sst.background = P.glass;
      sst.border = (1 * k).toFixed(2) + 'px solid ' + (flash > 0.5 ? P.spend : P.chrome);
    }
    sst.boxShadow = 'none';
    sst.backdropFilter = 'none';
    sst.backgroundImage = 'none';

    const setL = (id: LayerId, o: number): void => {
      const n = St.box[id];
      n.style.opacity = String(o);
      n.style.filter = o < 0.999 ? 'blur(' + ((1 - o) * 1.6 * k).toFixed(2) + 'px)' : 'none';
      n.style.visibility = o <= 0.001 ? 'hidden' : 'visible';
    };

    // button ---------------------------------------------------------------
    el.btnText.textContent = 'CABLE SIZING';
    el.btnText.style.cssText = 'font-family:' + FONT_SANS +
      ';font-weight:600;text-transform:uppercase;color:' + P.chrome +
      ';font-size:' + u(13) + ';letter-spacing:' + u(13 * 0.04) + ';line-height:1';
    setL('btn', Math.max(vis(t, -0.50, 1.02), vis(t, 13.82, 14.60))); // wraps the seam

    // loader ---------------------------------------------------------------
    const lp = clamp01((t - 1.20) / 1.00);
    St.ldSvg.setAttribute('width', u(46));
    St.ldSvg.setAttribute('height', u(46));
    St.ldArc.setAttribute('stroke', P.spend);
    St.ldArc.setAttribute('stroke-width', '3');
    const C = 2 * Math.PI * 15;
    St.ldArc.setAttribute('stroke-dasharray', String(C));
    St.ldArc.setAttribute('stroke-dashoffset', String(C * (1 - lp)));
    St.ldArc.setAttribute('transform', 'rotate(' + (-90 + lp * 180) + ' 23 23)');
    setL('load', vis(t, 1.28, 2.18));

    // check — [INVENT] no dashoffset reveal exists in the repo ---------------
    const cp = clamp01((t - 2.20) / 0.28);
    St.ckSvg.setAttribute('width', u(24));
    St.ckSvg.setAttribute('height', u(24));
    St.ckPath.setAttribute('stroke', P.chrome);
    St.ckPath.setAttribute('stroke-width', '2.4');
    St.ckPath.setAttribute('stroke-dasharray', '24');
    St.ckPath.setAttribute('stroke-dashoffset', String(24 * (1 - cp)));
    setL('check', vis(t, 2.30, 3.18));

    // island / wordmark (TopBar.tsx:88-112) ---------------------------------
    // Inter ships no italic here (layout.tsx:18 has no `style` key), so this
    // renders synthetic oblique — matching the site exactly.
    el.wmDumm.textContent = 'PTTS';
    el.wmDumm.style.cssText = 'font-family:' + FONT_SANS +
      ';font-weight:300;font-style:italic;opacity:.7;color:' + P.fg +
      ';font-size:' + u(17) + ';letter-spacing:' + u(-0.34) + ';line-height:1.1';
    el.wmVinci.textContent = 'Praxis';
    el.wmVinci.style.cssText = 'font-family:' + FONT_SANS +
      ';font-weight:700;color:' + P.chrome + ';font-size:' + u(17) +
      ';letter-spacing:' + u(-0.34) + ';margin-left:' + u(2.55) + ';line-height:1.1';
    el.wmSuite.textContent = 'SUITE';
    el.wmSuite.style.cssText = 'font-family:' + FONT_MONO +
      ';font-weight:500;opacity:.5;color:' + P.chrome + ';font-size:' + u(8) +
      ';letter-spacing:' + u(1.2) + ';margin-left:' + u(4) + ';text-transform:uppercase';
    setL('island', vis(t, 3.28, 5.18));

    // field — 125 A steps to 160 A, settled ON beat 12 ----------------------
    const amp = Math.round(125 + 35 * stepResp(t - 5.75, 34, 1));
    const stepCss = 'font-family:' + FONT_SANS + ';font-size:' + u(17) +
                    ';font-weight:500;padding:0 ' + u(14) + ';color:';
    el.fdMinus.textContent = '−';
    el.fdMinus.style.cssText = stepCss + P.muted;
    el.fdPlus.textContent = '+';
    el.fdPlus.style.cssText = stepCss + P.chrome;
    el.fdVal.textContent = amp + ' A';
    el.fdVal.style.cssText = 'font-family:' + FONT_MONO + ';color:' + P.fg +
      ';font-size:' + u(17) + ';font-weight:500';
    St.box.field.style.padding = '0 ' + u(6);
    setL('field', vis(t, 5.28, 6.18));

    // ampacity bar ----------------------------------------------------------
    const fp = fillPct(t);
    el.barFill.style.width = Math.min(fp, 1) * 100 + '%';
    el.barFill.style.background = fp > 1.001 ? P.spend : P.chrome;
    setL('bar', vis(t, 6.28, 8.18));

    // toggle knob — two springs, so it stretches in flight -------------------
    const kl = knobLead(t);
    const kt = knobTrail(t);
    el.knob.style.cssText = 'position:absolute;top:' + u(4) +
      ';left:' + u(Math.min(kl, kt)) +
      ';width:' + u(Math.abs(kl - kt) + 16) + ';height:' + u(16) +
      ';border-radius:' + u(8) + ';background:' + (kl > 12 ? P.knobOn : P.knobOff);
    setL('toggle', vis(t, 8.28, 9.18));

    // tabs — the indicator's two edges ride different springs [INVENT] -------
    const tl = tabLead(t);
    const tt = tabTrail(t);
    el.tabInd.style.cssText = 'position:absolute;left:' + u(Math.min(tl, tt)) +
      ';top:' + u(6) + ';width:' + u(Math.abs(tl - tt) + 75) + ';height:' + u(44) +
      ';border-radius:' + u(22) + ';background:' + P.chrome;
    TABS.forEach((name, i) => {
      const s = St.tabTxt[i];
      const on = Math.abs(TABX[i] - (tl + tt) / 2) < 38;
      s.textContent = name;
      s.style.cssText = 'position:absolute;font-family:' + FONT_MONO +
        ';left:' + u(TABX[i]) + ';top:' + u(21) + ';width:' + u(75) +
        ';text-align:center;font-size:' + u(11) + ';font-weight:700' +
        ';letter-spacing:' + u(1.54) + ';color:' + (on ? P.bg : P.muted);
    });
    setL('tabs', vis(t, 9.28, 10.68));

    // chart — IEC 60364-5-52 Table B.52.14 -----------------------------------
    St.chSvg.setAttribute('width', u(520));
    St.chSvg.setAttribute('height', u(300));
    for (let i = 0; i < 5; i++) {
      const y = PLOT.y + (i * PLOT.h) / 4;
      const ln = St.chGrid.children[i];
      ln.setAttribute('x1', String(PLOT.x));
      ln.setAttribute('x2', String(PLOT.x + PLOT.w));
      ln.setAttribute('y1', String(y));
      ln.setAttribute('y2', String(y));
      ln.setAttribute('stroke', P.border);
      ln.setAttribute('stroke-width', '1');
    }
    const dp = clamp01((t - 10.82) / 0.30);
    const dp2 = clamp01((t - 11.12) / 0.28);
    const tipOn = clamp01((t - 11.40) / 0.10);
    St.chP1.setAttribute('stroke', P.chrome);
    St.chP1.setAttribute('stroke-width', '3');
    St.chP1.setAttribute('stroke-dasharray', String(LEN_PVC));
    St.chP1.setAttribute('stroke-dashoffset', String(LEN_PVC * (1 - dp)));
    St.chP2.setAttribute('stroke', P.spend);
    St.chP2.setAttribute('stroke-width', '2');
    St.chP2.setAttribute('stroke-dasharray', String(LEN_XLPE));
    St.chP2.setAttribute('stroke-dashoffset', String(LEN_XLPE * (1 - dp2)));
    St.chDot.setAttribute('cx', String(cx(45)));
    St.chDot.setAttribute('cy', String(cy(0.79)));
    St.chDot.setAttribute('fill', P.chrome);
    St.chDot.setAttribute('opacity', String(tipOn));
    St.chTipBox.setAttribute('x', String(cx(45) - 74));
    St.chTipBox.setAttribute('y', String(cy(0.79) - 40));
    St.chTipBox.setAttribute('width', '148');
    St.chTipBox.setAttribute('height', '26');
    St.chTipBox.setAttribute('fill', P.chrome);
    St.chTipBox.setAttribute('opacity', String(tipOn));
    St.chTip.setAttribute('x', String(cx(45)));
    St.chTip.setAttribute('y', String(cy(0.79) - 22));
    St.chTip.setAttribute('fill', P.bg);
    St.chTip.setAttribute('opacity', String(tipOn));
    St.chTip.setAttribute('font-size', '13');
    St.chTip.setAttribute('font-family', FONT_MONO);
    St.chTip.textContent = '45 °C → 0.79 × In';
    [30, 40, 50, 60].forEach((tv, i) => {
      const a = St.chAxis[i];
      a.setAttribute('x', String(cx(tv)));
      a.setAttribute('y', String(PLOT.y + PLOT.h + 26));
      a.setAttribute('fill', P.muted);
      a.setAttribute('font-size', '12');
      a.setAttribute('font-family', FONT_MONO);
      a.textContent = tv + '°';
    });
    setL('chart', vis(t, 10.78, 11.68));

    // command palette — types "bus" on 1/8-beat subdivisions ----------------
    let typed = '';
    for (let i = 0; i < 3; i++) if (t >= 12.28 + i * 0.0625) typed += 'bus'[i];
    St.cmSvg.setAttribute('width', u(18));
    St.cmSvg.setAttribute('height', u(18));
    St.cmSvg.style.cssText = 'margin-left:' + u(14) + ';flex:0 0 auto';
    Array.from(St.cmSvg.children).forEach(c => {
      c.setAttribute('stroke', P.muted);
      c.setAttribute('stroke-width', '2.4');
    });
    el.cmText.textContent = typed || 'Cari kalkulator…';
    el.cmText.style.cssText = 'font-family:' + (typed ? FONT_MONO : FONT_SANS) +
      ';margin-left:' + u(10) + ';font-size:' + u(15) +
      ';color:' + (typed ? P.fg : P.muted) + ';font-weight:500';
    el.cmChip.textContent = '⌘K';
    el.cmChip.style.cssText = 'position:absolute;font-family:' + FONT_MONO +
      ';right:' + u(14) + ';top:50%;transform:translateY(-50%)' +
      ';font-size:' + u(10) + ';font-weight:700;color:' + P.muted +
      ';border:' + (1 * k).toFixed(2) + 'px solid ' + P.border +
      ';border-radius:' + u(8) + ';padding:' + u(4) + ' ' + u(8) +
      ';letter-spacing:' + u(0.6);
    setL('cmdk', vis(t, 11.78, 13.18));

    // toast — AuditFooter ISO 9001 traceability strip ------------------------
    el.toText.textContent = 'ƒ a3f9c2 · DIN 43671 ✓ · By DummVinci';
    el.toText.style.cssText = 'font-family:' + FONT_MONO + ';font-size:' + u(11) +
      ';font-weight:700;letter-spacing:' + u(1.54) +
      ';text-transform:uppercase;color:' + P.bg;
    setL('toast', vis(t, 13.28, 13.66));

    // satellites -------------------------------------------------------------
    const barLbl = vis(t, 6.28, 8.18);
    const over = fp > 1.001;
    el.satLabel.textContent = barLbl > 0.02
      ? (over ? 'OVERLOAD ' + Math.round(fp * 100) + '%' : 'AMPACITY ' + Math.round(fp * 100) + '%')
      : 'ARUS BEBAN';
    el.satLabel.style.cssText = 'position:absolute;white-space:nowrap;font-family:' + FONT_MONO +
      ';opacity:' + Math.max(barLbl, vis(t, 5.28, 6.18)) +
      ';left:0;right:0;text-align:center;top:' + (CYp - (H(t) * k) / 2 - 34 * k) + 'px' +
      ';font-size:' + u(11) + ';font-weight:700;letter-spacing:' + u(0.66) +
      ';text-transform:uppercase;color:' + (over ? P.spend : P.muted);

    el.satRow.textContent = 'Busbar Sizing — DIN 43671';
    el.satRow.style.cssText = 'position:absolute;white-space:nowrap;font-family:' + FONT_MONO +
      ';opacity:' + vis(t, 12.38, 12.88) +
      ';left:0;right:0;text-align:center;top:' + (CYp + (H(t) * k) / 2 + 22 * k) + 'px' +
      ';font-size:' + u(12) + ';font-weight:500;color:' + P.fg;
  }

  function seek(t: number): void {
    const tt = ((t % DURATION) + DURATION) % DURATION;
    paint(SL, tt, LIGHT);
    paint(SD, tt, DARK);

    // ThemeToggle wipe — circle(0) -> circle(endRadius) from the button
    // centre, 580 ms cubic-bezier(0.22,1,0.36,1). Two identical stacks are
    // drawn and the dark one is clipped, which is what View Transition does.
    const wv = wipeState(tt);
    const wx = 846 * S;   // the ThemeToggle's centre, in the 1440-authored frame
    const wy = 720 * S;
    const endR = Math.hypot(Math.max(wx, FW - wx), Math.max(wy, FH - wy));
    SD.root.style.clipPath = 'circle(' + (wv * endR).toFixed(2) + 'px at ' + wx + 'px ' + wy + 'px)';
    SD.root.style.display = wv <= 0.0001 ? 'none' : 'block';

    // The cursor is screen-space: a real pointer does not zoom with the camera.
    // The sprite box is centred on the tip so the click ring can expand in
    // every direction without clipping the viewBox.
    const c = cursorAt(tt);
    const pulse = clickPulse(tt);
    const P = wv > 0.5 ? DARK : LIGHT;
    const CS = 260 * S;
    const TIP = CS / 2;
    cursorSvg.setAttribute('width', String(CS));
    cursorSvg.setAttribute('height', String(CS));
    cursorSvg.setAttribute('viewBox', '0 0 ' + CS + ' ' + CS);
    cursorSvg.style.left = c.x * S - TIP + 'px';
    cursorSvg.style.top = c.y * S - TIP + 'px';
    // viewBox units equal px here (width === viewBox), so the sprite's own
    // dimensions carry the scale too, keeping it proportional to the content.
    const a = (n: number): number => n * S;
    curArrow.setAttribute('d',
      'M' + TIP + ' ' + TIP +
      ' l0 ' + a(58) + ' l' + a(15) + ' ' + a(-15) +
      ' l' + a(11) + ' ' + a(23) + ' l' + a(11) + ' ' + a(-5) +
      ' l' + a(-11) + ' ' + a(-23) + ' l' + a(20) + ' ' + a(-2) + ' Z');
    curArrow.setAttribute('fill', P.bg);
    curArrow.setAttribute('stroke', P.fg);
    curArrow.setAttribute('stroke-width', String(a(4)));
    curRing.setAttribute('cx', String(TIP));
    curRing.setAttribute('cy', String(TIP));
    curRing.setAttribute('r', String(a(14 + pulse * 62)));
    curRing.setAttribute('stroke', P.fg);
    curRing.setAttribute('stroke-width', String(a(4)));
    curRing.setAttribute('opacity', String(pulse * 0.5));
  }

  return {
    seek,
    duration: DURATION,
    destroy(): void {
      SL.root.remove();
      SD.root.remove();
      cursorSvg.remove();
    },
  };
}
