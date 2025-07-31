// AI-powered bulk link processing for the /xyz dashboard
// This function analyzes multiple URLs and generates consolidated content

export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    const { urls, prompt } = await request.json();
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response('URLs array is required', { status: 400 });
    }
    
    if (urls.length > 10) {
      return new Response('Maximum 10 URLs allowed', { status: 400 });
    }
    
    // Clean inputs
    const cleanUrls = urls
      .filter(url => url && url.trim())
      .map(url => url.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim())
      .slice(0, 10);
      
    const cleanPrompt = prompt ? prompt.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim() : '';
    
    if (cleanUrls.length === 0) {
      return new Response('No valid URLs provided', { status: 400 });
    }
    
    // Validate URL formats
    for (const url of cleanUrls) {
      try {
        new URL(url);
      } catch {
        return new Response(`Invalid URL format: ${url}`, { status: 400 });
      }
    }
    
    // Fetch content from all URLs (with timeout and error handling)
    const urlContents = await Promise.allSettled(
      cleanUrls.map(async (url) => {
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; RabbitHolesBlog/1.0)',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            signal: AbortSignal.timeout(8000) // 8 second timeout per URL
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const html = await response.text();
          
          // Extract title and description
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
          
          // Extract content
          const content = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
            .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
            .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
            .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 1000); // Limit per URL
          
          return {
            url,
            title: titleMatch ? titleMatch[1].trim() : url,
            description: descMatch ? descMatch[1].trim() : '',
            content,
            status: 'success'
          };
          
        } catch (error) {
          return {
            url,
            title: url,
            description: '',
            content: `Failed to fetch: ${error.message}`,
            status: 'error'
          };
        }
      })
    );
    
    // Process results
    const processedUrls = urlContents.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          url: cleanUrls[index],
          title: cleanUrls[index],
          description: '',
          content: `Failed to process: ${result.reason?.message || 'Unknown error'}`,
          status: 'error'
        };
      }
    });
    
    // Build consolidated content for AI analysis
    const consolidatedContent = processedUrls.map((item, i) => 
      `[${i + 1}] ${item.title}\nURL: ${item.url}\nDescription: ${item.description}\nContent: ${item.content}\n---`
    ).join('\n\n');
    
    // Build AI prompt
    const aiPrompt = `You are an expert content curator analyzing multiple related sources. Create a comprehensive blog post that synthesizes insights from these ${cleanUrls.length} URLs.

${cleanPrompt ? `User Instructions: ${cleanPrompt}` : 'Create a thoughtful synthesis of these sources, finding common themes and interesting connections.'}

Sources to analyze:
${consolidatedContent}

Create an engaging blog post that:
1. Has a compelling title (use # heading)
2. Synthesizes insights from all sources
3. Identifies common themes and patterns
4. Adds your own analysis and connections
5. Uses a conversational, insightful tone
6. Includes relevant subheadings (## headings)
7. References sources naturally within the content
8. Ends with a "## Further Reading" section linking to the original sources

Format as clean markdown. Make it feel like a thoughtful curator has discovered fascinating connections between these sources.`;
    
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
        max_tokens: 3000,
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
    
    // Extract title
    const titleMatch = generatedContent.match(/^# (.+)$/m);
    const title = titleMatch ? titleMatch[1] : 'Connecting the Dots';
    
    // Generate results for frontend
    const results = processedUrls.map((item, index) => ({
      title: item.title,
      url: item.url,
      content: `Source ${index + 1}: ${item.description || 'Content processed successfully'}`,
      status: item.status
    }));
    
    // Add the consolidated post as the main result
    results.unshift({
      title: title,
      url: 'consolidated-post',
      content: generatedContent,
      status: 'success',
      type: 'consolidated'
    });
    
    return new Response(JSON.stringify({
      success: true,
      results: results,
      consolidated_content: generatedContent,
      sources_processed: processedUrls.length,
      sources_successful: processedUrls.filter(u => u.status === 'success').length,
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
    console.error('Process bulk links error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to process bulk links',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}