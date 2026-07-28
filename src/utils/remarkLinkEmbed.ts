// Remark plugin for automatic link embedding
// This processes markdown during build time to convert standalone links to embeds

import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Text, Link, Html } from 'mdast';

interface EmbedInfo {
  type: 'youtube' | 'vimeo' | 'twitter' | 'codepen' | 'spotify' | 'generic';
  id?: string;
  url: string;
}

export function remarkLinkEmbed() {
  return (tree: Root) => {
    const replacements: Array<{ parent: { children: unknown[] }; index: number; node: Html }> = [];

    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      let url: string | null = null;

      // Case 1: Paragraph with a single text node containing a URL
      if (node.children.length === 1 && node.children[0].type === 'text') {
        const textNode = node.children[0] as Text;
        const text = textNode.value.trim();
        const urlMatch = text.match(/^https?:\/\/[^\s]+$/);
        if (urlMatch) {
          url = urlMatch[0];
        }
      }

      // Case 2: Paragraph with a single link node (markdown link on its own line)
      if (node.children.length === 1 && node.children[0].type === 'link') {
        const linkNode = node.children[0] as Link;
        url = linkNode.url;
      }

      // Case 3: Paragraph with link + optional whitespace text nodes
      // Handles cases like: [url](url)\n or similar
      if (!url && node.children.length <= 3) {
        const nonWhitespaceChildren = node.children.filter((child) => {
          if (child.type === 'text') {
            return (child as Text).value.trim() !== '';
          }
          return true;
        });

        if (nonWhitespaceChildren.length === 1 && nonWhitespaceChildren[0].type === 'link') {
          const linkNode = nonWhitespaceChildren[0] as Link;
          url = linkNode.url;
        }
      }

      // If we found an embeddable URL, replace the paragraph
      if (url) {
        const embedInfo = detectEmbedType(url);
        const embedNode = createEmbedNode(embedInfo);

        if (parent && typeof index === 'number') {
          replacements.push({
            parent: parent as { children: unknown[] },
            index,
            node: embedNode,
          });
        }
      }
    });

    for (const replacement of replacements) {
      replacement.parent.children[replacement.index] = replacement.node;
    }
  };
}

function detectEmbedType(url: string): EmbedInfo {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // YouTube
    if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtu.be') {
      const id = extractYouTubeId(url);
      return { type: 'youtube', id, url };
    }
    
    // Vimeo
    if (hostname === 'vimeo.com' || hostname.endsWith('.vimeo.com')) {
      const id = extractVimeoId(url);
      return { type: 'vimeo', id, url };
    }
    
    // Twitter/X
    if (
      (hostname === 'twitter.com' || hostname.endsWith('.twitter.com') ||
        hostname === 'x.com' || hostname.endsWith('.x.com')) &&
      /\/(?:i\/)?status\/\d+/.test(urlObj.pathname)
    ) {
      return { type: 'twitter', url };
    }
    
    // CodePen
    if (hostname === 'codepen.io' || hostname.endsWith('.codepen.io')) {
      const id = extractCodePenId(url);
      return { type: 'codepen', id, url };
    }
    
    // Spotify
    if (hostname === 'spotify.com' || hostname.endsWith('.spotify.com')) {
      return { type: 'spotify', url };
    }
    
    return { type: 'generic', url };
  } catch {
    return { type: 'generic', url };
  }
}

function createEmbedNode(embedInfo: EmbedInfo): Html {
  // Create a custom directive node that will be processed by Astro
  return {
    type: 'html',
    value: generateEmbedHTML(embedInfo)
  };
}

function generateEmbedHTML(embedInfo: EmbedInfo): string {
  const safeUrl = escapeAttribute(embedInfo.url);

  // Generate the actual embed HTML inline
  switch (embedInfo.type) {
    case 'youtube':
      if (embedInfo.id) {
        return `<div class="youtube-embed" style="margin: 2rem 0; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
          <iframe 
            src="https://www.youtube.com/embed/${embedInfo.id}?rel=0" 
            title="Embedded YouTube video"
            frameborder="0" 
            allowfullscreen
            loading="lazy"
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 8px;"
          ></iframe>
        </div>`;
      }
      break;
    case 'vimeo':
      if (embedInfo.id) {
        return `<div class="vimeo-embed" style="margin: 2rem 0; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
          <iframe 
            src="https://player.vimeo.com/video/${embedInfo.id}" 
            title="Embedded Vimeo video"
            frameborder="0" 
            allowfullscreen
            loading="lazy"
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 8px;"
          ></iframe>
        </div>`;
      }
      break;
    case 'twitter':
      return `<div class="twitter-embed" data-tweet-embed>
        <blockquote class="twitter-tweet" data-dnt="true">
          <a href="${safeUrl}">View this post on X</a>
        </blockquote>
      </div>`;
    case 'spotify':
      // Handle various Spotify URL formats
      const spotifyPatterns = [
        /(?:open\.)?spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/,
        /spotify:(track|album|playlist|episode|show):([a-zA-Z0-9]+)/
      ];
      
      for (const pattern of spotifyPatterns) {
        const spotifyMatch = embedInfo.url.match(pattern);
        if (spotifyMatch) {
          const [, type, id] = spotifyMatch;
          const height = type === 'track' || type === 'episode' ? '152' : '380';
          return `<div class="spotify-embed" style="margin: 2rem 0;">
            <iframe 
              src="https://open.spotify.com/embed/${type}/${id}?utm_source=generator" 
              width="100%" 
              height="${height}" 
              frameborder="0" 
              allowfullscreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style="border-radius: 12px;"
            ></iframe>
          </div>`;
        }
      }
      break;
    case 'codepen':
      if (embedInfo.id) {
        const userMatch = embedInfo.url.match(/codepen\.io\/([^\/]+)\/pen/);
        const user = userMatch ? userMatch[1] : 'anon';
        return `<div class="codepen-embed" style="margin: 2rem 0;">
          <iframe 
            height="400" 
            style="width: 100%;" 
            scrolling="no" 
            title="CodePen Embed" 
            src="https://codepen.io/${user}/embed/${embedInfo.id}?default-tab=result" 
            frameborder="no" 
            loading="lazy" 
            allowtransparency="true" 
            allowfullscreen="true"
          ></iframe>
        </div>`;
      }
      break;
  }
  
  return createLinkPreviewHTML(embedInfo.url);
}

// Helper functions
function escapeAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function readablePath(url: URL): string {
  const lastPart = url.pathname.split('/').filter(Boolean).at(-1);
  if (!lastPart) return url.hostname.replace(/^www\./, '');

  try {
    return decodeURIComponent(lastPart)
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  } catch {
    return url.hostname.replace(/^www\./, '');
  }
}

function createLinkPreviewHTML(url: string): string {
  const parsed = new URL(url);
  const domain = parsed.hostname.replace(/^www\./, '');
  const safeUrl = escapeAttribute(url);
  const safeDomain = escapeAttribute(domain);
  const fallbackTitle = escapeAttribute(readablePath(parsed));

  return `<aside class="link-preview" data-link-preview data-preview-url="${safeUrl}">
    <a href="${safeUrl}" target="_blank" rel="noopener noreferrer">
      <span class="link-preview-copy">
        <span class="link-preview-domain">${safeDomain}</span>
        <strong data-preview-title>${fallbackTitle}</strong>
        <span class="link-preview-description" data-preview-description hidden></span>
      </span>
      <span class="link-preview-image" data-preview-image hidden><img alt="" loading="lazy" decoding="async"></span>
      <span class="link-preview-arrow" aria-hidden="true">↗</span>
    </a>
  </aside>`;
}

function extractYouTubeId(url: string): string | undefined {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return undefined;
}

function extractVimeoId(url: string): string | undefined {
  const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
  return match ? match[1] : undefined;
}

function extractCodePenId(url: string): string | undefined {
  const match = url.match(/codepen\.io\/[^\/]+\/pen\/([^\/\?]+)/);
  return match ? match[1] : undefined;
}
