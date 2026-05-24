const fs = require("fs")
const path = require("path")

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY
if (!DEEPSEEK_KEY) { console.error("DEEPSEEK_API_KEY を設定してください"); process.exit(1) }

const SITES = [
  { id: "arch-linux-guide", name: "Arch Linux日本語ガイド", topic: "Linux", color: "arch" },
  { id: "ai-agent-guide", name: "AIエージェント活用", topic: "AIエージェント", color: "ai" },
  { id: "nisa-investment", name: "NISA投資入門", topic: "投資", color: "money" },
  { id: "linux-security", name: "Linuxセキュリティ", topic: "セキュリティ", color: "security" },
  { id: "vps-server-guide", name: "VPSサーバー構築", topic: "サーバー", color: "server" },
  { id: "terminal-shell", name: "ターミナル&シェル", topic: "CLI", color: "cli" },
  { id: "python-beginner", name: "Python入門", topic: "プログラミング", color: "python" },
  { id: "oss-tools", name: "OSSツール紹介", topic: "OSS", color: "oss" },
  { id: "freelance-guide", name: "副業フリーランス", topic: "ビジネス", color: "business" },
  { id: "ai-tools", name: "AIツール比較", topic: "AIツール", color: "aitools" },
]

function getStats() {
  const base = path.join(__dirname, "sites")
  const stats = []
  let total = 0
  for (const site of SITES) {
    const adir = path.join(base, site.id, "content", "articles")
    const count = fs.existsSync(adir) ? fs.readdirSync(adir).filter(f => f.endsWith(".json")).length : 0
    total += count
    stats.push({ ...site, count })
  }
  stats.push({ id: "total", name: "合計", topic: "全体", color: "total", count: total })
  return stats
}

function getRecentArticles() {
  const base = path.join(__dirname, "sites")
  const recent = []
  for (const site of SITES) {
    const adir = path.join(base, site.id, "content", "articles")
    if (!fs.existsSync(adir)) continue
    for (const fname of fs.readdirSync(adir)) {
      if (!fname.endsWith(".json")) continue
      try {
        const d = JSON.parse(fs.readFileSync(path.join(adir, fname), "utf-8"))
        recent.push({ site: site.name, title: d.title, slug: d.slug, date: d.generatedAt })
      } catch {}
    }
  }
  return recent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
}

async function generateTweets() {
  const stats = getStats()
  const total = stats.find(s => s.id === "total").count
  const siteList = SITES.map(s => `  - ${s.name} (${stats.find(x => x.id === s.id).count}記事)`).join("\n")
  const recent = getRecentArticles()
  const recentList = recent.slice(0, 5).map(a => `  - 「${a.title}」(${a.site})`).join("\n")

  const now = new Date()
  const dateStr = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`

  const system = `あなたはSioという19歳の開発者です。以下の特徴を持つ人物として、X(Twitter)に投稿する #BuildInPublic ツイートを作ってください。

Sioの人物像:
- 19歳。高校中退。ADHDとトゥレット症候群がある
- Arch Linuxを手動インストールできる（btrfs + LUKS暗号化）
- OpenCodeを毎日使っている。AIエージェントにSSH経由でNixOSをインストールさせたことがある
- DeepSeek APIのヘビーユーザー（安すぎて笑ってしまう）
- 現在10サイト198記事のAIコンテンツ帝国を1人で運営中
- 目標: 月50万円の収益。Build in Publicで全記録を公開中
- マーケティング経験ゼロ。人と話すのは苦手
- でも金を稼いで家族を安心させたいという強い意志がある
- 口調: ストレート、感情的。たまに自虐的。でも芯は熱い
- 語尾: 「〜だ」「〜だな」「〜だよ」「〜してる」「〜してくれ」

ツイートのルール:
- 必ず280文字以内（Xの制限）
- #BuildInPublic タグを必ず入れる（1つだけ）
- 今日の日付は${dateStr}
- 絵文字は使わない
- 改行は最小限
- 自慢話と挫折話を混ぜる
- 数字を具体的に出す（PV、収益、記事数など）
- 「OpenCode」「DeepSeek」などの固有名詞を自然に入れる
- 1つのツイートに1つのメッセージだけ
- ハッシュタグは #BuildInPublic のみ`

  const user = `以下のコンテキストをもとに、7日分（14ツイート: 朝8時用7つ + 夜20時用7つ）のツイートを作成してください。

【現在のサイト状況】
10サイト運営中、合計${total}記事:
${siteList}

【最近生成した記事】
${recentList}

【ツイートカレンダー】（各日、朝=技術・作業系、夜=感情・進捗系）
Day1朝: 今日やる作業の宣言
Day1夜: 今日の成果報告
Day2朝: 技術的な気づき・発見
Day2夜: 失敗談・苦労話
Day3朝: 具体的な数字（PV・収益など）
Day3夜: モチベーション・哲学
Day4朝: AI活用法のコツ
Day4夜: 競合や市場についての考察
Day5朝: 今日のタスク
Day5夜: 小さな勝利
Day6朝: 読者からの質問に答える体
Day6夜: 過去の自分へのアドバイス
Day7朝: 来週の目標
Day7夜: 応援してくれる人への感謝

出力形式（JSON配列）:
[
  {"day": 1, "time": "morning", "text": "..."},
  {"day": 1, "time": "evening", "text": "..."},
  ...
]`

  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${DEEPSEEK_KEY}` },
    body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: system }, { role: "user", content: user }], temperature: 0.9, max_tokens: 6000, response_format: { type: "json_object" } }),
  })
  
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json()
  const tweets = JSON.parse(data.choices[0].message.content)
  
  // Save tweets
  const outPath = path.join(__dirname, "tweets.json")
  const existing = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, "utf-8")) : []
  
  const newTweets = Array.isArray(tweets) ? tweets : tweets.tweets || []
  const all = [...existing, ...newTweets.map(t => ({ ...t, generatedAt: new Date().toISOString() }))]
  fs.writeFileSync(outPath, JSON.stringify(all, null, 2), "utf-8")

  console.log(`✓ ${newTweets.length} tweets generated → tweets.json\n`)
  console.log("【今週のツイート予定】\n")
  for (const t of newTweets) {
    const dayName = ["月","火","水","木","金","土","日"][t.day - 1] || `Day${t.day}`
    const timeIcon = t.time === "morning" ? "🌅 朝8時" : "🌙 夜20時"
    console.log(`${dayName} ${timeIcon}`)
    console.log(`${t.text}\n`)
  }
}

generateTweets().catch(e => { console.error(e.message); process.exit(1) })
