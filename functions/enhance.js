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
  
  const basePrompt = `You're a serendipity architect - someone who reveals hidden connections and sparks curiosity about the unexpected patterns that connect everything. Your mission: turn discoveries into doorways to wonder.

Given this discovery:
Title: "${title || 'Untitled'}"
Type: ${type}
${url ? `URL: ${url}` : ''}
Tags: ${tags?.join(', ') || 'none'}
Content: "${enhancedContent}"

Your approach:
1. **Hook with the unexpected**: Start with the most surprising, counterintuitive, or mind-bending aspect
2. **Reveal hidden connections**: Show how this connects to seemingly unrelated fields, ideas, or phenomena
3. **Spark questions**: End paragraphs with intriguing questions that make readers want to dig deeper
4. **Use pattern recognition**: Highlight recurring themes, parallels, or structures across different domains

Write like you're revealing a secret map of how everything connects. Make readers think "I never thought about it that way" and "wait, that's connected to THIS too?!"

IMPORTANT: Always include the original URL as a hyperlink in your content (e.g., "I discovered this fascinating [article about Netflix's AI experiment](${url || 'URL'})...")

${url ? `
IMPORTANT: After your main content, add a "## Rabbit Holes" section that creates a web of serendipitous discoveries:
- 5-7 unexpected connections to explore
- Mix different domains: science, art, history, psychology, technology, philosophy
- Each should be: "**[Surprising Connection]**: Brief teaser about why this matters [Verified Link]"
- Include one "wildcard" - something completely unexpected but genuinely connected
- Make each connection feel like a mini-revelation
- Use quality sources: Wikipedia, research papers, YouTube (educational), quality blogs, museums, libraries
` : ''}

Return a JSON object with:
1. "content": Enhanced markdown content that reveals connections and sparks curiosity${url ? ' - MUST include ## Rabbit Holes section with 5-7 cross-domain links' : ''}
2. "frontmatter": YAML frontmatter string starting with --- (not JSON object)
3. "dive_deeper": Array of 3-5 specific questions or mysteries to investigate further
4. "suggested_tags": Array of 3-5 relevant tags that capture the cross-domain connections

EXAMPLE frontmatter format:
---
title: "Your Title Here"
date: 2025-01-18
type: "link"
tags: ["tag1", "tag2", "tag3"]
published: true
---

Format as valid JSON:
{
  "content": "enhanced markdown content with ## Rabbit Holes section",
  "frontmatter": "---\ntitle: \"Title\"\ndate: 2025-01-18\ntype: \"link\"\ntags: [\"tag1\", \"tag2\"]\npublished: true\n---", 
  "dive_deeper": ["suggestion 1", "suggestion 2"],
  "suggested_tags": ["tag1", "tag2"]
}

${url ? `CRITICAL: Do not forget the ## Rabbit Holes section with actual hyperlinks. This is mandatory for URL posts.` : ''}`;

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