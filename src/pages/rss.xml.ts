import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { marked } from 'marked';

export const prerender = true;

export async function GET(context: any) {
  const posts = await getCollection('posts', ({ data }) => {
    return data.published !== false;
  });

  const sortedPosts = posts.sort((a, b) =>
    new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  // Explainers appear ONCE, dated by first publication. They are living
  // documents, so dating them by `updated` would re-fire the feed every time a
  // figure is corrected — which trains people to ignore it. Revisions are
  // readable on the page; the feed announces the piece, not each edit.
  //
  // No full content either: the body is MDX whose meaning lives in its figure
  // components, and marked() would emit their raw tags as text. The standfirst
  // is the honest answer anyway, which is the right thing to put in a reader.
  const explainers = await getCollection('explainers', ({ data }) => data.published !== false);

  const explainerItems = explainers.map((explainer) => ({
    title: explainer.data.title,
    pubDate: explainer.data.date,
    description: explainer.data.standfirst.replace(/<[^>]+>/g, ''),
    link: `/explainers/${explainer.slug}/`,
    categories: explainer.data.tags || [],
    customData: `
        <type>explainer</type>
        <author>Bhuvan</author>
      `,
  }));

  const postItems = sortedPosts.map((post) => ({
    title: post.data.title,
    pubDate: post.data.date,
    description: post.data.description || '',
    content: marked.parse(post.body) as string, // Convert markdown to HTML
    link: `/posts/${post.slug}/`,
    categories: post.data.tags || [],
    customData: `
        <type>${post.data.type}</type>
        ${post.data.url ? `<sourceUrl>${post.data.url}</sourceUrl>` : ''}
        <author>Bhuvan</author>
      `,
  }));

  const items = [...postItems, ...explainerItems].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  return rss({
    title: "Rabbit Holes",
    description: "A public commonplace book: links, quotes, poems and stray thoughts, gathered as they struck me.",
    site: 'https://www.rabbitholes.garden',
    items,
    customData: `
      <language>en-us</language>
      <webMaster>hello@rabbitholes.garden</webMaster>
      <managingEditor>hello@rabbitholes.garden (Bhuvan)</managingEditor>
      <generator>Astro RSS</generator>
      <image>
        <url>https://www.rabbitholes.garden/favicon.svg</url>
        <title>Rabbit Holes</title>
        <link>https://www.rabbitholes.garden</link>
      </image>
    `,
  });
}
