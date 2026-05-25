import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: "Linuxセキュリティ", template: "%s | Linuxセキュリティ" },
  description: "Linuxサーバー・デスクトップのセキュリティ設定を日本語で解説",
  keywords: ["Linux", "セキュリティ", "ファイアウォール", "SSH", "fail2ban", "SELinux", "AppArmor"],
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
              <a href="/" className="text-lg font-bold hover:opacity-80" style={{color:"#dc2626"}}>Linuxセキュリティ</a>
              <nav className="flex gap-4 text-sm text-gray-600">
                <a href="/" className="hover:underline" style={{color:"#dc2626"}}>ホーム</a>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-400">
            Linuxセキュリティ — Built with OpenCode + DeepSeek API
            <div className="border-t border-gray-100 mt-4 pt-3 text-center text-[10px] text-gray-300">
              <span className="mr-2">関連サイト:</span>
              <a href="https://arch-linux-guide.pages.dev" className="hover:underline">Arch Linux日本語ガイド</a>  <a href="https://ai-agent-guide.pages.dev" className="hover:underline">AIエージェント活用</a>  <a href="https://nisa-investment.pages.dev" className="hover:underline">NISA投資入門</a>  <a href="https://vps-server-guide.pages.dev" className="hover:underline">VPSサーバー構築</a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
