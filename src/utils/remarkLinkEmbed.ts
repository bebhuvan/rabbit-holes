// Remark plugin for automatic link embedding
// This processes markdown during build time to convert standalone links to embeds

import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Text, Link, Html } from 'mdast';

interface EmbedInfo {
  type: 'youtube' | 'vimeo' | 'twitter' | 'codepen' | 'spotify' | 'generic';
  id?: string;
  url: string;
}

// Check if a URL is embeddable (not generic)
function isEmbeddableUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return (
      hostname.includes('youtube.com') ||
      hostname.includes('youtu.be') ||
      hostname.includes('vimeo.com') ||
      hostname.includes('twitter.com') ||
      hostname.includes('x.com') ||
      hostname.includes('codepen.io') ||
      hostname.includes('spotify.com')
    );
  } catch {
    return false;
  }
}

export function remarkLinkEmbed() {
  return (tree: Root) => {
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
        // Only embed if it's an embeddable service
        if (isEmbeddableUrl(linkNode.url)) {
          url = linkNode.url;
        }
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
          if (isEmbeddableUrl(linkNode.url)) {
            url = linkNode.url;
          }
        }
      }

      // If we found an embeddable URL, replace the paragraph
      if (url) {
        const embedInfo = detectEmbedType(url);
        const embedNode = createEmbedNode(embedInfo);

        if (parent && typeof index === 'number') {
          parent.children[index] = embedNode;
        }
      }
    });
  };
}

function detectEmbedType(url: string): EmbedInfo {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // YouTube
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      const id = extractYouTubeId(url);
      return { type: 'youtube', id, url };
    }
    
    // Vimeo
    if (hostname.includes('vimeo.com')) {
      const id = extractVimeoId(url);
      return { type: 'vimeo', id, url };
    }
    
    // Twitter/X
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return { type: 'twitter', url };
    }
    
    // CodePen
    if (hostname.includes('codepen.io')) {
      const id = extractCodePenId(url);
      return { type: 'codepen', id, url };
    }
    
    // Spotify
    if (hostname.includes('spotify.com')) {
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
  // Generate the actual embed HTML inline
  switch (embedInfo.type) {
    case 'youtube':
      if (embedInfo.id) {
        return `<div class="youtube-embed" style="margin: 2rem 0; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
          <iframe 
            src="https://www.youtube.com/embed/${embedInfo.id}?rel=0" 
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
            frameborder="0" 
            allowfullscreen
            loading="lazy"
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 8px;"
          ></iframe>
        </div>`;
      }
      break;
    case 'twitter':
      return `<div class="twitter-embed" style="margin: 2rem 0;">
        <blockquote class="twitter-tweet" data-theme="light">
          <a href="${embedInfo.url}">Loading tweet...</a>
        </blockquote>
      </div>
      <script>
        if (typeof window !== 'undefined' && !window.twttr) {
          window.twttr = (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0],
              t = window.twttr || {};
            if (d.getElementById(id)) return t;
            js = d.createElement(s);
            js.id = id;
            js.src = "https://platform.twitter.com/widgets.js";
            fjs.parentNode.insertBefore(js, fjs);
            t._e = [];
            t.ready = function(f) {
              t._e.push(f);
            };
            return t;
          }(document, "script", "twitter-wjs"));
        } else if (window.twttr && window.twttr.widgets) {
          window.twttr.widgets.load();
        }
      </script>`;
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
  
  // For generic embeds, render as a link preview
  return `<div class="link-preview-placeholder" data-url="${embedInfo.url}" style="margin: 2rem 0; padding: 1rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: 8px;">
    <a href="${embedInfo.url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit;">
      <div style="font-weight: 600; margin-bottom: 0.5rem;">🔗 ${embedInfo.url}</div>
      <div style="font-size: 0.9em; color: var(--color-text-secondary, #666);">Loading preview...</div>
    </a>
  </div>`;
}

function createLinkPreviewHTML(url: string): string {
  return `<LinkPreviewDynamic url="${url}" />`;
}

// Helper functions
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