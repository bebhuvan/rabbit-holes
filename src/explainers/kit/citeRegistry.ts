/**
 * Build-time numbering for <Cite>.
 *
 * The problem: a citation marker should show the number of the source it points
 * at, but <Cite id="ame2020" /> sits inside MDX prose and has no access to the
 * page's frontmatter. Threading a `sources` prop through every call site would
 * make the markup unwritable.
 *
 * The solution: the page publishes the numbering here immediately before it
 * renders <Content />, and Cite reads it back. Astro renders a page's component
 * tree synchronously, so within one page this is deterministic.
 *
 * The safety net matters more than the mechanism. If the registry is ever empty
 * or missing an id — a concurrent render, a refactor, anything — `numberFor`
 * returns 0 and Cite falls back to a neutral mark that still links correctly.
 * It degrades to "unnumbered but working", never to a confidently wrong number,
 * which is the only failure mode this document cannot tolerate.
 */
let numbers = new Map<string, number>();
let owner = '';

/** Called by the page, before <Content /> renders. */
export function publishCiteNumbers(slug: string, ids: string[]): void {
  owner = slug;
  numbers = new Map(ids.map((id, index) => [id, index + 1]));
}

/** 0 means "not known" — Cite renders its neutral mark instead of a number. */
export function numberFor(id: string): number {
  return numbers.get(id) ?? 0;
}

export function currentOwner(): string {
  return owner;
}
