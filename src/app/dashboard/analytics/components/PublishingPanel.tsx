"use client"

import { useEffect, useState } from "react"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function PublishingPanel() {

  const [data, setData] = useState<any>(null)

  useEffect(() => {

    async function load() {

      const res = await fetch("/api/royalties/publishing-summary")
      const json = await res.json()

      setData(json)

    }

    load()

  }, [])

  if (!data) {
    return <div className="glass-panel">Cargando publishing...</div>
  }

  return (

    <div className="flex flex-col gap-lg">

      {/* SUMMARY */}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
        gap: "2rem"
      }}>

        <div className="glass-panel">
          <h3>Publishing revenue</h3>
          <p style={{ fontSize: "2rem", fontWeight: 700 }}>
            €{data.totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="glass-panel">
          <h3>Publishing streams</h3>
          <p style={{ fontSize: "2rem", fontWeight: 700 }}>
            {data.totalStreams}
          </p>
        </div>

      </div>

      {/* CHART */}

      <div className="glass-panel" style={{ padding: "1.8rem" }}>

        <h3 style={{ marginBottom: "1rem" }}>
          Revenue por obra
        </h3>

        <div style={{ width: "100%", height: 320 }}>

          <ResponsiveContainer>

            <BarChart data={data.byWork}>

              <XAxis
                dataKey="title"
                stroke="#9ca3af"
              />

              <YAxis
                stroke="#9ca3af"
              />

              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px"
                }}
              />

              <Bar
                dataKey="revenue"
                fill="#8b5cf6"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>

  )

}