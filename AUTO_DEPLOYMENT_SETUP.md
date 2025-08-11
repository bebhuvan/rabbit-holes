# 🚀 Automatic Workers Deployment Setup

## The Problem
Workers doesn't automatically deploy when PagesCMS pushes to GitHub (unlike Pages which did).

## The Solution
GitHub Actions will automatically deploy to Workers whenever PagesCMS pushes changes.

## Setup Steps

### 1. Create Cloudflare API Token

1. **Go to**: https://dash.cloudflare.com/profile/api-tokens
2. **Click**: "Create Token"
3. **Use template**: "Custom token"
4. **Add permissions**:
   - **Account** → **Cloudflare Workers** → **Edit**
   - **Account** → **Cloudflare Pages** → **Edit** (if needed)
5. **Account Resources**: Include → All accounts
6. **Zone Resources**: Include → All zones
7. **Click**: "Continue to summary" → "Create Token"
8. **Copy the token** (starts with something like `abc123...`)

### 2. Add Token to GitHub Secrets

1. **Go to**: https://github.com/bebhuvan/rabbit-holes/settings/secrets/actions
2. **Click**: "New repository secret"
3. **Name**: `CLOUDFLARE_API_TOKEN`
4. **Value**: Paste your Cloudflare API token
5. **Click**: "Add secret"

### 3. Test the Setup

1. **Commit and push** the workflow file:
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add automatic Workers deployment"
   git push origin master
   ```

2. **Create a test post** via PagesCMS
3. **Watch GitHub Actions** at: https://github.com/bebhuvan/rabbit-holes/actions
4. **Verify** the post appears on Workers automatically

## How It Works

- **PagesCMS pushes** → GitHub receives changes
- **GitHub Actions triggers** → Automatic build and deploy
- **Workers updates** → Your site is live with new content

## Result

✅ **Automatic deployment** - Just like Pages used to work
✅ **No manual commands** - PagesCMS changes appear automatically
✅ **Same workflow** - Create/edit posts, they go live instantly

## Troubleshooting

If deployment fails:
1. Check GitHub Actions logs: https://github.com/bebhuvan/rabbit-holes/actions
2. Verify API token has correct permissions
3. Ensure token is added to repository secrets (not environment secrets)
