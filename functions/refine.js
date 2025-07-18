// Cloudflare Function for Claude API content refinement
// This function refines existing content based on user instructions

export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    const { content, instructions } = await request.json();
    
    if (!content || !instructions) {
      return new Response('Missing required fields', { status: 400 });
    }
    
    // Claude API integration for content refinement
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `You are helping refine blog content for a "rabbit holes" blog about fascinating discoveries and deep dives into topics.

Current content:
${content}

User instructions for refinement:
${instructions}

Please refine the content according to the user's instructions while maintaining the conversational, curiosity-driven tone. Keep the focus on exploration and making connections between ideas.

Return only the refined content as markdown, nothing else.`
        }]
      })
    });
    
    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }
    
    const claudeData = await claudeResponse.json();
    const refinedContent = claudeData.content[0].text;
    
    return new Response(JSON.stringify({
      content: refinedContent,
      refined: true
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('Content refinement error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to refine content',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}