#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "📄 Generating sitemap..."
node scripts/generate-sitemap.js
echo "🔨 Building..."
npm run build && node scripts/inject-ads.js
echo "🚀 Deploying to Cloudflare Pages..."
npx wrangler pages deploy out/ --project-name arch-linux-guide --branch main --commit-dirty=true
echo "✅ Done: https://arch-linux-guide.pages.dev/"
