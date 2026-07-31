/**
 * SOURCE NAMES — what a publication calls itself.
 *
 * The folio's attribution line printed the bare hostname: "youtu.be",
 * "open.substack.com", "en.wikipedia.org". A hostname is an address, not a
 * name, and a book credits a source the way the source is known.
 *
 * The map is hand-kept and covers the domains that actually appear in the
 * corpus. Anything unmapped falls back to its own hostname, unchanged — a
 * wrong name is worse than a plain one, so nothing here guesses. The one
 * inference allowed is Substack's publication subdomains, because the shape
 * `<publication>.substack.com` is a naming convention rather than a guess.
 */

const NAMES: Record<string, string> = {
  'x.com': 'X',
  'twitter.com': 'X',
  'youtu.be': 'YouTube',
  'youtube.com': 'YouTube',
  'nytimes.com': 'The New York Times',
  'ft.com': 'Financial Times',
  'economist.com': 'The Economist',
  'theatlantic.com': 'The Atlantic',
  'theguardian.com': 'The Guardian',
  'washingtonpost.com': 'The Washington Post',
  'wsj.com': 'The Wall Street Journal',
  'newyorker.com': 'The New Yorker',
  'bbc.com': 'BBC',
  'bbc.co.uk': 'BBC',
  'thehindu.com': 'The Hindu',
  'indianexpress.com': 'The Indian Express',
  'livemint.com': 'Mint',
  'reuters.com': 'Reuters',
  'bloomberg.com': 'Bloomberg',
  'themarginalian.org': 'The Marginalian',
  'wikipedia.org': 'Wikipedia',
  'gutenberg.org': 'Project Gutenberg',
  'nobelprize.org': 'The Nobel Prize',
  'poetryfoundation.org': 'Poetry Foundation',
  'arxiv.org': 'arXiv',
  'github.com': 'GitHub',
  'substack.com': 'Substack',
  'medium.com': 'Medium',
  'cepr.org': 'CEPR',
  'nber.org': 'NBER',
  'imf.org': 'IMF',
  'worldbank.org': 'World Bank',
  'oecd.org': 'OECD',
  'piie.com': 'Peterson Institute',
  'brookings.edu': 'Brookings',
  'noahpinion.blog': 'Noahpinion',
  'stratechery.com': 'Stratechery',
  'kottke.org': 'kottke.org',
  'simonwillison.net': 'Simon Willison',
  'addyosmani.com': 'Addy Osmani',
  'tedium.co': 'Tedium',
  'anthropic.com': 'Anthropic',
  'openai.com': 'OpenAI',
  'deepmind.google': 'Google DeepMind',
};

/** Strip `www.` and any leading language/section subdomain we know is noise. */
export function sourceHost(url: string): string | undefined {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

/**
 * The registrable-ish domain: the last two labels. Good enough to match
 * `en.wikipedia.org` and `open.substack.com` onto their parent names, and
 * deliberately not a public-suffix implementation — `bbc.co.uk` is in the map
 * by its full host, which is the only two-part TLD the corpus uses.
 */
function parentDomain(host: string): string {
  const labels = host.split('.');
  return labels.length > 2 ? labels.slice(-2).join('.') : host;
}

export function sourceName(url: string): string | undefined {
  const host = sourceHost(url);
  if (!host) return undefined;

  if (NAMES[host]) return NAMES[host];

  const parent = parentDomain(host);

  // `benthams.substack.com` is Benthams, published on Substack. The bare
  // `open.substack.com` is Substack's own reader and has no publication.
  if (parent === 'substack.com' && host !== 'open.substack.com' && host !== 'substack.com') {
    const publication = host.slice(0, -'.substack.com'.length);
    return `${publication.charAt(0).toUpperCase()}${publication.slice(1)} on Substack`;
  }

  if (NAMES[parent]) return NAMES[parent];

  // Unmapped: the host itself. Honest, and never wrong.
  return host;
}
