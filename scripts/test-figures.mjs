/**
 * The motion doctrine, as an executable claim.
 *
 * Run: node --test scripts/test-figures.mjs
 *
 * The whole section rests on one property: scroll is a PARAMETER, not a
 * trigger. Concretely — scrub forward to 40%, come back to 20%, and the figure
 * must be in byte-identical state to the first time it saw 20%.
 *
 * That property is only true if the draw path is a pure function of scroll
 * position. So rather than asserting it in a comment, it is asserted here
 * against the real functions the figures call. A regression that introduces an
 * accumulator, an eased carry-over, or a `hasPlayed` flag breaks these tests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  curves,
  peakEnergy,
  magnitude,
  T_SOLAR,
  K_KEV,
  B_PP,
} from '../src/explainers/stardust/figures/gamow.js';

/* ------------------------------------------------------------------ *
 * Reversibility — the doctrine
 * ------------------------------------------------------------------ */

const T_MIN = T_SOLAR;
const T_MAX = 40e6;
const at = (progress) => curves(T_MIN + progress * (T_MAX - T_MIN));

test('scrubbing back returns the identical state', () => {
  const first = at(0.2);
  // travel forward, as a reader scrolling down would
  at(0.3);
  at(0.4);
  at(0.9);
  // and back
  at(0.4);
  const again = at(0.2);

  assert.equal(again.maxwellPath, first.maxwellPath);
  assert.equal(again.tunnelPath, first.tunnelPath);
  assert.equal(again.productPath, first.productPath);
  assert.equal(again.productArea, first.productArea);
  assert.equal(again.peakE, first.peakE);
  assert.equal(again.peakX, first.peakX);
});

test('every position is reachable from any direction', () => {
  const forward = [];
  for (let i = 0; i <= 20; i++) forward.push(at(i / 20).productPath);

  const backward = [];
  for (let i = 20; i >= 0; i--) backward.unshift(at(i / 20).productPath);

  assert.deepEqual(backward, forward, 'state depends on direction of travel');
});

test('the endpoints are stable under repetition', () => {
  assert.equal(at(0).productPath, at(0).productPath);
  assert.equal(at(1).productPath, at(1).productPath);
});

/* ------------------------------------------------------------------ *
 * Physics — the figure must be right, not merely reversible
 * ------------------------------------------------------------------ */

test('the Gamow peak lands where the textbook puts it', () => {
  const solar = curves(T_SOLAR);
  // Standard result for p+p in the solar core is ~5.9 keV.
  assert.ok(
    solar.peakE > 5.5 && solar.peakE < 6.5,
    `peak at ${solar.peakE.toFixed(2)} keV is not the textbook ~5.9 keV`
  );
});

test('the numerical peak agrees with the analytic formula', () => {
  const solar = curves(T_SOLAR);
  const analytic = peakEnergy(T_SOLAR);
  // Sampled on a finite grid, so allow one grid step of disagreement.
  assert.ok(
    Math.abs(solar.peakE - analytic) < 0.15,
    `numerical ${solar.peakE.toFixed(3)} vs analytic ${analytic.toFixed(3)}`
  );
});

test('the peak moves to higher energy as the core heats', () => {
  const cool = curves(10e6).peakE;
  const solar = curves(T_SOLAR).peakE;
  const hot = curves(40e6).peakE;
  assert.ok(cool < solar && solar < hot, `${cool} ${solar} ${hot}`);
});

test('fusion is extraordinarily temperature-sensitive', () => {
  // The whole point of step 4: a modest temperature rise buys orders of
  // magnitude in rate. Magnification is the inverse of the peak's true height,
  // so it FALLS as the star gets hotter.
  const cool = magnitude(curves(10e6).magnification);
  const hot = magnitude(curves(40e6).magnification);
  assert.ok(hot < cool - 2, `expected orders of magnitude, got ${cool} → ${hot}`);
});

test('the peak sits far above typical thermal energy', () => {
  const solar = curves(T_SOLAR);
  const kT = K_KEV * T_SOLAR;
  assert.ok(
    solar.peakE > 3 * kT,
    'the Gamow peak must be well out on the tail — that is the argument'
  );
});

test('the peak sits far below the Coulomb barrier', () => {
  // ~1000 keV barrier vs a peak in single-figure keV. If this ever failed, the
  // chapter would be claiming something the figure disproved.
  assert.ok(curves(T_SOLAR).peakE < 50);
});

test('the Gamow constant is the p+p value', () => {
  assert.ok(Math.abs(B_PP - 31.28 * Math.sqrt(0.5)) < 0.05);
});

test('paths are real path data, not empty strings', () => {
  const c = curves(T_SOLAR);
  for (const [name, d] of Object.entries({
    maxwell: c.maxwellPath,
    tunnel: c.tunnelPath,
    product: c.productPath,
    area: c.productArea,
  })) {
    assert.ok(d.length > 100, `${name} path is suspiciously short`);
    assert.ok(d.startsWith('M'), `${name} path does not start with a moveto`);
    assert.ok(!/NaN|Infinity|undefined/.test(d), `${name} path contains ${d.match(/NaN|Infinity|undefined/)}`);
  }
});

/* ------------------------------------------------------------------ *
 * The same doctrine, for the deep-time scrub
 *
 * Added when that figure was rebuilt. It has its own scroll binding, so it
 * needs its own proof: the previous version's binding was never tested and
 * "scroll is a parameter" was true of it only by inspection.
 * ------------------------------------------------------------------ */
import {
  scrubAt,
  scrubX,
  compositionAt,
  when,
  readout,
} from '../src/explainers/stardust/figures/deeptime.js';

// The six instants the sequence names, as the figure passes them.
const TARGETS = [5.39e-44, 1e-6, 1, 180, 1200, 4.35e17].map((t) => Math.log10(t));
const AXIS = { pl: 56, pr: 1376, l0: Math.log10(5.39e-44), lspan: Math.log10(4.35e17) - Math.log10(5.39e-44) };
// [log10 t, quarks, protons, neutrons, helium, metals]
const TABLE = [
  [-43, 1, 0, 0, 0, 0],
  [Math.log10(9e-7), 1, 0, 0, 0, 0],
  [-6, 0, 0.5, 0.5, 0, 0],
  [0, 0, 0.86, 0.14, 0, 0],
  [Math.log10(180), 0, 0.87, 0.13, 0, 0],
  [Math.log10(1200), 0, 0.753, 0, 0.247, 0],
  [Math.log10(4.35e17), 0, 0.74, 0, 0.24, 0.02],
];

/** Everything the figure writes to the DOM at one scroll position. */
const frame = (step, within) => {
  const logT = scrubAt(step, within, TARGETS);
  return {
    logT,
    x: scrubX(logT, AXIS),
    when: when(logT),
    what: readout(compositionAt(logT, TABLE)),
  };
};

test('deep time: scrubbing back returns the identical state', () => {
  const first = frame(2, 0.2);
  frame(3, 0.5);
  frame(4, 0.9);
  frame(5, 1);
  frame(3, 0.1);
  assert.deepEqual(frame(2, 0.2), first, 'state depends on where the reader has been');
});

test('deep time: every position is reachable from either direction', () => {
  const positions = [];
  for (let s = 0; s <= 5; s++) for (let w = 0; w <= 10; w++) positions.push([s, w / 10]);

  const forward = positions.map(([s, w]) => frame(s, w));
  const backward = [...positions].reverse().map(([s, w]) => frame(s, w)).reverse();
  assert.deepEqual(backward, forward);
});

test('deep time: the scrub is monotonic in scroll position', () => {
  let previous = -Infinity;
  for (let s = 0; s <= 5; s++) {
    for (let w = 0; w <= 10; w++) {
      const { logT } = frame(s, w / 10);
      assert.ok(logT >= previous - 1e-9, `went backwards at step ${s} + ${w / 10}`);
      previous = logT;
    }
  }
});

test('deep time: the scrub stays on the axis at both ends and beyond', () => {
  for (const [s, w] of [[-1, 0], [0, 0], [5, 1], [9, 5]]) {
    const px = scrubX(scrubAt(s, w, TARGETS), AXIS);
    assert.ok(px >= AXIS.pl - 1e-6 && px <= AXIS.pr + 1e-6, `${px} is off the plot`);
  }
});

test('deep time: the readout agrees with the physics at each named instant', () => {
  // before the quarks bind, matter is not anything you could call an atom
  assert.match(frame(0, 0).what, /^quarks 100%$/);
  // protons form: half the mass is neutrons, and none of it is helium yet
  assert.match(frame(1, 0).what, /hydrogen 50% · free neutrons 50%/);
  assert.ok(!/helium/.test(frame(1, 0).what));
  // nucleosynthesis over: about three quarters hydrogen, a quarter helium
  assert.match(frame(4, 0).what, /hydrogen 75% · helium 25%/);
  // now: a sliver of everything else, and it only appears at the end
  assert.match(frame(5, 1).what, /heavier 2%/);
});

test('deep time: elapsed time is printed in units a person would use', () => {
  assert.equal(when(Math.log10(5.39e-44)), '10⁻⁴³ s');
  assert.equal(when(0), '1.0 s');
  assert.equal(when(Math.log10(180)), '3 min');
  assert.equal(when(Math.log10(4.35e17)), '13.8 billion yr');
});

test('deep time: composition is interpolated, never invented', () => {
  // exactly on a sample, the interpolation must return that sample
  for (const row of TABLE) {
    const got = compositionAt(row[0], TABLE);
    for (let k = 1; k < row.length; k++) {
      assert.ok(Math.abs(got[k] - row[k]) < 1e-9, `row ${row[0]} field ${k}`);
    }
  }
  // and every intermediate composition must still be a complete one
  for (let i = 0; i <= 60; i++) {
    const logT = -43 + i * (60.6 / 60);
    const total = compositionAt(logT, TABLE).slice(1).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(total - 1) < 1e-6, `mass fractions sum to ${total} at 10^${logT}`);
  }
});
