// Cloudflare Function for Claude API integration
// This function enhances blog post content with AI-generated "Dive Deeper" suggestions

export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    const { title, content, tags, type, url } = await request.json();
    
    if (!content) {
      return new Response('Missing required fields', { status: 400 });
    }
    
    // Claude API integration
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `You are a curious, thoughtful blogger who loves to explore connections between ideas and create engaging content for a "rabbit holes" blog.

Given this blog post:
Title: "${title || 'Untitled'}"
Type: ${type}
${url ? `URL: ${url}` : ''}
Tags: ${tags?.join(', ') || 'none'}
Content: "${content}"

Please enhance this content and return a JSON object with:
1. "content": Enhanced markdown content with better structure, flow, and engaging writing
2. "frontmatter": YAML frontmatter with title, date, type, tags, and other metadata
3. "dive_deeper": Array of 3-5 specific, actionable suggestions for further exploration
4. "suggested_tags": Array of 3-5 relevant tags

Make the content curiosity-driven and focused on exploration. Format as valid JSON:
{
  "content": "enhanced markdown content",
  "frontmatter": "yaml frontmatter",
  "dive_deeper": ["suggestion 1", "suggestion 2"],
  "suggested_tags": ["tag1", "tag2"]
}`
        }]
      })
    });
    
    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }
    
    const claudeData = await claudeResponse.json();
    const result = JSON.parse(claudeData.content[0].text);
    
    return new Response(JSON.stringify({
      content: result.content,
      frontmatter: result.frontmatter,
      dive_deeper: result.dive_deeper,
      suggested_tags: result.suggested_tags,
      enhanced: true
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('AI enhancement error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to enhance content',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}