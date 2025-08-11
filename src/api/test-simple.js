// Simple API test endpoint
export async function handleTestSimple(request, env, ctx) {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    return new Response(JSON.stringify({
      success: true,
      message: 'Workers API is working correctly!',
      timestamp: new Date().toISOString(),
      environment: env.ENVIRONMENT || 'development'
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