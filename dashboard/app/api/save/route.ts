import { type NextRequest } from "next/server"
import fs from "fs"
import path from "path"

const SITES_DIR = path.join(process.cwd(), "..", "sites")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { siteId, article } = body

    if (!siteId || !article) {
      return Response.json({ error: "siteIdとarticleは必須です" }, { status: 400 })
    }

    const siteDir = path.join(SITES_DIR, siteId)
    if (!fs.existsSync(siteDir)) {
      return Response.json({ error: `サイトが見つかりません: ${siteId}` }, { status: 404 })
    }

    const contentDir = path.join(siteDir, "content", "articles")
    fs.mkdirSync(contentDir, { recursive: true })

    const slug = article.slug || article.title?.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") || `article-${Date.now()}`
    const filePath = path.join(contentDir, `${slug}.json`)

    const data = {
      title: article.title,
      slug,
      metaDescription: article.metaDescription,
      content: article.content,
      keywords: article.keywords || [],
      template: article.template,
      generatedAt: article.generatedAt || new Date().toISOString(),
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")

    return Response.json({ success: true, slug, path: filePath })
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存に失敗しました"
    return Response.json({ error: message }, { status: 500 })
  }
}
