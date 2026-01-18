/**
 * Build-time related posts generator using AI
 * Runs during Astro build to find semantically related posts
 * Results are cached to avoid re-processing on every build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = path.join(__dirname, '../../.related-posts-cache.json');
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

interface PostData {
  slug: string;
  title: string;
  body: string;
  tags: string[];
  type: string;
  date: string;
}

interface RelatedPost {
  slug: string;
  reason: string;
}

interface CacheEntry {
  relatedPosts: RelatedPost[];
  contentHash: string;
  timestamp: number;
}

interface Cache {
  [slug: string]: CacheEntry;
}

// Simple hash function for content comparison
function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Load cache from disk
function loadCache(): Cache {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Failed to load related posts cache:', e);
  }
  return {};
}

// Save cache to disk
function saveCache(cache: Cache): void {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (e) {
    console.warn('Failed to save related posts cache:', e);
  }
}

// Call Claude API to find related posts
async function findRelatedWithAI(
  post: PostData,
  allPosts: PostData[],
  apiKey: string
): Promise<RelatedPost[]> {
  const otherPosts = allPosts
    .filter(p => p.slug !== post.slug)
    .map(p => ({
      slug: p.slug,
      title: p.title,
      tags: p.tags,
      type: p.type,
      excerpt: p.body.slice(0, 500)
    }));

  const prompt = `You are analyzing blog posts to find semantic connections.

Current post:
Title: "${post.title}"
Type: ${post.type}
Tags: ${post.tags.join(', ')}
Content: ${post.body.slice(0, 1500)}

Find the 3 most semantically related posts from this list. Look for:
- Thematic connections (similar topics, ideas, themes)
- Conceptual links (posts that extend, contrast, or complement this one)
- Cross-domain connections (unexpected links between different fields)

Available posts:
${otherPosts.map(p => `- "${p.title}" [${p.slug}] (${p.type}, tags: ${p.tags.join(', ')})`).join('\n')}

Return ONLY a JSON array with exactly 3 items, each containing:
- slug: the post slug
- reason: a short phrase (5-10 words) explaining the connection

Example format:
[{"slug":"post-slug-here","reason":"Both explore the nature of creativity"}]`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content[0].text;

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const related = JSON.parse(jsonMatch[0]);
      // Validate that slugs exist
      return related.filter((r: RelatedPost) =>
        allPosts.some(p => p.slug === r.slug)
      ).slice(0, 3);
    }
  } catch (e) {
    console.warn(`Failed to get AI related posts for ${post.slug}:`, e);
  }

  return [];
}

// Fallback: tag-based similarity when AI is unavailable
function findRelatedByTags(post: PostData, allPosts: PostData[]): RelatedPost[] {
  const otherPosts = allPosts.filter(p => p.slug !== post.slug);

  const scored = otherPosts.map(p => {
    let score = 0;
    // Tag overlap
    const commonTags = post.tags.filter(t => p.tags.includes(t));
    score += commonTags.length * 3;
    // Same type bonus
    if (p.type === post.type) score += 1;
    // Recent posts slight bonus
    const daysDiff = Math.abs(
      new Date(post.date).getTime() - new Date(p.date).getTime()
    ) / (1000 * 60 * 60 * 24);
    if (daysDiff < 30) score += 0.5;

    return {
      slug: p.slug,
      score,
      reason: commonTags.length > 0
        ? `Both tagged: ${commonTags.slice(0, 2).join(', ')}`
        : `Related ${p.type}`
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .filter(p => p.score > 0)
    .map(({ slug, reason }) => ({ slug, reason }));
}

/**
 * Get related posts for a single post
 * Uses AI when available, falls back to tag-based matching
 */
export async function getRelatedPostsForBuild(
  post: PostData,
  allPosts: PostData[]
): Promise<RelatedPost[]> {
  const cache = loadCache();
  const contentHash = hashContent(post.title + post.body.slice(0, 1000));

  // Check cache
  const cached = cache[post.slug];
  if (cached &&
      cached.contentHash === contentHash &&
      Date.now() - cached.timestamp < CACHE_MAX_AGE) {
    // Validate cached slugs still exist
    const validCached = cached.relatedPosts.filter(r =>
      allPosts.some(p => p.slug === r.slug)
    );
    if (validCached.length > 0) {
      return validCached;
    }
  }

  // Try AI first
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  let related: RelatedPost[] = [];

  if (apiKey) {
    related = await findRelatedWithAI(post, allPosts, apiKey);
  }

  // Fallback to tag-based
  if (related.length === 0) {
    related = findRelatedByTags(post, allPosts);
  }

  // Update cache
  if (related.length > 0) {
    cache[post.slug] = {
      relatedPosts: related,
      contentHash,
      timestamp: Date.now()
    };
    saveCache(cache);
  }

  return related;
}

/**
 * Batch process all posts (useful for pre-warming cache)
 */
export async function warmRelatedPostsCache(allPosts: PostData[]): Promise<void> {
  console.log(`Warming related posts cache for ${allPosts.length} posts...`);

  for (const post of allPosts) {
    await getRelatedPostsForBuild(post, allPosts);
    // Rate limiting: small delay between API calls
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('Related posts cache warmed.');
}
