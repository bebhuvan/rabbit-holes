// Cloudflare Function for Claude API integration
// This function enhances blog post content with AI-generated "Dive Deeper" suggestions

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
    const { title, content, tags, type, url, titleOnly, model = 'claude' } = await request.json();
    
    if (!content && !titleOnly) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Clean ALL inputs immediately to remove problematic characters
    const cleanContent = content ? content.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim() : '';
    const cleanTitle = title ? title.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim() : null;
    const cleanUrl = url ? url.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim() : null;
    
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

    // Function to call the selected AI model
    async function callAI(prompt, maxTokens = 1500) {
      if (model === 'chatgpt') {
        if (!env.OPENAI_API_KEY) {
          throw new Error('OPENAI_API_KEY is not configured. Please add it in Cloudflare Pages dashboard under Settings > Environment variables.');
        }
        return callChatGPT(prompt, maxTokens);
      } else {
        if (!env.CLAUDE_API_KEY) {
          throw new Error('CLAUDE_API_KEY is not configured. Please add it in Cloudflare Pages dashboard under Settings > Environment variables.');
        }
        return callClaude(prompt, maxTokens);
      }
    }

    // Handle title generation only
    if (titleOnly) {
      const titlePrompt = `Generate an engaging, curiosity-driven title for this content:

${cleanContent || `Content about: ${cleanUrl}`}

Type: ${type}

Return only the title, nothing else. Make it intriguing and click-worthy while being accurate.`;
      
      const aiResponse = await callAI(titlePrompt, 100);
      const generatedTitle = aiResponse.trim().replace(/^["']|["']$/g, '');
      
      return new Response(JSON.stringify({
        success: true,
        title: generatedTitle
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }
    
    // Enhance content with URL fetching if it's a link post
    let enhancedContent = cleanContent;
    if (cleanUrl && (type === 'link' || type === 'video' || type === 'music')) {
      try {
        const urlContent = await fetchUrlContent(cleanUrl);
        enhancedContent = `${cleanContent}\n\n[URL Content Summary: ${urlContent.slice(0, 400)}...]`;
      } catch (error) {
        console.log('Could not fetch URL content:', error.message);
      }
    }
    
    // Create prompt based on content type
    let mainPrompt = '';
    
    if (type === 'roundup') {
      // Special handling for link roundups
      mainPrompt = `You're a curious curator sharing interesting finds. Create a link roundup with a casual, conversational tone - like sharing cool discoveries with a friend.

INPUT:
${enhancedContent}

TONE & STYLE:
- Simple, direct, informal language
- No buzzwords or over-the-top professional language
- Write like someone who genuinely finds things interesting
- Use "I found this..." or "This caught my eye..." 
- Be enthusiastic but not hyperbolic

STRUCTURE:
${!cleanTitle ? `Start with an engaging title as # heading` : ''}

Brief intro explaining the theme or what caught your attention about these links.

Then for each link:
**[Link Title or Description]**: Brief summary of what makes it interesting. Why did it catch your attention? What's the key insight? [Original Link](url)

End with a simple conclusion tying them together or a question for readers.

Add this disclaimer at the very end (separated by a single line break):

*This is ${model === 'chatgpt' ? 'ChatGPT' : 'Claude AI'}'s answer to my question, shared directly.*

CRITICAL: Return ONLY the content as plain markdown text. Do NOT wrap in JSON. Do NOT include frontmatter. Do NOT return any JSON structure. Just return the markdown content directly.

Tags will be generated separately - focus only on writing engaging content.

Keep it conversational and genuine - like a curator sharing genuinely interesting discoveries.`;
    } else {
      // Standard prompt for other types
      mainPrompt = `You're a curious curator who loves discovering interesting patterns and connections. Write in a simple, direct, informal tone - like sharing a fascinating discovery with a friend.

INPUT:
Title: ${cleanTitle || 'Generate an engaging title'}
Type: ${type}
${cleanUrl ? `URL: ${cleanUrl}` : ''}
Content: ${enhancedContent}

STRUCTURE:
${!cleanTitle ? `Start with a compelling title as an H1 heading (# Title)` : ''}

TONE & STYLE:
- Simple, direct, informal and blog-like language
- No professional or over the top language  
- Write in the voice of a curator sharing interesting things
- Begin naturally: "I came across something interesting..." or "This caught my attention..."
- Share your genuine curiosity: "This got me thinking..." or "What's fascinating is..."
- Ask questions that spark curiosity
- Connect ideas naturally
${cleanUrl ? `- MANDATORY: Reference and hyperlink the original source early in the post: "I found this interesting [piece about X](${cleanUrl}) that got me thinking..." or "This [fascinating article](${cleanUrl}) caught my attention because..."` : ''}

${cleanUrl ? `MANDATORY: End with a "## Rabbit Holes" section with 4-5 connections:
Format: "**Topic**: 2-3 sentence description explaining the connection. [Explore this →](working-URL)"

Example: "**Jazz and Quantum Physics**: Both involve improvisation within structured frameworks. Jazz musicians work within chord progressions while creating spontaneous variations, much like quantum particles exist in probability states until observed. [Explore this →](https://en.wikipedia.org/wiki/Quantum_mechanics)"

Requirements:
- Mix domains: science, art, history, psychology, philosophy, technology
- Each needs 2-3 sentences explaining WHY it connects
- Use ONLY these verified, reliable sources:

**Wikipedia (primary choice):**
• https://en.wikipedia.org/wiki/[exact-topic-name]

**Major Publications & News:**
• https://www.nytimes.com/
• https://www.washingtonpost.com/
• https://www.theguardian.com/
• https://www.bbc.com/
• https://www.reuters.com/
• https://www.economist.com/
• https://www.theatlantic.com/
• https://www.newyorker.com/
• https://www.wired.com/

**Science & Technology:**
• https://www.scientificamerican.com/
• https://www.nature.com/
• https://www.nationalgeographic.com/
• https://www.popsci.com/
• https://www.techcrunch.com/
• https://arstechnica.com/
• https://www.mit.edu/
• https://www.harvard.edu/

**Educational & Academic:**
• https://www.khanacademy.org/
• https://www.coursera.org/
• https://www.edx.org/
• https://www.ted.com/talks/
• https://www.britannica.com/

**Museums & Cultural:**
• https://www.smithsonianmag.com/
• https://www.metmuseum.org/
• https://www.moma.org/
• https://www.louvre.fr/
• https://www.britishmuseum.org/

**Government & Research:**
• https://www.nasa.gov/
• https://www.nih.gov/
• https://www.cdc.gov/
• https://www.who.int/
• https://www.un.org/

**Business & Finance:**
• https://www.bloomberg.com/
• https://www.ft.com/
• https://www.wsj.com/
• https://www.forbes.com/
• https://hbr.org/

- CRITICAL: Only use domains listed above, prefer well-known articles and sections
- Make connections feel like genuine discoveries` : ''}

Add this disclaimer at the very end (separated by a single line break):

*This is ${model === 'chatgpt' ? 'ChatGPT' : 'Claude AI'}'s answer to my question, shared directly${cleanUrl ? '. The original source was read and analyzed to create this exploration of related topics' : ''}.*

CRITICAL: Return ONLY the content as plain markdown text. Do NOT wrap in JSON. Do NOT include frontmatter. Do NOT return any JSON structure. Just return the markdown content directly.

Tags will be generated separately - focus only on writing engaging content.

Write like you're genuinely excited about sharing something cool you discovered.`;
    }
    
    // Debug log
    console.log('Main prompt length:', mainPrompt.length);
    
    // Standard Claude API call
    const requestBody = JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: mainPrompt
      }]
    });
    
    // Debug the request body
    console.log('Request body length:', requestBody.length);
    
    // AI API integration - use higher token limit for longer content
    const maxTokens = model === 'chatgpt' ? 4000 : 1500; // ChatGPT can handle longer responses
    let aiResponse = await callAI(mainPrompt, maxTokens);
    
    // Clean up OpenAI responses which might have different formatting
    if (model === 'chatgpt') {
      // Ensure proper paragraph breaks - OpenAI sometimes uses single line breaks
      aiResponse = aiResponse
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/(?<!\n)\n(?!\n)/g, '  \n') // Convert single line breaks to markdown line breaks
        .trim();
    }
    
    // Debug log the AI response
    console.log('AI Response preview:', aiResponse.substring(0, 200));
    
    // Extract or generate title from AI response
    let generatedTitle = cleanTitle || 'Untitled';
    if (!cleanTitle) {
      // Try to extract title from AI response (look for first # heading)
      const titleMatch = aiResponse.match(/^# (.+)$/m);
      if (titleMatch) {
        generatedTitle = titleMatch[1];
      } else {
        // Generate a simple title from the first line or content
        const firstLine = aiResponse.split('\n')[0].replace(/[#*]/g, '').trim();
        generatedTitle = firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine;
      }
    }
    
    // Generate simple frontmatter
    const frontmatter = `---
title: "${generatedTitle}"
date: ${new Date().toISOString().split('T')[0]}
type: "${type}"
tags: []
published: false
---`;
    
    // Generate HTML preview
    const preview = generatePreview(aiResponse, cleanTitle);
    
    // Extract enhanced title if AI generated one
    let finalTitle = generatedTitle;
    let finalContent = aiResponse;
    
    // If AI response starts with a title, extract it
    const titleMatch = aiResponse.match(/^# (.+)$/m);
    if (titleMatch && !cleanTitle) {
      finalTitle = titleMatch[1];
      // Remove the title from content since it will be in the title field
      finalContent = aiResponse.replace(/^# .+$/m, '').trim();
    }
    
    // Extract specific tags from AI content instead of generic ones
    const suggestedTags = [];
    
    // Try to extract meaningful tags from the AI-generated content
    const contentLower = finalContent.toLowerCase();
    
    // Look for topic-specific keywords to generate better tags
    const topicKeywords = {
      'behavioral-economics': ['behavioral', 'psychology', 'economics', 'decision'],
      'game-theory': ['game theory', 'strategy', 'cooperation', 'competition'],
      'complexity': ['complex', 'system', 'emergence', 'network'],
      'cognitive-bias': ['bias', 'cognitive', 'thinking', 'perception'],
      'innovation': ['innovation', 'creativity', 'breakthrough', 'invention'],
      'philosophy': ['philosophy', 'ethics', 'meaning', 'existence'],
      'neuroscience': ['brain', 'neuron', 'consciousness', 'mind'],
      'physics': ['quantum', 'relativity', 'particle', 'energy'],
      'sociology': ['society', 'culture', 'social', 'community'],
      'technology': ['ai', 'algorithm', 'digital', 'automation'],
      'history': ['historical', 'ancient', 'civilization', 'evolution'],
      'art': ['aesthetic', 'design', 'creative', 'artistic'],
      'science': ['research', 'experiment', 'hypothesis', 'discovery'],
      'psychology': ['mental', 'emotion', 'behavior', 'personality'],
      'fashion-history': ['fashion', 'clothing', 'textile', 'style'],
      'industrial-revolution': ['industrial', 'revolution', 'manufacturing', 'factory'],
      'material-culture': ['material', 'object', 'artifact', 'everyday'],
      'technological-innovation': ['technology', 'innovation', 'invention', 'advancement'],
      'cultural-evolution': ['culture', 'evolution', 'change', 'development'],
      'ancient-history': ['ancient', 'egypt', 'greece', 'rome', 'archaeological'],
      'deep-dives': ['deep', 'dive', 'exploration', 'investigation'],
      'everyday-objects': ['everyday', 'ordinary', 'mundane', 'common']
    };
    
    // Check content against keyword patterns
    for (const [tag, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        suggestedTags.push(tag);
      }
    }
    
    // If no specific tags found, use content-derived tags instead of generic ones
    if (suggestedTags.length === 0) {
      if (cleanUrl) suggestedTags.push('analysis');
      if (type === 'roundup') suggestedTags.push('roundup');
      suggestedTags.push('insights');
    }
    
    return new Response(JSON.stringify({
      success: true,
      title: finalTitle,
      content: finalContent,
      tags: suggestedTags,
      dive_deeper: ["Explore this topic further", "Find related concepts", "Discover connections"],
      frontmatter: frontmatter,
      preview: preview,
      enhanced: true
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('AI enhancement error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      hasApiKey: !!env.CLAUDE_API_KEY
    });
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to enhance content',
      details: error.message,
      hasApiKey: !!env.CLAUDE_API_KEY
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

// Removed unused buildEnhancePrompt function that was requesting JSON format

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
    let textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Remove control characters only
    textContent = textContent.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    return textContent.slice(0, 1000); // Limit to 1000 chars
  } catch (error) {
    throw new Error(`Failed to fetch URL: ${error.message}`);
  }
}

function generatePreview(markdown, title) {
  // Simple markdown to HTML conversion for preview
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Code
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Lists
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Wrap list items in ul/ol
    .replace(/(<li>.*<\/li>\n?)+/g, function(match) {
      return '<ul>' + match + '</ul>';
    })
    // Paragraphs - handle different line break styles
    .replace(/\n\n+/g, '</p><p>')
    .replace(/  \n/g, '<br>')
    .replace(/\n/g, '<br>');
  
  // Wrap in paragraphs
  html = '<p>' + html + '</p>';
  
  // Clean up empty paragraphs and fix nested p tags
  html = html
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[1-6]>)/g, '$1')
    .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
    .replace(/<p>(<ul>)/g, '$1')
    .replace(/(<\/ul>)<\/p>/g, '$1');
  
  return html;
}