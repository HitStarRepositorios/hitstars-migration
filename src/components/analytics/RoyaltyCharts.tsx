"use client"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts"

type Transaction = {
  track: string
  platform: string
  kind: string
  amount: number
}

const DSP_NAMES: Record<string, string> = {

  SPOTIFY: "Spotify",
  APPLE_MUSIC: "Apple Music",
  AMAZON: "Amazon Music",
  YOUTUBE: "YouTube",
  YOUTUBE_MUSIC: "YouTube Music",
  DEEZER: "Deezer",
  TIDAL: "TIDAL",
  SOUNDCLOUD: "SoundCloud",
  PANDORA: "Pandora",

  TENCENT: "Tencent Music",
  NETEASE: "NetEase Cloud Music",
  QQ_MUSIC: "QQ Music",
  KUGOU: "KuGou Music",
  KUWO: "KuWo Music",

  GAANA: "Gaana",
  JIOSAAVN: "JioSaavn",

  BOOMPLAY: "Boomplay",
  ANGHAMI: "Anghami",
  AUDIOMACK: "Audiomack",

  SNAPCHAT: "Snapchat",
  TIKTOK: "TikTok",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",

  RESSO: "Resso",
  CAPCUT: "CapCut",

  SHAZAM: "Shazam",

  BEATPORT: "Beatport",
  TRAXSOURCE: "Traxsource",

  VEVO: "VEVO",
  NAPSTER: "Napster",

  PRODUCER: "Agedi",
  PUBLISHING: "SGAE",

}

const DSP_COLORS: Record<string, string> = {

  SPOTIFY: "#1DB954",
  APPLE_MUSIC: "#FA243C",
  AMAZON: "#00A8E1",
  YOUTUBE: "#FF0000",
  YOUTUBE_MUSIC: "#FF0000",
  DEEZER: "#A238FF",
  TIDAL: "#000000",
  SOUNDCLOUD: "#FF7700",
  PANDORA: "#3668FF",

  TENCENT: "#0066FF",
  NETEASE: "#D43C33",
  QQ_MUSIC: "#31C27C",
  KUGOU: "#00A6FF",
  KUWO: "#FFD200",

  GAANA: "#E72C30",
  JIOSAAVN: "#1DB954",

  BOOMPLAY: "#00C853",
  ANGHAMI: "#7B00FF",
  AUDIOMACK: "#FFA200",

  SNAPCHAT: "#FFFC00",
  TIKTOK: "#000000",
  INSTAGRAM: "#E1306C",
  FACEBOOK: "#1877F2",

  RESSO: "#F50057",
  CAPCUT: "#000000",

  SHAZAM: "#0088FF",

  BEATPORT: "#00FF99",
  TRAXSOURCE: "#FF6600",

  VEVO: "#FF0000",
  NAPSTER: "#2D2D2D",

  PRODUCER: "#22c55e",
  PUBLISHING: "#9333ea",

}

export default function RoyaltyCharts({ transactions }: { transactions: Transaction[] }) {

  const masterTotal = transactions
    .filter(t => t.kind === "MASTER" || t.kind === "SOURCE")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0)

  const publishingTotal = transactions
    .filter(t => t.kind === "PUBLISHING" || t.kind === "PRODUCER")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0)

  const royaltyData = [
    { name: "Master", value: masterTotal },
    { name: "Publishing", value: publishingTotal }
  ]


  const sourceMap: any = {}

  transactions.forEach(t => {

    // Determinar origen del ingreso
    let source = t.platform

    if (!source || source === "null") {
      source = t.kind
    }

    if (!sourceMap[source]) sourceMap[source] = 0

    sourceMap[source] += Number(t.amount || 0)

  })

  const platformData = Object.keys(sourceMap).map(p => ({
    platform: p,
    name: DSP_NAMES[p] || p,
    amount: sourceMap[p]
  }))


  return (

    <div className="grid grid-cols-2 gap-6 items-stretch">

      {/* MASTER VS PUBLISHING */}

      <div className="text-muted text-sm mb-2">

        <div className="text-sm text-muted mb-4">
          Royalties desglose
        </div>

        <ResponsiveContainer width="100%" height={220}>

          <PieChart>

            <Pie
              data={royaltyData}
              dataKey="value"
              nameKey="name"
              outerRadius={80}
            >

              <Cell fill="#9333ea" />
              <Cell fill="#22c55e" />

            </Pie>

            <Tooltip />

          </PieChart>

        </ResponsiveContainer>

      </div>


      {/* PLATFORM ROYALTIES */}

      <div className="text-muted text-sm mb-2">

        <div className="text-sm text-muted mb-4">
          Royalties por origen
        </div>

        <ResponsiveContainer width="100%" height={220}>

          <BarChart data={platformData}>

            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />

            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
            />

            <YAxis stroke="#9ca3af" />

            <Tooltip />

            <Bar dataKey="amount">
              {platformData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={DSP_COLORS[entry.platform] || "#8b5cf6"}
                />
              ))}
            </Bar>

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>

  )

}