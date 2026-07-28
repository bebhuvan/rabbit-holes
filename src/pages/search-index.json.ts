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

export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = newestFirst(await getCollection('posts'));
  const numbers = buildFolioNumbers(posts);
  const index = posts.map((post) => ({
    slug: post.slug,
    number: folioLabel(numbers.get(post.slug) || 0, posts.length),
    title: post.data.title,
    description: post.data.description || excerpt(post.body || '', 240),
    content: excerpt(post.body || '', 900),
    kind: post.data.type,
    kindLabel: postKinds[post.data.type].singular,
    tags: (post.data.tags || []).map(displayTag),
    date: post.data.date.toISOString(),
  }));

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
