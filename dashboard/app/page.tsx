"use client"

import { useState } from "react"
import { SITES, type SiteConfig } from "@/lib/sites"
import type { ArticleTemplate, GeneratedArticle } from "@/lib/deepseek"
import { ARTICLE_TEMPLATES } from "@/lib/deepseek"

interface ResultData {
  article: GeneratedArticle
  review: { score: number; feedback: string } | null
}

export default function Home() {
  const [apiKey, setApiKey] = useState("")
  const [selectedSite, setSelectedSite] = useState<SiteConfig>(SITES[0])
  const [topic, setTopic] = useState("")
  const [keywords, setKeywords] = useState("")
  const [template, setTemplate] = useState<ArticleTemplate>("howto")
  const [length, setLength] = useState<"short" | "medium" | "long">("medium")
  const [language, setLanguage] = useState<"ja" | "en">("ja")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResultData | null>(null)
  const [error, setError] = useState("")
  const [history, setHistory] = useState<GeneratedArticle[]>([])
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState("")

  const handleGenerate = async () => {
    setLoading(true)
    setError("")
    setResult(null)
    setSaveStatus("")

    try {
      const keywordList = keywords
        .split(/[,、\n]/)
        .map((k) => k.trim())
        .filter(Boolean)

      if (!topic || keywordList.length === 0) {
        setError("トピックとキーワードを入力してください")
        setLoading(false)
        return
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          keywords: keywordList,
          template,
          language,
          length,
          apiKey,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "エラーが発生しました")
        setLoading(false)
        return
      }

      setResult(data)
      setHistory((prev) => [data.article, ...prev])
    } catch {
      setError("リクエストに失敗しました。APIとURLを確認してください")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const saveToSite = async () => {
    if (!result) return
    setSaving(true)
    setSaveStatus("")
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: selectedSite.id,
          article: result.article,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSaveStatus(`保存完了: ${data.slug}`)
    } catch (e) {
      setSaveStatus(`保存失敗: ${e instanceof Error ? e.message : "?"}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-zinc-950 font-sans">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Content Empire
            </h1>
            <p className="text-sm text-zinc-500">AI記事生成 & マルチサイト管理</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-zinc-400">
              サイト: <strong className="text-zinc-700 dark:text-zinc-300">{SITES.length}</strong>
            </span>
            <span className="text-zinc-400">
              生成済: <strong className="text-zinc-700 dark:text-zinc-300">{history.length}記事</strong>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8 flex-1">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 左: 入力エリア */}
          <div className="flex flex-col gap-5">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                1. サイト選択
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {SITES.map((site) => (
                  <button
                    key={site.id}
                    onClick={() => setSelectedSite(site)}
                    className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                      selectedSite.id === site.id
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                    }`}
                  >
                    <div className="font-medium truncate">{site.name}</div>
                    <div
                      className={`text-xs truncate ${
                        selectedSite.id === site.id
                          ? "text-zinc-300 dark:text-zinc-500"
                          : "text-zinc-400"
                      }`}
                    >
                      {site.niche}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                2. APIキー
              </h2>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-... (DeepSeek APIキー)"
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <p className="mt-1.5 text-xs text-zinc-400">
                APIキーはブラウザに保存されず、サーバーにも記録されません
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                3. 記事設定
              </h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">トピック</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder='例: "Arch Linux インストール 初心者"'
                    className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                    キーワード（カンマ/改行区切り）
                  </label>
                  <textarea
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder={selectedSite.keywords.slice(0, 5).join(", ")}
                    rows={3}
                    className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                      テンプレート
                    </label>
                    <select
                      value={template}
                      onChange={(e) => setTemplate(e.target.value as ArticleTemplate)}
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      {ARTICLE_TEMPLATES.map((t) => (
                        <option key={t} value={t}>
                          {t === "howto" ? "ハウツー" : t === "comparison" ? "比較" : t === "explainer" ? "解説" : t === "review" ? "レビュー" : "チュートリアル"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">文字量</label>
                    <select
                      value={length}
                      onChange={(e) => setLength(e.target.value as "short" | "medium" | "long")}
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      <option value="short">短め</option>
                      <option value="medium">標準</option>
                      <option value="long">長め</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">言語</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as "ja" | "en")}
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      <option value="ja">日本語</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {loading ? (
                    <>
                      <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      生成中...
                    </>
                  ) : (
                    "記事を生成する"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 右: プレビューエリア */}
          <div className="flex flex-col gap-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}

            {result ? (
              <>
                {result.review && (
                  <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        品質レビュー
                      </h2>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          result.review.score >= 7
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : result.review.score >= 5
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {result.review.score}/10
                      </span>
                    </div>
                    <pre className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {result.review.feedback}
                    </pre>
                  </div>
                )}

                <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      生成された記事
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={saveToSite}
                        disabled={saving}
                        className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50 dark:border-green-800 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900"
                      >
                        {saving ? "保存中..." : "サイトに保存"}
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `# ${result.article.title}\n\n> ${result.article.metaDescription}\n\n${result.article.content}`,
                          )
                        }
                        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        コピー
                      </button>
                    </div>
                  </div>
                  {saveStatus && (
                    <p className={`mb-3 text-xs ${saveStatus.startsWith("保存完了") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {saveStatus}
                    </p>
                  )}
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {result.article.template}
                    </span>
                    {result.article.keywords.map((k) => (
                      <span key={k} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                        {k}
                      </span>
                    ))}
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    {result.article.title}
                  </h3>
                  <p className="mb-4 text-sm text-zinc-500">{result.article.metaDescription}</p>
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-zinc-900 prose-p:text-zinc-700 prose-li:text-zinc-700 prose-code:text-rose-600 dark:prose-headings:text-zinc-100 dark:prose-p:text-zinc-300 dark:prose-li:text-zinc-300 dark:prose-code:text-rose-400">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: result.article.content
                          .replace(/^### (.+)$/gm, "<h3>$1</h3>")
                          .replace(/^## (.+)$/gm, "<h2>$1</h2>")
                          .replace(/^- (.+)$/gm, "<li>$1</li>")
                          .replace(/```(\w+)?\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
                          .replace(/\n\n/g, "<br/><br/>"),
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white p-12 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="text-center">
                  <p className="text-sm text-zinc-400">
                    {loading ? "生成中..." : "左のフォームで記事を生成してください"}
                  </p>
                  {!loading && (
                    <p className="mt-1 text-xs text-zinc-300">
                      サイト・テンプレート・キーワードを選んで「記事を生成する」をクリック
                    </p>
                  )}
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  生成履歴 ({history.length}件)
                </h2>
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {history.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800"
                    >
                      <div className="truncate">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {item.title}
                        </span>
                        <span className="ml-2 text-xs text-zinc-400">
                          {new Date(item.generatedAt).toLocaleTimeString("ja-JP")}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(item.content)}
                        className="shrink-0 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                      >
                        コピー
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white px-6 py-3 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900">
        Content Empire v0.1 — Built with OpenCode
      </footer>
    </div>
  )
}
