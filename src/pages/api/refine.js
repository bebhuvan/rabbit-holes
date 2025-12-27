// AI content refinement API route

export async function POST({ request, locals }) {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    const { content, title, prompt } = await request.json();

    if (!content) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Content is required'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Access Cloudflare env vars through runtime
    const runtime = locals?.runtime?.env || {};
    const apiKey = runtime.ANTHROPIC_API_KEY || runtime.CLAUDE_API_KEY || import.meta.env.ANTHROPIC_API_KEY || import.meta.env.CLAUDE_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'AI API not configured'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    const systemPrompt = `You are an expert editor helping to refine blog post content.
Make targeted improvements based on the user's instructions.
Preserve the author's voice while addressing specific concerns.
${prompt ? `Focus on: ${prompt}` : 'Focus on making the content more concise and impactful.'}`;

    const userPrompt = `Please refine this blog post content:

${title ? `Title: ${title}\n\n` : ''}Content:
${content}

Return only the refined content, without any introduction or explanation.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 4096,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        system: systemPrompt
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const refinedContent = data.content[0].text;

    return new Response(JSON.stringify({
      success: true,
      content: refinedContent
    }), {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Refinement error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to refine content',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  });
}
