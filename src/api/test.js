// Simple test function to verify Cloudflare Functions are working
export async function onRequest(context) {
  return new Response(JSON.stringify({
    message: "Cloudflare Functions are working!",
    timestamp: new Date().toISOString(),
    method: context.request.method,
    url: context.request.url
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}