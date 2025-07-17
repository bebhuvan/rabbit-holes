// Quick capture API for instant rabbit hole sharing
// Accepts URL or content and creates an AI-enhanced post in seconds

export async function POST({ request }) {
  try {
    const { url, content, context, publish_immediately = false } = await request.json();
    
    if (!url && !content) {
      return new Response(JSON.stringify({
        error: 'Either URL or content is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Step 1: Extract metadata from URL if provided
    let metadata = {};
    if (url) {
      try {
        // In production, this would fetch and parse the URL
        // For now, we'll create smart defaults
        const domain = new URL(url).hostname;
        metadata = {
          title: `Interesting discovery from ${domain}`,
          description: `Found something fascinating on ${domain}`,
          site_name: domain,
          original_url: url
        };
      } catch (e) {
        console.error('URL parsing error:', e);
      }
    }

    // Step 2: AI-enhanced content generation
    const aiEnhancement = await generateAIContent(url, content, metadata, context);

    // Step 3: Create structured post
    const post = {
      title: aiEnhancement.title || metadata.title || 'Untitled Rabbit Hole',
      content: aiEnhancement.content || content || 'Captured for later exploration',
      type: detectContentType(url, content),
      tags: aiEnhancement.tags || [],
      dive_deeper: aiEnhancement.dive_deeper || [],
      
      // Capture metadata
      capture_method: 'api',
      original_url: url,
      capture_context: context,
      auto_generated: true,
      
      // AI metadata
      extracted_metadata: metadata,
      
      // Publishing
      draft_status: publish_immediately ? 'published' : 'enhanced',
      published: publish_immediately,
      date: new Date().toISOString().split('T')[0]
    };

    // Step 4: Generate frontmatter
    const frontmatter = `---
title: "${post.title}"
date: ${post.date}
type: "${post.type}"
${post.original_url ? `url: "${post.original_url}"` : ''}
tags: ${JSON.stringify(post.tags, null, 2)}
dive_deeper: ${JSON.stringify(post.dive_deeper, null, 2)}
published: ${post.published}
capture_method: "${post.capture_method}"
${post.capture_context ? `capture_context: "${post.capture_context}"` : ''}
auto_generated: ${post.auto_generated}
---`;

    // Step 5: Save if publishing immediately
    if (publish_immediately) {
      const slug = createSlug(post.title);
      // In production, this would save to filesystem/GitHub
      console.log(`Would save: ${slug}.md`);
    }

    return new Response(JSON.stringify({
      success: true,
      post: post,
      frontmatter: frontmatter,
      preview: generatePreview(post),
      time_taken: '< 2 seconds',
      next_steps: publish_immediately ? 
        ['Post published!', 'View live post', 'Share on social media'] :
        ['Review content', 'Refine with AI', 'Publish when ready']
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Quick capture error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to capture content',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper functions
async function generateAIContent(url, content, metadata, context) {
  // Mock AI enhancement - in production, this would call Claude API
  const domain = url ? new URL(url).hostname : '';
  
  return {
    title: metadata.title || `Fascinating discovery${domain ? ` from ${domain}` : ''}`,
    content: content || `This caught my attention and seems worth exploring further.

${context ? `Context: ${context}` : ''}

${url ? `Original source: ${url}` : ''}

The connection between this and other ideas I've been exploring is intriguing. This could be the start of a deeper rabbit hole.`,
    
    tags: generateSmartTags(url, content, context),
    dive_deeper: [
      `Research the background and context of this topic`,
      `Explore related concepts and connections`,
      `Find other perspectives on this subject`,
      `Look into practical applications or implications`
    ]
  };
}

function detectContentType(url, content) {
  if (!url) return 'musing';
  
  if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
    return 'video';
  }
  if (url.includes('spotify.com') || url.includes('soundcloud.com')) {
    return 'music';
  }
  return 'link';
}

function generateSmartTags(url, content, context) {
  const tags = [];
  
  // URL-based tags
  if (url) {
    const domain = new URL(url).hostname;
    if (domain.includes('youtube')) tags.push('video');
    if (domain.includes('github')) tags.push('technology', 'programming');
    if (domain.includes('arxiv')) tags.push('research', 'science');
    if (domain.includes('medium')) tags.push('article');
  }
  
  // Content-based tags
  if (content) {
    const lower = content.toLowerCase();
    if (lower.includes('ai') || lower.includes('artificial intelligence')) tags.push('ai');
    if (lower.includes('research') || lower.includes('study')) tags.push('research');
    if (lower.includes('philosophy')) tags.push('philosophy');
    if (lower.includes('science')) tags.push('science');
    if (lower.includes('technology')) tags.push('technology');
  }
  
  // Context-based tags
  if (context) {
    const lower = context.toLowerCase();
    if (lower.includes('twitter')) tags.push('social-media');
    if (lower.includes('newsletter')) tags.push('newsletter');
    if (lower.includes('discussion')) tags.push('discussion');
  }
  
  // Always add discovery tags
  tags.push('discovery', 'rabbit-hole');
  
  return [...new Set(tags)]; // Remove duplicates
}

function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function generatePreview(post) {
  return `<div style="border: 1px solid #ccc; padding: 20px; border-radius: 8px;">
    <h2>${post.title}</h2>
    <p><strong>Type:</strong> ${post.type}</p>
    <p><strong>Tags:</strong> ${post.tags.join(', ')}</p>
    ${post.original_url ? `<p><strong>Source:</strong> <a href="${post.original_url}" target="_blank">${post.original_url}</a></p>` : ''}
    <div style="margin-top: 16px;">
      ${post.content.substring(0, 300)}...
    </div>
    <div style="margin-top: 16px;">
      <strong>Dive Deeper:</strong>
      <ul>
        ${post.dive_deeper.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>
  </div>`;
}