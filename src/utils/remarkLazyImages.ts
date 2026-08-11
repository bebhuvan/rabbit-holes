// Remark plugin: images inside folio bodies sit below the fold almost by
// definition — a leaf opens on its title, the hand, and the source card.
// Native lazy loading keeps them off the critical path with no script, and
// decoding="async" keeps a large decode from blocking a scroll frame.

import { visit } from 'unist-util-visit';
import type { Root, Image } from 'mdast';

export function remarkLazyImages() {
  return (tree: Root, file: { path?: string; history?: string[] }) => {
    // Same scope guard as remarkLinkEmbed: the folio corpus only. Explainers
    // are MDX and place their figures deliberately through <Figure>.
    const path = file?.path ?? file?.history?.[0] ?? '';
    if (!path.replace(/\\/g, '/').includes('/content/posts/')) return;

    visit(tree, 'image', (node: Image) => {
      node.data = {
        ...node.data,
        hProperties: {
          ...(node.data?.hProperties as Record<string, string>),
          loading: 'lazy',
          decoding: 'async',
        },
      };
    });
  };
}
