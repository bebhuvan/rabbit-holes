# Rabbit Holes

A public commonplace book built with Astro and deployed on Cloudflare.

The atomic unit is a numbered folio: a link, quotation, poem, image, or thought
that was worth keeping. Folios are organized by five kinds and a smaller set
of hand-curated heads.

## Development

```sh
npm install
npm run dev
```

Useful checks:

```sh
npm run check
npm run build
npm run validate
```

## Content

Posts live in `src/content/posts/`. Folio numbers are derived at build time
from published posts, oldest first, with the slug as the same-day tie-breaker.
Do not author folio numbers in frontmatter.

```yaml
---
title: "A title"
date: 2026-07-28
type: "musings"
description: "An optional short summary."
note: "Why this struck me."
tags:
  - Reading
published: true
featured: false
---
```

Tags are trimmed and normalized when read. Curated subjects—the internal
content model calls them heads—and their aliases are defined in
`src/data/heads.ts`.

Related posts are deterministic: manual `related_posts` entries win, otherwise
shared normalized tags, post kind, and chronological proximity are scored
locally. Builds do not call an AI provider.

## Design

The production design is ported from `mockups/system/`.

- `src/styles/tokens.css` contains the shared type, spacing, color, and motion
  tokens.
- `src/styles/commonplace.css` contains the masthead, index, and folio stream.
- Page-specific structure lives in `folio.css`, `ledger.css`, `sheet.css`, and
  `gloss.css`.
- `src/components/Masthead.astro`, `IndexRail.astro`, and
  `FolioPreview.astro` are the principal shared pieces.

The previous visual design is preserved as an MIT-licensed starter in
`themes/rabbit-holes-classic/`.

## Study notes

Study notes are an optional, explicitly disclosed content collection under
`src/content/glosses/`. They grow out of AI-assisted conversations after
reading, watching, or listening, and remain visually and semantically separate
from the human-written commonplace book.

## Deployment

The current project uses Astro’s Cloudflare adapter and prerenders all
reader-facing pages. Dynamic publishing endpoints are separate from the
reader-facing theme. No deployment is performed as part of local design work.
