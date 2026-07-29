# Rabbit Holes

A public commonplace book built with Astro, edited through PagesCMS, and
deployed to Cloudflare Workers.

The atomic unit is a numbered folio: a link, quotation, poem, image, or thought
that was worth keeping. Folios are organized by five kinds and a smaller set
of hand-curated heads.

## Local development

```sh
npm install
npm run dev
```

The development server defaults to `http://localhost:4321`. Before pushing a
code or content change, run:

```sh
npm run validate
npm run check
npm run build
```

## Publishing

PagesCMS is the normal editing interface. Its schema lives in `.pages.yml`;
posts are stored in `src/content/posts/`, and study notes in
`src/content/glosses/`.

For a link post, `url` must contain exactly one complete URL. Put commentary
and any additional links in the body.

```yaml
---
title: "A title"
date: 2026-07-28
type: "links"
url: "https://example.com/"
description: "An optional short summary."
note: "Why this struck me."
tags:
  - Reading
published: true
featured: false
---
```

Folio numbers are derived at build time from published posts, oldest first,
with the slug as the same-day tie-breaker. Do not add them to frontmatter.
Tags are trimmed and normalized when read. Curated subjects—the internal
content model calls them heads—and their aliases are defined in
`src/data/heads.ts`.

Related posts are deterministic: manual `related_posts` entries win, otherwise
shared normalized tags, post kind, and chronological proximity are scored
locally. Builds do not call an AI provider.

## Study notes

Study notes are an optional, explicitly disclosed content collection under
`src/content/glosses/`. They grow out of AI-assisted conversations after
reading, watching, or listening, and remain visually and semantically separate
from the human-written commonplace book.

## Deployment

Every push to `master`, including a PagesCMS edit, runs
`.github/workflows/deploy.yml`. The workflow builds the site and deploys the
existing `rabbit-holes` Worker with `wrangler.ci.toml`. Production routes are
declared separately in `wrangler.toml`.

For a manual deployment from an authenticated machine:

```sh
npm run workers:deploy
```

Deployment history is available in the repository’s GitHub Actions tab.

## Maintenance

Images larger than 50 KB can be resized and compressed with FFmpeg:

```sh
npm run optimize-images:dry
npm run optimize-images
```

The optional image pre-commit hook is enabled with:

```sh
git config core.hooksPath .githooks
```

The previous visual design is preserved as an MIT-licensed standalone starter
in `themes/rabbit-holes-classic/`.
