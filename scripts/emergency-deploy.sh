#!/bin/bash

# Emergency deployment script for when GitHub Actions fails
# Run this locally: ./scripts/emergency-deploy.sh

echo "🚨 Emergency Deployment Script"
echo "=============================="
echo "This script helps deploy your blog when GitHub Actions is having issues"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this from the project root."
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command_exists node; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Step 1: Clean and install dependencies
echo "🧹 Cleaning npm cache..."
npm cache clean --force 2>/dev/null || true

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --no-audit || {
    echo "⚠️  npm install failed, trying with --force..."
    npm install --force --no-audit
}

# Step 2: Build the project
echo "🔨 Building the project..."
npm run build || {
    echo "⚠️  Build failed with standard settings, trying with increased memory..."
    NODE_OPTIONS="--max-old-space-size=4096" npm run build || {
        echo "⚠️  Build still failing, trying production mode..."
        NODE_ENV=production npm run build || {
            echo "❌ Build failed completely. Please check for errors in your latest post."
            exit 1
        }
    }
}

# Step 3: Deploy to Cloudflare
echo "🚀 Deploying to Cloudflare Workers..."

# Check if wrangler is installed
if ! command_exists wrangler; then
    echo "📥 Installing wrangler..."
    npm install -g wrangler
fi

# Check for authentication
echo "🔐 Checking Cloudflare authentication..."
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "⚠️  CLOUDFLARE_API_TOKEN not set. You'll need to login manually."
    wrangler login
fi

# Deploy
wrangler deploy || {
    echo "⚠️  Deployment failed, retrying..."
    sleep 5
    wrangler deploy || {
        echo "❌ Deployment failed. Please check your Cloudflare settings."
        exit 1
    }
}

echo ""
echo "✅ Emergency deployment complete!"
echo "🌐 Your blog should be live at your domain"
echo ""
echo "📝 Remember to:"
echo "   1. Check your site to ensure the new post is visible"
echo "   2. Commit and push your changes to Git when possible"
echo "   3. Investigate why the GitHub Action failed"