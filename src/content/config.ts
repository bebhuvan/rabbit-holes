import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    type: z.enum(['musing', 'link', 'video', 'music']),
    url: z.string().url().optional(),
    tags: z.array(z.string()),
    description: z.string().optional(),
    dive_deeper: z.array(z.string()).optional(),
    related_posts: z.array(z.string()).optional(),
    published: z.boolean().default(true),
  }),
});

export const collections = {
  posts,
};