// URL metadata extraction API endpoint
// Fetches Open Graph, Twitter Cards, and other metadata from URLs

export async function GET({ url }) {
  // For now, return sample metadata for testing
  const sampleUrl = 'https://github.com/anthropics/claude';
  const metadata = await generateMockMetadata(new URL(sampleUrl));
  
  return new Response(JSON.stringify(metadata), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function POST({ request }) {
  // For testing, return mock metadata for GitHub
  const metadata = await generateMockMetadata(new URL('https://github.com/anthropics/claude'));
  
  return new Response(JSON.stringify(metadata), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

// Fetch real metadata from URL
async function fetchRealMetadata(url) {
  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; RabbitHoleBot/1.0; +https://rabbitholes.dev)'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const html = await response.text();
  
  // Extract Open Graph and Twitter Card metadata
  const metadata = {};
  
  // Title
  const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/i);
  const twitterTitle = html.match(/<meta name="twitter:title" content="([^"]+)"/i);
  const titleTag = html.match(/<title>([^<]+)<\/title>/i);
  metadata.title = ogTitle?.[1] || twitterTitle?.[1] || titleTag?.[1] || url.hostname;
  
  // Description
  const ogDesc = html.match(/<meta property="og:description" content="([^"]+)"/i);
  const twitterDesc = html.match(/<meta name="twitter:description" content="([^"]+)"/i);
  const metaDesc = html.match(/<meta name="description" content="([^"]+)"/i);
  metadata.description = ogDesc?.[1] || twitterDesc?.[1] || metaDesc?.[1] || '';
  
  // Image
  const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/i);
  const twitterImage = html.match(/<meta name="twitter:image" content="([^"]+)"/i);
  metadata.image = ogImage?.[1] || twitterImage?.[1] || null;
  
  // Domain and author
  metadata.domain = url.hostname;
  const ogSiteName = html.match(/<meta property="og:site_name" content="([^"]+)"/i);
  metadata.author = ogSiteName?.[1] || url.hostname;
  metadata.type = 'website';
  
  return metadata;
}

// Generate realistic mock metadata based on URL patterns
async function generateMockMetadata(url) {
  const domain = url.hostname.toLowerCase();
  
  // GitHub
  if (domain.includes('github.com')) {
    const pathParts = url.pathname.split('/').filter(Boolean);
    const user = pathParts[0] || 'user';
    const repo = pathParts[1] || 'repository';
    
    return {
      title: `${user}/${repo}`,
      description: `A GitHub repository by ${user}. Explore the code, issues, and pull requests.`,
      image: `https://opengraph.githubassets.com/1/${user}/${repo}`,
      domain: 'GitHub',
      author: user,
      type: 'website'
    };
  }
  
  // arXiv
  if (domain.includes('arxiv.org')) {
    return {
      title: 'Research Paper on Advanced Topics',
      description: 'A scientific paper exploring cutting-edge research in its field. Contains mathematical proofs and experimental results.',
      image: null,
      domain: 'arXiv',
      author: 'Research Authors',
      type: 'article'
    };
  }
  
  // Medium
  if (domain.includes('medium.com')) {
    return {
      title: 'Thoughtful Article on Modern Topics',
      description: 'An insightful piece exploring contemporary issues with depth and nuance. A must-read for curious minds.',
      image: 'https://miro.medium.com/v2/resize:fit:1200/1*placeholder-image',
      domain: 'Medium',
      author: 'Thoughtful Writer',
      type: 'article'
    };
  }
  
  // Wikipedia
  if (domain.includes('wikipedia.org')) {
    const title = url.pathname.split('/').pop()?.replace(/_/g, ' ') || 'Wikipedia Article';
    return {
      title: decodeURIComponent(title),
      description: `A comprehensive encyclopedia article about ${title}. Detailed, well-sourced information from Wikipedia.`,
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png',
      domain: 'Wikipedia',
      author: 'Wikipedia Contributors',
      type: 'article'
    };
  }
  
  // Reddit
  if (domain.includes('reddit.com')) {
    return {
      title: 'Interesting Discussion Thread',
      description: 'A engaging discussion with diverse perspectives and insights from the Reddit community.',
      image: null,
      domain: 'Reddit',
      author: 'Reddit Community',
      type: 'discussion'
    };
  }
  
  // Hacker News
  if (domain.includes('news.ycombinator.com')) {
    return {
      title: 'Technology Discussion',
      description: 'A thought-provoking discussion about technology, startups, and programming from the Hacker News community.',
      image: null,
      domain: 'Hacker News',
      author: 'HN Community',
      type: 'discussion'
    };
  }
  
  // Substack
  if (domain.includes('substack.com')) {
    return {
      title: 'Newsletter Article',
      description: 'An in-depth newsletter post exploring interesting ideas and trends. High-quality writing and analysis.',
      image: null,
      domain: 'Substack',
      author: 'Newsletter Author',
      type: 'article'
    };
  }
  
  // Academic/Research sites
  if (domain.includes('jstor.org') || domain.includes('pubmed.') || domain.includes('nature.com') || domain.includes('science.org')) {
    return {
      title: 'Academic Research Article',
      description: 'A peer-reviewed academic paper with rigorous research methodology and significant findings.',
      image: null,
      domain: domain.includes('nature') ? 'Nature' : 
             domain.includes('science') ? 'Science' :
             domain.includes('pubmed') ? 'PubMed' : 'JSTOR',
      author: 'Research Team',
      type: 'article'
    };
  }
  
  // News sites
  if (domain.includes('nytimes.com') || domain.includes('bbc.com') || domain.includes('reuters.com') || 
      domain.includes('washingtonpost.com') || domain.includes('economist.com')) {
    return {
      title: 'Breaking News Article',
      description: 'Latest news and analysis from trusted journalists covering important current events.',
      image: 'https://via.placeholder.com/1200x630/cccccc/666666?text=News+Article',
      domain: domain.includes('nytimes') ? 'New York Times' :
             domain.includes('bbc') ? 'BBC' :
             domain.includes('reuters') ? 'Reuters' :
             domain.includes('washingtonpost') ? 'Washington Post' : 'The Economist',
      author: 'News Team',
      type: 'article'
    };
  }
  
  // Blogs and personal sites
  if (domain.includes('blog') || url.pathname.includes('blog')) {
    return {
      title: 'Blog Post: Interesting Insights',
      description: 'Personal thoughts and insights on topics that matter. Written with passion and expertise.',
      image: null,
      domain: domain,
      author: 'Blog Author',
      type: 'article'
    };
  }
  
  // Default fallback
  return {
    title: `Interesting Content from ${domain}`,
    description: `Discover something fascinating from ${domain}. Worth exploring for curious minds.`,
    image: null,
    domain: domain,
    author: domain,
    type: 'website'
  };
}

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}