/**
 * Cloudflare Workers entry point for Rabbit Holes blog
 * Handles static assets and API routes
 */

// Import API handlers (converted from functions/)
import { handleAuth } from './api/auth.js';
import { handleEnhance } from './api/enhance.js';
import { handleMetadata } from './api/metadata.js';
import { handlePublish } from './api/publish.js';
import { handleRefine } from './api/refine.js';
import { handleTestSimple } from './api/test-simple.js';
import { handleTest } from './api/test.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle API routes
    if (url.pathname.startsWith('/api/') || isAPIRoute(url.pathname)) {
      return handleAPIRoute(request, env, ctx);
    }
    
    // Serve static assets
    return handleStaticAssets(request, env);
  },
};

/**
 * Check if the pathname is an API route
 */
function isAPIRoute(pathname) {
  const apiRoutes = [
    '/auth',
    '/enhance', 
    '/metadata',
    '/publish',
    '/refine',
    '/test-simple',
    '/test'
  ];
  
  return apiRoutes.some(route => pathname.startsWith(route));
}

/**
 * Handle API routing
 */
async function handleAPIRoute(request, env, ctx) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace('/api', ''); // Remove /api prefix if present
  
  try {
    switch (pathname) {
      case '/auth':
        return await handleAuth(request, env, ctx);
      case '/enhance':
        return await handleEnhance(request, env, ctx);
      case '/metadata':
        return await handleMetadata(request, env, ctx);
      case '/publish':
        return await handlePublish(request, env, ctx);
      case '/refine':
        return await handleRefine(request, env, ctx);
      case '/test-simple':
        return await handleTestSimple(request, env, ctx);
      case '/test':
        return await handleTest(request, env, ctx);
      default:
        return new Response('API endpoint not found', { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain'
          }
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

/**
 * Handle static assets using Workers Static Assets
 */
async function handleStaticAssets(request, env) {
  try {
    // Use the ASSETS binding to serve static files
    const response = await env.ASSETS.fetch(request);
    
    if (response.status === 404) {
      // Try to serve index.html for SPA-style routing
      const indexRequest = new Request(
        new URL('/index.html', request.url).toString(),
        request
      );
      const indexResponse = await env.ASSETS.fetch(indexRequest);
      
      if (indexResponse.ok) {
        return new Response(indexResponse.body, {
          ...indexResponse,
          headers: {
            ...indexResponse.headers,
            'Content-Type': 'text/html'
          }
        });
      }
    }
    
    // Add security headers
    const headers = new Headers(response.headers);
    addSecurityHeaders(headers, request.url);
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch (error) {
    console.error('Static asset error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

/**
 * Add security headers based on the original wrangler.toml configuration
 */
function addSecurityHeaders(headers, url) {
  const pathname = new URL(url).pathname;
  
  // Global security headers
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Cache headers for static assets
  if (pathname.startsWith('/assets/') || 
      pathname.endsWith('.css') || 
      pathname.endsWith('.js')) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // Enhanced security for CMS
  if (pathname.startsWith('/cms')) {
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Content-Security-Policy', 
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.anthropic.com; frame-ancestors 'none'"
    );
  }
}