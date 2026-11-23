import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch();
const p = await b.newPage({viewport:{width:1440,height:1440}, deviceScaleFactor:1});
await p.goto(pathToFileURL(path.resolve('ptts-praxis-morph.html')).href + '?capture=1');
await p.waitForFunction(() => window.__ready === true);
await p.evaluate(() => document.fonts.ready);
const rows = [];
for (let i=0;i<28;i++){
  const t = i*0.5;
  await p.evaluate(tt=>window.seek(tt), t);
  const r = await p.evaluate(() => {
    const s = document.querySelectorAll('div')[0].parentElement.querySelectorAll('div');
    // the first stack's shape is the 2nd child of the first stack root
    const stacks = [...document.getElementById('stage').children].filter(n=>n.tagName==='DIV');
    const shape = stacks[0].children[1];
    const q = shape.getBoundingClientRect();
    return {w:Math.round(q.width), h:Math.round(q.height), x:Math.round(q.left), y:Math.round(q.top)};
  });
  rows.push({beat:`${Math.floor(i/4)+1}.${i%4+1}`, t:t.toFixed(2), ...r,
             wPct:(r.w/1440*100).toFixed(0)+'%', hPct:(r.h/1440*100).toFixed(0)+'%'});
}
console.table(rows);
await b.close();
