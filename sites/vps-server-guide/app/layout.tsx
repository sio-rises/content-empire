import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: "VPSサーバー構築ガイド", template: "%s | VPSサーバー構築ガイド" },
  description: "VPSを使ったWebサーバー構築・運用の実践ガイド",
  keywords: ["VPS", "サーバー", "Nginx", "Docker", "SSL", "ConoHa", "さくらVPS"],
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
              <a href="/" className="text-lg font-bold hover:opacity-80" style={{color:"#f59e0b"}}>VPSサーバー構築ガイド</a>
              <nav className="flex gap-4 text-sm text-gray-600">
                <a href="/" className="hover:underline" style={{color:"#f59e0b"}}>ホーム</a>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-400">
            VPSサーバー構築ガイド — Built with OpenCode + DeepSeek API
          </footer>
        </div>
      </body>
    </html>
  )
}
