# Troubleshooting Guide - Daily Blogging

This guide helps you maintain your daily blogging streak even when technical issues arise.

## Quick Fixes for Common Issues

### 1. GitHub Actions Failed (403 npm error)
**Symptoms:** Build fails with "403 Forbidden" when fetching npm packages

**Quick Fix:**
```bash
# The workflow now has automatic retries, but if it still fails:
git pull
npm run emergency:deploy
```

### 2. Post Won't Upload via PagesCMS
**Symptoms:** PagesCMS shows error or doesn't trigger build

**Quick Fixes:**
1. **Direct commit approach:**
```bash
# Create post manually
echo "---
title: Your Title
date: $(date -I)
description: Your description
---

Your content here" > src/content/posts/$(date -I)-your-title.md

# Validate and deploy
npm run validate
git add .
git commit -m "Add today's post"
git push
```

2. **Use emergency deploy:**
```bash
npm run emergency:deploy
```

### 3. Build Fails Due to Post Content
**Symptoms:** Build error after adding new post

**Prevention:**
```bash
# Always validate before committing
npm run validate src/content/posts/your-new-post.md
```

**Common content issues:**
- Unclosed code blocks (```)
- Script tags outside code blocks
- Missing frontmatter fields (title, date, description)
- Invalid date format
- Broken image links

### 4. Site is Down
**Check these in order:**

1. **Check site status:**
```bash
npm run health:check
```

2. **Check GitHub Actions:**
- Visit: https://github.com/bebhuvan/rabbit-holes/actions
- Look for failed workflows

3. **Check Cloudflare:**
- Visit: https://dash.cloudflare.com
- Check Workers & Pages status

4. **Manual deployment:**
```bash
npm run workers:deploy
```

## Emergency Deployment Methods

### Method 1: Local Emergency Deploy (Fastest)
```bash
./scripts/emergency-deploy.sh
```

### Method 2: Manual GitHub Trigger
1. Go to: https://github.com/bebhuvan/rabbit-holes/actions
2. Click "Deploy to Cloudflare Workers"
3. Click "Run workflow" > "Run workflow"

### Method 3: Direct Cloudflare Deploy
```bash
# If you have Cloudflare credentials set up
npm run build
npm run workers:deploy
```

## Preventive Measures

### Daily Checklist
- [ ] Validate post before uploading: `npm run validate`
- [ ] Keep posts under 100KB
- [ ] Avoid complex HTML in markdown
- [ ] Use simple image URLs (no special characters)
- [ ] Test locally first: `npm run dev`

### Weekly Maintenance
```bash
# Update dependencies safely
npm update --save

# Clean install if having issues
npm run fix:deps

# Check site health
npm run health:check
```

## Mobile/Remote Posting

### Option 1: GitHub Web Editor
1. Go to: https://github.com/bebhuvan/rabbit-holes
2. Navigate to: `src/content/posts/`
3. Click "Add file" > "Create new file"
4. Name it: `YYYY-MM-DD-title.md`
5. Add content and commit

### Option 2: Email to Git
Set up email-to-git service (like gitmail.io) to post via email

### Option 3: Mobile Git Apps
- Working Copy (iOS)
- MGit (Android)
- GitHub Mobile App

## Getting Help

### Check Status
- GitHub Actions: https://github.com/bebhuvan/rabbit-holes/actions
- Cloudflare Status: https://www.cloudflarestatus.com/
- NPM Status: https://status.npmjs.org/

### Logs and Debugging
```bash
# View recent deployment logs
gh run list --workflow=deploy.yml --limit 5

# Download workflow logs
gh run download [run-id]

# Check local build
npm run build -- --verbose
```

## Recovery Scripts

### Reset Everything
```bash
# Nuclear option - full reset
git pull --rebase
npm run fix:deps
npm run build
npm run workers:deploy
```

### Rollback Last Post
```bash
# If latest post broke the site
git revert HEAD
git push
```

## Contact for Critical Issues
If the automated systems fail:
1. Check GitHub Issues for similar problems
2. Check Cloudflare Workers dashboard
3. Try emergency deployment script
4. As last resort, revert to previous working commit

Remember: **Your content is always safe in Git**. Even if the site is down, your posts are preserved and can be republished once issues are resolved.