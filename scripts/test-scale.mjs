/**
 * Tests for the explainer scale kit.
 *
 * Run: node --test scripts/test-scale.mjs
 * Uses node:test — built into Node 20+, so this adds no dependency.
 *
 * The reason this file exists: the plan traded a d3 dependency for ~200 lines
 * of our own scale math, and the one function that genuinely earns scrutiny is
 * logTicks across the deep-time domain. Everything else here is cheap
 * insurance around it.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  linear,
  log,
  niceTicks,
  logTicks,
  exponentOf,
  linePath,
  areaPath,
  clamp,
  remap,
} from '../src/explainers/kit/scale.js';

/* ------------------------------------------------------------------ *
 * linear
 * ------------------------------------------------------------------ */

test('linear maps endpoints and midpoint', () => {
  const x = linear([0, 10], [0, 100]);
  assert.equal(x(0), 0);
  assert.equal(x(10), 100);
  assert.equal(x(5), 50);
});

test('linear extrapolates outside the domain', () => {
  const x = linear([0, 10], [0, 100]);
  assert.equal(x(15), 150);
  assert.equal(x(-5), -50);
});

test('linear inverts', () => {
  const x = linear([-20, 60], [0, 400]);
  for (const value of [-20, 0, 13.5, 60]) {
    assert.ok(Math.abs(x.invert(x(value)) - value) < 1e-9, `round trip failed at ${value}`);
  }
});

test('linear survives a zero-width domain instead of returning NaN', () => {
  const x = linear([5, 5], [0, 100]);
  assert.equal(x(5), 0);
  assert.ok(Number.isFinite(x(7)));
});

/* ------------------------------------------------------------------ *
 * log
 * ------------------------------------------------------------------ */

test('log maps decades evenly', () => {
  const x = log([1, 1000], [0, 300]);
  assert.ok(Math.abs(x(1) - 0) < 1e-9);
  assert.ok(Math.abs(x(10) - 100) < 1e-9);
  assert.ok(Math.abs(x(100) - 200) < 1e-9);
  assert.ok(Math.abs(x(1000) - 300) < 1e-9);
});

test('log inverts across the deep-time domain', () => {
  const x = log([1e-36, 1e18], [0, 1200]);
  for (const value of [1e-36, 1e-12, 1, 1e6, 1e18]) {
    const back = x.invert(x(value));
    // relative error, because absolute error is meaningless at 1e-36
    assert.ok(Math.abs(back - value) / value < 1e-9, `round trip failed at ${value}`);
  }
});

test('log refuses a non-positive domain rather than emitting -Infinity', () => {
  assert.throws(() => log([0, 100], [0, 10]), /strictly positive/);
  assert.throws(() => log([-1, 100], [0, 10]), /strictly positive/);
});

/* ------------------------------------------------------------------ *
 * niceTicks
 * ------------------------------------------------------------------ */

test('niceTicks picks round values', () => {
  assert.deepEqual(niceTicks([0, 100], 5), [0, 20, 40, 60, 80, 100]);
  assert.deepEqual(niceTicks([0, 10], 5), [0, 2, 4, 6, 8, 10]);
});

test('niceTicks does not emit float dust', () => {
  // The naive accumulate-by-addition version prints 0.30000000000000004 here.
  for (const tick of niceTicks([0, 1], 10)) {
    assert.equal(tick, Number(tick.toFixed(10)), `float dust in ${tick}`);
  }
});

test('niceTicks stays inside the domain', () => {
  const ticks = niceTicks([3, 47], 6);
  assert.ok(ticks.every((t) => t >= 3 && t <= 47), `out of domain: ${ticks}`);
  assert.ok(ticks.length > 0);
});

test('niceTicks handles a negative domain', () => {
  const ticks = niceTicks([-50, -10], 4);
  assert.ok(ticks.every((t) => t >= -50 && t <= -10));
  assert.ok(ticks.length >= 2);
});

test('niceTicks handles a degenerate domain', () => {
  assert.deepEqual(niceTicks([7, 7], 5), [7]);
});

/* ------------------------------------------------------------------ *
 * logTicks — the one that matters
 * ------------------------------------------------------------------ */

test('logTicks gives one per decade when there is room', () => {
  assert.deepEqual(logTicks([1, 1000], 8), [1, 10, 100, 1000]);
});

test('logTicks thins across the deep-time domain and stays readable', () => {
  // Planck time to roughly the present age of the universe in seconds.
  const ticks = logTicks([1e-36, 1e18], 8);
  assert.ok(ticks.length <= 8, `${ticks.length} ticks is too many to read`);
  assert.ok(ticks.length >= 4, `${ticks.length} ticks is too few to orient by`);
});

test('logTicks lands on exact powers of ten', () => {
  for (const tick of logTicks([1e-36, 1e18], 8)) {
    const exponent = exponentOf(tick);
    assert.ok(
      Math.abs(Math.log10(tick) - exponent) < 1e-9,
      `${tick} is not an exact power of ten`
    );
  }
});

test('logTicks steps by a whole number of decades', () => {
  const ticks = logTicks([1e-36, 1e18], 8);
  const exponents = ticks.map(exponentOf);
  const gaps = exponents.slice(1).map((e, i) => e - exponents[i]);
  assert.ok(gaps.length > 0);
  assert.ok(
    gaps.every((gap) => gap === gaps[0] && Number.isInteger(gap)),
    `uneven decade steps: ${gaps}`
  );
});

test('logTicks respects the count budget at every scale', () => {
  const domains = [
    [1e-36, 1e18], // deep time, 54 decades
    [1e-10, 1e-4], // 6 decades
    [1, 1e12], // 12 decades
    [1e-30, 1e30], // 60 decades
  ];
  for (const domain of domains) {
    for (const count of [4, 6, 8, 12]) {
      const ticks = logTicks(domain, count);
      assert.ok(
        ticks.length <= count,
        `domain ${domain} count ${count} produced ${ticks.length} ticks`
      );
    }
  }
});

test('logTicks stays within the domain', () => {
  const ticks = logTicks([2e-5, 3e7], 6);
  assert.ok(ticks.every((t) => t >= 2e-5 && t <= 3e7), `out of domain: ${ticks}`);
});

test('logTicks falls back to linear inside a single decade', () => {
  const ticks = logTicks([3, 7], 5);
  assert.ok(ticks.length >= 2, 'a sub-decade axis still needs ticks');
  assert.ok(ticks.every((t) => t >= 3 && t <= 7));
});

/* ------------------------------------------------------------------ *
 * paths
 * ------------------------------------------------------------------ */

test('linePath emits a moveto then linetos', () => {
  assert.equal(
    linePath([
      [0, 0],
      [10, 20],
      [20, 5],
    ]),
    'M0 0L10 20L20 5'
  );
});

test('linePath breaks the line at missing data rather than bridging it', () => {
  const path = linePath([
    [0, 0],
    [10, NaN],
    [20, 5],
  ]);
  // two movetos = a genuine gap, not a straight line across the hole
  assert.equal(path.match(/M/g).length, 2, `expected a gap, got ${path}`);
});

test('linePath tolerates an empty series', () => {
  assert.equal(linePath([]), '');
});

test('areaPath closes back to the baseline', () => {
  const path = areaPath(
    [
      [0, 10],
      [10, 20],
    ],
    100
  );
  assert.ok(path.endsWith('Z'), 'area must be closed');
  assert.ok(path.includes('100'), 'area must return to the baseline');
});

/* ------------------------------------------------------------------ *
 * scroll helpers
 * ------------------------------------------------------------------ */

test('clamp bounds', () => {
  assert.equal(clamp(-1), 0);
  assert.equal(clamp(0.5), 0.5);
  assert.equal(clamp(2), 1);
});

test('remap is clamped, which is what makes scroll reversible', () => {
  assert.equal(remap(0, [0, 10], [0, 100]), 0);
  assert.equal(remap(5, [0, 10], [0, 100]), 50);
  assert.equal(remap(20, [0, 10], [0, 100]), 100);
  assert.equal(remap(-20, [0, 10], [0, 100]), 0);
});

test('remap survives a zero-width input span', () => {
  assert.equal(remap(5, [3, 3], [0, 100]), 0);
});
