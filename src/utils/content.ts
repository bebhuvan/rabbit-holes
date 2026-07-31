import type { CollectionEntry } from 'astro:content';
import { heads, type HeadDefinition } from '../data/heads';

export type Post = CollectionEntry<'posts'>;

export const postKinds = {
  musings: { singular: 'Musing', plural: 'Musings', color: 'var(--c-musings)' },
  links: { singular: 'Link', plural: 'Links', color: 'var(--c-links)' },
  reflections: { singular: 'Reflection', plural: 'Reflections', color: 'var(--c-reflections)' },
  verse: { singular: 'Verse', plural: 'Verse', color: 'var(--c-verse)' },
  practical: { singular: 'Practical', plural: 'Practical', color: 'var(--c-practical)' },
} as const;

export function normalizeTag(tag: string): string {
  return tag.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
}

export function displayTag(tag: string): string {
  return tag.trim().replace(/\s+/g, ' ');
}

export function tagSlug(tag: string): string {
  return normalizeTag(tag)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isPublished(post: Post): boolean {
  return post.data.published !== false;
}

export function chronological(posts: Post[]): Post[] {
  return [...posts]
    .filter(isPublished)
    .sort((a, b) => {
      const dateDifference = a.data.date.getTime() - b.data.date.getTime();
      return dateDifference || a.slug.localeCompare(b.slug);
    });
}

export function newestFirst(posts: Post[]): Post[] {
  return chronological(posts).reverse();
}

export function buildFolioNumbers(posts: Post[]): Map<string, number> {
  return new Map(chronological(posts).map((post, index) => [post.slug, index + 1]));
}

export function folioLabel(number: number, total: number): string {
  return String(number).padStart(Math.max(3, String(total).length), '0');
}

export function formatPostDate(date: Date, long = false): string {
  return date.toLocaleDateString('en-GB', long
    ? { day: 'numeric', month: 'long', year: 'numeric' }
    : { day: '2-digit', month: 'short', year: 'numeric' });
}

export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

/**
 * Prose from markdown, for the stream preview and the search index.
 *
 * Two things this has to survive, both of which it used to get wrong and both
 * of which were visible on the home page:
 *
 *  1. A destination containing parentheses. `![](</images/chart (1).png>)` is
 *     legal markdown — Pages CMS writes it whenever a filename has a bracket —
 *     and the old `\([^)]*\)` stopped dead at the `(1)`, leaving `.png>)`
 *     sitting in the middle of the preview.
 *  2. A bare URL on its own line. Those are the embed syntax this site uses
 *     (see remarkLinkEmbed), so on the page they render as a tweet or a video
 *     card — but the excerpt read the raw source and printed the URL as if it
 *     were a sentence.
 *
 * A destination is therefore matched as either an angle-bracketed run or a
 * parenthesised run that tolerates ONE level of nesting, which covers every
 * real filename without needing a parser.
 */
const MD_DEST = String.raw`\(\s*(?:<[^>]*>|[^()]*(?:\([^()]*\)[^()]*)*)\s*\)`;

export function excerpt(body: string, maximum = 220): string {
  const cleaned = body
    // Zero-width and BOM characters, which arrive with text pasted out of
    // other editors. They are invisible in the source and mostly harmless in
    // a sentence, but ::first-letter matches the first character rather than
    // the first LETTER, so a leading U+200B took the rubricated drop cap: a
    // 67px floated box, containing nothing, that the next two lines wrapped
    // around. The paragraph looked mis-indented for no visible reason.
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    // images go entirely; links keep their text. Images first — otherwise the
    // link rule eats the `[...](...)` and orphans the leading `!`.
    .replace(new RegExp(String.raw`!\[[^\]]*\]${MD_DEST}`, 'g'), ' ')
    .replace(new RegExp(String.raw`\[([^\]]*)\]${MD_DEST}`, 'g'), '$1')
    .replace(/<[^>]+>/g, ' ')
    // a bare URL is an embed on the page and noise in a sentence
    .replace(/<?\bhttps?:\/\/\S+?>?(?=[\s)]|$)/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*(?:[-*+]|\d+[.)])\s+/gm, '')
    .replace(/^\s*(?:[-*_]\s*){3,}$/gm, ' ')
    .replace(/[*_`~]/g, '')
    // brackets left empty by a stripped image or link
    .replace(/\(\s*\)|\[\s*\]/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    // a colon or dash that introduced something now removed
    .replace(/[:—–-]\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= maximum) return cleaned;
  return `${cleaned.slice(0, maximum).replace(/\s+\S*$/, '')}…`;
}

export function canonicalTags(posts: Post[]): Array<{ name: string; slug: string; count: number }> {
  const tags = new Map<string, { name: string; slug: string; count: number }>();

  for (const post of posts.filter(isPublished)) {
    const seen = new Set<string>();
    for (const rawTag of post.data.tags || []) {
      const normalized = normalizeTag(rawTag);
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);

      const current = tags.get(normalized);
      if (current) {
        current.count += 1;
      } else {
        tags.set(normalized, {
          name: displayTag(rawTag),
          slug: tagSlug(rawTag),
          count: 1,
        });
      }
    }
  }

  return [...tags.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function postsForTag(posts: Post[], slug: string): Post[] {
  return newestFirst(posts).filter((post) =>
    (post.data.tags || []).some((tag) => tagSlug(tag) === slug)
  );
}

export function postsForHead(posts: Post[], head: HeadDefinition): Post[] {
  const aliases = new Set(head.aliases.map(normalizeTag));
  return newestFirst(posts).filter((post) =>
    (post.data.tags || []).some((tag) => aliases.has(normalizeTag(tag)))
  );
}

export function headCounts(posts: Post[]): Array<HeadDefinition & { count: number }> {
  return heads.map((head) => ({ ...head, count: postsForHead(posts, head).length }));
}

export function relatedPosts(post: Post, posts: Post[], limit = 4): Array<{ post: Post; reason: string }> {
  const manual = post.data.related_posts || [];
  if (manual.length) {
    return manual
      .map((item) => {
        const slug = typeof item === 'string' ? item : item.slug;
        const related = posts.find((candidate) => candidate.slug === slug && isPublished(candidate));
        if (!related) return null;
        return {
          post: related,
          reason: typeof item === 'object' && item.reason ? item.reason : 'chosen by hand',
        };
      })
      .filter((item): item is { post: Post; reason: string } => Boolean(item))
      .slice(0, limit);
  }

  const sourceTags = new Set((post.data.tags || []).map(normalizeTag).filter(Boolean));

  return posts
    .filter((candidate) => candidate.slug !== post.slug && isPublished(candidate))
    .map((candidate) => {
      const shared = (candidate.data.tags || [])
        .map(normalizeTag)
        .filter((tag) => sourceTags.has(tag));
      const sameKind = candidate.data.type === post.data.type;
      const dayDistance = Math.abs(candidate.data.date.getTime() - post.data.date.getTime()) / 86_400_000;
      const recency = Math.max(0, 1 - dayDistance / 365);
      const score = shared.length * 6 + (sameKind ? 2 : 0) + recency;
      const reason = shared.length
        ? `shares ${shared.slice(0, 2).join(' · ')}${sameKind ? ` · both ${postKinds[post.data.type].singular.toLowerCase()}` : ''}`
        : `another ${postKinds[post.data.type].singular.toLowerCase()}`;
      return { post: candidate, reason, score };
    })
    .filter((item) => item.score > 1)
    .sort((a, b) => b.score - a.score || b.post.data.date.getTime() - a.post.data.date.getTime())
    .slice(0, limit)
    .map(({ post: related, reason }) => ({ post: related, reason }));
}
