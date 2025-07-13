// Related posts algorithm using tag similarity and content analysis
import type { CollectionEntry } from 'astro:content';

export interface RelatedPost {
  post: CollectionEntry<'posts'>;
  score: number;
  reasons: string[];
}

export function getRelatedPosts(
  currentPost: CollectionEntry<'posts'>, 
  allPosts: CollectionEntry<'posts'>[], 
  limit: number = 3
): RelatedPost[] {
  const related: RelatedPost[] = [];
  
  // Filter out current post and unpublished posts
  const candidatePosts = allPosts.filter(post => 
    post.slug !== currentPost.slug && 
    post.data.published !== false
  );
  
  for (const post of candidatePosts) {
    let score = 0;
    const reasons: string[] = [];
    
    // Tag similarity (strongest signal)
    const currentTags = new Set(currentPost.data.tags || []);
    const postTags = new Set(post.data.tags || []);
    const sharedTags = [...currentTags].filter(tag => postTags.has(tag));
    
    if (sharedTags.length > 0) {
      score += sharedTags.length * 10;
      reasons.push(`${sharedTags.length} shared tag${sharedTags.length > 1 ? 's' : ''}: ${sharedTags.join(', ')}`);
    }
    
    // Content type similarity
    if (currentPost.data.type === post.data.type) {
      score += 5;
      reasons.push(`Same content type: ${post.data.type}`);
    }
    
    // Title similarity (using simple word matching)
    const currentWords = new Set(
      currentPost.data.title.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3)
        .map(word => word.replace(/[^a-z]/g, ''))
    );
    
    const postWords = new Set(
      post.data.title.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3)
        .map(word => word.replace(/[^a-z]/g, ''))
    );
    
    const sharedWords = [...currentWords].filter(word => postWords.has(word));
    if (sharedWords.length > 0) {
      score += sharedWords.length * 3;
      reasons.push(`${sharedWords.length} related word${sharedWords.length > 1 ? 's' : ''} in title`);
    }
    
    // Date proximity (recent posts are more likely to be related)
    const currentDate = new Date(currentPost.data.date);
    const postDate = new Date(post.data.date);
    const daysDiff = Math.abs((currentDate.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 30) {
      score += 2;
      reasons.push('Posted recently');
    }
    
    // URL similarity (for link posts)
    if (currentPost.data.url && post.data.url) {
      try {
        const currentDomain = new URL(currentPost.data.url).hostname;
        const postDomain = new URL(post.data.url).hostname;
        if (currentDomain === postDomain) {
          score += 7;
          reasons.push(`Same source: ${currentDomain}`);
        }
      } catch (e) {
        // Invalid URLs, skip
      }
    }
    
    // Only include posts with meaningful similarity
    if (score > 5) {
      related.push({ post, score, reasons });
    }
  }
  
  // Sort by score and return top results
  return related
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Utility function for displaying related posts
export function formatRelatedPostReasons(reasons: string[]): string {
  if (reasons.length === 0) return '';
  if (reasons.length === 1) return reasons[0];
  if (reasons.length === 2) return `${reasons[0]} and ${reasons[1]}`;
  return `${reasons.slice(0, -1).join(', ')}, and ${reasons[reasons.length - 1]}`;
}