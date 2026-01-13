// Remark plugin for wikilinks support
// Converts [[Post Title]] or [[slug]] syntax to internal links

import { visit } from 'unist-util-visit';
import type { Root, Text, Link } from 'mdast';
import type { Parent } from 'unist';

export interface PostInfo {
  slug: string;
  title: string;
}

interface WikilinkOptions {
  posts: Map<string, PostInfo>;
}

export function remarkWikilinks(options: WikilinkOptions) {
  const { posts } = options;

  // Build lookup maps for case-insensitive title matching
  const byTitle = new Map<string, string>();
  const bySlug = new Map<string, PostInfo>();

  posts.forEach((post, slug) => {
    byTitle.set(post.title.toLowerCase(), slug);
    bySlug.set(slug, post);
  });

  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index: number | undefined, parent: Parent | undefined) => {
      if (!parent || typeof index !== 'number') return;

      // Match [[Title]], [[slug]], or [[Title|Display Text]]
      const wikilinkPattern = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

      if (!wikilinkPattern.test(node.value)) return;

      // Reset regex after test
      wikilinkPattern.lastIndex = 0;

      const newChildren: (Text | Link | { type: 'html'; value: string })[] = [];
      let lastIndex = 0;
      let match;

      while ((match = wikilinkPattern.exec(node.value)) !== null) {
        const [fullMatch, reference, displayText] = match;
        const beforeText = node.value.slice(lastIndex, match.index);

        // Add text before the wikilink
        if (beforeText) {
          newChildren.push({ type: 'text', value: beforeText });
        }

        // Try to resolve reference to a slug
        const trimmedRef = reference.trim();
        const lookupKey = trimmedRef.toLowerCase();

        // Try title first, then slug
        let targetSlug = byTitle.get(lookupKey) || (bySlug.has(trimmedRef) ? trimmedRef : undefined);

        if (targetSlug) {
          // Found a matching post - create link
          const post = bySlug.get(targetSlug);
          const linkText = displayText || post?.title || trimmedRef;

          newChildren.push({
            type: 'link',
            url: `/posts/${targetSlug}`,
            children: [{
              type: 'text',
              value: linkText
            }],
            data: {
              hProperties: {
                class: 'wikilink',
                'data-slug': targetSlug
              }
            }
          } as Link);
        } else {
          // No match - render as broken link indicator
          const brokenText = displayText || trimmedRef;
          newChildren.push({
            type: 'html',
            value: `<span class="wikilink-broken" title="No post found: ${trimmedRef}">${brokenText}</span>`
          });
        }

        lastIndex = match.index + fullMatch.length;
      }

      // Add remaining text after last wikilink
      const afterText = node.value.slice(lastIndex);
      if (afterText) {
        newChildren.push({ type: 'text', value: afterText });
      }

      // Replace the text node with our new nodes
      if (newChildren.length > 0) {
        (parent.children as (Text | Link | { type: 'html'; value: string })[]).splice(index, 1, ...newChildren);
        // Return the new index to continue after inserted nodes
        return index + newChildren.length;
      }
    });
  };
}
