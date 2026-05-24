#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "📄 Sitemap..."
node scripts/generate-sitemap.js
echo "🔨 Building..."
npm run build && node scripts/inject-ads.js
echo "🚀 Deploying..."
npx wrangler pages deploy out/ --project-name ai-tools --branch main --commit-dirty=true
echo "✅ https://ai-tools.pages.dev/"