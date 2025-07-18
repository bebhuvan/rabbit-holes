// GitHub integration for automatic publishing
// This function creates/updates blog posts via GitHub API

export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    const { 
      title, 
      content, 
      type, 
      tags, 
      url,
      dive_deeper,
      description,
      publish = true 
    } = await request.json();
    
    if (!title || !content || !type) {
      return new Response('Missing required fields', { status: 400 });
    }
    
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Create frontmatter
    const frontmatter = {
      title,
      date: new Date().toISOString().split('T')[0],
      type,
      published: publish,
      tags: tags || [],
      ...(url && { url }),
      ...(description && { description }),
      ...(dive_deeper && dive_deeper.length > 0 && { dive_deeper })
    };
    
    // Create markdown content
    const markdownContent = `---\n${Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}:\n${value.map(item => `  - "${item}"`).join('\n')}`;
        }
        if (typeof value === 'string') {
          return `${key}: "${value}"`; 
        }
        return `${key}: ${value}`;
      })
      .join('\n')}\n---\n\n${content}`;
    
    // GitHub API integration
    const githubResponse = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/contents/src/content/posts/${slug}.md`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Bhuvan-Blog-CMS'
        },
        body: JSON.stringify({
          message: `Add new post: ${title}`,
          content: btoa(markdownContent),
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
      message: 'Post published successfully',
      slug,
      github_url: githubData.content.html_url,
      published_at: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('Publishing error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to publish post',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}