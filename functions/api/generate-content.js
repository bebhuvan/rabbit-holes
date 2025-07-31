// AI-powered freeform content generation for the /xyz dashboard
// This function generates blog posts from user prompts

export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    const { prompt, includeLinks, includeSections } = await request.json();
    
    if (!prompt || !prompt.trim()) {
      return new Response('Prompt is required', { status: 400 });
    }
    
    // Clean input
    const cleanPrompt = prompt.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
    
    if (cleanPrompt.length < 10) {
      return new Response('Prompt must be at least 10 characters', { status: 400 });
    }
    
    if (cleanPrompt.length > 2000) {
      return new Response('Prompt must be less than 2000 characters', { status: 400 });
    }
    
    // Build AI prompt based on options
    let aiPrompt = `You are an expert blog writer and content creator. Write an engaging, thoughtful blog post based on this prompt:

"${cleanPrompt}"

Requirements:
1. Create a compelling title (use # heading)
2. Write in a conversational, engaging tone
3. Include personal insights and analysis
4. Make it feel authentic and thoughtful
5. Use proper markdown formatting`;

    if (includeSections) {
      aiPrompt += `
6. Break content into logical sections with ## subheadings
7. Create a clear flow between sections`;
    }

    if (includeLinks) {
      aiPrompt += `
${includeSections ? '8' : '6'}. Include relevant external links to credible sources
${includeSections ? '9' : '7'}. End with a "## Further Reading" section with 3-4 related resources`;
    }

    aiPrompt += `

Write as if you're sharing an interesting discovery or insight with a friend. The goal is to inform, engage, and inspire curiosity.

Word count: Aim for 800-1200 words for a substantial but readable post.`;
    
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
    
    // Extract title from generated content
    const titleMatch = generatedContent.match(/^# (.+)$/m);
    const title = titleMatch ? titleMatch[1] : 'Thoughtful Exploration';
    
    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Determine post type based on content
    const hasLinks = generatedContent.includes('http') || generatedContent.includes('[');
    const postType = hasLinks ? 'link' : 'musing';
    
    // Generate suggested tags based on content
    const suggestedTags = generateTags(generatedContent, cleanPrompt);
    
    // Create frontmatter
    const frontmatter = {
      title,
      date: new Date().toISOString(),
      type: postType,
      published: false,
      tags: suggestedTags,
      description: generateDescription(generatedContent)
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
    
    // Generate word count
    const wordCount = generatedContent.split(/\s+/).length;
    
    return new Response(JSON.stringify({
      success: true,
      content: generatedContent,
      frontmatter: markdownContent,
      title,
      slug,
      type: postType,
      tags: suggestedTags,
      word_count: wordCount,
      processing_time: Date.now(),
      options_used: {
        includeLinks: !!includeLinks,
        includeSections: !!includeSections
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('Generate content error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to generate content',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function generateTags(content, originalPrompt) {
  // Simple keyword extraction for tags
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  
  // Extract meaningful words from prompt and content
  const words = (originalPrompt + ' ' + content)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));
  
  // Count word frequency
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Get top words as potential tags
  const topWords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
  
  // Add some general categorization
  const categories = [];
  if (content.toLowerCase().includes('technology') || content.toLowerCase().includes('tech')) {
    categories.push('technology');
  }
  if (content.toLowerCase().includes('philosophy') || content.toLowerCase().includes('thinking')) {
    categories.push('philosophy');
  }
  if (content.toLowerCase().includes('culture') || content.toLowerCase().includes('society')) {
    categories.push('culture');
  }
  if (content.toLowerCase().includes('science') || content.toLowerCase().includes('research')) {
    categories.push('science');
  }
  
  // Combine and deduplicate
  const allTags = [...new Set([...categories, ...topWords])].slice(0, 4);
  
  return allTags.length > 0 ? allTags : ['exploration', 'thoughts'];
}

function generateDescription(content) {
  // Extract first meaningful paragraph as description
  const paragraphs = content.split('\n\n').filter(p => p.trim() && !p.startsWith('#'));
  
  if (paragraphs.length === 0) {
    return 'A thoughtful exploration of ideas and insights.';
  }
  
  let description = paragraphs[0]
    .replace(/[#*`]/g, '') // Remove markdown
    .replace(/\[[^\]]*\]\([^)]*\)/g, '') // Remove links
    .trim();
  
  // Truncate if too long
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }
  
  return description || 'A thoughtful exploration of ideas and insights.';
}