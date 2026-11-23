import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({args:['--force-color-profile=srgb','--font-render-hinting=none','--disable-lcd-text']});
const p = await b.newPage({viewport:{width:1440,height:1440}, deviceScaleFactor:1, reducedMotion:'no-preference'});
await p.goto(pathToFileURL(path.resolve('ptts-praxis-morph.html')).href + '?capture=1');
await p.waitForFunction(() => window.__ready === true);
await p.evaluate(() => document.fonts.ready);
// also check the frame BEFORE the wrap and the frame AFTER, at 60fps
for (const [a,c] of [[0, 14.0], [0, 13.999], [1/60, 14 + 1/60]]) {
  await p.evaluate(t=>window.seek(t), a); const A = await p.screenshot();
  await p.evaluate(t=>window.seek(t), c); const C = await p.screenshot();
  console.log(`seek(${a}) vs seek(${c}):  ${A.equals(C) ? 'IDENTICAL' : 'DIFFER ('+A.length+' vs '+C.length+' bytes)'}`);
}
// determinism: same t twice, out of order
await p.evaluate(()=>window.seek(9.37)); const X = await p.screenshot();
await p.evaluate(()=>window.seek(2.10));
await p.evaluate(()=>window.seek(9.37)); const Y = await p.screenshot();
console.log('determinism seek(9.37) after seek(2.10):', X.equals(Y) ? 'IDENTICAL' : 'DIFFER');
await b.close();
