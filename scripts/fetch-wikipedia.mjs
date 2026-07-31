/**
 * Fetch Wikipedia summaries for the terms explainers gloss.
 *
 * Run: npm run wiki
 *
 * Why build time and not runtime:
 *   — the site ships as static assets; a runtime fetch would need a CSP change,
 *     add a third-party dependency to every page load, and break offline
 *   — the text is checked into the repo, so what a reader sees is what was
 *     reviewed, not whatever the article says today
 *   — `fetched` is recorded, so a stale gloss is visible rather than invisible
 *
 * LICENCE, which is not optional: Wikipedia text is CC BY-SA 4.0. Every gloss
 * links to the article it came from and the page carries the licence notice.
 * Reusing the prose without that would be a licence violation, not a nicety.
 */
import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '..', 'src', 'explainers', 'data', 'wikipedia.json');

/**
 * key → Wikipedia article title.
 * The key is what authors write: <Term k="r-process">the r-process</Term>
 */
const TERMS = {
  nucleosynthesis: 'Nucleosynthesis',
  'big-bang-nucleosynthesis': 'Big Bang nucleosynthesis',
  deuterium: 'Deuterium',
  'coulomb-barrier': 'Coulomb barrier',
  'quantum-tunnelling': 'Quantum tunnelling',
  'gamow-factor': 'Gamow factor',
  'proton-proton-chain': 'Proton–proton chain',
  'cno-cycle': 'CNO cycle',
  'binding-energy': 'Nuclear binding energy',
  sphaleron: 'Sphaleron',
  'cp-violation': 'CP violation',
  baryogenesis: 'Baryogenesis',
  'sakharov-conditions': 'Sakharov conditions',
  's-process': 'S-process',
  'r-process': 'R-process',
  kilonova: 'Kilonova',
  gw170817: 'GW170817',
  'agb-star': 'Asymptotic giant branch',
  'type-ia-supernova': 'Type Ia supernova',
  'core-collapse-supernova': 'Core-collapse supernova',
  recombination: 'Recombination (cosmology)',
  'cosmic-microwave-background': 'Cosmic microwave background',
  'planck-time': 'Planck time',
  'cosmological-lithium-problem': 'Cosmological lithium problem',
  'chart-of-nuclides': 'Table of nuclides',
  'magic-number': 'Magic number (physics)',
  'stellar-nucleosynthesis': 'Stellar nucleosynthesis',
  'neutron-star-merger': 'Neutron star merger',
  'b2fh-paper': 'B2FH paper',
  'cecilia-payne': 'Cecilia Payne-Gaposchkin',
  'george-gamow': 'George Gamow',
  'fred-hoyle': 'Fred Hoyle',
  'hans-bethe': 'Hans Bethe',
  'neutrino-decoupling': 'Neutrino decoupling',
};

const API = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

/** Trim to a couple of sentences — a gloss, not an article. */
function gloss(extract) {
  const clean = extract.replace(/\s+/g, ' ').trim();
  if (clean.length <= 300) return clean;
  const cut = clean.slice(0, 300);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
  return stop > 140 ? cut.slice(0, stop + 1) : `${cut.replace(/\s+\S*$/, '')}…`;
}

const existing = await readFile(OUT, 'utf8')
  .then((raw) => JSON.parse(raw))
  .catch(() => ({ terms: {} }));

const out = { ...existing.terms };
const failures = [];
let fetched = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const [key, title] of Object.entries(TERMS)) {
  // Already cached from an earlier run — leave it alone. This makes the script
  // resumable, which matters because the API rate-limits hard.
  if (out[key] && !process.argv.includes('--refresh')) continue;

  const url = API + encodeURIComponent(title.replace(/ /g, '_'));
  try {
    let response;
    // Exponential backoff on 429. One burst of requests gets throttled and
    // every remaining term fails; this walks through instead.
    for (let attempt = 0; attempt < 5; attempt++) {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'rabbitholes.garden explainer glosses (build-time, cached)',
          accept: 'application/json',
        },
      });
      if (response.status !== 429) break;
      await sleep(2000 * 2 ** attempt);
    }
    if (!response.ok) {
      failures.push(`${key}: HTTP ${response.status}`);
      continue;
    }
    const data = await response.json();
    if (data.type === 'disambiguation') {
      failures.push(`${key}: "${title}" is a disambiguation page — pick a specific article`);
      continue;
    }
    if (!data.extract) {
      failures.push(`${key}: no extract`);
      continue;
    }
    out[key] = {
      title: data.title,
      gloss: gloss(data.extract),
      url: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${title}`,
      fetched: new Date().toISOString().slice(0, 10),
    };
    fetched++;
    process.stdout.write('.');
  } catch (error) {
    failures.push(`${key}: ${error.message}`);
  }
  // Be a good citizen of someone else's API.
  await sleep(700);
}

process.stdout.write('\n');

await writeFile(
  OUT,
  `${JSON.stringify(
    {
      source: {
        title: 'Wikipedia article summaries',
        url: 'https://en.wikipedia.org',
        licence: 'CC BY-SA 4.0',
        note: 'Fetched at build time and checked into the repo, so the text a reader sees is the text that was reviewed. Every gloss links to its article, as the licence requires.',
      },
      terms: out,
    },
    null,
    2
  )}\n`
);

console.log(`${fetched} fetched, ${Object.keys(out).length} total → ${OUT}`);
if (failures.length) {
  console.log('\nProblems:');
  for (const failure of failures) console.log(`  ${failure}`);
  process.exitCode = failures.length === Object.keys(TERMS).length ? 1 : 0;
}
