#!/usr/bin/env node
/**
 * THE FIGURE AUDIT.
 *
 *   node scripts/audit-figures.mjs [url]
 *
 * Every figure in this document is hand-set SVG: each label sits at a
 * coordinate someone computed and hoped about. The hoping is the problem. The
 * code that placed the deep-time labels estimated their widths like this —
 *
 *     const NAME_CH = 7.2;  // display at var(--t-xs)
 *
 * — which is guessing at text metrics the browser already knows exactly. Every
 * overlapping label in this section came from that guess being wrong, and every
 * one was found by a person looking at a screenshot.
 *
 * This asks the browser instead. It loads the page at five widths, measures the
 * real painted box of every piece of text in every figure, and reports:
 *
 *   COLLISION   two labels overlapping enough that one is unreadable
 *   TINY        text painted below the legibility floor
 *   CLIPPED     a mark outside the figure it belongs to
 *   SHRUNK      a figure rendered below the size it was drawn at, so all of
 *               its type arrives smaller than it was set
 *
 * It is deliberately not a linter for taste. It cannot tell you a figure is
 * lifeless. It can tell you, without argument, that two words are on top of
 * each other at 768px — which is the class of defect that has taken up most of
 * the review cycles on this section.
 *
 * Exits non-zero if anything is found, so it can gate a build.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ = process.argv[2] || 'http://localhost:4321/explainers/stardust';
const WIDTHS = [375, 390, 768, 1024, 1440, 1728];
const SCHEMES = ['light', 'dark'];

/** Below this, painted, type is decoration rather than information. */
const MIN_PX = 9.5;
/** Overlap of this share of the smaller box means one of them is unreadable. */
const OVERLAP = 0.14;
/**
 * A browser's box for a piece of SVG text is the font's full em box — ascent
 * plus descent — which is appreciably taller than the ink. Two lines set at a
 * leading equal to their size therefore "overlap" by about a sixth without a
 * reader ever noticing. Trimming each box back towards its cap height before
 * intersecting is what separates crowded-but-fine from genuinely unreadable.
 * Calibrated against the collisions a human actually reported in review.
 */
const INK_INSET = 0.22;
/** A figure rendered below this fraction of its drawn width has shrunk its type. */
const MIN_SCALE = 0.92;

const PORT = 9400 + (process.pid % 300);
const profile = mkdtempSync(join(tmpdir(), 'audit-'));
const chrome = spawn(
  'google-chrome-stable',
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    'about:blank',
  ],
  { stdio: 'ignore' }
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ws;
for (let i = 0; i < 120; i++) {
  try {
    const info = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
    ws = new WebSocket(info.webSocketDebuggerUrl);
    break;
  } catch {
    await sleep(120);
  }
}
if (!ws) throw new Error('[audit] chrome never came up');
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result);
  }
};
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
  });

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const S = (m, p) => send(m, p, sessionId);
await S('Page.enable');
await S('Runtime.enable');

/* ------------------------------------------------------------------ *
 * The measurement, run inside the page.
 * ------------------------------------------------------------------ */
const PROBE = `(() => {
  const OVERLAP = ${OVERLAP};
  const INK_INSET = ${INK_INSET};
  const MIN_PX = ${MIN_PX};
  const MIN_SCALE = ${MIN_SCALE};
  const out = [];

  // Responsive components may ship two purpose-built drawings. Exactly one
  // must paint at a time; a cascade regression once left both DeepTime
  // variants visible and doubled the chapter without producing a collision.
  document.querySelectorAll('[data-deeptime]').forEach((root) => {
    const wide = root.querySelector('.dt-wide');
    const tall = root.querySelector('.dt-tall');
    const visible = (node) =>
      node && getComputedStyle(node).display !== 'none' &&
      node.getBoundingClientRect().width > 1 &&
      node.getBoundingClientRect().height > 1;
    if (visible(wide) === visible(tall)) {
      out.push({
        kind: 'VARIANT',
        fig: 'deep time',
        detail: visible(wide)
          ? 'landscape and portrait drawings are both visible'
          : 'neither responsive drawing is visible',
      });
    }
  });

  /** Elements whose own text is their only child — the leaves that carry words. */
  const leafText = (root) =>
    Array.from(root.querySelectorAll('p, span, h1, h2, h3, h4, li, text, div')).filter((el) => {
      if (el.closest('.ex-fig-data')) return false; // the visually hidden table
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return false;
      if (!el.textContent || !el.textContent.trim()) return false;
      // only leaves, so a wrapper does not "collide" with what it wraps
      if (Array.from(el.children).some((c) => (c.textContent || '').trim())) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0.5 && r.height > 0.5;
    });

  document.querySelectorAll('.ex-fig').forEach((fig) => {
    // Every drawing in the figure that is actually on screen. A figure may ship
    // two (a landscape one and a portrait one) and hide the one it is not using.
    const svgs = Array.from(fig.querySelectorAll('svg')).filter(
      (s) => s.getBoundingClientRect().width > 1 && getComputedStyle(s).display !== 'none'
    );

    svgs.forEach((svg) => {
      const box = svg.getBoundingClientRect();
      const vb = (svg.getAttribute('viewBox') || '').split(/[ ,]+/).map(Number);
      const name =
        (svg.parentElement && svg.parentElement.className) ||
        fig.dataset.width ||
        'figure';
      const scale = vb[2] ? box.width / vb[2] : 1;

      if (vb[2] && scale < MIN_SCALE) {
        out.push({
          kind: 'SHRUNK',
          fig: name,
          detail: Math.round(box.width) + 'px rendered from a ' + vb[2] +
            '-unit drawing (' + scale.toFixed(2) + '×), so every label is that much smaller than it was set',
        });
      }

      // Leaf text only: a <text> containing <tspan> would "collide" with its
      // own children, which is not a defect.
      const texts = Array.from(svg.querySelectorAll('text')).filter((t) => {
        const st = getComputedStyle(t);
        if (st.display === 'none' || st.visibility === 'hidden') return false;
        const r = t.getBoundingClientRect();
        return r.width > 0.5 && r.height > 0.5;
      });

      const alreadyShrunk = vb[2] && scale < MIN_SCALE;
      texts.forEach((t) => {
        const r = t.getBoundingClientRect();
        const px = parseFloat(getComputedStyle(t).fontSize) * (vb[2] ? scale : 1);
        // A shrunken figure makes every label in it small; that is one defect,
        // reported once above, not two hundred.
        if (alreadyShrunk) return;
        const label = (t.textContent || '').trim().slice(0, 42);
        if (px < MIN_PX && label) {
          out.push({ kind: 'TINY', fig: name, detail: px.toFixed(1) + 'px — "' + label + '"' });
        }
        // Outside its own drawing, allowing the overflow:visible margin authors
        // legitimately use for axis labels.
        const pad = 4;
        if (r.right < box.left - pad || r.left > box.right + pad) {
          out.push({ kind: 'CLIPPED', fig: name, detail: '"' + label + '" is outside the drawing horizontally' });
        }
      });

      const ink = (el) => {
        const r = el.getBoundingClientRect();
        const trim = r.height * INK_INSET;
        return { left: r.left, right: r.right, top: r.top + trim, bottom: r.bottom - trim,
                 width: r.width, height: Math.max(1, r.height - 2 * trim) };
      };

      for (let i = 0; i < texts.length; i++) {
        for (let j = i + 1; j < texts.length; j++) {
          const a = ink(texts[i]);
          const b = ink(texts[j]);
          const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (w <= 0 || h <= 0) continue;
          const share = (w * h) / Math.min(a.width * a.height, b.width * b.height);
          if (share < OVERLAP) continue;
          out.push({
            kind: 'COLLISION',
            fig: name,
            detail:
              Math.round(share * 100) + '% — "' + (texts[i].textContent || '').trim().slice(0, 30) +
              '" over "' + (texts[j].textContent || '').trim().slice(0, 30) + '"',
          });
        }
      }
    });

    /* Figures that set their words in HTML rather than in SVG are measured the
       same way — otherwise moving a figure to HTML would make it invisible to
       the very check that proved it needed moving. */
    const htmlWords = leafText(fig).filter((el) => el.tagName !== 'text');
    const ink2 = (el) => {
      const r = el.getBoundingClientRect();
      const trim = r.height * INK_INSET;
      return { left: r.left, right: r.right, top: r.top + trim, bottom: r.bottom - trim,
               width: r.width, height: Math.max(1, r.height - 2 * trim) };
    };
    htmlWords.forEach((el) => {
      const px = parseFloat(getComputedStyle(el).fontSize);
      const label = (el.textContent || '').trim().slice(0, 42);
      if (px < MIN_PX && label) {
        out.push({ kind: 'TINY', fig: fig.dataset.width + ' (html)', detail: px.toFixed(1) + 'px — "' + label + '"' });
      }
    });
    for (let i = 0; i < htmlWords.length; i++) {
      for (let j = i + 1; j < htmlWords.length; j++) {
        if (htmlWords[i].contains(htmlWords[j]) || htmlWords[j].contains(htmlWords[i])) continue;
        const a = ink2(htmlWords[i]);
        const b = ink2(htmlWords[j]);
        const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (w <= 0 || h <= 0) continue;
        const share = (w * h) / Math.min(a.width * a.height, b.width * b.height);
        if (share < OVERLAP) continue;
        out.push({
          kind: 'COLLISION',
          fig: fig.dataset.width + ' (html)',
          detail: Math.round(share * 100) + '% — "' + (htmlWords[i].textContent || '').trim().slice(0, 30) +
            '" over "' + (htmlWords[j].textContent || '').trim().slice(0, 30) + '"',
        });
      }
    }
  });
  return JSON.stringify(out);
})()`;

const findings = [];
for (const scheme of SCHEMES) {
  await S('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: scheme }],
  });
  for (const width of WIDTHS) {
    await S('Emulation.setDeviceMetricsOverride', {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width < 500,
    });
    await S('Page.navigate', { url: URL_ });
    await sleep(2600);
    await S('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
    await sleep(400);
    const { result: countResult } = await S('Runtime.evaluate', {
      expression: `document.querySelectorAll('.ex-fig').length`,
      returnByValue: true,
    });
    if (!countResult.value) {
      console.error(`\n  FAIL — no figures found at ${URL_}. Is the explainer running there?\n`);
      ws.close();
      chrome.kill();
      process.exit(1);
    }
    const { result } = await S('Runtime.evaluate', { expression: PROBE, returnByValue: true });
    for (const item of JSON.parse(result.value)) findings.push({ ...item, width, scheme });
  }
}

/* ------------------------------------------------------------------ *
 * Report
 * ------------------------------------------------------------------ */
const byKind = {};
for (const f of findings) (byKind[f.kind] ||= []).push(f);

const ORDER = ['VARIANT', 'COLLISION', 'CLIPPED', 'TINY', 'SHRUNK'];
console.log(`\n  figure audit · ${URL_}`);
console.log(`  widths: ${WIDTHS.join(', ')}\n`);
console.log(`  schemes: ${SCHEMES.join(', ')}\n`);

let total = 0;
for (const kind of ORDER) {
  const items = byKind[kind] || [];
  if (!items.length) continue;
  total += items.length;
  // Same defect at several widths is one defect.
  const seen = new Map();
  for (const item of items) {
    const key = item.fig + '|' + item.detail.replace(/^\d+%/, '');
    if (!seen.has(key)) seen.set(key, { ...item, widths: [], schemes: [] });
    seen.get(key).widths.push(item.width);
    seen.get(key).schemes.push(item.scheme);
  }
  console.log(`  ${kind}  (${seen.size} distinct, ${items.length} across widths)`);
  for (const item of [...seen.values()].slice(0, 40)) {
    console.log(`    ${item.fig.padEnd(10)} ${item.detail}`);
    console.log(
      `    ${''.padEnd(10)} at ${[...new Set(item.widths)].join(', ')}px · ${[
        ...new Set(item.schemes),
      ].join(', ')}`
    );
  }
  console.log('');
}

if (!total) console.log('  clean — nothing overlapping, nothing clipped, nothing below the floor\n');
else console.log(`  ${total} findings\n`);

ws.close();
chrome.kill();
process.exit(total ? 1 : 0);
