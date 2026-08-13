import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { heads } from '../data/heads';
import { canonicalTags, newestFirst } from '../utils/content';
import { newestFirst as explainersNewestFirst, lastTouched } from '../utils/explainers';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const sortedPosts = newestFirst(await getCollection('posts'));
  const allTags = canonicalTags(sortedPosts);
  const glosses = await getCollection('glosses', ({ data }) => data.published !== false);
  const explainers = explainersNewestFirst(await getCollection('explainers'));

  const siteUrl = site || 'https://www.rabbitholes.garden/';

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main pages -->
  <url>
    <loc>${siteUrl}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
  <url>
    <loc>${siteUrl}about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}archive</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}search</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${siteUrl}blogroll</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${siteUrl}collections</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${siteUrl}tags</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${siteUrl}heads</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}study-notes</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${siteUrl}explainers</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Explainers. lastmod is the revision date, not first publication —
       these are living documents and that is the date that matters. -->
  ${explainers.map(explainer => `  <url>
    <loc>${siteUrl}explainers/${explainer.slug}</loc>
    <lastmod>${lastTouched(explainer).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}

  <!-- Individual tag pages -->
  ${allTags.map(tag => `  <url>
    <loc>${siteUrl}tags/${tag.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`).join('\n')}

  <!-- Curated heads -->
  ${heads.map(head => `  <url>
    <loc>${siteUrl}heads/${head.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}

  <!-- Blog posts -->
  ${sortedPosts.map(post => `  <url>
    <loc>${siteUrl}posts/${post.slug}</loc>
    <lastmod>${post.data.date.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}

  <!-- Study notes -->
  ${glosses.map(gloss => `  <url>
    <loc>${siteUrl}study-notes/${gloss.slug}</loc>
    <lastmod>${gloss.data.date.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}

  <!-- RSS Feed -->
  <url>
    <loc>${siteUrl}rss.xml</loc>
    <changefreq>weekly</changefreq>
    <priority>0.4</priority>
  </url>
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    }
  });
};
