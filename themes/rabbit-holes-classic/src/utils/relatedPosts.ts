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

/**
 * Deterministic related posts for the open-source theme.
 * Shared tags carry the most weight, followed by the same post kind.
 */
export async function getRelatedPosts(
  post: PostData,
  allPosts: PostData[]
): Promise<RelatedPost[]> {
  const sourceTags = new Set(post.tags.map((tag) => tag.trim().toLowerCase()));

  return allPosts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => {
      const shared = candidate.tags
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => sourceTags.has(tag));
      const score = shared.length * 3 + (candidate.type === post.type ? 1 : 0);
      return {
        slug: candidate.slug,
        score,
        reason: shared.length ? `Both tagged: ${shared.slice(0, 2).join(', ')}` : `Related ${candidate.type}`,
      };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ slug, reason }) => ({ slug, reason }));
}
