const fs = require("fs")
const path = require("path")

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY
if (!DEEPSEEK_KEY) { console.error("DEEPSEEK_API_KEY を設定してください"); process.exit(1) }

const SITE_DIR = path.join(__dirname, "sites", "ai-agent-guide", "content", "articles")
fs.mkdirSync(SITE_DIR, { recursive: true })

const ARTICLES = [
  { topic: "OpenCodeとは 使い方 基本ガイド", keywords: ["OpenCode", "使い方", "AIエージェント", "コーディング", "CLIツール", "入門"], template: "explainer" },
  { topic: "OpenCodeとClaudeCodeの違い 比較", keywords: ["OpenCode", "ClaudeCode", "比較", "AIエージェント", "どっち", "開発ツール"], template: "comparison" },
  { topic: "AIエージェントにSSH越しでNixOSをインストールさせた方法", keywords: ["AIエージェント", "NixOS", "SSH", "ClaudeCode", "遠隔操作", "OSインストール", "自動化"], template: "tutorial" },
  { topic: "DeepSeek API 使い方 料金 設定", keywords: ["DeepSeek API", "使い方", "料金", "設定", "APIキー", "OpenAI比較", "安い"], template: "explainer" },
  { topic: "DeepSeek vs OpenAI vs Anthropic API 比較", keywords: ["DeepSeek", "OpenAI", "Anthropic", "API比較", "料金", "性能", "どれ"], template: "comparison" },
  { topic: "OpenCodeでWebアプリ開発 始め方", keywords: ["OpenCode", "Webアプリ", "開発", "Next.js", "React", "AIコーディング", "入門"], template: "tutorial" },
  { topic: "AIエージェント プロンプトエンジニアリング コツ", keywords: ["AIエージェント", "プロンプトエンジニアリング", "コツ", "効率化", "指示の出し方"], template: "explainer" },
  { topic: "OpenCodeのスキルシステム カスタマイズ方法", keywords: ["OpenCode", "スキル", "カスタマイズ", "拡張", "MCP", "プラグイン"], template: "tutorial" },
  { topic: "AIエージェントに作業を任せる時の注意点", keywords: ["AIエージェント", "注意点", "ハルシネーション", "セキュリティ", "レビュー", "リスク"], template: "explainer" },
  { topic: "ClaudeCodeでサーバー管理を自動化する方法", keywords: ["ClaudeCode", "サーバー管理", "自動化", "SSH", "DevOps", "運用"], template: "tutorial" },
  { topic: "AIエージェント MCPサーバー 連携 設定", keywords: ["AIエージェント", "MCP", "サーバー", "連携", "設定", "ツール", "拡張"], template: "explainer" },
  { topic: "OpenCode CLI インストール セットアップ", keywords: ["OpenCode", "CLI", "インストール", "セットアップ", "npm", "ターミナル"], template: "howto" },
  { topic: "AIエージェントを使ったブログ記事自動生成 完全ガイド", keywords: ["AIエージェント", "ブログ", "記事自動生成", "SEO", "DeepSeek", "コンテンツ"], template: "tutorial" },
  { topic: "AIコーディングツール GitHub Copilot vs Cursor vs OpenCode 比較", keywords: ["AIコーディング", "GitHub Copilot", "Cursor", "OpenCode", "比較", "開発効率"], template: "comparison" },
  { topic: "初心者でもわかる AIエージェントとは", keywords: ["AIエージェント", "初心者", "とは", "仕組み", "LLM", "自動化", "解説"], template: "explainer" },
  { topic: "OpenCodeでテストコードを自動生成する方法", keywords: ["OpenCode", "テストコード", "自動生成", "TDD", "Jest", "品質"], template: "tutorial" },
  { topic: "AIエージェントの活用事例 2025年最新", keywords: ["AIエージェント", "活用事例", "2025", "最新", "開発", "業務効率化"], template: "explainer" },
  { topic: "DeepSeek APIでコンテンツ量産 コスト試算", keywords: ["DeepSeek API", "コンテンツ", "量産", "コスト", "試算", "SEO", "自動化"], template: "explainer" },
]

async function generate(opts) {
  const system = `あなたはAIエージェント/LLM開発に関する技術記事を書くプロの日本語ライターです。
実用的で具体的な情報を提供してください。

ルール:
- 存在しないコマンドやAPIは絶対に書かない
- コードブロックは言語指定
- 文字数: 1500〜2500字
- アフィリエイト臭禁止`

  const user = `以下のテンプレートで記事を書いて。

【テンプレート】${opts.template}
【メインKW】${opts.keywords[0]}
【サブKW】${opts.keywords.slice(1).join(", ")}
【トピック】${opts.topic}

出力はJSON: {"title":"...","slug":"...","metaDescription":"...","content":"Markdown本文"}`

  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${DEEPSEEK_KEY}` },
    body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: system }, { role: "user", content: user }], temperature: 0.7, max_tokens: 8000, response_format: { type: "json_object" } }),
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json()
  return JSON.parse(data.choices[0].message.content)
}

async function main() {
  for (let i = 0; i < ARTICLES.length; i++) {
    const a = ARTICLES[i]
    console.log(`[${i + 1}/${ARTICLES.length}] ${a.topic}`)
    try {
      const article = await generate(a)
      const file = path.join(SITE_DIR, `${article.slug}.json`)
      fs.writeFileSync(file, JSON.stringify({ ...article, keywords: a.keywords, template: a.template, generatedAt: new Date().toISOString() }, null, 2), "utf-8")
      console.log(`  ✓ ${article.slug}`)
    } catch (e) { console.error(`  ✗ ${e.message}`) }
  }
  console.log(`\n完了! ${ARTICLES.length}記事`)
}

main().catch(console.error)
