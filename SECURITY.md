# 🔐 Security Guide

## API Key Management

### ⚠️ CRITICAL: Never Commit API Keys

API keys should NEVER be committed to version control. This project is configured to prevent this:

- `.gitignore` blocks `.env*` files
- `wrangler.toml` contains only placeholders
- All functions read keys from `env` variables

### Setting Up API Keys Securely

#### Local Development:
1. Copy `.env.example` to `.env`
2. Fill in your actual API keys in `.env`
3. `.env` is automatically ignored by git

#### Cloudflare Pages Production:
1. Go to your Cloudflare Pages dashboard
2. Navigate to Settings > Environment variables
3. Add these variables:
   - `CLAUDE_API_KEY`: Your Claude API key
   - `GITHUB_TOKEN`: Your GitHub personal access token
   - `GITHUB_REPO`: Your repo in format `username/repo-name`
   - `CMS_PASSWORD`: Secure password for CMS access

### GitHub Token Setup

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a classic token with these permissions:
   - `repo` (full repository access)
   - `workflow` (if using GitHub Actions)
3. Add the token to your environment variables

### Security Best Practices

- ✅ Use strong, unique passwords
- ✅ Rotate API keys regularly
- ✅ Set up GitHub security alerts
- ✅ Review access logs periodically
- ❌ Never share keys in chat/email
- ❌ Never commit keys to version control
- ❌ Never use keys in client-side code

### If You Accidentally Expose a Key

1. **Immediately revoke** the exposed key
2. **Generate a new key** 
3. **Update your environment variables**
4. **Check git history** for any commits with keys
5. **Consider rotating related secrets**

### Pre-commit Hooks (Optional)

Install git-secrets to automatically detect API keys:

```bash
# Install git-secrets
brew install git-secrets  # macOS
# or
sudo apt-get install git-secrets  # Ubuntu

# Set up in your repo
git secrets --register-aws
git secrets --install
```

## Additional Security

- All API endpoints include CORS headers
- Input validation and sanitization
- Rate limiting recommended in production
- HTTPS enforced via Cloudflare
- Security headers configured in `wrangler.toml`