#!/usr/bin/env node
/**
 * THE MOTION DOCTRINE, CHECKED IN A REAL BROWSER.
 *
 *   node scripts/check-motion.mjs [url]
 *   (default http://localhost:4321/explainers/stardust — pass the port your
 *    dev server actually landed on)
 *
 * `npm test` asserts that the figures' draw functions are pure. This asserts
 * the thing that actually matters to a reader: drive the live page, scrub down
 * through every scrollytelling sequence, scrub back up through the identical
 * pixel positions, and compare the DOM byte for byte.
 *
 * Not part of `npm test` because it needs Chrome and a running dev server. It
 * is here because it earned its place — it caught a bug the unit tests could
 * not see: scrolly.js wrote the steps' active state only when the step INDEX
 * changed, and the markup ships with data-step="0", so on first arrival at
 * step 0 no step was ever marked active. The highlight appeared only once the
 * reader had scrolled away and come back. Pure functions, impure wiring.
 *
 * Exits non-zero on any mismatch.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const PORT = 9700 + (process.pid % 200);
const profile = mkdtempSync(join(tmpdir(), 'cdp-'));
const chrome = spawn('google-chrome-stable', ['--headless=new','--disable-gpu','--no-sandbox','--hide-scrollbars',`--remote-debugging-port=${PORT}`,`--user-data-dir=${profile}`,'--no-first-run','about:blank'], {stdio:'ignore'});
const sleep = ms => new Promise(r=>setTimeout(r,ms));
let ws;
for (let i=0;i<120;i++){ try { const j = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); ws = new WebSocket(j.webSocketDebuggerUrl); break;} catch { await sleep(120);} }
await new Promise(r=>ws.onopen=r);
let id=0; const pend=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data); if(m.id&&pend.has(m.id)){const{resolve,reject}=pend.get(m.id);pend.delete(m.id);m.error?reject(new Error(JSON.stringify(m.error))):resolve(m.result);}};
const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const mid=++id;pend.set(mid,{resolve,reject});ws.send(JSON.stringify({id:mid,method,params,sessionId}));});
const {targetId}=await send('Target.createTarget',{url:'about:blank'});
const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
const S=(m,p)=>send(m,p,sessionId);
await S('Page.enable'); await S('Runtime.enable');
await S('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await S('Page.navigate',{url:process.argv[2] || 'http://localhost:4321/explainers/stardust'});
await sleep(4000);

const STATE = `JSON.stringify({
  dt: (()=>{const f=document.querySelector('[data-deeptime]'); if(!f) return null;
    const l=f.querySelector('.scrub-line');
    return {x1:l.getAttribute('x1'),
      when:f.querySelector('[data-scrub-when]').textContent.trim(),
      what:f.querySelector('[data-scrub-what]').textContent.trim(),
      active:Array.from(f.querySelectorAll('[data-event]')).map(e=>e.getAttribute('data-active')).join('')};})(),
  gp: (()=>{const f=document.querySelector('[data-gamow]'); if(!f) return null;
    return {maxwell:f.querySelector('[data-maxwell]').getAttribute('d'),
      tunnel:f.querySelector('[data-tunnel]').getAttribute('d'),
      product:f.querySelector('[data-product]').getAttribute('d'),
      area:f.querySelector('[data-product-area]').getAttribute('d'),
      peak:f.querySelector('[data-peak-line]').getAttribute('x1'),
      peakVal:f.querySelector('[data-peak-val]').textContent.trim(),
      temp:f.querySelector('[data-temp]').textContent.trim(),
      magPeak:f.querySelector('[data-mag-peak]').getAttribute('y1'),
      magSpan:f.querySelector('[data-mag-span]').getAttribute('d')};})(),
  steps: Array.from(document.querySelectorAll('[data-ex-step]')).map(e=>e.getAttribute('data-active')).join(''),
  scrollY: Math.round(scrollY)
})`;

const at = async (px) => {
  await S('Runtime.evaluate',{expression:`window.scrollTo(0,${px})`});
  await sleep(420);
  const {result} = await S('Runtime.evaluate',{expression:STATE, returnByValue:true});
  return JSON.parse(result.value);
};

// Forward: crawl down through both sequences. Backward: the identical positions
// in reverse. Compare each pair.
// ABSOLUTE pixel positions, captured once. Scrolling by a fraction of
// scrollHeight is not reproducible: a sticky figure changes the document
// height as it pins, so the same fraction is a different place on the way back.
// Sweep exactly the two scrollytelling sequences, densely, rather than a slice
// of the whole document — a reversibility check that never enters the range
// where the figure actually moves proves nothing.
const {result: rRes} = await S('Runtime.evaluate',{expression:
  `JSON.stringify(Array.from(document.querySelectorAll('.ex-scrolly')).map(s=>{const b=s.getBoundingClientRect();return [Math.round(b.top+scrollY), Math.round(b.height)];}))`});
const ranges = JSON.parse(rRes.value);
if (!ranges.length) {
  console.error(
    'FAIL — no scrollytelling sequences found. Is the explainer running at ' +
      (process.argv[2] || 'http://localhost:4321/explainers/stardust') +
      '?'
  );
  ws.close();
  chrome.kill();
  process.exit(1);
}
const marks = [];
for (const [top, h] of ranges) {
  for (let i=0;i<=40;i++) marks.push(Math.round(top - 400 + i*(h+800)/40));
}
const down = [];
for (const m of marks) down.push(await at(m));
const up = [];
for (const m of [...marks].reverse()) up.unshift(await at(m));

let bad = 0;
for (let i=0;i<marks.length;i++){
  const a = JSON.stringify({...down[i], scrollY:0});
  const b = JSON.stringify({...up[i], scrollY:0});
  if (a !== b) {
    bad++;
    if (bad<=3) {
      const A = {...down[i], scrollY:0}, B = {...up[i], scrollY:0};
      const diffs = [];
      const walk = (x,y,path) => {
        if (typeof x === 'object' && x && typeof y === 'object' && y) {
          for (const k of new Set([...Object.keys(x),...Object.keys(y)])) walk(x[k],y[k],path?path+'.'+k:k);
        } else if (JSON.stringify(x) !== JSON.stringify(y)) {
          diffs.push(`${path}: ${JSON.stringify(x)?.slice(0,70)} vs ${JSON.stringify(y)?.slice(0,70)}`);
        }
      };
      walk(A,B,'');
      console.log(`  MISMATCH at y=${marks[i]}`);
      for (const d of diffs.slice(0,4)) console.log('    ' + d);
    }
  }
}
console.log(`positions compared: ${marks.length}`);
console.log(`mismatches: ${bad}`);
const moved = new Set(down.map(d=>d.gp && d.gp.temp)).size;
const dtMoved = new Set(down.map(d=>d.dt && d.dt.when)).size;
console.log(`distinct gamow temperatures seen: ${moved}  (proves it is actually scrubbing, not frozen)`);
console.log(`distinct deep-time readouts seen: ${dtMoved}`);
const frozen = moved < 2 || dtMoved < 2;
if (frozen) console.log('FAIL — at least one scrollytelling figure is frozen');
else console.log(bad === 0 ? 'PASS — scroll is a parameter' : 'FAIL — state depends on direction of travel');
ws.close(); chrome.kill(); process.exit(bad === 0 && !frozen ? 0 : 1);
