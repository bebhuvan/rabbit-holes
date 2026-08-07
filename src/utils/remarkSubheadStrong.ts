// Remark plugin: distinguish a paragraph that IS a bold subheading
// (folio.css renders `<p><strong>...</strong></p>` as a small-caps label)
// from a paragraph that merely CONTAINS a bolded link mid-sentence.
//
// Both compile to `<p><strong>...</strong>text</p>` with `strong` as the
// paragraph's only *element* child, since CSS `:only-child` ignores text
// nodes — so folio.css alone can't tell "**Heading**\nBody text." (no
// blank line, so it's one paragraph) from "...the **[X](url)**, and..."
// (a link bolded inline). The difference is whether there's real text
// *before* the strong, which only the markdown AST can see.

import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Text, Strong } from 'mdast';

export function remarkSubheadStrong() {
  return (tree: Root, file: { path?: string; history?: string[] }) => {
    const path = file?.path ?? file?.history?.[0] ?? '';
    if (!path.replace(/\\/g, '/').includes('/content/posts/')) return;

    visit(tree, 'paragraph', (node: Paragraph) => {
      const nonTextChildren = node.children.filter((child) => child.type !== 'text');
      if (nonTextChildren.length !== 1 || nonTextChildren[0].type !== 'strong') return;

      const strongNode = nonTextChildren[0] as Strong;
      const strongIndex = node.children.indexOf(strongNode);
      const hasLeadingText = node.children
        .slice(0, strongIndex)
        .some((child) => child.type === 'text' && (child as Text).value.trim() !== '');

      if (hasLeadingText) {
        strongNode.data ??= {};
        strongNode.data.hProperties ??= {};
        const hProperties = strongNode.data.hProperties as Record<string, unknown>;
        const existing = Array.isArray(hProperties.className) ? (hProperties.className as string[]) : [];
        hProperties.className = [...existing, 'no-subhead'];
      }
    });
  };
}
