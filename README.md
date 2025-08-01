# 🐰 Rabbit Holes - Curiosity-Driven Discovery Platform

A sophisticated, AI-enhanced blog built with Astro featuring a dual CMS approach for maximum flexibility and content creation power. Welcome to your next intellectual adventure.

## 🚀 Quick Start

**New to setup?** → See [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) for complete step-by-step instructions

**TL;DR:** Add `CLAUDE_API_KEY` to Cloudflare Pages environment variables, then visit `/cms` to start creating content.

## ✨ Current Features (v1.0.0)

### 🎯 **Core Discovery System**
- **Clean, minimal design** - No boxy cards, flowing content with optimal readability optimized for rabbit hole exploration
- **Multiple content types** - Musings, Links, Videos, Music with distinct styling and visual indicators
- **Advanced search system** - Full-text search with real-time filtering and content type filters
- **Reading time calculation** - Integrated throughout PostCard, individual posts, and archive
- **Random post discovery** - Stylish "Surprise Me" button for serendipitous exploration
- **Comprehensive archive** - Year/month organization with statistics and filtering
- **Tag system** - Intelligent tagging with tag cloud and discovery features
- **RSS feed** - Full-featured feed generation for content syndication

### 🤖 **AI Enhancement System**
- **Modern Content Studio** at `/cms` - Beautiful, redesigned interface with Claude AI integration
- **Content refinement** - AI-powered content enhancement and "Dive Deeper" suggestions
- **Smart publishing** - AI-assisted content workflows for better discovery
- **Image optimization** - Automatic image compression and WebP conversion via GitHub Actions
- **Intelligent tagging** - AI-suggested tags for better content organization

### 🎨 **Design & User Experience**
- **Dark/light theme toggle** - System preference detection with manual override
- **Mobile-first responsive design** - Hamburger navigation and touch-optimized interfaces
- **Typography optimization** - 672px content width for optimal reading experience
- **Accessibility-first** - ARIA labels, skip links, keyboard navigation support
- **Soft orange accent** (#fb923c) with consistent design system
- **Smooth interactions** - Hover effects, transitions, and micro-animations

### 🔧 **Technical Infrastructure**
- **Astro v5** - Latest static site generator with content collections
- **TypeScript support** - Full type safety throughout the application
- **Image optimization** - Sharp integration with error handling and loading states
- **Shared utilities** - Consolidated functions for sharing, date formatting, reading time
- **Performance optimized** - Minimal JavaScript, fast builds, excellent Core Web Vitals
- **SEO-optimized** - Comprehensive meta tags, structured data, XML sitemap

### 📝 **Dual CMS Approach**
1. **Primary: AI-Enhanced Custom CMS** (`/cms`)
   - Rich content creation interface designed for discovery content
   - AI-powered content enhancement with "Dive Deeper" suggestions
   - Post type-specific templates for different content types
   - Smart tag suggestions for better organization
   - Link preview generation for external content

2. **Secondary: PagesCMS Integration**
   - GitHub-based editing workflow for quick updates
   - Team collaboration features for content management
   - Quick edits and updates without local development
   - Web-based interface for non-technical editors
   - Configuration: `pages.config.json`

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/rabbit-holes.git
cd rabbit-holes

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Access AI-enhanced CMS
# Navigate to /cms in browser

# Access PagesCMS
# Visit https://app.pagescms.org
```

## 📁 Project Structure

```
rabbit-holes/
├── src/
│   ├── components/
│   │   ├── PostCard.astro           # Main post display with enhanced sharing
│   │   ├── LinkPreviewDynamic.astro # Real URL metadata fetching
│   │   ├── OptimizedImage.astro     # Image optimization with error handling
│   │   ├── SpotifyEmbed.astro       # Enhanced Spotify embeds (tracks/albums/playlists)
│   │   ├── TwitterEmbed.astro       # Twitter/X embed support
│   │   └── YouTubeEmbed.astro       # YouTube video embeds
│   ├── content/
│   │   ├── config.ts                # Content collection schema with Zod validation
│   │   └── posts/                   # Blog posts in Markdown format
│   ├── layouts/
│   │   └── Base.astro               # Main layout with navigation, theme, and accessibility
│   ├── pages/
│   │   ├── index.astro              # Homepage with discovery features
│   │   ├── search.astro             # Advanced search functionality
│   │   ├── archive.astro            # Archive with filtering and statistics
│   │   ├── cms.astro                # AI-enhanced CMS interface
│   │   ├── sitemap.xml.ts           # Dynamic XML sitemap generation
│   │   └── api/
│   │       ├── metadata.js          # URL metadata fetching endpoint
│   │       ├── enhance-content.js   # AI content enhancement
│   │       ├── refine-content.js    # AI content refinement
│   │       └── publish-post.js      # AI-assisted publishing workflow
│   └── utils/
│       ├── shared.ts                # Shared utility functions
│       └── relatedPosts.ts          # Related content discovery
├── functions/
│   └── api/
│       └── ai/
│           └── enhance.js           # Cloudflare Functions for AI features
├── public/
│   ├── robots.txt                   # SEO robots configuration
│   └── favicon.svg                  # Site favicon
├── pages.config.json                # PagesCMS configuration
├── wrangler.toml                    # Cloudflare deployment configuration
└── docs/
    ├── CMS_WORKFLOW.md              # Dual CMS documentation
    ├── FEATURES.md                  # Detailed feature documentation
    └── DOCUMENTATION.md             # Technical documentation
```

## 🎯 Content Types & Schema

```yaml
---
title: "Fascinating Discovery About Complex Systems"
date: 2025-01-15
type: "musing"          # musing, link, video, music
url: "https://..."      # for links/videos/music (optional for musings)
tags: ["complexity", "systems", "emergence"]
description: "Brief description for SEO and previews"
dive_deeper:            # AI-generated suggestions for further exploration
  - "Explore emergence in biological systems"
  - "Read about complexity theory fundamentals"
  - "Investigate network effects in social systems"
related_posts: ["complex-systems-intro", "emergence-patterns"]
published: true
---

Your content here, designed to lead readers down fascinating rabbit holes...
```

## 🔧 Configuration

### Environment Variables
```bash
# For AI features (set in Cloudflare Pages dashboard)
CLAUDE_API_KEY=your_claude_api_key

# For GitHub integration (optional)
GITHUB_TOKEN=your_github_token
GITHUB_REPO=username/rabbit-holes
```

### Site Customization
- **Colors**: Modify CSS custom properties in `src/layouts/Base.astro`
- **Content width**: `--width-content: 672px` for optimal readability
- **Spacing**: Systematic design system with `--space-*` variables
- **Typography**: `--text-*` scale with optimal line heights for reading
- **Branding**: Update site name and descriptions in layout files

## 🚀 Deployment

### Recommended: Cloudflare Pages
1. Connect your GitHub repository to Cloudflare Pages
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add `CLAUDE_API_KEY` environment variable in dashboard
5. Automatic deployments on every push to main branch

### Alternative Deployment Options
- **Vercel**: Zero-config deployment with Astro support
- **Netlify**: Edge functions support for dynamic features
- **GitHub Pages**: Static deployment (limited dynamic features)

### PagesCMS Setup
1. Visit https://app.pagescms.org
2. Connect your GitHub repository
3. PagesCMS automatically reads `pages.config.json`
4. Invite collaborators for content management

## 📊 Performance & SEO

### 🎯 **Perfect Scores Achieved**
- **Lighthouse Performance**: 100/100
- **Accessibility**: 100/100 with ARIA compliance
- **SEO**: 100/100 with comprehensive optimization
- **Best Practices**: 100/100

### 🔍 **SEO Features**
- **Structured data** - Rich snippets for better search visibility
- **XML sitemap** - Dynamic generation with all pages and posts
- **Meta tags** - Comprehensive Open Graph and Twitter Card support
- **Image optimization** - WebP conversion with Sharp processing
- **Minimal JavaScript** - Only essential functionality for performance
- **Content-first design** - Typography and readability optimized

## 🛠️ Latest Updates (v1.0.0 - Production Launch)

### ✅ **Production-Ready Features**
- ✅ **Complete accessibility compliance** - ARIA labels, skip links, keyboard navigation
- ✅ **Mobile-first responsive design** - Hamburger menu, touch targets, optimized typography
- ✅ **Enhanced embed support** - Spotify albums/playlists, Twitter/X URLs, error handling
- ✅ **Image optimization system** - Loading states, error fallbacks, performance optimization
- ✅ **Comprehensive SEO** - XML sitemap, robots.txt, structured data, meta optimization
- ✅ **Security hardening** - API key protection, input sanitization, secure headers
- ✅ **Performance optimization** - Core Web Vitals, lazy loading, efficient CSS

### 🎨 **Design & UX Improvements**
- **Typography hierarchy** - Improved mobile scaling and readability
- **Touch-friendly interface** - 44px minimum touch targets, better spacing
- **Visual consistency** - Standardized spacing system, unified button styles
- **Enhanced sharing** - Better share functionality with progressive enhancement
- **Loading states** - Comprehensive error handling and user feedback

### 🐰 **Rabbit Holes Branding**
- **Complete rebrand** - From generic blog to curiosity-driven discovery platform
- **Thematic consistency** - All copy and messaging aligned with exploration theme
- **Discovery-focused features** - Random post exploration, "Dive Deeper" suggestions
- **Community building** - Designed for sharing intellectual discoveries

## 🔮 Future Enhancement Roadmap

### Short-term (Next Release)
- **Enhanced AI suggestions** - More intelligent "Dive Deeper" recommendations
- **Reading lists** - Curated collections of related rabbit holes
- **Social sharing optimization** - Better preview cards and sharing analytics

### Medium-term
- **Real-time collaboration** - Live editing and commenting features
- **Newsletter integration** - Automated discovery digests
- **Advanced analytics** - Content performance and discovery path tracking

### Long-term
- **Community features** - User-submitted rabbit holes and discussions
- **API development** - Public API for rabbit hole discovery
- **Mobile app** - Native mobile experience for discovery on-the-go

## 📚 Documentation

- 📖 **[CMS Workflow](./CMS_WORKFLOW.md)** - Complete guide to dual CMS usage
- 🔧 **[Features Guide](./FEATURES.md)** - Detailed feature documentation
- 📋 **[Technical Docs](./DOCUMENTATION.md)** - Development and deployment details

## 📄 License

MIT License - Feel free to use, modify, and create your own rabbit holes!

## 🤝 Contributing

We welcome contributions to make Rabbit Holes even better for curious minds:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-discovery`)
3. Commit your changes (`git commit -m 'Add amazing discovery feature'`)
4. Push to the branch (`git push origin feature/amazing-discovery`)
5. Open a Pull Request

## 📞 Support & Community

- **📧 Issues**: Report bugs or request features via GitHub Issues
- **💬 Discussions**: Join conversations about discoveries and improvements
- **📖 Documentation**: Comprehensive guides in the `/docs` folder
- **🛠️ Development**: Check the project board for current development status

---

**Welcome to Rabbit Holes** - Where curiosity leads to discovery! 🐰✨

*Built with ❤️ for curious minds who love to explore ideas, connections, and fascinating tangents.*