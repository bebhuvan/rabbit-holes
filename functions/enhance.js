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
    
    // Clean ALL inputs immediately to remove problematic characters
    const cleanContent = content.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
    const cleanTitle = title ? title.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim() : null;
    const cleanUrl = url ? url.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim() : null;
    
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
    
    // Use serendipity-focused prompt
    const serendipityPrompt = `You create "rabbit hole" content that sparks curiosity and reveals unexpected connections. Your goal: make readers think "I never realized these things were connected!"

INPUT:
Title: ${cleanTitle || 'Untitled'}
Type: ${type}
${cleanUrl ? `URL: ${cleanUrl}` : ''}
Content: ${enhancedContent}

APPROACH:
- Hook with something surprising or counterintuitive
- Reveal hidden patterns between different fields
- Show how this connects to seemingly unrelated topics
- Use natural, conversational tone
${cleanUrl ? `- MUST include the original URL as a hyperlink in your content like: "I found this fascinating [article about X](${cleanUrl})..."` : ''}

${cleanUrl ? `MANDATORY: After your main content, add a "## Rabbit Holes" section with 3-5 unexpected connections:
- Each must be: "**Topic**: Brief description [Link](actual-working-URL)"
- Use real URLs: Wikipedia links, YouTube videos, research papers, quality articles
- Example: "**Quantum Jazz**: How improvisation mirrors quantum uncertainty [Link](https://en.wikipedia.org/wiki/Quantum_mechanics)"
- Mix domains: science, art, history, psychology, philosophy
- Each link must be a real, working URL` : ''}

Write engaging content that makes readers curious to explore further.`;
    
    // Debug log
    console.log('Serendipity prompt length:', serendipityPrompt.length);
    
    // Standard Claude API call
    const requestBody = JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: serendipityPrompt
      }]
    });
    
    // Debug the request body
    console.log('Request body length:', requestBody.length);
    
    // Claude API integration
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: requestBody
    });
    
    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }
    
    const claudeData = await claudeResponse.json();
    const aiResponse = claudeData.content[0].text;
    
    // Generate simple frontmatter
    const frontmatter = `---
title: "${cleanTitle || 'Untitled'}"
date: ${new Date().toISOString().split('T')[0]}
type: "${type}"
tags: []
published: false
---`;
    
    // Generate HTML preview
    const preview = generatePreview(aiResponse, cleanTitle);
    
    return new Response(JSON.stringify({
      content: aiResponse,
      frontmatter: frontmatter,
      dive_deeper: ["Explore this topic further", "Find related concepts", "Discover connections"],
      suggested_tags: ["discovery", "exploration"],
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
  
  // TEMPORARILY DISABLE URL FETCHING TO ISOLATE JSON ISSUE
  // if (url && (type === 'link' || type === 'video' || type === 'music')) {
  //   try {
  //     const urlContent = await fetchUrlContent(url);
  //     enhancedContent = `${content}\n\n[URL Content Summary: ${urlContent.slice(0, 500)}...]`;
  //   } catch (error) {
  //     console.log('Could not fetch URL content:', error.message);
  //   }
  // }
  
  // Clean content aggressively for JSON safety
  const cleanContent = enhancedContent
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/[\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F]/g, '') // Remove Unicode spaces/punctuation
    .replace(/[\uFFF0-\uFFFF]/g, '') // Remove Unicode specials
    .replace(/\r\n/g, ' ') // Replace CRLF with space
    .replace(/\n/g, ' ') // Replace LF with space
    .replace(/\r/g, ' ') // Replace CR with space
    .replace(/\t/g, ' ') // Replace tabs with space
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
    
  const cleanTitle = (title || 'Untitled')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/[\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F]/g, '')
    .replace(/[\uFFF0-\uFFFF]/g, '')
    .replace(/[\r\n\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
    
  const cleanUrl = (url || '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .trim();
  
  const basePrompt = `# SERENDIPITY ARCHITECT

You create "rabbit hole" content that sparks curiosity and reveals unexpected connections. Your goal: make readers think "I never realized these things were connected!"

## INPUT:
Title: ${cleanTitle}
Type: ${type}
${url ? `URL: ${cleanUrl}` : ''}
Content: ${cleanContent}

## WRITING STYLE:
- Natural, conversational tone (not overly casual)
- Hook with something surprising or counterintuitive
- Reveal hidden patterns between different fields
- End sections with intriguing questions
- Reference the original source naturally: "I stumbled across this fascinating [article about X](URL)..."

## CONTENT STRUCTURE:
1. **Opening Hook**: Start with the most surprising aspect
2. **Main Content**: Explore connections across disciplines
3. **Cross-domain Insights**: Show how this relates to other fields
${url ? `4. **Rabbit Holes Section**: MANDATORY - see requirements below` : ''}

${url ? `
## RABBIT HOLES SECTION (MANDATORY):
After your main content, add exactly this structure:

## Rabbit Holes

**[Domain 1 Connection]**: Why this matters [Link](URL)
**[Domain 2 Connection]**: Why this matters [Link](URL)
**[Domain 3 Connection]**: Why this matters [Link](URL)
**[Domain 4 Connection]**: Why this matters [Link](URL)
**[Domain 5 Connection]**: Why this matters [Link](URL)
**[Wildcard Connection]**: Something completely unexpected [Link](URL)

REQUIREMENTS:
- Mix domains: science, art, history, psychology, philosophy, technology
- Use quality sources: Wikipedia, research papers, YouTube (educational), museums
- Make each connection feel like a mini-revelation
- Include actual working hyperlinks
` : ''}

## OUTPUT FORMAT:
Return this exact JSON structure:

{
  "content": "Your enhanced markdown content${url ? ' with ## Rabbit Holes section' : ''}",
  "frontmatter": "---\ntitle: \"Your Title\"\ndate: 2025-01-18\ntype: \"${type}\"\ntags: [\"tag1\", \"tag2\"]\npublished: true\n---",
  "dive_deeper": ["Intriguing question 1", "Mystery to explore 2", "Connection to investigate 3"],
  "suggested_tags": ["cross-domain tag 1", "interdisciplinary tag 2"]
}

${url ? `⚠️ CRITICAL: The ## Rabbit Holes section with 6 hyperlinked connections is MANDATORY for URL posts. Do not omit this.` : ''}`;

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