import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
mkdirSync('frames/spot', {recursive:true});
const b = await chromium.launch({args:['--force-color-profile=srgb','--font-render-hinting=none','--disable-lcd-text']});
const p = await b.newPage({viewport:{width:1440,height:1440}, deviceScaleFactor:1, reducedMotion:'no-preference'});
await p.goto(pathToFileURL(path.resolve('ptts-praxis-morph.html')).href + '?capture=1');
await p.waitForFunction(() => window.__ready === true);
await p.evaluate(() => document.fonts.ready);
for (const t of process.argv.slice(2).map(Number)) {
  await p.evaluate(tt=>window.seek(tt), t);
  await p.screenshot({path:`frames/spot/t${t.toFixed(3)}.png`});
}
await b.close();
