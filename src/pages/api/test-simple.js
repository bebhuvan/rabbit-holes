// Simple API test endpoint for Astro + Cloudflare
export async function GET() {
  try {
    return new Response(JSON.stringify({
      success: true,
      message: 'Astro + Cloudflare Workers API is working correctly!',
      timestamp: new Date().toISOString(),
      adapter: 'astro-cloudflare'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}