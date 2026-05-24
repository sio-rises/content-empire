const fs = require("fs")
const path = require("path")

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY
if (!DEEPSEEK_KEY) { console.error("DEEPSEEK_API_KEY を設定してください"); process.exit(1) }

const siteId = process.argv[2]
if (!siteId) { console.error("Usage: DEEPSEEK_API_KEY=sk-xxx node generate-site.js <site-id>"); process.exit(1) }

const SITE_CONFIGS = {
  "nisa-investment": {
    articles: [
      { topic: "NISAとは 初心者向け 徹底解説", keywords: ["NISA", "初心者", "とは", "制度", "非課税", "つみたて"], template: "explainer" },
      { topic: "つみたてNISA 成長投資枠 違い 比較", keywords: ["つみたてNISA", "成長投資枠", "違い", "比較", "どっち"], template: "comparison" },
      { topic: "iDeCoとは 初心者 掛金 節税", keywords: ["iDeCo", "初心者", "掛金", "節税", "年金", "仕組み"], template: "explainer" },
      { topic: "NISA iDeCo 併用 どっちが先", keywords: ["NISA", "iDeCo", "併用", "どっちが先", "優先順位", "比較"], template: "comparison" },
      { topic: "投資信託 選び方 初心者 eMAXIS Slim S&P500", keywords: ["投資信託", "選び方", "初心者", "eMAXIS Slim", "S&P500", "全世界株式"], template: "explainer" },
      { topic: "ETFとは 投資信託との違い 初心者", keywords: ["ETF", "投資信託", "違い", "初心者", "メリット", "デメリット"], template: "comparison" },
      { topic: "S&P500 全世界株式 オルカン どっち", keywords: ["S&P500", "全世界株式", "オルカン", "どっち", "比較", "積立"], template: "comparison" },
      { topic: "確定申告 投資 やり方 初心者 特定口座", keywords: ["確定申告", "投資", "やり方", "初心者", "特定口座", "源泉徴収"], template: "howto" },
      { topic: "iDeCo 受取 退職金 一時金 年金 税金", keywords: ["iDeCo", "受取", "退職金", "一時金", "年金", "税金"], template: "explainer" },
      { topic: "積立投資 いくらから 始め方 100円", keywords: ["積立投資", "いくらから", "始め方", "100円", "少額", "SBI証券"], template: "howto" },
      { topic: "高配当株 おすすめ 日本株 ETF 2025", keywords: ["高配当株", "おすすめ", "日本株", "ETF", "2025", "配当金"], template: "explainer" },
      { topic: "ジュニアNISA 廃止 2024年以降 代替", keywords: ["ジュニアNISA", "廃止", "2024", "代替", "未成年", "投資"], template: "explainer" },
      { topic: "SBI証券 楽天証券 比較 NISA 手数料", keywords: ["SBI証券", "楽天証券", "比較", "NISA", "手数料", "クレカ積立"], template: "comparison" },
      { topic: "資産形成 20代 30代 ポートフォリオ 例", keywords: ["資産形成", "20代", "30代", "ポートフォリオ", "例", "アセットアロケーション"], template: "explainer" },
      { topic: "暴落 対処法 積立投資 やめる 続ける", keywords: ["暴落", "対処法", "積立投資", "やめる", "続ける", "メンタル"], template: "explainer" },
      { topic: "つみたてNISA 上限 1800万 非課税保有限度額", keywords: ["つみたてNISA", "上限", "1800万", "非課税保有限度額", "枠", "復活"], template: "explainer" },
      { topic: "住民税 ふるさと納税 投資 併用 節税", keywords: ["住民税", "ふるさと納税", "投資", "併用", "節税", "控除"], template: "explainer" },
      { topic: "ロボアドバイザー おすすめ WealthNavi THEO 比較", keywords: ["ロボアドバイザー", "WealthNavi", "THEO", "比較", "手数料", "自動運用"], template: "comparison" },
      { topic: "米国株 買い方 日本から 初心者 証券口座", keywords: ["米国株", "買い方", "日本から", "初心者", "証券口座", "外国株式"], template: "howto" },
      { topic: "老後資金 2000万円 いくら必要 シミュレーション", keywords: ["老後資金", "2000万円", "いくら必要", "シミュレーション", "年金", "資産形成"], template: "explainer" },
      { topic: "配当金生活 FIRE 必要資金 計算方法", keywords: ["配当金", "FIRE", "必要資金", "4%ルール", "早期リタイア", "計算"], template: "explainer" },
      { topic: "個別株 vs 投資信託 初心者 選び方 比較", keywords: ["個別株", "投資信託", "初心者", "選び方", "メリット", "デメリット"], template: "comparison" },
      { topic: "確定拠出年金 企業型DC iDeCo 併用 限度額", keywords: ["確定拠出年金", "企業型DC", "iDeCo", "併用", "限度額", "会社員"], template: "explainer" },
    ]
  },
  "ai-agent-guide": {
    articles: [
      { topic: "OpenCodeとは 使い方 基本ガイド", keywords: ["OpenCode", "使い方", "AIエージェント", "コーディング", "CLIツール", "入門"], template: "explainer" },
      { topic: "OpenCodeとClaudeCodeの違い 比較", keywords: ["OpenCode", "ClaudeCode", "比較", "AIエージェント", "どっち", "開発ツール"], template: "comparison" },
      { topic: "AIエージェントにSSH越しでNixOSをインストール", keywords: ["AIエージェント", "NixOS", "SSH", "ClaudeCode", "遠隔操作", "OSインストール"], template: "tutorial" },
      { topic: "DeepSeek API 使い方 料金 設定", keywords: ["DeepSeek API", "使い方", "料金", "設定", "APIキー", "OpenAI比較"], template: "explainer" },
      { topic: "DeepSeek vs OpenAI vs Anthropic API 比較", keywords: ["DeepSeek", "OpenAI", "Anthropic", "API比較", "料金", "性能"], template: "comparison" },
      { topic: "OpenCodeでWebアプリ開発 始め方", keywords: ["OpenCode", "Webアプリ", "開発", "Next.js", "React", "AIコーディング"], template: "tutorial" },
      { topic: "AIエージェント プロンプトエンジニアリング コツ", keywords: ["AIエージェント", "プロンプトエンジニアリング", "コツ", "効率化", "指示の出し方"], template: "explainer" },
      { topic: "OpenCodeのスキルシステム カスタマイズ", keywords: ["OpenCode", "スキル", "カスタマイズ", "拡張", "MCP", "プラグイン"], template: "tutorial" },
      { topic: "AIエージェントに作業を任せる時の注意点とリスク", keywords: ["AIエージェント", "注意点", "ハルシネーション", "セキュリティ", "レビュー"], template: "explainer" },
      { topic: "ClaudeCodeでサーバー管理を自動化", keywords: ["ClaudeCode", "サーバー管理", "自動化", "SSH", "DevOps", "運用"], template: "tutorial" },
      { topic: "AIエージェント MCPサーバー 連携 設定", keywords: ["AIエージェント", "MCP", "サーバー", "連携", "設定", "ツール"], template: "explainer" },
      { topic: "OpenCode CLI インストール セットアップ", keywords: ["OpenCode", "CLI", "インストール", "セットアップ", "npm", "ターミナル"], template: "howto" },
      { topic: "AIエージェントでブログ記事を自動生成する方法", keywords: ["AIエージェント", "ブログ", "記事自動生成", "SEO", "DeepSeek", "コンテンツ"], template: "tutorial" },
      { topic: "AIコーディングツール GitHub Copilot Cursor OpenCode 比較", keywords: ["AIコーディング", "GitHub Copilot", "Cursor", "OpenCode", "比較"], template: "comparison" },
      { topic: "初心者でもわかる AIエージェントとは", keywords: ["AIエージェント", "初心者", "とは", "仕組み", "LLM", "自動化"], template: "explainer" },
      { topic: "OpenCodeでテストコードを自動生成", keywords: ["OpenCode", "テストコード", "自動生成", "TDD", "Jest", "品質"], template: "tutorial" },
      { topic: "AIエージェントの活用事例 2026年最新", keywords: ["AIエージェント", "活用事例", "2026", "最新", "開発", "業務効率化"], template: "explainer" },
      { topic: "DeepSeek APIでコンテンツ量産 コスト試算", keywords: ["DeepSeek API", "コンテンツ", "量産", "コスト", "試算", "SEO"], template: "explainer" },
      { topic: "AIエージェント マルチエージェント 協調 設計", keywords: ["AIエージェント", "マルチエージェント", "協調", "CrewAI", "AutoGen", "LangGraph"], template: "explainer" },
      { topic: "OpenCodeでデータベース設計とマイグレーション", keywords: ["OpenCode", "データベース", "設計", "マイグレーション", "Prisma", "SQL"], template: "tutorial" },
      { topic: "AIエージェントのセキュリティリスクと対策", keywords: ["AIエージェント", "セキュリティ", "リスク", "APIキー", "コードインジェクション", "対策"], template: "explainer" },
      { topic: "Claude API トークン最適化 コスト削減テクニック", keywords: ["Claude API", "トークン", "最適化", "コスト削減", "プロンプト", "効率"], template: "explainer" },
      { topic: "OpenCodeでGitHub Actions CI/CD構築", keywords: ["OpenCode", "GitHub Actions", "CI/CD", "自動デプロイ", "DevOps"], template: "tutorial" },
      { topic: "ローカルLLMとAIエージェントの組み合わせ Ollama", keywords: ["ローカルLLM", "Ollama", "AIエージェント", "プライバシー", "オフライン"], template: "tutorial" },
      { topic: "AIエージェントでAPIドキュメント自動生成", keywords: ["AIエージェント", "API", "ドキュメント", "自動生成", "Swagger", "OpenAPI"], template: "tutorial" },
      { topic: "OpenCodeのMCPサーバー自作 カスタムツール追加", keywords: ["OpenCode", "MCPサーバー", "自作", "カスタムツール", "TypeScript", "拡張"], template: "tutorial" },
      { topic: "AIエージェント開発 ベストプラクティス 2026", keywords: ["AIエージェント", "開発", "ベストプラクティス", "2026", "設計", "運用"], template: "explainer" },
      { topic: "DeepSeek API バッチ処理 大規模生成のコツ", keywords: ["DeepSeek API", "バッチ処理", "大規模生成", "レート制限", "非同期", "最適化"], template: "howto" },
      { topic: "AIエージェント vs 従来の自動化 違いと使い分け", keywords: ["AIエージェント", "自動化", "RPA", "違い", "使い分け", "比較"], template: "comparison" },
      { topic: "AIエージェントにコードレビューをさせる方法", keywords: ["AIエージェント", "コードレビュー", "自動化", "品質", "バグ検出", "OpenCode"], template: "tutorial" },
    ]
  },
  "linux-security": {
    articles: [
      { topic: "Linux サーバー セキュリティ 基本 初心者", keywords: ["Linux", "サーバー", "セキュリティ", "基本", "初心者", "対策"], template: "explainer" },
      { topic: "SSH セキュリティ 設定 鍵認証 ポート変更", keywords: ["SSH", "セキュリティ", "鍵認証", "ポート変更", "Fail2Ban", "設定"], template: "howto" },
      { topic: "fail2ban 設定 使い方 Linux 不正アクセス対策", keywords: ["fail2ban", "設定", "Linux", "不正アクセス", "ブルートフォース", "BAN"], template: "tutorial" },
      { topic: "ufw ファイアウォール 設定 Linux 初心者", keywords: ["ufw", "ファイアウォール", "設定", "Linux", "初心者", "iptables"], template: "howto" },
      { topic: "SELinux vs AppArmor 比較 Linux 強制アクセス制御", keywords: ["SELinux", "AppArmor", "比較", "Linux", "強制アクセス制御", "MAC"], template: "comparison" },
      { topic: "Linux ウイルス対策 ClamAV インストール 使い方", keywords: ["Linux", "ウイルス対策", "ClamAV", "マルウェア", "スキャン"], template: "tutorial" },
      { topic: "SSL/TLS 証明書 Let's Encrypt 無料 Nginx", keywords: ["SSL", "TLS", "Let's Encrypt", "無料", "Nginx", "certbot"], template: "tutorial" },
      { topic: "Linux ファイルパーミッション 基本 chmod chown", keywords: ["Linux", "パーミッション", "chmod", "chown", "所有権", "セキュリティ"], template: "explainer" },
      { topic: "Docker セキュリティ ベストプラクティス rootless", keywords: ["Docker", "セキュリティ", "rootless", "ベストプラクティス", "コンテナ"], template: "explainer" },
      { topic: "Linux ログ監視 journalctl rsyslog 設定", keywords: ["Linux", "ログ監視", "journalctl", "rsyslog", "監査", "設定"], template: "howto" },
      { topic: "VPN WireGuard 設定 Linux サーバー", keywords: ["VPN", "WireGuard", "設定", "Linux", "サーバー", "セキュリティ"], template: "tutorial" },
      { topic: "Linux ユーザー管理 セキュリティ sudo visudo", keywords: ["Linux", "ユーザー管理", "sudo", "visudo", "権限", "セキュリティ"], template: "explainer" },
      { topic: "カーネルパラメータ sysctl セキュリティ強化 Linux", keywords: ["カーネル", "sysctl", "セキュリティ", "Linux", "チューニング", "強化"], template: "howto" },
      { topic: "Linux 侵入検知 AIDE Tripwire ファイル改ざん検知", keywords: ["Linux", "侵入検知", "AIDE", "Tripwire", "改ざん検知", "IDS"], template: "comparison" },
      { topic: "iptables nftables 比較 移行 Linux ファイアウォール", keywords: ["iptables", "nftables", "比較", "Linux", "ファイアウォール", "移行"], template: "comparison" },
      { topic: "OpenSSL 脆弱性 チェック アップデート Linux", keywords: ["OpenSSL", "脆弱性", "チェック", "Linux", "Heartbleed", "アップデート"], template: "howto" },
      { topic: "rkhunter chkrootkit Linux ルートキット検出", keywords: ["rkhunter", "chkrootkit", "Linux", "ルートキット", "マルウェア", "検出"], template: "tutorial" },
      { topic: "Linux 自動セキュリティアップデート unattended-upgrades", keywords: ["Linux", "自動アップデート", "セキュリティ", "unattended-upgrades", "cron"], template: "howto" },
      { topic: "TLS 1.3 設定 Nginx Apache 脆弱性対応", keywords: ["TLS 1.3", "Nginx", "Apache", "脆弱性", "設定", "SSL"], template: "tutorial" },
      { topic: "Linux セキュリティ監査 Lynis 自動スキャン", keywords: ["Linux", "セキュリティ監査", "Lynis", "自動スキャン", "チェックリスト"], template: "tutorial" },
    ]
  },
  "vps-server-guide": {
    articles: [
      { topic: "VPSとは 初心者 レンタルサーバーとの違い", keywords: ["VPS", "初心者", "レンタルサーバー", "違い", "仮想サーバー", "メリット"], template: "explainer" },
      { topic: "ConoHa VPS さくらVPS AWS EC2 比較", keywords: ["ConoHa", "さくらVPS", "AWS", "比較", "料金", "性能"], template: "comparison" },
      { topic: "VPS 初期設定 Ubuntu セキュリティ SSH", keywords: ["VPS", "初期設定", "Ubuntu", "SSH", "ファイアウォール", "セキュリティ"], template: "tutorial" },
      { topic: "Nginx 設定 リバースプロキシ SSL Webサーバー", keywords: ["Nginx", "リバースプロキシ", "SSL", "Webサーバー", "設定", "Let's Encrypt"], template: "tutorial" },
      { topic: "Docker インストール VPS コンテナ運用", keywords: ["Docker", "VPS", "コンテナ", "docker-compose", "ポート", "ボリューム"], template: "tutorial" },
      { topic: "VPS 負荷対策 メモリ不足 swap チューニング", keywords: ["VPS", "負荷対策", "メモリ", "swap", "チューニング", "OOM"], template: "howto" },
      { topic: "WordPress VPS移行 さくらConoHaから 手順", keywords: ["WordPress", "VPS", "移行", "ConoHa", "さくら", "データベース"], template: "tutorial" },
      { topic: "VPS バックアップ 自動化 rsync cron 設定", keywords: ["VPS", "バックアップ", "rsync", "cron", "自動化", "リストア"], template: "tutorial" },
      { topic: "MySQL PostgreSQL VPS インストール 設定", keywords: ["MySQL", "PostgreSQL", "VPS", "インストール", "DB", "セキュリティ"], template: "tutorial" },
      { topic: "VPS 監視 netdata Grafana Prometheus 設定", keywords: ["VPS", "監視", "netdata", "Grafana", "Prometheus", "メトリクス"], template: "tutorial" },
      { topic: "Cloudflare VPS 組み合わせ CDN DDoS対策", keywords: ["Cloudflare", "VPS", "CDN", "DDoS", "SSL", "DNS"], template: "explainer" },
      { topic: "VPS メールサーバー Postfix Dovecot 構築", keywords: ["VPS", "メールサーバー", "Postfix", "Dovecot", "SMTP", "IMAP"], template: "tutorial" },
      { topic: "VPS 料金比較 2025年 おすすめ 格安", keywords: ["VPS", "料金", "2025", "おすすめ", "格安", "ConoHa", "さくら"], template: "comparison" },
      { topic: "VPSにNext.jsアプリをデプロイする方法", keywords: ["VPS", "Next.js", "デプロイ", "Node.js", "Nginx", "PM2"], template: "tutorial" },
      { topic: "SSH接続 tmux screen VPS 作業 永続化", keywords: ["SSH", "tmux", "screen", "VPS", "セッション", "永続化"], template: "howto" },
      { topic: "VPS ディスク拡張 LVM パーティション", keywords: ["VPS", "ディスク", "LVM", "パーティション", "拡張", "容量不足"], template: "howto" },
      { topic: "Caddy Nginx 比較 Webサーバー VPS 初心者", keywords: ["Caddy", "Nginx", "比較", "VPS", "Webサーバー", "自動SSL"], template: "comparison" },
      { topic: "VPS 自動デプロイ GitHub Actions CI/CD", keywords: ["VPS", "自動デプロイ", "GitHub Actions", "CI/CD", "rsync", "SSH"], template: "tutorial" },
      { topic: "VPS 障害 復旧 トラブルシューティング", keywords: ["VPS", "障害", "復旧", "トラブルシューティング", "SSH接続不可", "再起動"], template: "explainer" },
      { topic: "さくらVPS お試し 無料期間 登録方法", keywords: ["さくらVPS", "お試し", "無料", "登録", "クーポン", "キャンペーン"], template: "howto" },
    ]
  },
  "terminal-shell": {
    articles: [
      { topic: "ターミナル 入門 初心者 基本コマンド", keywords: ["ターミナル", "入門", "初心者", "基本コマンド", "ls", "cd", "cp"], template: "explainer" },
      { topic: "zsh 設定 .zshrc カスタマイズ おすすめ", keywords: ["zsh", "設定", ".zshrc", "カスタマイズ", "プラグイン", "テーマ"], template: "tutorial" },
      { topic: "bash vs zsh vs fish シェル比較 2025", keywords: ["bash", "zsh", "fish", "比較", "シェル", "おすすめ"], template: "comparison" },
      { topic: "tmux 使い方 チートシート 設定", keywords: ["tmux", "使い方", "チートシート", "設定", "セッション", "分割"], template: "explainer" },
      { topic: "シェルスクリプト 入門 自動化 基本", keywords: ["シェルスクリプト", "入門", "自動化", "bash", "cron", "変数"], template: "tutorial" },
      { topic: "alias 設定 よく使うコマンド 時短", keywords: ["alias", "コマンド", "時短", "設定", "効率化", "bashrc"], template: "howto" },
      { topic: "Starship プロンプト 設定 カスタマイズ", keywords: ["Starship", "プロンプト", "設定", "カスタマイズ", "Git表示", "テーマ"], template: "tutorial" },
      { topic: "fzf ファジーファインダー 使い方 設定", keywords: ["fzf", "ファジーファインダー", "使い方", "設定", "検索", "履歴"], template: "howto" },
      { topic: "ターミナル カラースキーム おすすめ 設定", keywords: ["ターミナル", "カラースキーム", "Tokyo Night", "Dracula", "Nord", "iTerm2"], template: "explainer" },
      { topic: "Ghostty ターミナル インストール 設定 レビュー", keywords: ["Ghostty", "ターミナル", "インストール", "設定", "高速", "GPU"], template: "tutorial" },
      { topic: "Kitty ターミナル 設定 画像表示 キーマップ", keywords: ["Kitty", "ターミナル", "画像表示", "キーマップ", "高速", "GPU"], template: "tutorial" },
      { topic: "jq コマンド JSON 処理 使い方", keywords: ["jq", "JSON", "コマンド", "API", "シェル", "パース"], template: "howto" },
      { topic: "sed awk テキスト処理 シェル ワンライナー", keywords: ["sed", "awk", "テキスト処理", "ワンライナー", "置換", "集計"], template: "explainer" },
      { topic: "Git コマンド ターミナル チートシート", keywords: ["Git", "ターミナル", "チートシート", "コミット", "ブランチ", "マージ"], template: "explainer" },
      { topic: "ターミナル 生産性向上 ツール ショートカット", keywords: ["ターミナル", "生産性", "ツール", "ショートカット", "効率化", "CLI"], template: "explainer" },
      { topic: "bat exa ripgrep fd モダンCLIツール", keywords: ["bat", "exa", "ripgrep", "fd", "CLI", "代替ツール"], template: "explainer" },
      { topic: "direnv 設定 プロジェクト別 環境変数", keywords: ["direnv", "環境変数", "プロジェクト", "自動切替", "設定"], template: "howto" },
      { topic: "シェル履歴 atuin fzf 検索 管理", keywords: ["シェル履歴", "atuin", "fzf", "検索", "管理", "同期"], template: "tutorial" },
      { topic: "cron systemd timer ジョブスケジューラ 比較", keywords: ["cron", "systemd timer", "比較", "スケジューラ", "自動実行", "Linux"], template: "comparison" },
      { topic: "ターミナル マルチプレクサ tmux vs screen vs zellij", keywords: ["tmux", "screen", "zellij", "比較", "ターミナル", "マルチプレクサ"], template: "comparison" },
    ]
  },
  "python-beginner": {
    articles: [
      { topic: "Python 入門 インストール 環境構築 2025", keywords: ["Python", "入門", "インストール", "環境構築", "pip", "venv"], template: "tutorial" },
      { topic: "Python 変数 データ型 リスト 辞書 基礎", keywords: ["Python", "変数", "データ型", "リスト", "辞書", "基礎"], template: "explainer" },
      { topic: "Python if文 for文 制御構文 初心者", keywords: ["Python", "if文", "for文", "制御構文", "ループ", "条件分岐"], template: "explainer" },
      { topic: "Python 関数 def lambda 使い方", keywords: ["Python", "関数", "def", "lambda", "戻り値", "引数"], template: "explainer" },
      { topic: "Python クラス オブジェクト指向 入門", keywords: ["Python", "クラス", "オブジェクト指向", "継承", "self", "__init__"], template: "explainer" },
      { topic: "Flask Webアプリ 作成 入門 Python", keywords: ["Flask", "Webアプリ", "Python", "ルーティング", "テンプレート", "入門"], template: "tutorial" },
      { topic: "FastAPI 入門 APIサーバー Python 高速", keywords: ["FastAPI", "API", "Python", "Swagger", "非同期", "Pydantic"], template: "tutorial" },
      { topic: "Python スクレイピング BeautifulSoup Selenium", keywords: ["Python", "スクレイピング", "BeautifulSoup", "Selenium", "Web", "データ収集"], template: "tutorial" },
      { topic: "Python Excel操作 openpyxl pandas 自動化", keywords: ["Python", "Excel", "openpyxl", "pandas", "自動化", "業務効率化"], template: "tutorial" },
      { topic: "Python データ分析 pandas matplotlib 入門", keywords: ["Python", "データ分析", "pandas", "matplotlib", "CSV", "グラフ"], template: "tutorial" },
      { topic: "Python 非同期処理 asyncio async await", keywords: ["Python", "非同期", "asyncio", "async", "await", "並行処理"], template: "explainer" },
      { topic: "Python テスト pytest unittest 書き方", keywords: ["Python", "テスト", "pytest", "unittest", "TDD", "自動テスト"], template: "tutorial" },
      { topic: "Python エラー処理 try except raise 例外", keywords: ["Python", "エラー", "try", "except", "例外", "デバッグ"], template: "explainer" },
      { topic: "Python 仮想環境 venv conda poetry 比較", keywords: ["Python", "仮想環境", "venv", "conda", "poetry", "依存管理"], template: "comparison" },
      { topic: "Python ファイル操作 読み書き CSV JSON", keywords: ["Python", "ファイル操作", "読み書き", "CSV", "JSON", "with"], template: "howto" },
      { topic: "Python Django 入門 Webアプリ開発", keywords: ["Python", "Django", "Webアプリ", "ORM", "管理画面", "MVT"], template: "tutorial" },
      { topic: "Python 型ヒント typing mypy 静的解析", keywords: ["Python", "型ヒント", "mypy", "静的解析", "バグ防止", "可読性"], template: "explainer" },
      { topic: "Python デコレータ 使い方 @property @staticmethod", keywords: ["Python", "デコレータ", "@property", "@staticmethod", "高階関数", "メタプログラミング"], template: "explainer" },
      { topic: "Python 正規表現 reモジュール 使い方", keywords: ["Python", "正規表現", "re", "パターンマッチ", "文字列", "抽出"], template: "howto" },
      { topic: "Python API操作 requests ライブラリ 使い方", keywords: ["Python", "API", "requests", "JSON", "GET", "POST", "認証"], template: "tutorial" },
    ]
  },
  "oss-tools": {
    articles: [
      { topic: "Obsidian 代替 OSS メモアプリ Logseq Joplin", keywords: ["Obsidian", "OSS", "メモアプリ", "Logseq", "Joplin", "比較"], template: "comparison" },
      { topic: "Notion 代替 OSS AppFlowy Affine 比較", keywords: ["Notion", "OSS", "AppFlowy", "Affine", "比較", "ドキュメント"], template: "comparison" },
      { topic: "Photoshop 代替 GIMP Krita 無料 画像編集", keywords: ["Photoshop", "GIMP", "Krita", "無料", "画像編集", "代替"], template: "comparison" },
      { topic: "Microsoft Office 代替 LibreOffice OnlyOffice 比較", keywords: ["Microsoft Office", "LibreOffice", "OnlyOffice", "代替", "無料", "互換性"], template: "comparison" },
      { topic: "Adobe Premiere代替 DaVinci Resolve Kdenlive 動画編集", keywords: ["Premiere", "DaVinci Resolve", "Kdenlive", "動画編集", "無料", "代替"], template: "comparison" },
      { topic: "1Password代替 Bitwarden パスワード管理 OSS", keywords: ["1Password", "Bitwarden", "パスワード管理", "OSS", "代替", "セキュリティ"], template: "comparison" },
      { topic: "Google Analytics代替 Matomo Plausible Umami 比較", keywords: ["Google Analytics", "Matomo", "Plausible", "Umami", "代替", "プライバシー"], template: "comparison" },
      { topic: "Slack代替 Mattermost Rocket.Chat OSS チャット", keywords: ["Slack", "Mattermost", "Rocket.Chat", "OSS", "チャット", "代替"], template: "comparison" },
      { topic: "Google Drive代替 Nextcloud 自宅サーバー NAS", keywords: ["Google Drive", "Nextcloud", "自宅サーバー", "NAS", "OSS", "クラウド"], template: "tutorial" },
      { topic: "Zoom代替 Jitsi Meet OSS ビデオ会議", keywords: ["Zoom", "Jitsi Meet", "OSS", "ビデオ会議", "代替", "無料"], template: "explainer" },
      { topic: "VSCode 代替 OSS Zed Lapce Cursor系", keywords: ["VSCode", "Zed", "Lapce", "OSS", "エディタ", "代替", "高速"], template: "comparison" },
      { topic: "Docker代替 Podman コンテナ OSS 違い", keywords: ["Docker", "Podman", "OSS", "コンテナ", "rootless", "違い"], template: "comparison" },
      { topic: "Illustrator代替 Inkscape 無料 ベクター画像", keywords: ["Illustrator", "Inkscape", "無料", "ベクター", "SVG", "代替"], template: "explainer" },
      { topic: "ChatGPT代替 OSS LLM Ollama LM Studio ローカル", keywords: ["ChatGPT", "Ollama", "LM Studio", "OSS", "LLM", "ローカル"], template: "comparison" },
      { topic: "Googleフォト代替 Immich PhotoPrism OSS 写真管理", keywords: ["Googleフォト", "Immich", "PhotoPrism", "OSS", "写真管理", "代替"], template: "comparison" },
      { topic: "Windows代替 Linuxディストリビューション デスクトップ おすすめ", keywords: ["Windows", "Linux", "デスクトップ", "Mint", "Ubuntu", "Pop!_OS", "代替"], template: "comparison" },
      { topic: "Microsoft Teams代替 Element Matrix OSS コミュニケーション", keywords: ["Microsoft Teams", "Element", "Matrix", "OSS", "コミュニケーション", "代替"], template: "comparison" },
      { topic: "YouTube代替 PeerTube OSS 動画配信 分散型", keywords: ["YouTube", "PeerTube", "OSS", "動画配信", "分散型", "代替"], template: "explainer" },
      { topic: "GitHub代替 GitLab Gitea Forgejo OSS 比較", keywords: ["GitHub", "GitLab", "Gitea", "Forgejo", "OSS", "比較"], template: "comparison" },
      { topic: "おすすめOSSツール 2025年 生産性向上 まとめ", keywords: ["OSS", "2025", "生産性", "まとめ", "無料", "おすすめ"], template: "explainer" },
    ]
  },
  "gadget-review": {
    articles: [
      { topic: "メカニカルキーボード おすすめ 2025 自作", keywords: ["メカニカルキーボード", "おすすめ", "2025", "自作", "キースイッチ", "キーキャップ"], template: "review" },
      { topic: "HHKB Realforce 比較 高級キーボード", keywords: ["HHKB", "Realforce", "比較", "静電容量", "東プレ", "PFU"], template: "comparison" },
      { topic: "4Kモニター おすすめ 2025 クリエイター ゲーミング", keywords: ["4Kモニター", "おすすめ", "2025", "クリエイター", "ゲーミング", "USB-C"], template: "review" },
      { topic: "ワイヤレスイヤホン おすすめ 2025 ノイキャン", keywords: ["ワイヤレスイヤホン", "おすすめ", "2025", "ノイキャン", "コスパ", "レビュー"], template: "review" },
      { topic: "トラックボール マウス 比較 Kensington Elecom Logicool", keywords: ["トラックボール", "Kensington", "Elecom", "Logicool", "比較", "疲労"], template: "comparison" },
      { topic: "USB-C ハブ ドッキングステーション おすすめ M1 Mac", keywords: ["USB-C", "ハブ", "ドッキングステーション", "Mac", "Anker", "CalDigit"], template: "review" },
      { topic: "デスク 環境 構築 ミニマル ガジェット", keywords: ["デスク", "環境", "ミニマル", "ガジェット", "ケーブル管理", "モニターアーム"], template: "explainer" },
      { topic: "ノートPC おすすめ 2025 プログラミング 軽量", keywords: ["ノートPC", "おすすめ", "2025", "プログラミング", "ThinkPad", "MacBook"], template: "review" },
      { topic: "SSD M.2 NVMe おすすめ 比較 2025 外付け", keywords: ["SSD", "M.2", "NVMe", "おすすめ", "比較", "外付け"], template: "comparison" },
      { topic: "NAS おすすめ 初心者 Synology QNAP 比較", keywords: ["NAS", "おすすめ", "初心者", "Synology", "QNAP", "自宅"], template: "comparison" },
      { topic: "スマートフォン おすすめ 2025 ミドルレンジ コスパ", keywords: ["スマートフォン", "おすすめ", "2025", "ミドルレンジ", "コスパ", "Pixel"], template: "review" },
      { topic: "タブレット おすすめ iPad Android 比較 2025", keywords: ["タブレット", "iPad", "Android", "比較", "ノート", "電子書籍"], template: "comparison" },
      { topic: "ワイヤレス充電器 おすすめ MagSafe Qi2 2025", keywords: ["ワイヤレス充電器", "MagSafe", "Qi2", "Anker", "3in1", "スタンド"], template: "review" },
      { topic: "ガジェット 収納 ケーブル管理 アクセサリー", keywords: ["ガジェット", "収納", "ケーブル管理", "アクセサリー", "デスク", "ポーチ"], template: "explainer" },
      { topic: "Apple Watch バンド おすすめ サードパーティ", keywords: ["Apple Watch", "バンド", "サードパーティ", "レザー", "スポーツ", "レビュー"], template: "review" },
      { topic: "モバイルバッテリー おすすめ 2025 小型 大容量", keywords: ["モバイルバッテリー", "おすすめ", "小型", "大容量", "Anker", "USB-C"], template: "review" },
      { topic: "在宅ワーク ガジェット おすすめ 生産性 2025", keywords: ["在宅ワーク", "ガジェット", "生産性", "2025", "Web会議", "デスク"], template: "explainer" },
      { topic: "ゲーミングデバイス おすすめ マウス キーボード ヘッドセット", keywords: ["ゲーミングデバイス", "マウス", "キーボード", "ヘッドセット", "Logicool", "Razer"], template: "review" },
      { topic: "スマートホーム デバイス SwitchBot Nature Remo 比較", keywords: ["スマートホーム", "SwitchBot", "Nature Remo", "IoT", "Alexa", "Google Home"], template: "comparison" },
      { topic: "ミニマルガジェット おすすめ EDC 持ち物 2025", keywords: ["ミニマル", "ガジェット", "EDC", "持ち物", "2025", "モバイル"], template: "explainer" },
    ]
  },
  "ai-tools": {
    articles: [
      { topic: "ChatGPT vs Claude vs Gemini vs DeepSeek 比較 2026", keywords: ["ChatGPT", "Claude", "Gemini", "DeepSeek", "比較", "LLM"], template: "comparison" },
      { topic: "AIコーディングツール 比較 GitHub Copilot Cursor OpenCode", keywords: ["AIコーディング", "GitHub Copilot", "Cursor", "OpenCode", "比較"], template: "comparison" },
      { topic: "AI画像生成 Midjourney vs DALL-E vs Stable Diffusion 比較", keywords: ["AI画像生成", "Midjourney", "DALL-E", "Stable Diffusion", "比較"], template: "comparison" },
      { topic: "AI動画生成 Runway Pika Sora 比較 2026", keywords: ["AI動画生成", "Runway", "Pika", "Sora", "比較"], template: "comparison" },
      { topic: "AI音声合成 比較 ElevenLabs VoiceVox CoeFont", keywords: ["AI音声合成", "ElevenLabs", "VoiceVox", "CoeFont", "比較"], template: "comparison" },
      { topic: "AI翻訳ツール 比較 DeepL Google翻訳 ChatGPT", keywords: ["AI翻訳", "DeepL", "Google翻訳", "ChatGPT", "比較"], template: "comparison" },
      { topic: "AI文章校正ツール 比較 Grammarly DeepL Write ChatGPT", keywords: ["AI文章校正", "Grammarly", "DeepL Write", "ChatGPT", "比較"], template: "comparison" },
      { topic: "AIプレゼン作成ツール 比較 Gamma Tome Beautiful.ai", keywords: ["AIプレゼン", "Gamma", "Tome", "Beautiful.ai", "比較"], template: "comparison" },
      { topic: "AIデータ分析ツール 比較 ChatGPT Code Interpreter Julius", keywords: ["AIデータ分析", "ChatGPT", "Code Interpreter", "Julius", "比較"], template: "comparison" },
      { topic: "ローカルLLM Ollama LM Studio GPT4All 比較", keywords: ["ローカルLLM", "Ollama", "LM Studio", "GPT4All", "比較", "プライバシー"], template: "comparison" },
      { topic: "AIエージェント フレームワーク 比較 AutoGPT CrewAI LangGraph", keywords: ["AIエージェント", "AutoGPT", "CrewAI", "LangGraph", "フレームワーク", "比較"], template: "comparison" },
      { topic: "Claude API vs OpenAI API vs DeepSeek API 料金 性能 比較 2026", keywords: ["Claude API", "OpenAI API", "DeepSeek API", "料金", "性能", "比較"], template: "comparison" },
      { topic: "Notion AI vs Cursor AI Notion AI 比較", keywords: ["Notion AI", "Cursor AI", "ドキュメント", "AIアシスタント", "比較"], template: "comparison" },
      { topic: "AI SEOツール 比較 SurferSEO Frase Clearscope", keywords: ["AI SEO", "SurferSEO", "Frase", "Clearscope", "コンテンツ最適化", "比較"], template: "comparison" },
      { topic: "AIチャットボット 構築ツール 比較 Botpress Voiceflow Dify", keywords: ["AIチャットボット", "Botpress", "Voiceflow", "Dify", "ノーコード", "比較"], template: "comparison" },
      { topic: "AIによる作業自動化 Zapier Make n8n 比較", keywords: ["AI自動化", "Zapier", "Make", "n8n", "ワークフロー", "比較"], template: "comparison" },
      { topic: "AIノートアプリ 比較 Mem Reflect Notion AI", keywords: ["AIノート", "Mem", "Reflect", "Notion AI", "PKM", "比較"], template: "comparison" },
      { topic: "AI開発プラットフォーム 比較 Replicate HuggingFace Vertex AI", keywords: ["AI開発", "Replicate", "HuggingFace", "Vertex AI", "MLOps", "比較"], template: "comparison" },
      { topic: "AI検索エンジン 比較 Perplexity You.com Bing Chat", keywords: ["AI検索", "Perplexity", "You.com", "Bing Chat", "比較"], template: "comparison" },
      { topic: "AIツール 2026年 おすすめ まとめ カテゴリ別", keywords: ["AIツール", "2026", "おすすめ", "まとめ", "カテゴリ別", "ランキング"], template: "explainer" },
    ]
  },
  "freelance-guide": {
    articles: [
      { topic: "副業 始め方 初心者 会社員 バレない", keywords: ["副業", "始め方", "初心者", "会社員", "バレない", "在宅"], template: "howto" },
      { topic: "クラウドワークス vs ランサーズ vs ココナラ 比較", keywords: ["クラウドワークス", "ランサーズ", "ココナラ", "比較", "副業", "報酬"], template: "comparison" },
      { topic: "フリーランス 開業 手続き 個人事業主 青色申告", keywords: ["フリーランス", "開業", "個人事業主", "青色申告", "開業届", "税務署"], template: "howto" },
      { topic: "確定申告 副業 やり方 必要書類 控除", keywords: ["確定申告", "副業", "やり方", "必要書類", "控除", "経費"], template: "howto" },
      { topic: "副業 Webデザイン 未経験 案件獲得 方法", keywords: ["副業", "Webデザイン", "未経験", "案件獲得", "ポートフォリオ", "単価"], template: "howto" },
      { topic: "プログラミング 副業 稼ぐ方法 単価相場", keywords: ["プログラミング", "副業", "稼ぐ", "単価相場", "リモート", "案件"], template: "explainer" },
      { topic: "せどり 物販 副業 初心者 Amazon メルカリ", keywords: ["せどり", "物販", "副業", "Amazon", "メルカリ", "利益"], template: "howto" },
      { topic: "ブログ アフィリエイト 始め方 稼ぐ 方法", keywords: ["ブログ", "アフィリエイト", "始め方", "稼ぐ", "ASP", "SEO"], template: "howto" },
      { topic: "YouTube 副業 収益化 条件 始め方", keywords: ["YouTube", "副業", "収益化", "条件", "アドセンス", "チャンネル"], template: "howto" },
      { topic: "フリーランス 税金 消費税 インボイス制度 解説", keywords: ["フリーランス", "税金", "消費税", "インボイス", "免税", "課税事業者"], template: "explainer" },
      { topic: "副業 確定申告 経費 計上 できるもの 一覧", keywords: ["副業", "経費", "計上", "できるもの", "家事按分", "領収書"], template: "explainer" },
      { topic: "フリーランス 健康保険 年金 扶養 手続き", keywords: ["フリーランス", "健康保険", "年金", "扶養", "国保", "付加年金"], template: "explainer" },
      { topic: "副業 収入 会社にバレる 理由 対策 住民税", keywords: ["副業", "会社にバレる", "住民税", "普通徴収", "対策", "確定申告"], template: "explainer" },
      { topic: "AIで副業 稼ぐ方法 ChatGPT Midjourney 2025", keywords: ["AI", "副業", "ChatGPT", "Midjourney", "画像生成", "自動化"], template: "explainer" },
      { topic: "せどり 確定申告 帳簿 つけ方 エクセル", keywords: ["せどり", "確定申告", "帳簿", "エクセル", "freee", "やよい"], template: "howto" },
      { topic: "副業 おすすめ 2025年 ランキング 初心者", keywords: ["副業", "おすすめ", "2025", "ランキング", "初心者", "安全"], template: "explainer" },
      { topic: "フリーランス 営業 案件獲得 方法 SNS ポートフォリオ", keywords: ["フリーランス", "営業", "案件獲得", "SNS", "ポートフォリオ", "クラウドソーシング"], template: "explainer" },
      { topic: "副業 住民税 普通徴収 切り替え 方法", keywords: ["副業", "住民税", "普通徴収", "切り替え", "確定申告", "会社"], template: "howto" },
      { topic: "ハンドメイド minne Creema 販売 副業 始め方", keywords: ["ハンドメイド", "minne", "Creema", "副業", "販売", "在宅"], template: "howto" },
      { topic: "Webライター 副業 始め方 未経験 単価", keywords: ["Webライター", "副業", "始め方", "未経験", "単価", "文字単価"], template: "howto" },
    ]
  },
}

const config = SITE_CONFIGS[siteId]
if (!config) { console.error(`Unknown site: ${siteId}`); process.exit(1) }

const SITE_DIR = path.join(__dirname, "sites", siteId, "content", "articles")
fs.mkdirSync(SITE_DIR, { recursive: true })

async function generate(opts) {
  const baseSys = `あなたはSEO最適化された日本語の記事を書くプロのライターです。
実用的で具体的な情報を提供してください。

ルール:
- 架空の情報や存在しない数値・制度は絶対に書かない
- コードブロックは言語指定
- 文字数: 1500〜2500字
- アフィリエイト臭禁止
- 見出しは##と###`

  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${DEEPSEEK_KEY}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: baseSys },
        { role: "user", content: `【テンプレート】${opts.template}\n【メインKW】${opts.keywords[0]}\n【サブKW】${opts.keywords.slice(1).join(", ")}\n【トピック】${opts.topic}\n\n出力はJSON: {"title":"...","slug":"...","metaDescription":"...","content":"Markdown本文"}` },
      ],
      temperature: 0.7,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    }),
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json()
  return JSON.parse(data.choices[0].message.content)
}

async function main() {
  const articles = config.articles
  for (let i = 0; i < articles.length; i++) {
    const a = articles[i]
    console.log(`[${i + 1}/${articles.length}] ${a.topic}`)
    try {
      const article = await generate(a)
      const file = path.join(SITE_DIR, `${article.slug}.json`)
      fs.writeFileSync(file, JSON.stringify({ ...article, keywords: a.keywords, template: a.template, generatedAt: new Date().toISOString() }, null, 2), "utf-8")
      console.log(`  ✓ ${article.slug}: ${article.title}`)
    } catch (e) { console.error(`  ✗ ${e.message}`) }
  }
  console.log(`\n✅ ${siteId}: ${articles.length}記事生成完了`)
}

main().catch(console.error)
