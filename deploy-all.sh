#!/bin/bash
set -e
SITES=(arch-linux-guide ai-agent-guide nisa-investment linux-security vps-server-guide terminal-shell python-beginner oss-tools freelance-guide ai-tools)
BASE="$(cd "$(dirname "$0")" && pwd)/sites"

for site in "${SITES[@]}"; do
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━"
  echo "🚀 $site"
  echo "━━━━━━━━━━━━━━━━━━━━━━"
  cd "$BASE/$site"
  bash deploy.sh 2>&1 | tail -1
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All 10 sites deployed!"
echo "━━━━━━━━━━━━━━━━━━━━━━"
