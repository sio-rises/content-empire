import { getAllArticles } from "@/lib/articles"

export default function Home() {
  const articles = getAllArticles()
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <section className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Linuxセキュリティ</h1>
        <p className="mt-2 text-lg text-gray-500">OpenCode/ClaudeCode/DeepSeekを使ったAIエージェント開発自動化の情報を日本語で発信</p>
      </section>
      {articles.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400">まだ記事がありません。</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {articles.map((article) => (
            <a key={article.slug} href={`/articles/${article.slug}`} className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#dc2626]">{article.title}</h2>
              <p className="mt-2 text-sm text-gray-500">{article.metaDescription}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {article.keywords.map((k) => <span key={k} className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs text-[#dc2626]">{k}</span>)}
              </div>
              <p className="mt-3 text-xs text-gray-400">{new Date(article.publishedAt).toLocaleDateString("ja-JP")}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
