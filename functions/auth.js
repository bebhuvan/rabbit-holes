// CMS Authentication Function
export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    const { password } = await request.json();
    
    // Get password from environment variable with fallback
    const correctPassword = env.CMS_PASSWORD || 'rabbit-holes-cms-2024';
    
    if (password === correctPassword) {
      // Create a simple session token (in production, use JWT or similar)
      const sessionToken = btoa(`${Date.now()}-${Math.random()}`);
      
      return new Response(JSON.stringify({
        success: true,
        sessionToken,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Set-Cookie': `cms_session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
        }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid password'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Authentication failed'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}