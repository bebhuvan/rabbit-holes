// Graph data generator for knowledge graph visualization
// Generates nodes and edges from blog posts

import type { CollectionEntry } from 'astro:content';

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  tags: string[];
  date: string;
  connections: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'related' | 'backlink' | 'tag';
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  tags: { name: string; count: number }[];
}

export function generateGraphData(posts: CollectionEntry<'posts'>[]): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>(); // Track unique edges
  const tagCounts = new Map<string, number>();

  // Create nodes from posts
  for (const post of posts) {
    nodes.push({
      id: post.slug,
      label: post.data.title,
      type: post.data.type || 'musings',
      tags: post.data.tags || [],
      date: post.data.date.toISOString(),
      connections: 0
    });

    // Count tags
    (post.data.tags || []).forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  }

  // Create edges from related_posts
  for (const post of posts) {
    const related = post.data.related_posts || [];

    for (const rel of related) {
      const targetSlug = typeof rel === 'string' ? rel : rel.slug;

      // Check if target exists
      if (!nodes.some(n => n.id === targetSlug)) continue;

      // Create unique edge key (sorted to avoid duplicates)
      const edgeKey = [post.slug, targetSlug].sort().join('::');

      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
        edges.push({
          source: post.slug,
          target: targetSlug,
          type: 'related',
          weight: 1
        });
      }
    }
  }

  // Create edges from shared tags (limit to tags with 2-8 posts to avoid clutter)
  const postsByTag = new Map<string, string[]>();
  for (const post of posts) {
    (post.data.tags || []).forEach(tag => {
      if (!postsByTag.has(tag)) postsByTag.set(tag, []);
      postsByTag.get(tag)!.push(post.slug);
    });
  }

  // Connect posts that share tags
  postsByTag.forEach((postSlugs, tag) => {
    if (postSlugs.length >= 2 && postSlugs.length <= 8) {
      for (let i = 0; i < postSlugs.length; i++) {
        for (let j = i + 1; j < postSlugs.length; j++) {
          const edgeKey = [postSlugs[i], postSlugs[j]].sort().join('::');

          if (!edgeSet.has(edgeKey)) {
            edgeSet.add(edgeKey);
            edges.push({
              source: postSlugs[i],
              target: postSlugs[j],
              type: 'tag',
              weight: 0.3
            });
          }
        }
      }
    }
  });

  // Update connection counts
  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    if (sourceNode) sourceNode.connections++;
    if (targetNode) targetNode.connections++;
  });

  return {
    nodes,
    edges,
    tags: Array.from(tagCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  };
}
