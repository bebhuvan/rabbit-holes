// Fetch or update a single post by slug
// GET: Fetch post content
// PUT: Update post content

export async function GET({ params, locals }) {
  const { slug } = params;
  // Access Cloudflare env vars through runtime
  const runtime = locals?.runtime?.env || {};
  const env = {
    GITHUB_REPO: runtime.GITHUB_REPO || import.meta.env.GITHUB_REPO,
    GITHUB_TOKEN: runtime.GITHUB_TOKEN || import.meta.env.GITHUB_TOKEN
  };

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    // First, list posts directory to find the file
    const listResponse = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/contents/src/content/posts`,
      {
        headers: {
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'User-Agent': 'Bhuvan-Blog-CMS',
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!listResponse.ok) {
      throw new Error(`GitHub API error: ${listResponse.status}`);
    }

    const files = await listResponse.json();

    // Find the file matching the slug
    const file = files.find(f => {
      const match = f.name.match(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/);
      return match && match[1] === slug;
    });

    if (!file) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Post not found'
      }), {
        status: 404,
        headers: corsHeaders
      });
    }

    // Fetch the file content
    const contentResponse = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${file.path}`,
      {
        headers: {
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'User-Agent': 'Bhuvan-Blog-CMS',
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!contentResponse.ok) {
      throw new Error(`GitHub API error: ${contentResponse.status}`);
    }

    const contentData = await contentResponse.json();
    const content = decodeURIComponent(escape(atob(contentData.content)));

    // Parse frontmatter and body
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontmatterMatch) {
      return new Response(JSON.stringify({
        success: true,
        post: {
          filename: file.name,
          sha: contentData.sha,
          path: file.path,
          content: content
        }
      }), {
        headers: corsHeaders
      });
    }

    const [, frontmatterRaw, body] = frontmatterMatch;
    const frontmatter = parseFrontmatter(frontmatterRaw);

    // Parse date from filename
    const dateMatch = file.name.match(/^(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : null;

    return new Response(JSON.stringify({
      success: true,
      post: {
        filename: file.name,
        slug,
        date,
        sha: contentData.sha,
        path: file.path,
        title: frontmatter.title || slug,
        type: frontmatter.type || 'musings',
        tags: frontmatter.tags || [],
        description: frontmatter.description || '',
        url: frontmatter.url || '',
        published: frontmatter.published !== false,
        content: body.trim()
      }
    }), {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Post fetch error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch post',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function PUT({ params, request, locals }) {
  const { slug } = params;
  // Access Cloudflare env vars through runtime
  const runtime = locals?.runtime?.env || {};
  const env = {
    GITHUB_REPO: runtime.GITHUB_REPO || import.meta.env.GITHUB_REPO,
    GITHUB_TOKEN: runtime.GITHUB_TOKEN || import.meta.env.GITHUB_TOKEN
  };

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const {
      title,
      content,
      type,
      tags,
      description,
      url,
      sha,
      date,
      publish = true
    } = await request.json();

    if (!title || !content || !type) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: title, content, and type are required'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!sha) {
      return new Response(JSON.stringify({
        success: false,
        error: 'SHA is required for updates'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Use the existing date from the filename or provided date
    const postDate = date || new Date().toISOString().split('T')[0];
    const filename = `${postDate}-${slug}.md`;

    // Create frontmatter
    const frontmatter = {
      title,
      date: new Date(postDate),
      type,
      published: publish,
      tags: tags || [],
      ...(url && { url }),
      ...(description && { description })
    };

    // Create markdown content
    const markdownContent = `---\n${Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length === 0) return `${key}: []`;
          return `${key}:\n${value.map(item => `  - "${item}"`).join('\n')}`;
        }
        if (value instanceof Date) {
          return `${key}: ${value.toISOString()}`;
        }
        if (typeof value === 'string') {
          return `${key}: "${value}"`;
        }
        return `${key}: ${value}`;
      })
      .join('\n')}\n---\n\n${content}`;

    // Update via GitHub API
    const githubResponse = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/contents/src/content/posts/${filename}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Bhuvan-Blog-CMS'
        },
        body: JSON.stringify({
          message: `Update post: ${title}`,
          content: btoa(unescape(encodeURIComponent(markdownContent))),
          sha: sha,
          branch: 'master'
        })
      }
    );

    if (!githubResponse.ok) {
      const error = await githubResponse.text();
      throw new Error(`GitHub API error: ${githubResponse.status} - ${error}`);
    }

    const githubData = await githubResponse.json();

    return new Response(JSON.stringify({
      success: true,
      message: 'Post updated successfully',
      slug,
      sha: githubData.content.sha,
      github_url: githubData.content.html_url,
      updated_at: new Date().toISOString()
    }), {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Post update error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update post',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  });
}

// Simple YAML frontmatter parser
function parseFrontmatter(raw) {
  const result = {};
  const lines = raw.split('\n');
  let currentKey = null;
  let isArray = false;

  for (const line of lines) {
    if (line.match(/^\s+-\s+/)) {
      if (currentKey && isArray) {
        const value = line.replace(/^\s+-\s+/, '').replace(/^["']|["']$/g, '').trim();
        result[currentKey].push(value);
      }
      continue;
    }

    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      currentKey = key;

      if (value === '' || value === undefined) {
        result[key] = [];
        isArray = true;
      } else {
        let cleanValue = value.replace(/^["']|["']$/g, '').trim();
        if (cleanValue === 'true') cleanValue = true;
        else if (cleanValue === 'false') cleanValue = false;
        result[key] = cleanValue;
        isArray = false;
      }
    }
  }

  return result;
}
