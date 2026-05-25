const fs = require("fs")
const path = require("path")

const BASE_URL = "https://arch.endoarata.jp"
const SITE_ROOT = path.join(__dirname, "..")
const CONTENT_DIR = path.join(SITE_ROOT, "content", "articles")
const PUBLIC_DIR = path.join(SITE_ROOT, "public")

fs.mkdirSync(PUBLIC_DIR, { recursive: true })

const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".json"))

const urls = files.map((file) => {
  const data = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8"))
  const date = (data.generatedAt || new Date().toISOString()).split("T")[0]
  return `  <url>
    <loc>${BASE_URL}/articles/${data.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
})

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${urls.join("\n")}
</urlset>
`

fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), sitemap)
console.log(`✓ sitemap.xml generated (${files.length} articles)`)
