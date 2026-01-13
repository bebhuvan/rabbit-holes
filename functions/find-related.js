// Cloudflare Function for AI-powered backlink discovery
// Uses OpenAI to find semantically related posts for bidirectional linking

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
    const { newPost, candidatePosts } = await request.json();

    if (!newPost || !candidatePosts || candidatePosts.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing newPost or candidatePosts'
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
    const prompt = buildRelationshipPrompt(newPost, candidatePosts);

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
      // Try to extract JSON from the response
      const responseText = aiResult.response || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResult.response);
      // Return empty results if parsing fails
      aiResponse = { relatedToNew: [], backlinkNew: [], reasoning: {} };
    }

    return new Response(JSON.stringify({
      success: true,
      relatedToNew: aiResponse.relatedToNew || [],
      backlinkNew: aiResponse.backlinkNew || [],
      reasoning: aiResponse.reasoning || {}
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
  "relatedToNew": ["slug1", "slug2", "slug3"],  // 3-5 posts most related TO the new post (will be shown on new post's page)
  "backlinkNew": ["slug4", "slug5"],            // 2-4 posts that should link BACK to the new post (the new post adds value to these)
  "reasoning": {
    "slug1": "Brief explanation of the connection (10-15 words)",
    "slug2": "Brief explanation...",
    ...
  }
}

Be selective - only include genuinely meaningful connections. Quality over quantity.
A post can appear in both relatedToNew and backlinkNew if the connection is bidirectional.`;
}
