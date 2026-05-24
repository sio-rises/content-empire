const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

const ROOT = path.join(__dirname, "sites")

const SITES = [
  { id: "nisa-investment", name: "NISA投資入門", color: "#10b981", niche: "投資・資産形成", desc: "NISA/iDeCoを中心に、初心者向けの投資・資産形成情報を発信", keywords: ["NISA", "iDeCo", "投資信託", "ETF", "資産形成", "つみたて", "確定申告"] },
  { id: "linux-security", name: "Linuxセキュリティ", color: "#dc2626", niche: "セキュリティ", desc: "Linuxサーバー・デスクトップのセキュリティ設定を日本語で解説", keywords: ["Linux", "セキュリティ", "ファイアウォール", "SSH", "fail2ban", "SELinux", "AppArmor"] },
  { id: "vps-server-guide", name: "VPSサーバー構築ガイド", color: "#f59e0b", niche: "サーバー構築", desc: "VPSを使ったWebサーバー構築・運用の実践ガイド", keywords: ["VPS", "サーバー", "Nginx", "Docker", "SSL", "ConoHa", "さくらVPS"] },
  { id: "terminal-shell", name: "ターミナル&シェル活用", color: "#06b6d4", niche: "CLI", desc: "bash/zsh/fish、tmux、Unixコマンドの活用術", keywords: ["ターミナル", "zsh", "bash", "fish", "tmux", "コマンド", "シェルスクリプト"] },
  { id: "python-beginner", name: "Python入門", color: "#3b82f6", niche: "プログラミング", desc: "Pythonプログラミングの基礎から実践までを日本語で解説", keywords: ["Python", "プログラミング", "入門", "Django", "Flask", "データ分析", "自動化"] },
  { id: "oss-tools", name: "OSSツール紹介", color: "#8b5cf6", niche: "ツール紹介", desc: "便利なオープンソースソフトウェアを紹介・レビュー", keywords: ["OSS", "オープンソース", "ツール", "無料", "代替", "レビュー"] },
  { id: "gadget-review", name: "ガジェットレビュー", color: "#ec4899", niche: "ガジェット", desc: "ガジェット・デバイスの詳細レビューと活用術", keywords: ["ガジェット", "レビュー", "デバイス", "周辺機器", "キーボード", "モニター"] },
  { id: "freelance-guide", name: "副業・フリーランス入門", color: "#f97316", niche: "ビジネス", desc: "副業・フリーランスの始め方から確定申告まで", keywords: ["副業", "フリーランス", "確定申告", "クラウドワークス", "開業", "経費"] },
]

const TEMPLATE_DIR = path.join(ROOT, "ai-agent-guide")

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, "utf-8")
  for (const [from, to] of Object.entries(replacements)) {
    content = content.replaceAll(from, to)
  }
  fs.writeFileSync(filePath, content)
}

function createSite(site) {
  const dir = path.join(ROOT, site.id)

  if (fs.existsSync(dir)) {
    console.log(`  ⚠ ${site.id} already exists, skipping`)
    return
  }

  // Copy everything except node_modules, .next, out, content
  execSync(`rsync -a --exclude 'node_modules' --exclude '.next' --exclude 'out' --exclude 'content' --exclude 'package-lock.json' ${TEMPLATE_DIR}/ ${dir}/`, { stdio: "pipe" })

  // Replace site-specific values
  const nameSlug = site.name
  const files = [
    "app/layout.tsx",
    "app/page.tsx",
    "package.json",
  ]

  for (const f of files) {
    const fp = path.join(dir, f)
    if (!fs.existsSync(fp)) continue
    replaceInFile(fp, {
      "AIエージェント活用ガイド": nameSlug,
      "ai-agent-guide": site.id,
      "OpenCode/ClaudeCode/DeepSeekを使ったAIエージェント開発自動化の情報を日本語で発信。": site.desc,
      "OpenCode, ClaudeCode, AIエージェント, DeepSeek, 開発自動化, プロンプト": site.keywords.join(", "),
      "#8b5cf6": site.color,
      "text-ai": `text-[${site.color}]`,
      "hover:text-ai": `hover:text-[${site.color}]`,
      "text-ai hover:underline": `text-[${site.color}] hover:underline`,
      "bg-purple-50": "bg-green-50",
      "text-purple-600": `text-[${site.color}]`,
    })
  }

  // Fix layout.tsx color class
  const layoutPath = path.join(dir, "app/layout.tsx")
  let layout = fs.readFileSync(layoutPath, "utf-8")
  layout = layout.replace(/text-\[#\w+\]/g, site.color).replace(/text-\[\w+\]/g, site.color)
  // Use Tailwind arbitrary color
  layout = layout.replace(new RegExp(site.color.replace("#", "#"), "g"), `[${site.color}]`)
  layout = layout.replace(/class="text-lg font-bold text-\[([^\]]+)\]/, `className="text-lg font-bold" style={{color:"${site.color}"}}`)
  fs.writeFileSync(layoutPath, layout)

  // Create content dir
  fs.mkdirSync(path.join(dir, "content", "articles"), { recursive: true })

  // Create deploy.sh
  const deploySh = `#!/bin/bash\nset -e\ncd "$(dirname "$0")"\necho "📄 Sitemap..."\nnode scripts/generate-sitemap.js\necho "🔨 Building..."\nnpm run build\necho "🚀 Deploying..."\nnpx wrangler pages deploy out/ --project-name ${site.id} --branch main --commit-dirty=true\necho "✅ https://${site.id}.pages.dev/"`
  fs.writeFileSync(path.join(dir, "deploy.sh"), deploySh)
  execSync(`chmod +x ${path.join(dir, "deploy.sh")}`, { stdio: "pipe" })

  // Create .gitignore
  fs.writeFileSync(path.join(dir, ".gitignore"), "node_modules/\n.next/\nout/\n.env\n.env.local\n")

  // Update robots.txt
  fs.writeFileSync(path.join(dir, "app/robots.txt"), `User-Agent: *\nAllow: /\n\nSitemap: https://${site.id}.pages.dev/sitemap.xml\n`)

  // Create Cloudflare Pages project
  try {
    execSync(`cd "${dir}" && npx wrangler pages project create ${site.id} --production-branch main 2>&1`, { stdio: "pipe", timeout: 15000 })
    console.log(`  ✓ ${site.id} - Cloudflare project created`)
  } catch {
    console.log(`  ⚠ ${site.id} - Cloudflare project may already exist`)
  }

  console.log(`  ✓ ${site.id} - ${site.name}`)
}

let count = 0
for (const site of SITES) {
  createSite(site)
  count++
}
console.log(`\n${count} sites created!`)
console.log("Run 'npm install' in each site directory, then generate articles.")
