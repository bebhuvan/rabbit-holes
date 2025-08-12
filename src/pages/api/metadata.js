// API route for metadata fetching
export async function POST({ request }) {
  let url = '';
  
  try {
    const body = await request.json();
    url = body.url;
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Fetch the page with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RabbitHolesBlog/1.0)'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract metadata using basic regex
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
    const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                       html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);
    
    // Make image URL absolute if it's relative
    let imageUrl = imageMatch ? imageMatch[1].trim() : null;
    if (imageUrl && !imageUrl.startsWith('http')) {
      try {
        const baseUrl = new URL(url);
        imageUrl = new URL(imageUrl, baseUrl).href;
      } catch (e) {
        // Keep as is if URL construction fails
      }
    }
    
    const metadata = {
      title: titleMatch ? titleMatch[1].trim() : new URL(url).hostname,
      description: descMatch ? descMatch[1].trim() : '',
      image: imageUrl,
      url: url
    };
    
    return new Response(JSON.stringify(metadata), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('Metadata fetch error:', error);
    
    // Return basic fallback metadata
    const fallbackMetadata = {
      title: url ? new URL(url).hostname : 'Link Preview',
      description: 'Unable to fetch preview',
      image: null,
      url: url
    };
    
    return new Response(JSON.stringify(fallbackMetadata), {
      status: 200, // Return 200 even on error for fallback
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}