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

import { DSP_COLORS, DSP_LOGOS, DSP_NAMES } from "@/lib/platforms"

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