// Cloudflare Function for AI-powered backlink discovery
// Uses Workers AI to find semantically related posts

export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
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

  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const body = await request.json();

    // Support two modes:
    // 1. Simple: { title, type, tags, content } - fetches candidates automatically
    // 2. Full: { newPost, candidatePosts } - uses provided candidates
    let newPost, candidatePosts;

    if (body.newPost && body.candidatePosts) {
      // Full mode
      newPost = body.newPost;
      candidatePosts = body.candidatePosts;
    } else if (body.title) {
      // Simple mode - fetch candidates from GitHub
      newPost = {
        title: body.title,
        type: body.type || 'musings',
        tags: body.tags || [],
        content: body.content || ''
      };

      // Fetch existing posts from GitHub
      candidatePosts = await fetchExistingPosts(env);

      if (candidatePosts.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          related: [],
          message: 'No existing posts found to compare'
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields. Send either { title, type, tags, content } or { newPost, candidatePosts }'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (!env.AI) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Workers AI not available'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Build the prompt for semantic analysis
    const prompt = buildRelationshipPrompt(newPost, candidatePosts.slice(0, 30));

    // Call Cloudflare Workers AI
    const aiResult = await env.AI.run('@cf/openai/gpt-oss-120b', {
      messages: [{
        role: 'system',
        content: 'You are an expert at finding semantic connections between blog posts. You must respond with valid JSON only, no other text.'
      }, {
        role: 'user',
        content: prompt
      }],
      max_tokens: 1000
    });

    // Parse the response - Workers AI returns { response: "..." }
    let aiResponse;
    try {
      const responseText = aiResult.response || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResult.response);
      aiResponse = { relatedToNew: [], backlinkNew: [], reasoning: {} };
    }

    // Format response with both naming conventions for compatibility
    const related = aiResponse.relatedToNew || [];
    const reasoning = aiResponse.reasoning || {};

    return new Response(JSON.stringify({
      success: true,
      related: related.map(slug => {
        const reason = reasoning[slug];
        return reason ? { slug, reason } : slug;
      }),
      relatedToNew: related,
      backlinkNew: aiResponse.backlinkNew || [],
      reasoning
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Find related error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Fetch existing posts from GitHub
async function fetchExistingPosts(env) {
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    console.error('Missing GITHUB_TOKEN or GITHUB_REPO');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/contents/src/content/posts`,
      {
        headers: {
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'User-Agent': 'Rabbit-Holes-Backlinks',
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!response.ok) return [];

    const files = await response.json();
    const mdFiles = files.filter(f => f.name.endsWith('.md')).slice(0, 50);

    // Fetch content for each post (in parallel, max 10 at a time)
    const posts = [];
    for (let i = 0; i < mdFiles.length; i += 10) {
      const batch = mdFiles.slice(i, i + 10);
      const batchResults = await Promise.all(
        batch.map(async (file) => {
          try {
            const contentRes = await fetch(
              `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${file.path}`,
              {
                headers: {
                  'Authorization': `token ${env.GITHUB_TOKEN}`,
                  'User-Agent': 'Rabbit-Holes-Backlinks'
                }
              }
            );

            if (!contentRes.ok) return null;

            const contentData = await contentRes.json();
            const rawContent = decodeURIComponent(escape(atob(contentData.content)));

            // Parse frontmatter
            const match = rawContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)/);
            if (!match) return null;

            const [, frontmatterRaw, body] = match;

            // Extract slug from filename
            const slugMatch = file.name.match(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/);
            const slug = slugMatch ? slugMatch[1] : file.name.replace('.md', '');

            // Parse basic frontmatter fields
            const titleMatch = frontmatterRaw.match(/title:\s*["']?([^"'\n]+)["']?/);
            const typeMatch = frontmatterRaw.match(/type:\s*(\w+)/);
            const tagsMatch = frontmatterRaw.match(/tags:\n((?:\s+-\s+.+\n?)*)/);

            let tags = [];
            if (tagsMatch) {
              const tagLines = tagsMatch[1].match(/-\s+["']?([^"'\n]+)["']?/g);
              if (tagLines) {
                tags = tagLines.map(t => t.replace(/-\s+["']?/, '').replace(/["']$/, '').trim());
              }
            }

            return {
              slug,
              title: titleMatch ? titleMatch[1].trim() : slug,
              type: typeMatch ? typeMatch[1] : 'musings',
              tags,
              excerpt: body.trim().substring(0, 500)
            };
          } catch {
            return null;
          }
        })
      );
      posts.push(...batchResults.filter(Boolean));
    }

    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

function buildRelationshipPrompt(newPost, candidates) {
  const candidatesList = candidates.map((p, i) =>
    `${i + 1}. "${p.title}" [slug: ${p.slug}]
   Type: ${p.type || 'unknown'}
   Tags: ${(p.tags || []).join(', ') || 'none'}
   Excerpt: ${(p.excerpt || '').substring(0, 300)}...`
  ).join('\n\n');

  return `Analyze semantic relationships between a NEW blog post and existing posts in a digital garden called "Rabbit Holes."

NEW POST:
Title: ${newPost.title}
Type: ${newPost.type || 'musings'}
Tags: ${(newPost.tags || []).join(', ') || 'none'}
Content excerpt:
${(newPost.content || '').substring(0, 1500)}

---

CANDIDATE POSTS (evaluate each for semantic connection):

${candidatesList}

---

TASK: Find meaningful connections based on:
- Shared concepts, themes, or arguments
- Complementary perspectives on the same topic
- One post extends, builds on, or refutes another's ideas
- Same domain but different angles
- Intellectual rabbit holes that connect

Return JSON with:
{
  "relatedToNew": ["slug1", "slug2", "slug3"],  // 3-5 posts most related TO the new post
  "backlinkNew": ["slug4", "slug5"],            // 2-4 posts that should link BACK to the new post
  "reasoning": {
    "slug1": "Brief explanation of the connection (10-15 words)",
    "slug2": "Brief explanation...",
    ...
  }
}

Be selective - only include genuinely meaningful connections. Quality over quantity.`;
}
