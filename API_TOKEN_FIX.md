# 🔑 Fix API Token Permissions for Automatic Deployment

## 🚨 Current Issue
GitHub Actions deployment is failing with this error:
```
Authentication error [code: 10000]
Are you missing the 'User->User Details->Read' permission?
```

## ✅ What's Working
- ✅ Build process is perfect
- ✅ Node.js v20 and Wrangler v4 configured
- ✅ GitHub Actions workflow is set up correctly
- ✅ Local deployment works fine

## 🔧 Fix Steps

### Step 1: Update Cloudflare API Token

1. **Go to**: https://dash.cloudflare.com/profile/api-tokens
2. **Find your existing token** (the one currently failing)
3. **Click "Edit"** on that token
4. **Add these EXACT permissions**:

#### Required Permissions:
- ✅ **Account** → **Workers Scripts** → **Edit**
- ✅ **User** → **User Details** → **Read** ⚠️ **THIS IS MISSING!**
- ✅ **Account Resources**: Include → All accounts
- ✅ **Zone Resources**: Include → All zones

5. **Click "Save"** to update the token

### Step 2: Update GitHub Secret

1. **Go to**: https://github.com/bebhuvan/rabbit-holes/settings/secrets/actions
2. **Find**: `CLOUDFLARE_API_TOKEN`
3. **Click "Update"**
4. **Paste the updated token** (with new permissions)
5. **Click "Update secret"**

### Step 3: Test Automatic Deployment

1. **Create a test post** in PagesCMS
2. **Watch GitHub Actions**: https://github.com/bebhuvan/rabbit-holes/actions
3. **Verify deployment** succeeds
4. **Check Workers URL**: https://rabbit-holes.r-bhuvanesh2007.workers.dev

## 🎯 Expected Result

After fixing the API token:
- ✅ **Automatic deployment** when PagesCMS pushes changes
- ✅ **No more authentication errors**
- ✅ **Same workflow** as Pages had before

## 🔍 Troubleshooting

If it still fails:
1. **Double-check permissions** - Make sure "User Details → Read" is added
2. **Verify token is updated** in GitHub secrets
3. **Check GitHub Actions logs** for specific error messages
4. **Try creating a new token** if the current one has issues

## 📋 Summary

The migration is **99% complete** - we just need this API token fix for automatic deployment to work!
