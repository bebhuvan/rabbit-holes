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

// Visual explainers. The third shelf, and the only one written in the repo
// rather than through Pages CMS — each piece carries bespoke figure components,
// which a CMS cannot author.
//
// Two things here are load-bearing and are validated at build time rather than
// left to discipline (see src/utils/explainers.ts):
//   `sources` — every number in the prose resolves to one of these by id.
//   `revisions` — these are living documents; a changelog nobody can diff is
//                 theatre, so revisions name the chapters they touched.
const explainers = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    question: z.string(), // the question, asked plainly
    standfirst: z.string(), // the honest answer, given away up front
    date: z.date(), // first published
    updated: z.date().optional(),
    status: z.enum(['living', 'stable', 'draft']).default('living'),
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
    image: z.string().optional(), // hand-designed OG card
    // Chapters are declared rather than inferred, because the depth rail needs
    // something the prose cannot supply: how far down each chapter goes. `id`
    // must match the heading slug Astro generates, and the build cross-checks
    // both directions so the rail can never drift from the text.
    chapters: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          depth: z.number().int().min(0).max(3), // 0 = the surface, 3 = the bottom
          asks: z.string().optional(), // the question this chapter answers
        })
      )
      .default([]),
    revisions: z
      .array(
        z.object({
          date: z.date(),
          note: z.string(), // what changed, and why, in the author's voice
          chapters: z.array(z.string()).default([]),
        })
      )
      .default([]),
    sources: z
      .array(
        z.object({
          id: z.string(), // referenced by <Cite id="..." />
          title: z.string(),
          url: z.string().url(),
          author: z.string().optional(),
          year: z.number().optional(),
          note: z.string().optional(),
        })
      )
      .default([]),
    related_posts: z.array(z.string()).default([]), // into the folio corpus
    published: z.boolean().default(true),
  }),
});

export const collections = {
  posts,
  glosses,
  explainers,
};
