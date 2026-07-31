/**
 * SCALES AND PATHS — build-time only.
 *
 * Imported in .astro frontmatter, never shipped to the browser. This is the
 * whole reason the project can draw honest axes without a charting dependency:
 * the figures are static SVG by the time they leave the build.
 *
 * Deliberately small. It does the four things this document actually needs —
 * map numbers to pixels, pick tick values a human would have picked, and turn
 * points into path data — and nothing else. If a figure ever genuinely needs a
 * geo projection or a force layout, add that one d3 sub-package then rather
 * than growing this file into a bad version of it.
 *
 * The hard function here is logTicks. The deep-time figure spans 10⁻³⁶ s to
 * ~10¹⁸ s — fifty-four decades — and a tick per decade is unreadable. See its
 * comment for how it thins.
 */

/* ------------------------------------------------------------------ *
 * Scales
 * ------------------------------------------------------------------ */

/**
 * Linear scale.
 * @param {[number, number]} domain
 * @param {[number, number]} range
 */
export function linear([d0, d1], [r0, r1]) {
  const span = d1 - d0;
  const scale = (value) => (span === 0 ? r0 : r0 + ((value - d0) / span) * (r1 - r0));
  scale.invert = (pixel) => (r1 === r0 ? d0 : d0 + ((pixel - r0) / (r1 - r0)) * span);
  scale.domain = [d0, d1];
  scale.range = [r0, r1];
  return scale;
}

/**
 * Base-10 logarithmic scale. Both domain values must be strictly positive —
 * a log axis through zero is not a rounding problem, it is a category error,
 * so it throws rather than quietly producing -Infinity.
 * @param {[number, number]} domain
 * @param {[number, number]} range
 */
export function log([d0, d1], [r0, r1]) {
  if (d0 <= 0 || d1 <= 0) {
    throw new Error(
      `[scale] log domain must be strictly positive, got [${d0}, ${d1}]. ` +
        `A logarithmic axis has no zero — pick a floor that means something ` +
        `physically (e.g. the Planck time) rather than letting it slide to 0.`
    );
  }

  const l0 = Math.log10(d0);
  const l1 = Math.log10(d1);
  const span = l1 - l0;

  const scale = (value) => (span === 0 ? r0 : r0 + ((Math.log10(value) - l0) / span) * (r1 - r0));
  scale.invert = (pixel) =>
    r1 === r0 ? d0 : 10 ** (l0 + ((pixel - r0) / (r1 - r0)) * span);
  scale.domain = [d0, d1];
  scale.range = [r0, r1];
  return scale;
}

/* ------------------------------------------------------------------ *
 * Ticks
 * ------------------------------------------------------------------ */

/**
 * The 1-2-5 step a person would have chosen.
 * @param {number} rough
 */
function niceStep(rough) {
  if (!(rough > 0) || !Number.isFinite(rough)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalised = rough / magnitude;
  const step = normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 5 ? 5 : 10;
  return step * magnitude;
}

/**
 * Tick values across a linear domain, at 1/2/5×10ⁿ intervals, inclusive of any
 * round values at the ends.
 *
 * @param {[number, number]} domain
 * @param {number} count  approximate number of ticks wanted
 * @returns {number[]}
 */
export function niceTicks([d0, d1], count = 6) {
  if (d0 === d1) return [d0];

  const lo = Math.min(d0, d1);
  const hi = Math.max(d0, d1);
  const step = niceStep((hi - lo) / Math.max(1, count));

  const first = Math.ceil(lo / step) * step;
  const ticks = [];

  // Accumulate by multiplication rather than repeated addition: adding 0.1
  // sixty times lands on 6.000000000000005 and the axis prints it.
  for (let i = 0; ; i++) {
    const value = first + i * step;
    if (value > hi + step * 1e-9) break;
    // snap away float dust introduced by the multiply
    ticks.push(Number(value.toFixed(12)));
  }

  return ticks;
}

/**
 * Tick values across a logarithmic domain — one per decade, thinned so the
 * axis stays readable however many decades it spans.
 *
 * This is the function the deep-time figure lives or dies on. Its domain runs
 * from the Planck time to now: fifty-four powers of ten. Labelling every decade
 * produces a grey stripe. So the decade STEP is itself chosen from a 1-2-5-10
 * progression — every decade, every second decade, every fifth, every tenth —
 * until the count fits.
 *
 * The step is always a whole number of decades, so ticks land on exact powers
 * of ten and the axis reads 10⁻³⁶, 10⁻³⁰, 10⁻²⁴ rather than at arbitrary
 * intervals.
 *
 * @param {[number, number]} domain
 * @param {number} count  maximum number of ticks
 * @returns {number[]}
 */
export function logTicks([d0, d1], count = 8) {
  if (d0 <= 0 || d1 <= 0) {
    throw new Error(`[scale] logTicks domain must be strictly positive, got [${d0}, ${d1}]`);
  }

  const lo = Math.min(d0, d1);
  const hi = Math.max(d0, d1);
  const first = Math.ceil(Math.log10(lo) - 1e-9);
  const last = Math.floor(Math.log10(hi) + 1e-9);

  if (last < first) {
    // Less than one full decade of span — fall back to linear ticks, which is
    // what a reader would expect between, say, 3 and 7.
    return niceTicks([lo, hi], count);
  }

  const decades = last - first + 1;
  const steps = [1, 2, 5, 10, 20, 25, 50, 100];
  const step =
    steps.find((candidate) => Math.ceil(decades / candidate) <= count) ??
    Math.ceil(decades / Math.max(1, count));

  const ticks = [];
  for (let exponent = first; exponent <= last; exponent += step) {
    ticks.push(10 ** exponent);
  }
  return ticks;
}

/**
 * The exponent of an exact power of ten, for labelling a log axis as 10ⁿ.
 * @param {number} value
 */
export function exponentOf(value) {
  return Math.round(Math.log10(value));
}

/* ------------------------------------------------------------------ *
 * Paths
 * ------------------------------------------------------------------ */

/** Round to a sane number of decimals — SVG path data does not need 15. */
const round = (n) => Number(n.toFixed(2));

/**
 * A polyline through points, as SVG path data.
 * Non-finite points break the line rather than corrupting it: a gap is honest,
 * a straight line across missing data is not.
 *
 * @param {Array<[number, number]>} points
 */
export function linePath(points) {
  let out = '';
  let pen = false;

  for (const [x, y] of points) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      pen = false;
      continue;
    }
    out += `${pen ? 'L' : 'M'}${round(x)} ${round(y)}`;
    pen = true;
  }

  return out;
}

/**
 * A filled area between a polyline and a baseline.
 * @param {Array<[number, number]>} points
 * @param {number} baseline  y pixel of the base
 */
export function areaPath(points, baseline) {
  const clean = points.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (clean.length === 0) return '';

  const top = linePath(clean);
  const lastX = round(clean[clean.length - 1][0]);
  const firstX = round(clean[0][0]);
  return `${top}L${lastX} ${round(baseline)}L${firstX} ${round(baseline)}Z`;
}

/**
 * A circular/elliptical arc, used for the shells and orbits that several of
 * these figures are built from.
 * @param {number} cx @param {number} cy @param {number} r
 * @param {number} startDeg @param {number} endDeg  0° is 12 o'clock, clockwise
 */
export function arcPath(cx, cy, r, startDeg, endDeg) {
  const point = (deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const [x0, y0] = point(startDeg);
  const [x1, y1] = point(endDeg);
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  const sweep = endDeg > startDeg ? 1 : 0;
  return `M${round(x0)} ${round(y0)}A${round(r)} ${round(r)} 0 ${large} ${sweep} ${round(x1)} ${round(y1)}`;
}

/** Clamp, because reading a scroll parameter off the end is normal. */
export function clamp(value, min = 0, max = 1) {
  return value < min ? min : value > max ? max : value;
}

/**
 * Map a value from one span to another, clamped. The workhorse for binding
 * scroll progress to anything.
 */
export function remap(value, [a0, a1], [b0, b1]) {
  if (a1 === a0) return b0;
  return b0 + clamp((value - a0) / (a1 - a0)) * (b1 - b0);
}
