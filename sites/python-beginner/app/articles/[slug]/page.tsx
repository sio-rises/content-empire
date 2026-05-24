import { getAllArticles, getArticleBySlug, markdownToHtml } from "@/lib/articles"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }))
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()
  const html = markdownToHtml(article.content)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{article.title}</h1>
          <p className="mt-2 text-gray-500">{article.metaDescription}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {article.keywords.map((k) => <span key={k} className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs text-[#3b82f6]">{k}</span>)}
            <span className="text-xs text-gray-400">{new Date(article.publishedAt).toLocaleDateString("ja-JP")}</span>
          </div>
        </header>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
      <div className="mt-12 border-t border-gray-200 pt-6">
        <a href="/" className="text-sm text-ai hover:underline">← 記事一覧に戻る</a>
      </div>
    </div>
  )
}
