# Rabbit Holes

A personal blog exploring ideas, thoughts, and discoveries across various topics.

## About

This is my digital garden where I share quick thoughts, reflections, and interesting finds. Built with Astro and deployed on Cloudflare Pages/Workers.

## Features

- **Musings**: Short reflections and observations
- **Links**: Collections of interesting links and resources
- **Reflections**: Longer-form contemplative pieces
- **Verse**: Poetry and lyrical writing
- **Practical**: How-to guides and tutorials

## Tech Stack

- **Framework**: Astro
- **Deployment**: Cloudflare Pages with Workers
- **CMS**: Studio (custom-built, mobile-first)
- **Styling**: Custom CSS with modern design
- **Editor**: CodeMirror 6

---

## Studio CMS

Studio is a custom-built, mobile-first content management system designed specifically for this blog. It provides a beautiful, distraction-free writing experience with powerful features.

### Accessing Studio

Navigate to `/studio` on your deployed site. You'll be prompted for a password (same as the `/auth` endpoint password).

### Authentication

Studio uses simple password authentication:
- Password is validated against the `CMS_PASSWORD` environment variable
- Sessions are stored in localStorage with a 24-hour expiry
- Session token format: `studio-session` and `studio-expires` keys

### Features Overview

#### 1. Post Management

**Viewing Posts**
- Posts are fetched from GitHub and displayed in a beautiful card layout
- Grouped by date (Today, Yesterday, or specific dates)
- Each card shows: title, type badge, and click to edit
- Real-time search/filter by title, slug, or type

**Creating Posts**
- Click "New Post" or navigate to Write tab
- Fill in title, select type, add tags
- Write in markdown with syntax highlighting
- Live preview (side-by-side on desktop, tabbed on mobile)
- Auto-saves to localStorage every 1.5 seconds

**Editing Posts**
- Click any post card to load it into the editor
- Fetches current content from GitHub
- Updates use the file's SHA for conflict prevention
- "Update" button replaces "Publish" when editing

#### 2. Editor

**CodeMirror 6 Integration**
- Full markdown syntax highlighting
- Undo/redo history
- Placeholder text
- Dark mode support (automatically syncs with theme)
- Mobile-optimized with proper touch handling

**Title Input**
- Large, prominent title field
- Required for publishing

**Type Selector**
- Dropdown with 5 post types:
  - **Musings** (orange) - Short thoughts
  - **Links** (blue) - Link collections
  - **Reflections** (purple) - Long-form pieces
  - **Verse** (purple) - Poetry
  - **Practical** (green) - How-to guides

**Tag Management**
- Add tags via "+ Add tag" button
- Tags appear as removable pills
- Saved with drafts and published posts

**Preview Pane**
- Live markdown rendering using `marked`
- Matches blog typography (Newsreader font)
- Supports: headings, paragraphs, lists, blockquotes, code, links

#### 3. Draft System

**Auto-Save**
- Drafts save to localStorage automatically (debounced 1.5s)
- Saves: title, content, type, tags, timestamp
- Unique draft IDs prevent conflicts

**Drafts View**
- Access via "Drafts" navigation
- Shows all saved drafts with timestamps
- Click to load into editor
- Delete button to remove drafts

**Draft Storage**
- Key: `studio-drafts` in localStorage
- Format: JSON array of draft objects
- Each draft has: id, title, content, type, tags, updatedAt

#### 4. AI Tools

Collapsible panel at the bottom of the editor with three AI-powered features:

**Enhance**
- Endpoint: `POST /enhance`
- Improves writing quality, clarity, and flow
- Replaces editor content with enhanced version

**Refine**
- Endpoint: `POST /refine`
- More targeted improvements based on optional prompt
- Good for specific style adjustments

**Generate Title**
- Endpoint: `POST /metadata`
- Analyzes content and suggests a title
- Updates title field automatically

**Custom Prompt**
- Optional textarea for additional instructions
- Sent with all AI requests for context

#### 5. Image Upload

**Upload Methods**
1. **Button**: Click "Image" in editor toolbar
2. **Drag & Drop**: Drop image onto upload overlay
3. **Paste**: Cmd/Ctrl+V with image in clipboard

**Upload Flow**
1. Image validated (type and size)
2. Uploaded to GitHub via `/upload` endpoint
3. Stored in `public/images/` with unique filename
4. Markdown inserted at cursor: `![filename](url)`

**Supported Formats**
- JPEG, PNG, GIF, WebP, SVG
- Maximum size: 10MB

**Upload Overlay**
- Modal with drag-drop zone
- Progress bar during upload
- Click outside or press Escape to close

#### 6. Publishing

**New Posts**
- Generates slug from title
- Uses current date for filename
- Creates file: `src/content/posts/YYYY-MM-DD-slug.md`
- Commits to GitHub with message: "Add new post: {title}"

**Updating Posts**
- Uses existing date from filename
- Requires SHA from original fetch
- Commits with message: "Update post: {title}"

**Frontmatter Generated**
```yaml
---
title: "Your Title"
date: 2024-12-27T00:00:00.000Z
type: "musings"
published: true
tags:
  - "tag1"
  - "tag2"
---
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + S` | Save draft |
| `Cmd/Ctrl + Enter` | Publish/Update post |
| `Cmd/Ctrl + V` | Paste (handles images) |
| `Escape` | Close modals/menus |

### Theme Support

- Automatic dark mode detection
- Manual toggle via sun/moon icon in header
- Preference saved to localStorage (`studio-theme`)
- Editor theme syncs automatically

### Mobile Experience

- Fully responsive design
- Bottom-sheet style mobile navigation
- Tabbed editor (Write/Preview toggle)
- Touch-optimized controls
- Collapsible AI panel to save space

### Navigation

**Header (Desktop)**
- Logo links to blog home
- Posts / Write / Drafts tabs
- Theme toggle
- Mobile menu button (hidden on desktop)

**Mobile Drawer**
- Slide-in navigation from right
- Same navigation options
- "Back to Blog" link
- Tap backdrop to close

---

## API Endpoints

Studio uses Cloudflare Workers functions for all server operations.

### Authentication

#### `POST /auth`

Validates password and returns session token.

**Request:**
```json
{
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "sessionToken": "random-token",
  "expiresAt": "2024-12-28T00:00:00.000Z"
}
```

### Posts

#### `GET /posts`

Fetches list of all posts from GitHub.

**Query Parameters:**
- `limit` (optional): Number of posts to return (default: 50)
- `content` (optional): Set to `true` to include post body

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "filename": "2024-12-27-my-post.md",
      "date": "2024-12-27",
      "slug": "my-post",
      "sha": "abc123...",
      "path": "src/content/posts/2024-12-27-my-post.md",
      "title": "My Post",
      "type": "musings",
      "tags": ["tag1"],
      "published": true
    }
  ],
  "total": 150
}
```

#### `GET /posts/[slug]`

Fetches a single post by slug.

**Response:**
```json
{
  "success": true,
  "post": {
    "filename": "2024-12-27-my-post.md",
    "slug": "my-post",
    "date": "2024-12-27",
    "sha": "abc123...",
    "title": "My Post",
    "type": "musings",
    "tags": ["tag1"],
    "content": "Post body in markdown...",
    "published": true
  }
}
```

#### `PUT /posts/[slug]`

Updates an existing post.

**Request:**
```json
{
  "title": "Updated Title",
  "content": "Updated markdown content",
  "type": "reflections",
  "tags": ["tag1", "tag2"],
  "date": "2024-12-27",
  "sha": "abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post updated successfully",
  "slug": "my-post",
  "sha": "def456...",
  "updated_at": "2024-12-27T12:00:00.000Z"
}
```

### Publishing

#### `POST /publish`

Creates a new post.

**Request:**
```json
{
  "title": "New Post Title",
  "content": "Markdown content",
  "type": "musings",
  "tags": ["tag1"],
  "date": "2024-12-27",
  "slug": "new-post-title"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post published successfully",
  "slug": "new-post-title",
  "github_url": "https://github.com/...",
  "published_at": "2024-12-27T12:00:00.000Z"
}
```

### Image Upload

#### `POST /upload`

Uploads an image to GitHub.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field

**Response:**
```json
{
  "success": true,
  "url": "/images/1703683200000-abc123.png",
  "filename": "1703683200000-abc123.png",
  "size": 102400,
  "type": "image/png",
  "github_url": "https://github.com/..."
}
```

### AI Enhancement

#### `POST /enhance`

Enhances content using AI.

**Request:**
```json
{
  "content": "Original markdown",
  "title": "Post title",
  "prompt": "Optional instructions"
}
```

#### `POST /refine`

Refines content with specific improvements.

**Request:**
```json
{
  "content": "Original markdown",
  "title": "Post title",
  "prompt": "Make it more concise"
}
```

#### `POST /metadata`

Generates title and metadata.

**Request:**
```json
{
  "content": "Post content"
}
```

**Response:**
```json
{
  "success": true,
  "title": "Suggested Title"
}
```

---

## Environment Variables

Required environment variables for Studio (set in Cloudflare):

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | GitHub personal access token with repo write access |
| `GITHUB_REPO` | Repository in format `username/repo` |
| `CMS_PASSWORD` | Password for Studio authentication |
| `ANTHROPIC_API_KEY` | API key for AI features (optional) |
| `OPENAI_API_KEY` | Alternative AI provider (optional) |

---

## File Structure

```
functions/
├── auth.js           # Password authentication
├── posts.js          # List all posts
├── posts/
│   └── [slug].js     # Get/update single post
├── publish.js        # Create new post
├── upload.js         # Image upload
├── enhance.js        # AI content enhancement
├── refine.js         # AI content refinement
└── metadata.js       # AI title generation

src/pages/
└── studio.astro      # Studio CMS page (complete SPA)
```

---

## Design System

Studio uses a custom design system built on CSS variables:

### Colors (Light Mode)
```css
--studio-bg: #FDFCFA
--studio-surface: #F5F4F1
--studio-surface-raised: #FFFFFF
--studio-text: #1A1918
--studio-text-muted: #9C9890
--studio-accent: #D95D0F
```

### Colors (Dark Mode)
```css
--studio-bg: #0C0C0B
--studio-surface: #1A1918
--studio-surface-raised: #222120
--studio-text: #F5F4F2
--studio-accent: #EA7E3C
```

### Typography
- **UI**: Space Grotesk (sans-serif)
- **Content/Preview**: Newsreader (serif)
- **Code/Mono**: Space Mono

### Spacing
8px base grid: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px

### Animations
- Fast: 120ms
- Normal: 200ms
- Slow: 350ms
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing Studio Locally

1. Create a `.dev.vars` file with required environment variables
2. Run `npm run dev`
3. Navigate to `http://localhost:4321/studio`
4. Login with your CMS password

---

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues.

### Studio-Specific Issues

**"Failed to load posts"**
- Check `GITHUB_TOKEN` has repo access
- Verify `GITHUB_REPO` format is correct

**"Failed to publish"**
- Ensure token has write permissions
- Check for duplicate slugs

**Editor not loading**
- CodeMirror loads via ESM from esm.sh
- Check network connectivity
- Try hard refresh (Cmd+Shift+R)

**Images not uploading**
- Verify file is under 10MB
- Check file type is supported
- Ensure token has content write access

---

## License

Personal blog content - feel free to read and share, but please respect the original authorship.
