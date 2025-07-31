// Automatic link detection and embed processing
// Converts standalone links in markdown to proper embeds

interface LinkMatch {
  url: string;
  type: 'youtube' | 'vimeo' | 'twitter' | 'codepen' | 'spotify' | 'generic';
  start: number;
  end: number;
  lineStart: number;
  lineEnd: number;
}

export function processContentLinks(content: string): string {
  // Split content into lines for processing
  const lines = content.split('\n');
  const processedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if line contains only a URL (standalone link)
    const urlMatch = line.match(/^https?:\/\/[^\s]+$/);
    
    if (urlMatch) {
      const url = urlMatch[0];
      const linkType = detectLinkType(url);
      
      // Convert to appropriate embed component
      const embedCode = generateEmbedCode(url, linkType);
      processedLines.push(embedCode);
    } else {
      processedLines.push(lines[i]);
    }
  }
  
  return processedLines.join('\n');
}

function detectLinkType(url: string): LinkMatch['type'] {
  const hostname = new URL(url).hostname.toLowerCase();
  
  // YouTube detection
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    return 'youtube';
  }
  
  // Vimeo detection
  if (hostname.includes('vimeo.com')) {
    return 'vimeo';
  }
  
  // Twitter/X detection
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    return 'twitter';
  }
  
  // CodePen detection
  if (hostname.includes('codepen.io')) {
    return 'codepen';
  }
  
  // Spotify detection
  if (hostname.includes('spotify.com')) {
    return 'spotify';
  }
  
  return 'generic';
}

function generateEmbedCode(url: string, type: LinkMatch['type']): string {
  const baseImport = `<div class="embed-container">`;
  const endDiv = `</div>`;
  
  switch (type) {
    case 'youtube':
      const youtubeId = extractYouTubeId(url);
      if (!youtubeId) return createLinkPreview(url);
      
      return `${baseImport}
<YouTubeEmbed videoId="${youtubeId}" title="YouTube Video" />
${endDiv}`;
      
    case 'vimeo':
      const vimeoId = extractVimeoId(url);
      if (!vimeoId) return createLinkPreview(url);
      
      return `${baseImport}
<VimeoEmbed videoId="${vimeoId}" title="Vimeo Video" />
${endDiv}`;
      
    case 'twitter':
      return `${baseImport}
<TwitterEmbed url="${url}" />
${endDiv}`;
      
    case 'codepen':
      const codepenId = extractCodePenId(url);
      if (!codepenId) return createLinkPreview(url);
      
      return `${baseImport}
<CodePenEmbed penId="${codepenId}" title="CodePen" />
${endDiv}`;
      
    case 'spotify':
      return `${baseImport}
<SpotifyEmbed url="${url}" />
${endDiv}`;
      
    default:
      return createLinkPreview(url);
  }
}

function createLinkPreview(url: string): string {
  return `<div class="embed-container">
<LinkPreviewDynamic url="${url}" />
</div>`;
}

// Helper functions to extract IDs from URLs
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
  return match ? match[1] : null;
}

function extractCodePenId(url: string): string | null {
  const match = url.match(/codepen\.io\/[^\/]+\/pen\/([^\/\?]+)/);
  return match ? match[1] : null;
}

// Process content during build time
export function processMarkdownContent(content: string): string {
  // First process standalone links
  let processedContent = processContentLinks(content);
  
  // Add any other content processing here
  // (e.g., custom shortcodes, enhanced formatting)
  
  return processedContent;
}

// Regex patterns for different link types
export const LINK_PATTERNS = {
  youtube: /^https?:\/\/(?:www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
  vimeo: /^https?:\/\/(?:www\.)?vimeo\.com\/(\d+)/,
  twitter: /^https?:\/\/(?:www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/,
  codepen: /^https?:\/\/codepen\.io\/[^\/]+\/pen\/([^\/\?]+)/,
  spotify: /^https?:\/\/open\.spotify\.com\/(track|album|playlist)\/[^\/\?]+/,
  generic: /^https?:\/\/[^\s]+$/
};