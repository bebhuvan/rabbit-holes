// Structured data (schema.org JSON-LD), shared across the site.
//
// Kept in one place so authorship, site identity, and the search action can
// never drift between pages. AI answer engines and search rich-results both
// read this; the explainers also declare their cited sources, which makes the
// sourced prose machine-citable.

export const SITE_URL = 'https://www.rabbitholes.garden';
export const SITE_NAME = 'Rabbit Holes';
export const SITE_TAGLINE =
  'A public commonplace book: links, quotes, poems and stray thoughts, gathered as they struck me.';

const AUTHOR = {
  '@type': 'Person',
  name: 'Bhuvan',
  url: SITE_URL,
  sameAs: [
    'https://twitter.com/bebhuvan',
    'https://github.com/bebhuvan',
    'https://smallweb.blog',
  ],
};

/** Absolute URL for a share image, falling back to the branded default. */
export function absoluteImage(image: string | undefined): string {
  return new URL(image ?? '/og.png', SITE_URL).href;
}

export function personSchema() {
  return { '@context': 'https://schema.org', ...AUTHOR };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: 'rabbitholes.garden',
    url: SITE_URL,
    description: SITE_TAGLINE,
    inLanguage: 'en',
    publisher: { '@type': 'Person', name: 'Bhuvan', url: SITE_URL },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export interface ArticleSchemaInput {
  type?: string;
  headline: string;
  description?: string;
  url: string;
  image?: string; // absolute URL
  datePublished: string; // ISO 8601
  dateModified?: string; // ISO 8601
  keywords?: string[];
  /** Cited sources — turns sourced prose into machine-citable references. */
  citations?: { name: string; url: string }[];
}

export function articleSchema(input: ArticleSchemaInput) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': input.type ?? 'Article',
    headline: input.headline,
    url: input.url,
    image: input.image
      ? { '@type': 'ImageObject', url: input.image, width: 1200, height: 630 }
      : undefined,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: AUTHOR,
    publisher: { '@type': 'Person', name: 'Bhuvan', url: SITE_URL },
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    description: input.description,
    keywords: input.keywords?.length ? input.keywords.join(', ') : undefined,
    citation: input.citations?.length
      ? input.citations.map((c) => ({ '@type': 'CreativeWork', name: c.name, url: c.url }))
      : undefined,
  };
  // Drop empty keys so the payload stays clean.
  return JSON.parse(JSON.stringify(schema));
}
