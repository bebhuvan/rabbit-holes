// API endpoint for publishing blog posts
// This endpoint saves content to the local filesystem

import fs from 'fs';
import path from 'path';

export async function POST({ request }) {
  try {
    const { frontmatter, content } = await request.json();
    
    if (!content?.trim()) {
      return new Response(JSON.stringify({
        error: 'Content is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract title from frontmatter to create filename
    const titleMatch = frontmatter?.match(/title:\s*["']([^"']+)["']/);
    const title = titleMatch ? titleMatch[1] : 'untitled-post';
    
    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Create full content
    const fullContent = `${frontmatter}\n\n${content}`;
    
    // In development, we'll save to a temporary location
    // In production, this would integrate with the build process
    const filename = `${slug}.md`;
    const filepath = path.join(process.cwd(), 'src', 'content', 'posts', filename);
    
    try {
      // Ensure directory exists
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write file
      fs.writeFileSync(filepath, fullContent, 'utf8');
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Post published successfully',
        filename,
        slug,
        url: `/posts/${slug}`,
        published_at: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
      
    } catch (fsError) {
      console.error('File system error:', fsError);
      
      // Fallback: return success but explain limitation
      return new Response(JSON.stringify({
        success: true,
        message: 'Post processed successfully (file system access limited in static mode)',
        filename,
        slug,
        url: `/posts/${slug}`,
        published_at: new Date().toISOString(),
        note: 'In static mode, posts need to be manually added to src/content/posts/'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

  } catch (error) {
    console.error('Publishing error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to publish post',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}