const fs = require("fs")
const path = require("path")

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY
if (!DEEPSEEK_KEY) {
  console.error("DEEPSEEK_API_KEY を設定してください")
  process.exit(1)
}

const SITE_DIR = path.join(__dirname, "sites", "arch-linux-guide", "content", "articles")
fs.mkdirSync(SITE_DIR, { recursive: true })

const TEMPLATES = {
  howto: `ハウツー。導入→手順→トラブルシューティング→まとめ`,
  tutorial: `チュートリアル。目標→前提条件→Step-by-step→動作確認→発展`,
  explainer: `解説。定義→背景→仕組み→実用例→よくある誤解`,
  comparison: `比較。各ツール概要→比較表→長所短所→おすすめ`,
}

const ARTICLES = [
  // インストール周り
  { topic: "Arch Linux USBインストールメディア作成 dd balenaEtcher", keywords: ["Arch Linux", "USB", "dd", "balenaEtcher", "ISO書き込み"], template: "howto" },
  { topic: "Arch Linux デュアルブート Windows", keywords: ["Arch Linux", "デュアルブート", "Windows", "GRUB", "EFIパーティション"], template: "howto" },
  { topic: "Arch Linux VirtualBox インストール", keywords: ["Arch Linux", "VirtualBox", "仮想マシン", "VM", "練習環境"], template: "tutorial" },
  { topic: "Arch Linux インストール後 やることリスト", keywords: ["Arch Linux", "インストール後", "初期設定", "やること", "必須設定"], template: "explainer" },

  // デスクトップ環境
  { topic: "Arch Linux GNOME インストール 設定", keywords: ["Arch Linux", "GNOME", "デスクトップ環境", "gdm", "拡張機能"], template: "tutorial" },
  { topic: "Arch Linux KDE Plasma インストール", keywords: ["Arch Linux", "KDE Plasma", "デスクトップ環境", "sddm", "カスタマイズ"], template: "tutorial" },
  { topic: "Arch Linux i3 Sway タイル型WM 比較", keywords: ["Arch Linux", "i3", "Sway", "タイル型", "ウィンドウマネージャ", "比較"], template: "comparison" },
  { topic: "Arch Linux XFCE 軽量デスクトップ", keywords: ["Arch Linux", "XFCE", "軽量", "デスクトップ環境", "低スペック"], template: "tutorial" },

  // パッケージ管理
  { topic: "Arch Linux pacman コマンド 使い方 チートシート", keywords: ["Arch Linux", "pacman", "コマンド", "チートシート", "パッケージ管理", "基本"], template: "explainer" },
  { topic: "Arch Linux flatpak インストール 使い方", keywords: ["Arch Linux", "flatpak", "サンドボックス", "アプリ", "flathub"], template: "howto" },
  { topic: "Arch Linux mirrorlist 更新 高速化", keywords: ["Arch Linux", "mirrorlist", "reflector", "ミラー", "高速化", "ダウンロード速度"], template: "howto" },

  // システム管理
  { topic: "Arch Linux systemd 基本 サービスの管理", keywords: ["Arch Linux", "systemd", "systemctl", "サービス", "自動起動", "journalctl"], template: "explainer" },
  { topic: "Arch Linux バックアップ 戦略 rsync tar", keywords: ["Arch Linux", "バックアップ", "rsync", "tar", "btrfsスナップショット", "復元"], template: "howto" },
  { topic: "Arch Linux カーネル アップデート 管理", keywords: ["Arch Linux", "カーネル", "linux-lts", "アップデート", "mkinitcpio", "fallback"], template: "explainer" },
  { topic: "Arch Linux ディスク容量 確認 掃除", keywords: ["Arch Linux", "ディスク容量", "pacmanキャッシュ", "掃除", "paccache", "du"], template: "howto" },

  // ネットワーク
  { topic: "Arch Linux Wi-Fi 接続 iwd iwctl", keywords: ["Arch Linux", "Wi-Fi", "iwd", "iwctl", "無線LAN", "ネットワーク"], template: "howto" },
  { topic: "Arch Linux NetworkManager 設定", keywords: ["Arch Linux", "NetworkManager", "nmcli", "ネットワーク", "GUI"], template: "howto" },
  { topic: "Arch Linux SSH サーバー 設定 セキュリティ", keywords: ["Arch Linux", "SSH", "openssh", "サーバー", "鍵認証", "セキュリティ"], template: "tutorial" },
  { topic: "Arch Linux ファイアウォール ufw firewalld 比較", keywords: ["Arch Linux", "ファイアウォール", "ufw", "firewalld", "iptables", "セキュリティ"], template: "comparison" },

  // トラブルシューティング
  { topic: "Arch Linux 起動しない GRUB修復", keywords: ["Arch Linux", "起動しない", "GRUB", "修復", "chroot", "ブートローダー"], template: "howto" },
  { topic: "Arch Linux pacman エラー 対処法 よくある問題", keywords: ["Arch Linux", "pacman", "エラー", "failed to commit", "conflicting files", "GPG"], template: "explainer" },
  { topic: "Arch Linux 画面が真っ黒 グラフィックドライバ", keywords: ["Arch Linux", "画面真っ黒", "nvidia", "amd", "intel", "グラフィックドライバ"], template: "howto" },

  // カスタマイズ
  { topic: "Arch Linux ドットファイル管理 chezmoi yadm", keywords: ["Arch Linux", "ドットファイル", "chezmoi", "yadm", "設定ファイル", "バージョン管理"], template: "comparison" },
  { topic: "Arch Linux ターミナル環境構築 zsh starship kitty ghostty", keywords: ["Arch Linux", "ターミナル", "zsh", "starship", "kitty", "ghostty", "カスタマイズ"], template: "tutorial" },
]

async function generateArticle(opts) {
  const system = `あなたはSEO最適化された技術記事を書くプロの日本語ライターです。
読者はArch Linux初心者〜中級者です。実用的で具体的な情報を提供してください。

重要なルール:
- すべてのシェルコマンドは実在するものだけを使う
- コードブロックは言語指定（\`\`\`bash等）
- 見出しは##と###
- コマンドの役割は必ず説明
- 文字数: 1500〜2500字
- アフィリエイト臭禁止
- mkdir -p <dir> && mount <dev> <dir> のように分けて書く`

  const user = `以下のテンプレートで記事を書いて。

【テンプレート】${opts.template}
${TEMPLATES[opts.template]}

【メインKW】${opts.keywords[0]}
【サブKW】${opts.keywords.slice(1).join(", ")}

【トピック】${opts.topic}

出力はJSON: {"title":"...","slug":"...","metaDescription":"...","content":"Markdown本文"}`

  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    }),
  })

  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json()
  const parsed = JSON.parse(data.choices[0].message.content)
  return {
    title: parsed.title,
    slug: parsed.slug,
    metaDescription: parsed.metaDescription,
    content: parsed.content,
    keywords: opts.keywords,
    template: opts.template,
    generatedAt: new Date().toISOString(),
  }
}

async function main() {
  for (let i = 0; i < ARTICLES.length; i++) {
    const a = ARTICLES[i]
    console.log(`[${i + 1}/${ARTICLES.length}] ${a.topic}`)
    try {
      const article = await generateArticle(a)
      const file = path.join(SITE_DIR, `${article.slug}.json`)
      fs.writeFileSync(file, JSON.stringify(article, null, 2), "utf-8")
      console.log(`  ✓ ${article.slug}`)
    } catch (e) {
      console.error(`  ✗ ${e.message}`)
    }
  }
  console.log(`\n完了! ${ARTICLES.length}記事`)
}

main().catch(console.error)
