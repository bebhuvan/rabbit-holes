import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import {
  buildFolioNumbers,
  displayTag,
  excerpt,
  folioLabel,
  newestFirst,
  postKinds,
} from '../utils/content';
import {
  newestFirst as explainersNewestFirst,
  lastTouched,
  chapterBody,
} from '../utils/explainers';

export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = newestFirst(await getCollection('posts'));
  const numbers = buildFolioNumbers(posts);
  const index: unknown[] = posts.map((post) => ({
    slug: post.slug,
    url: `/posts/${post.slug}`,
    number: folioLabel(numbers.get(post.slug) || 0, posts.length),
    title: post.data.title,
    description: post.data.description || excerpt(post.body || '', 240),
    content: excerpt(post.body || '', 900),
    kind: post.data.type,
    kindLabel: postKinds[post.data.type].singular,
    tags: (post.data.tags || []).map(displayTag),
    date: post.data.date.toISOString(),
  }));

  // Explainers are indexed PER CHAPTER, not per page. A forty-minute document
  // that returns a single result is a document nobody can search — the reader
  // wants the chapter on tunnelling, not the piece that contains it.
  const explainers = explainersNewestFirst(await getCollection('explainers'));

  for (const explainer of explainers) {
    for (const chapter of explainer.data.chapters) {
      const body = chapterBody(explainer.body, chapter.title);
      index.push({
        slug: `${explainer.slug}#${chapter.id}`,
        url: `/explainers/${explainer.slug}#${chapter.id}`,
        number: 'EX',
        title: chapter.title,
        description: chapter.asks || excerpt(body, 240),
        content: excerpt(body, 900),
        kind: 'explainer',
        kindLabel: 'Explainer',
        parent: explainer.data.title,
        tags: (explainer.data.tags || []).map(displayTag),
        date: lastTouched(explainer).toISOString(),
      });
    }
  }

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
