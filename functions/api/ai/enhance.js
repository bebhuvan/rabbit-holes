// Cloudflare Function for Claude API integration
// This function enhances blog post content with AI-generated "Dive Deeper" suggestions

export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    const { title, content, tags, type } = await request.json();
    
    if (!title || !content) {
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
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are a curious, thoughtful blogger who loves to explore connections between ideas. 

Given this blog post:
Title: "${title}"
Type: ${type}
Tags: ${tags?.join(', ') || 'none'}
Content: "${content}"

Generate 3-5 "Dive Deeper" suggestions that would genuinely intrigue readers and lead them down interesting rabbit holes. Each suggestion should be:
1. Specific and actionable (not vague)
2. Related but not obvious
3. Intellectually curious
4. Lead to further exploration

Format as a simple array of strings, nothing else:
["suggestion 1", "suggestion 2", "suggestion 3"]`
        }]
      })
    });
    
    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }
    
    const claudeData = await claudeResponse.json();
    const suggestions = JSON.parse(claudeData.content[0].text);
    
    // Also generate related tags
    const tagsResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `Given this blog post title and content, suggest 3-5 relevant tags that capture the key themes and topics:

Title: "${title}"
Content: "${content}"

Return only a JSON array of lowercase tag strings:
["tag1", "tag2", "tag3"]`
        }]
      })
    });
    
    const tagsData = await tagsResponse.json();
    const suggestedTags = JSON.parse(tagsData.content[0].text);
    
    return new Response(JSON.stringify({
      dive_deeper: suggestions,
      suggested_tags: suggestedTags,
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