import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  // Add cache headers for edge caching
  const url = new URL(context.request.url);

  // Static assets (already cached by Cloudflare)
  if (url.pathname.startsWith('/_astro/') || url.pathname.startsWith('/images/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return response;
  }

  // HTML pages - cache at edge for 1 hour, stale-while-revalidate for 1 day
  if (response.headers.get('content-type')?.includes('text/html')) {
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');
    response.headers.set('CDN-Cache-Control', 'max-age=86400');
    response.headers.set('Cloudflare-CDN-Cache-Control', 'max-age=86400');
  }

  // RSS/XML feeds
  if (url.pathname.endsWith('.xml')) {
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  }

  return response;
});
