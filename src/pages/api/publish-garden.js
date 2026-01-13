// Enhanced publish with AI-powered bidirectional backlinking
// Proxies to Cloudflare Worker function

export async function POST({ request, locals }) {
  try {
    // Access Cloudflare env vars through runtime
    const runtime = locals?.runtime?.env || {};
    const env = {
      GITHUB_REPO: runtime.GITHUB_REPO || import.meta.env.GITHUB_REPO,
      GITHUB_TOKEN: runtime.GITHUB_TOKEN || import.meta.env.GITHUB_TOKEN,
      AI: runtime.AI // Cloudflare Workers AI binding
    };

    const {
      title,
      content,
      type,
      tags,
      url,
      dive_deeper,
      description,
      publish = true,
      skipBacklinks = false
    } = await request.json();

    if (!title || !content || !type) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: title, content, and type'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const today = new Date().toISOString().split('T')[0];
    const filename = `${today}-${slug}.md`;

    let relatedPosts = [];
    let backlinkResults = [];
    let reasoning = {};

    // Step 1: Find related posts with AI (unless skipped)
    if (!skipBacklinks && env.AI) {
      try {
        // Fetch existing posts for AI analysis
        const existingPosts = await fetchExistingPosts(env);

        if (existingPosts.length > 0) {
          // Prepare candidate posts (max 30 for AI)
          const candidates = existingPosts.slice(0, 30).map(p => ({
            slug: p.slug,
            title: p.title,
            type: p.type,
            tags: p.tags || [],
            excerpt: (p.content || '').substring(0, 500)
          }));

          // Call AI to find relationships
          const aiResult = await findRelatedPosts(
            { title, content, type, tags: tags || [] },
            candidates,
            env
          );

          if (aiResult.success) {
            relatedPosts = aiResult.relatedToNew || [];
            reasoning = aiResult.reasoning || {};

            // Step 2: Update existing posts with backlinks
            const postsToUpdate = aiResult.backlinkNew || [];
            if (postsToUpdate.length > 0) {
              backlinkResults = await updateBacklinks(
                postsToUpdate,
                slug,
                title,
                existingPosts,
                env
              );
            }
          }
        }
      } catch (aiError) {
        console.error('AI backlinking error:', aiError);
        // Continue with publishing even if AI fails
      }
    }

    // Step 3: Create frontmatter with related_posts
    const frontmatter = {
      title,
      date: new Date(),
      type,
      published: publish,
      tags: tags || [],
      ...(url && { url }),
      ...(description && { description }),
      ...(dive_deeper && dive_deeper.length > 0 && { dive_deeper }),
      ...(relatedPosts.length > 0 && {
        related_posts: relatedPosts.map(s => {
          const reason = reasoning[s];
          return reason ? { slug: s, reason } : s;
        })
      })
    };

    // Step 4: Create markdown content
    const markdownContent = generateMarkdown(frontmatter, content);

    // Step 5: Publish to GitHub
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
          message: `Add new post: ${title}`,
          content: btoa(unescape(encodeURIComponent(markdownContent))),
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
      message: 'Post published with backlinks',
      slug,
      filename,
      github_url: githubData.content.html_url,
      published_at: new Date().toISOString(),
      relatedPosts,
      backlinksAdded: backlinkResults.filter(r => r.success).length,
      backlinkResults,
      reasoning
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Publish error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to publish post',
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

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  });
}

// Fetch existing posts from GitHub
async function fetchExistingPosts(env) {
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

  if (!response.ok) return [];

  const files = await response.json();
  const mdFiles = files.filter(f => f.name.endsWith('.md')).slice(0, 50);

  // Fetch content for each post
  const posts = await Promise.all(
    mdFiles.map(async (file) => {
      try {
        const contentRes = await fetch(
          `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${file.path}`,
          {
            headers: {
              'Authorization': `token ${env.GITHUB_TOKEN}`,
              'User-Agent': 'Bhuvan-Blog-CMS'
            }
          }
        );

        if (!contentRes.ok) return null;

        const contentData = await contentRes.json();
        const rawContent = decodeURIComponent(escape(atob(contentData.content)));

        // Parse frontmatter and content
        const match = rawContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (!match) return null;

        const [, frontmatterRaw, body] = match;
        const frontmatter = parseFrontmatter(frontmatterRaw);

        // Extract slug from filename
        const slugMatch = file.name.match(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/);
        const slug = slugMatch ? slugMatch[1] : file.name.replace('.md', '');

        return {
          filename: file.name,
          path: file.path,
          sha: contentData.sha,
          slug,
          title: frontmatter.title || slug,
          type: frontmatter.type || 'musings',
          tags: frontmatter.tags || [],
          related_posts: frontmatter.related_posts || [],
          content: body.trim(),
          rawContent
        };
      } catch {
        return null;
      }
    })
  );

  return posts.filter(Boolean);
}

// Call AI to find related posts using Cloudflare Workers AI
async function findRelatedPosts(newPost, candidates, env) {
  const prompt = buildPrompt(newPost, candidates);

  // Use Cloudflare Workers AI - no API key needed
  const aiResult = await env.AI.run('@cf/openai/gpt-oss-120b', {
    messages: [{
      role: 'system',
      content: 'You are an expert at finding semantic connections between blog posts. You must respond with valid JSON only, no other text.'
    }, {
      role: 'user',
      content: prompt
    }],
    max_tokens: 800
  });

  // Parse the response - Workers AI returns { response: "..." }
  let result;
  try {
    const responseText = aiResult.response || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (parseError) {
    console.error('Failed to parse AI response:', aiResult.response);
    result = { relatedToNew: [], backlinkNew: [], reasoning: {} };
  }

  return {
    success: true,
    relatedToNew: result.relatedToNew || [],
    backlinkNew: result.backlinkNew || [],
    reasoning: result.reasoning || {}
  };
}

function buildPrompt(newPost, candidates) {
  const list = candidates.map((p, i) =>
    `${i + 1}. "${p.title}" [${p.slug}] - ${p.type} - Tags: ${(p.tags || []).join(', ') || 'none'}\n   ${(p.excerpt || '').substring(0, 200)}...`
  ).join('\n\n');

  return `Find semantic connections for a new blog post.

NEW POST:
Title: ${newPost.title}
Type: ${newPost.type}
Tags: ${(newPost.tags || []).join(', ') || 'none'}
Content: ${(newPost.content || '').substring(0, 1200)}...

EXISTING POSTS:
${list}

Return JSON:
{
  "relatedToNew": ["slug1", "slug2", "slug3"],
  "backlinkNew": ["slug4", "slug5"],
  "reasoning": { "slug1": "10-word connection explanation", ... }
}

Select 3-5 for relatedToNew, 2-4 for backlinkNew. Quality over quantity.`;
}

// Update existing posts with backlinks
async function updateBacklinks(slugsToUpdate, newSlug, newTitle, existingPosts, env) {
  const results = [];

  for (let i = 0; i < slugsToUpdate.length; i++) {
    const targetSlug = slugsToUpdate[i];
    const post = existingPosts.find(p => p.slug === targetSlug);

    if (!post) {
      results.push({ slug: targetSlug, success: false, error: 'Post not found' });
      continue;
    }

    try {
      // Parse existing related_posts
      let relatedPosts = post.related_posts || [];

      // Check if already linked
      const alreadyLinked = relatedPosts.some(r =>
        (typeof r === 'string' ? r : r.slug) === newSlug
      );

      if (alreadyLinked) {
        results.push({ slug: targetSlug, success: true, skipped: true });
        continue;
      }

      // Add new backlink
      relatedPosts.push({
        slug: newSlug,
        reason: `Referenced from "${newTitle}"`
      });

      // Update frontmatter in raw content
      const updatedContent = updateFrontmatterRelatedPosts(post.rawContent, relatedPosts);

      // Push to GitHub
      const response = await fetch(
        `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${post.path}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${env.GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Bhuvan-Blog-CMS'
          },
          body: JSON.stringify({
            message: `Add backlink to ${newSlug}`,
            content: btoa(unescape(encodeURIComponent(updatedContent))),
            sha: post.sha,
            branch: 'master'
          })
        }
      );

      if (response.ok) {
        results.push({ slug: targetSlug, success: true });
      } else {
        const error = await response.text();
        results.push({ slug: targetSlug, success: false, error });
      }

      // Rate limit: wait 500ms between updates
      if (i < slugsToUpdate.length - 1) {
        await new Promise(r => setTimeout(r, 500));
      }

    } catch (error) {
      results.push({ slug: targetSlug, success: false, error: error.message });
    }
  }

  return results;
}

// Update related_posts in frontmatter
function updateFrontmatterRelatedPosts(rawContent, relatedPosts) {
  const match = rawContent.match(/^(---\n)([\s\S]*?)(\n---\n)([\s\S]*)$/);
  if (!match) return rawContent;

  const [, start, frontmatter, end, body] = match;

  // Remove existing related_posts
  let updatedFrontmatter = frontmatter.replace(/related_posts:[\s\S]*?(?=\n\w|\n---)/g, '');

  // Add new related_posts
  const relatedYaml = 'related_posts:\n' + relatedPosts.map(r => {
    if (typeof r === 'string') {
      return `  - "${r}"`;
    }
    return `  - slug: "${r.slug}"\n    reason: "${(r.reason || '').replace(/"/g, "'")}"`;
  }).join('\n');

  updatedFrontmatter = updatedFrontmatter.trim() + '\n' + relatedYaml;

  return start + updatedFrontmatter + end + body;
}

// Generate markdown with frontmatter
function generateMarkdown(frontmatter, content) {
  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (key === 'related_posts' && Array.isArray(value)) {
        return `${key}:\n${value.map(item => {
          if (typeof item === 'string') {
            return `  - "${item}"`;
          }
          return `  - slug: "${item.slug}"\n    reason: "${(item.reason || '').replace(/"/g, "'")}"`;
        }).join('\n')}`;
      }
      if (key === 'dive_deeper' && Array.isArray(value)) {
        return `${key}:\n${value.map(item => {
          if (typeof item === 'string') return `  - "${item}"`;
          return `  - text: "${item.text}"\n    url: "${item.url}"${item.description ? `\n    description: "${item.description}"` : ''}`;
        }).join('\n')}`;
      }
      if (Array.isArray(value)) {
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
    .join('\n');

  return `---\n${yaml}\n---\n\n${content}`;
}

// Parse YAML frontmatter
function parseFrontmatter(raw) {
  const result = {};
  const lines = raw.split('\n');
  let currentKey = null;
  let isArray = false;
  let isObject = false;
  let currentObject = null;

  for (const line of lines) {
    // Array item
    if (line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, '').trim();

      if (value.startsWith('slug:') || value.startsWith('text:')) {
        isObject = true;
        currentObject = {};
        const [key, val] = value.split(':').map(s => s.trim());
        currentObject[key] = val.replace(/^["']|["']$/g, '');
      } else if (isObject && (value.startsWith('reason:') || value.startsWith('url:') || value.startsWith('description:'))) {
        const [key, ...rest] = value.split(':');
        currentObject[key.trim()] = rest.join(':').trim().replace(/^["']|["']$/g, '');
      } else {
        if (isObject && currentObject && currentKey) {
          result[currentKey].push(currentObject);
          currentObject = null;
          isObject = false;
        }
        if (currentKey && isArray) {
          result[currentKey].push(value.replace(/^["']|["']$/g, ''));
        }
      }
      continue;
    }

    // Finish previous object
    if (isObject && currentObject && currentKey) {
      result[currentKey].push(currentObject);
      currentObject = null;
      isObject = false;
    }

    // Key: value
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

  // Finish any remaining object
  if (isObject && currentObject && currentKey) {
    result[currentKey].push(currentObject);
  }

  return result;
}
