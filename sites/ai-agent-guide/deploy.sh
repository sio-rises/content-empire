#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "📄 Generating sitemap..."
node scripts/generate-sitemap.js
echo "🔨 Building..."
npm run build && node scripts/inject-ads.js
echo "🚀 Deploying to Cloudflare Pages..."
npx wrangler pages deploy out/ --project-name ai-agent-guide --branch main --commit-dirty=true
echo "✅ Done: https://ai-agent-guide.pages.dev/"
