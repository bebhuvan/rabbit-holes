// AI-powered single link processing for the /xyz dashboard
// This function analyzes a URL and generates blog post content

export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    const { url, prompt } = await request.json();
    
    if (!url) {
      return new Response('URL is required', { status: 400 });
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch {
      return new Response('Invalid URL format', { status: 400 });
    }
    
    // Clean inputs
    const cleanUrl = url.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
    const cleanPrompt = prompt ? prompt.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim() : '';
    
    // Fetch URL content
    let urlContent = '';
    try {
      const urlResponse = await fetch(cleanUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RabbitHolesBlog/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 10000
      });
      
      if (urlResponse.ok) {
        const html = await urlResponse.text();
        
        // Extract title and meta description
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
        
        // Extract main content (basic HTML parsing)
        urlContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
          .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
          .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
          .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 2000);
          
        // Add title and description to content
        const extractedTitle = titleMatch ? titleMatch[1] : '';
        const extractedDesc = descMatch ? descMatch[1] : '';
        
        urlContent = `Title: ${extractedTitle}\nDescription: ${extractedDesc}\nContent: ${urlContent}`;
      }
    } catch (error) {
      console.log('Could not fetch URL content:', error.message);
      urlContent = 'Could not fetch URL content for analysis.';
    }
    
    // Build AI prompt
    const aiPrompt = `You are an expert content curator and writer. Analyze this URL and create an engaging blog post.

URL: ${cleanUrl}
${cleanPrompt ? `User Instructions: ${cleanPrompt}` : ''}

URL Content:
${urlContent}

Create a thoughtful, engaging blog post that:
1. Has a compelling title (use # heading)
2. Analyzes or reflects on the content
3. Adds your own insights and connections
4. Uses a conversational, curious tone
5. Includes relevant subheadings (## headings)
6. Ends with a "## Rabbit Holes" section with 3-4 related topics to explore

Format as clean markdown suitable for a blog post. Make it feel like discovering something interesting and sharing it with a friend.`;
    
    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: aiPrompt
        }]
      })
    });
    
    if (!claudeResponse.ok) {
      const error = await claudeResponse.text();
      throw new Error(`Claude API error: ${claudeResponse.status} - ${error}`);
    }
    
    const claudeData = await claudeResponse.json();
    const generatedContent = claudeData.content[0].text;
    
    // Extract title from generated content
    const titleMatch = generatedContent.match(/^# (.+)$/m);
    const title = titleMatch ? titleMatch[1] : 'Interesting Discovery';
    
    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Create frontmatter
    const frontmatter = {
      title,
      date: new Date().toISOString(),
      type: 'link',
      published: false,
      tags: ['discovery', 'exploration'],
      url: cleanUrl,
      description: `An exploration of ${cleanUrl}`
    };
    
    const markdownContent = `---\n${Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}:\n${value.map(item => `  - "${item}"`).join('\n')}`;
        }
        if (typeof value === 'string' && key !== 'date') {
          return `${key}: "${value}"`; 
        }
        return `${key}: ${value}`;
      })
      .join('\n')}\n---\n\n${generatedContent}`;
    
    return new Response(JSON.stringify({
      success: true,
      content: generatedContent,
      frontmatter: markdownContent,
      title,
      slug,
      url: cleanUrl,
      processing_time: Date.now()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('Process link error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to process link',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}