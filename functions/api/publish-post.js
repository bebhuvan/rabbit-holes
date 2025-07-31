// AI dashboard publish endpoint - integrates with existing publish.js
// This function handles publishing from the /xyz dashboard

export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    const { content, title, tags, type, url, description } = await request.json();
    
    if (!content || !content.trim()) {
      return new Response('Content is required', { status: 400 });
    }
    
    // Clean inputs
    const cleanContent = content.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
    
    // Extract title from content if not provided
    let finalTitle = title;
    if (!finalTitle) {
      const titleMatch = cleanContent.match(/^# (.+)$/m);
      finalTitle = titleMatch ? titleMatch[1] : 'New Post from AI Dashboard';
    }
    
    // Clean title
    const cleanTitle = finalTitle.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
    
    // Determine post type
    const postType = type || (url ? 'link' : 'musing');
    
    // Generate tags if not provided
    let finalTags = tags || [];
    if (!Array.isArray(finalTags) || finalTags.length === 0) {
      finalTags = generateTagsFromContent(cleanContent);
    }
    
    // Generate description if not provided
    let finalDescription = description;
    if (!finalDescription) {
      finalDescription = generateDescriptionFromContent(cleanContent);
    }
    
    // Generate slug from title
    const slug = cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Create frontmatter object
    const frontmatter = {
      title: cleanTitle,
      date: new Date(),
      type: postType,
      published: true, // Auto-publish from dashboard
      tags: finalTags,
      description: finalDescription
    };
    
    // Add URL if it's a link post
    if (url && url.trim()) {
      frontmatter.url = url.trim();
    }
    
    // Create full markdown content with frontmatter
    const markdownContent = `---\n${Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}:\n${value.map(item => `  - "${item}"`).join('\n')}`;
        }
        if (value instanceof Date) {
          return `${key}: ${value.toISOString()}`;
        }
        if (typeof value === 'string') {
          return `${key}: "${value}"`; 
        }
        return `${key}: ${value}`;
      })
      .join('\n')}\n---\n\n${cleanContent}`;
    
    // Check if GitHub integration is available
    if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
      return new Response(JSON.stringify({
        error: 'GitHub integration not configured',
        details: 'GITHUB_TOKEN and GITHUB_REPO environment variables are required'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if file already exists
    const checkResponse = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/contents/src/content/posts/${slug}.md`,
      {
        method: 'GET',
        headers: {
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'User-Agent': 'Bhuvan-Blog-CMS'
        }
      }
    );
    
    let sha = null;
    let commitMessage = `Add new post: ${cleanTitle}`;
    
    if (checkResponse.ok) {
      // File exists, we need the SHA for updating
      const existingFile = await checkResponse.json();
      sha = existingFile.sha;
      commitMessage = `Update post: ${cleanTitle}`;
    }
    
    // Prepare GitHub API request body
    const githubRequestBody = {
      message: commitMessage,
      content: btoa(unescape(encodeURIComponent(markdownContent))),
      branch: 'master'
    };
    
    // Add SHA if updating existing file
    if (sha) {
      githubRequestBody.sha = sha;
    }
    
    // Publish to GitHub
    const githubResponse = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/contents/src/content/posts/${slug}.md`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Bhuvan-Blog-CMS'
        },
        body: JSON.stringify(githubRequestBody)
      }
    );
    
    if (!githubResponse.ok) {
      const error = await githubResponse.text();
      throw new Error(`GitHub API error: ${githubResponse.status} - ${error}`);
    }
    
    const githubData = await githubResponse.json();
    
    return new Response(JSON.stringify({
      success: true,
      message: sha ? 'Post updated successfully' : 'Post published successfully',
      slug,
      title: cleanTitle,
      type: postType,
      tags: finalTags,
      github_url: githubData.content.html_url,
      published_at: new Date().toISOString(),
      action: sha ? 'updated' : 'created'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('Publish post error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to publish post',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function generateTagsFromContent(content) {
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
  
  // Extract meaningful words
  const words = content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 4 && !commonWords.has(word));
  
  // Count word frequency
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Get top words as potential tags
  const topWords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([word]) => word);
  
  // Add contextual tags based on content
  const contextTags = [];
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('technology') || lowerContent.includes('tech') || lowerContent.includes('software')) {
    contextTags.push('technology');
  }
  if (lowerContent.includes('philosophy') || lowerContent.includes('thinking') || lowerContent.includes('thoughts')) {
    contextTags.push('philosophy');
  }
  if (lowerContent.includes('science') || lowerContent.includes('research') || lowerContent.includes('study')) {
    contextTags.push('science');
  }
  if (lowerContent.includes('culture') || lowerContent.includes('society') || lowerContent.includes('social')) {
    contextTags.push('culture');
  }
  if (lowerContent.includes('business') || lowerContent.includes('work') || lowerContent.includes('career')) {
    contextTags.push('business');
  }
  
  // Combine and deduplicate
  const allTags = [...new Set([...contextTags, ...topWords])].slice(0, 4);
  
  return allTags.length > 0 ? allTags : ['thoughts', 'exploration'];
}

function generateDescriptionFromContent(content) {
  // Remove frontmatter if present
  const cleanContent = content.replace(/^---[\s\S]*?---\n/, '');
  
  // Find first substantial paragraph (not just a heading)
  const paragraphs = cleanContent
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p && !p.startsWith('#') && p.length > 20);
  
  if (paragraphs.length === 0) {
    return 'A thoughtful exploration of ideas and insights.';
  }
  
  let description = paragraphs[0]
    .replace(/[#*`]/g, '') // Remove markdown
    .replace(/\[[^\]]*\]\([^)]*\)/g, '') // Remove links
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Truncate if too long
  if (description.length > 160) {
    // Try to break at a sentence boundary
    const sentences = description.split('. ');
    let result = sentences[0];
    
    for (let i = 1; i < sentences.length; i++) {
      if ((result + '. ' + sentences[i]).length <= 157) {
        result += '. ' + sentences[i];
      } else {
        break;
      }
    }
    
    description = result.endsWith('.') ? result : result + '...';
    
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    }
  }
  
  return description || 'A thoughtful exploration of ideas and insights.';
}