// Generates the default social share card (public/og.png, 1200×630).
//
// The card is a single typographic moment — no icons, gradients, or ornament.
// It reuses the site's own type system: Bodoni Moda for the wordmark, EB
// Garamond italic for the strapline, Spline Sans Mono for the colophon, set on
// the dark "paper" ground with one terracotta hairline as the only colour.
//
// Run: node scripts/generate-og.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const fontDir = resolve(root, 'public/fonts');

const load = (name) => readFileSync(resolve(fontDir, name)).toString('base64');
const bodoni = load('bodoni-moda-latin.c032219e.woff2');
const ebItalic = load('eb-garamond-italic-latin.c9d5e8b2.woff2');
const mono = load('spline-sans-mono-latin.46b7dcaf.woff2');

// Brand palette (dark theme — the more distinctive ground in a social feed).
const PAPER = '#181713'; // warm near-black
const INK = '#EAE7DE'; // cream
const RED = '#E4715F'; // terracotta accent

// Author at 2× then downscale, so the Didone hairlines render smoothly.
const S = 2;
const W = 1200 * S;
const H = 630 * S;
const cx = W / 2;

// Design coordinates are stated at 1× (the final 1200×630 canvas) and scaled.
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>
      @font-face { font-family:"Bodoni"; font-style:normal; src:url(data:font/woff2;base64,${bodoni}) format("woff2"); }
      @font-face { font-family:"EB"; font-style:italic;  src:url(data:font/woff2;base64,${ebItalic}) format("woff2"); }
      @font-face { font-family:"Mono";  font-style:normal; src:url(data:font/woff2;base64,${mono}) format("woff2"); }
      text { text-rendering:geometricPrecision; }
    </style>
  </defs>

  <rect width="${W}" height="${H}" fill="${PAPER}"/>

  <!-- Wordmark, optically centred high. -->
  <text x="${cx}" y="${298 * S}" text-anchor="middle"
        font-family="Bodoni" font-size="${96 * S}" letter-spacing="${3 * S}"
        fill="${INK}">Rabbit Holes</text>

  <!-- The single chromatic note: a short terracotta rule. -->
  <rect x="${(600 - 36) * S}" y="${342 * S}" width="${72 * S}" height="${2 * S}" fill="${RED}"/>

  <!-- Strapline in the reading italic. -->
  <text x="${cx}" y="${392 * S}" text-anchor="middle"
        font-family="EB" font-style="italic" font-size="${30 * S}" letter-spacing="${1 * S}"
        fill="${INK}" fill-opacity="0.74">A public commonplace book</text>

  <!-- A quiet colophon anchoring the foot. -->
  <text x="${cx}" y="${583 * S}" text-anchor="middle"
        font-family="Mono" font-size="${20 * S}" letter-spacing="${8 * S}"
        fill="${INK}" fill-opacity="0.45">rabbitholes.garden</text>
</svg>`;

const out = resolve(root, 'public/og.png');
await sharp(Buffer.from(svg))
  .resize(1200, 630, { fit: 'fill' })
  .png({ compressionLevel: 9 })
  .toFile(out);

// Verification — confirm dimensions and that type actually rendered.
const meta = await sharp(out).metadata();
const { data } = await sharp(out).raw().toBuffer({ resolveWithObject: true });
let sum = 0;
let sumSq = 0;
let pixels = 0;
for (let i = 0; i < data.length; i += 4) {
  const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  sum += luma;
  sumSq += luma * luma;
  pixels++;
}
const mean = sum / pixels;
const stddev = Math.sqrt(sumSq / pixels - mean * mean);
const ok =
  meta.width === 1200 &&
  meta.height === 630 &&
  mean < 60 && // dark ground (paper ≈ luma 23)
  stddev > 8; // non-blank — ink is present

console.log(
  JSON.stringify(
    {
      file: 'public/og.png',
      width: meta.width,
      height: meta.height,
      meanLuma: +mean.toFixed(1),
      stddev: +stddev.toFixed(1),
      verified: ok,
    },
    null,
    2,
  ),
);
if (!ok) {
  console.error('OG image failed verification.');
  process.exit(1);
}
