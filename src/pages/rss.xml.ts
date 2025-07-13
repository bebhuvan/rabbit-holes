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
    site: context.site || 'https://blog.bhuvan.dev',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description || '',
      link: `/posts/${post.slug}/`,
      categories: post.data.tags || [],
      customData: `<type>${post.data.type}</type>`,
    })),
    customData: `<language>en-us</language>`,
  });
}