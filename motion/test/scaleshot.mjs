import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({args:['--force-color-profile=srgb','--font-render-hinting=none','--disable-lcd-text']});
const p = await b.newPage({viewport:{width:720,height:720}, deviceScaleFactor:1, reducedMotion:'no-preference'});
await p.goto(pathToFileURL(path.resolve('test/scale.html')).href);
await p.waitForFunction(()=>window.__ready===true);
for (const t of [0, 9.0, 11.5, 13.5]) { await p.evaluate(tt=>window.seek(tt), t); await p.screenshot({path:`test/s${t.toFixed(1)}.png`}); }
await b.close();
