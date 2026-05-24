export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">このサイトについて</h1>
      <div className="prose max-w-none mt-6">
        <p>Arch Linux 日本語ガイドは、Arch Linuxのインストールからデスクトップ環境構築、トラブルシューティングまでを日本語で体系的に解説するサイトです。</p>
        <p>AI（DeepSeek API）によって生成された記事を、Linuxの実践経験に基づいてレビュー・編集して公開しています。</p>
        <h2>運営者</h2>
        <p>Sio — Arch Linuxユーザー。btrfs/LUKS環境で日々運用中。OpenCodeとAI APIを活用したコンテンツ制作・開発に取り組んでいます。</p>
        <h2>お問い合わせ</h2>
        <p>X（Twitter）: <a href="https://x.com/sio_rises" className="text-arch hover:underline" target="_blank" rel="noopener">@sio_rises</a></p>
      </div>
    </div>
  )
}
