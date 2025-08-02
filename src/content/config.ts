import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    type: z.enum(['taught-by-machine', 'quick-thoughts', 'link-dumps', 'deep-dives', 'thats-interesting', 'practical', 'reflections', 'data-stories', 'news-commentary', 'videos', 'music', 'photos']),
    url: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
    dive_deeper: z.array(
      z.union([
        z.string(), // Support legacy string format
        z.object({
          text: z.string(),
          url: z.string().url(),
          description: z.string().optional(),
        })
      ])
    ).optional(),
    related_posts: z.array(z.string()).optional(),
    published: z.boolean().default(true),
  }),
});

export const collections = {
  posts,
};