#!/usr/bin/env node
/**
 * Build the chart-of-nuclides dataset from the IAEA Nuclear Data Services
 * live-chart API, which serves the evaluated NUBASE2020 / AME2020 tables.
 *
 *   node scripts/fetch-nuclides.mjs
 *
 * WHY THIS EXISTS. The neutron-capture figure needs the actual nuclear
 * landscape — which nuclides exist, which occur in nature, and where the
 * evaluated table runs out. Every one of those is a measured or evaluated
 * fact, and there are about three and a half thousand of them. Typing them
 * from memory is exactly the failure this project's provenance guards exist to
 * prevent: confidently wrong, at scale, in a page that looks authoritative. So
 * they are fetched once, from the body that maintains them, and committed.
 *
 * Run this again when a new mass evaluation lands. It is not part of the build:
 * the site stays static and the committed JSON is what ships.
 *
 * Sanity checks run before anything is written, and the script refuses to
 * overwrite the dataset if any of them fail. They are textbook facts chosen
 * because a truncated download or a changed CSV column order would break them:
 * tin has ten stable isotopes, technetium and promethium have none, lead is the
 * heaviest element with a stable nuclide, and uranium is the heaviest with a
 * primordial one.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', 'src', 'explainers', 'stardust', 'data', 'nuclides.json');

const API =
  'https://nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=all';

/** The neutron separation energy that defines an r-process waiting point. */
const WAITING_POINT_KEV = 2500;

const SYMBOLS = {};

function parseCsv(text) {
  const lines = text.trim().split('\n');
  const head = lines[0].split(',');
  const at = (name) => {
    const i = head.indexOf(name);
    if (i === -1) throw new Error(`[nuclides] column "${name}" is gone from the API response`);
    return i;
  };
  const cols = {
    z: at('z'),
    n: at('n'),
    symbol: at('symbol'),
    abundance: at('abundance'),
    halfLife: at('half_life'),
    sn: at('sn'),
    systematics: at('me_systematics'),
  };
  return lines.slice(1).map((line) => {
    const f = line.split(',');
    const num = (i) => (f[i] && f[i].trim() !== '' && isFinite(Number(f[i])) ? Number(f[i]) : null);
    return {
      z: Number(f[cols.z]),
      n: Number(f[cols.n]),
      symbol: f[cols.symbol],
      abundance: num(cols.abundance),
      stable: f[cols.halfLife] === 'STABLE',
      sn: num(cols.sn),
      extrapolated: f[cols.systematics] === 'Y',
    };
  });
}

/** Contiguous [from, to] runs of a sorted integer list. */
function runs(sorted) {
  const out = [];
  let start = null;
  let previous = null;
  for (const value of sorted) {
    if (start === null) start = value;
    else if (value !== previous + 1) {
      out.push([start, previous]);
      start = value;
    }
    previous = value;
  }
  if (start !== null) out.push([start, previous]);
  return out;
}

const response = await fetch(API, { headers: { 'User-Agent': 'rabbitholes.garden figure build' } });
if (!response.ok) throw new Error(`[nuclides] IAEA returned ${response.status}`);
const all = parseCsv(await response.text()).filter((row) => row.z >= 1 && Number.isFinite(row.n));

for (const row of all) if (row.symbol) SYMBOLS[row.z] = row.symbol;

const byZ = new Map();
for (const row of all) {
  if (!byZ.has(row.z)) byZ.set(row.z, []);
  byZ.get(row.z).push(row);
}

const rows = [...byZ.keys()]
  .sort((a, b) => a - b)
  .map((z) => {
    const group = byZ.get(z).sort((a, b) => a.n - b.n);
    const natural = group.filter((r) => r.abundance !== null).map((r) => r.n);
    const edge = group[group.length - 1];

    return {
      z,
      symbol: SYMBOLS[z],
      // every nuclide in the evaluated table, as contiguous runs of N
      known: runs(group.map((r) => r.n)),
      // the ones that occur in nature — measured abundance, not an opinion
      natural,
      stable: group.filter((r) => r.stable).map((r) => r.n),
      // the neutron-rich edge of the table, and how far it still is from the
      // separation energy an r-process waiting point sits at
      edgeN: edge.n,
      edgeSn: edge.sn,
      edgeExtrapolated: edge.extrapolated,
    };
  });

/* ---- checks. Wrong data is worse than no data, so this refuses to write. --- */
const problems = [];
const find = (z) => rows.find((r) => r.z === z);
const check = (label, ok) => {
  if (!ok) problems.push(label);
};

check('tin should have ten stable isotopes', find(50)?.stable.length === 10);
check('technetium should have none', find(43)?.stable.length === 0);
check('promethium should have none', find(61)?.stable.length === 0);
check(
  'lead should be the heaviest element with a stable nuclide',
  Math.max(...rows.filter((r) => r.stable.length).map((r) => r.z)) === 82
);
check(
  'uranium should be the heaviest element occurring in nature',
  Math.max(...rows.filter((r) => r.natural.length).map((r) => r.z)) === 92
);
const naturalCount = rows.reduce((sum, r) => sum + r.natural.length, 0);
check(
  `there should be roughly 286 primordial nuclides, got ${naturalCount}`,
  naturalCount > 270 && naturalCount < 300
);
const knownCount = rows.reduce(
  (sum, r) => sum + r.known.reduce((k, [a, b]) => k + (b - a + 1), 0),
  0
);
check(
  `there should be roughly 3300 known nuclides, got ${knownCount}`,
  knownCount > 3000 && knownCount < 3800
);
check('hydrogen through oganesson', rows.length >= 110);

if (problems.length) {
  console.error('[nuclides] refusing to write — the download does not look right:');
  for (const problem of problems) console.error('  ✗ ' + problem);
  process.exit(1);
}

/* ---- the statistic the figure is built around ----------------------------
   For how many elements between iron and uranium does the evaluated table
   simply END before the neutron separation energy falls as far as an
   r-process waiting point? That is the honest measure of how far outside
   measured territory the rapid path runs, and the figure prints it. */
const heavy = rows.filter((r) => r.z >= 26 && r.z <= 92);
const beyond = heavy.filter((r) => r.edgeSn === null || r.edgeSn > WAITING_POINT_KEV);

const data = {
  source: {
    title: 'NUBASE2020 and AME2020, via the IAEA Nuclear Data Services live chart',
    url: 'https://nds.iaea.org/relnsd/vcharthtml/VChartHTML.html',
    author: 'Kondev, Wang, Huang, Naimi & Audi; IAEA Nuclear Data Section',
    year: 2021,
    retrieved: new Date().toISOString().slice(0, 10),
    note:
      `Ground-state properties of every nuclide in the evaluated table, fetched by ` +
      `scripts/fetch-nuclides.mjs. "natural" is the set with a measured terrestrial ` +
      `abundance — ${naturalCount} nuclides — which is an observation rather than a ` +
      `classification, and so avoids the definitional argument about which long-lived ` +
      `nuclides count as stable. "stable" is NUBASE's own designation, for reference. ` +
      `"edgeSn" is the neutron separation energy of the most neutron-rich nuclide the ` +
      `table carries for that element, in keV; where it is flagged extrapolated the ` +
      `mass is from systematics rather than measurement. Of the ${heavy.length} elements ` +
      `from iron to uranium, ${beyond.length} have a table that ends while the separation ` +
      `energy is still above the ${WAITING_POINT_KEV} keV that marks an r-process waiting ` +
      `point — that is, the rapid path lies beyond the evaluated table for those elements. ` +
      `Shell closures are the textbook magic numbers and are not part of this download.`,
  },
  epistemic: 'settled',
  units: { z: 'protons', n: 'neutrons', edgeSn: 'keV', waitingPoint: 'keV' },
  waitingPointKeV: WAITING_POINT_KEV,
  totals: {
    known: knownCount,
    natural: naturalCount,
    stable: rows.reduce((sum, r) => sum + r.stable.length, 0),
    heavyElements: heavy.length,
    heavyElementsBeyondTable: beyond.length,
  },
  rows,
};

writeFileSync(OUT, JSON.stringify(data, null, 1) + '\n');
console.log(
  `[nuclides] ${knownCount} known · ${naturalCount} natural · ${data.totals.stable} stable · ` +
    `${beyond.length}/${heavy.length} heavy elements whose table ends short of the r-process path`
);
console.log('[nuclides] wrote ' + OUT);
