export interface HeadDefinition {
  slug: string;
  title: string;
  description: string;
  aliases: string[];
}

// Heads are editorial shelves, not an automatically generated tag cloud.
// Aliases are normalized before matching, so the existing, deliberately messy
// corpus can be cleaned progressively without breaking navigation.
export const heads: HeadDefinition[] = [
  {
    slug: 'artificial-intelligence',
    title: 'Artificial Intelligence',
    description: 'Machines that think, the work they change, and the futures they make plausible.',
    aliases: ['ai', 'artificial intelligence', 'large language models', 'llms', 'automation', 'openai'],
  },
  {
    slug: 'poetry',
    title: 'Poetry',
    description: 'Lines kept because prose could not have carried them.',
    aliases: ['poetry', 'verse', 'literature'],
  },
  {
    slug: 'work',
    title: 'Work',
    description: 'Labour, ambition, careers, craft, and what automation does to all four.',
    aliases: ['work', 'jobs', 'careers', 'labour', 'productivity'],
  },
  {
    slug: 'philosophy',
    title: 'Philosophy',
    description: 'Old questions, useful distinctions, and ways of living with uncertainty.',
    aliases: ['philosophy', 'life', 'virtue', 'religion', 'spiritual'],
  },
  {
    slug: 'technology',
    title: 'Technology',
    description: 'Tools, infrastructure, software, and the social worlds built around them.',
    aliases: ['technology', 'software', 'coding', 'internet', 'social media', 'innovation'],
  },
  {
    slug: 'china',
    title: 'China',
    description: 'Industry, development, geopolitics, and the changing balance of power.',
    aliases: ['china', 'geopolitics', 'trade', 'globalization'],
  },
  {
    slug: 'economics',
    title: 'Economics',
    description: 'Markets, development, money, inequality, and incentives in the wild.',
    aliases: ['economics', 'economy', 'finance', 'economic growth', 'economic development', 'money'],
  },
  {
    slug: 'reading-and-writing',
    title: 'Reading & Writing',
    description: 'Books, attention, authorship, and the pleasures of making sense in public.',
    aliases: ['reading', 'writing', 'books', 'blogging', 'literature'],
  },
];

export function getHead(slug: string): HeadDefinition | undefined {
  return heads.find((head) => head.slug === slug);
}
