const MAX_HTML_BYTES = 750_000;
const REQUEST_TIMEOUT_MS = 5_000;

function validatePreviewUrl(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Unsupported URL');
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    throw new Error('Private host');
  }

  const ipv4 = hostname.split('.').map(Number);
  if (
    ipv4.length === 4 &&
    ipv4.every((part) => Number.isInteger(part) && part >= 0 && part <= 255)
  ) {
    const [a, b] = ipv4;
    if (
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19))
    ) {
      throw new Error('Private address');
    }
  }

  if (
    hostname === '::' ||
    hostname === '::1' ||
    hostname.startsWith('fc') ||
    hostname.startsWith('fd') ||
    hostname.startsWith('fe8') ||
    hostname.startsWith('fe9') ||
    hostname.startsWith('fea') ||
    hostname.startsWith('feb')
  ) {
    throw new Error('Private address');
  }

  return url;
}

async function readLimitedText(response) {
  const declaredSize = Number(response.headers.get('content-length') || 0);
  if (declaredSize > MAX_HTML_BYTES) throw new Error('Page is too large');
  if (!response.body) return '';

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let html = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_HTML_BYTES) {
      await reader.cancel();
      throw new Error('Page is too large');
    }
    html += decoder.decode(value, { stream: true });
  }

  return html + decoder.decode();
}

function decodeEntities(value = '') {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };

  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (entity, name) => named[name.toLowerCase()] || entity)
    .replace(/\s+/g, ' ')
    .trim();
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
  return match ? decodeEntities(match[1] ?? match[2]) : '';
}

function metaContent(html, keys) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const key = (attribute(tag, 'property') || attribute(tag, 'name')).toLowerCase();
    if (keys.includes(key)) return attribute(tag, 'content');
  }
  return '';
}

function extractMetadata(html, url) {
  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = metaContent(html, ['og:title', 'twitter:title']) ||
    decodeEntities(titleTag?.[1]?.replace(/<[^>]+>/g, '')) ||
    url.hostname.replace(/^www\./, '');
  const description = metaContent(html, [
    'og:description',
    'twitter:description',
    'description',
  ]);
  const image = metaContent(html, ['og:image', 'twitter:image']);

  return {
    title,
    description,
    image: image ? new URL(image, url).href : null,
    url: url.href,
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}

async function metadataResponse(request) {
  let previewUrl;
  try {
    const requestedUrl = request.method === 'GET'
      ? new URL(request.url).searchParams.get('url')
      : (await request.json()).url;
    if (!requestedUrl) return json({ error: 'URL is required' }, 400);
    previewUrl = validatePreviewUrl(requestedUrl);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response;
    try {
      response = await fetch(previewUrl, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml',
          'User-Agent': 'Mozilla/5.0 (compatible; RabbitHolesLinkPreview/1.0)',
        },
        redirect: 'follow',
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
    const contentType = response.headers.get('content-type')?.toLowerCase() || '';
    if (contentType && !contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      throw new Error('URL is not an HTML page');
    }

    return json(extractMetadata(await readLimitedText(response), previewUrl));
  } catch (error) {
    const fallback = previewUrl
      ? {
          title: previewUrl.hostname.replace(/^www\./, ''),
          description: '',
          image: null,
          url: previewUrl.href,
        }
      : { error: 'Preview unavailable' };
    return json(fallback, previewUrl ? 200 : 400);
  }
}

export async function GET({ request }) {
  return metadataResponse(request);
}

export async function POST({ request }) {
  return metadataResponse(request);
}
