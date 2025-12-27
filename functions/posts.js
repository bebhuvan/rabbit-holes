// Fetch list of posts from GitHub
// Returns post metadata for the Studio CMS

export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  if (request.method !== 'GET') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    // Fetch the posts directory from GitHub
    const response = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/contents/src/content/posts`,
      {
        headers: {
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'User-Agent': 'Bhuvan-Blog-CMS',
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const files = await response.json();

    // Filter for .md files and parse basic info from filename
    const posts = files
      .filter(file => file.name.endsWith('.md'))
      .map(file => {
        // Parse date and slug from filename: YYYY-MM-DD-slug.md
        const match = file.name.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
        if (!match) return null;

        const [, date, slug] = match;

        return {
          filename: file.name,
          date,
          slug,
          sha: file.sha,
          path: file.path,
          url: file.html_url
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.date.localeCompare(a.date)); // Newest first

    // Optionally fetch full content for recent posts (limit to avoid rate limits)
    const url = new URL(request.url);
    const withContent = url.searchParams.get('content') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    const limitedPosts = posts.slice(0, limit);

    if (withContent) {
      // Fetch content for each post (batch to avoid rate limits)
      const postsWithContent = await Promise.all(
        limitedPosts.map(async (post) => {
          try {
            const contentRes = await fetch(
              `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${post.path}`,
              {
                headers: {
                  'Authorization': `token ${env.GITHUB_TOKEN}`,
                  'User-Agent': 'Bhuvan-Blog-CMS',
                  'Accept': 'application/vnd.github.v3+json'
                }
              }
            );

            if (!contentRes.ok) return post;

            const contentData = await contentRes.json();
            const content = decodeURIComponent(escape(atob(contentData.content)));

            // Parse frontmatter
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
            if (!frontmatterMatch) return { ...post, content };

            const [, frontmatterRaw, body] = frontmatterMatch;
            const frontmatter = parseFrontmatter(frontmatterRaw);

            return {
              ...post,
              title: frontmatter.title || slug,
              type: frontmatter.type || 'musings',
              tags: frontmatter.tags || [],
              description: frontmatter.description || '',
              published: frontmatter.published !== false,
              content: body.trim()
            };
          } catch (err) {
            return post;
          }
        })
      );

      return new Response(JSON.stringify({
        success: true,
        posts: postsWithContent,
        total: posts.length
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=60' // Cache for 1 minute
        }
      });
    }

    // Without content, just fetch frontmatter for titles
    const postsWithMeta = await Promise.all(
      limitedPosts.map(async (post) => {
        try {
          const contentRes = await fetch(
            `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${post.path}`,
            {
              headers: {
                'Authorization': `token ${env.GITHUB_TOKEN}`,
                'User-Agent': 'Bhuvan-Blog-CMS',
                'Accept': 'application/vnd.github.v3+json'
              }
            }
          );

          if (!contentRes.ok) return post;

          const contentData = await contentRes.json();
          const content = decodeURIComponent(escape(atob(contentData.content)));

          // Parse just frontmatter
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (!frontmatterMatch) return post;

          const frontmatter = parseFrontmatter(frontmatterMatch[1]);

          return {
            ...post,
            title: frontmatter.title || post.slug,
            type: frontmatter.type || 'musings',
            tags: frontmatter.tags || [],
            description: frontmatter.description || '',
            published: frontmatter.published !== false
          };
        } catch (err) {
          return post;
        }
      })
    );

    return new Response(JSON.stringify({
      success: true,
      posts: postsWithMeta,
      total: posts.length
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60'
      }
    });

  } catch (error) {
    console.error('Posts fetch error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch posts',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Simple YAML frontmatter parser
function parseFrontmatter(raw) {
  const result = {};
  const lines = raw.split('\n');
  let currentKey = null;
  let isArray = false;

  for (const line of lines) {
    // Check for array item
    if (line.match(/^\s+-\s+/)) {
      if (currentKey && isArray) {
        const value = line.replace(/^\s+-\s+/, '').replace(/^["']|["']$/g, '').trim();
        result[currentKey].push(value);
      }
      continue;
    }

    // Check for key: value
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      currentKey = key;

      if (value === '' || value === undefined) {
        // Could be array or object
        result[key] = [];
        isArray = true;
      } else {
        // Clean up value
        let cleanValue = value.replace(/^["']|["']$/g, '').trim();

        // Parse booleans
        if (cleanValue === 'true') cleanValue = true;
        else if (cleanValue === 'false') cleanValue = false;

        result[key] = cleanValue;
        isArray = false;
      }
    }
  }

  return result;
}
