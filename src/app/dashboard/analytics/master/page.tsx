"use client"

import { useEffect, useState } from "react"
import Image from "next/image"


import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

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
  NAPSTER: "#2D2D2D"

}

const DSP_LOGOS: Record<string, string> = {

  SPOTIFY: "/logos/spotify.png",
  APPLE_MUSIC: "/logos/applemusic.svg",
  AMAZON: "/logos/amazon.png",
  YOUTUBE: "/logos/youtube.png",
  YOUTUBE_MUSIC: "/logos/youtubemusic.png",
  DEEZER: "/logos/deezer.png",
  TIDAL: "/logos/tidal.png",
  SOUNDCLOUD: "/logos/soundcloud.png",
  PANDORA: "/logos/pandora.png",

  TENCENT: "/logos/tencent.png",
  NETEASE: "/logos/netease.png",
  QQ_MUSIC: "/logos/qqmusic.png",
  KUGOU: "/logos/kugou.png",
  KUWO: "/logos/kuwo.png",

  GAANA: "/logos/gaana.png",
  JIOSAAVN: "/logos/jiosaavn.png",

  BOOMPLAY: "/logos/boomplay.png",
  ANGHAMI: "/logos/anghami.png",
  AUDIOMACK: "/logos/audiomack.png",

  SNAPCHAT: "/logos/snapchat.png",
  TIKTOK: "/logos/tiktok.png",
  INSTAGRAM: "/logos/instagram.png",
  FACEBOOK: "/logos/facebook.png",

  RESSO: "/logos/resso.png",
  CAPCUT: "/logos/capcut.png",

  SHAZAM: "/logos/shazam.png",

  BEATPORT: "/logos/beatport.png",
  TRAXSOURCE: "/logos/traxsource.png",

  VEVO: "/logos/vevo.png",
  NAPSTER: "/logos/napster.png"

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
  NAPSTER: "Napster"

}

export default function MasterRoyaltiesPanel() {



  const [data, setData] = useState<any>(null)

  useEffect(() => {

    async function load() {

      const res = await fetch("/api/royalties/master-summary")

      if (!res.ok) {
        console.error("API error:", res.status)
        return
      }

      const json = await res.json()
      setData(json)

    }

    load()

  }, [])

  if (!data) {
    return <div className="glass-panel">Cargando estadísticas...</div>
  }

const platformData = (data?.byPlatform ?? []).map((p: any) => ({

    platform: p.platform,

    name: DSP_NAMES[p.platform] || p.platform,

    revenue: p._sum.amount,
    streams: p._sum.streams,

    color: DSP_COLORS[p.platform] || "#999"

  }))

const trackData = (data?.byTrack ?? []).map((t: any) => ({
    name: t.title,
    revenue: t.amount,
    streams: t.streams
  }))

  return (

    <div className="flex flex-col gap-lg">


      {/* SUMMARY */}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
        gap: "2rem"
      }}>

        <div className="glass-panel">
          <h3>Balance disponible</h3>
          <p style={{ fontSize: "2rem", fontWeight: 700 }}>
            €{(data.balance ?? 0).toFixed(2)}
          </p>
        </div>

        <div className="glass-panel">
          <h3>Streams totales</h3>
          <p style={{ fontSize: "2rem", fontWeight: 700 }}>
            {data.totalStreams}
          </p>
        </div>

        <div className="glass-panel">
          <h3>Revenue total</h3>
          <p style={{ fontSize: "2rem", fontWeight: 700 }}>
            €{(data.totalRevenue ?? 0).toFixed(2)}
          </p>
        </div>

      </div>

      {/* REVENUE POR PLATAFORMA */}

      <div className="glass-panel" style={{ padding: "1.8rem" }}>

        <h3 style={{ marginBottom: "1rem" }}>
          Revenue por plataforma
        </h3>

        <div style={{ width: "100%", height: 320 }}>

          <ResponsiveContainer>

            <BarChart data={platformData}>

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip
                content={({ active, payload }) => {

                  if (!active || !payload?.length) return null

                  const item = payload[0].payload

                  return (

                    <div className="glass-panel" style={{ padding: "0.6rem" }}>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

                        <Image
                          src={DSP_LOGOS[item.platform]}
                          alt={item.platform}
                          width={20}
                          height={20}
                        />

                        <strong>{DSP_NAMES[item.platform]}</strong>

                      </div>

                      <div>Revenue: €{item.revenue.toFixed(2)}</div>
                      <div>Streams: {item.streams}</div>

                    </div>

                  )

                }}
              />

              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>

                {platformData.map((entry: any, index: number) => (
                  <Cell
                    key={index}
                    fill={entry.color}
                  />
                ))}

              </Bar>

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* STREAMS POR TRACK */}

      <div className="glass-panel" style={{ padding: "1.8rem" }}>

        <h3 style={{ marginBottom: "1rem" }}>
          Streams por track
        </h3>

        <div style={{ width: "100%", height: 340 }}>

          <ResponsiveContainer>

            <PieChart>

              <Pie
                data={trackData}
                dataKey="streams"
                nameKey="name"
                outerRadius={120}
                label
              >

                {trackData.map((entry: any, index: number) => (

                  <Cell
                    key={index}
                    fill={["#a855f7", "#db2777", "#22c55e", "#3b82f6", "#f59e0b"][index % 5]}
                  />

                ))}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>

  )

}