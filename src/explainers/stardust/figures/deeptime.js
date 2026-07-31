/**
 * The deep-time figure's scrub, as pure functions.
 *
 * Extracted from the component for exactly the reason gamow.js was: the motion
 * doctrine — scroll is a PARAMETER, not a trigger — is only true if the draw
 * path is a pure function of scroll position, and a claim like that belongs in
 * a test rather than in a comment. Nothing in here reads the DOM, holds state
 * between calls, or knows which direction the reader is travelling.
 *
 * See scripts/test-figures.mjs.
 */

const SUP = {
  '-': '⁻',
  0: '⁰',
  1: '¹',
  2: '²',
  3: '³',
  4: '⁴',
  5: '⁵',
  6: '⁶',
  7: '⁷',
  8: '⁸',
  9: '⁹',
};

/** An exponent in unicode superscripts, so an axis can read 10⁻⁴³. */
export function sup(n) {
  return String(n)
    .split('')
    .map((c) => SUP[c] ?? c)
    .join('');
}

/**
 * Where the scrub line is, in log₁₀ seconds.
 *
 * The six steps of the sequence name six instants; everything between them is
 * interpolated in log t. Note what is NOT here: no previous value, no easing
 * toward a target, no clamped accumulator. Feed it (2, 0.4) and it returns the
 * same number whether the reader arrived from step 1 or step 3.
 *
 * @param {number} step    index of the step the reading line is in
 * @param {number} within  0..1 progress through that step
 * @param {number[]} logTargets  log₁₀ t of each step's instant
 */
export function scrubAt(step, within, logTargets) {
  const last = logTargets.length - 1;
  const index = Math.min(last, Math.max(0, step + within));
  const lower = Math.min(last, Math.floor(index));
  const upper = Math.min(last, lower + 1);
  const f = index - lower;
  return logTargets[lower] + f * (logTargets[upper] - logTargets[lower]);
}

/** x pixel for a log-time, on the figure's axis. */
export function scrubX(logT, { pl, pr, l0, lspan }) {
  return pl + ((logT - l0) / lspan) * (pr - pl);
}

/**
 * Composition at a time, interpolated linearly in log t between the sampled
 * epochs — the same rule the bands are drawn with, so the readout and the
 * drawing can never disagree.
 *
 * @param {number} logT
 * @param {number[][]} table  rows of [log₁₀ t, quarks, protons, neutrons, helium, metals]
 */
export function compositionAt(logT, table) {
  if (logT <= table[0][0]) return table[0].slice();
  for (let i = 1; i < table.length; i++) {
    if (logT <= table[i][0]) {
      const a = table[i - 1];
      const b = table[i];
      const f = b[0] === a[0] ? 0 : (logT - a[0]) / (b[0] - a[0]);
      return a.map((value, k) => (k === 0 ? logT : value + f * (b[k] - value)));
    }
  }
  return table[table.length - 1].slice();
}

/** Elapsed time, in whatever unit a person would actually use for it. */
export function when(logT) {
  const t = 10 ** logT;
  if (t < 0.1) return `10${sup(Math.round(logT))} s`;
  if (t < 90) return `${t < 10 ? t.toFixed(1) : Math.round(t)} s`;
  if (t < 5400) return `${Math.round(t / 60)} min`;
  const years = t / 3.156e7;
  if (years < 1e3) return `${Math.round(years)} yr`;
  if (years < 1e6) return `${Math.round(years / 1e3)} thousand yr`;
  if (years < 1e9) return `${Math.round(years / 1e6)} million yr`;
  return `${(years / 1e9).toFixed(1)} billion yr`;
}

/** Species order in a composition row, and what to call each. */
export const SPECIES = [
  [1, 'quarks'],
  [2, 'hydrogen'],
  [3, 'free neutrons'],
  [4, 'helium'],
  [5, 'heavier'],
];

/** The readout line: only what is actually present, at one per cent resolution. */
export function readout(composition) {
  return (
    SPECIES.filter(([k]) => composition[k] >= 0.005)
      .map(([k, name]) => `${name} ${Math.round(composition[k] * 100)}%`)
      .join(' · ') || '—'
  );
}
