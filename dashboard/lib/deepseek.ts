const DEEPSEEK_BASE = "https://api.deepseek.com/v1"
const DEEPSEEK_MODEL = "deepseek-chat"

export interface GenerateOptions {
  topic: string
  keywords: string[]
  template: ArticleTemplate
  language: "ja" | "en"
  length: "short" | "medium" | "long"
}

export const ARTICLE_TEMPLATES = [
  "howto",
  "comparison",
  "explainer",
  "review",
  "tutorial",
] as const
export type ArticleTemplate = (typeof ARTICLE_TEMPLATES)[number]

export interface GeneratedArticle {
  title: string
  slug: string
  metaDescription: string
  content: string
  keywords: string[]
  template: ArticleTemplate
  generatedAt: string
}

function buildPrompt(opts: GenerateOptions): { system: string; user: string } {
  const wordCount =
    opts.length === "short" ? "800〜1200字" : opts.length === "medium" ? "1500〜2500字" : "3000〜5000字"
  const lang = opts.language === "ja" ? "日本語" : "English"

  const templateGuide: Record<ArticleTemplate, string> = {
    howto: `ハウツーガイド形式。
- 導入: この記事で解決できること、対象読者、前提知識
- 手順: ステップ1から順に具体的に。コマンド例はコードブロックで
- トラブルシューティング: よくあるエラーと対処法
- まとめ: 次のステップの提案`,
    comparison: `比較記事形式。
- 導入: 比較する2〜3つのツール/技術の概要
- 比較表: Markdownテーブルで主要スペックを一覧
- 各項目の詳細: それぞれの長所短所を掘り下げ
- 結論: どういう人にどれがおすすめか`,
    explainer: `用語・概念の解説形式。
- 定義: 初心者にもわかる定義
- 背景: なぜ必要なのか、歴史的背景
- 仕組み: 図表的な説明（テキストで）
- 実用例: 実際のコードやコマンド例
- よくある誤解: 間違えやすいポイント`,
    review: `レビュー形式。
- 製品/サービスの概要
- 良い点（3〜5個、具体的に）
- 悪い点（正直に）
- どんな人におすすめか
- 代替との比較（簡潔に）`,
    tutorial: `チュートリアル形式。
- 目標: このチュートリアルで達成できること
- 前提条件: 必要な環境、知識
- Step-by-step: 各ステップをコード付きで
- 動作確認: 完成したか確認する方法
- 発展: さらに学ぶためのリソース`,
  }

  const system = `あなたはSEO最適化された技術記事を書くプロの${lang}ライターです。
読者は初心者〜中級者です。検索意図を理解し、実用的で具体的な情報を提供してください。

重要なルール:
- コードブロックは必ず言語指定すること
- 見出しはh2(##)とh3(###)を使用
- 箇条書きや表を積極的に使って読みやすく
- 主観的な断言は避け、根拠を示す
- アフィリエイト臭やセールス臭は絶対に出さない
- 全てのシェルコマンドは実在するものだけを使う。mount --mkdir のような存在しないオプションをでっち上げてはいけない
- Linuxの手順を書く場合：ディレクトリ作成とマウントは分けて mkdir -p <dir> && mount <dev> <dir> と書く
- pacstrapの-Kオプションは初心者向け記事では不要なので付けない
- コマンドの役割を1行で説明すること
- 文字数: ${wordCount}`

  const user = `以下のテンプレートとキーワードに従って記事を書いてください。

【テンプレート】${opts.template}
${templateGuide[opts.template]}

【メインキーワード】${opts.keywords[0]}
【サブキーワード】${opts.keywords.slice(1).join(", ")}

【トピック】${opts.topic}

出力形式: JSON
{
  "title": "SEO最適化されたタイトル（キーワードを含む、60文字以内）",
  "slug": "url-friendly-slug",
  "metaDescription": "メタディスクリプション（120文字以内、キーワードを含む）",
  "content": "Markdown形式の記事本文"
}`

  return { system, user }
}

export async function generateArticle(
  opts: GenerateOptions,
  apiKey: string,
): Promise<GeneratedArticle> {
  const { system, user } = buildPrompt(opts)

  const response = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
      max_tokens: opts.length === "long" ? 16000 : opts.length === "medium" ? 8000 : 4000,
      response_format: { type: "json_object" },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DeepSeek API error ${response.status}: ${error}`)
  }

  const data = await response.json()
  const raw = data.choices?.[0]?.message?.content

  if (!raw) {
    throw new Error("DeepSeek API returned empty response")
  }

  let parsed: { title: string; slug: string; metaDescription: string; content: string }
  try {
    parsed = JSON.parse(raw)
  } catch {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("Failed to parse article JSON from response")
    parsed = JSON.parse(jsonMatch[0])
  }

  return {
    ...parsed,
    keywords: opts.keywords,
    template: opts.template,
    generatedAt: new Date().toISOString(),
  }
}

export async function reviewArticle(
  article: GeneratedArticle,
  apiKey: string,
): Promise<{ score: number; feedback: string }> {
  const response = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        {
          role: "system",
          content: `あなたは技術記事の品質レビュアーです。
以下の観点で記事を10点満点で採点し、改善点を箇条書きで指摘してください。

採点基準:
- 正確性: 技術的に正しいか（4点）
- 網羅性: 検索意図を満たしているか（3点）
- 可読性: 初心者にもわかりやすいか（2点）
- SEO: キーワードが適切に含まれているか（1点）

JSON形式で返してください: { "score": 数値, "feedback": "改善点の箇条書き（Markdown）" }`,
        },
        {
          role: "user",
          content: `【タイトル】${article.title}
【キーワード】${article.keywords.join(", ")}
【本文】
${article.content}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    }),
  })

  if (!response.ok) {
    throw new Error(`Review API error ${response.status}`)
  }

  const data = await response.json()
  const raw = data.choices?.[0]?.message?.content
  return JSON.parse(raw)
}
