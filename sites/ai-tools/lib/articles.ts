import fs from "fs"
import path from "path"

const contentDir = path.join(process.cwd(), "content", "articles")

export interface Article {
  slug: string; title: string; metaDescription: string
  content: string; keywords: string[]; publishedAt: string
}

export function getAllArticles(): Article[] {
  if (!fs.existsSync(contentDir)) return []
  return fs.readdirSync(contentDir)
    .filter((f) => f.endsWith(".json"))
    .map((file) => {
      const data = JSON.parse(fs.readFileSync(path.join(contentDir, file), "utf-8"))
      return { slug: file.replace(".json", ""), title: data.title, metaDescription: data.metaDescription, content: data.content, keywords: data.keywords || [], publishedAt: data.generatedAt || new Date().toISOString() }
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export function getArticleBySlug(slug: string): Article | null {
  const filePath = path.join(contentDir, `${slug}.json`)
  if (!fs.existsSync(filePath)) return null
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"))
  return { slug, title: data.title, metaDescription: data.metaDescription, content: data.content, keywords: data.keywords || [], publishedAt: data.generatedAt || new Date().toISOString() }
}

export function markdownToHtml(markdown: string): string {
  let html = markdown

  // Tables (must be before paragraph wrapping, processed per-block)
  html = html.replace(/(^\|.+$\n)+/gm, (tableBlock) => {
    const rows = tableBlock.trim().split("\n").filter(r => r.includes("|"))
    if (rows.length < 2) return tableBlock

    const parseRow = (r: string, tag: string) =>
      "<tr>" + r.split("|").slice(1, -1).map(c => `<${tag}>${c.trim()}</${tag}>`).join("") + "</tr>"

    const header = parseRow(rows[0], "th")
    const body = rows.slice(2).map(r => parseRow(r, "td")).join("\n")

    if (rows[1].match(/^\|[\s\-:]+\|/)) {
      return `<table><thead>${header}</thead><tbody>${body}</tbody></table>`
    }
    return `<table>${header}${body}</table>`
  })

  html = html.replace(/^##### (.+)$/gm, "<h5>$1</h5>")
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>")
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>")
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>")
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>")
  html = html.replace(/^\- (.+)$/gm, "<li>$1</li>")
  html = html.replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => `<pre><code class="language-${lang || ""}">${code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`)
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>")
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
  html = html.replace(/^---$/gm, "<hr>")

  html = html.split(/\n{2,}/).map((block) => {
    const t = block.trim()
    if (!t) return ""
    if (t.startsWith("<table") || t.startsWith("<h") || t.startsWith("<pre") || t.startsWith("<blockquote") || t.startsWith("<li") || t.startsWith("<hr") || t.startsWith("<ul") || t.startsWith("<ol")) return t
    return `<p>${t}</p>`
  }).join("\n")

  html = html.replace(/((?:<li>[\\s\\S]*?<\/li>\n?)+)/g, "<ul>$1</ul>")
  return html
}
