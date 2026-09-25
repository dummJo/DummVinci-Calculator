// Deterministic capture driver.
//
//   node capture.mjs beats            -> one PNG per beat (28 frames), for review
//   node capture.mjs full <fps> <sub> -> every subframe, streamed to stdout as
//                                        raw RGBA for ffmpeg to blend + encode
//
// Chromium is launched WITHOUT prefers-reduced-motion emulation. The standalone
// file does not import app/globals.css, but globals.css:875-890 neutralises
// every animation under that query, so the habit matters for any future capture
// that renders the real site.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const mode = process.argv[2] || 'beats';
const FPS  = Number(process.argv[3] || 60);
const SUB  = Number(process.argv[4] || 4);
const W = Number(process.env.CAP_W || 1440);
const H = Number(process.env.CAP_H || 1440);

const file = pathToFileURL(path.resolve('ptts-praxis-morph.html')).href + '?capture=1';

const browser = await chromium.launch({
  args: ['--force-color-profile=srgb', '--font-render-hinting=none',
         '--disable-lcd-text', '--hide-scrollbars'],
});
const page = await browser.newPage({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
  reducedMotion: 'no-preference',
});
await page.goto(file, { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true);
await page.evaluate(() => document.fonts.ready);
const DUR = await page.evaluate(() => window.DUR);

if (mode === 'beats') {
  mkdirSync('frames/beats', { recursive: true });
  const BEAT = 0.5;
  for (let i = 0; i < 28; i++) {
    const t = i * BEAT;
    await page.evaluate(tt => window.seek(tt), t);
    const bar = Math.floor(i / 4) + 1, beat = (i % 4) + 1;
    const name = `frames/beats/${String(i).padStart(2,'0')}_bar${bar}.${beat}_t${t.toFixed(3)}.png`;
    await page.screenshot({ path: name });
    process.stderr.write(`beat ${bar}.${beat}  t=${t.toFixed(3)}\n`);
  }
} else {
  // Stream every subframe as raw PNG bytes on stdout; ffmpeg reads image2pipe,
  // blends SUB neighbours with tmix, and drops back to FPS.
  const total = Math.round(DUR * FPS * SUB);
  const dt = DUR / total;
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    await page.evaluate(tt => window.seek(tt), i * dt);
    const buf = await page.screenshot({ type: 'png' });
    // Respect backpressure: without this, 3360 full-size PNGs queue in memory
    // faster than ffmpeg drains them.
    if (!process.stdout.write(buf)) {
      await new Promise(r => process.stdout.once('drain', r));
    }
    if (i % 240 === 0) {
      const el = (Date.now() - t0) / 1000;
      const eta = i ? (el / i) * (total - i) : 0;
      process.stderr.write(`  ${i}/${total}  ${el.toFixed(0)}s elapsed, ~${eta.toFixed(0)}s left\n`);
    }
  }
}
await browser.close();
