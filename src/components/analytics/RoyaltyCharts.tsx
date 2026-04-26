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
import Image from "next/image"

type Transaction = {
  track: string
  platform: string
  kind: string
  amount: number
}

import { DSP_NAMES, DSP_COLORS, DSP_LOGOS } from "@/lib/platforms"

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

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload;
                return (
                  <div className="glass-panel" style={{ padding: "0.6rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {DSP_LOGOS[item.platform] && (
                        <Image
                          src={DSP_LOGOS[item.platform]}
                          alt={item.platform}
                          width={20}
                          height={20}
                        />
                      )}
                      <strong>{DSP_NAMES[item.platform] || item.platform}</strong>
                    </div>
                    <div className="mt-1">Revenue: €{item.amount.toFixed(2)}</div>
                  </div>
                );
              }}
            />

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