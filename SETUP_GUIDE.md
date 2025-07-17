# 🚀 Rabbit Holes - Complete Setup Guide

This guide will help you set up the AI-enhanced CMS with all required environment variables and configurations.

## 📋 Prerequisites

- [x] GitHub account
- [x] Cloudflare account  
- [x] Claude API account (for AI features)
- [x] Git installed locally

## 🔧 Step-by-Step Setup

### 1. **Clone and Deploy**

```bash
# Clone the repository
git clone https://github.com/bebhuvan/rabbit-holes.git
cd rabbit-holes

# Install dependencies
npm install

# Test local build
npm run build
```

### 2. **Cloudflare Pages Deployment**

1. **Connect to Cloudflare Pages**:
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Click "Create a project"
   - Connect your GitHub repository
   - Select "rabbit-holes" repository

2. **Configure Build Settings**:
   - **Framework preset**: `Astro`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty)

3. **Deploy**: Click "Save and Deploy"

### 3. **Environment Variables Setup**

The AI CMS requires these environment variables to function:

#### **Required Variables:**

| Variable | Description | Required For |
|----------|-------------|--------------|
| `CLAUDE_API_KEY` | Claude AI API key | AI enhancement, content refinement |
| `GITHUB_TOKEN` | GitHub personal access token | Publishing posts to repository |
| `GITHUB_REPO` | Repository name (e.g., "username/repo-name") | Publishing posts to repository |

#### **How to Add Environment Variables:**

1. **Go to Cloudflare Pages Dashboard**
2. **Select your project** (rabbit-holes)
3. **Go to Settings → Environment Variables**
4. **Add each variable**:
   - Click "Add variable"
   - Enter name and value
   - Select "Production" environment
   - Click "Save"

### 4. **Get API Keys**

#### **Claude API Key** (Required for AI features):

1. **Visit**: [Claude API Console](https://console.anthropic.com/)
2. **Sign up/Login** with your account
3. **Create API Key**:
   - Go to "API Keys" section
   - Click "Create Key"
   - Copy the key (starts with `sk-ant-api03-...`)
4. **Add to Cloudflare**: Use as `CLAUDE_API_KEY`

#### **GitHub Token** (Required for publishing):

1. **Visit**: [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. **Create Classic Token**:
   - Click "Generate new token (classic)"
   - Add description: "Rabbit Holes Blog CMS"
   - Select scopes: `repo` (full control)
   - Click "Generate token"
3. **Copy token** (starts with `ghp_...`)
4. **Add to Cloudflare**: Use as `GITHUB_TOKEN`

#### **GitHub Repository** (Required for publishing):

- **Format**: `username/repository-name`
- **Example**: `bebhuvan/rabbit-holes`
- **Add to Cloudflare**: Use as `GITHUB_REPO`

### 5. **Test the Setup**

After adding environment variables:

1. **Wait for redeployment** (1-2 minutes)
2. **Visit your CMS**: `https://your-site.pages.dev/cms`
3. **Test Functions**: Click "Test Functions" button
4. **Test AI Enhancement**:
   - Add some content
   - Click "Enhance with AI"
   - Should work without errors
5. **Test Publishing**:
   - Create enhanced content
   - Click "Publish to Blog"
   - Should create file in repository

## 🎯 Feature Overview

### **AI-Enhanced CMS Features:**
- ✅ **Content Enhancement**: AI improves structure and flow
- ✅ **Smart Suggestions**: "Dive Deeper" recommendations
- ✅ **Tag Generation**: Automatic tag suggestions
- ✅ **Content Refinement**: Iterative improvement with custom instructions
- ✅ **Direct Publishing**: Pushes to GitHub repository
- ✅ **Draft Management**: Auto-save and draft storage

### **Blog Features:**
- ✅ **Multi-format Posts**: Musings, Links, Videos, Music
- ✅ **Intelligent Search**: Real-time content search
- ✅ **Related Posts**: AI-powered recommendations
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Dark Mode**: System preference detection
- ✅ **SEO Optimized**: Structured data, sitemap, RSS

## 🔧 Development Workflow

### **Local Development:**
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### **Content Creation:**
1. **Use AI CMS**: Visit `/cms` for AI-enhanced creation
2. **Or use PagesCMS**: Visit [PagesCMS](https://app.pagescms.org) for GitHub-integrated editing
3. **Direct editing**: Edit markdown files in `src/content/posts/`

### **Deployment:**
```bash
# Commit changes
git add -A
git commit -m "Your changes"

# Push to trigger auto-deployment
git push origin master
```

## 🚨 Troubleshooting

### **Common Issues:**

#### **"Claude API error: 401"**
- **Problem**: Missing or invalid Claude API key
- **Solution**: Add correct `CLAUDE_API_KEY` to environment variables

#### **"Failed to publish post"**
- **Problem**: Missing GitHub token or repository
- **Solution**: Add `GITHUB_TOKEN` and `GITHUB_REPO` variables

#### **"Functions not working"**
- **Problem**: Cloudflare Functions not deployed
- **Solution**: Check deployment logs, ensure files are in `/functions/` directory

#### **"Nothing happens" when clicking buttons**
- **Problem**: JavaScript errors or network issues
- **Solution**: Check browser console (F12) for error messages

### **Debug Steps:**
1. **Check browser console** for error messages
2. **Test functions** using "Test Functions" button
3. **Verify environment variables** in Cloudflare dashboard
4. **Check deployment logs** in Cloudflare Pages

## 📞 Support

### **Getting Help:**
- **Check documentation**: `README.md`, `FEATURES.md`, `CMS_WORKFLOW.md`
- **Review logs**: Browser console and Cloudflare deployment logs
- **Test endpoints**: Use debugging tools provided in CMS

### **Useful Links:**
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Claude API Docs](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [GitHub Token Guide](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

---

## 🎉 Success Checklist

- [ ] Repository cloned and deployed to Cloudflare Pages
- [ ] Claude API key added to environment variables
- [ ] GitHub token and repository configured
- [ ] CMS accessible at `/cms`
- [ ] "Test Functions" button works
- [ ] AI enhancement creates content
- [ ] Publishing saves to repository
- [ ] Blog displays posts correctly

**Once all items are checked, your AI-enhanced rabbit holes blog is ready!** 🐰✨