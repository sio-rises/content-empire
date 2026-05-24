import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: "OSSツール紹介", template: "%s | OSSツール紹介" },
  description: "便利なオープンソースソフトウェアを紹介・レビュー",
  keywords: ["OSS", "オープンソース", "ツール", "無料", "代替", "レビュー"],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1506848814061019" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
              <a href="/" className="text-lg font-bold hover:opacity-80" style={{color:"#8b5cf6"}}>OSSツール紹介</a>
              <nav className="flex gap-4 text-sm text-gray-600">
                <a href="/" className="hover:underline" style={{color:"#8b5cf6"}}>ホーム</a>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-400">
            OSSツール紹介 — Built with OpenCode + DeepSeek API
          </footer>
        </div>
      </body>
    </html>
  )
}
