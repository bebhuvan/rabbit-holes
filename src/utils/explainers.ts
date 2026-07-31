import type { CollectionEntry } from 'astro:content';
import type { MarkdownHeading } from 'astro';

export type Explainer = CollectionEntry<'explainers'>;
export type ExplainerSource = Explainer['data']['sources'][number];
export type ExplainerRevision = Explainer['data']['revisions'][number];

/**
 * standfirst is authored as HTML so the page can bold the answer inside it.
 * A meta description is plain text, and pasting the markup in unrendered put
 * literal <strong> tags in search results and social cards.
 */
export function stripMarkup(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The three epistemic states. Ordered by decreasing confidence. */
export const epistemicStates = ['settled', 'contested', 'open'] as const;
export type Epistemic = (typeof epistemicStates)[number];

export const epistemicLabels: Record<Epistemic, { short: string; long: string }> = {
  settled: {
    short: 'Settled',
    long: 'Measured and reproduced. Not in serious dispute.',
  },
  contested: {
    short: 'Contested',
    long: 'Active research. Competing models, no settled answer yet.',
  },
  open: {
    short: 'Open',
    long: 'We do not know. This is the edge of what anyone can tell you.',
  },
};

export function isPublished(explainer: Explainer): boolean {
  return explainer.data.published !== false;
}

/** Most recently touched first — for a living document, `updated` is the real date. */
export function newestFirst(explainers: Explainer[]): Explainer[] {
  return [...explainers]
    .filter(isPublished)
    .sort((a, b) => {
      const difference = lastTouched(b).getTime() - lastTouched(a).getTime();
      return difference || a.slug.localeCompare(b.slug);
    });
}

export function lastTouched(explainer: Explainer): Date {
  return explainer.data.updated ?? explainer.data.date;
}

/**
 * Chapters are the `##` headings. They are the unit of navigation, of the
 * revision log, and of the search index — a forty-minute document that returns
 * one search result is a document nobody can search.
 */
export function chapters(headings: MarkdownHeading[]): MarkdownHeading[] {
  return headings.filter((heading) => heading.depth === 2);
}

/** Loose key for matching a declared chapter title to its heading in the body. */
function headingKey(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
}

/**
 * Split raw MDX into its chapter bodies, keyed by heading text.
 *
 * Keyed by text rather than by slug on purpose: Astro generates heading ids
 * with github-slugger, and reimplementing that here would be a second source of
 * truth that drifts. `assertChaptersMatchHeadings` already proves the declared
 * ids are the real ones, so text is a safe join.
 *
 * Fenced code is stripped first so a `## ` inside a code block cannot open a
 * phantom chapter.
 */
export function chapterSections(body: string): Map<string, string> {
  const sections = new Map<string, string>();
  const withoutFences = body.replace(/^```[\s\S]*?^```/gm, '');
  const lines = withoutFences.split('\n');

  let current: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (current !== null) sections.set(current, buffer.join('\n').trim());
    buffer = [];
  };

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading && !line.startsWith('###')) {
      flush();
      current = headingKey(heading[1]);
    } else if (current !== null) {
      buffer.push(line);
    }
  }
  flush();

  return sections;
}

/** The body of one declared chapter, or '' if it could not be matched. */
export function chapterBody(body: string, title: string): string {
  return chapterSections(body).get(headingKey(title)) ?? '';
}

/**
 * Cross-check declared chapters against the headings the prose actually
 * produced, in both directions.
 *
 * Declared-but-missing means the rail offers a link to nothing. Present-but-
 * undeclared means a chapter exists that the rail will never show, and — worse
 * — that no one assigned a depth to. Both are silent failures in the reader's
 * navigation, so both stop the build.
 */
export function assertChaptersMatchHeadings(
  explainer: Explainer,
  headings: MarkdownHeading[]
): void {
  const declared = new Set(explainer.data.chapters.map((chapter) => chapter.id));
  const rendered = new Set(chapters(headings).map((heading) => heading.slug));

  const missing = [...declared].filter((id) => !rendered.has(id));
  const undeclared = [...rendered].filter((id) => !declared.has(id));

  if (missing.length || undeclared.length) {
    const lines = [`[explainers] ${explainer.slug}: chapter declarations do not match the prose.`];
    if (missing.length) {
      lines.push(`  declared in frontmatter but no such heading: ${missing.join(', ')}`);
    }
    if (undeclared.length) {
      lines.push(`  heading exists but not declared (and so has no depth): ${undeclared.join(', ')}`);
    }
    throw new Error(lines.join('\n'));
  }
}

/**
 * Sources, keyed by id for <Cite> to resolve.
 *
 * Throws on a duplicate id rather than silently keeping the last one: two
 * sources answering to `ame2020` means one of the numbers in the prose is
 * pointing at the wrong paper, and that is exactly the failure this document
 * cannot afford.
 */
export function sourceMap(explainer: Explainer): Map<string, ExplainerSource> {
  const map = new Map<string, ExplainerSource>();

  for (const source of explainer.data.sources) {
    if (map.has(source.id)) {
      throw new Error(
        `[explainers] ${explainer.slug}: duplicate source id "${source.id}". ` +
          `Source ids must be unique — <Cite id="${source.id}"> would be ambiguous.`
      );
    }
    map.set(source.id, source);
  }

  return map;
}

/** A short human label for a source: "Wang et al., 2021". */
export function citeLabel(source: ExplainerSource): string {
  const author = source.author?.trim();
  if (author && source.year) return `${author}, ${source.year}`;
  if (author) return author;
  if (source.year) return `${source.title}, ${source.year}`;
  return source.title;
}

/**
 * Revisions, newest first, with their chapter ids normalised. Used both by the
 * changelog panel and by the depth rail, which marks chapters that changed
 * since a reader's last visit.
 */
export function revisionsByChapter(explainer: Explainer): Map<string, ExplainerRevision[]> {
  const map = new Map<string, ExplainerRevision[]>();

  for (const revision of explainer.data.revisions) {
    for (const chapter of revision.chapters) {
      const list = map.get(chapter) ?? [];
      list.push(revision);
      map.set(chapter, list);
    }
  }

  return map;
}

export function newestRevisionsFirst(explainer: Explainer): ExplainerRevision[] {
  return [...explainer.data.revisions].sort((a, b) => b.date.getTime() - a.date.getTime());
}
