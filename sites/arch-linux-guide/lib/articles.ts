import fs from "fs"
import path from "path"

const contentDir = path.join(process.cwd(), "content", "articles")

export interface Article {
  slug: string
  title: string
  metaDescription: string
  content: string
  keywords: string[]
  publishedAt: string
}

export function getAllArticles(): Article[] {
  if (!fs.existsSync(contentDir)) return []

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".json"))

  const articles = files
    .map((file) => {
      const raw = fs.readFileSync(path.join(contentDir, file), "utf-8")
      const data = JSON.parse(raw)
      return {
        slug: file.replace(".json", ""),
        title: data.title,
        metaDescription: data.metaDescription,
        content: data.content,
        keywords: data.keywords || [],
        publishedAt: data.generatedAt || data.publishedAt || new Date().toISOString(),
      }
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return articles
}

export function getArticleBySlug(slug: string): Article | null {
  const filePath = path.join(contentDir, `${slug}.json`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, "utf-8")
  const data = JSON.parse(raw)

  return {
    slug,
    title: data.title,
    metaDescription: data.metaDescription,
    content: data.content,
    keywords: data.keywords || [],
    publishedAt: data.generatedAt || data.publishedAt || new Date().toISOString(),
  }
}

export function markdownToHtml(markdown: string): string {
  let html = markdown

  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>")
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>")
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>")

  html = html.replace(/^- (.+)$/gm, "<li>$1</li>")
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>")

  html = html.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    (_: string, lang: string, code: string) => {
      const escaped = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
      return `<pre><code class="language-${lang || ""}">${escaped}</code></pre>`
    },
  )

  html = html.replace(/`([^`]+)`/g, "<code>$1</code>")

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>")

  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>',
  )

  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")

  html = html.replace(/^---$/gm, "<hr>")

  html = html
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim()
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<li") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<table")
      ) {
        return trimmed
      }
      if (trimmed.startsWith("<ul>") || trimmed.startsWith("<ol>")) return trimmed
      if (trimmed) return `<p>${trimmed}</p>`
      return ""
    })
    .join("\n")

  html = html.replace(/(<li>[\s\S]*?<\/li>)\s*(<li>)/g, "$1\n$2")
  html = html.replace(
    /((?:<li>[\s\S]*?<\/li>\n?)+)/g,
    (match) => `<ul>\n${match}</ul>`,
  )

  return html
}
