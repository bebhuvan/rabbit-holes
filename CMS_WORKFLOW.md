# 🐰 Rabbit Holes - Dual CMS Workflow Documentation

Rabbit Holes uses a **dual CMS approach** for maximum flexibility in creating and managing discovery content:

## 🚀 Primary CMS: AI-Enhanced Rabbit Hole Creation Studio
**Location**: `/cms`  
**Best for**: Creating new rabbit holes, AI-powered discovery enhancement, rich exploration authoring

### Features:
- ✨ AI-powered "Dive Deeper" suggestion generation for extending rabbit hole exploration
- 🎯 Discovery type-specific templates (musings, external rabbit holes, video explorations, audio journeys)
- 🏷️ Smart tag suggestions for better discovery connection-making
- 📝 Rich markdown editor optimized for exploration content
- 🔗 Link preview generation for external rabbit hole sources
- 📊 Reading time calculation to estimate exploration depth
- 🎨 Custom styling per post type

### When to use:
- Creating new posts from scratch
- Need AI assistance for content refinement
- Want rich authoring experience
- Working on complex musings or in-depth content

## 📝 Secondary CMS: PagesCMS
**Location**: Run `npm run cms` to start  
**Best for**: Quick edits, team collaboration, GitHub-based workflow

### Features:
- 🔄 Direct GitHub integration
- 👥 Team collaboration
- 📱 Mobile-friendly editing
- 🔒 Version control built-in
- ⚡ Quick edits and updates
- 🌐 Web-based interface

### When to use:
- Quick edits to existing posts
- Team members need to edit content
- Mobile editing on the go
- Simple text corrections
- Publishing workflow integration

## 🔄 Workflow Recommendations

### Content Creation Flow:
1. **Start with Custom CMS** (`/cms`) for new posts
   - Use AI assistance for content enhancement
   - Leverage post type templates
   - Get smart tag suggestions

2. **Switch to PagesCMS** for:
   - Final reviews and edits
   - Team collaboration
   - Publishing workflow
   - Quick fixes after publication

### File Structure Compatibility:
Both CMSs work with the same file structure:
```
src/content/posts/
├── post-slug.md
├── another-post.md
└── ...
```

### Frontmatter Schema:
Both CMSs support the same frontmatter fields:
```yaml
---
title: "Post Title"
date: 2024-07-12
type: "musing" # musing, link, video, music
url: "https://example.com" # for links/videos/music
tags: ["tag1", "tag2"]
description: "Post description"
dive_deeper:
  - "Additional resource 1"
  - "Additional resource 2"
related_posts: ["related-post-slug"]
published: true
---
```

## 🛠️ Setup Instructions

### Custom CMS (Already Active):
- Navigate to `/cms` in your browser
- No additional setup required

### PagesCMS Setup:
1. **Visit the online CMS**:
   ```
   https://app.pagescms.org
   ```

2. **Connect your GitHub repository**:
   - Log in with your GitHub account
   - Select your blog repository
   - PagesCMS will read your `pages.config.json` automatically

3. **No local installation required**:
   - PagesCMS is a hosted service
   - All editing happens in the web interface
   - Changes are committed directly to your GitHub repo

## 🎯 Best Practices

### Content Creation:
1. **Use Custom CMS for first draft** - leverage AI assistance
2. **Review in PagesCMS** - clean interface for final review
3. **Collaborate via PagesCMS** - team members can contribute
4. **Quick edits via PagesCMS** - faster for small changes

### File Management:
- Both CMSs create files in `src/content/posts/`
- Filename format: `post-title-slug.md`
- Always use lowercase with hyphens for slugs
- Ensure unique filenames to avoid conflicts

### Tag Management:
- Keep tags consistent across both CMSs
- Use the tag cloud on the site to see existing tags
- Both CMSs will suggest existing tags

## 🚨 Important Notes

### Avoiding Conflicts:
- Don't edit the same post simultaneously in both CMSs
- Always pull latest changes before editing
- Use PagesCMS for collaborative editing
- Use Custom CMS for solo content creation

### Data Sync:
- Both CMSs work with the same file system
- Changes are immediately reflected in both interfaces
- No manual sync required
- Git handles version control

## 📞 Support

If you encounter issues:
1. Check that both CMSs are pointing to the same content directory
2. Verify frontmatter syntax matches the schema
3. Ensure file permissions allow both CMSs to read/write
4. Check the browser console for any JavaScript errors

## 🔮 Future Enhancements

Potential improvements for the dual CMS setup:
- Webhook integration for real-time sync
- Shared draft system
- Unified media management
- Cross-CMS analytics
- Automated backup system