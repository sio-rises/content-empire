const fs = require("fs")
const path = require("path")

const ROOT = path.join(__dirname, "sites")

const SITES = [
  { id: "nisa-investment", name: "NISA投資入門", color: "#10b981", desc: "NISA/iDeCoを中心に、初心者向けの投資・資産形成情報を発信", keywords: "NISA, iDeCo, 投資信託, ETF, 資産形成, つみたて, 確定申告" },
  { id: "linux-security", name: "Linuxセキュリティ", color: "#dc2626", desc: "Linuxサーバー・デスクトップのセキュリティ設定を日本語で解説", keywords: "Linux, セキュリティ, ファイアウォール, SSH, fail2ban, SELinux, AppArmor" },
  { id: "vps-server-guide", name: "VPSサーバー構築ガイド", color: "#f59e0b", desc: "VPSを使ったWebサーバー構築・運用の実践ガイド", keywords: "VPS, サーバー, Nginx, Docker, SSL, ConoHa, さくらVPS" },
  { id: "terminal-shell", name: "ターミナル&シェル活用", color: "#06b6d4", desc: "bash/zsh/fish、tmux、Unixコマンドの活用術", keywords: "ターミナル, zsh, bash, fish, tmux, コマンド, シェルスクリプト" },
  { id: "python-beginner", name: "Python入門", color: "#3b82f6", desc: "Pythonプログラミングの基礎から実践までを日本語で解説", keywords: "Python, プログラミング, 入門, Django, Flask, データ分析, 自動化" },
  { id: "oss-tools", name: "OSSツール紹介", color: "#8b5cf6", desc: "便利なオープンソースソフトウェアを紹介・レビュー", keywords: "OSS, オープンソース, ツール, 無料, 代替, レビュー" },
  { id: "gadget-review", name: "ガジェットレビュー", color: "#ec4899", desc: "ガジェット・デバイスの詳細レビューと活用術", keywords: "ガジェット, レビュー, デバイス, 周辺機器, キーボード, モニター" },
  { id: "freelance-guide", name: "副業・フリーランス入門", color: "#f97316", desc: "副業・フリーランスの始め方から確定申告まで", keywords: "副業, フリーランス, 確定申告, クラウドワークス, 開業, 経費" },
]

for (const site of SITES) {
  const dir = path.join(ROOT, site.id)
  if (!fs.existsSync(dir)) continue

  // Fix layout.tsx
  const layoutPath = path.join(dir, "app/layout.tsx")
  let layout = fs.readFileSync(layoutPath, "utf-8")

  // Fix metadata keywords
  layout = layout.replace(
    /keywords: \[.*?\]/,
    `keywords: [${site.keywords.split(", ").map(k => `"${k}"`).join(", ")}]`
  )

  // Fix broken Tailwind color classes - use inline style
  layout = layout.replace(
    /className="text-lg font-bold \[#[\w]+\] hover:opacity-80"/,
    `className="text-lg font-bold hover:opacity-80" style={{color:"${site.color}"}}`
  )
  layout = layout.replace(
    /className="hover:\[#[\w]+\]"/g,
    `className="hover:underline" style={{color:"${site.color}"}}`
  )

  fs.writeFileSync(layoutPath, layout)

  // Fix page.tsx
  const pagePath = path.join(dir, "app/page.tsx")
  let page = fs.readFileSync(pagePath, "utf-8")
  page = page.replace(/text-purple-600/g, `text-[${site.color}]`)
  page = page.replace(/bg-purple-50/g, "bg-green-50")
  fs.writeFileSync(pagePath, page)

  // Fix article page
  const articlePath = path.join(dir, "app/articles/[slug]/page.tsx")
  let article = fs.readFileSync(articlePath, "utf-8")
  article = article.replace(/text-purple-600/g, `text-[${site.color}]`)
  article = article.replace(/bg-purple-50/g, "bg-green-50")
  fs.writeFileSync(articlePath, article)

  // Fix globals.css
  const cssPath = path.join(dir, "app/globals.css")
  let css = fs.readFileSync(cssPath, "utf-8")
  css = css.replace(/#8b5cf6/g, site.color)
  fs.writeFileSync(cssPath, css)

  console.log(`✓ ${site.id}`)
}
console.log("\nAll sites fixed!")
