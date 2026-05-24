"use client"

import { useState } from "react"

const SITES = [
  { id: "arch-linux-guide", name: "Arch Linux", url: "arch-linux-guide.pages.dev" },
  { id: "ai-agent-guide", name: "AIエージェント", url: "ai-agent-guide-3ei.pages.dev" },
  { id: "nisa-investment", name: "NISA投資", url: "nisa-investment.pages.dev" },
  { id: "linux-security", name: "Linuxセキュリティ", url: "linux-security-98h.pages.dev" },
  { id: "vps-server-guide", name: "VPSサーバー", url: "vps-server-guide.pages.dev" },
  { id: "terminal-shell", name: "ターミナル", url: "terminal-shell.pages.dev" },
  { id: "python-beginner", name: "Python", url: "python-beginner.pages.dev" },
  { id: "oss-tools", name: "OSSツール", url: "oss-tools.pages.dev" },
  { id: "freelance-guide", name: "副業", url: "freelance-guide.pages.dev" },
  { id: "ai-tools", name: "AIツール", url: "ai-tools-aln.pages.dev" },
]

export default function Tracker() {
  const [data, setData] = useState(() => {
    if (typeof window === "undefined") return []
    const saved = localStorage.getItem("tracker-data")
    if (saved) return JSON.parse(saved)
    return SITES.map(s => ({ ...s, pv: 0, revenue: 0, date: "" }))
  })

  const update = (index: number, field: string, value: string) => {
    const next = [...data]
    next[index] = { ...next[index], [field]: field === "date" ? value : Number(value) || 0 }
    setData(next)
    localStorage.setItem("tracker-data", JSON.stringify(next))
  }

  const totalPV = data.reduce((s, r) => s + (r.pv || 0), 0)
  const totalRevenue = data.reduce((s, r) => s + (r.revenue || 0), 0)
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">収益トラッカー</h1>
      <p className="mt-2 text-gray-500">全10サイトのPV・収益を記録</p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-sm text-gray-500">合計PV</p>
          <p className="text-2xl font-bold text-gray-900">{totalPV.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-sm text-gray-500">推定収益</p>
          <p className="text-2xl font-bold text-green-600">¥{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2">サイト</th>
              <th className="py-2">PV</th>
              <th className="py-2">収益(円)</th>
              <th className="py-2">日付</th>
            </tr>
          </thead>
          <tbody>
            {data.map((site, i) => (
              <tr key={site.id} className="border-b border-gray-100">
                <td className="py-2">
                  <a href={`https://${site.url}`} target="_blank" className="text-blue-600 hover:underline" rel="noreferrer">
                    {site.name}
                  </a>
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    value={site.pv || ""}
                    onChange={(e) => update(i, "pv", e.target.value)}
                    placeholder="0"
                    className="w-20 rounded border border-gray-200 px-2 py-1 text-center"
                  />
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    value={site.revenue || ""}
                    onChange={(e) => update(i, "revenue", e.target.value)}
                    placeholder="0"
                    className="w-24 rounded border border-gray-200 px-2 py-1 text-center"
                  />
                </td>
                <td className="py-2">
                  <input
                    type="date"
                    value={site.date || today}
                    onChange={(e) => update(i, "date", e.target.value)}
                    className="rounded border border-gray-200 px-2 py-1 text-xs"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        <p>データはブラウザのlocalStorageに保存されます。</p>
        <p>PVはGoogle Search Console、収益はAdSense管理画面から手動入力。</p>
      </div>
    </div>
  )
}
