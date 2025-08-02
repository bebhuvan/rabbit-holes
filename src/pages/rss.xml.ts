import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: any) {
  const posts = await getCollection('posts', ({ data }) => {
    return data.published !== false;
  });

  const sortedPosts = posts.sort((a, b) => 
    new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return rss({
    title: "Rabbit Holes",
    description: "A curiosity-driven journey through ideas, discoveries, and fascinating tangents",
    site: 'https://www.rabbitholes.garden',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description || '',
      content: post.body, // Full markdown content
      link: `/posts/${post.slug}/`,
      categories: post.data.tags || [],
      customData: `
        <type>${post.data.type}</type>
        ${post.data.url ? `<sourceUrl>${post.data.url}</sourceUrl>` : ''}
        <author>Bhuvan</author>
      `,
    })),
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