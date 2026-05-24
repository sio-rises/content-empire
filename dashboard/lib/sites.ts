export interface SiteConfig {
  id: string
  name: string
  domain: string
  niche: string
  language: "ja" | "en"
  description: string
  keywords: string[]
  status: "planning" | "active" | "paused"
}

export const SITES: SiteConfig[] = [
  {
    id: "arch-linux-guide",
    name: "Arch Linux 日本語ガイド",
    domain: "",
    niche: "Linuxデスクトップ",
    language: "ja",
    description: "Arch Linuxのインストールからデスクトップ環境構築まで、日本語で体系的に解説",
    keywords: [
      "Arch Linux",
      "インストール",
      "日本語化",
      "デスクトップ環境",
      "Hyprland",
      "btrfs",
      "LUKS",
      "パッケージ管理",
      "AUR",
      "systemd",
    ],
    status: "active",
  },
  {
    id: "ai-agent-guide",
    name: "AIエージェント活用ガイド",
    domain: "",
    niche: "AIエージェント・開発自動化",
    language: "ja",
    description: "OpenCode/ClaudeCodeなどのAIエージェントを使った開発効率化の情報を発信",
    keywords: [
      "AIエージェント",
      "OpenCode",
      "ClaudeCode",
      "開発自動化",
      "DeepSeek",
      "コード生成",
      "プロンプトエンジニアリング",
    ],
    status: "planning",
  },
  {
    id: "nisa-investment",
    name: "NISA投資入門",
    domain: "",
    niche: "投資・資産形成",
    language: "ja",
    description: "NISA/iDeCoを中心に、初心者向けの投資・資産形成情報を発信",
    keywords: [
      "NISA",
      "iDeCo",
      "投資信託",
      "ETF",
      "資産形成",
      "確定申告",
      "つみたて",
    ],
    status: "planning",
  },
]

export function getSiteById(id: string): SiteConfig | undefined {
  return SITES.find((s) => s.id === id)
}
