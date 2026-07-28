# Rabbit Holes Classic

The original Rabbit Holes theme, preserved before the site moved to its
commonplace-book design.

It is an Astro starter for a personal blog or link garden with:

- five post formats;
- archives, tags, collections, search, RSS, and sitemap pages;
- light and dark themes;
- rich link and media embeds;
- responsive navigation and post cards.

Related posts use manual frontmatter when present and otherwise fall back to
local tag and post-kind matching. The theme has no AI provider dependency.

## Use

Copy this directory into a new repository, install dependencies, and add
Markdown files to `src/content/posts/`.

```sh
npm install
npm run dev
```

The included post is intentionally small and can be deleted. The original
Rabbit Holes writing and images are not bundled with the theme.

## Content

```yaml
---
title: "A title"
date: 2026-01-01
type: "musings"
description: "A short summary."
tags:
  - Ideas
published: true
---
```

This package contains only the reader-facing theme. Publishing credentials,
deployment secrets, and site content are deliberately excluded.

## License

MIT. See `LICENSE`.
