# Studio CMS - Implementation Handoff

## Project Overview

**Studio** is a custom-built, mobile-first Content Management System for the "Rabbit Holes" blog (https://rabbitholes.garden). It replaces the previous PagesCMS solution with a more refined, integrated editing experience.

### Tech Stack
- **Frontend**: Astro with Cloudflare adapter
- **Deployment**: Cloudflare Workers (via wrangler)
- **Storage**: GitHub API (posts stored as markdown in repo)
- **Editor**: CodeMirror 6 (loaded via ESM from esm.sh)
- **AI Features**: Anthropic Claude API for content enhancement

---

## Current State

### What's Working
- ✅ Authentication via `/api/auth` (password in Cloudflare env vars)
- ✅ Posts listing via `/api/posts` (fetches from GitHub)
- ✅ Post preview/reading
- ✅ Environment variables configured in `wrangler.toml` and Cloudflare secrets

### What's Broken/Flaky
- ❌ **CodeMirror editor not loading** - ESM imports from esm.sh causing "multiple instances of @codemirror/state" error
- ❌ **Cannot create/edit posts** - Editor doesn't initialize
- ⚠️ **Session persistence issues** - Hard refresh may log users out
- ⚠️ **AI features untested** - enhance/refine/metadata endpoints created but not verified

---

## Architecture

### File Structure
```
src/pages/
├── studio.astro          # Main Studio SPA (3300+ lines)
└── api/
    ├── auth.js           # POST - Password authentication
    ├── posts.js          # GET - List all posts from GitHub
    ├── posts/[slug].js   # GET/PUT - Single post operations
    ├── publish.js        # POST - Create new post
    ├── upload.js         # POST - Image upload to GitHub
    ├── enhance.js        # POST - AI content enhancement
    ├── refine.js         # POST - AI content refinement
    └── metadata.js       # POST - Fetch URL metadata / AI title generation

functions/                 # Legacy Cloudflare Pages functions (NOT USED)
├── posts.js              # These were for CF Pages deployment
├── upload.js             # But we deploy via Wrangler Workers
└── ...                   # So these are ignored
```

### Environment Variables

**In `wrangler.toml` [vars]:**
```toml
ENVIRONMENT = "production"
GITHUB_REPO = "bebhuvan/rabbit-holes"
```

**In Cloudflare Secrets (set via dashboard):**
- `GITHUB_TOKEN` - GitHub PAT with repo scope
- `CMS_PASSWORD` - Studio login password
- `ANTHROPIC_API_KEY` - (Optional) For AI features

### API Routes Access Pattern
All API routes access Cloudflare env vars via:
```javascript
export async function GET({ request, locals }) {
  const runtime = locals?.runtime?.env || {};
  const env = {
    GITHUB_REPO: runtime.GITHUB_REPO || import.meta.env.GITHUB_REPO,
    GITHUB_TOKEN: runtime.GITHUB_TOKEN || import.meta.env.GITHUB_TOKEN
  };
  // ...
}
```

---

## Known Issues & Bugs

### 1. CodeMirror Multiple Instances (CRITICAL)
**Error:** `Unrecognized extension value in extension set ([object Object]). This sometimes happens because multiple instances of @codemirror/state are loaded`

**Location:** `studio.astro` lines 2773-2835 (initEditor function)

**Cause:** ESM imports from esm.sh load separate instances of @codemirror/state

**Attempted Fixes:**
- Added `?bundle` flag to esm.sh URLs (latest attempt)
- Restructured extension array to avoid empty arrays

**Potential Solutions:**
1. Use a single bundled CodeMirror build (e.g., from unpkg or cdnjs)
2. Self-host CodeMirror bundle
3. Use textarea fallback when CodeMirror fails

### 2. Session Logout on Refresh
**Issue:** Hard refresh (Ctrl+Shift+R) logs user out

**Location:** `studio.astro` lines 2367-2378 (session check)

**Expected:** Session stored in localStorage should persist

### 3. AI Title Button Misconfigured
**Issue:** Title button calls `callAI('metadata')` but button ID mapping was missing

**Location:** `studio.astro` line 3277

**Status:** Partially fixed - added btnIdMap

### 4. Missing Null Checks
**Locations:**
- `callAI()` - btn could be null
- `loadPost()` - response fields not validated
- `insertAtCursor()` - codemirror state could be undefined

---

## Studio Features (Intended)

### Post Management
- View all posts in card layout, grouped by date
- Search/filter posts
- Click to edit existing posts
- Create new posts

### Editor
- Markdown editing with syntax highlighting (CodeMirror)
- Live preview (using marked.js)
- Auto-save drafts to localStorage
- Type selector (Musings, Links, Reflections, Verse, Practical)
- Tag management with inline input

### AI Tools
- **Enhance** - Improve writing quality
- **Refine** - Targeted improvements with custom prompt
- **Title** - Generate title from content

### Image Upload
- Drag & drop
- Paste from clipboard
- Upload to GitHub `public/images/`

---

## Deployment

### GitHub Actions Workflow
`.github/workflows/deploy.yml` runs on push to master:
1. Checkout code
2. Install dependencies
3. Build Astro (`npm run build`)
4. Deploy via Wrangler

### Manual Deployment
```bash
npm run build
npx wrangler deploy
```

---

## Next Steps (Priority Order)

1. **Fix CodeMirror loading** - Either:
   - Bundle CodeMirror locally
   - Use alternative CDN with proper bundling
   - Add textarea fallback

2. **Add error boundaries** - Prevent JS errors from breaking entire app

3. **Test all API endpoints** - Verify publish, upload, AI features work

4. **Add proper session validation** - Currently tokens aren't validated server-side

5. **Performance** - Add loading states, optimize GitHub API calls

---

## Testing

### Manual Testing Checklist
- [ ] Login with password
- [ ] Posts load and display
- [ ] Click "Write" - editor initializes
- [ ] Type in editor - content appears
- [ ] Preview updates live
- [ ] Save draft (auto-save)
- [ ] Publish new post
- [ ] Edit existing post
- [ ] Upload image
- [ ] AI enhance/refine (if API key set)

### URLs
- Production: https://rabbitholes.garden/studio
- API Test: `curl https://rabbitholes.garden/api/posts?limit=2`

---

## Contact/Resources

- **Repo:** https://github.com/bebhuvan/rabbit-holes
- **Cloudflare Dashboard:** Workers & Pages > rabbit-holes
- **CodeMirror Docs:** https://codemirror.net/docs/
- **esm.sh Docs:** https://esm.sh/
