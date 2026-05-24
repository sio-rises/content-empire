import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Arch Linux 日本語ガイド",
    template: "%s | Arch Linux 日本語ガイド",
  },
  description:
    "Arch Linuxのインストールからデスクトップ環境構築まで、日本語で体系的に解説するガイドサイトです。",
  keywords: ["Arch Linux", "Linux", "インストール", "日本語", "デスクトップ環境", "btrfs", "LUKS"],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
              <a href="/" className="text-lg font-bold text-arch hover:opacity-80">
                Arch Linux 日本語ガイド
              </a>
              <nav className="flex gap-4 text-sm text-gray-600">
                <a href="/" className="hover:text-arch">ホーム</a>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-400">
            Arch Linux 日本語ガイド — Built with OpenCode + DeepSeek API
          </footer>
        </div>
      </body>
    </html>
  )
}
