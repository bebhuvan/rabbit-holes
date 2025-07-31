// Remark plugin for automatic link embedding
// This processes markdown during build time to convert standalone links to embeds

import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Text } from 'mdast';

interface EmbedInfo {
  type: 'youtube' | 'vimeo' | 'twitter' | 'codepen' | 'spotify' | 'generic';
  id?: string;
  url: string;
}

export function remarkLinkEmbed() {
  return (tree: Root) => {
    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      // Check if paragraph contains only a single text node with a URL
      if (node.children.length === 1 && node.children[0].type === 'text') {
        const textNode = node.children[0] as Text;
        const text = textNode.value.trim();
        
        // Check if it's a standalone URL
        const urlMatch = text.match(/^https?:\/\/[^\s]+$/);
        
        if (urlMatch) {
          const url = urlMatch[0];
          const embedInfo = detectEmbedType(url);
          
          // Replace the paragraph with an embed directive
          const embedNode = createEmbedNode(embedInfo);
          
          if (parent && typeof index === 'number') {
            parent.children[index] = embedNode;
          }
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

function createEmbedNode(embedInfo: EmbedInfo) {
  // Create a custom directive node that will be processed by Astro
  return {
    type: 'html',
    value: generateEmbedHTML(embedInfo)
  };
}

function generateEmbedHTML(embedInfo: EmbedInfo): string {
  // Store embed info as data attributes for post-processing
  const embedData = JSON.stringify(embedInfo).replace(/"/g, '&quot;');
  return `<div class="auto-embed" data-embed='${embedData}'>${embedInfo.url}</div>`;
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