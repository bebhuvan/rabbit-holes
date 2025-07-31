// Security middleware for all API routes
// Provides rate limiting, CORS, and input validation

export async function onRequest(context) {
  const { request, env, next } = context;
  
  // Rate limiting check
  const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rateLimitKey = `rate_limit:${clientIP}`;
  
  // Check if rate limit exists in KV (if available)
  if (env.RATE_LIMIT_KV) {
    const currentCount = await env.RATE_LIMIT_KV.get(rateLimitKey);
    const limit = 10; // 10 requests per minute
    
    if (currentCount && parseInt(currentCount) >= limit) {
      return new Response('Rate limit exceeded. Please try again later.', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0'
        }
      });
    }
    
    // Increment counter
    await env.RATE_LIMIT_KV.put(rateLimitKey, (parseInt(currentCount || 0) + 1).toString(), {
      expirationTtl: 60 // 1 minute
    });
  }
  
  // CORS headers - restrict to your domain in production
  const origin = request.headers.get('Origin');
  const allowedOrigins = env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',') : ['http://localhost:4321', 'http://localhost:4322'];
  const corsHeaders = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
  
  // Only allow specific origins
  if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost'))) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
  }
  
  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  // Add security headers
  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
  
  // Process request
  try {
    const response = await next();
    
    // Add headers to response
    const newHeaders = new Headers(response.headers);
    Object.entries({ ...corsHeaders, ...securityHeaders }).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
    
  } catch (error) {
    console.error('Middleware error:', error);
    
    // Don't expose internal errors
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again.',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}