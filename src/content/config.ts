import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    type: z.enum(['musings', 'links', 'reflections', 'verse', 'practical']),
    url: z.string().url().optional(),
    via: z.string().optional(), // Attribution: where you found this link (URL or @username)
    note: z.string().optional(), // The collector's hand: why this was kept
    author: z.string().optional(),
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
    image: z.string().optional(),
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
    related_posts: z.array(
      z.union([
        z.string(),
        z.object({
          slug: z.string(),
          reason: z.string().optional()
        })
      ])
    ).optional(),
    published: z.boolean().default(true),
    featured: z.boolean().default(false),
  }),
});

const glosses = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
    source_title: z.string(),
    source_url: z.string().url(),
    source_author: z.string().optional(),
    source_kind: z.string().default('Article'),
    model: z.string().optional(),
    note: z.string().optional(),
    folio: z.string().optional(),
    published: z.boolean().default(true),
  }),
});

export const collections = {
  posts,
  glosses,
};
