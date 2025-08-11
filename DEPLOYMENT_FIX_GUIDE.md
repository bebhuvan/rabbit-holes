# 🚨 Fix: PagesCMS Updates Pages Instead of Workers

## Problem Summary
PagesCMS commits to GitHub → Old Pages deployment rebuilds automatically → Workers deployment remains outdated

## ✅ Migration Status
- ✅ **Functions migrated**: `/functions/` → `/src/api/`
- ✅ **Workers config created**: `wrangler.toml` added
- ✅ **Astro configuration**: Updated for Workers SSR
- ✅ **Git tracking**: `wrangler.toml` now tracked in git

## 🎯 Next Steps to Fix Deployment

### 1. **Check Current Deployments**

Visit your Cloudflare dashboard:
- **Pages**: https://dash.cloudflare.com/pages
- **Workers**: https://dash.cloudflare.com/workers

Look for:
- Any active **rabbit-holes** deployment in Pages
- Any **rabbit-holes** deployment in Workers

### 2. **Disable Old Pages Deployment**

If you find an active Pages deployment:

1. **Go to Pages dashboard**
2. **Find your rabbit-holes project**
3. **Go to Settings → Build & Deploy**
4. **Disable automatic deployments** OR
5. **Delete the Pages project entirely** (recommended)

### 3. **Set Up Workers Deployment**

```bash
# Install Wrangler CLI (if not already installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Set up environment secrets
wrangler secret put CLAUDE_API_KEY
wrangler secret put GITHUB_TOKEN  
wrangler secret put GITHUB_REPO
wrangler secret put CMS_PASSWORD

# Build and deploy to Workers
npm run build
wrangler deploy
```

### 4. **Set Up Automatic Deployments (Optional)**

For automatic GitHub deployments to Workers, set up GitHub Actions:

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### 5. **Update DNS (If Needed)**

If your domain was pointing to Pages:
1. **Go to DNS settings** in Cloudflare
2. **Update CNAME record** to point to your Workers deployment
3. **Or use Workers Routes** in the Workers dashboard

### 6. **Test the Fix**

After deploying to Workers:

1. **Test Workers deployment**: Visit your Workers URL
2. **Test PagesCMS**: Make a test post via PagesCMS
3. **Manually deploy**: Run `wrangler deploy` after PagesCMS makes changes
4. **Verify**: Check that Workers instance shows the new content

## 🔄 Workflow After Fix

**Until you set up GitHub Actions:**
```bash
# After PagesCMS makes changes, manually deploy:
git pull origin master
npm run build  
wrangler deploy
```

**After setting up GitHub Actions:**
- PagesCMS commits → GitHub Actions automatically deploys to Workers

## 🚨 Important Notes

1. **Only one deployment should be active** - either Pages OR Workers, not both
2. **Workers deployment requires manual deployment** unless you set up GitHub Actions
3. **Environment variables** must be set via `wrangler secret put` for Workers
4. **Domain routing** may need to be updated to point to Workers

## ✅ Success Checklist

- [ ] Old Pages deployment disabled/deleted
- [ ] Workers deployment active and working
- [ ] Environment secrets set via `wrangler secret put`
- [ ] PagesCMS changes trigger Workers updates (manual or automatic)
- [ ] Domain points to Workers deployment
- [ ] All functionality working on Workers instance 