import { type NextRequest } from "next/server"
import { generateArticle, reviewArticle, ARTICLE_TEMPLATES } from "@/lib/deepseek"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, keywords, template, language, length, apiKey } = body

    if (!apiKey) {
      return Response.json({ error: "APIキーが必要です" }, { status: 400 })
    }
    if (!topic || !keywords?.length) {
      return Response.json({ error: "トピックとキーワードは必須です" }, { status: 400 })
    }
    if (!ARTICLE_TEMPLATES.includes(template)) {
      return Response.json({ error: `無効なテンプレート: ${template}` }, { status: 400 })
    }

    const article = await generateArticle(
      { topic, keywords, template, language: language || "ja", length: length || "medium" },
      apiKey,
    )

    let review = null
    try {
      review = await reviewArticle(article, apiKey)
    } catch {
      // レビューに失敗しても生成は成功とする
    }

    return Response.json({ article, review })
  } catch (error) {
    const message = error instanceof Error ? error.message : "記事生成に失敗しました"
    return Response.json({ error: message }, { status: 500 })
  }
}
