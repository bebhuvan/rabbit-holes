// Cloudflare Function for Claude API content refinement
// This function refines existing content based on user instructions

export async function onRequest(context) {
  const { request, env } = context;
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      }
    });
  }
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  try {
    const { content, instructions, title, type, followOn } = await request.json();
    
    if (!content || !instructions) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
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

${title ? `Current title: ${title}` : ''}
Current content:
${content}

User instructions for refinement:
${instructions}

Please refine the content according to the user's instructions while maintaining the conversational, curiosity-driven tone. Keep the focus on exploration and making connections between ideas.

${followOn ? 'This is follow-on prompting - the user wants to improve the content based on their feedback. You may also suggest a better title if appropriate.' : 'Return only the refined content as markdown, nothing else.'}

${followOn ? 'Return a JSON object with: {"title": "improved title if needed", "content": "refined content", "tags": ["suggested", "tags"]}' : 'Return only the refined content as markdown, nothing else.'}`
        }]
      })
    });
    
    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }
    
    const claudeData = await claudeResponse.json();
    let refinedContent = claudeData.content[0].text;
    let refinedTitle = title;
    let suggestedTags = [];
    
    // For follow-on prompting, try to parse JSON response
    if (followOn) {
      try {
        const parsed = JSON.parse(refinedContent);
        refinedContent = parsed.content || refinedContent;
        refinedTitle = parsed.title || title;
        suggestedTags = parsed.tags || [];
      } catch (e) {
        // If not JSON, use as-is but try to extract title if it starts with one
        const titleMatch = refinedContent.match(/^# (.+)$/m);
        if (titleMatch) {
          refinedTitle = titleMatch[1];
          refinedContent = refinedContent.replace(/^# .+$/m, '').trim();
        }
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      content: refinedContent,
      title: refinedTitle,
      tags: suggestedTags,
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
      success: false,
      error: 'Failed to refine content',
      details: error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
}