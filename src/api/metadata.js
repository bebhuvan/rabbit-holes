// Simple metadata fetching for link previews
export async function onRequest(context) {
  const { request } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    const { url } = await request.json();
    
    if (!url) {
      return new Response('URL is required', { status: 400 });
    }
    
    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RabbitHolesBlog/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract metadata using basic regex (simple approach)
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
      title: 'Link Preview',
      description: 'Unable to fetch preview',
      image: null,
      url: url
    };
    
    return new Response(JSON.stringify(fallbackMetadata), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}