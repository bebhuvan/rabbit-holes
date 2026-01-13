// Posts loader for wikilinks resolution
// Reads all posts at build time and creates a lookup map

import fs from 'node:fs';
import path from 'node:path';
import type { PostInfo } from './remarkWikilinks';

// Extract frontmatter title from markdown content
function extractTitle(content: string): string | null {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;

  const frontmatter = frontmatterMatch[1];
  const titleMatch = frontmatter.match(/^title:\s*["']?(.+?)["']?\s*$/m);

  return titleMatch ? titleMatch[1].trim() : null;
}

// Extract slug from filename (removes date prefix)
// e.g., "2025-08-21-my-post-slug.md" -> "my-post-slug"
function extractSlug(filename: string): string {
  return filename
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')
    .replace(/\.md$/, '');
}

export async function getPostsForWikilinks(): Promise<Map<string, PostInfo>> {
  const postsDir = path.join(process.cwd(), 'src/content/posts');
  const posts = new Map<string, PostInfo>();

  try {
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
        const title = extractTitle(content);
        const slug = extractSlug(file);

        if (title) {
          posts.set(slug, { slug, title });
        }
      } catch {
        // Skip files that can't be read
      }
    }
  } catch {
    // Return empty map if posts directory doesn't exist
  }

  return posts;
}

// Synchronous version for use in config files
export function getPostsForWikilinksSync(): Map<string, PostInfo> {
  const postsDir = path.join(process.cwd(), 'src/content/posts');
  const posts = new Map<string, PostInfo>();

  try {
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
        const title = extractTitle(content);
        const slug = extractSlug(file);

        if (title) {
          posts.set(slug, { slug, title });
        }
      } catch {
        // Skip files that can't be read
      }
    }
  } catch {
    // Return empty map if posts directory doesn't exist
  }

  return posts;
}
