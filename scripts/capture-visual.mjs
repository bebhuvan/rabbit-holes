#!/usr/bin/env node
/**
 * Capture one art-directed region at its real page position.
 *
 *   node scripts/capture-visual.mjs URL SELECTOR OUTPUT [WIDTH]
 *
 * Unlike Chrome's command-line screenshot flag, this waits for fonts, scrolls
 * the requested visual into view, and captures its whole painted box. It makes
 * figure review repeatable instead of depending on hand-positioned screenshots.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [
  url = 'http://127.0.0.1:4323/explainers/stardust',
  selector = '.stardust-hero',
  output = '/tmp/stardust-visual.png',
  widthArg = '1440',
] = process.argv.slice(2);
const width = Number(widthArg);
// Keep well away from the ports used by the figure and motion audits. A stale
// audit browser must never be mistaken for this run's fresh browser.
const port = 12000 + (process.pid % 2000);
const profile = mkdtempSync(join(tmpdir(), 'capture-visual-'));
const chrome = spawn(
  'google-chrome-stable',
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    'about:blank',
  ],
  { stdio: 'ignore' }
);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let ws;
for (let attempt = 0; attempt < 120; attempt++) {
  try {
    const version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
    ws = new WebSocket(version.webSocketDebuggerUrl);
    break;
  } catch {
    await sleep(100);
  }
}
if (!ws) throw new Error('[capture] Chrome did not start');
await new Promise((resolve) => (ws.onopen = resolve));

let id = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  const call = pending.get(message.id);
  if (!call) return;
  pending.delete(message.id);
  message.error ? call.reject(new Error(JSON.stringify(message.error))) : call.resolve(message.result);
};
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const callId = ++id;
    pending.set(callId, { resolve, reject });
    ws.send(JSON.stringify({ id: callId, method, params, sessionId }));
  });

try {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const S = (method, params) => send(method, params, sessionId);
  await S('Page.enable');
  await S('Runtime.enable');
  await S('Emulation.setDeviceMetricsOverride', {
    width,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: width < 500,
  });
  await S('Page.navigate', { url });
  await sleep(2200);
  await S('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });

  const expression = `(() => {
    const node = document.querySelector(${JSON.stringify(selector)});
    if (!node) throw new Error('No element matches ${selector.replaceAll("'", "\\'")}');
    document.querySelectorAll('[data-ex-scrolly]').forEach((sequence) => {
      if (!sequence.contains(node)) sequence.style.display = 'none';
    });
    node.scrollIntoView({ block: 'start' });
    const r = node.getBoundingClientRect();
    return JSON.stringify({
      x: Math.max(0, r.left + scrollX),
      y: Math.max(0, r.top + scrollY),
      width: r.width,
      height: r.height,
      color: getComputedStyle(node).color,
      opacity: getComputedStyle(node).opacity
    });
  })()`;
  const { result } = await S('Runtime.evaluate', { expression, returnByValue: true });
  if (result.subtype === 'error') throw new Error(result.description);
  const clip = JSON.parse(result.value);
  const captureHeight = Math.min(3000, Math.max(900, Math.ceil(clip.height + 32)));
  await S('Emulation.setDeviceMetricsOverride', {
    width,
    height: captureHeight,
    deviceScaleFactor: 1,
    mobile: width < 500,
  });
  await S('Runtime.evaluate', {
    expression: `document.querySelector(${JSON.stringify(selector)}).scrollIntoView({ block: 'start' })`,
  });
  await sleep(350);
  const shot = await S('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });
  writeFileSync(output, Buffer.from(shot.data, 'base64'));
  console.log(
    `${output} · ${width} × ${captureHeight} · ${clip.color} · opacity ${clip.opacity}`
  );
} finally {
  ws.close();
  chrome.kill();
}
