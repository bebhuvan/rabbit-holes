/**
 * PROVENANCE — enforced at build, not by discipline.
 *
 * The failure mode for a document like this is not an ugly chart. It is being
 * confidently wrong, at scale, permanently, in a page that looks authoritative.
 * Everything here exists to make that failure loud and early.
 *
 * Two rules:
 *   1. Every <Cite id="..."> resolves to a declared source.
 *   2. Every dataset a figure reads carries where it came from.
 *
 * Both throw. A broken citation must fail the build, because a citation that
 * silently points at nothing is worse than no citation at all — it looks like
 * rigour.
 */
import { z } from 'astro:content';
import type { Explainer, ExplainerSource } from './explainers';

/* ------------------------------------------------------------------ *
 * 1. Citations
 * ------------------------------------------------------------------ */

/**
 * Pull every cited id out of raw MDX.
 *
 * Deliberately scans the source text rather than the rendered output: it runs
 * before rendering, needs no coordination with the MDX component tree, and
 * cannot be defeated by a component that happens not to render.
 */
export function citedIds(body: string): string[] {
  const found = new Set<string>();
  // <Cite id="ame2020" />, <Cite id='ame2020'>, any attribute order
  const pattern = /<Cite\b[^>]*?\bid\s*=\s*["']([^"']+)["']/g;

  for (const match of body.matchAll(pattern)) {
    found.add(match[1]);
  }

  return [...found];
}

export function assertCitationsResolve(
  explainer: Explainer,
  sources: Map<string, ExplainerSource>
): void {
  const cited = citedIds(explainer.body);
  const unknown = cited.filter((id) => !sources.has(id));

  if (unknown.length) {
    throw new Error(
      `[provenance] ${explainer.slug}: ${unknown.length} citation(s) point at nothing.\n` +
        unknown.map((id) => `  <Cite id="${id}"> — no source with that id`).join('\n') +
        `\n  declared ids: ${[...sources.keys()].join(', ') || '(none)'}`
    );
  }
}

/**
 * Sources declared but never cited. Not fatal — a source can legitimately be
 * further reading — but worth surfacing, because the usual cause is a citation
 * that was edited out of the prose and left its source stranded.
 */
export function uncitedSources(
  explainer: Explainer,
  sources: Map<string, ExplainerSource>
): string[] {
  const cited = new Set(citedIds(explainer.body));
  return [...sources.keys()].filter((id) => !cited.has(id));
}

/* ------------------------------------------------------------------ *
 * 2. Datasets
 * ------------------------------------------------------------------ */

/**
 * Every dataset a figure reads must say where it came from. `retrieved` matters
 * as much as `url`: these are living documents, and in three years the question
 * will not be "what does this page say" but "when was this last checked".
 */
export const datasetSchema = z.object({
  source: z.object({
    title: z.string().min(1),
    url: z.string().url(),
    author: z.string().optional(),
    year: z.number().int().optional(),
    retrieved: z.string().min(1), // ISO date the values were taken
    note: z.string().optional(),
  }),
  epistemic: z.enum(['settled', 'contested', 'open']).default('settled'),
  units: z.record(z.string()).optional(),
  rows: z.array(z.unknown()).min(1),
});

export type Dataset = z.infer<typeof datasetSchema>;

/**
 * Validate a dataset at build time. Call this in figure frontmatter — the
 * import alone is not enough, because JSON imports are not type-checked at
 * runtime and a truncated or hand-edited file will otherwise sail through.
 */
export function dataset(name: string, raw: unknown): Dataset {
  const result = datasetSchema.safeParse(raw);

  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `[provenance] dataset "${name}" is not usable:\n${problems}\n` +
        `  Every dataset must carry source.title, source.url and source.retrieved.\n` +
        `  A figure without provenance is a figure nobody can check.`
    );
  }

  return result.data;
}

/** Rows, typed by the caller who knows the shape. */
export function rows<T>(data: Dataset): T[] {
  return data.rows as T[];
}

/* ------------------------------------------------------------------ *
 * 3. Explainer boxes
 * ------------------------------------------------------------------ */

/**
 * Structural checks on <Explain>/<Def>.
 *
 * Deliberately structural rather than semantic. The tempting guard here is
 * "every defined term must appear in the prose", and it is the wrong one: it
 * fails on ordinary wording — a box defining "shell closure" for a figure whose
 * axis says "closed shells" is correct and would be rejected — and a guard that
 * cries wolf teaches people to reach for the override, which costs more than it
 * ever saves. These three cannot produce a false alarm:
 *
 *   1. A <Def> outside an <Explain> renders as an orphan with no frame.
 *   2. An <Explain> with no <Def> renders as an empty box.
 *   3. The same term defined twice means the document drifted, and a reader met
 *      two different explanations of one idea.
 */
export function assertExplainersAreWellFormed(explainer: Explainer): void {
  const body = explainer.body;
  const problems: string[] = [];

  // Blocks, in source order. Non-greedy so adjacent boxes do not merge.
  const blocks = [...body.matchAll(/<Explain\b[^>]*>([\s\S]*?)<\/Explain>/g)];
  const defsInside = blocks.reduce((count, block) => count + (block[1].match(/<Def\b/g)?.length ?? 0), 0);
  const defsTotal = body.match(/<Def\b/g)?.length ?? 0;

  if (defsTotal > defsInside) {
    problems.push(
      `  ${defsTotal - defsInside} <Def> outside any <Explain> — it will render with no frame ` +
        `around it and no heading above it.`
    );
  }

  blocks.forEach((block, index) => {
    if (!/<Def\b/.test(block[1])) {
      const title = block[0].match(/title\s*=\s*["']([^"']*)["']/)?.[1] ?? `#${index + 1}`;
      problems.push(`  <Explain title="${title}"> contains no <Def> — it renders as an empty box.`);
    }
  });

  const seen = new Map<string, number>();
  for (const match of body.matchAll(/<Def\b[^>]*?\bterm\s*=\s*["']([^"']+)["']/g)) {
    const key = match[1].trim().toLowerCase();
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  for (const [term, count] of seen) {
    if (count > 1) {
      problems.push(`  "${term}" is defined ${count} times — the reader meets two explanations of one idea.`);
    }
  }

  if (problems.length) {
    throw new Error(`[provenance] ${explainer.slug}: explainer boxes are malformed.\n${problems.join('\n')}`);
  }
}
