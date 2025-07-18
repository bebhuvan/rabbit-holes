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
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: await buildEnhancePrompt(title, type, url, content, tags, env)
        }]
      })
    });
    
    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }
    
    const claudeData = await claudeResponse.json();
    const result = JSON.parse(claudeData.content[0].text);
    
    // Generate HTML preview from markdown content
    const preview = generatePreview(result.content, title);
    
    return new Response(JSON.stringify({
      content: result.content,
      frontmatter: result.frontmatter,
      dive_deeper: result.dive_deeper,
      suggested_tags: result.suggested_tags,
      preview: preview,
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

async function buildEnhancePrompt(title, type, url, content, tags, env) {
  let enhancedContent = content;
  
  // If it's a link post, fetch and read the URL content
  if (url && (type === 'link' || type === 'video' || type === 'music')) {
    try {
      const urlContent = await fetchUrlContent(url);
      enhancedContent = `${content}\n\n[URL Content Summary: ${urlContent.slice(0, 500)}...]`;
    } catch (error) {
      console.log('Could not fetch URL content:', error.message);
    }
  }
  
  const basePrompt = `Hey! You're a fun, curious information connoisseur who just discovered something cool and wants to share it. Write like you're telling a friend about something fascinating you found.

Given this discovery:
Title: "${title || 'Untitled'}"
Type: ${type}
${url ? `URL: ${url}` : ''}
Tags: ${tags?.join(', ') || 'none'}
Content: "${enhancedContent}"

Write this in a casual, enthusiastic tone - like "Hey, I found this interesting thing!" Keep it simple and engaging, not academic or formal.

${url ? `
After your main content, add a "## Rabbit Holes" section with:
- 3-5 related concepts/ideas to explore
- Include verified links (Wikipedia, YouTube, research papers, quality blogs)
- Each item should be: "**Topic**: Brief description [Link](URL)"
- Make connections between ideas - show how they relate to the main topic
` : ''}

Return a JSON object with:
1. "content": Enhanced markdown content with casual, fun writing
2. "frontmatter": YAML frontmatter with title, date, type, tags, and other metadata
3. "dive_deeper": Array of 3-5 specific, actionable suggestions for further exploration
4. "suggested_tags": Array of 3-5 relevant tags

Format as valid JSON:
{
  "content": "enhanced markdown content",
  "frontmatter": "yaml frontmatter", 
  "dive_deeper": ["suggestion 1", "suggestion 2"],
  "suggested_tags": ["tag1", "tag2"]
}`;

  return basePrompt;
}

async function fetchUrlContent(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RabbitHolesBlog/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract text content from HTML (basic extraction)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return textContent.slice(0, 2000); // Limit to 2000 chars
  } catch (error) {
    throw new Error(`Failed to fetch URL: ${error.message}`);
  }
}

function generatePreview(markdown, title) {
  // Simple markdown to HTML conversion for preview
  let html = markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  // Wrap in paragraphs
  html = '<p>' + html + '</p>';
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  
  return html;
}