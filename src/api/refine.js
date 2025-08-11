// Content refinement using AI
export async function handleRefine(request, env, ctx) {
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
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
  
  try {
    const { content, instructions, type, model = 'claude', title, followOn } = await request.json();
    
    if (!content || !instructions) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: content and instructions are required'
      }), { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Function to call Claude API
    async function callClaude(prompt, maxTokens = 1500) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      return data.content[0].text;
    }

    // Function to call ChatGPT API
    async function callChatGPT(prompt, maxTokens = 1500) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    }
    
    // Function to call the selected AI model
    async function callAI(prompt, maxTokens = 1500) {
      if (model === 'chatgpt') {
        if (!env.OPENAI_API_KEY) {
          throw new Error('OPENAI_API_KEY is not configured');
        }
        return callChatGPT(prompt, maxTokens);
      } else {
        if (!env.CLAUDE_API_KEY) {
          throw new Error('CLAUDE_API_KEY is not configured');
        }
        return callClaude(prompt, maxTokens);
      }
    }
    
    // Create refinement prompt
    const prompt = `Please refine the following content based on the specific instructions provided.

ORIGINAL CONTENT:
${content}

${title ? `TITLE: ${title}` : ''}

REFINEMENT INSTRUCTIONS:
${instructions}

REQUIREMENTS:
- Keep the same general structure and tone
- Apply the specific changes requested in the instructions
- Return ONLY the refined content as plain markdown text
- Do NOT wrap in JSON or add any prefixes/suffixes
- Do NOT include frontmatter or metadata

Return the refined content:`;
    
    const refinedContent = await callAI(prompt, 2000);
    
    let response = {
      success: true,
      content: refinedContent.trim()
    };
    
    // For follow-on prompting, try to extract title if it was modified
    if (followOn && title) {
      const titleMatch = refinedContent.match(/^# (.+)$/m);
      if (titleMatch && titleMatch[1] !== title) {
        response.title = titleMatch[1];
        // Remove title from content
        response.content = refinedContent.replace(/^# .+$/m, '').trim();
      }
    }
    
    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('Refinement error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to refine content',
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